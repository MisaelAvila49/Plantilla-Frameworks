// formas/franjas.js
// ¿Qué tan parejo es un grupo por dentro? Un renglón por grupo (entidad) con
// sus unidades (municipios) como puntos, la franja de la mitad central
// (25 a 75 %) y la raya de la mediana. La altura de cada punto dentro del
// renglón no significa nada: solo separa los puntos.
// No: grupos con menos de unas ocho unidades (basta listar los valores).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, margenRotulos, vacio, azarEstable} from "./comun.js";

// datos: una fila por unidad. grupo(d), valor(d), id(d) (para el reparto
// estable), color(d). `orden`: lista de grupos de arriba a abajo. Devuelve
// también `resumen` (mediana y cuartiles por grupo) para la tabla.
export function franjas(datos, {ancho, grupo, valor, id = (d) => JSON.stringify(d), color = () => P.serie, orden = null, formatoEje = pctEje, rotuloX = null, dominioX = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const porGrupo = d3.group(filas, grupo);
  const grupos = orden ?? [...porGrupo.keys()].sort((a, b) => d3.median(porGrupo.get(b), valor) - d3.median(porGrupo.get(a), valor));
  const pos = new Map(grupos.map((n, i) => [n, i]));
  const resumen = grupos.filter((n) => porGrupo.has(n)).map((n) => {
    const v = porGrupo.get(n).map(valor).sort(d3.ascending);
    return {grupo: n, y: pos.get(n), q1: d3.quantileSorted(v, 0.25), mediana: d3.quantileSorted(v, 0.5), q3: d3.quantileSorted(v, 0.75), n: v.length};
  });
  const puntos = filas.filter((d) => pos.has(grupo(d))).map((d) => ({...d, _y: pos.get(grupo(d)) + (azarEstable(id(d)) - 0.5) * 0.56}));
  const plot = Plot.plot(base({
    ancho, alto: grupos.length * 34 + 62, marginLeft: margenRotulos(grupos, ancho < 520 ? 130 : 190), marginRight: 20, marginTop: rotuloX ? 48 : 30,
    x: {axis: "top", label: rotuloX, labelArrow: "none", tickFormat: formatoEje, grid: true, nice: true, ticks: ancho < 520 ? 4 : undefined, ...(dominioX ? {domain: dominioX} : {})},
    y: {label: null, domain: [grupos.length - 0.5, -0.5], ticks: grupos.map((_, i) => i), tickFormat: (i) => grupos[i] ?? "", tickSize: 0},
    marks: [
      Plot.rect(resumen, {x1: "q1", x2: "q3", y1: (d) => d.y - 0.36, y2: (d) => d.y + 0.36, fill: P.rejilla, rx: 3}),
      Plot.dot(puntos, {x: valor, y: "_y", fill: color, r: 3.2, fillOpacity: 0.85, stroke: P.fondo, strokeWidth: 0.5}),
      Plot.link(resumen, {x1: "mediana", x2: "mediana", y1: (d) => d.y - 0.42, y2: (d) => d.y + 0.42, stroke: P.tinta2, strokeWidth: 1.6, strokeDasharray: "3 2.5"}),
      Plot.dot(puntos, Plot.pointer({x: valor, y: "_y", r: 6.5, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  const nodo = g ? conGlobo(plot, g) : plot;
  nodo.resumen = resumen;
  return nodo;
}
