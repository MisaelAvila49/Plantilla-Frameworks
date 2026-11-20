// src/components/globo.js
// NORMA ÚNICA DE GLOBOS. Todo globo del libro se construye con `globo({...})`
// y se ve igual: la misma tarjeta, los mismos renglones, en el mismo orden.
// Desde noviembre de 2026 (REGLAS.md R116, lección 131) el globo es corto,
// para leerse de un vistazo:
//
//   1. grupo     ● Con discapacidad                   con muestra de color
//   2. cifra     16.3 %  ± 1.2                        grande, color de la serie; el
//                                                     margen de error al 95 % junto, tenue
//   3. personas  1,234 de 10,032 personas con discapacidad   numerador de denominador y universo
//   4. aviso     Estimación poco precisa: pocos …     solo si aplica
//
// La cifra es el porcentaje o el valor del indicador (pesos, años, horas,
// puntos), nunca un conteo cuando la gráfica tiene un porcentaje. Las personas
// son el numerador expandido sobre su denominador; en pesos, horas e índices
// el renglón se omite (ahí el numerador es masa de dinero o de tiempo).
//
// No van: el lugar y el año del panel (ya los dice el subtítulo), la frase del
// denominador (va en el subtítulo y en «¿Qué quiere decir este análisis?»),
// ni la comparación con otro grupo o año (va en la tabla). El margen de error
// SÍ va (noviembre 2026, R117): ± 1.96 veces el error estándar, en la unidad
// de la cifra, junto a ella; sin error estimable no se pinta nada (nunca ± 0).
// Cuando la marca no se identifica por su grupo (un estado en un mapa, una
// celda de una rejilla, un año de una serie), su nombre va DELANTE del grupo
// en el mismo renglón, con `marca`: «Oaxaca · Con discapacidad».
//
// La jerarquía se DECLARA aquí, con campos con nombre. No hay ningún script
// que lea el texto dibujado y adivine qué renglón es la cifra. Tampoco se usa
// el <title> nativo del SVG en ninguna forma.
//
// Uso con Plot:   conGlobo(Plot.plot({...}), g)      la marca interactiva
//                 lleva Plot.pointerX / pointerY / pointer; el dato bajo el
//                 puntero llega por `plot.value` y la tarjeta lo pinta.
// Uso con SVG o HTML propio (treemap, flujo, cuadros, mapas):
//                 globoEn(nodo, g, dato)             o g.html(dato) a mano.

import {formatear, margen as fMargen, personas as fPersonas, pocoPrecisa, SIN_DATO} from "./formato.js";
import {P} from "./paleta.js";

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
const val = (x, d) => (typeof x === "function" ? x(d) : x);
// Campos de la norma anterior (siete renglones). Si una llamada los trae, se
// avisa en vez de ignorarlos en silencio.
const RETIRADOS = ["donde", "cuando", "frase", "comparacion", "apellido"];

// globo({marca, grupo, color, valor, formato, ee, personas, universo, unidad,
//        precision, sinDato})
// Cada campo es un valor fijo o una función del dato. Devuelve un objeto con
// `.html(d)` (la tarjeta) y `.renglones(d)` (los mismos datos, para pruebas y
// para el nombre accesible).
export function globo({
  marca = null,        // (d) => "Oaxaca"            nombre de la marca si el grupo no basta (mapa, celda, año)
  grupo = null,        // (d) => "Con discapacidad"  serie o categoría
  color = null,        // (d) => color de la serie o del signo; pinta muestra y cifra
  valor,               // (d) => 12.34               la estadística, sin formatear
  formato = "pct",     // "pct" | "puntos" | "de100" | "conteo" | "razon" | "pesos" | "horas" | "relativo" | (v, d) => texto
  ee = null,           // (d) => 0.61                error estándar EN LA UNIDAD DE `valor` (puntos si es %); si falta, se toma de `precision`;
                       //                            `false` lo apaga (una diferencia cuyo error no se calcula: el de `precision` sería el de un grupo)
  personas = null,     // (d) => 1234                numerador expandido: quienes cumplen
  universo = null,     // (d) => 10032               denominador expandido
  unidad = "personas", // el UNIVERSO en dos o tres palabras (R117): "personas con discapacidad", "hombres", "habitantes"…
  precision = null,    // (d) => ({valor, ee, casos}) para el aviso de poca precisión
  sinDato = SIN_DATO,
  ...resto
} = {}) {
  if (valor === undefined) throw new Error("globo(): falta `valor`.");
  const viejos = Object.keys(resto).filter((k) => RETIRADOS.includes(k));
  if (viejos.length) throw new Error(`globo(): ${viejos.join(", ")} ya no van en el globo. Lleva grupo, cifra y población (REGLAS.md R116).`);
  const renglones = (d) => {
    const v = val(valor, d);
    const hay = v != null && !Number.isNaN(+v);
    const p = val(personas, d);
    const prec = val(precision, d);
    const e = ee === false ? null : (val(ee, d) ?? prec?.ee ?? null);
    return {
      grupo: [val(marca, d), val(grupo, d)].filter((x) => x != null && x !== "").join(" · "),
      color: val(color, d) ?? null,
      cifra: !hay ? sinDato : typeof formato === "function" ? formato(v, d) : formatear(v, formato),
      margen: hay ? textoMargen(e, formato) : "",
      personas: hay && p != null ? fPersonas(p, {universo: val(universo, d), unidad: val(unidad, d)}) : "",
      aviso: hay && prec && pocoPrecisa(prec) ? "Estimación poco precisa: pocos casos en la muestra" : "",
    };
  };
  return {html: (d) => tarjetaHtml(renglones(d)), renglones};
}

