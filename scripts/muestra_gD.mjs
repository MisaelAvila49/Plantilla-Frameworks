// scripts/muestra_gD.mjs
// Genera los DATOS DE MUESTRA de las formas de tiempo y de parte de un todo
// que se añadieron a la galería (bump, líneas con contexto, calendario,
// horizonte, franjas, cortes comparables, mosaico de mini-series, apilada
// divergente, cascada, marimekko, combinaciones, icicle y árbol de
// clasificación), en src/data/muestra/ con el prefijo gD_.
//
// Son valores SINTÉTICOS con la forma de encuestas del INEGI (ENOE, ENIGH,
// ENCIG, registros de nacimientos, Censo): no describen a ninguna población
// real. Toda figura que los usa lleva el rótulo «Datos de muestra». Al
// empezar un libro se sustituyen por los datos reales y este script se retira.
//
// La semilla es fija: correr el script dos veces da los mismos archivos. No
// toca los archivos de los demás generadores.
//
//   Uso:  node scripts/muestra_gD.mjs
//
// Archivos que escribe:
//   gD_desocupacion.csv   desocupación trimestral 2005-T1 a 2025-T2: país y
//                         regiones por sexo, entidades en total
//   gD_calendario.csv     nacimientos registrados por día, 2023 y 2024
//   gD_cortes.csv         ediciones de varias fuentes y sus tramos comparables
//   gD_satisfaccion.csv   satisfacción con ocho servicios, escala de cinco
//   gD_ingreso.csv        ingreso trimestral por hogar, por fuente y subfuente
//   gD_ocupados.csv       personas ocupadas por sector y condición de formalidad
//   gD_carencias.csv      hogares por combinación de tres carencias
//   gD_lenguas.csv        hablantes por familia y agrupación lingüística

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
const acotar = (v, a, b) => Math.max(a, Math.min(b, v));
const r3 = (v) => (v == null ? "" : Math.round(v * 1000) / 1000);
const csv = (nombre, columnas, filas) => {
  const texto = [columnas.join(","), ...filas.map((f) => columnas.map((c) => {
    const x = f[c];
    if (x == null) return "";
    const s = String(x);
    return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(","))].join("\n") + "\n";
  writeFileSync(`${DIR}/${nombre}`, texto);
  console.log(`${nombre}: ${filas.length} filas`);
};
// Error estándar de una proporción con efecto de diseño (no binomial pura):
// la muestra es por conglomerados, así que se infla con deff.
const errorProporcion = (p, casos, deff = 2.2) => 100 * Math.sqrt(deff * (p / 100) * (1 - p / 100) / Math.max(casos, 1));

// =====================================================================
// 1. Desocupación trimestral (forma de la ENOE)
// =====================================================================
// Nivel nacional por trimestre: sube con la crisis de 2009, baja hasta 2019,
// no hay levantamiento cara a cara en 2020-T2 (sin dato) y repunta en 2020-T3.
const PERIODOS = [];
for (let a = 2005; a <= 2025; a++) for (let t = 1; t <= 4; t++) if (a < 2025 || t <= 2) PERIODOS.push({anio: a, trimestre: t, periodo: `${a}-T${t}`});
const nivelPais = ({anio, trimestre}) => {
  const x = anio + (trimestre - 1) / 4;
  let v = 3.6;
  if (x >= 2008.5 && x < 2011) v += 1.9 * Math.exp(-((x - 2009.6) ** 2) / 0.5);
  if (x >= 2011) v += 1.0 - (x - 2011) * 0.11;
  if (x >= 2008.5 && x < 2011) v += 0.6;
  if (x >= 2020.5) v = 4.9 - (x - 2020.5) * 0.55;
  if (x >= 2023) v = 2.75 - (x - 2023) * 0.05;
  return v + [0.1, -0.05, 0.12, -0.12][trimestre - 1];
};
// Rasgos de cada entidad: desplazamiento del nivel, sensibilidad a la crisis
// y peso de su población económicamente activa (millones en 2005).
const OFFSET = {"27": 2.6, "09": 1.5, "05": 1.1, "22": 0.6, "19": 0.5, "15": 0.9, "28": 0.7, "03": 0.4, "02": 0.2, "26": 0.4, "08": 0.6, "24": -0.2,
  "07": -1.6, "12": -1.8, "20": -1.4, "31": -0.8, "21": -0.5, "30": -0.3, "16": -0.7, "17": -0.4, "29": 0.5, "13": -0.1, "18": -0.3, "32": -0.2};
const rasgos = new Map(ENTIDADES.map((e) => [e.cve, {
  offset: (OFFSET[e.cve] ?? 0) + normal(0, 0.25),
  crisis: e.region === "Norte" ? 1.6 : e.region === "Sur-Sureste" ? 0.6 : 1.1,
  pea: Math.exp(normal(Math.log(1.25), 0.55)) * (e.cve === "15" ? 4.2 : e.cve === "09" ? 2.6 : 1),
  mujeres: 0.33 + azar() * 0.08,
}]));
const desocupacion = [];
const acumulado = new Map(); // ámbito|sexo|periodo → {num, den, casos, varianza}
const sumar = (clave, num, den, casos) => {
  const a = acumulado.get(clave) ?? {num: 0, den: 0, casos: 0};
  a.num += num; a.den += den; a.casos += casos;
  acumulado.set(clave, a);
};
for (const e of ENTIDADES) {
  const r = rasgos.get(e.cve);
  let ruido = 0;
  for (const p of PERIODOS) {
    const x = p.anio + (p.trimestre - 1) / 4;
    const sinDato = p.periodo === "2020-T2";
    ruido = ruido * 0.6 + normal(0, 0.18);
    const crisis = x >= 2008.5 && x < 2011 ? (r.crisis - 1) * 1.6 * Math.exp(-((x - 2009.6) ** 2) / 0.5) : 0;
    const tasa = acotar(nivelPais(p) + r.offset + crisis + ruido, 0.8, 11);
    const crecimiento = 1 + (x - 2005) * 0.017;
    const pea = r.pea * 1e6 * crecimiento;
    // Mujeres un poco arriba de los hombres en la tasa; su peso en la PEA crece.
    const peaM = pea * (r.mujeres + (x - 2005) * 0.003), peaH = pea - peaM;
    const tasaM = acotar(tasa + 0.35 + normal(0, 0.15), 0.6, 12), tasaH = (tasa * pea - tasaM * peaM) / peaH;
    const numM = peaM * tasaM / 100, numH = peaH * Math.max(0.5, tasaH) / 100;
    const casosPea = Math.round(9000 * Math.sqrt(pea / 1.4e6));
    const num = numM + numH, den = peaM + peaH, pct = 100 * num / den;
    const casos = Math.round(casosPea * pct / 100);
    if (!sinDato) {
      for (const [sexo, n, d] of [["Total", num, den], ["Mujeres", numM, peaM], ["Hombres", numH, peaH]]) {
        const c = Math.round(casosPea * (d / den) * (100 * n / d) / 100);
        sumar(`Todo el país|${sexo}|${p.periodo}`, n, d, c);
        sumar(`${e.region}|${sexo}|${p.periodo}`, n, d, c);
      }
    }
    desocupacion.push({tipo: "entidad", ambito: e.nombre, cve_ent: e.cve, region: e.region, sexo: "Total", periodo: p.periodo, anio: p.anio, trimestre: p.trimestre,
      num: sinDato ? null : Math.round(num), den: sinDato ? null : Math.round(den), pct: sinDato ? null : r3(pct),
      ee: sinDato ? null : r3(errorProporcion(pct, casosPea)), casos: sinDato ? null : casos});
  }
}
for (const ambito of ["Todo el país", ...REGIONES]) {
  for (const sexo of ["Total", "Mujeres", "Hombres"]) {
    for (const p of PERIODOS) {
      const a = acumulado.get(`${ambito}|${sexo}|${p.periodo}`);
      const pct = a ? 100 * a.num / a.den : null;
      // Casos de la PEA en la muestra: los desocupados entre la tasa.
      const casosPea = a ? Math.round(a.casos / (pct / 100)) : null;
      desocupacion.push({tipo: ambito === "Todo el país" ? "pais" : "region", ambito, cve_ent: ambito === "Todo el país" ? "00" : "", region: ambito === "Todo el país" ? "" : ambito,
        sexo, periodo: p.periodo, anio: p.anio, trimestre: p.trimestre,
        num: a ? Math.round(a.num) : null, den: a ? Math.round(a.den) : null, pct: a ? r3(pct) : null, ee: a ? r3(errorProporcion(pct, casosPea)) : null, casos: a ? a.casos : null});
    }
  }
}
csv("gD_desocupacion.csv", ["tipo", "ambito", "cve_ent", "region", "sexo", "periodo", "anio", "trimestre", "num", "den", "pct", "ee", "casos"], desocupacion);

// =====================================================================
// 2. Nacimientos registrados por día (forma de los registros administrativos)
// =====================================================================
// Las oficinas del registro civil abren de lunes a viernes y algunos
// sábados: el domingo casi no se registra. Los días festivos oficiales y la
// segunda quincena de diciembre bajan; enero sube.
const FESTIVOS = new Set(["2023-01-01", "2023-02-06", "2023-03-20", "2023-04-06", "2023-04-07", "2023-05-01", "2023-09-16", "2023-11-02", "2023-11-20", "2023-12-25",
  "2024-01-01", "2024-02-05", "2024-03-18", "2024-03-28", "2024-03-29", "2024-05-01", "2024-09-16", "2024-10-01", "2024-11-02", "2024-11-18", "2024-12-25"]);
const POBLACION_PAIS = {2023: 129.5e6, 2024: 130.6e6};
const REPARTO_REGION = {"Norte": 0.235, "Centro-Occidente": 0.205, "Centro": 0.335, "Sur-Sureste": 0.225};
const FECUNDIDAD = {"Norte": 0.98, "Centro-Occidente": 1.06, "Centro": 0.86, "Sur-Sureste": 1.18};
const calendario = [];
for (const anio of [2023, 2024]) {
  const porRegion = new Map();
  for (let t = Date.UTC(anio, 0, 1); t < Date.UTC(anio + 1, 0, 1); t += 864e5) {
    const f = new Date(t), dia = f.getUTCDay(), mes = f.getUTCMonth(), d = f.getUTCDate();
    const fecha = f.toISOString().slice(0, 10);
    let factor = dia === 0 ? 0.03 : dia === 6 ? 0.24 : 1;
    if (FESTIVOS.has(fecha)) factor = 0.05;
    if (mes === 11 && d >= 18) factor *= 0.45;
    if (mes === 0 && d >= 3 && d <= 31) factor *= 1.18;
    if (mes === 6 && d >= 15) factor *= 0.88;
    for (const region of REGIONES) {
      const pob = POBLACION_PAIS[anio] * REPARTO_REGION[region];
      const base = 5.25 * (anio === 2024 ? 0.965 : 1) * FECUNDIDAD[region] * pob / 1e5;
      const registros = Math.max(0, Math.round(base * factor * Math.exp(normal(0, 0.07))));
      porRegion.set(`${fecha}|${region}`, registros);
      calendario.push({fecha, ambito: region, registros, poblacion: Math.round(pob)});
    }
    const total = REGIONES.reduce((s, r) => s + porRegion.get(`${fecha}|${r}`), 0);
    calendario.push({fecha, ambito: "Todo el país", registros: total, poblacion: Math.round(POBLACION_PAIS[anio])});
  }
}
csv("gD_calendario.csv", ["fecha", "ambito", "registros", "poblacion"], calendario);

// =====================================================================
// 3. Ediciones comparables de varias fuentes (cortes y quiebres de ejemplo)
// =====================================================================
const rango = (a, b, paso = 1) => Array.from({length: Math.floor((b - a) / paso) + 1}, (_, i) => a + i * paso);
const FUENTES = [
  {indicador: "Desocupación", fuente: "ENOE", tema: "Trabajo e ingreso", tipo: "Encuesta en hogares", muestra: 120000,
    tramos: [rango(2005, 2019), rango(2020, 2025)], motivo: "En 2020 el levantamiento se suspendió y se hizo por teléfono; desde el tercer trimestre es la nueva edición de la encuesta"},
  {indicador: "Ingreso de los hogares", fuente: "ENIGH", tema: "Trabajo e ingreso", tipo: "Encuesta en hogares", muestra: 90000,
    tramos: [[2008, 2010, 2012, 2014], [2016, 2018, 2020, 2022, 2024]], motivo: "Nueva serie desde 2016, con otro cuestionario de ingresos"},
  {indicador: "Posgrado (maestría y doctorado)", fuente: "ENIGH", tema: "Trabajo e ingreso", tipo: "Encuesta en hogares", muestra: 90000,
    tramos: [[2016, 2018, 2020, 2022], [2024]], motivo: "Cambia la escala de nivel aprobado en 2024"},
  {indicador: "Uso de internet", fuente: "MODUTIH y ENDUTIH", tema: "Población y hogares", tipo: "Encuesta en hogares", muestra: 75000,
    tramos: [[2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014], rango(2015, 2024)], motivo: "Cambian la encuesta y el cuestionario en 2015"},
  {indicador: "Habla lengua indígena", fuente: "Censo y Conteo", tema: "Población y hogares", tipo: "Censo o conteo", muestra: null,
    tramos: [[2005, 2010, 2015, 2020]], motivo: ""},
  {indicador: "Migración interna", fuente: "ENADID", tema: "Población y hogares", tipo: "Encuesta en hogares", muestra: 110000,
    tramos: [[2009], [2014, 2018, 2023]], motivo: "Cambia el diseño de la muestra en 2014"},
  {indicador: "Violencia contra las mujeres", fuente: "ENDIREH", tema: "Violencia y seguridad", tipo: "Encuesta en hogares", muestra: 140000,
    tramos: [[2006], [2011], [2016, 2021]], motivo: "Cambios de cuestionario antes de 2016"},
  {indicador: "Victimización", fuente: "ENVIPE", tema: "Violencia y seguridad", tipo: "Encuesta en hogares", muestra: 102000,
    tramos: [rango(2011, 2024)], motivo: ""},
  {indicador: "Satisfacción con servicios", fuente: "ENCIG", tema: "Violencia y seguridad", tipo: "Encuesta en hogares", muestra: 46000,
    tramos: [[2011, 2013, 2015, 2017, 2019, 2021, 2023]], motivo: ""},
];
const cortes = FUENTES.flatMap((f) => f.tramos.flatMap((t, k) => t.map((anio) => ({
  indicador: f.indicador, fuente: f.fuente, tema: f.tema, tipo: f.tipo, anio, tramo: k + 1,
  desde: t[0], hasta: t.at(-1), ediciones: t.length, motivo: k > 0 || f.tramos.length > 1 ? f.motivo : "",
  muestra: f.muestra ? Math.round(f.muestra * (0.85 + azar() * 0.3) / 100) * 100 : null,
}))));
csv("gD_cortes.csv", ["indicador", "fuente", "tema", "tipo", "anio", "tramo", "desde", "hasta", "ediciones", "motivo", "muestra"], cortes);

// =====================================================================
// 4. Satisfacción con servicios públicos (forma de la ENCIG)
// =====================================================================
// Población de 18 años y más en ciudades de 100 mil habitantes y más. Cinco
// respuestas ordenadas; el reparto sale de una satisfacción media por
// servicio, región y año.
const RESPUESTAS = ["Muy insatisfecho", "Insatisfecho", "Ni satisfecho ni insatisfecho", "Satisfecho", "Muy satisfecho"];
const SERVICIOS = {"Recolección de basura": 0.72, "Agua potable": 0.55, "Drenaje y alcantarillado": 0.5, "Transporte público": 0.44, "Parques y jardines": 0.43,
  "Alumbrado público": 0.4, "Policía": 0.3, "Calles y avenidas": 0.24};
const POB_ENCIG = {"Todo el país": 37.6e6, "Norte": 9.9e6, "Centro-Occidente": 7.4e6, "Centro": 13.8e6, "Sur-Sureste": 6.5e6};
const AJUSTE_REGION = {"Todo el país": 0, "Norte": 0.05, "Centro-Occidente": 0.02, "Centro": -0.05, "Sur-Sureste": -0.03};
const satisfaccion = [];
for (const anio of [2021, 2023]) {
  for (const ambito of Object.keys(POB_ENCIG)) {
    for (const [servicio, media] of Object.entries(SERVICIOS)) {
      const s = acotar(media + AJUSTE_REGION[ambito] + (anio === 2023 ? 0.025 : 0) + normal(0, 0.025), 0.1, 0.9);
      // Reparto: satisfechos y muy satisfechos ~ s; neutros entre 8 y 14 %.
      const neutro = 0.08 + azar() * 0.06;
      const insat = Math.max(0.04, 1 - s - neutro);
      const partes = [insat * (0.32 + azar() * 0.1), 0, neutro, s * (0.8 + azar() * 0.06), 0];
      partes[1] = insat - partes[0];
      partes[4] = s - partes[3];
      const suma = partes.reduce((a, b) => a + b, 0);
      const den = Math.round(POB_ENCIG[ambito] * (anio === 2023 ? 1.03 : 1));
      const casosDen = Math.round((ambito === "Todo el país" ? 25000 : 6200) * (0.9 + azar() * 0.2));
      RESPUESTAS.forEach((respuesta, k) => {
        const p = 100 * partes[k] / suma;
        satisfaccion.push({anio, ambito, servicio, respuesta, orden: k, num: Math.round(den * p / 100), den, pct: r3(p), ee: r3(errorProporcion(p, casosDen, 1.9)), casos: Math.round(casosDen * p / 100)});
      });
    }
  }
}
csv("gD_satisfaccion.csv", ["anio", "ambito", "servicio", "respuesta", "orden", "num", "den", "pct", "ee", "casos"], satisfaccion);

// =====================================================================
// 5. Ingreso corriente trimestral por hogar (forma de la ENIGH)
// =====================================================================
// Promedio por hogar, en pesos de 2024 (deflactado con el índice de precios
// del periodo de levantamiento, agosto a noviembre). Una fila por grupo de
// hogares, edición, fuente y subfuente. La suma de las subfuentes es el
// ingreso corriente.
const SUBFUENTES = [
  ["Trabajo", "Trabajo subordinado"], ["Trabajo", "Trabajo independiente"], ["Trabajo", "Otros ingresos del trabajo"],
  ["Renta de la propiedad", "Renta de la propiedad"],
  ["Transferencias", "Jubilaciones y pensiones"], ["Transferencias", "Programas sociales"], ["Transferencias", "Remesas y ayuda de otros hogares"], ["Transferencias", "Becas y donativos"],
  ["Estimación del alquiler", "Estimación del alquiler"],
  ["Otros ingresos", "Otros ingresos corrientes"],
];
// Montos de 2024 por grupo, y cambio hacia atrás por edición (índices).
const INGRESO_2024 = {
  "Todos los hogares": [38900, 9800, 1650, 1300, 6400, 3700, 1500, 1350, 8700, 90],
  "Decil I": [4700, 2300, 180, 25, 600, 3900, 900, 310, 3100, 10],
  "Decil X": [131000, 30500, 5400, 9800, 22000, 1900, 1700, 2200, 29500, 600],
};
// Índice de cada subfuente respecto de 2024, en las ediciones anteriores.
const TRAYECTO = {2018: [0.83, 0.97, 0.9, 1.25, 0.82, 0.38, 0.9, 1.1, 0.93, 1.2], 2020: [0.78, 0.84, 0.82, 0.95, 0.88, 0.58, 0.95, 0.95, 0.95, 1.1], 2022: [0.88, 0.95, 0.92, 1.1, 0.9, 0.8, 1.05, 1.0, 0.96, 1.05], 2024: Array(10).fill(1)};
const HOGARES = {2018: 34.7e6, 2020: 35.7e6, 2022: 37.8e6, 2024: 38.8e6};
const ingreso = [];
for (const [grupo, montos] of Object.entries(INGRESO_2024)) {
  for (const anio of [2018, 2020, 2022, 2024]) {
    const hogares = Math.round(HOGARES[anio] * (grupo === "Todos los hogares" ? 1 : 0.1));
    const casos = Math.round((grupo === "Todos los hogares" ? 88000 : 8800) * (0.92 + azar() * 0.16));
    SUBFUENTES.forEach(([fuente, subfuente], k) => {
      const monto = Math.round(montos[k] * TRAYECTO[anio][k] * (1 + normal(0, 0.012)));
      ingreso.push({grupo, anio, fuente, subfuente, monto, ee: Math.round(monto * (0.012 + azar() * 0.02) * (grupo === "Todos los hogares" ? 1 : 2.4)), hogares, casos});
    });
  }
}
csv("gD_ingreso.csv", ["grupo", "anio", "fuente", "subfuente", "monto", "ee", "hogares", "casos"], ingreso);

// =====================================================================
// 6. Personas ocupadas por sector y formalidad (forma de la ENOE)
// =====================================================================
const SECTORES = {
  // [millones 2024, informalidad 2024, parte de mujeres]
  "Agropecuario": [6.4, 0.85, 0.13], "Industria manufacturera": [9.7, 0.4, 0.37], "Construcción": [4.8, 0.76, 0.04],
  "Comercio": [11.6, 0.6, 0.52], "Servicios": [25.2, 0.5, 0.5], "Gobierno": [2.6, 0.08, 0.45],
};
const ocupados = [];
for (const periodo of ["2019-T4", "2024-T4"]) {
  for (const [sector, [millones, informal, mujeres]] of Object.entries(SECTORES)) {
    const escala = periodo === "2019-T4" ? 0.94 : 1, inf = acotar(informal + (periodo === "2019-T4" ? 0.015 : 0) + normal(0, 0.008), 0.03, 0.95);
    const total = millones * 1e6 * escala;
    for (const sexo of ["Total", "Mujeres", "Hombres"]) {
      const den = sexo === "Total" ? total : sexo === "Mujeres" ? total * mujeres : total * (1 - mujeres);
      const pInf = acotar(inf + (sexo === "Mujeres" ? 0.035 : sexo === "Hombres" ? -0.02 : 0), 0.02, 0.97);
      const casosDen = Math.round(den / 1e6 * 4200);
      for (const [condicion, p] of [["Informal", pInf], ["Formal", 1 - pInf]]) {
        ocupados.push({periodo, sexo, sector, condicion, num: Math.round(den * p), den: Math.round(den), pct: r3(100 * p), ee: r3(errorProporcion(100 * p, casosDen)), casos: Math.round(casosDen * p)});
      }
    }
  }
}
csv("gD_ocupados.csv", ["periodo", "sexo", "sector", "condicion", "num", "den", "pct", "ee", "casos"], ocupados);

// =====================================================================
// 7. Hogares por combinación de carencias (forma de la ENIGH)
// =====================================================================
// Tres carencias: sin internet, hacinamiento y rezago educativo de la
// persona de referencia. Se acumulan: una mezcla de dos tipos de hogar
// (con y sin desventaja) induce la correlación, y dentro de cada tipo las
// carencias son independientes. Las ocho combinaciones suman el total.
const CARENCIAS = ["Sin internet", "Hacinamiento", "Rezago educativo"];
const PERFIL = {
  "Todas las localidades": {hogares: 38.8e6, v: 0.32, alta: [0.72, 0.24, 0.62], baja: [0.18, 0.04, 0.17]},
  "Urbanas": {hogares: 30.6e6, v: 0.24, alta: [0.62, 0.21, 0.55], baja: [0.14, 0.035, 0.14]},
  "Rurales": {hogares: 8.2e6, v: 0.6, alta: [0.86, 0.28, 0.72], baja: [0.42, 0.07, 0.36]},
};
const carencias = [];
for (const anio of [2022, 2024]) {
  for (const [localidad, f] of Object.entries(PERFIL)) {
    const mejora = anio === 2024 ? [0.88, 0.95, 0.96] : [1, 1, 1];
    const hogares = Math.round(f.hogares * (anio === 2022 ? 0.975 : 1));
    const casosTotal = Math.round(hogares / 38.8e6 * 90000);
    for (let m = 0; m < 8; m++) {
      const tiene = CARENCIAS.map((_, k) => Boolean(m & (1 << k)));
      const prob = (pk) => tiene.reduce((acc, t, k) => acc * (t ? pk[k] * mejora[k] : 1 - pk[k] * mejora[k]), 1);
      const p = f.v * prob(f.alta) + (1 - f.v) * prob(f.baja);
      carencias.push({anio, localidad, sin_internet: +tiene[0], hacinamiento: +tiene[1], rezago: +tiene[2], numero: tiene.filter(Boolean).length,
        num: Math.round(hogares * p), den: hogares, pct: r3(100 * p), ee: r3(errorProporcion(100 * p, casosTotal, 2.0)), casos: Math.round(casosTotal * p)});
    }
  }
}
csv("gD_carencias.csv", ["anio", "localidad", "sin_internet", "hacinamiento", "rezago", "numero", "num", "den", "pct", "ee", "casos"], carencias);

// =====================================================================
// 8. Hablantes por familia y agrupación lingüística (forma del Censo)
// =====================================================================
// Siete de las once familias del catálogo y treinta agrupaciones. Población
// de 3 años y más que habla la lengua. Cifras redondeadas de la forma de los
// censos de 2010 y 2020, con ruido: son datos de muestra.
const LENGUAS = [
  ["Yuto-nahua", "Náhuatl", 1544968, 1651958], ["Yuto-nahua", "Tarahumara", 85018, 91554], ["Yuto-nahua", "Huichol", 44788, 60263],
  ["Yuto-nahua", "Tepehuano del sur", 34000, 44386], ["Yuto-nahua", "Mayo", 39616, 38507], ["Yuto-nahua", "Cora", 20078, 33226], ["Yuto-nahua", "Yaqui", 17592, 19376],
  ["Oto-mangue", "Mixteco", 471710, 526593], ["Oto-mangue", "Zapoteco", 450419, 490845], ["Oto-mangue", "Otomí", 284992, 298861], ["Oto-mangue", "Mazateco", 223073, 237212],
  ["Oto-mangue", "Mazahua", 135897, 153797], ["Oto-mangue", "Tlapaneco", 127234, 147432], ["Oto-mangue", "Chinanteco", 131382, 144394], ["Oto-mangue", "Amuzgo", 53823, 59884],
  ["Oto-mangue", "Chatino", 45019, 52076], ["Oto-mangue", "Triqui", 25883, 32650],
  ["Maya", "Maya", 786113, 774755], ["Maya", "Tseltal", 445856, 589144], ["Maya", "Tsotsil", 404704, 550274], ["Maya", "Ch'ol", 212117, 254715],
  ["Maya", "Huasteco", 161120, 168729], ["Maya", "Tojolabal", 51733, 66953], ["Maya", "Chontal de Tabasco", 37072, 60563],
  ["Mixe-zoque", "Mixe", 132759, 139760], ["Mixe-zoque", "Zoque", 63022, 74018], ["Mixe-zoque", "Popoluca de la Sierra", 36000, 41000],
  ["Totonaco-tepehua", "Totonaco", 244033, 256344], ["Totonaco-tepehua", "Tepehua", 8500, 8884],
  ["Tarasca", "Purépecha", 124494, 142459],
  ["Huave", "Huave", 17554, 18827],
];
const lenguas = LENGUAS.flatMap(([familia, agrupacion, h2010, h2020]) => [[2010, h2010], [2020, h2020]].map(([anio, h]) => ({
  anio, familia, agrupacion, hablantes: Math.round(h * (1 + normal(0, 0.01)) / 10) * 10,
})));
csv("gD_lenguas.csv", ["anio", "familia", "agrupacion", "hablantes"], lenguas);
