---
title: Precisión e incertidumbre
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas para la <span class="clave">precisión</span></h1>
  <p class="capitulo-entradilla">Cuánto vale cada estimación y con qué margen se conoce: tabla de precisión, intervalos, resultados igual de probables, diferencias contra una referencia, series con banda y rangos. Todas las cifras son datos de muestra.</p>
</header>

<link rel="stylesheet" href="../formas-gB.css">

```js
import * as d3 from "npm:d3";
import {analisis} from "../components/seccion.js";
import {panel, campo, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {significado, P} from "../components/paleta.js";
import {pct, puntos, margen, numero, pocoPrecisa} from "../components/formato.js";
import {REGIONES, ENTIDADES} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerAsistenciaEntidad, leerMunicipios, leerTrimestral, quienesSexo, unidadSexo, textoSexo} from "../components/muestra-gB.js";
import {tablaPrecision} from "../components/formas/tabla-precision.js";
import {puntosIntervalo} from "../components/formas/puntos-intervalo.js";
import {cuantiles, debajoDe} from "../components/formas/cuantiles.js";
import {diferenciaMargen, ladoDe} from "../components/formas/diferencia-margen.js";
import {lineaBanda} from "../components/formas/linea-banda.js";
import {rango} from "../components/formas/rango.js";

const asistencia = leerAsistenciaEntidad(await FileAttachment("../data/muestra/gB_asistencia_entidad.csv").csv());
const municipios = leerMunicipios(await FileAttachment("../data/muestra/gB_asistencia_municipios.csv").csv());
const trimestral = leerTrimestral(await FileAttachment("../data/muestra/gB_trabajo_trimestral.csv").csv());

// Significado del color en este capítulo: rojo, la entidad queda por debajo
// de la referencia; azul, por encima; gris, la diferencia no se distingue del
// margen de error. Las demás secciones miden niveles y van en el tono.
const SIG = significado({rojo: "por debajo de la referencia", azul: "por encima de la referencia", gris: "no se distingue del margen de error", desfavorable: "baja"});
// Dominios FIJOS, medidos sobre toda la muestra y no sobre la vista: la
// asistencia de 18 a 24 años por entidad va de 13.2 % a 54.2 % y sus
// intervalos de 95 % llegan a 61.5 %: la tabla y los intervalos van de 0 a
// 100 y los resultados posibles, de 0 a 70. Las diferencias frente a la
// referencia llegan a ±27.6 puntos con su intervalo: se topan en ±30. El
// trabajo adolescente por trimestre llega a 29.3 % con su banda de 99 %: 0 a 30.
const DOMINIO_PCT = [0, 100];
const DOMINIO_CUANTILES = [0, 70];
const LIMITE_DIF = 30;
const DOMINIO_TRABAJO = [0, 30];
const SEXOS = [{valor: "Total", texto: "Mujeres y hombres"}, "Mujeres", "Hombres"];
const opcionesRegion = [{valor: "todas", texto: "Todo el país"}, ...REGIONES];
const textoRegion = (r) => (r === "todas" ? "Las 32 entidades" : `Región ${r}`);
const corto = (n) => ENTIDADES.find((e) => e.nombre === n)?.corto ?? n;
const incierta = (d) => pocoPrecisa({valor: d.pct, ee: d.ee, casos: d.casos});
const ANIOS = conDato(asistencia, "anio").sort((a, b) => b - a);
const nacional = (v) => asistencia.find((r) => r.cve === "00" && r.anio === v.anio && r.sexo === v.sexo);
const entidades = (v) => asistencia.filter((r) => r.cve !== "00" && r.anio === v.anio && r.sexo === v.sexo && (!v.region || v.region === "todas" || r.region === v.region));
// Alto que se reserva a cada sección antes de dibujarse, medido con los
// filtros por omisión en 390, 1366 y 1920 px (docs/scroll-bug.md).
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
```

