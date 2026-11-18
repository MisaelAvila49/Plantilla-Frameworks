// scripts/muestra_mapa.mjs
// Genera los DATOS DE MUESTRA del mapa de flujos a pantalla completa
// (src/mapa.md, src/components/mapa-flujos.js) en src/data/muestra/.
//
// Son valores SINTÉTICOS: no salen de ninguna fuente y no describen a ninguna
// población real. Imitan la FORMA de los datos que tendrá el libro de
// migración por violencia (Censo 2020 con residencia en 2015 y Encuesta
// Intercensal 2025 con residencia en 2020, causa principal declarada por un
// adulto del hogar) para que la página se pueda diseñar y verificar. Toda la
// página lleva el rótulo «Datos de muestra».
//
//   flujos_grupos.csv     personas que cambiaron de entidad, por par
//                         origen-destino, periodo, causa, grupo de población,
//                         edad y sexo; con los casos sin expandir.
//   poblacion_grupos.csv  población residente y población que NO cambió de
//                         entidad, por entidad, grupo, edad y sexo (para
//                         «Comparar con: quienes no cambiaron de entidad»).
//
// Coherencia que el cliente da por hecha (y que este script garantiza):
//   - causa (violencia / otras), edad (5-17 / 18+) y sexo (m / h) PARTEN el
//     total sin traslape: «Todas las causas», «Todas las edades» y «Mujeres y
//     hombres» se obtienen SUMANDO esas filas en el cliente;
//   - los grupos (hli, indigena, afro, discapacidad, otro_pais) son
//     SUBCONJUNTOS del total de su misma celda y se traslapan entre sí: una
//     persona puede hablar una lengua indígena y además considerarse indígena.
//     Nunca se suman grupos entre sí;
//   - cada fila de grupo tiene personas y casos menores o iguales que la fila
//     `total` de su celda; una celda sin casos en la muestra no se escribe.
//
// La semilla es fija: correr el script dos veces da exactamente los mismos
// archivos.   Uso:  node scripts/muestra_mapa.mjs

import {readFileSync, writeFileSync, mkdirSync} from "node:fs";
import {ENTIDADES, ISO_A_CVE} from "../src/components/geografia.js";

const SEMILLA = 20261117;
const DIR = "src/data/muestra";
mkdirSync(DIR, {recursive: true});

