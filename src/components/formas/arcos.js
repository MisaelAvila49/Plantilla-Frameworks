// formas/arcos.js
// ¿Qué pares de una lista ordenada están conectados, y con cuánto? Diagrama
// de arcos: los lugares van en fila sobre una línea, en un orden con sentido
// (de norte a sur, de oeste a este), y cada flujo es un arco entre su salida
// y su llegada, con el grosor de su número de personas (escala FIJA). Un
// arco largo une lugares lejanos en ese orden.
// Con un lugar elegido, sus salidas van en rojo y sus llegadas en azul (el
// significado del capítulo); los demás flujos mayores quedan en gris.
// No: con muchos flujos (matriz de adyacencia) ni sin un orden natural.
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, TIPO} from "./comun.js";

const r1 = (v) => Math.round(v * 10) / 10;

// lugares: claves en el orden de la fila. flujos: [{o, d, valor, casos}].
// foco: clave elegida o null. maximo: flujos dibujados (los mayores de la
// selección). tope: personas del grosor máximo. globo: de cada arco.
// globoLugar: de cada punto de la fila, con {k, nombre, salen, llegan}.
export function arcos(lugares, flujos, {ancho, nombre, corto = nombre, foco = null, maximo = 20, tope, grosorMax = null, globo: g = null, globoLugar: gl = null}) {
  if (lugares.length < 2) return vacio();
  const angosto = ancho < 560, n = lugares.length;
  const W = Math.min(ancho, 980), m = angosto ? 10 : 18;
  const x = new Map(lugares.map((k, i) => [k, m + (i * (W - 2 * m)) / (n - 1)]));
  const propios = foco ? flujos.filter((f) => f.o === foco || f.d === foco) : [];
  const seleccion = d3.sort(foco ? propios : flujos, (f) => -f.valor).slice(0, maximo);
  const elegidos = new Set(seleccion);
  // Contexto gris: con un lugar elegido, los flujos mayores del país que no
  // son suyos, para ver dónde caen sus arcos frente al resto.
  const contexto = foco ? d3.sort(flujos.filter((f) => !elegidos.has(f) && f.o !== foco && f.d !== foco), (f) => -f.valor).slice(0, 12) : [];
  if (!seleccion.length) return vacio("Sin flujos que dibujar para esta selección.");
  const gMax = grosorMax ?? (angosto ? 9 : 14);
  // Grosor proporcional a las personas (lineal): uno del doble mide el doble.
  const grosor = (v) => Math.max(1, (Math.min(v, tope) / tope) * gMax);
  // Alto de cada arco: proporcional a la distancia entre sus extremos, con
  // un tope para que el lienzo no crezca de más.
  const altoMax = angosto ? Math.min(200, W * 0.55) : Math.min(300, W * 0.32);
  const kAlto = altoMax / (W - 2 * m);
  const base = altoMax + gMax + 10;
  const rot = angosto ? 36 : 44;
  const H = base + rot + 10;
  const tono = (f) => (!foco ? P.serie : f.o === foco ? P.rojo : f.d === foco ? P.azul : P.contexto);
  const camino = (f) => {
    const xa = x.get(f.o), xb = x.get(f.d), alto = Math.abs(xb - xa) * kAlto;
    const [a, b] = xa < xb ? [xa, xb] : [xb, xa];
    return `M${r1(a)},${base}C${r1(a)},${r1(base - alto * 1.33)} ${r1(b)},${r1(base - alto * 1.33)} ${r1(b)},${base}`;
  };
  const dibujaArco = (f, i, fondo) => {
    const w = grosor(f.valor);
    const nodo = svg`<path class=${fondo ? "gE-arco gE-arco-fondo" : "marca-viva gE-arco"} style=${`--w:${r1(w)}px;--i:${Math.min(i, 30)}`} d=${camino(f)} fill="none" stroke=${tono(f)}
      stroke-width=${r1(w)} stroke-opacity=${fondo ? 0.45 : 0.72} stroke-linecap="round" tabindex=${fondo ? null : 0} />`;
    if (g) globoEn(nodo, g, {...f, origen: nombre(f.o), destino: nombre(f.d)});
    return nodo;
  };
  // Los grises van abajo; los de color, del más ancho al más delgado, para
  // que los delgados queden encima.
  const arcosSvg = [...contexto.map((f, i) => dibujaArco(f, i, true)), ...d3.sort(seleccion, (f) => -f.valor).map((f, i) => dibujaArco(f, i, false))];
  const tam = angosto ? 9 : 11.5;
  // Cada lugar de la fila es también una marca: su globo da sus salidas y
  // llegadas totales. Va antes que los arcos en el documento.
  const salen = d3.rollup(flujos, (v) => d3.sum(v, (f) => f.valor), (f) => f.o), llegan = d3.rollup(flujos, (v) => d3.sum(v, (f) => f.valor), (f) => f.d);
  const puntos = lugares.map((k) => {
    const nodo = svg`<circle class=${gl ? "marca-viva gE-lugar" : "gE-lugar"} cx=${r1(x.get(k))} cy=${base} r=${k === foco ? 5 : 3.6} fill=${k === foco ? P.tinta : P.tinta2} />`;
    if (gl) globoEn(nodo, gl, {k, nombre: nombre(k), salen: salen.get(k) ?? 0, llegan: llegan.get(k) ?? 0});
    return nodo;
  });
  const rotulos = lugares.map((k) => svg`<text transform=${`translate(${r1(x.get(k))},${base + 9}) rotate(-90)`} text-anchor="end" dy="0.35em" font-size=${tam}
    font-weight=${k === foco ? 700 : 400} fill=${P.tinta}>${corto(k)}</text>`);
  const etiqueta = foco
    ? `Arcos de las salidas y llegadas de ${nombre(foco)}: ${seleccion.length} flujos. El mayor, de ${nombre(seleccion[0].o)} a ${nombre(seleccion[0].d)}, ${entero(seleccion[0].valor)} personas.`
    : `Los ${seleccion.length} flujos mayores entre lugares. El mayor, de ${nombre(seleccion[0].o)} a ${nombre(seleccion[0].d)}, ${entero(seleccion[0].valor)} personas.`;
  const dibujo = svg`<svg class="gE-arcos" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <line x1=${m} x2=${W - m} y1=${base} y2=${base} stroke=${P.regla} stroke-width="0.8" />
    <g>${puntos}</g><g>${arcosSvg}</g><g aria-hidden="true">${rotulos}</g>
  </svg>`;
  // Leyenda del grosor, con la escala fija.
  const refs = [tope / 8, tope / 2, tope].map((v) => Math.round(v / 1000) * 1000);
  const grosores = html`<span class="leyenda-item gE-grosor">${refs.map((v) => html`<span class="leyenda-item"><svg width="26" height="18" aria-hidden="true"><line x1="2" x2="24" y1="9" y2="9" stroke=${P.tinta2} stroke-width=${r1(grosor(v))} stroke-linecap="round" /></svg><span>${entero(v)}</span></span>`)}<span>personas${refs.at(-1) >= tope ? " o más" : ""}</span></span>`;
  const leyenda = html`<div class="forma-leyendas">${leyendaItems(foco
    ? [{tipo: "linea", color: P.rojo, texto: `Salen de ${nombre(foco)}`}, {tipo: "linea", color: P.azul, texto: `Llegan a ${nombre(foco)}`}, ...(contexto.length ? [{tipo: "linea", color: P.contexto, texto: "Otros flujos mayores"}] : [])]
    : [{tipo: "linea", color: P.serie, texto: "Flujo entre dos entidades"}])}${grosores}</div>`;
  const nodo = html`<div class="forma gE-forma-arcos">${leyenda}${dibujo}</div>`;
  nodo.dibujados = seleccion;
  return nodo;
}
