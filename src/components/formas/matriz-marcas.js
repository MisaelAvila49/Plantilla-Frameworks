// formas/matriz-marcas.js
// ¿Qué tiene cada caso de una lista de rasgos? Una columna por caso (fuente,
// programa, ley) y un renglón por rasgo; en cada cruce, una marca que dice su
// estado con la FORMA y el color: punto lleno, anillo o punto chico gris. Una
// raya vertical une dos renglones cuando un caso los junta en una sola
// respuesta. No lleva cifras: compara definiciones, no magnitudes.
// No: cuando el cruce es una cifra (heatmap) o cuando los casos son más de
// ocho (no caben las columnas en un teléfono; tabla con íconos).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {conGlobo} from "../globo.js";
import {base, margenRotulos, leyendaItems, conLeyenda, TIPO} from "./comun.js";

// datos: una celda por caso y rasgo, {columna, fila, estado} (los nombres de
// las llaves se cambian con `columna`, `fila` y `estado`).
// `columnas`: [{id, cabeza: ["renglón 1", "renglón 2"], corto}] en su orden.
// `filas`: [{id, texto, corto}] en su orden.
// `estados`: {clave: {forma: "lleno" | "hueco" | "chico", color, leyenda}};
//   `color` es un hexadecimal o una función sin argumentos (para leer la
//   paleta del tema vigente al dibujar).
// `ordenLeyenda`: claves de estado en el orden de la leyenda (solo se
//   muestran las presentes).
// `uniones`: [{columna, desde, hasta, estado}]: raya que une dos renglones de
//   una columna; `textoUnion` la explica en la leyenda.
// `descripcion`: texto para el lector de pantalla (por omisión, cada columna
//   con sus estados y renglones).
export function matrizMarcas(datos, {ancho, columna = (d) => d.columna, fila = (d) => d.fila, estado = (d) => d.estado, columnas, filas, estados, ordenLeyenda = null,
  uniones = [], textoUnion = "Una sola respuesta reúne los dos renglones", descripcion = null, globo: g = null}) {
  const angosto = ancho < 560;
  const altoFila = angosto ? 32 : 36;
  // Encabezados: dos renglones horizontales en escritorio; en un teléfono,
  // uno inclinado sobre su columna (no caben seis a lo ancho).
  const cabeza = angosto ? 84 : 52;
  const nombreFila = (id) => {
    const r = filas.find((x) => x.id === id);
    return angosto ? r.corto ?? r.texto : r.texto;
  };
  const margenIzq = angosto ? margenRotulos(filas.map((x) => x.corto ?? x.texto), 96) : margenRotulos(filas.map((x) => x.texto), 230);
  const est = (d) => estados[estado(d)];
  const tono = (e) => (typeof e.color === "function" ? e.color() : e.color);
  const conForma = (f) => datos.filter((d) => est(d)?.forma === f);
  const x = (d) => columna(d), y = (d) => fila(d);
  const primera = filas[0].id;
  const plot = Plot.plot(base({
    ancho, alto: filas.length * altoFila + cabeza + 10,
    marginTop: cabeza, marginLeft: margenIzq, marginRight: angosto ? 34 : 24, marginBottom: 10,
    x: {type: "point", domain: columnas.map((c) => c.id), axis: null, padding: 0.5},
    y: {type: "point", domain: filas.map((r) => r.id), padding: 0.5, tickSize: 0, tickFormat: nombreFila, label: null},
    marks: [
      // Renglón guía a lo ancho de cada fila.
      Plot.ruleY(filas, {y: "id", stroke: P.rejilla, strokeWidth: 0.8}),
      angosto
        ? Plot.text(columnas, {x: "id", y: () => primera, dy: -(altoFila / 2 + 4), text: (c) => c.corto ?? c.cabeza.join(" "), rotate: -50, textAnchor: "start", fontSize: 11.5, fontWeight: 600, fill: P.tinta})
        : Plot.text(columnas, {x: "id", y: () => primera, dy: -(altoFila / 2 + 2), text: (c) => (c.cabeza ?? [c.corto]).join("\n"), lineAnchor: "bottom", textAnchor: "middle", fontSize: TIPO.ejes, fontWeight: 600, fill: P.tinta}),
      Plot.ruleX(uniones, {x: "columna", y1: "desde", y2: "hasta", stroke: (u) => tono(estados[u.estado]), strokeWidth: angosto ? 4 : 5, strokeLinecap: "round"}),
      Plot.dot(conForma("lleno"), {x, y, r: angosto ? 6 : 7, fill: (d) => tono(est(d)), stroke: P.fondo, strokeWidth: 1.2}),
      Plot.dot(conForma("hueco"), {x, y, r: angosto ? 5.2 : 6, fill: P.fondo, stroke: (d) => tono(est(d)), strokeWidth: 2.2}),
      Plot.dot(conForma("chico"), {x, y, r: 2.6, fill: (d) => tono(est(d))}),
      // Los dos ejes son categorías: el puntero toma la celda más cercana en
      // las dos direcciones, sin radio de captura.
      g ? Plot.dot(datos, Plot.pointer({x, y, r: angosto ? 10 : 11, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})) : null,
    ],
  }));
  plot.setAttribute("role", "group");
  const corto = (id) => (filas.find((r) => r.id === id)?.corto ?? id).toLowerCase();
  plot.setAttribute("aria-label", descripcion ?? columnas.map((c) => {
    const propias = datos.filter((d) => columna(d) === c.id);
    const grupos = d3.groups(propias, (d) => est(d)?.cifra ?? est(d)?.leyenda ?? estado(d));
    return `${c.corto ?? c.cabeza.join(" ")}: ${grupos.map(([e, ds]) => `${e.toLowerCase()}, ${ds.map((d) => corto(fila(d))).join(", ")}`).join("; ")}`;
  }).join(". ") + ".");
  const presentes = new Set(datos.map(estado));
  const forma = {lleno: "punto", hueco: "hueco", chico: "punto"};
  const leyenda = leyendaItems([
    ...(ordenLeyenda ?? Object.keys(estados)).filter((e) => presentes.has(e)).map((e) => ({tipo: forma[estados[e].forma], color: tono(estados[e]), texto: estados[e].leyenda})),
    ...(uniones.length ? [{tipo: "linea", color: P.tinta2, texto: textoUnion}] : []),
  ]);
  return conLeyenda(leyenda, g ? conGlobo(plot, g) : plot);
}
