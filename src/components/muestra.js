// src/components/muestra.js
// Lectura de los datos de muestra de la Plantilla (src/data/muestra/, que
// genera scripts/generar_muestra.mjs). Los CSV se leen SIN tipado automático
// para no perder los ceros de las claves ("01"), y aquí se convierte cada
// columna numérica. Al cargar los datos reales de un libro, este módulo se
// sustituye por el suyo.

const numero = (x) => (x === "" || x == null ? null : +x);

export const leerIndicador = (filas) => filas.map((r) => ({
  cve: String(r.cve_ent).padStart(2, "0"), entidad: r.entidad, region: r.region, anio: +r.anio, sexo: r.sexo,
  num: numero(r.num), den: numero(r.den), pct: numero(r.pct), ee: numero(r.ee), casos: numero(r.casos),
}));
export const leerUnidades = (filas) => filas.map((r) => ({
  cve: String(r.cve_ent).padStart(2, "0"), entidad: r.entidad, unidad: r.unidad, nombre: r.nombre, anio: +r.anio,
  num: numero(r.num), den: numero(r.den), pct: numero(r.pct),
}));
export const leerEdades = (filas) => filas.map((r) => ({anio: +r.anio, sexo: r.sexo, edad: r.edad, orden: +r.orden, num: numero(r.num), den: numero(r.den), pct: numero(r.pct)}));
export const leerComposicion = (filas) => filas.map((r) => ({region: r.region, anio: +r.anio, categoria: r.categoria, personas: numero(r.personas)}));
export const leerFlujos = (filas) => filas.map((r) => ({etapa: +r.etapa, desde: +r.desde, hasta: +r.hasta, origen: r.origen, destino: r.destino, personas: numero(r.personas)}));

// Tasa de un grupo de filas: suma de numeradores entre suma de denominadores.
// NUNCA se promedian tasas ni se suman ediciones.
export function tasa(filas) {
  let num = 0, den = 0;
  for (const r of filas) { if (r.num == null || r.den == null) continue; num += r.num; den += r.den; }
  return den ? {num, den, pct: 100 * num / den} : {num: null, den: null, pct: null};
}

// Universo del indicador de muestra, para la frase y el renglón de personas.
export const UNIVERSO = "de 5 años y más";
// Verificación de las figuras de muestra: no hay tabla oficial que cotejar.
export const VERIFICA_MUESTRA = {
  fuentes: [{id: "muestra-2026", texto: "Datos de muestra de la Plantilla (2026)"}],
  pendiente: "Son valores sintéticos: no hay tabla oficial con qué cotejarlos. En un libro real aquí va la tabla exacta de la fuente oficial y la cifra calculada junto a la publicada.",
};
