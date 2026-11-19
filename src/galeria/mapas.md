---
title: Mapas
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas sobre el <span class="clave">territorio</span></h1>
  <p class="capitulo-entradilla">Dónde es más alto, dónde cambia, dónde se concentra y cómo se reparte. En todos los mapas la región encuadra y lo temático resalta. Todas las cifras son datos de muestra.</p>
</header>

<link rel="stylesheet" href="../formas-flujo.css">
<link rel="stylesheet" href="../formas-territorio.css">
<link rel="stylesheet" href="../formas-gE.css">
<link rel="stylesheet" href="../formas-gC.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {panel, campo, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {significado, sentido, rampaTema, rampaCambio, P} from "../components/paleta.js";
import {pct, margen, entero, numero} from "../components/formato.js";
import {coropleta, mosaico, picos, flechasCambio, semitonos, siluetaPuntos} from "../components/formas/index.js";
import {REGIONES, ENTIDADES, ISO_A_CVE, POR_CVE, nombreEntidad} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {leerIndicador, UNIVERSO, VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerMunicipios, MIN_CASOS} from "../components/muestra-flujos.js";
import {leerCambioMunicipios, leerCeldas, GRUPOS_EDAD, leerSituacion, SITUACIONES} from "../components/muestra-territorio.js";

const indicador = leerIndicador(await FileAttachment("../data/muestra/indicador.csv").csv());
const geo = await FileAttachment("../data/muestra/entidades.geojson").json();

