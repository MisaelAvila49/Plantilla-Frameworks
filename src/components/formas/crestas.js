// formas/crestas.js
// ¿Cómo se mueve una distribución de una edición a otra? Una cresta (curva
// suavizada) por edición, con las unidades reales como puntos dentro de la
// curva. La curva es un suavizado: cada unidad aporta un poco a los valores
// vecinos (`suavizado` puntos hacia cada lado), y la explicación de la
// gráfica tiene que decirlo. La altura de un punto no significa nada.
// No: menos de ocho unidades por edición (se dibujan solo los puntos).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, azarEstable} from "./comun.js";

const MIN_CURVA = 8;

// datos: una fila por unidad y edición. grupo(d) edición, valor(d), id(d).
// colorGrupo(grupo) pinta la cresta; color(d) pinta cada punto.
export function crestas(datos, {ancho, grupo, valor, id = (d) => JSON.stringify(d), dominio = [0, 100], suavizado = 4, colorGrupo = () => P.serie, color = null, orden = null, formatoEje = pctEje, rotuloX = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const porGrupo = d3.group(filas, grupo);
  const grupos = orden ?? [...porGrupo.keys()].sort(d3.ascending);
  // Las crestas no se enciman: con los puntos dentro de la curva, una cresta
  // montada sobre la de arriba tapa sus puntos.
  const n = grupos.length, base0 = (i) => n - 1 - i, alto = 0.9;
  const xs = d3.range(dominio[0], dominio[1] + 0.001, (dominio[1] - dominio[0]) / 120);
  const nucleo = (u) => Math.exp(-0.5 * u * u);
  const densidad = new Map(), tope = new Map();
  for (const [k, f] of porGrupo) {
    const v = f.map(valor);
    const d = xs.map((x) => d3.sum(v, (vi) => nucleo((x - vi) / suavizado)) / v.length);
    densidad.set(k, d); tope.set(k, d3.max(d) || 1);
  }
  const altura = (k, x) => {
    const d = densidad.get(k), t = (x - dominio[0]) / (dominio[1] - dominio[0]) * (xs.length - 1);
    const i = Math.max(0, Math.min(xs.length - 2, Math.floor(t))), f = t - i;
    return (d[i] + (d[i + 1] - d[i]) * f) / tope.get(k) * alto;
  };
  const curvas = grupos.filter((k) => porGrupo.get(k)?.length >= MIN_CURVA).flatMap((k, _, lista) => xs.map((x, j) => ({k, x, y1: base0(grupos.indexOf(k)), y2: base0(grupos.indexOf(k)) + densidad.get(k)[j] / tope.get(k) * alto})));
  const puntos = filas.filter((d) => porGrupo.has(grupo(d)) && grupos.includes(grupo(d))).map((d) => {
    const k = grupo(d), i = grupos.indexOf(k), h = porGrupo.get(k).length >= MIN_CURVA ? altura(k, valor(d)) : 0.5;
    return {...d, _y: base0(i) + 0.06 + azarEstable(`${id(d)}|${k}`) * Math.max(0.05, h * 0.86)};
  });
  const plot = Plot.plot(base({
    ancho, alto: n * 118 + 70, marginLeft: 58, marginRight: 20, marginTop: 30, marginBottom: 36,
    x: {label: rotuloX, tickFormat: formatoEje, domain: dominio, grid: true, ticks: ancho < 520 ? 5 : 10},
    y: {label: null, domain: [0, n - 1 + alto + 0.1], ticks: grupos.map((_, i) => base0(i)), tickFormat: (y) => String(grupos[n - 1 - y] ?? ""), tickSize: 0},
    marks: [
      Plot.areaY(curvas, {x: "x", y1: "y1", y2: "y2", z: "k", fill: (d) => colorGrupo(d.k), fillOpacity: 0.22, curve: "basis"}),
      Plot.lineY(curvas, {x: "x", y: "y2", z: "k", stroke: (d) => colorGrupo(d.k), strokeWidth: 1.6, curve: "basis"}),
      Plot.ruleY(grupos.map((_, i) => base0(i)), {stroke: P.regla, strokeWidth: 0.8}),
      Plot.dot(puntos, {x: valor, y: "_y", fill: color ?? ((d) => colorGrupo(grupo(d))), r: 2.6, fillOpacity: 0.9, stroke: P.fondo, strokeWidth: 0.4}),
      Plot.dot(puntos, Plot.pointer({x: valor, y: "_y", r: 6, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  return g ? conGlobo(plot, g) : plot;
}
