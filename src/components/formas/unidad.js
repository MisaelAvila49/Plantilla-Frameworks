// formas/unidad.js
// Piezas comunes de la FAMILIA DE UNIDADES (multitud, fracción, histograma de
// unidades, pila y escalones): la silueta humana, el tamaño de la unidad, las
// flechas de anotación y la leyenda que dice cuánto vale cada figura.
// Extiende a comun.js sin tocarlo. Una forma de esta familia importa de aquí,
// de comun.js, de ../paleta.js, de ../formato.js y de ../globo.js.
//
// La silueta es propia y se dibuja por código: una cabeza y un cuerpo en una
// caja de 10 por 24. Hay tres posturas, todas neutras (ninguna representa un
// sexo ni una edad), para que la multitud no se lea como una trama.
// Cada gráfica declara sus símbolos UNA vez y repite la figura con <use>, que
// es lo que permite dibujar 1,500 figuras sin que la página se sienta.

import {svg, html} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";

const NS = "http://www.w3.org/2000/svg";
// Alto entre ancho de la silueta.
export const PROPORCION = 2.4;
const CABEZA = {cx: 5, cy: 3.1, r: 2.55};
const CUERPOS = [
  // De pie, brazos pegados al cuerpo.
  "M1.5 9.3Q1.5 6.5 5 6.5Q8.5 6.5 8.5 9.3L8.5 15.2L7.3 15.2L7.3 23.6L5.4 23.6L5.4 16.2L4.6 16.2L4.6 23.6L2.7 23.6L2.7 15.2L1.5 15.2Z",
  // De pie, piernas juntas.
  "M2 9.3Q2 6.5 5 6.5Q8 6.5 8 9.3L8 15L7.05 15L6.9 23.6L3.1 23.6L2.95 15L2 15Z",
  // De pie, brazos un poco separados.
  "M1.2 9.5Q1.3 6.5 5 6.5Q8.7 6.5 8.8 9.5L9.5 14.8L8.4 15.1L7.6 11.2L7.7 23.6L5.7 23.6L5.25 16.4L4.75 16.4L4.3 23.6L2.3 23.6L2.4 11.2L1.6 15.1L0.5 14.8Z",
];
export const POSTURAS = CUERPOS.length;

// Identificador único por gráfica: los símbolos de dos gráficas de la misma
// página no pueden compartir id.
let serie = 0;
export const nuevoId = (prefijo = "u") => `${prefijo}${++serie}`;

// <defs> con los símbolos de la gráfica. `glifo`: "figura" (silueta humana) o
// "punto" (para unidades que no son personas). Los símbolos se llaman
// `${id}-0`, `${id}-1`…; `refGlifo(id, k)` devuelve el que toca a la unidad k.
export function simbolos(id, {glifo = "figura"} = {}) {
  if (glifo === "punto") return svg`<defs><symbol id=${`${id}-0`} viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.3"/></symbol></defs>`;
  return svg`<defs>${CUERPOS.map((d, k) => svg`<symbol id=${`${id}-${k}`} viewBox="0 0 10 24"><circle cx=${CABEZA.cx} cy=${CABEZA.cy} r=${CABEZA.r} /><path d=${d} /></symbol>`)}</defs>`;
}
export const refGlifo = (id, k, glifo = "figura") => `${id}-${glifo === "punto" ? 0 : ((k % POSTURAS) + POSTURAS) % POSTURAS}`;
export const proporcionDe = (glifo = "figura") => (glifo === "punto" ? 1 : PROPORCION);

