// formas/hexbin.js
// ¿Dónde se concentran miles de personas sobre dos medidas a la vez (edad y
// horas, escolaridad e ingreso)? Hexbin: el plano se parte en hexágonos
// iguales y cada uno se pinta con la parte de la población que cae en él,
// con la rampa de una tinta del tono de tema y dominio FIJO.
// Los hexágonos se calculan en las unidades del DATO, no en píxeles: el plano
// tiene una proporción fija y el radio es una fracción fija de su ancho, así
// que el mismo hexágono junta a las mismas personas en cualquier pantalla y
// el mismo valor tiene el mismo tono con cualquier filtro. Un hexágono con
// menos de 30 casos en la muestra lleva trama (R149) y su globo lo avisa.
// No: decenas o cientos de unidades con nombre (dispersión).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaContinua, leyendaItems, TIPO} from "./comun.js";

const PROPORCION = 0.6;   // alto del plano entre su ancho
const MIN_CASOS = 30;
let serie = 0;

// Agrupa un punto (u, v) del plano normalizado en su hexágono de radio R, con
// la misma aritmética de d3-hexbin (hexágonos con punta hacia arriba).
function celdaDe(u, v, R) {
  const dx = R * 2 * Math.sin(Math.PI / 3), dy = R * 1.5;
  let py = v / dy, pj = Math.round(py), px = u / dx - (pj & 1) / 2, pi = Math.round(px);
  const py1 = py - pj;
  if (Math.abs(py1) * 3 > 1) {
    const px1 = px - pi, pi2 = pi + (px < pi ? -1 : 1) / 2, pj2 = pj + (py < pj ? -1 : 1), px2 = px - pi2, py2 = py - pj2;
    if (px1 * px1 + py1 * py1 > px2 * px2 + py2 * py2) { pi = pi2 + (pj & 1 ? 1 : -1) / 2; pj = pj2; }
  }
  return {i: pi, j: pj, cu: (pi + (pj & 1) / 2) * dx, cv: pj * dy};
}

