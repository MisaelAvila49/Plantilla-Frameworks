// src/components/paleta.js
// FUENTE ÚNICA DE COLOR del libro. Todo color que se dibuja, en una gráfica o
// en la hoja de estilos, sale de este módulo: las gráficas leen el objeto `P`
// y la hoja lee las variables CSS que `tokensCss()` genera y que
// observablehq.config.js inyecta en la cabecera. Fuera de aquí no se escribe
// ningún hexadecimal ni se pregunta por el tema.
//
// El módulo no importa nada (ni d3 ni el DOM al cargar), para que lo puedan
// leer también Node: la configuración del sitio y `npm run verificar:paleta`,
// que valida las paletas que aquí se exportan y no una copia escrita a mano.
//
// REGLA SEMÁNTICA, la misma en todo el libro:
//   ROJO  lo que se pierde, lo desfavorable, el foco de preocupación.
//   AZUL  lo que se gana, lo favorable, el contraste.
//   GRIS  sin cambio, sin dato o contexto.
// El significado exacto se declara por capítulo con `significado({...})`.
// Las magnitudes de nivel (qué parte, cuántos) NO usan rojo ni azul: usan la
// rampa de una sola tinta del tono de tema, continua y con dominio fijo.

// ----------------------------------------------------------------- tonos
// Tono de tema: el color de la serie única y de la rampa de magnitud. Cada
// libro lo cambia en UN lugar: `tono` del bloque LIBRO de la configuración
// (un nombre de esta lista o un objeto {claro, oscuro}). Resultado de
// `validate_palette.js` junto al rojo y al azul semánticos, en su tema y
// exigiendo separación entre TODOS los pares (npm run verificar:paleta):
//   petroleo  pasa en claro y en oscuro. Es el tono por omisión.
//   ocre      pasa en claro; en oscuro pasa con AVISO (separación con el
//             rojo de 7.0 bajo protanopía, en la banda mínima de 6 a 8): ahí
//             el color tiene que ir acompañado de rótulo directo.
// Un verde azulado más profundo (#0F766E, #0E7C86) NO pasa: su croma queda
// bajo 0.10 (se lee gris) y se separa del azul menos de 15.
export const TONOS = {
  petroleo: {claro: "#0E9384", oscuro: "#22AB8A"},
  ocre: {claro: "#B87709", oscuro: "#9A5A0A"},
};

