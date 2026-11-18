// formas/piramide.js
// ¿Cómo se reparte una población por edad y sexo? Barras a la izquierda y a
// la derecha del eje, una por grupo de edad, del más joven (abajo) al mayor.
// Con `comparar`, una raya por barra marca el valor de otra edición.
// El tope del eje sale de `tope` (una constante del capítulo), no de la
// edición elegida, para que cambiar de año no mueva los ejes.
// No: comparar más de dos ediciones (heatmap de edad por año).
//
// Puntero: cada renglón (edad y sexo) es una zona que llega del centro al
// tope del eje, así que la barra se toca en todo su renglón aunque sea corta
// (como Plot.pointerY, pero sin confundir hombres con mujeres). Encima va una
// franja angosta sobre cada raya, con su propio globo: el valor de la otra
// edición. Raya y barra nunca comparten zona, así que no se confunden.
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {pctMarca} from "../formato.js";
import {globoEn, globoCon} from "../globo.js";
import {base, vacio, leyendaItems, conLeyenda} from "./comun.js";

// Ancho, en píxeles, de la franja que captura el puntero sobre cada raya.
const ZONA_RAYA = 12;

// Enlaza cada elemento de una marca de captura (invisible) con su globo y
// enciende la clase `piramide-resaltada` en el elemento visible que le corresponde.
function captura(datos, g, visibles) {
  return {
    render(indice, escalas, valores, dimensiones, contexto, siguiente) {
      const nodo = siguiente(indice, escalas, valores, dimensiones, contexto);
      const hijos = [...nodo.children];
      if (!g || hijos.length !== indice.length) return nodo;
      hijos.forEach((n, k) => {
        const i = indice[k];
        n.classList.add("piramide-zona");
        globoEn(n, g, datos[i]);
        const prender = (si) => visibles.get(i)?.classList.toggle("piramide-resaltada", si);
        n.addEventListener("pointerenter", () => prender(true));
        n.addEventListener("pointerleave", () => prender(false));
      });
      return nodo;
    },
  };
}
// Guarda el elemento visible de cada fila para que su zona lo resalte.
function anotar(visibles) {
  return {
    render(indice, escalas, valores, dimensiones, contexto, siguiente) {
      const nodo = siguiente(indice, escalas, valores, dimensiones, contexto);
      const hijos = [...nodo.children];
      if (hijos.length === indice.length) hijos.forEach((n, k) => visibles.set(indice[k], n));
      return nodo;
    },
  };
}

// datos: una fila por edad y sexo. edad(d), lado(d) devuelve `izquierda` o
// `derecha` (los nombres de los dos sexos), valor(d). `edades`: orden de
// abajo hacia arriba. Con `comparar`, el globo de las barras lleva
// `nombreBarras` al final del grupo y el de las rayas, `nombreComparar`
// («85 años o más · Hombres · 2020»). `globoComparar` sustituye al globo de
// las rayas cuando la otra edición necesita otra población en el globo.
export function piramide(datos, {ancho, edad, lado, valor, izquierda, derecha, edades, tope = null, comparar = null, nombreBarras = "", nombreComparar = "", formatoEje = pctMarca, rotuloX = null, globo: g, globoComparar = null}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const rayas = comparar ? comparar.filter((d) => valor(d) != null) : null;
  const signo = (d) => (lado(d) === izquierda ? -1 : 1);
  const max = tope ?? d3.max([...filas, ...(rayas ?? [])], valor);
  const w = Math.min(ancho, 860);
  const gBarras = rayas ? globoCon(g, nombreBarras) : g;
  const gRayas = rayas ? globoComparar ?? globoCon(g, nombreComparar) : null;
  const barrasVisibles = new Map(), rayasVisibles = new Map();
  const plot = Plot.plot(base({
    ancho: w, alto: edades.length * 21 + 78, marginLeft: 64, marginRight: 12, marginTop: 34, marginBottom: 38,
    x: {label: rotuloX, domain: [-max, max], tickFormat: (v) => formatoEje(Math.abs(v)), grid: true, ticks: w < 520 ? 5 : 9},
    y: {label: null, domain: [...edades].reverse(), padding: 0.14, tickSize: 0},
    marks: [
      Plot.barX(filas, {y: edad, x: (d) => signo(d) * valor(d), fill: P.serie, className: "piramide-barra", pointerEvents: "none", ...anotar(barrasVisibles)}),
      rayas ? Plot.tickX(rayas, {y: edad, x: (d) => signo(d) * valor(d), stroke: P.tinta, strokeWidth: 2.2, className: "piramide-raya", pointerEvents: "none", ...anotar(rayasVisibles)}) : null,
      Plot.ruleX([0], {stroke: P.fondo, strokeWidth: 2, pointerEvents: "none"}),
      // Zonas de captura, invisibles: el renglón de cada barra y, encima, la
      // franja de cada raya.
      g ? Plot.barX(filas, {y: edad, x1: 0, x2: (d) => signo(d) * max, fill: "transparent", ...captura(filas, gBarras, barrasVisibles)}) : null,
      g && rayas ? Plot.tickX(rayas, {y: edad, x: (d) => signo(d) * valor(d), stroke: "transparent", strokeWidth: ZONA_RAYA, ...captura(rayas, gRayas, rayasVisibles)}) : null,
      Plot.text([izquierda], {frameAnchor: "top-left", text: (d) => d, dy: -22, dx: 4, fontWeight: 700, fill: P.tinta}),
      Plot.text([derecha], {frameAnchor: "top-right", text: (d) => d, dy: -22, dx: -4, fontWeight: 700, fill: P.tinta}),
    ],
  }));
  if (!rayas) return plot;
  return conLeyenda(leyendaItems([{tipo: "cuadro", color: P.serie, texto: nombreBarras}, {tipo: "linea", color: P.tinta, texto: nombreComparar}]), plot);
}
