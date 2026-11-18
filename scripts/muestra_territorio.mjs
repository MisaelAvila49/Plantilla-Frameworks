// scripts/muestra_territorio.mjs
// Genera los DATOS DE MUESTRA de las formas de territorio y flujo
// (flechas-cambio, semitonos, silueta-puntos y barra-mapa), en
// src/data/muestra/.
//
// Son valores SINTÉTICOS: no salen de ninguna fuente y no describen a ninguna
// población real. Usan los nombres y el contorno de las 32 entidades solo
// para que los mapas y los filtros tengan con qué dibujarse. Toda figura que
// los usa lleva el rótulo «Datos de muestra». Al empezar un libro se
// sustituyen por los datos reales y este script se retira.
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos. No toca los archivos de los otros generadores de muestra; solo
// LEE od_entidades.csv (de scripts/muestra_flujos.mjs) para partir sus flujos
// por motivo y por sexo sin cambiar sus totales.
//
//   Uso:  node scripts/muestra_territorio.mjs
//
// Archivos que escribe:
//   cambio_municipios.csv   porcentaje por municipio ficticio, sexo y año (2015, 2020, 2025)
//   semitonos_celdas.csv    personas por celda de 0.25° y grupo de edad, en 2020 y 2025
//   od_motivo_sexo.csv      od_entidades.csv partido por motivo y por sexo
//   silueta_situacion.csv   población por situación entre dos años, por región y sexo

import {writeFileSync, readFileSync, mkdirSync} from "node:fs";
import {ENTIDADES, ISO_A_CVE, REGIONES, POR_CVE} from "../src/components/geografia.js";

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
const csv = (nombre, columnas, filas) => {
  const texto = [columnas.join(","), ...filas.map((f) => columnas.map((c) => f[c] ?? "").join(","))].join("\n") + "\n";
  writeFileSync(`${DIR}/${nombre}`, texto);
  console.log(`${nombre}: ${filas.length} filas`);
};

// ---- Contorno de cada entidad: todos sus anillos exteriores, su caja, su
// superficie y su centro (del anillo mayor).
const geo = JSON.parse(readFileSync(`${DIR}/entidades.geojson`, "utf8"));
const area = (anillo) => { let a = 0; for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) a += anillo[j][0] * anillo[i][1] - anillo[i][0] * anillo[j][1]; return a / 2; };
const enAnillo = ([x, y], anillo) => {
  let d = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i], [xj, yj] = anillo[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
};
const contorno = new Map();
for (const f of geo.features) {
  const polis = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const anillos = polis.map((p) => p[0]);
  const mayor = [...anillos].sort((p, q) => Math.abs(area(q)) - Math.abs(area(p)))[0];
  const a = area(mayor);
  let cx = 0, cy = 0;
  for (let i = 0, j = mayor.length - 1; i < mayor.length; j = i++) {
    const k = mayor[j][0] * mayor[i][1] - mayor[i][0] * mayor[j][1];
    cx += (mayor[j][0] + mayor[i][0]) * k; cy += (mayor[j][1] + mayor[i][1]) * k;
  }
  const xs = anillos.flat().map((p) => p[0]), ys = anillos.flat().map((p) => p[1]);
  contorno.set(ISO_A_CVE.get(f.properties.id), {
    anillos, centro: [cx / (6 * a), cy / (6 * a)], superficie: anillos.reduce((s, r) => s + Math.abs(area(r)), 0),
    caja: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
  });
}
if (contorno.size !== 32) throw new Error(`El geojson trae ${contorno.size} entidades reconocidas, no 32.`);
const dentroDe = (p, cve) => contorno.get(cve).anillos.some((r) => enAnillo(p, r));
const entidadDe = (p) => {
  for (const [cve, c] of contorno) {
    if (p[0] < c.caja[0] || p[0] > c.caja[2] || p[1] < c.caja[1] || p[1] > c.caja[3]) continue;
    if (dentroDe(p, cve)) return cve;
  }
  return null;
};
// Punto al azar dentro de una entidad.
const puntoEn = (cve) => {
  const c = contorno.get(cve);
  for (let i = 0; i < 500; i++) {
    const q = [entre(c.caja[0], c.caja[2]), entre(c.caja[1], c.caja[3])];
    if (dentroDe(q, cve)) return q;
  }
  return c.centro;
};
// Distancia en grados, corrigiendo la longitud por la latitud.
const dist = (a, b) => Math.hypot((a[0] - b[0]) * Math.cos((a[1] + b[1]) * Math.PI / 360), a[1] - b[1]);
// Campo suave: suma de jorobas gaussianas [lon, lat, amplitud, radio en grados].
const campo = (jorobas) => (p) => jorobas.reduce((s, [x, y, a, r]) => s + a * Math.exp(-(dist(p, [x, y]) ** 2) / (2 * r * r)), 0);

