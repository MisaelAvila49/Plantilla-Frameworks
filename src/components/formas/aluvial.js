// formas/aluvial.js
// ¿Quién envía y quién recibe? Aluvial entre dos lados: a la izquierda los
// lugares o categorías de salida y a la derecha los de llegada, cada lado
// ordenado por su tamaño, con una cinta por cada par. Un nodo puede ir
// DESTACADO: sus cintas conservan el color y las demás pasan a gris. El flujo
// principal de lo destacado lleva una anotación directa con línea guía.
// Exige que la fuente observe a las mismas unidades en los dos lados (de
// dónde salió y a dónde llegó cada persona). Con dos levantamientos
// independientes corresponde formas/apiladas-flujo.js.
// Comparte con formas/sankey.js la geometría de la cinta y sus estilos. No lo
// envuelve porque sankey.js usa la misma lista de categorías, en el mismo
// orden y con el color del origen, en todas las etapas, y aquí cada lado
// tiene su propio orden, hay resalte, porcentajes en los dos extremos y
// anotación. Para tres o más etapas con las mismas categorías se usa sankey.
// No: más de unos nueve nodos por lado (el resto se agrupa en «Otras»).
import * as d3 from "npm:d3";
import {svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {lienzo, rotulo, separar, partir, anchoTexto} from "./anotaciones.js";

// flujos: una fila por par. origen(d), destino(d), valor(d) y, optativo,
// casos(d). `maximo`: nodos con nombre por lado (los demás se suman en
// `otras`). `destacar`: {lado: "origen" | "destino", nombre}. `color`: el de
// lo destacado (o el de todo, si no hay resalte). `corto(nombre)`: nombre
// abreviado para pantallas angostas. `anotacion(cinta)`: texto de la
// anotación del flujo principal, o null para no anotar. El dato del globo de
// una cinta es {origen, destino, valor, casos, totalOrigen, totalDestino,
// total} y el de un nodo (`globoNodo`), {lado, nombre, valor, total}.
export function aluvial(flujos, {
  ancho, origen, destino, valor, casos = null, maximo = 8, otras = "Otras", destacar = null, color = null,
  tituloOrigen = "Origen", tituloDestino = "Destino", corto = null, anotacion = null, formatoParte = pct, alto = null, globo: g, globoNodo = null,
}) {
  const filas = flujos.filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const angosto = ancho < 520, tono = color ?? P.serie;
  const W = Math.min(ancho, 1040);
  const total = d3.sum(filas, valor);

  // Los nodos mayores de cada lado conservan su nombre y el resto se agrupa.
  const lado = (acceso) => {
    const sumas = d3.rollups(filas, (f) => d3.sum(f, valor), acceso).sort((a, b) => b[1] - a[1]);
    const propios = new Set(sumas.slice(0, maximo).map(([k]) => k));
    return {de: (d) => (propios.has(acceso(d)) ? acceso(d) : otras), hayOtras: sumas.length > maximo};
  };
  const izq = lado(origen), der = lado(destino);
  const pares = d3.rollups(filas, (f) => ({valor: d3.sum(f, valor), casos: casos ? d3.sum(f, (d) => casos(d) ?? 0) : null}), izq.de, der.de)
    .flatMap(([o, lista]) => lista.map(([d, s]) => ({origen: o, destino: d, ...s})));
  const ordenar = (acceso) => {
    const sumas = d3.rollups(pares, (f) => d3.sum(f, (r) => r.valor), acceso);
    return sumas.sort((a, b) => (a[0] === otras) - (b[0] === otras) || b[1] - a[1]).map(([nombre, v]) => ({nombre, valor: v, total}));
  };
  const nodosO = ordenar((r) => r.origen).map((n) => ({...n, lado: "origen"})), nodosD = ordenar((r) => r.destino).map((n) => ({...n, lado: "destino"}));

  // Anotación: el flujo mayor de lo destacado (o de todo, si no hay resalte).
  const resaltada = (r) => destacar != null && (destacar.lado === "destino" ? r.destino : r.origen) === destacar.nombre;
  const candidatas = pares.filter((r) => (destacar ? resaltada(r) : true) && r.origen !== otras && r.destino !== otras);
  const principal = d3.greatest(candidatas, (r) => r.valor) ?? null;
  const totalDe = new Map([...nodosO.map((n) => [`o|${n.nombre}`, n.valor]), ...nodosD.map((n) => [`d|${n.nombre}`, n.valor])]);
  for (const r of pares) { r.totalOrigen = totalDe.get(`o|${r.origen}`); r.totalDestino = totalDe.get(`d|${r.destino}`); r.total = total; }
  const nota = anotacion && principal ? partir(anotacion(principal), angosto ? Math.floor((W - 26) / (12 * 0.56)) : 40) : [];

  const grosor = 14, hueco = angosto ? 5 : 7, mt = 30, borde = angosto ? 92 : 190;
  // La nota va sobre el dibujo si cabe entre las dos columnas de nodos; si
  // no (pantallas angostas), va debajo, con una marca que la une a la cinta.
  const tamNota = angosto ? 12 : 13;
  const anchoNota = nota.length ? Math.max(...nota.map((r) => anchoTexto(r, tamNota))) + 16 : 0;
  const notaAbajo = nota.length > 0 && anchoNota > W - 2 * borde - 2 * grosor - 12;
  const mb = notaAbajo ? nota.length * tamNota * 1.25 + 22 : 10;
  const H = alto ?? Math.round(Math.max(380, Math.min(540, W * 0.52))) + mb;
  const k = (H - mt - mb - hueco * (Math.max(nodosO.length, nodosD.length) - 1)) / total;
  const x0 = borde, x1 = W - borde - grosor;
  const acomodar = (nodos) => { let y = mt; for (const n of nodos) { n.y0 = y; n.y1 = y + n.valor * k; n.cursor = y; y = n.y1 + hueco; } return new Map(nodos.map((n) => [n.nombre, n])); };
  const mapaO = acomodar(nodosO), mapaD = acomodar(nodosD);

  // Cintas: salen de cada nodo en el orden de los nodos de llegada, y llegan
  // en el orden de los de salida, para cruzarse lo menos posible.
  const posD = new Map(nodosD.map((n, i) => [n.nombre, i])), posO = new Map(nodosO.map((n, i) => [n.nombre, i]));
  for (const r of d3.sort(pares, (r) => posO.get(r.origen), (r) => posD.get(r.destino))) { const n = mapaO.get(r.origen); r.ya = n.cursor; n.cursor += r.valor * k; }
  for (const r of d3.sort(pares, (r) => posD.get(r.destino), (r) => posO.get(r.origen))) { const n = mapaD.get(r.destino); r.yb = n.cursor; n.cursor += r.valor * k; }
  const xa = x0 + grosor, xb = x1, xm = (xa + xb) / 2;
  // Las resaltadas se dibujan al final, encima de las grises. Reciben foco de
  // teclado las resaltadas o, sin resalte, las doce cintas mayores.
  const rango = new Map(d3.sort(pares, (r) => -r.valor).map((r, i) => [r, i]));
  // Lo agrupado en «Otras» queda más tenue: es resto, no protagonista.
  const deOtras = (r) => r.origen === otras || r.destino === otras;
  const cintas = d3.sort(pares, (r) => +resaltada(r), (r) => -r.valor).map((r, i) => {
    const h = Math.max(0.6, r.valor * k), viva = destacar == null || resaltada(r);
    const nodo = svg`<path class="marca-viva sankey-cinta ff-aparece" tabindex=${(destacar != null ? viva : rango.get(r) < 12) ? 0 : null} style=${`--i:${Math.min(i, 12)}`}
      d=${`M${xa},${r.ya}C${xm},${r.ya} ${xm},${r.yb} ${xb},${r.yb}L${xb},${r.yb + h}C${xm},${r.yb + h} ${xm},${r.ya + h} ${xa},${r.ya + h}Z`}
      fill=${viva ? tono : P.contexto} fill-opacity=${destacar == null ? (deOtras(r) ? 0.16 : 0.3) : viva ? 0.62 : deOtras(r) ? 0.12 : 0.24} />`;
    if (g) globoEn(nodo, g, r);
    return nodo;
  });

  // Nodos y sus rótulos: nombre y parte del total, en los dos extremos.
  const tam = angosto ? 11.5 : TIPO.valor;
  const cajas = [], textos = [];
  for (const [nodos, x, izquierda] of [[nodosO, x0, true], [nodosD, x1, false]]) {
    const lugares = separar(nodos.map((n) => ({pos: (n.y0 + n.y1) / 2, tam: tam + 2})), {min: mt - 4, max: H - mb + 4, hueco: 0});
    nodos.forEach((n, i) => {
      const propio = destacar != null && destacar.lado === n.lado && destacar.nombre === n.nombre;
      const caja = svg`<rect class="marca-viva" tabindex="0" x=${x} y=${n.y0} width=${grosor} height=${Math.max(1.2, n.y1 - n.y0)} rx="2" fill=${destacar == null || propio ? tono : n.nombre === otras ? P.contexto : P.resumen} />`;
      if (globoNodo) globoEn(caja, globoNodo, n);
      cajas.push(caja);
      const nombre = angosto && corto ? corto(n.nombre) : n.nombre;
      textos.push(svg`<text x=${izquierda ? x - 8 : x + grosor + 8} y=${lugares[i].lugar + tam * 0.36} text-anchor=${izquierda ? "end" : "start"} font-size=${tam} pointer-events="none"><tspan font-weight=${propio ? 700 : 600} fill=${P.tinta}>${nombre}</tspan><tspan dx="6" fill=${P.tinta2}>${formatoParte(100 * n.valor / total)}</tspan></text>`);
    });
  }
  const titulos = [svg`<text x=${x0 + grosor} y="14" text-anchor="end" font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${tituloOrigen}</text>`,
    svg`<text x=${x1} y="14" text-anchor="start" font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${tituloDestino}</text>`];

  // Anotación sobre el dibujo, junto al flujo principal: un recuadro del
  // color del fondo arriba o abajo de la cinta, con una guía corta. Así la
  // guía no cruza las demás cintas.
  let apunte = "";
  if (nota.length) {
    const h = principal.valor * k, px = xm, py = (principal.ya + principal.yb) / 2 + h / 2;
    const bw = anchoNota, bh = nota.length * tamNota * 1.25 + 10;
    const arriba = py - h / 2 - 16 - bh, abajo = py + h / 2 + 16;
    const by = arriba >= mt ? arriba : Math.min(abajo, H - mb - bh);
    const bx = Math.max(xa + 6, Math.min(xb - 6 - bw, px - bw / 2));
    const ey = by > py ? by : by + bh;
    apunte = notaAbajo ? svg`<g class="ff-aparece aluvial-nota" style="--i:14" pointer-events="none">
      <circle cx=${px} cy=${py} r="5" fill=${P.fondo} stroke=${P.tinta} stroke-width="1.4" />
      <text x=${px} y=${py} dy="0.35em" text-anchor="middle" font-size="8" font-weight="700" fill=${P.tinta}>1</text>
      <circle cx="7" cy=${H - mb + 14 + tamNota * 0.1} r="5" fill=${P.fondo} stroke=${P.tinta} stroke-width="1.4" />
      <text x="7" y=${H - mb + 14 + tamNota * 0.1} dy="0.35em" text-anchor="middle" font-size="8" font-weight="700" fill=${P.tinta}>1</text>
      ${rotulo(18, H - mb + 14 + tamNota * 0.45, nota, {tam: tamNota, halo: false, interlinea: 1.25})}
    </g>` : svg`<g class="ff-aparece aluvial-nota" style="--i:14" pointer-events="none">
      <line x1=${px} y1=${py} x2=${px} y2=${ey} stroke=${P.tinta} stroke-width="1" />
      <circle cx=${px} cy=${py} r="3.2" fill=${P.fondo} stroke=${P.tinta} stroke-width="1.4" />
      <rect x=${bx} y=${by} width=${bw} height=${bh} rx="4" fill=${P.fondo} fill-opacity="0.94" stroke=${P.borde} stroke-width="0.8" />
      ${rotulo(bx + 8, by + 5 + tamNota, nota, {tam: tamNota, halo: false, interlinea: 1.25})}
    </g>`;
  }

  const dibujo = lienzo({
    clase: "aluvial", ancho: W, alto: H,
    etiqueta: `Aluvial de ${nodosO.length} nodos de salida a ${nodosD.length} de llegada.${principal ? ` El flujo ${destacar ? "mayor de lo destacado" : "mayor"} va de ${principal.origen} a ${principal.destino}: ${formatoParte(100 * principal.valor / total)} del total.` : ""}`,
  }, svg`<g aria-hidden="true">${titulos}</g>`, svg`<g>${cintas}</g>`, svg`<g>${cajas}</g>`, svg`<g aria-hidden="true">${textos}</g>`, apunte);
  dibujo.pares = pares;
  dibujo.principal = principal;
  return dibujo;
}
