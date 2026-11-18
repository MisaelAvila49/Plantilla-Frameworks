// formas/lollipop.js
// ¿Quién va arriba y quién abajo? Ranking largo: una fila por unidad, un
// tallo desde el cero y un punto en el valor. Con `destacar`, esa fila va en
// el tono de tema y las demás en gris de contexto.
// No: menos de seis filas (barras) ni comparación de dos valores (dumbbell).
import * as Plot from "npm:@observablehq/plot";
import {P} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, margenRotulos, vacio, TIPO} from "./comun.js";

export function lollipop(datos, {ancho, etiqueta, valor, color = null, destacar = null, formato = pct, formatoEje = pctMarca, rotuloX = null, dominioX = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null).sort((a, b) => valor(b) - valor(a));
  if (!filas.length) return vacio();
  const tinta = color ?? ((d) => (destacar == null || etiqueta(d) === destacar ? P.serie : P.contexto));
  const plot = Plot.plot(base({
    ancho, alto: filas.length * 23 + 58, marginLeft: margenRotulos(filas.map(etiqueta), ancho < 520 ? 130 : 190), marginRight: 74, marginTop: rotuloX ? 48 : 30,
    x: {axis: "top", label: rotuloX, labelArrow: "none", tickFormat: formatoEje, grid: true, nice: true, ticks: ancho < 520 ? 3 : undefined, ...(dominioX ? {domain: dominioX} : {zero: true})},
    y: {label: null, domain: filas.map(etiqueta), tickSize: 0},
    marks: [
      Plot.ruleY(filas, {y: etiqueta, x1: dominioX && dominioX[0] > 0 ? dominioX[0] : 0, x2: valor, stroke: tinta, strokeWidth: 1.6}),
      Plot.dot(filas, {y: etiqueta, x: valor, fill: tinta, r: 5}),
      // La cifra no queda encima del tallo ni de los nombres: a la derecha del
      // punto si el valor es positivo y a la derecha del cero si es negativo.
      Plot.text(filas.filter((d) => valor(d) >= 0), {y: etiqueta, x: valor, text: (d) => formato(valor(d)), dx: 10, textAnchor: "start", fill: P.tinta2, fontSize: TIPO.valor}),
      Plot.text(filas.filter((d) => valor(d) < 0), {y: etiqueta, x: () => 0, text: (d) => formato(valor(d)), dx: 8, textAnchor: "start", fill: P.tinta2, fontSize: TIPO.valor}),
      Plot.dot(filas, Plot.pointerY({y: etiqueta, x: valor, r: 8, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  return g ? conGlobo(plot, g) : plot;
}
