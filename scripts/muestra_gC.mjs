// scripts/muestra_gC.mjs
// Genera los DATOS DE MUESTRA de las formas de distribución y correlación de
// la galería (histograma, caja, enjambre de puntos, nube de lluvia, curvas
// acumuladas, dispersión, hexbin y dispersión conectada) en src/data/muestra/.
//
// Son valores SINTÉTICOS con forma verosímil de encuestas del INEGI (ENOE,
// ENUT, Censo y ENIGH): no salen de ninguna fuente y no describen a ninguna
// población real. Toda figura que los usa lleva el rótulo «Datos de muestra».
// Escribe solo archivos que empiezan con «gC_» y no toca los demás. Al
// empezar un libro se sustituyen por los datos reales y este script se retira.
//
// Los montos de varias ediciones ya vienen en pesos de 2024 (en un libro real
// se deflactan con el INPC del periodo de levantamiento, R151).
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos.   Uso:  node scripts/muestra_gC.mjs

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
const elegir = (pesos) => { const s = pesos.reduce((a, b) => a + b, 0); let r = azar() * s; for (let i = 0; i < pesos.length; i++) { r -= pesos[i]; if (r <= 0) return i; } return pesos.length - 1; };
const r1 = (v) => Math.round(v * 10) / 10, r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
const csv = (nombre, columnas, filas) => {
  const texto = [columnas.join(","), ...filas.map((f) => columnas.map((c) => f[c] ?? "").join(","))].join("\n") + "\n";
  writeFileSync(`${DIR}/${nombre}`, texto);
  console.log(`${nombre}: ${filas.length} filas`);
};

// ---- 1. gC_ocupados.csv: microdatos de personas ocupadas (al estilo de la
// ENOE) con edad, sector, horas trabajadas a la semana, ingreso mensual en
// pesos de 2024 y factor de expansión. 8,000 registros por edición.
const SECTORES = ["Agropecuario", "Industria", "Construcción", "Comercio", "Servicios"];
const ocupados = [];
for (const [anio, total, ajuste] of [[2022, 57.9e6, 0.955], [2024, 59.4e6, 1]]) {
  const N = 8000;
  const brutos = [];
  for (let i = 0; i < N; i++) {
    const mujer = azar() < 0.405;
    const sector = elegir(mujer ? [4, 16, 1, 30, 49] : [15, 18, 13, 20, 34]);
    // Edad: la mayoría entre 20 y 55 años, con una cola larga hacia arriba.
    const edad = Math.round(acotar(azar() < 0.8 ? normal(37, 11) : normal(58, 9), 15, 79));
    // Horas: jornada típica de cada sector, con picos en 40 y 48 horas.
    const media = [41, 46, 47, 44, 40][sector] - (mujer ? 5.5 : 0) - (edad > 64 ? 8 : 0);
    let horas = normal(media, 11);
    const pico = azar();
    if (pico < 0.22) horas = 48; else if (pico < 0.4) horas = 40;
    horas = Math.round(acotar(horas, 1, 84));
    // Ingreso: lognormal según sector, sexo, edad y horas.
    const nivel = [8.45, 9.15, 9.05, 8.95, 9.2][sector] - (mujer ? 0.16 : 0) + Math.min(0.25, (edad - 15) * 0.009) - (edad > 60 ? 0.2 : 0) + 0.35 * Math.log(horas / 44);
    const ingreso = Math.round(acotar(Math.exp(normal(nivel, 0.62)) * ajuste, 300, 150000) / 10) * 10;
    brutos.push({anio, sexo: mujer ? "Mujeres" : "Hombres", edad, sector: SECTORES[sector], horas, ingreso, peso: entre(0.6, 1.4)});
  }
  const s = brutos.reduce((a, b) => a + b.peso, 0);
  for (const b of brutos) ocupados.push({...b, factor: Math.round(b.peso / s * total)});
}
csv("gC_ocupados.csv", ["anio", "sexo", "edad", "sector", "horas", "ingreso", "factor"], ocupados);

// ---- 2. gC_cuidados.csv: horas a la semana de trabajo de cuidados (al
// estilo de la ENUT), de quienes cuidan, por sexo y grupo de edad. Las
// mujeres de 30 a 44 años tienen dos jorobas: quienes cuidan a hijas e hijos
// pequeños y el resto.
const EDADES_CUIDADO = ["15 a 29", "30 a 44", "45 a 64", "65 y más"];
const cuidados = [];
for (const [anio, total] of [[2019, 31.2e6], [2024, 33.6e6]]) {
  for (const sexo of ["Mujeres", "Hombres"]) {
    const parte = sexo === "Mujeres" ? 0.6 : 0.4;
    for (const [k, edad] of EDADES_CUIDADO.entries()) {
      const n = 170 + Math.round(entre(0, 40));
      const parteEdad = [0.3, 0.32, 0.27, 0.11][k];
      const filas = [];
      for (let i = 0; i < n; i++) {
        let h;
        if (sexo === "Mujeres") {
          if (k === 1 && azar() < 0.38) h = normal(46 + (anio === 2024 ? -1.5 : 0), 9);
          else h = normal([18, 22, 20, 15][k] + (anio === 2024 ? -1 : 0), [9, 10, 10, 8][k]);
        } else {
          h = normal([9, 13, 11, 9][k] + (anio === 2024 ? 1.2 : 0), [6, 7, 7, 6][k]);
        }
        filas.push({anio, sexo, edad, horas: r1(acotar(h, 0.5, 98)), peso: entre(0.6, 1.4)});
      }
      const s = filas.reduce((a, b) => a + b.peso, 0);
      for (const f of filas) cuidados.push({...f, factor: Math.round(f.peso / s * total * parte * parteEdad)});
    }
  }
}
csv("gC_cuidados.csv", ["anio", "sexo", "edad", "horas", "factor"], cuidados);

