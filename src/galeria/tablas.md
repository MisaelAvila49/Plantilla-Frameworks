---
title: Tablas
toc: true
---

<header class="capitulo-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Formas en <span class="clave">tablas</span></h1>
  <p class="capitulo-entradilla">Para cuando el lector busca su renglón por nombre: barras dentro de la celda, el color de la misma cifra y una línea pequeña por renglón. Todas las cifras son datos de muestra.</p>
</header>

<link rel="stylesheet" href="../formas-gB.css">

```js
import {analisis} from "../components/seccion.js";
import {panel, campo, conDato} from "../components/filtros.js";
import {globo} from "../components/globo.js";
import {significado, rampaTema, P} from "../components/paleta.js";
import {pct, puntos, margen, pocoPrecisa} from "../components/formato.js";
import {REGIONES} from "../components/geografia.js";
import {MUESTRA} from "../components/libro.js";
import {VERIFICA_MUESTRA} from "../components/muestra.js";
import {leerTic} from "../components/muestra-gB.js";
import {tablaBarras} from "../components/formas/tabla-barras.js";
import {tablaCalor} from "../components/formas/tabla-calor.js";
import {tablaMinigraficas} from "../components/formas/tabla-minigraficas.js";

const tic = leerTic(await FileAttachment("../data/muestra/gB_tic_entidad.csv").csv());

// Significado del color en este capítulo: solo la tabla con minigráficas usa
// rojo y azul. Rojo, baja el porcentaje entre el primer y el último año;
// azul, sube; gris, el cambio no supera el margen de error. Las otras dos
// tablas miden niveles y van en el tono de tema.
const SIG = significado({rojo: "baja el porcentaje", azul: "sube el porcentaje", gris: "sin cambio claro", desfavorable: "baja"});
// Dominio FIJO de todas las tablas: son porcentajes de hogares, de 0 a 100
// (el valor más alto de la muestra es 98.8 %, teléfono celular).
const DOMINIO_PCT = [0, 100];
const INDICADORES = ["Internet", "Computadora", "Teléfono celular", "Televisión de paga"];
const CORTOS = {"Computadora": "Compu.", "Teléfono celular": "Celular", "Televisión de paga": "TV de paga"};
const ANIOS = conDato(tic, "anio").sort((a, b) => a - b);
const opcionesRegion = [{valor: "todas", texto: "Todo el país"}, ...REGIONES];
const textoRegion = (r) => (r === "todas" ? "Las 32 entidades" : `Región ${r}`);
const enMinuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const deRegion = (v) => (r) => r.cve !== "00" && (v.region === "todas" || r.region === v.region);
const nacional = (indicador, anio) => tic.find((r) => r.cve === "00" && r.indicador === indicador && r.anio === anio);
// Alto que se reserva a cada sección antes de dibujarse, medido con los
// filtros por omisión en 390, 1366 y 1920 px (docs/scroll-bug.md).
const reservar = ([angosto, medio, ancho]) => (window.innerWidth < 640 ? angosto : window.innerWidth < 1600 ? medio : ancho);
```

