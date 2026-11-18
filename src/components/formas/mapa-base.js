// src/components/formas/mapa-base.js
// Fondo de mapa en SVG propio (D3, sin Plot) para las formas que dibujan
// encima marcas con geometría propia: flechas y picos. Usa la misma
// proyección y el mismo encuadre que formas/mapa-plano.js, de modo que todos
// los mapas del libro coinciden. No es una gráfica por sí mismo.
import * as d3 from "npm:d3";
import {svg} from "npm:htl";
import {P} from "../paleta.js";
import {proyeccionMx} from "../geografia.js";
import {rebobinar} from "./mapa-plano.js";

// Proyección de D3 a partir de la configuración que usa Plot ({type,
// parallels, rotate, domain}), ajustada al lienzo con un margen o, si se
// pasa `marco` ([[x0, y0], [x1, y1]]), a ese rectángulo del lienzo.
export function proyectar({type, parallels, rotate, domain}, ancho, alto, margen = 6, marco = null) {
  const p = type === "conic-conformal" ? d3.geoConicConformal() : type === "albers" ? d3.geoAlbers() : d3.geoMercator();
  if (parallels) p.parallels(parallels);
  if (rotate) p.rotate(rotate);
  return p.fitExtent(marco ?? [[margen, margen], [ancho - margen, alto - margen]], domain);
}

// geo: FeatureCollection. encuadre(f): unidades a las que se acerca el mapa
// (por omisión, todas). relleno(f) y borde(f): color de cada unidad.
// alElegir(f): si se pasa, cada unidad responde al clic. Devuelve el ancho y
// el alto del lienzo, la proyección, el centro en pantalla de cada unidad y
// la capa de polígonos lista para insertar en un <svg>.
//
// Opciones para un mapa a pantalla completa (las demás formas no las usan):
//   anchoTope   ancho máximo del lienzo (980 por omisión, R42). Infinity
//               deja que el mapa ocupe lo que mida su contenedor.
//   marco       rectángulo [[x0, y0], [x1, y1]] donde se encuadra el país,
//               para dejar libre la esquina que tapa una tarjeta flotante.
//   enfocable   con `alElegir` y `etiqueta(f)`, las unidades se recorren con
//               el teclado: UNA sola parada de tabulador para toda la capa
//               (tabindex móvil), flechas del teclado para pasar de una
//               unidad a otra en orden alfabético, Enter o espacio para
//               elegir. Sin esto la capa es decorativa (aria-hidden).
//   activa(f)   unidad que recibe la parada de tabulador (la elegida).
export function mapaBase(geo0, {ancho, alto = null, encuadre = null, margen = 6, proyeccion = proyeccionMx, relleno = () => P.fondo2, borde = () => P.bordeFuerte, grosor = () => 0.5, alElegir = null,
  anchoTope = 980, marco = null, enfocable = false, etiqueta = null, activa = null, rotuloCapa = "Entidades del mapa"}) {
  const geo = rebobinar(geo0);
  const dentro = encuadre ? geo.features.filter(encuadre) : geo.features;
  const visibles = dentro.length ? dentro : geo.features;
  const W = Math.min(ancho, anchoTope);
  const H = alto ?? Math.round(Math.max(260, Math.min(620, W * 0.64)));
  const p = proyectar(proyeccion({type: "FeatureCollection", features: visibles}), W, H, margen, marco);
  const camino = d3.geoPath(p);
  const teclado = Boolean(enfocable && alElegir && etiqueta);
  // Las unidades de borde grueso van al final, para que su contorno se vea entero.
  const poligonos = [...geo.features].sort((a, b) => grosor(a) - grosor(b)).map((f) => {
    const nodo = svg`<path d=${camino(f)} fill=${relleno(f)} stroke=${borde(f)} stroke-width=${grosor(f)} stroke-linejoin="round"/>`;
    if (alElegir) { nodo.style.cursor = "pointer"; nodo.addEventListener("click", () => alElegir(f)); }
    if (teclado) {
      nodo.dataset.unidad = "";
      nodo.setAttribute("role", "button");
      nodo.setAttribute("aria-label", etiqueta(f));
      nodo.setAttribute("tabindex", "-1");
      nodo.classList.add("mapa-unidad");
      nodo.__f = f;
    }
    return nodo;
  });
  let capa;
  if (teclado) {
    // Orden de recorrido: alfabético por etiqueta, no el orden de pintado.
    const orden = [...poligonos].sort((a, b) => a.getAttribute("aria-label").localeCompare(b.getAttribute("aria-label"), "es"));
    const inicial = orden.find((n) => activa?.(n.__f)) ?? orden[0];
    inicial.setAttribute("tabindex", "0");
    const mover = (de, a) => { de.setAttribute("tabindex", "-1"); a.setAttribute("tabindex", "0"); a.focus(); };
    for (const [i, n] of orden.entries()) {
      n.addEventListener("keydown", (e) => {
        const k = e.key;
        if (k === "Enter" || k === " ") { e.preventDefault(); alElegir(n.__f); return; }
        const salto = k === "ArrowRight" || k === "ArrowDown" ? 1 : k === "ArrowLeft" || k === "ArrowUp" ? -1 : 0;
        if (salto) { e.preventDefault(); mover(n, orden[(i + salto + orden.length) % orden.length]); }
        else if (k === "Home") { e.preventDefault(); mover(n, orden[0]); }
        else if (k === "End") { e.preventDefault(); mover(n, orden.at(-1)); }
      });
    }
    capa = svg`<g class="mapa-base" role="group" aria-label=${rotuloCapa}>${poligonos}</g>`;
  } else capa = svg`<g class="mapa-base" aria-hidden="true">${poligonos}</g>`;
  return {W, H, proyeccion: p, camino, centro: (f) => camino.centroid(f), capa};
}