// Una figura: <use> del símbolo. Se crea con el DOM (no con una plantilla)
// porque se llama más de mil veces por gráfica. `entra`: milisegundos de
// retraso de la animación de entrada (una sola vez, la gobierna la hoja).
// `contorno`: figura hueca, para el grupo que no alcanza una figura completa.
const r1 = (v) => Math.round(v * 10) / 10;
export function usar(ref, x, y, ancho, alto, color, {entra = null, contorno = false} = {}) {
  const u = document.createElementNS(NS, "use");
  u.setAttribute("href", "#" + ref);
  u.setAttribute("x", r1(x)); u.setAttribute("y", r1(y));
  u.setAttribute("width", r1(ancho)); u.setAttribute("height", r1(alto));
  if (contorno) { u.setAttribute("fill", "none"); u.setAttribute("stroke", color); u.setAttribute("stroke-width", "1.4"); }
  else u.setAttribute("fill", color);
  u.setAttribute("aria-hidden", "true");
  if (entra != null) { u.setAttribute("class", "unidad-entra"); u.style.setProperty("--i", String(Math.round(entra))); }
  return u;
}

// Tamaño de la unidad: cuántas personas vale cada figura. Se redondea a 1, 2
// o 5 por una potencia de 10 y se elige el menor que deja `tope` figuras o
// menos, de modo que el total queda entre el 40 % del tope y el tope.
export function tamanoUnidad(total, {tope = 1500} = {}) {
  if (!(total > 0) || total <= tope) return 1;
  const crudo = total / tope, potencia = 10 ** Math.floor(Math.log10(crudo));
  for (const m of [1, 2, 5, 10]) if (m * potencia >= crudo) return m * potencia;
  return 10 * potencia;
}
// El siguiente tamaño redondo, para cuando las figuras no caben.
export function unidadSiguiente(k) {
  const potencia = 10 ** Math.floor(Math.log10(k) + 1e-9), m = Math.round(k / potencia);
  return (m < 2 ? 2 : m < 5 ? 5 : 10) * potencia;
}
// Tope de figuras según el ancho: en un teléfono se dibujan menos y más grandes.
export const topeFiguras = (ancho) => (ancho < 560 ? 700 : 1500);

// «Cada figura representa 5,000 personas».
export function textoUnidad(k, {plural = "personas", singular = "persona", glifo = "figura"} = {}) {
  return `Cada ${glifo === "punto" ? "punto" : "figura"} representa ${entero(k)} ${k === 1 ? singular : plural}`;
}

// Leyenda de la familia: muestras con la silueta en vez del cuadro.
//   items: [{color, texto, contorno, glifo, tipo}]   tipo: "cuadro" | "punteada"
// Un item sin color es una frase suelta (cuánto vale cada figura, el total).
export function leyendaFiguras(items) {
  const muestra = ({color, contorno = false, glifo = "figura", tipo = null}) => {
    if (tipo === "cuadro") return svg`<svg width="14" height="12" aria-hidden="true"><rect x="1" y="0" width="12" height="12" rx="2" fill=${color} /></svg>`;
    if (tipo === "punteada") return svg`<svg width="22" height="12" aria-hidden="true"><line x1="1" y1="6" x2="21" y2="6" stroke=${color} stroke-width="1.6" stroke-dasharray="5 4"/></svg>`;
    if (glifo === "punto") return svg`<svg width="12" height="12" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4.3" fill=${contorno ? "none" : color} stroke=${contorno ? color : "none"} /></svg>`;
    return svg`<svg width="9" height="20" viewBox="0 0 10 24" aria-hidden="true"><g fill=${contorno ? "none" : color} stroke=${contorno ? color : "none"} stroke-width="1.2"><circle cx=${CABEZA.cx} cy=${CABEZA.cy} r=${CABEZA.r} /><path d=${CUERPOS[0]} /></g></svg>`;
  };
  return html`<div class="leyenda-items leyenda-figuras">${items.filter(Boolean).map((i) => html`<span class="leyenda-item">${i.color ? muestra(i) : ""}<span>${i.texto}</span></span>`)}</div>`;
}

