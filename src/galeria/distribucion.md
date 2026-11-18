---
title: Distribución
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas para ver una <span class="clave">distribución</span></h1>
  <p class="capitulo-entradilla">Qué tan parejo es un grupo por dentro, cómo se mueve de una edición a otra y cómo se reparte por edad y sexo. Todas las cifras son datos de muestra.</p>
</header>

<link rel="stylesheet" href="../formas-flujo.css">
<link rel="stylesheet" href="../formas-gC.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {panel, campo, campoUmbral, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {significado, sentido, P} from "../components/paleta.js";
import {pct, puntos, deA, entero, numero, pesos, horas, margen, pctEje} from "../components/formato.js";
import {histograma} from "../components/formas/histograma.js";
import {caja} from "../components/formas/caja.js";
import {enjambrePuntos} from "../components/formas/enjambre-puntos.js";
import {lluvia} from "../components/formas/lluvia.js";
import {curvasAcumuladas} from "../components/formas/curvas-acumuladas.js";
import {concentracion} from "../components/formas/concentracion.js";
import {leerOcupados, leerCuidados, leerEscolaridadMunicipios, leerAcumulada, cuantilPonderado, SECTORES, EDADES_CUIDADO, COMPARACIONES} from "../components/muestra-gC.js";
import {franjas, crestas, piramide, enjambre, leyendaItems} from "../components/formas/index.js";
import {REGIONES, ENTIDADES} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {leerUnidades, leerEdades, UNIVERSO, VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerMunicipios} from "../components/muestra-flujos.js";

const unidades = leerUnidades(await FileAttachment("../data/muestra/unidades.csv").csv());
const edades = leerEdades(await FileAttachment("../data/muestra/edades.csv").csv());
const regionDe = new Map(ENTIDADES.map((e) => [e.cve, e.region]));
const EDADES = [...new Set(edades.map((r) => r.edad))];

