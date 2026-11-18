// formas/sankey.js
// ¿De dónde a dónde? Flujo entre dos o más etapas: una columna de categorías
// por etapa y una cinta por cada paso, del ancho de su cantidad. Cada cinta y
// cada nodo tienen globo (ninguno usa el <title> nativo).
// No: más de seis categorías por etapa ni más de cuatro etapas.
import * as d3 from "npm:d3";
import {svg} from "npm:htl";
import {P} from "../paleta.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";

// flujos: una fila por paso. etapa(d) índice de la etapa de salida (0 para el
// paso de la primera a la segunda), origen(d), destino(d), valor(d).
// `etapas`: nombres de las etapas. `categorias`: orden de arriba a abajo.
// color(categoria). `globo`: para las cintas; `globoNodo`: para los nodos,
// cuyo dato es {etapa, categoria, valor, total}.
export function sankey(flujos, {ancho, etapa = () => 0, origen, destino, valor, etapas, categorias, color, colorNodo = color, lado = ancho < 520 ? 74 : 130, alto = null, globo: g, globoNodo = null}) {
  const filas = flujos.filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const n = etapas.length, H = alto ?? Math.max(300, Math.min(460, ancho * 0.55));
  const mt = 30, mb = 10, grosor = 16, hueco = 12;
  const x = (i) => lado + (i * (ancho - 2 * lado - grosor)) / (n - 1);
  // Total de cada nodo: lo que sale de él o, en la última etapa, lo que entra.
  const totalDe = (i, c) => (i < n - 1
    ? d3.sum(filas.filter((d) => etapa(d) === i && origen(d) === c), valor)
    : d3.sum(filas.filter((d) => etapa(d) === i - 1 && destino(d) === c), valor));
  const totalEtapa = d3.max(d3.range(n), (i) => d3.sum(categorias, (c) => totalDe(i, c)));
  const k = (H - mt - mb - hueco * (categorias.length - 1)) / totalEtapa;
  const nodos = d3.range(n).map((i) => {
    let y = mt;
    return new Map(categorias.map((c) => {
      const v = totalDe(i, c), nodo = {etapa: etapas[i], categoria: c, valor: v, total: d3.sum(categorias, (q) => totalDe(i, q)), y0: y, y1: y + v * k, sale: y, entra: y};
      y += v * k + hueco;
      return [c, nodo];
    }));
  });
  const cintas = [];
  for (let i = 0; i < n - 1; i++) {
    for (const co of categorias) for (const cd of categorias) {
      const d = filas.find((r) => etapa(r) === i && origen(r) === co && destino(r) === cd);
      if (!d) continue;
      const a = nodos[i].get(co), b = nodos[i + 1].get(cd), h = valor(d) * k;
      const x0 = x(i) + grosor, x1 = x(i + 1), xm = (x0 + x1) / 2;
      const ya = a.sale, yb = b.entra;
      a.sale += h; b.entra += h;
      const camino = `M${x0},${ya}C${xm},${ya} ${xm},${yb} ${x1},${yb}L${x1},${yb + h}C${xm},${yb + h} ${xm},${ya + h} ${x0},${ya + h}Z`;
      const nodo = svg`<path class="marca-viva sankey-cinta" tabindex="0" d=${camino} fill=${color(co)} fill-opacity="0.42"/>`;
      if (g) globoEn(nodo, g, {...d, totalOrigen: a.valor, etapaOrigen: etapas[i], etapaDestino: etapas[i + 1]});
      cintas.push(nodo);
    }
  }
  const cajas = nodos.flatMap((m, i) => [...m.values()].filter((d) => d.valor > 0).map((d) => {
    const izq = i === 0, der = i === n - 1;
    const nodo = svg`<g class="marca-viva" tabindex="0">
      <rect x=${x(i)} y=${d.y0} width=${grosor} height=${Math.max(1, d.y1 - d.y0)} fill=${colorNodo(d.categoria, i)} rx="2"/>
      ${izq || der ? svg`<text x=${izq ? x(i) - 8 : x(i) + grosor + 8} y=${(d.y0 + d.y1) / 2} dy="0.35em" text-anchor=${izq ? "end" : "start"} font-size=${TIPO.valor} fill=${P.tinta}>${d.categoria}</text>` : ""}
    </g>`;
    if (globoNodo) globoEn(nodo, globoNodo, d);
    return nodo;
  }));
  const titulos = etapas.map((e, i) => svg`<text x=${x(i) + grosor / 2} y="14" text-anchor=${i === 0 ? "end" : i === n - 1 ? "start" : "middle"} dx=${i === 0 ? grosor / 2 : i === n - 1 ? -grosor / 2 : 0} font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${e}</text>`);
  return svg`<svg class="sankey" width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">${titulos}${cintas}${cajas}</svg>`;
}
