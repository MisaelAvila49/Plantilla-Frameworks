// formas/arbol-pregunta.js
// ¿Quién cuenta en el indicador, según las preguntas del cuestionario? Árbol
// de la pregunta: cajas encadenadas de arriba a abajo. A la izquierda va el
// camino que llega al indicador (universo, preguntas y la respuesta que
// cuenta); a la derecha, las respuestas que salen del camino. Cada caja de
// respuesta dice cuántas personas la dieron y qué parte del universo son.
// Las preguntas van con borde punteado; las respuestas, con el color de su
// significado (el que declara el capítulo).
// No: para comparar grupos. Es una figura de definición: una por capítulo.
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero, pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, TIPO} from "./comun.js";
import {partir} from "./anotaciones.js";

const r1 = (v) => Math.round(v * 10) / 10;

// cajas: [{id, texto, n, parte, tipo, fila, lado, sinCifra}] con tipo: universo |
// pregunta | rojo | azul | gris, fila (0, 1, 2…) y lado (0 camino, 1 salida).
// parte: qué parte (0 a 100) es la caja de la caja de la que sale; se
// escribe junto a las personas y se dibuja como una barra al pie de la caja.
// enlaces: [[de, a, rotulo]]. universo: n de la primera caja (denominador
// de los porcentajes). color(tipo): el tono de cada tipo. globo: de cada caja.
export function arbolPregunta(cajas, {ancho, enlaces, universo, color, rotulosLeyenda = null, globo: g = null}) {
  if (!cajas.length) return vacio();
  const angosto = ancho < 560, W = Math.min(ancho, 980);
  const tam = angosto ? 11.5 : TIPO.ejes, interlinea = tam * 1.3;
  const hueco = angosto ? 26 : 56;
  const anchoCol = [Math.round((W - hueco) * 0.56), 0];
  anchoCol[1] = W - hueco - anchoCol[0];
  const xCol = [0, anchoCol[0] + hueco];
  const pad = 10;
  // Renglones de cada caja: el texto partido al ancho de su columna, y la
  // cifra en un renglón aparte.
  for (const c of cajas) {
    const largo = Math.max(14, Math.floor((anchoCol[c.lado] - 2 * pad) / (tam * 0.53)));
    c.renglones = partir(c.texto, largo);
    // La cifra va en un renglón; si no cabe en la caja, en dos (personas y porcentaje).
    const partes = c.n == null || c.sinCifra ? [] : [`${entero(c.n)} personas`, ...(c.parte == null ? [] : [pct(c.parte)])];
    c.cifra = partes.length && partes.join(" · ").length * tam * 0.53 > anchoCol[c.lado] - 2 * pad ? partes : partes.length ? [partes.join(" · ")] : [];
    c.h = 2 * pad + c.renglones.length * interlinea + (c.cifra.length ? c.cifra.length * interlinea + 2 : 0) - 4 + (c.parte != null && !c.sinCifra ? 11 : 0);
  }
  // Alto de cada fila: el de su caja más alta.
  const filas = [...new Set(cajas.map((c) => c.fila))].sort((a, b) => a - b);
  const altoFila = new Map(filas.map((f) => [f, Math.max(...cajas.filter((c) => c.fila === f).map((c) => c.h))]));
  const sep = angosto ? 30 : 34;
  let y = 4;
  const yFila = new Map(filas.map((f) => { const y0 = y; y += altoFila.get(f) + sep; return [f, y0]; }));
  const H = y - sep + 6;
  for (const c of cajas) { c.x = xCol[c.lado]; c.y = yFila.get(c.fila); c.w = anchoCol[c.lado]; }
  const porId = new Map(cajas.map((c) => [c.id, c]));
  const nodos = cajas.map((c, i) => {
    const tono = color(c.tipo), pregunta = c.tipo === "pregunta", universoC = c.tipo === "universo";
    const nodo = svg`<g class="marca-viva gE-caja" tabindex="0" style=${`--i:${i}`}>
      <rect x=${r1(c.x + 1)} y=${r1(c.y)} width=${r1(c.w - 2)} height=${r1(c.h)} rx="7" fill=${pregunta || universoC ? P.fondo : tono} fill-opacity=${pregunta || universoC ? 1 : 0.13}
        stroke=${tono} stroke-width=${c.tipo === "rojo" ? 2.2 : 1.3} stroke-dasharray=${pregunta ? "5 4" : null} />
      <text x=${r1(c.x + pad)} y=${r1(c.y + pad + tam * 0.85)} font-size=${tam} fill=${P.tinta} pointer-events="none">
        ${c.renglones.map((t, k) => svg`<tspan x=${r1(c.x + pad)} dy=${k ? interlinea : 0} font-weight=${pregunta ? 500 : 650}>${t}</tspan>`)}
        ${c.cifra.map((t, k) => svg`<tspan x=${r1(c.x + pad)} dy=${k ? interlinea : interlinea + 2} font-weight="400" fill=${P.tinta2}>${t}</tspan>`)}
      </text>
      ${c.parte != null && !c.sinCifra ? svg`<rect x=${r1(c.x + pad)} y=${r1(c.y + c.h - pad - 4)} width=${r1(c.w - 2 * pad)} height="5" rx="2.5" fill=${P.apagado} />
        <rect x=${r1(c.x + pad)} y=${r1(c.y + c.h - pad - 4)} width=${r1(Math.max(1.5, ((c.w - 2 * pad) * Math.min(100, c.parte)) / 100))} height="5" rx="2.5" fill=${pregunta ? P.tinta2 : tono} />` : ""}
    </g>`;
    if (g) globoEn(nodo, g, c);
    return nodo;
  });
  // Flechas: verticales en el camino (lado 0 a lado 0) y horizontales hacia
  // las salidas (lado 0 a lado 1), con su rótulo «Sí» o «No».
  const flechas = enlaces.map(([de, a, rot]) => {
    const A = porId.get(de), B = porId.get(a);
    let x1, y1, x2, y2, rx, ry, ancla = "start";
    if (A.lado === B.lado) { x1 = x2 = A.x + 22; y1 = A.y + A.h; y2 = B.y; rx = x1 + 7; ry = (y1 + y2) / 2 + 4; }
    else if (A.fila === B.fila) { x1 = A.x + A.w; x2 = B.x; y1 = y2 = A.y + Math.min(A.h, B.h) / 2; rx = (x1 + x2) / 2; ry = y1 - 6; ancla = "middle"; }
    else { x1 = A.x + A.w; y1 = A.y + A.h - 8; x2 = B.x; y2 = B.y + 14; rx = (x1 + x2) / 2; ry = (y1 + y2) / 2 - 6; ancla = "middle"; }
    const ang = Math.atan2(y2 - y1, x2 - x1), p = 7;
    const punta = `M${r1(x2)},${r1(y2)}L${r1(x2 - p * Math.cos(ang - 0.42))},${r1(y2 - p * Math.sin(ang - 0.42))}L${r1(x2 - p * Math.cos(ang + 0.42))},${r1(y2 - p * Math.sin(ang + 0.42))}Z`;
    return svg`<g aria-hidden="true">
      <line x1=${r1(x1)} y1=${r1(y1)} x2=${r1(x2 - 2 * Math.cos(ang))} y2=${r1(y2 - 2 * Math.sin(ang))} stroke=${P.tinta3} stroke-width="1.4" />
      <path d=${punta} fill=${P.tinta3} />
      ${rot ? svg`<text x=${r1(rx)} y=${r1(ry)} text-anchor=${ancla} font-size=${tam} font-weight="700" fill=${P.tinta} stroke=${P.fondo} stroke-width="3" paint-order="stroke">${rot}</text>` : ""}
    </g>`;
  });
  const cuenta = cajas.find((c) => c.tipo === "rojo");
  const etiqueta = `Árbol de la pregunta: de ${entero(universo)} personas, ${cuenta ? `${entero(cuenta.n)} cuentan en el indicador` : "ninguna cuenta"}.`;
  const dibujo = svg`<svg class="gE-arbol" width=${W} height=${r1(H)} viewBox="0 0 ${W} ${r1(H)}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <g>${flechas}</g><g>${nodos}</g>
  </svg>`;
  const leyenda = rotulosLeyenda ? leyendaItems(rotulosLeyenda) : "";
  return html`<div class="forma gE-forma-arbol">${leyenda}${dibujo}</div>`;
}
