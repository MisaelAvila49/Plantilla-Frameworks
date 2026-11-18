// formas/rango.js
// ¿Qué tan distintos son los lugares dentro de cada grupo, del mínimo al
// máximo? Un renglón por unidad (entidad) con una raya gris que va de su
// parte más baja a la más alta (municipios) y un punto con el valor de toda
// la unidad. Los dos extremos llevan su cifra.
// No: cuando interesa cómo se reparten las partes entre los extremos
// (franjas con mediana o enjambre).
import * as Plot from "npm:@observablehq/plot";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, margenRotulos, TIPO} from "./comun.js";

const corta = (v) => (v == null ? "" : (Math.round(v * 10) / 10).toFixed(1));

// datos: una fila por unidad. etiqueta(d), valor(d) la unidad completa,
// minimo(d) y maximo(d) sus partes extremas. `dominioX`: FIJO.
// `nombreParte`: «municipio». `corto(etiqueta)`.
export function rango(datos, {ancho, etiqueta, valor, minimo, maximo, dominioX = [0, 100], formato = pct, formatoEje = pctMarca, rotuloX = null, nombreUnidad = "entidad", nombreParte = "municipio", corto = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null).sort((a, b) => valor(b) - valor(a));
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const nombre = (d) => (angosto && corto ? corto(etiqueta(d)) : etiqueta(d));
  const plot = Plot.plot(base({
    ancho, alto: filas.length * 30 + 46, marginLeft: angosto ? Math.max(60, margenRotulos(filas.map(nombre), 76)) : margenRotulos(filas.map(nombre), 180), marginRight: 40, marginTop: rotuloX ? 50 : 30, marginBottom: 6,
    x: {axis: "top", label: rotuloX, labelArrow: "none", domain: dominioX, grid: true, tickFormat: formatoEje, ticks: angosto ? 4 : 6},
    y: {label: null, domain: filas.map(nombre), tickSize: 0},
    marks: [
      Plot.ruleY(filas, {y: nombre, x1: minimo, x2: maximo, stroke: P.contexto, strokeWidth: 8, strokeLinecap: "round"}),
      angosto ? null : Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", y: nombre, x: minimo, text: (d) => corta(minimo(d)), dx: -9, textAnchor: "end", fill: P.tinta2, fontSize: TIPO.valor - 1}),
      Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", y: nombre, x: maximo, text: (d) => corta(maximo(d)), dx: 9, textAnchor: "start", fill: P.tinta2, fontSize: TIPO.valor - 1}),
      Plot.dot(filas, {y: nombre, x: valor, r: 5.5, fill: P.serie, stroke: P.fondo, strokeWidth: 1.4}),
      Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", y: nombre, x: valor, text: (d) => corta(valor(d)), dy: -11, fill: P.tinta, fontWeight: 700, fontSize: TIPO.valor - 0.5}),
      Plot.dot(filas, Plot.pointerY({y: nombre, x: valor, r: 9.5, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  const leyenda = html`<div class="leyenda-items">
    <span class="leyenda-item">${svg`<svg width="14" height="12" aria-hidden="true"><circle cx="7" cy="6" r="5" fill=${P.serie} /></svg>`}<span>Toda la ${nombreUnidad}</span></span>
    <span class="leyenda-item">${svg`<svg width="34" height="12" aria-hidden="true"><line x1="4" y1="6" x2="30" y2="6" stroke=${P.contexto} stroke-width="8" stroke-linecap="round"/></svg>`}<span>Del ${nombreParte} más bajo al más alto</span></span>
  </div>`;
  return html`<div class="forma gB-forma">${leyenda}${g ? conGlobo(plot, g) : plot}</div>`;
}
