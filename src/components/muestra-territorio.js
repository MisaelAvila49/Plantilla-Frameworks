// src/components/muestra-territorio.js
// Lectura de los datos de muestra de las formas de territorio y flujo
// (flechas de cambio, semitonos, silueta de puntos y barra al mapa), que
// genera scripts/muestra_territorio.mjs en src/data/muestra/. Como en
// muestra.js, los CSV se leen SIN tipado automático para no perder los ceros
// de las claves ("01") y aquí se convierte cada columna numérica. Al cargar
// los datos reales de un libro, este módulo se sustituye por el suyo.
import {POR_CVE} from "./geografia.js";

const numero = (x) => (x === "" || x == null ? null : +x);
const clave = (x) => String(x).padStart(2, "0");

// Porcentaje por municipio ficticio, sexo y año. Una fila por municipio,
// año y sexo (Mujeres, Hombres); el total se arma sumando numeradores y
// denominadores, nunca promediando porcentajes.
export const leerCambioMunicipios = (filas) => filas.map((r) => {
  const cve = clave(r.cve_ent), e = POR_CVE.get(cve), n = +String(r.cve_mun).slice(-3);
  return {
    cve, entidad: e?.nombre ?? cve, region: e?.region ?? "", cveMun: String(r.cve_mun).padStart(5, "0"),
    nombre: `Municipio ${n} de ${e?.nombre ?? cve}`, nombreCorto: `Mun. ${n}, ${e?.corto ?? cve}`,
    lon: +r.lon, lat: +r.lat, anio: +r.anio, sexo: r.sexo, num: numero(r.num), den: numero(r.den), casos: numero(r.casos),
  };
});

// Celdas de 0.25 grados con las personas de cada grupo de edad.
export const GRUPOS_EDAD = [
  {id: "p5a17", texto: "5 a 17 años"},
  {id: "p18a59", texto: "18 a 59 años"},
  {id: "p60ymas", texto: "60 años y más"},
];
export const leerCeldas = (filas) => filas.map((r) => {
  const cve = clave(r.cve_ent);
  return {cve, entidad: POR_CVE.get(cve)?.nombre ?? cve, lon: +r.lon, lat: +r.lat, area: +r.area_km2, anio: +r.anio,
    p5a17: numero(r.p5a17), p18a59: numero(r.p18a59), p60ymas: numero(r.p60ymas)};
});

// Flujos entre entidades partidos por motivo y por sexo.
export const MOTIVOS_OD = ["Motivo A", "Motivo B", "Motivo C", "Otros motivos"];
export const leerODMotivo = (filas) => filas.map((r) => {
  const o = clave(r.cve_origen), d = clave(r.cve_destino);
  return {cveOrigen: o, origen: POR_CVE.get(o)?.nombre ?? o, cveDestino: d, destino: POR_CVE.get(d)?.nombre ?? d,
    motivo: r.motivo, sexo: r.sexo, personas: numero(r.personas), casos: numero(r.casos)};
});

// Población por situación entre dos años, por región, periodo y sexo.
export const SITUACIONES = ["No cumple en ninguno", "Cumple en los dos años", "Empezó a cumplir", "Dejó de cumplir"];
export const leerSituacion = (filas) => filas.map((r) => ({region: r.region, periodo: r.periodo, sexo: r.sexo, situacion: r.situacion, personas: numero(r.personas), casos: numero(r.casos)}));
