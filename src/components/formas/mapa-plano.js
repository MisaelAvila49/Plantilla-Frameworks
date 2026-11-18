// formas/mapa-plano.js
// Mapa plano en SVG (Plot), sin mapa base ni giro. Es la pieza de la que
// salen todos los mapas del libro, con el mismo comportamiento en todos:
// la ENTIDAD ENCUADRA (el mapa se acerca a lo elegido) y lo TEMÁTICO RESALTA
// (lo que no cumple va atenuado, no desaparece). El globo es de la unidad
// que está bajo el puntero y la unidad lleva contorno al pasar.
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {proyeccionMx} from "../geografia.js";
import {base, viva} from "./comun.js";

// Los anillos escritos en el sentido de RFC 7946 (antihorario) se leen en D3
// como «todo el globo menos el polígono». Se invierte el anillo si su área
// sale mayor que medio globo.
const corregidos = new WeakSet();
export function rebobinar(geo) {
  if (corregidos.has(geo)) return geo;
  for (const f of geo.features) {
    const gm = f.geometry;
    const polis = gm.type === "Polygon" ? [gm.coordinates] : gm.type === "MultiPolygon" ? gm.coordinates : [];
    for (const p of polis) for (const anillo of p) {
      if (d3.geoArea({type: "Polygon", coordinates: [anillo]}) > 2 * Math.PI) anillo.reverse();
    }
  }
  corregidos.add(geo);
  return geo;
}

// geo: FeatureCollection. dato(f) devuelve el dato de la unidad (lo que
// recibe el globo) o null. color(dato, f) su relleno. encuadre(f): unidades
// a las que se acerca el mapa (por omisión, todas). atenuar(f): true para las
// que van al fondo. contorno(f): true para las que llevan contorno fijo.
export function mapaPlano(geo0, {ancho, dato = () => null, color, encuadre = null, atenuar = null, contorno = null, alto = null, proyeccion = proyeccionMx, globo: g}) {
  const geo = rebobinar(geo0);
  const dentro = encuadre ? geo.features.filter(encuadre) : geo.features;
  const visibles = dentro.length ? dentro : geo.features;
  const dominio = {type: "FeatureCollection", features: visibles};
  const w = Math.min(ancho, 980);
  const H = alto ?? Math.round(Math.max(260, Math.min(620, w * 0.64)));
  const unidades = visibles.map((f) => ({f, d: dato(f)}));
  const relleno = (u) => (atenuar?.(u.f) ? P.apagado : color(u.d, u.f));
  const marcados = contorno ? unidades.filter((u) => contorno(u.f)) : [];
  return Plot.plot(base({
    ancho: w, alto: H, margin: 6,
    projection: proyeccion(dominio),
    marks: [
      Plot.geo(unidades, {geometry: (u) => u.f.geometry, fill: relleno, stroke: P.bordeFuerte, strokeWidth: 0.4, ...viva(unidades.map((u) => u.d ?? {_sinDato: true, f: u.f}), g, {subir: true})}),
      marcados.length ? Plot.geo(marcados, {geometry: (u) => u.f.geometry, fill: "none", stroke: P.tinta, strokeWidth: 1.8, pointerEvents: "none"}) : null,
    ],
  }));
}
