// formas/unidades-espejo.js
// ¿Cuántas personas hay de cada lado (sexo, situación) en cada categoría
// ordenada (grupo de edad, año)? Unidades contables apiladas a los dos lados
// de un eje central: las de un lado crecen hacia arriba y las del otro hacia
// abajo, una columna por categoría, y cada cuadro vale un número fijo de
// personas. La cifra exacta va al final de cada pila. Un subgrupo de interés
// puede ir en color pleno (los cuadros más cercanos al eje) y el resto de la
// pila, tenue. En pantallas angostas el eje se acuesta: un lado a la izquierda,
// el otro a la derecha y un renglón por categoría.
// Inspirada en The New York Times (Dispatch del 10 de noviembre de 2026).
// No: más de dos lados, categorías sin orden con muchas clases (más de unas
// diez), ni tasas (cada cuadro cuenta personas).
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {mostrarGlobo, ocultarGlobo, textoGlobo} from "../globo.js";
import {vacio, TIPO, leyendaItems} from "./comun.js";
import {tamanoUnidad, topeFiguras, textoUnidad, tintaLegible, anchoTexto} from "./unidad.js";

const NS = "http://www.w3.org/2000/svg";
const r1 = (v) => Math.round(v * 10) / 10;

// datos: una fila por categoría y lado. categoria(d), lado(d), valor(d)
// personas. `lados`: [arriba o izquierda, abajo o derecha]. `categorias`:
// orden del eje. `color(lado)`: tono de cada lado. `resaltado(d)`: cuántas de
// esas personas son del subgrupo de interés (o null para no resaltar), con su
// nombre en `nombreResaltado`. `unidad`: personas por cuadro (si no, se elige
// sola con la regla de la familia: entre unas 600 y 1,500 figuras en
// escritorio y 700 como tope en un teléfono). `rotulo(c)`: texto del eje.
// El dato del globo trae `figuras`, `unidad`, `otro` (el valor del otro lado)
// y `resaltadas`. El nodo trae `unidad`, `figuras` y `resumen`.
export function unidadesEspejo(datos, {ancho, categoria, lado, valor, lados, categorias, color, resaltado = null, nombreResaltado = "",
  unidad = null, nombreUnidad = "personas", unidadSingular = "persona", rotulo = String, globo: g}) {
  const celdas = new Map(datos.filter((d) => valor(d) != null).map((d) => [`${categoria(d)}|${lado(d)}`, d]));
  const total = [...celdas.values()].reduce((s, d) => s + valor(d), 0);
  if (!total) return vacio();
  const K = unidad ?? tamanoUnidad(total, {tope: topeFiguras(ancho)});
  const vertical = ancho >= 560;
  const conResalte = Boolean(resaltado);
  const pilas = [];
  for (const [ci, c] of categorias.entries()) for (const [li, l] of lados.entries()) {
    const d = celdas.get(`${c}|${l}`) ?? null, v = d ? valor(d) : 0;
    let n = Math.round(v / K);
    const parcial = v > 0 && n === 0;
    if (parcial) n = 1;
    const nr = conResalte && d ? Math.min(n, Math.round(resaltado(d) / K)) : n;
    const otro = celdas.get(`${c}|${lados[1 - li]}`);
    pilas.push({d, c, ci, l, li, v, n, nr, parcial, otro: otro ? valor(otro) : null, tono: color(l)});
  }
  const N = pilas.reduce((s, p) => s + p.n, 0);
  const maxN = Math.max(...pilas.map((p) => p.n));
  // Cada lado reserva solo el alto de su pila más alta: con un lado mucho
  // más chico que el otro, la mitad de arriba no deja una franja vacía.
  const maxLado = [0, 1].map((li) => Math.max(1, ...pilas.filter((p) => p.li === li).map((p) => p.n)));
  const nCat = categorias.length;

  // ---- Geometría: tamaño del cuadro y cuántos caben a lo ancho de una pila.
  let u, paso, porRenglon, W, H, ejePos;
  const fCifra = vertical ? 12.5 : 11.5;
  if (vertical) {
    const izq = 6, colW = (ancho - izq * 2) / nCat, libre = colW - 14;
    const altoMax = Math.max(150, Math.min(250, ancho * 0.2));
    for (u = 16; u >= 3; u -= 0.5) {
      paso = u + Math.max(1.2, u * 0.16); porRenglon = Math.max(1, Math.floor(libre / paso));
      if (Math.ceil(maxN / porRenglon) * paso <= altoMax) break;
    }
    const [alto0, alto1] = maxLado.map((n) => Math.ceil(n / porRenglon) * paso);
    ejePos = 30 + alto0 + 22;
    W = ancho; H = ejePos + 22 + alto1 + 30;
  } else {
    // El espacio de la cifra se mide del texto más largo que se escribirá.
    const centro = 58, cifraW = 10 + Math.max(...pilas.map((p) => anchoTexto(p.v ? entero(p.v) : "Sin dato", fCifra, true))), ladoW = (ancho - centro) / 2 - cifraW;
    for (u = 12; u >= 3; u -= 0.5) {
      paso = u + Math.max(1, u * 0.16); porRenglon = Math.max(1, Math.floor(ladoW / paso));
      const renglon = Math.ceil(maxN / porRenglon) * paso + 12;
      if (renglon * nCat <= 520) break;
    }
    ejePos = ancho / 2;
    W = ancho; H = 26 + nCat * (Math.ceil(maxN / porRenglon) * paso + 12) + 4;
  }
  const altoRenglon = vertical ? 0 : Math.ceil(maxN / porRenglon) * paso + 12;
  const colW = vertical ? (ancho - 12) / nCat : 0;

  // Posición del cuadro k de una pila; los primeros (el subgrupo resaltado)
  // quedan junto al eje. Vertical: renglones que se alejan del eje, centrados
  // en su columna. Horizontal: columnas de alto fijo que se alejan del eje
  // hacia su lado, de modo que cada pila es una barra que crece hacia fuera.
  const filasPorRenglon = Math.ceil(maxN / porRenglon);
  const posicion = (p, k) => {
    if (vertical) {
      const fila = Math.floor(k / porRenglon), enFila = k % porRenglon;
      const cx = 6 + p.ci * colW + colW / 2, ancho0 = Math.min(porRenglon, p.n) * paso;
      const y = p.li === 0 ? ejePos - 13 - (fila + 1) * paso : ejePos + 13 + fila * paso;
      return [cx - ancho0 / 2 + enFila * paso, y];
    }
    const col = Math.floor(k / filasPorRenglon), fila = k % filasPorRenglon;
    const top = 26 + p.ci * altoRenglon + 6;
    const x = p.li === 0 ? ejePos - 29 - (col + 1) * paso : ejePos + 29 + col * paso;
    return [x, top + fila * paso];
  };

  let orden = 0;
  const grupos = pilas.map((p) => {
    const capa = document.createElementNS(NS, "g");
    capa.setAttribute("pointer-events", "none");
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let k = 0; k < p.n; k++) {
      const [x, y] = posicion(p, k);
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", r1(x)); r.setAttribute("y", r1(y));
      r.setAttribute("width", r1(u)); r.setAttribute("height", r1(u)); r.setAttribute("rx", r1(Math.min(2.5, u * 0.18)));
      if (p.parcial) { r.setAttribute("fill", "none"); r.setAttribute("stroke", p.tono); r.setAttribute("stroke-width", "1.3"); }
      else { r.setAttribute("fill", p.tono); if (conResalte && k >= p.nr) r.setAttribute("fill-opacity", "0.3"); }
      r.setAttribute("class", "unidad-entra");
      r.style.setProperty("--i", String(Math.round((600 * orden++) / Math.max(1, N))));
      capa.appendChild(r);
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + u); y1 = Math.max(y1, y + u);
    }
    if (!p.n) {
      const [x, y] = posicion(p, 0);
      x0 = x; y0 = y; x1 = x + u; y1 = y + u;
    }
    // Cifra al final de la pila, en el color del lado.
    const tinta = tintaLegible(p.tono, 4.5);
    const texto = p.v ? entero(p.v) : "Sin dato";
    let cifra;
    if (vertical) {
      const cx = 6 + p.ci * colW + colW / 2;
      cifra = svg`<text x=${r1(cx)} y=${r1(p.li === 0 ? y0 - 7 : y1 + fCifra + 3)} text-anchor="middle" font-size=${fCifra} font-weight="800" fill=${tinta}>${texto}</text>`;
    } else {
      const cy = (y0 + y1) / 2 + 4;
      cifra = svg`<text x=${r1(p.li === 0 ? x0 - 5 : x1 + 5)} y=${r1(cy)} text-anchor=${p.li === 0 ? "end" : "start"} font-size=${fCifra} font-weight="800" fill=${tinta}>${texto}</text>`;
    }
    const zona = svg`<rect class="ue-zona" x=${r1(x0 - 3)} y=${r1(y0 - 3)} width=${r1(x1 - x0 + 6)} height=${r1(y1 - y0 + 6)} rx="4" fill="transparent" />`;
    const nodo = svg`<g class="marca-viva ue-pila" tabindex="0">${zona}${capa}${cifra}</g>`;
    if (g) {
      const dato = {...(p.d ?? {}), _categoria: p.c, _lado: p.l, figuras: p.n, unidad: K, otro: p.otro, resaltadas: conResalte && p.d ? resaltado(p.d) : null, _sinDato: !p.d};
      const r = g.renglones(dato);
      nodo.setAttribute("role", "img");
      nodo.setAttribute("aria-label", textoGlobo(r));
      const abrir = (x, y) => mostrarGlobo(g.html(dato), x, y);
      nodo.addEventListener("pointerenter", (e) => abrir(e.clientX, e.clientY));
      nodo.addEventListener("pointermove", (e) => abrir(e.clientX, e.clientY));
      nodo.addEventListener("pointerleave", ocultarGlobo);
      nodo.addEventListener("focus", () => { const c = nodo.getBoundingClientRect(); abrir(c.left + c.width / 2, c.top + c.height / 2); });
      nodo.addEventListener("blur", ocultarGlobo);
    }
    return nodo;
  });

  // Eje, rótulos de categoría y nombre de cada lado.
  const tintaLado = lados.map((l) => tintaLegible(color(l), 4.5));
  let eje;
  if (vertical) {
    eje = svg`<g aria-hidden="true">
      <line x1="0" x2=${W} y1=${ejePos} y2=${ejePos} stroke=${P.regla} stroke-width="1.2" />
      ${categorias.map((c, i) => svg`<text x=${r1(6 + i * colW + colW / 2)} y=${ejePos + 4.5} text-anchor="middle" font-size=${TIPO.ejes - 1} font-weight="600" fill=${P.tinta2} paint-order="stroke" stroke=${P.fondo} stroke-width="6">${rotulo(c)}</text>`)}
      <text x="6" y="16" font-size=${TIPO.ejes + 1} font-weight="800" fill=${tintaLado[0]}>↑ ${lados[0]}</text>
      <text x="6" y=${H - 8} font-size=${TIPO.ejes + 1} font-weight="800" fill=${tintaLado[1]}>↓ ${lados[1]}</text>
    </g>`;
  } else {
    eje = svg`<g aria-hidden="true">
      <line x1=${ejePos - 26} x2=${ejePos - 26} y1="22" y2=${H} stroke=${P.regla} />
      <line x1=${ejePos + 26} x2=${ejePos + 26} y1="22" y2=${H} stroke=${P.regla} />
      ${categorias.map((c, i) => svg`<text x=${ejePos} y=${r1(26 + i * altoRenglon + altoRenglon / 2 + 2)} text-anchor="middle" font-size="11" font-weight="600" fill=${P.tinta2}>${rotulo(c)}</text>`)}
      <text x=${ejePos - 30} y="14" text-anchor="end" font-size=${TIPO.ejes} font-weight="800" fill=${tintaLado[0]}>← ${lados[0]}</text>
      <text x=${ejePos + 30} y="14" text-anchor="start" font-size=${TIPO.ejes} font-weight="800" fill=${tintaLado[1]}>${lados[1]} →</text>
    </g>`;
  }
  const descripcion = `Unidades en espejo: ${lados[0]} ${vertical ? "arriba" : "a la izquierda"} y ${lados[1]} ${vertical ? "abajo" : "a la derecha"}, por ${categorias.length} categorías. ${textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular})}. ` +
    lados.map((l) => `${l}: ${entero(pilas.filter((p) => p.l === l).reduce((s, p) => s + p.v, 0))} ${nombreUnidad}`).join("; ") + ".";
  const dibujo = svg`<svg class="unidades-espejo" role="group" aria-label=${descripcion} width=${W} height=${Math.ceil(H)} viewBox="0 0 ${W} ${Math.ceil(H)}" style="max-width:100%;height:auto;font-family:var(--sans-serif);overflow:visible">${eje}${grupos}</svg>`;
  const parcial = pilas.some((p) => p.parcial);
  const leyenda = leyendaItems([
    ...lados.map((l) => ({tipo: "cuadro", color: color(l), texto: conResalte ? `${l}: ${nombreResaltado} en color pleno, el resto tenue` : l})),
    ...(parcial ? [{tipo: "hueco", color: P.tinta2, texto: `Cuadro en contorno: menos de ${entero(K)} ${nombreUnidad}`}] : []),
  ]);
  const nodo = html`<div class="forma"><div class="forma-leyendas">${leyenda}<div class="leyenda-items"><span class="leyenda-item"><strong>${textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular}).replace("figura", "cuadro")}</strong></span></div></div>${dibujo}</div>`;
  nodo.unidad = K; nodo.figuras = N;
  nodo.resumen = pilas.map((p) => ({...(p.d ?? {}), _categoria: p.c, _lado: p.l, figuras: p.n, unidad: K, otro: p.otro, resaltadas: conResalte && p.d ? resaltado(p.d) : null}));
  return nodo;
}
