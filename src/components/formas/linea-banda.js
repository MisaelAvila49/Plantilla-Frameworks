// formas/linea-banda.js
// ¿Cómo evoluciona una estimación de encuesta y qué cambios caben dentro del
// error? Una línea con un punto por corte y, detrás, la banda del intervalo
// de confianza. Un corte sin dato corta la línea: el hueco se une con una
// raya punteada y se rotula «Sin dato» al pie del eje, para que no se lea
// como una caída.
// No: dos o tres cortes (puntos con intervalo), ni cifras censales sin error.
import * as Plot from "npm:@observablehq/plot";
import {html, svg} from "npm:htl";
import {P, rampaTema} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, altoTiempo, vacio, TIPO} from "./comun.js";

// datos: una fila por corte, en orden. x(d) posición (número o fecha),
// rotulo(d) texto del corte («2020 T2»), valor(d) en % o null, ee(d).
// `z`: multiplicador del error (1.96 para 95 %). `dominioY`: FIJO.
// `marcasX`: posiciones con rótulo en el eje; `formatoX(x)`.
export function lineaBanda(datos, {ancho, x, valor, ee, z = 1.96, nivel = "95 %", dominioY = [0, 30], formato = pct, formatoEje = pctMarca, rotuloY = null, marcasX = null, formatoX = String, globo: g}) {
  const filas = datos.map((d) => {
    const v = valor(d), e = ee(d);
    return {d, x: x(d), v, lo: v == null || e == null ? null : Math.max(dominioY[0], v - z * e), hi: v == null || e == null ? null : Math.min(dominioY[1], v + z * e)};
  });
  const conValor = filas.filter((f) => f.v != null);
  if (!conValor.length) return vacio();
  const angosto = ancho < 560;
  const claro = rampaTema([0, 1])(0.3);
  // Huecos: corte sin dato entre dos con dato. Se unen con una raya punteada.
  const huecos = filas.filter((f) => f.v == null);
  const puentes = huecos.map((h) => {
    const i = filas.indexOf(h);
    const a = filas.slice(0, i).reverse().find((f) => f.v != null), b = filas.slice(i + 1).find((f) => f.v != null);
    return a && b ? {x1: a.x, y1: a.v, x2: b.x, y2: b.v} : null;
  }).filter(Boolean);
  const ultimo = conValor.at(-1);
  const plot = Plot.plot(base({
    ancho, alto: altoTiempo(ancho), marginLeft: 48, marginRight: angosto ? 16 : 54, marginTop: rotuloY ? 30 : 16, marginBottom: 30,
    x: {label: null, ticks: marcasX ?? undefined, tickFormat: formatoX, tickSize: 4, inset: 6},
    y: {label: rotuloY, labelAnchor: "top", labelArrow: "none", domain: dominioY, grid: true, tickFormat: formatoEje, ticks: 5},
    marks: [
      Plot.areaY(filas, {x: "x", y1: (f) => f.lo ?? undefined, y2: (f) => f.hi ?? undefined, fill: claro, curve: "linear"}),
      Plot.ruleY([dominioY[0]], {stroke: P.regla}),
      Plot.link(puentes, {x1: "x1", y1: "y1", x2: "x2", y2: "y2", stroke: P.serie, strokeWidth: 1.6, strokeDasharray: "3 3"}),
      Plot.lineY(filas, {x: "x", y: (f) => f.v ?? undefined, stroke: P.serie, strokeWidth: 2.4}),
      Plot.dot(conValor, {x: "x", y: "v", r: 2.6, fill: P.serie}),
      Plot.text(huecos, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", x: "x", y: dominioY[0], text: () => "Sin dato", dy: -8, fill: P.tinta2, fontSize: TIPO.valor - 1}),
      Plot.text([ultimo], {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", x: "x", y: "v", text: (f) => formato(f.v), dx: 8, dy: -10, textAnchor: angosto ? "end" : "start", fill: P.tinta, fontWeight: 700, fontSize: TIPO.valor}),
      Plot.ruleX(conValor, Plot.pointerX({x: "x", stroke: P.tinta2, strokeWidth: 1, maxRadius: Infinity})),
      Plot.dot(conValor, Plot.pointerX({x: "x", y: "v", r: 6.5, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  const leyenda = html`<div class="leyenda-items">
    <span class="leyenda-item">${svg`<svg width="30" height="14" aria-hidden="true"><rect x="1" y="1" width="28" height="12" rx="2" fill=${claro} /><line x1="1" y1="7" x2="29" y2="7" stroke=${P.serie} stroke-width="2.4"/></svg>`}<span>Estimación e intervalo de ${nivel}</span></span>
    ${puentes.length ? html`<span class="leyenda-item">${svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${P.serie} stroke-width="1.6" stroke-dasharray="3 3"/></svg>`}<span>Corte sin dato</span></span>` : ""}
  </div>`;
  return html`<div class="forma gB-forma">${leyenda}${g ? conGlobo(plot, {html: (f) => g.html(f.d ?? f), renglones: (f) => g.renglones(f.d ?? f)}) : plot}</div>`;
}
