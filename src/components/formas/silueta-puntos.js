// formas/silueta-puntos.js
// ¿Cómo se reparte un total contable entre categorías? Silueta rellena de
// puntos: una forma con significado para la sección (por omisión, el contorno
// del territorio) se llena con una rejilla de puntos en la que cada punto
// vale N personas, y los puntos se ordenan en franjas de color por categoría,
// de izquierda a derecha o por bandas. Debajo, una regla graduada rotula cada
// franja con su nombre y su cifra, alineada con sus bordes. Se lee como una
// barra apilada (las franjas son contiguas) y a la vez como una imagen.
// N se elige para que queden entre 400 y 2,500 puntos, se redondea a 1, 2 o 5
// por una potencia de 10 y se dice en la leyenda. La POSICIÓN de una franja
// dentro de la silueta no dice dónde vive nadie: solo el orden de las
// categorías; la explicación de la sección lo tiene que decir.
// No: más de cinco o seis categorías (las franjas se vuelven hilos), una
// categoría menor a un punto sin rotularla, ni una silueta que solo adorna.
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero, pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO, azarEstable} from "./comun.js";
import {proyectar} from "./mapa-base.js";
import {rebobinar} from "./mapa-plano.js";
import {proyeccionMx} from "../geografia.js";
import {tamanoUnidad, textoUnidad, leyendaFiguras} from "./unidad.js";
import {anchoTexto, partir} from "./anotaciones.js";

const NS = "http://www.w3.org/2000/svg";
const R3 = Math.sqrt(3);
const r1 = (v) => Math.round(v * 10) / 10;

// Puntos de una rejilla hexagonal de paso `s` que caen dentro de la máscara.
function rejilla(s, W, H, dentro) {
  const dy = s * R3 / 2, puntos = [];
  for (let j = 0, y = dy / 2; y < H; j++, y += dy) {
    for (let i = 0, x = (j & 1 ? s : s / 2); x < W; i++, x += s) if (dentro(x, y)) puntos.push({x, y, i, j});
  }
  return puntos;
}

// Unidad: cuántas personas vale cada punto, para que queden entre `minimo`
// y `tope` puntos (redondeada a 1, 2 o 5 por una potencia de 10).
export function unidadSilueta(total, {tope = 2500, minimo = 400} = {}) {
  let k = tamanoUnidad(total, {tope});
  while (k > 1 && total / k < minimo) {
    const p = 10 ** Math.floor(Math.log10(k) + 1e-9), m = Math.round(k / p);
    const menor = m === 1 ? 5 * p / 10 : m === 2 ? p : 2 * p;
    if (total / menor > tope) break;
    k = menor;
  }
  return k;
}

