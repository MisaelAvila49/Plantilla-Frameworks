// src/components/formas/anotaciones.js
// Piezas de rotulación para las formas dibujadas en SVG propio (flechas,
// aluvial, enjambre, picos, líneas destacadas, áreas superpuestas): lienzo
// con nombre accesible, texto con halo, rótulos que no se enciman y línea
// guía. No dibuja ninguna gráfica por sí mismo.
import {svg} from "npm:htl";
import {P} from "../paleta.js";
import {TIPO} from "./comun.js";

// Raíz de una forma en SVG. `etiqueta` es el resumen en palabras que oye el
// lector de pantalla. Con marcas enfocables dentro el papel es «group»; sin
// ellas la figura entera es una imagen.
export function lienzo({clase, ancho, alto, etiqueta, enfocable = true}, ...hijos) {
  return svg`<svg class=${clase} width=${ancho} height=${alto} viewBox="0 0 ${ancho} ${alto}" role=${enfocable ? "group" : "img"} aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">${hijos}</svg>`;
}

// Ancho aproximado de un texto, para reservar su caja antes de dibujarlo.
export const anchoTexto = (t, tam = TIPO.valor, peso = 400) => String(t ?? "").length * tam * (peso >= 600 ? 0.6 : 0.56);

// Parte un texto en renglones de hasta `largo` caracteres, sin cortar palabras.
export function partir(texto, largo = 34) {
  const renglones = [];
  let actual = "";
  for (const palabra of String(texto ?? "").split(/\s+/).filter(Boolean)) {
    if (actual && (actual + " " + palabra).length > largo) { renglones.push(actual); actual = palabra; } else actual = actual ? actual + " " + palabra : palabra;
  }
  if (actual) renglones.push(actual);
  return renglones;
}

// Texto de uno o más renglones con halo del color del fondo, para que se lea
// encima de cintas, flechas y áreas. `renglones`: textos o {texto, peso, color}.
// `y` es la línea base del primer renglón.
export function rotulo(x, y, renglones, {ancla = "start", tam = TIPO.valor, peso = 400, color = null, halo = true, interlinea = 1.22} = {}) {
  const lista = [renglones].flat().filter((r) => r != null && r !== "").map((r) => (typeof r === "object" ? r : {texto: r}));
  return svg`<text x=${x} y=${y} text-anchor=${ancla} font-size=${tam} fill=${color ?? P.tinta} stroke=${halo ? P.fondo : "none"} stroke-width=${halo ? 3.2 : 0} stroke-linejoin="round" paint-order="stroke" pointer-events="none">${lista.map((r, i) => svg`<tspan x=${x} dy=${i ? tam * interlinea : 0} font-weight=${r.peso ?? peso} fill=${r.color ?? color ?? P.tinta}>${r.texto}</tspan>`)}</text>`;
}

// Separa rótulos sobre una recta para que no se encimen. Cada elemento trae
// `pos` (dónde quisiera ir su centro) y `tam` (cuánto mide sobre la recta).
// Devuelve la lista en el mismo orden, con `lugar` (el centro que le tocó).
export function separar(items, {min = -Infinity, max = Infinity, hueco = 3} = {}) {
  const orden = items.map((d, i) => ({...d, i})).sort((a, b) => a.pos - b.pos);
  let previo = null;
  for (const d of orden) {
    d.lugar = Math.max(d.pos, min + d.tam / 2, previo ? previo.lugar + (previo.tam + d.tam) / 2 + hueco : -Infinity);
    previo = d;
  }
  previo = null;
  for (const d of [...orden].reverse()) {
    d.lugar = Math.min(d.lugar, max - d.tam / 2, previo ? previo.lugar - (previo.tam + d.tam) / 2 - hueco : Infinity);
    previo = d;
  }
  return orden.sort((a, b) => a.i - b.i);
}

// Coloca rótulos alrededor de su punto sin que se encimen entre sí ni tapen
// los obstáculos ni se salgan del lienzo. Cada etiqueta trae {x, y, w, h}; se
// prueban varias posiciones y se toma la primera que cabe. La que no cabe en
// ninguna se devuelve con `cabe: false` y NO se dibuja (se lee en el globo).
// `obstaculos`: cajas [x0, y0, x1, y1] que no deben quedar tapadas.
export function colocar(etiquetas, {ancho, alto, obstaculos = [], separacion = 10, margen = 2} = {}) {
  const ocupadas = obstaculos.map((c) => [...c]);
  const choca = (a) => a[0] < margen || a[1] < margen || a[2] > ancho - margen || a[3] > alto - margen ||
    ocupadas.some((b) => a[0] < b[2] + 2 && a[2] > b[0] - 2 && a[1] < b[3] + 2 && a[3] > b[1] - 2);
  return etiquetas.map((e) => {
    const s = e.separacion ?? separacion;
    const candidatas = e.candidatas ?? [
      [s, -e.h / 2, "start"], [-s - e.w, -e.h / 2, "end"], [-e.w / 2, -s - e.h, "middle"], [-e.w / 2, s, "middle"],
      [s, -s - e.h, "start"], [-s - e.w, -s - e.h, "end"], [s, s, "start"], [-s - e.w, s, "end"],
      [2.4 * s, -e.h / 2, "start"], [-2.4 * s - e.w, -e.h / 2, "end"], [-e.w / 2, -2.6 * s - e.h, "middle"], [-e.w / 2, 2.6 * s, "middle"],
    ];
    for (const [dx, dy, ancla] of candidatas) {
      const caja = [e.x + dx, e.y + dy, e.x + dx + e.w, e.y + dy + e.h];
      if (choca(caja)) continue;
      ocupadas.push(caja);
      return {...e, cabe: true, caja, ancla, tx: ancla === "start" ? caja[0] : ancla === "end" ? caja[2] : (caja[0] + caja[2]) / 2};
    }
    return {...e, cabe: false};
  });
}

// Línea guía del punto anotado a su rótulo: llega al borde más cercano de la caja.
export function guia(x, y, caja, {color = null, grosor = 0.9} = {}) {
  const bx = Math.max(caja[0], Math.min(caja[2], x)), by = Math.max(caja[1], Math.min(caja[3], y));
  if (Math.hypot(bx - x, by - y) < 5) return null;
  return svg`<line x1=${x} y1=${y} x2=${bx} y2=${by} stroke=${color ?? P.tinta2} stroke-width=${grosor} pointer-events="none"/>`;
}
