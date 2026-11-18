// formas/cuantiles.js
// ¿Qué tan segura es esta cifra de encuesta? Cada renglón muestra 20 puntos,
// los 20 resultados igual de probables que deja el error de la encuesta
// (cuantiles de la distribución de muestreo). Se cuentan como personas en
// una fila: «de 20 resultados posibles, 14 quedan debajo del nacional». Los
// puntos se apilan en columnas cuando caen juntos (gráfica de puntos de
// cuantiles, Kay y otros, 2016). El color dice de qué lado de la referencia
// cae cada resultado, con el rojo y el azul que declara el capítulo.
// No: cifras sin error muestral, ni intervalos tan angostos que los 20
// puntos caen en una sola columna (basta la cifra).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";

// Inversa de la normal estándar (aproximación de Acklam, error < 1e-9).
function probit(p) {
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const e = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  if (p > 0.02425 && p < 0.97575) {
    const u = p - 0.5, r = u * u;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * u) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const q = Math.sqrt(-2 * Math.log(Math.min(p, 1 - p)));
  const x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((e[0] * q + e[1]) * q + e[2]) * q + e[3]) * q + 1);
  return p < 0.5 ? x : -x;
}
// Los n resultados igual de probables de una estimación con error ee.
export const cuantilesDe = (valor, ee, n = 20) => d3.range(n).map((k) => valor + ee * probit((k + 0.5) / n));
// Cuántos de esos resultados quedan debajo de la referencia.
export const debajoDe = (valor, ee, ref, n = 20) => cuantilesDe(valor, ee, n).filter((q) => q < ref).length;

// datos: una fila por unidad. etiqueta(d), valor(d), ee(d). `referencia`:
// {valor, texto}. `sig`: significado() del capítulo (rojo: debajo, azul:
// encima). `dominioX`: FIJO. `n`: número de puntos por renglón.
export function cuantiles(datos, {ancho, etiqueta, valor, ee, referencia, sig, dominioX = [0, 80], n = 20, formato = pct, formatoEje = pctMarca, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null && ee(d) != null).sort((a, b) => valor(b) - valor(a));
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const r = angosto ? 3.6 : 4.6, paso = 2 * r + 1;
  const izq = 8, der = 14, arriba = 30;
  const x = d3.scaleLinear(dominioX, [izq, ancho - der]).clamp(true);
  const ref = referencia.valor;
  const colorDe = (q) => (q < ref ? sig.color("baja") : sig.color("sube"));
  // Apila cada resultado en su columna (ancho de un punto), de abajo arriba.
  let y = arriba;
  const renglones = filas.map((d) => {
    const qs = cuantilesDe(valor(d), ee(d), n);
    const columnas = new Map();
    const puntos = qs.map((q) => {
      const col = Math.round(x(q) / paso);
      const k = columnas.get(col) ?? 0;
      columnas.set(col, k + 1);
      return {q, cx: col * paso, k};
    });
    const alto = Math.max(...columnas.values()) * paso;
    const base = y + 22 + alto;
    const fila = {d, puntos, base, top: y, alto: 22 + alto + 10, debajo: qs.filter((q) => q < ref).length};
    y += fila.alto;
    return fila;
  });
  const altoTotal = y + 4;
  const ticks = x.ticks(angosto ? 4 : 8);
  const nodo = svg`<svg class="cuantiles" width=${ancho} height=${altoTotal} viewBox=${`0 0 ${ancho} ${altoTotal}`} role="group" aria-label=${`Resultados igual de probables de cada estimación, ${n} por renglón`}>
    ${ticks.map((t) => svg`<g aria-hidden="true"><line x1=${x(t)} x2=${x(t)} y1=${arriba - 4} y2=${altoTotal} stroke=${P.rejilla} /><text x=${x(t)} y=${arriba - 10} text-anchor="middle" font-size=${TIPO.ejes - 1} fill=${P.tinta2}>${formatoEje(t)}</text></g>`)}
    <line aria-hidden="true" x1=${x(ref)} x2=${x(ref)} y1=${arriba - 4} y2=${altoTotal} stroke=${P.tinta2} stroke-width="1.3" stroke-dasharray="4 3"/>
    ${renglones.map((f, i) => {
      const grupo = svg`<g class="cq-fila marca-viva" tabindex="0">
        <rect class="cq-zona" x="0" y=${f.top} width=${ancho} height=${f.alto - 4} rx="4" fill=${P.fondo} fill-opacity="0" />
        <text x=${izq} y=${f.top + 14} font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta} stroke=${P.fondo} stroke-width="3" paint-order="stroke">${etiqueta(f.d)}<tspan font-weight="400" fill=${P.tinta2}>${` · ${formato(valor(f.d))} · ${f.debajo} de ${n} debajo`}</tspan></text>
        ${f.puntos.map((p) => svg`<circle cx=${p.cx} cy=${f.base - p.k * paso - r} r=${r} fill=${colorDe(p.q)} />`)}
        <line x1=${izq} x2=${ancho - der} y1=${f.base + 1} y2=${f.base + 1} stroke=${P.borde} />
      </g>`;
      if (g) globoEn(grupo, g, f.d);
      return grupo;
    })}
  </svg>`;
  const leyenda = html`<div class="leyenda-items">
    <span class="leyenda-item">${svg`<svg width="14" height="12" aria-hidden="true"><circle cx="7" cy="6" r="4.5" fill=${sig.color("baja")} /></svg>`}<span>${sig.rojo}</span></span>
    <span class="leyenda-item">${svg`<svg width="14" height="12" aria-hidden="true"><circle cx="7" cy="6" r="4.5" fill=${sig.color("sube")} /></svg>`}<span>${sig.azul}</span></span>
    <span class="leyenda-item">${svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${P.tinta2} stroke-width="1.6" stroke-dasharray="4 3"/></svg>`}<span>${referencia.texto}</span></span>
  </div>`;
  return html`<div class="forma gB-forma">${leyenda}${nodo}</div>`;
}
