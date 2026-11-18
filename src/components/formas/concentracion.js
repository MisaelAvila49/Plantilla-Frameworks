// formas/concentracion.js
// ¿Qué tan concentrado está un total en pocos lugares? Curva de
// concentración: los lugares se ordenan de más a menos y la curva suma, de
// izquierda a derecha, qué parte del total reúnen. La diagonal es el reparto
// parejo (cada 10 % de los lugares tendría 10 % del total); cuanto más se
// despega la curva hacia arriba, más concentrado está. Se dibujan dos curvas
// para comparar: la del total que interesa (tono de tema) y la de la
// población, como referencia (gris de comparación). En el corte elegido las
// dos cifras van escritas.
// No: pocos lugares (barras ordenadas), ni tasas, que no se suman.
import * as Plot from "npm:@observablehq/plot";
import {P} from "../paleta.js";
import {pctMarca, pctEje} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO} from "./comun.js";

// puntos: [{grupo, x, y}] con x = % acumulado de lugares e y = % acumulado del
// total, empezando en {x: 0, y: 0}. grupos: [principal, referencia].
// marcas: [{grupo, x, y}] los puntos del corte, con su cifra escrita.
export function concentracion(puntos, {ancho, grupos, corte = null, marcas = [], rotuloX = null, rotuloY = null, globo: g}) {
  const filas = puntos.filter((d) => grupos.includes(d.grupo) && d.y != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const color = (k) => (k === grupos[0] ? P.serie : P.comparacion);
  const texto = (k) => (k === grupos[0] ? P.tonoTexto : P.tinta2);
  const plot = Plot.plot(base({
    ancho, alto: Math.round(Math.max(320, Math.min(440, ancho * 0.52))), marginLeft: 50, marginRight: 18, marginTop: 30, marginBottom: 44,
    x: {domain: [0, 100], label: rotuloX, labelArrow: "none", labelAnchor: "left", ticks: angosto ? [0, 25, 50, 75, 100] : [0, 10, 25, 50, 75, 100], tickFormat: pctMarca, grid: true},
    y: {domain: [0, 100], label: rotuloY, labelArrow: "none", grid: true, tickFormat: pctMarca, ticks: 5},
    marks: [
      Plot.line([[0, 0], [100, 100]], {stroke: P.regla, strokeWidth: 1.2, strokeDasharray: "4 3"}),
      // Área entre la diagonal y la curva principal: cuanto más ancha, más concentrado.
      Plot.areaY(filas.filter((d) => d.grupo === grupos[0]), {x: "x", y1: "x", y2: "y", fill: P.serie, fillOpacity: 0.12}),
      Plot.line(filas, {x: "x", y: "y", z: "grupo", stroke: (d) => color(d.grupo), strokeWidth: 2.6}),
      corte != null ? Plot.ruleX([corte], {stroke: P.tinta2, strokeWidth: 1, strokeDasharray: "2 3"}) : null,
      Plot.dot(marcas, {x: "x", y: "y", fill: (d) => color(d.grupo), r: 4.5, stroke: P.fondo, strokeWidth: 1.2}),
      // dx y dy son constantes en Plot: una marca por curva, la principal arriba del punto.
      ...grupos.map((k, i) => Plot.text(marcas.filter((d) => d.grupo === k), {x: "x", y: "y", text: (d) => `${pctEje(Math.round(d.y * 10) / 10)} %`, dx: 9, dy: i === 0 ? -6 : 9, textAnchor: "start", fill: texto(k), fontWeight: 700, fontSize: TIPO.valor, stroke: P.fondo, strokeWidth: 3, paintOrder: "stroke"})),
      // Contorno del punto bajo el puntero: el eje que se recorre es x.
      Plot.dot(filas, Plot.pointerX({x: "x", y: "y", r: 6, fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("aria-label", `Curvas de concentración de ${grupos.join(" y de ")}. ${marcas.map((m) => `${m.grupo}: el ${pctEje(m.x)} % de los lugares reúne el ${pctEje(Math.round(m.y * 10) / 10)} %`).join(". ")}.`);
  return g ? conGlobo(plot, g) : plot;
}
