// formas/diferencia-margen.js
// ¿Qué unidades están de verdad por encima o por debajo de la referencia, y
// cuáles no se distinguen? Un renglón por unidad con la diferencia en puntos
// frente a la referencia y su intervalo de 95 %. El color sale del intervalo:
// si queda entero debajo del cero, el rojo del capítulo; si queda entero
// arriba, el azul; si cruza el cero, gris («no se distingue del margen»).
// No: cifras sin error muestral (lollipop centrado en cero).
import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";
import {P} from "../paleta.js";
import {puntos} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, rotulosFila, leyendaItems, TIPO} from "./comun.js";

// Lado de una diferencia con su error: "baja", "sube" o "igual".
export const ladoDe = (dif, ee) => (dif == null ? null : ee == null ? (Math.abs(dif) < 0.05 ? "igual" : dif < 0 ? "baja" : "sube")
  : dif + 1.96 * ee < 0 ? "baja" : dif - 1.96 * ee > 0 ? "sube" : "igual");

// datos: una fila por unidad. etiqueta(d), dif(d) en puntos, ee(d) error de
// la diferencia. `sig`: significado() del capítulo. `limite`: dominio FIJO
// simétrico en puntos. `corto(etiqueta)`.
export function diferenciaMargen(datos, {ancho, etiqueta, dif, ee, sig, limite = 30, rotuloX = null, corto = null, globo: g}) {
  const filas = datos.filter((d) => dif(d) != null).map((d) => {
    const e = ee(d), v = dif(d);
    return {d, v, lo: e == null ? v : Math.max(-limite, v - 1.96 * e), hi: e == null ? v : Math.min(limite, v + 1.96 * e), lado: ladoDe(v, e)};
  }).sort((a, b) => b.v - a.v);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const nombre = (f) => (angosto && corto ? corto(etiqueta(f.d)) : etiqueta(f.d));
  const tinta = (f) => sig.color(f.lado);
  const signoEje = (x) => (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x);
  const rf = rotulosFila(filas.map(nombre), ancho, {tope: 180});
  const plot = Plot.plot(base({
    ancho, alto: filas.length * (26 + rf.extra) + 46, marginLeft: rf.margen, marginRight: angosto ? 52 : 66, marginTop: rotuloX ? 50 : 30, marginBottom: 6,
    x: {axis: "top", label: rotuloX, labelArrow: "none", domain: [-limite, limite], grid: true, tickFormat: signoEje, ticks: angosto ? 5 : 7},
    y: {label: null, domain: filas.map(nombre), tickSize: 0},
    marks: [
      rf.eje,
      Plot.ruleX([0], {stroke: P.tinta, strokeWidth: 1.2}),
      Plot.ruleY(filas, {y: nombre, x1: "lo", x2: "hi", stroke: tinta, strokeOpacity: 0.4, strokeWidth: 7, strokeLinecap: "round"}),
      Plot.dot(filas, {y: nombre, x: "v", r: 5, fill: tinta, stroke: P.fondo, strokeWidth: 1}),
      Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", y: nombre, x: "hi", text: (f) => puntos(f.v).replace(/ puntos?$/, ""), dx: 9, textAnchor: "start", fill: P.tinta, fontSize: TIPO.valor, fontWeight: 600}),
      Plot.dot(filas, Plot.pointerY({y: nombre, x: "v", r: 9, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  const presentes = new Set(filas.map((f) => f.lado));
  const leyenda = leyendaItems(sig.leyenda("punto").filter((i) => presentes.has(i.texto === sig.rojo ? sig.desfavorable : i.texto === sig.azul ? sig.favorable : "igual")));
  return html`<div class="forma gB-forma">${leyenda}${g ? conGlobo(plot, {html: (f) => g.html(f.d ?? f), renglones: (f) => g.renglones(f.d ?? f)}) : plot}</div>`;
}