<h2 id="tabla-precision" class="toc-anchor">Qué tan precisa es cada estimación</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: SEXOS})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: ANIOS})]},
  ]});
  display(analisis({
    id: "tabla-precision", numero: 1, titulo: "Qué tan precisa es cada estimación", panel: filtros, metodo: "m-precision", verifica: VERIFICA_MUESTRA, alto: reservar([1446, 1297, 1257]),
    explica: "Cada renglón es una entidad. La estimación es la parte de la población de 18 a 24 años que asiste a la escuela, y la raya es su intervalo de 95 %: el tramo donde está el valor real con alta probabilidad. El coeficiente de variación compara el error con la cifra. Si la estimación es 30 % y su error de 3 puntos, el coeficiente es 10 % y la precisión es alta. Con menos de 15 % la precisión es alta, hasta 30 % moderada, y desde 30 % baja, con asterisco.",
    dibujar: ({v, ancho}) => {
      const sel = entidades(v), nac = nacional(v);
      const g = globo({
        donde: (d) => d.entidad, cuando: v.anio, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        frase: `de ${quienesSexo(v.sexo)} de 18 a 24 años asiste a la escuela`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: unidadSexo(v.sexo), apellido: "de 18 a 24 años",
        comparacion: (d) => (d.cve === "00" || !nac ? null : `Todo el país: ${pct(nac.pct)}`),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const bajas = sel.filter((d) => d.ee / d.pct >= 0.3).length;
      return {
        figura: {
          titulo: "Población de 18 a 24 años que asiste a la escuela, con su precisión",
          subtitulo: `${textoRegion(v.region)} · ${textoSexo(v.sexo)} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada renglón da la estimación de la entidad, su intervalo de 95 %, el coeficiente de variación y el nivel de precisión que resulta.",
          notas: [bajas ? `* ${bajas} ${bajas === 1 ? "estimación tiene" : "estimaciones tienen"} precisión baja: su error pasa de 30 % de la cifra.` : null],
          cuerpo: tablaPrecision(sel, {ancho: Math.min(ancho, 980), nombre: (d) => (d.cve === "00" ? "Todo el país" : d.entidad), valor: (d) => d.pct, ee: (d) => d.ee, referencia: nac ? {...nac} : null, dominio: DOMINIO_PCT, globo: g}),
        },
        tabla: {filas: [...(nac ? [nac] : []), ...[...sel].sort((a, b) => b.pct - a.pct)], columnas: [
          {titulo: "Entidad", valor: (d) => (d.cve === "00" ? "Todo el país" : d.entidad), texto: true},
          {titulo: "Estimación", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Límite inferior", valor: (d) => Math.max(0, d.pct - 1.96 * d.ee), formato: "pct"},
          {titulo: "Límite superior", valor: (d) => d.pct + 1.96 * d.ee, formato: "pct"},
          {titulo: "Coef. de variación", valor: (d) => (100 * d.ee) / d.pct, formato: (x) => `${numero(x, 1)} %`},
          {titulo: "Población que asiste", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población de 18 a 24 años", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="puntos-intervalo" class="toc-anchor">Cada entidad con su intervalo de confianza</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: SEXOS})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: ANIOS})]},
  ]});
  display(analisis({
    id: "puntos-intervalo", numero: 2, titulo: "Cada entidad con su intervalo de confianza", panel: filtros, metodo: "m-precision", verifica: VERIFICA_MUESTRA, alto: reservar([1189, 1079, 1053]),
    explica: "Cada renglón es una entidad. El punto es la parte de la población de 18 a 24 años que asiste a la escuela y la raya ancha es su intervalo de 95 %. Dos entidades cuyas rayas se enciman no se pueden ordenar con seguridad. Si una tiene 36 % con raya de 30 a 42 y otra 33 % con raya de 27 a 39, el orden entre ellas no está claro. El punto hueco con asterisco señala una estimación poco precisa. La línea punteada es el valor de todo el país.",
    dibujar: ({v, ancho}) => {
      const sel = entidades(v), nac = nacional(v);
      const g = globo({
        donde: (d) => d.entidad, cuando: v.anio, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        frase: `de ${quienesSexo(v.sexo)} de 18 a 24 años asiste a la escuela`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: unidadSexo(v.sexo), apellido: "de 18 a 24 años",
        comparacion: () => (nac ? `Todo el país: ${pct(nac.pct)}` : null),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Población de 18 a 24 años que asiste a la escuela, con su intervalo de 95 %",
          subtitulo: `${textoRegion(v.region)} · ${textoSexo(v.sexo)} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es la estimación de la entidad, la raya es su intervalo de 95 % y el punto hueco señala una estimación poco precisa.",
          cuerpo: puntosIntervalo(sel, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, valor: (d) => d.pct, ee: (d) => d.ee, incierta, dominioX: DOMINIO_PCT,
            referencia: nac ? {valor: nac.pct, texto: `Todo el país: ${pct(nac.pct)}`} : null, rotuloX: "Porcentaje que asiste", corto, globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => b.pct - a.pct), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Estimación", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Límite inferior", valor: (d) => Math.max(0, d.pct - 1.96 * d.ee), formato: "pct"},
          {titulo: "Límite superior", valor: (d) => d.pct + 1.96 * d.ee, formato: "pct"},
          {titulo: "Población que asiste", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Población de 18 a 24 años", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="cuantiles" class="toc-anchor">Veinte resultados igual de probables</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "Sur-Sureste", opciones: REGIONES})]},
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: SEXOS})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: ANIOS})]},
  ]});
  display(analisis({
    id: "cuantiles", numero: 3, titulo: "Veinte resultados igual de probables", panel: filtros, metodo: "m-precision", verifica: VERIFICA_MUESTRA, alto: reservar([897, 700, 628]),
    explica: ["Cada renglón es una entidad y sus 20 puntos son 20 resultados igual de probables para la parte de la población de 18 a 24 años que asiste a la escuela, según el error de la encuesta. Los puntos se apilan donde caen juntos. Una estimación precisa deja los puntos amontonados y una poco precisa los deja regados.",
      "El color dice de qué lado del valor de todo el país, la línea punteada, cae cada resultado. Si 17 de 20 puntos quedan debajo, la entidad está debajo del país en 17 de cada 20 resultados posibles."],
    dibujar: ({v, ancho}) => {
      const sel = entidades(v), nac = nacional(v);
      const g = globo({
        donde: (d) => d.entidad, cuando: v.anio, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        frase: `de ${quienesSexo(v.sexo)} de 18 a 24 años asiste a la escuela`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: unidadSexo(v.sexo), apellido: "de 18 a 24 años",
        comparacion: (d) => `${debajoDe(d.pct, d.ee, nac.pct)} de 20 resultados debajo de todo el país (${pct(nac.pct)})`,
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: "Población de 18 a 24 años que asiste a la escuela, en 20 resultados posibles por entidad",
          subtitulo: `Región ${v.region} · ${textoSexo(v.sexo)} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es uno de 20 resultados igual de probables según el error de la encuesta, y su color dice si queda debajo o encima del nacional.",
          cuerpo: cuantiles(sel, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, valor: (d) => d.pct, ee: (d) => d.ee, referencia: {valor: nac.pct, texto: `Todo el país: ${pct(nac.pct)}`}, sig: SIG, dominioX: DOMINIO_CUANTILES, globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => b.pct - a.pct), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Estimación", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Resultados debajo del país", valor: (d) => `${debajoDe(d.pct, d.ee, nac.pct)} de 20`, texto: true},
          {titulo: "Población que asiste", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="diferencia-margen" class="toc-anchor">Por encima o por debajo de la referencia</h2>

```js
{
  // Referencia de una región: suma de numeradores y denominadores de sus
  // entidades (nunca se promedian tasas). Su error sale de la suma de casos
  // con el mismo efecto de diseño de la muestra (2.2).
  const deRegion = (region, v) => {
    const f = asistencia.filter((r) => r.cve !== "00" && r.region === region && r.anio === v.anio && r.sexo === v.sexo);
    const num = d3.sum(f, (r) => r.num), den = d3.sum(f, (r) => r.den), casos = d3.sum(f, (r) => r.casos), q = num / den;
    return {pct: 100 * q, ee: 100 * Math.sqrt((q * (1 - q) / casos) * 2.2), nombre: `la región ${region}`};
  };
  const filtros = panel({grupos: [
    {leyenda: "Comparar con", campos: [campo({id: "referencia", rotulo: "Referencia", inicial: "pais", opciones: [{valor: "pais", texto: "Todo el país"}, {valor: "region", texto: "Su región"}]})]},
    {leyenda: "Entre quiénes", campos: [campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: SEXOS})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: ANIOS})]},
  ]});
  display(analisis({
    id: "diferencia-margen", numero: 4, titulo: "Por encima o por debajo de la referencia", panel: filtros, metodo: "m-precision", verifica: VERIFICA_MUESTRA, alto: reservar([1437, 1158, 1158]),
    explica: "Cada renglón es una entidad y el punto es la diferencia, en puntos, entre la parte de su población de 18 a 24 años que asiste a la escuela y la de la referencia. La raya es el intervalo de 95 % de esa diferencia. Si una entidad tiene 38 % y el país 34 %, la diferencia es de +4.0 puntos, y si su raya va de −1 a +9 cruza el cero y la entidad no se distingue del país. El color sale de la raya: completa debajo del cero, completa arriba, o cruzándolo.",
    dibujar: ({v, ancho}) => {
      const nac = nacional(v);
      const ref = (d) => (v.referencia === "pais" ? {pct: nac.pct, ee: nac.ee, nombre: "todo el país"} : deRegion(d.region, v));
      const filas = entidades(v).map((d) => {
        const r = ref(d), dif = d.pct - r.pct, ee = Math.hypot(d.ee, r.ee);
        return {...d, ref: r, dif, eeDif: ee, lado: ladoDe(dif, ee)};
      });
      const g = globo({
        donde: (d) => d.entidad, cuando: v.anio, grupo: (d) => SIG.etiqueta(d.lado), color: (d) => SIG.color(d.lado),
        valor: (d) => d.dif, formato: "puntos",
        frase: (d) => `de diferencia con ${d.ref.nombre} en la parte de ${quienesSexo(v.sexo)} de 18 a 24 años que asiste a la escuela`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: unidadSexo(v.sexo), apellido: "de 18 a 24 años",
        comparacion: (d) => `${pct(d.pct)} frente a ${pct(d.ref.pct)}`,
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const cuenta = (k) => filas.filter((d) => d.lado === k).length;
      return {
        kpis: [
          {etiqueta: "Entidades por debajo de la referencia", cifra: String(cuenta("baja")), nota: `de ${filas.length} con dato en ${v.anio}`},
          {etiqueta: "Por encima", cifra: String(cuenta("sube"))},
          {etiqueta: "No se distinguen del margen de error", cifra: String(cuenta("igual"))},
        ],
        figura: {
          titulo: "Diferencia de cada entidad frente a la referencia, en puntos",
          subtitulo: `Frente a ${v.referencia === "pais" ? "todo el país" : "su región"} · ${textoSexo(v.sexo)} de 18 a 24 años · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada punto es la diferencia en puntos frente a la referencia y la raya su intervalo de 95 %, con el color de lo que dice ese intervalo.",
          cuerpo: diferenciaMargen(filas, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, dif: (d) => d.dif, ee: (d) => d.eeDif, sig: SIG, limite: LIMITE_DIF, rotuloX: "Diferencia, en puntos", corto, globo: g}),
        },
        tabla: {filas: [...filas].sort((a, b) => b.dif - a.dif), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Entidad", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Referencia", valor: (d) => d.ref.pct, formato: "pct"},
          {titulo: "Diferencia", valor: (d) => d.dif, formato: "puntos"},
          {titulo: "Margen de la diferencia (95 %)", valor: (d) => d.eeDif, formato: (x) => margen(x)},
          {titulo: "Lectura", valor: (d) => SIG.etiqueta(d.lado), texto: true},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="linea-banda" class="toc-anchor">La serie trimestral con su banda de confianza</h2>

```js
{
  const NIVELES = [{valor: "95", texto: "95 %", z: 1.96}, {valor: "90", texto: "90 %", z: 1.645}, {valor: "99", texto: "99 %", z: 2.576}];
  const filtros = panel({grupos: [
    {leyenda: "Entre quiénes", campos: [
      campo({id: "edad", rotulo: "Edad", inicial: "15 a 17", opciones: [{valor: "15 a 17", texto: "15 a 17 años"}, {valor: "12 a 14", texto: "12 a 14 años"}]}),
      campo({id: "sexo", rotulo: "Sexo", inicial: "Total", opciones: SEXOS}),
    ]},
    {leyenda: "Banda", campos: [campo({id: "nivel", rotulo: "Nivel de confianza", inicial: "95", opciones: NIVELES.map(({valor, texto}) => ({valor, texto}))})]},
  ]});
  display(analisis({
    id: "linea-banda", numero: 5, titulo: "La serie trimestral con su banda de confianza", panel: filtros, metodo: "m-precision", verifica: VERIFICA_MUESTRA, alto: reservar([547, 507, 556]),
    explica: "La línea es la parte de la población del grupo de edad elegido que trabaja, trimestre por trimestre, y la banda es su intervalo de confianza. Un cambio de un trimestre a otro que queda dentro de la banda puede ser solo error de la encuesta. Si un trimestre marca 16.0 % con banda de 14.5 a 17.5 y el siguiente 16.8 %, la subida cabe dentro de la banda. El segundo trimestre de 2020 no tiene dato y el hueco se une con una raya punteada.",
    dibujar: ({v, ancho}) => {
      const nivel = NIVELES.find((n) => n.valor === v.nivel);
      const serie = trimestral.filter((d) => d.edad === v.edad && d.sexo === v.sexo).sort((a, b) => a.anio - b.anio || a.trimestre - b.trimestre).map((d, i) => ({...d, i}));
      const anioAntes = (d) => serie.find((r) => r.anio === d.anio - 1 && r.trimestre === d.trimestre && r.pct != null);
      const g = globo({
        donde: "Todo el país", cuando: (d) => d.etiqueta, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        frase: `de ${quienesSexo(v.sexo)} de ${v.edad} años trabaja`,
        personas: (d) => d.num, universo: (d) => d.den, unidad: unidadSexo(v.sexo), apellido: `de ${v.edad} años`,
        comparacion: (d) => (anioAntes(d) ? `${anioAntes(d).etiqueta}: ${pct(anioAntes(d).pct)}` : null),
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const marcas = serie.filter((d) => d.trimestre === 1).map((d) => d.i);
      return {
        figura: {
          titulo: `Población de ${v.edad} años que trabaja, por trimestre`,
          subtitulo: `${textoSexo(v.sexo)} de ${v.edad} años · 2019 T1 - 2025 T2 · banda de ${nivel.texto}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · la línea es la estimación de cada trimestre y la banda su intervalo, y el segundo trimestre de 2020 no tiene dato.",
          cuerpo: lineaBanda(serie, {ancho: Math.min(ancho, 1100), x: (d) => d.i, valor: (d) => d.pct, ee: (d) => d.ee, z: nivel.z, nivel: nivel.texto, dominioY: DOMINIO_TRABAJO,
            rotuloY: "Porcentaje que trabaja", marcasX: marcas, formatoX: (i) => String(serie[i]?.anio ?? ""), globo: g}),
        },
        tabla: {filas: serie, columnas: [
          {titulo: "Trimestre", valor: (d) => d.etiqueta, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: `Margen (${nivel.texto})`, valor: (d) => (d.ee == null ? null : (d.ee * nivel.z) / 1.96), formato: (x) => margen(x)},
          {titulo: "Población que trabaja", valor: (d) => d.num, formato: "conteo"},
          {titulo: `Población de ${v.edad} años`, valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="rango" class="toc-anchor">Del municipio más bajo al más alto</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Entre quiénes", campos: [campo({id: "edad", rotulo: "Edad", inicial: "15 a 17", opciones: [{valor: "15 a 17", texto: "15 a 17 años"}, {valor: "18 a 24", texto: "18 a 24 años"}]})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Censo", inicial: 2020, opciones: conDato(municipios, "anio").sort((a, b) => b - a)})]},
  ]});
  display(analisis({
    id: "rango", numero: 6, titulo: "Del municipio más bajo al más alto", panel: filtros, metodo: "m-distribucion", verifica: VERIFICA_MUESTRA, alto: reservar([1317, 1232, 1162]),
    explica: "Cada renglón es una entidad. El punto es la parte de su población del grupo de edad que asiste a la escuela, y la raya gris va del municipio con la parte más baja al de la más alta. Una raya larga quiere decir que el promedio de la entidad esconde municipios muy distintos. Si la entidad tiene 70 % y sus municipios van de 38 % a 91 %, la distancia entre los extremos es de 53 puntos. Es un censo y no tiene error de muestreo.",
    dibujar: ({v, ancho}) => {
      const sel = municipios.filter((d) => d.edad === v.edad && d.anio === v.anio && (v.region === "todas" || d.region === v.region));
      const g = globo({
        donde: (d) => d.entidad, cuando: `Censo ${v.anio}`, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        frase: `de la población de ${v.edad} años asiste a la escuela en toda la entidad`,
        personas: (d) => d.num, universo: (d) => d.den, apellido: `de ${v.edad} años`,
        comparacion: (d) => `Municipios: de ${pct(d.minimo)} a ${pct(d.maximo)}`,
      });
      return {
        figura: {
          titulo: `Población de ${v.edad} años que asiste a la escuela, en la entidad y en sus municipios extremos`,
          subtitulo: `${textoRegion(v.region)} · ${v.edad} años · Censo ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · el punto es el porcentaje de toda la entidad y la raya va del municipio con el porcentaje más bajo al del más alto.",
          cuerpo: rango(sel, {ancho: Math.min(ancho, 980), etiqueta: (d) => d.entidad, valor: (d) => d.pct, minimo: (d) => d.minimo, maximo: (d) => d.maximo, dominioX: DOMINIO_PCT, rotuloX: "Porcentaje que asiste", corto, globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => b.pct - a.pct), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Toda la entidad", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Municipio más bajo", valor: (d) => d.minimo, formato: "pct"},
          {titulo: "Municipio más alto", valor: (d) => d.maximo, formato: "pct"},
          {titulo: "Distancia", valor: (d) => d.maximo - d.minimo, formato: (x) => puntos(x).replace("+", "")},
          {titulo: "Municipios", valor: (d) => d.municipios, formato: "conteo"},
          {titulo: "Población que asiste", valor: (d) => d.num, formato: "conteo"},
          {titulo: `Población de ${v.edad} años`, valor: (d) => d.den, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
