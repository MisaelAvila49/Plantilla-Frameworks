// formas/enjambre.js
// ¿Dónde cae cada unidad y cuánto pesa? Enjambre de burbujas sobre un eje:
// cada burbuja es una unidad (un municipio, una entidad), su posición sobre
// el eje es el indicador y su área, el número de personas. Un GRUPO puede ir
// destacado en color mientras el resto queda en gris. Solo las burbujas
// mayores llevan nombre, y la línea de referencia (el promedio) se rotula
// fuera del lienzo. La distancia de una burbuja al eje central no significa
// nada: solo evita que se encimen.
// En pantallas angostas el eje pasa a vertical.
// No: más de unas 500 unidades, ni indicadores que no comparten universo.
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pctMarca, entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, conLeyenda, azarEstable, TIPO} from "./comun.js";
import {lienzo, rotulo, separar, partir, anchoTexto} from "./anotaciones.js";

// Acomodo sin colisiones, por pasos y sin azar: de la burbuja mayor a la
// menor, cada una toma el lugar libre más cercano al eje central. `u` es la
// posición sobre el eje (fija, es el dato) y `w` la separación del centro.
function empacar(nodos, sep) {
  const puestos = [];
  for (const n of nodos) {
    const cerca = puestos.filter((p) => Math.abs(p.u - n.u) < p.r + n.r + sep);
    const candidatas = [0];
    for (const p of cerca) {
      const dd = p.r + n.r + sep, du = n.u - p.u, h = Math.sqrt(Math.max(0, dd * dd - du * du)) + 0.01;
      candidatas.push(p.w + h, p.w - h);
    }
    candidatas.sort((a, b) => Math.abs(a) - Math.abs(b) || n.lado * (a - b));
    n.w = candidatas.find((w) => cerca.every((p) => (p.u - n.u) ** 2 + (p.w - w) ** 2 >= (p.r + n.r + sep) ** 2 - 1e-6)) ?? 0;
    puestos.push(n);
  }
  return d3.max(puestos, (p) => Math.abs(p.w) + p.r) ?? 0;
}

