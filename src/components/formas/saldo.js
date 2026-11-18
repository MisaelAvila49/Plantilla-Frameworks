// formas/saldo.js
// ¿Cuántas personas salen y cuántas llegan a cada lugar, y cuál es su saldo?
// Entradas y salidas con saldo: una fila por lugar, las salidas hacia la
// izquierda (rojo, «salen») y las llegadas hacia la derecha (azul, «llegan»)
// desde un mismo cero, y un punto con el saldo (llegan menos salen) con su
// cifra escrita al final de la fila. Las filas van ordenadas por saldo.
// Muestra los dos sentidos: un saldo cercano a cero puede esconder dos flujos
// grandes que se cancelan.
// No: cuando interesa de dónde a dónde (sankey, matriz, mapa de flujos), ni
// con más de unas 35 filas.
import * as Plot from "npm:@observablehq/plot";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {base, viva, vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";

// filas: una por lugar. salen(d), llegan(d): la cantidad de cada sentido.
// tope: extremo FIJO del eje (la misma escala con cualquier filtro).
// formato(v): cifra escrita del saldo. corto(d): rótulo de la fila en
// pantallas angostas. color: {salen, llegan} (por omisión, rojo y azul del
// capítulo). rotulos: {salen, llegan, saldo, eje} textos de la leyenda.
// globo: de cada barra, con el dato {...d, sentido, v, saldo}. globoSaldo:
// del punto del saldo.
export function saldo(filas, {
  ancho, nombre, corto = nombre, salen, llegan, tope, marcas = null, formato = entero, formatoEje = entero, color = null,
  rotulos = {salen: "Salen", llegan: "Llegan", saldo: "Saldo: llegan menos salen", eje: "← salen · llegan →"}, destacar = null,
  globo: g = null, globoSaldo: gs = null,
}) {
  const datos = filas.filter((d) => salen(d) != null && llegan(d) != null).map((d) => ({...d, saldo: llegan(d) - salen(d)}));
  if (!datos.length) return vacio("Sin entradas ni salidas para esta selección.");
  datos.sort((a, b) => b.saldo - a.saldo);
  const angosto = ancho < 520;
  const tinta = {salen: color?.salen ?? P.rojo, llegan: color?.llegan ?? P.azul};
  const rotulo = angosto ? corto : nombre;
  const orden = datos.map(rotulo);
  const barras = datos.flatMap((d) => [
    {...d, sentido: "salen", v: salen(d), x: -Math.min(salen(d), tope)},
    {...d, sentido: "llegan", v: llegan(d), x: Math.min(llegan(d), tope)},
  ]);
  const apagada = (d) => destacar != null && !destacar(d);
  const ticks = angosto ? [-(marcas?.at(-1) ?? tope), 0, marcas?.at(-1) ?? tope] : marcas ?? [-tope, -tope / 2, 0, tope / 2, tope];
  const plot = Plot.plot(base({
    ancho, alto: datos.length * (angosto ? 22 : 24) + 62,
    marginLeft: angosto ? 50 : Math.min(170, 16 + Math.max(...orden.map((t) => String(t).length)) * 7.2), marginRight: angosto ? 66 : 92, marginTop: 40,
    x: {axis: "top", domain: [-tope, tope], ticks, tickFormat: (v) => formatoEje(Math.abs(v)), grid: true, label: rotulos.eje, labelAnchor: "center", labelArrow: "none"},
    y: {label: null, domain: orden, tickSize: 0},
    marks: [
      Plot.barX(barras, {y: rotulo, x: "x", fill: (d) => tinta[d.sentido], fillOpacity: (d) => (apagada(d) ? 0.28 : 0.88), insetTop: 3, insetBottom: 3, ...viva(barras, g)}),
      Plot.ruleX([0], {stroke: P.tinta, strokeWidth: 1.2}),
      Plot.dot(datos, {y: rotulo, x: (d) => Math.max(-tope, Math.min(tope, d.saldo)), r: 4.6, fill: P.tinta, stroke: P.fondo, strokeWidth: 1.4, fillOpacity: (d) => (apagada(d) ? 0.35 : 1), ...viva(datos, gs)}),
      Plot.text(datos, {y: rotulo, frameAnchor: "right", dx: angosto ? 62 : 86, textAnchor: "end", fontSize: TIPO.valor, fontWeight: 600, fill: P.tinta2,
        text: (d) => `${d.saldo > 0 ? "+" : d.saldo < 0 ? "−" : ""}${formato(Math.abs(d.saldo))}`}),
    ],
  }));
  plot.setAttribute("aria-label", `${rotulos.salen} y ${rotulos.llegan.toLowerCase()} de ${datos.length} lugares, ordenados por saldo. Mayor saldo: ${nombre(datos[0])}. Menor saldo: ${nombre(datos.at(-1))}.`);
  return conLeyenda(leyendaItems([
    {tipo: "cuadro", color: tinta.salen, texto: rotulos.salen},
    {tipo: "cuadro", color: tinta.llegan, texto: rotulos.llegan},
    {tipo: "punto", color: P.tinta, texto: rotulos.saldo},
  ]), plot);
}
