// formas/icicle.js
// ¿Qué contiene qué, y cuánto pesa cada parte? Una partición en dos columnas:
// a la izquierda las ramas (primer nivel) y a la derecha sus partes (segundo
// nivel), cada bloque con un alto proporcional a su cantidad y alineado con
// su rama. Se lee la estructura completa y, a la vez, el peso de cada parte.
// El color es de IDENTIDAD de la rama (tres tonos y gris para las demás).
// No: cuando solo importan las proporciones sin estructura (treemap), con
// más de tres niveles, ni con partes tan chicas que no se distinguen.
import * as d3 from "npm:d3";
import {svg} from "npm:htl";
import {P, tintaSobre} from "../paleta.js";
import {pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, conLeyenda} from "./comun.js";
import {anchoTexto} from "./anotaciones.js";

// datos: una fila por parte del segundo nivel. rama(d), parte(d), valor(d).
// `ramas`: orden fijo de las ramas (de ahí sale el color). color(rama).
// El dato del globo lleva `_nivel` (1 o 2), `_nombre`, `_rama`, `_valor`,
// `_parteTotal` (% del total) y `_parteRama` (% de su rama).
export function icicle(datos, {ancho, rama, parte, valor, ramas, color, formato = pct, alto = null, globo: g}) {
  const filas = datos.filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const angosto = ancho < 560;
  const H = alto ?? (angosto ? 480 : 440);
  const raiz = d3.hierarchy({hijos: ramas.map((r) => ({nombre: r, hijos: filas.filter((d) => rama(d) === r)})).filter((r) => r.hijos.length)}, (d) => d.hijos)
    .sum((d) => (d.hijos ? 0 : valor(d)));
  // Las ramas conservan su orden fijo; dentro de cada rama, de mayor a menor.
  raiz.children.forEach((r) => r.children.sort((a, b) => b.value - a.value));
  d3.partition().size([H, 3]).padding(2)(raiz);
  const total = raiz.value;
  const w1 = Math.round(ancho * (angosto ? 0.4 : 0.34)), hueco = 3;
  const nodos = raiz.descendants().filter((n) => n.depth > 0).map((n) => {
    const nombreRama = n.depth === 1 ? n.data.nombre : n.parent.data.nombre;
    const nombre = n.depth === 1 ? n.data.nombre : String(parte(n.data));
    return {
      n, x: n.depth === 1 ? 0 : w1 + hueco, w: n.depth === 1 ? w1 : ancho - w1 - hueco, y: n.x0, h: n.x1 - n.x0,
      dato: {...(n.depth === 2 ? n.data : {}), _nivel: n.depth, _nombre: nombre, _rama: nombreRama, _valor: n.value,
        _parteTotal: 100 * n.value / total, _parteRama: 100 * n.value / (n.depth === 1 ? n.value : n.parent.value), _total: total},
    };
  });
  const recortar = (t, w, tam, peso) => {
    if (anchoTexto(t, tam, peso) <= w) return t;
    const cabe = Math.max(3, Math.floor((w / anchoTexto(t, tam, peso)) * t.length) - 1);
    return t.slice(0, cabe) + "…";
  };
  const bloques = nodos.map(({x, w, y, h, dato}, i) => {
    const relleno = color(dato._rama), tinta = tintaSobre(relleno);
    const tam = dato._nivel === 1 ? 12.5 : 11.5, peso = dato._nivel === 1 ? 700 : 500;
    const dosRenglones = h >= 34, unRenglon = h >= 17;
    const texto = recortar(dato._nombre, w - 14, tam, peso);
    const cifra = formato(dato._parteTotal);
    const nodo = svg`<g class="marca-viva ic-bloque" tabindex="0" transform=${`translate(${x},${Math.round(y * 10) / 10})`}>
      <rect width=${w} height=${Math.max(0.5, h)} rx="2" fill=${relleno} />
      ${dosRenglones ? svg`<text x="7" y="15" font-size=${tam} font-weight=${peso} fill=${tinta} stroke="none">${texto}</text>
        <text x="7" y="29" font-size="11.5" fill=${tinta} stroke="none">${cifra}</text>` : ""}
      ${!dosRenglones && unRenglon ? svg`<text x="7" y=${h / 2 + 4} font-size="11.5" font-weight=${peso} fill=${tinta} stroke="none">${recortar(`${dato._nombre} · ${cifra}`, w - 14, 11.5, peso)}</text>` : ""}
    </g>`;
    nodo.style.setProperty("--i", i);
    if (g) globoEn(nodo, g, dato);
    return nodo;
  });
  const dibujo = svg`<svg class="icicle" role="group" aria-label=${`Partición en ${raiz.children.length} ramas y ${raiz.leaves().length} partes. ` +
    raiz.children.map((r) => `${r.data.nombre}, ${formato(100 * r.value / total)}`).join("; ") + "."}
    width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">${bloques}</svg>`;
  const presentes = raiz.children.map((r) => r.data.nombre);
  // Leyenda: una entrada por tono; las ramas en gris se nombran juntas.
  const vistos = new Map();
  for (const r of presentes) { const c = color(r); vistos.set(c, [...(vistos.get(c) ?? []), r]); }
  const leyenda = leyendaItems([...vistos].map(([c, rs]) => ({tipo: "cuadro", color: c, texto: rs.join(" y ")})));
  const nodo = conLeyenda(leyenda, dibujo);
  nodo.nodos = nodos.map((x) => x.dato);
  return nodo;
}