// ---- 1. cambio_municipios.csv: unos 950 municipios ficticios, repartidos de
// manera pareja dentro de cada entidad (muestreo del mejor candidato), con el
// porcentaje que cumple la condición por sexo en 2015, 2020 y 2025. El cambio
// tiene una parte que varía suave en el territorio, para que las flechas
// formen zonas que suben y zonas que bajan, y otra propia de cada municipio.
const N_MUN = 950;
const pesoSup = new Map([...contorno].map(([cve, c]) => [cve, c.superficie ** 0.55]));
const sumaSup = [...pesoSup.values()].reduce((a, b) => a + b, 0);
const nivelBase = campo([[-96.5, 17.2, 16, 2.6], [-92.6, 16.6, 14, 1.8], [-89, 20.5, 10, 1.6], [-99.1, 19.4, -4, 1.2], [-107, 28, -5, 3]]);
const cambio1 = campo([[-112, 29.5, 3.6, 3.2], [-102, 25.5, 2.6, 2.4], [-96.2, 18.2, -4.4, 2.2], [-89.5, 19.6, -3.4, 2.0], [-103.6, 20.4, 1.8, 1.4], [-99.1, 19.4, -1.6, 0.9], [-92.8, 16.5, -2.4, 1.3]]);
const cambio2 = campo([[-111, 29, -2.6, 3.0], [-101, 24.5, -1.8, 2.6], [-97, 18.5, 3.2, 2.2], [-89.3, 20.2, -2.2, 1.6], [-104.5, 21.5, 2.4, 1.6], [-99.3, 19.6, 1.4, 1.2], [-92.5, 16.3, 1.6, 1.4]]);
// Diferencia entre mujeres y hombres: en algunas zonas el cambio de las
// mujeres va al revés que el de los hombres.
const brecha1 = campo([[-100, 20.5, 2.4, 1.8], [-108, 26, -1.8, 2.4], [-91, 18, 1.6, 1.8]]);
const brecha2 = campo([[-98.5, 19, -2.2, 1.6], [-106, 24, 2.0, 2.4], [-94, 17, -1.4, 1.6]]);
const municipios = [];
for (const e of ENTIDADES) {
  const n = Math.max(6, Math.round(N_MUN * pesoSup.get(e.cve) / sumaSup));
  const puestos = [];
  for (let k = 0; k < n; k++) {
    let mejor = null, lejos = -1;
    for (let c = 0; c < 14; c++) {
      const q = puntoEn(e.cve);
      const d = puestos.length ? Math.min(...puestos.map((p) => dist(p, q))) : 1;
      if (d > lejos) { lejos = d; mejor = q; }
    }
    puestos.push(mejor);
  }
  for (const [k, p] of puestos.entries()) {
    const base = acotar(nivelBase(p) + 14 + normal(0, 4.5), 1.5, 62);
    const propio1 = normal(0, 1.1), propio2 = normal(0, 1.1);
    // Personas por sexo: pocos municipios grandes y muchos chicos.
    const den0 = Math.min(900000, Math.round(Math.exp(normal(Math.log(13000), 1.05))));
    for (const sexo of ["Mujeres", "Hombres"]) {
      const s = sexo === "Mujeres" ? 1 : -1;
      const p2015 = acotar(base + s * normal(1.2, 1.2), 0.5, 70);
      const p2020 = acotar(p2015 + cambio1(p) + s * brecha1(p) + propio1 + normal(0, 0.6), 0.3, 72);
      const p2025 = acotar(p2020 + cambio2(p) + s * brecha2(p) + propio2 + normal(0, 0.6), 0.3, 74);
      const factor = sexo === "Mujeres" ? 1.04 : 0.96;
      for (const [i, [anio, pct]] of [[2015, p2015], [2020, p2020], [2025, p2025]].entries()) {
        const den = Math.max(400, Math.round(den0 * factor * (1 + 0.045 * i)));
        const num = Math.round(den * pct / 100);
        // Casos sin expandir de la muestra: cada caso representa de 140 a 320 personas.
        const casos = Math.max(1, Math.round(den / entre(140, 320)));
        municipios.push({cve_ent: e.cve, cve_mun: `${e.cve}${String(k + 1).padStart(3, "0")}`, lon: p[0].toFixed(4), lat: p[1].toFixed(4), anio, sexo, num, den, casos});
      }
    }
  }
}
csv("cambio_municipios.csv", ["cve_ent", "cve_mun", "lon", "lat", "anio", "sexo", "num", "den", "casos"], municipios);