// Margen de error al 95 % en la unidad de la cifra: «± 1.2» en porcentajes y
// puntos (son puntos porcentuales), «± $1,234» en pesos, «± 0.8 h» en horas.
// Sin error estimable, en conteos o con un error no positivo, cadena vacía.
function textoMargen(e, formato) {
  if (e == null || e === "" || !Number.isFinite(+e) || +e <= 0 || formato === "conteo") return "";
  if (["pesos", "horas", "razon"].includes(formato)) return `± ${formatear(1.96 * +e, formato)}`;
  // Con los mismos decimales que la cifra (uno): «2.5 % ± 0.1», no «± 0.059».
  const m = 1.96 * +e;
  return m < 0.05 ? "± <0.1" : fMargen(+e, 1);
}

// La tarjeta a partir de sus renglones ya resueltos.
function tarjetaHtml(r) {
  const tono = r.color ? ` style="color:${esc(r.color)}"` : "";
  return (r.grupo ? `<span class="gt-grupo">${r.color ? `<i class="gt-muestra" style="background:${esc(r.color)}"></i>` : ""}${esc(r.grupo)}</span>` : "") +
    `<span class="gt-cifra"${tono}>${esc(r.cifra)}${r.margen ? `<span class="gt-margen"><span class="solo-lector">, margen de error </span>${esc(r.margen)}</span>` : ""}</span>` +
    (r.personas ? `<span class="gt-personas">${esc(r.personas)}</span>` : "") +
    (r.aviso ? `<span class="gt-aviso">${esc(r.aviso)}</span>` : "");
}

// El mismo globo con un nombre más al final del grupo. Sirve cuando una figura
// tiene dos marcas del mismo grupo que se distinguen por su serie (la barra de
// 2025 y la raya de 2020 de una pirámide): «85 años o más · Hombres · 2020».
export function globoCon(g, sufijo) {
  if (!g || !sufijo) return g;
  const renglones = (d) => {
    const r = g.renglones(d), s = val(sufijo, d);
    return {...r, grupo: [r.grupo, s].filter((x) => x != null && x !== "").join(" · ")};
  };
  return {html: (d) => tarjetaHtml(renglones(d)), renglones};
}

// Nombre accesible de una marca: lo mismo que dice su globo, en el mismo orden.
export const textoGlobo = (r) => [r.grupo, r.margen ? `${r.cifra} (margen de error ${r.margen})` : r.cifra, r.personas, r.aviso].filter(Boolean).join(", ");

