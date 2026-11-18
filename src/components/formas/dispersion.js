// formas/dispersion.js
// ¿Se relacionan dos medidas? Un punto por unidad (entidad, municipio)
// colocado por sus dos valores. Las dos rayas punteadas son las medianas de
// cada medida (la unidad de en medio), en el gris de resumen y con el mismo
// trazo de las demás formas: parten la gráfica en cuatro cuadrantes que se
// leen en palabras llanas («arriba y a la derecha de las dos medianas»). Un
// grupo puede ir destacado en el tono de tema y el resto en gris de fondo, y
// unas pocas unidades llevan su nombre escrito.
// No: miles de puntos (hexbin), ni una sola unidad en el tiempo (dispersión
// conectada).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO} from "./comun.js";

// datos: una fila por unidad. x(d), y(d), nombre(d). dominioX y dominioY son
// FIJOS (no dependen del filtro). destacado(d): true para el grupo en color.
// rotulos: cuántas unidades llevan nombre (las de valores extremos entre las
// destacadas). medianas: {x, y} ya calculadas en la página, o null.
export function dispersion(datos, {ancho, x, y, nombre = () => "", dominioX, dominioY, destacado = null, medianas = null, rotulos = 4, formatoX = (v) => String(v), formatoY = (v) => String(v), rotuloX = null, rotuloY = null, globo: g}) {
  const filas = datos.filter((d) => x(d) != null && y(d) != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const propio = (d) => (destacado ? Boolean(destacado(d)) : true);
  const orden = d3.sort(filas, (d) => +propio(d));
  // Nombres: los extremos de cada medida entre las destacadas, sin repetir.
  const candidatas = filas.filter(propio);
  const alto = Math.round(Math.max(320, Math.min(460, ancho * 0.56)));
  const ml = 52, mr = angosto ? 14 : 24, mt = 22, mb = 44;
  // Caja de cada nombre en píxeles, con la misma escala de Plot: un nombre
  // que chocaría con otro ya puesto no se escribe (se lee en el globo).
  const sx = d3.scaleLinear(dominioX, [ml, ancho - mr]), sy = d3.scaleLinear(dominioY, [alto - mb, mt]);
  const izquierda = (d) => x(d) < (dominioX[0] + dominioX[1]) / 2;
  const caja = (d) => { const w = String(nombre(d)).length * TIPO.valor * 0.6, X = sx(x(d)), Y = sy(y(d)); return izquierda(d) ? {x: X + 9, y: Y + 4, w, h: 16} : {x: X - 9 - w, y: Y - 20, w, h: 16}; };
  const choca = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const elegidas = [];
  for (const f of [(d) => -x(d), (d) => x(d), (d) => -y(d), (d) => y(d)]) {
    const d = d3.least(candidatas.filter((c) => !elegidas.includes(c)), f);
    if (d && elegidas.length < (angosto ? Math.min(3, rotulos) : rotulos) && !elegidas.some((e) => choca(caja(e), caja(d)))) elegidas.push(d);
  }
  const plot = Plot.plot(base({
    ancho, alto, marginLeft: ml, marginRight: mr, marginTop: mt, marginBottom: mb,
    x: {domain: dominioX, label: rotuloX, labelArrow: "none", labelAnchor: "left", grid: true, tickFormat: formatoX, ticks: angosto ? 4 : 8},
    y: {domain: dominioY, label: rotuloY, labelArrow: "none", labelAnchor: "top", grid: true, tickFormat: formatoY, ticks: 6},
    marks: [
      medianas ? Plot.ruleX([medianas.x], {stroke: P.resumen, strokeWidth: 1.4, strokeDasharray: "3 2.5"}) : null,
      medianas ? Plot.ruleY([medianas.y], {stroke: P.resumen, strokeWidth: 1.4, strokeDasharray: "3 2.5"}) : null,
      Plot.dot(orden, {x, y, r: angosto ? 5 : 6.5, fill: (d) => (propio(d) ? P.serie : P.apagado), stroke: (d) => (propio(d) ? P.fondo : P.contexto), strokeWidth: 1}),
      // Nombres hacia el lado vacío: en la mitad izquierda abajo y a la
      // derecha del punto, en la derecha arriba y a la izquierda (dx y dy
      // son constantes en Plot, de ahí las dos marcas).
      Plot.text(elegidas.filter(izquierda), {x, y, text: nombre, dx: 9, dy: 12, textAnchor: "start", fill: P.tinta, fontSize: TIPO.valor, fontWeight: 600, stroke: P.fondo, strokeWidth: 3.5, paintOrder: "stroke"}),
      Plot.text(elegidas.filter((d) => !izquierda(d)), {x, y, text: nombre, dx: -9, dy: -12, textAnchor: "end", fill: P.tinta, fontSize: TIPO.valor, fontWeight: 600, stroke: P.fondo, strokeWidth: 3.5, paintOrder: "stroke"}),
      // Dispersión: las dos posiciones son continuas y el puntero toma el punto más cercano.
      Plot.dot(orden, Plot.pointer({x, y, r: angosto ? 8 : 9.5, fill: "none", stroke: P.tinta, strokeWidth: 1.8, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("aria-label", `Dispersión de ${filas.length} unidades${destacado ? `, con ${candidatas.length} destacadas` : ""}. ${elegidas.map((d) => `${nombre(d)}: ${formatoX(x(d))} y ${formatoY(y(d))}`).join(". ")}.`);
  return g ? conGlobo(plot, g) : plot;
}
