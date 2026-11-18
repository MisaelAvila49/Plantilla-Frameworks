// Validador de las PROPUESTAS DE PALETA (src/components/paletas-propuestas.js).
//
// Corre sobre cada propuesta, en claro y en oscuro y contra el fondo real de
// cada tema, el mismo validador de la skill `dataviz` que usa
// `npm run verificar:paleta` (validate_palette.js), con las mismas
// excepciones documentadas allí. Lo usa el loader
// src/data/paletas-propuestas.json.js para que la página «Muestra de colores»
// muestre el resultado calculado en el build, nunca a ojo.
//
// Uso:  node scripts/validar_propuestas.mjs        (imprime el informe)

import {validate, validateOrdinal} from "./validate_palette.js";
import {CLARO, OSCURO, porTramos} from "../src/components/paleta.js";
import {PROPUESTAS} from "../src/components/paletas-propuestas.js";

// Nombres de las comprobaciones y frases del validador, en español.
const NOMBRES = {
  "Lightness band": "Banda de luminosidad", "Chroma floor": "Croma mínimo",
  "CVD separation": "Separación con daltonismo", "Normal-vision floor": "Separación con visión normal",
  "Contrast vs surface": "Contraste con el fondo", "Lightness monotone": "Luminosidad en orden",
  "Adjacent ΔL": "Paso entre tonos", "Light-end contrast": "Extremo claro contra el fondo", "Single hue": "Una sola tinta",
};
const FRASES = [
  [/worst all-pairs/g, "peor par"], [/worst adjacent/g, "peor par vecino"], [/\(normal\)/g, "(visión normal)"],
  [/ — below 15, hard to tell apart even with full color vision/g, ", bajo 15: difícil de distinguir aun con visión normal"],
  [/outside band: /g, "fuera de la banda: "], [/below floor \(reads gray\): /g, "bajo el mínimo (se lee gris): "],
  [/all (\d+) inside L/g, "los $1 dentro de L"], [/all (\d+) >= /g, "los $1 ≥ "],
  [/below 3:1 — relief required \(visible labels or table view\): /g, "bajo 3:1, exige rótulo o tabla: "],
  [/steps read light→dark/g, "de claro a oscuro"], [/out of order — L values/g, "fuera de orden, L"],
  [/steps too close: /g, "pasos muy juntos: "], [/all gaps >= /g, "todos los pasos ≥ "],
  [/ at ([\d.]+):1 vs surface/g, " a $1:1 del fondo"], [/ — below 2:1 floor/g, ", bajo 2:1"],
  [/hue spread (\d+)°/g, "giro de matiz de $1°"], [/ — >40°, not a one-hue ramp/g, ", más de 40°: no es de una tinta"],
  [/\(protan\)/g, "(protanopía)"], [/\(deutan\)/g, "(deuteranopía)"], [/tritan/g, "tritanopía"],
];
const traducir = (t) => FRASES.reduce((s, [re, x]) => s.replace(re, x), String(t));
const estado = (e) => (e === true || e === "pass" ? "pasa" : e === false || e === "fail" ? "falla" : "aviso");
// Lista de comprobaciones de un reporte, con estado pasa / aviso / falla.
const filas = (report, {exentas = [], avisos = []} = {}) => report
  .filter(([n]) => !exentas.includes(n))
  .map(([n, e, d]) => {
    let s = estado(e);
    if (s === "falla" && avisos.includes(n)) s = "aviso";
    return {nombre: NOMBRES[n] ?? n, estado: s, detalle: traducir(d)};
  });
const peor = (lista) => (lista.some((x) => x.estado === "falla") ? "falla" : lista.some((x) => x.estado === "aviso") ? "aviso" : "pasa");

