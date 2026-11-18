---
title: Tiempo
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas para ver el <span class="clave">tiempo</span></h1>
  <p class="capitulo-entradilla">Cómo evoluciona una serie larga, quién subió o bajó entre dos años, qué lugar ocupa cada quien, qué ediciones se pueden comparar y cómo se ve cada día, cada trimestre y cada entidad. Todas las cifras son datos de muestra.</p>
</header>

<link rel="stylesheet" href="../formas-flujo.css">
<link rel="stylesheet" href="../formas-composicion.css">
<link rel="stylesheet" href="../formas-gD.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {panel, campo, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {significado, sentido, rampaTema, rampaCambio, categorias, P} from "../components/paleta.js";
import {pct, pctEje, puntos, margen, deA, entero, numero, personas, cambioRelativo, SIN_DATO} from "../components/formato.js";
import {riel, mosaicoTriangulos, destacadas, areasSuperpuestas, leyendaItems} from "../components/formas/index.js";
import {leyendaContinua} from "../components/formas/comun.js";
import {lineas} from "../components/formas/lineas.js";
import {pendiente} from "../components/formas/pendiente.js";
import {bump} from "../components/formas/bump.js";
import {contexto} from "../components/formas/contexto.js";
import {calendario} from "../components/formas/calendario.js";
import {horizonte} from "../components/formas/horizonte.js";
import {franjasTiempo} from "../components/formas/franjas-tiempo.js";
import {cortesComparables} from "../components/formas/cortes-comparables.js";
import {mosaicoSeries} from "../components/formas/mosaico-series.js";
import {REGIONES, ENTIDADES} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {leerIndicador, tasa, UNIVERSO, VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerSeries} from "../components/muestra-flujos.js";
import {leerTrayectorias} from "../components/muestra-composicion.js";

