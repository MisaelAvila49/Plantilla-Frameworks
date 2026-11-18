// formas/histograma-unidades.js
// ¿Cómo se reparten las personas a lo largo de una magnitud y dónde cae la
// mitad? Un histograma en el que cada pila está hecha de figuras: cada figura
// vale un número fijo de personas, así que el alto de la pila se puede contar.
// Una bandera marca la mediana y, si se pide, un grupo va en color sobre el
// resto en gris.
// No: una magnitud con menos de unas seis clases (ahí va la pila), ni
// porcentajes en el eje vertical: aquí lo que se apila son personas.
import {svg, html} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {nuevoId, simbolos, refGlifo, proporcionDe, usar, tamanoUnidad, unidadSiguiente, textoUnidad, leyendaFiguras, partir, azarSemilla} from "./unidad.js";

const acotar = (v, a, b) => Math.max(a, Math.min(b, v));

// datos: una fila por observación o por grupo ya contado. valor(d) es la
// magnitud del eje (edad, grados, porcentaje) y peso(d), cuántas personas
// representa la fila. `clase`: ancho de cada clase. `dominio`: [mínimo,
// máximo] FIJO del eje. `destacar(d)`: verdadero para el grupo que va en
// color; el resto queda en gris. `rotuloMediana(m)` y `notaMediana(m)`: textos
// de la bandera. `glifo`: "figura" o "punto" (unidades que no son personas).
// El dato del globo es la clase: {desde, hasta, personas, destacadas, figuras,
// unidad, total, totalDestacado}. El nodo trae `unidad`, `mediana` y `resumen`.
export function histogramaUnidades(datos, {ancho, valor, peso = () => 1, clase = 1, dominio = null, destacar = null,
  color = P.serie, colorResto = P.contexto, nombreDestacado = null, nombreResto = "El resto", unidad = null,
  nombreUnidad = "personas", unidadSingular = "persona", glifo = "figura", formatoX = entero, rotuloX = null,
  rotuloMediana = (m) => `Mediana: ${formatoX(m)}`, notaMediana = null, semilla = 31, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null && !Number.isNaN(+valor(d)) && peso(d) > 0);
  if (!filas.length) return vacio();
  const xs = filas.map((d) => +valor(d));
  const [a, b] = dominio ?? [Math.floor(Math.min(...xs) / clase) * clase, Math.floor(Math.max(...xs) / clase + 1) * clase];
  const nB = Math.max(1, Math.round((b - a) / clase));
  const cajas = Array.from({length: nB}, (_, i) => ({i, desde: a + i * clase, hasta: a + (i + 1) * clase, personas: 0, destacadas: 0}));
  let total = 0, totalDestacado = 0;
  for (const d of filas) {
    const c = cajas[acotar(Math.floor((+valor(d) - a) / clase), 0, nB - 1)], w = +peso(d);
    c.personas += w; total += w;
    if (destacar?.(d)) { c.destacadas += w; totalDestacado += w; }
  }
  // Mediana ponderada: el valor que deja la mitad de las personas a cada lado.
  let acumulado = 0, mediana = null;
  for (const d of [...filas].sort((p, q) => valor(p) - valor(q))) {
    acumulado += +peso(d);
    if (acumulado >= total / 2) { mediana = +valor(d); break; }
  }

  // ---- Tamaño de la unidad y de la figura: cada clase es un bloque de `c`
  // figuras de ancho. Si las pilas no caben en el alto, la unidad sube al
  // siguiente tamaño redondo antes que encoger la figura hasta no verse.
  const ml = 4, PW = ancho - 2 * ml, bw = PW / nB, hueco = Math.max(1.5, bw * 0.1);
  const altoMax = acotar(ancho * 0.48, 240, 380), prop = proporcionDe(glifo), aire = glifo === "punto" ? 1.1 : 1.05;
  let K = unidad ?? tamanoUnidad(total, {tope: ancho < 560 ? 450 : 1200});
  let c = 1, uw = 6, nMax = 0;
  for (let intento = 0; intento < 8; intento++) {
    for (const q of cajas) { q.figuras = Math.round(q.personas / K); q.figurasDestacadas = Math.min(q.figuras, Math.round(q.destacadas / K)); }
    nMax = Math.max(...cajas.map((q) => q.figuras));
    let cabe = false;
    for (c = 1; c <= 16; c++) {
      uw = Math.min(15, (bw - hueco) / c);
      if (Math.ceil(nMax / c) * uw * prop * aire <= altoMax) { cabe = true; break; }
      if ((bw - hueco) / (c + 1) < 4.2) break;
    }
    if (cabe || unidad != null) break;
    K = unidadSiguiente(K);
  }
  c = Math.min(c, 16); uw = Math.min(15, (bw - hueco) / c);
  const uh = uw * prop * aire, fw = uw * 0.9, fh = fw * prop;
  const rens = Math.max(1, Math.ceil(nMax / c));

  // ---- Bandera de la mediana: el texto va del lado con más espacio.
  const xm = ml + ((mediana - a) / (b - a)) * PW;
  const derecha = xm < ancho * 0.5, espacio = (derecha ? ancho - xm : xm) - 22;
  const titulo = rotuloMediana(mediana);
  const nota = notaMediana ? partir(notaMediana(mediana), Math.max(12, Math.floor(espacio / 6.6))) : [];
  const mt = 6 + 16 + nota.length * 15 + 14, base = mt + rens * uh, H = Math.ceil(base + (rotuloX ? 44 : 24));
  const cajaMediana = cajas[acotar(Math.floor((mediana - a) / clase), 0, nB - 1)];
  const cimaMediana = base - Math.ceil(cajaMediana.figuras / c) * uh - 3;
  const dir = derecha ? 1 : -1;
  const bandera = svg`<g aria-hidden="true">
    <line x1=${xm} x2=${xm} y1="5" y2=${Math.max(22, cimaMediana)} stroke=${P.tinta} stroke-width="1.6"/>
    <line x1=${xm} x2=${xm} y1=${base} y2=${base + 6} stroke=${P.tinta} stroke-width="2.4"/>
    <path d=${`M${xm},5L${xm + dir * 13},10.5L${xm},16Z`} fill=${P.tinta} />
    <text x=${xm + dir * 19} y="16" text-anchor=${derecha ? "start" : "end"} font-size=${TIPO.ejes} font-weight="800" fill=${P.tinta}>${titulo}</text>
    ${nota.map((t, k) => svg`<text x=${xm + dir * 19} y=${16 + 15 * (k + 1)} text-anchor=${derecha ? "start" : "end"} font-size="12" fill=${P.tinta2}>${t}</text>`)}
  </g>`;

  // ---- Pilas: cada clase es una marca con su globo.
  const id = nuevoId("hu"), azar = azarSemilla(semilla);
  const pilas = cajas.filter((q) => q.personas > 0).map((q) => {
    const x0 = ml + q.i * bw + (bw - c * uw) / 2;
    const interior = svg`<g stroke="none"></g>`;
    for (let u = 0; u < q.figuras; u++) {
      const ren = Math.floor(u / c), col = u % c;
      const tono = !destacar || u < q.figurasDestacadas ? color : colorResto;
      interior.appendChild(usar(refGlifo(id, Math.floor(azar() * 3), glifo), x0 + col * uw + (uw - fw) / 2, base - ren * uh - fh - (uh - fh) / 2, fw, fh, tono, {entra: (600 * ren) / rens}));
    }
    const nodo = svg`<g class="marca-viva unidad-grupo" tabindex="0"><rect class="unidad-zona" x=${ml + q.i * bw} y=${mt - 2} width=${bw} height=${base - mt + 2} fill="transparent" />${interior}</g>`;
    if (g) globoEn(nodo, g, {...q, unidad: K, total, totalDestacado});
    return nodo;
  });

  // ---- Eje: rótulos en los bordes de clase que caben sin encimarse.
  const largo = Math.max(...[a, b].map((v) => String(formatoX(v)).length)) * 7.4 + 10;
  const cada = [1, 2, 4, 5, 10, 20, 50].find((k) => k * bw >= largo) ?? nB;
  const marcas = [];
  for (let i = 0; i <= nB; i += cada) marcas.push(i);
  const eje = svg`<g aria-hidden="true">
    <line x1=${ml} x2=${ml + PW} y1=${base + 0.5} y2=${base + 0.5} stroke=${P.regla} />
    ${marcas.map((i) => svg`<g><line x1=${ml + i * bw} x2=${ml + i * bw} y1=${base} y2=${base + 4} stroke=${P.regla} /><text x=${ml + i * bw} y=${base + 18} text-anchor=${i === 0 ? "start" : i === nB ? "end" : "middle"} font-size=${TIPO.ejes} fill=${P.tinta2}>${formatoX(a + i * clase)}</text></g>`)}
    ${rotuloX ? svg`<text x=${ml} y=${base + 38} font-size=${TIPO.valor} font-weight="600" fill=${P.tinta2}>${rotuloX}</text>` : ""}
  </g>`;

  const descripcion = `Reparto de ${entero(total)} ${nombreUnidad} en ${nB} clases${rotuloX ? ` de ${rotuloX.toLowerCase()}` : ""}. ${textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular, glifo})}. ${titulo}.`;
  const dibujo = svg`<svg class="histograma-unidades" role="group" aria-label=${descripcion} width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    ${simbolos(id, {glifo})}${eje}${pilas}${bandera}
  </svg>`;
  const nodo = html`<div class="forma">${leyendaFiguras([
    destacar ? {color, glifo, texto: nombreDestacado ?? "Grupo destacado"} : null,
    destacar ? {color: colorResto, glifo, texto: nombreResto} : null,
    {color: destacar ? null : color, glifo, texto: textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular, glifo})},
  ])}${dibujo}</div>`;
  nodo.unidad = K; nodo.mediana = mediana;
  nodo.resumen = cajas.map((q) => ({...q, unidad: K, total, totalDestacado}));
  return nodo;
}
