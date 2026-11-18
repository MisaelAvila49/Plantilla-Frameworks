// formas/conectada.js
// ¿Cómo se movieron dos medidas juntas a lo largo del tiempo? Dispersión
// conectada: un punto por edición, colocado por sus dos valores, y una
// flecha de cada edición a la siguiente, en el orden de los años. Deja ver
// idas y vueltas que dos líneas separadas esconden («la escolaridad siguió
// subiendo y el ingreso bajó»). La unidad elegida va en el tono de tema; las
// demás trayectorias, si se pasan, quedan al fondo en gris para dar
// contexto. Los años van escritos mientras no se enciman.
// No: muchas unidades a la vez (se vuelve un nudo: dos líneas), ni menos de
// cinco ediciones (pendiente o flechas).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO} from "./comun.js";

// datos: una fila por edición de la unidad elegida. x(d), y(d), anio(d).
// fondo: filas de otras unidades, con unidad(d), dibujadas en gris.
// dominioX y dominioY son FIJOS: elegir otra unidad no mueve los ejes.
export function conectada(datos, {ancho, x, y, anio, fondo = [], unidad = () => "", dominioX, dominioY, formatoX = (v) => String(v), formatoY = (v) => String(v), rotuloX = null, rotuloY = null, globo: g}) {
  const filas = d3.sort(datos.filter((d) => x(d) != null && y(d) != null), anio);
  if (filas.length < 2) return vacio();
  const angosto = ancho < 560;
  const alto = Math.round(Math.max(340, Math.min(480, ancho * 0.58)));
  const ml = 60, mr = angosto ? 24 : 28, mt = 26, mb = 44;
  // Años escritos sin encimarse: se calcula la caja de cada rótulo en
  // píxeles con la misma escala de Plot y se omite el que choca con uno ya
  // puesto. El primer año y el último se escriben siempre; los omitidos se
  // leen en el globo y en la tabla.
  const sx = d3.scaleLinear(dominioX, [ml, ancho - mr]), sy = d3.scaleLinear(dominioY, [alto - mb, mt]);
  const caja = (d) => ({x: sx(x(d)) - 17, y: sy(y(d)) - 26, w: 34, h: 15});
  const choca = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const escritos = [];
  for (const d of [filas[0], filas[filas.length - 1], ...filas.slice(1, -1)]) if (!escritos.some((e) => choca(caja(e), caja(d)))) escritos.push(d);
  // Una flecha por tramo, de una edición a la siguiente: el sentido del
  // tiempo se lee en todo el recorrido, no solo al final.
  const tramos = filas.slice(1).map((d, i) => ({a: filas[i], b: d}));
  const plot = Plot.plot(base({
    ancho, alto, marginLeft: ml, marginRight: mr, marginTop: mt, marginBottom: mb,
    x: {domain: dominioX, label: rotuloX, labelArrow: "none", labelAnchor: "left", grid: true, tickFormat: formatoX, ticks: angosto ? 4 : 8},
    y: {domain: dominioY, label: rotuloY, labelArrow: "none", labelAnchor: "top", grid: true, tickFormat: formatoY, ticks: 6},
    marks: [
      Plot.line(fondo, {x, y, z: unidad, sort: anio, stroke: P.contexto, strokeWidth: 1.2}),
      Plot.arrow(tramos, {x1: (t) => x(t.a), y1: (t) => y(t.a), x2: (t) => x(t.b), y2: (t) => y(t.b), stroke: P.serie, strokeWidth: 2.2, headLength: 7, insetStart: 6, insetEnd: 6}),
      Plot.dot(filas, {x, y, r: 4.6, fill: P.fondo, stroke: P.serie, strokeWidth: 2}),
      Plot.text(escritos, {x, y, text: (d) => String(anio(d)), dy: -13, fill: P.tinta, fontSize: TIPO.valor, fontWeight: 600, stroke: P.fondo, strokeWidth: 3.5, paintOrder: "stroke"}),
      // Las dos posiciones son continuas: el puntero toma el punto más cercano.
      Plot.dot(filas, Plot.pointer({x, y, r: 8, fill: "none", stroke: P.tinta, strokeWidth: 1.8, maxRadius: Infinity})),
    ],
  }));
  const a = filas[0], b = filas[filas.length - 1];
  plot.setAttribute("aria-label", `Dispersión conectada de ${anio(a)} a ${anio(b)}: de ${formatoX(x(a))} y ${formatoY(y(a))} a ${formatoX(x(b))} y ${formatoY(y(b))}.`);
  return g ? conGlobo(plot, g) : plot;
}