const SIG = significado({rojo: "baja el porcentaje", azul: "sube el porcentaje", gris: "sin cambio claro", desfavorable: "baja"});
// Dominios FIJOS de las rampas, medidos sobre toda la muestra: el nivel más
// alto de una entidad es 71.1 % y el cambio más grande entre dos años
// cualesquiera, de 30.3 puntos.
const DOMINIO_NIVEL = [0, 80];
const LIMITE_CAMBIO = 35;
const opcionesRegion = [{valor: "todas", texto: "Todo el país"}, ...REGIONES];
const clavesDe = (region) => (region === "todas" ? null : ENTIDADES.filter((e) => e.region === region).map((e) => e.cve));
const opcionesSexo = [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"];
const columnasNivel = [
  {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
  {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
  {titulo: "Margen de error (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
  {titulo: "Población que cumple", valor: (d) => d.num, formato: "conteo"},
  {titulo: "Población total", valor: (d) => d.den, formato: "conteo"},
];
// Globo de nivel, común al mapa y al mosaico. Una entidad sin dato trae solo su clave.
// El total es la población de la entidad: sus habitantes, o sus mujeres u hombres.
const habitantesDe = (d) => (d.sexo === "Mujeres" ? "mujeres" : d.sexo === "Hombres" ? "hombres" : "habitantes");
const globoNivel = (v) => globo({
  grupo: (d) => d.entidad ?? nombreEntidad(d.cve), color: () => P.tonoTexto,
  valor: (d) => d.pct, formato: "pct",
  personas: (d) => d.num, universo: (d) => d.den, unidad: habitantesDe,
  precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
});
```

```js
// Formas nuevas de esta página, importadas de su archivo: burbujas, mapa de
// categorías (mapa plano de la Plantilla), Dorling, densidad de puntos y
// mosaico de burbujas.
import {burbujas} from "../components/formas/burbujas.js";
import {mapaPlano} from "../components/formas/mapa-plano.js";
import {dorling} from "../components/formas/dorling.js";
import {densidad} from "../components/formas/densidad.js";
import {mosaicoBurbujas} from "../components/formas/mosaico-burbujas.js";
import {leyendaItems, conLeyenda} from "../components/formas/comun.js";
// Alto que se reserva antes de dibujar cada sección, medido en la página
// construida: [teléfono, escritorio, pantalla grande].
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
// Escalas FIJAS de tamaño, medidas sobre toda la muestra: la entidad con más
// personas que cumplen la condición tiene 3,292,841 (3,500,000 es el círculo
// mayor) y la más poblada, 5,318,400 (5,500,000).
const TOPE_CONTEO = 3500000;
const TOPE_POBLACION = 5500000;
const aniosIndicador = conDato(indicador, "anio").sort((a, b) => b - a);
const opcionesDestacar = [{valor: "ninguna", texto: "Ninguna"}, ...REGIONES];
const textoSexo = (s) => (s === "Total" ? "Mujeres y hombres" : s);
```

<h2 id="nivel" class="toc-anchor">Dónde es más alto el indicador</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(indicador, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "nivel", numero: 1, titulo: "Dónde es más alto el indicador", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA,
    explica: "Cada entidad se pinta según qué parte de su población cumple la condición: más oscuro, porcentaje más alto. La escala va de 0 a 80 % y no cambia con los filtros, así que el mismo tono quiere decir lo mismo en cualquier año. Las entidades en gris no tienen dato en el año elegido. Al elegir una región, el mapa se acerca a ella.",
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter((r) => r.anio === v.anio && r.sexo === v.sexo);
      const valores = new Map(filas.map((r) => [r.cve, r]));
      const dentro = clavesDe(v.region);
      const visibles = filas.filter((r) => !dentro || dentro.includes(r.cve));
      return {
        figura: {
          titulo: "Población que cumple la condición, por entidad",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ${UNIVERSO} · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada entidad se pinta con el porcentaje de su población de 5 años y más que cumple la condición.",
          cuerpo: coropleta(geo, valores, {ancho, valor: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL), encuadre: dentro,
            tituloLeyenda: "Porcentaje", marcasLeyenda: [0, 20, 40, 60, 80], formatoLeyenda: (x) => (x === 80 ? "80 o más" : String(x)), globo: globoNivel(v)}),
        },
        tabla: {filas: [...visibles].sort((a, b) => b.pct - a.pct), columnas: columnasNivel},
      };
    },
  }));
}
```

---

<h2 id="cambio-mapa" class="toc-anchor">Dónde cambia el indicador</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre qué años", campos: [
      campo({id: "desde", rotulo: "Desde", inicial: 2000, opciones: conDato(indicador, "anio").sort((a, b) => a - b).slice(0, -1)}),
      campo({id: "hasta", rotulo: "Hasta", inicial: 2020, opciones: (v) => conDato(indicador, "anio").filter((a) => a > v.desde).sort((a, b) => a - b)}),
    ]},
  ]});
  display(analisis({
    id: "cambio-mapa", numero: 2, titulo: "Dónde cambia el indicador", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA,
    explica: "Cada entidad se pinta según cuántos puntos cambió su porcentaje entre los dos años. Si pasó de 30 % a 25 %, el cambio es de −5.0 puntos y va en rojo; si subió, en azul. El gris claro del centro es un cambio cercano a cero. La escala va de −35 a +35 puntos con cualquier filtro. Las entidades sin dato en alguno de los dos años van en gris.",
    dibujar: ({v, ancho}) => {
      const total = indicador.filter((r) => r.sexo === "Total");
      const filas = ENTIDADES.map((e) => {
        const a = total.find((r) => r.cve === e.cve && r.anio === v.desde), b = total.find((r) => r.cve === e.cve && r.anio === v.hasta);
        return a && b ? {cve: e.cve, entidad: e.nombre, a, b, cambio: b.pct - a.pct, s: sentido(a.pct, b.pct, {eeA: a.ee, eeB: b.ee})} : null;
      }).filter(Boolean);
      const dentro = clavesDe(v.region);
      const g = globo({
        marca: (d) => d.entidad ?? nombreEntidad(d.cve), grupo: (d) => (d.s ? SIG.etiqueta(d.s) : null), color: (d) => (d.s ? SIG.color(d.s) : null),
        valor: (d) => d.cambio, formato: "puntos",
      });
      return {
        figura: {
          titulo: "Cambio del porcentaje que cumple la condición, por entidad",
          subtitulo: `Población ${UNIVERSO} · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${v.desde} a ${v.hasta}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada entidad se pinta con el cambio en puntos de su porcentaje entre los dos años: rojo si baja, azul si sube.",
          cuerpo: coropleta(geo, new Map(filas.map((d) => [d.cve, d])), {ancho, valor: (d) => d.cambio, escala: rampaCambio(LIMITE_CAMBIO, {desfavorable: SIG.desfavorable}), encuadre: dentro,
            tituloLeyenda: "Cambio, en puntos", marcasLeyenda: [-30, -15, 0, 15, 30], formatoLeyenda: (x) => (x > 0 ? `+${x}` : x < 0 ? `−${Math.abs(x)}` : "0"), rotuloSinDato: "Sin dato en alguno de los dos años", globo: g}),
        },
        tabla: {filas: filas.filter((d) => !dentro || dentro.includes(d.cve)).sort((p, q) => p.cambio - q.cambio), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: String(v.desde), valor: (d) => d.a.pct, formato: "pct"},
          {titulo: String(v.hasta), valor: (d) => d.b.pct, formato: "pct"},
          {titulo: "Cambio", valor: (d) => d.cambio, formato: "puntos"},
          {titulo: "Margen del cambio (95 %)", valor: (d) => Math.hypot(d.a.ee, d.b.ee), formato: (x) => margen(x)},
          {titulo: "Lectura", valor: (d) => SIG.etiqueta(d.s), texto: true},
        ]},
      };
    },
  }));
}
```

---

<h2 id="burbujas" class="toc-anchor">Cuántas personas cumplen la condición en cada entidad</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: aniosIndicador}),
    ]},
  ]});
  display(analisis({
    id: "burbujas", numero: 3, titulo: "Cuántas personas cumplen la condición en cada entidad", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA, alto: reservar([574, 774, 870]),
    explica: ["Cada círculo está en el centro de una entidad y su área es el número de personas que cumplen la condición. Un círculo con el doble de área tiene el doble de personas, y la escala no cambia con el año, el sexo ni al acercar el mapa: el círculo mayor quiere decir 3,500,000 personas o más.",
      "Aquí se cuentan personas, no porcentajes: una entidad muy poblada tiene un círculo grande aunque su porcentaje sea bajo. El porcentaje está en el globo y en la tabla. Una entidad en gris no tiene dato en el año elegido."],
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter((r) => r.anio === v.anio && r.sexo === v.sexo);
      const dentro = clavesDe(v.region);
      const g = globo({
        grupo: (d) => d.entidad, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        personas: (d) => d.num, universo: (d) => d.den, unidad: habitantesDe,
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Personas que cumplen la condición, por entidad",
          subtitulo: `${textoSexo(v.sexo)} ${UNIVERSO} · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada círculo está en el centro de una entidad y su área es el número de personas que cumplen la condición.",
          cuerpo: burbujas(geo, new Map(filas.map((r) => [r.cve, r])), {ancho, valor: (d) => d.num, tope: TOPE_CONTEO, encuadre: dentro, globo: g}),
        },
        tabla: {filas: d3.sort(filas.filter((r) => !dentro || dentro.includes(r.cve)), (r) => -r.num), columnas: columnasNivel},
      };
    },
  }));
}
```

---

<h2 id="mosaico" class="toc-anchor">Las entidades con el mismo peso</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(indicador, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "mosaico", numero: 4, titulo: "Las entidades con el mismo peso", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA,
    explica: "Cada cuadro es una entidad, acomodada más o menos donde está en el país, y todas miden lo mismo: una entidad chica se ve igual que una grande. El color es el porcentaje de su población que cumple la condición, con la misma escala del mapa. Un cuadro gris no tiene dato en el año elegido.",
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter((r) => r.anio === v.anio && r.sexo === v.sexo);
      return {
        figura: {
          titulo: "Población que cumple la condición, un cuadro por entidad",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ${UNIVERSO} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada cuadro es una entidad y su color, el porcentaje de la población de 5 años y más que cumple la condición.",
          cuerpo: mosaico(new Map(filas.map((r) => [r.cve, r])), {ancho, valor: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL), cifra: (x) => pct(x, 0),
            tituloLeyenda: "Porcentaje", marcasLeyenda: [0, 20, 40, 60, 80], formatoLeyenda: (x) => (x === 80 ? "80 o más" : String(x)), globo: globoNivel(v)}),
        },
        tabla: {filas: [...filas].sort((a, b) => b.pct - a.pct), columnas: columnasNivel},
      };
    },
  }));
}
```

---

<h2 id="picos" class="toc-anchor">Cuántas personas cumplen la condición en cada municipio</h2>

```js
{
  const municipios = leerMunicipios(await FileAttachment("../data/muestra/municipios.csv").csv());
  // Altura FIJA de los picos: el municipio con más personas de la muestra
  // tiene 217,415 en cualquiera de los dos años, así que 220,000 corresponde
  // a la altura máxima con cualquier filtro y con cualquier encuadre.
  const TOPE_PICOS = 220000;
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2025, opciones: conDato(municipios, "anio").sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "picos", numero: 5, titulo: "Cuántas personas cumplen la condición en cada municipio", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA,
    explica: ["Cada pico está en un municipio y su altura es el número de personas que cumplen la condición. El color repite la altura: más oscuro, más personas. Un pico de 100,000 personas mide el doble que uno de 50,000, y la escala no cambia con el año ni al acercar el mapa a una región.",
      "Los picos más altos llevan su nombre y su cifra. Aquí se cuentan personas, no porcentajes: un municipio muy poblado puede tener un pico alto aunque el porcentaje de su población sea bajo. El porcentaje está en el globo y en la tabla."],
    dibujar: ({v, ancho}) => {
      const dentro = clavesDe(v.region);
      const filas = municipios.filter((r) => r.anio === v.anio && (!dentro || dentro.includes(r.cve)));
      const g = globo({
        grupo: (d) => d.nombre, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        personas: (d) => d.num, universo: (d) => d.den, unidad: "habitantes",
        precision: (d) => ({casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Personas que cumplen la condición, por municipio",
          subtitulo: `Población ${UNIVERSO} · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada pico es un municipio y su altura y su color, el número de personas de 5 años y más que cumplen la condición.",
          cuerpo: picos(geo, filas, {ancho, posicion: (d) => [d.lon, d.lat], valor: (d) => d.num, nombre: (d) => (ancho < 520 ? d.nombreCorto : d.nombre), tope: TOPE_PICOS,
            encuadre: dentro ? (f) => dentro.includes(ISO_A_CVE.get(f.properties.id)) : null, visible: dentro ? () => true : null, globo: g}),
        },
        tabla: {filas: [...filas].sort((a, b) => b.num - a.num), columnas: [
          {titulo: "Municipio", valor: (d) => d.nombre, texto: true},
          {titulo: "Personas que cumplen", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población total", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="mapa-categorias" class="toc-anchor">En qué entidades el cambio supera el margen de error</h2>

```js
{
  const PARES = [{valor: "2015-2020", texto: "De 2015 a 2020"}, {valor: "2010-2020", texto: "De 2010 a 2020"}, {valor: "2000-2020", texto: "De 2000 a 2020"}, {valor: "2000-2010", texto: "De 2000 a 2010"}];
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes y entre qué años", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "par", rotulo: "Entre los años", inicial: "2010-2020", opciones: PARES}),
    ]},
  ]});
  display(analisis({
    id: "mapa-categorias", numero: 6, titulo: "En qué entidades el cambio supera el margen de error", panel: filtros, metodo: "m-precision", verifica: VERIFICA_MUESTRA, alto: reservar([593, 707, 776]),
    explica: ["Cada entidad cae en una de tres clases según cómo cambió su porcentaje entre los dos años: en rojo si bajó, en azul si subió y en gris si el cambio no supera el margen de error de la encuesta. Si una entidad pasó de 30 % a 27 % y su margen combinado es de ±4 puntos, el cambio de −3.0 puntos no se distingue del azar y la entidad va en gris.",
      "El mapa no dice cuánto cambió cada entidad, solo si el cambio se distingue del error: la magnitud está en el mapa de cambio de esta página, en el globo y en la tabla. Una entidad sin dato en alguno de los dos años va en el gris claro de “Sin dato”."],
    dibujar: ({v, ancho}) => {
      const [a, b] = v.par.split("-").map(Number);
      const de = indicador.filter((r) => r.sexo === v.sexo);
      const filas = ENTIDADES.map((e) => {
        const ra = de.find((r) => r.cve === e.cve && r.anio === a), rb = de.find((r) => r.cve === e.cve && r.anio === b);
        return ra && rb ? {cve: e.cve, entidad: e.nombre, a: ra, b: rb, cambio: rb.pct - ra.pct, s: sentido(ra.pct, rb.pct, {eeA: ra.ee, eeB: rb.ee})} : null;
      }).filter(Boolean);
      const porCve = new Map(filas.map((d) => [d.cve, d]));
      const dentro = clavesDe(v.region);
      const g = globo({
        marca: (d) => d.entidad ?? (d.f ? nombreEntidad(ISO_A_CVE.get(d.f.properties.id)) : ""),
        grupo: (d) => (d.s ? SIG.etiqueta(d.s) : null), color: (d) => (d.s ? SIG.color(d.s) : null),
        valor: (d) => d.cambio ?? null, formato: "puntos",
      });
      const mapa = mapaPlano(geo, {
        ancho, dato: (f) => porCve.get(ISO_A_CVE.get(f.properties.id)) ?? null, color: (d) => (d ? SIG.color(d.s) : P.sinDato),
        encuadre: dentro ? (f) => dentro.includes(ISO_A_CVE.get(f.properties.id)) : null, globo: g,
      });
      const haySin = ENTIDADES.some((e) => (!dentro || dentro.includes(e.cve)) && !porCve.has(e.cve));
      const leyenda = leyendaItems([...SIG.leyenda("cuadro").map((i) => ({...i, texto: i.texto[0].toUpperCase() + i.texto.slice(1)})), ...(haySin ? [{tipo: "cuadro", color: P.sinDato, texto: "Sin dato en alguno de los dos años"}] : [])]);
      const visibles = filas.filter((d) => !dentro || dentro.includes(d.cve));
      const cuenta = (s) => visibles.filter((d) => d.s === s).length;
      return {
        figura: {
          titulo: "Sentido del cambio del porcentaje que cumple la condición, por entidad",
          subtitulo: `${textoSexo(v.sexo)} ${UNIVERSO} · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${a} a ${b} · baja en ${cuenta("baja")}, sube en ${cuenta("sube")}, sin cambio claro en ${cuenta("igual")}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada entidad se pinta según si su porcentaje bajó, subió o cambió menos que su margen de error entre los dos años.",
          cuerpo: conLeyenda(leyenda, mapa),
        },
        tabla: {filas: d3.sort(visibles, (d) => d.cambio), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: String(a), valor: (d) => d.a.pct, formato: "pct"},
          {titulo: String(b), valor: (d) => d.b.pct, formato: "pct"},
          {titulo: "Cambio", valor: (d) => d.cambio, formato: "puntos"},
          {titulo: "Margen del cambio (95 %)", valor: (d) => Math.hypot(d.a.ee, d.b.ee), formato: (x) => margen(x)},
          {titulo: "Clase", valor: (d) => SIG.etiqueta(d.s), texto: true},
          {titulo: `Casos en la muestra en ${b}`, valor: (d) => d.b.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="dorling" class="toc-anchor">Cuánta población tiene cada entidad y qué parte cumple la condición</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: aniosIndicador}),
    ]},
    {leyenda: "Qué se destaca", campos: [campo({id: "destacar", rotulo: "Región destacada", inicial: "ninguna", opciones: opcionesDestacar})]},
  ]});
  display(analisis({
    id: "dorling", numero: 7, titulo: "Cuánta población tiene cada entidad y qué parte cumple la condición", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA, alto: reservar([639, 798, 902]),
    explica: ["Cada círculo es una entidad, acomodado cerca de su lugar en el mapa. Su área es su población: una entidad con el doble de habitantes tiene un círculo con el doble de área, y la escala no cambia con los filtros. El color es el porcentaje de su población que cumple la condición, con la misma escala de 0 a 80 % del mapa de esta página.",
      "Los círculos se separan para no encimarse, así que su posición es aproximada. Así se ve el país pesado por personas: una entidad grande y poco poblada ocupa poco. Al destacar una región, las demás entidades se atenúan."],
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter((r) => r.anio === v.anio && r.sexo === v.sexo);
      const region = v.destacar === "ninguna" ? null : v.destacar;
      return {
        figura: {
          titulo: "Población de cada entidad y porcentaje que cumple la condición",
          subtitulo: `${textoSexo(v.sexo)} ${UNIVERSO} · ${v.anio}${region ? ` · se destaca la región ${region}` : ""}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada círculo es una entidad: su área es su población y su color, el porcentaje que cumple la condición.",
          cuerpo: dorling(geo, new Map(filas.map((r) => [r.cve, r])), {
            ancho, peso: (d) => d.den, valor: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL), topePeso: TOPE_POBLACION,
            destacar: region ? (k) => POR_CVE.get(k)?.region === region : null,
            tituloLeyenda: "Porcentaje", marcasLeyenda: [0, 20, 40, 60, 80], formatoLeyenda: (x) => (x === 80 ? "80 o más" : String(x)), globo: globoNivel(v),
          }),
        },
        tabla: {filas: d3.sort(filas, (r) => -r.den), columnas: columnasNivel},
      };
    },
  }));
}
```

---

<h2 id="flechas-cambio" class="toc-anchor">En qué municipios sube y en cuáles baja</h2>

```js
{
  const filas = leerCambioMunicipios(await FileAttachment("../data/muestra/cambio_municipios.csv").csv());
  const municipios = [...d3.group(filas, (r) => r.cveMun).values()];
  const PARES = [{valor: "2015-2020", texto: "De 2015 a 2020"}, {valor: "2020-2025", texto: "De 2020 a 2025"}, {valor: "2015-2025", texto: "De 2015 a 2025"}];
  // Largo e inclinación FIJOS: en la muestra, 95 de cada 100 cambios entre
  // dos cortes quedan dentro de ±5 puntos y el mayor es de 10.2. Con 8 puntos
  // la flecha más larga corresponde a un cambio grande sin que las demás se
  // vuelvan muñones; las pocas que pasan de 8 se dibujan con el tope.
  const LIMITE_FLECHAS = 8;
  // Suma de numeradores y denominadores, nunca promedio de porcentajes.
  const tasaDe = (lista, anio, sexo) => {
    const rs = lista.filter((r) => r.anio === anio && (sexo === "Total" || r.sexo === sexo));
    const num = d3.sum(rs, (r) => r.num), den = d3.sum(rs, (r) => r.den);
    return {num, den, pct: den ? 100 * num / den : null, casos: d3.sum(rs, (r) => r.casos)};
  };
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes y entre qué años", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "par", rotulo: "Cortes", inicial: "2015-2020", opciones: PARES}),
    ]},
  ]});
  display(analisis({
    id: "flechas-cambio", numero: 8, titulo: "En qué municipios sube y en cuáles baja", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA,
    explica: ["Cada flecha nace en un municipio. Si el porcentaje que cumple la condición subió entre los dos cortes, la flecha se inclina a la derecha y va en azul; si bajó, se inclina a la izquierda y va en rojo. Mientras más grande el cambio, más larga e inclinada la flecha: un municipio que pasó de 20 % a 24 % (+4.0 puntos) tiene una flecha más larga y más inclinada que uno que subió 1 punto, y desde 8 puntos todas miden lo mismo.",
      `La escala no cambia con los filtros, así que la misma flecha quiere decir lo mismo con cualquier sexo o par de cortes. Los puntos grises son municipios con menos de ${MIN_CASOS} casos en la muestra en alguno de los dos años: su cifra es poco precisa y no llevan flecha, pero están en el globo y en la tabla. Al elegir una región, el mapa se acerca a ella y los municipios vecinos quedan en gris.`],
    dibujar: ({v, ancho}) => {
      const [a, b] = v.par.split("-").map(Number);
      const dentro = clavesDe(v.region);
      const unidades = municipios.map((lista) => {
        const m = lista[0], A = tasaDe(lista, a, v.sexo), B = tasaDe(lista, b, v.sexo);
        const cambio = A.pct != null && B.pct != null ? B.pct - A.pct : null;
        return {...m, a: A, b: B, cambio, s: sentido(A.pct, B.pct), casos: Math.min(A.casos, B.casos), foco: !dentro || dentro.includes(m.cve)};
      });
      const g = globo({
        marca: (d) => d.nombre, grupo: (d) => (d.s ? SIG.etiqueta(d.s) : null), color: (d) => (d.s ? SIG.color(d.s) : null),
        valor: (d) => d.cambio, formato: "puntos",
        precision: (d) => ({casos: d.casos}),
      });
      const dibujo = flechasCambio(geo, unidades, {
        ancho, posicion: (d) => [d.lon, d.lat], cambio: (d) => d.cambio, signo: (d) => d.s, sig: SIG, limite: LIMITE_FLECHAS,
        nombre: (d) => (ancho < 520 ? d.nombreCorto : d.nombre), pocos: (d) => d.casos < MIN_CASOS, enFoco: (d) => d.foco,
        encuadre: dentro ? (f) => dentro.includes(ISO_A_CVE.get(f.properties.id)) : null,
        titulo: `Cambio del porcentaje entre ${a} y ${b}, en puntos`, rotuloPocos: `Menos de ${MIN_CASOS} casos: sin flecha`, globo: g,
      });
      const enVista = unidades.filter((d) => d.foco);
      const c = dibujo.conteo;
      return {
        figura: {
          titulo: "Cambio del porcentaje que cumple la condición, por municipio",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ${UNIVERSO} · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${a} a ${b}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada flecha es un municipio: se inclina a la derecha si su porcentaje sube y a la izquierda si baja.",
          notas: [c?.pocos ? `${entero(c.pocos)} municipios tienen menos de ${MIN_CASOS} casos en la muestra y van sin flecha.` : null],
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(enVista, (d) => d.cambio ?? 0), columnas: [
          {titulo: "Municipio", valor: (d) => d.nombre, texto: true},
          {titulo: String(a), valor: (d) => d.a.pct, formato: "pct"},
          {titulo: String(b), valor: (d) => d.b.pct, formato: "pct"},
          {titulo: "Cambio", valor: (d) => d.cambio, formato: "puntos"},
          {titulo: `Personas que cumplen en ${a}`, valor: (d) => d.a.num, formato: "conteo"},
          {titulo: `Personas que cumplen en ${b}`, valor: (d) => d.b.num, formato: "conteo"},
          {titulo: `Población en ${b}`, valor: (d) => d.b.den, formato: "conteo"},
          {titulo: "Casos en la muestra (el menor de los dos años)", valor: (d) => d.casos, formato: "conteo"},
          {titulo: "Lectura", valor: (d) => (d.casos < MIN_CASOS ? "Pocos casos" : SIG.etiqueta(d.s)), texto: true},
        ]},
      };
    },
  }));
}
```

---

<h2 id="densidad" class="toc-anchor">Dónde vive la población que cumple la condición</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: aniosIndicador}),
    ]},
  ]});
  display(analisis({
    id: "densidad", numero: 9, titulo: "Dónde vive la población que cumple la condición", panel: filtros, metodo: "m-unidades", verifica: VERIFICA_MUESTRA, alto: reservar([568, 683, 777]),
    explica: ["Cada punto vale el número de personas que dice la leyenda y va en un lugar al azar dentro de su entidad: los puntos no son domicilios. En el tono de tema están quienes cumplen la condición y en gris quienes no. Donde se juntan muchos puntos vive mucha gente, y donde dominan los de color, la condición es frecuente. Si una entidad tiene 20 puntos y 5 son de color, una de cada cuatro personas cumple la condición.",
      "El valor de cada punto se elige para que haya entre 600 y 1,500 en el mapa (menos en un teléfono). Al acercar el mapa a una región cada punto vale menos personas y se dibujan más. Al pasar el puntero sobre una entidad, el globo da su porcentaje."],
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter((r) => r.anio === v.anio && r.sexo === v.sexo);
      const dentro = clavesDe(v.region);
      const dibujo = densidad(geo, new Map(filas.map((r) => [r.cve, r])), {ancho, cumplen: (d) => d.num, total: (d) => d.den, encuadre: dentro, globo: globoNivel(v)});
      return {
        figura: {
          titulo: "Población que cumple y que no cumple la condición, en puntos",
          subtitulo: `${textoSexo(v.sexo)} ${UNIVERSO} · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${v.anio}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada punto representa ${entero(dibujo.unidad ?? 0)} personas y va al azar dentro de su entidad, en color si cumple la condición.`,
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(filas.filter((r) => !dentro || dentro.includes(r.cve)), (r) => -r.num), columnas: [...columnasNivel,
          {titulo: "Puntos en color", valor: (d) => Math.round(d.num / (dibujo.unidad ?? 1)), formato: "conteo"},
          {titulo: "Puntos en total", valor: (d) => Math.round(d.den / (dibujo.unidad ?? 1)), formato: "conteo"}]},
      };
    },
  }));
}
```

