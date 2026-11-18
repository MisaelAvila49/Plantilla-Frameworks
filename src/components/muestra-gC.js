// src/components/muestra-gC.js
// Lectura de los datos de muestra de las formas de distribución y correlación
// (src/data/muestra/gC_*.csv, que genera scripts/muestra_gC.mjs). Como en
// muestra.js, los CSV se leen SIN tipado automático para no perder los ceros
// de las claves ("01") y aquí se convierte cada columna numérica. Al cargar
// los datos reales de un libro, este módulo se sustituye por el suyo.

const numero = (x) => (x === "" || x == null ? null : +x);
const clave = (x, n = 2) => String(x).padStart(n, "0");

// Microdatos de personas ocupadas: una fila por persona de la muestra, con su
// factor de expansión. El ingreso viene en pesos de 2024.
export const leerOcupados = (filas) => filas.map((r) => ({anio: +r.anio, sexo: r.sexo, edad: +r.edad, sector: r.sector, horas: +r.horas, ingreso: +r.ingreso, factor: +r.factor}));
export const SECTORES = ["Agropecuario", "Industria", "Construcción", "Comercio", "Servicios"];

// Horas de cuidados de quienes cuidan: una fila por persona de la muestra.
export const leerCuidados = (filas) => filas.map((r) => ({anio: +r.anio, sexo: r.sexo, edad: r.edad, horas: +r.horas, factor: +r.factor}));
export const EDADES_CUIDADO = ["15 a 29", "30 a 44", "45 a 64", "65 y más"];

// Escolaridad promedio por municipio, con su error estándar y los casos.
export const leerEscolaridadMunicipios = (filas) => filas.map((r) => ({
  cve: clave(r.cve_ent), entidad: r.entidad, region: r.region, cveMun: clave(r.cve_mun, 5), nombre: r.nombre, anio: +r.anio,
  escolaridad: numero(r.escolaridad), pob15: numero(r.pob15), ee: numero(r.ee), casos: numero(r.casos),
}));

// Porcentaje con menos de x años de escuela, por grupo.
export const leerAcumulada = (filas) => filas.map((r) => ({anio: +r.anio, comparacion: r.comparacion, grupo: r.grupo, x: +r.x, pct: numero(r.pct), num: numero(r.num), den: numero(r.den), ee: numero(r.ee), casos: numero(r.casos)}));
// Las dos poblaciones de cada comparación, en orden fijo: la primera va en el
// tono de tema y la segunda en el gris de comparación.
export const COMPARACIONES = {
  lengua: {texto: "Lengua indígena", grupos: ["Habla lengua indígena", "No habla lengua indígena"]},
  sexo: {texto: "Mujeres y hombres", grupos: ["Mujeres", "Hombres"]},
  localidad: {texto: "Localidad rural y urbana", grupos: ["Localidades rurales", "Localidades urbanas"]},
};

// Internet, escolaridad e ingreso por entidad y edición.
export const leerEntidades = (filas) => filas.map((r) => ({
  cve: clave(r.cve_ent), entidad: r.entidad, region: r.region, anio: +r.anio,
  internet: numero(r.internet), hogaresInternet: numero(r.hogares_internet), hogares: numero(r.hogares), internetEe: numero(r.internet_ee), casos: numero(r.casos),
  escolaridad: numero(r.escolaridad), escolaridadEe: numero(r.escolaridad_ee), ingreso: numero(r.ingreso), ingresoEe: numero(r.ingreso_ee),
}));

// Escolaridad e ingreso de las personas ocupadas, edición por edición.
export const leerTrayectorias = (filas) => filas.map((r) => ({lugar: r.lugar, sexo: r.sexo, anio: +r.anio, escolaridad: numero(r.escolaridad), ingreso: numero(r.ingreso), ingresoEe: numero(r.ingreso_ee), ocupados: numero(r.ocupados), casos: numero(r.casos)}));

// Cuantil PONDERADO por el factor de expansión: la persona en la posición p
// de la población, no de la muestra. `filas` ya ordenadas por valor.
export function cuantilPonderado(filas, p, valor, peso) {
  const total = filas.reduce((s, d) => s + peso(d), 0);
  let acum = 0;
  for (const d of filas) { acum += peso(d); if (acum >= p * total) return valor(d); }
  return filas.length ? valor(filas[filas.length - 1]) : null;
}