<h2 id="tabla-barras" class="toc-anchor">Hogares con cada servicio, entidad por entidad</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Qué", campos: [campo({id: "indicador", rotulo: "Bien o servicio", inicial: "Internet", opciones: INDICADORES})]},
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: [...ANIOS].reverse()})]},
  ]});
  display(analisis({
    id: "tabla-barras", numero: 1, titulo: "Hogares con cada servicio, entidad por entidad", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([1301, 1258, 1238]),
    explica: "Cada renglón es una entidad. La barra es la parte de sus hogares que tiene el bien o servicio elegido, con la cifra escrita al final, y todas las barras usan la misma escala de 0 a 100 %. La raya punteada marca el valor de todo el país. Si una entidad tiene 80.4 % y el país 73.8 %, su barra pasa la raya. Los renglones van de la entidad más alta a la más baja y se recorren con las flechas del teclado.",
    dibujar: ({v, ancho}) => {
      const todas = tic.filter((r) => deRegion(v)(r) && r.indicador === v.indicador && r.anio === v.anio);
      const sel = todas.filter((r) => r.pct != null), nac = nacional(v.indicador, v.anio);
      const sinDato = todas.filter((r) => r.pct == null).map((r) => r.entidad);
      const servicio = enMinuscula(v.indicador);
      const g = globo({
        grupo: (d) => d.entidad, color: () => P.tonoTexto,
        valor: (d) => d.pct, formato: "pct",
        personas: (d) => d.num, universo: (d) => d.den, unidad: "hogares",
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      return {
        figura: {
          titulo: `Hogares con ${servicio}, por entidad`,
          subtitulo: `${v.indicador} · ${textoRegion(v.region)} · ${v.anio}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada barra es el porcentaje de hogares de la entidad que tiene el bien o servicio, y la raya punteada marca el nacional.",
          notas: [sinDato.length ? `${sinDato.join(", ")} no ${sinDato.length === 1 ? "tiene" : "tienen"} dato publicable en ${v.anio}: pocos casos en la muestra.` : null],
          cuerpo: tablaBarras(sel, {ancho: Math.min(ancho, 980), nombre: (d) => d.entidad, valor: (d) => d.pct, cantidad: (d) => d.num, unidad: "hogares", rotuloCantidad: "Hogares que lo tienen",
            referencia: nac ? {valor: nac.pct, texto: `Todo el país: ${pct(nac.pct)}`} : null, dominio: DOMINIO_PCT, rotuloValor: "Porcentaje de hogares",
            incierta: (d) => pocoPrecisa({valor: d.pct, ee: d.ee, casos: d.casos}), globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => b.pct - a.pct), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Hogares que lo tienen", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Hogares", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="tabla-calor" class="toc-anchor">Cuatro servicios en un solo cuadro</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "Cuándo", campos: [campo({id: "anio", rotulo: "Año", inicial: 2024, opciones: [...ANIOS].reverse()})]},
    {leyenda: "En qué orden", campos: [campo({id: "orden", rotulo: "Renglones, por", inicial: "Internet", opciones: INDICADORES})]},
  ]});
  display(analisis({
    id: "tabla-calor", numero: 2, titulo: "Cuatro servicios en un solo cuadro", panel: filtros, metodo: "m-indicador", verifica: VERIFICA_MUESTRA, alto: reservar([1508, 1348, 1346]),
    explica: "Cada renglón es una entidad y cada columna un bien o servicio. La celda dice qué parte de los hogares lo tiene, y su color es esa misma cifra: más oscuro, porcentaje más alto, con la misma escala de 0 a 100 % en las cuatro columnas. Si una celda dice 57.4, de cada 100 hogares de esa entidad 57 lo tienen. Una celda gris dice «Sin dato» cuando la muestra no alcanza para publicar la cifra.",
    dibujar: ({v, ancho}) => {
      const sel = tic.filter((r) => deRegion(v)(r) && r.anio === v.anio);
      const g = globo({
        marca: (d) => d.entidad ?? d._fila, grupo: (d) => d.indicador ?? d._columna, color: () => P.tonoTexto,
        valor: (d) => d.pct ?? null, formato: "pct",
        personas: (d) => d.num, universo: (d) => d.den, unidad: "hogares",
        precision: (d) => ({valor: d.pct, ee: d.ee, casos: d.casos}),
      });
      const escala = rampaTema(DOMINIO_PCT);
      const sinDato = sel.filter((r) => r.pct == null);
      return {
        figura: {
          titulo: "Hogares con cada bien o servicio de información, por entidad",
          subtitulo: `${textoRegion(v.region)} · ${v.anio} · ordenadas por ${enMinuscula(v.orden)}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada celda es el porcentaje de hogares de la entidad que tiene el bien o servicio de la columna, con el color de esa misma cifra.",
          notas: [sinDato.length ? `${sinDato.map((r) => `${r.entidad} en ${enMinuscula(r.indicador)}`).join(", ")}: sin dato publicable, pocos casos en la muestra.` : null],
          cuerpo: tablaCalor(sel, {ancho: Math.min(ancho, 980), fila: (d) => d.entidad, columna: (d) => d.indicador, valor: (d) => d.pct, columnas: INDICADORES, escala, ordenPor: v.orden, cortoColumna: (c) => CORTOS[c] ?? c,
            tituloLeyenda: "Porcentaje de hogares", marcasLeyenda: [0, 25, 50, 75, 100], globo: g}),
        },
        tabla: {filas: [...sel].sort((a, b) => a.entidad.localeCompare(b.entidad) || INDICADORES.indexOf(a.indicador) - INDICADORES.indexOf(b.indicador)), columnas: [
          {titulo: "Entidad", valor: (d) => d.entidad, texto: true},
          {titulo: "Bien o servicio", valor: (d) => d.indicador, texto: true},
          {titulo: "Porcentaje", valor: (d) => d.pct, formato: "pct"},
          {titulo: "Margen (95 %)", valor: (d) => d.ee, formato: (x) => margen(x)},
          {titulo: "Hogares que lo tienen", valor: (d) => d.num, formato: "conteo"},
          {titulo: "Hogares", valor: (d) => d.den, formato: "conteo"},
          {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: "conteo"},
        ]},
      };
    },
  }));
}
```

---

<h2 id="tabla-minigraficas" class="toc-anchor">La serie de cada entidad en un renglón</h2>

```js
{
  const filtros = panel({grupos: [
    {leyenda: "Qué", campos: [campo({id: "indicador", rotulo: "Bien o servicio", inicial: "Internet", opciones: INDICADORES})]},
    {leyenda: "Dónde", campos: [campo({id: "region", rotulo: "Región", inicial: "todas", opciones: opcionesRegion})]},
    {leyenda: "En qué orden", campos: [campo({id: "orden", rotulo: "Renglones, por", inicial: "ultimo", opciones: [{valor: "ultimo", texto: `Valor de ${ANIOS.at(-1)}`}, {valor: "cambio", texto: `Cambio desde ${ANIOS[0]}`}]})]},
  ]});
  display(analisis({
    id: "tabla-minigraficas", numero: 3, titulo: "La serie de cada entidad en un renglón", panel: filtros, metodo: "m-cambio", verifica: VERIFICA_MUESTRA, alto: reservar([1632, 1538, 1518]),
    explica: "Cada renglón es una entidad. La línea pequeña es la parte de sus hogares que tiene el bien o servicio en cada año, de 2016 a 2024, y todas las líneas usan la misma escala de 0 a 100 %. A la derecha van el valor de 2024 y el cambio desde 2016, en puntos. Si pasó de 47.0 % a 73.6 %, el cambio es de +26.6 puntos. El triángulo lleva el color del sentido del cambio, y una raya gris cuando el cambio no supera el margen de error.",
    dibujar: ({v, ancho}) => {
      const sel = tic.filter((r) => deRegion(v)(r) && r.indicador === v.indicador);
      const renglones = [...new Set(sel.map((r) => r.entidad))].map((nombre) => ({nombre, filas: sel.filter((r) => r.entidad === nombre)}));
      const servicio = enMinuscula(v.indicador);
      const g = globo({
        marca: (r) => `${r.nombre} · ${r.a.anio} a ${r.b.anio}`, grupo: (r) => SIG.etiqueta(r.s), color: (r) => SIG.color(r.s),
        valor: (r) => r.cambio, formato: "puntos",
      });
      const cuadro = renglones.flatMap((r) => r.filas.filter((d) => d.pct != null).length >= 2 ? [{...r, a: r.filas.find((d) => d.anio === ANIOS[0]), b: r.filas.find((d) => d.anio === ANIOS.at(-1))}] : []).filter((r) => r.a?.pct != null && r.b?.pct != null);
      return {
        figura: {
          titulo: `Hogares con ${servicio}, ${ANIOS[0]} - ${ANIOS.at(-1)}, por entidad`,
          subtitulo: `${v.indicador} · ${textoRegion(v.region)} · ordenadas por ${v.orden === "ultimo" ? `el valor de ${ANIOS.at(-1)}` : `el cambio desde ${ANIOS[0]}`}`,
          sello: MUESTRA,
          pie: "Datos de muestra de la Plantilla · cada línea es la serie de 2016 a 2024 de la entidad en una escala común, con el valor de 2024 y su cambio en puntos.",
          cuerpo: tablaMinigraficas(renglones, {ancho: Math.min(ancho, 980), x: (d) => d.anio, valor: (d) => d.pct, ee: (d) => d.ee, cortes: ANIOS, dominio: DOMINIO_PCT, orden: v.orden, sig: SIG, globo: g}),
        },
        tabla: {filas: cuadro.sort((p, q) => q.b.pct - p.b.pct), columnas: [
          {titulo: "Entidad", valor: (r) => r.nombre, texto: true},
          ...ANIOS.map((a) => ({titulo: String(a), valor: (r) => r.filas.find((d) => d.anio === a)?.pct ?? null, formato: "pct"})),
          {titulo: "Cambio", valor: (r) => r.b.pct - r.a.pct, formato: "puntos"},
          {titulo: "Margen del cambio (95 %)", valor: (r) => Math.hypot(r.a.ee, r.b.ee), formato: (x) => margen(x)},
          {titulo: `Hogares en ${ANIOS.at(-1)}`, valor: (r) => r.b.num, formato: "conteo"},
        ]},
      };
    },
  }));
}
```
