// formas/barras-apiladas.js
// ¿De qué partes se compone un total, y cómo cambia la composición? Una barra
// al 100 % por fila (edición o grupo), partida en categorías. El apilado se
// calcula aquí (no con Plot.stackX) para que el globo quede en el tramo que
// está bajo el puntero. El color va por CATEGORÍA, nunca por posición.
// No: más de cuatro categorías (tres con color y «Otras» en gris).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P, tintaSobre} from "../paleta.js";
import {pctEje, pct} from "../formato.js";
import {base, margenRotulos, vacio, viva, leyendaItems, conLeyenda} from "./comun.js";

// datos: una fila por (fila, categoría). valor(d) es la cantidad; la parte se
// calcula sobre el total de la fila. El dato del globo lleva `parte` (0-100)
// y `total`. `categorias`: orden fijo; color(categoria).
export function barrasApiladas(datos, {ancho, fila, categoria, valor, categorias, color, filas = null, altoFila = 34, globo: g}) {
  const validas = datos.filter((d) => valor(d) != null && categorias.includes(categoria(d)));
  if (!validas.length) return vacio();
  const orden = filas ?? [...new Set(validas.map(fila))];
  const tramos = [];
  for (const [k, f] of d3.group(validas, fila)) {
    const total = d3.sum(f, valor);
    let acum = 0;
    for (const c of categorias) {
      const d = f.find((r) => categoria(r) === c);
      if (!d || !total) continue;
      const parte = 100 * valor(d) / total;
      tramos.push({...d, parte, total, x1: acum, x2: acum + parte});
      acum += parte;
    }
  }
  const plot = Plot.plot(base({
    ancho, alto: orden.length * altoFila + 56, marginLeft: margenRotulos(orden, 150), marginRight: 30, marginTop: 28, marginBottom: 8,
    x: {axis: "top", label: null, domain: [0, 100], tickFormat: (v) => `${pctEje(v)} %`, ticks: ancho < 520 ? 3 : 5},
    y: {label: null, domain: orden, tickSize: 0, tickFormat: String, padding: 0.22},
    marks: [
      Plot.barX(tramos, {y: fila, x1: "x1", x2: "x2", fill: (d) => color(categoria(d)), insetLeft: 0.75, insetRight: 0.75, ...viva(tramos, g)}),
      Plot.text(tramos.filter((d) => (d.x2 - d.x1) * (ancho - 180) / 100 > 46), {y: fila, x: (d) => (d.x1 + d.x2) / 2, text: (d) => pct(d.parte), fill: (d) => tintaSobre(color(categoria(d))), fontSize: 12, pointerEvents: "none"}),
    ],
  }));
  return conLeyenda(leyendaItems(categorias.map((c) => ({tipo: "cuadro", color: color(c), texto: c}))), plot);
}
