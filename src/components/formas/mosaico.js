// formas/mosaico.js
// ¿Cómo se comparan las 32 entidades con el mismo peso visual? Un cuadro por
// entidad acomodado como el país (rejilla mx_state_grid3 de geofacet), con su
// abreviatura y el color de su cifra. La Ciudad de México y Tlaxcala se ven
// igual que Chihuahua.
// No: cuando la forma o el tamaño del territorio importan (coropleta).
import {svg} from "npm:htl";
import {P, tintaSobre} from "../paleta.js";
import {pctEje} from "../formato.js";
import {globoEn} from "../globo.js";
import {ENTIDADES, REJILLA, REJILLA_COLUMNAS, REJILLA_FILAS} from "../geografia.js";
import {leyendaContinua, conLeyenda} from "./comun.js";

// valores: Map de clave de entidad (dos dígitos) al dato. valor(d) puede ser
// null (sin dato). `escala`: rampaTema(dominio) o rampaCambio(limite).
export function mosaico(valores, {ancho, valor, escala, destacar = null, tituloLeyenda = "", formatoLeyenda = pctEje, marcasLeyenda = null, cifra = null, globo: g}) {
  const c = Math.floor(Math.min(ancho, 900) / REJILLA_COLUMNAS), lado = c - 4;
  const W = c * REJILLA_COLUMNAS, H = c * REJILLA_FILAS;
  const celdas = ENTIDADES.map((e) => {
    const d = valores.get(e.cve) ?? null, v = d == null ? null : valor(d);
    const [col, fila] = REJILLA[e.cve];
    const relleno = escala(v);
    const tinta = v == null ? P.tinta2 : tintaSobre(relleno);
    const nodo = svg`<g class="marca-viva" tabindex="0" transform=${`translate(${col * c + 2},${fila * c + 2})`}>
      <rect width=${lado} height=${lado} rx="4" fill=${relleno} stroke=${e.cve === destacar ? P.tinta : P.borde} stroke-width=${e.cve === destacar ? 2.4 : 0.8} />
      <text x=${lado / 2} y=${lado / 2 - (cifra && lado >= 44 ? 3 : -4)} text-anchor="middle" font-size=${lado >= 44 ? 12 : 9} font-weight="700" fill=${tinta}>${e.corto}</text>
      ${cifra && lado >= 44 && v != null ? svg`<text x=${lado / 2} y=${lado / 2 + 12} text-anchor="middle" font-size="11" fill=${tinta}>${cifra(v)}</text>` : ""}
    </g>`;
    if (g) globoEn(nodo, g, d ?? {cve: e.cve, _sinDato: true});
    return nodo;
  });
  const dibujo = svg`<svg class="mosaico" width=${W} height=${H} viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">${celdas}</svg>`;
  return conLeyenda(leyendaContinua(escala, {titulo: tituloLeyenda, formato: formatoLeyenda, marcas: marcasLeyenda, ancho: Math.min(300, ancho - 30)}), dibujo);
}
