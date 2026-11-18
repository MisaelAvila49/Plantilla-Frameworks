// formas/fichas-rango.js
// ¿Cuántas entidades hay en cada rango, cuáles son, dónde quedan y cuáles
// cambiaron de rango? Un panel por rango (de lo más alto a lo más bajo), con
// su conteo escrito. Cada panel es un mosaico del país con la rejilla
// publicada mx_state_grid3 (REJILLA de geografia.js): las entidades del rango
// van como fichas con su abreviatura y el tono del rango, y las demás quedan
// como casillas tenues que dibujan la forma del país. Una ficha que cambió de
// rango desde el año de comparación lleva un triángulo: hacia arriba si
// subió y hacia abajo si bajó, en el color que el capítulo declara para el
// signo del cambio.
// Los rangos son FIJOS y desiguales si hace falta (se declaran en la página);
// el tono de cada rango sale de la rampa del tono de tema, por su orden.
// No: comparar valores exactos (lollipop) ni ver la cifra en el territorio
// (mosaico de entidades con rampa continua).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P, tintaSobre} from "../paleta.js";
import {globoEn} from "../globo.js";
import {entero} from "../formato.js";
import {ENTIDADES, REJILLA, REJILLA_COLUMNAS, REJILLA_FILAS} from "../geografia.js";
import {vacio} from "./comun.js";

// Índice del rango de un valor: rangos [{min, max, texto}] de menor a mayor,
// con `min` incluido y `max` excluido (el último, abierto).
export const rangoDe = (rangos, v) => (v == null ? -1 : rangos.findIndex((r, k) => v >= r.min && (k === rangos.length - 1 || v < r.max)));

// Tono de cada rango: pasos de la rampa del tono de tema repartidos por su
// orden; el más claro se distingue del fondo sin borde.
export const tonoRango = (escala, k, n) => escala.interpolar(0.3 + 0.7 * k / Math.max(1, n - 1));

