// formas/semitonos.js
// ¿Dónde se concentra una cantidad dentro del territorio? Mapa de semitonos:
// el territorio se cubre con una rejilla hexagonal regular y en cada
// hexágono va un punto cuyo ÁREA es la magnitud, como una trama de imprenta.
// No hay rellenos ni bordes que pesen: las concentraciones se ven como
// manchas oscuras y los vacíos como la trama clara del fondo.
// Los puntos de entrada son centroides ponderados (celdas, localidades o
// municipios con su cantidad). Con `area` la magnitud es una DENSIDAD
// (cantidad entre superficie), que no depende del tamaño del hexágono: por
// eso la escala es la misma al acercar el mapa, y la rejilla se recalcula a
// la escala de lo encuadrado. Sin `area`, es la suma de cada hexágono.
// La escala de tamaño tiene un tope FIJO (`tope`); lo que lo pasa se dibuja
// del tamaño máximo y la leyenda lo dice («300 o más»).
// No: tasas o porcentajes (coropleta), conteos que se quieren comparar
// lugar por lugar (picos) ni datos con menos puntos que hexágonos sin `area`.
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn, mostrarGlobo, ocultarGlobo} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {mapaBase} from "./mapa-base.js";
import {lienzo, rotulo, colocar, guia, anchoTexto} from "./anotaciones.js";

const R3 = Math.sqrt(3);
const r1 = (v) => Math.round(v * 10) / 10;
const KM_RADIAN = 6371;

// Hexágono (coordenadas axiales q, r; punta arriba) que contiene un punto de
// pantalla, para una rejilla cuyo paso entre centros es `s`.
function axial(x, y, s) {
  const R = s / R3;
  let q = ((R3 / 3) * x - y / 3) / R, r = ((2 / 3) * y) / R, z = -q - r;
  let rq = Math.round(q), rr = Math.round(r), rz = Math.round(z);
  const dq = Math.abs(rq - q), dr = Math.abs(rr - r), dz = Math.abs(rz - z);
  if (dq > dr && dq > dz) rq = -rr - rz; else if (dr > dz) rr = -rq - rz;
  return [rq, rr];
}
const centroHex = (q, r, s) => [s * (q + r / 2), s * (R3 / 2) * r];