// ---- 3. gC_escolaridad_municipios.csv: escolaridad promedio de la población
// de 15 años y más en 300 municipios ficticios (al estilo del cuestionario
// ampliado del Censo), con su error estándar y los casos de la muestra.
const MEDIA_REGION = {"Norte": 9.7, "Centro-Occidente": 8.9, "Centro": 9.4, "Sur-Sureste": 7.7};
const PESO_REGION = {"Norte": 0.8, "Centro-Occidente": 1, "Centro": 1.1, "Sur-Sureste": 1.5};
const municipios = [];
const porEntidad = ENTIDADES.map((e) => ({e, n: Math.max(3, Math.round(entre(5, 12) * PESO_REGION[e.region]))}));
const sumaN = porEntidad.reduce((a, b) => a + b.n, 0);
for (const {e, n} of porEntidad) {
  const cuantos = Math.round(n / sumaN * 300);
  const mediaEnt = MEDIA_REGION[e.region] + normal(0, 0.45);
  for (let i = 1; i <= cuantos; i++) {
    const urbano = azar() < 0.18;
    const base2010 = acotar(normal(mediaEnt + (urbano ? 1.6 : -0.3), 1.0), 3.6, 13.2);
    const pob = Math.round(urbano ? Math.exp(normal(12.2, 0.8)) : Math.exp(normal(9.4, 1.0)));
    const casos = Math.max(12, Math.round(Math.sqrt(pob) * entre(1.1, 2.4)));
    for (const anio of [2010, 2020]) {
      const valor = anio === 2010 ? base2010 : acotar(base2010 + entre(0.6, 1.4), 3.8, 13.8);
      const pob15 = Math.round(pob * (anio === 2010 ? 0.66 : 0.72) * (anio === 2010 ? 0.94 : 1));
      municipios.push({cve_ent: e.cve, entidad: e.nombre, region: e.region, cve_mun: `${e.cve}${String(i).padStart(3, "0")}`, nombre: `Municipio ${i} de ${e.nombre}`,
        anio, escolaridad: r2(valor), pob15, ee: r3(entre(1.6, 2.6) / Math.sqrt(casos)), casos: Math.round(casos * (anio === 2010 ? 0.92 : 1))});
    }
  }
}
csv("gC_escolaridad_municipios.csv", ["cve_ent", "entidad", "region", "cve_mun", "nombre", "anio", "escolaridad", "pob15", "ee", "casos"], municipios);

// ---- 4. gC_escolaridad_acumulada.csv: porcentaje de la población de 25 a 64
// años con MENOS de x años de escuela, para dos grupos en tres comparaciones
// (lengua indígena, sexo y tamaño de localidad) y dos censos. Los picos en
// 6, 9 y 12 años son los niveles terminados.
const COMPARACIONES = {
  lengua: [["Habla lengua indígena", 6.2, 3.9, 4.1e6], ["No habla lengua indígena", 10.3, 3.7, 58.5e6]],
  sexo: [["Mujeres", 9.8, 3.9, 32.5e6], ["Hombres", 10.1, 3.8, 30.1e6]],
  localidad: [["Localidades rurales", 7.4, 3.6, 13.0e6], ["Localidades urbanas", 10.8, 3.7, 49.6e6]],
};
const acumulada = [];
for (const anio of [2010, 2020]) {
  for (const [comparacion, grupos] of Object.entries(COMPARACIONES)) {
    for (const [grupo, media0, sd, den0] of grupos) {
      const media = media0 + (anio === 2010 ? -1.1 : 0);
      const den = Math.round(den0 * (anio === 2010 ? 0.86 : 1));
      const p = Array.from({length: 19}, (_, k) => Math.exp(-((k - media) ** 2) / (2 * sd * sd)) * ([6, 9, 12].includes(k) ? 2.3 : k === 16 ? 1.6 : 1) + 0.008);
      const s = p.reduce((a, b) => a + b, 0);
      let acum = 0;
      const casosBase = Math.round(den / 210);
      for (let x = 0; x <= 18; x++) {
        const pct = acum / s * 100;
        acum += p[x];
        acumulada.push({anio, comparacion, grupo, x, pct: r3(pct), num: Math.round(pct / 100 * den), den, ee: x === 0 ? "" : r3(Math.sqrt(pct * (100 - pct) / casosBase) * 1.5), casos: casosBase});
      }
    }
  }
}
csv("gC_escolaridad_acumulada.csv", ["anio", "comparacion", "grupo", "x", "pct", "num", "den", "ee", "casos"], acumulada);

