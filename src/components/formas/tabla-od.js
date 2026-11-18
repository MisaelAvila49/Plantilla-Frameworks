// formas/tabla-od.js
// ¿Cuántas personas se mueven entre cada par de lugares, y cuántas salen y
// llegan en total? Tabla origen-destino con totales: de cuatro a nueve
// lugares, la cifra escrita en cada celda sobre un fondo de la rampa de una
// tinta (dominio fijo), una columna «Salen» con su barra en el rojo del
// capítulo y un renglón «Llegan» con su barra en azul. Se dibuja en SVG para
// que la descarga la copie tal cual; cada celda tiene globo.
// No: más de nueve lugares (matriz de adyacencia) ni cuando solo importa el
// sentido (mapa de flujos).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P, tintaSobre} from "../paleta.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaContinua, leyendaItems, TIPO} from "./comun.js";

// lugares: claves en orden. valor(o, d): personas de o a d. cifra(v, o, d):
// texto de la celda (miles de personas, o «de cada 100» que salen de la
// fila). color(v, o, d): relleno de la celda. topeTotal: largo FIJO de las
// barras de los totales. formatoTotal(v): texto de los totales.
// globo: de cada celda; globoTotal: de cada total, con {lugar, sentido, valor}.
export function tablaOD(lugares, {
  ancho, valor, cifra, color, escala = null, marcasLeyenda = null, formatoLeyenda = null, tituloLeyenda = "",
  nombre, corto = nombre, topeTotal, formatoTotal, colorSalen = null, colorLlegan = null, globo: g = null, globoTotal: gt = null,
}) {
  if (lugares.length < 2) return vacio();
  const n = lugares.length, angosto = ancho < 560;
  const cS = colorSalen ?? P.rojo, cL = colorLlegan ?? P.azul;
  const izq = angosto ? 50 : Math.min(176, 22 + d3.max(lugares, (k) => nombre(k).length) * 7);
  const colTotal = angosto ? 54 : 92;
  const lado = Math.max(30, Math.min(78, Math.floor((Math.min(ancho, 980) - izq - colTotal - 4) / n)));
  const alto = angosto ? 30 : 34, arriba = 30;
  const W = izq + n * lado + colTotal + 4, H = arriba + (n + 1) * alto + 6;
  const tam = angosto ? 11 : TIPO.valor;
  const salen = new Map(lugares.map((o) => [o, d3.sum(lugares, (d) => (o === d ? 0 : valor(o, d) ?? 0))]));
  const llegan = new Map(lugares.map((d) => [d, d3.sum(lugares, (o) => (o === d ? 0 : valor(o, d) ?? 0))]));
  // Barras de los totales: la misma escala FIJA (topeTotal) en los dos
  // sentidos, para que una salida y una llegada se comparen por su largo.
  const largo = Math.min(colTotal - 10, lado - 8);
  const barra = (v) => Math.max(1, Math.min(1, v / topeTotal) * largo);
  const barraCol = barra;

  const celdas = [];
  lugares.forEach((o, i) => lugares.forEach((d, j) => {
    const x = izq + j * lado, y = arriba + i * alto;
    if (o === d) {
      celdas.push(svg`<rect x=${x + 1.5} y=${y + 1.5} width=${lado - 3} height=${alto - 3} rx="3" fill=${P.fondo2} stroke=${P.borde} stroke-width="0.6" />`);
      return;
    }
    const v = valor(o, d), relleno = color(v, o, d);
    const nodo = svg`<g class="marca-viva gE-celda-od" style=${`--i:${i + j}`}>
      <rect x=${x + 1.5} y=${y + 1.5} width=${lado - 3} height=${alto - 3} rx="3" fill=${relleno} />
      <text x=${x + lado / 2} y=${y + alto / 2} dy="0.35em" text-anchor="middle" font-size=${tam} font-weight="600" fill=${tintaSobre(relleno)} pointer-events="none">${cifra(v, o, d)}</text>
    </g>`;
    if (g) globoEn(nodo, g, {origen: nombre(o), destino: nombre(d), cveOrigen: o, cveDestino: d, valor: v, totalOrigen: salen.get(o), totalDestino: llegan.get(d)});
    celdas.push(nodo);
  }));
  // Totales: columna «Salen» (cada fila) y renglón «Llegan» (cada columna).
  const xT = izq + n * lado + 6;
  const totalesSalen = lugares.map((o, i) => {
    const y = arriba + i * alto, v = salen.get(o);
    const nodo = svg`<g class="marca-viva gE-total">
      <rect x=${xT} y=${y + 2} width=${colTotal - 6} height=${alto - 4} fill=${P.fondo} fill-opacity="0" />
      <text x=${xT + 2} y=${y + alto / 2 - 3} font-size=${tam} font-weight="700" fill=${P.tinta}>${formatoTotal(v)}</text>
      <rect x=${xT + 2} y=${y + alto / 2 + 4} width=${barra(v)} height="4" rx="2" fill=${cS} />
    </g>`;
    if (gt) globoEn(nodo, gt, {lugar: nombre(o), sentido: "salen", valor: v});
    return nodo;
  });
  const yL = arriba + n * alto;
  const totalesLlegan = lugares.map((d, j) => {
    const x = izq + j * lado, v = llegan.get(d);
    const nodo = svg`<g class="marca-viva gE-total">
      <rect x=${x + 1.5} y=${yL + 2} width=${lado - 3} height=${alto - 4} fill=${P.fondo} fill-opacity="0" />
      <text x=${x + lado / 2} y=${yL + alto / 2 - 3} text-anchor="middle" font-size=${tam} font-weight="700" fill=${P.tinta}>${formatoTotal(v)}</text>
      <rect x=${x + 4} y=${yL + alto / 2 + 4} width=${barraCol(v)} height="4" rx="2" fill=${cL} />
    </g>`;
    if (gt) globoEn(nodo, gt, {lugar: nombre(d), sentido: "llegan", valor: v});
    return nodo;
  });
  const encabezados = [
    svg`<text x=${izq - 8} y=${arriba - 10} text-anchor="end" font-size=${tam} font-weight="700" fill=${P.tinta2}>${angosto ? "De ↓" : "De ↓ a →"}</text>`,
    ...lugares.map((k, j) => svg`<text x=${izq + j * lado + lado / 2} y=${arriba - 10} text-anchor="middle" font-size=${tam} font-weight="700" fill=${P.tinta}>${corto(k)}</text>`),
    svg`<text x=${xT + 2} y=${arriba - 10} font-size=${tam} font-weight="700" fill=${P.tinta}>Salen</text>`,
    ...lugares.map((k, i) => svg`<text x=${izq - 8} y=${arriba + i * alto + alto / 2} dy="0.35em" text-anchor="end" font-size=${tam} font-weight="600" fill=${P.tinta}>${angosto ? corto(k) : nombre(k)}</text>`),
    svg`<text x=${izq - 8} y=${yL + alto / 2} dy="0.35em" text-anchor="end" font-size=${tam} font-weight="700" fill=${P.tinta}>Llegan</text>`,
  ];
  const lineas = [
    svg`<line x1=${izq} x2=${W} y1=${yL + 0.5} y2=${yL + 0.5} stroke=${P.bordeFuerte} stroke-width="1" />`,
    svg`<line x1=${xT - 3.5} x2=${xT - 3.5} y1=${arriba - 22} y2=${yL} stroke=${P.bordeFuerte} stroke-width="1" />`,
  ];
  const mayor = d3.greatest(lugares, (k) => salen.get(k));
  const etiqueta = `Tabla de ${n} lugares: filas, de dónde salieron; columnas, a dónde llegaron. Salen más de ${nombre(mayor)}: ${formatoTotal(salen.get(mayor))}.`;
  const dibujo = svg`<svg class="gE-tabla-od" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <g aria-hidden="true">${encabezados}${lineas}</g><g>${celdas}</g><g>${totalesSalen}${totalesLlegan}</g>
  </svg>`;
  const leyenda = html`<div class="forma-leyendas">
    ${escala ? leyendaContinua(escala, {titulo: tituloLeyenda, marcas: marcasLeyenda, formato: formatoLeyenda ?? String, ancho: Math.min(260, ancho - 40), sinDato: false}) : ""}
    ${leyendaItems([{tipo: "cuadro", color: cS, texto: "Barra de las salidas"}, {tipo: "cuadro", color: cL, texto: "Barra de las llegadas"}, {tipo: "cuadro", color: P.fondo2, texto: "Misma entidad"}])}
  </div>`;
  return html`<div class="forma gE-forma-tabla-od">${leyenda}${dibujo}</div>`;
}
