// formas/cifra.js
// ¿Cuál es el número y hacia dónde va? Una cifra grande por unidad (país,
// ámbito, grupo), con el cambio desde el corte anterior y una línea pequeña
// con toda la serie, en la misma escala para todas las cifras. El punto de la
// línea marca el año elegido.
// No: varios números que se comparan entre sí (barras), ni series de menos
// de cinco cortes (una línea sugiere una continuidad que no se midió).
import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";
import {P, sentido} from "../paleta.js";
import {pct, puntos} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio} from "./comun.js";
import {glifo} from "./tabla-interaccion.js";

// tarjetas: [{nombre, filas: [...]}] una por cifra. x(d) el año, valor(d) la
// cifra, ee(d) su error estándar (para decidir si el cambio se distingue).
// `elegido`: año de la cifra grande. `dominioY`: FIJO y común a todas.
// `sig`: significado() del capítulo, que pinta el triángulo del cambio.
export function cifra(tarjetas, {ancho, x, valor, ee = () => null, elegido, dominioY, formato = pct, sig, globo: g}) {
  const conDato = tarjetas.filter((t) => t.filas.some((d) => valor(d) != null));
  if (!conDato.length) return vacio();
  const columnas = ancho < 560 ? 1 : Math.min(3, conDato.length);
  const anchoLinea = Math.min(360, Math.floor((ancho - (columnas - 1) * 32) / columnas));
  const bloques = conDato.map((t) => {
    const filas = t.filas.filter((d) => valor(d) != null).sort((a, b) => x(a) - x(b));
    const i = filas.findIndex((d) => x(d) === elegido);
    const actual = filas[i], previo = i > 0 ? filas[i - 1] : null;
    const s = actual && previo ? sentido(valor(previo), valor(actual), {eeA: ee(previo), eeB: ee(actual)}) : null;
    const plot = Plot.plot(base({
      ancho: anchoLinea, alto: 92, marginTop: 10, marginBottom: 22, marginLeft: 6, marginRight: 10,
      x: {label: null, tickFormat: String, ticks: [x(filas[0]), x(filas.at(-1))], tickSize: 0, inset: 6},
      y: {axis: null, domain: dominioY},
      marks: [
        Plot.ruleY([dominioY[0]], {stroke: P.rejilla}),
        Plot.lineY(filas, {x, y: valor, stroke: P.contexto, strokeWidth: 2, curve: "monotone-x"}),
        Plot.dot(filas, {x, y: valor, r: 2.2, fill: P.contexto}),
        actual ? Plot.dot([actual], {x, y: valor, r: 5, fill: P.serie, stroke: P.fondo, strokeWidth: 1.5}) : null,
        Plot.dot(filas, Plot.pointerX({x, y: valor, r: 7, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
      ],
    }));
    return html`<div class="gB-cifra">
      <span class="gB-cifra-nombre">${t.nombre}</span>
      <strong class="gB-cifra-valor">${actual ? formato(valor(actual)) : "Sin dato"}</strong>
      <span class="gB-cifra-cambio">${s ? [glifo(s, sig.color(s), 11), ` ${puntos(valor(actual) - valor(previo))} respecto a ${x(previo)}`] : previo ? "" : "Primer año de la serie"}</span>
      ${g ? conGlobo(plot, g) : plot}
    </div>`;
  });
  const leyenda = html`<div class="leyenda-items">${["baja", "sube", "igual"].map((k) => html`<span class="leyenda-item">${glifo(k, sig.color(k), 11)}<span>${sig.etiqueta(k)}</span></span>`)}</div>`;
  return html`<div class="forma gB-forma">${leyenda}<div class="gB-cifras" style=${`grid-template-columns: repeat(${columnas}, minmax(0, 1fr))`}>${bloques}</div></div>`;
}