// ---- 2. semitonos_celdas.csv: una rejilla de celdas de 0.25 grados sobre el
// país, con las personas de cada grupo de edad que viven en cada celda. La
// población es un fondo rural que varía suave en el territorio más unas 130
// ciudades ficticias (núcleos gaussianos). `area_km2` es la superficie de la
// celda, para que la forma pueda escribir densidades.
const PASO = 0.25;
const celdas = [];
for (let lat = 14.5 + PASO / 2; lat < 32.8; lat += PASO) {
  for (let lon = -117.5 + PASO / 2; lon < -86.5; lon += PASO) {
    const p = [+lon.toFixed(3), +lat.toFixed(3)];
    const cve = entidadDe(p);
    if (!cve) continue;
    celdas.push({p, cve, area: (PASO * 111.32 * Math.cos(lat * Math.PI / 180)) * (PASO * 110.57)});
  }
}
// Ruido suave: valores al azar en una rejilla de 1.5 grados, interpolados.
const GRUESA = 1.5, ruidoG = new Map();
const ruidoEn = (i, j) => { const k = `${i},${j}`; if (!ruidoG.has(k)) ruidoG.set(k, normal(0, 0.85)); return ruidoG.get(k); };
const ruidoSuave = ([lon, lat]) => {
  const x = (lon + 120) / GRUESA, y = (lat - 12) / GRUESA, i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  return (ruidoEn(i, j) * (1 - fx) + ruidoEn(i + 1, j) * fx) * (1 - fy) + (ruidoEn(i, j + 1) * (1 - fx) + ruidoEn(i + 1, j + 1) * fx) * fy;
};
// Ciudades: una capital por entidad cerca de su centro, de 0 a 3 secundarias,
// y unas pocas metrópolis más pesadas.
const METROPOLIS = {"09": 8.8e6, "15": 4.2e6, "14": 4.4e6, "19": 4.6e6, "21": 2.4e6, "02": 2.3e6, "11": 1.6e6, "08": 1.4e6, "31": 1.2e6, "30": 1.1e6};
const ciudades = [];
for (const e of ENTIDADES) {
  const c = contorno.get(e.cve);
  let capital = [c.centro[0] + normal(0, 0.25), c.centro[1] + normal(0, 0.2)];
  if (!dentroDe(capital, e.cve)) capital = puntoEn(e.cve);
  if (e.cve === "15") capital = [-99.55, 19.45];
  ciudades.push({p: capital, peso: METROPOLIS[e.cve] ?? Math.exp(normal(Math.log(6.5e5), 0.45)), cve: e.cve});
  const extra = e.cve === "09" ? 0 : Math.floor(entre(1, 6));
  for (let k = 0; k < extra; k++) ciudades.push({p: puntoEn(e.cve), peso: Math.exp(normal(Math.log(1.2e5), 0.8)), cve: e.cve});
}
const pob = new Float64Array(celdas.length), urbano = new Float64Array(celdas.length);
for (const [i, c] of celdas.entries()) {
  // Fondo rural: más denso en el sur y el centro, ralo en los desiertos del noroeste.
  const sur = acotar((24 - c.p[1]) / 8, 0, 1), desierto = c.p[0] < -106 && c.p[1] > 25 ? 0.35 : c.p[1] > 26.5 ? 0.6 : 1;
  pob[i] = c.area * 7 * (1 + 2.6 * sur) * desierto * Math.exp(ruidoSuave(c.p) + normal(0, 0.28));
}
for (const ciudad of ciudades) {
  const sigma = 0.11 + 0.08 * Math.log10(ciudad.peso / 1e5 + 1);
  const pesos = celdas.map((c) => { const d = dist(c.p, ciudad.p); return d < 4 * sigma ? Math.exp(-(d * d) / (2 * sigma * sigma)) : 0; });
  const suma = pesos.reduce((a, b) => a + b, 0);
  if (!suma) continue;
  for (let i = 0; i < celdas.length; i++) if (pesos[i]) { const v = ciudad.peso * pesos[i] / suma; pob[i] += v; urbano[i] += v; }
}
// Se escala para que el país sume unos 118 millones de personas de 5 años y más.
const escala = 118e6 / pob.reduce((a, b) => a + b, 0);
const crecer = campo([[-110, 28, 0.06, 3], [-87.5, 20.5, 0.09, 1.6], [-99, 20, -0.03, 2], [-93, 16.5, 0.04, 2]]);
const filasCeldas = [];
for (const [i, c] of celdas.entries()) {
  const total = pob[i] * escala, ciudad = urbano[i] / pob[i];
  const ninez = acotar(0.2 + 0.1 * (1 - ciudad) + normal(0, 0.012), 0.12, 0.36);
  const vejez = acotar(0.11 + 0.05 * ciudad + (c.p[1] > 25 ? -0.015 : 0.01) + normal(0, 0.01), 0.06, 0.24);
  const g = [ninez, 1 - ninez - vejez, vejez].map((s) => total * s);
  const r = 1 + 0.05 + crecer(c.p) + normal(0, 0.012);
  const g2025 = [g[0] * r * entre(0.88, 0.96), g[1] * r * 1.03, g[2] * r * entre(1.16, 1.28)];
  for (const [anio, v] of [[2020, g], [2025, g2025]]) {
    filasCeldas.push({cve_ent: c.cve, lon: c.p[0], lat: c.p[1], area_km2: c.area.toFixed(1), anio, p5a17: Math.round(v[0]), p18a59: Math.round(v[1]), p60ymas: Math.round(v[2])});
  }
}
csv("semitonos_celdas.csv", ["cve_ent", "lon", "lat", "area_km2", "anio", "p5a17", "p18a59", "p60ymas"], filasCeldas);

