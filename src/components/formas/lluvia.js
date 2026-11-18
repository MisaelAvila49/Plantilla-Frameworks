// formas/lluvia.js
// ¿En qué se distinguen las distribuciones de unos pocos grupos, más allá de
// la mediana? Nube de lluvia: por cada grupo, arriba la NUBE (curva suavizada
// de la distribución, ponderada con el factor de expansión), en medio la
// franja de la mitad central con la raya punteada de la mediana (el mismo
// trazo de formas/franjas.js) y abajo la LLUVIA: un punto por persona de la
// muestra, para que se vea cuántos casos sostienen la curva. Deja ver dos
// jorobas o una cola que la caja sola esconde.
// La curva es un suavizado (`suavizado` unidades hacia cada lado) y la
// explicación de la gráfica tiene que decirlo. La altura de un punto de
// lluvia no significa nada.
// No: más de unos cinco grupos, ni un público sin tiempo para leer tres
// capas (caja o histograma).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {conGlobo} from "../globo.js";
import {base, margenRotulos, vacio, azarEstable, TIPO} from "./comun.js";

const MAX_GOTAS = 140;

// datos: una fila por persona de la muestra. grupo(d), valor(d), peso(d)
// (factor de expansión), id(d) clave estable. resumen: [{grupo, q1,
// mediana, q3}] calculado en la página con el factor. `orden`: grupos de
// arriba a abajo. `dominio`: extremos FIJOS. El puntero toma el renglón (el
// eje categórico es y) y el globo recibe la fila de `resumen`.
export function lluvia(datos, resumen, {ancho, grupo, valor, peso = () => 1, id = (d) => JSON.stringify(d), orden, dominio, suavizado = 3, formato = (v) => String(v), formatoEje = (v) => String(v), rotuloX = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const n = orden.length, base0 = (i) => n - 1 - i;
  const porGrupo = d3.group(filas, grupo);
  const xs = d3.range(dominio[0], dominio[1] + 1e-9, (dominio[1] - dominio[0]) / 140);
  const nucleo = (u) => Math.exp(-0.5 * u * u);
  // Nube: densidad ponderada, escalada a su propio máximo (dice la forma, no el tamaño del grupo).
  const nube = orden.flatMap((k, i) => {
    const f = porGrupo.get(k) ?? [];
    if (f.length < 8) return [];
    const total = d3.sum(f, peso);
    const d = xs.map((x) => d3.sum(f, (r) => peso(r) * nucleo((x - valor(r)) / suavizado)) / total);
    const tope = d3.max(d) || 1;
    return xs.map((x, j) => ({k, x, y1: base0(i) + 0.06, y2: base0(i) + 0.06 + (d[j] / tope) * 0.42}));
  });
  // Lluvia: hasta MAX_GOTAS personas por grupo, elegidas de forma estable.
  const gotas = orden.flatMap((k, i) => d3.sort(porGrupo.get(k) ?? [], (r) => azarEstable(id(r))).slice(0, MAX_GOTAS)
    .map((r) => ({...r, _y: base0(i) - 0.19 - azarEstable(`${id(r)}|y`) * 0.22})));
  const cajas = resumen.filter((d) => orden.includes(d.grupo)).map((d) => ({...d, _b: base0(orden.indexOf(d.grupo))}));
  const plot = Plot.plot(base({
    ancho, alto: n * (angosto ? 108 : 122) + 58, marginLeft: margenRotulos(orden, angosto ? 92 : 130), marginRight: angosto ? 16 : 24, marginTop: 40, marginBottom: 10,
    x: {axis: "top", domain: dominio, label: rotuloX, labelArrow: "none", labelAnchor: "left", grid: true, tickFormat: formatoEje, ticks: angosto ? 5 : 9},
    y: {domain: [-0.55, n - 1 + 0.62], ticks: orden.map((_, i) => base0(i)), tickFormat: (y) => String(orden[n - 1 - y] ?? ""), label: null, tickSize: 0},
    marks: [
      Plot.areaY(nube, {x: "x", y1: "y1", y2: "y2", z: "k", fill: P.serie, fillOpacity: 0.24, curve: "basis"}),
      Plot.lineY(nube, {x: "x", y: "y2", z: "k", stroke: P.serie, strokeWidth: 1.6, curve: "basis"}),
      Plot.rect(cajas, {x1: "q1", x2: "q3", y1: (d) => d._b - 0.1, y2: (d) => d._b + 0.01, fill: P.rejilla, stroke: P.resumen, strokeWidth: 0.8, rx: 2}),
      Plot.link(cajas, {x1: "mediana", x2: "mediana", y1: (d) => d._b - 0.14, y2: (d) => d._b + 0.05, stroke: P.tinta2, strokeWidth: 1.6, strokeDasharray: "3 2.5"}),
      Plot.dot(gotas, {x: valor, y: "_y", r: angosto ? 1.6 : 1.9, fill: P.serie, fillOpacity: 0.7}),
      // La mediana escrita a la derecha de la franja.
      Plot.text(cajas, {x: "q3", y: (d) => d._b - 0.045, text: (d) => `Mediana ${formato(d.mediana)}`, dx: 8, textAnchor: "start", fill: P.tinta, fontSize: TIPO.valor, fontWeight: 600, stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke"}),
      // Contorno del renglón bajo el puntero: el eje categórico es y.
      Plot.rect(cajas, Plot.pointerY({x1: dominio[0], x2: dominio[1], y1: (d) => d._b - 0.5, y2: (d) => d._b + 0.6, fill: "none", stroke: P.tinta, strokeWidth: 1.4, rx: 4, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("aria-label", `Nube de lluvia de ${n} grupos. ${cajas.map((d) => `${d.grupo}: mediana ${formato(d.mediana)}`).join(". ")}.`);
  return g ? conGlobo(plot, g) : plot;
}
