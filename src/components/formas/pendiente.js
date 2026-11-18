// formas/pendiente.js
// ¿Quién subió y quién bajó entre dos ediciones? Una línea por unidad del
// primer al último año, con su nombre y su valor en los dos extremos.
// No: más de unas quince unidades (se enciman los rótulos; usar dumbbell).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {pct} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO} from "./comun.js";

// datos: filas largas con dos ediciones por unidad. color(unidad, filasDeLaUnidad).
export function pendiente(datos, {ancho, edicion, valor, unidad, color = () => P.serie, formato = pct, corto = null, globo: g, alto = null}) {
  const filas = datos.filter((d) => valor(d) != null);
  const ediciones = [...new Set(filas.map(edicion))].sort((a, b) => a - b);
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
  const lado = angosto ? (corto ? 96 : 62) : Math.min(190, ancho * 0.3);
  const plot = Plot.plot(base({
    ancho, alto: H, marginLeft: lado, marginRight: lado, marginTop: 30, marginBottom: 16,
    x: {type: "point", domain: [primera, ultima], axis: "top", label: null, tickFormat: String, tickSize: 0, padding: 0},
    y: {axis: null, domain: [dominio[0] - renglon * 2, dominio[1]]},
    marks: [
      Plot.ruleX([primera, ultima], {stroke: P.rejilla}),
      Plot.line(completas, {x: edicion, y: valor, z: unidad, stroke: tinta, strokeWidth: 2}),
      Plot.dot(completas, {x: edicion, y: valor, fill: tinta, r: 4}),
      Plot.text(izq, {x: edicion, y: "_yRotulo", text: (d) => (angosto ? (corto ? `${corto(unidad(d))} ${formato(valor(d))}` : formato(valor(d))) : `${unidad(d)}  ${formato(valor(d))}`), textAnchor: "end", dx: -9, fill: tinta, fontSize: TIPO.valor}),
      Plot.text(der, {x: edicion, y: "_yRotulo", text: (d) => (angosto ? (corto ? `${formato(valor(d))} ${corto(unidad(d))}` : formato(valor(d))) : `${formato(valor(d))}  ${unidad(d)}`), textAnchor: "start", dx: 9, fill: tinta, fontSize: TIPO.valor, fontWeight: 600}),
      Plot.dot(completas, Plot.pointer({x: edicion, y: valor, r: 7.5, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));
  return g ? conGlobo(plot, g) : plot;
}
