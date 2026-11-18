// scripts/muestra_gE.mjs
// Genera los DATOS DE MUESTRA de la galería «Conceptos y diagramas»
// (src/galeria/conceptos.md): el árbol de la pregunta, el embudo de
// universos y el diagrama de Euler, en src/data/muestra/ con prefijo gE_.
//
// Son valores SINTÉTICOS: no salen de ninguna fuente y no describen a ninguna
// población real. Siguen la DEFINICIÓN de las fuentes revisadas (universo de
// 5 años y más, cambio de municipio, entidad o país en los cinco años
// previos, causa principal declarada por un adulto del hogar) solo para que
// los diagramas tengan con qué dibujarse. Toda figura que los usa lleva el
// rótulo «Datos de muestra». Al empezar un libro se sustituyen por los datos
// reales y este script se retira.
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos. No toca ningún otro archivo de src/data/muestra/.
//
//   Uso:  node scripts/muestra_gE.mjs
//
// Archivos que escribe:
//   gE_universos.csv  por fuente, edad y sexo: población, sin movilidad,
//                     migrantes y su causa (violencia, otra, no especificada)
//   gE_euler.csv      por fuente, edad, sexo y universo: cuántas personas
//                     hablan una lengua indígena, cuántas se consideran
//                     indígenas y cuántas cumplen las dos condiciones

import {writeFileSync, mkdirSync} from "node:fs";

const SEMILLA = 20261118;
const DIR = "src/data/muestra";
mkdirSync(DIR, {recursive: true});

// Generador con semilla (mulberry32).
let estado = SEMILLA >>> 0;
function azar() {
  estado = (estado + 0x6d2b79f5) >>> 0;
  let t = estado;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const cerca = (x, ruido = 0.06) => x * (1 + (azar() * 2 - 1) * ruido);
// Casos sin expandir: el factor de expansión ronda 20 en la muestra ampliada.
const casosDe = (n, factor = 20) => Math.max(0, Math.round(n / cerca(factor, 0.15)));

// Población de 5 años y más por fuente, edad y sexo (sintética).
const POBLACION = {
  "2020": {"5-17": {m: 14.3e6, h: 14.7e6}, "18+": {m: 45.6e6, h: 42.1e6}},
  "2025": {"5-17": {m: 13.8e6, h: 14.2e6}, "18+": {m: 48.9e6, h: 45.2e6}},
};
// Qué parte cambió de municipio, entidad o país, y qué parte de quienes
// cambiaron declaró cada causa. La de violencia baja en 2025 porque la
// lista de opciones pasó de 9 a 15 (no es una serie: ver la explicación).
const MIGRA = {"5-17": 0.046, "18+": 0.052};
const VIOLENCIA = {"2020": {"5-17": 0.071, "18+": 0.064}, "2025": {"5-17": 0.023, "18+": 0.02}};
const NO_ESPECIFICADO = 0.018;

const universos = [], euler = [];
for (const [fuente, porEdad] of Object.entries(POBLACION)) {
  for (const [edad, porSexo] of Object.entries(porEdad)) {
    for (const [sexo, n] of Object.entries(porSexo)) {
      const poblacion = Math.round(cerca(n, 0.01));
      const migrantes = Math.round(poblacion * cerca(MIGRA[edad] * (sexo === "m" ? 0.98 : 1.02), 0.04));
      const violencia = Math.round(migrantes * cerca(VIOLENCIA[fuente][edad], 0.08));
      const noEsp = Math.round(migrantes * cerca(NO_ESPECIFICADO, 0.1));
      const otra = migrantes - violencia - noEsp;
      universos.push({fuente, edad, sexo, poblacion, sin_movilidad: poblacion - migrantes, migrantes, violencia, otra_causa: otra, no_especificado: noEsp,
        casos_poblacion: casosDe(poblacion), casos_migrantes: casosDe(migrantes), casos_violencia: casosDe(violencia), casos_no_especificado: casosDe(noEsp)});
      // Dos definiciones de población indígena en tres universos anidados.
      // Entre quienes se movieron por violencia ambas son más frecuentes.
      for (const [universo, total, kHli, kAuto] of [
        ["poblacion", poblacion, 0.061, 0.193], ["migrantes", migrantes, 0.052, 0.176], ["violencia", violencia, 0.094, 0.262],
      ]) {
        const hli = Math.round(total * cerca(kHli, 0.08));
        const auto = Math.round(total * cerca(kAuto, 0.05));
        // Casi todas las personas que hablan una lengua indígena también se
        // consideran indígenas, pero no todas.
        const ambos = Math.round(hli * cerca(0.83, 0.05));
        euler.push({fuente, edad, sexo, universo, total, hli, auto, ambos, casos_hli: casosDe(hli), casos_auto: casosDe(auto), casos_ambos: casosDe(ambos)});
      }
    }
  }
}

function escribir(nombre, filas) {
  const columnas = Object.keys(filas[0]);
  const texto = [columnas.join(","), ...filas.map((f) => columnas.map((c) => f[c]).join(","))].join("\n") + "\n";
  writeFileSync(`${DIR}/${nombre}`, texto);
  console.log(`${DIR}/${nombre}: ${filas.length} filas`);
}
escribir("gE_universos.csv", universos);
escribir("gE_euler.csv", euler);