// ---- 3. od_motivo_sexo.csv: cada flujo de od_entidades.csv partido en cuatro
// motivos y dos sexos. Los ocho pedazos suman exactamente el flujo original.
// El reparto por motivo depende sobre todo de la entidad de salida, para que
// cambiar de origen cambie la barra.
const MOTIVOS = ["Motivo A", "Motivo B", "Motivo C", "Otros motivos"];
const odTexto = readFileSync(`${DIR}/od_entidades.csv`, "utf8").trim().split(/\r?\n/);
const cab = odTexto[0].split(",");
const od = odTexto.slice(1).map((l) => Object.fromEntries(l.split(",").map((x, i) => [cab[i], x])));
const EXPULSA_A = {"12": 2.4, "07": 2.0, "20": 1.8, "16": 1.7, "08": 1.6, "28": 1.5, "17": 1.3};
const repartoOrigen = new Map(ENTIDADES.map((e) => [e.cve, [0.3 * (EXPULSA_A[e.cve] ?? 1) * Math.exp(normal(0, 0.25)), 0.3 * Math.exp(normal(0, 0.25)), 0.2 * Math.exp(normal(0, 0.3)), 0.2 * Math.exp(normal(0, 0.2))]]));
const partir = (total, pesos) => {
  const s = pesos.reduce((a, b) => a + b, 0), crudo = pesos.map((w) => total * w / s), base = crudo.map(Math.floor);
  let falta = total - base.reduce((a, b) => a + b, 0);
  for (const i of crudo.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).map(([, i]) => i)) { if (falta-- <= 0) break; base[i]++; }
  return base;
};
const filasOD = [];
for (const r of od) {
  const personas = +r.personas, casos = +r.casos, porCaso = personas / casos;
  const pesos = repartoOrigen.get(r.cve_origen).flatMap((w) => {
    const m = w * Math.exp(normal(0, 0.22)), mujeres = acotar(normal(0.5, 0.045), 0.36, 0.64);
    return [m * mujeres, m * (1 - mujeres)];
  });
  const piezas = partir(personas, pesos);
  for (const [k, motivo] of MOTIVOS.entries()) for (const [s, sexo] of ["Mujeres", "Hombres"].entries()) {
    const v = piezas[2 * k + s];
    if (v > 0) filasOD.push({cve_origen: r.cve_origen, cve_destino: r.cve_destino, motivo, sexo, personas: v, casos: Math.max(1, Math.round(v / porCaso))});
  }
}
csv("od_motivo_sexo.csv", ["cve_origen", "cve_destino", "motivo", "sexo", "personas", "casos"], filasOD);

