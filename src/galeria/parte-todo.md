---
title: Parte de un todo
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas para ver las <span class="clave">partes de un todo</span></h1>
  <p class="capitulo-entradilla">Cómo se reparte un total entre muchas partes, qué explica su cambio, qué tan satisfechas están las personas, qué combinaciones de carencias se acumulan, cómo se organiza una clasificación y hacia cuál de tres partes se mueve cada entidad. Todas las cifras son datos de muestra.</p>
</header>

<link rel="stylesheet" href="../formas-composicion.css">
<link rel="stylesheet" href="../formas-gD.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {panel, campo, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {categorias, significado, sentido, P} from "../components/paleta.js";
import {pct, entero, deCada, puntos, margen, pesos, numero} from "../components/formato.js";
import {treemap, barrasApiladas, mosaicoFracciones, ternario} from "../components/formas/index.js";
import {likert} from "../components/formas/likert.js";
import {cascada} from "../components/formas/cascada.js";
import {marimekko} from "../components/formas/marimekko.js";
import {combinaciones} from "../components/formas/combinaciones.js";
import {icicle} from "../components/formas/icicle.js";
import {arbolClasificacion} from "../components/formas/arbol-clasificacion.js";
import {REGIONES, ENTIDADES} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {leerIndicador, leerComposicion, UNIVERSO, VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerFraccionesEntidades, leerComposicionEntidades, MOTIVOS} from "../components/muestra-composicion.js";

