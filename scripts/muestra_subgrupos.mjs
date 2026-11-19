// scripts/muestra_subgrupos.mjs
// DATOS DE MUESTRA del patrón «subgrupo con grado» y del mapa como vista del
// filtro (galería de mapas, sección «El indicador por subgrupo»). Son cifras
// inventadas, deterministas, derivadas de src/data/muestra/indicador.csv; no
// describen a ninguna población real.
//
// Escribe src/data/muestra/subgrupos.csv en el esquema largo del contrato
// (docs/datos.md, «Subgrupos con grado»):
//   cve_ent, entidad, anio, sexo, subgrupo, grado, grupo, num, den, casos, ee
// - subgrupo = «Todos»: las dos filas de siempre, grupo «Con la condición» y
//   «Sin la condición» (excluyentes, se suman).
// - subgrupo = A, B o C con grado «Alto» o «Bajo»: subgrupos NO excluyentes
//   (una persona puede estar en dos), y la fila de referencia
//   subgrupo = «Ninguno», grado «Ninguno»: quien no está en ningún subgrupo.
// `ee` va en proporción (0 a 1), como en los Parquet de los libros. Algunas
// celdas del subgrupo C, en las entidades chicas, quedan con menos de 30
// casos a propósito, para ver la trama del mapa y el aviso del globo.
//
// Uso: node scripts/muestra_subgrupos.mjs
import {readFileSync, writeFileSync} from "node:fs";
import path from "node:path";

const RAIZ = path.join(import.meta.dirname, "..");
const lineas = readFileSync(path.join(RAIZ, "src/data/muestra/indicador.csv"), "utf8").trim().split(/\r?\n/);
const cab = lineas[0].split(",");
const filas = lineas.slice(1).map((l) => Object.fromEntries(l.split(",").map((x, i) => [cab[i], x])));
const ANIOS = new Set(["2010", "2020"]);
// Pseudoazar estable por clave (mismo número en cada corrida).
const azar = (texto) => { let h = 2166136261; for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return ((h >>> 0) % 10000) / 10000; };
const acotar = (x, a, b) => Math.max(a, Math.min(b, x));
// Parte de la población y desplazamiento de la tasa de cada subgrupo y grado.
const SUB = {
  A: {Alto: {parte: 0.025, dp: -0.06}, Bajo: {parte: 0.05, dp: -0.02}},
  B: {Alto: {parte: 0.015, dp: 0.02}, Bajo: {parte: 0.03, dp: 0.05}},
  C: {Alto: {parte: 0.0012, dp: -0.14}, Bajo: {parte: 0.006, dp: -0.06}},
};
const MUESTREO = 1 / 150; // casos por persona de la población, aproximado
const salida = [["cve_ent", "entidad", "anio", "sexo", "subgrupo", "grado", "grupo", "num", "den", "casos", "ee"].join(",")];
const fila = (r, subgrupo, grado, grupo, p, den) => {
  const casos = Math.max(3, Math.round(den * MUESTREO * (0.7 + 0.6 * azar(`${r.cve_ent}${r.anio}${r.sexo}${subgrupo}${grado}`))));
  const num = Math.round(p * den);
  const ee = Math.sqrt((p * (1 - p)) / casos) * 1.4;
  salida.push([r.cve_ent, `"${r.entidad}"`, r.anio, r.sexo, subgrupo, grado, grupo, num, Math.round(den), casos, ee.toFixed(5)].join(","));
};
for (const r of filas) {
  if (!ANIOS.has(r.anio)) continue;
  const p = Number(r.num) / Number(r.den), den = Number(r.den);
  const pCon = acotar(p - 0.15 - 0.05 * azar(r.cve_ent + "c"), 0.03, 0.9), pSin = acotar(p + 0.08, 0.05, 0.97);
  fila(r, "Todos", "Todos", "Con la condición", pCon, den * 0.07);
  fila(r, "Todos", "Todos", "Sin la condición", pSin, den * 0.93);
  for (const [s, grados] of Object.entries(SUB)) for (const [g, x] of Object.entries(grados)) {
    fila(r, s, g, "Con la condición", acotar(pCon + x.dp + 0.04 * (azar(`${r.cve_ent}${s}${g}`) - 0.5), 0.01, 0.95), den * x.parte * (0.8 + 0.4 * azar(`${r.cve_ent}${s}`)));
  }
  fila(r, "Ninguno", "Ninguno", "Sin la condición", pSin, den * 0.88);
}
writeFileSync(path.join(RAIZ, "src/data/muestra/subgrupos.csv"), salida.join("\n") + "\n");
console.log(`subgrupos.csv: ${salida.length - 1} filas`);
