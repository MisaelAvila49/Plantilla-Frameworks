// formas/bivariado.js
// ¿Dónde coinciden dos variables? Mapa bivariado: cada entidad se pinta con
// la combinación de sus dos terciles (bajo, medio, alto en A y en B) en una
// matriz de 3 × 3 (P.bivariado). El eje A va hacia el rojo, el eje B hacia el
// azul, y la esquina donde las dos son altas sale morada por la mezcla: es
// la única excepción a R93 y nunca es el color del tema.
//
// Los cortes de los terciles son FIJOS (`cortesA`, `cortesB`), medidos sobre
// toda la muestra y no sobre la vista, para que el mismo color quiera decir
// lo mismo con cualquier filtro (R74). La leyenda escribe los cortes en los
// bordes de la rejilla, y las tres esquinas que importan (solo A, solo B,
// las dos) se rotulan aparte con palabras, como segunda codificación.
//
// No: cuando una de las dos variables es el tema y la otra solo lo afina (ahí
// va «Cruzar con», lección 100), ni con más de dos variables, ni cuando se
// necesita la cifra exacta (dispersión o tabla). Pide siempre tabla.
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {numero} from "../formato.js";
import {ISO_A_CVE} from "../geografia.js";
import {mapaPlano} from "./mapa-plano.js";
import {conLeyenda, leyendaItems, TIPO} from "./comun.js";

// Tercil de un valor con dos cortes [c1, c2]: 0 si v < c1, 1 si v < c2, 2 si no.
export const tercil = (v, [c1, c2]) => (v == null || Number.isNaN(+v) ? null : v < c1 ? 0 : v < c2 ? 1 : 2);

// Cortes de terciles de una lista de valores (para medirlos UNA vez sobre
// toda la muestra; nunca sobre la vista).
export const cortesTerciles = (valores) => {
  const v = valores.filter((x) => x != null && !Number.isNaN(+x)).sort(d3.ascending);
  return [d3.quantileSorted(v, 1 / 3), d3.quantileSorted(v, 2 / 3)];
};

// Color de la celda [a][b] de la matriz del tema actual.
export const colorBivariado = (a, b) => (a == null || b == null ? P.fondo : P.bivariado[a][b]);

// geo: entidades. valores: Map de clave al dato. a(d) y b(d): las dos
// variables. cortesA y cortesB: [c1, c2] fijos. ejeA y ejeB: nombre corto de
// cada variable para la leyenda. formatoA y formatoB: formato de los cortes.
export function bivariado(geo, valores, {ancho, a, b, cortesA, cortesB, ejeA, ejeB, unidadA = "", unidadB = "", formatoA = (x) => numero(x), formatoB = (x) => numero(x),
  clave = (f) => ISO_A_CVE.get(f.properties.id), encuadre = null, globo: g = null}) {
  const celda = (d) => (d?._sinDato ? [null, null] : [tercil(a(d), cortesA), tercil(b(d), cortesB)]);
  const mapa = mapaPlano(geo, {
    ancho, globo: g,
    dato: (f) => { const d = valores.get(clave(f)); return d == null ? {cve: clave(f), _sinDato: true} : d; },
    color: (d) => colorBivariado(...celda(d)),
    encuadre: encuadre ? (f) => encuadre.includes(clave(f)) : null,
  });
  const hayFaltantes = geo.features.some((f) => { const d = valores.get(clave(f)); return d == null || celda(d).includes(null); });
  return conLeyenda(leyendaBivariada({ejeA, ejeB, unidadA, unidadB, cortesA, cortesB, formatoA, formatoB, sinDato: hayFaltantes}), mapa);
}

// Leyenda: rejilla de 3 × 3 con el eje A a lo ancho (crece a la derecha) y el
// eje B a lo alto (crece hacia arriba), los cortes escritos en los bordes, y
// debajo las tres esquinas con palabras. En SVG para que la descarga de la
// figura la lleve tal cual.
export function leyendaBivariada({ejeA, ejeB, unidadA = "", unidadB = "", cortesA, cortesB, formatoA, formatoB, sinDato = false}) {
  // Las marcas de los cortes llevan solo el número; la unidad va en el
  // título del eje (con «%» en cada marca, dos cortes cercanos se encimaban).
  const conUnidad = (eje, u) => (u ? `${eje} (${u})` : eje);
  const c = 28, x0 = 60, y0 = 8, W = x0 + 3 * c + 150, H = y0 + 3 * c + 40;
  const t = (x, y, s, ancla = "start", extra = {}) => svg`<text x=${x} y=${y} text-anchor=${ancla} fill=${extra.fill ?? P.tinta2} font-size=${extra.size ?? 11.5} font-weight=${extra.weight ?? 400}>${s}</text>`;
  const celdas = [];
  for (let ia = 0; ia < 3; ia++) for (let ib = 0; ib < 3; ib++) {
    celdas.push(svg`<rect x=${x0 + ia * c} y=${y0 + (2 - ib) * c} width=${c - 1.5} height=${c - 1.5} rx="2" fill=${P.bivariado[ia][ib]} stroke=${P.borde} stroke-width="0.5"/>`);
  }
  const rejilla = svg`<svg class="leyenda-bivariada" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="img" aria-label=${`Leyenda: ${conUnidad(ejeA, unidadA)} a lo ancho, con cortes en ${formatoA(cortesA[0])} y ${formatoA(cortesA[1])}; ${conUnidad(ejeB, unidadB)} a lo alto, con cortes en ${formatoB(cortesB[0])} y ${formatoB(cortesB[1])}.`}
    style="font-family: var(--sans-serif)">
    ${celdas}
    ${cortesA.map((v, i) => svg`<line x1=${x0 + (i + 1) * c - 0.75} x2=${x0 + (i + 1) * c - 0.75} y1=${y0 + 3 * c} y2=${y0 + 3 * c + 5} stroke=${P.regla} />`)}
    ${cortesA.map((v, i) => t(x0 + (i + 1) * c - 0.75, y0 + 3 * c + 16, formatoA(v), "middle"))}
    ${t(x0, y0 + 3 * c + 33, `${conUnidad(ejeA, unidadA)} →`, "start", {fill: P.tinta, weight: 600, size: TIPO.valor})}
    ${cortesB.map((v, i) => svg`<line x1=${x0 - 5} x2=${x0} y1=${y0 + (2 - i) * c - 0.75} y2=${y0 + (2 - i) * c - 0.75} stroke=${P.regla} />`)}
    ${cortesB.map((v, i) => t(x0 - 8, y0 + (2 - i) * c + 3, formatoB(v), "end"))}
    ${t(x0 + 3 * c + 10, y0 + 12, `↑ ${conUnidad(ejeB, unidadB)}`, "start", {fill: P.tinta, weight: 600, size: TIPO.valor})}
  </svg>`;
  const esquinas = leyendaItems([
    {color: P.bivariado[2][0], texto: `Alto en ${ejeA.toLowerCase()}, bajo en ${ejeB.toLowerCase()}`},
    {color: P.bivariado[0][2], texto: `Bajo en ${ejeA.toLowerCase()}, alto en ${ejeB.toLowerCase()}`},
    {color: P.bivariado[2][2], texto: "Alto en los dos"},
    ...(sinDato ? [{color: P.fondo, texto: "Sin dato"}] : []),
  ]);
  return html`<div class="leyenda-bivariada-caja">${rejilla}${esquinas}</div>`;
}
