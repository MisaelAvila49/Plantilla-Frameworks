// formas/lineas.js
// ¿Cómo cambia un valor en el tiempo? Una línea por serie, con el nombre al
// final de cada línea (sin leyenda aparte) y un punto por edición.
// No: más de cuatro o cinco series (usar heatmap o facetas).
import * as Plot from "npm:@observablehq/plot";
import {P} from "../paleta.js";
import {pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, altoTiempo, vacio, TIPO} from "./comun.js";

// Rótulos del eje x: todas las ediciones si caben (hasta `tope`); si no, un
// paso redondo (2, 5, 10… años) que deje rotulados el primer y el último año.
// Con 2005 - 2025 da 2005, 2010… 2025 en escritorio y 2005, 2015, 2025 en
// teléfono; así no se enciman ni quedan los extremos sin año.
const marcasAnio = (valores, tope) => {
  const t = [...valores].sort((a, b) => a - b);
  if (t.length <= tope) return t;
  const [a, z] = [t[0], t.at(-1)];
  const pasos = [2, 5, 10, 20, 25, 50];
  for (const paso of pasos) {
    const r = t.filter((v) => v % paso === 0);
    if (r.length <= tope && r[0] === a && r.at(-1) === z) return r;
  }
  for (const paso of pasos) {
    const r = t.filter((v) => (v - a) % paso === 0);
    if (r.length <= tope && r.at(-1) === z) return r;
  }
  const cada = Math.ceil(t.length / tope);
  return t.filter((_, i) => i % cada === 0);
};

// datos: filas largas. x(d) edición, y(d) valor, serie(d) nombre de la serie,
// color(serie) color de la serie, hueco(d) true para una edición estimada.
export function lineas(datos, {ancho, x, y, serie = () => "", color = () => P.serie, formatoY = pctEje, rotuloY = null, dominioY = null, globo: g, hueco = null}) {
  const filas = datos.filter((d) => y(d) != null);
  if (!filas.length) return vacio();
  const tinta = (d) => color(serie(d));
  const rotulos = filas.some((d) => serie(d));
  const plot = Plot.plot(base({
    ancho, alto: altoTiempo(ancho), marginRight: rotulos ? 118 : 24, marginLeft: 46, marginTop: 24,
    x: {label: null, tickFormat: (v) => String(v), ticks: marcasAnio([...new Set(filas.map(x))], ancho < 560 ? 4 : 10), inset: 8},
    y: {label: rotuloY, tickFormat: formatoY, grid: true, nice: true, ...(dominioY ? {domain: dominioY} : {zero: true})},
    marks: [
      Plot.ruleY([dominioY ? dominioY[0] : 0], {stroke: P.regla}),
      Plot.lineY(filas, {x, y, z: serie, stroke: tinta, strokeWidth: 2.4}),
      Plot.dot(filas, {x, y, fill: (d) => (hueco?.(d) ? P.fondo : tinta(d)), stroke: tinta, strokeWidth: 1.6, r: 3.6}),
      rotulos ? Plot.text(filas, Plot.selectLast({x, y, z: serie, text: serie, fill: tinta, dx: 9, textAnchor: "start", fontWeight: 600, fontSize: TIPO.valor, lineWidth: 9})) : null,
      Plot.dot(filas, Plot.pointer({x, y, r: 7, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  return g ? conGlobo(plot, g) : plot;
}
