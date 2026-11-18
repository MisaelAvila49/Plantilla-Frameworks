// formas/burbujas.js
// ¿Cuántos hay en cada lugar? Mapa de burbujas: un círculo en el centro de
// cada entidad cuya ÁREA es su conteo (personas), en el tono de tema y con
// escala FIJA: el mismo número mide lo mismo con cualquier año, sexo o
// encuadre. Las burbujas más grandes van abajo para que las chicas se vean.
// La región encuadra: al elegirla, el mapa se acerca y solo sus entidades
// llevan burbuja. Una entidad sin dato va en el gris de «Sin dato».
// No: tasas (coropleta); con muchos lugares pegados (mosaico de burbujas).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {ISO_A_CVE, POR_CVE} from "../geografia.js";
import {vacio, leyendaItems} from "./comun.js";
import {mapaBase} from "./mapa-base.js";
import {rotulo, colocar, anchoTexto} from "./anotaciones.js";

const r1 = (v) => Math.round(v * 10) / 10;

// geo: entidades. valores: Map de clave al dato. valor(d): el conteo.
// tope: conteo FIJO del círculo mayor (radio máximo). encuadre: claves de la
// región o null. formato(v): cifra de los rótulos. globo: de cada burbuja.
export function burbujas(geo, valores, {ancho, valor, tope, encuadre = null, formato = entero, unidad = "personas", clave = (f) => ISO_A_CVE.get(f.properties.id), anotar = 5, globo: g = null}) {
  const dentro = (k) => !encuadre || encuadre.includes(k);
  const conDato = geo.features.filter((f) => dentro(clave(f)) && valores.get(clave(f)) != null && valor(valores.get(clave(f))) != null);
  if (!conDato.length) return vacio();
  const mapa = mapaBase(geo, {
    ancho, encuadre: encuadre ? (f) => dentro(clave(f)) : null,
    relleno: (f) => (!dentro(clave(f)) ? P.fondo3 : valores.get(clave(f)) == null ? P.sinDato : P.fondo2),
    borde: (f) => (dentro(clave(f)) ? P.bordeFuerte : P.borde), grosor: () => 0.5,
  });
  const W = mapa.W, H = mapa.H, angosto = W < 560;
  // El radio máximo depende del ancho del lienzo y NO del encuadre: el mismo
  // número mide lo mismo en el país y en una región.
  const rMax = Math.max(16, Math.min(40, W * 0.05));
  const radio = (v) => Math.sqrt(Math.max(0, Math.min(v, tope)) / tope) * rMax;
  const puntos = d3.sort(conDato.map((f) => {
    const d = valores.get(clave(f)), [x, y] = mapa.centro(f);
    return {f, d, k: clave(f), x, y, v: valor(d), r: radio(valor(d))};
  }), (p) => -p.v);
  const circulos = puntos.map((p, i) => {
    const nodo = svg`<circle class="marca-viva gE-burbuja" tabindex="0" style=${`--i:${i}`} cx=${r1(p.x)} cy=${r1(p.y)} r=${r1(Math.max(1.5, p.r))} fill=${P.serie} fill-opacity="0.5" stroke=${P.serie} stroke-width="1.1" />`;
    if (g) globoEn(nodo, g, p.d);
    return nodo;
  });
  // Rótulos de las burbujas mayores, sin encimarse.
  const tam = angosto ? 11 : 12;
  const etiquetas = puntos.slice(0, angosto ? Math.min(3, anotar) : anotar).map((p) => {
    const renglones = [{texto: POR_CVE.get(p.k)?.[angosto ? "corto" : "nombre"] ?? p.k, peso: 700}, {texto: formato(p.v), color: P.tinta2}];
    const w = Math.max(...renglones.map((r) => anchoTexto(r.texto, tam, r.peso ?? 400))), h = 2 * tam * 1.22 + 2;
    return {x: p.x, y: p.y, w, h, renglones, separacion: p.r + 4};
  });
  const textos = colocar(etiquetas, {ancho: W, alto: H}).filter((e) => e.cabe).map((e) => rotulo(e.tx, e.caja[1] + tam, e.renglones, {ancla: e.ancla, tam}));
  const etiqueta = `Mapa de burbujas: ${puntos.length} entidades. La mayor, ${POR_CVE.get(puntos[0].k)?.nombre}, con ${formato(puntos[0].v)} ${unidad}.`;
  const dibujo = svg`<svg class="gE-burbujas" width=${W} height=${H} viewBox="0 0 ${W} ${H}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    ${mapa.capa}<g>${circulos}</g><g aria-hidden="true" pointer-events="none">${textos}</g>
  </svg>`;
  // Leyenda de tamaños con la escala fija, y la casilla «Sin dato» si hace falta.
  const refs = [tope / 10, tope / 2, tope];
  const rMaxRef = radio(tope);
  const tamanos = svg`<svg width=${2 * rMaxRef + 80} height=${2 * rMaxRef + 12} aria-hidden="true">
    ${refs.map((v) => svg`<circle cx=${rMaxRef + 1} cy=${2 * rMaxRef + 10 - radio(v)} r=${radio(v)} fill="none" stroke=${P.tinta2} stroke-width="0.9" />
      <line x1=${rMaxRef + 1} x2=${2 * rMaxRef + 10} y1=${2 * rMaxRef + 10 - 2 * radio(v)} y2=${2 * rMaxRef + 10 - 2 * radio(v)} stroke=${P.regla} stroke-width="0.7" />
      <text x=${2 * rMaxRef + 13} y=${2 * rMaxRef + 10 - 2 * radio(v)} dy="0.35em" font-size="11" fill=${P.tinta2}>${entero(v)}${v >= tope ? " o más" : ""}</text>`)}
  </svg>`;
  const haySinDato = geo.features.some((f) => dentro(clave(f)) && valores.get(clave(f)) == null);
  const leyenda = html`<div class="forma-leyendas">
    <span class="gE-tamanos"><span class="gE-leyenda-titulo">Área: ${unidad}</span>${tamanos}</span>
    ${haySinDato ? leyendaItems([{tipo: "cuadro", color: P.sinDato, texto: "Sin dato"}]) : ""}
  </div>`;
  const nodo = html`<div class="forma gE-forma-burbujas">${leyenda}${dibujo}</div>`;
  nodo.puntos = puntos;
  return nodo;
}
