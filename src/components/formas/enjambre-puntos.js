// formas/enjambre-puntos.js
// ¿Dónde cae cada unidad y cómo se agrupan? Enjambre de puntos del MISMO
// tamaño sobre un eje: cada punto es una unidad (un municipio, una escuela)
// colocada según su valor, y los puntos se apilan hacia arriba y hacia abajo
// para no encimarse, así que el grosor del enjambre dice dónde se juntan más
// unidades. Un grupo puede ir destacado en el tono de tema y el resto en gris
// de fondo. La distancia de un punto al centro no significa nada.
// Diferencia con formas/enjambre.js: aquel dibuja burbujas con el tamaño de
// la población; este, puntos iguales, para cuando cada unidad cuenta igual.
// No: más de unas 500 unidades (histograma o hexbin), ni cuando importa
// cuánta gente pesa cada unidad (enjambre de burbujas).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {conGlobo} from "../globo.js";
import {base, vacio, azarEstable} from "./comun.js";

// Acomodo sin colisiones y sin azar: en orden del eje, cada punto toma el
// lugar libre más cercano a la línea central. `u` es la posición en px sobre
// el eje (el dato) y `w`, la separación del centro.
function apilar(nodos, r, sep) {
  const d = 2 * r + sep, puestos = [];
  for (const n of nodos) {
    const cerca = puestos.filter((p) => Math.abs(p.u - n.u) < d);
    const candidatas = [0];
    for (const p of cerca) { const h = Math.sqrt(Math.max(0, d * d - (n.u - p.u) ** 2)) + 0.01; candidatas.push(p.w + h, p.w - h); }
    candidatas.sort((a, b) => Math.abs(a) - Math.abs(b) || n.lado * (a - b));
    n.w = candidatas.find((w) => cerca.every((p) => (p.u - n.u) ** 2 + (p.w - w) ** 2 >= d * d - 1e-6)) ?? 0;
    puestos.push(n);
  }
  return d3.max(puestos, (p) => Math.abs(p.w)) ?? 0;
}

// datos: una fila por unidad. valor(d) posición sobre el eje, id(d) clave
// estable. `dominio`: extremos FIJOS. destacado(d): true para el grupo en
// color (sin él, todos en el tono). `referencia`: {valor, texto}, línea
// punteada cuyo rótulo va en la leyenda de la página, fuera del lienzo.
export function enjambrePuntos(datos, {ancho, valor, id = (d) => JSON.stringify(d), dominio, destacado = null, referencia = null, formatoEje = (v) => String(v), rotuloX = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const r = angosto ? 3.1 : 4.2, sep = angosto ? 0.6 : 0.9;
  const ml = 14, mr = 18, mt = 16, mb = 42;
  const x = d3.scaleLinear(dominio, [ml, ancho - mr]).clamp(true);
  const propio = (d) => (destacado ? Boolean(destacado(d)) : true);
  const nodos = d3.sort(filas, valor, id).map((d) => ({d, u: x(valor(d)), lado: azarEstable(id(d)) < 0.5 ? -1 : 1}));
  const semi = Math.max(40, apilar(nodos, r, sep) + r + 2);
  const alto = Math.round(mt + 2 * semi + mb);
  const centro = mt + semi;
  const puntos = d3.sort(nodos.map((n) => ({...n.d, _x: valor(n.d), _y: centro + n.w, _propio: propio(n.d)})), (p) => +p._propio);
  const plot = Plot.plot(base({
    ancho, alto, marginLeft: ml, marginRight: mr, marginTop: mt, marginBottom: mb,
    x: {domain: dominio, label: rotuloX, labelArrow: "none", labelAnchor: "left", grid: true, tickFormat: formatoEje, ticks: angosto ? 5 : 10},
    y: {type: "identity", axis: null},
    marks: [
      referencia?.valor != null ? Plot.ruleX([referencia.valor], {y1: mt, y2: alto - mb, stroke: P.tinta2, strokeWidth: 1.4, strokeDasharray: "4 3"}) : null,
      Plot.dot(puntos, {x: "_x", y: "_y", r, fill: (d) => (d._propio ? P.serie : P.apagado), stroke: (d) => (d._propio ? P.fondo : P.contexto), strokeWidth: 0.7}),
      // En un enjambre las dos posiciones son continuas: el puntero toma el
      // punto más cercano en las dos direcciones.
      Plot.dot(puntos, Plot.pointer({x: "_x", y: "_y", r: r + 3, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  const nPropios = puntos.filter((p) => p._propio).length;
  plot.setAttribute("aria-label", `Enjambre de ${puntos.length} puntos sobre un eje de ${formatoEje(dominio[0])} a ${formatoEje(dominio[1])}${destacado ? `, con ${nPropios} destacados` : ""}.${referencia ? ` ${referencia.texto}.` : ""}`);
  return g ? conGlobo(plot, g) : plot;
}
