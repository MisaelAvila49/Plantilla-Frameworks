// formas/dorling.js
// ¿Cómo se ve el país pesado por personas y no por territorio? Cartograma de
// Dorling: cada entidad es un círculo cerca de su lugar, con el ÁREA de su
// población (escala FIJA) y el color de su porcentaje (rampa de una tinta,
// dominio fijo). Los círculos se separan para no encimarse con un acomodo
// que se calcula completo antes de dibujar: nada se mueve en pantalla.
// Una región destacada conserva su color y las demás bajan de opacidad.
// No: cuando el lector necesita ubicar lugares con precisión (coropleta).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P, tintaSobre} from "../paleta.js";
import {entero, pctEje} from "../formato.js";
import {globoEn} from "../globo.js";
import {ISO_A_CVE, POR_CVE} from "../geografia.js";
import {vacio, leyendaContinua, leyendaItems} from "./comun.js";
import {mapaBase} from "./mapa-base.js";

const r1 = (v) => Math.round(v * 10) / 10;

// geo: entidades. valores: Map de clave al dato. peso(d): población (área).
// valor(d): porcentaje (color). escala: rampaTema(dominio). topePeso:
// población FIJA del círculo mayor. destacar(clave): true para lo que
// conserva el color. globo: de cada círculo.
export function dorling(geo, valores, {ancho, peso, valor, escala, topePeso, destacar = null, tituloLeyenda = "Porcentaje", marcasLeyenda = null, formatoLeyenda = pctEje, clave = (f) => ISO_A_CVE.get(f.properties.id), globo: g = null}) {
  const mapa = mapaBase(geo, {ancho, relleno: () => P.fondo3, borde: () => P.fondo3, grosor: () => 0.4});
  const W = mapa.W, H = mapa.H;
  const rMax = Math.max(20, Math.min(56, W * 0.065));
  const radio = (v) => Math.max(3, Math.sqrt(Math.max(0, Math.min(v, topePeso)) / topePeso) * rMax);
  const nodos = geo.features.map((f) => {
    const k = clave(f), d = valores.get(k), [x, y] = mapa.centro(f);
    return {k, d, x, y, x0: x, y0: y, r: d ? radio(peso(d)) : 8, sin: !d || valor(d) == null};
  });
  if (nodos.every((n) => n.sin)) return vacio();
  d3.forceSimulation(nodos)
    .force("x", d3.forceX((n) => n.x0).strength(0.35)).force("y", d3.forceY((n) => n.y0).strength(0.35))
    .force("choque", d3.forceCollide((n) => n.r + 1.5).iterations(3)).stop().tick(260);
  for (const n of nodos) { n.x = Math.max(n.r + 2, Math.min(W - n.r - 2, n.x)); n.y = Math.max(n.r + 2, Math.min(H - n.r - 2, n.y)); }
  const enFoco = (n) => !destacar || destacar(n.k);
  // La abreviatura va dentro del círculo solo si cabe; si no, está en el globo.
  const tamTexto = (n) => (n.r >= 22 ? 11 : 9.5);
  const cabe = (n) => 2 * n.r >= (POR_CVE.get(n.k)?.corto ?? n.k).length * tamTexto(n) * 0.64 + 4;
  const ordenados = d3.sort(nodos, (n) => -n.r);
  const circulos = ordenados.map((n, i) => {
    const relleno = n.sin ? P.sinDato : escala(valor(n.d));
    const nodo = svg`<g class="marca-viva gE-dorling" tabindex="0" style=${`--i:${i}`} opacity=${enFoco(n) ? 1 : 0.28}>
      <circle cx=${r1(n.x)} cy=${r1(n.y)} r=${r1(n.r)} fill=${relleno} stroke=${n.sin ? P.bordeFuerte : P.fondo} stroke-width=${n.sin ? 0.8 : 1} />
      ${cabe(n) ? svg`<text x=${r1(n.x)} y=${r1(n.y)} dy="0.35em" text-anchor="middle" font-size=${tamTexto(n)} font-weight="700" fill=${n.sin ? P.tinta2 : tintaSobre(relleno)} pointer-events="none">${POR_CVE.get(n.k)?.corto ?? n.k}</text>` : ""}
    </g>`;
    if (g) globoEn(nodo, g, n.d ?? {cve: n.k, _sinDato: true});
    return nodo;
  });
  const mayor = ordenados.find((n) => !n.sin);
  const etiqueta = `Cartograma de ${nodos.length} entidades: el área de cada círculo es su población y el color, su porcentaje. La más poblada, ${POR_CVE.get(mayor.k)?.nombre}.`;
  const dibujo = svg`<svg class="gE-dorling-svg" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    ${mapa.capa}<g>${circulos}</g>
  </svg>`;
  const refs = [topePeso / 10, topePeso / 2, topePeso];
  const rr = radio(topePeso);
  const tamanos = svg`<svg width=${2 * rr + 92} height=${2 * rr + 12} aria-hidden="true">
    ${refs.map((v) => svg`<circle cx=${rr + 1} cy=${2 * rr + 10 - radio(v)} r=${radio(v)} fill="none" stroke=${P.tinta2} stroke-width="0.9" />
      <line x1=${rr + 1} x2=${2 * rr + 10} y1=${2 * rr + 10 - 2 * radio(v)} y2=${2 * rr + 10 - 2 * radio(v)} stroke=${P.regla} stroke-width="0.7" />
      <text x=${2 * rr + 13} y=${2 * rr + 10 - 2 * radio(v)} dy="0.35em" font-size="11" fill=${P.tinta2}>${entero(v)}${v >= topePeso ? " o más" : ""}</text>`)}
  </svg>`;
  const haySin = nodos.some((n) => n.sin);
  const leyenda = html`<div class="forma-leyendas">
    ${leyendaContinua(escala, {titulo: tituloLeyenda, marcas: marcasLeyenda, formato: formatoLeyenda, ancho: Math.min(260, ancho - 40), sinDato: haySin})}
    <span class="gE-tamanos"><span class="gE-leyenda-titulo">Área: población</span>${tamanos}</span>
    ${destacar ? leyendaItems([{tipo: "punto", color: P.apagado, texto: "Fuera de la región: atenuadas"}]) : ""}
  </div>`;
  return html`<div class="forma gE-forma-dorling">${leyenda}${dibujo}</div>`;
}
