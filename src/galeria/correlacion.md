---
title: Correlación
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas para ver una <span class="clave">correlación</span></h1>
  <p class="capitulo-entradilla">Si dos medidas se mueven juntas entre lugares, entre personas o a lo largo de los años. Todas las cifras son datos de muestra.</p>
</header>

<!-- Familia de correlación: dispersión entre entidades, hexbin para miles de
     personas y dispersión conectada para una unidad en el tiempo. Cada forma
     es un archivo en src/components/formas/ y aquí una sección con la
     anatomía de siempre. Los datos salen de scripts/muestra_gC.mjs. -->

<link rel="stylesheet" href="../formas-gC.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {panel, campo, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {P, rampaTema} from "../components/paleta.js";
import {pct, entero, numero, pesos, margen, pctEje, pctMarca} from "../components/formato.js";
import {leyendaItems} from "../components/formas/comun.js";
import {dispersion} from "../components/formas/dispersion.js";
import {hexbin} from "../components/formas/hexbin.js";
import {conectada} from "../components/formas/conectada.js";
import {REGIONES} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerEntidades, leerOcupados, leerTrayectorias} from "../components/muestra-gC.js";

// Esta página mide niveles y relaciones entre dos medidas. No usa rojo ni
// azul: la serie va en el tono de tema, lo que queda fuera de la selección en
// gris de fondo y los resúmenes (medianas) en el gris de resumen.
const COLOR_CAPITULO = null;

