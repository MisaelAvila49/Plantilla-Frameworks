// src/components/formas/comun.js
// Piezas compartidas por todas las formas: escala tipográfica, opciones base
// de Plot, enlace de globos a marcas, leyendas y estado vacío. Una forma
// nueva importa de aquí, de ../paleta.js, ../formato.js y ../globo.js, y de
// ningún otro lado.

import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {globoEn} from "../globo.js";
import {pctEje, SIN_DATO} from "../formato.js";

// Una sola escala tipográfica para todas las gráficas.
export const TIPO = {ejes: 13, valor: 12.5};

// Opciones comunes de Plot: ancho medido, tipografía y tinta del tema.
export function base({ancho, alto, ...resto} = {}) {
  return {
    width: ancho, height: alto,
    style: {fontFamily: "var(--sans-serif)", fontSize: TIPO.ejes + "px", background: "transparent", color: P.tinta, overflow: "visible"},
    ...resto,
  };
}

// Alto de una serie de tiempo: crece con el ancho, entre 240 y 400 px.
export const altoTiempo = (ancho) => Math.round(Math.max(240, Math.min(400, ancho * 0.42)));

// Margen izquierdo para rótulos de fila, según el más largo.
export const margenRotulos = (rotulos, tope = 190) => Math.min(tope, 16 + Math.max(0, ...rotulos.map((r) => String(r).length)) * 7.2);

// Enlaza el globo a cada elemento de una marca de Plot (barras, celdas,
// polígonos). Se usa como `...viva(datos, g)` en las opciones de la marca:
// el globo pertenece a la marca que está bajo el puntero, no a la más
// cercana. `subir` dibuja el contorno en una copia al frente, para que se vea
// entero sobre las vecinas. La marca misma NO se mueve en el DOM: mover el
// nodo bajo el puntero hace que el navegador pierda su `pointerleave` y el
// globo se quedaba abierto al salir del mapa.
export function viva(datos, g, {subir = false} = {}) {
  if (!g) return {};
  return {
    render(indice, escalas, valores, dimensiones, contexto, siguiente) {
      const nodo = siguiente(indice, escalas, valores, dimensiones, contexto);
      const hijos = [...nodo.children];
      if (hijos.length !== indice.length) return nodo;
      let copia = null;
      const quitar = () => { copia?.remove(); copia = null; };
      hijos.forEach((n, k) => {
        n.classList.add("marca-viva");
        globoEn(n, g, datos[indice[k]]);
        if (!subir) return;
        const poner = () => {
          quitar();
          copia = n.cloneNode(false);
          copia.removeAttribute("tabindex");
          copia.setAttribute("class", "marca-contorno");
          copia.setAttribute("aria-hidden", "true");
          n.parentNode?.appendChild(copia);
        };
        n.addEventListener("pointerenter", poner);
        n.addEventListener("focus", poner);
        n.addEventListener("pointerleave", quitar);
        n.addEventListener("blur", quitar);
      });
      return nodo;
    },
  };
}

// Número estable entre 0 y 1 a partir de un texto: para repartir puntos sin
// que brinquen al repintar ni formen hileras por claves consecutivas.
export function azarEstable(texto) {
  let h = 2166136261;
  for (const c of String(texto)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  return ((h >>> 0) % 100000) / 100000;
}

// Leyenda de marcas. La leyenda solo lista marcas que existen en la figura.
// tipos: cuadro, linea, punteada, punto, hueco.
export function leyendaItems(items) {
  const muestra = ({tipo = "cuadro", color}) => {
    if (tipo === "linea") return svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${color} stroke-width="2.5"/></svg>`;
    if (tipo === "punteada") return svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${color} stroke-width="2" stroke-dasharray="4 3"/></svg>`;
    if (tipo === "punto") return svg`<svg width="14" height="12" aria-hidden="true"><circle cx="7" cy="6" r="4.5" fill=${color} /></svg>`;
    if (tipo === "hueco") return svg`<svg width="14" height="12" aria-hidden="true"><circle cx="7" cy="6" r="4" fill="none" stroke=${color} stroke-width="1.8"/></svg>`;
    return svg`<svg width="14" height="12" aria-hidden="true"><rect x="1" y="0" width="12" height="12" rx="2" fill=${color} /></svg>`;
  };
  return html`<div class="leyenda-items">${items.map((i) => html`<span class="leyenda-item">${muestra(i)}<span>${i.texto}</span></span>`)}</div>`;
}

// Leyenda continua de una rampa (rampaTema o rampaCambio): una barra con el
// degradado, marcas en cifras y la casilla «Sin dato» APARTE de la rampa.
// Va en SVG para que la descarga de la figura la copie tal cual.
let serieLeyenda = 0;
export function leyendaContinua(escala, {titulo = "", marcas = null, formato = pctEje, ancho = 300, sinDato = true, rotuloSinDato = SIN_DATO} = {}) {
  const [a, b] = escala.dominio;
  const id = `rampa-${++serieLeyenda}`;
  const ticks = marcas ?? d3.ticks(a, b, 5);
  const x = (v) => 1 + ((v - a) / (b - a)) * (ancho - 2);
  const pasos = d3.range(0, 1.0001, 0.05);
  return html`<div class="leyenda-continua">
    <svg width=${ancho + 58} height="46" viewBox="-12 0 ${ancho + 58} 46" role="img" aria-label=${`Escala de color: ${titulo}, de ${formato(a)} a ${formato(b)}`}>
      <defs><linearGradient id=${id}>${pasos.map((t) => svg`<stop offset=${t} stop-color=${escala.interpolar(t)} />`)}</linearGradient></defs>
      <text x="0" y="11" font-size="12" font-weight="600" fill=${P.tinta2}>${titulo}</text>
      <rect x="0" y="17" width=${ancho} height="11" fill=${`url(#${id})`} stroke=${P.borde} stroke-width="0.6"/>
      ${ticks.map((t) => svg`<g><line x1=${x(t)} x2=${x(t)} y1="28" y2="32" stroke=${P.regla} /><text x=${x(t)} y="43" font-size="11.5" text-anchor="middle" fill=${P.tinta2}>${formato(t)}</text></g>`)}
    </svg>
    ${sinDato ? html`<span class="leyenda-item leyenda-sin-dato"><svg width="14" height="12" aria-hidden="true"><rect x="1" y="0" width="12" height="12" rx="2" fill=${P.sinDato} stroke=${P.bordeFuerte} stroke-width="0.8"/></svg><span>${rotuloSinDato}</span></span>` : ""}
  </div>`;
}

// Estado vacío: una figura nunca queda en blanco sin decir por qué.
export const vacio = (mensaje = "Sin dato para esta selección.") => html`<p class="figura-vacia">${mensaje}</p>`;

// Contenedor de una forma con leyenda arriba y gráfica abajo.
export const conLeyenda = (leyenda, grafica) => html`<div class="forma">${leyenda ?? ""}${grafica}</div>`;