// valores: Map de clave de entidad (dos dígitos) al dato. valor(d) y
// antes(d) en la misma unidad (antes puede ser null). escala: rampaTema().
// colorCambio(s): color del triángulo para "sube" o "baja". textoCambio:
// {sube, baja} para la leyenda. unidad: "entidades".
export function fichasRango(valores, {ancho, valor, antes = () => null, rangos, escala, colorCambio, textoCambio = {sube: "Subió de rango", baja: "Bajó de rango"}, unidad = "entidades", globo: g}) {
  if (!valores.size) return vacio();
  const n = rangos.length;
  const datos = ENTIDADES.map((e) => {
    const d = valores.get(e.cve) ?? null, v = d == null ? null : valor(d), a = d == null ? null : antes(d);
    const k = rangoDe(rangos, v), kA = rangoDe(rangos, a);
    return {e, d, v, k, kA, cambio: k < 0 || kA < 0 ? null : k > kA ? "sube" : k < kA ? "baja" : null};
  });
  // Paneles de lo más alto a lo más bajo; «Sin dato» al final, solo si hay.
  const paneles = [...d3.range(n).reverse().map((k) => ({k, texto: rangos[k].texto, fichas: datos.filter((x) => x.k === k)})),
    {k: -1, texto: "Sin dato", fichas: datos.filter((x) => x.k < 0)}].filter((p) => p.k >= 0 || p.fichas.length);
  // Columnas de paneles según el ancho: cada mosaico necesita casillas de 22 px o más.
  const hueco = 18, minCasilla = 22;
  const columnas = Math.max(1, Math.min(3, Math.floor((ancho + hueco) / (REJILLA_COLUMNAS * minCasilla + hueco))));
  const t = Math.floor(Math.min(40, (ancho - hueco * (columnas - 1)) / columnas / REJILLA_COLUMNAS));
  const lado = t - 3, W = t * REJILLA_COLUMNAS, H = t * REJILLA_FILAS;
  const tamLetra = lado >= 30 ? 10.5 : lado >= 24 ? 9 : 8;
  const panel = (p) => {
    const tono = p.k >= 0 ? tonoRango(escala, p.k, n) : P.sinDato;
    const tinta = p.k >= 0 ? tintaSobre(tono) : P.tinta2;
    const propias = new Set(p.fichas.map((x) => x.e.cve));
    const casillas = datos.filter((x) => !propias.has(x.e.cve)).map((x) => { const [c, f] = REJILLA[x.e.cve]; return svg`<rect x=${c * t + 1.5 + lado * 0.2} y=${f * t + 1.5 + lado * 0.2} width=${lado * 0.6} height=${lado * 0.6} rx="2" fill=${P.rejilla} />`; });
    const fichas = p.fichas.map((x) => {
      const [c, f] = REJILLA[x.e.cve];
      // Triángulo en la esquina, asomado fuera de la ficha para que se lea sobre cualquier tono.
      const tri = x.cambio === "sube" ? `M${lado - 12},9L${lado + 1},9L${lado - 5.5},-1.5Z` : `M${lado - 12},-1.5L${lado + 1},-1.5L${lado - 5.5},9Z`;
      const nodo = svg`<g class="marca-viva" tabindex="0" transform=${`translate(${c * t + 1.5},${f * t + 1.5})`}>
        <rect width=${lado} height=${lado} rx="4" fill=${tono} stroke=${p.k >= 0 ? P.fondo : P.bordeFuerte} stroke-width=${p.k >= 0 ? 0.8 : 1} />
        <text x=${lado / 2} y=${lado / 2 + (x.cambio ? 5 : 3.5)} text-anchor="middle" font-size=${tamLetra} font-weight="700" fill=${tinta}>${x.e.corto}</text>
        ${x.cambio ? svg`<path d=${tri} fill=${colorCambio(x.cambio)} stroke=${P.fondo} stroke-width="1.4" stroke-linejoin="round" />` : ""}
      </g>`;
      if (g) globoEn(nodo, g, {...(x.d ?? {}), cve: x.e.cve, nombre: x.e.nombre, _rango: p.texto, _rangoAntes: x.kA >= 0 ? rangos[x.kA].texto : null, _cambio: x.cambio, _sinDato: x.d == null || x.v == null, _tono: tono});
      return nodo;
    });
    const cuantas = p.fichas.length;
    return html`<div class="fr-panel">
      <p class="fr-titulo"><i class="fr-muestra" style=${`background:${tono}`}></i><span>${p.texto}</span> <strong>${entero(cuantas)} ${cuantas === 1 ? unidad.replace(/es$/, "").replace(/s$/, "") : unidad}</strong></p>
      <svg class="fichas-rango" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${`${p.texto}: ${cuantas} ${unidad}${cuantas ? `, ${p.fichas.map((x) => x.e.nombre).join(", ")}` : ""}.`} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
        <g aria-hidden="true">${casillas}</g>${fichas}
      </svg>
    </div>`;
  };
  // Leyenda: tira ordenada de los rangos (de lo más bajo a lo más alto, con el
  // rótulo bajo cada tono) y los dos triángulos del cambio.
  const tira = html`<div class="fr-tira" role="img" aria-label=${`Rangos, de menor a mayor: ${rangos.map((r) => r.texto).join(", ")}`}>${rangos.map((r, k) => html`<span class="fr-paso"><i style=${`background:${tonoRango(escala, k, n)}`}></i><span>${r.texto}</span></span>`)}</div>`;
  const triangulo = (s) => html`<span class="leyenda-item"><svg width="12" height="10" aria-hidden="true"><path d=${s === "sube" ? "M1,9L11,9L6,1Z" : "M1,1L11,1L6,9Z"} fill=${colorCambio(s)} /></svg><span>${textoCambio[s]}</span></span>`;
  const cambios = html`<div class="leyenda-items">${triangulo("sube")}${triangulo("baja")}</div>`;
  const nodo = html`<div class="forma"><div class="gc-leyendas">${tira}${cambios}</div><div class="fr-paneles" style=${`--fr-columnas:${columnas}`}>${paneles.map(panel)}</div></div>`;
  nodo.filas = datos;
  return nodo;
}