const indicador = leerIndicador(await FileAttachment("../data/muestra/indicador.csv").csv());
const composicion = leerComposicion(await FileAttachment("../data/muestra/composicion.csv").csv());
// El color de identidad se reparte por ENTIDAD: la lista es fija y no
// depende de cuántas filas tenga cada grupo en la vista.
const CATEGORIAS = ["Categoría A", "Categoría B", "Categoría C", "Otras"];
const colorCategoria = categorias(CATEGORIAS);
const colorRegion = categorias(REGIONES);
// Significado del color en esta página: rojo, lo desfavorable (la
// insatisfacción con un servicio, lo que resta al ingreso de los hogares);
// azul, lo favorable (la satisfacción, lo que suma al ingreso); gris, la
// respuesta neutra o un cambio que no supera el margen de error. Las demás
// secciones usan identidad, el tono de tema o gris, nunca rojo ni azul.
const SIG = significado({rojo: "lo desfavorable", azul: "lo favorable", gris: "neutro o sin cambio claro", desfavorable: "baja"});
const mayuscula = (t) => String(t ?? "").replace(/^./, (c) => c.toUpperCase());
const aNumero = (x) => (x === "" || x == null ? null : +x);
// Alto que se reserva a cada sección antes de dibujarse, medido con los
// filtros por omisión en 390, 1366 y 1920 px. Cuanto más se acerca al alto
// final, menos tiene que compensar el anclaje de scroll cuando la sección se
// dibuja por encima de la vista (docs/scroll-bug.md, «Pendiente»).
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
```

```js
// Ingreso corriente trimestral promedio por hogar (scripts/muestra_gD.mjs),
// con la forma de la ENIGH, en pesos de 2024: una fila por grupo de hogares,
// edición, fuente y subfuente. Lo usan la cascada y el icicle.
const ingreso = (await FileAttachment("../data/muestra/gD_ingreso.csv").csv()).map((r) => ({
  grupo: r.grupo, anio: +r.anio, fuente: r.fuente, subfuente: r.subfuente, monto: +r.monto, ee: +r.ee, hogares: +r.hogares, casos: +r.casos,
}));
const GRUPOS_HOGAR = ["Todos los hogares", "Decil I", "Decil X"];
const textoGrupo = {"Todos los hogares": "Todos los hogares", "Decil I": "Hogares del decil I (el de menos ingreso)", "Decil X": "Hogares del decil X (el de más ingreso)"};
const FUENTES = ["Trabajo", "Transferencias", "Estimación del alquiler", "Renta de la propiedad", "Otros ingresos"];
```

<h2 id="composicion" class="toc-anchor">Cómo cambia la composición año con año</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "Nacional", opciones: [{valor: "Nacional", texto: "Todo el país"}, ...REGIONES]})]},
  ]});
  display(analisis({
    id: "composicion", numero: 1, titulo: "Cómo cambia la composición año con año", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([493, 401, 382]),
    explica: "Cada barra es un año y suma 100 %. Los tramos son las categorías en que se reparte el total de ese año. Si el tramo de la categoría A mide 40 %, de cada 100 personas, 40 están en esa categoría. Los tramos conservan su color y su orden en todos los años.",
    dibujar: ({v, ancho}) => {
      const filas = composicion.filter((r) => r.region === v.region);
      const g = globo({
        donde: () => (v.region === "Nacional" ? "Todo el país" : `Región ${v.region}`), cuando: (d) => d.anio,
        grupo: (d) => d.categoria, color: (d) => colorCategoria(d.categoria),
        valor: (d) => d.parte, formato: "pct",
        frase: "del total de personas de ese año",
        personas: (d) => d.personas, universo: (d) => d.total,
      });
      const totales = d3.rollup(filas, (f) => d3.sum(f, (r) => r.personas), (r) => r.anio);
      return {
        figura: {
          titulo: "Reparto del total por categoría, por año",
          subtitulo: `${v.region === "Nacional" ? "Todo el país" : `Región ${v.region}`} · 2000 - 2020`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es un año y suma 100 %; cada tramo es la parte del total que corresponde a una categoría.",
          cuerpo: barrasApiladas(filas, {ancho: Math.min(ancho, 980), fila: (d) => d.anio, categoria: (d) => d.categoria, valor: (d) => d.personas, categorias: CATEGORIAS, color: colorCategoria, globo: g}),
        },
        tabla: {filas, columnas: [
          {titulo: "Año", valor: (d) => d.anio, texto: true},
          {titulo: "Categoría", valor: (d) => d.categoria, texto: true},
          {titulo: "Personas", valor: (d) => d.personas, formato: "conteo"},
          {titulo: "Parte del año", valor: (d) => 100 * d.personas / totales.get(d.anio), formato: "pct"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="cascada" class="toc-anchor">De dónde salió el cambio en el ingreso de los hogares</h2>

```js
{
  const TRAMOS = [{valor: "2022-2024", texto: "De 2022 a 2024"}, {valor: "2020-2022", texto: "De 2020 a 2022"}, {valor: "2018-2020", texto: "De 2018 a 2020"}];
  // Dominio FIJO del índice (el primer año vale 100). Medido sobre todos los
  // grupos y tramos de la muestra: el acumulado va de 95.1 a 113.0.
  const DOMINIO_CASCADA = [90, 120];
  // Signo según lo que se ESCRIBE: un cambio que redondea a cero no lleva
  // signo (nunca «−0.0»).
  const conSigno = (x, f) => { const t = f(Math.abs(x)); return `${/[1-9]/.test(t) ? (x < 0 ? "−" : "+") : ""}${t}`; };
  const filtros = panel({grupos: [
    {leyenda: "Qué hogares y entre qué años", campos: [
      campo({id: "grupo", rotulo: "Hogares", inicial: "Todos los hogares", opciones: GRUPOS_HOGAR.map((x) => ({valor: x, texto: x === "Todos los hogares" ? x : `${x} de ingreso`}))}),
      campo({id: "tramo", rotulo: "Entre qué ediciones", inicial: "2022-2024", opciones: TRAMOS}),
    ]},
  ]});
  display(analisis({
    id: "cascada", numero: 2, titulo: "De dónde salió el cambio en el ingreso de los hogares", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA, alto: reservar([701, 471, 452]),
    explica: ["El primer renglón es el ingreso promedio por hogar del primer año y vale 100. Cada renglón de abajo es una fuente de ingreso: su barra arranca donde terminó la anterior y avanza lo que esa fuente sumó (azul) o retrocede lo que restó (rojo). El último renglón es el ingreso del segundo año. Si el trabajo pasó de 50,000 a 55,000 pesos en hogares que ganaban 70,000, su barra mide +7.1, porque 5,000 es 7.1 % de 70,000.",
      "Los montos están en pesos de 2024, así que el cambio no es inflación. El eje empieza en 90 para que se vean las fuentes chicas, y por eso los dos totales van como rayas y no como barras. Una fuente cuyo cambio no supera el margen de error va en gris."],
    dibujar: ({v, ancho}) => {
      const [a, b] = v.tramo.split("-").map(Number);
      const porFuente = (anio) => d3.rollup(ingreso.filter((r) => r.grupo === v.grupo && r.anio === anio),
        (f) => ({monto: d3.sum(f, (r) => r.monto), ee: Math.hypot(...f.map((r) => r.ee)), casos: f[0].casos, hogares: f[0].hogares}), (r) => r.fuente);
      const A = porFuente(a), B = porFuente(b);
      const totalA = d3.sum(A.values(), (x) => x.monto), totalB = d3.sum(B.values(), (x) => x.monto);
      const pasos = FUENTES.map((f) => {
        const x = A.get(f), y = B.get(f);
        return {etiqueta: f, cambio: 100 * (y.monto - x.monto) / totalA, a: x.monto, b: y.monto, eeA: x.ee, eeB: y.ee, s: sentido(x.monto, y.monto, {eeA: x.ee, eeB: y.ee}), casos: y.casos};
      });
      const inicio = {etiqueta: `Ingreso de ${a}`, valor: 100, monto: totalA, casos: [...A.values()][0].casos};
      const fin = {etiqueta: `Ingreso de ${b}`, valor: 100 * totalB / totalA, monto: totalB, casos: [...B.values()][0].casos};
      const g = globo({
        donde: v.grupo, cuando: (d) => (d._tipo === "total" ? d.etiqueta.slice(-4) : `${a} a ${b}`), grupo: (d) => (d._tipo === "paso" ? d.etiqueta : null),
        color: (d) => (d._tipo === "paso" ? SIG.color(d.s) : P.tinta2),
        valor: (d) => (d._tipo === "paso" ? d.b - d.a : d.monto), formato: (x, d) => (d._tipo === "paso" ? conSigno(x, pesos) : pesos(x)),
        frase: (d) => (d._tipo === "paso" ? "de cambio en el ingreso trimestral promedio por hogar que viene de esta fuente, en pesos de 2024" : "de ingreso corriente trimestral promedio por hogar, en pesos de 2024"),
        comparacion: (d) => (d._tipo === "paso" ? `En el índice, ${conSigno(d.cambio, (x) => numero(x, 1))} (${a} = 100)` : `En el índice, ${numero(d.valor, 1)} (${a} = 100)`),
        precision: (d) => ({casos: d.casos}),
      });
      const presentes = new Set(pasos.map((p) => p.s));
      const leyenda = [["sube", "Suma al ingreso"], ["baja", "Resta al ingreso"], ["igual", "Sin cambio claro"]].filter(([s]) => presentes.has(s))
        .map(([s, texto]) => ({tipo: "cuadro", color: SIG.color(s), texto}));
      return {
        figura: {
          titulo: "Cambio en el ingreso trimestral promedio por hogar, por fuente",
          subtitulo: `${textoGrupo[v.grupo]} · de ${a} a ${b} · pesos de 2024 · índice, ${a} = 100`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es lo que una fuente sumó o restó al ingreso promedio por hogar, en un índice donde el primer año vale 100.",
          cuerpo: cascada(pasos, {ancho, inicio, fin, color: (d) => SIG.color(d.s), dominio: DOMINIO_CASCADA, rotuloEje: `Índice, ingreso de ${a} = 100`,
            formatoTotal: (x) => numero(x, 1), formatoCambio: (x) => conSigno(x, (y) => numero(y, 1)), leyenda, globo: g}),
        },
        tabla: {filas: [{...inicio, _total: true}, ...pasos, {...fin, _total: true}], columnas: [
          {titulo: "Renglón", valor: (d) => d.etiqueta, texto: true},
          {titulo: `${a}, pesos`, valor: (d) => (d._total ? (d.etiqueta.endsWith(String(a)) ? d.monto : null) : d.a), formato: "pesos"},
          {titulo: `${b}, pesos`, valor: (d) => (d._total ? (d.etiqueta.endsWith(String(b)) ? d.monto : null) : d.b), formato: "pesos"},
          {titulo: "Cambio, pesos", valor: (d) => (d._total ? null : d.b - d.a), formato: (x) => (x == null ? "" : conSigno(x, pesos))},
          {titulo: "Índice", valor: (d) => (d._total ? d.valor : d.cambio), formato: (x, d) => (d._total ? numero(x, 1) : conSigno(x, (y) => numero(y, 1)))},
          {titulo: "Margen del cambio (95 %)", valor: (d) => (d._total ? null : Math.hypot(d.eeA, d.eeB)), formato: (x) => (x == null ? "" : `± ${pesos(1.96 * x)}`)},
          {titulo: "Lectura", valor: (d) => (d._total ? null : {sube: "Suma al ingreso", baja: "Resta al ingreso", igual: "Sin cambio claro"}[d.s]), texto: true},
          {titulo: "Hogares en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="likert" class="toc-anchor">Satisfacción con ocho servicios públicos</h2>

```js
{
  const satisfaccion = (await FileAttachment("../data/muestra/gD_satisfaccion.csv").csv()).map((r) => ({
    anio: +r.anio, ambito: r.ambito, servicio: r.servicio, respuesta: r.respuesta, orden: +r.orden, num: +r.num, den: +r.den, pct: +r.pct, ee: +r.ee, casos: +r.casos,
  }));
  const RESPUESTAS = ["Muy insatisfecho", "Insatisfecho", "Ni satisfecho ni insatisfecho", "Satisfecho", "Muy satisfecho"];
  const FEMENINO = {"Muy insatisfecho": "muy insatisfecha", "Insatisfecho": "insatisfecha", "Ni satisfecho ni insatisfecho": "ni satisfecha ni insatisfecha", "Satisfecho": "satisfecha", "Muy satisfecho": "muy satisfecha"};
  const UNIVERSO_SERVICIOS = "de 18 años y más en ciudades de 100 mil habitantes y más";
  const AMBITOS = ["Todo el país", ...REGIONES];
  const textoAmbito = (x) => (x === "Todo el país" ? x : `Región ${x}`);
  const filtros = panel({grupos: [
    {leyenda: "Dónde y cuándo", campos: [
      campo({id: "ambito", rotulo: "Región", inicial: "Todo el país", opciones: AMBITOS.map((x) => ({valor: x, texto: textoAmbito(x)}))}),
      campo({id: "anio", rotulo: "Año", inicial: 2023, opciones: conDato(satisfaccion, "anio").sort((x, y) => y - x)}),
    ]},
    {leyenda: "En qué orden", campos: [campo({id: "orden", rotulo: "Orden de los servicios", inicial: "satisfechas", opciones: [{valor: "satisfechas", texto: "De más a menos satisfacción"}, {valor: "insatisfechas", texto: "De más a menos insatisfacción"}]})]},
  ]});
  display(analisis({
    id: "likert", numero: 3, titulo: "Satisfacción con ocho servicios públicos", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([823, 542, 521]),
    explica: "Cada barra es un servicio y reparte a las personas entre cinco respuestas, de muy insatisfechas a muy satisfechas. Lo insatisfecho va a la izquierda de la raya del centro, en rojo, y lo satisfecho a la derecha, en azul. La respuesta neutra se parte a la mitad sobre la raya. La cifra de cada punta suma su lado: si a la derecha dice 68 %, de cada 100 personas, 68 están satisfechas o muy satisfechas con ese servicio.",
    dibujar: ({v, ancho}) => {
      const filas = satisfaccion.filter((r) => r.ambito === v.ambito && r.anio === v.anio);
      const colores = [P.divergente[1], P.divergente[3], P.divergente[4], P.divergente[5], P.divergente[7]];
      const satisfechas = d3.rollup(filas, (f) => d3.sum(f.filter((r) => r.orden >= 3), (r) => r.pct), (r) => r.servicio);
      const g = globo({
        donde: textoAmbito(v.ambito), cuando: v.anio, grupo: (d) => d.respuesta, color: (d) => (d.orden < 2 ? P.rojo : d.orden > 2 ? P.azul : P.gris),
        valor: (d) => d.pct, formato: "pct", frase: (d) => `de la población ${UNIVERSO_SERVICIOS} se declara ${FEMENINO[d.respuesta]} con el servicio de ${d.servicio.toLowerCase()}`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: "de 18 años y más",
        comparacion: (d) => `Satisfechas en total con ese servicio: ${pct(satisfechas.get(d.servicio))}`,
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const orden = v.orden === "satisfechas" ? (x, y) => y.positivo - x.positivo : (x, y) => y.negativo - x.negativo;
      return {
        figura: {
          titulo: "Satisfacción con cada servicio público, en cinco respuestas",
          subtitulo: `Población ${UNIVERSO_SERVICIOS} · ${textoAmbito(v.ambito)} · ${v.anio} · ${v.orden === "satisfechas" ? "de más a menos satisfacción" : "de más a menos insatisfacción"}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra reparte a las personas entre cinco respuestas, con lo insatisfecho a la izquierda del centro y lo satisfecho a la derecha.",
          cuerpo: likert(filas, {ancho, fila: (d) => d.servicio, respuesta: (d) => d.respuesta, valor: (d) => d.pct, respuestas: RESPUESTAS, colores, orden,
            textoNegativo: "Insatisfechas", textoPositivo: "Satisfechas", globo: g}),
        },
        tabla: {filas: [...filas].sort((x, y) => x.servicio.localeCompare(y.servicio) || x.orden - y.orden), columnas: [
          {titulo: "Servicio", valor: (d) => d.servicio, texto: true},
          {titulo: "Respuesta", valor: (d) => d.respuesta, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Personas", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población de 18 años y más", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="reparto" class="toc-anchor">Dónde viven quienes cumplen la condición</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y cuándo", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(indicador, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "reparto", numero: 4, titulo: "Dónde viven quienes cumplen la condición", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([588, 617, 676]),
    explica: "Cada rectángulo es una entidad y su tamaño es el número de personas que cumplen la condición. El color dice a qué región pertenece; la cuarta región va en gris porque con más de tres tonos dejan de distinguirse. Si una entidad ocupa la décima parte del cuadro, ahí vive 10 % de quienes cumplen.",
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter((r) => r.anio === v.anio && r.sexo === v.sexo);
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.anio, grupo: (d) => `Región ${d.region}`, color: (d) => colorRegion(d.region),
        valor: (d) => 100 * d.num / d.total, formato: "pct",
        frase: "de todas las personas del país que cumplen la condición",
        personas: (d) => d.num, universo: (d) => d.total, apellido: "que cumplen la condición",
        comparacion: (d) => `De su región: ${pct(100 * d.num / d.totalGrupo)}`,
      });
      const total = d3.sum(filas, (r) => r.num);
      return {
        figura: {
          titulo: "Personas que cumplen la condición, por entidad y región",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ${UNIVERSO} · ${v.anio} · ${entero(total)} personas en total`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada rectángulo es una entidad, su tamaño es el número de personas que cumplen la condición y su color es la región.",
          notas: [filas.length < 32 ? `En ${v.anio} hay ${32 - filas.length} entidades sin dato, que no se dibujan.` : null],
          cuerpo: treemap(filas, {ancho, grupo: (d) => d.region, parte: (d) => d.entidad, valor: (d) => d.num, grupos: REGIONES, color: colorRegion, globo: g}),
        },
        tabla: {filas: [...filas].sort((a, b) => b.num - a.num), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Región", valor: (d) => d.region, texto: true},
          {titulo: "Personas que cumplen", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Parte del país", valor: (d) => 100 * d.num / total, formato: "pct"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="combinaciones" class="toc-anchor">Hogares según las carencias que reúnen</h2>

```js
{
  const carencias = (await FileAttachment("../data/muestra/gD_carencias.csv").csv()).map((r) => ({
    anio: +r.anio, localidad: r.localidad, sinInternet: r.sin_internet === "1", hacinamiento: r.hacinamiento === "1", rezago: r.rezago === "1",
    numero: +r.numero, num: +r.num, den: +r.den, pct: +r.pct, ee: +r.ee, casos: +r.casos,
  }));
  const CARENCIAS = ["Sin internet", "Hacinamiento", "Rezago educativo"];
  const tiene = (d, c) => (c === "Sin internet" ? d.sinInternet : c === "Hacinamiento" ? d.hacinamiento : d.rezago);
  const nombre = (d) => { const l = CARENCIAS.filter((c) => tiene(d, c)); return l.length ? l.join(" + ") : "Ninguna de las tres"; };
  // Tope FIJO de las barras: en la muestra la combinación más frecuente
  // («ninguna») va de 15.5 % en lo rural a 59.9 % en lo urbano.
  const TOPE = 60;
  const filtros = panel({grupos: [
    {leyenda: "Dónde y cuándo", campos: [
      campo({id: "localidad", rotulo: "Localidades", inicial: "Todas las localidades", opciones: conDato(carencias, "localidad")}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(carencias, "anio").sort((a, b) => b - a)}),
    ]},
    {leyenda: "En qué orden", campos: [campo({id: "orden", rotulo: "Orden de los renglones", inicial: "frecuencia", opciones: [{valor: "frecuencia", texto: "De la más a la menos frecuente"}, {valor: "numero", texto: "Por número de carencias"}]})]},
  ]});
  display(analisis({
    id: "combinaciones", numero: 5, titulo: "Hogares según las carencias que reúnen", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([638, 531, 531]),
    explica: "Cada renglón es una combinación exacta de tres carencias: no tener internet, vivir con hacinamiento y que la persona de referencia tenga rezago educativo. Los puntos llenos de la izquierda dicen cuáles reúne esa combinación y la barra dice qué parte de los hogares la tiene. Cada hogar está en un solo renglón, así que los ocho suman 100 %. Si el renglón con internet y hacinamiento marca 4 %, de cada 100 hogares, 4 tienen esas dos carencias y no la tercera.",
    dibujar: ({v, ancho}) => {
      const filas = carencias.filter((r) => r.localidad === v.localidad && r.anio === v.anio);
      const g = globo({
        donde: v.localidad, cuando: v.anio, grupo: nombre, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct", frase: "de los hogares reúne exactamente esta combinación de carencias",
        personas: (d) => d.num, universo: (d) => d.den, unidad: "hogares",
        comparacion: (d) => (d.numero ? `Reúne ${d.numero} de las tres carencias` : "No reúne ninguna de las tres"),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const orden = v.orden === "numero" ? (a, b) => a.numero - b.numero || b.pct - a.pct : (a, b) => b.pct - a.pct;
      return {
        figura: {
          titulo: "Hogares por combinación de carencias",
          subtitulo: `Hogares · ${v.localidad.toLowerCase().replace(/^./, (c) => c.toUpperCase())} · ${v.anio} · ${v.orden === "numero" ? "de menos a más carencias" : "de la combinación más a la menos frecuente"}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada renglón es una combinación exacta de carencias, los puntos llenos dicen cuáles reúne y la barra, qué parte de los hogares la tiene.",
          cuerpo: combinaciones(filas, {ancho, condiciones: CARENCIAS, tiene, valor: (d) => d.pct, orden, nombre, tope: TOPE, globo: g}),
        },
        tabla: {filas: [...filas].sort(orden), columnas: [
          {titulo: "Combinación", valor: nombre, texto: true},
          {titulo: "Carencias", valor: (d) => d.numero, formato: "conteo"},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Hogares", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Hogares en total", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="marimekko" class="toc-anchor">Personas ocupadas por sector y formalidad del empleo</h2>

```js
{
  const ocupados = (await FileAttachment("../data/muestra/gD_ocupados.csv").csv()).map((r) => ({
    periodo: r.periodo, sexo: r.sexo, sector: r.sector, condicion: r.condicion, num: +r.num, den: +r.den, pct: +r.pct, ee: +r.ee, casos: +r.casos,
  }));
  const PARTES = ["Empleo informal", "Empleo formal"];
  const parte = (d) => `Empleo ${d.condicion.toLowerCase()}`;
  const color = (p) => (p === "Empleo informal" ? P.serie : P.apagado);
  const filtros = panel({grupos: [
    {leyenda: "Cuándo y entre quiénes", campos: [
      campo({id: "periodo", rotulo: "Trimestre", inicial: "2024-T4", opciones: conDato(ocupados, "periodo").sort().reverse()}),
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
    ]},
  ]});
  display(analisis({
    id: "marimekko", numero: 6, titulo: "Personas ocupadas por sector y formalidad del empleo", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([792, 670, 630]),
    explica: "Cada renglón es un sector de actividad. Su alto es su tamaño: un renglón que ocupa la cuarta parte del alto reúne a la cuarta parte de las personas ocupadas. A lo ancho, cada renglón suma 100 % y se parte entre empleo informal, en color, y formal, en gris. Si en el comercio el tramo informal mide 60 %, de cada 100 personas que trabajan en el comercio, 60 tienen un empleo informal.",
    dibujar: ({v, ancho}) => {
      const filas = ocupados.filter((r) => r.periodo === v.periodo && r.sexo === v.sexo);
      const unidad = v.sexo === "Total" ? "personas" : v.sexo.toLowerCase();
      const g = globo({
        donde: (d) => d.sector, cuando: v.periodo, grupo: (d) => d._nombreParte, color: (d) => (d.condicion === "Informal" ? P.tonoTexto : P.tinta2),
        valor: (d) => d._parte, formato: "pct", frase: (d) => `de las ${unidad} ocupadas en el sector tiene un empleo ${d.condicion.toLowerCase()}`,
        personas: (d) => d.num, universo: (d) => d.den, unidad, apellido: "ocupadas en el sector",
        comparacion: (d) => `El sector reúne ${pct(d._grupoParte)} de las ${unidad} ocupadas`,
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const dibujo = marimekko(filas, {ancho, grupo: (d) => d.sector, parte, valor: (d) => d.num, partes: PARTES, color, globo: g});
      const informal = filas.filter((r) => r.condicion === "Informal");
      return {
        figura: {
          titulo: "Personas ocupadas por sector, según la formalidad de su empleo",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} ocupados · ${v.periodo} · el alto de cada renglón es el tamaño del sector · ${entero(dibujo.total ?? 0)} ${unidad} en total`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada renglón es un sector con un alto proporcional a su tamaño, partido entre empleo informal y formal.",
          cuerpo: dibujo,
        },
        tabla: {filas: [...informal].sort((a, b) => b.den - a.den), columnas: [
          {titulo: "Sector", valor: (d) => d.sector, texto: true},
          {titulo: "Personas ocupadas", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Parte de todas las ocupadas", valor: (d) => 100 * d.den / dibujo.total, formato: "pct"},
          {titulo: "Empleo informal", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Personas con empleo informal", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="arbol-clasificacion" class="toc-anchor">Hablantes por familia y agrupación lingüística</h2>

```js
{
  const lenguas = (await FileAttachment("../data/muestra/gD_lenguas.csv").csv()).map((r) => ({anio: +r.anio, familia: r.familia, agrupacion: r.agrupacion, hablantes: +r.hablantes}));
  // Orden FIJO de las familias: de más a menos hablantes en 2020.
  const FAMILIAS = d3.rollups(lenguas.filter((r) => r.anio === 2020), (f) => d3.sum(f, (r) => r.hablantes), (r) => r.familia).sort((a, b) => b[1] - a[1]).map(([f]) => f);
  // Tamaño FIJO del punto: el más grande corresponde a 1.7 millones (la
  // agrupación con más hablantes de la muestra tiene 1.65 millones).
  const TOPE = 1.7e6;
  const filtros = panel({grupos: [
    {leyenda: "Cuándo y qué familias", campos: [
      campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: conDato(lenguas, "anio").sort((a, b) => b - a)}),
      campo({id: "familias", rotulo: "Familias", inicial: "tres", opciones: [{valor: "tres", texto: "Las tres con más hablantes"}, {valor: "todas", texto: `Las ${FAMILIAS.length} del ejemplo`}]}),
    ]},
  ]});
  display(analisis({
    id: "arbol-clasificacion", numero: 7, titulo: "Hablantes por familia y agrupación lingüística", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([870, 730, 690]),
    explica: "El árbol se lee de izquierda a derecha: de todas las lenguas del ejemplo salen las familias lingüísticas, y de cada familia, sus agrupaciones. Cada punto de la derecha es una agrupación y su área es su número de hablantes, en la misma escala para todas. Si un punto tiene el doble de área que otro, su lengua tiene el doble de hablantes. La cifra junto al nombre es el número exacto.",
    dibujar: ({v, ancho}) => {
      const elegidas = v.familias === "tres" ? FAMILIAS.slice(0, 3) : FAMILIAS;
      const filas = lenguas.filter((r) => r.anio === v.anio && elegidas.includes(r.familia));
      const total = d3.sum(filas, (r) => r.hablantes);
      const porFamilia = d3.rollup(filas, (f) => d3.sum(f, (r) => r.hablantes), (r) => r.familia);
      const g = globo({
        donde: (d) => (d._nivel === 2 ? d.agrupacion : d._nombre), cuando: v.anio,
        grupo: (d) => (d._nivel === 2 ? `Familia ${d.familia}` : `${d._hojas} agrupaciones en el ejemplo`), color: () => P.tonoTexto,
        valor: (d) => d._valor, formato: "conteo",
        frase: (d) => (d._nivel === 2 ? "personas de 3 años y más hablan esta lengua" : d._nivel === 1 ? "personas de 3 años y más hablan una lengua de esta familia" : "personas de 3 años y más hablan una de estas lenguas"),
        comparacion: (d) => (d._nivel === 2 ? `${pct(100 * d._valor / porFamilia.get(d.familia))} de los hablantes de su familia` : d._nivel === 1 ? `${pct(100 * d._valor / total)} de los hablantes del ejemplo` : null),
      });
      return {
        figura: {
          titulo: "Hablantes de cada agrupación lingüística, por familia",
          subtitulo: `Población de 3 años y más · ${v.anio} · ${v.familias === "tres" ? "las tres familias con más hablantes" : `las ${FAMILIAS.length} familias del ejemplo`} · el área del punto es el número de hablantes`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada rama une una agrupación lingüística con su familia, y el área de cada punto es su número de hablantes.",
          cuerpo: arbolClasificacion(filas, {ancho, rama: (d) => d.familia, hoja: (d) => d.agrupacion, valor: (d) => d.hablantes, raiz: "Lenguas del ejemplo", tope: TOPE,
            ordenRamas: FAMILIAS, globo: g}),
        },
        tabla: {filas: [...filas].sort((a, b) => FAMILIAS.indexOf(a.familia) - FAMILIAS.indexOf(b.familia) || b.hablantes - a.hablantes), columnas: [
          {titulo: "Familia", valor: (d) => d.familia, texto: true},
          {titulo: "Agrupación", valor: (d) => d.agrupacion, texto: true},
          {titulo: "Hablantes de 3 años y más", valor: (d) => d.hablantes, formato: "conteo"},
          {titulo: "Parte de su familia", valor: (d) => 100 * d.hablantes / porFamilia.get(d.familia), formato: "pct"},
          {titulo: "Parte del ejemplo", valor: (d) => 100 * d.hablantes / total, formato: "pct"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="icicle" class="toc-anchor">De qué fuentes viene el ingreso de los hogares</h2>

```js
{
  const colorFuente = categorias(FUENTES);
  const filtros = panel({grupos: [
    {leyenda: "Qué hogares y cuándo", campos: [
      campo({id: "grupo", rotulo: "Hogares", inicial: "Todos los hogares", opciones: GRUPOS_HOGAR.map((x) => ({valor: x, texto: x === "Todos los hogares" ? x : `${x} de ingreso`}))}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: conDato(ingreso, "anio").sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "icicle", numero: 8, titulo: "De qué fuentes viene el ingreso de los hogares", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([808, 615, 596]),
    explica: "La columna de la izquierda reparte el ingreso de los hogares entre sus fuentes y la de la derecha parte cada fuente en sus componentes, junto a ella. El alto de cada bloque es su parte del ingreso total. Si el bloque del trabajo subordinado ocupa la mitad del alto, la mitad del ingreso de esos hogares viene de un sueldo. El color solo identifica la fuente, y las fuentes chicas van juntas en gris.",
    dibujar: ({v, ancho}) => {
      const filas = ingreso.filter((r) => r.grupo === v.grupo && r.anio === v.anio);
      const total = d3.sum(filas, (r) => r.monto);
      const g = globo({
        donde: v.grupo, cuando: v.anio, grupo: (d) => d._rama, color: (d) => colorFuente(d._rama),
        valor: (d) => d._parteTotal, formato: "pct",
        frase: (d) => (d._nivel === 1 ? "del ingreso corriente de estos hogares viene de esta fuente" : `del ingreso corriente de estos hogares viene de ${d._nombre.toLowerCase()}`),
        comparacion: (d) => `${pesos(d._valor)} por hogar al trimestre, en pesos de 2024`,
        precision: (d) => (d.casos ? {casos: d.casos} : null),
      });
      return {
        figura: {
          titulo: "Ingreso corriente de los hogares por fuente y componente",
          subtitulo: `${textoGrupo[v.grupo]} · ${v.anio} · ${pesos(total)} por hogar al trimestre, en pesos de 2024`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · a la izquierda, cada fuente del ingreso, y a la derecha, sus componentes. El alto de cada bloque es su parte del ingreso total.",
          cuerpo: icicle(filas, {ancho, rama: (d) => d.fuente, parte: (d) => d.subfuente, valor: (d) => d.monto, ramas: FUENTES, color: colorFuente, globo: g}),
        },
        tabla: {filas: [...filas].sort((a, b) => FUENTES.indexOf(a.fuente) - FUENTES.indexOf(b.fuente) || b.monto - a.monto), columnas: [
          {titulo: "Fuente", valor: (d) => d.fuente, texto: true},
          {titulo: "Componente", valor: (d) => d.subfuente, texto: true},
          {titulo: "Pesos por hogar al trimestre", valor: (d) => d.monto, formato: "pesos"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => `± ${pesos(1.96 * x)}`},
          {titulo: "Parte del ingreso", valor: (d) => 100 * d.monto / total, formato: "pct"},
          {titulo: "Parte de su fuente", valor: (d) => 100 * d.monto / d3.sum(filas.filter((r) => r.fuente === d.fuente), (r) => r.monto), formato: "pct"},
          {titulo: "Hogares en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="fracciones" class="toc-anchor">De cada cien personas, cuántas cumplen en cada entidad</h2>

```js
{
  const fracciones = leerFraccionesEntidades(await FileAttachment("../data/muestra/fracciones_entidades.csv").csv());
  const filtros = panel({grupos: [
    {leyenda: "Qué se mide y dónde", campos: [
      campo({id: "condicion", rotulo: "Condición", inicial: "Condición frecuente", opciones: conDato(fracciones, "condicion")}),
      campo({id: "entidad", rotulo: "Entidad destacada", inicial: "ninguna", opciones: [{valor: "ninguna", texto: "Ninguna"}, ...ENTIDADES.map((e) => ({valor: e.cve, texto: e.nombre}))]}),
    ]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2020, opciones: (v) => conDato(fracciones, "anio", (r) => r.condicion === v.condicion).sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "fracciones", numero: 9, titulo: "De cada cien personas, cuántas cumplen en cada entidad", panel: filtros, metodo: "m-unidades", verifica: VERIFICA_MUESTRA, alto: reservar([945, 712, 768]),
    explica: ["Cada cuadro es una entidad, acomodada como en el mapa del país, y dentro lleva cien puntos, uno por cada cien personas. Los puntos en color son las que cumplen la condición y la cifra de arriba dice cuántas son: si hay 36 puntos en color, 36 de cada 100 personas de esa entidad cumplen.",
      "Todas las entidades usan la misma base. Cuando en alguna cumple menos de 1 de cada 100, todos los cuadros pasan a mil unidades y la cifra se lee «de cada 1,000»: 0.42 % se escribe 4 de cada 1,000. La cifra se redondea a enteros; el porcentaje exacto está en el globo y en la tabla. En un teléfono los cuadros se ordenan de mayor a menor."],
    dibujar: ({v, ancho}) => {
      const filas = fracciones.filter((r) => r.condicion === v.condicion && r.anio === v.anio);
      const valores = new Map(filas.map((r) => [r.cve, r]));
      const g = globo({
        donde: (d) => d.entidad, cuando: v.anio, grupo: v.condicion, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: (x, d) => deCada(x, d.base),
        frase: `personas ${UNIVERSO} cumplen la condición`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
        comparacion: (d) => `Porcentaje exacto: ${pct(d.pct)}`,
        precision: (d) => ({valor: d.pct, casos: d.casos}),
      });
      const dibujo = mosaicoFracciones(valores, {ancho: Math.min(ancho, 980), valor: (d) => d.pct, destacar: v.entidad, rotulos: {cumple: "Cumplen la condición", resto: "No la cumplen"},
        frase: (d, k, B, prefijo) => `${prefijo}${d.entidad}: ${deCada(d.pct, B)} personas cumplen la condición`, globo: g});
      const B = dibujo.base, nombre = ENTIDADES.find((e) => e.cve === v.entidad)?.nombre;
      return {
        figura: {
          titulo: `Personas que cumplen la condición de cada ${entero(B)}, por entidad`,
          subtitulo: `${v.condicion} · población ${UNIVERSO} · ${v.anio} · de cada ${entero(B)}${nombre ? ` · se destaca ${nombre}` : ""}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada cuadro es una entidad con ${entero(B)} ${B === 100 ? "puntos; los" : "unidades; las"} que van en color son las personas de cada ${entero(B)} que cumplen la condición.`,
          notas: [B > 100 ? `En alguna entidad cumple menos de 1 de cada 100 personas, así que todos los cuadros cuentan sobre ${entero(B)}.` : null],
          cuerpo: dibujo,
        },
        tabla: {filas: [...filas].sort((a, b) => b.pct - a.pct), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: `De cada ${entero(B)}`, valor: (d) => d.pct, formato: (x) => deCada(x, B)},
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

<h2 id="ternario" class="toc-anchor">Hacia cuál de tres motivos se movió cada entidad, 2015 - 2025</h2>

```js
{
  const composicionEnt = leerComposicionEntidades(await FileAttachment("../data/muestra/composicion_entidades.csv").csv());
  const colorMotivo = categorias(MOTIVOS);
  const CORTES = [...new Set(composicionEnt.map((r) => r.corte))].sort((a, b) => a - b);
  const PAIS = "Todo el país";
  // Una fila por unidad y corte con las personas de cada motivo. Mujeres y
  // hombres se suman para «Total»; el país es la suma de las entidades.
  const pivote = (filtro) => d3.rollups(composicionEnt.filter(filtro), (f) => ({
    entidad: f[0].entidad, cve: f[0].cve, corte: f[0].corte, partes: MOTIVOS.map((m) => d3.sum(f, (r) => (r.motivo === m ? r.personas : 0))), casos: d3.sum(f, (r) => r.casos),
  }), (r) => r.cve, (r) => r.corte).flatMap(([, c]) => c.map(([, x]) => x));
  const porSexo = new Map(["Total", "Mujeres", "Hombres"].map((s) => {
    const ent = pivote((r) => s === "Total" || r.sexo === s);
    const pais = CORTES.map((corte) => { const f = ent.filter((x) => x.corte === corte); return {entidad: PAIS, cve: "00", corte, partes: MOTIVOS.map((_, k) => d3.sum(f, (x) => x.partes[k])), casos: d3.sum(f, (x) => x.casos)}; });
    return [s, [...ent, ...pais]];
  }));
  // Tamaño FIJO del punto: la entidad con más personas en un corte, con mujeres y hombres.
  const TAMANO_MAXIMO = d3.max(porSexo.get("Total").filter((x) => x.cve !== "00"), (x) => d3.sum(x.partes));
  const filtros = panel({grupos: [
    {leyenda: "Qué se destaca y entre quiénes", campos: [
      campo({id: "destacada", rotulo: "Unidad destacada", inicial: PAIS, opciones: [{valor: PAIS, texto: PAIS}, ...REGIONES.map((region) => ({grupo: region, opciones: ENTIDADES.filter((e) => e.region === region).map((e) => ({valor: e.nombre, texto: e.nombre}))}))]}),
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
    ]},
    {leyenda: "Cuándo", campos: [campo({id: "desde", rotulo: "Estela, desde", inicial: CORTES[0], opciones: CORTES.slice(0, -1)})]},
  ]});
  display(analisis({
    id: "ternario", numero: 10, titulo: "Hacia cuál de tres motivos se movió cada entidad, 2015 - 2025", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([802, 871, 851]),
    explica: ["Cada punto es una entidad y su lugar dentro del triángulo es su reparto entre los tres motivos: cada vértice es el 100 % de un motivo, y cuanto más cerca de un vértice, más pesa ese motivo. Un punto en el centro tiene un tercio de cada uno. Las rayas punteadas marcan 25, 50 y 75 % de cada motivo.",
      "La estela une la posición de la entidad en los cortes anteriores con la de 2025, así que dice hacia qué motivo se movió. Si una entidad pasó de 30 % a 45 % del motivo A, su estela apunta hacia ese vértice. La unidad destacada va en tinta, con sus años rotulados; un clic en otro punto la destaca. El tamaño del punto es su número de personas."],
    dibujar: ({v, ancho}) => {
      const desde = CORTES.indexOf(+v.desde);
      const filas = porSexo.get(v.sexo).filter((x) => CORTES.indexOf(x.corte) >= desde);
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.corte, grupo: (d) => `Motivo más frecuente: ${MOTIVOS[d._mayor].replace("Motivo ", "")}`, color: (d) => colorMotivo(MOTIVOS[d._mayor]),
        valor: (d) => d._partes[d._mayor], formato: "pct",
        frase: (d) => `de quienes declararon un motivo señalan el ${MOTIVOS[d._mayor].toLowerCase()}`,
        personas: (d) => d.partes[d._mayor], universo: (d) => d._total, apellido: "que declararon un motivo",
        comparacion: (d) => MOTIVOS.map((m, k) => (k === d._mayor ? null : `${m}: ${pct(d._partes[k])}`)).filter(Boolean).join(" · "),
        precision: (d) => ({casos: d.casos}),
      });
      const parte = (x, k) => 100 * x.partes[k] / d3.sum(x.partes);
      const propias = filas.filter((x) => x.entidad === v.destacada).sort((a, b) => a.corte - b.corte);
      const primero = propias[0], ultimo = propias.at(-1);
      return {
        figura: {
          titulo: "Reparto de las personas entre tres motivos, por entidad",
          subtitulo: `${v.sexo === "Total" ? "Mujeres y hombres" : v.sexo} · las 32 entidades · estela de ${v.desde} a ${CORTES.at(-1)} · se destaca ${v.destacada === PAIS ? "todo el país" : v.destacada}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es una entidad, colocado según su reparto entre los tres motivos, y la estela une sus cortes anteriores con 2025.",
          notas: [primero && ultimo && primero !== ultimo ? `${v.destacada}: el motivo A pasó de ${pct(parte(primero, 0))} en ${primero.corte} a ${pct(parte(ultimo, 0))} en ${ultimo.corte}, ${puntos(parte(ultimo, 0) - parte(primero, 0))}.` : null],
          cuerpo: ternario(filas, {ancho: Math.min(ancho, 900), unidad: (d) => d.entidad, corte: (d) => d.corte, partes: (d) => d.partes, nombres: MOTIVOS, color: colorMotivo,
            destacada: v.destacada, tamano: (d) => (d.cve === "00" ? null : d3.sum(d.partes)), tamanoMax: TAMANO_MAXIMO,
            alElegir: (u) => filtros.fijar({destacada: u}), textoResto: "Las demás entidades (un clic destaca una)", globo: g}),
        },
        tabla: {filas: filas.filter((x) => x.corte === CORTES.at(-1)).sort((a, b) => (a.cve === "00") - (b.cve === "00") || a.entidad.localeCompare(b.entidad)), columnas: [
          {titulo: "Unidad", valor: (d) => d.entidad, texto: true},
          ...MOTIVOS.map((m, k) => ({titulo: `${m}, ${CORTES.at(-1)}`, valor: (d) => parte(d, k), formato: "pct"})),
          {titulo: `Motivo A, ${v.desde}`, valor: (d) => { const p = filas.find((x) => x.cve === d.cve && x.corte === +v.desde); return p ? parte(p, 0) : null; }, formato: "pct"},
          {titulo: "Personas que declararon un motivo", valor: (d) => d3.sum(d.partes), formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
