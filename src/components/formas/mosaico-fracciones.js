// formas/mosaico-fracciones.js
// ¿Qué parte de la población cumple la condición en cada entidad? El mosaico
// de las 32 entidades (rejilla mx_state_grid3) con un «de cada 100» chico en
// cada cuadro: cien puntos, los que cumplen en color y el resto en gris, con
// la cifra arriba. Todas las casillas usan la MISMA base: si en alguna la
// proporción es menor a 1 de cada 100, todas pasan a «de cada 1,000» y la
// leyenda lo dice (la misma regla de fraccion.js). Las anotaciones señalan la
// entidad elegida (o la más alta) y la más baja.
// Inspirada en The European Correspondent (Dispatch del 27 de octubre de 2026).
// En pantallas angostas los cuadros se ordenan de mayor a menor en cinco
// columnas, sin la forma del país, para que los puntos se sigan contando.
// No: comparar décimas entre entidades (va la tabla o el lollipop), ni
// valores que no son una parte de un todo.
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {deCada, entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {ENTIDADES, REJILLA, REJILLA_COLUMNAS, REJILLA_FILAS} from "../geografia.js";
import {TIPO} from "./comun.js";
import {baseFraccion} from "./fraccion.js";
import {tintaLegible, anchoTexto, partir, leyendaFiguras} from "./unidad.js";

const r1 = (v) => Math.round(v * 10) / 10;
const NS = "http://www.w3.org/2000/svg";
let serie = 0;

// valores: Map de clave de entidad al dato; valor(d) en 0-100 (null = sin
// dato). `color(d)`: tono de los puntos que cumplen. `destacar`: clave con
// contorno y anotación. `base`: 100 o 1,000 (si no, se elige sola con
// baseFraccion; 10,000 se escribe sobre 1,000). `frase(d, k, B)`: texto de la
// anotación. El dato del globo lleva `base` y `k`. El nodo trae `base`.
export function mosaicoFracciones(valores, {ancho, valor, color = () => P.serie, destacar = null, base = null, nombreUnidad = "personas",
  rotulos = {cumple: "Cumplen la condición", resto: "No la cumplen"}, ordenAngosto = null, frase = null, globo: g}) {
  const lista = ENTIDADES.map((e) => ({e, d: valores.get(e.cve) ?? null})).map((x) => ({...x, v: x.d == null ? null : valor(x.d)}));
  const B = base ?? Math.min(1000, baseFraccion(lista.map((x) => x.v)));
  for (const x of lista) x.k = x.v == null ? null : Math.round((x.v * B) / 100);
  const angosto = ancho < 560;
  const columnas = angosto ? 5 : REJILLA_COLUMNAS;
  const cw = Math.floor(Math.min(ancho, angosto ? ancho : 980) / columnas), lado = cw - (angosto ? 6 : 8);
  // Rejilla de puntos de cada casilla: 10 × 10 con base 100; 40 × 25 con 1,000.
  const [cols, rens] = B === 100 ? [10, 10] : [40, 25];
  const paso = lado / cols, altoRejilla = paso * rens;
  const cabeza = angosto ? 15 : 17;
  const ch = Math.ceil(cabeza + altoRejilla + (angosto ? 9 : 12));
  const lugares = new Map();
  if (angosto) {
    const orden = [...lista].sort(ordenAngosto ? (p, q) => ordenAngosto(p.d, q.d) : (p, q) => (q.v ?? -1) - (p.v ?? -1));
    orden.forEach(({e}, i) => lugares.set(e.cve, [i % columnas, Math.floor(i / columnas)]));
  } else for (const e of ENTIDADES) lugares.set(e.cve, REJILLA[e.cve]);
  const filas = angosto ? Math.ceil(ENTIDADES.length / columnas) : REJILLA_FILAS;
  const W = cw * columnas, H = ch * filas;
  const id = `mf${++serie}`;
  const fCifra = angosto ? 12.5 : 14;

  const celdas = lista.map(({e, d, v, k}) => {
    const [col, fila] = lugares.get(e.cve);
    const tono = d ? color(d) : P.sinDato;
    const tinta = tintaLegible(tono, 4.5);
    const puntos = [];
    if (v != null && B === 100) {
      // Cien puntos por casilla y 32 casillas: se crean con el DOM, no con
      // una plantilla, para que repintar al filtrar no se sienta.
      for (let u = 0; u < 100; u++) {
        const p = document.createElementNS(NS, "circle");
        p.setAttribute("cx", r1((u % cols) * paso + paso / 2)); p.setAttribute("cy", r1(cabeza + Math.floor(u / cols) * paso + paso / 2));
        p.setAttribute("r", r1(paso * 0.36)); p.setAttribute("fill", u < k ? tono : P.apagado);
        puntos.push(p);
      }
    } else if (v != null) {
      // Mil unidades: el resto es una trama de un solo rectángulo y solo las
      // que cumplen son marcas propias, encerradas en un marco de su color.
      puntos.push(svg`<rect x="0" y=${cabeza} width=${lado} height=${altoRejilla} style=${`fill:url(#${id}-trama)`} />`);
      for (let u = 0; u < k; u++) puntos.push(svg`<rect x=${r1((u % cols) * paso + paso * 0.1)} y=${r1(cabeza + Math.floor(u / cols) * paso + paso * 0.1)} width=${r1(paso * 0.8)} height=${r1(paso * 0.8)} fill=${tono} />`);
      if (k) for (let r = 0; r * cols < k; r++) {
        const n = Math.min(cols, k - r * cols);
        puntos.push(svg`<rect x="-1.5" y=${r1(cabeza + r * paso - 1.5)} width=${r1(n * paso + 3)} height=${r1(paso + 3)} rx="1.5" fill="none" stroke=${tono} stroke-width="1.2" />`);
      }
    } else {
      puntos.push(svg`<rect x="0" y=${cabeza} width=${lado} height=${altoRejilla} rx="3" fill=${P.sinDato} />`);
    }
    const esDestacada = e.cve === destacar;
    const cifra = v == null ? "" : k === 0 && v > 0 ? "<1" : entero(k);
    const nodo = svg`<g class="marca-viva mf-celda fc-aparece" tabindex="0" style=${`--i:${col + fila}`} transform=${`translate(${col * cw + (cw - lado) / 2},${fila * ch + 2})`}>
      <rect class="mf-fondo" x="-3" y="-2" width=${lado + 6} height=${ch - 4} rx="5" fill=${esDestacada ? P.fondo2 : "transparent"} stroke=${esDestacada ? P.tinta : "none"} stroke-width=${esDestacada ? 2.2 : 0} />
      <text x="0" y=${cabeza - 5} font-size=${angosto ? 10.5 : 11.5} font-weight="700" fill=${P.tinta}>${e.corto}</text>
      <text x=${lado} y=${cabeza - 4} text-anchor="end" font-size=${fCifra} font-weight="800" fill=${v == null ? P.tinta2 : tinta}>${v == null ? "Sin dato" : cifra}</text>
      <g pointer-events="none">${puntos}</g>
    </g>`;
    if (g) globoEn(nodo, g, {...(d ?? {cve: e.cve, entidad: e.nombre, _sinDato: true}), base: B, k});
    return {nodo, e, d, v, k, col, fila};
  });

  // Anotaciones en los huecos de la rejilla (solo con la forma del país):
  // arriba a la derecha, la entidad elegida o la más alta; abajo a la
  // izquierda, la más baja.
  const anotaciones = [];
  const conDato = celdas.filter((x) => x.v != null);
  if (!angosto && conDato.length) {
    const alta = celdas.find((x) => x.e.cve === destacar && x.v != null) ?? conDato.reduce((p, q) => (q.v > p.v ? q : p));
    const baja = conDato.reduce((p, q) => (q.v < p.v ? q : p));
    const texto = (x, prefijo) => frase ? frase(x.d, x.k, B, prefijo) : `${prefijo}${x.e.nombre}: ${deCada(x.v, B)} ${nombreUnidad}`;
    // Cada nota ocupa dos casillas vacías contiguas de la rejilla, las más
    // cercanas a su entidad, para que la línea guía sea corta y no cruce el país.
    const ocupadas = new Set([...lugares.values()].map(([c, f]) => `${c},${f}`));
    const libre = (c, f) => c >= 0 && c < REJILLA_COLUMNAS && f >= 0 && f < REJILLA_FILAS && !ocupadas.has(`${c},${f}`);
    const nota = (x, prefijo) => {
      let mejor = null;
      for (let f = 0; f < REJILLA_FILAS; f++) for (let c = 0; c < REJILLA_COLUMNAS - 1; c++) {
        if (!libre(c, f) || !libre(c + 1, f)) continue;
        const dist = Math.hypot(c + 1 - (x.col + 0.5), f - x.fila);
        if (!mejor || dist < mejor.dist) mejor = {c, f, dist};
      }
      if (!mejor) return "";
      ocupadas.add(`${mejor.c},${mejor.f}`); ocupadas.add(`${mejor.c + 1},${mejor.f}`);
      const renglones = partir(texto(x, prefijo), Math.floor((2 * cw - 8) / (TIPO.valor * 0.55)));
      const tx = mejor.c * cw + 4, ty = mejor.f * ch + 16;
      const caja = [tx - 2, ty - 13, tx + 2 * cw - 8, ty + (renglones.length - 1) * 15 + 4];
      const meta = [x.col * cw + (cw - lado) / 2 - 3, x.fila * ch, x.col * cw + (cw + lado) / 2 + 3, (x.fila + 1) * ch - 4];
      // Línea guía: del borde de la nota al borde de la casilla, por los puntos más cercanos.
      const cerca = (q, [x0, y0, x1, y1]) => [Math.max(x0, Math.min(x1, q[0])), Math.max(y0, Math.min(y1, q[1]))];
      const a = cerca([(meta[0] + meta[2]) / 2, (meta[1] + meta[3]) / 2], caja), b = cerca([(caja[0] + caja[2]) / 2, (caja[1] + caja[3]) / 2], meta);
      return svg`<g class="mf-nota fc-aparece" style="--i:14" aria-hidden="true" pointer-events="none">
        ${renglones.map((t, i) => svg`<text x=${tx} y=${ty + i * 15} font-size=${TIPO.valor} font-weight=${i === 0 ? 700 : 400} fill=${i === 0 ? P.tinta : P.tinta2}>${t}</text>`)}
        <path d=${`M${r1(a[0])},${r1(a[1])}L${r1(b[0])},${r1(b[1])}`} fill="none" stroke=${P.tinta2} stroke-width="1" />
        <circle cx=${r1(b[0])} cy=${r1(b[1])} r="2.4" fill=${P.tinta2} />
      </g>`;
    };
    anotaciones.push(nota(alta, alta.e.cve === destacar ? "" : "La más alta, "));
    if (baja !== alta) anotaciones.push(nota(baja, "La más baja, "));
  }

  const trama = B === 100 ? "" : svg`<defs><pattern id=${`${id}-trama`} x="0" y="0" width=${paso} height=${paso} patternUnits="userSpaceOnUse"><rect x=${paso * 0.18} y=${paso * 0.18} width=${paso * 0.64} height=${paso * 0.64} fill=${P.apagado} /></pattern></defs>`;
  const descripcion = `Mosaico de las 32 entidades; cada cuadro tiene ${entero(B)} ${B === 100 ? "puntos" : "unidades"} y los que van en color son las ${nombreUnidad} de cada ${entero(B)} que cumplen. ` +
    conDato.sort((p, q) => q.v - p.v).slice(0, 3).map((x) => `${x.e.nombre}: ${deCada(x.v, B)}`).join("; ") + ".";
  const dibujo = svg`<svg class="mosaico-fracciones" role="group" aria-label=${descripcion} width=${W} height=${H} viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif);overflow:visible">${trama}${celdas.map((x) => x.nodo)}${anotaciones}</svg>`;
  const tono0 = color(conDato[0]?.d ?? {});
  const leyenda = leyendaFiguras([
    {color: tono0, glifo: "punto", texto: rotulos.cumple},
    {color: P.apagado, glifo: "punto", texto: rotulos.resto},
    {texto: B === 100 ? `Cada cuadro tiene 100 puntos: cada punto es una de cada 100 ${nombreUnidad}; la cifra de arriba es cuántas cumplen` : `Cada cuadro tiene 1,000 unidades, porque en alguna entidad cumple menos de 1 de cada 100; la cifra de arriba es cuántas de cada 1,000 cumplen`},
  ]);
  const nodo = html`<div class="forma">${leyenda}${dibujo}</div>`;
  nodo.base = B;
  return nodo;
}