---

<h2 id="mosaico-burbujas" class="toc-anchor">Dónde hay más personas que cumplen la condición y dónde pesa más</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: aniosIndicador}),
    ]},
    {leyenda: "Qué se destaca", campos: [campo({id: "destacar", rotulo: "Región destacada", inicial: "ninguna", opciones: opcionesDestacar})]},
  ]});
  display(analisis({
    id: "mosaico-burbujas", numero: 10, titulo: "Dónde hay más personas que cumplen la condición y dónde pesa más", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA, alto: reservar([528, 671, 694]),
    explica: ["Cada casilla es una entidad, acomodada más o menos donde está en el país, y todas miden lo mismo. Dentro va un círculo con dos medidas: su área es el número de personas que cumplen la condición y su color, el porcentaje de su población que la cumple. Un círculo grande y claro son muchas personas en una entidad donde la condición es poco frecuente.",
      "Las dos escalas son fijas: el círculo mayor quiere decir 3,500,000 personas o más y el color va de 0 a 80 %, como en el mapa de esta página. Al destacar una región, las demás casillas se atenúan."],
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter((r) => r.anio === v.anio && r.sexo === v.sexo);
      const region = v.destacar === "ninguna" ? null : v.destacar;
      return {
        figura: {
          titulo: "Personas que cumplen la condición y porcentaje que representan, por entidad",
          subtitulo: `${textoSexo(v.sexo)} ${UNIVERSO} · ${v.anio}${region ? ` · se destaca la región ${region}` : ""}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada casilla es una entidad: el área del círculo es el número de personas y su color, el porcentaje.",
          cuerpo: mosaicoBurbujas(new Map(filas.map((r) => [r.cve, r])), {
            ancho, conteo: (d) => d.num, tasa: (d) => d.pct, escala: rampaTema(DOMINIO_NIVEL), tope: TOPE_CONTEO,
            destacar: region ? (k) => POR_CVE.get(k)?.region === region : null,
            tituloLeyenda: "Porcentaje", marcasLeyenda: [0, 20, 40, 60, 80], formatoLeyenda: (x) => (x === 80 ? "80 o más" : String(x)), globo: globoNivel(v),
          }),
        },
        tabla: {filas: d3.sort(filas, (r) => -r.num), columnas: columnasNivel},
      };
    },
  }));
}
```

---

<h2 id="semitonos" class="toc-anchor">Dónde se concentra la población</h2>

```js
{
  const celdas = leerCeldas(await FileAttachment("../data/muestra/semitonos_celdas.csv").csv());
  // Tope FIJO del punto más grande, en personas por km²: en la muestra, la
  // mitad de las celdas tiene menos de 19 y 90 de cada 100, menos de 145; solo
  // las ciudades pasan de 300. Con 300 el campo se lee y las ciudades quedan
  // en el punto máximo («300 o más»). Es el mismo con cualquier filtro.
  const TOPE_DENSIDAD = 300;
  const opcionesGrupo = [{valor: "todas", texto: "Todas las edades"}, ...GRUPOS_EDAD.map((g) => ({valor: g.id, texto: g.texto}))];
  const personasDe = (c, grupo) => (grupo === "todas" ? c.p5a17 + c.p18a59 + c.p60ymas : c[grupo]);
  const fDensidad = (v) => (v < 10 ? numero(v, 1) : entero(v));
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "grupo", rotulo: "Grupo de edad", inicial: "todas", opciones: opcionesGrupo}),
      campo({id: "anio", rotulo: "Año", inicial: 2025, opciones: conDato(celdas, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "semitonos", numero: 11, titulo: "Dónde se concentra la población", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA,
    explica: ["El territorio se cubre con una rejilla de hexágonos y en cada uno va un punto. El área del punto es cuántas personas viven, en promedio, en cada kilómetro cuadrado de ese hexágono: un punto con el doble de área tiene el doble de densidad. Donde se juntan puntos grandes hay una ciudad; donde solo se ve la trama clara, casi no vive nadie.",
      "La escala es la misma con cualquier filtro, y el punto más grande quiere decir 300 personas por km² o más. Como se mide densidad y no un conteo, al acercar el mapa a una región los hexágonos cubren menos superficie y la trama se hace más fina, pero el mismo tamaño de punto sigue queriendo decir lo mismo. Los hexágonos que no contienen el centro de ninguna celda de datos toman la densidad de las celdas vecinas."],
    dibujar: ({v, ancho}) => {
      const dentro = clavesDe(v.region);
      const deAnio = celdas.filter((c) => c.anio === v.anio);
      const textoGrupo = v.grupo === "todas" ? "Todas las edades" : GRUPOS_EDAD.find((g) => g.id === v.grupo).texto;
      const g = globo({
        grupo: (h) => h.nombre, color: () => P.tonoTexto,
        valor: (h) => h.v, formato: (x) => `${fDensidad(x)} por km²`,
        personas: (h) => h.cantidad,
      });
      const dibujo = semitonos(geo, deAnio, {
        ancho, posicion: (c) => [c.lon, c.lat], valor: (c) => personasDe(c, v.grupo), area: (c) => c.area, tope: TOPE_DENSIDAD,
        encuadre: dentro ? (f) => dentro.includes(ISO_A_CVE.get(f.properties.id)) : null, enFoco: (c) => !dentro || dentro.includes(c.cve),
        nombre: (c) => (ancho < 520 ? POR_CVE.get(c.cve)?.corto ?? c.entidad : c.entidad), formato: (x) => `${fDensidad(x)} por km²`, formatoLeyenda: fDensidad,
        tituloLeyenda: "Personas por km²", marcasLeyenda: [10, 50, 150, 300], globo: g,
      });
      const filas = d3.rollups(deAnio.filter((c) => !dentro || dentro.includes(c.cve)), (f) => ({personas: d3.sum(f, (c) => personasDe(c, v.grupo)), area: d3.sum(f, (c) => c.area), celdas: f.length}), (c) => c.entidad)
        .map(([entidad, o]) => ({entidad, ...o, densidad: o.personas / o.area}));
      return {
        figura: {
          titulo: "Personas por kilómetro cuadrado, en una rejilla de hexágonos",
          subtitulo: `${v.grupo === "todas" ? `Población ${UNIVERSO}` : `Población de ${textoGrupo}`} · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es un hexágono y su área, las personas por kilómetro cuadrado que viven en él.",
          notas: [dibujo.recortados ? `${entero(dibujo.recortados)} hexágonos pasan de ${entero(TOPE_DENSIDAD)} personas por km² y se dibujan con el punto máximo.` : null],
          cuerpo: dibujo,
        },
        tabla: {filas: d3.sort(filas, (d) => -d.densidad), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Personas por km²", valor: (d) => d.densidad, formato: (x) => fDensidad(x)},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Superficie (km²)", valor: (d) => d.area, formato: "conteo"},
          {titulo: "Celdas de la rejilla de datos", valor: (d) => d.celdas, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="silueta" class="toc-anchor">Cómo se reparte la población según su situación entre dos años</h2>

```js
{
  const situacion = leerSituacion(await FileAttachment("../data/muestra/silueta_situacion.csv").csv());
  const PERIODOS = [...new Set(situacion.map((r) => r.periodo))];
  // Rojo y azul con el significado del capítulo: quien dejó de cumplir la
  // condición hace bajar el porcentaje y quien empezó a cumplirla lo hace
  // subir. Lo demás no es un cambio: tono de tema y gris.
  const colorSit = (s) => (s === "Dejó de cumplir" ? SIG.color("baja") : s === "Empezó a cumplir" ? SIG.color("sube") : s === "Cumple en los dos años" ? P.serie : P.contexto);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo}),
      campo({id: "periodo", rotulo: "Entre los años", inicial: PERIODOS.at(-1), opciones: PERIODOS.map((p) => ({valor: p, texto: `De ${p}`}))}),
    ]},
  ]});
  display(analisis({
    id: "silueta", numero: 12, titulo: "Cómo se reparte la población según su situación entre dos años", panel: filtros, metodo: "m-unidades", verifica: VERIFICA_MUESTRA,
    explica: ["La silueta del territorio está llena de puntos y cada punto vale el número de personas que dice la leyenda. Los puntos se ordenan de izquierda a derecha en franjas, una por situación: en rojo, quienes dejaron de cumplir la condición entre los dos años; en azul, quienes empezaron a cumplirla. El largo de cada tramo de la regla de abajo sigue a su franja y la cifra dice cuántas personas son: si 5 de cada 100 personas dejaron de cumplirla, su franja tiene 5 de cada 100 puntos.",
      "La posición de una franja dentro de la silueta no dice dónde vive esa gente: solo sigue el orden de las situaciones. Al elegir una región, la silueta pasa a ser la de esa región y el valor de cada punto se ajusta para que haya entre 400 y 2,500 puntos."],
    dibujar: ({v, ancho}) => {
      const filas = situacion.filter((r) => r.periodo === v.periodo && (v.sexo === "Total" || r.sexo === v.sexo) && (v.region === "todas" || r.region === v.region));
      const total = d3.sum(filas, (r) => r.personas);
      const datos = SITUACIONES.map((s) => {
        const f = filas.filter((r) => r.situacion === s);
        return {situacion: s, personas: d3.sum(f, (r) => r.personas), casos: d3.sum(f, (r) => r.casos), total};
      });
      const silueta = {type: "FeatureCollection", features: geo.features.filter((f) => v.region === "todas" || POR_CVE.get(ISO_A_CVE.get(f.properties.id))?.region === v.region)};
      const lugar = v.region === "todas" ? "Todo el país" : `Región ${v.region}`;
      const g = globo({
        grupo: (d) => d.situacion, color: (d) => colorSit(d.situacion),
        valor: (d) => 100 * d.personas / d.total, formato: "pct",
        personas: (d) => d.personas, universo: (d) => d.total, unidad: v.sexo === "Total" ? "habitantes" : v.sexo.toLowerCase(),
        precision: (d) => ({casos: d.casos}),
      });
      const dibujo = siluetaPuntos(silueta, datos, {
        ancho, categoria: (d) => d.situacion, valor: (d) => d.personas, color: (d) => colorSit(d.situacion), orden: SITUACIONES,
        cifra: (d, t) => (ancho < 520 ? pct(100 * d.personas / t) : `${entero(d.personas)} · ${pct(100 * d.personas / t)}`), globo: g,
      });
      return {
        figura: {
          titulo: "Población según su situación entre dos años, en puntos",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ${UNIVERSO} · ${lugar} · de ${v.periodo}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada punto representa ${entero(dibujo.unidad ?? 0)} personas y cada franja de color, una situación entre los dos años.`,
          cuerpo: dibujo,
        },
        tabla: {filas: datos, columnas: [
          {titulo: "Situación", valor: (d) => d.situacion, texto: true},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Parte del total", valor: (d) => 100 * d.personas / d.total, formato: "pct"},
          {titulo: "Puntos en la figura", valor: (d) => (dibujo.resumen?.find((r) => r.situacion === d.situacion)?.puntos ?? null), formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

```js
import {bivariado, cortesTerciles} from "../components/formas/bivariado.js";
import {leerEntidades} from "../components/muestra-gC.js";
```

<h2 id="subgrupo-mapa" class="toc-anchor">El indicador por subgrupo, en gráfica o en mapa</h2>

```js
// Componentes del patrón: subgrupo con grado y mapa como vista del filtro.
import {grupoSubgrupo, seleccionarSubgrupo, catalogo, conSubgrupo, FOCO, REFERENCIA} from "../components/subgrupo.js";
import {campoVista, campoPinta, esMapa, mapaIndicador, columnasMapa, notasMapa, BRECHA, ENTIDAD} from "../components/vista-mapa.js";
import {fraccion} from "../components/formas/fraccion.js";
import {tasaPorGrupo} from "../components/agregar.js";
// Datos de muestra (scripts/muestra_subgrupos.mjs).
const crudoSubgrupos = await FileAttachment("../data/muestra/subgrupos.csv").csv();
```

```js
{
  // PATRÓN «SUBGRUPO CON GRADO» Y «EL MAPA COMO VISTA DEL FILTRO» (R186 y
  // R187; docs/EMPEZAR-AQUI.md). Con «Todos los subgrupos» se suman las
  // filas de siempre (con y sin la condición); con un subgrupo, las del
  // subgrupo y grado elegidos contra la referencia «Ninguno». El mapa arranca
  // en «Gráfica», pinta con los rangos fijos de RANGOS.indicador_muestra
  // (vista-mapa.js) y ofrece la diferencia en puntos. No hay mapa por
  // municipio: la muestra imita una encuesta representativa por entidad.
  const filasS = crudoSubgrupos.map((r) => ({...r, anio: +r.anio, num: +r.num, den: +r.den, casos: +r.casos, ee: r.ee === "" ? null : +r.ee}));
  const base = filasS.filter((r) => r.subgrupo === "Todos");
  const porSubgrupo = filasS.filter((r) => r.subgrupo !== "Todos");
  const CAT = catalogo({
    // Tres subgrupos de muestra que se traslapan (una persona puede trabajar y
    // estudiar) y dos grados de frecuencia.
    subgrupos: [{valor: "A", texto: "Trabaja", corto: "Trabaja"}, {valor: "B", texto: "Estudia", corto: "Estudia"},
      {valor: "C", texto: "Cuida a alguien", corto: "Cuida"}],
    grados: [{valor: "Alto", texto: "Todos los días", corto: "todos los días"}, {valor: "Bajo", texto: "Algunos días", corto: "algunos días"}],
    referenciaSubgrupo: "Ninguna de las tres",
  });
  const PAIS_S = "Todo el país";
  const NOMBRES = [...new Set(base.map((r) => r.entidad))].sort((a, b) => a.localeCompare(b, "es"));
  const pasaS = (v) => (r) => r.anio === Number(v.anio) && (v.sexo === "Total" || r.sexo === v.sexo) && (v.entidad === PAIS_S || r.entidad === v.entidad);
  const filtros = panel({grupos: [
    {leyenda: "Cuándo y dónde", campos: [
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: [2020, 2010]}),
      campo({id: "entidad", rotulo: "Entidad", inicial: PAIS_S, opciones: [PAIS_S, ...NOMBRES]}),
    ]},
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: opcionesSexo})]},
    grupoSubgrupo(CAT),
    {leyenda: "Mapa", campos: [campoVista({entidad: true}), campoPinta()]},
  ]});
  display(analisis({
    id: "subgrupo-mapa", numero: 13, titulo: "El indicador por subgrupo, en gráfica o en mapa", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA,
    explica: [
      "Con «Todos los subgrupos», cada bloque reúne a cien personas: a la izquierda las que tienen la condición y a la derecha las que no, y las figuras en color cumplen el indicador. Al elegir un subgrupo y su grado, el bloque de la izquierda son las personas de ese subgrupo con ese grado y el de la derecha, las que no están en ningún subgrupo. Una persona puede estar en dos subgrupos, así que los subgrupos no se suman.",
      "El mapa pinta cada entidad en uno de cinco rangos fijos, los mismos con cualquier filtro, o la diferencia en puntos entre los dos grupos, en rojo donde el grupo elegido queda abajo. El subgrupo «Cuida a alguien» lleva rangos propios porque casi todas sus entidades caían en el primer tono. Las entidades con menos de 30 casos en la muestra van con trama.",
    ],
    dibujar: ({v, ancho}) => {
      const s = seleccionarSubgrupo({cat: CAT, base, porSubgrupo, v, grupoBase: (r) => (r.grupo === "Con la condición" ? FOCO : r.grupo === "Sin la condición" ? REFERENCIA : null)});
      if (esMapa(v)) {
        const t = tasaPorGrupo(s.filas.filter(pasaS({...v, entidad: PAIS_S})), ["grupo", "cve_ent"]);
        const porCve = (g) => new Map(t.filter((d) => d.grupo === g).map((d) => [d.cve_ent, d]));
        const cveSel = v.entidad === PAIS_S ? null : base.find((r) => r.entidad === v.entidad)?.cve_ent ?? null;
        const r = mapaIndicador({nivel: ENTIDAD, geoEnt: geo, valores: porCve(FOCO), referencia: porCve(REFERENCIA), pinta: v.pinta, indicador: "indicador_muestra",
          subgrupo: s.esSubgrupo ? s.subgrupo : null, ancho, grupo: s.texto(FOCO), referenciaTexto: s.texto(REFERENCIA), unidad: s.unidad(FOCO), entidad: cveSel});
        const brecha = v.pinta === BRECHA;
        return {
          figura: {
            titulo: brecha ? "Diferencia en el indicador entre los dos grupos, por entidad" : "Personas que cumplen el indicador, por entidad",
            subtitulo: `${r.descripcion} · ${textoSexo(v.sexo)} · ${v.entidad} · ${v.anio} · ${entero(r.conDato.length)} entidades con dato`,
            sello: MUESTRA,
            pie: `Datos de muestra de la Plantilla · cada entidad va en el tono de ${brecha ? "la diferencia en puntos, en rojo donde el grupo elegido queda abajo" : "su rango fijo de porcentaje, que se lee en la tira de rangos"}.`,
            notas: notasMapa(r, {nivel: ENTIDAD, anio: v.anio}),
            cuerpo: r.cuerpo,
          },
          tabla: {filas: r.filasTabla, columnas: columnasMapa({nivel: ENTIDAD, pinta: v.pinta, referenciaTexto: s.texto(REFERENCIA), unidad: r.unidad})},
        };
      }
      const orden = [FOCO, REFERENCIA].map((g) => tasaPorGrupo(s.filas.filter(pasaS(v)), ["grupo"]).find((d) => d.grupo === g)).filter(Boolean);
      const g = globo({grupo: (d) => s.texto(d.grupo), color: (d) => s.color(d.grupo), valor: (d) => d.pct, formato: "pct",
        personas: (d) => d.num, universo: (d) => d.den, unidad: (d) => s.unidad(d.grupo), precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos})});
      const fragil = orden.find((d) => d.grupo === FOCO && d.casos < MIN_CASOS);
      return {
        figura: {
          titulo: "Personas que cumplen el indicador, de cada cien",
          subtitulo: `${s.seleccion} · ${textoSexo(v.sexo)} · ${v.entidad} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada bloque reúne a cien personas de un grupo y las figuras en color cumplen el indicador.",
          notas: [fragil ? "Menos de 30 casos del grupo elegido en la muestra. La cifra es poco precisa." : null,
            conSubgrupo(v) ? "Una persona puede estar en dos subgrupos: las cifras de subgrupos distintos no se suman." : null],
          cuerpo: fraccion(orden, {ancho, etiqueta: (d) => s.corto(d.grupo), valor: (d) => d.pct, color: (d) => s.color(d.grupo), acomodo: "multitud", globo: g}),
        },
        tabla: {filas: orden, columnas: [
          {titulo: "Grupo", valor: (d) => s.texto(d.grupo), texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen de error (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Población que cumple", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población total", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="bivariado" class="toc-anchor">Dónde coinciden internet en el hogar y escolaridad</h2>

```js
{
  const entidades = leerEntidades(await FileAttachment("../data/muestra/gC_entidades.csv").csv());
  // Cortes FIJOS de los terciles, medidos UNA vez sobre las tres ediciones
  // juntas (96 filas): el mismo color dice lo mismo en cualquier año, y con
  // los años la mayoría de las entidades se corre hacia la esquina alta.
  const CORTES_INTERNET = cortesTerciles(entidades.map((d) => d.internet));
  const CORTES_ESCOLARIDAD = cortesTerciles(entidades.map((d) => d.escolaridad));
  const NIVEL = ["bajo", "medio", "alto"];
  const nivel = (v, [c1, c2]) => NIVEL[v < c1 ? 0 : v < c2 ? 1 : 2];
  const filtros = panel({grupos: [
    {leyenda: "Dónde y cuándo", campos: [
      campo({id: "region", rotulo: "Acercar a la región", inicial: "todas", opciones: opcionesRegion}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(entidades, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "bivariado", numero: 14, titulo: "Dónde coinciden internet en el hogar y escolaridad", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA, alto: reservar([640, 790, 880]),
    explica: ["Cada entidad se pinta con dos medidas a la vez: la parte de sus hogares con internet y los años de escuela de su población, en promedio. Cada medida se parte en tres niveles (bajo, medio y alto) y la combinación da uno de nueve colores. Hacia la derecha de la leyenda crece el internet; hacia arriba, la escolaridad. La esquina de arriba a la derecha son las entidades altas en las dos.",
      "Los cortes entre niveles son los mismos en los tres años, así que un color quiere decir lo mismo en cualquier año. El mapa dice dónde coinciden las dos medidas, no que una cause la otra. Para la cifra exacta de cada entidad, la tabla."],
    dibujar: ({v, ancho}) => {
      const filas = entidades.filter((r) => r.anio === v.anio);
      const dentro = clavesDe(v.region);
      const g = globo({
        marca: (d) => d.entidad ?? nombreEntidad(d.cve),
        grupo: (d) => (d.internet == null ? null : `Internet ${nivel(d.internet, CORTES_INTERNET)}, escolaridad ${nivel(d.escolaridad, CORTES_ESCOLARIDAD)}`),
        color: () => P.tonoTexto,
        valor: (d) => d.internet, formato: "pct",
        personas: (d) => d.hogaresInternet, universo: (d) => d.hogares, unidad: "hogares",
      });
      return {
        figura: {
          titulo: "Hogares con internet y escolaridad promedio, por entidad",
          subtitulo: `32 entidades · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`} · ${v.anio} · cada medida en tres niveles`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada entidad se pinta con la combinación de su nivel de hogares con internet y de escolaridad promedio.",
          cuerpo: bivariado(geo, new Map(filas.map((d) => [d.cve, d])), {
            ancho, a: (d) => d.internet, b: (d) => d.escolaridad, cortesA: CORTES_INTERNET, cortesB: CORTES_ESCOLARIDAD,
            ejeA: "Internet", ejeB: "Escolaridad", unidadA: "% de hogares", unidadB: "años", formatoA: (x) => numero(x, 0), formatoB: (x) => numero(x, 1),
            encuadre: dentro, globo: g,
          }),
        },
        tabla: {filas: d3.sort(filas.filter((d) => !dentro || dentro.includes(d.cve)), (d) => -d.internet), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Hogares con internet", valor: (d) => d.internet, formato: "pct"},
          {titulo: "Nivel de internet", valor: (d) => nivel(d.internet, CORTES_INTERNET), texto: true},
          {titulo: "Escolaridad promedio (años)", valor: (d) => d.escolaridad, formato: (x) => numero(x, 1)},
          {titulo: "Nivel de escolaridad", valor: (d) => nivel(d.escolaridad, CORTES_ESCOLARIDAD), texto: true},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
