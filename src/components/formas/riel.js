// formas/riel.js
// ¿Cómo se movió cada grupo en tres o más cortes y hacia dónde terminó? Un
// renglón por unidad (grupo, entidad) con un riel claro que recorre todos sus
// cortes: un punto por corte, en carriles que bajan un poco dentro del
// renglón, de modo que cuando el valor da la vuelta el riel se dobla en
// gancho. El último tramo es una flecha sólida que termina en el valor más
// reciente, con la cifra rotulada en la punta. El color sale del signo del
// cambio total (o es neutro) y la página decide el orden de los renglones.
// Inspirada en The New York Times (Dispatch del 27 de octubre de 2026).
// No: series largas (más de cinco cortes: líneas), más de unas quince
// unidades (se pierde el renglón; usar mosaico o lollipop), ni magnitudes sin
// un eje común (cada renglón usa la misma escala).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {globoEn, mostrarGlobo, ocultarGlobo} from "../globo.js";
import {vacio, TIPO, margenRotulos} from "./comun.js";
import {tintaLegible, anchoTexto} from "./unidad.js";

const r1 = (v) => Math.round(v * 10) / 10;

// Trazo del riel de una unidad. `pts`: [{x, y}] un punto por corte, ya en
// píxeles y cada uno en su carril. Donde el valor da la vuelta, el trazo
// llega al carril anterior, rodea el punto con medio círculo de radio R y
// sale por el carril siguiente (el gancho). Donde sigue en la misma
// dirección, pasa de un carril al otro con una curva en S. Devuelve los
// tramos por separado: el último es la flecha.
function trazar(pts, R) {
  const n = pts.length;
  const dir = [];
  for (let i = 0; i < n - 1; i++) {
    const d = Math.sign(pts[i + 1].x - pts[i].x);
    dir.push(d === 0 ? (dir[i - 1] ?? 1) : d);
  }
  const vuelta = (i) => i > 0 && i < n - 1 && dir[i] === -dir[i - 1];
  const tramos = [];
  for (let i = 0; i < n - 1; i++) {
    const s = dir[i];
    const a = vuelta(i) ? {x: pts[i].x + s * R, y: pts[i].y + R} : pts[i];
    const b = vuelta(i + 1) ? {x: pts[i + 1].x - s * R, y: pts[i + 1].y - R} : pts[i + 1];
    const m = (a.x + b.x) / 2;
    let d = `M${r1(a.x)},${r1(a.y)}` + (Math.abs(a.y - b.y) < 0.5 ? `L${r1(b.x)},${r1(b.y)}` : `C${r1(m)},${r1(a.y)} ${r1(m)},${r1(b.y)} ${r1(b.x)},${r1(b.y)}`);
    // Gancho: medio círculo que pasa por el punto de la vuelta. Va con el
    // tramo que llega, para que el riel completo sea un solo trazo continuo.
    if (vuelta(i + 1)) d += `A${R},${R} 0 0 ${s > 0 ? 1 : 0} ${r1(pts[i + 1].x)},${r1(pts[i + 1].y)}A${R},${R} 0 0 ${s > 0 ? 1 : 0} ${r1(pts[i + 1].x - s * R)},${r1(pts[i + 1].y + R)}`;
    tramos.push({d, s, fin: b});
  }
  return tramos;
}

