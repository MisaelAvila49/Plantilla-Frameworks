// formas/heatmap.js
// ¿Cómo se cruzan dos dimensiones? Una celda por combinación, con la cifra
// escrita y el color de esa MISMA cifra (rampa de una tinta, dominio fijo).
// Cada celda tiene su globo. Una combinación sin dato va en gris y se rotula.
// No: menos de tres categorías en alguna dimensión (barras agrupadas).
import * as Plot from "npm:@observablehq/plot";
import {P, tintaSobre} from "../paleta.js";
import {pctEje} from "../formato.js";
import {base, margenRotulos, vacio, viva, leyendaContinua, conLeyenda} from "./comun.js";

// datos: una fila por celda. x(d), y(d), valor(d). `escala`: rampaTema(dominio)
// o rampaCambio(limite). ordenX y ordenY fijan el orden de columnas y filas.
export function heatmap(datos, {ancho, x, y, valor, escala, ordenX, ordenY, formatoCelda = pctEje, tituloLeyenda = "", formatoLeyenda = pctEje, marcasLeyenda = null, rotuloX = null, altoFila = 30, globo: g}) {
  if (!datos.length) return vacio();
  const ml = margenRotulos(ordenY, ancho < 520 ? 132 : 190);
  const anchoCelda = (ancho - ml - 12) / ordenX.length;
  const completo = ordenY.flatMap((fy) => ordenX.map((fx) => datos.find((d) => x(d) === fx && y(d) === fy) ?? {_vacia: true, _x: fx, _y: fy}));
  const cx = (d) => (d._vacia ? d._x : x(d)), cy = (d) => (d._vacia ? d._y : y(d));
  const v = (d) => (d._vacia ? null : valor(d));
  const relleno = (d) => escala(v(d));
  const plot = Plot.plot(base({
    ancho, alto: ordenY.length * altoFila + 54, marginLeft: ml, marginRight: 12, marginTop: 34, marginBottom: 8,
    x: {axis: "top", label: rotuloX, domain: ordenX, tickSize: 0, tickFormat: String, padding: 0.04},
    y: {label: null, domain: ordenY, tickSize: 0, padding: 0.06},
    marks: [
      Plot.cell(completo, {x: cx, y: cy, fill: relleno, rx: 2, ...viva(completo, g)}),
      // Con celdas angostas la cifra no cabe: queda el color, el globo y la tabla.
      anchoCelda >= 48 ? Plot.text(completo, {x: cx, y: cy, text: (d) => (v(d) == null ? (anchoCelda >= 62 ? "Sin dato" : "") : formatoCelda(v(d))), fill: (d) => (v(d) == null ? P.tinta2 : tintaSobre(relleno(d))), fontSize: 12, pointerEvents: "none"}) : null,
    ],
  }));
  return conLeyenda(leyendaContinua(escala, {titulo: tituloLeyenda, formato: formatoLeyenda, marcas: marcasLeyenda, ancho: Math.min(300, ancho - 30)}), plot);
}
