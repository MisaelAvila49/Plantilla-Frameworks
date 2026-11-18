// src/components/muestra-composicion.js
// Lectura de los datos de muestra del riel, el mosaico de fracciones, el
// ternario y las unidades en espejo (src/data/muestra/trayectorias.csv,
// fracciones_entidades.csv, composicion_entidades.csv y espejo_edades.csv,
// que genera scripts/muestra_composicion.mjs). Igual que muestra.js: los CSV
// se leen sin tipado automático y aquí se convierte cada columna numérica. Al
// cargar los datos reales de un libro, este módulo se retira junto con esos
// archivos.

const numero = (x) => (x === "" || x == null ? null : +x);
const clave = (x) => String(x).padStart(2, "0");

export const leerTrayectorias = (filas) => filas.map((r) => ({
  ambito: r.ambito, dimension: r.dimension, grupo: r.grupo, orden: +r.orden, corte: +r.corte,
  num: numero(r.num), den: numero(r.den), pct: numero(r.pct), ee: numero(r.ee), casos: numero(r.casos),
}));
export const leerFraccionesEntidades = (filas) => filas.map((r) => ({
  cve: clave(r.cve_ent), entidad: r.entidad, region: r.region, anio: +r.anio, condicion: r.condicion,
  num: numero(r.num), den: numero(r.den), casos: numero(r.casos), pct: r.den ? (100 * +r.num) / +r.den : null,
}));
export const leerComposicionEntidades = (filas) => filas.map((r) => ({
  cve: clave(r.cve_ent), entidad: r.entidad, region: r.region, corte: +r.corte, sexo: r.sexo, motivo: r.motivo,
  personas: numero(r.personas), casos: numero(r.casos),
}));
export const leerEspejo = (filas) => filas.map((r) => ({
  region: r.region, anio: +r.anio, comparacion: r.comparacion, lado: r.lado, edad: r.edad, orden: +r.orden,
  personas: numero(r.personas), rurales: numero(r.rurales), casos: numero(r.casos),
}));

// Orden fijo de los motivos del ternario y de los lados del espejo: de ahí
// sale su color, no de cuántas personas tiene cada uno en la vista.
export const MOTIVOS = ["Motivo A", "Motivo B", "Motivo C"];
export const LADOS = {"Sexo": ["Mujeres", "Hombres"], "Situación": ["Empezó a cumplir", "Dejó de cumplir"]};
