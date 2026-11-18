// formas/euler.js
// ¿Cuántas personas cumplen una condición, la otra o las dos? Diagrama de
// Euler de dos conjuntos: dos círculos cuyas ÁREAS son proporcionales a las
// personas de cada condición, encimados de modo que el área común sea la de
// quienes cumplen las dos (la distancia entre centros se calcula por
// bisección). Cada zona (solo A, las dos, solo B) es una marca con globo y
// contorno; sus cifras van escritas junto a la figura.
// Las áreas se comparan DENTRO de la figura: la escala se ajusta para que el
// círculo mayor llene el alto, porque los universos difieren en cientos de
// veces.
// No: tres o más conjuntos (las áreas ya no pueden ser proporcionales).
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero, pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, TIPO} from "./comun.js";

const r1 = (v) => Math.round(v * 100) / 100;

// Área común de dos círculos de radios ra y rb con centros a distancia d.
function lente(ra, rb, d) {
  if (d >= ra + rb) return 0;
  if (d <= Math.abs(ra - rb)) return Math.PI * Math.min(ra, rb) ** 2;
  const a1 = ra * ra * Math.acos((d * d + ra * ra - rb * rb) / (2 * d * ra));
  const a2 = rb * rb * Math.acos((d * d + rb * rb - ra * ra) / (2 * d * rb));
  return a1 + a2 - 0.5 * Math.sqrt((-d + ra + rb) * (d + ra - rb) * (d - ra + rb) * (d + ra + rb));
}

