// formas/ternario.js
// ¿Hacia cuál de tres partes se movió la composición de cada unidad? Un
// triángulo cuyos vértices son el 100 % de cada parte: cada unidad es un
// punto en la posición que le da su reparto (más cerca de un vértice, más
// peso de esa parte) y una estela une su posición en los cortes anteriores con
// la actual. La unidad elegida va en tinta, con sus cortes rotulados, y las
// demás en gris como contexto. Las zonas tenues dicen qué parte domina en cada
// región del triángulo y las rayas marcan 25, 50 y 75 % de cada parte.
// Inspirada en USAFacts, reseñado por FlowingData (Dispatch del 2 de junio
// de 2026).
// No: más de tres partes (se agrupan antes, y se dice), partes que no suman
// un todo, ni comparar cifras exactas (van en la tabla).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {TIPO, leyendaItems} from "./comun.js";
import {tintaLegible, anchoTexto} from "./unidad.js";

const r1 = (v) => Math.round(v * 10) / 10;
const RAIZ3 = Math.sqrt(3) / 2;

// datos: una fila por unidad y corte. unidad(d), corte(d), partes(d) → tres
// cantidades [a, b, c] (personas) en el orden de `nombres`. `color(nombre)`:
// color de identidad de cada parte (categorias() de paleta.js). `destacada`:
// la unidad que va en tinta (o null). `tamano(d)`: población para el radio
// del punto final (null = radio fijo), con `tamanoMax` FIJO. `alElegir(u)`:
// clic en un punto gris. El dato del globo trae `_partes` (proporciones 0-100),
// `_mayor` (índice de la parte mayor) y `_previo` (la fila del corte anterior).
export function ternario(datos, {ancho, unidad, corte, partes, nombres, color, cortes = null, destacada = null, tamano = null, tamanoMax = 1,
  nombreCorte = String, alElegir = null, textoResto = "Las demás unidades", globo: g}) {
  const lista = cortes ?? [...new Set(datos.map(corte))].sort(d3.ascending);
  const angosto = ancho < 560;
  const L = Math.min(ancho - (angosto ? 28 : 120), 600);
  const h = L * RAIZ3;
  const mx = (ancho - L) / 2, arriba = angosto ? 34 : 40, abajo = angosto ? 58 : 50;
  const W = ancho, H = Math.ceil(arriba + h + abajo);
  // Posición baricéntrica: A abajo a la izquierda, B abajo a la derecha, C arriba.
  const pos = ([a, b, c]) => [mx + L * (b + c / 2), arriba + h * (1 - c)];
  const conProp = datos.map((d) => {
    const p = partes(d), s = p[0] + p[1] + p[2];
    return s > 0 ? {d, prop: p.map((x) => x / s), s} : null;
  }).filter(Boolean);
  const porUnidad = d3.group(conProp, (x) => unidad(x.d));
  const radio = d3.scaleSqrt([0, tamanoMax], [angosto ? 2 : 2.5, angosto ? 7 : 10]).clamp(true);

  // Zonas: dónde domina cada parte (de cada vértice al centro, por los puntos medios).
  const V = [pos([1, 0, 0]), pos([0, 1, 0]), pos([0, 0, 1])];
  const centro = pos([1 / 3, 1 / 3, 1 / 3]);
  const medio = (i, j) => [(V[i][0] + V[j][0]) / 2, (V[i][1] + V[j][1]) / 2];
  const zonas = [[0, 1, 2], [1, 2, 0], [2, 0, 1]].map(([i, j, k]) => {
    const pts = [V[i], medio(i, j), centro, medio(i, k)];
    return svg`<path d=${"M" + pts.map((p) => p.map(r1).join(",")).join("L") + "Z"} fill=${color(nombres[i])} fill-opacity="0.11" />`;
  });
  // Rayas de 25, 50 y 75 % de cada parte, con su cifra en el borde que le toca
  // (la convención de las agujas del reloj: A abajo, B a la derecha, C a la izquierda).
  const rayas = [], cifras = [];
  for (const t of [0.25, 0.5, 0.75]) {
    for (let k = 0; k < 3; k++) {
      const p1 = [0, 0, 0], p2 = [0, 0, 0];
      p1[k] = t; p2[k] = t; p1[(k + 1) % 3] = 1 - t; p2[(k + 2) % 3] = 1 - t;
      const [x1, y1] = pos(p1), [x2, y2] = pos(p2);
      rayas.push(svg`<line x1=${r1(x1)} y1=${r1(y1)} x2=${r1(x2)} y2=${r1(y2)} stroke=${P.bordeFuerte} stroke-width="0.8" stroke-dasharray="3 4" />`);
      // La cifra va en el extremo donde la parte siguiente vale cero.
      const [ex, ey] = pos(p2);
      // A en el borde izquierdo, B en el de abajo y C en el derecho.
      const dx = k === 0 ? -8 : k === 1 ? 0 : 8, dy = k === 1 ? 15 : 3;
      cifras.push(svg`<text pointer-events="none" x=${r1(ex + dx)} y=${r1(ey + dy)} text-anchor=${k === 0 ? "end" : k === 1 ? "middle" : "start"} font-size="10.5" fill=${tintaLegible(color(nombres[k]), 4.5)}>${Math.round(t * 100)}</text>`);
    }
  }
  const marco = svg`<path d=${`M${V.map((p) => p.map(r1).join(",")).join("L")}Z`} fill="none" stroke=${P.bordeFuerte} stroke-width="1.3" stroke-linejoin="round" />`;
  // Vértices: «100 % Motivo A», en el color de la parte.
  const fV = angosto ? 11.5 : TIPO.ejes;
  const vertices = [
    svg`<text pointer-events="none" x=${r1(V[0][0])} y=${r1(V[0][1] + (angosto ? 34 : 32))} text-anchor="start" font-size=${fV} font-weight="800" fill=${tintaLegible(color(nombres[0]), 4.5)}>← 100 % ${nombres[0]}</text>`,
    svg`<text pointer-events="none" x=${r1(V[1][0])} y=${r1(V[1][1] + (angosto ? 34 : 32))} text-anchor="end" font-size=${fV} font-weight="800" fill=${tintaLegible(color(nombres[1]), 4.5)}>100 % ${nombres[1]} →</text>`,
    svg`<text pointer-events="none" x=${r1(V[2][0])} y=${r1(V[2][1] - 12)} text-anchor="middle" font-size=${fV} font-weight="800" fill=${tintaLegible(color(nombres[2]), 4.5)}>↑ 100 % ${nombres[2]}</text>`,
  ];

  // Estelas y puntos. Las grises primero; la destacada encima.
  const grises = [], frente = [];
  const unidades = [...porUnidad.keys()];
  unidades.forEach((u, i) => {
    const serieU = [...porUnidad.get(u)].sort((p, q) => lista.indexOf(corte(p.d)) - lista.indexOf(corte(q.d)));
    const xy = serieU.map((x) => pos(x.prop));
    const elegida = u === destacada;
    const tono = elegida ? P.tinta : P.contexto;
    const datoDe = (x, k) => ({...x.d, _partes: x.prop.map((v) => 100 * v), _mayor: x.prop.indexOf(Math.max(...x.prop)), _total: x.s, _previo: k ? serieU[k - 1].d : null, _destacada: elegida});
    const segmentos = xy.slice(1).map((p, k) => svg`<line pointer-events="none" x1=${r1(xy[k][0])} y1=${r1(xy[k][1])} x2=${r1(p[0])} y2=${r1(p[1])} stroke=${tono}
      stroke-width=${elegida ? 2.6 : 1.3} stroke-opacity=${elegida ? (k === xy.length - 2 ? 1 : 0.55) : (k === xy.length - 2 ? 0.75 : 0.35)} stroke-linecap="round" />`);
    const ultimo = serieU.at(-1), [ux, uy] = xy.at(-1);
    const r = elegida ? Math.max(6.5, tamano && tamano(ultimo.d) != null ? radio(tamano(ultimo.d)) : 6.5) : tamano && tamano(ultimo.d) != null ? radio(tamano(ultimo.d)) : 4;
    const punto = svg`<circle class="marca-viva tr-punto" tabindex="0" cx=${r1(ux)} cy=${r1(uy)} r=${r1(r)} fill=${elegida ? P.tinta : P.contexto} fill-opacity=${elegida ? 1 : 0.85} stroke=${P.fondo} stroke-width="1" />`;
    if (g) globoEn(punto, g, datoDe(ultimo, serieU.length - 1));
    if (alElegir && !elegida) { punto.style.cursor = "pointer"; punto.addEventListener("click", () => alElegir(u)); }
    const previos = elegida ? serieU.slice(0, -1).map((x, k) => {
      const n = svg`<circle class="marca-viva" cx=${r1(xy[k][0])} cy=${r1(xy[k][1])} r="4.2" fill=${P.fondo} stroke=${P.tinta} stroke-width="1.8" />`;
      if (g) globoEn(n, g, datoDe(x, k));
      return n;
    }) : [];
    // Rótulos de la destacada: el año junto a cada corte y el nombre en el último.
    const rotulos = [];
    if (elegida) {
      xy.forEach(([x, y], k) => {
        const t = nombreCorte(corte(serieU[k].d)), derecha = x < mx + L / 2;
        rotulos.push(svg`<text pointer-events="none" x=${r1(x + (derecha ? -9 : 9))} y=${r1(y + 4)} text-anchor=${derecha ? "end" : "start"} font-size="11" fill=${P.tinta2} paint-order="stroke" stroke=${P.fondo} stroke-width="3">${t}</text>`);
      });
      const nombre = String(u), w = anchoTexto(nombre, 13, true);
      const izquierda = ux + w + 16 > mx + L ? true : false;
      rotulos.push(svg`<text pointer-events="none" x=${r1(ux + (izquierda ? -r - 6 : r + 6))} y=${r1(uy - r - 4)} text-anchor=${izquierda ? "end" : "start"} font-size="13" font-weight="800" fill=${P.tinta} paint-order="stroke" stroke=${P.fondo} stroke-width="3.5">${nombre}</text>`);
    }
    const capa = svg`<g class=${elegida ? "tr-destacada fc-aparece" : "tr-gris fc-aparece"} style=${`--i:${elegida ? 10 : Math.round(i / 4)}`}>${segmentos}${previos}${punto}${rotulos}</g>`;
    (elegida ? frente : grises).push(capa);
  });

  const descripcion = `Triángulo de composición en tres partes (${nombres.join(", ")}) con ${unidades.length} unidades y su estela de ${nombreCorte(lista[0])} a ${nombreCorte(lista.at(-1))}.` +
    (destacada != null && porUnidad.has(destacada) ? ` ${destacada}: ${nombres.map((n, k) => `${n} ${pct(100 * [...porUnidad.get(destacada)].sort((p, q) => lista.indexOf(corte(p.d)) - lista.indexOf(corte(q.d))).at(-1).prop[k])}`).join(", ")}.` : "");
  const dibujo = svg`<svg class="ternario" role="group" aria-label=${descripcion} width=${W} height=${H} viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif);overflow:visible">
    <g aria-hidden="true" pointer-events="none">${zonas}${rayas}${marco}${cifras}${vertices}</g>
    <g>${grises}</g><g>${frente}</g>
  </svg>`;
  const leyenda = leyendaItems([
    ...(destacada != null && porUnidad.has(destacada) ? [{tipo: "linea", color: P.tinta, texto: `${destacada}: estela de ${nombreCorte(lista[0])} a ${nombreCorte(lista.at(-1))}`}] : []),
    {tipo: "punto", color: P.contexto, texto: textoResto},
  ]);
  // Zonas: la muestra lleva la misma opacidad que la zona y un borde del tono.
  const leyendaZonas = html`<div class="leyenda-items">${nombres.map((n) => html`<span class="leyenda-item"><svg width="14" height="12" aria-hidden="true"><rect x="0.5" y="0.5" width="13" height="11" rx="2" fill=${color(n)} fill-opacity="0.22" stroke=${color(n)} /></svg><span>Domina ${n}</span></span>`)}</div>`;
  const nota = html`<p class="tr-nota">Las rayas punteadas marcan 25, 50 y 75 % de cada parte; la cifra va en el borde del color de esa parte.${tamano ? " El tamaño del punto es la población." : ""}</p>`;
  return html`<div class="forma"><div class="forma-leyendas">${leyenda}${leyendaZonas}</div>${nota}${dibujo}</div>`;
}
