// Comprobación de daltonismo y contraste de las paletas que el libro DIBUJA.
//
// No trae ninguna lista propia: importa `paletasDibujadas()` de
// src/components/paleta.js, que es la fuente única de color, y corre sobre
// cada una el validador de la skill `dataviz` (copiado en
// validate_palette.js), en claro y en oscuro y contra la superficie real.
// Si una paleta cambia en paleta.js, aquí cambia sola.
//
// Uso:  npm run verificar:paleta            (tono declarado en LIBRO)
//       node scripts/verificar_paleta.mjs ocre   (otro tono, para probarlo)

import {validate, validateOrdinal} from "./validate_palette.js";
import {paletasDibujadas, TONOS} from "../src/components/paleta.js";

let tono = process.argv[2];
if (!tono) {
  const {LIBRO} = await import("../observablehq.config.js");
  tono = LIBRO.tono;
}
const nombreTono = typeof tono === "string" ? tono : JSON.stringify(tono);
if (typeof tono === "string" && !TONOS[tono]) { console.error(`Tono desconocido: ${tono}`); process.exit(2); }
console.log(`Tono de tema: ${nombreTono}`);

// Matriz bivariada (3 × 3, `matriz`). No es una paleta categórica ni una
// rampa de un solo matiz, así que se revisa por partes:
//  - cada fila y cada columna es un eje: luminosidad monótona y pasos
//    visibles (obligatorio). El matiz único y el contraste del extremo bajo
//    no aplican: la esquina «ambos bajos» es un gris compartido por los dos
//    ejes y se acerca al fondo a propósito, como en la rampa de magnitud.
//  - las tres esquinas que el lector distingue (solo A, solo B, los dos)
//    se separan para daltonismo y para visión normal (obligatorio). La banda
//    de luminosidad, el croma mínimo y el contraste con el fondo no aplican:
//    la matriz varía la luminosidad a propósito y cada polígono lleva borde.
function validarMatriz(p) {
  const m = p.matriz, report = [];
  const lineas = [...m.map((r, i) => [`fila ${i}`, r]), ...m[0].map((_, j) => [`columna ${j}`, m.map((r) => r[j])])];
  for (const [n, hex] of lineas) {
    for (const [k, e, d] of validateOrdinal(hex, {mode: p.modo, surface: p.superficie}).report) {
      const exento = ["Single hue", "Light-end contrast"].includes(k);
      report.push([`${n}: ${k}`, exento && e === false ? "aviso" : e, d]);
    }
  }
  for (const [k, e, d] of validate([m[2][0], m[0][2], m[2][2]], {mode: p.modo, surface: p.superficie, pairs: "all"}).report) {
    const exento = ["Lightness band", "Chroma floor", "Contrast vs surface"].includes(k);
    report.push([`esquinas: ${k}`, exento && e === false ? "aviso" : e, d]);
  }
  return {report, ok: report.every(([, e]) => e !== false)};
}

let fallos = 0;
for (const p of paletasDibujadas(tono)) {
  let {report, ok} = p.matriz ? validarMatriz(p) : p.ordinal
    ? validateOrdinal(p.hex, {mode: p.modo, surface: p.superficie})
    : validate(p.hex, {mode: p.modo, surface: p.superficie, pairs: p.pares});
  // Rampa continua de magnitud: el extremo bajo se acerca al fondo a propósito
  // (el cero casi no pinta), así que su contraste con la superficie se informa
  // como aviso y no como falla. Lo compensa el contorno que llevan las marcas
  // de la rampa (P.borde) y la casilla «Sin dato» aparte. Las demás
  // comprobaciones (un solo matiz, luminosidad monótona, pasos visibles) sí
  // son obligatorias.
  if (p.ordinal) {
    report = report.map(([n, e, d]) => (n === "Light-end contrast" && e === false ? [n, "aviso", d + " (aviso: la rampa es continua y sus marcas llevan contorno)"] : [n, e, d]));
    ok = report.every(([, e]) => e !== false);
  }
  // Paleta con un gris de referencia (`neutro`: posiciones del gris). El
  // gris es neutro a propósito, así que su croma bajo y su luminosidad fuera
  // de la banda categórica se informan como aviso. Solo se perdona si TODOS
  // los tonos señalados son grises de la lista; la separación entre series y
  // el contraste con el fondo siguen siendo obligatorios.
  if (p.neutro?.length) {
    const grises = new Set(p.neutro.map((i) => p.hex[i].toLowerCase()));
    report = report.map(([n, e, d]) => {
      if (e !== false || !["Lightness band", "Chroma floor"].includes(n)) return [n, e, d];
      const senalados = (String(d).match(/#[0-9a-f]{6}/gi) ?? []).map((x) => x.toLowerCase());
      return senalados.length && senalados.every((x) => grises.has(x)) ? [n, "aviso", d + " (aviso: es el gris de referencia, neutro a propósito)"] : [n, e, d];
    });
    ok = report.every(([, e]) => e !== false);
  }
  console.log(`\n== ${p.nombre}  ${p.hex.join(" ")}  →  ${ok ? "pasa" : "FALLA"}`);
  for (const [nombre, estado, detalle] of report) {
    const e = estado === true ? "pass" : estado === false ? "fail" : String(estado);
    console.log(`   ${e.padEnd(6)} ${nombre.padEnd(22)} ${detalle}`);
  }
  if (!ok) fallos++;
}
console.log("\n" + "=".repeat(60));
if (fallos) { console.log(`FALLAN ${fallos} paletas.`); process.exit(1); }
console.log("Todas las paletas dibujadas pasan el validador en claro y en oscuro.");
