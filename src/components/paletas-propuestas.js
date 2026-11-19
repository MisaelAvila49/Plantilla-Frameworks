// src/components/paletas-propuestas.js
// PROPUESTAS DE PALETA para elegir el tono de los libros de datos, comparadas
// en la página «Muestra de colores» (src/colores.md). Este módulo NO cambia
// el tono por omisión de la Plantilla: el libro sigue con `LIBRO.tono` de la
// configuración. Solo la página de muestra aplica una propuesta, y lo hace
// sobre la paleta viva `P` mientras esa página está abierta.
//
// Cada propuesta declara, en claro y en oscuro, los papeles completos:
//   serie        color de la serie única (barras, líneas sin comparación)
//   rampa        nueve pasos de la rampa de magnitud, del valor bajo al alto
//                (la rampa del libro es continua: estos pasos son sus anclas)
//   categorias   trío de identidad (tres tonos y gris para «Otras»)
//   divergente   nueve tonos para el cambio: lado desfavorable, gris al
//                centro, lado favorable
//   rojo, azul   colores de «desfavorable» y «favorable» de significado()
//   comparacion  serie de referencia junto a la del tono (gris de tinta)
// Lo que una propuesta no declara se queda como en paleta.js.
//
// El resultado del validador de cada propuesta lo calcula el build
// (src/data/paletas-propuestas.json.js, con scripts/validar_propuestas.mjs).
// Al cambiar un color aquí, se borra la caché de ese loader
// (src/.observablehq/cache/data/paletas-propuestas.json) o el build sirve el
// resultado anterior.

import {P, MODO, CLARO, OSCURO, TONOS, definirTema, alCambiarModo, anclasDe, porTramos} from "./paleta.js";

// Nueve pasos de una rampa continua (anclas en OKLab), del bajo al alto.
const nueve = (anclas) => Array.from({length: 9}, (_, i) => porTramos(anclas)(i / 8));
// Rampa derivada del tono, igual que la del libro (anclasDe de paleta.js).
const derivada = (serie, oscuro) => nueve(anclasDe(serie, oscuro));

// ColorBrewer 2.0 (Brewer, Harrower y Penn State), esquemas secuenciales de
// nueve clases, copiados de colorbrewer2.org/colorbrewer_schemes.js el 18 de
// noviembre de 2026. Son esquemas para fondo claro; ColorBrewer no publica
// variante oscura.
export const COLORBREWER = {
  OrRd: ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"],
  Oranges: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
};
// Variante oscura de los esquemas de ColorBrewer, hecha aquí: cada paso
// conserva el matiz y el croma de su paso claro (recortado a la gama sRGB) y
// la luminosidad OKLab va de 0.27 a 0.90, de modo que el valor alto es el
// más luminoso sobre el fondo oscuro, como en la rampa del libro.
const OSCURA = {
  OrRd: ["#2b251d", "#48371c", "#6a470e", "#8f551b", "#c25820", "#eb6145", "#ff816e", "#ffac9f", "#ffd2ca"],
  Oranges: ["#2c251e", "#493622", "#6b4619", "#955100", "#be5d00", "#ec6405", "#ff835a", "#ffad92", "#ffd3c5"],
};

// Trío y divergente que tenía paleta.js antes de adoptar la propuesta A (18
// de noviembre de 2026). Las propuestas de la primera ronda (D a I) se
// comparan con ellos, como se validaron entonces; paleta.js ya usa los de A.
const ANTERIOR = {
  claro: {categorias: ["#0E9384", "#B87709", "#863913"], divergente: ["#67001F", "#B2182B", "#D6604D", "#F4A582", "#E8E6E1", "#92C5DE", "#4393C3", "#2166AC", "#053061"]},
  oscuro: {categorias: ["#22AB8A", "#B28834", "#A84832"], divergente: [...OSCURO.divergente]},
};
// Divergente del cambio de la propuesta F (rojo Ibero): ocre en el lado desfavorable,
// gris al centro, los azules del libro en el favorable. Brazo ocre hecho en
// OKLCH (matiz 62° a 72°), sin rojo porque el rojo ya es la magnitud.
const DIVERGENTE_OCRE = {
  claro: ["#5b3100", "#8f5300", "#c68128", "#ebc391", ...ANTERIOR.claro.divergente.slice(4)],
  oscuro: ["#f5d1a5", "#d6954a", "#a1600d", "#60370b", ...ANTERIOR.oscuro.divergente.slice(4)],
};

