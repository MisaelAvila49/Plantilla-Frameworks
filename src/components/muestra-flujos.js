// src/components/muestra-flujos.js
// Lectura de los datos de muestra de las formas de flujo, enjambre, picos,
// líneas destacadas y áreas superpuestas (src/data/muestra/, que genera
// scripts/muestra_flujos.mjs). Como en muestra.js, los CSV se leen SIN tipado
// automático para no perder los ceros de las claves ("01") y aquí se
// convierte cada columna numérica. Al cargar los datos reales de un libro,
// este módulo se sustituye por el suyo.
import {POR_CVE} from "./geografia.js";

const numero = (x) => (x === "" || x == null ? null : +x);
const clave = (x) => String(x).padStart(2, "0");

// Matriz origen-destino entre entidades: personas que cambiaron de entidad
// de residencia y casos sin expandir de la muestra.
export const leerOD = (filas) => filas.map((r) => ({
  cveOrigen: clave(r.cve_origen), origen: r.origen, cveDestino: clave(r.cve_destino), destino: r.destino, personas: numero(r.personas), casos: numero(r.casos),
}));

// Reparto por motivo en cortes independientes, por ámbito (país o región).
export const leerMotivos = (filas) => filas.map((r) => ({ambito: r.ambito, corte: +r.corte, motivo: r.motivo, personas: numero(r.personas), casos: numero(r.casos)}));

// Municipios ficticios: posición, población y personas que cumplen.
export const leerMunicipios = (filas) => filas.map((r) => {
  const cve = clave(r.cve_ent), n = +String(r.cve_mun).slice(-3);
  return {
    cve, entidad: r.entidad, region: r.region, cveMun: String(r.cve_mun).padStart(5, "0"), nombre: r.nombre, nombreCorto: `Mun. ${n}, ${POR_CVE.get(cve)?.corto ?? r.entidad}`,
    lon: +r.lon, lat: +r.lat, anio: +r.anio, num: numero(r.num), den: numero(r.den), pct: numero(r.pct), casos: numero(r.casos),
  };
});

// Salidas y llegadas anuales por entidad. `saldo`: llegadas menos salidas,
// como porcentaje de la población. `tasaSalen` y `tasaLlegan`: por cada mil.
export const leerSeries = (filas) => filas.map((r) => {
  const poblacion = numero(r.poblacion), salen = numero(r.salen), llegan = numero(r.llegan);
  return {
    cve: clave(r.cve_ent), entidad: r.entidad, region: r.region, anio: +r.anio, poblacion, salen, llegan, casos: numero(r.casos),
    saldo: 100 * (llegan - salen) / poblacion, tasaSalen: 1000 * salen / poblacion, tasaLlegan: 1000 * llegan / poblacion,
  };
});

// Periodo al que se refiere la matriz origen-destino de muestra.
export const PERIODO_OD = "2015 a 2020";
// Casos sin expandir por debajo de los cuales una cifra es poco precisa.
export const MIN_CASOS = 30;
