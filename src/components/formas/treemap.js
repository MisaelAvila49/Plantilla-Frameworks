// formas/treemap.js
// ¿Cómo se reparte un total entre muchas partes? Un rectángulo por parte, del
// tamaño de su cantidad, agrupado por familia. El color es de IDENTIDAD (el
// grupo), no de medida: tres grupos con tono y los demás en gris, y el nombre
// acompaña siempre al color.
// No: comparar partes de tamaño parecido (lollipop) ni mostrar cambio.
import * as d3 from "npm:d3";
import {svg} from "npm:htl";
import {P, tintaSobre, categorias} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, conLeyenda} from "./comun.js";

// datos: una fila por parte. grupo(d), parte(d), valor(d). `grupos`: orden
// fijo de los grupos (de ahí sale el color, no de la frecuencia). El dato del
// globo lleva `total` (suma de todo) y `totalGrupo`.
export function treemap(datos, {ancho, grupo, parte, valor, grupos = null, color = null, alto = null, formato = entero, globo: g}) {
  const filas = datos.filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const orden = grupos ?? [...new Set(filas.map(grupo))];
  const tono = color ?? categorias(orden);
  const total = d3.sum(filas, valor);
  const porGrupo = d3.rollup(filas, (f) => d3.sum(f, valor), grupo);
  const raiz = d3.hierarchy({hijos: orden.map((n) => ({nombre: n, hijos: filas.filter((d) => grupo(d) === n)}))}, (d) => d.hijos)
    .sum((d) => (d.hijos ? 0 : valor(d))).sort((a, b) => b.value - a.value);
  const H = alto ?? Math.round(Math.max(300, Math.min(520, ancho * 0.56)));
  d3.treemap().size([ancho, H]).paddingInner(1.5).paddingTop(0).paddingOuter(0).round(true)(raiz);
  const hojas = raiz.leaves().map((h) => {
    const d = {...h.data, total, totalGrupo: porGrupo.get(grupo(h.data))};
    const w = h.x1 - h.x0, a = h.y1 - h.y0, relleno = tono(grupo(h.data)), tinta = tintaSobre(relleno);
    const cabe = w > 58 && a > 30, nombre = String(parte(h.data));
    const nodo = svg`<g class="marca-viva" tabindex="0" transform=${`translate(${h.x0},${h.y0})`}>
      <rect width=${w} height=${a} fill=${relleno} />
      ${cabe ? svg`<text x="6" y="16" font-size="12" font-weight="700" fill=${tinta}>${nombre.length * 6.6 > w - 10 ? nombre.slice(0, Math.max(3, Math.floor((w - 16) / 6.6))) + "…" : nombre}</text>` : ""}
      ${cabe && a > 46 ? svg`<text x="6" y="31" font-size="11.5" fill=${tinta}>${formato(valor(h.data))}</text>` : ""}
    </g>`;
    if (g) globoEn(nodo, g, d);
    return nodo;
  });
  const dibujo = svg`<svg class="treemap" width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">${hojas}</svg>`;
  return conLeyenda(leyendaItems(orden.map((n) => ({tipo: "cuadro", color: tono(n), texto: n}))), dibujo);
}
