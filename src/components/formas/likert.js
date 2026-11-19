// formas/likert.js
// ¿Qué tan de acuerdo (o satisfechas) están las personas? Una barra por
// pregunta, partida en las respuestas de una escala ordenada. Las respuestas
// negativas van a la izquierda del cero y las positivas a la derecha; la
// neutra se parte a la mitad, centrada en el cero. Cada lado lleva escrito su
// total, así que se comparan los dos extremos sin sumar tramos a ojo.
// No: respuestas sin orden (barras apiladas o ranking) ni escalas sin punto
// neutro claro.
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P, tintaSobre} from "../paleta.js";
import {pctMarca, pct} from "../formato.js";
import {base, vacio, viva, leyendaItems, conLeyenda, rotulosFila, TIPO} from "./comun.js";

// datos: una fila por pregunta y respuesta. fila(d) la pregunta, respuesta(d),
// valor(d) porcentaje de la fila (las respuestas de una fila suman 100).
// `respuestas`: orden de la escala, de la más negativa a la más positiva,
// con un número impar de pasos (el del centro es el neutro). `colores`: un
// tono por respuesta (la página los toma de la rampa divergente con su
// significado declarado). `orden(a, b)` compara {fila, negativo, positivo}.
// El nodo trae `resumen` con los totales de cada lado.
export function likert(datos, {ancho, fila, respuesta, valor, respuestas, colores, orden = null, formato = pct, textoNegativo = "En contra", textoPositivo = "A favor",
  globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const k = respuestas.length, centro = (k - 1) / 2;
  const angosto = ancho < 560;
  let resumen = d3.groups(filas, fila).map(([f, rs]) => {
    const por = new Map(rs.map((d) => [respuesta(d), d]));
    const v = (r) => (por.get(r) ? valor(por.get(r)) : 0);
    const negativo = d3.sum(respuestas.slice(0, Math.floor(centro)), v), positivo = d3.sum(respuestas.slice(Math.floor(centro) + 1), v);
    const neutro = v(respuestas[Math.floor(centro)]);
    return {fila: f, negativo, positivo, neutro, por};
  });
  if (orden) resumen = [...resumen].sort(orden);
  const tramos = resumen.flatMap((r) => {
    let x = -(r.negativo + r.neutro / 2);
    return respuestas.map((resp, i) => {
      const d = r.por.get(resp);
      const ancho_ = d ? valor(d) : 0;
      const t = {...(d ?? {}), _fila: r.fila, _resp: resp, _i: i, _x1: x, _x2: x + ancho_, _v: ancho_};
      x += ancho_;
      return t;
    }).filter((t) => t._v > 0);
  });
  // Dominio simétrico: el lado más largo más el espacio de su total escrito.
  const tope = Math.max(60, Math.ceil(d3.max(resumen, (r) => Math.max(r.negativo, r.positivo) + r.neutro / 2) / 10) * 10 + (angosto ? 20 : 12));
  // En pantalla ancha el rótulo va a la izquierda, medido del más largo y
  // partido en renglones si pasa del tope; en un teléfono va encima de su
  // barra y los márgenes dejan lugar a la marca extrema del eje y al total
  // escrito junto a la punta, que no se cortan.
  const rf = rotulosFila(resumen.map((r) => r.fila), ancho, {tope: 220});
  const izquierda = angosto ? 18 : rf.margen;
  const altoFila = angosto ? 54 : 38 + rf.extra;
  const ordenFilas = resumen.map((r) => r.fila);
  const plot = Plot.plot(base({
    ancho, alto: resumen.length * altoFila + 42, marginLeft: izquierda, marginRight: angosto ? 18 : 10, marginTop: 30, marginBottom: 6,
    x: {domain: [-tope, tope], axis: "top", tickFormat: (v) => pctMarca(Math.abs(v)), ticks: angosto ? 5 : 9, grid: true, label: null, tickSize: 0},
    y: {domain: ordenFilas, axis: angosto || rf.eje ? null : "left", label: null, tickSize: 0, padding: angosto ? 0.42 : 0.2},
    color: {domain: respuestas, range: colores},
    marks: [
      !angosto ? rf.eje : null,
      Plot.barX(tramos, {y: "_fila", x1: "_x1", x2: "_x2", fill: (d) => colores[d._i], insetTop: angosto ? 10 : 0, ...viva(tramos, g, {subir: true})}),
      // Cifra dentro del tramo cuando cabe y cuando no repite el total de su
      // lado: con un solo tramo por lado, la cifra de dentro y la de la punta
      // eran el mismo dato dos veces («79» dentro y «79.2 %» fuera).
      Plot.text(tramos.filter((d) => (d._x2 - d._x1) * (ancho - izquierda) / (2 * tope) > 30 && (d._i === Math.floor(centro) && k % 2 === 1
        || tramos.filter((t) => t._fila === d._fila && Math.sign(t._i - centro) === Math.sign(d._i - centro)).length > 1)), {y: "_fila", x: (d) => (d._x1 + d._x2) / 2, dy: angosto ? 5 : 0,
        text: (d) => d3.format(".0f")(d._v), fill: (d) => tintaSobre(colores[d._i]), fontSize: 11.5, fontWeight: 600, pointerEvents: "none"}),
      Plot.ruleX([0], {stroke: P.tinta, strokeWidth: 1.3}),
      // Total de cada lado, escrito junto a la punta de la barra.
      Plot.text(resumen, {y: "fila", x: (r) => -(r.negativo + r.neutro / 2), dx: -6, dy: angosto ? 5 : 0, textAnchor: "end", text: (r) => formato(r.negativo), fill: P.tinta, fontSize: TIPO.valor, fontWeight: 700}),
      Plot.text(resumen, {y: "fila", x: (r) => r.positivo + r.neutro / 2, dx: 6, dy: angosto ? 5 : 0, textAnchor: "start", text: (r) => formato(r.positivo), fill: P.tinta, fontSize: TIPO.valor, fontWeight: 700}),
      // En un teléfono la pregunta va encima de su barra.
      angosto ? Plot.text(resumen, {y: "fila", x: () => -tope, text: "fila", textAnchor: "start", lineAnchor: "bottom", dy: -8, lineWidth: (ancho - 40) / 12, fontSize: 12, fontWeight: 600, fill: P.tinta}) : null,
    ],
  }));
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `Respuestas a ${resumen.length} preguntas. ` + resumen.map((r) => `${r.fila}: ${textoNegativo.toLowerCase()} ${formato(r.negativo)}, ${textoPositivo.toLowerCase()} ${formato(r.positivo)}`).join(". ") + ".");
  const leyenda = leyendaItems(respuestas.map((resp, i) => ({tipo: "cuadro", color: colores[i], texto: resp})));
  const nodo = conLeyenda(leyenda, plot);
  nodo.resumen = resumen;
  return nodo;
}
