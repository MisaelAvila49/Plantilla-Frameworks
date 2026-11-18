// formas/mosaico-burbujas.js
// ¿Dónde hay más personas en una condición y dónde pesa más esa condición
// sobre su población? Mosaico de burbujas con dos medidas: las 32 entidades
// en la rejilla del mosaico (mx_state_grid3), cada una con un círculo cuyo
// ÁREA es el conteo (escala fija) y cuyo COLOR es el porcentaje (rampa de una
// tinta, dominio fijo). Una entidad grande no tapa a sus vecinas y una chica
// no desaparece. Con una región destacada, las demás bajan de opacidad.
// No: con una sola medida (mosaico o burbujas) ni cuando importa la forma
// real del territorio.
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero, pctEje} from "../formato.js";
import {globoEn} from "../globo.js";
import {ENTIDADES, REJILLA, REJILLA_COLUMNAS, REJILLA_FILAS} from "../geografia.js";
import {leyendaContinua, leyendaItems} from "./comun.js";

const r1 = (v) => Math.round(v * 10) / 10;

// valores: Map de clave al dato. conteo(d): área. tasa(d): color. escala:
// rampaTema(dominio). tope: conteo FIJO del círculo mayor. destacar(clave):
// true para lo que conserva el color. globo: de cada entidad.
export function mosaicoBurbujas(valores, {ancho, conteo, tasa, escala, tope, destacar = null, tituloLeyenda = "Porcentaje", marcasLeyenda = null, formatoLeyenda = pctEje, unidad = "personas", globo: g = null}) {
  const c = Math.floor(Math.min(ancho, 900) / REJILLA_COLUMNAS);
  const W = c * REJILLA_COLUMNAS, H = c * REJILLA_FILAS + 4;
  const rMax = c * 0.47, angosto = c < 44;
  const radio = (v) => Math.max(1.8, Math.sqrt(Math.max(0, Math.min(v, tope)) / tope) * rMax);
  const celdas = ENTIDADES.map((e, i) => {
    const d = valores.get(e.cve) ?? null, [col, fila] = REJILLA[e.cve];
    const cx = col * c + c / 2, cy = fila * c + c / 2 - (angosto ? 3 : 5);
    const hay = d != null && conteo(d) != null && tasa(d) != null;
    const enFoco = !destacar || destacar(e.cve);
    const nodo = svg`<g class="marca-viva gE-mb" tabindex="0" style=${`--i:${i}`} opacity=${enFoco ? 1 : 0.28}>
      <rect x=${col * c + 1} y=${fila * c + 1} width=${c - 2} height=${c - 2} rx="4" fill=${hay ? P.fondo : P.sinDato} fill-opacity=${hay ? 0 : 1} stroke=${P.borde} stroke-width="0.6" />
      ${hay ? svg`<circle cx=${r1(cx)} cy=${r1(cy)} r=${r1(radio(conteo(d)))} fill=${escala(tasa(d))} stroke=${P.bordeFuerte} stroke-width="0.6" />` : ""}
      <text x=${r1(cx)} y=${fila * c + c - (angosto ? 3 : 5)} text-anchor="middle" font-size=${angosto ? 8.5 : 10.5} font-weight="700" fill=${P.tinta} stroke=${P.fondo} stroke-width="2.6" paint-order="stroke" stroke-linejoin="round" pointer-events="none">${e.corto}</text>
    </g>`;
    if (g) globoEn(nodo, g, d ?? {cve: e.cve, _sinDato: true});
    return nodo;
  });
  const etiqueta = `Mosaico de 32 entidades: el área del círculo es el número de ${unidad} y su color, el porcentaje.`;
  const dibujo = svg`<svg class="gE-mosaico-burbujas" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">${celdas}</svg>`;
  const refs = [tope / 10, tope / 2, tope];
  const rr = radio(tope);
  const tamanos = svg`<svg width=${2 * rr + 92} height=${2 * rr + 12} aria-hidden="true">
    ${refs.map((v) => svg`<circle cx=${rr + 1} cy=${2 * rr + 10 - radio(v)} r=${radio(v)} fill="none" stroke=${P.tinta2} stroke-width="0.9" />
      <line x1=${rr + 1} x2=${2 * rr + 10} y1=${2 * rr + 10 - 2 * radio(v)} y2=${2 * rr + 10 - 2 * radio(v)} stroke=${P.regla} stroke-width="0.7" />
      <text x=${2 * rr + 13} y=${2 * rr + 10 - 2 * radio(v)} dy="0.35em" font-size="11" fill=${P.tinta2}>${entero(v)}${v >= tope ? " o más" : ""}</text>`)}
  </svg>`;
  const haySin = ENTIDADES.some((e) => valores.get(e.cve) == null);
  const leyenda = html`<div class="forma-leyendas">
    ${leyendaContinua(escala, {titulo: tituloLeyenda, marcas: marcasLeyenda, formato: formatoLeyenda, ancho: Math.min(260, ancho - 40), sinDato: haySin})}
    <span class="gE-tamanos"><span class="gE-leyenda-titulo">Área: ${unidad}</span>${tamanos}</span>
    ${destacar ? leyendaItems([{tipo: "cuadro", color: P.apagado, texto: "Fuera de la región: atenuadas"}]) : ""}
  </div>`;
  return html`<div class="forma gE-forma-mosaico-burbujas">${leyenda}${dibujo}</div>`;
}
