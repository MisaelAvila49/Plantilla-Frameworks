// src/components/globo.js
// NORMA ÚNICA DE GLOBOS. Todo globo del libro se construye con `globo({...})`
// y se ve igual: la misma tarjeta, los mismos renglones, en el mismo orden.
//
//   1. contexto     «Oaxaca · 2020»                       gris chico
//   2. grupo        ● Mujeres                             con muestra de color
//   3. cifra        12.3 %                                grande, color de la serie
//   4. frase        de la población de 5 a 17 años …      qué es y sobre qué universo
//   5. personas     1,234 de 10,032 personas de 5 a 17 años   el NUMERADOR
//   6. comparación  2010: 15.2 %                          una sola, optativa
//   7. aviso        Estimación poco precisa: pocos casos  solo si aplica
//
// La jerarquía se DECLARA aquí, con campos con nombre. No hay ningún script
// que lea el texto dibujado y adivine qué renglón es la cifra. El margen de
// error no va en el globo: va en la tabla de respaldo. Tampoco se usa el
// <title> nativo del SVG en ninguna forma.
//
// Uso con Plot:   conGlobo(Plot.plot({...}), g)      la marca interactiva
//                 lleva Plot.pointerX / pointerY / pointer; el dato bajo el
//                 puntero llega por `plot.value` y la tarjeta lo pinta.
// Uso con SVG o HTML propio (treemap, flujo, cuadros, mapas):
//                 globoEn(nodo, g, dato)             o g.html(dato) a mano.

import {formatear, personas as fPersonas, pocoPrecisa, SIN_DATO} from "./formato.js";
import {P} from "./paleta.js";

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
const val = (x, d) => (typeof x === "function" ? x(d) : x);

// globo({donde, cuando, grupo, color, valor, formato, frase, personas,
//        universo, unidad, apellido, comparacion, precision, sinDato})
// Cada campo es un valor fijo o una función del dato. Devuelve un objeto con
// `.html(d)` (la tarjeta) y `.renglones(d)` (los mismos datos, para pruebas).
export function globo({
  donde = null,        // (d) => "Oaxaca"            unidad o categoría de la marca
  cuando = null,       // (d) => 2020                edición o tramo
  grupo = null,        // (d) => "Mujeres"           serie o categoría (optativo)
  color = null,        // (d) => color de la serie o del signo; pinta muestra y cifra
  valor,               // (d) => 12.34               la estadística, sin formatear
  formato = "pct",     // "pct" | "puntos" | "de100" | "conteo" | "razon" | "pesos" | "horas" | "relativo" | (v, d) => texto
  frase,               // qué es la cifra y sobre qué denominador
  personas = null,     // (d) => 1234                numerador expandido: quienes cumplen
  universo = null,     // (d) => 10032               denominador (optativo)
  unidad = "personas", // "hogares", "municipios", "viviendas"…
  apellido = "",       // "de 5 a 17 años"
  comparacion = null,  // (d) => "2010: 15.2 %"      UNA sola
  precision = null,    // (d) => ({valor, ee, casos}) para el aviso de poca precisión
  sinDato = SIN_DATO,
} = {}) {
  if (valor === undefined) throw new Error("globo(): falta `valor`.");
  if (!frase) throw new Error("globo(): falta `frase` (qué es la cifra y sobre qué denominador).");
  const renglones = (d) => {
    const v = val(valor, d);
    const hay = v != null && !Number.isNaN(+v);
    const p = val(personas, d);
    const prec = val(precision, d);
    return {
      contexto: [val(donde, d), val(cuando, d)].filter((x) => x != null && x !== "").join(" · "),
      grupo: val(grupo, d) ?? "",
      color: val(color, d) ?? null,
      cifra: !hay ? sinDato : typeof formato === "function" ? formato(v, d) : formatear(v, formato),
      frase: hay ? val(frase, d) ?? "" : "",
      personas: hay && p != null ? fPersonas(p, {universo: val(universo, d), unidad: val(unidad, d), apellido: val(apellido, d)}) : "",
      comparacion: hay ? val(comparacion, d) ?? "" : "",
      aviso: hay && prec && pocoPrecisa(prec) ? "Estimación poco precisa: pocos casos en la muestra" : "",
    };
  };
  const html = (d) => {
    const r = renglones(d);
    const tono = r.color ? ` style="color:${esc(r.color)}"` : "";
    return (r.contexto ? `<span class="gt-contexto">${esc(r.contexto)}</span>` : "") +
      (r.grupo ? `<span class="gt-grupo">${r.color ? `<i class="gt-muestra" style="background:${esc(r.color)}"></i>` : ""}${esc(r.grupo)}</span>` : "") +
      `<span class="gt-cifra"${tono}>${esc(r.cifra)}</span>` +
      (r.frase ? `<span class="gt-frase">${esc(r.frase)}</span>` : "") +
      (r.personas ? `<span class="gt-personas">${esc(r.personas)}</span>` : "") +
      (r.comparacion ? `<span class="gt-comparacion">${esc(r.comparacion)}</span>` : "") +
      (r.aviso ? `<span class="gt-aviso">${esc(r.aviso)}</span>` : "");
  };
  return {html, renglones};
}

// ------------------------------------------------------------- la tarjeta
// Una sola tarjeta para toda la página, colgada del <body>.
let tarjeta = null;
function laTarjeta() {
  if (tarjeta?.isConnected) return tarjeta;
  tarjeta = document.createElement("div");
  tarjeta.className = "globo-tarjeta";
  tarjeta.setAttribute("role", "tooltip");
  tarjeta.hidden = true;
  document.body.appendChild(tarjeta);
  return tarjeta;
}
export function mostrarGlobo(contenido, x, y) {
  const t = laTarjeta();
  t.innerHTML = contenido;
  t.hidden = false;
  const w = t.offsetWidth, h = t.offsetHeight;
  // A la derecha y abajo del puntero; se voltea si no cabe en la ventana.
  let px = x + 14, py = y + 16;
  if (px + w > innerWidth - 8) px = x - w - 14;
  if (py + h > innerHeight - 8) py = y - h - 12;
  t.style.left = Math.max(8, px) + scrollX + "px";
  t.style.top = Math.max(8, py) + scrollY + "px";
}
export function ocultarGlobo() {
  if (tarjeta) tarjeta.hidden = true;
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
    mostrarGlobo(g.html(d), pos.x, pos.y);
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
  const abrir = (x, y) => mostrarGlobo(g.html(dato), x, y);
  // Una marca enfocable se anuncia con el mismo contenido del globo.
  if (nodo.hasAttribute("tabindex")) {
    const r = g.renglones(dato);
    if (rol) nodo.setAttribute("role", "img");
    nodo.setAttribute("aria-label", [r.contexto, r.grupo, r.cifra, r.frase, r.personas].filter(Boolean).join(", "));
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