// Base común: grises, rojo y azul salen de paleta.js; trío y divergente, de ANTERIOR.
const base = (b) => {
  const a = b === OSCURO ? ANTERIOR.oscuro : ANTERIOR.claro;
  return {categorias: [...a.categorias], divergente: [...a.divergente], rojo: b.rojo, azul: b.azul, comparacion: b.tinta2, contexto: b.contexto, gris: b.gris};
};

// ------------------------------------ propuestas diseñadas (A, B y C)
// Segunda ronda: en vez de partir de una paleta hecha, se diseñaron en OKLCH
// para pasar TODAS las comprobaciones obligatorias del validador en los dos
// temas, y se iteró con scripts/validar_propuestas.mjs hasta lograrlo.
//
// Por qué solo verdes azulados (matiz 165° a 195°). Se barrió el círculo de
// 55° a 215° en pasos de 5° y de luminosidad 0.03, contra el rojo y el azul
// semánticos de cada tema (pares todos, sin avisos):
//   - ocre y mostaza (60° a 100°): la serie pasa en claro, pero la rampa no.
//     Con deuteranopía el ocre medio y oscuro se vuelve el mismo color que el
//     rojo (ΔE 0.7 a 4.4 en el 75 % de la rampa); ningún ajuste de luz lo
//     arregló. En oscuro ninguna serie ocre pasa sin aviso.
//   - verde pino (145° a 160°): es la confusión rojo-verde clásica; la rampa
//     al 75 % queda a ΔE 3.0 a 4.1 del rojo con protanopía.
//   - azul tinta, índigo y gris azulado: chocan con el azul de «favorable»
//     (ΔE normal bajo 15) o no llegan al croma mínimo de 0.10; el morado está
//     prohibido (R93).
//   - de 165° a 190° sí hay soluciones, y en oscuro solo hasta ~180°: más
//     azul, la serie se acerca al azul oscuro #4A90D9 (ΔE 12.7 a 14.4).
//
// Rampa: nueve pasos de UNA tinta (matiz fijo, croma recortado a la gama
// sRGB) con luminosidad uniforme de 0.955 a 0.29 en claro (paso 0.083) y de
// 0.27 a 0.91 en oscuro (paso 0.08), así que también pasa como nueve clases
// (la prueba informativa que fallaba para todas las de la primera ronda). El extremo bajo se deja casi
// blanco a propósito: llevarlo a 2:1 contra el fondo (L ≤ 0.78) haría que el
// 0 % pareciera un valor y que el gris de «Sin dato» quedara más claro que el
// cero; por eso ese aviso se queda, como en verificar:paleta.
// El extremo alto de la rampa clara se lleva a 0.29-0.315: entre 0.33 y 0.38
// el verde azulado oscuro coincide con el rojo simulado con protanopía (ΔE
// 5.3 en el jade), y más abajo se vuelve a separar.
//
// Trío de identidad nuevo, sin la terracota (que con protanopía era el mismo
// rojo, ΔE 1.8): petróleo, ocre y verde, con matices fijos entre temas.
// Búsqueda exhaustiva de tríos que pasan sin avisos: en claro el elegido se
// separa además del rojo (ΔE ≥ 9.9 con daltonismo) y del azul; en oscuro
// ninguno de 1,717 tríos posibles separa los tres tonos del rojo: el mejor
// deja el ocre a ΔE 6.0 con deuteranopía y 12.5 con visión normal. Es la
// razón de fondo de R107 y la prueba sigue como informativa.
const TRIO_DISENADO = {claro: ["#00a18d", "#bf7900", "#006e47"], oscuro: ["#009784", "#d77800", "#1f7200"]};
// Divergente con los extremos claros de cada brazo a 2:1 contra el blanco
// (#F4A582 daba 1.99:1 y #92C5DE 1.86:1): mismo matiz, luminosidad 0.77.
const DIVERGENTE_DISENADO = {claro: ["#67001F", "#B2182B", "#D6604D", "#eb9e84", CLARO.divergente[4], "#85b9d8", "#4393C3", "#2166AC", "#053061"], oscuro: [...OSCURO.divergente]};
const disenada = (b, modo, serie, rampa) => ({...base(b), serie, rampa, categorias: [...TRIO_DISENADO[modo]], divergente: [...DIVERGENTE_DISENADO[modo]]});