// ------------------------------------------------------------- la tarjeta
// Una sola tarjeta para toda la página, colgada del <body>. Cada vez que se
// abre se anota su DUEÑO: el nodo (o la gráfica) que la abrió. La tarjeta se
// cierra sola cuando el puntero ya no está sobre su dueño, aunque el dueño no
// reciba su `pointerleave` (un nodo que se movió en el DOM bajo el puntero, un
// puntero que sale rápido por el borde de un mapa), al hacer scroll con el
// puntero, al salir de la ventana, al tocar fuera y con Escape.
let tarjeta = null, dueno = null;
function laTarjeta() {
  if (tarjeta?.isConnected) return tarjeta;
  tarjeta = document.createElement("div");
  tarjeta.className = "globo-tarjeta";
  tarjeta.setAttribute("role", "tooltip");
  tarjeta.hidden = true;
  document.body.appendChild(tarjeta);
  vigilar();
  return tarjeta;
}
// Sin dueño explícito, el dueño es el dibujo (el <svg> exterior) que está bajo
// el punto donde se abre la tarjeta.
function duenoEn(x, y) {
  let n = document.elementFromPoint?.(x, y);
  if (!n || n === tarjeta) return null;
  let svg = null;
  for (; n && n !== document.body; n = n.parentNode) if (n instanceof SVGSVGElement) svg = n;
  return svg;
}
let vigilando = false;
function vigilar() {
  if (vigilando) return;
  vigilando = true;
  const visible = () => tarjeta && !tarjeta.hidden;
  const fuera = (e) => { if (visible() && dueno && !(e.target instanceof Node && dueno.contains(e.target))) ocultarGlobo(); };
  // En fase de burbuja: el nodo nuevo bajo el puntero ya se anotó como dueño.
  addEventListener("pointermove", fuera, {passive: true});
  addEventListener("pointerdown", fuera, {passive: true});
  document.addEventListener("pointerout", (e) => { if (!e.relatedTarget) ocultarGlobo(); });
  document.documentElement.addEventListener("pointerleave", ocultarGlobo);
  addEventListener("blur", ocultarGlobo);
  // Un globo abierto con el teclado se queda al desplazar (el navegador lleva
  // la marca enfocada a la vista); uno abierto con el puntero se cierra.
  addEventListener("scroll", () => { if (visible() && !(dueno && dueno.contains(document.activeElement) && document.activeElement.matches?.(":focus-visible"))) ocultarGlobo(); }, {passive: true, capture: true});
  addEventListener("keydown", (e) => { if (e.key === "Escape") ocultarGlobo(); });
}
// ¿El último toque fue con el dedo? Con el dedo el globo va ARRIBA del punto
// tocado (abajo lo tapa la mano) y centrado en él.
let tactil = false;
if (typeof addEventListener === "function") addEventListener("pointerdown", (e) => { tactil = e.pointerType === "touch"; }, {passive: true, capture: true});
export function mostrarGlobo(contenido, x, y, de = null) {
  const t = laTarjeta();
  dueno = de ?? duenoEn(x, y);
  t.innerHTML = contenido;
  t.hidden = false;
  // El área que de verdad se ve: con zoom de pellizco en el celular es solo una
  // parte de la página (visualViewport), y con innerWidth/innerHeight el globo
  // quedaba fuera de la pantalla. Las coordenadas del puntero son de la página
  // visible completa (layout viewport); visualViewport dice dónde está el área
  // que se ve dentro de ella.
  const vv = window.visualViewport;
  const ox = vv?.offsetLeft ?? 0, oy = vv?.offsetTop ?? 0;
  const vw = vv?.width ?? innerWidth, vh = vv?.height ?? innerHeight;
  t.style.maxWidth = Math.max(160, Math.min(280, vw - 16)) + "px";
  const w = t.offsetWidth, h = t.offsetHeight;
  let px, py;
  if (tactil) {
    px = x - w / 2;
    py = y - h - 22;
    if (py < oy + 8) py = y + 26;
  } else {
    // A la derecha y abajo del puntero; se voltea si no cabe.
    px = x + 14; py = y + 16;
    if (px + w > ox + vw - 8) px = x - w - 14;
    if (py + h > oy + vh - 8) py = y - h - 12;
  }
  px = Math.min(Math.max(ox + 8, px), ox + vw - w - 8);
  py = Math.min(Math.max(oy + 8, py), oy + vh - h - 8);
  t.style.left = px + scrollX + "px";
  t.style.top = py + scrollY + "px";
}
export function ocultarGlobo() {
  if (tarjeta) tarjeta.hidden = true;
  dueno = null;
}

// Conecta un globo a una gráfica de Plot. La marca que captura lleva una
// transformación de puntero (pointerX, pointerY o pointer con maxRadius
// Infinity): Plot publica el dato bajo el puntero en `plot.value` y avisa
// con el evento `input`. Una figura tiene UN solo puntero.
export function conGlobo(plot, g) {
  let pos = null;
  const pintar = () => {
    const d = plot.value;
    if (d == null || !pos) return ocultarGlobo();
    mostrarGlobo(g.html(d), pos.x, pos.y, plot);
  };
  plot.addEventListener("pointermove", (e) => { pos = {x: e.clientX, y: e.clientY}; pintar(); });
  plot.addEventListener("input", pintar);
  plot.addEventListener("pointerleave", () => { pos = null; ocultarGlobo(); });
  return plot;
}

// Conecta un globo a un nodo propio (rectángulo de un treemap, cinta de un
// flujo, cuadro, polígono). Abre con el puntero y también con el teclado.
// {rol: false} conserva el papel propio del nodo (una celda de tabla, un
// botón) y solo le pone el nombre accesible.
export function globoEn(nodo, g, dato, {rol = true} = {}) {
  const abrir = (x, y) => mostrarGlobo(g.html(dato), x, y, nodo);
  // Una marca enfocable se anuncia con el mismo contenido del globo.
  if (nodo.hasAttribute("tabindex")) {
    const r = g.renglones(dato);
    if (rol) nodo.setAttribute("role", "img");
    nodo.setAttribute("aria-label", textoGlobo(r));
  }
  nodo.addEventListener("pointerenter", (e) => abrir(e.clientX, e.clientY));
  nodo.addEventListener("pointermove", (e) => abrir(e.clientX, e.clientY));
  nodo.addEventListener("pointerleave", ocultarGlobo);
  nodo.addEventListener("focus", () => { const r = nodo.getBoundingClientRect(); abrir(r.left + r.width / 2, r.top + r.height / 2); });
  nodo.addEventListener("blur", ocultarGlobo);
  return nodo;
}

// Marca de contorno al pasar el puntero, del color de la tinta del tema.
export const contorno = () => ({stroke: P.tinta, strokeWidth: 1.6, fill: "none", pointerEvents: "none"});
