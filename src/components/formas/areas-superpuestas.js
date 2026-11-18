// formas/areas-superpuestas.js
// ¿Cómo evolucionan dos series en varios grupos a la vez, y en cuáles se
// separan? Un panel por grupo, uno bajo otro, con las dos series como áreas
// translúcidas superpuestas (no apiladas): el hueco visible entre las dos es
// la brecha. Cada área tapa lo que tiene detrás (va sobre una capa del color
// del fondo), así que donde se enciman se ve solo el tono de la de enfrente y
// nunca la mezcla de los dos. Todos los paneles comparten el eje del tiempo y la MISMA escala
// vertical, de modo que un panel alto invade al de arriba en lugar de
// encogerse y las cantidades se comparan entre grupos. El último valor de
// cada serie se rotula junto a su punto.
// No: más de dos series por panel, más de unos diez paneles, ni grupos cuyas
// magnitudes difieren tanto que los chicos quedan planos (ahí, facetas con
// escala propia y se dice).
import * as d3 from "npm:d3";
import {svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn, mostrarGlobo, ocultarGlobo} from "../globo.js";
import {vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";
import {lienzo, rotulo, separar, partir, anchoTexto} from "./anotaciones.js";

// datos: filas largas. tiempo(d), valor(d), serie(d), panel(d). `series`: las
// dos series, en el orden en que se pintan. `paneles`: orden de arriba a
// abajo (por omisión, del valor más alto al más bajo). color(serie): rojo y
// azul semánticos, según lo declare el capítulo. `tope`: valor al que
// corresponde el alto máximo de un área. Es fijo para la vista, común a todos
// los paneles. `exceso`: cuántas bandas puede medir el área más alta.
// `anotaciones`: [{panel, tiempo, serie, texto}], con línea guía al punto.
export function areasSuperpuestas(datos, {
  ancho, tiempo, valor, serie, panel, series, paneles = null, color, nombreSerie = String, corto = null, tope = null, exceso = 2, banda = null,
  formato = entero, anotaciones = [], globo: g,
}) {
  const filas = datos.filter((d) => valor(d) != null && series.includes(serie(d)));
  if (!filas.length) return vacio();
  const angosto = ancho < 520;
  const W = Math.min(ancho, 1040);
  const porPanel = d3.group(filas, panel, serie);
  const orden = (paneles ?? d3.sort(porPanel.keys(), (k) => -d3.max(filas.filter((d) => panel(d) === k), valor))).filter((k) => porPanel.has(k));
  const tiempos = [...new Set(filas.map(tiempo))].sort(d3.ascending);
  const techo = tope ?? d3.max(filas, valor);
  const hB = banda ?? (angosto ? 62 : 76), k = hB * exceso / techo;
  const ml = angosto ? 8 : 158, mr = angosto ? 58 : 112;
  const x = d3.scaleLinear([tiempos[0], tiempos.at(-1)], [ml, W - mr]);
  // Aire arriba: lo que el panel más alto sobresale de su banda.
  const sobre = d3.max(orden, (p, i) => k * d3.max(filas.filter((d) => panel(d) === p), valor) - i * hB);
  // Aire arriba: el rótulo del primer valor final y la anotación necesitan
  // espacio sobre el área más alta.
  const mt = 44 + Math.max(hB * 0.6, sobre);
  const linea = (i) => mt + i * hB;
  const H = linea(orden.length - 1) + 30;
  const yDe = (i, v) => linea(i) - k * v;

  const cada = Math.ceil(tiempos.length / (angosto ? 4 : 8));
  const marcasTiempo = tiempos.filter((_, i) => (tiempos.length - 1 - i) % cada === 0);
  const capas = [], finales = [], puntos = [];
  orden.forEach((p, i) => {
    const propias = series.map((s) => ({s, f: d3.sort(porPanel.get(p).get(s) ?? [], tiempo)})).filter((q) => q.f.length);
    const area = d3.area().x((d) => x(tiempo(d))).y0(linea(i)).y1((d) => yDe(i, valor(d))).curve(d3.curveMonotoneX);
    const trazo = d3.line().x((d) => x(tiempo(d))).y((d) => yDe(i, valor(d))).curve(d3.curveMonotoneX);
    capas.push(svg`<g>
      ${propias.map((q) => svg`<g class="ff-aparece" style=${`--i:${i}`}><path d=${area(q.f)} fill=${P.fondo} /><path d=${area(q.f)} fill=${color(q.s)} fill-opacity="0.2" /></g>`)}
      <line x1=${ml} x2=${W - mr} y1=${linea(i)} y2=${linea(i)} stroke=${P.regla} stroke-width="1"/>
      ${marcasTiempo.map((t) => svg`<line x1=${x(t)} x2=${x(t)} y1=${linea(i)} y2=${linea(i) + 4} stroke=${P.regla} />`)}
      ${propias.map((q) => svg`<path class="ff-traza" pathLength="1" d=${trazo(q.f)} fill="none" stroke=${color(q.s)} stroke-width="1.9" stroke-linejoin="round"/>`)}
    </g>`);
    for (const q of propias) {
      for (const d of q.f) puntos.push({d, x: x(tiempo(d)), y: yDe(i, valor(d)), c: color(q.s)});
      const u = q.f.at(-1);
      finales.push({d: u, s: q.s, i, x: x(tiempo(u)), y: yDe(i, valor(u)), c: color(q.s)});
    }
  });

  // Rótulo directo del último valor, separado para que no se encime con el
  // del panel vecino. El primer panel dice además el nombre de cada serie.
  const tam = angosto ? 11.5 : TIPO.valor;
  const lugares = separar(finales.map((f) => ({pos: f.y, tam: tam + 2})), {min: 8, max: H - 22, hueco: 0});
  const rotulosFinales = finales.map((f, j) => {
    const texto = `${f.i === 0 && !angosto ? nombreSerie(f.s) + " " : ""}${formato(valor(f.d))}`;
    const marca = svg`<circle class="marca-viva" tabindex="0" cx=${f.x} cy=${f.y} r="4.5" fill=${f.c} stroke=${P.fondo} stroke-width="1.2" />`;
    if (g) globoEn(marca, g, f.d);
    return svg`<g>${marca}<line x1=${f.x + 5} y1=${f.y} x2=${f.x + 9} y2=${lugares[j].lugar} stroke=${f.c} stroke-width="0.8"/>${rotulo(f.x + 12, lugares[j].lugar + tam * 0.36, texto, {tam, peso: 600, color: f.c})}</g>`;
  });
  const nombres = orden.map((p, i) => (angosto
    ? rotulo(ml + 2, linea(i) - 7, corto ? corto(p) : p, {tam: 12.5, peso: 700})
    : svg`<text x=${ml - 14} y=${linea(i) - 3} text-anchor="end" font-size="13.5" font-weight="700" fill=${P.tinta}>${p}</text>`));
  const ejeTiempo = marcasTiempo.map((t) => svg`<text x=${x(t)} y=${H - 10} text-anchor="middle" font-size=${TIPO.ejes - 1} fill=${P.tinta2}>${t}</text>`);

  // Anotaciones: texto a un lado del punto, con una línea guía vertical.
  const notas = anotaciones.map((a) => {
    const i = orden.indexOf(a.panel), d = i < 0 ? null : (porPanel.get(a.panel).get(a.serie) ?? []).find((r) => tiempo(r) === a.tiempo);
    if (!d) return null;
    const px = x(tiempo(d)), py = yDe(i, valor(d)), renglones = partir(a.texto, angosto ? 22 : 30), alto = renglones.length * tam * 1.22;
    const wTexto = Math.max(...renglones.map((r) => anchoTexto(r, tam)));
    const aLaIzquierda = px - 8 - wTexto > ml, arriba = Math.max(tam + 2, py - 20 - alto + tam);
    return svg`<g>
      <line x1=${px} y1=${py - 4} x2=${px} y2=${arriba - tam + 2} stroke=${P.tinta} stroke-width="0.9"/>
      <circle cx=${px} cy=${py} r="2.6" fill=${P.fondo} stroke=${P.tinta} stroke-width="1.2"/>
      ${rotulo(aLaIzquierda ? px - 7 : px + 7, arriba, renglones, {ancla: aLaIzquierda ? "end" : "start", tam})}
    </g>`;
  }).filter(Boolean);

  // Un solo puntero para toda la figura: el globo es del punto más cercano
  // al cursor (mismo año, serie más próxima en vertical).
  const aro = svg`<circle r="6" fill="none" stroke=${P.tinta} stroke-width="1.6" visibility="hidden" pointer-events="none"/>`;
  const zona = svg`<rect x=${ml - 4} y="0" width=${W - mr - ml + 12} height=${H} fill="transparent"/>`;
  if (g) {
    zona.addEventListener("pointermove", (e) => {
      const caja = zona.ownerSVGElement.getBoundingClientRect(), f = W / caja.width;
      const sx = (e.clientX - caja.left) * f, sy = (e.clientY - caja.top) * f;
      const cerca = d3.least(puntos, (p) => Math.abs(p.x - sx) * 4 + Math.abs(p.y - sy));
      if (!cerca) return;
      aro.setAttribute("cx", cerca.x); aro.setAttribute("cy", cerca.y); aro.setAttribute("visibility", "visible");
      mostrarGlobo(g.html(cerca.d), e.clientX, e.clientY);
    });
    zona.addEventListener("pointerleave", () => { aro.setAttribute("visibility", "hidden"); ocultarGlobo(); });
  }

  const resumen = orden.slice(0, 3).map((p) => `${p}: ${finales.filter((f) => orden[f.i] === p).map((f) => `${nombreSerie(f.s)} ${formato(valor(f.d))}`).join(", ")}`).join(". ");
  const dibujo = lienzo({
    clase: "areas-superpuestas", ancho: W, alto: H,
    etiqueta: `Áreas superpuestas de ${series.map(nombreSerie).join(" y ")} en ${orden.length} paneles con la misma escala, de ${tiempos[0]} a ${tiempos.at(-1)}. Último valor. ${resumen}.`,
  }, svg`<g>${capas}</g>`, svg`<g aria-hidden="true">${nombres}${ejeTiempo}</g>`, zona, svg`<g pointer-events="none" class="ff-aparece" style="--i:10" aria-hidden="true">${notas}</g>`, svg`<g>${rotulosFinales}</g>`, aro);
  return conLeyenda(leyendaItems(series.map((s) => ({tipo: "linea", color: color(s), texto: nombreSerie(s)}))), dibujo);
}
