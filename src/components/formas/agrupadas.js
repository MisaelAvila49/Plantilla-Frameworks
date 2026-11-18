// formas/agrupadas.js
// ¿Cómo se comparan dos o tres series dentro de cada categoría? Una faceta
// por categoría y, dentro, una barra por serie con su cifra escrita. En una
// pantalla angosta las facetas pasan a renglones y las barras se acuestan,
// para que los nombres de las categorías no se encimen.
// Es FORMA BASE de respaldo (R70a).
// No: más de tres series (facetas separadas o heatmap), ni series que no
// comparten unidad.
import * as Plot from "npm:@observablehq/plot";
import {html} from "npm:htl";
import {P} from "../paleta.js";
import {pct, pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, leyendaItems, TIPO} from "./comun.js";

// datos: una fila por barra. faceta(d) la categoría, serie(d) la serie,
// valor(d) la cifra. `facetas` y `series` fijan el orden. `color(serie)`:
// identidad de la serie (categorias() de paleta.js). `dominio`: FIJO.
// `incierta(d)`: estimación poco precisa (asterisco y relleno claro).
// Clave invisible del renglón del título de cada faceta.
const TITULO = "\u2063";

export function agrupadas(datos, {ancho, faceta, serie, valor, facetas, series, color, dominio = [0, 100], formato = pct, formatoEje = pctEje, rotulo = null, incierta = () => false, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const relleno = (d) => (incierta(d) ? P.fondo : color(serie(d)));
  const texto = (d) => formato(valor(d)) + (incierta(d) ? " *" : "");
  const marcaComun = {fill: relleno, stroke: (d) => color(serie(d)), strokeWidth: 1.4};
  const plot = angosto
    ? Plot.plot(base({
      ancho, alto: facetas.length * ((series.length + 1) * 24 + 10) + (rotulo ? 48 : 30), marginLeft: 8, marginRight: 64, marginTop: rotulo ? 48 : 30, marginBottom: 4,
      fy: {label: null, domain: facetas, padding: 0.1, axis: null},
      // Un renglón vacío arriba de cada faceta lleva el nombre de la categoría.
      y: {label: null, domain: [TITULO, ...series], axis: null, padding: 0.18},
      x: {axis: "top", label: rotulo, labelArrow: "none", domain: dominio, grid: true, tickFormat: formatoEje, ticks: 4},
      marks: [
        Plot.text(facetas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", fy: (f) => f, y: () => TITULO, x: dominio[0], textAnchor: "start", dy: 2, text: (f) => f, fontWeight: 700, fontSize: TIPO.ejes, fill: P.tinta}),
        Plot.barX(filas, {fy: faceta, y: serie, x: valor, ...marcaComun}),
        Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", fy: faceta, y: serie, x: valor, text: texto, dx: 6, textAnchor: "start", fill: P.tinta, fontWeight: 600, fontSize: TIPO.valor}),
        Plot.barX(filas, Plot.pointerY({fy: faceta, y: serie, x: valor, fill: "none", stroke: P.tinta, strokeWidth: 1.8, maxRadius: Infinity})),
      ],
    }))
    : Plot.plot(base({
      ancho, alto: Math.round(Math.max(280, Math.min(380, ancho * 0.34))), marginLeft: 40, marginRight: 8, marginTop: rotulo ? 34 : 22, marginBottom: 36,
      fx: {label: null, domain: facetas, padding: 0.14, axis: "bottom", tickSize: 0},
      x: {axis: null, domain: series, padding: 0.12},
      y: {label: rotulo, labelAnchor: "top", labelArrow: "none", domain: dominio, grid: true, tickFormat: formatoEje, ticks: 5},
      marks: [
        Plot.barY(filas, {fx: faceta, x: serie, y: valor, ...marcaComun}),
        Plot.ruleY([dominio[0]], {stroke: P.regla}),
        Plot.text(filas, {stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke", fx: faceta, x: serie, y: valor, text: texto, dy: -9, fill: P.tinta, fontWeight: 600, fontSize: TIPO.valor}),
        Plot.barY(filas, Plot.pointerX({fx: faceta, x: serie, y: valor, fill: "none", stroke: P.tinta, strokeWidth: 1.8, maxRadius: Infinity})),
      ],
    }));
  const items = series.map((s) => ({tipo: "cuadro", color: color(s), texto: s}));
  if (filas.some(incierta)) items.push({tipo: "hueco", color: P.tinta2, texto: "Barra hueca y *: estimación poco precisa"});
  return html`<div class="forma gB-forma">${leyendaItems(items)}${g ? conGlobo(plot, g) : plot}</div>`;
}
