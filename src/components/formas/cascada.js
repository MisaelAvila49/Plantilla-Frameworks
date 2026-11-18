// formas/cascada.js
// ¿Qué partes explican el cambio de un total? Un renglón por parte, de
// arriba a abajo: el total del primer año, lo que suma o resta cada parte
// (una barra que flota donde terminó la anterior) y el total del último año.
// Los totales son rayas gruesas, no barras: el eje no empieza en cero, así
// que una barra que naciera en el borde mentiría sobre su tamaño. Una raya
// punteada lleva el acumulado de un renglón al siguiente.
// No: cuando las partes no suman el total (barras de diferencia), ni con más
// de unas diez partes (se pierde el hilo del acumulado).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {numero} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";

// pasos: una fila por parte, en el orden en que se apilan, con `cambio` en
// las unidades del eje. inicio y fin: {etiqueta, valor} de los dos totales
// (fin.valor = inicio.valor + suma de cambios; se comprueba). color(d): tono
// de cada parte (la página lo decide con su significado declarado).
// dominio: extremos FIJOS del eje. formatoTotal, formatoCambio: textos.
export function cascada(pasos, {ancho, inicio, fin, color, dominio, formatoTotal = (v) => numero(v, 1), formatoCambio = (v) => numero(v, 1), formatoEje = String,
  rotuloEje = null, leyenda = [], globo: g}) {
  if (!pasos.length) return vacio();
  let acumulado = inicio.valor;
  const filas = [
    {...inicio, _tipo: "total", _x1: inicio.valor, _x2: inicio.valor},
    ...pasos.map((d) => { const x1 = acumulado; acumulado += d.cambio; return {...d, _tipo: "paso", _x1: x1, _x2: acumulado}; }),
    {...fin, _tipo: "total", _x1: fin.valor, _x2: fin.valor},
  ];
  if (Math.abs(acumulado - fin.valor) > 1e-6 * Math.max(1, Math.abs(fin.valor))) console.warn("cascada(): las partes no suman el cambio entre los totales.");
  const orden = filas.map((d) => d.etiqueta);
  const angosto = ancho < 560;
  const largo = d3.max(orden, (t) => String(t).length);
  const izquierda = angosto ? 8 : Math.min(230, 16 + largo * 7.1);
  const altoFila = angosto ? 50 : 36;
  const totales = filas.filter((d) => d._tipo === "total"), partes = filas.filter((d) => d._tipo === "paso");
  const uniones = filas.slice(0, -1).map((d, i) => ({y1: d.etiqueta, y2: filas[i + 1].etiqueta, x: d._x2}));
  const texto = (d) => (d._tipo === "total" ? formatoTotal(d.valor) : formatoCambio(d.cambio));
  const plot = Plot.plot(base({
    ancho, alto: filas.length * altoFila + 44, marginLeft: izquierda, marginRight: angosto ? 12 : 24, marginTop: rotuloEje ? 42 : 30, marginBottom: 6,
    x: {domain: dominio, axis: "top", grid: true, label: rotuloEje, labelArrow: "none", tickFormat: formatoEje, ticks: angosto ? 4 : 8},
    y: {domain: orden, axis: angosto ? null : "left", label: null, tickSize: 0, padding: angosto ? 0.42 : 0.24},
    marks: [
      Plot.link(uniones, {x1: "x", x2: "x", y1: "y1", y2: "y2", stroke: P.regla, strokeDasharray: "3 3"}),
      Plot.barX(partes, {y: "etiqueta", x1: "_x1", x2: "_x2", fill: color, insetTop: angosto ? 12 : 0}),
      Plot.tickX(totales, {y: "etiqueta", x: "_x1", stroke: P.tinta2, strokeWidth: 5, insetTop: angosto ? 12 : 0}),
      Plot.text(filas, {y: "etiqueta", x: (d) => Math.max(d._x1, d._x2), dx: 9, dy: angosto ? 6 : 0, textAnchor: "start", text: texto,
        fill: P.tinta, fontSize: TIPO.valor, fontWeight: 700}),
      angosto ? Plot.text(filas, {y: "etiqueta", x: () => dominio[0], dy: -14, textAnchor: "start", text: "etiqueta", fontSize: 12, fontWeight: 600, fill: P.tinta}) : null,
      // El renglón es el eje categórico.
      Plot.barX(filas, Plot.pointerY({y: "etiqueta", x1: (d) => Math.min(d._x1, d._x2) - (d._tipo === "total" ? 0.25 : 0), x2: (d) => Math.max(d._x1, d._x2) + (d._tipo === "total" ? 0.25 : 0),
        fill: "none", stroke: P.tinta, strokeWidth: 1.6, insetTop: angosto ? 12 : 0, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `Cascada: ${inicio.etiqueta}, ${formatoTotal(inicio.valor)}. ` + partes.map((d) => `${d.etiqueta}, ${formatoCambio(d.cambio)}`).join(". ") +
    `. ${fin.etiqueta}, ${formatoTotal(fin.valor)}.`);
  const items = leyendaItems([{tipo: "linea", color: P.tinta2, texto: "Total de cada año"}, ...leyenda]);
  return conLeyenda(items, g ? conGlobo(plot, g) : plot);
}
