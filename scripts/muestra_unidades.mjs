// scripts/muestra_unidades.mjs
// Genera los DATOS DE MUESTRA de la familia de unidades (multitud, fracción,
// histograma de unidades, pila y escalones) en src/data/muestra/.
//
// Son valores SINTÉTICOS: no salen de ninguna fuente y no describen a ninguna
// población real. Toda figura que los usa lleva el rótulo «Datos de muestra».
// No toca los archivos de generar_muestra.mjs: escribe solo los que empiezan
// con «unidades_». Al empezar un libro se sustituyen por los datos reales y
// este script se retira.
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos.   Uso:  node scripts/muestra_unidades.mjs

import {writeFileSync, mkdirSync} from "node:fs";
import {REGIONES} from "../src/components/geografia.js";

const SEMILLA = 20261117;
const DIR = "src/data/muestra";
mkdirSync(DIR, {recursive: true});

// Generador con semilla (mulberry32) y normal por Box-Muller.
let estado = SEMILLA >>> 0;
const azar = () => {
  estado = (estado + 0x6d2b79f5) >>> 0;
  let t = estado;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const normal = (media = 0, desv = 1) => media + desv * Math.sqrt(-2 * Math.log(1 - azar())) * Math.cos(2 * Math.PI * azar());
const entre = (a, b) => a + (b - a) * azar();
const acotar = (v, a, b) => Math.max(a, Math.min(b, v));
const csv = (nombre, columnas, filas) => {
  const texto = [columnas.join(","), ...filas.map((f) => columnas.map((c) => f[c] ?? "").join(","))].join("\n") + "\n";
  writeFileSync(`${DIR}/${nombre}`, texto);
  console.log(`${nombre}: ${filas.length} filas`);
};

const SEXOS = ["Mujeres", "Hombres"];

// ---- 1. unidades_situacion.csv: la población de cada región repartida en
// cuatro situaciones entre dos ediciones, para la multitud.
const SITUACIONES = ["Dejó de cumplir", "Empezó a cumplir", "Cumple en los dos años", "No cumple en ninguno"];
const PERIODOS = ["2000 a 2010", "2010 a 2020"];
const situacion = [];
for (const region of REGIONES) {
  const base = Math.round(entre(4200, 9800)) * 1000;
  for (const [i, periodo] of PERIODOS.entries()) {
    const total = Math.round(base * (1 + 0.09 * i));
    const partes = [entre(0.045, 0.1), entre(0.03, 0.07), entre(0.17, 0.31)];
    const personas = partes.map((p) => Math.round(total * p));
    personas.push(total - personas.reduce((a, b) => a + b, 0));
    for (const [k, nombre] of SITUACIONES.entries()) situacion.push({region, periodo, situacion: nombre, personas: personas[k]});
  }
}
csv("unidades_situacion.csv", ["region", "periodo", "situacion", "personas"], situacion);

// ---- 2. unidades_condicion.csv: tres condiciones de frecuencia muy distinta
// (una de cada tres, menos de una de cada cien y menos de una de cada mil),
// por sexo y por región, para la fracción «de cada cien».
const CONDICIONES = [
  {nombre: "Condición frecuente", rango: [22, 48], casos: [700, 2800]},
  {nombre: "Condición poco frecuente", rango: [0.22, 0.88], casos: [18, 130]},
  {nombre: "Condición rara", rango: [0.012, 0.046], casos: [4, 36]},
];
const condicion = [];
for (const c of CONDICIONES) for (const anio of [2010, 2020]) {
  const centro = entre(c.rango[0] * 1.2, c.rango[1] * 0.8);
  for (const [comparacion, grupos, poblacion] of [["Sexo", SEXOS, [51_400_000, 48_900_000]], ["Región", REGIONES, [21_300_000, 24_800_000, 33_600_000, 20_600_000]]]) {
    for (const [k, grupo] of grupos.entries()) {
      const p = acotar(centro * entre(0.72, 1.3), c.rango[0], c.rango[1]);
      const den = Math.round(poblacion[k] * (anio === 2020 ? 1.12 : 1));
      condicion.push({condicion: c.nombre, comparacion, grupo, anio, num: Math.round(den * p / 100), den, casos: Math.round(entre(...c.casos))});
    }
  }
}
csv("unidades_condicion.csv", ["condicion", "comparacion", "grupo", "anio", "num", "den", "casos"], condicion);

// ---- 3. unidades_edad.csv: personas que cumplen la condición por edad
// cumplida (0 a 99 años), sexo y año, para el histograma de unidades.
const edad = [];
for (const anio of [2010, 2020]) for (const sexo of SEXOS) {
  const centro = (anio === 2020 ? 33 : 27) + (sexo === "Mujeres" ? 2.5 : 0), ancho = anio === 2020 ? 15 : 13.5;
  const escala = (sexo === "Mujeres" ? 71_000 : 64_000) * (anio === 2020 ? 1.1 : 1);
  for (let e = 0; e < 100; e++) {
    const forma = Math.exp(-((e - centro) ** 2) / (2 * ancho ** 2)) + 0.24 * Math.exp(-((e - 63) ** 2) / (2 * 11 ** 2)) + 0.05;
    const cola = e > 84 ? Math.exp(-(e - 84) / 6) : 1;
    edad.push({anio, sexo, edad: e, personas: Math.max(0, Math.round(escala * forma * cola * (1 + normal(0, 0.035))))});
  }
}
csv("unidades_edad.csv", ["anio", "sexo", "edad", "personas"], edad);

// ---- 4. unidades_pila.csv: personas que cumplen la condición en cinco
// ediciones, por región y sexo, para la pila.
const pilas = [];
for (const region of REGIONES) {
  const inicio = Math.round(entre(310, 720)) * 1000, ritmo = normal(-0.04, 0.07);
  for (const [i, anio] of [2000, 2005, 2010, 2015, 2020].entries()) {
    const total = inicio * (1 + ritmo * i) * (1 + normal(0, 0.012));
    const parte = acotar(0.52 + normal(0, 0.015), 0.46, 0.58);
    for (const sexo of SEXOS) pilas.push({region, anio, sexo, personas: Math.round(total * (sexo === "Mujeres" ? parte : 1 - parte))});
  }
}
csv("unidades_pila.csv", ["region", "anio", "sexo", "personas"], pilas);

// ---- 5. unidades_escalones.csv: para seis grupos de edad, las unidades de
// cada región con su población y cuántas personas cumplen, para los escalones.
const GRUPOS = ["5 a 14", "15 a 29", "30 a 44", "45 a 59", "60 a 74", "75 y más"];
const PESO = [1.25, 1.45, 1.2, 0.95, 0.6, 0.28];
const escalones = [];
for (const region of REGIONES) {
  const sesgo = normal(0, 5);
  for (let u = 1; u <= 40; u++) {
    const propio = normal(0, 9), tamano = entre(400, 9000);
    for (const [k, grupo] of GRUPOS.entries()) {
      const p = acotar(13 + 9.5 * k + sesgo + propio + normal(0, 4.5), 0.8, 97);
      const den = Math.round(tamano * PESO[k] * entre(0.85, 1.15));
      escalones.push({region, grupo, orden: k, unidad: `${region.slice(0, 1)}${String(u).padStart(2, "0")}`, num: Math.round(den * p / 100), den});
    }
  }
}
csv("unidades_escalones.csv", ["region", "grupo", "orden", "unidad", "num", "den"], escalones);

console.log(`Datos de muestra de la familia de unidades generados con la semilla ${SEMILLA}.`);
