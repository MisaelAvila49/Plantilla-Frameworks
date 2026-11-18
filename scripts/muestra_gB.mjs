// scripts/muestra_gB.mjs
// Genera los DATOS DE MUESTRA de las formas de comparación, precisión y
// tablas (galerías /galeria/comparacion, /galeria/precision y
// /galeria/tablas) en src/data/muestra/, en archivos que empiezan con «gB_».
//
// Son valores SINTÉTICOS con forma de encuesta del INEGI (asistencia escolar,
// participación laboral, acceso a internet, trabajo adolescente): no salen de
// ninguna fuente y no describen a ninguna población real. Toda figura que los
// usa lleva el rótulo «Datos de muestra». El error estándar se simula con un
// efecto de diseño fijo de 2.2 sobre el error binomial, para que las
// entidades chicas y los subgrupos salgan con intervalos anchos como en una
// encuesta real. No toca ningún otro archivo de la carpeta.
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos.   Uso:  node scripts/muestra_gB.mjs

import {writeFileSync, mkdirSync} from "node:fs";
import {ENTIDADES} from "../src/components/geografia.js";

const SEMILLA = 20261118;
const DIR = "src/data/muestra";
mkdirSync(DIR, {recursive: true});

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
const r3 = (v) => (v == null ? "" : Math.round(v * 1000) / 1000);
const csv = (nombre, columnas, filas) => {
  const esc = (x) => (typeof x === "string" && /[",]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x);
  const texto = [columnas.join(","), ...filas.map((f) => columnas.map((c) => esc(f[c] ?? "")).join(","))].join("\n") + "\n";
  writeFileSync(`${DIR}/${nombre}`, texto);
  console.log(`${nombre}: ${filas.length} filas`);
};

// Estimación de encuesta: porcentaje, numerador y denominador expandidos,
// error estándar de diseño (efecto de diseño 2.2) y casos sin expandir.
const DEFF = 2.2;
function estimar(p, den, casos) {
  const q = acotar(p, 0.2, 99.6) / 100;
  const ee = 100 * Math.sqrt((q * (1 - q) / Math.max(casos, 2)) * DEFF);
  const pct = acotar(p + normal(0, ee * 0.35), 0.2, 99.6);
  return {pct: r3(pct), num: Math.round((den * pct) / 100), den: Math.round(den), ee: r3(ee), casos: Math.round(casos)};
}
// Suma de entidades para el nacional: suma numeradores y denominadores, y el
// error sale de la suma de casos (nunca se promedian tasas).
function nacional(filas) {
  const num = filas.reduce((s, r) => s + r.num, 0), den = filas.reduce((s, r) => s + r.den, 0), casos = filas.reduce((s, r) => s + r.casos, 0);
  const q = num / den;
  return {pct: r3(100 * q), num, den, ee: r3(100 * Math.sqrt((q * (1 - q) / casos) * DEFF)), casos};
}

// Población aproximada (millones) y un índice de desarrollo de cada entidad
// (0 a 1) que reparte los niveles. Son valores de juguete para la muestra.
const POB = {"01": 1.43, "02": 3.77, "03": 0.8, "04": 0.93, "05": 3.15, "06": 0.73, "07": 5.54, "08": 3.74, "09": 9.21, "10": 1.83, "11": 6.17, "12": 3.54, "13": 3.08, "14": 8.35, "15": 16.99, "16": 4.75,
  "17": 1.97, "18": 1.24, "19": 5.78, "20": 4.13, "21": 6.58, "22": 2.37, "23": 1.86, "24": 2.82, "25": 3.03, "26": 2.94, "27": 2.4, "28": 3.53, "29": 1.34, "30": 8.06, "31": 2.32, "32": 1.62};
const DES = {"01": 0.8, "02": 0.88, "03": 0.86, "04": 0.6, "05": 0.82, "06": 0.75, "07": 0.25, "08": 0.78, "09": 1, "10": 0.64, "11": 0.6, "12": 0.36, "13": 0.55, "14": 0.78, "15": 0.74, "16": 0.52,
  "17": 0.68, "18": 0.62, "19": 0.92, "20": 0.32, "21": 0.5, "22": 0.8, "23": 0.76, "24": 0.58, "25": 0.74, "26": 0.85, "27": 0.6, "28": 0.72, "29": 0.58, "30": 0.46, "31": 0.66, "32": 0.52};
const MUNICIPIOS = {"01": 11, "02": 7, "03": 5, "04": 13, "05": 38, "06": 10, "07": 124, "08": 67, "09": 16, "10": 39, "11": 46, "12": 85, "13": 84, "14": 125, "15": 125, "16": 113,
  "17": 36, "18": 20, "19": 51, "20": 570, "21": 217, "22": 18, "23": 11, "24": 58, "25": 20, "26": 72, "27": 17, "28": 43, "29": 60, "30": 212, "31": 106, "32": 58};
const fila0 = (e) => ({cve_ent: e.cve, entidad: e.nombre, region: e.region});
const NAC = {cve_ent: "00", entidad: "Nacional", region: "Nacional"};

// ---- 1. gB_tic_entidad.csv: hogares con cada bien o servicio TIC por
// entidad y año (forma de la ENDUTIH). Unidad: hogares.
{
  const ANIOS = [2016, 2018, 2020, 2022, 2024];
  const IND = {
    "Internet": {nivel: [47.0, 52.9, 60.6, 68.5, 73.6], abre: 38},
    "Computadora": {nivel: [45.6, 44.9, 44.2, 43.8, 43.3], abre: 42},
    "Teléfono celular": {nivel: [85.1, 88.3, 91.2, 93.5, 95.0], abre: 16},
    "Televisión de paga": {nivel: [44.2, 47.1, 46.3, 43.0, 41.2], abre: 26},
  };
  const filas = [];
  const sesgo = new Map(ENTIDADES.map((e) => [e.cve, normal(0, 2.2)]));
  for (const [indicador, {nivel, abre}] of Object.entries(IND)) {
    for (const [i, anio] of ANIOS.entries()) {
      const deAnio = [];
      for (const e of ENTIDADES) {
        const hogares = (POB[e.cve] * 1e6 / 3.6) * (1 + 0.012 * (anio - 2020));
        const casos = 1500 + 1600 * azar();
        const p = nivel[i] + abre * (DES[e.cve] - 0.64) + sesgo.get(e.cve) * (indicador === "Teléfono celular" ? 0.4 : 1);
        const r = {...fila0(e), anio, indicador, ...estimar(acotar(p, 6, 98.8), hogares, casos)};
        // Una celda que la muestra no permite publicar: se deja vacía, nunca en cero.
        if (e.cve === "04" && indicador === "Televisión de paga" && anio === 2016) Object.assign(r, {pct: "", num: "", ee: "", casos: 21});
        deAnio.push(r);
      }
      filas.push({...NAC, anio, indicador, ...nacional(deAnio.filter((r) => r.pct !== ""))}, ...deAnio);
    }
  }
  csv("gB_tic_entidad.csv", ["cve_ent", "entidad", "region", "anio", "indicador", "num", "den", "pct", "ee", "casos"], filas);
}

// ---- 2. gB_asistencia_edad.csv: asistencia escolar por grupo de edad,
// ámbito y sexo (forma de la ENIGH). Unidad: personas.
{
  const ANIOS = [2018, 2020, 2022, 2024];
  const EDADES = {"3 a 5": [64.8, 6.5], "6 a 11": [97.6, 13.3], "12 a 14": [93.1, 6.6], "15 a 17": [76.4, 6.5], "18 a 24": [33.9, 15.3]};
  const AMBITO = {Urbano: {pob: 0.78, dif: [2.0, 0.3, 1.5, 4.2, 4.6]}, Rural: {pob: 0.22, dif: [-6.4, -1.1, -5.3, -15.2, -14.8]}};
  const SEXO = {Mujeres: [0.2, 0.1, 0.6, 1.6, 0.6], Hombres: [-0.2, -0.1, -0.6, -1.6, -0.6]};
  const ANIO = {2018: [-1.2, -0.2, -0.6, -1.6, -1.2], 2020: [-8.1, -0.9, -2.4, -4.3, -3.1], 2022: [-2.4, -0.3, -0.8, -1.1, -0.6], 2024: [0, 0, 0, 0, 0]};
  const filas = [];
  for (const anio of ANIOS) {
    for (const [k, [edad, [nivel, pobM]]] of Object.entries(EDADES).entries()) {
      const celdas = [];
      for (const [ambito, a] of Object.entries(AMBITO)) {
        for (const [sexo, s] of Object.entries(SEXO)) {
          const den = pobM * 1e6 * a.pob * 0.5;
          const casos = (ambito === "Rural" ? 1700 : 4200) * (pobM / 8) * entre(0.85, 1.15);
          const r = {anio, ambito, sexo, edad, orden: k, ...estimar(nivel + a.dif[k] + s[k] + ANIO[anio][k], den, casos)};
          celdas.push(r); filas.push(r);
        }
        filas.push({anio, ambito, sexo: "Total", edad, orden: k, ...nacional(celdas.filter((r) => r.ambito === ambito))});
      }
      for (const sexo of Object.keys(SEXO)) filas.push({anio, ambito: "Total", sexo, edad, orden: k, ...nacional(celdas.filter((r) => r.sexo === sexo))});
      filas.push({anio, ambito: "Total", sexo: "Total", edad, orden: k, ...nacional(celdas)});
    }
  }
  csv("gB_asistencia_edad.csv", ["anio", "ambito", "sexo", "edad", "orden", "num", "den", "pct", "ee", "casos"], filas);
}

// ---- 3. gB_participacion.csv: participación laboral de 25 a 64 años por
// escolaridad, sexo y ámbito (forma de la ENOE). Unidad: personas.
{
  const ANIOS = [2016, 2018, 2020, 2022, 2024];
  const ESC = {"Primaria": [41.2, 87.4, 9.8], "Secundaria": [52.3, 91.2, 11.6], "Media superior": [59.1, 89.6, 9.1], "Superior": [72.4, 88.3, 9.6]};
  const AMBITO = {Urbano: [0.79, 2.4, 0.6], Rural: [0.21, -8.6, 1.2]};
  const filas = [];
  for (const [i, anio] of ANIOS.entries()) {
    for (const [k, [escolaridad, [m, h, pobM]]] of Object.entries(ESC).entries()) {
      const celdas = [];
      for (const [ambito, [pob, difM, difH]] of Object.entries(AMBITO)) {
        for (const [sexo, nivel, dif] of [["Mujeres", m, difM], ["Hombres", h, difH]]) {
          const tendencia = sexo === "Mujeres" ? (i - 4) * 1.1 : (i - 4) * 0.2;
          const caida = anio === 2020 ? (sexo === "Mujeres" ? -4.2 : -2.1) : 0;
          const den = pobM * 1e6 * pob * 0.5 * (1 + 0.015 * (anio - 2020));
          const casos = (ambito === "Rural" ? 1300 : 5200) * entre(0.85, 1.15) * (escolaridad === "Superior" && ambito === "Rural" ? 0.25 : 1);
          const r = {anio, ambito, escolaridad, orden: k, sexo, ...estimar(nivel + dif + tendencia + caida, den, casos)};
          celdas.push(r); filas.push(r);
        }
      }
      for (const sexo of ["Mujeres", "Hombres"]) filas.push({anio, ambito: "Total", escolaridad, orden: k, sexo, ...nacional(celdas.filter((r) => r.sexo === sexo))});
    }
  }
  csv("gB_participacion.csv", ["anio", "ambito", "escolaridad", "orden", "sexo", "num", "den", "pct", "ee", "casos"], filas);
}

// ---- 4. gB_internet_indigena.csv: hogares con internet según la condición
// indígena de la persona de referencia, en diez entidades. Unidad: hogares.
{
  const ANIOS = [2020, 2022, 2024];
  const LISTA = ["31", "23", "04", "13", "21", "30", "12", "20", "07", "24"];
  const GRUPOS = [["Habla lengua indígena", 0.16], ["Se considera indígena, no habla", 0.22], ["Resto de la población", 0.62]];
  const filas = [];
  for (const cve of LISTA) {
    const e = ENTIDADES.find((x) => x.cve === cve);
    const d = DES[cve], hab = cve === "20" || cve === "07" || cve === "31" ? 0.3 : cve === "04" ? 0.08 : 0.14;
    const base = [24 + 30 * (d - 0.25) + normal(0, 2), 44 + 26 * (d - 0.25) + normal(0, 2.4), 58 + 30 * (d - 0.25) + normal(0, 2)];
    for (const [i, anio] of ANIOS.entries()) {
      for (const [k, [grupo, parte]] of GRUPOS.entries()) {
        const pesoGrupo = k === 0 ? hab : k === 2 ? 1 - hab - parte * 0.4 : parte * 0.4;
        const hogares = (POB[cve] * 1e6 / 3.6) * pesoGrupo;
        const casos = 2600 * pesoGrupo * entre(0.8, 1.2);
        filas.push({...fila0(e), anio, grupo, orden: k, ...estimar(base[k] + i * (k === 0 ? 5.4 : k === 1 ? 4.6 : 3.8), hogares, casos)});
      }
    }
  }
  csv("gB_internet_indigena.csv", ["cve_ent", "entidad", "region", "anio", "grupo", "orden", "num", "den", "pct", "ee", "casos"], filas);
}

// ---- 5. gB_usuarios.csv: personas de 6 años y más que usan internet, por
// año, ámbito y sexo (forma de la ENDUTIH). Unidad: personas.
{
  const NIVEL = [57.4, 59.5, 63.9, 65.8, 70.1, 72.0, 75.6, 78.6, 81.2, 83.1];
  const filas = [];
  for (const [i, anio] of NIVEL.map((_, i) => [i, 2015 + i])) {
    const celdas = [];
    for (const [ambito, pob, dif] of [["Urbano", 0.78, 7.6 - i * 0.35], ["Rural", 0.22, -26.8 + i * 1.25]]) {
      for (const [sexo, ds] of [["Mujeres", -0.6], ["Hombres", 0.6]]) {
        const den = 106e6 * (1 + 0.009 * i) * pob * 0.5;
        const casos = (ambito === "Rural" ? 9000 : 32000) * entre(0.9, 1.1);
        const r = {anio, ambito, sexo, ...estimar(NIVEL[i] + dif + ds, den, casos)};
        celdas.push(r); filas.push(r);
      }
      filas.push({anio, ambito, sexo: "Total", ...nacional(celdas.filter((r) => r.ambito === ambito))});
    }
    for (const sexo of ["Mujeres", "Hombres"]) filas.push({anio, ambito: "Total", sexo, ...nacional(celdas.filter((r) => r.sexo === sexo))});
    filas.push({anio, ambito: "Total", sexo: "Total", ...nacional(celdas)});
  }
  csv("gB_usuarios.csv", ["anio", "ambito", "sexo", "num", "den", "pct", "ee", "casos"], filas);
}

// ---- 6. gB_asistencia_entidad.csv: asistencia escolar de 18 a 24 años por
// entidad, año y sexo, con el nacional (cve 00). Muestras chicas en las
// entidades chicas, para que la precisión varíe de verdad. Unidad: personas.
{
  const ANIOS = {2018: -1.1, 2020: -3.2, 2022: -0.6, 2024: 0};
  const sesgo = new Map(ENTIDADES.map((e) => [e.cve, normal(0, 3)]));
  const filas = [];
  for (const [anio, dA] of Object.entries(ANIOS)) {
    const todas = [];
    for (const e of ENTIDADES) {
      const casosTotal = (40 + 1300 * (POB[e.cve] / 17)) * entre(0.85, 1.15);
      const celdas = [];
      for (const [sexo, ds] of [["Mujeres", 0.9], ["Hombres", -0.9]]) {
        const den = POB[e.cve] * 1e6 * 0.122 * 0.5 * (1 + 0.004 * (anio - 2020));
        const r = {...fila0(e), anio: +anio, sexo, ...estimar(33.9 + 40 * (DES[e.cve] - 0.64) + sesgo.get(e.cve) + dA + ds, den, casosTotal / 2)};
        celdas.push(r); filas.push(r); todas.push(r);
      }
      filas.push({...fila0(e), anio: +anio, sexo: "Total", ...nacional(celdas)});
    }
    for (const sexo of ["Mujeres", "Hombres"]) filas.push({...NAC, anio: +anio, sexo, ...nacional(todas.filter((r) => r.sexo === sexo))});
    filas.push({...NAC, anio: +anio, sexo: "Total", ...nacional(todas)});
  }
  csv("gB_asistencia_entidad.csv", ["cve_ent", "entidad", "region", "anio", "sexo", "num", "den", "pct", "ee", "casos"], filas);
}

// ---- 7. gB_asistencia_municipios.csv: asistencia escolar por entidad con el
// municipio más bajo y el más alto (forma del Censo, sin error muestral).
{
  const EDAD = {"15 a 17": {2010: 67.0, 2020: 73.4, abre: 26, bajo: [18, 38], alto: [8, 22], tope: 98.5}, "18 a 24": {2010: 28.0, 2020: 32.0, abre: 22, bajo: [14, 26], alto: [12, 34], tope: 78}};
  const filas = [];
  for (const [edad, c] of Object.entries(EDAD)) {
    for (const anio of [2010, 2020]) {
      for (const e of ENTIDADES) {
        const pct = acotar(c[anio] + c.abre * (DES[e.cve] - 0.64) + normal(0, 2), 5, 97);
        const extension = 0.55 + 0.45 * Math.min(1, Math.log10(MUNICIPIOS[e.cve]) / 2.6);
        const minimo = acotar(pct - entre(...c.bajo) * extension, 1.5, pct - 2);
        const maximo = acotar(pct + entre(...c.alto) * extension, pct + 2, c.tope);
        const den = POB[e.cve] * 1e6 * (edad === "15 a 17" ? 0.054 : 0.122) * (anio === 2010 ? 0.9 : 1);
        filas.push({...fila0(e), anio, edad, pct: r3(pct), minimo: r3(minimo), maximo: r3(maximo), municipios: MUNICIPIOS[e.cve], num: Math.round((den * pct) / 100), den: Math.round(den)});
      }
    }
  }
  csv("gB_asistencia_municipios.csv", ["cve_ent", "entidad", "region", "anio", "edad", "pct", "minimo", "maximo", "municipios", "num", "den"], filas);
}

// ---- 8. gB_trabajo_trimestral.csv: población de 12 a 14 y de 15 a 17 años
// que trabaja, por trimestre y sexo (forma de la ENOE). El segundo trimestre
// de 2020 no se levantó: va vacío.
{
  const filas = [];
  const EDAD = {"15 a 17": {nivel: 18.6, pob: 6.5e6, casos: 5600}, "12 a 14": {nivel: 6.4, pob: 6.6e6, casos: 5900}};
  for (let i = 0; i < 26; i++) {
    const anio = 2019 + Math.floor(i / 4), t = i % 4 + 1;
    const etiqueta = `${anio} T${t}`;
    for (const [edad, c] of Object.entries(EDAD)) {
      const forma = anio === 2020 ? (t === 3 ? -4.6 : t === 4 ? -3.0 : t === 1 ? -0.4 : 0) : anio === 2021 ? -1.8 + (t - 1) * 0.35 : 0;
      const tendencia = -0.09 * i * (c.nivel / 18.6);
      const nivel = c.nivel + (forma + tendencia) * (c.nivel / 18.6) + (t === 3 ? 0.5 : 0) * (c.nivel / 18.6);
      const celdas = [];
      for (const [sexo, f] of [["Mujeres", 0.6], ["Hombres", 1.4]]) {
        if (anio === 2020 && t === 2) { filas.push({anio, trimestre: t, etiqueta, edad, sexo, casos: ""}); continue; }
        const r = {anio, trimestre: t, etiqueta, edad, sexo, ...estimar(nivel * f, c.pob * 0.5, c.casos * 0.5 * entre(0.9, 1.1))};
        celdas.push(r); filas.push(r);
      }
      filas.push(celdas.length ? {anio, trimestre: t, etiqueta, edad, sexo: "Total", ...nacional(celdas)} : {anio, trimestre: t, etiqueta, edad, sexo: "Total", casos: ""});
    }
  }
  csv("gB_trabajo_trimestral.csv", ["anio", "trimestre", "etiqueta", "edad", "sexo", "num", "den", "pct", "ee", "casos"], filas);
}