// datos: filas largas, una por unidad y corte. unidad(d) nombre del renglón,
// corte(d) año o etiqueta ordenable, valor(d) la cifra.
// `cortes`: orden de los cortes (si no, se ordenan solos). `dominio`: FIJO,
// el mismo con cualquier filtro. `color(r)` recibe el resumen de la unidad
// ({unidad, filas, primero, ultimo, cambio}) y devuelve su tono. `orden(a, b)`
// compara resúmenes. `destacar(unidad)`: renglón con banda de fondo (el total).
// `referencia`: {valor, texto} línea punteada vertical. `corto(unidad)`:
// nombre corto en pantallas angostas. El nodo trae `resumen`.
export function riel(datos, {ancho, unidad, corte, valor, cortes = null, dominio, color = () => P.serie, orden = null, destacar = null,
  formato = pct, formatoEje = pctMarca, rotuloEje = null, referencia = null, corto = null, nombreCorte = String, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null && !Number.isNaN(+valor(d)));
  if (!filas.length) return vacio();
  const lista = cortes ?? [...new Set(filas.map(corte))].sort(d3.ascending);
  let resumen = d3.groups(filas, unidad).map(([u, f]) => {
    const orden = [...f].sort((p, q) => lista.indexOf(corte(p)) - lista.indexOf(corte(q)));
    const primero = orden[0], ultimo = orden.at(-1);
    return {unidad: u, filas: orden, primero, ultimo, cambio: valor(ultimo) - valor(primero)};
  }).filter((r) => r.filas.length >= 2);
  if (!resumen.length) return vacio("Se necesitan al menos dos cortes con dato para dibujar el riel.");
  if (orden) resumen = [...resumen].sort(orden);

  const angosto = ancho < 560;
  const nombre = (u) => (angosto && corto ? corto(u) : String(u));
  const R = angosto ? 7 : 10;
  const nCortes = d3.max(resumen, (r) => r.filas.length);
  const tramo = (nCortes - 1) * R;
  // Ancho: rótulos a la izquierda en escritorio; en un teléfono el nombre va
  // encima de su riel y el riel ocupa todo el ancho.
  const izquierda = angosto ? 12 : margenRotulos(resumen.map((r) => nombre(r.unidad)), 230) + 8;
  const holgura = angosto ? 50 : 66;
  const x = d3.scaleLinear(dominio, [izquierda + holgura, ancho - holgura]).clamp(true);
  const altoNombre = angosto ? 18 : 0;
  const altoFila = Math.max(angosto ? 38 : 50, tramo + 30) + altoNombre;
  const arriba = 40;
  const H = arriba + resumen.length * altoFila + 8;
  const grosor = angosto ? 10 : 13;

  // Eje y rejilla, arriba, con la misma escala para todos los renglones.
  const marcas = d3.ticks(dominio[0], dominio[1], angosto ? 4 : 7);
  const eje = svg`<g aria-hidden="true" pointer-events="none">
    ${marcas.map((t) => svg`<g><line x1=${x(t)} x2=${x(t)} y1=${arriba - 6} y2=${H - 4} stroke=${P.rejilla} /><text x=${x(t)} y=${arriba - 12} text-anchor="middle" font-size=${TIPO.ejes - 1} fill=${P.tinta2}>${formatoEje(t)}</text></g>`)}
    ${rotuloEje ? svg`<text x=${izquierda + holgura} y="12" font-size=${TIPO.ejes - 1} font-weight="700" fill=${P.tinta2}>${rotuloEje}</text>` : ""}
    ${referencia ? svg`<line x1=${x(referencia.valor)} x2=${x(referencia.valor)} y1=${arriba - 6} y2=${H - 4} stroke=${P.regla} stroke-width="1.4" stroke-dasharray="4 3" />` : ""}
  </g>`;

  const renglones = resumen.map((r, i) => {
    const top = arriba + i * altoFila;
    const y0 = top + altoNombre + (altoFila - altoNombre - tramo) / 2;
    const tono = color(r);
    const tinta = tintaLegible(tono, 4.5);
    const pts = r.filas.map((d, k) => ({x: x(valor(d)), y: y0 + k * R, d}));
    const tramos = trazar(pts, R);
    const riel = tramos.map((t) => t.d).join("");
    const ultimo = tramos.at(-1);
    const punta = pts.at(-1);
    const s = ultimo.s;
    // Flecha: el último tramo sólido, con la punta en el último valor.
    const cabeza = 7.5, ala = 5.2;
    const base = punta.x - s * cabeza;
    const flecha = svg`<g class="fc-flecha" style=${`--i:${i}`}>
      <path d=${ultimo.d} fill="none" stroke=${tono} stroke-width="3.6" stroke-linecap="round" pathLength="1" class="fc-traza" />
      <path d=${`M${r1(base)},${r1(punta.y - ala)}L${r1(punta.x + s * 1.5)},${r1(punta.y)}L${r1(base)},${r1(punta.y + ala)}Z`} fill=${tono} class="fc-aparece" />
    </g>`;
    // Cifra final en la punta, del lado hacia donde apunta la flecha.
    const cifra = formato(valor(r.ultimo));
    const xCifra = punta.x + s * 10;
    const rotuloFinal = svg`<text pointer-events="none" x=${xCifra} y=${punta.y + 4.5} text-anchor=${s > 0 ? "start" : "end"} font-size=${TIPO.valor + 0.5} font-weight="800" fill=${tinta} class="fc-aparece" style=${`--i:${i + 4}`}>${cifra}</text>`;
    // Años en el primer renglón, si no se enciman con otro rótulo.
    const anios = [];
    if (i === 0) {
      const ocupados = [[xCifra - (s > 0 ? 0 : anchoTexto(cifra, 13, true)), xCifra + (s > 0 ? anchoTexto(cifra, 13, true) : 0)]];
      pts.slice(0, -1).forEach((p, k) => {
        const t = nombreCorte(corte(p.d)), w = anchoTexto(t, 11.5);
        const giro = k > 0 && tramos[k - 1].s === -tramos[k].s;
        const tx = giro ? p.x + tramos[k - 1].s * (R + 6) : p.x, ancla = giro ? (tramos[k - 1].s > 0 ? "start" : "end") : "middle";
        const ty = giro ? p.y + 4 : p.y - 9;
        const caja = ancla === "middle" ? [tx - w / 2, tx + w / 2] : ancla === "start" ? [tx, tx + w] : [tx - w, tx];
        if (ocupados.some(([a, b]) => caja[0] < b + 4 && caja[1] > a - 4) && !giro) return;
        ocupados.push(caja);
        anios.push(svg`<text pointer-events="none" x=${tx} y=${ty} text-anchor=${ancla} font-size="11.5" fill=${P.tinta2}>${t}</text>`);
      });
    }
    const puntos = pts.slice(0, -1).map((p, k) => svg`<circle cx=${r1(p.x)} cy=${r1(p.y)} r=${angosto ? 4 : 4.8} fill=${tono} stroke=${P.fondo} stroke-width="1.6" class="fc-aparece" style=${`--i:${i + k}`} />`);
    // Captura del puntero: un círculo transparente por corte (el globo es el
    // de ese corte) y el contorno aparece al pasar.
    const capturas = pts.map((p) => {
      const nodo = svg`<circle class="marca-viva" cx=${r1(p.x)} cy=${r1(p.y)} r=${angosto ? 9 : 11} fill="transparent" />`;
      if (g) globoEn(nodo, g, {...p.d, _resumen: r});
      return nodo;
    });
    const esDestacada = destacar?.(r.unidad);
    const fila = svg`<g class="riel-fila" tabindex="0">
      ${esDestacada ? svg`<rect x="0" y=${top + 2} width=${ancho} height=${altoFila - 4} fill=${P.fondo2} />` : ""}
      ${i ? svg`<line x1="0" x2=${ancho} y1=${top} y2=${top} stroke=${P.rejilla} />` : ""}
      <text x=${angosto ? 0 : 0} y=${angosto ? top + 14 : y0 + tramo / 2 + 4.5} font-size=${TIPO.ejes} font-weight=${esDestacada ? 800 : 600} fill=${P.tinta}>${nombre(r.unidad)}</text>
      <path d=${riel} fill="none" stroke=${tono} stroke-opacity="0.24" stroke-width=${grosor} stroke-linecap="round" stroke-linejoin="round" />
      ${flecha}${puntos}${rotuloFinal}${anios}${capturas}
      <rect class="riel-marco" x="1" y=${top + 2} width=${ancho - 2} height=${altoFila - 4} rx="4" fill="none" stroke="none" pointer-events="none" />
    </g>`;
    // Teclado: el renglón entero toma el foco y abre el globo del último corte.
    if (g) {
      fila.setAttribute("role", "img");
      fila.setAttribute("aria-label", `${String(r.unidad)}: ${r.filas.map((d) => `${nombreCorte(corte(d))}, ${formato(valor(d))}`).join("; ")}`);
      fila.addEventListener("focus", () => { const c = fila.getBoundingClientRect(); mostrarGlobo(g.html({...r.ultimo, _resumen: r}), c.left + Math.min(c.width - 40, punta.x), c.top + (punta.y - top)); });
      fila.addEventListener("blur", ocultarGlobo);
    }
    return fila;
  });

  const descripcion = `Riel de ${resumen.length} renglones con ${lista.length} cortes, de ${nombreCorte(lista[0])} a ${nombreCorte(lista.at(-1))}. ` +
    resumen.map((r) => `${r.unidad}: de ${formato(valor(r.primero))} a ${formato(valor(r.ultimo))}`).join("; ") + ".";
  const dibujo = svg`<svg class="riel" role="group" aria-label=${descripcion} width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif);overflow:visible">${eje}${renglones}</svg>`;

  // Leyenda: un riel de muestra con un gancho, sus cortes rotulados y la
  // flecha que termina en el último, para leer los renglones sin buscar años.
  const muestra = (() => {
    const xs = lista.length > 2 ? [44, 150, 92] : [44, 150];
    const pts = xs.map((xx, k) => ({x: xx, y: 9 + k * 8}));
    const t = trazar(pts, 8);
    const fin = pts.at(-1), s = t.at(-1).s;
    const anios = lista.length > 2 ? [lista[0], lista[Math.floor(lista.length / 2)], lista.at(-1)] : [lista[0], lista.at(-1)];
    return svg`<svg width="200" height="34" aria-hidden="true" style="overflow:visible">
      <path d=${t.map((q) => q.d).join("")} fill="none" stroke=${P.tinta2} stroke-opacity="0.24" stroke-width="10" stroke-linecap="round" />
      <path d=${t.at(-1).d} fill="none" stroke=${P.tinta2} stroke-width="3" />
      <path d=${`M${fin.x - s * 7},${fin.y - 5}L${fin.x + s * 1.5},${fin.y}L${fin.x - s * 7},${fin.y + 5}Z`} fill=${P.tinta2} />
      ${pts.slice(0, -1).map((p) => svg`<circle cx=${p.x} cy=${p.y} r="4.4" fill=${P.tinta2} stroke=${P.fondo} stroke-width="1.4" />`)}
      <text x=${pts[0].x - 8} y=${pts[0].y + 4} text-anchor="end" font-size="11.5" fill=${P.tinta2}>${nombreCorte(anios[0])}</text>
      ${lista.length > 2 ? svg`<text x=${pts[1].x + 15} y=${pts[1].y + 4} font-size="11.5" fill=${P.tinta2}>${nombreCorte(anios[1])}</text>` : ""}
      <text x=${fin.x + s * 10} y=${fin.y + 4} text-anchor=${s < 0 ? "end" : "start"} font-size="11.5" font-weight="700" fill=${P.tinta2}>${nombreCorte(anios.at(-1))}</text>
    </svg>`;
  })();
  const textoMuestra = lista.length > 2
    ? `Cómo leer un renglón: un punto por corte; si el valor da la vuelta, el riel se dobla, y la flecha termina en ${nombreCorte(lista.at(-1))} con su cifra`
    : `Cómo leer un renglón: el punto es ${nombreCorte(lista[0])} y la flecha termina en ${nombreCorte(lista.at(-1))} con su cifra`;
  const leyenda = html`<div class="leyenda-items riel-leyenda"><span class="leyenda-item">${muestra}<span>${textoMuestra}</span></span></div>`;
  const nodo = html`<div class="forma">${leyenda}${dibujo}</div>`;
  nodo.resumen = resumen;
  return nodo;
}
