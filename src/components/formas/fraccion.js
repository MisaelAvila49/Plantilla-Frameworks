// formas/fraccion.js
// ¿Cuántas de cada cien? Cien figuras humanas por grupo: las que cumplen van
// en el color del grupo y el resto, desvanecidas, con la cifra «k de cada 100»
// anotada. Varios grupos van en paneles pequeños con la MISMA base, para que
// se puedan comparar. Si alguna proporción es menor a 1 de cada 100, la base
// cambia sola a 1,000 o a 10,000 y la gráfica lo dice.
// No: más de cuatro grupos, ni para comparar décimas (ahí va el dumbbell).
import {svg, html} from "npm:htl";
import {P} from "../paleta.js";
import {deCada, entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {PROPORCION, POSTURAS, nuevoId, simbolos, refGlifo, usar, leyendaFiguras, flecha, tintaLegible, azarSemilla, mancha} from "./unidad.js";

const acotar = (v, a, b) => Math.max(a, Math.min(b, v));

// Base común de varios porcentajes: 100 si el menor (mayor que cero) es de al
// menos 1 de cada 100; si no, 1,000; y si tampoco alcanza 1 de cada 1,000,
// 10,000.
export function baseFraccion(valores) {
  const positivos = valores.filter((v) => v != null && +v > 0);
  const menor = positivos.length ? Math.min(...positivos) : 100;
  return menor >= 1 ? 100 : menor >= 0.1 ? 1000 : 10000;
}

// datos: una fila por grupo (de 1 a 4). etiqueta(d), valor(d) en 0-100,
// color(d). `base`: 100, 1,000 o 10,000; si no se da, se elige sola.
// `acomodo`: "rejilla" (10 por 10) o "multitud" (las cien figuras como un
// grupo de gente, solo con base 100). `rotulos`: {cumple, resto} para la
// leyenda. `nombreUnidad`: qué es cada figura. El dato del globo lleva además
// `base` y `k` (figuras pintadas). El nodo trae `base` y `resumen`.
export function fraccion(datos, {ancho, etiqueta, valor, color = () => P.serie, base = null, acomodo = "rejilla", rotulos = null,
  nombreUnidad = "personas", semilla = 23, globo: g}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const B = base ?? baseFraccion(filas.map(valor));
  const n = filas.length, movil = ancho < 560;
  const comoMultitud = acomodo === "multitud" && B === 100;
  const glifo = B > 1000 ? "punto" : "figura";
  const porFila = movil ? (B === 100 && !comoMultitud ? Math.min(n, 2) : 1) : Math.min(n, B === 100 ? (comoMultitud ? 2 : 4) : 2);
  const sep = movil ? 18 : 30;
  const topePanel = B === 100 ? (comoMultitud ? (n === 1 ? 600 : 380) : 250) : B === 1000 ? 600 : 640;
  const pw = Math.floor(Math.min(topePanel, (ancho - sep * (porFila - 1)) / porFila));
  const id = nuevoId("fr");
  const azar = azarSemilla(semilla);

  // Geometría común a todos los paneles (misma base, misma escala).
  let cols, rens, pasoX, pasoY, s, alto, nube = null;
  if (comoMultitud) {
    const a = pw / 2 - 8;
    s = acotar(a * 0.068, 6, 15); alto = s * PROPORCION;
    pasoX = s * 1.32; pasoY = alto * 0.98;
    const area = 100 * pasoX * pasoY, ea = Math.min(a - s / 2, Math.sqrt((2.1 * area) / Math.PI));
    nube = mancha(100, {a: ea, b: area / (Math.PI * ea), pasoX, pasoY, azar});
  } else if (B === 100) {
    cols = 10; rens = 10;
    s = Math.min(20, (pw / cols) * 0.78); pasoX = s / 0.78; alto = s * PROPORCION; pasoY = alto * 1.08;
  } else if (B === 1000) {
    cols = [50, 40, 25, 20].find((c) => pw / c >= 6) ?? 20; rens = B / cols;
    pasoX = pw / cols; s = pasoX * 0.8; alto = s * PROPORCION; pasoY = alto * 1.08;
  } else {
    cols = pw / 125 >= 3.3 ? 125 : 100; rens = B / cols;
    pasoX = pasoY = pw / cols; s = alto = pasoX * 0.62;
  }

  const panel = (d, i) => {
    const v = valor(d), k = Math.round((v * B) / 100), tono = color(d, i);
    const cifra = deCada(v, B), nombre = String(etiqueta(d)), pid = `${id}p${i}`;
    const fCifra = acotar(pw / (cifra.length * 0.62), 14, 24), tinta = tintaLegible(tono, fCifra >= 18.7 ? 3 : 4.5);
    const yNombre = 14, yCifra = yNombre + 8 + fCifra, y0 = yCifra + 30;
    const piezas = [];
    let altoDibujo, punta = null;
    if (comoMultitud) {
      // Las cien figuras ordenadas de izquierda a derecha: las k primeras cumplen.
      const dx = -nube.x0 + 4, dy = -nube.y0;
      const porX = [...nube.puntos].map((p, u) => ({...p, u})).sort((p, q) => p.x - q.x).map((p, lugar) => ({...p, lugar}));
      for (const p of porX.sort((p, q) => p.y - q.y)) {
        const cumple = p.lugar < k;
        piezas.push(usar(refGlifo(pid, p.u), p.x + dx, y0 + p.y + dy, s, alto, cumple ? tono : P.apagado, {entra: p.lugar * 5}));
      }
      const cima = porX.filter((p) => p.lugar < k).sort((p, q) => p.y - q.y)[0];
      if (cima) punta = [cima.x + dx + s / 2, y0 + cima.y + dy - 4];
      altoDibujo = nube.y1 - nube.y0 + alto;
    } else if (B === 100) {
      for (let u = 0; u < 100; u++) {
        piezas.push(usar(refGlifo(pid, Math.floor(azar() * POSTURAS)), (u % cols) * pasoX + (pasoX - s) / 2, y0 + Math.floor(u / cols) * pasoY + (pasoY - alto) / 2, s, alto, u < k ? tono : P.apagado, {entra: u * 5}));
      }
      if (k) punta = [(Math.min(k, cols) * pasoX) / 2, y0 - 3];
      altoDibujo = rens * pasoY;
    } else {
      // Mil o diez mil unidades: el resto se pinta con una trama (un solo
      // rectángulo) y solo las que cumplen son figuras propias.
      const trama = `${pid}-t`;
      const ox = (pasoX - s) / 2, oy = (pasoY - alto) / 2;
      piezas.push(svg`<pattern id=${trama} x="0" y=${y0} width=${pasoX} height=${pasoY} patternUnits="userSpaceOnUse">${usar(refGlifo(pid, 0, glifo), ox, oy, s, alto, P.apagado)}</pattern>`);
      piezas.push(svg`<rect x="0" y=${y0} width=${cols * pasoX} height=${rens * pasoY} style=${`fill:url(#${trama})`} />`);
      // Con puntos, las que cumplen van un poco más grandes para que se vean.
      const sk = glifo === "punto" ? pasoX * 0.96 : s, ak = glifo === "punto" ? sk : alto;
      for (let u = 0; u < k; u++) {
        piezas.push(usar(refGlifo(pid, 0, glifo), (u % cols) * pasoX + (pasoX - sk) / 2, y0 + Math.floor(u / cols) * pasoY + (pasoY - ak) / 2, sk, ak, tono, {entra: (500 * u) / Math.max(1, k)}));
      }
      // Con pocas unidades en color dentro de mil o diez mil, un marco en el
      // color del grupo las encierra para que se encuentren a simple vista.
      if (k && k <= cols * 3) {
        for (let r = 0; r * cols < k; r++) {
          const n = Math.min(cols, k - r * cols), pad = glifo === "punto" ? 3 : 2.5;
          piezas.push(svg`<rect aria-hidden="true" x=${-pad + 0.5} y=${y0 + r * pasoY - pad} width=${n * pasoX + 2 * pad - 1} height=${pasoY + 2 * pad} rx="3.5" fill="none" stroke=${tono} stroke-width="1.5" />`);
        }
      }
      if (k) punta = [Math.max(pasoX / 2, (Math.min(k, cols) * pasoX) / 2), y0 - 5];
      altoDibujo = rens * pasoY;
    }
    const H = Math.ceil(y0 + altoDibujo + 4);
    const nodo = svg`<svg class="fraccion-panel marca-viva" role="img" tabindex="0" aria-label=${`${nombre}: ${cifra} ${nombreUnidad}`} width=${pw} height=${H} viewBox="0 0 ${pw} ${H}" style="font-family:var(--sans-serif);overflow:visible">
      ${simbolos(pid, {glifo})}
      <text x="0" y=${yNombre} font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${nombre}</text>
      <text x="0" y=${yCifra} font-size=${fCifra} font-weight="800" fill=${tinta}>${cifra}</text>
      ${punta ? flecha(12, yCifra + 7, punta[0], punta[1], {curva: punta[0] - 12 < 6 ? 0 : -0.18}) : ""}
      ${piezas}
    </svg>`;
    if (g) globoEn(nodo, g, {...d, base: B, k});
    return nodo;
  };

  const tono0 = color(filas[0], 0);
  const leyenda = leyendaFiguras([
    rotulos ? {color: tono0, glifo, texto: rotulos.cumple} : null,
    rotulos ? {color: P.apagado, glifo, texto: rotulos.resto} : null,
    {texto: `Cada ${glifo === "punto" ? "punto" : "figura"} es una de cada ${entero(B)} ${nombreUnidad}`},
  ]);
  const nodo = html`<div class="forma">${leyenda}<div class="fraccion" style=${`gap:22px ${sep}px`}>${filas.map(panel)}</div></div>`;
  nodo.base = B;
  nodo.resumen = filas.map((d) => ({...d, base: B, k: Math.round((valor(d) * B) / 100)}));
  return nodo;
}
