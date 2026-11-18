// formas/ranking.js
// ¿Quién está arriba y quién abajo? Barras horizontales ordenadas de mayor a
// menor, con el nombre a la izquierda y la cifra al final de la barra. Una
// unidad elegida se destaca en el tono de tema y las demás bajan a gris; la
// línea de referencia (el nacional) se rotula FUERA del lienzo (R43).
// Es FORMA BASE de respaldo (R70a); la variante llamativa del ranking largo
// es el lollipop.
// No: categorías con orden propio, como la edad (barras verticales).
import * as Plot from "npm:@observablehq/plot";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, margenRotulos, TIPO} from "./comun.js";

// datos: una fila por unidad. etiqueta(d) nombre, valor(d) cifra.
// `destacar`: etiqueta de la unidad destacada (o null: todas en el tono).
// `referencia`: {valor, texto} línea punteada vertical. `dominioX`: FIJO.
// `corto(etiqueta)`: nombre corto en pantallas angostas.
export function ranking(datos, {ancho, etiqueta, valor, destacar = null, referencia = null, dominioX = [0, 100], formato = pct, formatoEje = pctMarca, rotuloX = null, corto = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null).sort((a, b) => valor(b) - valor(a));
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const nombre = (d) => (angosto && corto ? corto(etiqueta(d)) : etiqueta(d));
  const tinta = (d) => (destacar == null || etiqueta(d) === destacar ? P.serie : P.contexto);
  const plot = Plot.plot(base({
    ancho, alto: filas.length * 22 + 44, marginLeft: angosto ? Math.max(60, margenRotulos(filas.map(nombre), 76)) : margenRotulos(filas.map(nombre), 180), marginRight: 70, marginTop: rotuloX ? 50 : 30, marginBottom: 6,
    x: {axis: "top", label: rotuloX, labelArrow: "none", domain: dominioX, grid: true, tickFormat: formatoEje, ticks: angosto ? 4 : 6},
    y: {label: null, domain: filas.map(nombre), tickSize: 0, padding: 0.18},
    marks: [
      Plot.barX(filas, {y: nombre, x: valor, fill: tinta, rx: 1.5}),
      Plot.ruleX([dominioX[0]], {stroke: P.regla}),
      referencia ? Plot.ruleX([referencia.valor], {stroke: P.tinta2, strokeWidth: 1.3, strokeDasharray: "4 3"}) : null,
      Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", y: nombre, x: valor, text: (d) => formato(valor(d)), dx: 6, textAnchor: "start", fill: P.tinta, fontSize: TIPO.valor}),
      Plot.barX(filas, Plot.pointerY({y: nombre, x: valor, fill: "none", stroke: P.tinta, strokeWidth: 1.8, maxRadius: Infinity})),
    ],
  }));
  // Rótulo de la referencia fuera del lienzo, entre la leyenda y la gráfica.
  const rotuloRef = referencia ? html`<div class="leyenda-items gB-referencia"><span class="leyenda-item">${svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${P.tinta2} stroke-width="1.6" stroke-dasharray="4 3"/></svg>`}<span>${referencia.texto}</span></span></div>` : "";
  return html`<div class="forma gB-forma">${rotuloRef}${g ? conGlobo(plot, g) : plot}</div>`;
}
