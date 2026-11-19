// formas/embudo.js
// ¿Cómo se achica el universo paso a paso hasta el grupo que mide el
// indicador? Embudo de universos: un renglón por paso, cada barra es el 100 %
// del paso anterior y su parte llena es lo que pasa al renglón siguiente; una
// «lupa» gris une esa parte con el renglón de abajo, que la amplía a todo el
// ancho. Explica por qué la cifra final es pequeña sin que se pierda en una
// barra única. Cada renglón dice en palabras llanas qué parte del anterior
// siguió («De ellas, 89 de cada 100 no lo denunciaron»): la versión con
// «X % pasa abajo» no se entendió en la revisión.
// No: grupos que no están contenidos uno en otro (barras) ni más de cinco
// pasos.
import {html, svg} from "npm:htl";
import {P, tintaSobre} from "../paleta.js";
import {entero, pct, deCada} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, TIPO} from "./comun.js";
import {partir} from "./anotaciones.js";

const r1 = (v) => Math.round(v * 10) / 10;

// pasos: [{paso, n, casos}] cada uno contenido en el anterior. color(i): el
// tono de la parte llena del paso i (lo que pasa al paso i + 1). globo: de
// cada barra, con {...paso, i, total, parte, anterior, deAnterior}.
// `frase(f)`: el texto del renglón; por omisión, el paso tal cual en el
// primero y «De ellas, k de cada 100: paso» en los demás. `unidad`: qué
// cuenta `n` (se escribe tras la cifra del renglón).
export function embudo(pasos, {ancho, color, rotulosLeyenda = null, frase = null, unidad = "personas", globo: g = null}) {
  if (pasos.length < 2 || !(pasos[0].n > 0)) return vacio();
  const angosto = ancho < 560, W = Math.min(ancho, 980);
  const tam = angosto ? 12 : TIPO.ejes, barra = angosto ? 20 : 24, lupa = angosto ? 30 : 38;
  const largo = Math.max(24, Math.floor(W / (tam * 0.55)));
  let y = 2;
  const filas = pasos.map((p, i) => {
    const sig = pasos[i + 1];
    const parte = sig ? (100 * sig.n) / p.n : null;
    const anterior = i ? pasos[i - 1] : null, deAnterior = anterior ? (100 * p.n) / anterior.n : null;
    const f0 = {...p, i, parte, total: pasos[0].n, anterior, deAnterior};
    const texto = frase ? frase(f0) : i === 0 ? p.paso : `De ellas, ${deCada(deAnterior, 100)}: ${p.paso.charAt(0).toLowerCase()}${p.paso.slice(1)}`;
    const renglones = partir(`${texto} · ${entero(p.n)} ${unidad}`, largo);
    const y0 = y + renglones.length * tam * 1.25 + 4;
    y = y0 + barra + (sig ? lupa : 0);
    return {...f0, renglones, yTexto: y0 - 6 - (renglones.length - 1) * tam * 1.25, y0};
  });
  const H = y + 4;
  const ultimo = filas.length - 1;
  const piezas = filas.map((f) => {
    const lleno = f.parte == null ? W : Math.max(1.5, (f.parte / 100) * W);
    const tono = color(f.i);
    const nodo = svg`<g class="marca-viva gE-paso" tabindex="0" style=${`--i:${f.i}`}>
      <rect x="0" y=${r1(f.y0)} width=${W} height=${barra} rx="2" fill=${f.i === ultimo ? tono : P.apagado} />
      ${f.parte != null ? svg`<rect x="0" y=${r1(f.y0)} width=${r1(lleno)} height=${barra} rx="2" fill=${tono} />` : ""}
    </g>`;
    if (g) globoEn(nodo, g, f);
    return nodo;
  });
  const lupas = filas.slice(0, -1).map((f) => {
    const lleno = Math.max(1.5, (f.parte / 100) * W), y0 = f.y0 + barra, y1 = filas[f.i + 1].y0 - 2;
    return svg`<path d=${`M0,${r1(y0)}L${r1(lleno)},${r1(y0)}L${W},${r1(y1)}L0,${r1(y1)}Z`} fill=${P.contexto} fill-opacity="0.32" aria-hidden="true" />`;
  });
  const textos = filas.map((f) => svg`<text x="0" y=${r1(f.yTexto)} font-size=${tam} font-weight="650" fill=${P.tinta} aria-hidden="true">
    ${f.renglones.map((t, k) => svg`<tspan x="0" dy=${k ? tam * 1.25 : 0}>${t}</tspan>`)}
  </text>`);
  // La parte que sigue al renglón de abajo se escribe junto a su barra, en
  // la misma forma que el texto del renglón («89 de cada 100»).
  const partes = filas.slice(0, -1).map((f) => {
    const lleno = (f.parte / 100) * W, dentro = lleno > W * 0.55;
    return svg`<text x=${r1(dentro ? lleno - 6 : lleno + 6)} y=${r1(f.y0 + barra / 2)} dy="0.35em" text-anchor=${dentro ? "end" : "start"} font-size=${tam} font-weight="700"
      fill=${dentro ? tintaSobre(color(f.i)) : P.tinta} stroke=${dentro ? "none" : P.fondo} stroke-width="3" paint-order="stroke" aria-hidden="true" pointer-events="none">${deCada(f.parte, 100)}</text>`;
  });
  const etiqueta = `Embudo de ${filas.length} pasos: de ${entero(filas[0].n)} ${unidad} a ${entero(filas.at(-1).n)}, ${pct((100 * filas.at(-1).n) / filas[0].n)} del primer paso.`;
  const dibujo = svg`<svg class="gE-embudo" width=${W} height=${r1(H)} viewBox="0 0 ${W} ${r1(H)}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <g>${lupas}</g><g>${piezas}</g><g>${textos}${partes}</g>
  </svg>`;
  const leyenda = rotulosLeyenda ? leyendaItems(rotulosLeyenda) : "";
  return html`<div class="forma gE-forma-embudo">${leyenda}${dibujo}</div>`;
}