// ---- 4. silueta_situacion.csv: población de 5 años y más por situación
// entre dos años (dejó de cumplir, empezó a cumplir, cumple en los dos, no
// cumple en ninguno), por región, periodo y sexo.
const SITUACIONES = ["Dejó de cumplir", "Empezó a cumplir", "Cumple en los dos años", "No cumple en ninguno"];
const POBLACION_REGION = {"Norte": 25.8e6, "Centro-Occidente": 25.1e6, "Centro": 38.6e6, "Sur-Sureste": 28.4e6};
const filasSit = [];
for (const region of REGIONES) {
  for (const [i, periodo] of ["2015 a 2020", "2020 a 2025"].entries()) {
    for (const sexo of ["Mujeres", "Hombres"]) {
      const total = Math.round(POBLACION_REGION[region] * (sexo === "Mujeres" ? 0.515 : 0.485) * (1 + 0.04 * i));
      const sur = region === "Sur-Sureste" ? 1 : region === "Centro" ? 0.5 : 0;
      const pesos = [
        entre(0.035, 0.06) * (1 + 0.6 * sur) * (i ? entre(0.8, 1.5) : 1) * (sexo === "Mujeres" ? entre(0.85, 1.2) : 1),
        entre(0.03, 0.065) * (1 + 0.3 * (1 - sur)) * (i ? entre(0.7, 1.3) : 1),
        entre(0.13, 0.22) * (1 + 0.5 * sur),
        0,
      ];
      pesos[3] = 1 - pesos[0] - pesos[1] - pesos[2];
      const piezas = partir(total, pesos);
      for (const [k, situacion] of SITUACIONES.entries()) filasSit.push({region, periodo, sexo, situacion, personas: piezas[k], casos: Math.max(1, Math.round(piezas[k] / entre(700, 1300)))});
    }
  }
}
csv("silueta_situacion.csv", ["region", "periodo", "sexo", "situacion", "personas", "casos"], filasSit);

console.log(`Datos de muestra de territorio generados con la semilla ${SEMILLA}. Entidades: ${POR_CVE.size}.`);
