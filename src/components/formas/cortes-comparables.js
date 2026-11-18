// formas/cortes-comparables.js
// ¿Qué ediciones de cada fuente se pueden comparar entre sí, y dónde se
// rompe la serie? Un renglón por indicador: cada edición levantada es un
// punto, las ediciones comparables se unen con una barra continua (un
// tramo) y entre dos tramos va una raya punteada con el signo ≠, que dice
// que ahí cambió la definición o el diseño. No lleva cifras del tema: solo
// la cobertura de las fuentes.
// No: como figura de un resultado, ni con más de unos doce renglones (se
// vuelve una tabla).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {conGlobo} from "../globo.js";
import {base, vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";

// datos: una fila por edición. fila(d) nombre del renglón, anio(d), tramo(d)
// número de tramo dentro del renglón. dominio: años FIJOS del eje.
// apagada(d): true para una edición que se muestra en gris (fuera del
// resalte que pidió el lector). rotulo(fila) el texto sobre el renglón.
export function cortesComparables(datos, {ancho, fila, anio, tramo, dominio, apagada = () => false, rotulo = String, globo: g}) {
  if (!datos.length) return vacio();
  const filas = [...new Set(datos.map(fila))];
  const angosto = ancho < 560;
  const porTramo = d3.groups(datos, fila, tramo).flatMap(([f, ts]) => ts.map(([t, eds]) => {
    const anios = eds.map(anio).sort(d3.ascending);
    return {fila: f, tramo: t, x1: anios[0], x2: anios.at(-1), n: anios.length, apagado: eds.every(apagada), eds};
  }));
  const quiebres = d3.groups(porTramo, (t) => t.fila).flatMap(([f, ts]) => {
    const orden = ts.sort((a, b) => a.x1 - b.x1);
    return orden.slice(1).map((t, i) => ({fila: f, x1: orden[i].x2, x2: t.x1}));
  });
  const tinta = (apagado) => (apagado ? P.apagado : P.serie);
  const marcas = angosto ? [dominio[0], Math.round((dominio[0] + dominio[1]) / 2), dominio[1]] : d3.range(dominio[0], dominio[1] + 1, 5);
  const altoFila = angosto ? 54 : 52;
  const plot = Plot.plot(base({
    ancho, alto: filas.length * altoFila + 44, marginTop: 30, marginRight: 14, marginBottom: 8, marginLeft: 12,
    x: {domain: [dominio[0] - 0.6, dominio[1] + 0.6], axis: "top", grid: true, label: null, ticks: marcas, tickFormat: String, tickSize: 0},
    y: {type: "point", domain: filas, axis: null, padding: 0.75},
    marks: [
      // Rótulo del renglón encima de su línea, alineado al inicio del eje.
      Plot.text(filas, {y: (f) => f, x: () => dominio[0] - 0.6, dy: -14, textAnchor: "start", text: (f) => rotulo(f), fontSize: angosto ? 12 : TIPO.ejes, fontWeight: 600, fill: P.tinta}),
      Plot.link(quiebres, {y1: "fila", y2: "fila", x1: "x1", x2: "x2", stroke: P.regla, strokeDasharray: "2 4", strokeWidth: 1.5}),
      Plot.text(quiebres, {y: "fila", x: (d) => (d.x1 + d.x2) / 2, text: () => "≠", fontSize: 17, fontWeight: 700, fill: P.tinta, stroke: P.fondo, strokeWidth: 4, paintOrder: "stroke"}),
      Plot.ruleY(porTramo.filter((t) => t.n > 1), {y: "fila", x1: "x1", x2: "x2", stroke: (t) => tinta(t.apagado), strokeWidth: 4, strokeLinecap: "round"}),
      Plot.dot(datos, {y: fila, x: anio, r: angosto ? 4.4 : 5.2, fill: (d) => tinta(apagada(d)), stroke: P.fondo, strokeWidth: 1.5}),
      // El renglón es el eje categórico: el puntero elige el renglón y,
      // dentro de él, la edición más cercana.
      Plot.dot(datos, Plot.pointerY({y: fila, x: anio, r: 9, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `Ediciones de ${filas.length} indicadores. ` + filas.map((f) => {
    const ts = porTramo.filter((t) => t.fila === f).sort((a, b) => a.x1 - b.x1);
    return `${rotulo(f)}: ${ts.map((t) => (t.n > 1 ? `${t.x1} a ${t.x2}` : String(t.x1))).join(", luego ")}`;
  }).join(". ") + ".");
  const hayApagadas = datos.some(apagada);
  const leyenda = leyendaItems([
    {tipo: "linea", color: P.serie, texto: "Ediciones que se pueden comparar entre sí"},
    ...(hayApagadas ? [{tipo: "linea", color: P.apagado, texto: "Fuera de lo resaltado"}] : []),
    ...(quiebres.length ? [{tipo: "punteada", color: P.regla, texto: "≠ cambio de definición o de diseño"}] : []),
  ]);
  return conLeyenda(leyenda, g ? conGlobo(plot, g) : plot);
}