// datos: una fila por persona de la muestra. x(d), y(d), peso(d) (factor de
// expansión). dominioX, dominioY: extremos FIJOS del plano. radio: fracción
// del ancho del plano. escala: rampaTema(dominio) con el tope rotulado
// «o más». Devuelve la figura y, en `.celdas`, cada hexágono con su parte,
// sus personas y sus casos, para la tabla.
export function hexbin(datos, {ancho, x, y, peso = () => 1, dominioX, dominioY, radio = 0.028, escala, formatoX = (v) => String(v), formatoY = (v) => String(v), rotuloX = null, rotuloY = null, tituloLeyenda = "", formatoLeyenda = (v) => String(v), marcasLeyenda = null, enfocables = 10, globo: g}) {
  const filas = datos.filter((d) => x(d) != null && y(d) != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const ml = 44, mr = 12, mt = 30, mb = 46;
  const pw = Math.min(ancho, 1000) - ml - mr, ph = pw * PROPORCION;
  const W = pw + ml + mr, H = Math.round(ph + mt + mb);
  const [x0, x1] = dominioX, [y0, y1] = dominioY;
  const u = (vx) => (Math.max(x0, Math.min(x1, vx)) - x0) / (x1 - x0);
  const v = (vy) => (Math.max(y0, Math.min(y1, vy)) - y0) / (y1 - y0) * PROPORCION;
  const total = d3.sum(filas, peso);
  const porCelda = new Map();
  for (const d of filas) {
    const c = celdaDe(u(x(d)), v(y(d)), radio), k = `${c.i}|${c.j}`;
    const e = porCelda.get(k) ?? porCelda.set(k, {...c, personas: 0, casos: 0}).get(k);
    e.personas += peso(d); e.casos++;
  }
  // Valores del dato en el centro de cada hexágono, para el globo y la tabla.
  const celdas = d3.sort([...porCelda.values()], (c) => c.cv, (c) => c.cu).map((c) => ({
    ...c, parte: 100 * c.personas / total, total,
    x: x0 + c.cu * (x1 - x0), y: y0 + c.cv / PROPORCION * (y1 - y0), pocos: c.casos < MIN_CASOS,
  }));
  const px = (cu) => ml + cu * pw, py = (cv) => mt + (PROPORCION - cv) * pw;
  const r = radio * pw;
  const hexagono = (cx, cy) => "M" + d3.range(6).map((k) => { const a = Math.PI / 3 * k - Math.PI / 6; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join("L") + "Z";
  const trama = `trama-hex-${++serie}`;
  // Orden del documento y del tabulador: de la celda más llena a la más
  // vacía. Así la primera marca enfocable es la que más pesa, y no una del
  // borde recortada por el plano (su centro queda fuera del área que recibe
  // el puntero).
  const porParte = d3.sort(celdas, (c) => -c.parte);
  const conFoco = new Set(porParte.slice(0, enfocables));
  const nodos = porParte.map((c) => {
    const nodo = svg`<path class="marca-viva" tabindex=${conFoco.has(c) ? 0 : null} d=${hexagono(px(c.cu), py(c.cv))} fill=${escala(c.parte)} stroke=${P.fondo} stroke-width="0.8" />`;
    if (g) globoEn(nodo, g, c);
    return nodo;
  });
  const tramas = celdas.filter((c) => c.pocos).map((c) => svg`<path d=${hexagono(px(c.cu), py(c.cv))} fill=${`url(#${trama})`} pointer-events="none" />`);
  // Ejes con rejilla tenue, dentro del plano. Los hexágonos del borde se
  // recortan al plano: su centro puede caer fuera aunque sus datos no.
  const marcasX = d3.ticks(x0, x1, angosto ? 5 : 8), marcasY = d3.ticks(y0, y1, angosto ? 5 : 7);
  const sx = (vx) => px(u(vx)), sy = (vy) => py(v(vy));
  const ejes = svg`<g aria-hidden="true" font-size=${TIPO.ejes - 1} fill=${P.tinta2}>
    ${marcasX.map((t) => svg`<line x1=${sx(t)} x2=${sx(t)} y1=${mt} y2=${mt + ph} stroke=${P.rejilla} /><text x=${sx(t)} y=${mt + ph + 17} text-anchor="middle">${formatoX(t)}</text>`)}
    ${marcasY.map((t) => svg`<line x1=${ml} x2=${ml + pw} y1=${sy(t)} y2=${sy(t)} stroke=${P.rejilla} /><text x=${ml - 7} y=${sy(t)} dy="0.35em" text-anchor="end">${formatoY(t)}</text>`)}
    ${rotuloX ? svg`<text x=${ml} y=${H - 4} font-weight="600">${rotuloX}</text>` : ""}
    ${rotuloY ? svg`<text x=${ml - 40} y=${mt - 14} font-weight="600">${rotuloY}</text>` : ""}
  </g>`;
  const mayor = d3.greatest(celdas, (c) => c.parte);
  const dibujo = svg`<svg class="hexbin" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${`Hexbin de ${celdas.length} hexágonos. El que junta más personas está cerca de ${formatoX(mayor.x)} y ${formatoY(mayor.y)}, con ${formatoLeyenda(mayor.parte)} %.`} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <defs><pattern id=${trama} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke=${P.tinta3} stroke-width="0.9" /></pattern>
      <clipPath id=${`${trama}-marco`}><rect x=${ml} y=${mt} width=${pw} height=${ph} /></clipPath></defs>
    ${ejes}<g clip-path=${`url(#${trama}-marco)`}><g>${nodos}</g><g aria-hidden="true">${tramas}</g></g>
  </svg>`;
  const leyendas = html`<div class="gc-leyendas">
    ${leyendaContinua(escala, {titulo: tituloLeyenda, formato: formatoLeyenda, marcas: marcasLeyenda, ancho: Math.min(280, ancho - 40), sinDato: false})}
    ${tramas.length ? leyendaItems([{tipo: "cuadro", color: `url(#${trama})`, texto: "Con trama: menos de 30 casos en la muestra"}]) : ""}
  </div>`;
  const nodo = html`<div class="forma">${leyendas}${dibujo}</div>`;
  nodo.celdas = celdas;
  return nodo;
}
