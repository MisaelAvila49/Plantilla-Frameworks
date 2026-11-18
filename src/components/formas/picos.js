// formas/picos.js
// ¿Cuántos hay en cada lugar? Mapa de picos: en el punto de cada unidad se
// levanta un triángulo cuya ALTURA es la cantidad, y cuyo color repite la
// misma cantidad (o su signo, con una escala de cambio). Los picos más altos
// llevan una anotación con línea guía. Es la versión plana y clara de un mapa
// extruido: sirve para conteos, que una coropleta no admite.
// La altura usa una escala FIJA, la misma con cualquier filtro o encuadre.
// No: tasas o porcentajes (coropleta), ni cuando lo que importa son los
// valores chicos, que aquí se pierden.
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P, rampaTema} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {mapaBase} from "./mapa-base.js";
import {lienzo, rotulo, colocar, guia, anchoTexto} from "./anotaciones.js";

// geo: FeatureCollection del fondo. unidades: una fila por pico.
// posicion(d) devuelve [longitud, latitud] (el centroide de la unidad),
// valor(d) la cantidad y nombre(d) su rótulo. `tope`: cantidad a la que
// corresponde la altura máxima. Es una constante del capítulo, medida sobre
// todos los datos. `escala`: color de la cantidad (por omisión, la rampa del
// tono de tema, que arranca en un tono medio para que los picos chicos no se
// pierdan sobre el mapa). Con valores negativos el pico baja y `escala` es
// una rampa de cambio. encuadre(f): polígonos a los que se acerca el mapa.
// visible(d): unidades que se dibujan (por omisión, las que caen en el
// lienzo). `anotar`: cuántos picos llevan anotación.
export function picos(geo, unidades, {
  ancho, posicion, valor, nombre = () => "", tope, escala = null, encuadre = null, visible = null, anotar = null, altoMax = null, base = null,
  formato = entero, unidad = "personas", tituloLeyenda = "Altura y color del pico", globo: g,
}) {
  if (!(tope > 0)) throw new Error("picos(): falta `tope`, la cantidad fija a la que corresponde la altura máxima.");
  const angosto = ancho < 520;
  const mapa = mapaBase(geo, {ancho, encuadre, margen: angosto ? 4 : 10});
  const {W} = mapa;
  const tinta = escala ?? rampaTema([-0.45 * tope, tope]);
  const hMax = altoMax ?? (angosto ? 70 : 140), b = base ?? (angosto ? 5 : 8);
  const alturaDe = (v) => Math.sign(v) * Math.max(2, hMax * Math.abs(v) / tope);
  const marcas = unidades.filter((d) => valor(d) != null && (!visible || visible(d))).map((d) => {
    const p = mapa.proyeccion(posicion(d));
    return p ? {d, x: p[0], y: p[1], h: alturaDe(valor(d))} : null;
  }).filter((m) => m && (visible || (m.x >= 0 && m.x <= W && m.y >= 0 && m.y <= mapa.H)));
  if (!marcas.length) return vacio();
  // Aire arriba para que el pico más alto del norte no se corte.
  const aire = Math.ceil(Math.max(8, d3.max(marcas, (m) => m.h - m.y) + 34));
  const H = mapa.H + aire;

  const cuantas = anotar ?? (angosto ? 3 : 5);
  const altas = d3.sort(marcas, (m) => -Math.abs(valor(m.d))).slice(0, cuantas);
  const conNota = new Set(altas);
  // De norte a sur: el pico de más abajo se pinta encima del de más arriba.
  const triangulos = d3.sort(marcas, (m) => m.y).map((m, i) => {
    const c = tinta(valor(m.d));
    const nodo = svg`<path class="marca-viva ff-pico" tabindex=${conNota.has(m) ? 0 : null} style=${`--i:${i % 60}`} d=${`M${(m.x - b / 2).toFixed(1)},${m.y.toFixed(1)}L${m.x.toFixed(1)},${(m.y - m.h).toFixed(1)}L${(m.x + b / 2).toFixed(1)},${m.y.toFixed(1)}Z`}
      fill=${c} fill-opacity="0.55" stroke=${c} stroke-width="1" stroke-linejoin="round"/>`;
    if (g) globoEn(nodo, g, m.d);
    return nodo;
  });

  // Anotaciones de los picos más altos. En pantallas angostas el mapa lleva
  // solo un número y los nombres bajan a una lista.
  const tam = TIPO.valor, puntas = altas.map((m) => [m.x - 4, m.y - m.h - 4, m.x + 4, m.y - m.h + 4]);
  const etiquetas = altas.map((m, i) => {
    const renglones = angosto ? [{texto: String(i + 1), peso: 700}] : [{texto: String(nombre(m.d)), peso: 700}, {texto: `${formato(valor(m.d))} ${unidad}`, color: P.tinta2}];
    return {m, i, x: m.x, y: m.y - m.h + aire, renglones, w: angosto ? 14 : Math.max(...renglones.map((r) => anchoTexto(r.texto, tam, r.peso ?? 400))), h: angosto ? 15 : 2 * tam * 1.22 + 3,
      candidatas: angosto ? [[-7, -22, "middle"], [8, -18, "middle"], [-22, -18, "middle"], [-7, -36, "middle"]] : undefined};
  });
  const notas = colocar(etiquetas, {ancho: W, alto: H, obstaculos: puntas.map((c) => [c[0], c[1] + aire, c[2], c[3] + aire]), separacion: 12}).filter((e) => e.cabe).map((e) => svg`<g>
    ${guia(e.x, e.y, e.caja)}
    <circle cx=${e.x} cy=${e.y} r="2.2" fill=${P.tinta} />
    ${rotulo(e.tx, e.caja[1] + tam, e.renglones, {ancla: e.ancla, tam})}
  </g>`);
  const lista = angosto ? html`<ol class="picos-lista">${altas.map((m) => html`<li><strong>${nombre(m.d)}</strong> ${formato(valor(m.d))} ${unidad}</li>`)}</ol>` : "";

  const mayor = altas[0];
  const dibujo = lienzo({
    clase: "picos", ancho: W, alto: H,
    etiqueta: `Mapa de picos de ${entero(marcas.length)} unidades. La altura de cada pico es la cantidad. El más alto es ${nombre(mayor.d)}: ${formato(valor(mayor.d))} ${unidad}.`,
  }, svg`<g transform=${`translate(0,${aire})`}>${mapa.capa}<g>${triangulos}</g></g>`, svg`<g aria-hidden="true" pointer-events="none" class="ff-aparece" style="--i:10">${notas}</g>`);

  // Leyenda de altura fuera del lienzo: tres picos de muestra con su cifra.
  const pasos = d3.ticks(0, tope / 2, 4).filter((v) => v > 0);
  const muestras = [...new Set([pasos[0], pasos[Math.floor(pasos.length / 2)], pasos.at(-1)])];
  const paso = 96, altoLeyenda = Math.ceil(alturaDe(muestras.at(-1))) + 30;
  const leyenda = svg`<svg class="leyenda-picos" width=${muestras.length * paso + 8} height=${altoLeyenda} viewBox="0 0 ${muestras.length * paso + 8} ${altoLeyenda}" role="img" aria-label=${`${tituloLeyenda}: de ${formato(muestras[0])} a ${formato(muestras.at(-1))} ${unidad}`}>
    <text x="0" y="11" font-size="12" font-weight="600" fill=${P.tinta2}>${tituloLeyenda}, en ${unidad}</text>
    ${muestras.map((v, i) => {
      const x = 14 + i * paso, y = altoLeyenda - 4, c = tinta(v);
      return svg`<g><path d=${`M${x - b / 2},${y}L${x},${y - alturaDe(v)}L${x + b / 2},${y}Z`} fill=${c} fill-opacity="0.55" stroke=${c} stroke-width="1" stroke-linejoin="round"/>
        <text x=${x + b / 2 + 5} y=${y} font-size="11.5" fill=${P.tinta2}>${formato(v)}</text></g>`;
    })}
  </svg>`;
  const nodo = html`<div class="forma forma-picos">${leyenda}${dibujo}${lista}</div>`;
  nodo.anotados = altas.map((m) => m.d);
  return nodo;
}
