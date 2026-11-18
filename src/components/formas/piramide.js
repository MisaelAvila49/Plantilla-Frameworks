// formas/piramide.js
// ¿Cómo se reparte una población por edad y sexo? Barras a la izquierda y a
// la derecha del eje, una por grupo de edad, del más joven (abajo) al mayor.
// Con `comparar`, una raya por barra marca el valor de otra edición.
// El tope del eje sale de `tope` (una constante del capítulo), no de la
// edición elegida, para que cambiar de año no mueva los ejes.
// No: comparar más de dos ediciones (heatmap de edad por año).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {pctEje} from "../formato.js";
import {base, vacio, viva, leyendaItems, conLeyenda} from "./comun.js";

// datos: una fila por edad y sexo. edad(d), lado(d) devuelve `izquierda` o
// `derecha` (los nombres de los dos sexos), valor(d). `edades`: orden de
// abajo hacia arriba.
export function piramide(datos, {ancho, edad, lado, valor, izquierda, derecha, edades, tope = null, comparar = null, nombreBarras = "", nombreComparar = "", formatoEje = pctEje, rotuloX = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const signo = (d) => (lado(d) === izquierda ? -1 : 1);
  const max = tope ?? d3.max([...filas, ...(comparar ?? [])], valor);
  const w = Math.min(ancho, 860);
  const plot = Plot.plot(base({
    ancho: w, alto: edades.length * 21 + 78, marginLeft: 64, marginRight: 12, marginTop: 34, marginBottom: 38,
    x: {label: rotuloX, domain: [-max, max], tickFormat: (v) => formatoEje(Math.abs(v)), grid: true, ticks: w < 520 ? 5 : 9},
    y: {label: null, domain: [...edades].reverse(), padding: 0.14, tickSize: 0},
    marks: [
      Plot.barX(filas, {y: edad, x: (d) => signo(d) * valor(d), fill: P.serie, ...viva(filas, g)}),
      comparar ? Plot.tickX(comparar, {y: edad, x: (d) => signo(d) * valor(d), stroke: P.tinta, strokeWidth: 2.2}) : null,
      Plot.ruleX([0], {stroke: P.fondo, strokeWidth: 2}),
      Plot.text([izquierda], {frameAnchor: "top-left", text: (d) => d, dy: -22, dx: 4, fontWeight: 700, fill: P.tinta}),
      Plot.text([derecha], {frameAnchor: "top-right", text: (d) => d, dy: -22, dx: -4, fontWeight: 700, fill: P.tinta}),
    ],
  }));
  if (!comparar) return plot;
  return conLeyenda(leyendaItems([{tipo: "cuadro", color: P.serie, texto: nombreBarras}, {tipo: "linea", color: P.tinta, texto: nombreComparar}]), plot);
}