// geo: FeatureCollection del territorio (la trama cubre sus polígonos).
// puntos: centroides ponderados. posicion(d): [longitud, latitud]. valor(d):
// la cantidad. area(d): superficie que representa el punto (km²); si se da,
// la magnitud es densidad. tope: magnitud del punto más grande (constante del
// capítulo, medida). encuadre(f): polígonos a los que se acerca el mapa.
// enFoco(d): false para lo que queda a la vista pero fuera de lo elegido.
// nombre(d): rótulo del lugar (el hexágono toma el de su punto de más peso).
// formato(v): texto de la magnitud. paso: distancia entre centros, en px.
export function semitonos(geo, puntos, {
  ancho, posicion, valor, area = null, tope, encuadre = null, enFoco = null, nombre = () => "", paso = null, anotar = null,
  formato = (v) => entero(v), formatoLeyenda = null, unidadMagnitud = "", tituloLeyenda = "Tamaño del punto", marcasLeyenda = null, globo: g,
}) {
  const fLeyenda = formatoLeyenda ?? formato;
  if (!(tope > 0)) throw new Error("semitonos(): falta `tope`, la magnitud fija del punto más grande.");
  const angosto = ancho < 520;
  const mapa = mapaBase(geo, {ancho, encuadre, margen: angosto ? 4 : 8, relleno: () => "none", borde: () => P.rejilla, grosor: () => 0.6});
  const {W, H} = mapa;
  const s = paso ?? (angosto ? 6.5 : Math.max(7.5, Math.min(10, W / 100)));
  const R = s / R3;

  // Máscara del territorio: los polígonos pintados en un lienzo del tamaño
  // del mapa. Un hexágono es de tierra si su centro cae en la máscara.
  const lienzo2d = document.createElement("canvas");
  lienzo2d.width = W; lienzo2d.height = H;
  const ctx = lienzo2d.getContext("2d", {willReadFrequently: true});
  ctx.fillStyle = P.tinta;
  ctx.beginPath(); d3.geoPath(mapa.proyeccion, ctx)(geo); ctx.fill();
  const mascara = ctx.getImageData(0, 0, W, H).data;
  const esTierra = (x, y) => { const i = Math.round(y) * W + Math.round(x); return x >= 0 && y >= 0 && x < W && y < H && mascara[4 * i + 3] > 100; };

  // Puntos proyectados y agregados por hexágono (suma del valor y del área).
  const proyectados = [];
  const bins = new Map();
  for (const d of puntos) {
    const v = valor(d);
    if (v == null) continue;
    const p = mapa.proyeccion(posicion(d));
    if (!p || p[0] < -s || p[1] < -s || p[0] > W + s || p[1] > H + s) continue;
    const m = {d, x: p[0], y: p[1], v, a: area ? area(d) : null, foco: enFoco ? Boolean(enFoco(d)) : true};
    proyectados.push(m);
    const [q, r] = axial(m.x, m.y, s), k = `${q},${r}`;
    const b = bins.get(k) ?? {v: 0, a: 0, n: 0, mayor: null, foco: false};
    b.v += m.v; b.a += m.a ?? 0; b.n++; b.foco ||= m.foco;
    if (!b.mayor || m.v > b.mayor.v) b.mayor = m;
    bins.set(k, b);
  }
  if (!proyectados.length) return vacio();
  const delaunay = d3.Delaunay.from(proyectados, (m) => m.x, (m) => m.y);
  // Densidad en un punto sin centroide propio: ponderada por distancia entre
  // el centroide más cercano y sus vecinos (así la trama no sale en parches
  // cuando el hexágono es más chico que la celda de origen).
  const densidad = (m) => (m.a ? m.v / m.a : m.v);
  const interpolar = (x, y) => {
    const i = delaunay.find(x, y), cerca = proyectados[i];
    let suma = 0, pesos = 0;
    for (const j of [i, ...delaunay.neighbors(i)]) {
      const m = proyectados[j], w = 1 / (Math.hypot(m.x - x, m.y - y) ** 2 + 1);
      suma += w * densidad(m); pesos += w;
    }
    return {v: suma / pesos, cerca};
  };

  // Hexágonos de tierra a la vista, con su magnitud.
  const kmPorPx = (x, y) => {
    const a = mapa.proyeccion.invert([x, y]), b = mapa.proyeccion.invert([x + 1, y]);
    return a && b ? d3.geoDistance(a, b) * KM_RADIAN : null;
  };
  const areaHexPx = (R3 / 2) * s * s;
  const hexagonos = [];
  const filas = Math.ceil(H / (1.5 * R)) + 1;
  for (let r = 0; r <= filas; r++) {
    for (let q = -Math.ceil(r / 2) - 1; q <= Math.ceil(W / s) + 1 - Math.floor(r / 2); q++) {
      const [cx, cy] = centroHex(q, r, s);
      if (cx < s / 2 || cx > W - s / 2 || cy < s / 2 || cy > H - s / 2 || !esTierra(cx, cy)) continue;
      const b = bins.get(`${q},${r}`);
      let v = 0, cerca = b?.mayor ?? null, foco = b?.foco ?? false, estimado = false;
      if (b && (!area || b.a > 0)) v = area ? b.v / b.a : b.v;
      else if (area) { const t = interpolar(cx, cy); v = t.v; cerca = t.cerca; foco = t.cerca.foco; estimado = true; }
      else { const i = delaunay.find(cx, cy); cerca = proyectados[i]; foco = cerca.foco; }
      const km = kmPorPx(cx, cy) ?? 0, areaKm2 = areaHexPx * km * km;
      hexagonos.push({q, r, x: cx, y: cy, v, foco, estimado, n: b?.n ?? 0, areaKm2, cantidad: area ? v * areaKm2 : v, nombre: cerca ? nombre(cerca.d) : "", recortado: v > tope});
    }
  }
  if (!hexagonos.some((h) => h.foco && h.v > 0)) return vacio();
  const porClave = new Map(hexagonos.map((h) => [`${h.q},${h.r}`, h]));
  const rMax = 0.52 * s, radio = (v) => (v > 0 ? Math.max(0.45, rMax * Math.sqrt(Math.min(v, tope) / tope)) : 0);

  // Anotados: las concentraciones mayores de lo elegido, una por nombre y
  // separadas entre sí.
  const cuantos = anotar ?? (angosto ? 3 : 5), separacion = angosto ? 48 : 80;
  const anotados = [];
  for (const h of d3.sort(hexagonos.filter((h) => h.foco && h.v > 0), (h) => -h.v)) {
    if (anotados.length >= cuantos) break;
    if (anotados.some((a) => a.nombre === h.nombre || Math.hypot(a.x - h.x, a.y - h.y) < separacion)) continue;
    anotados.push(h);
  }
  const conNota = new Set(anotados);

  // Trama del fondo en UNA sola pieza (un trazo con todos los círculos) y un
  // punto por hexágono con magnitud. Los anotados son enfocables.
  const rFondo = 0.36 * s;
  const fondoD = hexagonos.map((h) => `M${r1(h.x - rFondo)},${r1(h.y)}a${r1(rFondo)},${r1(rFondo)} 0 1,0 ${r1(2 * rFondo)},0a${r1(rFondo)},${r1(rFondo)} 0 1,0 ${r1(-2 * rFondo)},0`).join("");
  const puntosSvg = hexagonos.filter((h) => h.v > 0).map((h) => {
    const nodo = svg`<circle class=${`st-punto${conNota.has(h) ? " marca-viva" : ""}`} tabindex=${conNota.has(h) ? 0 : null} style=${`--i:${Math.round(h.x / W * 32)}`}
      cx=${r1(h.x)} cy=${r1(h.y)} r=${r1(radio(h.v))} fill=${h.foco ? P.serie : P.contexto} />`;
    if (g && conNota.has(h)) globoEn(nodo, g, h);
    return nodo;
  });
  const tam = angosto ? 11.5 : TIPO.valor;
  const etiquetas = anotados.map((h) => {
    const renglones = [{texto: h.nombre, peso: 700}, {texto: formato(h.v), color: P.tinta2}];
    return {x: h.x, y: h.y, w: Math.max(...renglones.map((t) => anchoTexto(t.texto, tam, t.peso ?? 400))), h: 2 * tam * 1.22 + 3, renglones, separacion: 14};
  });
  const notas = colocar(etiquetas, {ancho: W, alto: H, obstaculos: anotados.map((h) => [h.x - rMax, h.y - rMax, h.x + rMax, h.y + rMax])}).filter((e) => e.cabe).map((e) => svg`<g>
    ${guia(e.x, e.y, e.caja)}
    <circle cx=${r1(e.x)} cy=${r1(e.y)} r=${r1(rMax + 1.6)} fill="none" stroke=${P.tinta} stroke-width="1.1" />
    ${rotulo(e.tx, e.caja[1] + tam, e.renglones, {ancla: e.ancla, tam})}
  </g>`);

  // Anillo que sigue al puntero: marca el hexágono cuyo globo está abierto.
  const anillo = svg`<circle class="st-anillo" r=${r1(rMax + 1.4)} cx="-20" cy="-20" fill="none" stroke=${P.tinta} stroke-width="1.6" pointer-events="none" visibility="hidden" />`;
  const mayor = anotados[0];
  const enVista = hexagonos.filter((h) => h.foco);
  const dibujo = lienzo({
    clase: "semitonos", ancho: W, alto: H,
    etiqueta: `Mapa de semitonos con ${entero(enVista.length)} hexágonos. El tamaño de cada punto es ${tituloLeyenda.toLowerCase()}.${mayor ? ` La concentración mayor está en ${mayor.nombre}: ${formato(mayor.v)}.` : ""}`,
  }, mapa.capa, svg`<path class="st-trama" d=${fondoD} fill=${P.rejilla} aria-hidden="true" pointer-events="none" />`,
  svg`<g class="st-puntos">${puntosSvg}</g>`, svg`<g aria-hidden="true" pointer-events="none">${notas}</g>`, anillo);

  // Un solo puntero para toda la trama: el hexágono bajo el cursor se
  // encuentra por aritmética (sin recorrer los puntos) y abre su globo.
  if (g) {
    const aLienzo = (e) => {
      const m = dibujo.getScreenCTM();
      if (!m) return null;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return porClave.get(axial(p.x, p.y, s).join(","));
    };
    dibujo.addEventListener("pointermove", (e) => {
      const h = aLienzo(e);
      if (!h) { anillo.setAttribute("visibility", "hidden"); return ocultarGlobo(); }
      anillo.setAttribute("cx", r1(h.x)); anillo.setAttribute("cy", r1(h.y)); anillo.setAttribute("visibility", "visible");
      mostrarGlobo(g.html(h), e.clientX, e.clientY);
    });
    dibujo.addEventListener("pointerleave", () => { anillo.setAttribute("visibility", "hidden"); ocultarGlobo(); });
  }

  // Leyenda de tamaño fuera del lienzo: la trama con puntos de muestra.
  const muestras = (marcasLeyenda ?? d3.ticks(0, tope, 3).filter((v) => v > 0)).slice(0, 5);
  const pasoL = Math.max(46, ...muestras.map((v) => anchoTexto(`${fLeyenda(v)} o más`, 11) + 10));
  const rL = Math.max(rMax, 6.5), escalaL = rL / rMax;
  const anchoL = muestras.length * pasoL + 4, altoL = 2 * rL + 22;
  const leyendaSvg = svg`<svg width=${anchoL} height=${altoL} viewBox="0 0 ${anchoL} ${altoL}" aria-hidden="true">
    ${muestras.map((v, i) => {
      const x = pasoL / 2 + i * pasoL, y = rL + 2;
      return svg`<g><circle cx=${x} cy=${y} r=${r1(rFondo * escalaL)} fill=${P.rejilla} /><circle cx=${x} cy=${y} r=${r1(radio(v) * escalaL)} fill=${P.serie} />
        <text x=${x} y=${altoL - 3} font-size="11" text-anchor="middle" fill=${P.tinta2}>${fLeyenda(v)}${v >= tope ? " o más" : ""}</text></g>`;
    })}
  </svg>`;
  const kmCentro = kmPorPx(W / 2, H / 2) ?? 0;
  const areaTipica = areaHexPx * kmCentro * kmCentro;
  const redondo = (v) => +v.toPrecision(2);
  const leyenda = html`<div class="forma-leyendas st-leyenda" role="img" aria-label=${`${tituloLeyenda}: el área del punto crece con la magnitud, de ${fLeyenda(muestras[0])} a ${fLeyenda(muestras.at(-1))} o más.`}>
    <span class="st-leyenda-titulo">${tituloLeyenda}${unidadMagnitud ? `, ${unidadMagnitud}` : ""}</span>
    ${leyendaSvg}
    <span class="st-leyenda-nota">${area ? `Cada punto es un hexágono de unos ${entero(redondo(areaTipica))} km²` : "Cada punto es la suma de un hexágono"}${hexagonos.some((h) => !h.foco) ? "; fuera de lo elegido, en gris" : ""}</span>
  </div>`;
  const nodo = html`<div class="forma forma-semitonos">${leyenda}${dibujo}</div>`;
  nodo.anotados = anotados;
  nodo.hexagonos = enVista.length;
  nodo.recortados = enVista.filter((h) => h.recortado).length;
  nodo.areaHex = areaTipica;
  return nodo;
}
