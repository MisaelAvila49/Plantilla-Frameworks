// formas/histograma.js
// ¿Cómo se reparten los valores de una medida continua (ingreso, edad,
// horas)? Una barra por tramo del mismo ancho; su alto es la parte de la
// población que cae en el tramo (no el conteo de la muestra), así que dos
// selecciones de tamaño distinto se comparan sobre el mismo eje. El último
// tramo puede ir abierto («o más») para que la cola larga no aplaste al
// resto. Las líneas de referencia (mediana, promedio) se rotulan FUERA del
// lienzo, en la leyenda de la página.
// No: comparar más de dos grupos (caja o crestas), ni una medida con pocos
// valores distintos (barras).
import * as Plot from "npm:@observablehq/plot";
import {P} from "../paleta.js";
import {pctMarca, pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO} from "./comun.js";

// tramos: [{x0, x1, valor, ...}] ya calculados (con el factor de expansión).
// dominioX y dominioY son FIJOS: no dependen del filtro. `abierto`: el último
// tramo junta todo lo que pasa de su inicio. `referencias`: [{valor, texto}],
// líneas punteadas sobre el eje x. `formatoX`: marcas del eje x.
export function histograma(tramos, {ancho, dominioX, dominioY, abierto = false, formatoX = (v) => String(v), marcasX = null, rotuloX = null, rotuloY = null, referencias = [], formatoValor = pctEje, globo: g}) {
  const filas = tramos.filter((d) => d.valor != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const anchoBarra = (ancho - 70) / filas.length;
  // La cifra va escrita sobre cada barra cuando cabe; si no, solo en la más alta.
  const mayor = filas.reduce((a, b) => (b.valor > a.valor ? b : a));
  const escritas = anchoBarra >= 34 ? filas.filter((d) => d.valor >= 0.05) : [mayor];
  const ultimo = filas[filas.length - 1];
  const marcas = marcasX ?? (angosto ? [dominioX[0], (dominioX[0] + ultimo.x0) / 2, ultimo.x0] : null);
  const plot = Plot.plot(base({
    ancho, alto: Math.round(Math.max(260, Math.min(380, ancho * 0.42))), marginLeft: 50, marginRight: abierto ? 40 : 16, marginTop: 30, marginBottom: 42,
    x: {domain: dominioX, label: rotuloX, labelArrow: "none", labelAnchor: "left", ticks: marcas ?? 6, tickFormat: (v) => `${formatoX(v)}${abierto && v === ultimo.x0 ? " o más" : ""}`},
    y: {domain: dominioY, label: rotuloY, labelArrow: "none", grid: true, tickFormat: pctMarca, ticks: 5},
    marks: [
      Plot.rect(filas, {x1: "x0", x2: "x1", y1: 0, y2: "valor", fill: P.serie, inset: angosto ? 0.4 : 0.8}),
      Plot.ruleY([0], {stroke: P.regla}),
      Plot.ruleX(referencias, {x: "valor", stroke: P.tinta2, strokeWidth: 1.4, strokeDasharray: "4 3"}),
      Plot.text(escritas, {x: (d) => (d.x0 + d.x1) / 2, y: "valor", text: (d) => formatoValor(d.valor), dy: -7, fill: P.tinta2, fontSize: TIPO.valor - 1, stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke"}),
      // Contorno del tramo bajo el puntero: el eje categórico es x.
      Plot.rect(filas, Plot.pointerX({x1: "x0", x2: "x1", y1: 0, y2: "valor", fill: "none", stroke: P.tinta, strokeWidth: 1.6, inset: angosto ? 0.4 : 0.8, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("aria-label", `Histograma de ${filas.length} tramos. El tramo más alto va de ${formatoX(mayor.x0)} a ${formatoX(mayor.x1)} con ${formatoValor(mayor.valor)} %.`);
  return g ? conGlobo(plot, g) : plot;
}