const indicador = leerIndicador(await FileAttachment("../data/muestra/indicador.csv").csv());
const trayectorias = leerTrayectorias(await FileAttachment("../data/muestra/trayectorias.csv").csv());
const ANIOS = [...new Set(indicador.map((r) => r.anio))].sort((a, b) => a - b);
const CORTES = [...new Set(trayectorias.map((r) => r.corte))].sort((a, b) => a - b);
// Significado del color en las secciones del porcentaje que cumple la
// condición (pendiente, riel y mosaico partido): rojo, baja el porcentaje;
// azul, sube; gris, el cambio no supera el margen de error.
const SIG = significado({rojo: "baja el porcentaje", azul: "sube el porcentaje", gris: "sin cambio claro", desfavorable: "baja"});
// Dominios FIJOS, medidos sobre toda la muestra: los grupos del riel van de
// 7.6 % a 53.8 % y las entidades del indicador, de 2.3 % a 71.1 %.
const DOMINIO_RIEL = [0, 60];
const DOMINIO_NIVEL = [0, 75];
const lugarDe = (ambito) => (ambito === "Nacional" ? "Todo el país" : `Región ${ambito}`);
const quienes = (sexo) => (sexo === "Total" ? "Mujeres y hombres" : sexo);
const mayuscula = (t) => String(t ?? "").replace(/^./, (c) => c.toUpperCase());
// Alto que se reserva a cada sección antes de dibujarse, medido con los
// filtros por omisión en 390, 1366 y 1920 px. Cuanto más se acerca al alto
// final, menos tiene que compensar el anclaje de scroll cuando la sección se
// dibuja por encima de la vista (docs/scroll-bug.md, «Pendiente»).
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
```

```js
// Desocupación trimestral (scripts/muestra_gD.mjs), con la forma de la ENOE:
// país y regiones por sexo, entidades en total. El trimestre 2020-T2 no tiene
// dato (no hubo levantamiento cara a cara) y se rotula «Sin dato».
const aNumero = (x) => (x === "" || x == null ? null : +x);
const desocupacion = (await FileAttachment("../data/muestra/gD_desocupacion.csv").csv()).map((r) => ({
  tipo: r.tipo, ambito: r.ambito, cve: r.cve_ent ? String(r.cve_ent).padStart(2, "0") : "", region: r.region, sexo: r.sexo,
  periodo: r.periodo, anio: +r.anio, trimestre: +r.trimestre, t: +r.anio + (+r.trimestre - 1) / 4,
  num: aNumero(r.num), den: aNumero(r.den), pct: aNumero(r.pct), ee: aNumero(r.ee), casos: aNumero(r.casos),
}));
const AMBITOS = ["Todo el país", ...REGIONES];
const textoAmbito = (a) => (a === "Todo el país" ? a : `Región ${a}`);
const opcionesAmbito = AMBITOS.map((a) => ({valor: a, texto: textoAmbito(a)}));
// Universo y frase de la desocupación, iguales en todas sus secciones.
const FRASE_DESOCUPACION = "de la población económicamente activa no tenía trabajo y lo buscaba";
const APELLIDO_PEA = "económicamente activas";
// Dominio FIJO de la tasa: en la muestra va de 0.8 % a 8.4 % por entidad.
const DOMINIO_DESOCUPACION = [0, 9];
const MARCAS_ANIOS = [2005, 2010, 2015, 2020, 2025];
```

<h2 id="lineas" class="toc-anchor">Desocupación de mujeres y hombres, 2005 - 2025</h2>

```js
{
  const colorSexo = categorias(["Mujeres", "Hombres"]);
  const filtros = panel({grupos: [
    {leyenda: "Dónde y entre quiénes", campos: [
      campo({id: "ambito", rotulo: "Región", inicial: "Todo el país", opciones: opcionesAmbito}),
      campo({id: "series", rotulo: "Líneas", inicial: "sexo", opciones: [{valor: "sexo", texto: "Mujeres y hombres"}, {valor: "total", texto: "Una sola, sin separar"}]}),
    ]},
  ]});
  display(analisis({
    id: "lineas", numero: 1, titulo: "Desocupación de mujeres y hombres, 2005 - 2025", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([504, 464, 532]),
    entrada: "Forma base de respaldo: las mismas series sin contexto ni resalte, para cuando una variante más elaborada no cabe.",
    explica: "Cada línea sigue la tasa de desocupación del primer trimestre de cada año: de cada 100 personas que trabajan o buscan trabajo, cuántas lo buscaban sin tenerlo. Si en un año hay 3.5 personas desocupadas de cada 100 económicamente activas, la tasa es de 3.5 %. Se toma siempre el mismo trimestre para que la temporada no mueva la línea. El nombre de cada serie va al final de su línea.",
    dibujar: ({v, ancho}) => {
      const sexos = v.series === "sexo" ? ["Mujeres", "Hombres"] : ["Total"];
      const filas = desocupacion.filter((r) => r.ambito === v.ambito && r.trimestre === 1 && sexos.includes(r.sexo) && r.tipo !== "entidad");
      const nombre = (s) => (s === "Total" ? "Mujeres y hombres" : s);
      const color = (s) => (s === "Total" ? P.serie : colorSexo(s));
      const g = globo({
        donde: textoAmbito(v.ambito), cuando: (d) => d.periodo, grupo: (d) => nombre(d.sexo), color: (d) => color(d.sexo),
        valor: (d) => d.pct, formato: "pct", frase: FRASE_DESOCUPACION,
        personas: (d) => d.num, universo: (d) => d.den, apellido: APELLIDO_PEA,
        comparacion: (d) => { const p = filas.find((r) => r.sexo === d.sexo && r.anio === 2005); return p && d.anio !== 2005 ? `Desde 2005: ${puntos(d.pct - p.pct)}` : null; },
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Tasa de desocupación en el primer trimestre de cada año",
          subtitulo: `Población económicamente activa · ${textoAmbito(v.ambito)} · ${v.series === "sexo" ? "mujeres y hombres por separado" : "mujeres y hombres juntos"} · 2005 - 2025`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada línea es la tasa de desocupación del primer trimestre de cada año y cada punto, un año.",
          cuerpo: lineas(filas, {ancho, x: (d) => d.anio, y: (d) => d.pct, serie: (d) => nombre(d.sexo), color: (s) => color(s === "Mujeres y hombres" ? "Total" : s),
            dominioY: DOMINIO_DESOCUPACION, rotuloY: "Tasa de desocupación (%)", globo: g}),
        },
        tabla: {filas: [...filas].sort((a, b) => a.sexo.localeCompare(b.sexo) || a.anio - b.anio), columnas: [
          {titulo: "Año", valor: (d) => d.periodo, texto: true},
          {titulo: "Serie", valor: (d) => nombre(d.sexo), texto: true},
          {titulo: "Tasa", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Personas desocupadas", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población económicamente activa", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="pendiente" class="toc-anchor">Cambio de cada entidad entre dos años</h2>

```js
{
  const total = indicador.filter((r) => r.sexo === "Total");
  const enRegion = (v) => (r) => r.region === v.region;
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "Sur-Sureste", opciones: REGIONES})]},
    {leyenda: "Entre qué años", campos: [
      campo({id: "desde", rotulo: "Izquierda, desde", inicial: 2000, opciones: (v) => conDato(total, "anio", enRegion(v)).sort((a, b) => a - b).slice(0, -1)}),
      // Dependiente: «Hasta» solo ofrece años posteriores a «Desde».
      campo({id: "hasta", rotulo: "Derecha, hasta", inicial: 2020, opciones: (v) => conDato(total, "anio", enRegion(v)).filter((a) => a > v.desde).sort((a, b) => a - b)}),
    ]},
  ]});
  display(analisis({
    id: "pendiente", numero: 2, titulo: "Cambio de cada entidad entre dos años", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA, alto: reservar([686, 657, 688]),
    entrada: "Forma base de respaldo: dos años y una línea por entidad, sin los cortes intermedios.",
    explica: "Cada línea es una entidad de la región. Empieza en su porcentaje del primer año, a la izquierda, y termina en el del último, a la derecha. Si una entidad pasó de 30 % a 25 %, su línea baja y el cambio es de −5.0 puntos. La línea es roja cuando el porcentaje bajó, azul cuando subió y gris cuando el cambio no supera el margen de error.",
    dibujar: ({v, ancho}) => {
      const filas = total.filter((r) => r.region === v.region && (r.anio === v.desde || r.anio === v.hasta));
      const par = d3.group(filas, (r) => r.entidad);
      const completas = [...par].filter(([, f]) => f.length === 2);
      const signo = (f) => { const a = f.find((r) => r.anio === v.desde), b = f.find((r) => r.anio === v.hasta); return sentido(a.pct, b.pct, {eeA: a.ee, eeB: b.ee}); };
      const signos = new Map(completas.map(([e, f]) => [e, signo(f)]));
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.anio, grupo: (d) => mayuscula(SIG.etiqueta(signos.get(d.entidad))), color: (d) => SIG.color(signos.get(d.entidad)),
        valor: (d) => d.pct, formato: "pct", frase: `de la población ${UNIVERSO} cumple la condición`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
        comparacion: (d) => { const f = par.get(d.entidad), a = f.find((r) => r.anio === v.desde), b = f.find((r) => r.anio === v.hasta); return `De ${v.desde} a ${v.hasta}: ${puntos(b.pct - a.pct)}`; },
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const faltan = [...par].filter(([, f]) => f.length < 2).map(([e]) => e);
      const presentes = new Set(signos.values());
      const tabla = completas.map(([e, f]) => { const a = f.find((r) => r.anio === v.desde), b = f.find((r) => r.anio === v.hasta); return {entidad: e, a, b, s: signos.get(e)}; })
        .sort((p, q) => (p.b.pct - p.a.pct) - (q.b.pct - q.a.pct));
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición en dos años, por entidad",
          subtitulo: `Población ${UNIVERSO} · región ${v.region} · ${v.desde} a la izquierda y ${v.hasta} a la derecha`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada línea es una entidad, del porcentaje del primer año al del último: roja si bajó, azul si subió y gris si no cambió.",
          notas: [faltan.length ? `${faltan.join(", ")} no ${faltan.length === 1 ? "tiene" : "tienen"} dato en alguno de los dos años y no se ${faltan.length === 1 ? "dibuja" : "dibujan"}.` : null],
          cuerpo: [leyendaItems(SIG.leyenda("linea").filter((i) => [...presentes].some((s) => SIG.color(s) === i.color)).map((i) => ({...i, texto: `${mayuscula(i.texto)} de ${v.desde} a ${v.hasta}`}))),
            pendiente(filas.filter((r) => signos.has(r.entidad)), {ancho, edicion: (d) => d.anio, valor: (d) => d.pct, unidad: (d) => d.entidad,
              corto: (u) => cortoDeEntidad.get(u) ?? u, color: (u) => SIG.color(signos.get(u)), globo: g})],
        },
        tabla: {filas: tabla, columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: String(v.desde), valor: (d) => d.a.pct, formato: "pct"},
          {titulo: String(v.hasta), valor: (d) => d.b.pct, formato: "pct"},
          {titulo: "Cambio", valor: (d) => d.b.pct - d.a.pct, formato: "puntos"},
          {titulo: "Margen del cambio (95 %)", valor: (d) => Math.hypot(d.a.ee, d.b.ee), formato: (x) => margen(x)},
          {titulo: "Lectura", valor: (d) => SIG.etiqueta(d.s), texto: true},
          {titulo: `Población que cumple en ${v.hasta}`, valor: (d) => d.b.num, formato: "conteo"},
          {titulo: `Casos en la muestra en ${v.hasta}`, valor: (d) => d.b.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="cortes-comparables" class="toc-anchor">Qué ediciones de cada fuente se pueden comparar, 2005 - 2025</h2>

```js
{
  const ediciones = (await FileAttachment("../data/muestra/gD_cortes.csv").csv()).map((r) => ({
    indicador: r.indicador, fuente: r.fuente, tema: r.tema, tipo: r.tipo, anio: +r.anio, tramo: +r.tramo, desde: +r.desde, hasta: +r.hasta,
    ediciones: +r.ediciones, motivo: r.motivo, muestra: aNumero(r.muestra),
  }));
  const TEMAS = [...new Set(ediciones.map((r) => r.tema))];
  const filtros = panel({grupos: [
    {leyenda: "Qué fuentes y qué se resalta", campos: [
      campo({id: "tema", rotulo: "Tema", inicial: "todos", opciones: [{valor: "todos", texto: "Todos los temas"}, ...TEMAS]}),
      campo({id: "resalte", rotulo: "Resaltar", inicial: "todas", opciones: [{valor: "todas", texto: "Todas las ediciones"}, {valor: "reciente", texto: "Solo las comparables con la más reciente"}]}),
    ]},
  ]});
  display(analisis({
    id: "cortes-comparables", numero: 3, titulo: "Qué ediciones de cada fuente se pueden comparar, 2005 - 2025", panel: filtros, metodo: "m-fuentes", verifica: VERIFICA_MUESTRA, alto: reservar([839, 689, 670]),
    explica: "Cada renglón es un indicador con su fuente y cada punto, una edición levantada. Las ediciones que se pueden comparar entre sí van unidas por una barra. Donde la fuente cambió su definición o su diseño, la barra se corta y una raya punteada con el signo ≠ marca el quiebre: una serie que cruza ese signo mezcla dos mediciones distintas. Por ejemplo, el ingreso de 2014 y el de 2016 están en tramos distintos, así que no se restan.",
    dibujar: ({v, ancho}) => {
      const filas = ediciones.filter((r) => v.tema === "todos" || r.tema === v.tema);
      const ultimoTramo = d3.rollup(filas, (f) => d3.greatest(f, (r) => r.anio).tramo, (r) => r.indicador);
      const apagada = (d) => v.resalte === "reciente" && d.tramo !== ultimoTramo.get(d.indicador);
      const g = globo({
        donde: (d) => d.fuente, cuando: (d) => d.anio, grupo: (d) => d.indicador, color: (d) => (apagada(d) ? P.tinta2 : P.tonoTexto),
        valor: (d) => d.ediciones, formato: (x) => (x === 1 ? "1 edición" : `${x} ediciones`),
        frase: (d) => (d.ediciones > 1 ? `comparables entre sí, de ${d.desde} a ${d.hasta}` : "sin otra edición comparable"),
        personas: (d) => d.muestra, unidad: "viviendas en la muestra",
        comparacion: (d) => (d.motivo ? `Quiebre: ${d.motivo}` : null),
      });
      const fuenteDe = new Map(filas.map((r) => [r.indicador, r.fuente]));
      return {
        figura: {
          titulo: "Ediciones levantadas y tramos comparables, por indicador",
          subtitulo: `${v.tema === "todos" ? "Todos los temas" : v.tema} · ${fuenteDe.size} indicadores · ${v.resalte === "todas" ? "todas las ediciones" : "se resaltan las comparables con la más reciente"} · 2005 - 2025`,
          sello: MUESTRA,
          pie: "Cortes y quiebres de ejemplo de la Plantilla · cada punto es una edición levantada, la barra une las comparables y ≠ marca un cambio de definición o de diseño.",
          cuerpo: cortesComparables(filas, {ancho, fila: (d) => d.indicador, anio: (d) => d.anio, tramo: (d) => d.tramo, dominio: [2005, 2025], apagada,
            rotulo: (f) => `${f} · ${fuenteDe.get(f)}`, globo: g}),
        },
        tabla: {filas: [...filas].sort((a, b) => a.indicador.localeCompare(b.indicador) || a.anio - b.anio), columnas: [
          {titulo: "Indicador", valor: (d) => d.indicador, texto: true},
          {titulo: "Fuente", valor: (d) => d.fuente, texto: true},
          {titulo: "Edición", valor: (d) => d.anio, texto: true},
          {titulo: "Comparable con", valor: (d) => (d.ediciones > 1 ? `${d.desde} - ${d.hasta}` : "Ninguna otra"), texto: true},
          {titulo: "Motivo del quiebre", valor: (d) => d.motivo || null, texto: true},
          {titulo: "Viviendas en la muestra", valor: (d) => d.muestra, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="contexto" class="toc-anchor">Tres entidades frente a las demás, 2000 - 2020</h2>

```js
{
  const total = indicador.filter((r) => r.sexo === "Total");
  const NOMBRES = ENTIDADES.map((e) => e.nombre);
  const filtros = panel({grupos: [
    {leyenda: "Qué entidades se destacan", campos: [
      campo({id: "e1", rotulo: "Primera entidad", inicial: "Oaxaca", opciones: NOMBRES}),
      campo({id: "e2", rotulo: "Segunda", inicial: "Nuevo León", opciones: (v) => [{valor: "ninguna", texto: "Ninguna"}, ...NOMBRES.filter((n) => n !== v.e1)]}),
      campo({id: "e3", rotulo: "Tercera", inicial: "Ciudad de México", opciones: (v) => [{valor: "ninguna", texto: "Ninguna"}, ...NOMBRES.filter((n) => n !== v.e1 && n !== v.e2)]}),
    ]},
  ]});
  display(analisis({
    id: "contexto", numero: 4, titulo: "Tres entidades frente a las demás, 2000 - 2020", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([609, 552, 596]),
    explica: "Cada línea es una entidad. Las tres que se eligen van en color y con trazo grueso, con su nombre al final. Las demás quedan en gris, como fondo, para ver si las elegidas van por arriba, por abajo o en medio del país. Si una línea gris llega a 60 % y la entidad elegida a 30 %, la elegida está a 30 puntos de la más alta. El color solo identifica a cada entidad y no dice si subió o bajó.",
    dibujar: ({v, ancho}) => {
      const elegidas = [v.e1, v.e2, v.e3].filter((e) => e && e !== "ninguna");
      const color = categorias(elegidas);
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.anio, grupo: (d) => (elegidas.includes(d.entidad) ? "Entidad elegida" : "Las demás entidades"),
        color: (d) => (elegidas.includes(d.entidad) ? color(d.entidad) : P.tinta2),
        valor: (d) => d.pct, formato: "pct", frase: `de la población ${UNIVERSO} cumple la condición`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const lista = elegidas.length > 1 ? `${elegidas.slice(0, -1).join(", ")} y ${elegidas.at(-1)}` : elegidas[0];
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición, por entidad",
          subtitulo: `Población ${UNIVERSO} · en color, ${lista} · las demás entidades en gris · ${ANIOS[0]} - ${ANIOS.at(-1)}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada línea es una entidad, las elegidas van en color con su nombre al final y las demás, en gris.",
          cuerpo: contexto(total, {ancho, tiempo: (d) => d.anio, valor: (d) => d.pct, serie: (d) => d.entidad, elegidas, color, dominio: DOMINIO_NIVEL, formato: pctEje,
            rotuloValor: "Porcentaje que cumple la condición", corto: (s) => cortoDeEntidad.get(s) ?? s, textoResto: "Las demás entidades", globo: g}),
        },
        tabla: {filas: total.filter((r) => elegidas.includes(r.entidad)).sort((a, b) => elegidas.indexOf(a.entidad) - elegidas.indexOf(b.entidad) || a.anio - b.anio), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Año", valor: (d) => d.anio, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
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

<h2 id="franjas" class="toc-anchor">Desocupación de cada trimestre frente a uno de referencia</h2>

```js
{
  // Significado del color en esta sección: rojo, más desocupación que en el
  // trimestre de referencia; azul, menos; gris, la diferencia no supera el
  // margen de error. La intensidad crece con la diferencia, hasta 3 puntos.
  const DES = significado({rojo: "más desocupación que en la referencia", azul: "menos desocupación que en la referencia", gris: "sin diferencia clara", desfavorable: "sube"});
  // Dominio FIJO de la diferencia: en la muestra va de −1.9 a +3.1 puntos.
  const LIMITE = 3;
  const REFERENCIAS = [{valor: "2019-T4", texto: "Cuarto trimestre de 2019"}, {valor: "2005-T1", texto: "Primer trimestre de 2005"}, {valor: "2024-T4", texto: "Cuarto trimestre de 2024"}];
  const filtros = panel({grupos: [
    {leyenda: "Dónde y entre quiénes", campos: [
      campo({id: "ambito", rotulo: "Región", inicial: "Todo el país", opciones: opcionesAmbito}),
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
    ]},
    {leyenda: "Contra qué se compara", campos: [campo({id: "ref", rotulo: "Trimestre de referencia", inicial: "2019-T4", opciones: REFERENCIAS})]},
  ]});
  display(analisis({
    id: "franjas", numero: 5, titulo: "Desocupación de cada trimestre frente a uno de referencia", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA, alto: reservar([669, 552, 512]),
    explica: ["Cada franja es un trimestre, de 2005 a 2025. Su color compara la tasa de desocupación de ese trimestre con la del trimestre de referencia: roja cuando fue más alta, azul cuando fue más baja y más intensa cuanto mayor es la diferencia. Si la referencia es 3.5 % y un trimestre tuvo 5.0 %, su franja es roja con +1.5 puntos. Desde 3 puntos el tono ya no cambia. Una diferencia que no supera el margen de error va en gris.",
      "La línea de abajo da la tasa de cada trimestre, y la raya punteada, la de la referencia. La franja en gris claro de 2020 es el trimestre sin dato."],
    dibujar: ({v, ancho}) => {
      const filas = desocupacion.filter((r) => r.ambito === v.ambito && r.sexo === v.sexo && r.tipo !== "entidad");
      const ref = filas.find((r) => r.periodo === v.ref);
      const escala = rampaCambio(LIMITE, {desfavorable: "sube"});
      const signo = (d) => (d.pct == null ? null : sentido(ref.pct, d.pct, {eeA: ref.ee, eeB: d.ee}));
      const color = (d) => (signo(d) === "igual" ? escala(0) : escala(d.pct - ref.pct));
      const g = globo({
        donde: textoAmbito(v.ambito), cuando: (d) => d.periodo, grupo: (d) => (signo(d) ? mayuscula(DES.etiqueta(signo(d))) : null), color: (d) => (signo(d) ? DES.color(signo(d)) : P.tinta2),
        valor: (d) => d.pct, formato: "pct", frase: FRASE_DESOCUPACION,
        personas: (d) => d.num, universo: (d) => d.den, apellido: APELLIDO_PEA,
        comparacion: (d) => (d.periodo === ref.periodo ? "Es el trimestre de referencia" : `Frente a ${ref.periodo}: ${puntos(d.pct - ref.pct)}`),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const signos = new Set(filas.map(signo).filter(Boolean));
      const conSigno = (x) => (x > 0 ? `+${x}` : x < 0 ? `−${-x}` : "0");
      const leyenda = [
        leyendaContinua(escala, {titulo: "Diferencia con la referencia, en puntos", marcas: [-3, -2, -1, 0, 1, 2, 3], ancho: Math.min(300, ancho - 80),
          formato: conSigno, sinDato: filas.some((r) => r.pct == null)}),
        // La muestra de cada significado es el tono que de verdad lleva la
        // franja: un paso intenso de cada lado y el gris claro del centro.
        leyendaItems([["sube", escala(2)], ["baja", escala(-2)], ["igual", escala(0)]].filter(([s]) => signos.has(s))
          .map(([s, c]) => ({tipo: "cuadro", color: c, texto: mayuscula(DES.etiqueta(s))}))
          .concat([{tipo: "punteada", color: P.regla, texto: `Referencia, ${ref.periodo}: ${pct(ref.pct)}`}])),
      ];
      return {
        figura: {
          titulo: "Tasa de desocupación frente a un trimestre de referencia",
          subtitulo: `${quienes(v.sexo)} económicamente activos · ${textoAmbito(v.ambito)} · 2005-T1 a 2025-T2 · referencia ${ref.periodo}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada franja es un trimestre, roja si la desocupación superó la del trimestre de referencia y azul si quedó abajo.",
          cuerpo: franjasTiempo(filas, {ancho, tiempo: (d) => d.t, valor: (d) => d.pct, color, referencia: {valor: ref.pct, tiempo: ref.t}, dominio: DOMINIO_DESOCUPACION,
            marcasTiempo: MARCAS_ANIOS, rotuloValor: "Tasa (%)", leyenda, globo: g}),
        },
        tabla: {filas, columnas: [
          {titulo: "Trimestre", valor: (d) => d.periodo, texto: true},
          {titulo: "Tasa", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Diferencia con la referencia", valor: (d) => (d.pct == null ? null : d.pct - ref.pct), formato: "puntos"},
          {titulo: "Margen de la diferencia (95 %)", valor: (d) => (d.pct == null ? null : Math.hypot(d.ee, ref.ee)), formato: (x) => margen(x)},
          {titulo: "Lectura", valor: (d) => (signo(d) ? DES.etiqueta(signo(d)) : null), texto: true},
          {titulo: "Personas desocupadas", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población económicamente activa", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="bump" class="toc-anchor">Lugar de cada entidad dentro de su región, 2000 - 2020</h2>

```js
{
  // Sin filtro de sexo: en la muestra el orden de las entidades es el mismo
  // para mujeres, hombres y el total, así que el selector no cambiaba nada
  // (verificar:filtros). En su lugar se elige QUÉ se ordena: la tasa o el
  // número de personas, que sí reordena (las entidades grandes suben).
  const deRegion = (v) => (r) => r.sexo === "Total" && r.region === v.region;
  const MEDIDAS = {pct: "el porcentaje que cumple la condición", num: "el número de personas que cumplen la condición"};
  const filtros = panel({grupos: [
    {leyenda: "Dónde y qué entidad se sigue", campos: [
      campo({id: "region", rotulo: "Región", inicial: "Centro", opciones: REGIONES}),
      // Dependiente: las entidades de la región elegida.
      campo({id: "entidad", rotulo: "Entidad que se sigue", inicial: "Puebla", opciones: (v) => ENTIDADES.filter((e) => e.region === v.region).map((e) => e.nombre)}),
    ]},
    {leyenda: "Qué se ordena", campos: [campo({id: "medida", rotulo: "Lugar según", inicial: "pct", opciones: [{valor: "pct", texto: "El porcentaje"}, {valor: "num", texto: "El número de personas"}]})]},
  ]});
  display(analisis({
    id: "bump", numero: 6, titulo: "Lugar de cada entidad dentro de su región, 2000 - 2020", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([609, 506, 465]),
    explica: "Cada línea es una entidad de la región y une el lugar que ocupó en cada año, del valor más alto (lugar 1, arriba) al más bajo. El valor puede ser el porcentaje de su población que cumple la condición o el número de personas que la cumplen, y el orden cambia porque una entidad grande puede tener muchas personas con un porcentaje bajo. La entidad que se sigue va en color, con su lugar escrito dentro de cada punto. Si pasó del lugar 5 en 2000 al lugar 2 en 2020, su línea sube tres renglones. La forma dice el orden y no la distancia: dos lugares seguidos pueden estar a medio punto o a diez.",
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter(deRegion(v));
      const porNum = v.medida === "num";
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.anio, grupo: (d) => `Lugar ${d._lugar} de ${d._de} en la región`, color: (d) => (d.entidad === v.entidad ? P.serie : P.tinta2),
        // Con el número de personas la gráfica ordena conteos: la cifra es el
        // conteo y el porcentaje pasa a la comparación (R121).
        valor: (d) => (porNum ? d.num : d.pct), formato: porNum ? "conteo" : "pct",
        frase: porNum ? `personas ${UNIVERSO} cumplen la condición` : `de la población ${UNIVERSO} cumple la condición`,
        personas: porNum ? null : (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
        comparacion: porNum ? (d) => `${pct(d.pct)} de su población ${UNIVERSO}` : null,
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const dibujo = bump(filas, {ancho, tiempo: (d) => d.anio, unidad: (d) => d.entidad, valor: (d) => (porNum ? d.num : d.pct), destacada: (u) => u === v.entidad, color: () => P.serie,
        corto: (u) => cortoDeEntidad.get(u) ?? u, textoResto: "Las demás entidades de la región", globo: g});
      const incompletos = ANIOS.filter((a) => filas.filter((r) => r.anio === a).length < ENTIDADES.filter((e) => e.region === v.region).length);
      return {
        figura: {
          titulo: "Lugar de cada entidad dentro de su región, por año",
          subtitulo: `Población ${UNIVERSO} · región ${v.region} · lugar según ${MEDIDAS[v.medida]} · se sigue a ${v.entidad} · ${ANIOS[0]} - ${ANIOS.at(-1)}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada línea une el lugar de una entidad en cada año, del valor más alto arriba al más bajo abajo.",
          notas: [incompletos.length ? `En ${incompletos.join(" y ")} falta el dato de alguna entidad de la región: su línea se corta y el lugar se cuenta entre las que sí tienen dato.` : null],
          cuerpo: dibujo,
        },
        tabla: {filas: (dibujo.resumen ?? []).sort((a, b) => (a.lugares.get(ANIOS.at(-1))?._lugar ?? 99) - (b.lugares.get(ANIOS.at(-1))?._lugar ?? 99)), columnas: [
          {titulo: "Entidad", valor: (d) => d.unidad, texto: true},
          ...ANIOS.map((a) => ({titulo: `Lugar en ${a}`, valor: (d) => d.lugares.get(a)?._lugar ?? null, formato: "conteo"})),
          {titulo: `Porcentaje en ${ANIOS.at(-1)}`, valor: (d) => d.lugares.get(ANIOS.at(-1))?.pct, formato: "pct"},
          {titulo: `Personas que cumplen en ${ANIOS.at(-1)}`, valor: (d) => d.lugares.get(ANIOS.at(-1))?.num, formato: "conteo"},
          {titulo: `Margen en ${ANIOS.at(-1)} (95 %)`, valor: (d) => d.lugares.get(ANIOS.at(-1))?.ee, formato: (x) => margen(x)},
          {titulo: `Casos en la muestra en ${ANIOS.at(-1)}`, valor: (d) => d.lugares.get(ANIOS.at(-1))?.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="calendario" class="toc-anchor">Nacimientos registrados cada día</h2>

```js
{
  const registros = (await FileAttachment("../data/muestra/gD_calendario.csv").csv()).map((r) => {
    const fecha = new Date(`${r.fecha}T00:00:00Z`);
    return {fecha, anio: fecha.getUTCFullYear(), ambito: r.ambito, registros: +r.registros, poblacion: +r.poblacion, tasa: 1e5 * r.registros / r.poblacion};
  });
  // Dominio FIJO, medido: en la muestra la tasa diaria va de 0 a 8.2 por
  // cada 100 mil habitantes, y menos de 1 % de los días pasa de 8.
  const DOMINIO_CALENDARIO = [0, 8];
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const textoFecha = (f) => `${mayuscula(DIAS[f.getUTCDay()])} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}`;
  const filtros = panel({grupos: [
    {leyenda: "Dónde y cuándo", campos: [
      campo({id: "ambito", rotulo: "Región", inicial: "Todo el país", opciones: opcionesAmbito}),
      campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: [...new Set(registros.map((r) => r.anio))].sort((a, b) => b - a)}),
    ]},
  ]});
  display(analisis({
    id: "calendario", numero: 7, titulo: "Nacimientos registrados cada día", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([833, 823, 598]),
    explica: "Cada cuadro es un día del año, acomodado como en un calendario: un bloque por mes, una columna por día de la semana, de lunes a domingo. El color dice cuántos nacimientos se registraron ese día por cada 100 mil habitantes: más oscuro, más registros. Si en un día se registraron 6,500 nacimientos en un país de 130 millones, la cifra es 5.0. Los fines de semana y los días festivos quedan claros porque las oficinas cierran.",
    dibujar: ({v, ancho}) => {
      const filas = registros.filter((r) => r.ambito === v.ambito && r.anio === v.anio);
      const escala = rampaTema(DOMINIO_CALENDARIO);
      const porDiaSemana = d3.rollup(filas, (f) => 1e5 * d3.sum(f, (r) => r.registros) / d3.sum(f, (r) => r.poblacion), (r) => r.fecha.getUTCDay());
      const porDia = (x) => `${numero(x, 1)} por cada 100 mil`;
      const g = globo({
        donde: textoAmbito(v.ambito), cuando: (d) => `${textoFecha(d.fecha)} de ${d.anio}`, color: (d) => P.tonoTexto,
        valor: (d) => d.tasa, formato: porDia, frase: "habitantes: nacimientos registrados ese día",
        personas: (d) => d.registros, unidad: "nacimientos registrados",
        comparacion: (d) => `Todos los ${DIAS[d.fecha.getUTCDay()]} del año: ${porDia(porDiaSemana.get(d.fecha.getUTCDay()))}`,
      });
      const altos = filas.filter((r) => r.tasa > DOMINIO_CALENDARIO[1]).length;
      const meses = d3.groups(filas, (r) => r.fecha.getUTCMonth()).map(([m, f]) => ({mes: m, registros: d3.sum(f, (r) => r.registros),
        tasa: 1e5 * d3.sum(f, (r) => r.registros) / d3.sum(f, (r) => r.poblacion), mayor: d3.greatest(f, (r) => r.tasa), menor: d3.least(f, (r) => r.tasa)}));
      return {
        figura: {
          titulo: "Nacimientos registrados por día, por cada 100 mil habitantes",
          subtitulo: `${textoAmbito(v.ambito)} · ${v.anio} · ${entero(d3.sum(filas, (r) => r.registros))} nacimientos registrados en el año`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada cuadro es un día en su mes y su día de la semana, y el color dice cuántos nacimientos se registraron.",
          notas: [altos ? `${altos} ${altos === 1 ? "día pasa" : "días pasan"} de ${DOMINIO_CALENDARIO[1]} por cada 100 mil y ${altos === 1 ? "va" : "van"} en el tono más oscuro.` : null],
          cuerpo: calendario(filas, {ancho, fecha: (d) => d.fecha, valor: (d) => d.tasa, escala, formato: porDia, tituloLeyenda: "Nacimientos registrados por cada 100 mil habitantes",
            marcasLeyenda: [0, 2, 4, 6, 8], formatoLeyenda: (x) => (x === 8 ? "8 o más" : String(x)), globo: g}),
        },
        tabla: {filas: meses, columnas: [
          {titulo: "Mes", valor: (d) => mayuscula(MESES[d.mes]), texto: true},
          {titulo: "Nacimientos registrados", valor: (d) => d.registros, formato: "conteo"},
          {titulo: "Por día, por cada 100 mil habitantes", valor: (d) => d.tasa, formato: (x) => numero(x, 2)},
          {titulo: "Día con más registros", valor: (d) => `${textoFecha(d.mayor.fecha)}, ${numero(d.mayor.tasa, 1)}`, texto: true},
          {titulo: "Día con menos registros", valor: (d) => `${textoFecha(d.menor.fecha)}, ${numero(d.menor.tasa, 1)}`, texto: true},
        ]},
      };
    },
  }));
}
```

---

<h2 id="riel" class="toc-anchor">Hacia dónde se movió cada grupo, 2015 - 2025</h2>

```js
{
  const nombreGrupo = (dimension, grupo) => (dimension === "Grupo de edad" ? `${grupo} años` : grupo);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "ambito", rotulo: "Región", inicial: "Nacional", opciones: [{valor: "Nacional", texto: "Todo el país"}, ...REGIONES]})]},
    {leyenda: "Entre quiénes y en qué orden", campos: [
      campo({id: "dimension", rotulo: "Renglones, por", inicial: "Grupo de edad", opciones: conDato(trayectorias, "dimension")}),
      campo({id: "orden", rotulo: "Orden de los renglones", inicial: "ultimo", opciones: [{valor: "ultimo", texto: `Por el valor de ${CORTES.at(-1)}`}, {valor: "cambio", texto: `Por el cambio desde ${CORTES[0]}`}]}),
    ]},
  ]});
  display(analisis({
    id: "riel", numero: 8, titulo: "Hacia dónde se movió cada grupo, 2015 - 2025", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA, alto: reservar([880, 598, 538]),
    explica: ["Cada renglón es un grupo de población. Los puntos marcan el porcentaje que cumple la condición en 2015 y en 2020, y la flecha termina en el de 2025, con su cifra en la punta. El riel claro recorre los tres cortes: cuando el grupo subió y después bajó, el riel se dobla en gancho.",
      "Si un grupo pasó de 39.6 % a 33.4 % y luego a 30.5 %, la flecha apunta a la izquierda y el cambio total es de −9.1 puntos. La flecha es roja cuando el porcentaje bajó entre 2015 y 2025, azul cuando subió y gris cuando el cambio no supera el margen de error. La altura de los puntos dentro del renglón solo separa los cortes."],
    dibujar: ({v, ancho}) => {
      const filas = trayectorias.filter((r) => r.ambito === v.ambito && r.dimension === v.dimension);
      const signo = (r) => sentido(r.primero.pct, r.ultimo.pct, {eeA: r.primero.ee, eeB: r.ultimo.ee});
      const colorDe = (r) => SIG.color(signo(r));
      const g = globo({
        donde: lugarDe(v.ambito), cuando: (d) => d.corte, grupo: (d) => nombreGrupo(v.dimension, d.grupo), color: (d) => colorDe(d._resumen),
        valor: (d) => d.pct, formato: "pct",
        frase: `de la población ${UNIVERSO} de ese grupo cumple la condición`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: UNIVERSO,
        comparacion: (d) => (d.corte === CORTES[0] ? null : `Desde ${CORTES[0]}: ${puntos(d.pct - d._resumen.primero.pct)}`),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const orden = v.orden === "cambio" ? (p, q) => p.cambio - q.cambio : (p, q) => q.ultimo.pct - p.ultimo.pct;
      const dibujo = riel(filas, {ancho, unidad: (d) => nombreGrupo(v.dimension, d.grupo), corte: (d) => d.corte, valor: (d) => d.pct, cortes: CORTES, dominio: DOMINIO_RIEL,
        color: colorDe, orden, rotuloEje: "Porcentaje que cumple la condición", globo: g});
      const tabla = (dibujo.resumen ?? []).map((r) => ({...r, s: signo(r)}));
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición en tres cortes, por grupo",
          subtitulo: `Población ${UNIVERSO} · ${lugarDe(v.ambito)} · por ${v.dimension.toLowerCase()} · ${CORTES.join(", ")} · ${v.orden === "cambio" ? "de la mayor baja a la mayor alza" : `del valor más alto al más bajo en ${CORTES.at(-1)}`}`,
          sello: MUESTRA,
          pie: `Datos de muestra de la Plantilla · cada renglón es un grupo; los puntos marcan ${CORTES[0]} y ${CORTES[1]} y la flecha llega a ${CORTES.at(-1)}: roja si bajó, azul si subió, gris si no cambió.`,
          cuerpo: [leyendaItems(SIG.leyenda("linea").map((i) => ({...i, texto: `${i.texto.replace(/^./, (c) => c.toUpperCase())} de ${CORTES[0]} a ${CORTES.at(-1)}`}))), dibujo],
        },
        tabla: {filas: tabla, columnas: [
          {titulo: "Grupo", valor: (d) => d.unidad, texto: true},
          ...CORTES.map((c) => ({titulo: String(c), valor: (d) => d.filas.find((f) => f.corte === c)?.pct, formato: "pct"})),
          {titulo: `Cambio ${CORTES[0]} - ${CORTES.at(-1)}`, valor: (d) => d.cambio, formato: "puntos"},
          {titulo: "Margen del cambio (95 %)", valor: (d) => Math.hypot(d.primero.ee, d.ultimo.ee), formato: (x) => margen(x)},
          {titulo: "Lectura", valor: (d) => SIG.etiqueta(d.s), texto: true},
          {titulo: `Población que cumple en ${CORTES.at(-1)}`, valor: (d) => d.ultimo.num, formato: "conteo"},
          {titulo: `Casos en la muestra en ${CORTES.at(-1)}`, valor: (d) => d.ultimo.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="subio-bajo" class="toc-anchor">Quién subió y quién bajó entre dos años</h2>

```js
{
  const deSexo = (v) => (r) => r.sexo === v.sexo;
  const filtros = panel({grupos: [
    {leyenda: "Dónde y entre quiénes", campos: [
      campo({id: "entidad", rotulo: "Entidad destacada", inicial: "ninguna", opciones: [{valor: "ninguna", texto: "Ninguna"}, ...ENTIDADES.map((e) => ({valor: e.cve, texto: e.nombre}))]}),
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
    ]},
    {leyenda: "Entre qué años", campos: [
      campo({id: "desde", rotulo: "Triángulo de arriba, desde", inicial: 2000, opciones: (v) => conDato(indicador, "anio", deSexo(v)).sort((a, b) => a - b).slice(0, -1)}),
      // Dependiente: «Hasta» solo ofrece años posteriores a «Desde».
      campo({id: "hasta", rotulo: "Triángulo de abajo, hasta", inicial: 2020, opciones: (v) => conDato(indicador, "anio", deSexo(v)).filter((a) => a > v.desde).sort((a, b) => a - b)}),
    ]},
  ]});
  display(analisis({
    id: "subio-bajo", numero: 9, titulo: "Quién subió y quién bajó entre dos años", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA, alto: reservar([930, 665, 721]),
    explica: ["Cada cuadro es una entidad, acomodada como en el mapa del país, y va partido en dos: el triángulo de arriba a la izquierda tiene el color del porcentaje del primer año y el de abajo a la derecha, el del último. Los dos usan la misma escala, así que un cuadro de un solo tono casi no cambió y uno con dos tonos cambió mucho.",
      "La pastilla de la esquina dice hacia dónde fue y cuántos puntos: si una entidad pasó de 30 % a 25 %, la pastilla es roja y dice −5.0. Es azul cuando sube y gris cuando el cambio no supera el margen de error. En un teléfono los cuadros se ordenan de la mayor baja a la mayor alza."],
    dibujar: ({v, ancho}) => {
      const base = indicador.filter(deSexo(v));
      const valores = new Map();
      for (const e of ENTIDADES) {
        const a = base.find((r) => r.cve === e.cve && r.anio === v.desde) ?? null, b = base.find((r) => r.cve === e.cve && r.anio === v.hasta) ?? null;
        if (!a && !b) continue;
        valores.set(e.cve, {cve: e.cve, entidad: e.nombre, a, b, cambio: a && b ? b.pct - a.pct : null, s: a && b ? sentido(a.pct, b.pct, {eeA: a.ee, eeB: b.ee}) : null});
      }
      const fila = (d) => (d._lado === "a" ? d.a : d.b);
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => (d._lado === "a" ? v.desde : v.hasta),
        grupo: (d) => (d.s ? SIG.etiqueta(d.s).replace(/^./, (c) => c.toUpperCase()) : null), color: (d) => (d.s ? SIG.color(d.s) : P.tonoTexto),
        valor: (d) => fila(d)?.pct ?? null, formato: "pct",
        frase: `de la población ${UNIVERSO} cumple la condición`,
        personas: (d) => fila(d)?.num, universo: (d) => fila(d)?.den, unidad: v.sexo === "Total" ? "personas" : v.sexo.toLowerCase(), apellido: UNIVERSO,
        comparacion: (d) => (d.cambio == null ? null : `${v.desde} a ${v.hasta}: ${puntos(d.cambio)}`),
        precision: (d) => { const r = fila(d); return r ? {valor: r.pct, ee: r.ee, casos: r.casos} : null; },
      });
      const sinPar = ENTIDADES.length - [...valores.values()].filter((d) => d.cambio != null).length;
      const nombre = ENTIDADES.find((e) => e.cve === v.entidad)?.nombre;
      const corto = (x) => puntos(x).replace(/ puntos?$/, "");
      const tabla = [...valores.values()].filter((d) => d.cambio != null).sort((p, q) => p.cambio - q.cambio);
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición en dos años, por entidad",
          subtitulo: `${quienes(v.sexo)} ${UNIVERSO} · las 32 entidades · ${v.desde} arriba y ${v.hasta} abajo${nombre ? ` · se destaca ${nombre}` : ""}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada cuadro es una entidad: arriba, el porcentaje del primer año; abajo, el del último, y la pastilla dice el cambio en puntos.",
          notas: [sinPar > 0 ? `${sinPar} ${sinPar === 1 ? "entidad no tiene" : "entidades no tienen"} dato en alguno de los dos años: su triángulo va en gris y no lleva pastilla.` : null],
          cuerpo: mosaicoTriangulos(valores, {ancho: Math.min(ancho, 980), a: (d) => d.a?.pct ?? null, b: (d) => d.b?.pct ?? null, escala: rampaTema(DOMINIO_NIVEL),
            nombreA: String(v.desde), nombreB: String(v.hasta), destacar: v.entidad,
            marca: (d) => (d.s ? {signo: d.s, color: SIG.color(d.s), texto: corto(d.cambio)} : null),
            leyendaMarca: ["baja", "sube", "igual"].map((s) => ({signo: s, color: SIG.color(s), texto: `${SIG.etiqueta(s).replace(/^./, (c) => c.toUpperCase())}, en puntos`})),
            ordenAngosto: (p, q) => (p?.cambio ?? 1e9) - (q?.cambio ?? 1e9),
            tituloLeyenda: "Porcentaje", marcasLeyenda: [0, 25, 50, 75], formatoLeyenda: (x) => (x === 75 ? "75 o más" : String(x)), globo: g}),
        },
        tabla: {filas: tabla, columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: String(v.desde), valor: (d) => d.a.pct, formato: "pct"},
          {titulo: String(v.hasta), valor: (d) => d.b.pct, formato: "pct"},
          {titulo: "Cambio", valor: (d) => d.cambio, formato: "puntos"},
          {titulo: "Margen del cambio (95 %)", valor: (d) => Math.hypot(d.a.ee, d.b.ee), formato: (x) => margen(x)},
          {titulo: "Lectura", valor: (d) => SIG.etiqueta(d.s), texto: true},
          {titulo: `Población que cumple en ${v.hasta}`, valor: (d) => d.b.num, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

```js
// Salidas y llegadas anuales por entidad (scripts/muestra_flujos.mjs). En
// estas dos secciones el rojo y el azul hablan de movimiento de personas:
// rojo, salen (o salen más de las que llegan). Azul, llegan (o llegan más).
const series = leerSeries(await FileAttachment("../data/muestra/series_entidades.csv").csv());
const ANIOS_SERIE = [...new Set(series.map((r) => r.anio))].sort((a, b) => a - b);
const MOV = significado({rojo: "salen más personas de las que llegan", azul: "llegan más personas de las que salen", gris: "saldo cero", desfavorable: "baja"});
const regionDeEntidad = new Map(ENTIDADES.map((e) => [e.nombre, e.region]));
const cortoDeEntidad = new Map(ENTIDADES.map((e) => [e.nombre, e.corto]));
// Dominio FIJO del saldo: en la muestra va de −3.2 % a +4.2 % de la población.
const DOMINIO_SALDO = [-4, 5];
```

<h2 id="destacadas" class="toc-anchor">El saldo de llegadas y salidas de cada entidad, 2010 - 2025</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Qué se destaca", campos: [
      campo({id: "region", rotulo: "Región destacada", inicial: "Norte", opciones: REGIONES}),
      // Dependiente: las entidades de la región elegida. Elegir una la deja
      // sola en color y pasa las demás de su región al gris de contexto.
      campo({id: "entidad", rotulo: "Entidad", inicial: "todas", opciones: (v) => [{valor: "todas", texto: "Todas las de la región"},
        ...ENTIDADES.filter((e) => e.region === v.region).map((e) => ({valor: e.nombre, texto: e.nombre}))]}),
    ]},
  ]});
  display(analisis({
    id: "destacadas", numero: 10, titulo: "El saldo de llegadas y salidas de cada entidad, 2010 - 2025", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: 560,
    explica: ["Cada línea es una entidad y sigue su saldo año con año: las personas que llegaron menos las que salieron, como porcentaje de su población. Si a una entidad de 1,000,000 de habitantes llegan 30,000 personas y salen 20,000, su saldo es de +1.0 %.",
      "Las entidades de la región elegida van en color y con trazo grueso; al elegir una entidad, solo ella. La línea es azul mientras llegan más personas de las que salen y roja cuando salen más. Las demás entidades quedan en gris, como contexto. La raya del centro es el saldo cero. El tiempo corre hacia abajo."],
    dibujar: ({v, ancho}) => {
      const lado = (d) => sentido(0, d.saldo);
      const elegida = (entidad) => (v.entidad !== "todas" && regionDeEntidad.get(v.entidad) === v.region ? entidad === v.entidad : regionDeEntidad.get(entidad) === v.region);
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.anio, grupo: (d) => MOV.etiqueta(lado(d)).replace(/^./, (c) => c.toUpperCase()),
        color: (d) => (elegida(d.entidad) ? MOV.color(lado(d)) : P.tinta2),
        valor: (d) => d.saldo, formato: "relativo",
        frase: "de su población: saldo de las personas que llegan menos las que salen",
        personas: (d) => Math.abs(d.llegan - d.salen), unidad: (d) => (d.llegan >= d.salen ? "personas más" : "personas menos"),
        comparacion: (d) => `Llegan ${entero(d.llegan)} y salen ${entero(d.salen)}`,
        precision: (d) => ({casos: d.casos}),
      });
      const una = v.entidad !== "todas" && regionDeEntidad.get(v.entidad) === v.region;
      const quien = una ? v.entidad : `Región ${v.region}`;
      return {
        figura: {
          titulo: "Saldo de llegadas menos salidas como porcentaje de la población, por entidad",
          subtitulo: `Las 32 entidades · se destaca ${una ? v.entidad : `la región ${v.region}`} · 2010 - 2025`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada línea es una entidad y sigue, año con año, el saldo de las personas que llegan menos las que salen, como porcentaje de su población.",
          cuerpo: destacadas(series, {ancho, tiempo: (d) => d.anio, valor: (d) => d.saldo, serie: (d) => d.entidad, destacada: elegida,
            signo: {referencia: 0, abajo: MOV.color("baja"), arriba: MOV.color("sube"), textoAbajo: `${quien}: salen más de las que llegan`, textoArriba: `${quien}: llegan más de las que salen`},
            referencia: {valor: 0, texto: "Saldo cero"}, dominio: DOMINIO_SALDO, vertical: true, formato: cambioRelativo, rotuloValor: "Saldo, en porcentaje de la población",
            corto: (s) => cortoDeEntidad.get(s) ?? s, textoResto: una ? "Las demás entidades" : "Entidades de otras regiones", globo: g}),
        },
        tabla: {filas: series.filter((r) => elegida(r.entidad)).sort((a, b) => a.entidad.localeCompare(b.entidad) || a.anio - b.anio), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Año", valor: (d) => d.anio, texto: true},
          {titulo: "Saldo", valor: (d) => d.saldo, formato: "relativo"},
          {titulo: "Llegan", valor: (d) => d.llegan, formato: "conteo"},
          {titulo: "Salen", valor: (d) => d.salen, formato: "conteo"},
          {titulo: "Población", valor: (d) => d.poblacion, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="horizonte" class="toc-anchor">Desocupación trimestral de cada entidad, 2005 - 2025</h2>

```js
{
  const entidades = desocupacion.filter((r) => r.tipo === "entidad");
  // Bandas FIJAS: tres de 3 puntos. En la muestra la tasa más alta de una
  // entidad es 8.4 %, así que ninguna pasa del tope de 9.
  const PASO = 3, BANDAS = 3;
  const filtros = panel({grupos: [
    {leyenda: "Dónde y en qué orden", campos: [
      campo({id: "region", rotulo: "Región", inicial: "Norte", opciones: [...REGIONES, {valor: "todas", texto: "Las 32 entidades"}]}),
      campo({id: "orden", rotulo: "Orden de los renglones", inicial: "ultimo", opciones: [{valor: "ultimo", texto: "Por la tasa del último trimestre"}, {valor: "maximo", texto: "Por su trimestre más alto"}, {valor: "nombre", texto: "Por nombre"}]}),
    ]},
  ]});
  display(analisis({
    id: "horizonte", numero: 11, titulo: "Desocupación trimestral de cada entidad, 2005 - 2025", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([562, 506, 466]),
    explica: ["Cada renglón es una entidad y sigue su tasa de desocupación trimestre a trimestre, de 2005 a 2025. Para que quepan muchas en poco espacio, el área se corta en bandas de 3 puntos que se enciman: de 0 a 3 % en el tono más claro, de 3 a 6 % encima en un tono medio y de 6 a 9 % encima en el más oscuro. Una entidad con 7 % llena las dos primeras bandas y un tercio de la tercera.",
      "Donde el renglón se ve oscuro, la desocupación fue alta. La cifra a la derecha es la del último trimestre, y la franja gris de 2020 es el trimestre sin dato."],
    dibujar: ({v, ancho}) => {
      const filas = entidades.filter((r) => v.region === "todas" || r.region === v.region);
      const porEntidad = d3.group(filas, (r) => r.ambito);
      const ultimo = (f) => d3.greatest(f.filter((r) => r.pct != null), (r) => r.t);
      const mayor = (f) => d3.greatest(f.filter((r) => r.pct != null), (r) => r.pct);
      const orden = [...porEntidad.keys()].sort(v.orden === "nombre" ? d3.ascending
        : v.orden === "maximo" ? (a, b) => mayor(porEntidad.get(b)).pct - mayor(porEntidad.get(a)).pct : (a, b) => ultimo(porEntidad.get(b)).pct - ultimo(porEntidad.get(a)).pct);
      const previo = new Map(filas.map((r) => [`${r.ambito}|${r.periodo}`, r]));
      const g = globo({
        donde: (d) => d.ambito, cuando: (d) => d.periodo, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct", frase: FRASE_DESOCUPACION,
        personas: (d) => d.num, universo: (d) => d.den, apellido: APELLIDO_PEA,
        comparacion: (d) => { const p = previo.get(`${d.ambito}|${d.anio - 1}-T${d.trimestre}`); return p?.pct != null ? `Un año antes: ${pct(p.pct)}` : null; },
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const textoOrden = {ultimo: "de la tasa más alta a la más baja en el último trimestre", maximo: "del trimestre más alto al más bajo", nombre: "por nombre"}[v.orden];
      return {
        figura: {
          titulo: "Tasa de desocupación por trimestre, por entidad",
          subtitulo: `Población económicamente activa · ${v.region === "todas" ? "las 32 entidades" : `región ${v.region}`} · 2005-T1 a 2025-T2 · ${textoOrden}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada renglón es una entidad, y su área se dobla en bandas de 3 puntos con la más oscura encima.",
          cuerpo: horizonte(filas, {ancho, tiempo: (d) => d.t, serie: (d) => d.ambito, valor: (d) => d.pct, series: orden, paso: PASO, bandas: BANDAS,
            marcasTiempo: MARCAS_ANIOS, corto: (s) => cortoDeEntidad.get(s) ?? s, globo: g}),
        },
        tabla: {filas: orden.map((e) => ({entidad: e, u: ultimo(porEntidad.get(e)), m: mayor(porEntidad.get(e))})), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: `Tasa en ${"2025-T2"}`, valor: (d) => d.u.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.u.ee, formato: (x) => margen(x)},
          {titulo: "Trimestre más alto", valor: (d) => d.m.periodo, texto: true},
          {titulo: "Tasa en su trimestre más alto", valor: (d) => d.m.pct, formato: "pct"},
          {titulo: "Personas desocupadas en 2025-T2", valor: (d) => d.u.num, formato: "conteo"},
          {titulo: "Casos en la muestra en 2025-T2", valor: (d) => d.u.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="mosaico-series" class="toc-anchor">Cada entidad, todas a la vez, 2000 - 2020</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes y qué se destaca", campos: [
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"]}),
      campo({id: "entidad", rotulo: "Entidad destacada", inicial: "ninguna", opciones: [{valor: "ninguna", texto: "Ninguna"}, ...ENTIDADES.map((e) => ({valor: e.cve, texto: e.nombre}))]}),
    ]},
  ]});
  display(analisis({
    id: "mosaico-series", numero: 12, titulo: "Cada entidad, todas a la vez, 2000 - 2020", panel: filtros, metodo: "m-mapas", verifica: VERIFICA_MUESTRA, alto: reservar([881, 560, 768]),
    explica: ["Cada casilla es una entidad, acomodada como en el mapa del país, y lleva adentro su serie de 2000 a 2020. Todas las casillas usan la misma escala, de 0 a 75 %, así que una línea más alta es un porcentaje mayor. Los puntos grises son todo el país, para comparar cada entidad con el total. La cifra de la esquina es el porcentaje de 2020: si dice 31, ahí cumple la condición 31 % de la población.",
      "En un teléfono las casillas pasan a cuatro columnas, ordenadas de la cifra más alta a la más baja."],
    dibujar: ({v, ancho}) => {
      const filas = indicador.filter((r) => r.sexo === v.sexo);
      const series = d3.group(filas, (r) => r.cve);
      // Todo el país: suma de numeradores entre suma de denominadores, solo en
      // los años con las 32 entidades. Sin alguna, la raya se corta.
      const referencia = ANIOS.map((a) => { const f = filas.filter((r) => r.anio === a); return {tiempo: a, valor: f.length === 32 ? tasa(f).pct : null, completo: f.length === 32}; });
      const refDe = new Map(referencia.map((r) => [r.tiempo, r.valor]));
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.anio, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct", frase: `de la población ${UNIVERSO} cumple la condición`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: v.sexo === "Total" ? "personas" : v.sexo.toLowerCase(), apellido: UNIVERSO,
        comparacion: (d) => (refDe.get(d.anio) != null ? `Todo el país: ${pct(refDe.get(d.anio))}` : null),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const nombre = ENTIDADES.find((e) => e.cve === v.entidad)?.nombre;
      const incompletos = referencia.filter((r) => !r.completo).map((r) => r.tiempo);
      return {
        figura: {
          titulo: "Porcentaje que cumple la condición, por entidad y año",
          subtitulo: `${quienes(v.sexo)} ${UNIVERSO} · las 32 entidades · ${ANIOS[0]} - ${ANIOS.at(-1)}${nombre ? ` · se destaca ${nombre}` : ""}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada casilla es una entidad con su serie, los puntos grises son todo el país y la cifra es la de 2020.",
          notas: [incompletos.length ? `En ${incompletos.join(" y ")} alguna entidad no tiene dato: ahí no se calcula el total del país.` : null],
          cuerpo: mosaicoSeries(series, {ancho, tiempo: (d) => d.anio, valor: (d) => d.pct, cortes: ANIOS, dominio: DOMINIO_NIVEL, referencia, destacar: v.entidad,
            textoSerie: "La entidad", textoReferencia: "Todo el país", globo: g}),
        },
        tabla: {filas: [...series].map(([cve, f]) => ({cve, entidad: f[0].entidad, por: new Map(f.map((r) => [r.anio, r]))})).sort((a, b) => a.cve.localeCompare(b.cve)), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          ...ANIOS.map((a) => ({titulo: String(a), valor: (d) => d.por.get(a)?.pct, formato: "pct"})),
          {titulo: `Cambio ${ANIOS[0]} - ${ANIOS.at(-1)}`, valor: (d) => (d.por.get(ANIOS[0]) && d.por.get(ANIOS.at(-1)) ? d.por.get(ANIOS.at(-1)).pct - d.por.get(ANIOS[0]).pct : null), formato: "puntos"},
          {titulo: `Margen en ${ANIOS.at(-1)} (95 %)`, valor: (d) => d.por.get(ANIOS.at(-1))?.ee, formato: (x) => margen(x)},
          {titulo: `Casos en la muestra en ${ANIOS.at(-1)}`, valor: (d) => d.por.get(ANIOS.at(-1))?.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="areas" class="toc-anchor">Quienes salen y quienes llegan a cada entidad, año con año</h2>

```js
{
  const NOMBRE_SERIE = {salen: "Salen", llegan: "Llegan"};
  // Filas largas: una por entidad, año y serie.
  const largas = series.flatMap((r) => [
    {...r, serie: "salen", personas: r.salen, tasa: r.tasaSalen},
    {...r, serie: "llegan", personas: r.llegan, tasa: r.tasaLlegan},
  ]);
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "Centro", opciones: REGIONES})]},
    {leyenda: "Cómo se mide", campos: [campo({id: "medida", rotulo: "Medida", inicial: "personas", opciones: [{valor: "personas", texto: "Número de personas"}, {valor: "tasa", texto: "Por cada mil habitantes"}]})]},
  ]});
  display(analisis({
    id: "areas", numero: 13, titulo: "Quienes salen y quienes llegan a cada entidad, año con año", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: 620,
    explica: ["Hay un panel por entidad de la región, del valor más alto al más bajo. En cada uno, el área roja son las personas que salen y la azul, las que llegan. Las dos se enciman y el hueco entre ambas es la diferencia: si en un año salen 40,000 personas y llegan 25,000, el rojo sobresale 15,000 sobre el azul.",
      "Todos los paneles usan la misma escala, así que una entidad con más movimiento se ve más alta e invade el panel de arriba. La cifra junto al último punto es el valor de 2025."],
    dibujar: ({v, ancho}) => {
      const filas = largas.filter((r) => r.region === v.region), porMil = v.medida === "tasa";
      const valor = (d) => (porMil ? d.tasa : d.personas);
      const tinta = (s) => MOV.color(s === "salen" ? "baja" : "sube");
      const g = globo({
        donde: (d) => d.entidad, cuando: (d) => d.anio, grupo: (d) => `Personas que ${d.serie}`, color: (d) => tinta(d.serie),
        valor, formato: porMil ? (x) => `${numero(x, 1)} por cada mil` : (x) => personas(x),
        frase: (d) => (porMil ? `habitantes ${d.serie === "salen" ? "salieron de" : "llegaron a"} la entidad en el año` : `${d.serie === "salen" ? "salieron de" : "llegaron a"} la entidad en el año`),
        personas: (d) => d.personas, universo: (d) => d.poblacion, unidad: "habitantes",
        comparacion: (d) => (porMil ? null : `${numero(d.tasa, 1)} por cada mil habitantes`),
        precision: (d) => ({casos: d.casos}),
      });
      // Anotación: el mayor salto de un año al siguiente en la región, en
      // cualquiera de las dos series. Suele caer a media serie, donde hay aire.
      const saltos = d3.groups(filas, (r) => `${r.entidad}|${r.serie}`).flatMap(([, f]) => {
        const o = d3.sort(f, (r) => r.anio);
        return o.slice(1).map((r, i) => ({r, salto: valor(r) - valor(o[i])}));
      });
      const mayor = d3.greatest(saltos, (q) => q.salto)?.r;
      return {
        figura: {
          titulo: "Personas que salen y personas que llegan, por entidad",
          subtitulo: `Región ${v.region} · 2010 - 2025 · ${porMil ? "por cada mil habitantes" : "número de personas"}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada panel es una entidad, con las personas que salen en rojo y las que llegan en azul, y todos los paneles comparten la misma escala.",
          cuerpo: areasSuperpuestas(filas, {ancho, tiempo: (d) => d.anio, valor, serie: (d) => d.serie, panel: (d) => d.entidad, series: ["salen", "llegan"],
            color: tinta, nombreSerie: (s) => NOMBRE_SERIE[s], corto: (p) => (ancho < 400 ? cortoDeEntidad.get(p) ?? p : p), formato: porMil ? (x) => numero(x, 1) : entero,
            anotaciones: mayor ? [{panel: mayor.entidad, tiempo: mayor.anio, serie: mayor.serie, texto: `${mayor.anio}: el mayor salto de un año al siguiente en la región, en las personas que ${mayor.serie}`}] : [], globo: g}),
        },
        tabla: {filas: series.filter((r) => r.region === v.region).sort((a, b) => a.entidad.localeCompare(b.entidad) || a.anio - b.anio), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Año", valor: (d) => d.anio, texto: true},
          {titulo: "Salen", valor: (d) => d.salen, formato: "conteo"},
          {titulo: "Llegan", valor: (d) => d.llegan, formato: "conteo"},
          {titulo: "Salen, por cada mil", valor: (d) => d.tasaSalen, formato: "numero"},
          {titulo: "Llegan, por cada mil", valor: (d) => d.tasaLlegan, formato: "numero"},
          {titulo: "Población", valor: (d) => d.poblacion, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