const SIG = significado({rojo: "baja el porcentaje", azul: "sube el porcentaje", gris: "sin cambio claro", desfavorable: "baja"});
// Primer año de cada unidad, para comparar contra él.
const base2000 = new Map(unidades.filter((r) => r.anio === 2000).map((r) => [r.unidad, r]));
const conCambio = (r) => { const a = base2000.get(r.unidad); return {...r, a, cambio: a ? r.pct - a.pct : null, s: a ? sentido(a.pct, r.pct) : null}; };
// Alto que se reserva a cada sección antes de dibujarse, medido con los
// filtros por omisión en 390, 1366 y 1920 px (docs/scroll-bug.md).
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
// Textos que se repiten en las secciones de las encuestas de muestra.
const OPCIONES_SEXO = [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"];
const quienes = (sexo, todos = "personas") => (sexo === "Total" ? todos : sexo.toLowerCase());
const anios = (v) => `${numero(v, 1)} años`;
```

<h2 id="franjas" class="toc-anchor">Las unidades dentro de cada entidad</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "Sur-Sureste", opciones: REGIONES})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: [2020, 2010]})]},
  ]});
  display(analisis({
    id: "franjas", numero: 1, titulo: "Las unidades dentro de cada entidad", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA,
    explica: "Cada renglón es una entidad y cada punto, una de sus unidades, colocada según su porcentaje. La franja gris cubre la mitad central de las unidades y la raya punteada es la mediana, la unidad de en medio. El color dice si el porcentaje de la unidad bajó, subió o no cambió desde 2000. La altura de un punto dentro del renglón no significa nada: solo separa los puntos.",
    dibujar: ({v, ancho}) => {
      const filas = unidades.filter((r) => r.anio === v.anio && regionDe.get(r.cve) === v.region).map(conCambio);
      const g = globo({
        donde: (d) => d.nombre, cuando: (d) => d.anio,
        grupo: (d) => SIG.etiqueta(d.s), color: (d) => SIG.color(d.s),
        valor: (d) => d.pct, formato: "pct",
        frase: `de su población ${UNIVERSO} cumple la condición`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
        comparacion: (d) => (d.a ? `Desde 2000: ${puntos(d.cambio)}` : null),
      });
      const dibujo = franjas(filas, {ancho, grupo: (d) => d.entidad, valor: (d) => d.pct, id: (d) => d.unidad, color: (d) => SIG.color(d.s), dominioX: [0, 100], rotuloX: "Porcentaje", globo: g});
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición en cada unidad, por entidad",
          subtitulo: `Población ${UNIVERSO} · Región ${v.region} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es una unidad; la franja gris es la mitad central de las unidades de la entidad y la raya punteada, su mediana.",
          cuerpo: [leyendaItems([...SIG.leyenda("punto"), {tipo: "cuadro", color: P.rejilla, texto: "Mitad central de las unidades"}, {tipo: "punteada", color: P.tinta2, texto: "Mediana"}]), dibujo],
        },
        tabla: {filas: dibujo.resumen ?? [], columnas: [
          {titulo: "Entidad", valor: (d) => d.grupo, texto: true},
          {titulo: "Unidades", valor: (d) => d.n, formato: "conteo"},
          {titulo: "Cuarta parte más baja, hasta", valor: (d) => d.q1, formato: "pct"},
          {titulo: "Mediana", valor: (d) => d.mediana, formato: "pct"},
          {titulo: "Cuarta parte más alta, desde", valor: (d) => d.q3, formato: "pct"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="crestas" class="toc-anchor">Cómo se mueven las unidades de una edición a otra</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: [{valor: "todas", texto: "Todo el país"}, ...REGIONES]})]},
    {leyenda: "Qué unidades", campos: [campoUmbral({id: "umbral", rotulo: "Porcentaje mínimo en 2000", antes: "Unidades con", despues: "% o más en 2000", min: 0, max: 80, paso: 5, inicial: 0})]},
  ]});
  display(analisis({
    id: "crestas", numero: 2, titulo: "Cómo se mueven las unidades de una edición a otra", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: 420,
    explica: "Hay una cresta por año. Cada punto es una unidad, colocada según su porcentaje, y la curva resume dónde se juntan más unidades. Si la cresta de 2020 queda más a la izquierda que la de 2000, las unidades tienen porcentajes más bajos. La curva es un suavizado: cada unidad aporta un poco a los valores vecinos, unos 4 puntos hacia cada lado. La altura de un punto no significa nada.",
    dibujar: ({v, ancho}) => {
      const elegidas = new Set(unidades.filter((r) => r.anio === 2000 && r.pct >= v.umbral && (v.region === "todas" || regionDe.get(r.cve) === v.region)).map((r) => r.unidad));
      const filas = unidades.filter((r) => elegidas.has(r.unidad)).map(conCambio);
      const g = globo({
        donde: (d) => d.nombre, cuando: (d) => d.anio,
        grupo: (d) => (d.anio === 2000 ? null : SIG.etiqueta(d.s)), color: (d) => (d.anio === 2000 ? P.tinta2 : SIG.color(d.s)),
        valor: (d) => d.pct, formato: "pct",
        frase: `de su población ${UNIVERSO} cumple la condición`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
        comparacion: (d) => (d.anio === 2000 ? null : `Desde 2000: ${puntos(d.cambio)}`),
      });
      const resumen = [2000, 2010, 2020].map((anio) => { const x = filas.filter((r) => r.anio === anio).map((r) => r.pct).sort(d3.ascending); return {anio, n: x.length, q1: d3.quantileSorted(x, 0.25), mediana: d3.quantileSorted(x, 0.5), q3: d3.quantileSorted(x, 0.75)}; });
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición en cada unidad, por año",
          subtitulo: `${entero(elegidas.size)} unidades con ${v.umbral} % o más en 2000 · ${v.region === "todas" ? "Todo el país" : `Región ${v.region}`}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es una unidad en un año y la curva es el suavizado de su distribución; el color del punto es su cambio frente a 2000.",
          notas: [elegidas.size < 8 ? "Con menos de ocho unidades se dibujan solo los puntos, sin la curva." : null],
          cuerpo: [leyendaItems(SIG.leyenda("punto")), crestas(filas, {ancho, grupo: (d) => d.anio, valor: (d) => d.pct, id: (d) => d.unidad, orden: [2000, 2010, 2020], dominio: [0, 100], suavizado: 4,
            colorGrupo: () => P.resumen, color: (d) => (d.anio === 2000 ? P.resumen : SIG.color(d.s)), rotuloX: "Porcentaje", globo: g})],
        },
        tabla: {filas: resumen, columnas: [
          {titulo: "Año", valor: (d) => d.anio, texto: true},
          {titulo: "Unidades", valor: (d) => d.n, formato: "conteo"},
          {titulo: "Cuarta parte más baja, hasta", valor: (d) => d.q1, formato: "pct"},
          {titulo: "Mediana", valor: (d) => d.mediana, formato: "pct"},
          {titulo: "Cuarta parte más alta, desde", valor: (d) => d.q3, formato: "pct"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="piramide" class="toc-anchor">Quienes cumplen la condición, por edad y sexo</h2>

```js
{
  const aniosEdad = [...new Set(edades.map((r) => r.anio))].sort((a, b) => b - a);
  // El 100 % es el total de personas que cumplen, de los dos sexos, en cada año.
  const reparto = (anio) => { const f = edades.filter((r) => r.anio === anio), total = d3.sum(f, (r) => r.num); return f.map((r) => ({...r, total, parte: 100 * r.num / total})); };
  // Tope FIJO del eje: el máximo de todos los años, para que cambiar de año no mueva los ejes.
  const TOPE = Math.ceil(d3.max(aniosEdad.flatMap(reparto), (r) => r.parte));
  const filtros = panel({grupos: [
    {leyenda: "Cuándo", campos: [
      campo({id: "anio", rotulo: "Barras, año", inicial: 2020, opciones: aniosEdad}),
      // Dependiente: no ofrece el mismo año de las barras.
      campo({id: "comparar", rotulo: "Rayas, comparar con", inicial: 2000, opciones: (v) => aniosEdad.filter((a) => a !== v.anio)}),
    ]},
  ]});
  display(analisis({
    id: "piramide", numero: 3, titulo: "Quienes cumplen la condición, por edad y sexo", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA,
    explica: "Cada barra es un grupo de edad: a la izquierda los hombres y a la derecha las mujeres. Su largo dice qué parte de todas las personas que cumplen la condición tiene esa edad y ese sexo. Si la barra de mujeres de 20 a 24 años mide 4 %, de cada 100 personas que cumplen, 4 son mujeres de esa edad. Las rayas marcan el valor del año con que se compara.",
    dibujar: ({v, ancho}) => {
      const filas = reparto(v.anio), otro = reparto(v.comparar);
      const g = globo({
        donde: (d) => `${d.edad} años`, cuando: (d) => d.anio, grupo: (d) => d.sexo, color: () => P.tonoTexto,
        valor: (d) => d.parte, formato: "pct",
        frase: "de todas las personas que cumplen la condición",
        personas: (d) => d.num, universo: (d) => d.total, apellido: "que cumplen la condición",
        comparacion: (d) => { const o = otro.find((r) => r.edad === d.edad && r.sexo === d.sexo); return o ? `${v.comparar}: ${pct(o.parte)}` : null; },
      });
      return {
        figura: {
          titulo: "Reparto por edad y sexo de quienes cumplen la condición",
          subtitulo: `Todo el país · barras de ${v.anio}, rayas de ${v.comparar}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es la parte de quienes cumplen la condición que tiene esa edad y ese sexo; la raya es el valor del año de comparación.",
          cuerpo: piramide(filas, {ancho, edad: (d) => d.edad, lado: (d) => d.sexo, valor: (d) => d.parte, izquierda: "Hombres", derecha: "Mujeres", edades: EDADES, tope: TOPE,
            comparar: otro, nombreBarras: String(v.anio), nombreComparar: String(v.comparar), rotuloX: "Porcentaje de quienes cumplen", globo: g}),
        },
        tabla: {filas: [...filas].sort((p, q) => q.orden - p.orden || p.sexo.localeCompare(q.sexo)), columnas: [
          {titulo: "Edad", valor: (d) => d.edad, texto: true},
          {titulo: "Sexo", valor: (d) => d.sexo, texto: true},
          {titulo: `Parte en ${v.anio}`, valor: (d) => d.parte, formato: "pct"},
          {titulo: "Personas que cumplen", valor: (d) => d.num, formato: "conteo"},
          {titulo: `Parte en ${v.comparar}`, valor: (d) => otro.find((r) => r.edad === d.edad && r.sexo === d.sexo)?.parte, formato: "pct"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="enjambre" class="toc-anchor">Dónde cae cada municipio y cuánto pesa</h2>

```js
{
  const municipios = leerMunicipios(await FileAttachment("../data/muestra/municipios.csv").csv());
  // Extremos FIJOS: el eje va de 0 a 60 % (27 de los 622 valores de la muestra
  // pasan de 45 % y se juntan en el extremo «60 o más»), y el radio máximo
  // corresponde a 700,000 personas (el municipio mayor tiene 651,000).
  const DOMINIO_ENJAMBRE = [0, 60];
  const TAMANO_MAXIMO = 700000;
  const filtros = panel({grupos: [
    {leyenda: "Qué se destaca", campos: [campo({id: "region", rotulo: "Región destacada", inicial: "Sur-Sureste", opciones: REGIONES})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2025, opciones: conDato(municipios, "anio").sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "enjambre", numero: 4, titulo: "Dónde cae cada municipio y cuánto pesa", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA,
    explica: ["Cada burbuja es un municipio. Su lugar sobre el eje es el porcentaje de su población que cumple la condición y su tamaño, cuántas personas viven ahí. Los municipios de la región elegida van en color y los demás en gris. Una burbuja en 30 quiere decir que 30 de cada 100 personas de ese municipio cumplen la condición.",
      "La línea punteada es el promedio nacional: todas las personas que cumplen entre toda la población. La distancia de una burbuja al centro del enjambre no significa nada, solo evita que se encimen. Los municipios con 60 % o más se juntan en el extremo del eje."],
    dibujar: ({v, ancho}) => {
      const filas = municipios.filter((r) => r.anio === v.anio);
      const nacional = 100 * d3.sum(filas, (r) => r.num) / d3.sum(filas, (r) => r.den);
      const g = globo({
        donde: (d) => d.nombre, cuando: (d) => d.anio, grupo: (d) => `Región ${d.region}`, color: (d) => (d.region === v.region ? P.tonoTexto : P.tinta2),
        valor: (d) => d.pct, formato: "pct",
        frase: `de su población ${UNIVERSO} cumple la condición`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
        comparacion: () => `Promedio nacional: ${pct(nacional)}`,
        precision: (d) => ({valor: d.pct, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición y población de cada municipio",
          subtitulo: `Población ${UNIVERSO} · se destaca la región ${v.region} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada burbuja es un municipio, colocado según el porcentaje de su población que cumple la condición y con el tamaño de su población.",
          cuerpo: enjambre(filas, {ancho, valor: (d) => d.pct, tamano: (d) => d.den, id: (d) => d.cveMun, nombre: (d) => (ancho < 640 ? d.nombreCorto : d.nombre),
            destacado: (d) => d.region === v.region, dominio: DOMINIO_ENJAMBRE, tope: true, tamanoMax: TAMANO_MAXIMO,
            referencia: {valor: nacional, texto: `Promedio nacional: ${pct(nacional)}`}, rotuloEje: "Porcentaje de la población que cumple la condición",
            textoDestacado: `Municipios de la región ${v.region}`, textoResto: "Municipios de otras regiones", globo: g}),
        },
        tabla: {filas: [...filas].sort((a, b) => (b.region === v.region) - (a.region === v.region) || b.den - a.den), columnas: [
          {titulo: "Municipio", valor: (d) => d.nombre, texto: true},
          {titulo: "Región", valor: (d) => d.region, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
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

```js
// Microdatos de personas ocupadas: los usan el histograma y la caja.
const ocupados = leerOcupados(await FileAttachment("../data/muestra/gC_ocupados.csv").csv());
const SEXO_TEXTO = {Total: "Mujeres y hombres", Mujeres: "Mujeres", Hombres: "Hombres"};
const ocupadas = (s) => (s === "Hombres" ? "los hombres ocupados" : s === "Mujeres" ? "las mujeres ocupadas" : "las personas ocupadas");
const unidadSexo = (s) => (s === "Hombres" ? "hombres" : s === "Mujeres" ? "mujeres" : "personas");
const apellidoOcupadas = (s) => (s === "Hombres" ? "ocupados" : "ocupadas");
```

<h2 id="histograma" class="toc-anchor">Cuánto ganan al mes las personas ocupadas</h2>

```js
{
  // Tramos FIJOS de 2,000 pesos. El último junta todo lo que pasa de 40,000
  // (1 de cada 100 personas de la muestra) y el eje vertical llega a 20 %
  // en cualquier selección (el tramo más alto de la muestra mide 19.4 %).
  const TRAMO = 2000, TOPE_INGRESO = 40000, DOMINIO_Y = [0, 20];
  const tramosDe = (filas) => {
    const total = d3.sum(filas, (r) => r.factor);
    const t = d3.range(0, TOPE_INGRESO + 1, TRAMO).map((x0) => ({x0, x1: x0 + TRAMO, personas: 0, casos: 0}));
    for (const r of filas) { const k = Math.min(t.length - 1, Math.floor(r.ingreso / TRAMO)); t[k].personas += r.factor; t[k].casos++; }
    return t.map((d) => ({...d, total, valor: 100 * d.personas / total}));
  };
  const textoTramo = (d) => (d.x0 >= TOPE_INGRESO ? `${pesos(TOPE_INGRESO)} o más al mes` : `De ${pesos(d.x0)} a ${pesos(d.x1)} al mes`);
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: OPCIONES_SEXO}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: [2024, 2022]}),
    ]},
  ]});
  display(analisis({
    id: "histograma", numero: 5, titulo: "Cuánto ganan al mes las personas ocupadas", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: reservar([560, 500, 550]),
    explica: "Cada barra es un tramo de 2,000 pesos de ingreso al mes y su alto dice qué parte de las personas ocupadas gana en ese tramo. Si la barra de 6,000 a 8,000 pesos mide 15 %, 15 de cada 100 personas ocupadas ganan eso. La línea punteada es la mediana: la mitad gana menos y la otra mitad, más. Los montos de 2022 están en pesos de 2024 para que los dos años se comparen, y la última barra junta a quienes ganan 40,000 pesos o más.",
    dibujar: ({v, ancho}) => {
      const sel = (anio) => ocupados.filter((r) => r.anio === anio && (v.sexo === "Total" || r.sexo === v.sexo));
      const filas = sel(v.anio), otroAnio = v.anio === 2024 ? 2022 : 2024;
      const tramos = tramosDe(filas), otros = new Map(tramosDe(sel(otroAnio)).map((d) => [d.x0, d]));
      const mediana = cuantilPonderado(d3.sort(filas, (r) => r.ingreso), 0.5, (r) => r.ingreso, (r) => r.factor);
      const g = globo({
        donde: textoTramo, cuando: v.anio,
        grupo: v.sexo === "Total" ? null : v.sexo, color: P.tonoTexto,
        valor: (d) => d.valor, formato: "pct",
        frase: `de ${ocupadas(v.sexo)} gana en este tramo`,
        personas: (d) => d.personas, universo: (d) => d.total, unidad: unidadSexo(v.sexo), apellido: apellidoOcupadas(v.sexo),
        comparacion: (d) => `${otroAnio}: ${pct(otros.get(d.x0)?.valor)}`,
        precision: (d) => ({valor: d.valor, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Ingreso mensual de las personas ocupadas, por tramo",
          subtitulo: `${SEXO_TEXTO[v.sexo]} · ${v.anio} · pesos de 2024 · mediana de ${pesos(mediana)} al mes`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es la parte de las personas ocupadas que gana en un tramo de 2,000 pesos al mes. La línea punteada es la mediana.",
          cuerpo: [leyendaItems([{tipo: "cuadro", color: P.serie, texto: "Parte de las personas en el tramo"}, {tipo: "punteada", color: P.tinta2, texto: `Mediana: ${pesos(mediana)} al mes`}]),
            histograma(tramos, {ancho, dominioX: [0, TOPE_INGRESO + TRAMO], dominioY: DOMINIO_Y, abierto: true, marcasX: ancho < 560 ? [0, 20000, 40000] : [0, 10000, 20000, 30000, 40000],
              formatoX: (x) => (x === 0 ? "$0" : `$${numero(x / 1000, 0)} mil`), rotuloX: "Ingreso al mes, en pesos de 2024", rotuloY: "Porcentaje de las personas ocupadas",
              referencias: [{valor: mediana}], globo: g})],
        },
        tabla: {filas: tramos, columnas: [
          {titulo: "Tramo de ingreso al mes", valor: textoTramo, texto: true},
          {titulo: "Parte de las personas", valor: (d) => d.valor, formato: "pct"},
          {titulo: "Personas ocupadas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
          {titulo: `Parte en ${otroAnio}`, valor: (d) => otros.get(d.x0)?.valor, formato: "pct"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="enjambre-puntos" class="toc-anchor">Escolaridad promedio de cada municipio</h2>

```js
{
  const municipiosEsc = leerEscolaridadMunicipios(await FileAttachment("../data/muestra/gC_escolaridad_municipios.csv").csv());
  // Extremos FIJOS del eje: de 5 a 14 años (el municipio más bajo de la
  // muestra tiene 5.1 y el más alto, 13.8, en 2010 o en 2020).
  const DOMINIO_ESCOLARIDAD = [5, 14];
  const filtros = panel({grupos: [
    {leyenda: "Qué se destaca", campos: [campo({id: "region", rotulo: "Región destacada", inicial: "Sur-Sureste", opciones: REGIONES})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(municipiosEsc, "anio").sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "enjambre-puntos", numero: 6, titulo: "Escolaridad promedio de cada municipio", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: reservar([545, 430, 330]),
    explica: "Cada punto es un municipio, colocado según los años de escuela que en promedio tiene su población de 15 años y más. Los puntos se apilan para no encimarse, así que donde el enjambre es más grueso hay más municipios. Un punto en 9 quiere decir que, en promedio, sus habitantes estudiaron hasta terminar la secundaria. Los municipios de la región elegida van en color y la línea punteada es el promedio nacional. La distancia de un punto a la línea central no significa nada.",
    dibujar: ({v, ancho}) => {
      const filas = municipiosEsc.filter((r) => r.anio === v.anio);
      const nacional = d3.sum(filas, (r) => r.escolaridad * r.pob15) / d3.sum(filas, (r) => r.pob15);
      const g = globo({
        donde: (d) => d.nombre, cuando: (d) => d.anio,
        grupo: (d) => `Región ${d.region}`, color: (d) => (d.region === v.region ? P.tonoTexto : P.tinta2),
        valor: (d) => d.escolaridad, formato: anios,
        frase: (d) => `de escuela en promedio, entre sus ${entero(d.pob15)} personas de 15 años y más`,
        comparacion: () => `Promedio nacional: ${anios(nacional)}`,
        precision: (d) => ({valor: d.escolaridad, ee: d.ee, casos: d.casos}),
      });
      const nRegion = filas.filter((r) => r.region === v.region).length;
      return {
        figura: {
          titulo: "Escolaridad promedio de la población de 15 años y más, por municipio",
          subtitulo: `${entero(filas.length)} municipios · se destaca la región ${v.region}, con ${entero(nRegion)} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es un municipio, colocado según los años de escuela que en promedio tiene su población de 15 años y más.",
          cuerpo: [leyendaItems([{tipo: "punto", color: P.serie, texto: `Municipios de la región ${v.region}`}, {tipo: "punto", color: P.contexto, texto: "Municipios de otras regiones"}, {tipo: "punteada", color: P.tinta2, texto: `Promedio nacional: ${anios(nacional)}`}]),
            enjambrePuntos(filas, {ancho, valor: (d) => d.escolaridad, id: (d) => d.cveMun, dominio: DOMINIO_ESCOLARIDAD, destacado: (d) => d.region === v.region,
              referencia: {valor: nacional, texto: `Promedio nacional: ${anios(nacional)}`}, formatoEje: (x) => numero(x, 0), rotuloX: "Años de escuela, en promedio", globo: g})],
        },
        tabla: {filas: d3.sort(filas, (r) => -(r.region === v.region), (r) => -r.escolaridad), columnas: [
          {titulo: "Municipio", valor: (d) => d.nombre, texto: true},
          {titulo: "Región", valor: (d) => d.region, texto: true},
          {titulo: "Escolaridad promedio", valor: (d) => d.escolaridad, formato: (x) => anios(x)},
          {titulo: "Margen de error", valor: (d) => d.ee, formato: (x) => (x == null ? "" : `${margen(x)} años`)},
          {titulo: "Población de 15 años y más", valor: (d) => d.pob15, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="caja" class="toc-anchor">Horas que trabajan a la semana, por sector</h2>

```js
{
  // Extremos FIJOS del eje: de 0 a 84 horas, el tope que registra la encuesta.
  const DOMINIO_HORAS = [0, 84];
  const resumenDe = (filas) => SECTORES.map((sector) => {
    const f = d3.sort(filas.filter((r) => r.sector === sector), (r) => r.horas);
    const q = (p) => cuantilPonderado(f, p, (r) => r.horas, (r) => r.factor);
    return {grupo: sector, p5: q(0.05), q1: q(0.25), mediana: q(0.5), q3: q(0.75), p95: q(0.95), personas: d3.sum(f, (r) => r.factor), casos: f.length};
  }).filter((d) => d.casos);
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: OPCIONES_SEXO}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: [2024, 2022]}),
    ]},
  ]});
  display(analisis({
    id: "caja", numero: 7, titulo: "Horas que trabajan a la semana, por sector", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: reservar([715, 525, 505]),
    explica: "Cada renglón es un sector. La caja cubre a la mitad central de las personas que trabajan en él: una cuarta parte trabaja menos horas que el borde izquierdo y otra cuarta parte, más que el derecho. La raya gruesa es la mediana, la persona de en medio, y su cifra va escrita arriba. La línea delgada llega hasta donde quedan 9 de cada 10 personas. Si la caja del comercio va de 36 a 48 horas, la mitad de quienes trabajan en el comercio trabaja entre 36 y 48 horas a la semana.",
    dibujar: ({v, ancho}) => {
      const resumen = resumenDe(ocupados.filter((r) => r.anio === v.anio && (v.sexo === "Total" || r.sexo === v.sexo)));
      const g = globo({
        donde: (d) => d.grupo, cuando: v.anio,
        grupo: v.sexo === "Total" ? null : v.sexo, color: P.tonoTexto,
        valor: (d) => d.mediana, formato: "horas",
        frase: `a la semana trabaja la persona de en medio entre ${ocupadas(v.sexo)} del sector`,
        comparacion: (d) => `Mitad central: de ${numero(d.q1, 0)} a ${numero(d.q3, 0)} horas`,
        precision: (d) => ({casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Horas trabajadas a la semana, por sector",
          subtitulo: `${SEXO_TEXTO[v.sexo]} con trabajo · ${v.anio} · cinco sectores`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · la caja es la mitad central de las personas de cada sector, la raya gruesa su mediana y la línea llega del 5 al 95 por ciento.",
          cuerpo: [leyendaItems([{tipo: "cuadro", color: P.tonoSuave, texto: "Mitad central de las personas"}, {tipo: "linea", color: P.tonoTexto, texto: "Mediana"}, {tipo: "linea", color: P.tinta2, texto: "Del 5 al 95 por ciento"}]),
            caja(resumen, {ancho, orden: SECTORES, dominio: DOMINIO_HORAS, formato: (x) => `${numero(x, 0)} h`, formatoEje: (x) => numero(x, 0), rotuloX: "Horas a la semana", globo: g})],
        },
        tabla: {filas: resumen, columnas: [
          {titulo: "Sector", valor: (d) => d.grupo, texto: true},
          {titulo: "Mediana", valor: (d) => d.mediana, formato: "horas"},
          {titulo: "Cuarta parte más baja, hasta", valor: (d) => d.q1, formato: "horas"},
          {titulo: "Cuarta parte más alta, desde", valor: (d) => d.q3, formato: "horas"},
          {titulo: "5 por ciento", valor: (d) => d.p5, formato: "horas"},
          {titulo: "95 por ciento", valor: (d) => d.p95, formato: "horas"},
          {titulo: "Personas ocupadas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="curvas-acumuladas" class="toc-anchor">Qué parte de cada grupo tiene menos años de escuela</h2>

```js
{
  const acumulada = leerAcumulada(await FileAttachment("../data/muestra/gC_escolaridad_acumulada.csv").csv());
  const UMBRALES = [{x: 6, texto: "Primaria"}, {x: 9, texto: "Secundaria"}, {x: 12, texto: "Media superior"}];
  const menosDe = (x) => (x === 1 ? "Menos de 1 año de escuela" : `Menos de ${x} años de escuela`);
  const filtros = panel({grupos: [
    {leyenda: "Qué se compara y cuándo", campos: [
      campo({id: "comparacion", rotulo: "Grupos", inicial: "lengua", opciones: Object.entries(COMPARACIONES).map(([valor, c]) => ({valor, texto: c.texto}))}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(acumulada, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "curvas-acumuladas", numero: 8, titulo: "Qué parte de cada grupo tiene menos años de escuela", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: reservar([685, 590, 590]),
    explica: "Cada curva es un grupo y cada punto dice qué parte de ese grupo tiene menos años de escuela que el número del eje. Si en el 9 la curva marca 40 %, 40 de cada 100 personas del grupo no terminaron la secundaria. En los años que completan la primaria (6), la secundaria (9) y la media superior (12) una flecha une las dos curvas y las dos cifras van escritas. Cuanto más larga la flecha, más separa ese umbral a los dos grupos.",
    dibujar: ({v, ancho}) => {
      const grupos = COMPARACIONES[v.comparacion].grupos;
      const filas = acumulada.filter((r) => r.anio === v.anio && r.comparacion === v.comparacion && r.x >= 1);
      const de = new Map(filas.map((r) => [`${r.grupo}|${r.x}`, r]));
      const otro = (d) => de.get(`${grupos[d.grupo === grupos[0] ? 1 : 0]}|${d.x}`);
      const g = globo({
        donde: (d) => menosDe(d.x), cuando: v.anio,
        grupo: (d) => d.grupo, color: (d) => (d.grupo === grupos[0] ? P.serie : P.comparacion),
        valor: (d) => d.pct, formato: "pct",
        frase: "de la población de 25 a 64 años de este grupo",
        personas: (d) => d.num, universo: (d) => d.den, apellido: "de 25 a 64 años",
        comparacion: (d) => (otro(d) ? `${otro(d).grupo}: ${pct(otro(d).pct)}` : null),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const xs = [...new Set(filas.map((r) => r.x))].sort((a, b) => a - b);
      return {
        figura: {
          titulo: "Población de 25 a 64 años con menos años de escuela que cada umbral",
          subtitulo: `${grupos[0]} y ${grupos[1].toLowerCase()} · ${v.anio} · flechas en primaria, secundaria y media superior`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada curva acumula, de izquierda a derecha, qué parte del grupo tiene menos años de escuela. Las flechas unen los dos grupos.",
          cuerpo: [leyendaItems([{tipo: "linea", color: P.serie, texto: grupos[0]}, {tipo: "linea", color: P.comparacion, texto: grupos[1]}, {tipo: "punteada", color: P.regla, texto: "Primaria (6 años), secundaria (9) y media superior (12)"}]),
            curvasAcumuladas(filas, {ancho, grupos, umbrales: UMBRALES, dominioX: [0, 18], rotuloX: "Años de escuela", rotuloY: "Porcentaje con menos años", globo: g})],
        },
        tabla: {filas: xs, columnas: [
          {titulo: "Años de escuela", valor: (x) => menosDe(x), texto: true},
          {titulo: grupos[0], valor: (x) => de.get(`${grupos[0]}|${x}`)?.pct, formato: "pct"},
          {titulo: `Margen de error, ${grupos[0].toLowerCase()}`, valor: (x) => de.get(`${grupos[0]}|${x}`)?.ee, formato: (e) => margen(e)},
          {titulo: grupos[1], valor: (x) => de.get(`${grupos[1]}|${x}`)?.pct, formato: "pct"},
          {titulo: `Margen de error, ${grupos[1].toLowerCase()}`, valor: (x) => de.get(`${grupos[1]}|${x}`)?.ee, formato: (e) => margen(e)},
          {titulo: "Distancia entre los grupos", valor: (x) => de.get(`${grupos[0]}|${x}`)?.pct - de.get(`${grupos[1]}|${x}`)?.pct, formato: "puntos"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="lluvia" class="toc-anchor">Horas a la semana que dedican a cuidar, por edad</h2>

```js
{
  const cuidados = leerCuidados(await FileAttachment("../data/muestra/gC_cuidados.csv").csv());
  // Extremos FIJOS del eje: de 0 a 80 horas (99 de cada 100 personas de la
  // muestra cuidan menos de 53 horas y el valor mayor es 67).
  const DOMINIO_CUIDADOS = [0, 80];
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Mujeres", opciones: ["Mujeres", "Hombres"]}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(cuidados, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "lluvia", numero: 9, titulo: "Horas a la semana que dedican a cuidar, por edad", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: reservar([790, 715, 695]),
    explica: ["Cada renglón es un grupo de edad de quienes cuidan a otras personas. La nube de arriba muestra la forma de la distribución: donde sube, hay más personas con esas horas. Es un suavizado en que cada persona aporta un poco a las horas vecinas, unas 3 hacia cada lado. Abajo, cada punto es una persona de la muestra, y la franja con la raya punteada marca la mitad central y la mediana.",
      "Si la mediana de un grupo es 20 horas, la mitad de ese grupo cuida menos de 20 horas a la semana y la otra mitad, más. Una nube con dos jorobas quiere decir que dentro del grupo hay dos situaciones distintas."],
    dibujar: ({v, ancho}) => {
      const filas = cuidados.filter((r) => r.anio === v.anio && r.sexo === v.sexo).map((r, i) => ({...r, id: `${r.anio}-${r.sexo}-${r.edad}-${i}`}));
      const resumen = EDADES_CUIDADO.map((edad) => {
        const f = d3.sort(filas.filter((r) => r.edad === edad), (r) => r.horas);
        const q = (p) => cuantilPonderado(f, p, (r) => r.horas, (r) => r.factor);
        return {grupo: edad, q1: q(0.25), mediana: q(0.5), q3: q(0.75), personas: d3.sum(f, (r) => r.factor), casos: f.length};
      });
      const g = globo({
        donde: (d) => `${v.sexo} de ${d.grupo} años que cuidan`, cuando: v.anio,
        valor: (d) => d.mediana, formato: "horas",
        frase: "a la semana dedica a cuidar la persona de en medio del grupo",
        comparacion: (d) => `Mitad central: de ${numero(d.q1, 0)} a ${numero(d.q3, 0)} horas`,
        precision: (d) => ({casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Horas a la semana de trabajo de cuidados, por grupo de edad",
          subtitulo: `${v.sexo} que cuidan a otras personas · ${v.anio} · cuatro grupos de edad`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · la nube es la forma suavizada de la distribución, la franja su mitad central y cada punto una persona de la muestra.",
          cuerpo: [leyendaItems([{tipo: "cuadro", color: P.tonoSuave, texto: "Forma de la distribución"}, {tipo: "punto", color: P.serie, texto: "Una persona de la muestra"}, {tipo: "cuadro", color: P.rejilla, texto: "Mitad central"}, {tipo: "punteada", color: P.tinta2, texto: "Mediana"}]),
            lluvia(filas, resumen, {ancho, grupo: (d) => d.edad, valor: (d) => d.horas, peso: (d) => d.factor, id: (d) => d.id, orden: EDADES_CUIDADO, dominio: DOMINIO_CUIDADOS, suavizado: 3,
              formato: (x) => `${numero(x, 0)} h`, formatoEje: (x) => numero(x, 0), rotuloX: "Horas a la semana", globo: g})],
        },
        tabla: {filas: resumen, columnas: [
          {titulo: "Edad", valor: (d) => `${d.grupo} años`, texto: true},
          {titulo: "Mediana", valor: (d) => d.mediana, formato: "horas"},
          {titulo: "Cuarta parte más baja, hasta", valor: (d) => d.q1, formato: "horas"},
          {titulo: "Cuarta parte más alta, desde", valor: (d) => d.q3, formato: "horas"},
          {titulo: "Personas que cuidan", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="concentracion" class="toc-anchor">Qué tan concentradas están en pocos municipios las personas que cumplen la condición</h2>

```js
{
  const municipios = leerMunicipios(await FileAttachment("../data/muestra/municipios.csv").csv());
  const G0 = "Personas que cumplen la condición", G1 = `Población ${UNIVERSO}`;
  // Curva de un total: municipios ordenados de más a menos y suma acumulada.
  const curva = (filas, campo, grupo) => {
    const o = d3.sort(filas, (r) => -r[campo]), total = d3.sum(o, (r) => r[campo]);
    let acum = 0;
    return [{grupo, x: 0, y: 0, n: 0, N: o.length, acum: 0, total}, ...o.map((r, i) => { acum += r[campo]; return {grupo, x: 100 * (i + 1) / o.length, y: 100 * acum / total, n: i + 1, N: o.length, acum, total}; })];
  };
  // Punto de la curva en un corte, interpolado entre los dos municipios vecinos.
  const enCorte = (c, corte) => { const i = c.findIndex((d) => d.x >= corte); const a = c[Math.max(0, i - 1)], b = c[i]; const f = b.x === a.x ? 1 : (corte - a.x) / (b.x - a.x); return {grupo: b.grupo, x: corte, y: a.y + (b.y - a.y) * f}; };
  const filtros = panel({grupos: [
    {leyenda: "Dónde y cuándo", campos: [
      campo({id: "region", rotulo: "Región", inicial: "todas", opciones: [{valor: "todas", texto: "Todo el país"}, ...REGIONES]}),
      campo({id: "anio", rotulo: "Año", inicial: 2025, opciones: conDato(municipios, "anio").sort((a, b) => b - a)}),
    ]},
    {leyenda: "Qué se marca", campos: [campo({id: "corte", rotulo: "Puntos, primeros municipios", inicial: 10, opciones: [10, 25, 50].map((c) => ({valor: c, texto: `El ${c} % de los municipios`}))})]},
  ]});
  display(analisis({
    id: "concentracion", numero: 10, titulo: "Qué tan concentradas están en pocos municipios las personas que cumplen la condición", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: reservar([690, 630, 590]),
    explica: "Los municipios se ordenan del que tiene más personas que cumplen la condición al que tiene menos, y la curva va sumando qué parte del total reúnen. Si la curva pasa por 62 % en el 10 % de los municipios, la décima parte de los municipios concentra a 62 de cada 100 personas que cumplen. La otra curva hace lo mismo con la población: si las dos van juntas, quienes cumplen están tan concentrados como la gente. La diagonal es el reparto parejo, en que cada municipio tendría la misma parte.",
    dibujar: ({v, ancho}) => {
      const filas = municipios.filter((r) => r.anio === v.anio && (v.region === "todas" || r.region === v.region));
      const c0 = curva(filas, "num", G0), c1 = curva(filas, "den", G1);
      const marcas = [enCorte(c0, v.corte), enCorte(c1, v.corte)];
      const lugar = v.region === "todas" ? "Todo el país" : `Región ${v.region}`;
      const g = globo({
        donde: (d) => (d.n === 0 ? "Ningún municipio" : d.n === 1 ? `El municipio con más ${d.grupo === G0 ? "personas que cumplen" : "población"}` : `Los ${entero(d.n)} municipios con más ${d.grupo === G0 ? "personas que cumplen" : "población"}`), cuando: v.anio,
        grupo: (d) => d.grupo, color: (d) => (d.grupo === G0 ? P.serie : P.comparacion),
        valor: (d) => d.y, formato: "pct",
        frase: (d) => (d.grupo === G0 ? "de quienes cumplen la condición vive en esos municipios" : "de la población vive en esos municipios"),
        personas: (d) => d.acum, universo: (d) => d.total, apellido: (d) => (d.grupo === G0 ? "que cumplen la condición" : UNIVERSO),
        comparacion: (d) => `Con un reparto parejo: ${pct(d.x)}`,
      });
      const orden = d3.sort(filas, (r) => -r.num);
      const totalNum = d3.sum(orden, (r) => r.num);
      let acum = 0;
      const tabla = orden.map((r) => { acum += r.num; return {...r, parteAcum: 100 * acum / totalNum}; });
      return {
        figura: {
          titulo: "Parte acumulada de quienes cumplen la condición, de los municipios con más a los de menos",
          subtitulo: `${lugar} · ${entero(filas.length)} municipios · ${v.anio} · puntos en el ${v.corte} % de los municipios`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada curva suma qué parte del total reúnen los municipios, empezando por el mayor. La diagonal es un reparto parejo.",
          cuerpo: [leyendaItems([{tipo: "linea", color: P.serie, texto: G0}, {tipo: "linea", color: P.comparacion, texto: G1}, {tipo: "punteada", color: P.regla, texto: "Reparto parejo"}]),
            concentracion([...c0, ...c1], {ancho, grupos: [G0, G1], corte: v.corte, marcas, rotuloX: "Porcentaje de los municipios, del mayor al menor", rotuloY: "Porcentaje acumulado del total", globo: g})],
        },
        tabla: {filas: tabla, columnas: [
          {titulo: "Municipio", valor: (d) => d.nombre, texto: true},
          {titulo: "Personas que cumplen", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Parte acumulada de quienes cumplen", valor: (d) => d.parteAcum, formato: "pct"},
          {titulo: "Población", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
