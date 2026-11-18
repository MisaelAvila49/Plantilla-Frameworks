// formas/red.js
// ¿Quién se conecta con quién? Red: un círculo por lugar, del tamaño de su
// movimiento, y una línea entre dos lugares cuando el flujo entre ellos (en
// los dos sentidos) pasa de un umbral. La posición la decide un acomodo de
// fuerzas que se calcula completo antes de dibujar (nada se mueve en
// pantalla) y sobre TODOS los enlaces posibles, así que no cambia con el
// umbral: subirlo solo quita líneas. La posición no es geográfica: dos
// círculos cerca comparten mucho movimiento.
// No: para comparar cantidades entre pares (matriz de adyacencia) ni con más
// de unos 60 nodos.
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, TIPO} from "./comun.js";
import {rotulo} from "./anotaciones.js";

const r1 = (v) => Math.round(v * 10) / 10;
// El acomodo se calcula una vez por conjunto de nodos y enlaces base.
const acomodos = new Map();

// nodos: [{id, nombre, corto, tamano}]. enlaces: [{a, b, valor, casos}] (sin
// sentido). base: valor mínimo de los enlaces que ordenan el acomodo.
// minimo: valor mínimo de las líneas que se dibujan. tope: tamaño FIJO del
// círculo mayor. destacar(id): true para los nodos en color. globo: de cada
// nodo; globoEnlace: de cada línea.
export function red(nodos, enlaces, {ancho, base, minimo, tope, destacar = null, clave = "red", globo: g = null, globoEnlace: ge = null}) {
  if (!nodos.length) return vacio();
  const angosto = ancho < 560, W = Math.min(ancho, 980), Hmax = angosto ? 440 : 500;
  // Acomodo en coordenadas propias de 0 a 1000; luego se encaja en el lienzo.
  let pos = acomodos.get(clave);
  if (!pos) {
    const ns = nodos.map((n) => ({id: n.id}));
    const ls = enlaces.filter((e) => e.valor >= base).map((e) => ({source: e.a, target: e.b, valor: e.valor}));
    const vmax = d3.max(ls, (l) => l.valor) ?? 1;
    d3.forceSimulation(ns)
      .force("enlace", d3.forceLink(ls).id((d) => d.id).distance((l) => 140 - 90 * Math.sqrt(l.valor / vmax)).strength((l) => 0.2 + 0.6 * Math.sqrt(l.valor / vmax)))
      .force("carga", d3.forceManyBody().strength(-260))
      // Gravedad hacia el centro: sin ella, las entidades sin enlaces se van
      // lejos y el resto queda apretado al encajar el acomodo en el lienzo.
      .force("x", d3.forceX(0).strength(0.16)).force("y", d3.forceY(0).strength(0.16))
      .force("choque", d3.forceCollide(34))
      .stop().tick(400);
    pos = new Map(ns.map((n) => [n.id, [n.x, n.y]]));
    acomodos.set(clave, pos);
  }
  const xs = [...pos.values()].map((p) => p[0]), ys = [...pos.values()].map((p) => p[1]);
  const rMax = angosto ? 20 : 30, m = rMax + 6;
  // Se encaja en el lienzo estirando a lo sumo 1.6 veces un eje respecto del
  // otro: la posición no es geográfica, pero un estirón mayor junta de más.
  // El alto del lienzo sigue al acomodo: no se deja aire vacío arriba y abajo.
  const kx = (W - 2 * m) / (d3.extent(xs)[1] - d3.extent(xs)[0] || 1), ky = (Hmax - 2 * m - 14) / (d3.extent(ys)[1] - d3.extent(ys)[0] || 1);
  const kX = Math.min(kx, ky * 1.6), kY = Math.min(ky, kx * 1.6);
  const H = Math.round((d3.extent(ys)[1] - d3.extent(ys)[0]) * kY + 2 * m + 14);
  const cx = (d3.extent(xs)[0] + d3.extent(xs)[1]) / 2, cy = (d3.extent(ys)[0] + d3.extent(ys)[1]) / 2;
  const px = (id) => [W / 2 + (pos.get(id)[0] - cx) * kX, (H - 14) / 2 + (pos.get(id)[1] - cy) * kY];
  const radio = (v) => Math.max(3, Math.sqrt(Math.min(v, tope) / tope) * rMax);
  const enColor = (id) => (destacar ? destacar(id) : true);
  const visibles = d3.sort(enlaces.filter((e) => e.valor >= minimo), (e) => e.valor);
  const gMax = angosto ? 6 : 9;
  const vTope = d3.max(enlaces, (e) => e.valor) ?? 1;
  const lineas = visibles.map((e, i) => {
    const [x1, y1] = px(e.a), [x2, y2] = px(e.b), color = enColor(e.a) && enColor(e.b) ? P.serie : P.contexto;
    const w = Math.max(0.8, Math.sqrt(e.valor / vTope) * gMax);
    const nodo = svg`<line class="gE-enlace" style=${`--w:${r1(w)}px;--i:${Math.min(i, 40)}`} x1=${r1(x1)} y1=${r1(y1)} x2=${r1(x2)} y2=${r1(y2)} stroke=${color} stroke-width=${r1(w)} stroke-opacity=${color === P.serie ? 0.6 : 0.45} stroke-linecap="round" />`;
    if (ge) globoEn(nodo, ge, {...e, nombreA: nodos.find((n) => n.id === e.a).nombre, nombreB: nodos.find((n) => n.id === e.b).nombre});
    return nodo;
  });
  const ordenados = d3.sort(nodos, (n) => -n.tamano);
  const circulos = ordenados.map((n, i) => {
    const [x, y] = px(n.id);
    const nodo = svg`<circle class="marca-viva gE-nodo" tabindex=${i < 32 ? 0 : null} style=${`--i:${i}`} cx=${r1(x)} cy=${r1(y)} r=${r1(radio(n.tamano))} fill=${enColor(n.id) ? P.serie : P.contexto} stroke=${P.fondo} stroke-width="1.2" />`;
    if (g) globoEn(nodo, g, n);
    return nodo;
  });
  const tam = angosto ? 10 : 11.5;
  const conRotulo = angosto ? ordenados.slice(0, 16) : ordenados;
  const rotulos = conRotulo.map((n) => {
    const [x, y] = px(n.id), r = radio(n.tamano);
    return rotulo(r1(x), r1(y + r + tam + 1), [{texto: n.corto, peso: enColor(n.id) ? 700 : 400, color: enColor(n.id) ? P.tinta : P.tinta2}], {ancla: "middle", tam});
  });
  const mayor = ordenados[0];
  const etiqueta = `Red de ${nodos.length} lugares y ${visibles.length} enlaces de ${entero(minimo)} personas o más. El lugar con más movimiento es ${mayor.nombre}.`;
  const dibujo = svg`<svg class="gE-red" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <g>${lineas}</g><g>${circulos}</g><g aria-hidden="true">${rotulos}</g>
  </svg>`;
  const refs = [tope / 4, tope].map((v) => Math.round(v / 10000) * 10000);
  const tamanos = html`<span class="leyenda-item gE-tamanos">${refs.map((v) => html`<span class="leyenda-item"><svg width=${2 * radio(v) + 2} height=${2 * radio(v) + 2} aria-hidden="true"><circle cx=${radio(v) + 1} cy=${radio(v) + 1} r=${radio(v)} fill="none" stroke=${P.tinta2} /></svg><span>${entero(v)}</span></span>`)}<span>personas que salen o llegan</span></span>`;
  const leyenda = html`<div class="forma-leyendas">${leyendaItems([
    ...(destacar ? [{tipo: "punto", color: P.serie, texto: "Entidades de la región destacada"}, {tipo: "punto", color: P.contexto, texto: "Las demás"}] : [{tipo: "punto", color: P.serie, texto: "Entidad"}]),
    ...(destacar
      ? [{tipo: "linea", color: P.serie, texto: "Enlace dentro de la región"}, {tipo: "linea", color: P.contexto, texto: "Los demás enlaces"}]
      : [{tipo: "linea", color: P.serie, texto: `Enlace: ${entero(minimo)} personas o más entre las dos, en los dos sentidos`}]),
  ])}${tamanos}</div>`;
  const nodo = html`<div class="forma gE-forma-red">${leyenda}${dibujo}</div>`;
  nodo.enlaces = visibles;
  return nodo;
}
