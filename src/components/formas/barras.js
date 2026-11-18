// formas/barras.js
// ¿Cuánto vale cada grupo? Barras verticales en el orden propio de la
// categoría (edad, decil, escolaridad), con la cifra escrita sobre cada barra.
// Es la FORMA BASE de respaldo (R70a): se usa cuando la variante llamativa no
// cabe, y la revisión dice por qué.
// No: más de 12 grupos o nombres largos (ranking horizontal), ni categorías
// sin orden propio que el lector quiera ver ordenadas por valor (ranking).
import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctMarca} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, leyendaItems, TIPO} from "./comun.js";

// datos: una fila por barra. x(d) nombre del grupo, valor(d) la cifra.
// `orden`: lista de grupos en su orden propio. `dominioY`: FIJO, el mismo
// con cualquier filtro. `incierta(d)`: true si la estimación es poco precisa
// (barra en tinta clara con contorno y asterisco junto a la cifra).
// `corto(x)`: rótulo del eje en pantallas angostas.
export function barras(datos, {ancho, x, valor, orden = null, dominioY = [0, 100], formato = pct, formatoEje = pctMarca, rotuloY = null, incierta = () => false, corto = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 520;
  const dominio = orden ?? filas.map(x);
  const relleno = (d) => (incierta(d) ? P.tonoSuave : P.serie);
  const plot = Plot.plot(base({
    ancho, alto: Math.round(Math.max(260, Math.min(380, ancho * 0.36))), marginTop: rotuloY ? 34 : 22, marginLeft: 48, marginRight: 8, marginBottom: 34,
    x: {label: null, domain: dominio, tickSize: 0, padding: angosto ? 0.22 : 0.32, tickFormat: (v) => (angosto && corto ? corto(v) : v)},
    y: {label: rotuloY, labelAnchor: "top", labelArrow: "none", domain: dominioY, grid: true, tickFormat: formatoEje, ticks: 5},
    marks: [
      Plot.barY(filas, {x, y: valor, fill: relleno, stroke: (d) => (incierta(d) ? P.serie : "none"), strokeWidth: 1.2, rx: 2}),
      Plot.ruleY([dominioY[0]], {stroke: P.regla}),
      Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", x, y: valor, text: (d) => formato(valor(d)) + (incierta(d) ? " *" : ""), dy: -9, fill: P.tinta, fontWeight: 600, fontSize: TIPO.valor}),
      Plot.barY(filas, Plot.pointerX({x, y: valor, fill: "none", stroke: P.tinta, strokeWidth: 1.8, maxRadius: Infinity})),
    ],
  }));
  const hayIncierta = filas.some(incierta);
  return html`<div class="forma gB-forma">${hayIncierta ? leyendaItems([{tipo: "cuadro", color: P.tonoSuave, texto: "Estimación poco precisa (*)"}]) : ""}${g ? conGlobo(plot, g) : plot}</div>`;
}
