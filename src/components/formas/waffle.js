// formas/waffle.js
// ¿Cuántos de cada 100? Un cuadro de 10 por 10 por grupo: los cuadros
// pintados son los que cumplen. El valor se lee contando, así que solo sirve
// para pocas cifras redondas.
// No: en una columna angosta con muchos grupos, ni para comparar décimas.
import {svg, html} from "npm:htl";
import {P} from "../paleta.js";
import {deCada100} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";

// datos: una fila por grupo. etiqueta(d), valor(d) en 0-100, color(d).
export function waffle(datos, {ancho, etiqueta, valor, color = () => P.serie, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const lado = Math.max(9, Math.min(15, Math.floor((Math.min(ancho, 1100) / Math.min(filas.length, 4) - 34) / 10) - 2));
  const paso = lado + 2, tam = paso * 10 - 2;
  const uno = (d) => {
    const n = Math.round(valor(d));
    const cuadros = Array.from({length: 100}, (_, i) => {
      // Se llena de abajo hacia arriba y de izquierda a derecha.
      const fila = 9 - Math.floor(i / 10), col = i % 10;
      return svg`<rect x=${col * paso} y=${fila * paso} width=${lado} height=${lado} rx="2" fill=${i < n ? color(d) : P.rejilla} />`;
    });
    const grupo = svg`<svg class="waffle-uno marca-viva" width=${tam} height=${tam} viewBox="0 0 ${tam} ${tam}" role="img" tabindex="0" aria-label=${`${etiqueta(d)}: ${deCada100(valor(d))}`}>${cuadros}</svg>`;
    if (g) globoEn(grupo, g, d);
    return html`<div class="waffle-grupo"><span class="waffle-nombre" style=${`font-size:${TIPO.ejes}px`}>${etiqueta(d)}</span>${grupo}<span class="waffle-cifra">${deCada100(valor(d))}</span></div>`;
  };
  return html`<div class="waffle">${filas.map(uno)}</div>`;
}
