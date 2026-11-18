// formas/puntos-series.js
// ¿Dónde queda cada uno de tres grupos en cada fila, y cuánto los separa?
// Un renglón por unidad con tres puntos, cada serie con su color de identidad
// Y su propio símbolo (círculo, cuadro, triángulo), de modo que se distinguen
// también sin color. Una raya gris une al más bajo con el más alto.
// No: dos grupos (dumbbell) o más de tres (heatmap); diferencias de décimas.
import * as Plot from "npm:@observablehq/plot";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, margenRotulos, TIPO} from "./comun.js";

const SIMBOLOS = ["circle", "square", "triangle"];

// Muestra de leyenda con el mismo símbolo que la marca.
function muestra(simbolo, color) {
  const forma = simbolo === "square" ? svg`<rect x="2" y="1" width="10" height="10" fill=${color} />`
    : simbolo === "triangle" ? svg`<path d="M7,0.5 L13,11.5 L1,11.5Z" fill=${color} />`
    : svg`<circle cx="7" cy="6" r="5" fill=${color} />`;
  return svg`<svg width="14" height="12" aria-hidden="true">${forma}</svg>`;
}

// datos: filas largas, una por unidad y serie. fila(d) nombre del renglón,
// serie(d) nombre de la serie, valor(d) cifra. `series`: las tres series en
// su orden de identidad. `color(serie)`: categorias() de paleta.js.
// `ordenPor`: serie por la que se ordenan los renglones (de mayor a menor);
// su cifra se escribe junto al punto. `dominioX`: FIJO. `corto(fila)`.
export function puntosSeries(datos, {ancho, fila, serie, valor, series, color, ordenPor = null, dominioX = [0, 100], formato = pct, formatoEje = pctMarca, rotuloX = null, corto = null, incierta = () => false, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const nombre = (d) => (angosto && corto ? corto(fila(d)) : fila(d));
  const clave = ordenPor ?? series[0];
  const unidades = [...new Set(filas.map(fila))];
  const tramos = unidades.map((u) => {
    const v = filas.filter((d) => fila(d) === u);
    const ref = v.find((d) => serie(d) === clave);
    return {u, nombre: nombre(v[0]), a: Math.min(...v.map(valor)), b: Math.max(...v.map(valor)), orden: ref ? valor(ref) : -Infinity};
  }).sort((p, q) => q.orden - p.orden);
  const rotulados = filas.filter((d) => serie(d) === clave);
  const simbolo = (s) => SIMBOLOS[Math.max(0, series.indexOf(s))];
  const plot = Plot.plot(base({
    ancho, alto: tramos.length * 34 + 50, marginLeft: angosto ? Math.max(60, margenRotulos(tramos.map((t) => t.nombre), 76)) : margenRotulos(tramos.map((t) => t.nombre), 170), marginRight: 22, marginTop: rotuloX ? 50 : 34, marginBottom: 6,
    x: {axis: "top", label: rotuloX, labelArrow: "none", domain: dominioX, grid: true, tickFormat: formatoEje, ticks: angosto ? 4 : 6},
    y: {label: null, domain: tramos.map((t) => t.nombre), tickSize: 0},
    symbol: {domain: series, range: SIMBOLOS},
    marks: [
      Plot.ruleY(tramos, {y: "nombre", x1: "a", x2: "b", stroke: P.contexto, strokeWidth: 2.5, strokeLinecap: "round"}),
      Plot.dot(filas, {y: nombre, x: valor, symbol: serie, r: 6, fill: (d) => (incierta(d) ? P.fondo : color(serie(d))), stroke: (d) => color(serie(d)), strokeWidth: 1.6}),
      Plot.text(rotulados, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", y: nombre, x: valor, text: (d) => formato(valor(d)) + (incierta(d) ? " *" : ""), dy: -12, fill: P.tinta, fontWeight: 600, fontSize: TIPO.valor - 0.5}),
      Plot.dot(filas, Plot.pointerY({y: nombre, x: valor, r: 10, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  const leyenda = html`<div class="leyenda-items">${series.map((s) => html`<span class="leyenda-item">${muestra(simbolo(s), color(s))}<span>${s}</span></span>`)}${filas.some(incierta) ? html`<span class="leyenda-item">${svg`<svg width="14" height="12" aria-hidden="true"><circle cx="7" cy="6" r="4.5" fill="none" stroke=${P.tinta2} stroke-width="1.6"/></svg>`}<span>Hueco y *: estimación poco precisa</span></span>` : ""}</div>`;
  return html`<div class="forma gB-forma">${leyenda}${g ? conGlobo(plot, g) : plot}</div>`;
}