// a, b: {nombre, n}. ambos: personas en las dos. universo: denominador de los
// porcentajes. colorA, colorB: tono de cada conjunto. globo: de cada zona,
// con {zona, n, universo, color}.
export function euler({a, b, ambos, universo}, {ancho, colorA, colorB, globo: g = null, apellido = ""}) {
  if (!(a.n > 0) || !(b.n > 0)) return vacio();
  // En pantalla ancha el dibujo deja a su derecha lugar para las cifras.
  const angosto = ancho < 560, W = ancho >= 760 ? Math.min(560, ancho - 340) : ancho;
  const H = angosto ? 230 : 300, margen = 14;
  // Radios: el círculo mayor llena el alto disponible.
  const nMax = Math.max(a.n, b.n);
  const rMax = Math.min((H - 2 * margen) / 2, (W - 2 * margen) / 3.2);
  const k = rMax / Math.sqrt(nMax / Math.PI);
  const ra = k * Math.sqrt(a.n / Math.PI), rb = k * Math.sqrt(b.n / Math.PI);
  const comun = Math.max(0, Math.min(ambos, a.n, b.n)) * k * k;
  // Bisección: lente decrece al alejar los centros.
  let lo = Math.abs(ra - rb) + 1e-6, hi = ra + rb;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; lente(ra, rb, m) > comun ? (lo = m) : (hi = m); }
  const d = comun <= 0 ? ra + rb + 6 : (lo + hi) / 2;
  const anchoFig = ra + d + rb;
  const xa = (W - anchoFig) / 2 + ra, xb = xa + d, y = H / 2;
  // Puntos de corte de los dos círculos (si se cortan).
  const x = (d * d + ra * ra - rb * rb) / (2 * d), h = Math.sqrt(Math.max(0, ra * ra - x * x));
  const p1 = [xa + x, y - h], p2 = [xa + x, y + h];
  const corta = comun > 0 && h > 0.5;
  const P1 = `${r1(p1[0])},${r1(p1[1])}`, P2 = `${r1(p2[0])},${r1(p2[1])}`;
  const largoA = x < 0 ? 1 : 0, largoB = d - x < 0 ? 1 : 0;
  const circulo = (cx, r) => `M${r1(cx - r)},${r1(y)}A${r1(r)},${r1(r)} 0 1 0 ${r1(cx + r)},${r1(y)}A${r1(r)},${r1(r)} 0 1 0 ${r1(cx - r)},${r1(y)}Z`;
  // Zona «solo A»: arco exterior de A (por la izquierda) y arco de B que
  // limita la lente. «Las dos»: arco de A por la derecha y de B por la
  // izquierda. «Solo B»: arco exterior de B y arco de A que limita la lente.
  const zonas = corta ? [
    {id: "a", d: `M${P1}A${r1(ra)},${r1(ra)} 0 ${1 - largoA} 0 ${P2}A${r1(rb)},${r1(rb)} 0 ${largoB} 1 ${P1}Z`},
    {id: "ambos", d: `M${P1}A${r1(ra)},${r1(ra)} 0 ${largoA} 1 ${P2}A${r1(rb)},${r1(rb)} 0 ${largoB} 1 ${P1}Z`},
    {id: "b", d: `M${P1}A${r1(rb)},${r1(rb)} 0 ${1 - largoB} 1 ${P2}A${r1(ra)},${r1(ra)} 0 ${largoA} 0 ${P1}Z`},
  ] : [{id: "a", d: circulo(xa, ra)}, {id: "b", d: circulo(xb, rb)}];
  const datoZona = {
    a: {zona: `Solo ${a.nombre.toLowerCase()}`, n: a.n - Math.min(ambos, a.n), color: colorA},
    ambos: {zona: "Las dos condiciones", n: Math.min(ambos, a.n, b.n), color: P.tinta2},
    b: {zona: `Solo ${b.nombre.toLowerCase()}`, n: b.n - Math.min(ambos, b.n), color: colorB},
  };
  const fondos = [
    svg`<path d=${circulo(xb, rb)} fill=${colorB} fill-opacity="0.32" stroke=${colorB} stroke-width="1.6" />`,
    svg`<path d=${circulo(xa, ra)} fill=${colorA} fill-opacity="0.32" stroke=${colorA} stroke-width="1.6" />`,
  ];
  const marcas = zonas.map((z, i) => {
    const nodo = svg`<path class="marca-viva gE-zona-euler" tabindex="0" style=${`--i:${i}`} d=${z.d} fill=${P.fondo} fill-opacity="0" />`;
    if (g) globoEn(nodo, g, {...datoZona[z.id], universo});
    return nodo;
  });
  // Nombres de los conjuntos junto a su círculo.
  const tam = angosto ? 11.5 : TIPO.ejes;
  const nombres = [
    svg`<text x=${r1(Math.max(4, xa - ra))} y=${r1(Math.max(tam, y - ra - 6))} font-size=${tam} font-weight="700" fill=${P.tinta}>A</text>`,
    svg`<text x=${r1(Math.min(W - 4, xb + rb))} y=${r1(Math.max(tam, y - rb - 6))} text-anchor="end" font-size=${tam} font-weight="700" fill=${P.tinta}>B</text>`,
  ];
  const etiqueta = `Diagrama de Euler: A, ${a.nombre.toLowerCase()}, ${entero(a.n)} personas; B, ${b.nombre.toLowerCase()}, ${entero(b.n)}; las dos, ${entero(datoZona.ambos.n)}.`;
  const dibujo = svg`<svg class="gE-euler" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <g aria-hidden="true">${fondos}</g><g>${marcas}</g><g aria-hidden="true" pointer-events="none">${nombres}</g>
  </svg>`;
  // Muestra de cada zona con la misma transparencia del dibujo: la de «Las
  // dos» encima un tono sobre el otro, como en los círculos.
  const muestra = (tonos) => svg`<svg width="14" height="14" aria-hidden="true">${tonos.map((c) => svg`<rect x="1" y="1" width="12" height="12" rx="2" fill=${c} fill-opacity="0.32" stroke=${c} stroke-width="1" />`)}</svg>`;
  // Cifras de cada zona, escritas fuera del dibujo para que se lean a 390 px.
  const cifras = html`<dl class="gE-euler-cifras">${[
    ["A · " + a.nombre, a.n, [colorA]], ["B · " + b.nombre, b.n, [colorB]],
    ["Solo A", datoZona.a.n, [colorA]], ["Las dos", datoZona.ambos.n, [colorB, colorA]], ["Solo B", datoZona.b.n, [colorB]],
  ].map(([t, n, c]) => html`<div><dt>${muestra(c)}${t}</dt><dd>${entero(n)} personas · ${pct((100 * n) / universo)}${apellido ? ` ${apellido}` : ""}</dd></div>`)}</dl>`;
  const leyenda = leyendaItems([{tipo: "cuadro", color: colorA, texto: `A: ${a.nombre}`}, {tipo: "cuadro", color: colorB, texto: `B: ${b.nombre}`}]);
  const nodo = html`<div class="forma gE-forma-euler">${leyenda}<div class="gE-euler-cuerpo">${dibujo}${cifras}</div></div>`;
  nodo.zonas = datoZona;
  return nodo;
}