// ----------------------------------------------------------------- bases
const CLARO = {
  // Superficies y tintas (también son los tokens de la hoja de estilos).
  fondo: "#ffffff", fondo2: "#f5f5f2", fondo3: "#fafaf9",
  tinta: "#1d1d1b", tinta2: "#4a4845", tinta3: "#6b6966",
  borde: "#dedcd6", bordeFuerte: "#b4b1a9",
  // Grises de las gráficas: de tono, nunca de opacidad.
  rejilla: "#e7e5df", regla: "#8a8a86", contexto: "#b9b6ae",
  sinDato: "#e2e0da", apagado: "#d9d8d2", resumen: "#9a978f",
  // Semánticos.
  rojo: "#C4101B", azul: "#2166AC", gris: "#8a8a86",
  rojoTexto: "#c4101b", rojoFuerte: "#9c0d16",
  // Divergente de nueve tonos: rojos, gris al centro, azules.
  divergente: ["#67001F", "#B2182B", "#D6604D", "#F4A582", "#E8E6E1", "#92C5DE", "#4393C3", "#2166AC", "#053061"],
  // Identidad (categorías sin orden): tres tonos fijos (verde azulado, ocre y
  // terracota) y gris para «Otras». No dependen del tono de tema.
  categorias: ["#0E9384", "#B87709", "#863913"], otras: "#8a8a86",
  // Mapa bivariado (3 × 3), indexado [a][b]: `a` es el tercil del eje A
  // (rojo, el horizontal de la leyenda) y `b` el del eje B (azul, el
  // vertical). En el bivariado, «los dos altos» sale morada por la mezcla: es la
  // ÚNICA excepción a R93 y nunca es el color del tema. Matriz de PISA
  // (validada en su sitio); en oscuro se ajustaron tres celdas para que cada
  // eje tenga pasos visibles (verificar:paleta, «Mapa bivariado»).
  bivariado: [["#E8E6E1", "#A9C3D8", "#5B92C0"], ["#E0B9BC", "#9E9EA8", "#5C6E9E"], ["#D08B92", "#B0707F", "#4A3A62"]],
  blanco: "#ffffff", negro: "#1d1d1b",
};
const OSCURO = {
  fondo: "#0f0f0e", fondo2: "#191918", fondo3: "#1e1e1c",
  tinta: "#ecebe8", tinta2: "#c9c7c2", tinta3: "#a3a09b",
  borde: "#3a3a37", bordeFuerte: "#5f5e59",
  rejilla: "#2c2c2a", regla: "#8a8a86", contexto: "#5c5b56",
  sinDato: "#2a2a27", apagado: "#4a4a45", resumen: "#7d7b75",
  rojo: "#E8474F", azul: "#4A90D9", gris: "#8a8a86",
  rojoTexto: "#f27076", rojoFuerte: "#f27076",
  divergente: ["#FFB3B8", "#F27C82", "#E8474F", "#A32C34", "#4A4A45", "#2C5C8C", "#4A90D9", "#7FB6EA", "#B8D8F7"],
  categorias: ["#22AB8A", "#B28834", "#A84832"], otras: "#8a8a86",
  // En oscuro la luminosidad se invierte: «los dos altos» es la celda más clara.
  bivariado: [["#2E2E2C", "#2C4356", "#4E88B8"], ["#6A3036", "#5A5A63", "#7A94D0"], ["#8C4048", "#A0707C", "#C2AAE2"]],
  blanco: "#ffffff", negro: "#1d1d1b",
};
// Colores que NO se invierten con el tema: la tapa del libro es un objeto
// claro en los dos modos, y las placas de logo traen su fondo en el archivo.
const FIJOS = {
  tapaPapel: "#f6f1e4", tapaTinta: "#1d1d1b", tapaLomo: "#e4dcc8", tapaHojas: "#fbf9f3",
  tapaRojo: "#c4101b", tapaGris: "#6b6966", placaLogo: "#ffffff",
  // Crema de la tapa con imagen: el fondo de las ilustraciones del equipo.
  tapaCrema: "#f8f5ee",
};