// datos: una fila por unidad. valor(d) posición sobre el eje, tamano(d)
// personas (área de la burbuja), id(d) clave estable, nombre(d) rótulo.
// destacado(d): true para las unidades del grupo destacado (sin él, todas
// van en color). `dominio`: extremos FIJOS del eje. Con `tope`, lo que pasa
// del extremo se junta en él y la marca dice «o más». `tamanoMax`: valor al
// que corresponde el radio máximo, también fijo. `referencia`: {valor,
// texto}. `rotulos`: cuántas burbujas llevan nombre. `vertical`: eje hacia
// arriba (por omisión, en pantallas angostas).
export function enjambre(datos, {
  ancho, valor, tamano, id = (d) => JSON.stringify(d), nombre = () => "", destacado = null, color = null, dominio = [0, 100], tope = false,
  tamanoMax = null, radioMax = null, referencia = null, rotulos = null, enfocables = 12, vertical = null, largo = 540,
  formatoEje = pctMarca, formatoTamano = entero, rotuloEje = null, textoDestacado = "Grupo destacado", textoResto = "Las demás unidades", unidadTamano = "personas", globo: g,
}) {
  const filas = datos.filter((d) => valor(d) != null && tamano(d) > 0);
  if (!filas.length) return vacio();
  const enPie = vertical ?? ancho < 640, angosto = ancho < 520;
  const tono = color ?? P.serie;
  const W = enPie ? Math.min(ancho, 620) : ancho;
  const propio = (d) => (destacado ? Boolean(destacado(d)) : true);
  const cuantos = rotulos ?? (angosto ? 4 : 6);
  const tam = angosto ? 11.5 : TIPO.valor;
  const tMax = tamanoMax ?? d3.max(filas, tamano);

  // Márgenes: el eje del indicador va abajo (o a la izquierda si está en pie)
  // y los nombres, en renglones fuera del enjambre.
  const mEje = enPie ? 52 : 16, mFin = enPie ? 14 : 16, mRot = enPie ? (angosto ? 108 : 150) : 34;
  // En pie, el título del eje va arriba y se parte en renglones que quepan.
  const tamTitulo = TIPO.ejes - 1;
  const lineasTitulo = rotuloEje && enPie ? partir(`${rotuloEje}${tope ? `. Arriba, ${formatoEje(dominio[1])} o más` : ""}`, Math.floor((W - 4) / (tamTitulo * 0.6))) : [];
  const arribaEje = 34 + Math.max(0, lineasTitulo.length - 1) * (tamTitulo + 3);
  const eje = d3.scaleLinear(dominio, enPie ? [largo - mFin, arribaEje] : [mEje, W - mFin]).clamp(true);
  const semiMax = enPie ? (W - mEje - mRot) / 2 - 4 : 150;
  let rMax = radioMax ?? (angosto ? 20 : 30), nodos = [], semi = 0;
  for (let vuelta = 0; vuelta < 10; vuelta++) {
    nodos = filas.map((d) => ({d, u: eje(valor(d)), r: Math.max(2.2, rMax * Math.sqrt(tamano(d) / tMax)), lado: azarEstable(id(d)) < 0.5 ? -1 : 1, propio: propio(d)}))
      .sort((a, b) => b.r - a.r || d3.ascending(id(a.d), id(b.d)));
    semi = empacar(nodos, 0.9);
    if (semi <= semiMax) break;
    rMax *= 0.86;
  }
  semi = Math.max(semi, 40);
  const H = enPie ? largo + 6 : mRot + 2 * semi + mRot + 40;
  const centro = enPie ? mEje + 4 + semiMax : mRot + semi;
  const xy = (n) => (enPie ? [centro + n.w, n.u] : [n.u, centro + n.w]);

  // Burbujas: primero el resto, encima el grupo destacado.
  const mayores = nodos.filter((n) => n.propio).slice(0, Math.max(cuantos, enfocables));
  const conFoco = new Set(mayores.slice(0, enfocables));
  const burbujas = d3.sort(nodos, (n) => +n.propio, (n) => -n.r).map((n, i) => {
    const [cx, cy] = xy(n);
    const nodo = svg`<circle class="marca-viva ff-burbuja" tabindex=${conFoco.has(n) ? 0 : null} style=${`--i:${i % 40}`} cx=${cx.toFixed(1)} cy=${cy.toFixed(1)} r=${n.r.toFixed(1)}
      fill=${n.propio ? tono : P.apagado} fill-opacity=${n.propio ? 0.86 : 1} stroke=${n.propio ? P.fondo : P.contexto} stroke-width=${n.propio ? 0.9 : 0.6} />`;
    if (g) globoEn(nodo, g, n.d);
    return nodo;
  });

  // Eje del indicador, con rejilla tenue y el extremo «o más» si hay tope.
  const marcasEje = d3.ticks(dominio[0], dominio[1], angosto ? 4 : 6);
  const textoMarca = (v) => `${formatoEje(v)}${tope && v === dominio[1] ? " o más" : ""}`;
  const ejeDibujo = marcasEje.map((v) => (enPie
    ? svg`<g><line x1=${mEje} x2=${W - mRot + 4} y1=${eje(v)} y2=${eje(v)} stroke=${P.rejilla} /><text x=${mEje - 6} y=${eje(v)} dy="0.35em" text-anchor="end" font-size=${TIPO.ejes - 1} fill=${P.tinta2}>${formatoEje(v)}</text></g>`
    : svg`<g><line x1=${eje(v)} x2=${eje(v)} y1=${mRot - 6} y2=${H - 34} stroke=${P.rejilla} /><text x=${eje(v)} y=${H - 18} text-anchor=${v === dominio[1] ? "end" : v === dominio[0] ? "start" : "middle"} font-size=${TIPO.ejes - 1} fill=${P.tinta2}>${textoMarca(v)}</text></g>`));
  const tituloEje = rotuloEje ? (enPie
    ? rotulo(2, 12, lineasTitulo, {tam: tamTitulo, peso: 600, color: P.tinta2, halo: false, interlinea: (tamTitulo + 3) / tamTitulo})
    : svg`<text x=${mEje} y=${H - 2} font-size=${TIPO.ejes - 1} font-weight="600" fill=${P.tinta2}>${rotuloEje}</text>`) : "";
  const linea = referencia?.valor != null ? (enPie
    ? svg`<line x1=${mEje} x2=${W - mRot + 4} y1=${eje(referencia.valor)} y2=${eje(referencia.valor)} stroke=${P.tinta2} stroke-width="1.4" stroke-dasharray="4 3"/>`
    : svg`<line x1=${eje(referencia.valor)} x2=${eje(referencia.valor)} y1=${mRot - 6} y2=${H - 34} stroke=${P.tinta2} stroke-width="1.4" stroke-dasharray="4 3"/>`) : "";

  // Nombres de las burbujas mayores, fuera del enjambre y con línea guía.
  const nombradas = mayores.slice(0, cuantos).map((n) => ({n, texto: String(nombre(n.d))})).filter((e) => e.texto);
  const guias = [], textos = [];
  if (enPie) {
    const lugares = separar(nombradas.map((e) => ({pos: e.n.u, tam: tam + 3})), {min: arribaEje - 4, max: largo - 4, hueco: 1});
    nombradas.forEach((e, i) => {
      const [cx, cy] = xy(e.n), tx = W - mRot + 10, ty = lugares[i].lugar;
      guias.push(svg`<path d=${`M${cx},${cy}L${tx - 4},${ty}`} fill="none" stroke=${P.tinta} stroke-width="0.8"/>`, svg`<circle cx=${cx} cy=${cy} r="1.8" fill=${P.tinta} />`);
      textos.push(rotulo(tx, ty + tam * 0.36, e.texto, {tam, peso: 600}));
    });
  } else {
    // Se reparten arriba y abajo, alternando a lo largo del eje.
    const porEje = d3.sort(nombradas, (e) => e.n.u);
    for (const arriba of [true, false]) {
      const fila = porEje.filter((_, i) => (i % 2 === 0) === arriba);
      const lugares = separar(fila.map((e) => ({pos: e.n.u, tam: anchoTexto(e.texto, tam, 600)})), {min: 4, max: W - 4, hueco: 12});
      fila.forEach((e, i) => {
        const [cx, cy] = xy(e.n), tx = lugares[i].lugar, ty = arriba ? mRot - 16 : H - 34 - (mRot - 22);
        guias.push(svg`<path d=${`M${cx},${cy}L${tx},${arriba ? ty + 5 : ty - tam}`} fill="none" stroke=${P.tinta} stroke-width="0.8"/>`, svg`<circle cx=${cx} cy=${cy} r="1.8" fill=${P.tinta} />`);
        textos.push(rotulo(tx, ty, e.texto, {ancla: "middle", tam, peso: 600}));
      });
    }
  }

  const nPropias = nodos.filter((n) => n.propio).length;
  const dibujo = lienzo({
    clase: "enjambre", ancho: W, alto: H,
    etiqueta: `Enjambre de ${entero(nodos.length)} burbujas sobre un eje de ${formatoEje(dominio[0])} a ${formatoEje(dominio[1])}${destacado ? `, con ${entero(nPropias)} destacadas` : ""}.${referencia ? ` ${referencia.texto}.` : ""}${nombradas[0] ? ` La mayor de las destacadas es ${nombradas[0].texto}.` : ""}`,
  }, svg`<g aria-hidden="true">${ejeDibujo}${tituloEje}</g>`, linea, svg`<g>${burbujas}</g>`, svg`<g aria-hidden="true" pointer-events="none" class="ff-aparece" style="--i:10">${guias}${textos}</g>`);

  // Leyendas fuera del lienzo: grupos, referencia y tamaño.
  const radio = (v) => Math.max(2.2, rMax * Math.sqrt(v / tMax));
  const muestras = [d3.ticks(0, tMax, 4).filter((v) => v > 0).at(-1), d3.ticks(0, tMax / 8, 2).filter((v) => v > 0).at(-1)].filter((v) => v > 0);
  const leyendaTamano = html`<div class="leyenda-items">
    <span class="leyenda-item"><span>Tamaño de la burbuja</span></span>
    ${muestras.map((v) => html`<span class="leyenda-item"><svg width=${2 * radio(v) + 2} height=${2 * radio(v) + 2} aria-hidden="true"><circle cx=${radio(v) + 1} cy=${radio(v) + 1} r=${radio(v)} fill="none" stroke=${P.tinta2} stroke-width="1"/></svg><span>${formatoTamano(v)} ${unidadTamano}</span></span>`)}
  </div>`;
  const leyenda = leyendaItems([
    ...(destacado ? [{tipo: "punto", color: tono, texto: textoDestacado}, {tipo: "punto", color: P.contexto, texto: textoResto}] : []),
    ...(referencia ? [{tipo: "punteada", color: P.tinta2, texto: referencia.texto}] : []),
  ]);
  return conLeyenda(html`<div class="forma-leyendas">${leyenda}${leyendaTamano}</div>`, dibujo);
}
