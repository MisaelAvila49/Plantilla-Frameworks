// formas/franjas-tiempo.js
// ¿Cuál es la tendencia larga, de un vistazo? Una franja vertical por
// periodo, sin ejes de valor: el color dice si ese periodo quedó por arriba
// o por debajo de un periodo de referencia, y cuánto (rampa divergente con
// gris al centro). Debajo va una línea delgada con los valores, para que la
// cifra se pueda leer y no solo intuir. Inspirada en las franjas de
// calentamiento de Ed Hawkins (2018).
// (Archivo `franjas-tiempo.js` y no `franjas.js`: ese nombre ya es el de las
// franjas con mediana, una forma de distribución.)
// No: cuando hay que comparar varias series (horizonte o líneas), con menos
// de unos veinte periodos (barras o líneas) ni sin una referencia que tenga
// sentido para el lector.
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {html} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, viva} from "./comun.js";

// datos: una fila por periodo, en orden. tiempo(d) número que ordena (2005.25
// para el segundo trimestre de 2005). valor(d) la cifra o null (Sin dato).
// color(d): relleno de la franja (lo decide la página con su significado
// declarado y `sentido()`). referencia: {valor, tiempo} el periodo contra el
// que se compara; se marca con una raya en la línea de valores.
// `leyenda`: nodo con la leyenda que la página arma (rampa y significado).
// `dominio`: extremos FIJOS del eje de la línea.
export function franjasTiempo(datos, {ancho, tiempo, valor, color, referencia = null, dominio, marcasTiempo = null, formato = pct, formatoEje = pctEje,
  rotuloValor = null, leyenda = null, globo: g}) {
  if (!datos.some((d) => valor(d) != null)) return vacio();
  const filas = [...datos].sort((a, b) => tiempo(a) - tiempo(b));
  const angosto = ancho < 560;
  const medio = (d3.min(d3.pairs(filas.map(tiempo)), ([a, b]) => b - a) ?? 1) / 2;
  const dominioX = [tiempo(filas[0]) - medio, tiempo(filas.at(-1)) + medio];
  const margenes = {marginLeft: angosto ? 34 : 44, marginRight: 18};
  const ejeX = {domain: dominioX, label: null, tickFormat: (v) => String(Math.floor(v)), ticks: marcasTiempo ?? undefined, tickSize: 0};
  const franjas = Plot.plot(base({
    ancho, alto: angosto ? 120 : 160, ...margenes, marginTop: 4, marginBottom: 4,
    x: {...ejeX, axis: null},
    y: {axis: null, domain: [0, 1]},
    marks: [
      Plot.rect(filas, {x1: (d) => tiempo(d) - medio, x2: (d) => tiempo(d) + medio, y1: () => 0, y2: () => 1, fill: (d) => (valor(d) == null ? P.sinDato : color(d)),
        // El periodo sin dato lleva borde, como su casilla en la leyenda, para no
        // confundirse con el gris claro de «sin diferencia».
        stroke: (d) => (valor(d) == null ? P.bordeFuerte : "none"), strokeWidth: 1, ...viva(filas, g, {subir: true})}),
    ],
  }));
  franjas.setAttribute("role", "img");
  franjas.setAttribute("aria-label", `Franjas de ${filas.length} periodos, de ${Math.floor(tiempo(filas[0]))} a ${Math.floor(tiempo(filas.at(-1)))}, coloreadas según su diferencia con la referencia.`);
  const conValor = filas.filter((d) => valor(d) != null);
  const linea = Plot.plot(base({
    ancho, alto: angosto ? 120 : 140, ...margenes, marginTop: 10, marginBottom: 26,
    x: ejeX,
    y: {domain: dominio, label: rotuloValor, labelArrow: "none", tickFormat: formatoEje, ticks: 3, grid: true},
    marks: [
      referencia ? Plot.ruleY([referencia.valor], {stroke: P.regla, strokeWidth: 1.2, strokeDasharray: "4 3"}) : null,
      Plot.line(filas, {x: tiempo, y: (d) => valor(d) ?? NaN, stroke: P.tinta2, strokeWidth: 1.6}),
      referencia ? Plot.dot([referencia], {x: (d) => d.tiempo, y: (d) => d.valor, r: 4, fill: P.tinta, stroke: P.fondo, strokeWidth: 1.2}) : null,
      Plot.dot(conValor, Plot.pointerX({x: tiempo, y: valor, r: 5, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  linea.setAttribute("role", "img");
  linea.setAttribute("aria-label", `Línea de valores: de ${formato(valor(conValor[0]))} a ${formato(valor(conValor.at(-1)))}.`);
  return html`<div class="forma franjas-tiempo">${leyenda ?? ""}${franjas}${g ? conGlobo(linea, g) : linea}</div>`;
}
