// formas/densidad.js
// ¿Dónde vive la población que cumple una condición y cuánto se mezcla con
// la que no? Mapa de densidad de puntos: cada punto vale un número fijo de
// personas (redondo, elegido para que haya entre 600 y 1,500 puntos) y va en
// un lugar al azar DENTRO de su entidad; en el tono de tema quienes cumplen
// la condición y en gris quienes no. Los puntos no son domicilios.
// Las posiciones salen de una semilla por entidad: no cambian al repintar y
// al cambiar el año solo se agregan o se quitan puntos.
// No: cuando la ubicación exacta importa, ni para tasas (coropleta).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {ISO_A_CVE} from "../geografia.js";
import {vacio, leyendaItems, azarEstable} from "./comun.js";
import {mapaBase} from "./mapa-base.js";
import {tamanoUnidad} from "./unidad.js";

const r1 = (v) => Math.round(v * 10) / 10;

// Posiciones al azar dentro de cada entidad, con semilla por clave. Se
// guardan y se extienden solo cuando hacen falta más.
const lugares = new Map();
function posiciones(f, k, n) {
  let r = lugares.get(k);
  if (!r) {
    const sem = Math.floor(azarEstable(`densidad-${k}`) * 2 ** 31);
    r = {lista: [], azar: d3.randomLcg(sem / 2 ** 31), caja: d3.geoBounds(f)};
    lugares.set(k, r);
  }
  const [[x0, y0], [x1, y1]] = r.caja;
  let intentos = 0;
  while (r.lista.length < n && intentos < n * 60 + 500) {
    intentos++;
    const p = [x0 + r.azar() * (x1 - x0), y0 + r.azar() * (y1 - y0)];
    if (d3.geoContains(f, p)) r.lista.push(p);
  }
  return r.lista.slice(0, n);
}

// geo: entidades. valores: Map de clave al dato. cumplen(d), total(d):
// personas que cumplen y población. encuadre: claves de la región o null.
// tope: puntos máximos (de 600 a 1,500). globo: de cada entidad.
export function densidad(geo, valores, {ancho, cumplen, total, encuadre = null, tope = null, clave = (f) => ISO_A_CVE.get(f.properties.id), rotulos = {cumplen: "Cumple la condición", resto: "No la cumple"}, globo: g = null}) {
  const dentro = (k) => !encuadre || encuadre.includes(k);
  const visibles = geo.features.filter((f) => dentro(clave(f)));
  const conDato = visibles.filter((f) => valores.get(clave(f)) != null && total(valores.get(clave(f))) > 0);
  if (!conDato.length) return vacio();
  const mapa = mapaBase(geo, {
    ancho, encuadre: encuadre ? (f) => dentro(clave(f)) : null,
    relleno: (f) => (!dentro(clave(f)) ? P.fondo3 : valores.get(clave(f)) == null ? P.sinDato : P.fondo),
    borde: (f) => (dentro(clave(f)) ? P.bordeFuerte : P.borde), grosor: () => 0.5,
  });
  const W = mapa.W, H = mapa.H, angosto = W < 560;
  const suma = d3.sum(conDato, (f) => total(valores.get(clave(f))));
  const unidad = tamanoUnidad(suma, {tope: tope ?? (angosto ? 900 : 1500)});
  const rp = angosto ? 1.3 : 1.9;
  const verde = [], gris = [];
  for (const f of conDato) {
    const k = clave(f), d = valores.get(k);
    const n = Math.round(total(d) / unidad), c = Math.min(n, Math.round(cumplen(d) / unidad));
    // Los primeros `c` de la sucesión al azar cumplen: quedan repartidos por
    // toda la entidad, no juntos.
    posiciones(f, k, n).forEach((p, i) => {
      const [x, y] = mapa.proyeccion(p) ?? [];
      if (x == null) return;
      (i < c ? verde : gris).push(svg`<circle cx=${r1(x)} cy=${r1(y)} r=${rp} />`);
    });
  }
  // Cada entidad es la marca del globo: un polígono transparente encima de
  // los puntos, con contorno al pasar el puntero.
  const zonas = visibles.map((f, i) => {
    const k = clave(f);
    const nodo = svg`<path class="marca-viva gE-zona" tabindex=${valores.get(k) ? 0 : null} style=${`--i:${i}`} d=${mapa.camino(f)} fill=${P.fondo} fill-opacity="0" stroke="none" />`;
    if (g) globoEn(nodo, g, valores.get(k) ?? {cve: k, _sinDato: true});
    return nodo;
  });
  const nVerde = verde.length, nGris = gris.length;
  const etiqueta = `Mapa de densidad de puntos: ${entero(nVerde + nGris)} puntos, cada uno de ${entero(unidad)} personas; ${entero(nVerde)} cumplen la condición.`;
  const dibujo = svg`<svg class="gE-densidad" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    ${mapa.capa}
    <g class="gE-entra" fill=${P.contexto} pointer-events="none">${gris}</g>
    <g class="gE-entra" fill=${P.serie} pointer-events="none">${verde}</g>
    <g>${zonas}</g>
  </svg>`;
  const haySinDato = visibles.some((f) => valores.get(clave(f)) == null);
  const leyenda = html`<div class="forma-leyendas">${leyendaItems([
    {tipo: "punto", color: P.serie, texto: rotulos.cumplen},
    {tipo: "punto", color: P.contexto, texto: rotulos.resto},
    ...(haySinDato ? [{tipo: "cuadro", color: P.sinDato, texto: "Sin dato"}] : []),
  ])}<span class="gE-nota">Cada punto representa ${entero(unidad)} personas y va al azar dentro de su entidad.</span></div>`;
  const nodo = html`<div class="forma gE-forma-densidad">${leyenda}${dibujo}</div>`;
  nodo.unidad = unidad; nodo.puntos = {cumplen: nVerde, resto: nGris};
  return nodo;
}
