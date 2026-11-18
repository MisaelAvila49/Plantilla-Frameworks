// scripts/generar_muestra.mjs
// Genera los DATOS DE MUESTRA de la Plantilla en src/data/muestra/.
//
// Son valores SINTÉTICOS: no salen de ninguna fuente y no describen a
// ninguna población real. Usan los nombres de las 32 entidades solo para
// que mapas, mosaicos y filtros tengan con qué dibujarse. Toda figura que
// los usa lleva el rótulo «Datos de muestra». Al empezar un libro se
// sustituyen por los datos reales y este script se retira.
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos.   Uso:  npm run muestra

import {writeFileSync, mkdirSync} from "node:fs";
import {ENTIDADES} from "../src/components/geografia.js";

const SEMILLA = 20261116;
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

const ANIOS = [2000, 2005, 2010, 2015, 2020];
const SEXOS = ["Mujeres", "Hombres"];
// Huecos a propósito, para probar «solo opciones con dato» y «Sin dato»:
// la edición 2005 no tiene dato en cuatro entidades y 2015 en una.
const SIN_2005 = new Set(["03", "06", "23", "29"]);
const SIN_2015 = new Set(["04"]);
const hayDato = (cve, anio) => !(anio === 2005 && SIN_2005.has(cve)) && !(anio === 2015 && SIN_2015.has(cve));

// ---- 1. indicador.csv: un porcentaje por entidad, año y sexo, con su
// numerador, denominador, error estándar y casos de la muestra.
const nivel = new Map(), tendencia = new Map(), poblacion = new Map();
for (const e of ENTIDADES) {
  nivel.set(e.cve, acotar(normal(34, 15), 4, 78));
  tendencia.set(e.cve, normal(-0.9, 2.6));
  poblacion.set(e.cve, Math.round(entre(180, 4200)) * 1000);
}
const indicador = [];
for (const e of ENTIDADES) for (const [i, anio] of ANIOS.entries()) {
  if (!hayDato(e.cve, anio)) continue;
  const base = nivel.get(e.cve) + tendencia.get(e.cve) * i + normal(0, 0.8);
  const pob = poblacion.get(e.cve) * (1 + 0.07 * i);
  let numTotal = 0, denTotal = 0, casosTotal = 0;
  const filas = SEXOS.map((sexo) => {
    const p = acotar(base + (sexo === "Mujeres" ? 2.4 : -2.4) + normal(0, 1.1), 0.6, 96);
    const den = Math.round(pob * (sexo === "Mujeres" ? 0.513 : 0.487));
    const num = Math.round(den * p / 100);
    const casos = Math.round(entre(18, 900));
    const ee = Math.sqrt(2.2 * (p * (100 - p)) / casos);
    numTotal += num; denTotal += den; casosTotal += casos;
    return {cve_ent: e.cve, entidad: e.nombre, region: e.region, anio, sexo, num, den, pct: (100 * num / den).toFixed(3), ee: ee.toFixed(3), casos};
  });
  const pTotal = 100 * numTotal / denTotal;
  indicador.push(...filas, {cve_ent: e.cve, entidad: e.nombre, region: e.region, anio, sexo: "Total", num: numTotal, den: denTotal, pct: pTotal.toFixed(3), ee: Math.sqrt(2.2 * (pTotal * (100 - pTotal)) / casosTotal).toFixed(3), casos: casosTotal});
}
csv("indicador.csv", ["cve_ent", "entidad", "region", "anio", "sexo", "num", "den", "pct", "ee", "casos"], indicador);

// ---- 2. unidades.csv: unidades dentro de cada entidad (municipios
// ficticios, numerados), en tres ediciones, para franjas y crestas.
const unidades = [];
for (const e of ENTIDADES) {
  const n = Math.round(entre(9, 26));
  for (let k = 1; k <= n; k++) {
    const propio = acotar(nivel.get(e.cve) + normal(0, 13), 0.5, 97);
    const ritmo = tendencia.get(e.cve) * 2 + normal(0, 3.2);
    const den0 = Math.round(entre(600, 48000));
    for (const [i, anio] of [2000, 2010, 2020].entries()) {
      const p = acotar(propio + ritmo * i + normal(0, 1), 0.2, 98.5);
      const den = Math.round(den0 * (1 + 0.11 * i));
      unidades.push({cve_ent: e.cve, entidad: e.nombre, unidad: `${e.cve}${String(k).padStart(3, "0")}`, nombre: `Unidad ${k} de ${e.nombre}`, anio, num: Math.round(den * p / 100), den, pct: p.toFixed(3)});
    }
  }
}
csv("unidades.csv", ["cve_ent", "entidad", "unidad", "nombre", "anio", "num", "den", "pct"], unidades);

