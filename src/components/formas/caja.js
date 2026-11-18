// formas/caja.js
// ¿Cómo se comparan las distribuciones de varios grupos? Una caja por grupo:
// la caja cubre la mitad central de la población (de la cuarta parte más
// baja a la cuarta parte más alta), la raya gruesa es la mediana (la persona
// de en medio) y la línea delgada llega hasta donde quedan 9 de cada 10
// personas (del 5 al 95 por ciento). La mediana va escrita al lado.
// Los cuantiles se calculan con el factor de expansión en la página: aquí
// llegan ya resumidos, uno por grupo.
// No: grupos con pocos casos (mejor los puntos individuales), ni una sola
// distribución (histograma).
import * as Plot from "npm:@observablehq/plot";
import {P} from "../paleta.js";
import {conGlobo} from "../globo.js";
import {base, margenRotulos, vacio, TIPO} from "./comun.js";

// resumen: [{grupo, p5, q1, mediana, q3, p95}]. `orden`: orden fijo de los
// grupos. `dominio`: extremos FIJOS del eje. `formato(v)`: texto de la
// mediana escrita. `marcar(d)`: true para la caja que va resaltada con
// contorno (el resto conserva su tono).
export function caja(resumen, {ancho, grupo = (d) => d.grupo, orden = null, dominio, formato = (v) => String(v), formatoEje = (v) => String(v), rotuloX = null, marcar = null, globo: g}) {
  const filas = resumen.filter((d) => d.mediana != null);
  if (!filas.length) return vacio();
  const grupos = orden ? orden.filter((k) => filas.some((d) => grupo(d) === k)) : filas.map(grupo);
  const angosto = ancho < 560;
  const plot = Plot.plot(base({
    // En un teléfono el nombre del grupo y su mediana van arriba de cada
    // renglón, y la caja toma todo el ancho.
    ancho, alto: grupos.length * (angosto ? 70 : 58) + 64, marginLeft: angosto ? 12 : margenRotulos(grupos, 170), marginRight: angosto ? 16 : 40, marginTop: 40, marginBottom: 12,
    x: {axis: "top", domain: dominio, label: rotuloX, labelArrow: "none", labelAnchor: "left", grid: true, tickFormat: formatoEje, ticks: angosto ? 5 : 8},
    y: {domain: grupos, label: null, tickSize: 0, padding: angosto ? 0.5 : 0.36, axis: angosto ? null : "left"},
    marks: [
      // Bigotes: del 5 al 95 por ciento.
      Plot.ruleY(filas, {y: grupo, x1: "p5", x2: "p95", stroke: P.tinta2, strokeWidth: 1.2}),
      Plot.tickX(filas, {y: grupo, x: "p5", stroke: P.tinta2, strokeWidth: 1.2, inset: 6}),
      Plot.tickX(filas, {y: grupo, x: "p95", stroke: P.tinta2, strokeWidth: 1.2, inset: 6}),
      // Caja: la mitad central, en el tono de tema; la mediana en la tinta del tono.
      Plot.barX(filas, {y: grupo, x1: "q1", x2: "q3", fill: P.tonoSuave, stroke: P.serie, strokeWidth: 1.2, rx: 2}),
      Plot.tickX(filas, {y: grupo, x: "mediana", stroke: P.tonoTexto, strokeWidth: 3.2}),
      marcar ? Plot.barX(filas.filter(marcar), {y: grupo, x1: "p5", x2: "p95", fill: "none", stroke: P.tinta, strokeWidth: 1.4, strokeDasharray: "3 2", insetTop: -6, insetBottom: -6}) : null,
      // La mediana escrita a la derecha del bigote, donde no tapa la caja.
      angosto
        ? Plot.text(filas, {y: grupo, x: dominio[0], text: (d) => `${grupo(d)} · mediana ${formato(d.mediana)}`, dy: -22, textAnchor: "start", fill: P.tinta, fontSize: TIPO.valor, fontWeight: 600, stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke"})
        : Plot.text(filas, {y: grupo, x: "p95", text: (d) => `Mediana ${formato(d.mediana)}`, dx: 9, textAnchor: "start", fill: P.tinta, fontSize: TIPO.valor, fontWeight: 600, stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke"}),
      // Contorno de la fila bajo el puntero: el eje categórico es y.
      Plot.barX(filas, Plot.pointerY({y: grupo, x1: "p5", x2: "p95", fill: "none", stroke: P.tinta, strokeWidth: 1.6, insetTop: -4, insetBottom: -4, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("aria-label", `Cajas de ${grupos.length} grupos. ${filas.map((d) => `${grupo(d)}: mediana ${formato(d.mediana)}`).join(". ")}.`);
  return g ? conGlobo(plot, g) : plot;
}