// Alto que se reserva a cada sección antes de dibujarse, medido con los
// filtros por omisión en 390, 1366 y 1920 px (docs/scroll-bug.md).
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
const OPCIONES_SEXO = [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"];
const SEXO_TEXTO = {Total: "Mujeres y hombres", Mujeres: "Mujeres", Hombres: "Hombres"};
const anios = (v) => `${numero(v, 1)} años`;
```

<h2 id="dispersion" class="toc-anchor">Internet en el hogar frente a otra medida, por entidad</h2>

```js
{
  const entidades = leerEntidades(await FileAttachment("../data/muestra/gC_entidades.csv").csv());
  // Dominios FIJOS de los ejes, medidos sobre las tres ediciones: internet de
  // 21.7 a 93.8 %, escolaridad de 6.8 a 11.3 años e ingreso de 3,231 a 8,709
  // pesos. No cambian al elegir año ni región.
  const DOMINIO_INTERNET = [20, 100];
  const MEDIDAS = {
    escolaridad: {texto: "Escolaridad promedio", dominio: [6, 12], valor: (d) => d.escolaridad, ee: (d) => d.escolaridadEe, formato: anios, eje: (v) => numero(v, 0), rotulo: "Años de escuela, en promedio", margen: (e) => `${margen(e)} años`},
    ingreso: {texto: "Ingreso al mes por persona", dominio: [3000, 9000], valor: (d) => d.ingreso, ee: (d) => d.ingresoEe, formato: pesos, eje: (v) => `$${numero(v / 1000, 0)} mil`, rotulo: "Ingreso al mes por persona, en pesos de 2024", margen: (e) => `${margen(e, 0)} pesos`},
  };
  const filtros = panel({grupos: [
    {leyenda: "Qué se compara", campos: [campo({id: "medida", rotulo: "Eje vertical", inicial: "escolaridad", opciones: Object.entries(MEDIDAS).map(([valor, m]) => ({valor, texto: m.texto}))})]},
    {leyenda: "Dónde y cuándo", campos: [
      campo({id: "region", rotulo: "Región destacada", inicial: "Sur-Sureste", opciones: [{valor: "todas", texto: "Ninguna"}, ...REGIONES]}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(entidades, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "dispersion", numero: 1, titulo: "Internet en el hogar frente a otra medida, por entidad", panel: filtros, metodo: "m-correlacion", verifica: VERIFICA_MUESTRA, alto: reservar([690, 610, 630]),
    explica: ["Cada punto es una entidad. Su lugar a lo ancho es la parte de sus hogares que tiene internet y su altura, la otra medida elegida. Si los puntos suben de izquierda a derecha, las entidades con más internet suelen tener también más escolaridad o más ingreso, lo que no dice que una cosa cause la otra.",
      "Las rayas punteadas son las medianas, la entidad de en medio en cada medida: una entidad arriba y a la derecha de las dos rayas está por encima de la mitad de las entidades en ambas. Si una entidad está en 85 % y 10.5 años, 85 de cada 100 de sus hogares tienen internet y su población de 15 años y más estudió 10.5 años en promedio."],
    dibujar: ({v, ancho}) => {
      const m = MEDIDAS[v.medida];
      const filas = entidades.filter((r) => r.anio === v.anio);
      const destacado = v.region === "todas" ? null : (d) => d.region === v.region;
      const medianas = {x: d3.median(filas, (d) => d.internet), y: d3.median(filas, m.valor)};
      const g = globo({
        marca: (d) => d.entidad, grupo: (d) => `Región ${d.region}`, color: (d) => (!destacado || destacado(d) ? P.tonoTexto : P.tinta2),
        valor: (d) => d.internet, formato: "pct",
        personas: (d) => d.hogaresInternet, universo: (d) => d.hogares, unidad: "hogares",
        precision: (d) => ({valor: d.internet, ee: d.internetEe, casos: d.casos}),
      });
      return {
        figura: {
          titulo: `Hogares con internet y ${m.texto.toLowerCase()}, por entidad`,
          subtitulo: `32 entidades · ${v.anio} · en el eje vertical, ${m.texto.toLowerCase()} · ${v.region === "todas" ? "sin región destacada" : `se destaca la región ${v.region}`}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es una entidad, colocada por la parte de sus hogares con internet y por la otra medida. Las rayas punteadas son las medianas.",
          cuerpo: [leyendaItems([
            {tipo: "punto", color: P.serie, texto: destacado ? `Entidades de la región ${v.region}` : "Entidades"},
            ...(destacado ? [{tipo: "punto", color: P.contexto, texto: "Entidades de otras regiones"}] : []),
            {tipo: "punteada", color: P.resumen, texto: `Medianas: ${pct(medianas.x)} y ${m.formato(medianas.y)}`},
          ]),
          dispersion(filas, {ancho, x: (d) => d.internet, y: m.valor, nombre: (d) => d.entidad, dominioX: DOMINIO_INTERNET, dominioY: m.dominio, destacado, medianas,
            formatoX: (x) => pctMarca(x), formatoY: m.eje, rotuloX: "Porcentaje de hogares con internet", rotuloY: m.rotulo, globo: g})],
        },
        tabla: {filas: d3.sort(filas, (r) => -r.internet), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Región", valor: (d) => d.region, texto: true},
          {titulo: "Hogares con internet", valor: (d) => d.internet, formato: "pct"},
          {titulo: "Margen de error", valor: (d) => d.internetEe, formato: (e) => margen(e)},
          {titulo: "Hogares que tienen internet", valor: (d) => d.hogaresInternet, formato: "conteo"},
          {titulo: "Hogares", valor: (d) => d.hogares, formato: "conteo"},
          {titulo: m.texto, valor: m.valor, formato: (x) => m.formato(x)},
          {titulo: `Margen de error, ${m.texto.toLowerCase()}`, valor: m.ee, formato: (e) => (e == null ? "" : m.margen(e))},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

```js
// Microdatos de personas ocupadas: los usa el hexbin.
const ocupados = leerOcupados(await FileAttachment("../data/muestra/gC_ocupados.csv").csv());
```

<h2 id="hexbin" class="toc-anchor">Edad y horas trabajadas de las personas ocupadas</h2>

```js
{
  // Rampa con dominio FIJO de 0 a 4 %: el hexágono más lleno de la muestra
  // junta 4.6 % y el 90 % de los hexágonos queda bajo 2.5 %. Lo que pasa de 4
  // toma el tono más oscuro y la leyenda lo dice («4 o más»).
  const TOPE_HEX = 4;
  const escala = rampaTema([0, TOPE_HEX]);
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: OPCIONES_SEXO}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(ocupados, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "hexbin", numero: 2, titulo: "Edad y horas trabajadas de las personas ocupadas", panel: filtros, metodo: "m-correlacion", verifica: VERIFICA_MUESTRA, alto: reservar([575, 720, 830]),
    explica: "Cada hexágono junta a las personas ocupadas que tienen una edad y unas horas de trabajo parecidas: abarca unos 4 años de edad y unas 10 horas a la semana. Cuanto más oscuro, más personas caen ahí. Si un hexágono cerca de 35 años y 48 horas tiene 3 %, 3 de cada 100 personas ocupadas tienen esa edad y trabajan esas horas. Los hexágonos con trama tienen menos de 30 casos en la muestra y su cifra es poco precisa.",
    dibujar: ({v, ancho}) => {
      const filas = ocupados.filter((r) => r.anio === v.anio && (v.sexo === "Total" || r.sexo === v.sexo));
      const g = globo({
        grupo: (c) => `Cerca de ${numero(c.x, 0)} años y ${numero(c.y, 0)} horas a la semana`,
        valor: (c) => c.parte, formato: "pct",
        personas: (c) => c.personas, universo: (c) => c.total, unidad: v.sexo === "Hombres" ? "hombres ocupados" : v.sexo === "Mujeres" ? "mujeres ocupadas" : "personas ocupadas",
        precision: (c) => ({valor: c.parte, casos: c.casos}),
      });
      const dibujo = hexbin(filas, {ancho, x: (d) => d.edad, y: (d) => d.horas, peso: (d) => d.factor, dominioX: [15, 80], dominioY: [0, 84], radio: 0.036, escala,
        formatoX: (x) => numero(x, 0), formatoY: (y) => numero(y, 0), rotuloX: "Edad, en años", rotuloY: "Horas a la semana",
        tituloLeyenda: "Parte de las personas ocupadas (%)", formatoLeyenda: (t) => (t >= TOPE_HEX ? `${TOPE_HEX} o más` : pctEje(t)), marcasLeyenda: [0, 1, 2, 3, 4], globo: g});
      return {
        figura: {
          titulo: "Personas ocupadas según su edad y las horas que trabajan",
          subtitulo: `${SEXO_TEXTO[v.sexo]} · ${v.anio} · ${entero(filas.length)} casos en la muestra`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada hexágono junta a las personas de edad y horas parecidas, y su tono dice qué parte de las personas ocupadas cae ahí.",
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(dibujo.celdas ?? [], (c) => -c.parte), columnas: [
          {titulo: "Edad, cerca de", valor: (c) => anios(c.x), texto: true},
          {titulo: "Horas a la semana, cerca de", valor: (c) => `${numero(c.y, 0)} horas`, texto: true},
          {titulo: "Parte de las personas", valor: (c) => c.parte, formato: "pct"},
          {titulo: "Personas ocupadas", valor: (c) => c.personas, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (c) => c.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="conectada" class="toc-anchor">Escolaridad e ingreso de las personas ocupadas, 2008 - 2024</h2>

```js
{
  const trayectorias = leerTrayectorias(await FileAttachment("../data/muestra/gC_trayectorias.csv").csv());
  const LUGARES = ["Todo el país", ...REGIONES];
  // Dominios FIJOS: escolaridad de 7.5 a 12 años e ingreso de 5,000 a 15,000
  // pesos (la muestra va de 7.7 a 11.5 años y de 5,845 a 14,095 pesos).
  const DOMINIO_X = [7.5, 12], DOMINIO_Y = [5000, 15000];
  const nombreLugar = (l) => (l === "Todo el país" ? l : `Región ${l}`);
  const filtros = panel({grupos: [
    {leyenda: "Dónde y entre quiénes", campos: [
      campo({id: "lugar", rotulo: "Lugar", inicial: "Todo el país", opciones: LUGARES.map((l) => ({valor: l, texto: nombreLugar(l)}))}),
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: OPCIONES_SEXO}),
    ]},
  ]});
  display(analisis({
    id: "conectada", numero: 3, titulo: "Escolaridad e ingreso de las personas ocupadas, 2008 - 2024", panel: filtros, metodo: "m-correlacion", verifica: VERIFICA_MUESTRA, alto: reservar([645, 675, 630]),
    explica: ["Cada punto es una edición de la encuesta. Su lugar a lo ancho es la escolaridad promedio de las personas ocupadas y su altura, el ingreso promedio al mes en pesos de 2024. La línea une los años en orden y la flecha marca el último. Un tramo que va a la derecha y hacia abajo quiere decir que la escolaridad subió y el ingreso bajó.",
      "Si de 2018 a 2020 la línea baja de 10,000 a 9,000 pesos, el ingreso promedio cayó 1,000 pesos en esos dos años. Al fondo van las trayectorias de los otros lugares, para comparar."],
    dibujar: ({v, ancho}) => {
      const filas = trayectorias.filter((r) => r.lugar === v.lugar && r.sexo === v.sexo);
      const fondo = trayectorias.filter((r) => r.lugar !== v.lugar && r.sexo === v.sexo);
      const g = globo({
        grupo: (d) => d.anio, color: P.tonoTexto,
        valor: (d) => d.ingreso, formato: "pesos",
        precision: (d) => ({valor: d.ingreso, ee: d.ingresoEe, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Escolaridad promedio e ingreso al mes de las personas ocupadas, edición por edición",
          subtitulo: `${nombreLugar(v.lugar)} · ${SEXO_TEXTO[v.sexo]} · 2008 - 2024 · pesos de 2024 · al fondo, los otros cuatro lugares`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es una edición, colocada por la escolaridad promedio y el ingreso al mes. La línea sigue el orden de los años.",
          cuerpo: [leyendaItems([{tipo: "linea", color: P.serie, texto: nombreLugar(v.lugar)}, {tipo: "linea", color: P.contexto, texto: "Los otros lugares"}]),
            conectada(filas, {ancho, x: (d) => d.escolaridad, y: (d) => d.ingreso, anio: (d) => d.anio, fondo, unidad: (d) => d.lugar, dominioX: DOMINIO_X, dominioY: DOMINIO_Y,
              formatoX: (x) => numero(x, Number.isInteger(x) ? 0 : 1), formatoY: (y) => `$${numero(y / 1000, 0)} mil`, rotuloX: "Escolaridad promedio, en años", rotuloY: "Ingreso al mes, en pesos de 2024", globo: g})],
        },
        tabla: {filas, columnas: [
          {titulo: "Año", valor: (d) => d.anio, texto: true},
          {titulo: "Escolaridad promedio", valor: (d) => d.escolaridad, formato: (x) => anios(x)},
          {titulo: "Ingreso al mes", valor: (d) => d.ingreso, formato: "pesos"},
          {titulo: "Margen de error del ingreso", valor: (d) => d.ingresoEe, formato: (e) => (e == null ? "" : `${margen(e, 0)} pesos`)},
          {titulo: "Personas ocupadas", valor: (d) => d.ocupados, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