// silueta: GeoJSON (FeatureCollection o Feature; por omisión se proyecta con
// la proyección del libro) o una figura propia {d, ancho, alto} con su trazo
// SVG en sus propias coordenadas. datos: una fila por categoría. categoria(d)
// nombre, valor(d) personas, color(d) color de su franja (la categoría de
// interés en el rojo del capítulo, el resto en neutros o en la paleta de
// identidad). orden: nombres de las categorías en el orden de las franjas.
// direccion: "x" (franjas de izquierda a derecha) o "y" (bandas de arriba
// abajo). unidad: personas por punto (si no se da, se elige sola).
export function siluetaPuntos(silueta, datos, {
  ancho, categoria, valor, color, orden = null, direccion = "x", unidad = null, tope = 2500, minimo = 400, proyeccion = proyeccionMx,
  nombreUnidad = "personas", unidadSingular = "persona", cifra = null, altoMax = 560, globo: g,
}) {
  const filas = (orden ? orden.map((n) => datos.find((d) => categoria(d) === n)).filter(Boolean) : datos).filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const total = d3.sum(filas, valor);
  const K = unidad ?? unidadSilueta(total, {tope, minimo});
  const grupos = filas.map((d) => {
    const v = valor(d), n = Math.round(v / K);
    return {d, v, nombre: String(categoria(d)), tono: color(d), n: Math.max(1, n), parcial: n === 0};
  });
  const N = d3.sum(grupos, (b) => b.n);
  const angosto = ancho < 520;

  // ---- 1. La silueta en pantalla y su máscara.
  const W = Math.min(ancho, 980);
  const Hcaja = Math.round(Math.max(220, Math.min(altoMax, W * 0.62)));
  const lienzo2d = document.createElement("canvas");
  let H, pintar;
  if (silueta?.d) {
    const e = Math.min(W / silueta.ancho, Hcaja / silueta.alto);
    H = Math.ceil(silueta.alto * e);
    const camino = new Path2D(silueta.d);
    pintar = (ctx) => { ctx.setTransform(e, 0, 0, e, (W - silueta.ancho * e) / 2, 0); ctx.fill(camino); ctx.setTransform(1, 0, 0, 1, 0, 0); };
  } else {
    const geo = silueta.type === "Feature" ? {type: "FeatureCollection", features: [silueta]} : silueta;
    rebobinar(geo);
    const p = proyectar(proyeccion(geo), W, Hcaja, 4);
    const [[, y0], [, y1]] = d3.geoPath(p).bounds(geo);
    p.translate([p.translate()[0], p.translate()[1] - y0 + 4]);
    H = Math.ceil(y1 - y0 + 8);
    pintar = (ctx) => { ctx.beginPath(); d3.geoPath(p, ctx)(geo); ctx.fill(); };
  }
  lienzo2d.width = W; lienzo2d.height = H;
  const ctx = lienzo2d.getContext("2d", {willReadFrequently: true});
  ctx.fillStyle = P.tinta;
  pintar(ctx);
  const mascara = ctx.getImageData(0, 0, W, H).data;
  const dentro = (x, y) => mascara[4 * (Math.round(y) * W + Math.round(x)) + 3] > 127;

  // ---- 2. Paso de la rejilla: el mayor que todavía deja N puntos o más.
  let lo = 1, hi = Math.max(W, H) / 4;
  for (let k = 0; k < 28; k++) { const mid = (lo + hi) / 2; if (rejilla(mid, W, H, dentro).length >= N) lo = mid; else hi = mid; }
  const s = lo;
  let puntos = rejilla(s, W, H, dentro);
  // Sobran unos cuantos: se quitan del borde (los que tienen menos vecinos
  // dentro), repartidos con un azar estable para que no se note el recorte.
  if (puntos.length > N) {
    const llave = new Set(puntos.map((p) => `${p.i},${p.j}`));
    const vecinos = (p) => {
      const imp = p.j & 1, cols = [[p.i - 1, p.j], [p.i + 1, p.j], [p.i - 1 + imp, p.j - 1], [p.i + imp, p.j - 1], [p.i - 1 + imp, p.j + 1], [p.i + imp, p.j + 1]];
      return cols.filter(([a, b]) => llave.has(`${a},${b}`)).length;
    };
    const fuera = new Set(d3.sort(puntos, (p) => vecinos(p), (p) => azarEstable(`${p.i},${p.j}`)).slice(0, puntos.length - N));
    puntos = puntos.filter((p) => !fuera.has(p));
  }
  if (!puntos.length) return vacio();

  // ---- 3. Franjas: los puntos se ordenan por x (o por y) y se reparten en
  // cortes acumulados, una categoría tras otra.
  const enX = direccion !== "y";
  puntos.sort(enX ? (a, b) => a.x - b.x || a.y - b.y : (a, b) => a.y - b.y || a.x - b.x);
  let k0 = 0;
  for (const b of grupos) { b.puntos = puntos.slice(k0, k0 + b.n); k0 += b.n; }
  const r = Math.max(0.9, 0.4 * s);
  for (const b of grupos) {
    b.x0 = d3.min(b.puntos, (p) => p.x) - r; b.x1 = d3.max(b.puntos, (p) => p.x) + r;
    b.y0 = d3.min(b.puntos, (p) => p.y) - r; b.y1 = d3.max(b.puntos, (p) => p.y) + r;
  }

  // ---- 4. Regla graduada con el nombre y la cifra de cada franja.
  const tam = angosto ? 11.5 : TIPO.valor, renglon = tam * 1.25;
  const textoCifra = (b) => (cifra ? cifra(b.d, total) : `${entero(b.v)}`);
  const anchoMax = angosto ? 15 : 22;
  for (const b of grupos) {
    b.renglones = [...partir(b.nombre, anchoMax).map((t) => ({texto: t, peso: 700})), {texto: textoCifra(b), peso: 400}];
    b.w = Math.max(...b.renglones.map((t) => anchoTexto(t.texto, tam, t.peso)));
  }
  let regla, altoTotal, anchoTotal = W;
  if (enX) {
    const yRegla = H + 10;
    // Rótulos centrados en su tramo; el que choca con el de su izquierda baja
    // de renglón (como en la referencia), con una línea hasta la regla.
    const niveles = [];
    for (const b of grupos) {
      const cx = (Math.max(b.x0, 0) + Math.min(b.x1, W)) / 2;
      b.lx = Math.max(b.w / 2, Math.min(W - b.w / 2, cx));
      let n = 0;
      while ((niveles[n] ?? -Infinity) > b.lx - b.w / 2 - 12) n++;
      niveles[n] = b.lx + b.w / 2;
      b.nivel = n; b.cx = cx;
    }
    const altoRotulo = Math.max(...grupos.map((b) => b.renglones.length)) * renglon + 8;
    regla = grupos.map((b) => {
      const yt = yRegla + 12 + b.nivel * altoRotulo;
      return svg`<g aria-hidden="true">
        <line x1=${r1(b.x0 + 1.5)} x2=${r1(Math.max(b.x0 + 3, b.x1 - 1.5))} y1=${yRegla} y2=${yRegla} stroke=${b.tono} stroke-width="4" stroke-linecap="round" />
        <line x1=${r1(b.cx)} x2=${r1(b.cx)} y1=${yRegla + 3} y2=${yt - 2} stroke=${P.regla} stroke-width="0.9" />
        <text x=${r1(b.lx)} y=${yt + tam} text-anchor="middle" font-size=${tam} fill=${P.tinta}>${b.renglones.map((t, i) => svg`<tspan x=${r1(b.lx)} dy=${i ? renglon : 0} font-weight=${t.peso} fill=${t.peso === 400 ? P.tinta2 : P.tinta}>${t.texto}</tspan>`)}</text>
      </g>`;
    });
    altoTotal = yRegla + 12 + (d3.max(grupos, (b) => b.nivel) + 1) * altoRotulo;
  } else {
    // Bandas: la regla va vertical a la derecha y los rótulos a su lado.
    const xRegla = d3.max(puntos, (p) => p.x) + r + 10;
    const items = grupos.map((b) => ({b, pos: (b.y0 + b.y1) / 2, tam: b.renglones.length * renglon + 4}));
    let previo = -Infinity;
    for (const it of items) { it.lugar = Math.max(it.pos, previo + it.tam); previo = it.lugar; }
    const anchoRot = d3.max(grupos, (b) => b.w);
    anchoTotal = Math.max(W, xRegla + 22 + anchoRot);
    regla = items.map(({b, lugar, tam: alto}) => svg`<g aria-hidden="true">
      <line x1=${r1(xRegla)} x2=${r1(xRegla)} y1=${r1(b.y0 + 1.5)} y2=${r1(Math.max(b.y0 + 3, b.y1 - 1.5))} stroke=${b.tono} stroke-width="4" stroke-linecap="round" />
      <line x1=${r1(xRegla + 3)} x2=${r1(xRegla + 16)} y1=${r1((b.y0 + b.y1) / 2)} y2=${r1(lugar - alto / 2 + tam * 0.6)} stroke=${P.regla} stroke-width="0.9" />
      <text x=${r1(xRegla + 20)} y=${r1(lugar - alto / 2 + tam)} font-size=${tam}>${b.renglones.map((t, i) => svg`<tspan x=${r1(xRegla + 20)} dy=${i ? renglon : 0} font-weight=${t.peso} fill=${t.peso === 400 ? P.tinta2 : P.tinta}>${t.texto}</tspan>`)}</text>
    </g>`);
    altoTotal = Math.max(H, d3.max(items, (it) => it.lugar + it.tam / 2) + 4);
  }

  // ---- 5. Dibujo: una franja por categoría, enfocable, con su globo. Los
  // puntos se crean con el DOM (hasta 2,500 por gráfica).
  const franjas = grupos.map((b, i) => {
    const capa = document.createElementNS(NS, "g");
    for (const p of b.puntos) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", r1(p.x)); c.setAttribute("cy", r1(p.y)); c.setAttribute("r", r1(r));
      if (b.parcial) { c.setAttribute("fill", "none"); c.setAttribute("stroke", b.tono); c.setAttribute("stroke-width", "1.2"); }
      else c.setAttribute("fill", b.tono);
      c.setAttribute("class", "sp-punto");
      c.style.setProperty("--i", String(Math.round((enX ? p.x / W : p.y / H) * 30)));
      capa.appendChild(c);
    }
    const zona = enX
      ? svg`<rect class="sp-zona" x=${r1(b.x0)} y="0" width=${r1(Math.max(2, b.x1 - b.x0))} height=${H} fill="transparent" />`
      : svg`<rect class="sp-zona" x="0" y=${r1(b.y0)} width=${W} height=${r1(Math.max(2, b.y1 - b.y0))} fill="transparent" />`;
    const nodo = svg`<g class="marca-viva sp-franja" tabindex="0" style=${`--k:${i}`}>${zona}${capa}</g>`;
    if (g) globoEn(nodo, g, {...b.d, total, puntos: b.n, unidad: K});
    return nodo;
  });
  const descripcion = `Silueta rellena de ${entero(N)} puntos. ${textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular, glifo: "punto"})}. ${grupos.map((b) => `${b.nombre}: ${entero(b.v)} ${nombreUnidad}, ${pct(100 * b.v / total)}`).join(". ")}.`;
  const dibujo = svg`<svg class="silueta-puntos" role="group" aria-label=${descripcion} width=${anchoTotal} height=${Math.ceil(altoTotal)} viewBox="0 0 ${anchoTotal} ${Math.ceil(altoTotal)}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <g class="sp-franjas">${franjas}</g>${regla}
  </svg>`;
  const parcial = grupos.find((b) => b.parcial);
  const nodo = html`<div class="forma forma-silueta">${leyendaFiguras([
    {color: P.tinta2, glifo: "punto", texto: textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular, glifo: "punto"})},
    parcial ? {color: parcial.tono, glifo: "punto", contorno: true, texto: `Punto hueco: menos de ${entero(K)} ${nombreUnidad}`} : null,
    {texto: `${entero(total)} ${nombreUnidad} en total`},
  ])}${dibujo}</div>`;
  nodo.unidad = K; nodo.puntos = N;
  nodo.resumen = grupos.map((b) => ({...b.d, total, puntos: b.n, unidad: K}));
  return nodo;
}
