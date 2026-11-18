// formas/barra-mapa.js
// ¿De qué se compone un total y a qué lugares llega cada parte? Barra al
// mapa: arriba, una barra con el total que sale de un lugar, partida por
// categorías (motivo, sexo, grupo de edad); de cada tramo bajan cintas que se
// curvan hasta aterrizar en su destino sobre el mapa. El ancho de cada cinta
// es proporcional a las personas en los dos extremos (en la barra con la
// escala de la barra y al aterrizar con una escala más chica, para que los
// destinos vecinos no se tapen; la leyenda lo dice). Se lee de dónde sale,
// cuánto y a dónde llega en una sola figura.
// La categoría destacada va en color y las demás en neutro. Los destinos
// menores no llevan cinta propia: su parte de la barra baja en una cinta que
// se desvanece («a las demás»), y su detalle está en la tabla.
// No: más de unas cuatro categorías (la barra se vuelve hilos), más de 12
// destinos con cinta propia, ni tasas (el ancho es un conteo).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero, pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {ISO_A_CVE, POR_CVE, nombreEntidad} from "../geografia.js";
import {vacio, leyendaItems, TIPO} from "./comun.js";
import {mapaBase} from "./mapa-base.js";
import {rotulo, colocar, anchoTexto} from "./anotaciones.js";
import {tintaLegible} from "./unidad.js";

let serie = 0;
const r1 = (v) => Math.round(v * 10) / 10;

