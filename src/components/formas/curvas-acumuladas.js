// formas/curvas-acumuladas.js
// ¿Qué parte de cada grupo queda por debajo de cualquier umbral, y cuánto los
// separa en cada uno? Dos curvas acumuladas (una por grupo) sobre la misma
// medida: cada punto dice qué parte del grupo tiene MENOS de x. En los
// umbrales reconocidos (primaria, secundaria…) una flecha une las dos curvas
// y las dos cifras van escritas. El primer grupo va en el tono de tema y el
// segundo en el gris de comparación; ninguno es rojo ni azul porque la forma
// no mide un sentido.
// No: un solo umbral reconocido (basta una barra), ni más de dos grupos.
import * as Plot from "npm:@observablehq/plot";
import {P} from "../paleta.js";
import {pctMarca, pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO} from "./comun.js";

// datos: [{grupo, x, pct}] con pct = % del grupo con menos de x. grupos:
// [primero, segundo]. umbrales: [{x, texto}]. dominioX: extremos FIJOS.
// Devuelve la gráfica; los rótulos de los umbrales van arriba, fuera del
// lienzo, solo si caben (en un teléfono la página los dice en la leyenda).
export function curvasAcumuladas(datos, {ancho, grupos, umbrales = [], dominioX, formatoX = (v) => String(v), rotuloX = null, rotuloY = null, globo: g}) {
  const filas = datos.filter((d) => d.pct != null && grupos.includes(d.grupo));
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const color = (k) => (k === grupos[0] ? P.serie : P.comparacion);
  const texto = (k) => (k === grupos[0] ? P.tonoTexto : P.tinta2);
  const valor = new Map(filas.map((d) => [`${d.grupo}|${d.x}`, d.pct]));
  const flechas = umbrales.map((u) => ({...u, a: valor.get(`${grupos[1]}|${u.x}`), b: valor.get(`${grupos[0]}|${u.x}`)})).filter((u) => u.a != null && u.b != null);
  const mt = angosto ? 28 : 34;
  const plot = Plot.plot(base({
    ancho, alto: Math.round(Math.max(300, Math.min(420, ancho * 0.5))), marginLeft: 50, marginRight: 16, marginTop: mt, marginBottom: 44,
    x: {domain: dominioX},
    y: {domain: [0, 100], label: rotuloY, labelArrow: "none", grid: true, tickFormat: pctMarca, ticks: 5},
    marks: [
      Plot.ruleX(umbrales, {x: "x", stroke: P.regla, strokeWidth: 1, strokeDasharray: "3 3"}),
      // Un eje x explícito apaga el implícito: se declaran los dos.
      Plot.axisX({anchor: "bottom", ticks: angosto ? [0, 6, 12, 18] : [0, 3, 6, 9, 12, 15, 18], tickFormat: formatoX, label: rotuloX, labelArrow: "none", labelAnchor: "left"}),
      angosto ? null : Plot.axisX(umbrales.map((u) => u.x), {anchor: "top", tickSize: 0, tickFormat: (x) => umbrales.find((u) => u.x === x)?.texto ?? "", fill: P.tinta2, fontWeight: 600, label: null}),
      Plot.line(filas, {x: "x", y: "pct", z: "grupo", stroke: (d) => color(d.grupo), strokeWidth: 2.6, curve: "step-after"}),
      Plot.arrow(flechas, {x1: "x", y1: "a", x2: "x", y2: "b", stroke: P.tinta, strokeWidth: 1.4, headLength: 7, insetStart: 4, insetEnd: 4}),
      // Cifras escritas: la del primer grupo arriba a la izquierda de la flecha, la del segundo abajo a la derecha.
      Plot.text(flechas, {x: "x", y: "b", text: (d) => pctEje(Math.round(d.b * 10) / 10), dx: -7, dy: -8, textAnchor: "end", fill: texto(grupos[0]), fontWeight: 700, fontSize: TIPO.valor, stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke"}),
      Plot.text(flechas, {x: "x", y: "a", text: (d) => pctEje(Math.round(d.a * 10) / 10), dx: 7, dy: 9, textAnchor: "start", fill: texto(grupos[1]), fontWeight: 600, fontSize: TIPO.valor, stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke"}),
      // Contorno del punto bajo el puntero: el eje que se recorre es x.
      Plot.dot(filas, Plot.pointerX({x: "x", y: "pct", r: 6, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("aria-label", `Curvas acumuladas de ${grupos[0]} y ${grupos[1]}. ${flechas.map((u) => `${u.texto}: ${pctEje(u.b)} y ${pctEje(u.a)} por ciento`).join(". ")}.`);
  return g ? conGlobo(plot, g) : plot;
}