export const PROPUESTAS = [
  {
    id: "a", letra: "A", nombre: "Petróleo Ibero (la actual de la Plantilla)", recomendada: true, disenada: true,
    idea: "Verde azulado de matiz 185° (serie #008e82, L 0.58, croma 0.12), el lado opuesto del círculo al rojo Ibero (27°). Es la D (el petróleo anterior) rehecha con método: misma familia, pero rampa de una tinta con pasos de luz iguales, divergente con los extremos claros legibles y un trío nuevo sin terracota.",
    rojo: "Sin conflicto, medido: la serie y la rampa se separan del rojo de «desfavorable» con daltonismo y con visión normal en los dos temas, y el trío claro también. El rojo queda para el acento de la interfaz y para lo que se pierde.",
    porque: "Complementa el rojo de la marca sin competir con él: está en el lado opuesto del círculo cromático, así que el rojo del antetítulo, de la cifra principal y de «desfavorable» resalta más junto a él, y ninguno de los dos se lee como el otro con daltonismo. No carga un significado propio, de modo que sirve igual para población, educación, trabajo, salud o territorio: la magnitud va en la rampa petróleo y el cambio en rojo y azul, sin que una se confunda con el otro. Medido en el build: ninguna de las 33 comprobaciones obligatorias falla, ni en claro ni en oscuro; 30 pasan y las otras 3 son los avisos que tiene cualquier propuesta por diseño (el extremo casi blanco de la rampa y el gris de comparación). Su rampa también pasa como nueve clases. Sobre la tapa y la portada claras la serie da 3.72:1 contra el papel #f8f5ee y 4.05:1 contra el blanco, y la tinta negra y el rojo de la marca no cambian.",
    // Desde el 18 de noviembre de 2026 es el tono por omisión: sus valores
    // viven en TONOS.petroleoIbero de paleta.js y aquí solo se leen.
    claro: disenada(CLARO, "claro", TONOS.petroleoIbero.claro, TONOS.petroleoIbero.rampa.claro),
    oscuro: disenada(OSCURO, "oscuro", TONOS.petroleoIbero.oscuro, TONOS.petroleoIbero.rampa.oscuro),
  },
  {
    id: "b", letra: "B", nombre: "Jade", disenada: true,
    idea: "Un verde más cálido, de matiz 168° (serie #007c5d, L 0.52, croma 0.13): más cerca de la naturaleza y del papel de la marca que el petróleo, y todavía lejos del verde pino que se confunde con el rojo.",
    rojo: "Sin conflicto, medido. Es el verde más amarillo que pasa: a partir de 160° la rampa se confunde con el rojo con protanopía. Por eso su rampa clara termina muy oscura (L 0.29), donde vuelve a separarse.",
    claro: disenada(CLARO, "claro", "#007c5d", ["#d8f9eb", "#a4e5cb", "#53d5aa", "#30ba91", "#009f78", "#008262", "#00674d", "#004d39", "#003426"]),
    oscuro: disenada(OSCURO, "oscuro", "#00936f", ["#002f21", "#004633", "#005f46", "#00785b", "#00936f", "#1cae86", "#44c89e", "#7cdeba", "#c5ecdb"]),
  },
  {
    id: "c", letra: "C", nombre: "Turquesa", disenada: true,
    idea: "El verde azulado más frío que pasa en claro, de matiz 195° (serie #009a9a, L 0.62, croma 0.115): más luminoso y más fresco que el petróleo.",
    rojo: "Sin conflicto con el rojo. El límite es el azul: en oscuro, cualquier turquesa queda a ΔE 12.7 a 14.4 del azul de «favorable» (#4A90D9), así que el tema oscuro usa la misma serie y rampa que A. Es una propuesta solo para el tema claro.",
    claro: disenada(CLARO, "claro", "#009a9a", ["#d7f8f7", "#a2e3e3", "#4ad2d2", "#23b7b7", "#009c9c", "#008181", "#006767", "#004d4e", "#003636"]),
    oscuro: disenada(OSCURO, "oscuro", "#009580", ["#002e26", "#00453a", "#005e50", "#007766", "#00927d", "#15ad95", "#41c7ae", "#7addc7", "#c4ebe1"]),
  },
  {
    id: "d", letra: "D", nombre: "Petróleo (el anterior)",
    idea: "El verde azulado que hoy usa la Plantilla, como punto de comparación. No se parece a la marca, pero no se cruza con el rojo ni con el azul, que quedan libres para lo desfavorable y lo favorable.",
    rojo: "Sin conflicto: el rojo solo aparece en el cambio y en el acento de la interfaz; la rampa y la serie son verdes azuladas. Hallazgo previo a esta comparación: la terracota del trío actual (#863913) casi no se distingue del rojo con protanopía (ΔE 1.8). No comparten figura, pero conviene revisarla.",
    claro: {...base(CLARO), serie: "#0E9384", rampa: derivada("#0E9384", false)},
    oscuro: {...base(OSCURO), serie: "#22AB8A", rampa: derivada("#22AB8A", true)},
  },
  {
    id: "e", letra: "E", nombre: "Ocre (la alternativa actual)",
    idea: "El ocre que la Plantilla ya trae como segunda opción (TONOS.ocre). Cálido y cercano al papel de la marca sin ser rojo.",
    rojo: "Sin conflicto con el rojo en claro. En oscuro el ocre se acerca al rojo con protanopía (aviso del validador): ahí el color va con rótulo directo. El ocre también es la segunda categoría del trío.",
    claro: {...base(CLARO), serie: "#B87709", rampa: derivada("#B87709", false)},
    oscuro: {...base(OSCURO), serie: "#9A5A0A", rampa: derivada("#9A5A0A", true)},
  },
  {
    id: "f", letra: "F", nombre: "Rojo Ibero de una tinta",
    idea: "Toda la magnitud en el rojo de la marca: del rosa casi blanco al #C4101B y a un vino oscuro, derivada igual que la rampa del libro. Es la que más se parece a la Ibero.",
    rojo: "Conflicto total: la serie es el mismo color que «desfavorable». Para que el rojo diga una sola cosa, aquí lo desfavorable pasa al ocre (#c0700c) y el cambio se pinta de ocre a azul. Eso rompe la regla de todo el sitio (rojo es lo que se pierde), y el ocre del trío de categorías choca con el nuevo «desfavorable».",
    claro: {...base(CLARO), serie: "#C4101B", rampa: derivada("#C4101B", false), rojo: "#c0700c", divergente: DIVERGENTE_OCRE.claro},
    oscuro: {...base(OSCURO), serie: "#E8474F", rampa: derivada("#E8474F", true), rojo: "#a1600d", divergente: DIVERGENTE_OCRE.oscuro},
  },
  {
    id: "g", letra: "G", nombre: "Oranges de ColorBrewer",
    referencia: {texto: "ColorBrewer, Oranges de 9 clases", url: "https://colorbrewer2.org/#type=sequential&scheme=Oranges&n=9"},
    idea: "La familia cálida de ColorBrewer que no termina en rojo: de crema a naranja quemado y café. Serie en el sexto paso (#f16913). El rojo queda para el cambio, como sugiere separar «magnitud en naranja» y «cambio en rojo y azul».",
    rojo: "Conflicto menor que en OrRd (H), pero medible: la rampa es de una sola tinta y la serie se separa del rojo, aunque sus pasos altos (#d94801 y #7f2704) quedan a ΔE 9.1 y 14.3 del rojo de «desfavorable» aun con visión normal (el mínimo es 15), y en oscuro la mitad de la rampa también. Se resolvería recortando la rampa antes del naranja quemado.",
    claro: {...base(CLARO), serie: "#f16913", rampa: [...COLORBREWER.Oranges]},
    oscuro: {...base(OSCURO), serie: "#9c4700", rampa: [...OSCURA.Oranges]},
  },
  {
    id: "h", letra: "H", nombre: "OrRd de ColorBrewer",
    referencia: {texto: "ColorBrewer, OrRd de 9 clases", url: "https://colorbrewer2.org/#type=sequential&scheme=OrRd&n=9"},
    idea: "La rampa de referencia, tal cual en claro: de crema a rojo oscuro, pasando por naranja. La serie única toma el sexto paso (#ef6548), el más oscuro que todavía se separa del rojo de «desfavorable».",
    rojo: "Conflicto: el tercio alto de la rampa (#d7301f a #7f0000) es el mismo rojo que «desfavorable», con un matiz a 2 o 3 grados del rojo Ibero. Un mapa de nivel y uno de cambio en el mismo capítulo dirían «rojo» con dos sentidos. Además la rampa gira 47° de matiz (de naranja a rojo) y R99 pide una sola tinta. La serie se resuelve con el naranja; la rampa solo se resuelve recortándola antes del rojo, y entonces ya no es OrRd.",
    claro: {...base(CLARO), serie: "#ef6548", rampa: [...COLORBREWER.OrRd]},
    oscuro: {...base(OSCURO), serie: "#a24100", rampa: [...OSCURA.OrRd]},
  },
  {
    id: "i", letra: "I", nombre: "Neutra cálida con acento rojo",
    idea: "Grises cálidos para la serie y la rampa, como la tipografía y el papel de la marca; el rojo Ibero queda solo de acento (antetítulo, cifra principal) y para «desfavorable».",
    rojo: "Sin conflicto con el rojo, que queda reservado. El conflicto se muda al gris: en el libro el gris quiere decir «sin cambio», «sin dato» y contexto, y aquí también es la serie. La serie gris no pasa el croma mínimo (se lee gris, a propósito), en oscuro se confunde con el rojo bajo protanopía y la comparación tiene que ir en el gris claro de contexto.",
    claro: {...base(CLARO), serie: "#5b544c", rampa: derivada("#5b544c", false), comparacion: CLARO.contexto},
    oscuro: {...base(OSCURO), serie: "#7a736b", rampa: derivada("#7a736b", true), comparacion: OSCURO.contexto},
  },
];
export const POR_ID = new Map(PROPUESTAS.map((p) => [p.id, p]));

// ------------------------------------------------------------- aplicar
// La propuesta vigente se escribe sobre la paleta viva. `definirTema` deriva
// del tono lo que la propuesta no declara (tonoTexto, tonoSuave) y avisa a
// quien dibuja; este módulo se suscribe primero, para escribir sus papeles
// antes de que las gráficas se vuelvan a pintar. `asegurar()` hace lo mismo
// a mano: la página lo llama antes de dibujar, por si el orden falla.
let actual = PROPUESTAS[0];
export const vigente = () => actual;
export function asegurar() {
  const m = MODO.oscuro ? actual.oscuro : actual.claro;
  if (P.serie !== m.serie) definirTema({claro: actual.claro.serie, oscuro: actual.oscuro.serie});
  Object.assign(P, {
    serie: m.serie, rampa: [...m.rampa], categorias: [...m.categorias], divergente: [...m.divergente],
    rojo: m.rojo, azul: m.azul, comparacion: m.comparacion,
  });
  return P;
}
alCambiarModo(() => asegurar());
export function aplicarPropuesta(id) {
  actual = POR_ID.get(id) ?? PROPUESTAS[0];
  definirTema({claro: actual.claro.serie, oscuro: actual.oscuro.serie});
  return asegurar();
}