// Las comprobaciones de una propuesta en un tema.
export function evaluar(m, oscuro) {
  const mode = oscuro ? "dark" : "light";
  const surface = (oscuro ? OSCURO : CLARO).fondo;
  const op = {mode, surface};
  const cinco = [0, 0.25, 0.5, 0.75, 1].map((t) => porTramos(m.rampa)(t));
  const pruebas = [];
  const agregar = (id, titulo, hex, lista, {informativa = false, nota = null} = {}) =>
    pruebas.push({id, titulo, hex, informativa, nota, resultado: peor(lista), comprobaciones: lista});

  // 1. Rojo, azul y serie, separados entre TODOS los pares (verificar:paleta).
  agregar("semanticos", "Rojo, azul y serie única", [m.rojo, m.azul, m.serie],
    filas(validate([m.rojo, m.azul, m.serie], {...op, pairs: "all"}).report));
  // 2. Trío de identidad.
  agregar("categorias", "Trío de categorías", [...m.categorias],
    filas(validate(m.categorias, {...op, pairs: "all"}).report));
  // 3. Rampa continua, en cinco puntos (0, 25, 50, 75 y 100 %). El extremo
  // claro contra el fondo es aviso: las marcas de la rampa llevan contorno.
  agregar("rampa", "Rampa de magnitud (continua)", cinco,
    filas(validateOrdinal(cinco, op).report, {avisos: ["Light-end contrast"]}));
  // 4. Los nueve pasos como clases separadas. Informativa: el libro usa la
  // rampa continua (R100); solo importa si alguien la parte en clases.
  agregar("nueve", "Rampa en 9 clases", [...m.rampa],
    filas(validateOrdinal(m.rampa, op).report, {avisos: ["Light-end contrast"]}), {informativa: true, nota: "Solo cuenta si la rampa se usa en clases; el libro la usa continua."});
  // 5. Divergente: cada brazo es una rampa de una tinta y sus tonos medios
  // se separan con daltonismo y con visión normal. Banda, croma y contraste
  // no aplican a los extremos de una divergente (cambian de luz a propósito).
  const d = m.divergente;
  const brazo = (h) => filas(validateOrdinal(h, op).report, {avisos: ["Light-end contrast"]});
  const desf = brazo(d.slice(0, 4)).map((x) => ({...x, nombre: `Lado desfavorable: ${x.nombre.toLowerCase()}`}));
  const fav = brazo(d.slice(5)).map((x) => ({...x, nombre: `Lado favorable: ${x.nombre.toLowerCase()}`}));
  const ext = filas(validate([d[1], d[7]], {...op, pairs: "all"}).report, {exentas: ["Lightness band", "Chroma floor", "Contrast vs surface"]})
    .map((x) => ({...x, nombre: `Un lado contra el otro: ${x.nombre.toLowerCase()}`}));
  agregar("divergente", "Divergente del cambio", [...d], [...desf, ...fav, ...ext]);
  // 6. Serie frente al gris de comparación. El gris es neutro a propósito:
  // su croma y su banda son aviso (igual que en verificar:paleta).
  const comp = filas(validate([m.serie, m.comparacion], {...op, pairs: "all"}).report).map((x) => {
    if (x.estado !== "falla" || !["Banda de luminosidad", "Croma mínimo"].includes(x.nombre)) return x;
    const senalados = (x.detalle.match(/#[0-9a-f]{6}/gi) ?? []).map((h) => h.toLowerCase());
    return senalados.every((h) => h === m.comparacion.toLowerCase()) ? {...x, estado: "aviso", detalle: x.detalle + " (es el gris de referencia, neutro a propósito)"} : x;
  });
  agregar("comparacion", "Serie y gris de comparación", [m.serie, m.comparacion], comp);
  // 7. El rojo de «desfavorable» dice una sola cosa: se separa de la mitad
  // alta de la rampa y de la serie, que son las marcas que un lector ve en
  // las otras gráficas del mismo capítulo. Solo se mide separación (con
  // daltonismo y con visión normal), par por par.
  const cruce = (rotulo, hex) => {
    const r = filas(validate([hex, m.rojo], {...op, pairs: "all"}).report, {exentas: ["Lightness band", "Chroma floor", "Contrast vs surface"]});
    return {nombre: `Contra ${rotulo}`, estado: peor(r), detalle: r.map((x) => x.detalle).join(" · ")};
  };
  const altos = [0.5, 0.75, 1].map((t) => ({rotulo: `la rampa al ${t * 100} %`, hex: porTramos(m.rampa)(t)}));
  agregar("rojo", "«Desfavorable» frente a la rampa y la serie", [m.rojo, ...altos.map((c) => c.hex), m.serie],
    [...altos.map((c) => cruce(c.rotulo, c.hex)), cruce("la serie", m.serie)]);
  // 8. Lo mismo contra cada categoría. Informativa: el trío no comparte
  // figura con el rojo (R96), pero un tono que se le confunde hace dudar.
  agregar("rojoCategorias", "«Desfavorable» frente a las categorías", [m.rojo, ...m.categorias],
    m.categorias.map((h, i) => cruce(`la categoría ${i + 1}`, h)), {informativa: true, nota: "El trío no comparte figura con el rojo (R96); se informa porque un tono que se confunde con «desfavorable» hace dudar al lector."});

  const cuentan = pruebas.filter((p) => !p.informativa);
  return {modo: oscuro ? "oscuro" : "claro", fondo: surface, resultado: peor(cuentan.map((p) => ({estado: p.resultado}))), pruebas};
}

export function evaluarTodas() {
  return PROPUESTAS.map((p) => ({
    id: p.id, letra: p.letra, nombre: p.nombre,
    claro: evaluar(p.claro, false), oscuro: evaluar(p.oscuro, true),
  }));
}

if (process.argv[1]?.endsWith("validar_propuestas.mjs")) {
  for (const p of evaluarTodas()) {
    for (const t of [p.claro, p.oscuro]) {
      console.log(`\n== ${p.letra}. ${p.nombre} (${t.modo}) → ${t.resultado}`);
      for (const x of t.pruebas) {
        console.log(`   ${x.resultado.padEnd(6)} ${x.informativa ? "(informativa) " : ""}${x.titulo}`);
        for (const c of x.comprobaciones) if (c.estado !== "pasa") console.log(`        ${c.estado.padEnd(6)} ${c.nombre}: ${c.detalle}`);
      }
    }
  }
}