// ---- 5. gC_entidades.csv: por entidad y edición, hogares con internet (al
// estilo de la ENDUTIH), escolaridad promedio de 15 años y más e ingreso
// corriente mensual por persona (pesos de 2024, al estilo de la ENIGH).
const entidades = [];
for (const e of ENTIDADES) {
  const atraso = e.region === "Sur-Sureste" ? -14 : e.region === "Norte" ? 7 : e.region === "Centro" ? 3 : 0;
  const especial = e.cve === "09" ? 14 : e.cve === "19" ? 9 : e.cve === "07" || e.cve === "20" || e.cve === "12" ? -10 : 0;
  const latente = normal(0, 1);
  const hogares0 = Math.round(entre(0.28, 1.0) * (e.cve === "15" ? 5.2 : e.cve === "09" ? 3.4 : ["14", "30", "21", "11", "19"].includes(e.cve) ? 2.4 : 1) * 1e6);
  for (const [anio, nacional] of [[2016, 47], [2020, 60], [2024, 73]]) {
    const internet = acotar(nacional + atraso + especial + 4.5 * latente + normal(0, 2.2), 18, 97);
    const escolaridad = acotar(9.3 + 0.07 * (internet - nacional) + (anio - 2020) * 0.06 + normal(0, 0.35), 6.2, 12.4);
    const ingreso = acotar(Math.exp(8.62 + 0.016 * (internet - nacional) + (anio - 2020) * 0.018 + normal(0, 0.08)), 2600, 13000);
    const hogares = Math.round(hogares0 * (1 + (anio - 2016) * 0.012));
    const casos = Math.round(entre(900, 2600));
    entidades.push({cve_ent: e.cve, entidad: e.nombre, region: e.region, anio, internet: r2(internet), hogares_internet: Math.round(hogares * internet / 100), hogares,
      internet_ee: r3(Math.sqrt(internet * (100 - internet) / casos) * 1.45), casos, escolaridad: r2(escolaridad), escolaridad_ee: r3(entre(0.06, 0.16)),
      ingreso: Math.round(ingreso), ingreso_ee: Math.round(ingreso * entre(0.025, 0.06))});
  }
}
csv("gC_entidades.csv", ["cve_ent", "entidad", "region", "anio", "internet", "hogares_internet", "hogares", "internet_ee", "casos", "escolaridad", "escolaridad_ee", "ingreso", "ingreso_ee"], entidades);

// ---- 6. gC_trayectorias.csv: escolaridad promedio e ingreso mensual real
// (pesos de 2024) de las personas ocupadas en nueve ediciones bienales, para
// el país y cada región, por sexo. La serie va y viene: baja de 2008 a 2014,
// sube a 2018, cae en 2020 y se recupera.
const ANIOS_T = [2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
const CICLO = [1, 0.95, 0.93, 0.91, 0.95, 0.99, 0.9, 0.98, 1.08];
const trayectorias = [];
const LUGARES = [["Todo el país", 8.9, 9900, 52e6], ["Norte", 9.6, 12100, 11e6], ["Centro-Occidente", 8.6, 9600, 12e6], ["Centro", 9.4, 10400, 15e6], ["Sur-Sureste", 7.9, 7600, 14e6]];
for (const [lugar, esc0, ing0, ocup0] of LUGARES) {
  for (const sexo of ["Total", "Mujeres", "Hombres"]) {
    const dEsc = sexo === "Mujeres" ? 0.35 : sexo === "Hombres" ? -0.2 : 0;
    const dIng = sexo === "Mujeres" ? 0.84 : sexo === "Hombres" ? 1.1 : 1;
    const parte = sexo === "Mujeres" ? 0.4 : sexo === "Hombres" ? 0.6 : 1;
    ANIOS_T.forEach((anio, k) => {
      const escolaridad = esc0 + dEsc + k * 0.19 + normal(0, 0.04);
      const ingreso = ing0 * dIng * CICLO[k] * (1 + normal(0, 0.012));
      const casos = Math.round((lugar === "Todo el país" ? 42000 : 9000) * parte * (0.8 + k * 0.03));
      trayectorias.push({lugar, sexo, anio, escolaridad: r2(escolaridad), ingreso: Math.round(ingreso), ingreso_ee: Math.round(ingreso * (lugar === "Todo el país" ? 0.008 : 0.018) / Math.sqrt(parte)),
        ocupados: Math.round(ocup0 * parte * (1 + k * 0.012)), casos});
    });
  }
}
csv("gC_trayectorias.csv", ["lugar", "sexo", "anio", "escolaridad", "ingreso", "ingreso_ee", "ocupados", "casos"], trayectorias);

console.log("Regiones:", REGIONES.join(", "));
