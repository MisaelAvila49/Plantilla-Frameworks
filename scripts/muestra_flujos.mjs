// scripts/muestra_flujos.mjs
// Genera los DATOS DE MUESTRA de las formas de flujo, enjambre, picos, líneas
// destacadas y áreas superpuestas, en src/data/muestra/.
//
// Son valores SINTÉTICOS: no salen de ninguna fuente y no describen a ninguna
// población real. Usan los nombres y el contorno de las 32 entidades solo
// para que los mapas y los filtros tengan con qué dibujarse. Toda figura que
// los usa lleva el rótulo «Datos de muestra». Al empezar un libro se
// sustituyen por los datos reales y este script se retira.
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos. No toca los archivos de scripts/generar_muestra.mjs.
//
//   Uso:  node scripts/muestra_flujos.mjs
//
// Archivos que escribe:
//   od_entidades.csv      matriz origen-destino entre las 32 entidades
//   motivos_cortes.csv    reparto por motivo en tres cortes independientes
//   municipios.csv        indicador y posición de unos 300 municipios ficticios
//   series_entidades.csv  salidas y llegadas anuales por entidad

import {writeFileSync, readFileSync, mkdirSync} from "node:fs";
import {ENTIDADES, ISO_A_CVE} from "../src/components/geografia.js";

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

// ---- Contorno de cada entidad: anillo exterior mayor, centro y caja. Sirve
// para la distancia entre entidades y para sembrar municipios dentro.
const geo = JSON.parse(readFileSync(`${DIR}/entidades.geojson`, "utf8"));
const area = (anillo) => { let a = 0; for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) a += anillo[j][0] * anillo[i][1] - anillo[i][0] * anillo[j][1]; return a / 2; };
const contorno = new Map();
for (const f of geo.features) {
  const polis = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const anillo = polis.map((p) => p[0]).sort((p, q) => Math.abs(area(q)) - Math.abs(area(p)))[0];
  const a = area(anillo);
  let cx = 0, cy = 0;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const k = anillo[j][0] * anillo[i][1] - anillo[i][0] * anillo[j][1];
    cx += (anillo[j][0] + anillo[i][0]) * k; cy += (anillo[j][1] + anillo[i][1]) * k;
  }
  const xs = anillo.map((p) => p[0]), ys = anillo.map((p) => p[1]);
  contorno.set(ISO_A_CVE.get(f.properties.id), {anillo, centro: [cx / (6 * a), cy / (6 * a)], caja: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], superficie: Math.abs(a)});
}
if (contorno.size !== 32) throw new Error(`El geojson trae ${contorno.size} entidades reconocidas, no 32.`);
const dentro = ([x, y], anillo) => {
  let d = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i], [xj, yj] = anillo[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
};
const distancia = (a, b) => Math.hypot((a[0] - b[0]) * 0.92, a[1] - b[1]);

// ---- Rasgos inventados de cada entidad: tamaño, empuje a salir y atractivo.
const rasgo = new Map();
for (const e of ENTIDADES) {
  rasgo.set(e.cve, {
    poblacion: Math.round(Math.exp(entre(Math.log(0.7), Math.log(9))) * 1e6),
    empuje: Math.exp(normal(0, 0.4)),
    atractivo: Math.exp(normal(0, 0.45)),
    nivel: acotar(normal(17, 8), 3, 44),
  });
}

// ---- 1. od_entidades.csv: personas que cambiaron de entidad de residencia,
// de cada origen a cada destino, con los casos sin expandir de la muestra.
// Unas cuantas entidades reciben o envían más que las demás, y la distancia
// pesa poco: así el mapa de flechas tiene flujos largos que mostrar y no solo
// intercambios entre vecinas. Los factores son fijos (no gastan azar), de modo
// que los demás archivos salen idénticos con la misma semilla.
const IMAN = {"02": 2.6, "19": 2.4, "23": 2.2, "22": 1.8, "15": 1.8, "14": 1.4, "03": 1.5};
const EXPULSA = {"09": 2.6, "30": 2.1, "12": 1.8, "07": 1.8, "20": 1.6};
const crudo = [];
for (const o of ENTIDADES) for (const d of ENTIDADES) {
  if (o.cve === d.cve) continue;
  const ro = rasgo.get(o.cve), rd = rasgo.get(d.cve);
  const lejos = Math.max(0.6, distancia(contorno.get(o.cve).centro, contorno.get(d.cve).centro));
  const imanes = (IMAN[d.cve] ?? 1) ** 2 * (EXPULSA[o.cve] ?? 1) ** 1.5;
  crudo.push({o, d, peso: imanes * ro.poblacion ** 0.7 * ro.empuje * (rd.poblacion ** 0.5 * rd.atractivo) / lejos ** 0.75 * Math.exp(normal(0, 0.45))});
}
const sumaPesos = crudo.reduce((s, r) => s + r.peso, 0);
const TOTAL_OD = 3_200_000;
const od = crudo.map(({o, d, peso}) => {
  const personas = Math.max(40, Math.round(TOTAL_OD * peso / sumaPesos));
  // Cada caso de la muestra representa entre 110 y 170 personas.
  const casos = Math.max(1, Math.round(personas / entre(110, 170)));
  return {cve_origen: o.cve, origen: o.nombre, cve_destino: d.cve, destino: d.nombre, personas, casos};
});
csv("od_entidades.csv", ["cve_origen", "origen", "cve_destino", "destino", "personas", "casos"], od);

