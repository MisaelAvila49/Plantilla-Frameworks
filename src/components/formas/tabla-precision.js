// formas/tabla-precision.js
// ¿Qué tan confiable es cada cifra de la encuesta antes de compararla? Una
// tabla con la estimación, su intervalo de 95 % dibujado en la misma escala
// para todas las filas, el coeficiente de variación y el nivel de precisión
// (alta, moderada, baja). La fila de referencia (el nacional) va arriba y su
// valor se marca con una raya en cada intervalo.
// No: cifras censales o de registro, que no tienen error de muestreo.
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct, numero, SIN_DATO} from "../formato.js";
import {vacio} from "./comun.js";
import {globoCelda, itinerante} from "./tabla-interaccion.js";

// Niveles de precisión por coeficiente de variación (criterio habitual de
// las encuestas del INEGI): alta < 15 %, moderada < 30 %, baja desde 30 %.
export const PRECISION = [
  {nombre: "Alta", hasta: 15, rango: "coef. de variación menor a 15 %"}, {nombre: "Moderada", hasta: 30, rango: "de 15 a 30 %"}, {nombre: "Baja", hasta: Infinity, rango: "30 % o más, con *"},
];
export const nivelDe = (cv) => (cv == null ? null : PRECISION.find((n) => cv < n.hasta));

// Símbolo del nivel: lleno, medio lleno o hueco, en el tono de tema.
function simbolo(nivel) {
  const r = 5.5, c = 7;
  const borde = svg`<circle cx=${c} cy=${c} r=${r} fill=${nivel === "Alta" ? P.serie : P.fondo} stroke=${P.serie} stroke-width="1.6"/>`;
  const medio = nivel === "Moderada" ? svg`<path d=${`M${c},${c - r} A${r},${r} 0 0 0 ${c},${c + r} Z`} fill=${P.serie} />` : "";
  return svg`<svg width="14" height="14" aria-hidden="true">${borde}${medio}</svg>`;
}

// datos: una fila por unidad. nombre(d), valor(d) en %, ee(d) en puntos.
// `referencia`: la fila del nacional (o null). `dominio`: FIJO del
// intervalo. `orden`: comparador; por omisión, de mayor a menor.
export function tablaPrecision(datos, {ancho, nombre, valor, ee, referencia = null, dominio = [0, 100], orden = null, rotuloNombre = "Entidad", rotuloValor = "Estimación", globo: g}) {
  const filas = datos.filter((d) => valor(d) != null).sort(orden ?? ((a, b) => valor(b) - valor(a)));
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const anchoIntervalo = angosto ? Math.max(70, Math.min(120, ancho - 250)) : Math.min(340, Math.round(ancho * 0.36));
  const x = (v) => 5 + ((Math.max(dominio[0], Math.min(dominio[1], v)) - dominio[0]) / (dominio[1] - dominio[0])) * (anchoIntervalo - 10);
  const cv = (d) => (ee(d) == null || !valor(d) ? null : (100 * ee(d)) / valor(d));
  const ref = referencia && valor(referencia) != null ? valor(referencia) : null;
  const intervalo = (d) => {
    const e = ee(d), v = valor(d);
    const lo = e == null ? null : Math.max(dominio[0], v - 1.96 * e), hi = e == null ? null : Math.min(dominio[1], v + 1.96 * e);
    return svg`<svg class="gB-intervalo" width=${anchoIntervalo} height="20" aria-hidden="true">
      <line x1=${x(dominio[0])} x2=${x(dominio[1])} y1="10" y2="10" stroke=${P.rejilla} stroke-width="1"/>
      ${ref != null ? svg`<line x1=${x(ref)} x2=${x(ref)} y1="2" y2="18" stroke=${P.tinta2} stroke-width="1.2" stroke-dasharray="2 2"/>` : ""}
      ${lo != null ? svg`<line x1=${x(lo)} x2=${x(hi)} y1="10" y2="10" stroke=${P.tinta2} stroke-width="3" stroke-linecap="round"/>` : ""}
      <circle cx=${x(v)} cy="10" r="4.5" fill=${P.serie} stroke=${P.fondo} stroke-width="1.2"/>
    </svg>`;
  };
  const renglon = (d, esRef = false) => {
    const c = cv(d), n = nivelDe(c), baja = n?.nombre === "Baja";
    const tr = html`<tr class=${esRef ? "gB-ref" : ""}>
      <th scope="row">${nombre(d)}</th>
      <td class="num gB-fuerte">${pct(valor(d))}${baja ? " *" : ""}</td>
      <td class="gB-celda-svg">${intervalo(d)}<span class="solo-lector">${ee(d) == null ? SIN_DATO : `de ${pct(Math.max(dominio[0], valor(d) - 1.96 * ee(d)))} a ${pct(valor(d) + 1.96 * ee(d))}`}</span></td>
      ${angosto ? "" : html`<td class="num">${c == null ? SIN_DATO : `${numero(c, 1)} %`}</td>`}
      <td><span class="gB-nivel">${n ? simbolo(n.nombre) : ""}<span class=${angosto ? "solo-lector" : ""}>${n ? n.nombre : SIN_DATO}</span></span></td>
    </tr>`;
    return globoCelda(tr, g, d);
  };
  const cuerpo = [...(referencia ? [renglon(referencia, true)] : []), ...filas.map((d) => renglon(d))];
  itinerante(cuerpo);
  const clave = html`<div class="leyenda-items">${PRECISION.map((p) => html`<span class="leyenda-item">${simbolo(p.nombre)}<span>Precisión ${p.nombre.toLowerCase()}, ${p.rango}</span></span>`)}${ref != null ? html`<span class="leyenda-item">${svg`<svg width="12" height="14" aria-hidden="true"><line x1="6" x2="6" y1="1" y2="13" stroke=${P.tinta2} stroke-width="1.2" stroke-dasharray="2 2"/></svg>`}<span>Raya: ${nombre(referencia)}</span></span>` : ""}</div>`;
  return html`<div class="forma gB-forma gB-tabla">
    ${clave}
    <table aria-label="Estimaciones con su intervalo de 95 % y su precisión">
      <thead><tr>
        <th scope="col">${rotuloNombre}</th>
        <th scope="col" class="num">${angosto ? "Valor" : rotuloValor}</th>
        <th scope="col">Intervalo de 95&nbsp;%<span class="gB-th-nota">${angosto ? `${dominio[0]} a ${dominio[1]} %` : `escala de ${dominio[0]} a ${dominio[1]} %${ref != null ? " · raya: nacional" : ""}`}</span></th>
        ${angosto ? "" : html`<th scope="col" class="num">Coef. de variación</th>`}
        <th scope="col">${angosto ? html`<span aria-hidden="true">Prec.</span><span class="solo-lector">Precisión</span>` : "Precisión"}</th>
      </tr></thead>
      <tbody>${cuerpo}</tbody>
    </table>
  </div>`;
}
