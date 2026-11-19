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
// cuyo dato es {etapa, categoria, valor, total}. `colorCinta(d)`: tono de una
// cinta (por omisión, el de su origen). Una categoría que no tiene nada en una
// etapa no ocupa lugar en esa columna: así las etapas pueden tener categorías
// distintas (seis dificultades a la izquierda, dos destinos a la derecha).
// Un nodo intermedio puede recibir más de lo que deja salir: lo que no sigue
// TERMINA ahí (un flujo en cascada donde «ninguna más» no pasa a la etapa
// siguiente). Por eso su alto es lo que entra o lo que sale, lo mayor.
// `rotulos`: "extremos" (por omisión, solo la primera y la última columna) o
// "todos" (las intermedias, a la derecha del nodo y con halo sobre las
// cintas). `rotulo(categoria, i)` cambia el texto del rótulo; `ladoIzq` y
// `ladoDer`, el margen de cada lado (por omisión, `lado`); `tam`, la letra.
// `trama(d)` y `tramaNodo(d)`: true en una cinta o un nodo poco preciso, que
// se cubre con trama (R149); el id del patrón queda en `data-trama` del <svg>
// para que la leyenda lo use.
// `etapaDestino(d)`: columna de llegada de una cinta (por omisión, la que
// sigue a su salida). Con ella una cinta puede saltar columnas: en un flujo
// donde cada columna es UNA categoría fija, quien no tiene la de en medio va
// directo a la siguiente que tiene. `alFinal`: categoría de destino cuyas
// cintas salen al fondo de su nodo (un «ninguna más»), para que las que siguen
// no crucen por debajo de ella.
let serie = 0;
export function sankey(flujos, {ancho, etapa = () => 0, etapaDestino = null, alFinal = null, origen, destino, valor, etapas, categorias, color, colorNodo = color, colorCinta = null, lado = ancho < 520 ? 74 : 130, ladoIzq = lado, ladoDer = lado, alto = null, rotulos = "extremos", rotulo = (c) => c, tam = TIPO.valor, grosor = 16, trama = null, tramaNodo = null, globo: g, globoNodo = null}) {
  // Un `rotulo` que devuelve cadena vacía no pinta texto.
  const filas = flujos.filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const n = etapas.length, H = alto ?? Math.max(300, Math.min(460, ancho * 0.55));
  const mt = 30, mb = 10, hueco = 12, idTrama = `trama-sankey-${++serie}`;
  const tramas = [];
  const x = (i) => ladoIzq + (i * (ancho - ladoIzq - ladoDer - grosor)) / (n - 1);
  const sale = (i, c) => d3.sum(filas.filter((d) => etapa(d) === i && origen(d) === c), valor);
  const llega = etapaDestino ?? ((d) => etapa(d) + 1);
  const entra = (i, c) => (i > 0 ? d3.sum(filas.filter((d) => llega(d) === i && destino(d) === c), valor) : 0);
  const totalDe = (i, c) => Math.max(sale(i, c), entra(i, c));
  // La escala es la de la etapa más apretada: su total y sus huecos llenan el alto.
  const presentes = d3.range(n).map((i) => categorias.filter((c) => totalDe(i, c) > 0));
  const k = d3.min(d3.range(n), (i) => (H - mt - mb - hueco * (presentes[i].length - 1)) / d3.sum(presentes[i], (c) => totalDe(i, c)));
  const nodos = d3.range(n).map((i) => {
    let y = mt;
    return new Map(categorias.map((c) => {
      const v = totalDe(i, c), nodo = {etapa: etapas[i], indice: i, categoria: c, valor: v, total: d3.sum(categorias, (q) => totalDe(i, q)), y0: y, y1: y + v * k, sale: y, entra: y};
      if (v > 0) y += v * k + hueco;
      return [c, nodo];
    }));
  });
  const cintas = [];
  for (let i = 0; i < n - 1; i++) {
    const pares = d3.range(i + 1, n).flatMap((j) => categorias.map((cd) => [j, cd]));
    pares.sort((a, b) => (a[1] === alFinal) - (b[1] === alFinal));
    for (const co of categorias) for (const [j, cd] of pares) {
      const d = filas.find((r) => etapa(r) === i && origen(r) === co && llega(r) === j && destino(r) === cd);
      if (!d) continue;
      const a = nodos[i].get(co), b = nodos[j].get(cd), h = valor(d) * k;
      const x0 = x(i) + grosor, x1 = x(j), xm = (x0 + x1) / 2;
      const ya = a.sale, yb = b.entra;
      a.sale += h; b.entra += h;
      const camino = `M${x0},${ya}C${xm},${ya} ${xm},${yb} ${x1},${yb}L${x1},${yb + h}C${xm},${yb + h} ${xm},${ya + h} ${x0},${ya + h}Z`;
      const nodo = svg`<path class="marca-viva sankey-cinta" tabindex="0" d=${camino} fill=${colorCinta ? colorCinta(d) : color(co)} fill-opacity="0.42"/>`;
      if (g) globoEn(nodo, g, {...d, totalOrigen: a.valor, etapaOrigen: etapas[i], etapaDestino: etapas[j]});
      cintas.push(nodo);
      if (trama?.(d)) tramas.push(svg`<path d=${camino} fill=${`url(#${idTrama})`} pointer-events="none" />`);
    }
  }
  const cajas = nodos.flatMap((m, i) => [...m.values()].filter((d) => d.valor > 0).map((d) => {
    const izq = i === 0, der = i === n - 1, medio = !izq && !der && rotulos === "todos";
    const nodo = svg`<g class="marca-viva" tabindex="0">
      <rect x=${x(i)} y=${d.y0} width=${grosor} height=${Math.max(1, d.y1 - d.y0)} fill=${colorNodo(d.categoria, i)} rx="2"/>
      ${(izq || der || medio) && rotulo(d.categoria, i) ? svg`<text x=${izq ? x(i) - 6 : x(i) + grosor + 5} y=${(d.y0 + d.y1) / 2} dy="0.35em" text-anchor=${izq ? "end" : "start"} font-size=${tam} fill=${P.tinta} stroke=${medio ? P.fondo : "none"} stroke-width=${medio ? 3 : 0} stroke-linejoin="round" paint-order="stroke" pointer-events="none">${rotulo(d.categoria, i)}</text>` : ""}
    </g>`;
    if (globoNodo) globoEn(nodo, globoNodo, d);
    if (tramaNodo?.(d)) tramas.push(svg`<rect x=${x(i)} y=${d.y0} width=${grosor} height=${Math.max(1, d.y1 - d.y0)} fill=${`url(#${idTrama})`} pointer-events="none" />`);
    return nodo;
  }));
  // Sin margen izquierdo (la primera columna sin rótulo), su título arranca
  // en el nodo en vez de terminar en él. Con rótulos en todas las columnas,
  // los títulos intermedios arrancan en su nodo, como sus rótulos.
  const abre = ladoIzq < 40 ? "start" : "end";
  const titulos = etapas.map((e, i) => svg`<text x=${x(i) + grosor / 2} y="14" text-anchor=${i === 0 ? abre : i === n - 1 || rotulos === "todos" ? "start" : "middle"} dx=${i === 0 ? (abre === "end" ? 1 : -1) * grosor / 2 : i === n - 1 || rotulos === "todos" ? -grosor / 2 : 0} font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${e}</text>`);
  return svg`<svg class="sankey" width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)" data-trama=${tramas.length ? idTrama : null}>
    ${tramas.length ? svg`<defs><pattern id=${idTrama} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke=${P.tinta3} stroke-width="0.9" /></pattern></defs>` : ""}
    ${titulos}${cintas}${cajas}<g aria-hidden="true">${tramas}</g></svg>`;
}
