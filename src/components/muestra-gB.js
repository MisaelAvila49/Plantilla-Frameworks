// src/components/muestra-gB.js
// Lectura de los datos de muestra de las galerías de comparación, precisión
// y tablas (archivos gB_*.csv que genera scripts/muestra_gB.mjs). Los CSV se
// leen sin tipado automático para no perder los ceros de las claves, y aquí
// se convierte cada columna numérica. Una celda vacía queda en null, nunca
// en cero. Al cargar los datos reales de un libro, este módulo se sustituye.

const numero = (x) => (x === "" || x == null ? null : +x);
const estimacion = (r) => ({num: numero(r.num), den: numero(r.den), pct: numero(r.pct), ee: numero(r.ee), casos: numero(r.casos)});
const entidad = (r) => ({cve: String(r.cve_ent).padStart(2, "0"), entidad: r.entidad, region: r.region});

export const leerTic = (filas) => filas.map((r) => ({...entidad(r), anio: +r.anio, indicador: r.indicador, ...estimacion(r)}));
export const leerAsistenciaEdad = (filas) => filas.map((r) => ({anio: +r.anio, ambito: r.ambito, sexo: r.sexo, edad: r.edad, orden: +r.orden, ...estimacion(r)}));
export const leerParticipacion = (filas) => filas.map((r) => ({anio: +r.anio, ambito: r.ambito, escolaridad: r.escolaridad, orden: +r.orden, sexo: r.sexo, ...estimacion(r)}));
export const leerInternetIndigena = (filas) => filas.map((r) => ({...entidad(r), anio: +r.anio, grupo: r.grupo, orden: +r.orden, ...estimacion(r)}));
export const leerUsuarios = (filas) => filas.map((r) => ({anio: +r.anio, ambito: r.ambito, sexo: r.sexo, ...estimacion(r)}));
export const leerAsistenciaEntidad = (filas) => filas.map((r) => ({...entidad(r), anio: +r.anio, sexo: r.sexo, ...estimacion(r)}));
export const leerMunicipios = (filas) => filas.map((r) => ({...entidad(r), anio: +r.anio, edad: r.edad, pct: numero(r.pct), minimo: numero(r.minimo), maximo: numero(r.maximo), municipios: numero(r.municipios), num: numero(r.num), den: numero(r.den)}));
export const leerTrimestral = (filas) => filas.map((r) => ({anio: +r.anio, trimestre: +r.trimestre, etiqueta: r.etiqueta, edad: r.edad, sexo: r.sexo, ...estimacion(r)}));

// Texto del sexo para frases: «la población», «las mujeres», «los hombres».
export const quienesSexo = (sexo) => (sexo === "Mujeres" ? "las mujeres" : sexo === "Hombres" ? "los hombres" : "la población");
export const unidadSexo = (sexo) => (sexo === "Mujeres" ? "mujeres" : sexo === "Hombres" ? "hombres" : "personas");
export const textoSexo = (sexo) => (sexo === "Total" ? "Mujeres y hombres" : sexo);
