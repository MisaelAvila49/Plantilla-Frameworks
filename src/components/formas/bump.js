// formas/bump.js
// ¿Qué lugar ocupa cada quien, edición tras edición? Una línea por unidad
// que une su LUGAR en cada corte (1 = el valor más alto), con el nombre a
// los dos lados y el número de lugar dentro de cada punto. Las unidades
// elegidas van en color y con trazo grueso; las demás, en el gris de
// contexto, para que se pueda seguir una sin perder a las otras.
// No: cuando importa la distancia entre valores (líneas), con más de unas
// quince unidades (se enciman los nombres) ni con menos de tres cortes
// (pendiente).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P, tintaSobre} from "../paleta.js";
import {pct} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO, leyendaItems, conLeyenda} from "./comun.js";

// datos: filas largas, una por unidad y corte. tiempo(d), unidad(d),
// valor(d). El lugar se calcula DENTRO de cada corte entre las unidades con
// dato (una unidad sin dato en un corte no ocupa lugar y su línea se corta).
// destacada(unidad): true para las que van en color. color(unidad): su tono.
// corto(unidad): nombre abreviado en pantallas angostas. El nodo trae
// `resumen` con el lugar de cada unidad en cada corte, para la tabla.
export function bump(datos, {ancho, tiempo, unidad, valor, destacada = () => false, color = () => P.serie, formato = pct, corto = null,
  textoDestacadas = null, textoResto = "Las demás", globo: g}) {
  const filas = datos.filter((d) => valor(d) != null && !Number.isNaN(+valor(d)));
  if (!filas.length) return vacio();
  const cortes = [...new Set(filas.map(tiempo))].sort(d3.ascending);
  if (cortes.length < 3) return vacio("Se necesitan al menos tres cortes para seguir el lugar de cada unidad.");
  // Lugar dentro de cada corte: 1 es el valor más alto.
  const conLugar = cortes.flatMap((c) => {
    const delCorte = filas.filter((d) => tiempo(d) === c).sort((a, b) => valor(b) - valor(a));
    return delCorte.map((d, i) => ({...d, _lugar: i + 1, _de: delCorte.length, _corte: c}));
  });
  const unidades = [...new Set(conLugar.map(unidad))];
  const n = d3.max(conLugar, (d) => d._de);
  const angosto = ancho < 560;
  const nombre = (u) => (angosto && corto ? corto(u) : String(u));
  const largo = d3.max(unidades, (u) => nombre(u).length);
  const margen = Math.min(angosto ? 64 : 180, 22 + largo * 6.9);
  const altoFila = angosto ? 30 : 34;
  const H = n * altoFila + 46;
  // Una unidad que falta en un corte rompe su línea: se dibuja por tramos
  // de cortes seguidos.
  const tramos = [];
  for (const u of unidades) {
    const propias = conLugar.filter((d) => unidad(d) === u).sort((a, b) => cortes.indexOf(a._corte) - cortes.indexOf(b._corte));
    let actual = [];
    for (const d of propias) {
      if (actual.length && cortes.indexOf(d._corte) !== cortes.indexOf(actual.at(-1)._corte) + 1) { tramos.push(actual); actual = []; }
      actual.push(d);
    }
    if (actual.length) tramos.push(actual);
  }
  const lineas = tramos.flatMap((t, k) => t.map((d) => ({...d, _tramo: k})));
  const esDestacada = (d) => Boolean(destacada(unidad(d)));
  const tinta = (d) => (esDestacada(d) ? color(unidad(d)) : P.contexto);
  const fondo = lineas.filter((d) => !esDestacada(d)), frente = lineas.filter(esDestacada);
  const puntosFondo = conLugar.filter((d) => !esDestacada(d)), puntosFrente = conLugar.filter(esDestacada);
  const primeros = conLugar.filter((d) => d._corte === cortes[0]);
  const ultimos = conLugar.filter((d) => d._corte === cortes.at(-1));
  const r = angosto ? 8.5 : 10;
  const plot = Plot.plot(base({
    ancho, alto: H, marginTop: 30, marginBottom: 16, marginLeft: margen, marginRight: margen,
    x: {type: "point", domain: cortes, axis: "top", label: null, tickFormat: String, tickSize: 0, padding: 0.06},
    y: {domain: [0.5, n + 0.5], reverse: true, axis: null},
    marks: [
      Plot.ruleX(cortes, {stroke: P.rejilla}),
      Plot.line(fondo, {x: "_corte", y: "_lugar", z: "_tramo", stroke: P.contexto, strokeWidth: 1.6, curve: "bump-x"}),
      Plot.line(frente, {x: "_corte", y: "_lugar", z: "_tramo", stroke: tinta, strokeWidth: 3.4, curve: "bump-x"}),
      Plot.dot(puntosFondo, {x: "_corte", y: "_lugar", r: r - 2, fill: P.fondo, stroke: P.contexto, strokeWidth: 1.4}),
      Plot.dot(puntosFrente, {x: "_corte", y: "_lugar", r, fill: tinta, stroke: P.fondo, strokeWidth: 1.4}),
      // Número de lugar dentro de cada punto destacado.
      Plot.text(puntosFrente, {x: "_corte", y: "_lugar", text: (d) => String(d._lugar), fill: (d) => tintaSobre(tinta(d)), fontSize: 10.5, fontWeight: 700, pointerEvents: "none"}),
      // Nombres a los dos lados: primer corte a la izquierda, último a la derecha.
      ...[[primeros, "end", -(r + 7)], [ultimos, "start", r + 7]].flatMap(([lista, ancla, dx]) => [
        Plot.text(lista.filter((d) => !esDestacada(d)), {x: "_corte", y: "_lugar", text: (d) => nombre(unidad(d)), textAnchor: ancla, dx, fill: P.tinta2, fontSize: angosto ? 11.5 : TIPO.valor}),
        Plot.text(lista.filter(esDestacada), {x: "_corte", y: "_lugar", text: (d) => nombre(unidad(d)), textAnchor: ancla, dx, fill: P.tinta, fontWeight: 700, fontSize: angosto ? 11.5 : TIPO.valor}),
      ]),
      // El tiempo es el eje categórico: el puntero elige el corte y, dentro
      // de él, el lugar más cercano.
      Plot.dot(conLugar, Plot.pointerX({x: "_corte", y: "_lugar", r: r + 3, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  const elegidas = unidades.filter((u) => destacada(u));
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `Lugar de ${unidades.length} unidades en ${cortes.length} cortes, de ${cortes[0]} a ${cortes.at(-1)}. ` +
    elegidas.map((u) => `${u}: ${conLugar.filter((d) => unidad(d) === u).map((d) => `${d._corte}, lugar ${d._lugar}`).join("; ")}`).join(". "));
  const leyenda = leyendaItems([
    ...elegidas.map((u) => ({tipo: "linea", color: color(u), texto: textoDestacadas ?? String(u)})).filter((x, i, a) => a.findIndex((y) => y.texto === x.texto) === i),
    ...(unidades.length > elegidas.length ? [{tipo: "linea", color: P.contexto, texto: textoResto}] : []),
  ]);
  const nodo = conLeyenda(leyenda, g ? conGlobo(plot, g) : plot);
  nodo.resumen = unidades.map((u) => ({unidad: u, lugares: new Map(conLugar.filter((d) => unidad(d) === u).map((d) => [d._corte, d]))}));
  return nodo;
}
