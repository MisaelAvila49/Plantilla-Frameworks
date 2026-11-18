// formas/combinaciones.js
// ¿Cuántos tienen cada combinación de tres o cuatro condiciones a la vez?
// Un renglón por combinación exacta. A la izquierda, una matriz de puntos
// dice qué condiciones reúne (punto lleno: la tiene; punto gris: no) y una
// raya une las que van juntas. A la derecha, una barra con su parte del
// total. Las combinaciones son excluyentes, así que los renglones suman
// 100 %. Forma UpSet (Lex, Gehlenborg y otros, 2014).
// No: dos condiciones (basta un cruce de 2 × 2) ni más de cuatro (las
// combinaciones crecen al doble con cada una).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {pct} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";

// datos: una fila por combinación. tiene(d, condicion) true si la reúne.
// valor(d) porcentaje del total. `condiciones`: orden fijo de las columnas.
// `orden(a, b)` compara filas (por omisión, de la más a la menos frecuente).
// `nombre(d)`: rótulo accesible de la combinación.
export function combinaciones(datos, {ancho, condiciones, tiene, valor, orden = null, nombre = null, formato = pct, tope = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const lista = [...filas].sort(orden ?? ((a, b) => valor(b) - valor(a)));
  const clave = (d) => condiciones.map((c) => (tiene(d, c) ? 1 : 0)).join("");
  const angosto = ancho < 560;
  // La matriz ocupa un ancho fijo en píxeles; el resto es la barra.
  const paso = angosto ? 24 : 34;
  const matriz = paso * condiciones.length + 18;
  const maximo = tope ?? Math.ceil(d3.max(lista, valor) / 10) * 10;
  const anchoBarras = ancho - matriz - (angosto ? 58 : 70);
  // Una sola escala x: la matriz vive a la izquierda del cero, en unidades
  // de la barra, para que todo quepa en un plot con un solo puntero.
  const porPx = maximo / anchoBarras;
  const posicion = (i) => -(matriz - paso / 2 - i * paso) * porPx;
  const celdas = lista.flatMap((d) => condiciones.map((c, i) => ({d, k: clave(d), x: posicion(i), lleno: tiene(d, c)})));
  const uniones = lista.map((d) => {
    const xs = condiciones.map((c, i) => (tiene(d, c) ? posicion(i) : null)).filter((x) => x != null);
    return xs.length > 1 ? {k: clave(d), x1: d3.min(xs), x2: d3.max(xs)} : null;
  }).filter(Boolean);
  const altoFila = angosto ? 30 : 32;
  const cabeza = angosto ? 104 : 92;
  const plot = Plot.plot(base({
    ancho, alto: lista.length * altoFila + cabeza + 8, marginTop: cabeza, marginLeft: 0, marginRight: angosto ? 58 : 70, marginBottom: 8,
    x: {domain: [-matriz * porPx, maximo], axis: null},
    y: {domain: lista.map(clave), axis: null, padding: 0.22},
    marks: [
      // Nombres de las condiciones, inclinados sobre su columna.
      Plot.text(condiciones.map((c, i) => ({c, x: posicion(i)})), {x: "x", y: () => clave(lista[0]), dy: -(altoFila / 2 + 10), text: "c", rotate: -50, textAnchor: "start",
        fontSize: angosto ? 11.5 : TIPO.ejes - 0.5, fontWeight: 600, fill: P.tinta}),
      Plot.ruleY(lista.map(clave), {x1: () => -matriz * porPx, x2: () => maximo, stroke: P.rejilla, strokeWidth: 0.8}),
      Plot.ruleY(uniones, {y: "k", x1: "x1", x2: "x2", stroke: P.serie, strokeWidth: 2.6}),
      Plot.dot(celdas, {y: "k", x: "x", r: angosto ? 5 : 6, fill: (c) => (c.lleno ? P.serie : P.apagado), stroke: (c) => (c.lleno ? P.fondo : P.bordeFuerte), strokeWidth: 1}),
      Plot.ruleX([0], {stroke: P.regla}),
      Plot.barX(lista, {y: clave, x1: () => 0, x2: valor, fill: P.serie}),
      Plot.text(lista, {y: clave, x: valor, dx: 6, textAnchor: "start", text: (d) => formato(valor(d)), fontSize: TIPO.valor, fontWeight: 600, fill: P.tinta}),
      // El renglón es el eje categórico: el contorno abarca la barra.
      Plot.barX(lista, Plot.pointerY({y: clave, x1: () => -matriz * porPx, x2: valor, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `${lista.length} combinaciones de ${condiciones.length} condiciones. ` + lista.map((d) => `${nombre ? nombre(d) : clave(d)}: ${formato(valor(d))}`).join(". ") + ".");
  const leyenda = leyendaItems([
    {tipo: "punto", color: P.serie, texto: "Reúne la condición"},
    {tipo: "punto", color: P.apagado, texto: "No la reúne"},
  ]);
  return conLeyenda(leyenda, g ? conGlobo(plot, g) : plot);
}
