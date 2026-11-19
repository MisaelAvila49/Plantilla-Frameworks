// formas/pendiente.js
// ¿Quién subió y quién bajó entre dos ediciones? Una línea por unidad del
// primer al último año, con su nombre y su valor en los dos extremos. Los
// dos extremos también pueden ser dos grupos (sin y con discapacidad): con
// `orden` se fija cuál va a la izquierda, y la pendiente es la brecha.
// No: más de unas quince unidades (se enciman los rótulos; usar dumbbell).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {pct} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO} from "./comun.js";

// datos: filas largas con dos ediciones por unidad. color(unidad, filasDeLaUnidad).
// `orden`: los dos extremos en su orden, cuando no son años (por omisión, de
// menor a mayor).
export function pendiente(datos, {ancho, edicion, valor, unidad, color = () => P.serie, formato = pct, corto = null, globo: g, alto = null, orden = null}) {
  const filas = datos.filter((d) => valor(d) != null);
  const presentes = new Set(filas.map(edicion));
  const ediciones = orden ? orden.filter((e) => presentes.has(e)) : [...presentes].sort((a, b) => a - b);
  if (ediciones.length < 2) return vacio("Se necesitan dos ediciones con dato para comparar.");
  const [primera, ultima] = [ediciones[0], ediciones.at(-1)];
  const porUnidad = d3.group(filas.filter((d) => edicion(d) === primera || edicion(d) === ultima), unidad);
  const completas = [...porUnidad].filter(([, f]) => f.length === 2).flatMap(([, f]) => f);
  const tinta = (d) => color(unidad(d), porUnidad.get(unidad(d)));
  const angosto = ancho < 520;
  const H = alto ?? Math.round(Math.max(340, Math.min(540, ancho * 0.62)));
  // Rótulos que no se enciman: en cada extremo se separan lo que mide un
  // renglón. El punto queda en su valor; solo el rótulo se desplaza.
  const [vMin, vMax] = d3.extent(completas, valor);
  const holgura = (vMax - vMin || 1) * 0.06, dominio = [vMin - holgura, vMax + holgura];
  const renglon = (dominio[1] - dominio[0]) * 15 / (H - 46);
  const separar = (lista) => {
    const orden = [...lista].sort((p, q) => valor(q) - valor(p));
    let previo = Infinity;
    return orden.map((d) => { const y = Math.min(valor(d), previo - renglon); previo = y; return {...d, _yRotulo: y}; });
  };
  const izq = separar(completas.filter((d) => edicion(d) === primera)), der = separar(completas.filter((d) => edicion(d) === ultima));
  // Margen de cada lado medido del rótulo más largo (nombre y cifra), con
  // tope en una fracción del ancho: así no se corta en un teléfono.
  const txtIzq = (d) => (angosto ? (corto ? `${corto(unidad(d))} ${formato(valor(d))}` : formato(valor(d))) : `${unidad(d)}  ${formato(valor(d))}`);
  const txtDer = (d) => (angosto ? (corto ? `${formato(valor(d))} ${corto(unidad(d))}` : formato(valor(d))) : `${formato(valor(d))}  ${unidad(d)}`);
  const largo = Math.max(...completas.map((d) => Math.max(txtIzq(d).length, txtDer(d).length)));
  // El rótulo de cada extremo va centrado sobre su línea: el margen cabe
  // al menos la mitad del más largo.
  const cabeza = 10 + Math.max(...[primera, ultima].map((e) => String(e).length)) * 3.6;
  const lado = Math.round(Math.max(cabeza, Math.min(angosto ? ancho * 0.42 : Math.min(190, ancho * 0.3), Math.max(40, 16 + largo * (angosto ? 6.3 : 6.9)))));
  const plot = Plot.plot(base({
    ancho, alto: H, marginLeft: lado, marginRight: lado, marginTop: 30, marginBottom: 16,
    x: {type: "point", domain: [primera, ultima], axis: "top", label: null, tickFormat: String, tickSize: 0, padding: 0},
    y: {axis: null, domain: [dominio[0] - renglon * 2, dominio[1]]},
    marks: [
      Plot.ruleX([primera, ultima], {stroke: P.rejilla}),
      Plot.line(completas, {x: edicion, y: valor, z: unidad, stroke: tinta, strokeWidth: 2}),
      Plot.dot(completas, {x: edicion, y: valor, fill: tinta, r: 4}),
      Plot.text(izq, {x: edicion, y: "_yRotulo", text: txtIzq, textAnchor: "end", dx: -9, fill: tinta, fontSize: angosto ? TIPO.valor - 1 : TIPO.valor}),
      Plot.text(der, {x: edicion, y: "_yRotulo", text: txtDer, textAnchor: "start", dx: 9, fill: tinta, fontSize: angosto ? TIPO.valor - 1 : TIPO.valor, fontWeight: 600}),
      Plot.dot(completas, Plot.pointer({x: edicion, y: valor, r: 7.5, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  return g ? conGlobo(plot, g) : plot;
}