// Flecha curva de anotación, de (x1, y1) a (x2, y2). `curva` es cuánto se
// aparta el arco de la recta, como fracción del largo (0 = recta).
export function flecha(x1, y1, x2, y2, {curva = 0.22, color = P.tinta2, grosor = 1.2, punta = 5} = {}) {
  const dx = x2 - x1, dy = y2 - y1;
  const cx = (x1 + x2) / 2 - dy * curva, cy = (y1 + y2) / 2 + dx * curva;
  const tx = x2 - cx, ty = y2 - cy, largo = Math.hypot(tx, ty) || 1, ux = tx / largo, uy = ty / largo;
  const bx = x2 - ux * punta, by = y2 - uy * punta, a = punta * 0.6;
  const cabeza = `M${r1(bx - uy * a)},${r1(by + ux * a)}L${r1(x2)},${r1(y2)}L${r1(bx + uy * a)},${r1(by - ux * a)}`;
  return svg`<g class="unidad-flecha" aria-hidden="true" fill="none" stroke=${color} stroke-width=${grosor} stroke-linecap="round" stroke-linejoin="round"><path d=${`M${r1(x1)},${r1(y1)}Q${r1(cx)},${r1(cy)} ${r1(x2)},${r1(y2)}`} /><path d=${cabeza} /></g>`;
}

// Ancho aproximado de un texto, para acomodar anotaciones sin medir el DOM.
export const anchoTexto = (texto, px, negrita = false) => String(texto).length * px * (negrita ? 0.6 : 0.54);
// Parte un texto en renglones de `max` caracteres como mucho.
export function partir(texto, max) {
  const renglones = [];
  let actual = "";
  for (const palabra of String(texto).split(/\s+/).filter(Boolean)) {
    if (actual && (actual + " " + palabra).length > max) { renglones.push(actual); actual = palabra; }
    else actual = actual ? actual + " " + palabra : palabra;
  }
  if (actual) renglones.push(actual);
  return renglones;
}

// Tinta para escribir una cifra en el color de su grupo. Devuelve el mismo
// color si libra el contraste contra el fondo del tema (4.5:1, o 3:1 si el
// texto es grande); si no, el paso de texto de ese color en la paleta y, a
// falta de él (los grises de contexto), la tinta secundaria.
const lineal = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luz(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  return 0.2126 * lineal(((n >> 16) & 255) / 255) + 0.7152 * lineal(((n >> 8) & 255) / 255) + 0.0722 * lineal((n & 255) / 255);
}
function contraste(color, fondo) {
  if (String(color).length !== 7 || Number.isNaN(parseInt(String(color).slice(1), 16))) return 0;
  const a = luz(color), b = luz(fondo);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function tintaLegible(color, minimo = 4.5) {
  const pasos = [color, color === P.serie ? P.tonoTexto : null, color === P.rojo ? P.rojoTexto : null];
  return pasos.find((c) => c && contraste(c, P.fondo) >= minimo) ?? P.tinta2;
}

// Generador con semilla (mulberry32): las posiciones de una multitud no
// cambian entre cargas ni al repintar.
export function azarSemilla(semilla = 1) {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mancha orgánica de `n` figuras: una retícula de ladrillo con un poco de
// desorden, recortada a una elipse de semiejes (a, b). Devuelve las posiciones
// del centro de cada figura respecto del centro de la mancha, de atrás hacia
// adelante, y la caja que ocupan.
export function mancha(n, {a, b, pasoX, pasoY, azar}) {
  const candidatos = [];
  const J = Math.ceil((b * 1.5) / pasoY) + 1, I = Math.ceil((a * 1.5) / pasoX) + 1;
  for (let j = -J; j <= J; j++) for (let i = -I; i <= I; i++) {
    const x = (i + (j & 1 ? 0.5 : 0)) * pasoX + (azar() - 0.5) * pasoX * 0.42;
    const y = j * pasoY + (azar() - 0.5) * pasoY * 0.26;
    candidatos.push({x, y, d: (x / a) ** 2 + (y / b) ** 2 + (azar() - 0.5) * 0.07});
  }
  const puntos = candidatos.sort((p, q) => p.d - q.d).slice(0, n).sort((p, q) => p.y - q.y || p.x - q.x);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of puntos) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  return {puntos, x0, x1, y0, y1};
}
