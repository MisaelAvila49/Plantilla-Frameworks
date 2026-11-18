// formas/tabla-interaccion.js
// Piezas comunes de la familia Tabla (tabla-barras, tabla-calor,
// tabla-minigraficas, tabla-precision): globo normado al cursor y al foco
// sobre una fila o una celda, tabulación itinerante (la tabla es UNA parada
// de tabulador y las flechas mueven entre filas o celdas), tinta legible
// sobre un relleno y muestras de color en SVG.
//
// No usa `globoEn()` de ../globo.js a propósito: esa función le pone
// role="img" a toda marca enfocable, y en una celda o una fila eso borraría
// su papel dentro de la tabla para el lector de pantalla. Aquí la celda
// conserva su papel y su texto, que ya dice la cifra.

import {svg} from "npm:htl";
import {mostrarGlobo, ocultarGlobo} from "../globo.js";
import {P} from "../paleta.js";

// Globo de una fila o celda. Abre con el puntero y con el foco, y se cierra
// al salir, al perder el foco o con Escape.
export function globoCelda(nodo, g, dato) {
  if (!g) return nodo;
  const abrir = (x, y) => mostrarGlobo(g.html(dato), x, y);
  nodo.classList.add("marca-viva");
  nodo.addEventListener("pointerenter", (e) => abrir(e.clientX, e.clientY));
  nodo.addEventListener("pointermove", (e) => abrir(e.clientX, e.clientY));
  nodo.addEventListener("pointerleave", ocultarGlobo);
  nodo.addEventListener("focus", () => {
    const r = nodo.getBoundingClientRect();
    abrir(r.left + Math.min(r.width / 2, 180), r.top + r.height / 2);
  });
  nodo.addEventListener("blur", ocultarGlobo);
  nodo.addEventListener("keydown", (e) => { if (e.key === "Escape") ocultarGlobo(); });
  return nodo;
}

// Tabulación itinerante sobre una lista de nodos en orden de lectura.
// `columnas` > 1 la vuelve rejilla: izquierda y derecha mueven de celda,
// arriba y abajo de renglón. Inicio y Fin van al primero y al último.
export function itinerante(nodos, {columnas = 1} = {}) {
  if (!nodos.length) return;
  nodos.forEach((n, i) => n.setAttribute("tabindex", i === 0 ? "0" : "-1"));
  const ir = (de, a) => {
    if (a < 0 || a >= nodos.length || a === de) return;
    nodos[de].setAttribute("tabindex", "-1");
    nodos[a].setAttribute("tabindex", "0");
    nodos[a].focus();
  };
  nodos.forEach((n, i) => n.addEventListener("keydown", (e) => {
    const paso = {ArrowDown: columnas, ArrowUp: -columnas, ArrowRight: columnas > 1 ? 1 : 0, ArrowLeft: columnas > 1 ? -1 : 0}[e.key];
    if (paso) { e.preventDefault(); ir(i, i + paso); }
    else if (e.key === "Home") { e.preventDefault(); ir(i, 0); }
    else if (e.key === "End") { e.preventDefault(); ir(i, nodos.length - 1); }
  }));
}

// Tinta de mayor contraste (WCAG) sobre un relleno: negra o blanca.
const canal = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export function luminanciaRelativa(color) {
  const n = parseInt(String(color).slice(1, 7), 16);
  return 0.2126 * canal(((n >> 16) & 255) / 255) + 0.7152 * canal(((n >> 8) & 255) / 255) + 0.0722 * canal((n & 255) / 255);
}
export function tintaContraste(relleno) {
  const l = luminanciaRelativa(relleno), ln = luminanciaRelativa(P.negro), lb = luminanciaRelativa(P.blanco);
  const conNegro = (Math.max(l, ln) + 0.05) / (Math.min(l, ln) + 0.05), conBlanco = (Math.max(l, lb) + 0.05) / (Math.min(l, lb) + 0.05);
  return conNegro >= conBlanco ? P.negro : P.blanco;
}

// Triángulo de sentido (sube, baja) o raya (igual), en SVG y oculto al
// lector: la cifra con signo que lo acompaña ya dice lo mismo.
export function glifo(s, color, tam = 10) {
  const forma = s === "sube" ? `M0,${tam} L${tam / 2},0 L${tam},${tam}Z` : s === "baja" ? `M0,0 L${tam},0 L${tam / 2},${tam}Z` : `M0,${tam / 2 - 1.2} H${tam} V${tam / 2 + 1.2} H0Z`;
  return svg`<svg class="gB-glifo" width=${tam} height=${tam} viewBox=${`0 0 ${tam} ${tam}`} aria-hidden="true"><path d=${forma} fill=${color} /></svg>`;
}
