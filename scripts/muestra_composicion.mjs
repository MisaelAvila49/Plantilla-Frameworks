// scripts/muestra_composicion.mjs
// Genera los DATOS DE MUESTRA de las formas de trayectoria, mosaicos
// partidos, ternario y unidades en espejo (riel, mosaico de triángulos,
// mosaico de fracciones, ternario y unidades en espejo) en src/data/muestra/.
//
// Son valores SINTÉTICOS: no salen de ninguna fuente y no describen a ninguna
// población real. Toda figura que los usa lleva el rótulo «Datos de muestra».
// No toca los archivos de los otros generadores: escribe solo estos cuatro.
//   trayectorias.csv            un porcentaje por grupo en tres cortes (riel)
//   fracciones_entidades.csv    dos condiciones por entidad (mosaico de fracciones)
//   composicion_entidades.csv   reparto en tres motivos por entidad (ternario)
//   espejo_edades.csv           personas por grupo de edad a dos lados (espejo)
// Al empezar un libro se sustituyen por los datos reales y este script se
// retira.
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos.   Uso:  node scripts/muestra_composicion.mjs

import {writeFileSync, mkdirSync} from "node:fs";
import {ENTIDADES, REGIONES} from "../src/components/geografia.js";

const SEMILLA = 20261118;
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
const r3 = (v) => Math.round(v * 1000) / 1000;
// Un campo con coma («2,500 a 14,999») va entre comillas.
const campo = (x) => (/[",\n]/.test(String(x ?? "")) ? `"${String(x).replace(/"/g, '""')}"` : String(x ?? ""));
const csv = (nombre, columnas, filas) => {
  const texto = [columnas.join(","), ...filas.map((f) => columnas.map((c) => campo(f[c])).join(","))].join("\n") + "\n";
  writeFileSync(`${DIR}/${nombre}`, texto);
  console.log(`${nombre}: ${filas.length} filas`);
};
// Error estándar de un porcentaje con efecto de diseño de 2.2 (encuesta por
// conglomerados), en puntos.
const errorDe = (p, casos) => 100 * Math.sqrt((2.2 * (p / 100) * (1 - p / 100)) / Math.max(1, casos));

// ---- 1. trayectorias.csv: porcentaje que cumple la condición por grupo en
// tres cortes (2015, 2020 y 2025), por región; el total nacional es la suma de
// las regiones. Las trayectorias se fuerzan a ser variadas: unas suben y
// luego bajan (el gancho del riel), otras siguen en la misma dirección.
const CORTES = [2015, 2020, 2025];
const DIMENSIONES = {
  "Grupo de edad": ["5 a 14", "15 a 29", "30 a 44", "45 a 59", "60 a 74", "75 y más"],
  "Tamaño de localidad": ["Menos de 2,500 habitantes", "2,500 a 14,999", "15,000 a 99,999", "100,000 y más"],
  "Sexo": ["Mujeres", "Hombres"],
};
const POBLACION_REGION = {"Norte": 21_300_000, "Centro-Occidente": 24_800_000, "Centro": 33_600_000, "Sur-Sureste": 20_600_000};
const trayectorias = [];
const acumulado = new Map();
for (const [dimension, grupos] of Object.entries(DIMENSIONES)) {
  // Patrón común del grupo en todas las regiones, más ruido regional.
  const patron = grupos.map((_, k) => {
    const nivel = dimension === "Sexo" ? 31 + 5 * k + normal(0, 1.5)
      : 22 + 26 * (k / Math.max(1, grupos.length - 1)) * (dimension === "Tamaño de localidad" ? -1 : 1) + (dimension === "Tamaño de localidad" ? 26 : 0) + normal(0, 3);
    const d1 = normal(0, dimension === "Sexo" ? 2.6 : 6.5), vuelta = azar() < 0.6;
    const d2 = vuelta ? -d1 * entre(0.6, 2.1) : d1 * entre(0.2, 1.1) + normal(0, 1);
    return {nivel, d1, d2};
  });
  for (const region of REGIONES) {
    const sesgo = normal(0, 4);
    for (const [k, grupo] of grupos.entries()) {
      const pt = patron[k];
      const propio = [0, normal(0, 1.6), normal(0, 2.2)];
      const peso = dimension === "Sexo" ? 0.5 : 1 / grupos.length * entre(0.7, 1.3);
      for (const [i, corte] of CORTES.entries()) {
        const p = acotar(pt.nivel + sesgo + (i >= 1 ? pt.d1 : 0) + (i >= 2 ? pt.d2 : 0) + propio[i], 3, 92);
        const den = Math.round(POBLACION_REGION[region] * peso * (1 + 0.05 * i));
        const num = Math.round(den * p / 100);
        const casos = Math.round(entre(1400, 5200) * (dimension === "Sexo" ? 2 : 1));
        trayectorias.push({ambito: region, dimension, grupo, orden: k, corte, num, den, pct: r3(100 * num / den), ee: r3(errorDe(p, casos)), casos});
        const clave = `${dimension}|${grupo}|${corte}`;
        const a = acumulado.get(clave) ?? {dimension, grupo, orden: k, corte, num: 0, den: 0, casos: 0, var: 0};
        a.num += num; a.den += den; a.casos += casos; a.var += (den * errorDe(p, casos) / 100) ** 2;
        acumulado.set(clave, a);
      }
    }
  }
}
for (const a of acumulado.values()) {
  trayectorias.push({ambito: "Nacional", dimension: a.dimension, grupo: a.grupo, orden: a.orden, corte: a.corte, num: a.num, den: a.den,
    pct: r3(100 * a.num / a.den), ee: r3(100 * Math.sqrt(a.var) / a.den), casos: a.casos});
}
csv("trayectorias.csv", ["ambito", "dimension", "grupo", "orden", "corte", "num", "den", "pct", "ee", "casos"], trayectorias);

// ---- 2. fracciones_entidades.csv: dos condiciones por entidad y año. La
// frecuente va de unas 12 a unas 58 personas de cada cien; la poco frecuente
// queda bajo 1 de cada 100 en varias entidades, para que la figura cambie a
// «de cada 1,000».
const fracciones = [];
const poblacionEnt = new Map(ENTIDADES.map((e) => [e.cve, Math.round(entre(700, 16000)) * 1000]));
const CONDICIONES = [
  {nombre: "Condición frecuente", centro: () => acotar(normal(33, 11), 9, 62), cambio: () => normal(2.2, 3.4), casos: [600, 3200]},
  {nombre: "Condición poco frecuente", centro: () => acotar(Math.exp(normal(Math.log(1.1), 0.55)), 0.18, 4.2), cambio: () => normal(0.12, 0.25), casos: [20, 160]},
];
for (const c of CONDICIONES) {
  for (const e of ENTIDADES) {
    const p0 = c.centro(), dp = c.cambio();
    for (const [i, anio] of [2010, 2020].entries()) {
      const p = acotar(p0 + dp * i, c.nombre === "Condición frecuente" ? 6 : 0.12, 70);
      const den = Math.round(poblacionEnt.get(e.cve) * (1 + 0.11 * i));
      fracciones.push({cve_ent: e.cve, entidad: e.nombre, region: e.region, anio, condicion: c.nombre, num: Math.round(den * p / 100), den, casos: Math.round(entre(...c.casos))});
    }
  }
}
csv("fracciones_entidades.csv", ["cve_ent", "entidad", "region", "anio", "condicion", "num", "den", "casos"], fracciones);

// ---- 3. composicion_entidades.csv: personas de cada entidad repartidas en
// tres motivos (A, B y C) en tres cortes, por sexo. En el conjunto el
// motivo A gana terreno; algunas entidades van a contracorriente.
const MOTIVOS = ["Motivo A", "Motivo B", "Motivo C"];
const CENTRO_REGION = {"Norte": [0.42, 0.33, 0.25], "Centro-Occidente": [0.34, 0.44, 0.22], "Centro": [0.28, 0.36, 0.36], "Sur-Sureste": [0.24, 0.3, 0.46]};
const composicion = [];
for (const e of ENTIDADES) {
  const c = CENTRO_REGION[e.region];
  let w = c.map((x) => Math.max(0.04, x * Math.exp(normal(0, 0.28))));
  const contra = azar() < 0.2;
  // Deriva por corte en espacio logarítmico: hacia A, salvo a contracorriente.
  const deriva = contra ? [normal(-0.22, 0.08), normal(0.18, 0.1), normal(0.05, 0.1)] : [normal(0.2, 0.08), normal(-0.06, 0.1), normal(-0.12, 0.08)];
  const total0 = Math.round(entre(18, 420)) * 1000;
  for (const [i, corte] of CORTES.entries()) {
    if (i) w = w.map((x, k) => x * Math.exp(deriva[k] + normal(0, 0.05)));
    const s = w.reduce((a, b) => a + b, 0), partes = w.map((x) => x / s);
    const total = total0 * (1 + 0.12 * i);
    for (const sexo of ["Mujeres", "Hombres"]) {
      // Las mujeres se cargan un poco hacia el motivo B.
      const ajuste = partes.map((x, k) => x * (sexo === "Mujeres" ? [0.92, 1.15, 0.95][k] : [1.08, 0.86, 1.05][k]));
      const sa = ajuste.reduce((a, b) => a + b, 0);
      const pobSexo = total * (sexo === "Mujeres" ? 0.47 : 0.53);
      for (const [k, motivo] of MOTIVOS.entries()) {
        const personas = Math.round(pobSexo * ajuste[k] / sa);
        composicion.push({cve_ent: e.cve, entidad: e.nombre, region: e.region, corte, sexo, motivo, personas, casos: Math.max(6, Math.round(personas / entre(380, 900)))});
      }
    }
  }
}
csv("composicion_entidades.csv", ["cve_ent", "entidad", "region", "corte", "sexo", "motivo", "personas", "casos"], composicion);

// ---- 4. espejo_edades.csv: personas por grupo de edad a dos lados del eje,
// por región y año. Dos comparaciones: por sexo, y quienes empezaron a
// cumplir la condición frente a quienes dejaron de cumplirla. `rurales` es
// cuántas de esas personas viven en localidades de menos de 2,500
// habitantes (el subgrupo que se puede resaltar).
const EDADES = ["0 a 9", "10 a 19", "20 a 29", "30 a 39", "40 a 49", "50 a 59", "60 a 69", "70 y más"];
const FORMA_EDAD = [0.62, 0.94, 1.0, 0.86, 0.7, 0.52, 0.34, 0.2];
const espejo = [];
for (const region of REGIONES) {
  const escala = entre(0.7, 1.35) * POBLACION_REGION[region] / 24_000_000;
  const rural = entre(0.18, 0.42);
  for (const [j, anio] of [2010, 2020].entries()) {
    const comparaciones = [
      ["Sexo", [["Mujeres", 1.04, 0], ["Hombres", 0.97, 0]], 82_000],
      ["Situación", [["Empezó a cumplir", 1, 2.5], ["Dejó de cumplir", 0.8, -1.5]], 41_000],
    ];
    for (const [comparacion, lados, tam] of comparaciones) {
      for (const [lado, factor, corrimiento] of lados) {
        for (const [k, edad] of EDADES.entries()) {
          // El corrimiento mueve el pico de la forma hacia edades mayores o menores.
          const f = FORMA_EDAD[acotar(Math.round(k - corrimiento * 0.4), 0, 7)] * 0.6 + FORMA_EDAD[k] * 0.4;
          const personas = Math.round(tam * escala * factor * f * (1 + 0.08 * j) * (1 + normal(0, 0.06)));
          const parteRural = acotar(rural + (k >= 6 ? 0.08 : 0) + normal(0, 0.04), 0.05, 0.7);
          espejo.push({region, anio, comparacion, lado, edad, orden: k, personas, rurales: Math.round(personas * parteRural), casos: Math.max(12, Math.round(personas / entre(220, 520)))});
        }
      }
    }
  }
}
csv("espejo_edades.csv", ["region", "anio", "comparacion", "lado", "edad", "orden", "personas", "rurales", "casos"], espejo);

console.log(`Datos de muestra de trayectorias, fracciones, composición y espejo generados con la semilla ${SEMILLA}.`);