// ---------------------------------------------------------- color en OKLab
// Interpolación propia (sin d3) para que el módulo corra igual en Node.
const aLineal = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const deLineal = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function aOklab(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = aLineal(((n >> 16) & 255) / 255), g = aLineal(((n >> 8) & 255) / 255), b = aLineal((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function deOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const canal = (v) => Math.round(255 * Math.min(1, Math.max(0, deLineal(v)))).toString(16).padStart(2, "0");
  return "#" + canal(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) +
    canal(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) +
    canal(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
}
// Interpolador por tramos entre anclas hex, en OKLab. t entre 0 y 1.
export function porTramos(anclas) {
  const lab = anclas.map(aOklab), n = lab.length - 1;
  return (t) => {
    const x = Math.min(1, Math.max(0, t)) * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
    return deOklab(lab[i].map((v, k) => v + (lab[i + 1][k] - v) * f));
  };
}
// Mismo matiz que `hex`, con otra luminosidad y una fracción de su croma.
function matiz(hex, L, croma) {
  const [, a, b] = aOklab(hex);
  return deOklab([L, a * croma, b * croma]);
}
// Rampa de UNA tinta derivada del tono: del casi blanco al tono profundo en
// claro, y del casi negro al tono luminoso en oscuro. El color de la serie
// queda dentro de la rampa, de modo que barras y mapas comparten tinta.
function anclasDe(serie, oscuro) {
  return oscuro
    ? [matiz(serie, 0.27, 0.4), matiz(serie, 0.45, 0.8), serie, matiz(serie, 0.8, 0.85), matiz(serie, 0.92, 0.55)]
    : [matiz(serie, 0.94, 0.3), matiz(serie, 0.85, 0.65), matiz(serie, 0.72, 0.95), serie, matiz(serie, 0.36, 0.8)];
}
// Rampa del tono en su versión CLARA, sin importar el tema: para la tapa del
// libro, que es un objeto claro también de noche.
export const rampaClara = () => porTramos(anclasDe(tono.claro, false));
// Luminosidad percibida (0 a 1), para elegir la tinta sobre un relleno.
export const luminosidad = (hex) => aOklab(hex)[0];

// ------------------------------------------------------------------ estado
export const MODO = {oscuro: false};
let tono = TONOS.petroleo;
// Paleta viva: las gráficas la leen al dibujar. Se reescribe en sitio al
// cambiar de tema o de tono, así que nunca se guarda una copia de sus campos.
export const P = {};
const suscriptores = new Set();

function recalcular() {
  const base = MODO.oscuro ? OSCURO : CLARO;
  const serie = MODO.oscuro ? tono.oscuro : tono.claro;
  for (const k of Object.keys(P)) delete P[k];
  Object.assign(P, base, FIJOS, {
    serie,
    rampa: anclasDe(serie, MODO.oscuro),
    // Paso del tono que libra 4.5:1 como texto sobre el fondo del tema.
    tonoTexto: MODO.oscuro ? matiz(serie, 0.78, 0.9) : matiz(serie, 0.45, 0.95),
    tonoSuave: MODO.oscuro ? matiz(serie, 0.3, 0.45) : matiz(serie, 0.95, 0.25),
    // Serie de referencia junto a la del tono de tema (mapa de flujos, «De
    // cada 100…»): un gris de tinta, anillo hueco frente al punto relleno.
    // Es neutro a propósito: no es rojo ni azul porque no mide un sentido.
    comparacion: base.tinta2,
  });
}

// Fija el tono de tema. Acepta un nombre de TONOS o {claro, oscuro}.
export function definirTema(t) {
  const nuevo = typeof t === "string" ? TONOS[t] : t;
  if (!nuevo?.claro || !nuevo?.oscuro) throw new Error(`Tono de tema desconocido: ${JSON.stringify(t)}. Opciones: ${Object.keys(TONOS).join(", ")}`);
  tono = nuevo;
  recalcular();
  for (const fn of suscriptores) fn(MODO.oscuro);
  return P;
}
export function aplicarModo(oscuro) {
  MODO.oscuro = Boolean(oscuro);
  recalcular();
  for (const fn of suscriptores) fn(MODO.oscuro);
}
// Las gráficas son SVG ya pintado: quien dibuja se suscribe y vuelve a pintar.
export function alCambiarModo(fn) {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}

// --------------------------------------------------------------- rampas
// Magnitud de nivel: rampa continua de una tinta con DOMINIO FIJO. El dominio
// se declara en una constante del capítulo y no depende de los filtros, o el
// mismo valor cambiaría de tono al filtrar.
export function rampaTema(dominio = [0, 100]) {
  const [a, b] = dominio;
  const escala = (v) => (v == null || Number.isNaN(+v) ? P.sinDato : porTramos(P.rampa)((v - a) / (b - a)));
  escala.dominio = dominio;
  escala.interpolar = (t) => porTramos(P.rampa)(t);
  return escala;
}
// Cambio con signo: divergente con gris en el cero y dominio fijo simétrico.
// `desfavorable` dice hacia qué lado va el rojo ("baja" por omisión).
export function rampaCambio(limite, {desfavorable = "baja"} = {}) {
  const tonos = desfavorable === "baja" ? P.divergente : [...P.divergente].reverse();
  const escala = (v) => (v == null || Number.isNaN(+v) ? P.sinDato : porTramos(tonos)((Math.max(-limite, Math.min(limite, v)) + limite) / (2 * limite)));
  escala.dominio = [-limite, limite];
  escala.interpolar = (t) => porTramos(tonos)(t);
  return escala;
}

// --------------------------------------------------------------- sentido
// UNA sola definición del punto neutro. Con error muestral decide el margen
// de error combinado (1.96 veces); sin él, el umbral de lo que se escribiría
// como cero. Devuelve "baja", "sube" o "igual" (o null si falta un valor).
export function sentido(a, b, {eeA = null, eeB = null, umbral = 0.05} = {}) {
  if (a == null || b == null) return null;
  const d = b - a;
  const margen = eeA != null && eeB != null ? 1.96 * Math.hypot(eeA, eeB) : umbral;
  return Math.abs(d) <= margen ? "igual" : d < 0 ? "baja" : "sube";
}

// Significado del rojo, el azul y el gris en un capítulo. Se declara una vez
// arriba de la página y de ahí salen el color de cada marca, las leyendas y
// la frase de la metodología:
//   const SIG = significado({rojo: "pierde población", azul: "gana población",
//                            gris: "sin cambio claro", desfavorable: "baja"});
export function significado({rojo, azul, gris = "sin cambio", desfavorable = "baja"} = {}) {
  if (!rojo || !azul) throw new Error("significado(): falta declarar qué quiere decir el rojo y qué el azul en este capítulo.");
  const favorable = desfavorable === "baja" ? "sube" : "baja";
  return {
    rojo, azul, gris, desfavorable, favorable,
    color: (s) => (s === desfavorable ? P.rojo : s === favorable ? P.azul : P.gris),
    etiqueta: (s) => (s === desfavorable ? rojo : s === favorable ? azul : gris),
    leyenda: (tipo = "punto") => [
      {tipo, color: P.rojo, texto: rojo}, {tipo, color: P.azul, texto: azul}, {tipo, color: P.gris, texto: gris},
    ],
  };
}

// ------------------------------------------------------------ categorías
// Identidad: el color se reparte por ENTIDAD (el orden en que se declaran las
// categorías), nunca por frecuencia ni por posición en la vista. Tope de tres
// tonos; de la cuarta en adelante van en gris y el nombre acompaña al color.
export function categorias(nombres) {
  const lista = [...nombres];
  const color = (nombre) => {
    const i = lista.indexOf(nombre);
    return i >= 0 && i < P.categorias.length ? P.categorias[i] : P.otras;
  };
  color.nombres = lista;
  return color;
}

// Tinta legible sobre un relleno: la que da MÁS contraste WCAG (blanco o negro).
// Antes era un umbral fijo de luminosidad (0.62) y en los tonos medios de la
// rampa, sobre todo en tema oscuro, escogía la tinta con menos contraste.
// Canales de un color «#rrggbb» o «rgb(r, g, b)»; null si no se reconoce.
const canales = (c) => {
  const t = String(c).trim();
  const h = /^#?([0-9a-f]{6})$/i.exec(t);
  if (h) return [0, 2, 4].map((i) => parseInt(h[1].slice(i, i + 2), 16));
  const r = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(t);
  return r ? [r[1], r[2], r[3]].map(Number) : null;
};
const lumWcag = (rgb) => {
  const v = rgb.map((x) => x / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const razon = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
export const tintaSobre = (color) => {
  const rgb = canales(color);
  if (!rgb) return luminosidad(color) < 0.62 ? P.blanco : P.negro;
  const l = lumWcag(rgb);
  return razon(l, lumWcag(canales(P.blanco))) >= razon(l, lumWcag(canales(P.negro))) ? P.blanco : P.negro;
};

// ----------------------------------------------------- para la hoja y Node
// Variables CSS de todo el sitio, en los dos temas. La configuración las
// inyecta en la cabecera; la hoja de estilos solo escribe var(--…).
export function tokensCss(t = "petroleo") {
  const previo = {tono, oscuro: MODO.oscuro};
  const bloque = (oscuro) => {
    MODO.oscuro = oscuro; tono = typeof t === "string" ? TONOS[t] : t; recalcular();
    const v = {
      "--fondo": P.fondo, "--fondo-2": P.fondo2, "--fondo-3": P.fondo3,
      "--tinta": P.tinta, "--tinta-2": P.tinta2, "--tinta-3": P.tinta3,
      "--borde": P.borde, "--borde-fuerte": P.bordeFuerte,
      "--rojo": P.rojoTexto, "--rojo-fuerte": P.rojoFuerte, "--azul": P.azul,
      "--tono": P.serie, "--tono-texto": P.tonoTexto, "--tono-suave": P.tonoSuave,
      "--sin-dato": P.sinDato, "--apagado": P.apagado, "--blanco": P.blanco,
      "--tapa-papel": P.tapaPapel, "--tapa-tinta": P.tapaTinta, "--tapa-lomo": P.tapaLomo, "--tapa-hojas": P.tapaHojas,
      "--tapa-rojo": P.tapaRojo, "--tapa-gris": P.tapaGris, "--tapa-crema": P.tapaCrema, "--placa-logo": P.placaLogo,
    };
    return Object.entries(v).map(([k, x]) => `${k}:${x}`).join(";");
  };
  const css = `:root{color-scheme:light;${bloque(false)}}:root[data-tema="oscuro"]{color-scheme:dark;${bloque(true)}}`;
  tono = previo.tono; MODO.oscuro = previo.oscuro; recalcular();
  return css;
}

// Paletas que el libro DIBUJA, para `npm run verificar:paleta`. Si se añade
// una paleta nueva a este módulo, se añade aquí; el verificador no trae
// ninguna lista propia.
export function paletasDibujadas(t = "petroleo") {
  const previo = {tono, oscuro: MODO.oscuro};
  const salida = [];
  for (const oscuro of [false, true]) {
    MODO.oscuro = oscuro; tono = typeof t === "string" ? TONOS[t] : t; recalcular();
    const modo = oscuro ? "dark" : "light", sufijo = oscuro ? "oscuro" : "claro";
    salida.push(
      {nombre: `Semánticos y tono de tema (${sufijo})`, modo, superficie: P.fondo, pares: "all", hex: [P.rojo, P.azul, P.serie]},
      {nombre: `Categorías de identidad (${sufijo})`, modo, superficie: P.fondo, pares: "all", hex: [...P.categorias]},
      {nombre: `Rampa de una tinta (${sufijo})`, modo, superficie: P.fondo, ordinal: true, hex: [...P.rampa]},
      // Mapa de flujos, «De cada 100…»: tono de tema frente al gris de
      // comparación. `neutro` marca la posición del gris: su croma bajo y su
      // luminosidad fuera de la banda categórica son intencionales; se exige
      // separación entre los dos y contraste con el fondo.
      {nombre: `Comparación de representación (${sufijo})`, modo, superficie: P.fondo, pares: "all", neutro: [1], hex: [P.serie, P.comparacion]},
      // Mapa bivariado: se revisa por filas, columnas y esquinas (ver
      // validarMatriz en scripts/verificar_paleta.mjs).
      {nombre: `Mapa bivariado (${sufijo})`, modo, superficie: P.fondo, matriz: P.bivariado.map((f) => [...f]), hex: P.bivariado.flat()},
    );
  }
  tono = previo.tono; MODO.oscuro = previo.oscuro; recalcular();
  return salida;
}

// ---------------------------------------------------------------- arranque
// En el navegador: tono del bloque LIBRO, tema del atributo de <html> y aviso
// del botón de tema. En Node no hay documento y queda el tema claro.
recalcular();
if (typeof document !== "undefined") {
  const t = globalThis.__LIBRO?.tono;
  if (t) tono = typeof t === "string" ? (TONOS[t] ?? tono) : t;
  MODO.oscuro = document.documentElement.getAttribute("data-tema") === "oscuro";
  recalcular();
  addEventListener("sdi:tema", (e) => aplicarModo(Boolean(e.detail?.oscuro)));
}

// Conversión a OKLab y rampa derivada de un tono, para el módulo de
// propuestas de paleta (paletas-propuestas.js), que compara tonos sin cambiar
// el del libro. CLARO y OSCURO son las bases de cada tema, de solo lectura.
export {aOklab, deOklab, anclasDe, CLARO, OSCURO};