// ------------------------------------------------------------- azar
let estado = SEMILLA >>> 0;
const azar = () => {
  estado = (estado + 0x6d2b79f5) >>> 0;
  let t = estado;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const normal = (media = 0, desv = 1) => media + desv * Math.sqrt(-2 * Math.log(1 - azar())) * Math.cos(2 * Math.PI * azar());
const logNormal = (desv) => Math.exp(normal(0, desv));
// Poisson (Knuth para medias chicas, normal para grandes).
function poisson(media) {
  if (media <= 0) return 0;
  if (media > 60) return Math.max(0, Math.round(normal(media, Math.sqrt(media))));
  const L = Math.exp(-media);
  let k = 0, p = 1;
  do { k++; p *= azar(); } while (p > L);
  return k - 1;
}
// Binomial: suma de Bernoulli para n chico, normal para n grande.
function binomial(n, p) {
  p = Math.max(0, Math.min(1, p));
  if (n <= 0 || p === 0) return 0;
  if (n > 80) return Math.max(0, Math.min(n, Math.round(normal(n * p, Math.sqrt(n * p * (1 - p))))));
  let k = 0;
  for (let i = 0; i < n; i++) if (azar() < p) k++;
  return k;
}
const csv = (nombre, columnas, filas) => {
  const texto = [columnas.join(","), ...filas.map((f) => columnas.map((c) => String(f[c] ?? "")).join(","))].join("\n") + "\n";
  writeFileSync(`${DIR}/${nombre}`, texto);
  console.log(`${nombre}: ${filas.length} filas (${(texto.length / 1024).toFixed(0)} KB)`);
};

// --------------------------------------------------- centros de las entidades
// Centroide del anillo exterior más grande, en grados, y distancia en km.
const geo = JSON.parse(readFileSync(`${DIR}/entidades.geojson`, "utf8"));
const CENTRO = new Map();
for (const f of geo.features) {
  const anillos = f.geometry.type === "Polygon" ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map((p) => p[0]);
  let mejor = null, area = 0;
  for (const r of anillos) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) {
      const [x0, y0] = r[i], [x1, y1] = r[i + 1], k = x0 * y1 - x1 * y0;
      a += k; cx += (x0 + x1) * k; cy += (y0 + y1) * k;
    }
    if (Math.abs(a) > area) { area = Math.abs(a); mejor = [cx / (3 * a), cy / (3 * a)]; }
  }
  CENTRO.set(ISO_A_CVE.get(f.properties.id), mejor);
}
const rad = (g) => (g * Math.PI) / 180;
function km(a, b) {
  const [l1, f1] = CENTRO.get(a), [l2, f2] = CENTRO.get(b);
  const h = Math.sin(rad(f2 - f1) / 2) ** 2 + Math.cos(rad(f1)) * Math.cos(rad(f2)) * Math.sin(rad(l2 - l1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// ------------------------------------------------------------- parámetros
// Pesos de salida y de llegada por entidad (clave de dos dígitos). Por
// violencia: más salidas del sur y del centro-occidente, llegadas al centro y
// al norte. Por otras causas (trabajo, familia, estudios): pesa el tamaño de
// la entidad y los polos de empleo.
const W = (o, resto = 1) => Object.fromEntries(ENTIDADES.map((e) => [e.cve, o[e.cve] ?? resto]));
const SALE_VIOLENCIA = W({"12": 10, "16": 8, "07": 6, "20": 5, "30": 6, "28": 6, "32": 5, "25": 4, "08": 5, "11": 4, "17": 3, "14": 3, "15": 4, "09": 3, "26": 3, "02": 2, "10": 2, "19": 1.5, "24": 1.5, "18": 1.5, "06": 2, "21": 1.5, "27": 1.5, "05": 1, "13": 1, "04": 0.5, "23": 1, "31": 0.3, "03": 0.5, "01": 0.4, "22": 0.5, "29": 0.4});
const LLEGA_VIOLENCIA = W({"15": 8, "09": 5, "22": 6, "02": 5, "19": 5, "14": 5, "21": 4, "23": 4, "17": 3, "13": 3, "31": 3, "01": 2.5, "03": 2.5, "11": 2.5, "26": 2, "05": 2.5, "08": 1.5, "30": 2, "24": 2, "20": 1.5, "12": 1, "07": 1, "16": 1.5, "25": 1.5, "28": 1.2, "29": 1.5, "32": 0.8, "27": 1, "04": 1, "06": 1, "10": 1, "18": 1});
const SALE_OTRAS = W({"15": 10, "09": 10, "30": 6, "07": 3, "12": 3, "20": 3, "21": 4, "14": 4, "11": 3, "16": 3, "27": 2, "19": 2.5, "02": 2, "28": 2, "08": 2, "26": 1.5, "25": 1.5});
const LLEGA_OTRAS = W({"15": 9, "23": 6, "19": 6, "02": 5, "22": 5, "09": 5, "14": 4, "03": 3, "05": 3, "31": 3, "21": 3, "11": 3, "01": 2, "13": 3, "17": 2, "26": 2, "08": 2, "28": 2, "30": 2});
// Cambios del segundo periodo en las salidas por violencia.
const AJUSTE_2025 = {"11": 1.8, "32": 1.4, "07": 1.5, "26": 1.4, "16": 1.2, "28": 0.7, "08": 0.9};

const PERIODOS = [
  // factor: personas que representa cada caso de la muestra (más chico en la
  // Encuesta Intercensal, que tiene muestra más grande).
  {id: "2015-2020", factor: 18, violencia: 255000, otras: 2350000, ajuste: {}},
  {id: "2020-2025", factor: 13, violencia: 300000, otras: 2500000, ajuste: AJUSTE_2025},
];
const PARES_POR_PERIODO = 320;

// Población residente de 5 años y más por entidad (orden de magnitud real de
// 2020, redondeado) y su crecimiento al segundo periodo.
const POBLACION = W({"01": 1310000, "02": 3480000, "03": 735000, "04": 860000, "05": 2880000, "06": 680000, "07": 5070000, "08": 3460000, "09": 8640000, "10": 1690000, "11": 5640000, "12": 3260000, "13": 2850000, "14": 7790000, "15": 15790000, "16": 4420000, "17": 1830000, "18": 1150000, "19": 5450000, "20": 3820000, "21": 6110000, "22": 2200000, "23": 1720000, "24": 2620000, "25": 2800000, "26": 2730000, "27": 2230000, "28": 3270000, "29": 1250000, "30": 7490000, "31": 2160000, "32": 1510000});

// Parte de la población residente en cada grupo (orden de magnitud real).
const HLI = W({"20": 0.31, "07": 0.28, "31": 0.24, "12": 0.15, "13": 0.12, "23": 0.11, "04": 0.09, "21": 0.09, "24": 0.09, "30": 0.08, "18": 0.05, "16": 0.03, "08": 0.03, "15": 0.03, "27": 0.03, "10": 0.02, "26": 0.02, "17": 0.02, "29": 0.02, "03": 0.02, "09": 0.015, "02": 0.015, "22": 0.015, "25": 0.01, "14": 0.007}, 0.004);
const INDIGENA = W({"20": 0.69, "31": 0.65, "04": 0.47, "23": 0.45, "13": 0.36, "07": 0.36, "12": 0.33, "21": 0.35, "16": 0.28, "30": 0.29, "24": 0.23, "27": 0.30, "17": 0.30, "29": 0.23, "18": 0.14, "15": 0.17, "09": 0.11, "03": 0.12, "26": 0.16, "08": 0.11, "02": 0.10, "22": 0.12, "10": 0.10, "25": 0.09, "14": 0.10, "11": 0.08}, 0.07);
const AFRO = W({"12": 0.086, "20": 0.047, "03": 0.033, "30": 0.029, "15": 0.029, "09": 0.026, "23": 0.021, "19": 0.019, "06": 0.018, "28": 0.016}, 0.011);
const OTRO_PAIS = W({"02": 2.2, "26": 1.8, "08": 1.8, "28": 1.6, "16": 1.6, "32": 1.7, "14": 1.4, "11": 1.3, "20": 1.3, "07": 2.5, "23": 1.6, "03": 1.5}, 1);

const GRUPOS = ["hli", "indigena", "afro", "discapacidad", "otro_pais"];
const EDADES = ["5-17", "18+"];
const SEXOS = ["m", "h"];

// Parte de cada grupo entre quienes se mueven de `o` a `d`. Por violencia
// los pueblos indígenas y afrodescendientes salen más que su peso en la
// población (supuesto de la muestra, no un hallazgo).
function parteGrupo(g, o, d, causa, edad) {
  const v = causa === "violencia", ninos = edad === "5-17";
  if (g === "hli") return Math.min(0.8, (0.85 * HLI[o] + 0.15 * HLI[d]) * (v ? 1.4 : 0.8) * (ninos ? 0.8 : 1));
  if (g === "indigena") return Math.min(0.85, Math.max(parteGrupo("hli", o, d, causa, edad) * 1.15, (0.8 * INDIGENA[o] + 0.2 * INDIGENA[d]) * (v ? 1.25 : 0.9) * (ninos ? 0.95 : 1)));
  if (g === "afro") return Math.min(0.3, (0.8 * AFRO[o] + 0.2 * AFRO[d]) * (v ? 1.3 : 0.95) * (ninos ? 0.9 : 1));
  if (g === "discapacidad") return (ninos ? 0.028 : 0.065) * (v ? 1.15 : 0.95);
  return (ninos ? 0.03 : 0.006) * OTRO_PAIS[o] * (v ? 1.1 : 1);
}
// Parte de 5 a 17 años y de mujeres entre quienes se mueven.
const parteNinos = (o, causa) => (causa === "violencia" ? (["12", "16", "32", "28"].includes(o) ? 0.30 : 0.26) : 0.2);
const parteMujeres = (causa, edad) => (causa === "violencia" ? (edad === "5-17" ? 0.49 : 0.52) : 0.5);

// ------------------------------------------------------------- flujos
const flujos = [];
const maximos = {};
for (const per of PERIODOS) {
  const pares = [];
  for (const o of ENTIDADES.map((e) => e.cve)) for (const d of ENTIDADES.map((e) => e.cve)) {
    if (o === d) continue;
    const friccion = 1 / (1 + (km(o, d) / 420) ** 1.35);
    const gv = SALE_VIOLENCIA[o] * (per.ajuste[o] ?? 1) * LLEGA_VIOLENCIA[d] * friccion * logNormal(0.45);
    const go = SALE_OTRAS[o] * LLEGA_OTRAS[d] * Math.sqrt(POBLACION[o] / 3e6) * friccion * logNormal(0.4);
    pares.push({o, d, gv, go});
  }
  const sv = pares.reduce((a, p) => a + p.gv, 0), so = pares.reduce((a, p) => a + p.go, 0);
  for (const p of pares) p.puntaje = p.gv / sv + 0.6 * p.go / so;
  const elegidos = pares.sort((a, b) => b.puntaje - a.puntaje).slice(0, PARES_POR_PERIODO);
  const tv = elegidos.reduce((a, p) => a + p.gv, 0), to = elegidos.reduce((a, p) => a + p.go, 0);
  for (const causa of ["violencia", "otras"]) {
    for (const {o, d, gv, go} of elegidos) {
      const personasPar = per[causa] * (causa === "violencia" ? gv / tv : go / to);
      const casosPar = poisson(personasPar / per.factor);
      if (!casosPar) continue;
      // Reparto multinomial de los casos en las cuatro celdas de edad y sexo.
      const pn = parteNinos(o, causa);
      const celdas = [];
      let resto = casosPar, pResto = 1;
      for (const edad of EDADES) for (const sexo of SEXOS) {
        const p = (edad === "5-17" ? pn : 1 - pn) * (sexo === "m" ? parteMujeres(causa, edad) : 1 - parteMujeres(causa, edad));
        const ultimo = edad === "18+" && sexo === "h";
        const c = ultimo ? resto : binomial(resto, p / pResto);
        resto -= c; pResto -= p;
        celdas.push({edad, sexo, casos: c});
      }
      for (const {edad, sexo, casos} of celdas) {
        if (!casos) continue;
        const personas = Math.round(casos * per.factor * logNormal(0.08));
        const base = {periodo: per.id, causa, edad, sexo, origen: o, destino: d};
        flujos.push({...base, grupo: "total", personas, casos});
        for (const g of GRUPOS) {
          const cg = binomial(casos, parteGrupo(g, o, d, causa, edad));
          if (!cg) continue;
          const pg = Math.min(personas, Math.round(personas * (cg / casos) * logNormal(0.06)));
          flujos.push({...base, grupo: g, personas: pg, casos: cg});
        }
      }
    }
  }
  // Flujo mayor de cada causa con todas las edades y ambos sexos (para fijar
  // el ancho máximo de las flechas en mapa-flujos.js).
  for (const causa of ["violencia", "otras", "todas"]) {
    const porPar = new Map();
    for (const f of flujos) if (f.periodo === per.id && f.grupo === "total" && (causa === "todas" || f.causa === causa)) porPar.set(f.origen + f.destino, (porPar.get(f.origen + f.destino) ?? 0) + f.personas);
    maximos[`${per.id} ${causa}`] = Math.max(...porPar.values());
  }
}
csv("flujos_grupos.csv", ["periodo", "causa", "grupo", "edad", "sexo", "origen", "destino", "personas", "casos"], flujos);

// ------------------------------------------------------------- población
// Población residente y la que no cambió de entidad en el periodo, por
// entidad, grupo, edad y sexo. La parte que no cambió es la población menos
// quienes llegaron en el periodo (aproximado con una tasa por entidad).
const poblacion = [];
for (const per of PERIODOS) {
  const crece = per.id === "2015-2020" ? 1 : 1.045;
  for (const e of ENTIDADES) {
    const llegada = 0.022 + 0.03 * (LLEGA_OTRAS[e.cve] / 9) + (azar() - 0.5) * 0.006;
    for (const edad of EDADES) for (const sexo of SEXOS) {
      const pobCelda = POBLACION[e.cve] * crece * (edad === "5-17" ? 0.255 : 0.745) * (sexo === "m" ? 0.512 : 0.488) * logNormal(0.01);
      const filaDe = (grupo, parte) => {
        const pob = Math.round(pobCelda * parte);
        return {periodo: per.id, entidad: e.cve, grupo, edad, sexo, poblacion: pob, no_migrante: Math.round(pob * (1 - llegada * (grupo === "total" ? 1 : 0.85)))};
      };
      poblacion.push(filaDe("total", 1));
      const ninos = edad === "5-17";
      poblacion.push(filaDe("hli", HLI[e.cve] * (ninos ? 0.8 : 1.05)));
      poblacion.push(filaDe("indigena", INDIGENA[e.cve] * (ninos ? 0.95 : 1.02)));
      poblacion.push(filaDe("afro", AFRO[e.cve] * (ninos ? 0.9 : 1.03)));
      poblacion.push(filaDe("discapacidad", ninos ? 0.026 : 0.061));
      poblacion.push(filaDe("otro_pais", (ninos ? 0.021 : 0.0055) * OTRO_PAIS[e.cve]));
    }
  }
}
csv("poblacion_grupos.csv", ["periodo", "entidad", "grupo", "edad", "sexo", "poblacion", "no_migrante"], poblacion);

// ------------------------------------------------------------- resumen
const suma = (fn) => flujos.filter(fn).reduce((a, f) => a + f.personas, 0);
for (const per of PERIODOS) {
  const v = suma((f) => f.periodo === per.id && f.grupo === "total" && f.causa === "violencia");
  const v517 = suma((f) => f.periodo === per.id && f.grupo === "total" && f.causa === "violencia" && f.edad === "5-17");
  const pares = new Set(flujos.filter((f) => f.periodo === per.id).map((f) => f.origen + f.destino)).size;
  console.log(`${per.id}: ${pares} pares · por violencia ${v.toLocaleString("es-MX")} personas, de 5 a 17 años ${v517.toLocaleString("es-MX")}`);
}
console.log("Flujo mayor (todas las edades, ambos sexos):", Object.entries(maximos).map(([k, x]) => `${k}: ${x.toLocaleString("es-MX")}`).join(" · "));
// Comprobación de coherencia: ningún grupo mayor que el total de su celda.
const totales = new Map(flujos.filter((f) => f.grupo === "total").map((f) => [`${f.periodo}|${f.causa}|${f.edad}|${f.sexo}|${f.origen}|${f.destino}`, f]));
const malos = flujos.filter((f) => f.grupo !== "total" && (() => { const t = totales.get(`${f.periodo}|${f.causa}|${f.edad}|${f.sexo}|${f.origen}|${f.destino}`); return !t || f.personas > t.personas || f.casos > t.casos; })());
if (malos.length) { console.error(`ERROR: ${malos.length} filas de grupo superan el total de su celda.`); process.exit(1); }
console.log(`Datos de muestra del mapa generados con la semilla ${SEMILLA}. Ningún grupo supera el total de su celda.`);