// geo: FeatureCollection de los lugares. flujos: una fila por origen, destino
// y categoría. origen(d), destino(d): clave del lugar (la misma que clave(f)
// lee del polígono). categoria(d), valor(d) personas, casos(d) casos sin
// expandir (por debajo de `minimo` la cinta va punteada). foco: clave del
// lugar de salida. categorias: orden fijo de los tramos. destacada: categoría
// en color. maximo: destinos con cinta propia (de 8 a 12). color: tono de la
// destacada (por omisión, el rojo del capítulo). globo: de cada cinta;
// globoBarra: de cada tramo de la barra.
export function barraMapa(geo, flujos, {
  ancho, origen, destino, categoria, valor, casos = null, foco, categorias, destacada = null, maximo = 10, minimo = 30,
  clave = (f) => ISO_A_CVE.get(f.properties.id), nombre = nombreEntidad, corto = (c) => POR_CVE.get(c)?.corto ?? nombre(c),
  color = null, formato = entero, unidad = "personas", rotuloOtras = "las demás entidades", globo: g, globoBarra: gb,
}) {
  const filas = flujos.filter((d) => origen(d) === foco && destino(d) !== foco && valor(d) > 0);
  if (!filas.length) return vacio("Sin salidas que dibujar para este lugar.");
  const angosto = ancho < 520;
  const tono = color ?? P.rojo;
  const total = d3.sum(filas, valor);
  const porCat = d3.rollup(filas, (f) => d3.sum(f, valor), categoria);
  const porDest = d3.rollup(filas, (f) => d3.sum(f, valor), destino);
  const casosDe = (f) => (casos ? d3.sum(f, casos) : null);
  const cats = categorias.filter((c) => porCat.get(c) > 0);
  const destinos = d3.sort([...porDest.keys()], (k) => -porDest.get(k)).slice(0, maximo);
  const esTop = new Set(destinos);
  const nOtras = porDest.size - destinos.length;

  // ---- Mapa (debajo) y lugares de aterrizaje.
  const mapa = mapaBase(geo, {
    ancho, margen: angosto ? 4 : 8,
    relleno: (f) => (esTop.has(clave(f)) ? P.apagado : P.fondo2), borde: (f) => (clave(f) === foco ? P.tinta : P.bordeFuerte), grosor: (f) => (clave(f) === foco ? 1.6 : 0.5),
  });
  const W = mapa.W;
  const centro = new Map(geo.features.map((f) => [clave(f), mapa.centro(f)]));

  // ---- Barra: tramos por categoría con un respiro entre ellos.
  const tam = angosto ? 11.5 : TIPO.valor, renglon = tam * 1.22;
  const hueco = 4, hb = angosto ? 8 : 11;
  const kArriba = (W - 2 - hueco * (cats.length - 1)) / total;
  let x = 1;
  const tramos = cats.map((c) => {
    const v = porCat.get(c), t = {c, v, x0: x, x1: x + v * kArriba, destacada: c === destacada};
    x = t.x1 + hueco;
    return t;
  });
  // Rótulos de los tramos, arriba de la barra; el que choca sube de renglón.
  const niveles = [];
  for (const t of tramos) {
    t.renglones = [{texto: t.c, peso: 700, color: t.destacada ? tintaLegible(tono) : P.tinta}, {texto: angosto ? pct(100 * t.v / total) : `${formato(t.v)} · ${pct(100 * t.v / total)}`, color: P.tinta2}];
    t.w = Math.max(...t.renglones.map((r) => anchoTexto(r.texto, tam, r.peso ?? 400)));
    t.cx = (t.x0 + t.x1) / 2;
    t.lx = Math.max(t.w / 2, Math.min(W - t.w / 2, t.cx));
    let n = 0;
    while ((niveles[n] ?? -Infinity) > t.lx - t.w / 2 - 10) n++;
    niveles[n] = t.lx + t.w / 2; t.nivel = n;
  }
  const altoRotulo = 2 * renglon + 8, nNiveles = d3.max(tramos, (t) => t.nivel) + 1;
  const yBarra = nNiveles * altoRotulo + 6, yCintas = yBarra + hb;
  const caida = angosto ? 58 : 104;
  const yMapa = yCintas + caida;
  const H = yMapa + mapa.H;

  // ---- Aterrizaje: cada destino recibe un tramo centrado en su punto, con
  // una escala más chica que la de la barra si hace falta.
  const maxAterriza = angosto ? 22 : 46;
  const kAbajo = Math.min(kArriba, maxAterriza / d3.max(destinos, (k) => porDest.get(k)));
  const aterriza = new Map(destinos.map((k) => {
    const [cx, cy] = centro.get(k) ?? [W / 2, mapa.H / 2], w = porDest.get(k) * kAbajo;
    return [k, {k, x: cx, y: cy + yMapa, x0: cx - w / 2, cursor: cx - w / 2, w}];
  }));
  for (const a of aterriza.values()) a.y = Math.max(a.y, yMapa + 6);

  // ---- Cintas: dentro de cada tramo, los destinos van ordenados de oeste a
  // este (para que se crucen lo menos posible) y al final, la parte que va a
  // los demás destinos.
  const cintas = [], restos = [];
  for (const t of tramos) {
    const propias = filas.filter((d) => categoria(d) === t.c);
    const porDestino = d3.rollup(propias, (f) => ({v: d3.sum(f, valor), casos: casosDe(f)}), destino);
    let cursor = t.x0;
    for (const k of d3.sort(destinos.filter((k) => porDestino.has(k)), (k) => aterriza.get(k).x)) {
      const {v, casos: cs} = porDestino.get(k), a = aterriza.get(k), wA = v * kAbajo;
      cintas.push({t, k, v, casos: cs, x0: cursor, x1: cursor + v * kArriba, u0: a.cursor, u1: a.cursor + wA, y1: a.y - 2});
      a.cursor += wA; cursor += v * kArriba;
    }
    const resto = [...porDestino].filter(([k]) => !esTop.has(k));
    if (resto.length) restos.push({t, v: d3.sum(resto, ([, o]) => o.v), casos: d3.sum(resto, ([, o]) => o.casos ?? 0), x0: cursor, x1: t.x1, n: resto.length});
  }
  // Aterrizaje: los tramos de cada categoría se asignaron en el orden de los
  // tramos de la barra, así que el aterrizaje respeta el mismo orden.
  // Una cinta con pocos casos va punteada solo si es de la categoría destacada:
  // las grises son contexto y su aviso queda en el globo y en la tabla.
  const bajo = (c) => casos && c.casos != null && c.casos < minimo && (destacada == null || c.t.destacada);
  const ids = {d: `bm${++serie}-d`, n: `bm${serie}-n`, r: `bm${serie}-r`};
  const totalCat = (c) => porCat.get(c);
  const datoCinta = (c) => ({origen: nombre(foco), destino: nombre(c.k), cveDestino: c.k, categoria: c.t.c, valor: c.v, casos: c.casos,
    total, totalCategoria: totalCat(c.t.c), totalDestino: porDest.get(c.k)});
  const ordenadas = [...cintas.filter((c) => !c.t.destacada), ...cintas.filter((c) => c.t.destacada)];
  const cintasSvg = ordenadas.map((c, i) => {
    const y0 = yCintas, y1 = c.y1, cy1 = y0 + (y1 - y0) * 0.55, cy2 = y1 - (y1 - y0) * 0.5;
    const d = `M${r1(c.x0)},${y0}C${r1(c.x0)},${r1(cy1)} ${r1(c.u0)},${r1(cy2)} ${r1(c.u0)},${r1(y1)}L${r1(c.u1)},${r1(y1)}C${r1(c.u1)},${r1(cy2)} ${r1(c.x1)},${r1(cy1)} ${r1(c.x1)},${y0}Z`;
    const punteada = bajo(c);
    const nodo = svg`<path class="marca-viva bm-cinta" tabindex=${c.t.destacada ? 0 : null} style=${`--i:${Math.min(i, 30)}`} d=${d}
      fill=${`url(#${c.t.destacada ? ids.d : ids.n})`} stroke=${punteada ? (c.t.destacada ? tono : P.tinta3) : "none"} stroke-width=${punteada ? 1 : 0} stroke-dasharray=${punteada ? "3 3" : null} />`;
    if (g) globoEn(nodo, g, datoCinta(c));
    return nodo;
  });
  // La parte que va a los demás destinos: una cinta corta que se desvanece.
  const restosSvg = restos.map((r) => {
    const nodo = svg`<path class="marca-viva bm-resto" d=${`M${r1(r.x0)},${yCintas}L${r1(r.x1)},${yCintas}L${r1(r.x1)},${yCintas + caida * 0.45}L${r1(r.x0)},${yCintas + caida * 0.45}Z`} fill=${`url(#${ids.r})`} />`;
    if (g) globoEn(nodo, g, {origen: nombre(foco), destino: `${rotuloOtras} (${r.n})`, cveDestino: null, categoria: r.t.c, valor: r.v, casos: r.casos, total, totalCategoria: totalCat(r.t.c), totalDestino: null, otras: true});
    return nodo;
  });
  const barra = tramos.map((t) => {
    const nodo = svg`<rect class="marca-viva bm-tramo" tabindex="0" x=${r1(t.x0)} y=${yBarra} width=${r1(Math.max(1, t.x1 - t.x0))} height=${hb} rx="1.5" fill=${t.destacada ? tono : P.contexto} />`;
    if (gb) globoEn(nodo, gb, {origen: nombre(foco), categoria: t.c, valor: t.v, total, casos: casosDe(filas.filter((d) => categoria(d) === t.c)), destacada: t.destacada});
    return nodo;
  });
  const rotulosBarra = tramos.map((t) => {
    // `yt` es la línea base del primer renglón; el segundo queda a 9 px de la barra.
    const yt = yBarra - 9 - renglon - t.nivel * altoRotulo;
    return svg`<g>
      ${t.nivel ? svg`<line x1=${r1(t.cx)} x2=${r1(t.cx)} y1=${r1(yt + renglon + 5)} y2=${yBarra - 2} stroke=${P.regla} stroke-width="0.9" />` : ""}
      ${rotulo(r1(t.lx), yt, t.renglones, {ancla: "middle", tam})}
    </g>`;
  });
  // Marcas de aterrizaje: un tramo corto por categoría, en el color de su cinta.
  const marcasAterriza = cintas.map((c) => svg`<rect class="bm-aterriza" x=${r1(c.u0)} y=${r1(c.y1)} width=${r1(Math.max(0.8, c.u1 - c.u0))} height=${angosto ? 3 : 4} fill=${c.t.destacada ? tono : P.regla} />`);

  // Rótulos de los destinos: nombre y cifra debajo del aterrizaje.
  const cuantos = angosto ? Math.min(5, destinos.length) : destinos.length;
  const pFoco = centro.get(foco);
  const etiquetas = [];
  if (pFoco) {
    const texto = `Salen de ${angosto ? corto(foco) : nombre(foco)}`;
    etiquetas.push({x: pFoco[0], y: pFoco[1] + yMapa, w: anchoTexto(texto, tam, 700), h: tam + 6, renglones: [{texto, peso: 700}], separacion: 8});
  }
  for (const k of destinos.slice(0, cuantos)) {
    const a = aterriza.get(k);
    const renglones = [{texto: angosto ? corto(k) : nombre(k), peso: 700}, {texto: formato(porDest.get(k)), color: P.tinta2}];
    const w = Math.max(...renglones.map((r) => anchoTexto(r.texto, tam, r.peso ?? 400))), h = 2 * renglon + 3;
    etiquetas.push({x: a.x, y: a.y, w, h, renglones, separacion: 6,
      candidatas: [[-w / 2, 7, "middle"], [a.w / 2 + 6, -h / 2 + 4, "start"], [-a.w / 2 - 6 - w, -h / 2 + 4, "end"], [-w / 2, 18, "middle"], [a.w / 2 + 14, 6, "start"], [-a.w / 2 - 14 - w, 6, "end"]]});
  }
  const obstaculos = [...aterriza.values()].map((a) => [a.x0 - 1, a.y - 3, a.x0 + a.w + 1, a.y + 5]);
  const textos = colocar(etiquetas, {ancho: W, alto: H, obstaculos}).filter((e) => e.cabe).map((e) => rotulo(e.tx, e.caja[1] + tam, e.renglones, {ancla: e.ancla, tam}));

  const mayores = destinos.slice(0, 3).map((k) => `${nombre(k)} (${formato(porDest.get(k))})`).join(", ");
  const etiqueta = `${formato(total)} ${unidad} salieron de ${nombre(foco)}. Por ${tramos.map((t) => `${t.c}: ${pct(100 * t.v / total)}`).join("; ")}. Sus destinos mayores: ${mayores}.`;
  const dibujo = svg`<svg class="barra-mapa" width=${W} height=${Math.ceil(H)} viewBox="0 0 ${W} ${Math.ceil(H)}" role="group" aria-label=${etiqueta} style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    <defs>
      <linearGradient id=${ids.d} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color=${tono} stop-opacity="0.22" /><stop offset="0.65" stop-color=${tono} stop-opacity="0.5" /><stop offset="1" stop-color=${tono} stop-opacity="0.82" /></linearGradient>
      <linearGradient id=${ids.n} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color=${P.contexto} stop-opacity="0.14" /><stop offset="1" stop-color=${P.contexto} stop-opacity="0.42" /></linearGradient>
      <linearGradient id=${ids.r} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color=${P.contexto} stop-opacity="0.5" /><stop offset="1" stop-color=${P.contexto} stop-opacity="0" /></linearGradient>
    </defs>
    <g transform=${`translate(0,${yMapa})`}>${mapa.capa}</g>
    <g class="bm-cintas">${restosSvg}${cintasSvg}</g>
    <g class="bm-barra">${barra}</g>
    <g aria-hidden="true" pointer-events="none">${marcasAterriza}</g>
    <g aria-hidden="true" pointer-events="none">${rotulosBarra}${textos}</g>
    ${pFoco ? svg`<circle cx=${r1(pFoco[0])} cy=${r1(pFoco[1] + yMapa)} r="3.6" fill=${P.tinta} stroke=${P.fondo} stroke-width="1.2" pointer-events="none" />` : ""}
  </svg>`;

  // Leyenda fuera del lienzo: qué es cada color y cómo se lee el ancho.
  const hayBajos = cintas.some(bajo);
  const leyenda = html`<div class="forma-leyendas">${leyendaItems([
    ...(destacada ? [{tipo: "cuadro", color: tono, texto: destacada}] : []),
    {tipo: "cuadro", color: P.contexto, texto: destacada ? "Las demás categorías" : "Categorías"},
    ...(restos.length ? [{tipo: "cuadro", color: P.apagado, texto: `Cinta que se desvanece: a ${rotuloOtras} (${nOtras})`}] : []),
    ...(hayBajos ? [{tipo: "punteada", color: P.tinta2, texto: `Menos de ${minimo} casos en la muestra`}] : []),
  ])}<span class="bm-nota">Ancho de la cinta: personas. Al aterrizar, ${kAbajo < kArriba * 0.98 ? `${entero(Math.round(kArriba / kAbajo))} veces más angosta que en la barra` : "igual que en la barra"}.</span></div>`;
  const nodo = html`<div class="forma forma-barra-mapa">${leyenda}${dibujo}</div>`;
  nodo.pares = [
    ...cintas.map((c) => datoCinta(c)),
    ...restos.map((r) => ({origen: nombre(foco), destino: `${rotuloOtras[0].toUpperCase()}${rotuloOtras.slice(1)} (${r.n})`, categoria: r.t.c, valor: r.v, casos: r.casos, total, totalCategoria: totalCat(r.t.c), totalDestino: null, otras: true})),
  ];
  nodo.total = total; nodo.destinos = destinos; nodo.hayBajos = hayBajos;
  return nodo;
}