// ---- 2. motivos_cortes.csv: total partido en cuatro motivos, en tres cortes
// que son levantamientos independientes (no siguen a las mismas personas).
const MOTIVOS = ["Motivo A", "Motivo B", "Motivo C", "Otros motivos"];
const CORTES = [2015, 2020, 2025];
const AMBITOS = ["Nacional", ...new Set(ENTIDADES.map((e) => e.region))];
const motivos = [];
for (const ambito of AMBITOS) {
  const pesos0 = MOTIVOS.map((_, k) => entre(0.7, 1.5) * [4.2, 3, 1.6, 1.3][k]);
  const deriva = MOTIVOS.map((_, k) => normal(k === 2 ? 0.34 : 0, 0.16));
  const total0 = Math.round(entre(ambito === "Nacional" ? 1500 : 220, ambito === "Nacional" ? 1900 : 620)) * 1000;
  for (const [i, corte] of CORTES.entries()) {
    const pesos = pesos0.map((w, k) => Math.max(0.2, w * (1 + deriva[k] * i)));
    const suma = pesos.reduce((a, b) => a + b, 0), total = Math.round(total0 * (1 + 0.09 * i + normal(0, 0.02)));
    for (const [k, motivo] of MOTIVOS.entries()) {
      const personas = Math.round(total * pesos[k] / suma);
      motivos.push({ambito, corte, motivo, personas, casos: Math.max(1, Math.round(personas / entre(190, 240)))});
    }
  }
}
csv("motivos_cortes.csv", ["ambito", "corte", "motivo", "personas", "casos"], motivos);

// ---- 3. municipios.csv: unos 300 municipios ficticios, numerados, con un
// punto dentro de su entidad, su población y cuántas personas cumplen la
// condición en dos años.
const municipios = [];
const raizSuperficie = [...contorno.values()].reduce((s, c) => s + Math.sqrt(c.superficie), 0);
for (const e of ENTIDADES) {
  const c = contorno.get(e.cve), r = rasgo.get(e.cve);
  const n = Math.round(acotar(300 * Math.sqrt(c.superficie) / raizSuperficie + entre(-1, 2), 4, 18));
  for (let k = 1; k <= n; k++) {
    let p = null;
    for (let intento = 0; intento < 400 && !p; intento++) {
      const q = [entre(c.caja[0], c.caja[2]), entre(c.caja[1], c.caja[3])];
      if (dentro(q, c.anillo)) p = q;
    }
    p ??= c.centro;
    // Pocos municipios grandes y muchos chicos.
    const den0 = Math.min(620000, Math.round(Math.exp(normal(Math.log(26000), 1.05))));
    const propio = acotar(r.nivel * Math.exp(normal(0, 0.5)), 0.4, 68);
    const ritmo = normal(0.8, 2.6);
    for (const [i, anio] of [2020, 2025].entries()) {
      const pct = acotar(propio + ritmo * i + normal(0, 0.4), 0.2, 72);
      const den = Math.max(600, Math.round(den0 * (1 + 0.05 * i)));
      const num = Math.round(den * pct / 100);
      municipios.push({cve_ent: e.cve, entidad: e.nombre, region: e.region, cve_mun: `${e.cve}${String(k).padStart(3, "0")}`, nombre: `Municipio ${k} de ${e.nombre}`,
        lon: p[0].toFixed(4), lat: p[1].toFixed(4), anio, num, den, pct: (100 * num / den).toFixed(3), casos: Math.max(1, Math.round(num / entre(60, 140)))});
    }
  }
}
csv("municipios.csv", ["cve_ent", "entidad", "region", "cve_mun", "nombre", "lon", "lat", "anio", "num", "den", "pct", "casos"], municipios);

// ---- 4. series_entidades.csv: personas que salen de cada entidad y personas
// que llegan a ella, por año, con su población.
const ANIOS = Array.from({length: 16}, (_, i) => 2010 + i);
const series = [];
for (const e of ENTIDADES) {
  const r = rasgo.get(e.cve);
  let salida = acotar(0.011 * r.empuje, 0.004, 0.03), llegada = acotar(0.011 * r.atractivo, 0.004, 0.03);
  const rumboSalida = normal(0, 0.035), rumboLlegada = normal(0, 0.035);
  // Un año de salto por entidad, para que las series tengan algo que anotar.
  const salto = 2013 + Math.floor(azar() * 10), fuerza = entre(1.25, 1.9), cual = azar() < 0.6 ? "salen" : "llegan";
  for (const [i, anio] of ANIOS.entries()) {
    salida *= Math.exp(rumboSalida + normal(0, 0.05));
    llegada *= Math.exp(rumboLlegada + normal(0, 0.05));
    const poblacion = Math.round(r.poblacion * (1 + 0.011 * i));
    const empujon = (lado) => (cual === lado && anio >= salto ? 1 + (fuerza - 1) * Math.exp(-(anio - salto) / 3.5) : 1);
    const salen = Math.round(poblacion * acotar(salida * empujon("salen"), 0.002, 0.05));
    const llegan = Math.round(poblacion * acotar(llegada * empujon("llegan"), 0.002, 0.05));
    series.push({cve_ent: e.cve, entidad: e.nombre, region: e.region, anio, poblacion, salen, llegan, casos: Math.max(1, Math.round((salen + llegan) / entre(170, 260)))});
  }
}
csv("series_entidades.csv", ["cve_ent", "entidad", "region", "anio", "poblacion", "salen", "llegan", "casos"], series);

console.log(`Datos de muestra de flujos generados con la semilla ${SEMILLA}.`);
