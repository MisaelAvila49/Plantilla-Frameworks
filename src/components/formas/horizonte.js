// formas/horizonte.js
// ¿Cómo se comparan muchas series largas en poco espacio? Un renglón angosto
// por serie. El área de cada serie se corta en bandas de alto fijo (por
// ejemplo, de 3 en 3 puntos) y las bandas se DOBLAN una encima de otra: la
// primera va en el paso claro de la rampa del tono de tema y cada banda de
// arriba, un paso más oscura. Así un renglón de 30 px muestra una serie que
// va de 0 a 9 sin perder detalle, y los picos se ven por lo oscuro.
// No: público que la ve una sola vez sin explicación (líneas en facetas),
// series con signo (esta versión dobla solo valores positivos) ni menos de
// unas cinco series.
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P, rampaTema} from "../paleta.js";
import {pct, pctEje, SIN_DATO} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";

// datos: filas largas, una por serie y periodo. tiempo(d) número que ordena
// los periodos (2005.25 para el segundo trimestre), valor(d) la cifra o null
// (Sin dato). `series`: orden de los renglones, de arriba a abajo. `paso` y
// `bandas`: alto de cada banda y cuántas hay; su producto es el tope FIJO.
// `marcasTiempo`: periodos que se rotulan en el eje. corto(serie): nombre
// abreviado en pantallas angostas. El nodo trae `colores` (uno por banda).
export function horizonte(datos, {ancho, tiempo, serie, valor, series = null, paso, bandas = 3, marcasTiempo = null, formato = pct, formatoBanda = pctEje,
  unidadBanda = "%", corto = null, globo: g}) {
  if (!datos.some((d) => valor(d) != null)) return vacio();
  const lista = series ?? [...new Set(datos.map(serie))];
  const filas = datos.filter((d) => lista.includes(serie(d)));
  const conDato = filas.filter((d) => valor(d) != null);
  const sinDato = filas.filter((d) => valor(d) == null);
  const angosto = ancho < 560;
  const nombre = (s) => (angosto && corto ? corto(s) : String(s));
  const rampa = rampaTema([0, bandas]);
  const colores = d3.range(bandas).map((i) => rampa(i + 1));
  const altoFila = angosto ? 26 : 30;
  const ultimo = d3.max(conDato, tiempo);
  const finales = d3.groups(conDato, serie).map(([, f]) => d3.greatest(f, tiempo));
  const mitadPeriodo = (d3.min(d3.pairs([...new Set(filas.map(tiempo))].sort(d3.ascending)), ([a, b]) => b - a) ?? 1) / 2;
  const izquierda = Math.min(angosto ? 66 : 176, 18 + d3.max(lista, (s) => nombre(s).length) * 7.8);
  const plot = Plot.plot(base({
    ancho, alto: lista.length * altoFila + 40, marginLeft: izquierda, marginRight: angosto ? 44 : 58, marginTop: 6, marginBottom: 28,
    x: {label: null, tickFormat: (v) => String(Math.floor(v)), ticks: marcasTiempo ?? undefined, tickSize: 4, nice: false},
    y: {domain: [0, paso], axis: null},
    fy: {domain: lista, label: null, tickSize: 0, padding: 0.12, tickFormat: nombre, axis: "left"},
    marks: [
      // Las bandas: cada una toma lo que pasa de su piso, hasta un paso.
      ...d3.range(bandas).map((i) => Plot.areaY(filas, {x: tiempo, fy: serie, y1: () => 0,
        y2: (d) => (valor(d) == null ? NaN : Math.max(0, Math.min(paso, valor(d) - i * paso))), fill: colores[i], curve: "linear"})),
      // Un periodo sin dato es una franja gris propia, no un hueco blanco.
      Plot.rect(sinDato, {x1: (d) => tiempo(d) - mitadPeriodo, x2: (d) => tiempo(d) + mitadPeriodo, fy: serie, y1: () => 0, y2: () => paso, fill: P.sinDato}),
      Plot.ruleY([0], {stroke: P.regla, strokeWidth: 0.8}),
      // Cifra del último periodo a la derecha de cada renglón.
      Plot.text(finales, {x: () => ultimo, fy: serie, y: () => paso / 2, text: (d) => formatoBanda(valor(d)), textAnchor: "start", dx: 6, fill: P.tinta2, fontSize: angosto ? 11 : TIPO.valor - 0.5}),
      // El tiempo es el eje continuo y el renglón la categoría: el puntero
      // busca el periodo más cercano dentro del renglón bajo el cursor.
      Plot.ruleX(conDato, Plot.pointerX({x: tiempo, fy: serie, y1: () => 0, y2: () => paso, stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity})),
    ],
  }));
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `Horizonte de ${lista.length} series. Último periodo: ${finales.map((d) => `${serie(d)}, ${formato(valor(d))}`).join("; ")}.`);
  const leyenda = leyendaItems([
    ...colores.map((c, i) => ({tipo: "cuadro", color: c, texto: `${formatoBanda(i * paso)} a ${formatoBanda((i + 1) * paso)} ${unidadBanda}`})),
    ...(sinDato.length ? [{tipo: "cuadro", color: P.sinDato, texto: SIN_DATO}] : []),
  ]);
  const nodo = conLeyenda(leyenda, g ? conGlobo(plot, g) : plot);
  nodo.colores = colores;
  return nodo;
}
