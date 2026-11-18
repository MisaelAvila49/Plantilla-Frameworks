// formas/dumbbell.js
// ¿De qué tamaño es la brecha? Dos valores por fila unidos por un segmento:
// dos grupos en el mismo año, o el mismo grupo en dos años.
// No: más de dos valores por fila (heatmap o facetas).
import * as Plot from "npm:@observablehq/plot";
import {P} from "../paleta.js";
import {pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, margenRotulos, vacio, leyendaItems, conLeyenda} from "./comun.js";

// datos: una fila por unidad. a(d) y b(d) son los dos valores; el dato que
// recibe el globo es {...d, lado: "a" | "b", v}. `colorSegmento(d)` permite
// pintar el segmento por sentido (rojo, azul o gris).
export function dumbbell(datos, {ancho, etiqueta, a, b, nombreA, nombreB, colorA = null, colorB = null, colorSegmento = null, orden = null, formatoEje = pctEje, rotuloX = null, dominioX = null, globo: g}) {
  const filas = datos.filter((d) => a(d) != null && b(d) != null).sort(orden ?? ((p, q) => b(q) - b(p)));
  if (!filas.length) return vacio();
  const cA = colorA ?? P.resumen, cB = colorB ?? P.serie;
  const puntos = filas.flatMap((d) => [{...d, lado: "a", v: a(d)}, {...d, lado: "b", v: b(d)}]);
  const tinta = (d) => (d.lado === "a" ? cA : cB);
  const plot = Plot.plot(base({
    ancho, alto: filas.length * 24 + 58, marginLeft: margenRotulos(filas.map(etiqueta), ancho < 520 ? 130 : 190), marginRight: 24, marginTop: rotuloX ? 48 : 30,
    x: {axis: "top", label: rotuloX, labelArrow: "none", tickFormat: formatoEje, grid: true, nice: true, ticks: ancho < 520 ? 4 : undefined, ...(dominioX ? {domain: dominioX} : {})},
    y: {label: null, domain: filas.map(etiqueta), tickSize: 0},
    marks: [
      Plot.ruleY(filas, {y: etiqueta, x1: a, x2: b, stroke: colorSegmento ?? P.contexto, strokeWidth: 3, strokeLinecap: "round"}),
      Plot.dot(puntos, {y: etiqueta, x: "v", fill: tinta, r: 5.5, stroke: P.fondo, strokeWidth: 1}),
      Plot.dot(puntos, Plot.pointer({y: etiqueta, x: "v", r: 8.5, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  return conLeyenda(leyendaItems([{tipo: "punto", color: cA, texto: nombreA}, {tipo: "punto", color: cB, texto: nombreB}]), g ? conGlobo(plot, g) : plot);
}
