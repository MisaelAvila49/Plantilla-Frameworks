// formas/flechas.js
// ¿De dónde a dónde se mueven las personas sobre el territorio? Flechas
// anchas y curvas sobre el mapa: cada flecha va del lugar de salida al de
// llegada, su ancho es el número de personas y se desvanece hacia el origen,
// de modo que la dirección se lee sin leyenda. Sin lugar elegido se dibujan
// los flujos mayores. Con un lugar elegido, sus salidas o sus llegadas. Los
// demás flujos quedan en gris tenue como contexto.
// No: más de unos 12 flujos en color (se enciman), tasas o porcentajes (el
// ancho es un conteo), ni flujos entre lugares casi pegados (la flecha no cabe).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {ISO_A_CVE, POR_CVE, nombreEntidad} from "../geografia.js";
import {vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";
import {mapaBase} from "./mapa-base.js";
import {lienzo, rotulo, colocar, anchoTexto} from "./anotaciones.js";

// Polígono de una flecha curva de `a` a `b` (puntos de pantalla), de ancho
// `w` en la punta y más angosta en la cola. Devuelve el trazo y sus puntos
// de apoyo para el degradado y los rótulos.
function trazarFlecha(a, b, w, {curva = 0.2, cola = 0.28, respiro = 5, caja = null} = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1], largo = Math.hypot(dx, dy) || 1;
  // Todas las flechas se curvan hacia el mismo lado, salvo que esa comba se
  // salga del lienzo: entonces se curva hacia el otro, o se endereza.
  const apoyo = (k) => [(a[0] + b[0]) / 2 - dy * k, (a[1] + b[1]) / 2 + dx * k];
  const fuera = (q) => caja && (q[0] < caja[0] || q[1] < caja[1] || q[0] > caja[2] || q[1] > caja[3]);
  const cima = (k) => { const q = apoyo(k); return [(a[0] + 2 * q[0] + b[0]) / 4, (a[1] + 2 * q[1] + b[1]) / 4]; };
  const k = [curva, -curva, curva / 2, -curva / 2, 0].find((x) => !fuera(cima(x))) ?? 0;
  const c = apoyo(k);
  const punto = (t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  const t0 = Math.min(0.3, respiro / largo), t1 = 1 - Math.min(0.3, (respiro + 1) / largo);
  const N = 30, pts = d3.range(N + 1).map((i) => punto(t0 + (t1 - t0) * i / N));
  const acum = [0];
  for (let i = 1; i <= N; i++) acum.push(acum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = acum[N], cabeza = Math.min(Math.max(w * 1.25, 9), L * 0.45), ala = w / 2 + Math.max(3, w * 0.42);
  // Punto y dirección a una distancia `s` del inicio.
  const en = (s) => {
    const i = Math.max(1, Math.min(N, d3.bisectLeft(acum, s))), f = (s - acum[i - 1]) / (acum[i] - acum[i - 1] || 1);
    const p = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
    const tx = pts[i][0] - pts[i - 1][0], ty = pts[i][1] - pts[i - 1][1], n = Math.hypot(tx, ty) || 1;
    return {p, nx: -ty / n, ny: tx / n};
  };
  const cuerpo = L - cabeza, pasos = 18, izq = [], der = [];
  for (let k = 0; k <= pasos; k++) {
    const s = cuerpo * k / pasos, {p, nx, ny} = en(s), m = (w / 2) * (cola + (1 - cola) * k / pasos);
    izq.push([p[0] + nx * m, p[1] + ny * m]); der.push([p[0] - nx * m, p[1] - ny * m]);
  }
  const cuello = en(cuerpo), punta = pts[N];
  const forma = [...izq, [cuello.p[0] + cuello.nx * ala, cuello.p[1] + cuello.ny * ala], punta, [cuello.p[0] - cuello.nx * ala, cuello.p[1] - cuello.ny * ala], ...der.reverse()];
  const medio = en(L * 0.5);
  return {d: "M" + forma.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join("L") + "Z", inicio: pts[0], punta, medio: medio.p, normal: [medio.nx, medio.ny], pts};
}

// geo: FeatureCollection de los lugares. flujos: una fila por par
// origen-destino. origen(d) y destino(d) devuelven la clave del lugar, la
// misma que `clave(f)` lee del polígono. valor(d) personas. casos(d) casos sin
// expandir: por debajo de `minimo` la flecha va punteada, o no se dibuja con
// `omitirBajos`. `foco`: clave del lugar elegido (o null) y `sentido`:
// "salen" o "llegan". `maximo`: flechas en color. `fondo`: flujos de contexto
// en gris. `tope`: valor al que corresponde el ancho máximo. Es fijo, el
// mismo con cualquier filtro. `alElegir(clave)`: clic en un lugar del mapa.
// `prefijo`: distingue los degradados si la página dibuja dos mapas de flechas.
//
// Opciones del mapa a pantalla completa (src/components/mapa-flujos.js). La
// galería no las usa y su dibujo no cambia:
//   alto, anchoTope, marco   tamaño del lienzo y rectángulo donde se encuadra
//                            el país (ver mapa-base.js).
//   anchoMaximo              ancho en px que corresponde a `tope`.
//   evitar                   cajas [x0, y0, x1, y1] que los rótulos no tapan.
//   soloLienzo               devuelve el <svg> sin leyendas. La leyenda va en
//                            `nodo.leyenda` para colocarla aparte, y sin
//                            flujos se dibuja el mapa solo (sin «vacío»).
//   alElegirFlujo(d)         clic, Enter o espacio en una flecha de color.
//                            La flecha se anuncia como botón con aria-pressed.
//   fijado                   clave «origen-destino» de la flecha fijada: las
//                            demás se atenúan (clases ff-fijo y ff-con-fijo).
//   etiquetaLugar(c)         nombre accesible de cada lugar. Con él y con
//                            `alElegir` los lugares se eligen con el teclado.
// Devuelve además `nodo.marcas`: Map de clave «origen-destino» → <path> de
// cada flecha de color, para resaltar sin volver a dibujar.
export function flechas(geo, flujos, {
  ancho, origen, destino, valor, casos = null, foco = null, sentido = "salen", maximo = 10, fondo = 30, minimo = 30, omitirBajos = false, tope = null,
  clave = (f) => ISO_A_CVE.get(f.properties.id), nombre = nombreEntidad, corto = (c) => POR_CVE.get(c)?.corto ?? nombre(c),
  color = null, rotulos = null, formato = entero, unidad = "personas", alElegir = null, prefijo = "flecha", globo: g,
  alto = null, anchoTope = 980, marco = null, anchoMaximo = null, evitar = [], soloLienzo = false, alElegirFlujo = null, fijado = null, etiquetaLugar = null,
}) {
  const angosto = ancho < 520;
  const tinta = color ?? (foco == null ? P.serie : sentido === "llegan" ? P.azul : P.rojo);
  const mapa = mapaBase(geo, {
    ancho, alto, anchoTope, marco, margen: angosto ? 4 : 10,
    relleno: (f) => (clave(f) === foco ? P.apagado : P.fondo2), borde: (f) => (clave(f) === foco ? P.tinta : P.bordeFuerte), grosor: (f) => (clave(f) === foco ? 1.4 : 0.5),
    alElegir: alElegir ? (f) => alElegir(clave(f)) : null,
    enfocable: Boolean(etiquetaLugar), etiqueta: etiquetaLugar ? (f) => etiquetaLugar(clave(f)) : null, activa: (f) => clave(f) === foco,
  });
  const claveDe = (d) => `${origen(d)}-${destino(d)}`;
  const {W, H} = mapa;
  const centro = new Map(geo.features.map((f) => [clave(f), mapa.centro(f)]));
  const validos = flujos.filter((d) => valor(d) > 0 && centro.has(origen(d)) && centro.has(destino(d)) && origen(d) !== destino(d));
  const bajo = (d) => casos != null && casos(d) != null && casos(d) < minimo;
  const propios = d3.sort(foco == null ? validos : validos.filter((d) => (sentido === "llegan" ? destino(d) : origen(d)) === foco), (d) => -valor(d))
    .filter((d) => !(omitirBajos && bajo(d)));
  if (!propios.length && !soloLienzo) return vacio("Sin flujos que dibujar para esta selección.");
  const principales = propios.slice(0, maximo), contexto = propios.slice(maximo, maximo + (angosto ? Math.round(fondo / 2) : fondo));
  const techo = tope ?? d3.max(validos, valor) ?? 1, wMax = anchoMaximo ?? (angosto ? 13 : 26);
  const grueso = (v) => Math.max(1.8, wMax * v / techo);
  const caja = marco ? [marco[0][0], marco[0][1], marco[1][0], marco[1][1]] : [4, 4, W - 4, H - 4];

  // Contexto: flechas delgadas en gris, con globo pero sin foco de teclado.
  // Los de contexto con menos de `minimo` casos no se dibujan (son ruido y su
  // cifra es poco precisa); siguen en la tabla de respaldo.
  const grises = contexto.filter((d) => !bajo(d)).map((d) => {
    const t = trazarFlecha(centro.get(origen(d)), centro.get(destino(d)), Math.min(grueso(valor(d)), 5), {cola: 0.5, caja});
    const nodo = svg`<path class="marca-viva ff-aparece" d=${t.d} fill=${P.contexto} fill-opacity="0.36" />`;
    if (g) globoEn(nodo, g, d);
    return nodo;
  });

  // Principales: de la más ancha a la más delgada, para que la delgada quede encima.
  const degradados = [], trazos = [], marcasPorClave = new Map();
  const marcas = principales.map((d, i) => {
    const w = grueso(valor(d)), t = trazarFlecha(centro.get(origen(d)), centro.get(destino(d)), w, {caja});
    const id = `${prefijo}-${origen(d)}-${destino(d)}`, punteada = bajo(d);
    degradados.push(svg`<linearGradient id=${id} gradientUnits="userSpaceOnUse" x1=${t.inicio[0]} y1=${t.inicio[1]} x2=${t.punta[0]} y2=${t.punta[1]}>
      <stop offset="0" stop-color=${tinta} stop-opacity=${punteada ? 0.05 : 0.2} /><stop offset="0.75" stop-color=${tinta} stop-opacity=${punteada ? 0.22 : 0.78} /><stop offset="1" stop-color=${tinta} stop-opacity=${punteada ? 0.3 : 0.94} />
    </linearGradient>`);
    const nodo = svg`<path class="marca-viva ff-flecha ff-aparece" tabindex="0" style=${`--i:${i}`} d=${t.d} fill=${`url(#${id})`} stroke=${punteada ? tinta : P.fondo} stroke-width=${punteada ? 1.2 : 0.7} stroke-dasharray=${punteada ? "4 3" : null} stroke-linejoin="round"/>`;
    if (g) globoEn(nodo, g, d);
    const k = claveDe(d);
    nodo.dataset.clave = k;
    if (k === fijado) nodo.classList.add("ff-fijo");
    if (alElegirFlujo) {
      // Botón que fija la flecha: mismo nombre que el globo, más la acción.
      nodo.setAttribute("role", "button");
      nodo.setAttribute("aria-pressed", String(k === fijado));
      nodo.setAttribute("aria-label", `${nodo.getAttribute("aria-label") ?? `${nombre(origen(d))} a ${nombre(destino(d))}`}. Enter para fijar este flujo.`);
      nodo.style.cursor = "pointer";
      nodo.addEventListener("click", (e) => { e.stopPropagation(); alElegirFlujo(d); });
      nodo.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alElegirFlujo(d); } });
    }
    marcasPorClave.set(k, nodo);
    trazos.push({d, t, w});
    return nodo;
  });

  // Rótulos directos: en el otro extremo de la flecha cuando hay un lugar
  // elegido (qué lugar y cuántas personas) y a media flecha cuando no lo hay
  // (de dónde a dónde). El rótulo que no cabe no se dibuja.
  const cuantos = rotulos ?? (angosto ? 3 : 6), tam = angosto ? 11.5 : TIPO.valor;
  const puntoFoco = foco != null ? centro.get(foco) : null;
  const etiquetas = [];
  if (puntoFoco) {
    const texto = nombre(foco);
    etiquetas.push({x: puntoFoco[0], y: puntoFoco[1], w: anchoTexto(texto, tam + 1, 700), h: tam + 6, renglones: [{texto, peso: 700}], tam: tam + 1, separacion: 8});
  }
  for (const {d, t, w} of trazos.slice(0, cuantos)) {
    const otro = foco == null ? null : sentido === "llegan" ? origen(d) : destino(d);
    const titulo = otro != null ? (angosto ? corto(otro) : nombre(otro)) : `${corto(origen(d))} → ${corto(destino(d))}`;
    const cifra = angosto ? formato(valor(d)) : `${formato(valor(d))} ${unidad}`;
    // Sin lugar elegido el rótulo va en la cola (el origen), como en un mapa
    // de procedencias: las colas están repartidas y las puntas se juntan.
    const ancla = otro != null ? (sentido === "llegan" ? t.inicio : t.punta) : t.inicio;
    etiquetas.push({x: ancla[0], y: ancla[1], w: Math.max(anchoTexto(titulo, tam, 700), anchoTexto(cifra, tam)), h: 2 * tam * 1.22 + 3, renglones: [{texto: titulo, peso: 700}, {texto: cifra, color: P.tinta2}], tam, separacion: 8});
  }
  // Obstáculos: la punta de cada flecha en color y el eje de su cuerpo, para
  // que un rótulo no tape otra flecha.
  const puntas = trazos.map(({t}) => [t.punta[0] - 5, t.punta[1] - 5, t.punta[0] + 5, t.punta[1] + 5]);
  const cuerpos = trazos.flatMap(({t, w}) => t.pts.filter((_, i) => i % 3 === 1 && i > 3 && i < 27).map(([x, y]) => { const r = Math.max(1.5, w * 0.22); return [x - r, y - r, x + r, y + r]; }));
  const textos = colocar(etiquetas, {ancho: W, alto: H, obstaculos: [...puntas, ...cuerpos, ...evitar, ...(puntoFoco ? [[puntoFoco[0] - 6, puntoFoco[1] - 6, puntoFoco[0] + 6, puntoFoco[1] + 6]] : [])]})
    .filter((e) => e.cabe).map((e) => rotulo(e.tx, e.caja[1] + e.tam, e.renglones, {ancla: e.ancla, tam: e.tam}));

  const mayor = principales[0];
  const dibujo = lienzo({
    clase: fijado != null && marcasPorClave.has(fijado) ? "flechas ff-con-fijo" : "flechas", ancho: W, alto: H,
    etiqueta: mayor
      ? `Mapa de flujos con ${principales.length} flechas${foco != null ? ` que ${sentido === "llegan" ? "llegan a" : "salen de"} ${nombre(foco)}` : ""}. La mayor va de ${nombre(origen(mayor))} a ${nombre(destino(mayor))}: ${formato(valor(mayor))} ${unidad}.`
      : `Mapa sin flujos que dibujar${foco != null ? ` para ${nombre(foco)}` : ""}.`,
  }, svg`<defs>${degradados}</defs>`, mapa.capa, svg`<g>${grises}</g>`, svg`<g>${marcas}</g>`,
  puntoFoco ? svg`<circle cx=${puntoFoco[0]} cy=${puntoFoco[1]} r="4.6" fill=${P.tinta} stroke=${P.fondo} stroke-width="1.4" pointer-events="none"/>` : "", svg`<g>${textos}</g>`);

  // Leyenda fuera del lienzo: qué es cada trazo y cuánto mide un ancho.
  const hayBajos = principales.some(bajo);
  // Dos anchos de muestra: uno chico y el mayor redondo, para que se vea la escala.
  const redondos = d3.ticks(0, techo, 4).filter((v) => v > 0 && grueso(v) >= 3);
  const muestras = [...new Set([redondos[0], redondos.at(-1)])].filter((v) => v != null);
  const leyendaAncho = html`<div class="leyenda-items">
    <span class="leyenda-item"><span>Ancho de la flecha</span></span>
    ${muestras.map((v) => html`<span class="leyenda-item"><svg width="30" height=${Math.ceil(grueso(v)) + 2} aria-hidden="true"><rect x="1" y="1" width="28" height=${grueso(v)} rx="1.5" fill=${tinta} fill-opacity="0.8"/></svg><span>${formato(v)} ${unidad}</span></span>`)}
  </div>`;
  const leyenda = leyendaItems([
    {tipo: "cuadro", color: tinta, texto: foco == null ? `Los ${principales.length} flujos mayores` : `${sentido === "llegan" ? "Llegan a" : "Salen de"} ${nombre(foco)}`},
    ...(contexto.length ? [{tipo: "linea", color: P.contexto, texto: "Otros flujos"}] : []),
    ...(hayBajos ? [{tipo: "punteada", color: P.tinta2, texto: `Menos de ${minimo} casos en la muestra`}] : []),
  ]);
  const leyendas = html`<div class="forma-leyendas">${leyenda}${leyendaAncho}</div>`;
  const nodo = soloLienzo ? dibujo : conLeyenda(leyendas, dibujo);
  if (soloLienzo) nodo.leyenda = leyendas;
  nodo.marcas = marcasPorClave;
  nodo.W = W; nodo.H = H; nodo.tinta = tinta; nodo.techo = techo; nodo.grueso = grueso;
  nodo.dibujados = principales;
  nodo.contexto = contexto;
  nodo.hayBajos = hayBajos;
  nodo.ocultos = contexto.filter(bajo).length;
  return nodo;
}