// ---- 3. edades.csv: personas que cumplen y población por grupo de edad,
// sexo y año, para la pirámide y el cruce de edad por año.
const EDADES = ["0 a 4", "5 a 9", "10 a 14", "15 a 19", "20 a 24", "25 a 29", "30 a 34", "35 a 39", "40 a 44", "45 a 49", "50 a 54", "55 a 59", "60 a 64", "65 a 69", "70 a 74", "75 y más"];
const edades = [];
for (const [i, anio] of ANIOS.entries()) for (const sexo of SEXOS) for (const [k, edad] of EDADES.entries()) {
  // La base se angosta con los años: menos peso en las edades jóvenes.
  const forma = Math.exp(-((k - (1.5 + 1.1 * i)) ** 2) / (2 * (5.2 + 0.5 * i) ** 2));
  const den = Math.round(1_150_000 * (0.35 + forma) * (sexo === "Mujeres" && k > 11 ? 1.12 : 1) * (1 + normal(0, 0.012)));
  const p = acotar(18 + 1.9 * k - 1.4 * i + (sexo === "Mujeres" ? 1.5 : 0) + normal(0, 0.7), 2, 80);
  edades.push({anio, sexo, edad, orden: k, num: Math.round(den * p / 100), den, pct: p.toFixed(3)});
}
csv("edades.csv", ["anio", "sexo", "edad", "orden", "num", "den", "pct"], edades);

// ---- 4. composicion.csv: un total partido en cuatro categorías, por año
// y región, para las barras apiladas y los cuadros de cada 100.
const CATEGORIAS = ["Categoría A", "Categoría B", "Categoría C", "Otras"];
const REGIONES = [...new Set(ENTIDADES.map((e) => e.region)), "Nacional"];
const composicion = [];
for (const region of REGIONES) {
  const pesos0 = CATEGORIAS.map((_, k) => entre(0.6, 1.6) * [4, 3, 2, 1][k]);
  const deriva = CATEGORIAS.map(() => normal(0, 0.12));
  const total0 = Math.round(entre(400, 2600)) * 1000;
  for (const [i, anio] of ANIOS.entries()) {
    const pesos = pesos0.map((w, k) => Math.max(0.15, w * (1 + deriva[k] * i)));
    const suma = pesos.reduce((a, b) => a + b, 0), total = Math.round(total0 * (1 + 0.06 * i));
    for (const [k, categoria] of CATEGORIAS.entries()) composicion.push({region, anio, categoria, personas: Math.round(total * pesos[k] / suma)});
  }
}
csv("composicion.csv", ["region", "anio", "categoria", "personas"], composicion);

// ---- 5. flujos.csv: personas que pasan de un nivel a otro entre tres
// cortes, para el diagrama de flujo.
const NIVELES = ["Nivel alto", "Nivel medio", "Nivel bajo"];
const CORTES = [2000, 2010, 2020];
const flujos = [];
let existencias = [310_000, 520_000, 270_000];
for (let etapa = 0; etapa < CORTES.length - 1; etapa++) {
  const llegan = [0, 0, 0];
  for (const [a, origen] of NIVELES.entries()) {
    const quedarse = entre(0.55, 0.72);
    const resto = 1 - quedarse, sesgo = entre(0.35, 0.65);
    const partes = NIVELES.map((_, b) => (b === a ? quedarse : Math.abs(b - a) === 1 ? resto * (a === 1 ? (b < a ? sesgo : 1 - sesgo) : 0.78) : resto * 0.22));
    for (const [b, destino] of NIVELES.entries()) {
      const personas = Math.round(existencias[a] * partes[b]);
      llegan[b] += personas;
      flujos.push({etapa, desde: CORTES[etapa], hasta: CORTES[etapa + 1], origen, destino, personas});
    }
  }
  existencias = llegan;
}
csv("flujos.csv", ["etapa", "desde", "hasta", "origen", "destino", "personas"], flujos);

console.log(`Datos de muestra generados con la semilla ${SEMILLA}.`);
