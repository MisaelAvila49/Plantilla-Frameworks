// src/components/muestra-unidades.js
// Lectura de los datos de muestra de la familia de unidades
// (src/data/muestra/unidades_*.csv, que genera scripts/muestra_unidades.mjs).
// Igual que muestra.js: los CSV se leen sin tipado automático y aquí se
// convierte cada columna numérica. Al cargar los datos reales de un libro,
// este módulo se retira junto con esos archivos.

const numero = (x) => (x === "" || x == null ? null : +x);

export const leerSituaciones = (filas) => filas.map((r) => ({region: r.region, periodo: r.periodo, situacion: r.situacion, personas: numero(r.personas)}));
export const leerCondiciones = (filas) => filas.map((r) => ({
  condicion: r.condicion, comparacion: r.comparacion, grupo: r.grupo, anio: +r.anio,
  num: numero(r.num), den: numero(r.den), casos: numero(r.casos), pct: r.den ? (100 * +r.num) / +r.den : null,
}));
export const leerEdadCumplida = (filas) => filas.map((r) => ({anio: +r.anio, sexo: r.sexo, edad: +r.edad, personas: numero(r.personas)}));
export const leerPilas = (filas) => filas.map((r) => ({region: r.region, anio: +r.anio, sexo: r.sexo, personas: numero(r.personas)}));
export const leerEscalones = (filas) => filas.map((r) => ({
  region: r.region, grupo: r.grupo, orden: +r.orden, unidad: r.unidad,
  num: numero(r.num), den: numero(r.den), pct: r.den ? (100 * +r.num) / +r.den : null,
}));

// Orden fijo de las situaciones de la multitud: de ahí sale su color, no de
// cuántas personas tiene cada una en la vista.
export const SITUACIONES = ["Dejó de cumplir", "Empezó a cumplir", "Cumple en los dos años", "No cumple en ninguno"];
