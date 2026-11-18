// formas/marimekko.js
// ¿Cómo se compone cada grupo cuando los grupos tienen tamaños distintos?
// Un renglón por grupo cuyo ALTO es su tamaño (su parte del total) y que se
// reparte a lo ancho, al 100 %, entre las partes. Así se leen dos cosas a la
// vez: qué grupo pesa más (el alto) y de qué está hecho (el ancho de cada
// tramo). Va acostado para que los nombres largos y la columna de un
// teléfono quepan.
// No: grupos de tamaño parecido (barras apiladas al 100 %), lectura precisa
// de una parte (lollipop), ni un grupo tan chico que su renglón no se ve.
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P, tintaSobre} from "../paleta.js";
import {pct} from "../formato.js";
import {base, vacio, viva, leyendaItems, conLeyenda, TIPO} from "./comun.js";

// datos: una fila por grupo y parte. grupo(d), parte(d), valor(d) (personas,
// no porcentajes: el tamaño del grupo sale de la suma). `partes`: orden fijo
// de los tramos, de izquierda a derecha. color(parte). `orden(a, b)` compara
// {grupo, total, partes: Map}. El dato de cada tramo lleva `_parte` (% del
// grupo), `_grupoParte` (% del total) y `_total`.
export function marimekko(datos, {ancho, grupo, parte, valor, partes, color, orden = null, formato = pct, globo: g}) {
  const filas = datos.filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const total = d3.sum(filas, valor);
  let grupos = d3.groups(filas, grupo).map(([nombre, f]) => ({grupo: nombre, total: d3.sum(f, valor), partes: new Map(f.map((d) => [parte(d), d]))}));
  grupos = orden ? grupos.sort(orden) : grupos.sort((a, b) => b.total - a.total);
  const angosto = ancho < 560;
  const H = angosto ? 470 : 440;
  // En un teléfono el nombre de cada grupo va en el hueco de arriba de su
  // renglón, así que el hueco es más alto; el alto del renglón sigue siendo
  // proporcional a su tamaño.
  const separacion = angosto ? 20 : 3;
  const util = H - separacion * (grupos.length - (angosto ? 0 : 1));
  let y = angosto ? separacion : 0;
  const tramos = grupos.flatMap((gr) => {
    const alto = util * gr.total / total, y1 = y;
    y += alto + separacion;
    let x = 0;
    return partes.filter((p) => gr.partes.has(p)).map((p) => {
      const d = gr.partes.get(p), w = 100 * valor(d) / gr.total, x1 = x;
      x += w;
      return {...d, _grupo: gr.grupo, _nombreParte: p, _x1: x1, _x2: x, _y1: y1, _y2: y1 + alto, _parte: w, _grupoParte: 100 * gr.total / total, _total: gr.total};
    });
  });
  const izquierda = angosto ? 6 : Math.min(200, 14 + d3.max(grupos, (gr) => String(gr.grupo).length) * 7.1);
  const anchoUtil = ancho - izquierda - 10;
  const cabeCifra = (d) => (d._x2 - d._x1) / 100 * anchoUtil > 46 && d._y2 - d._y1 > 16;
  // El nombre del grupo: a la izquierda en escritorio; dentro del primer
  // tramo, arriba, en un teléfono (si el renglón tiene alto para dos líneas).
  const rotulos = grupos.map((gr) => {
    const t = tramos.find((d) => d._grupo === gr.grupo);
    return {grupo: gr.grupo, y: (t._y1 + t._y2) / 2, y1: t._y1, alto: t._y2 - t._y1, parteTotal: 100 * gr.total / total, color: color(t._nombreParte)};
  });
  const plot = Plot.plot(base({
    ancho, alto: H + 34, marginLeft: izquierda, marginRight: 18, marginTop: 28, marginBottom: 6,
    x: {domain: [0, 100], axis: "top", label: null, tickFormat: (v) => `${v}`, ticks: angosto ? 4 : 10, tickSize: 0, grid: false},
    y: {domain: [0, H], axis: null, reverse: true},
    marks: [
      Plot.rect(tramos, {x1: "_x1", x2: "_x2", y1: "_y1", y2: "_y2", fill: (d) => color(d._nombreParte), inset: 0.5, ...viva(tramos, g, {subir: true})}),
      Plot.text(tramos.filter(cabeCifra), {x: (d) => (d._x1 + d._x2) / 2, y: (d) => (d._y1 + d._y2) / 2, text: (d) => formato(d._parte),
        fill: (d) => tintaSobre(color(d._nombreParte)), fontSize: 12, fontWeight: 600, pointerEvents: "none"}),
      angosto
        ? Plot.text(rotulos, {x: () => 0, y: (r) => r.y1 - 5, text: (r) => `${r.grupo} · ${formato(r.parteTotal)} del total`, textAnchor: "start",
          fill: P.tinta, fontSize: 11.5, fontWeight: 700, pointerEvents: "none"})
        : Plot.text(rotulos, {x: () => 0, y: "y", dx: -8, text: (r) => (r.alto > 30 ? `${r.grupo}\n${formato(r.parteTotal)} del total` : r.grupo), textAnchor: "end",
          fill: P.tinta, fontSize: TIPO.valor - 0.5, lineHeight: 1.15, pointerEvents: "none"}),
    ],
  }));
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `${grupos.length} grupos, del más grande al más chico. ` + grupos.map((gr) => `${gr.grupo}, ${formato(100 * gr.total / total)} del total: ` +
    partes.filter((p) => gr.partes.has(p)).map((p) => `${p} ${formato(100 * valor(gr.partes.get(p)) / gr.total)}`).join(", ")).join(". ") + ".");
  const nodo = conLeyenda(leyendaItems(partes.map((p) => ({tipo: "cuadro", color: color(p), texto: p}))), plot);
  nodo.grupos = grupos;
  nodo.total = total;
  return nodo;
}
