// formas/matriz.js
// ¿Cuánto se mueve entre cada par de lugares? Matriz de adyacencia: una fila
// por lugar de salida y una columna por lugar de llegada; el color de cada
// celda es cuántas personas hicieron ese cambio, con la rampa de una tinta y
// dominio FIJO (en raíz cuadrada, para que los flujos chicos no desaparezcan
// junto a los grandes). La diagonal es el mismo lugar y no cuenta.
// Con `destacar`, la fila y la columna de ese lugar llevan contorno: en la
// fila se leen sus salidas y en la columna sus llegadas.
// No: con pocos flujos (sankey) ni con más de unas 16 filas en una columna
// de 390 px (se acota a las entidades con más movimiento o a una región).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaContinua, leyendaItems} from "./comun.js";

// Escala de raíz cuadrada sobre la rampa del tono de tema, con dominio fijo
// [0, tope]. Devuelve una función de color con `dominio` e `interpolar` para
// la leyenda continua (que se dibuja en el espacio de la raíz).
export function rampaRaiz(rampa, tope) {
  const r = Math.sqrt(tope);
  const escala = (v) => (v == null || Number.isNaN(+v) ? P.sinDato : rampa.interpolar(Math.sqrt(Math.max(0, Math.min(v, tope))) / r));
  escala.dominio = [0, r];
  escala.interpolar = rampa.interpolar;
  escala.marcas = (valores) => valores.map(Math.sqrt);
  escala.formato = (t, ultimo = tope) => (Math.round(t * t) >= ultimo ? `${entero(ultimo)} o más` : entero(Math.round(t * t)));
  return escala;
}

// lugares: claves en el orden de filas y columnas. valor(o, d): personas de
// o a d (null si no hay dato). nombre(k), corto(k): rótulos. escala: la de
// rampaRaiz. marcas: cifras de la leyenda. globo: de cada celda, con el dato
// {origen, destino, cveOrigen, cveDestino, valor, totalOrigen, totalDestino}.
export function matriz(lugares, {ancho, valor, nombre, corto = nombre, escala, marcas, destacar = null, casos = null, globo: g = null}) {
  if (!lugares.length) return vacio();
  const n = lugares.length, angosto = ancho < 560;
  const izq = angosto ? 46 : Math.min(170, 18 + d3.max(lugares, (k) => nombre(k).length) * 6.9);
  const lado = Math.max(14, Math.min(40, Math.floor((Math.min(ancho, 980) - izq - 28) / n)));
  const arriba = 46;
  const W = izq + n * lado + 28, H = arriba + n * lado + 4;
  const totalSale = new Map(lugares.map((o) => [o, d3.sum(lugares, (d) => (o === d ? 0 : valor(o, d) ?? 0))]));
  const totalLlega = new Map(lugares.map((d) => [d, d3.sum(lugares, (o) => (o === d ? 0 : valor(o, d) ?? 0))]));
  const celdas = [];
  lugares.forEach((o, i) => lugares.forEach((d, j) => {
    const x = izq + j * lado, y = arriba + i * lado;
    if (o === d) {
      celdas.push(svg`<rect x=${x + 1} y=${y + 1} width=${lado - 2} height=${lado - 2} fill=${P.fondo2} stroke=${P.borde} stroke-width="0.6" />`);
      return;
    }
    const v = valor(o, d);
    const nodo = svg`<rect class="marca-viva gE-celda" style=${`--i:${i + j}`} x=${x + 1} y=${y + 1} width=${lado - 2} height=${lado - 2} rx="1.5" fill=${escala(v)} />`;
    if (g) globoEn(nodo, g, {origen: nombre(o), destino: nombre(d), cveOrigen: o, cveDestino: d, valor: v, casos: casos ? casos(o, d) : null, totalOrigen: totalSale.get(o), totalDestino: totalLlega.get(d)});
    celdas.push(nodo);
  }));
  const tam = angosto ? 10.5 : 11.5;
  const filas = lugares.map((k, i) => svg`<text x=${izq - 6} y=${arriba + i * lado + lado / 2} dy="0.35em" text-anchor="end" font-size=${tam} font-weight=${k === destacar ? 700 : 400} fill=${P.tinta}>${angosto ? corto(k) : nombre(k)}</text>`);
  const columnas = lugares.map((k, j) => {
    const cx = izq + j * lado + lado / 2;
    return svg`<text transform=${`translate(${cx},${arriba - 6}) rotate(-50)`} font-size=${tam} font-weight=${k === destacar ? 700 : 400} fill=${P.tinta}>${corto(k)}</text>`;
  });
  const marcos = [];
  const i0 = lugares.indexOf(destacar);
  if (i0 >= 0) {
    marcos.push(svg`<rect x=${izq} y=${arriba + i0 * lado} width=${n * lado} height=${lado} fill="none" stroke=${P.tinta} stroke-width="1.8" rx="2" />`);
    marcos.push(svg`<rect x=${izq + i0 * lado} y=${arriba} width=${lado} height=${n * lado} fill="none" stroke=${P.tinta} stroke-width="1.8" rx="2" stroke-dasharray="5 3" />`);
  }
  const mayor = d3.greatest(lugares.flatMap((o) => lugares.filter((d) => d !== o).map((d) => [o, d, valor(o, d) ?? 0])), (x) => x[2]);
  const etiqueta = `Matriz de ${n} por ${n} lugares: filas, de dónde salieron; columnas, a dónde llegaron. Flujo mayor: de ${nombre(mayor[0])} a ${nombre(mayor[1])}, ${entero(mayor[2])} personas.`;
  const dibujo = svg`<svg class="gE-matriz" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <g>${celdas}</g><g aria-hidden="true">${filas}${columnas}</g><g pointer-events="none">${marcos}</g>
  </svg>`;
  const leyenda = html`<div class="forma-leyendas">
    ${leyendaContinua(escala, {titulo: "Personas que cambiaron de entidad", marcas: escala.marcas(marcas), formato: (t) => escala.formato(t, marcas.at(-1)), ancho: Math.min(280, ancho - 40), sinDato: false})}
    ${leyendaItems([
      {tipo: "cuadro", color: P.fondo2, texto: "Misma entidad: no es un cambio de entidad"},
      ...(i0 >= 0 ? [{tipo: "linea", color: P.tinta, texto: `Fila: salen de ${nombre(destacar)}`}, {tipo: "punteada", color: P.tinta, texto: `Columna: llegan a ${nombre(destacar)}`}] : []),
    ])}
  </div>`;
  return html`<div class="forma gE-forma-matriz">${leyenda}<span class="gE-nota">Renglones: de dónde salieron ↓ · Columnas: a dónde llegaron →</span>${dibujo}</div>`;
}
