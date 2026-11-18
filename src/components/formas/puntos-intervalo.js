// formas/puntos-intervalo.js
// ¿Cuánto vale cada grupo y con qué margen lo sabemos? Un renglón por unidad
// con el punto de la estimación y una raya ancha con su intervalo de 95 %.
// Las estimaciones poco precisas van con punto hueco y asterisco. La línea
// de referencia (el nacional) va punteada y se rotula FUERA del lienzo.
// No: cifras sin error muestral (lollipop o barras), ni cuando el lector solo
// necesita el valor (barras con la tabla de precisión al lado).
import * as Plot from "npm:@observablehq/plot";
import {html, svg} from "npm:htl";
import {P, rampaTema} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, margenRotulos, TIPO} from "./comun.js";

// datos: una fila por unidad. etiqueta(d), valor(d) en %, ee(d) en puntos.
// `incierta(d)`: poco precisa. `referencia`: {valor, texto}. `dominioX`:
// FIJO. `corto(etiqueta)`: nombre corto en pantallas angostas.
export function puntosIntervalo(datos, {ancho, etiqueta, valor, ee, incierta = () => false, referencia = null, dominioX = [0, 100], formato = pct, formatoEje = pctMarca, rotuloX = null, corto = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null).map((d) => ({d, v: valor(d), lo: ee(d) == null ? null : Math.max(dominioX[0], valor(d) - 1.96 * ee(d)), hi: ee(d) == null ? null : Math.min(dominioX[1], valor(d) + 1.96 * ee(d))}))
    .sort((a, b) => b.v - a.v);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const nombre = (f) => (angosto && corto ? corto(etiqueta(f.d)) : etiqueta(f.d));
  // Tinta de la raya: un paso claro de la rampa del tono, no una opacidad.
  const claro = rampaTema([0, 1])(0.4);
  const plot = Plot.plot(base({
    ancho, alto: filas.length * 26 + 46, marginLeft: angosto ? Math.max(60, margenRotulos(filas.map(nombre), 76)) : margenRotulos(filas.map(nombre), 180), marginRight: 74, marginTop: rotuloX ? 50 : 30, marginBottom: 6,
    x: {axis: "top", label: rotuloX, labelArrow: "none", domain: dominioX, grid: true, tickFormat: formatoEje, ticks: angosto ? 4 : 7},
    y: {label: null, domain: filas.map(nombre), tickSize: 0},
    marks: [
      referencia ? Plot.ruleX([referencia.valor], {stroke: P.tinta2, strokeWidth: 1.3, strokeDasharray: "4 3"}) : null,
      Plot.ruleY(filas.filter((f) => f.lo != null), {y: nombre, x1: "lo", x2: "hi", stroke: claro, strokeWidth: 7, strokeLinecap: "round"}),
      Plot.dot(filas, {y: nombre, x: "v", r: 5, fill: (f) => (incierta(f.d) ? P.fondo : P.serie), stroke: P.serie, strokeWidth: 1.8}),
      Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", y: nombre, x: (f) => f.hi ?? f.v, text: (f) => formato(f.v) + (incierta(f.d) ? " *" : ""), dx: 9, textAnchor: "start", fill: P.tinta, fontSize: TIPO.valor, fontWeight: 600}),
      Plot.dot(filas, Plot.pointerY({y: nombre, x: "v", r: 9, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  const items = [
    html`<span class="leyenda-item">${svg`<svg width="34" height="12" aria-hidden="true"><line x1="3" y1="6" x2="31" y2="6" stroke=${claro} stroke-width="7" stroke-linecap="round"/><circle cx="17" cy="6" r="4" fill=${P.serie} /></svg>`}<span>Estimación e intervalo de 95 %</span></span>`,
    filas.some((f) => incierta(f.d)) ? html`<span class="leyenda-item">${svg`<svg width="14" height="12" aria-hidden="true"><circle cx="7" cy="6" r="4.2" fill=${P.fondo} stroke=${P.serie} stroke-width="1.8"/></svg>`}<span>Hueco y *: estimación poco precisa</span></span>` : "",
    referencia ? html`<span class="leyenda-item">${svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${P.tinta2} stroke-width="1.6" stroke-dasharray="4 3"/></svg>`}<span>${referencia.texto}</span></span>` : "",
  ];
  // El mismo dato que recibe el globo es el de la fila original.
  const plotConDato = g ? conGlobo(plot, {html: (f) => g.html(f.d ?? f), renglones: (f) => g.renglones(f.d ?? f)}) : plot;
  return html`<div class="forma gB-forma"><div class="leyenda-items">${items}</div>${plotConDato}</div>`;
}
