// formas/arbol-clasificacion.js
// ¿Cómo se organiza una clasificación oficial y cuánto pesa cada rama? Un
// árbol de izquierda a derecha: la raíz, las ramas (familias) y las hojas
// (agrupaciones), con todas las hojas alineadas en una columna. Cada hoja es
// un punto cuyo ÁREA es su cantidad, en una escala FIJA, con su nombre y su
// cifra escritos al lado. Se lee primero la estructura y después el tamaño.
// No: comparar tamaños con precisión (barras o treemap), más de unas treinta
// hojas (se vuelve una lista) ni más de tres niveles.
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {conGlobo} from "../globo.js";
import {base, vacio, TIPO} from "./comun.js";

// datos: una fila por hoja. rama(d), hoja(d), valor(d). raiz: nombre de la
// raíz. `tope`: valor FIJO que corresponde al punto más grande. El dato del
// globo es el de la hoja, o {_rama, _valor, _hojas} para un nodo de rama.
// `ordenRamas`: orden fijo de las ramas, de arriba a abajo.
export function arbolClasificacion(datos, {ancho, rama, hoja, valor, raiz = "Total", tope, ordenRamas = null, formato = entero, globo: g}) {
  const filas = datos.filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const ramas = (ordenRamas ?? [...new Set(filas.map(rama))]).filter((r) => filas.some((d) => rama(d) === r));
  // Dentro de cada rama, las hojas de mayor a menor.
  const hojas = ramas.flatMap((r) => filas.filter((d) => rama(d) === r).sort((a, b) => valor(b) - valor(a)));
  const limpiar = (t) => String(t).replace(/\//g, "-");
  const internos = [{_ruta: limpiar(raiz), _nombre: raiz, _nivel: 0, _valor: d3.sum(hojas, valor), _hojas: hojas.length},
    ...ramas.map((r) => {
      const f = hojas.filter((d) => rama(d) === r);
      return {_ruta: `${limpiar(raiz)}/${limpiar(r)}`, _nombre: r, _rama: r, _nivel: 1, _valor: d3.sum(f, valor), _hojas: f.length};
    })];
  const externos = hojas.map((d) => ({...d, _ruta: `${limpiar(raiz)}/${limpiar(rama(d))}/${limpiar(hoja(d))}`, _nombre: hoja(d), _rama: rama(d), _nivel: 2, _valor: valor(d)}));
  const todos = [...internos, ...externos];
  const op = {path: "_ruta", treeLayout: d3.cluster, treeSort: null};
  const radio = d3.scaleSqrt([0, tope], [0, angosto ? 9 : 11]);
  const derecha = angosto ? 128 : 200;
  const H = hojas.length * (angosto ? 24 : 22) + 30;
  const plot = Plot.plot(base({
    ancho, alto: H, marginTop: 16, marginBottom: 14, marginLeft: angosto ? 14 : 24, marginRight: derecha,
    axis: null,
    // El radio ya viene en píxeles desde una escala FIJA: Plot no lo reescala.
    r: {type: "identity"},
    marks: [
      Plot.link(todos, Plot.treeLink({...op, stroke: P.contexto, strokeWidth: 1.3})),
      Plot.dot(todos, Plot.treeNode({...op, treeFilter: "node:internal", r: 4, fill: P.tinta2})),
      Plot.dot(todos, Plot.treeNode({...op, treeFilter: "node:external", r: (d) => Math.max(2, radio(d._valor)), fill: P.serie, stroke: P.fondo, strokeWidth: 1})),
      Plot.text(todos, Plot.treeNode({...op, treeFilter: "node:external", dx: angosto ? 12 : 15, textAnchor: "start", fontSize: angosto ? 11 : TIPO.valor - 0.5, fill: P.tinta,
        text: (d) => (angosto ? d._nombre : `${d._nombre} · ${formato(d._valor)}`)})),
      Plot.text(todos, Plot.treeNode({...op, treeFilter: "node:internal", dy: -11, dx: -4, textAnchor: "start", fontSize: angosto ? 11.5 : TIPO.valor, fontWeight: 700,
        fill: P.tinta, stroke: P.fondo, strokeWidth: 4, paintOrder: "stroke",
        // En un teléfono la raíz y las ramas quedan cerca: la raíz lleva solo su primera palabra.
        text: (d) => (angosto && d._nivel === 0 ? String(d._nombre).split(" ")[0] : d._nombre)})),
      // Las hojas forman una columna: el puntero elige el renglón más cercano.
      Plot.dot(todos, Plot.pointerY(Plot.treeNode({...op, r: (d) => (d._nivel === 2 ? Math.max(2, radio(d._valor)) + 3 : 7), fill: "none", stroke: P.tinta, strokeWidth: 1.6, maxRadius: Infinity}))),
    ],
  }));
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `${raiz}: ${ramas.length} ramas y ${hojas.length} hojas. ` +
    ramas.map((r) => `${r}: ${hojas.filter((d) => rama(d) === r).map((d) => `${hoja(d)} ${formato(valor(d))}`).join(", ")}`).join(". ") + ".");
  return g ? conGlobo(plot, g) : plot;
}
