// formas/conjuntos.js
// ¿Cómo se reparte una población entre tres categorías a la vez? Conjuntos
// paralelos: una columna por variable (edad, sexo, causa), con un bloque por
// categoría del alto de sus personas, y listones que siguen a cada
// combinación de una columna a la siguiente. El color del listón es la
// categoría de UNA de las variables (la que elige el lector), de modo que se
// sigue a ese grupo a través de las otras dos.
// No: más de tres variables ni más de tres categorías por variable (los
// listones se enredan; usar tablas cruzadas).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, TIPO} from "./comun.js";
import {rotulo} from "./anotaciones.js";

const r1 = (v) => Math.round(v * 10) / 10;

// filas: una por combinación. dimensiones: [{id, titulo, categorias: [{valor,
// texto}], de: (d) => valor}] (tres). valor(d): personas. colorPor: id de la
// dimensión que da el color; color(texto): el tono de cada categoría.
// globo: de cada listón, con {combo: [{dim, texto}], valor, total};
// globoNodo: de cada bloque, con {dim, texto, valor, total}.
export function conjuntos(filas, {ancho, dimensiones, valor, colorPor, color, globo: g = null, globoNodo: gn = null}) {
  const total = d3.sum(filas, valor);
  if (!(total > 0)) return vacio();
  const angosto = ancho < 560, W = Math.min(ancho, 980);
  const k = dimensiones.length, grosor = 12, hueco = 14;
  const izq = angosto ? 88 : 132, der = angosto ? 88 : 132;
  const arriba = 30, H = angosto ? 330 : 400, abajo = 8;
  const xCol = (c) => izq + (c * (W - izq - der - grosor)) / (k - 1);
  const maxCats = d3.max(dimensiones, (dm) => dm.categorias.length);
  const escala = (H - arriba - abajo - hueco * (maxCats - 1)) / total;
  // Combinaciones con valor.
  const llave = (d) => dimensiones.map((dm) => dm.de(d)).join("|");
  const combos = d3.rollups(filas, (f) => d3.sum(f, valor), llave).filter(([, v]) => v > 0)
    .map(([l, v]) => ({valores: l.split("|"), valor: v}));
  const ic = dimensiones.findIndex((dm) => dm.id === colorPor);
  const textoDe = (c, v) => dimensiones[c].categorias.find((q) => String(q.valor) === v)?.texto ?? v;
  const tinta = (cb) => color(textoDe(ic, cb.valores[ic]));
  // Bloques por columna, apilados en el orden de sus categorías.
  const nodos = dimensiones.map((dm, c) => {
    let y = arriba;
    return dm.categorias.map((q) => {
      const v = d3.sum(combos.filter((cb) => cb.valores[c] === String(q.valor)), (cb) => cb.valor);
      const nodo = {c, valor: String(q.valor), texto: q.texto, v, y0: y, y1: y + v * escala};
      y += v * escala + (v > 0 ? hueco : 0);
      return nodo;
    }).filter((nd) => nd.v > 0);
  });
  // Dentro de cada bloque, las combinaciones se ordenan por la categoría de
  // color y luego por las demás columnas, para que los listones se crucen lo
  // menos posible y el color forme franjas continuas.
  const orden = (c) => (a, b) => {
    for (const j of [ic, ...d3.range(k).filter((j) => j !== ic && j !== c)]) {
      const ca = dimensiones[j].categorias.findIndex((q) => String(q.valor) === a.valores[j]);
      const cbb = dimensiones[j].categorias.findIndex((q) => String(q.valor) === b.valores[j]);
      if (ca !== cbb) return ca - cbb;
    }
    return 0;
  };
  // Posición vertical de cada combinación en cada columna.
  const pos = new Map(combos.map((cb) => [cb, []]));
  dimensiones.forEach((dm, c) => {
    for (const nd of nodos[c]) {
      let y = nd.y0;
      for (const cb of combos.filter((cb) => cb.valores[c] === nd.valor).sort(orden(c))) {
        pos.get(cb)[c] = y; y += cb.valor * escala;
      }
    }
  });
  const listones = [];
  combos.forEach((cb, i) => {
    for (let c = 0; c < k - 1; c++) {
      const x0 = xCol(c) + grosor, x1 = xCol(c + 1), xm = (x0 + x1) / 2;
      const ya = pos.get(cb)[c], yb = pos.get(cb)[c + 1], h = cb.valor * escala;
      const d = `M${r1(x0)},${r1(ya)}C${r1(xm)},${r1(ya)} ${r1(xm)},${r1(yb)} ${r1(x1)},${r1(yb)}L${r1(x1)},${r1(yb + h)}C${r1(xm)},${r1(yb + h)} ${r1(xm)},${r1(ya + h)} ${r1(x0)},${r1(ya + h)}Z`;
      const nodo = svg`<path class="marca-viva gE-liston" tabindex=${c === 0 ? 0 : null} style=${`--i:${i}`} d=${d} fill=${tinta(cb)} fill-opacity="0.55" />`;
      if (g) globoEn(nodo, g, {combo: cb.valores.map((v, j) => ({dim: dimensiones[j].titulo, texto: textoDe(j, v)})), color: tinta(cb), valor: cb.valor, total});
      listones.push(nodo);
    }
  });
  const tam = angosto ? 11 : TIPO.valor;
  const bloques = nodos.flatMap((col, c) => col.map((nd) => {
    const nodo = svg`<rect class="marca-viva gE-bloque" x=${r1(xCol(c))} y=${r1(nd.y0)} width=${grosor} height=${r1(Math.max(1, nd.y1 - nd.y0))} rx="2" fill=${P.tinta2} />`;
    if (gn) globoEn(nodo, gn, {dim: dimensiones[c].titulo, texto: nd.texto, valor: nd.v, total});
    return nodo;
  }));
  // Rótulos: a la izquierda de la primera columna, a la derecha de la última
  // y, en las de en medio, a la derecha del bloque con halo.
  const rotulos = nodos.flatMap((col, c) => col.map((nd) => {
    const yc = (nd.y0 + nd.y1) / 2, primera = c === 0, ultima = c === k - 1;
    const xr = primera ? xCol(c) - 6 : xCol(c) + grosor + 6;
    const renglones = [{texto: nd.texto, peso: 700}, {texto: pct((100 * nd.v) / total), color: P.tinta2}];
    return rotulo(r1(xr), r1(yc - tam * 0.25), renglones, {ancla: primera ? "end" : "start", tam, halo: !primera && !ultima});
  }));
  const titulos = dimensiones.map((dm, c) => svg`<text x=${r1(xCol(c) + grosor / 2)} y="14" text-anchor=${c === 0 ? "end" : c === k - 1 ? "start" : "middle"} dx=${c === 0 ? grosor / 2 : c === k - 1 ? -grosor / 2 : 0} font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${dm.titulo}</text>`);
  const etiqueta = `Conjuntos paralelos de ${dimensiones.map((dm) => dm.titulo.toLowerCase()).join(", ")}, con ${combos.length} combinaciones; el color sigue a ${dimensiones[ic].titulo.toLowerCase()}.`;
  const dibujo = svg`<svg class="gE-conjuntos" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <g>${listones}</g><g>${bloques}</g><g aria-hidden="true">${titulos}${rotulos}</g>
  </svg>`;
  const leyenda = leyendaItems(dimensiones[ic].categorias.map((q) => ({tipo: "cuadro", color: color(q.texto), texto: q.texto})));
  const nodo = html`<div class="forma gE-forma-conjuntos">${leyenda}${dibujo}</div>`;
  nodo.combos = combos.map((cb) => ({...Object.fromEntries(cb.valores.map((v, j) => [dimensiones[j].id, textoDe(j, v)])), valor: cb.valor, total}));
  return nodo;
}
