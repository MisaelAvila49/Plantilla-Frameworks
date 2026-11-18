// formas/multitud.js
// ¿De un total de personas, cuántas están en cada situación? Una multitud de
// figuras humanas en la que cada figura vale un número fijo de personas. Cada
// subgrupo va junto, en su color, y lleva su cifra anotada con una flecha, de
// modo que el subgrupo de interés se ve como un bloque dentro del total.
// No: más de cuatro subgrupos, ni una proporción menor a una figura (ahí va
// la fracción «de cada cien»), ni unidades que no se pueden contar.
import {svg, html} from "npm:htl";
import {P} from "../paleta.js";
import {entero, pct} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, TIPO} from "./comun.js";
import {PROPORCION, POSTURAS, nuevoId, simbolos, refGlifo, usar, tamanoUnidad, topeFiguras, textoUnidad, leyendaFiguras, flecha, anchoTexto, partir, tintaLegible, azarSemilla, mancha} from "./unidad.js";

const acotar = (v, a, b) => Math.max(a, Math.min(b, v));

// datos: una fila por subgrupo (de 2 a 4), en el orden en que se dibujan.
// grupo(d) nombre, valor(d) personas, color(d, i). `acomodo`: "mancha" (cada
// subgrupo es una mancha orgánica) o "rejilla" (bloques compactos). `unidad`:
// personas por figura; si no se da, se elige sola para que queden entre unas
// 300 y 1,500 figuras. `cifra(d)` y `detalle(d)`: textos de la anotación.
// El dato del globo lleva además `total`, `figuras` y `unidad`. El nodo que
// devuelve trae `unidad`, `figuras` y `resumen` (para el pie y la tabla).
export function multitud(datos, {ancho, grupo, valor, color = (d, i) => (i === 0 ? P.serie : P.contexto), acomodo = "mancha", unidad = null,
  nombreUnidad = "personas", unidadSingular = "persona", cifra = null, detalle = null, semilla = 17, globo: g}) {
  const filas = datos.filter((d) => valor(d) > 0);
  if (!filas.length) return vacio();
  const total = filas.reduce((s, d) => s + valor(d), 0);
  const K = unidad ?? tamanoUnidad(total, {tope: topeFiguras(ancho)});
  const m = filas.length;
  // Anotación de cada bloque: la cifra grande (solo el número), el nombre en
  // negrita y una línea gris con la unidad y la parte del total, partidos en
  // renglones cortos para que el rótulo quepa sobre bloques angostos.
  const fCifra = ancho < 560 ? 18 : 22, fNombre = TIPO.valor, fDetalle = 12;
  // En un teléfono, con tres o cuatro subgrupos, los bloques van en una
  // rejilla de dos columnas: uno bajo otro la figura pasaba de 1,000 px de alto.
  const dosColumnas = ancho < 560 && m >= 3, sepColumnas = 14;
  const anchoColumna = dosColumnas ? (ancho - sepColumnas) / 2 : ancho;
  const topeRotulo = dosColumnas ? Math.min(170, anchoColumna - 4) : acotar(ancho / m - 22, 118, 170);
  const grupos = filas.map((d, i) => {
    const v = valor(d), tono = color(d, i);
    const b = {d, i, v, n: Math.max(1, Math.round(v / K)), parcial: v < K / 2, tono, tinta: tintaLegible(tono, fCifra >= 18.7 ? 3 : 4.5), nombre: String(grupo(d)),
      cifra: cifra ? cifra(d) : entero(v),
      detalle: detalle ? detalle(d) : `${v === 1 ? unidadSingular : nombreUnidad}, ${pct(100 * v / total)} del total`};
    b.renglones = partir(b.nombre, Math.max(10, Math.floor(topeRotulo / (fNombre * 0.58))));
    b.detalles = partir(b.detalle, Math.max(12, Math.floor(topeRotulo / (fDetalle * 0.54))));
    b.w = Math.ceil(Math.max(anchoTexto(b.cifra, fCifra, true), ...b.detalles.map((t) => anchoTexto(t, fDetalle)), ...b.renglones.map((t) => anchoTexto(t, fNombre, true))));
    b.h = fCifra + 5 + b.renglones.length * 15 + b.detalles.length * 14 + 2;
    return b;
  });
  const N = grupos.reduce((s, b) => s + b.n, 0);
  // Lado a lado si los rótulos caben en dos hileras (arriba y abajo de la
  // fila de bloques); si no, o en un teléfono, un bloque bajo otro.
  const hilera = (par) => grupos.filter((b) => b.i % 2 === par).reduce((t, b) => t + b.w + 16, 0);
  const apilado = ancho < 560 || Math.max(hilera(0), hilera(1)) > ancho;
  const azar = azarSemilla(semilla);
  const esMancha = acomodo === "mancha";

  // ---- 1. Tamaño de la figura y posición de cada una dentro de su bloque.
  // Cada bloque queda con sus figuras en coordenadas propias (esquina en 0,0),
  // su ancho, su alto y `techo(x)`: a qué altura empieza el bloque en x.
  let s, q = 1;
  if (esMancha) {
    const celda = 1.25 * PROPORCION * 0.98;
    if (apilado) {
      const altoMeta = dosColumnas ? 250 : acotar(N * 0.6, 240, 460);
      s = acotar(Math.sqrt((ancho * altoMeta * 0.62) / (N * celda)), 5, 13);
    } else {
      const sep = 30, libre = ancho - sep * (m - 1), altoMeta = acotar(ancho * 0.5, 240, 440);
      const raices = grupos.map((b) => Math.sqrt(b.n * celda)), suma = raices.reduce((p, q) => p + q, 0);
      s = acotar(Math.sqrt((libre * altoMeta * Math.PI) / (4 * suma * Math.max(...raices))), 4.5, 15);
      q = acotar(((libre * Math.sqrt(Math.PI)) / (2 * s * suma)) ** 2, 0.75, 2.6);
    }
    const pasoX = s * 1.25, pasoY = s * PROPORCION * 0.98, alto = s * PROPORCION;
    for (const b of grupos) {
      const area = b.n * pasoX * pasoY;
      const a = apilado ? Math.min((anchoColumna - s) / 2 - 3, Math.sqrt((1.7 * area) / Math.PI)) : Math.sqrt((q * area) / Math.PI);
      const r = mancha(b.n, {a, b: area / (Math.PI * a), pasoX, pasoY, azar});
      b.figuras = r.puntos.map((p) => ({x: p.x - r.x0, y: p.y - r.y0}));
      b.ancho = r.x1 - r.x0 + s; b.alto = r.y1 - r.y0 + alto;
      const ra = b.ancho / 2 + 5, rb = b.alto / 2 + 4;
      b.zona = {tipo: "elipse", ra, rb};
      // Partes alta y baja de la elipse, medidas desde el borde superior del
      // bloque (fuera de la elipse no hay bloque: ±Infinity).
      b.techo = (x) => { const t = (x - b.ancho / 2) / ra; return Math.abs(t) >= 1 ? Infinity : b.alto / 2 - rb * Math.sqrt(1 - t * t); };
      b.piso = (x) => { const t = (x - b.ancho / 2) / ra; return Math.abs(t) >= 1 ? -Infinity : b.alto / 2 + rb * Math.sqrt(1 - t * t); };
    }
  } else {
    let filasPorBloque = 1, columnas = 1;
    if (apilado) {
      const altoMeta = dosColumnas ? 260 : acotar(N * 0.75, 220, 560);
      s = acotar(Math.sqrt((ancho * altoMeta) / (N * 1.2 * PROPORCION * 1.07)), 5, 14);
      columnas = Math.max(1, Math.floor(anchoColumna / (s * 1.2)));
    } else {
      const sep = 26, libre = ancho - sep * (m - 1), altoMeta = acotar(ancho * 0.36, 200, 400);
      for (s = 16; s >= 4; s -= 0.5) {
        filasPorBloque = 1;
        while (grupos.reduce((t, b) => t + Math.ceil(b.n / filasPorBloque), 0) * s * 1.2 > libre) filasPorBloque++;
        if (filasPorBloque * s * PROPORCION * 1.07 <= altoMeta) break;
      }
      s = Math.max(4, s);
    }
    const pasoX = s * 1.2, pasoY = s * PROPORCION * 1.07;
    for (const b of grupos) {
      // Apilado: se llena por renglones. Lado a lado: por columnas, y así cada
      // subgrupo es una banda del mismo alto.
      const cols = apilado ? Math.min(columnas, b.n) : Math.ceil(b.n / filasPorBloque);
      const rens = apilado ? Math.ceil(b.n / columnas) : Math.min(filasPorBloque, b.n);
      b.figuras = Array.from({length: b.n}, (_, u) => (apilado
        ? {x: (u % columnas) * pasoX + (pasoX - s) / 2, y: Math.floor(u / columnas) * pasoY + (pasoY - s * PROPORCION) / 2}
        : {x: Math.floor(u / filasPorBloque) * pasoX + (pasoX - s) / 2, y: (u % filasPorBloque) * pasoY + (pasoY - s * PROPORCION) / 2}));
      b.ancho = cols * pasoX; b.alto = rens * pasoY;
      b.zona = {tipo: "caja"};
      b.techo = (x) => (x < -3 || x > b.ancho + 3 ? Infinity : 0);
      b.piso = (x) => (x < -3 || x > b.ancho + 3 ? -Infinity : b.alto);
    }
  }
  const altoFigura = s * PROPORCION;

  // ---- 2. Composición: dónde va cada bloque y dónde su anotación.
  // b.x, b.y: esquina del bloque. b.rx, b.ry: esquina del rótulo (ry es el
  // borde superior). b.punta: a dónde llega la flecha.
  let altoTotal = 0;
  if (apilado) {
    // Uno bajo otro o, en dos columnas, por parejas: el rótulo de cada pareja
    // ocupa el alto del más alto y los bloques arrancan a la misma altura.
    let y = 0;
    const porFila = dosColumnas ? 2 : 1;
    for (let k = 0; k < grupos.length; k += porFila) {
      const fila = grupos.slice(k, k + porFila);
      const altoRotulo = Math.max(...fila.map((b) => b.h)), altoBloque = Math.max(...fila.map((b) => b.alto));
      fila.forEach((b, j) => {
        const x0 = j * (anchoColumna + sepColumnas);
        b.rx = x0; b.ry = y;
        b.x = x0; b.y = y + altoRotulo + 22;
        const px = Math.min(b.ancho / 2, 34);
        b.cola = [x0 + 10, b.ry + b.h + 2]; b.punta = [x0 + px, b.y + b.techo(px) - 4];
      });
      y += altoRotulo + 22 + altoBloque + 26;
    }
    altoTotal = y - 22;
  } else {
    const sep = esMancha ? 30 : 26, anchoTodo = grupos.reduce((t, b) => t + b.ancho, 0) + sep * (m - 1);
    const altoMax = Math.max(...grupos.map((b) => b.alto));
    // La fila de bloques se centra en el ancho disponible.
    let x = Math.max(0, (ancho - anchoTodo) / 2);
    for (const b of grupos) { b.x = x; b.y = (altoMax - b.alto) / 2; x += b.ancho + sep; }
    const tope = Math.max(ancho, anchoTodo);
    // Rótulos de una hilera: centrados sobre su bloque y empujados para que
    // no se encimen. Devuelve si cada rótulo sigue tocando a su bloque.
    const acomodar = (hilera) => {
      for (const [k, b] of hilera.entries()) {
        b.rx = acotar(b.x + b.ancho / 2 - b.w / 2, 0, tope - b.w);
        if (k) b.rx = Math.max(b.rx, hilera[k - 1].rx + hilera[k - 1].w + 16);
      }
      for (let k = hilera.length - 1; k >= 0; k--) {
        const limite = k === hilera.length - 1 ? tope - hilera[k].w : hilera[k + 1].rx - hilera[k].w - 16;
        hilera[k].rx = Math.max(0, Math.min(hilera[k].rx, limite));
      }
      return hilera.every((b) => b.rx < b.x + b.ancho - 4 && b.rx + b.w > b.x + 4);
    };
    // Primero todos los rótulos arriba; si alguno queda lejos de su bloque,
    // se alternan: los pares arriba y los nones abajo, como en la referencia.
    for (const b of grupos) b.abajo = false;
    if (!acomodar(grupos)) {
      for (const b of grupos) b.abajo = b.i % 2 === 1;
      acomodar(grupos.filter((b) => !b.abajo));
      acomodar(grupos.filter((b) => b.abajo));
    }
    // Arriba: el rótulo baja hasta quedar justo encima de su bloque y sube lo
    // necesario para no tocar un bloque vecino más alto. Abajo, al revés.
    for (const b of grupos) {
      const cx = b.x + b.ancho / 2;
      let borde = b.abajo ? -Infinity : Infinity;
      for (const o of grupos) {
        const holgura = o === b ? 24 : 10;
        for (let k = 0; k <= 10; k++) {
          const xx = b.rx - 8 + ((b.w + 16) * k) / 10;
          borde = b.abajo ? Math.max(borde, o.y + o.piso(xx - o.x) + holgura) : Math.min(borde, o.y + o.techo(xx - o.x) - holgura);
        }
      }
      if (!Number.isFinite(borde)) borde = b.abajo ? b.y + b.alto + 24 : b.y - 24;
      const xCola = acotar(cx + (b.rx + b.w / 2 < cx ? -14 : 14), b.rx + 6, b.rx + b.w - 6);
      if (b.abajo) {
        b.ry = borde;
        b.cola = [xCola, borde - 3];
        b.punta = [cx, b.y + b.piso(b.ancho / 2) + 4];
      } else {
        b.ry = borde - b.h;
        b.cola = [xCola, borde + 3];
        b.punta = [cx, b.y + b.techo(b.ancho / 2) - 4];
      }
    }
    const arriba = Math.min(0, ...grupos.map((b) => b.ry));
    for (const b of grupos) { b.y -= arriba; b.ry -= arriba; b.cola[1] -= arriba; b.punta[1] -= arriba; }
    altoTotal = Math.max(...grupos.map((b) => Math.max(b.y + b.alto, b.abajo ? b.ry + b.h : 0)));
  }
  const anchoTotal = Math.max(ancho, ...grupos.map((b) => Math.max(b.x + b.ancho, b.rx + b.w)));

  // ---- 3. Dibujo.
  const id = nuevoId("mu");
  let orden = 0;
  const bloques = grupos.map((b) => {
    const interior = svg`<g stroke="none"></g>`;
    for (const f of b.figuras) {
      interior.appendChild(usar(refGlifo(id, Math.floor(azar() * POSTURAS)), b.x + f.x, b.y + f.y, s, altoFigura, b.tono, {entra: (600 * orden++) / N, contorno: b.parcial}));
    }
    const zona = b.zona.tipo === "elipse"
      ? svg`<ellipse class="unidad-zona" cx=${b.x + b.ancho / 2} cy=${b.y + b.alto / 2} rx=${b.zona.ra} ry=${b.zona.rb} fill="transparent" />`
      : svg`<rect class="unidad-zona" x=${b.x - 3} y=${b.y - 3} width=${b.ancho + 6} height=${b.alto + 6} rx="5" fill="transparent" />`;
    const nodo = svg`<g class="marca-viva unidad-grupo" tabindex="0">${zona}${interior}</g>`;
    if (g) globoEn(nodo, g, {...b.d, total, figuras: b.n, unidad: K});
    return nodo;
  });
  const rotulos = grupos.map((b) => svg`<g aria-hidden="true">
    <text x=${b.rx} y=${b.ry + fCifra} font-size=${fCifra} font-weight="800" fill=${b.tinta}>${b.cifra}</text>
    ${b.renglones.map((t, k) => svg`<text x=${b.rx} y=${b.ry + fCifra + 5 + 12 + k * 15} font-size=${fNombre} font-weight="700" fill=${P.tinta}>${t}</text>`)}
    ${b.detalles.map((t, k) => svg`<text x=${b.rx} y=${b.ry + fCifra + 5 + 12 + b.renglones.length * 15 + k * 14} font-size=${fDetalle} fill=${P.tinta2}>${t}</text>`)}
    ${flecha(b.cola[0], b.cola[1], b.punta[0], b.punta[1], {curva: Math.abs(b.cola[0] - b.punta[0]) < 2 ? 0 : (b.cola[0] < b.punta[0]) !== Boolean(b.abajo) ? 0.28 : -0.28})}
  </g>`);
  const descripcion = `Multitud de ${entero(N)} figuras. ${textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular})}. ${grupos.map((b) => `${b.nombre}: ${b.cifra}, ${b.detalle}`).join(". ")}.`;
  const H = Math.ceil(altoTotal + 6);
  const dibujo = svg`<svg class="multitud" role="group" aria-label=${descripcion} width=${ancho} height=${Math.round((H * ancho) / anchoTotal)} viewBox="0 0 ${anchoTotal} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">
    ${simbolos(id)}${bloques}${rotulos}
  </svg>`;
  const parcial = grupos.find((b) => b.parcial);
  const nodo = html`<div class="forma">${leyendaFiguras([
    {color: P.tinta2, texto: textoUnidad(K, {plural: nombreUnidad, singular: unidadSingular})},
    parcial ? {color: parcial.tinta, contorno: true, texto: `Figura en contorno: menos de ${entero(K)} ${nombreUnidad}`} : null,
    {texto: `${entero(total)} ${nombreUnidad} en total`},
  ])}${dibujo}</div>`;
  nodo.unidad = K; nodo.figuras = N;
  nodo.resumen = grupos.map((b) => ({...b.d, total, figuras: b.n, unidad: K}));
  return nodo;
}
