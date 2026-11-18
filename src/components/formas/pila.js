// formas/pila.js
// ¿Cuánto más o cuánto menos hay ahora que antes? De dos a seis cantidades,
// cada una como una pila de figuras que se puede contar. Cada pila lleva su
// cifra arriba, y la diferencia entre la primera y la última va anotada con
// una flecha y el color de su signo.
// No: tasas o porcentajes (la pila solo tiene sentido con algo que se cuenta),
// ni más de seis cantidades (ahí va el histograma de unidades o las líneas).
import * as d3 from "npm:d3";
import {svg, html} from "npm:htl";
import {P, sentido} from "../paleta.js";
import {entero, cambioRelativo, puntos} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {nuevoId, simbolos, refGlifo, proporcionDe, usar, tamanoUnidad, textoUnidad, leyendaFiguras, anchoTexto, partir, tintaLegible, azarSemilla} from "./unidad.js";

const acotar = (v, a, b) => Math.max(a, Math.min(b, v));

// datos: una fila por cantidad, en orden (de 2 a 6). etiqueta(d), valor(d),
// color(d, i). `unidad`: cuánto vale cada figura; si no se da, se elige para
// que la pila más alta tenga 60 figuras o menos. La última figura de cada
// pila se dibuja parcial. `diferencia`: "relativo" (cambio en %), "puntos"
// (resta) o null (sin anotación). `colorCambio(s)`: color del signo, con s en
// "baja" | "sube" | "igual" (el `color` de `significado()` del capítulo).
// `rotuloCambio(primera, ultima)`: texto que acompaña a la diferencia.
// El dato del globo lleva además `unidad`, `figuras`, `primero` y `cambio`
// (frente a la primera pila). El nodo trae `unidad`, `cambio` y `resumen`.
export function pila(datos, {ancho, etiqueta, valor, color = () => P.serie, unidad = null, nombreUnidad = "personas", unidadSingular = "persona",
  glifo = "figura", formato = entero, diferencia = "relativo", colorCambio = null, rotuloCambio = null, semilla = 41, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null && +valor(d) >= 0);
  const vMax = Math.max(0, ...filas.map((d) => +valor(d)));
  if (!filas.length || !vMax) return vacio();
  const m = filas.length, K = unidad ?? tamanoUnidad(vMax, {tope: 60});
  const prop = proporcionDe(glifo), aire = glifo === "punto" ? 1.1 : 1.05;

  // ---- Geometría: cada cantidad ocupa una franja; la pila tiene `c` figuras
  // de ancho y crece hacia arriba.
  // A la izquierda, un eje discreto con la cantidad (como en la pila de
  // referencia): la pila sigue siendo una barra que se puede leer.
  const marcasEje = d3.ticks(0, vMax, ancho < 560 ? 3 : 4).filter((t) => t > 0 && t <= vMax);
  const ml = Math.ceil(Math.max(0, ...marcasEje.map((t) => anchoTexto(formato(t), 11.5)))) + 10;
  const hueco = (ancho - ml - 2) / m, anchoPila = Math.min(hueco * 0.62, 150);
  const altoMax = acotar(ancho * 0.45, 220, 360), nMax = vMax / K;
  let c = 3, s = 10;
  for (c = 3; c <= 12; c++) {
    s = Math.min(18, anchoPila / c);
    if (Math.ceil(nMax / c) * s * prop * aire <= altoMax) break;
  }
  c = Math.min(c, 12); s = Math.min(18, anchoPila / c);
  const uh = s * prop * aire, fw = s * 0.9, fh = fw * prop;

  // Cifras sobre las pilas: se achican hasta caber y, si aun así se encima
  // una con la de su vecina, sube un renglón sobre ella. Las alturas se
  // calculan primero respecto del suelo (0) y luego se reserva arriba el
  // espacio que hagan falta.
  const cifras = filas.map((d) => String(formato(valor(d))));
  const largo = Math.max(...cifras.map((t) => t.length));
  const fCifra = acotar((hueco * 0.94) / (largo * 0.6), 11.5, m <= 3 ? 20 : 16);
  const rens = Math.ceil(nMax / c);
  const figurasDe = (d) => { const e = +valor(d) / K, ll = Math.floor(e + 1e-9); return ll + (e - ll >= 0.08 ? 1 : 0); };
  const relCifra = [];
  for (const [i, d] of filas.entries()) {
    let yc = -Math.ceil(figurasDe(d) / c) * uh - 8;
    const w = anchoTexto(cifras[i], fCifra, true);
    for (let vuelta = 0; vuelta < m; vuelta++) {
      const choca = relCifra.find((o, j) => Math.abs(hueco * (i - j)) < (w + o.w) / 2 + 6 && Math.abs(yc - o.y) < fCifra + 2);
      if (!choca) break;
      yc = choca.y - fCifra - 3;
    }
    relCifra.push({y: yc, w});
  }
  const T = diferencia && m > 1 ? 52 : 6;
  const base = T + 4 + fCifra - Math.min(...relCifra.map((o) => o.y));
  const etiquetas = filas.map((d) => partir(String(etiqueta(d)), Math.max(6, Math.floor(hueco / 7.2))));
  const H = Math.ceil(base + 8 + 16 * Math.max(...etiquetas.map((e) => e.length)) + 4);

  const id = nuevoId("pi"), azar = azarSemilla(semilla);
  const a0 = +valor(filas[0]);
  const cambioDe = (v) => (diferencia === "puntos" ? v - a0 : a0 ? (100 * (v - a0)) / a0 : null);
  const cimas = [];
  const pilas = filas.map((d, i) => {
    const v = +valor(d), exacto = v / K, llenas = Math.floor(exacto + 1e-9), resto = exacto - llenas, tono = color(d, i);
    const cx = ml + hueco * (i + 0.5), x0 = cx - (c * s) / 2;
    const lugar = (u) => [x0 + (u % c) * s + (s - fw) / 2, base - Math.floor(u / c) * uh - fh - (uh - fh) / 2];
    const interior = svg`<g stroke="none"></g>`;
    for (let u = 0; u < llenas; u++) {
      const [x, y] = lugar(u);
      interior.appendChild(usar(refGlifo(id, Math.floor(azar() * 3), glifo), x, y, fw, fh, tono, {entra: (600 * Math.floor(u / c)) / rens}));
    }
    // La figura que no se completa: su silueta en el MISMO color, tenue, y
    // encima la parte que sí hay, recortada de abajo hacia arriba. No va en
    // gris: el gris se lee como otra categoría («no cumple»).
    const parcial = resto >= 0.08;
    if (parcial) {
      const [x, y] = lugar(llenas), postura = Math.floor(azar() * 3), recorte = `${id}-r${i}`;
      const sombra = usar(refGlifo(id, postura, glifo), x, y, fw, fh, tono);
      sombra.setAttribute("fill-opacity", "0.22");
      interior.appendChild(sombra);
      interior.appendChild(svg`<clipPath id=${recorte}><rect x=${x - 1} y=${y + fh * (1 - resto)} width=${fw + 2} height=${fh * resto} /></clipPath>`);
      const parte = usar(refGlifo(id, postura, glifo), x, y, fw, fh, tono);
      parte.setAttribute("clip-path", `url(#${recorte})`);
      interior.appendChild(parte);
    }
    const yCifra = base + relCifra[i].y;
    cimas.push(yCifra - fCifra);
    const nodo = svg`<g class="marca-viva unidad-grupo" tabindex="0">
      <rect class="unidad-zona" x=${cx - hueco / 2 + 2} y=${T} width=${hueco - 4} height=${H - T - 2} rx="5" fill="transparent" />
      ${interior}
      <text aria-hidden="true" x=${cx} y=${yCifra} text-anchor="middle" font-size=${fCifra} font-weight="800" fill=${P.tinta}>${cifras[i]}</text>
      ${etiquetas[i].map((t, k) => svg`<text aria-hidden="true" x=${cx} y=${base + 20 + 16 * k} text-anchor="middle" font-size=${TIPO.ejes + 1} font-weight="700" fill=${P.tinta}>${t}</text>`)}
    </g>`;
    if (g) globoEn(nodo, g, {...d, unidad: K, figuras: exacto, primero: filas[0], cambio: i ? cambioDe(v) : null});
    return nodo;
  });

  // ---- Diferencia entre la primera y la última: un corchete con flecha, la
  // cifra con su signo y su color.
  let anotacion = "", cambio = null, textoCambio = "";
  if (diferencia && m > 1) {
    const b0 = +valor(filas[m - 1]);
    cambio = cambioDe(b0);
    const signo = sentido(a0, b0, {umbral: diferencia === "puntos" ? 0.05 : Math.abs(a0) * 0.0005});
    const tono = tintaLegible(colorCambio ? colorCambio(signo) : P.tinta);
    textoCambio = cambio == null ? "" : diferencia === "puntos" ? puntos(cambio) : cambioRelativo(cambio);
    const acompana = rotuloCambio ? rotuloCambio(filas[0], filas[m - 1]) : `de ${etiqueta(filas[0])} a ${etiqueta(filas[m - 1])}`;
    const x1 = ml + hueco * 0.5, x2 = ml + hueco * (m - 0.5), yArco = T - 22, r = 9;
    const wTexto = anchoTexto(textoCambio, 17, true) + 8 + anchoTexto(acompana, 12);
    const xc = acotar((x1 + x2) / 2, wTexto / 2 + 2, ancho - wTexto / 2 - 2) - wTexto / 2;
    anotacion = svg`<g aria-hidden="true">
      <path d=${`M${x1},${cimas[0] - 5}L${x1},${yArco + r}Q${x1},${yArco} ${x1 + r},${yArco}L${x2 - r},${yArco}Q${x2},${yArco} ${x2},${yArco + r}L${x2},${cimas[m - 1] - 5}`} fill="none" stroke=${tono} stroke-width="1.5" stroke-linecap="round"/>
      <path d=${`M${x2 - 4.5},${cimas[m - 1] - 11}L${x2},${cimas[m - 1] - 5}L${x2 + 4.5},${cimas[m - 1] - 11}`} fill="none" stroke=${tono} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x=${xc} y=${yArco - 8} font-size="17" font-weight="800" fill=${tono}>${textoCambio}</text>
      <text x=${xc + anchoTexto(textoCambio, 17, true) + 8} y=${yArco - 8} font-size="12" fill=${P.tinta2}>${acompana}</text>
    </g>`;
  }
  // Rejilla del eje: la marca t queda a la altura de t / K figuras repartidas
  // en filas de c; la cifra exacta va sobre cada pila.
  const yEje = (t) => base - (t / K / c) * uh;
  const suelo = svg`<g aria-hidden="true">
    ${marcasEje.map((t) => svg`<g><line x1=${ml - 4} x2=${ml + hueco * m} y1=${yEje(t)} y2=${yEje(t)} stroke=${P.rejilla} /><text x=${ml - 8} y=${yEje(t) + 4} text-anchor="end" font-size="11.5" fill=${P.tinta2}>${formato(t)}</text></g>`)}
    <line x1=${ml - 4} x2=${ml + hueco * m} y1=${base + 0.5} y2=${base + 0.5} stroke=${P.regla} />
    <text x=${ml - 8} y=${base + 4} text-anchor="end" font-size="11.5" fill=${P.tinta2}>0</text>
  </g>`;
  const descripcion = `${m} pilas de figuras. ${textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular, glifo})}. ${filas.map((d, i) => `${etiqueta(d)}: ${cifras[i]}`).join(". ")}.${textoCambio ? ` Diferencia entre la primera y la última: ${textoCambio}.` : ""}`;
  const dibujo = svg`<svg class="pila" role="group" aria-label=${descripcion} width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    ${simbolos(id, {glifo})}${suelo}${pilas}${anotacion}
  </svg>`;
  const nodo = html`<div class="forma">${leyendaFiguras([{color: color(filas[0], 0), glifo, texto: textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular, glifo})}])}${dibujo}</div>`;
  nodo.unidad = K; nodo.cambio = cambio;
  nodo.resumen = filas.map((d, i) => ({...d, unidad: K, figuras: +valor(d) / K, primero: filas[0], cambio: i ? cambioDe(+valor(d)) : null}));
  return nodo;
}
