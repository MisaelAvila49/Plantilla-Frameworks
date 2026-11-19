// src/components/vista-mapa.js
// EL MAPA COMO OPCIÓN DEL FILTRO (R186). Una sección que ya tiene su gráfica
// añade al panel el campo «Ver como» (Gráfica / Mapa por entidad / Mapa por
// municipio) y, en `dibujar`, cuando la vista no es «Gráfica», devuelve la
// figura que arma `mapaIndicador()`. El mapa arranca en «Gráfica» (R89): repite
// lo que dice la gráfica, por lugar. Viene del libro de discapacidad
// (docs/patron-tipos-mapas.md allá), generalizado: no sabe nada del tema.
//
// Lo que el componente hace cumplir:
//   - RANGOS FIJOS Y DESIGUALES por indicador, declarados en `RANGOS`
//     (nunca calculados sobre la vista): el mismo tono dice lo mismo con
//     cualquier filtro. Un subgrupo puede llevar cortes propios.
//   - Unidad del indicador: porcentaje («pct») o pesos («pesos»).
//   - Sin borde entre unidades (`stroke: "none"`) y contorno al pasar el
//     puntero (la copia al frente de `viva`).
//   - Globo de tres renglones (R116): «Oaxaca · Grupo», la cifra y «N de M
//     <universo>» (R117); en la diferencia, puntos sin población (R120).
//     Aviso de poca precisión con menos de 30 casos (R125).
//   - «Sin dato» en gris propio, con casilla en la leyenda (R50, R105), y
//     las unidades con menos de 30 casos con TRAMA (R149) y casilla propia.
//   - La entidad elegida encuadra el mapa de municipios y lleva contorno en
//     el de entidades (R61).
//   - Opción de DIFERENCIA: el grupo elegido menos su referencia, en la
//     rampa divergente con el gris en el cero y el rojo en lo desfavorable
//     (R97, R104). El capítulo que la use declara rojo y azul (R95).
//   - Mapa por MUNICIPIO solo con una fuente representativa a ese nivel (un
//     censo o una encuesta intercensal) y su geojson de municipios; las
//     encuestas por hogares llegan a entidad (R186).
//
// La página enlaza ../formas-gC.css (estilos de .gc-leyendas y .fr-tira de la
// leyenda). Ejemplo vivo: galería de mapas, sección «subgrupo-mapa».

import * as Plot from "npm:@observablehq/plot";
import {html, svg} from "npm:htl";
import {campo} from "./filtros.js";
import {globo} from "./globo.js";
import {P, rampaTema, rampaCambio} from "./paleta.js";
import {entero, puntos, formatear, SIN_DATO} from "./formato.js";
import {MIN_CASOS} from "./agregar.js";
import {ENTIDADES, ISO_A_CVE, proyeccionMx} from "./geografia.js";
import {base, viva, leyendaContinua} from "./formas/comun.js";
import {rebobinar} from "./formas/mapa-plano.js";

export const GRAFICA = "grafica", ENTIDAD = "entidad", MUNICIPIO = "municipio";

// ------------------------------------------------------------- los campos
// `entidad` y `municipio`: true, false o (v) => bool (si hay dato de ese
// nivel para la selección vigente). Municipio: solo con una fuente
// representativa a ese nivel y, por lo común, sin subgrupo (los archivos
// municipales suelen traer la condición y no el subgrupo). Entidad: fuentes
// representativas por entidad. Una fuente solo nacional no lleva el campo.
export function campoVista({id = "vista", rotulo = "Ver como", entidad = true, municipio = false} = {}) {
  const si = (x, v) => (typeof x === "function" ? x(v) : Boolean(x));
  return campo({id, rotulo, inicial: GRAFICA, opciones: (v) => [
    {valor: GRAFICA, texto: "Gráfica"},
    si(entidad, v) ? {valor: ENTIDAD, texto: "Mapa por entidad"} : null,
    si(municipio, v) ? {valor: MUNICIPIO, texto: "Mapa por municipio"} : null,
  ].filter(Boolean)});
}
// «Qué pinta el mapa»: el porcentaje del grupo o la diferencia con su
// referencia. Visible solo en vista de mapa.
export const NIVEL = "nivel", BRECHA = "brecha";
export function campoPinta({id = "pinta", vista = "vista", rotulo = "Qué pinta el mapa", textoBrecha = "Diferencia entre los dos grupos"} = {}) {
  return campo({id, rotulo, inicial: NIVEL,
    opciones: [{valor: NIVEL, texto: "Porcentaje del grupo"}, {valor: BRECHA, texto: textoBrecha}],
    oculto: (v) => !v[vista] || v[vista] === GRAFICA});
}
export const esMapa = (v, vista = "vista") => Boolean(v[vista]) && v[vista] !== GRAFICA;

// ------------------------------------------------------------- los rangos
// Cinco rangos por indicador: cuatro cortes FIJOS Y DESIGUALES, elegidos
// MIDIENDO la distribución de las unidades (entidades y, si hay, municipios)
// en todos los años, grupos y subgrupos, con tres condiciones: el valor
// nacional de cada grupo cae en un rango intermedio, las 32 entidades ocupan
// al menos tres tonos y los extremos reúnen a pocas unidades. La medición va
// en el comentario de cada llave (cuantiles 5, 25, 50, 75 y 95). Un
// indicador nuevo se añade aquí, midiendo; las páginas no registran rangos.
// Cada entrada: `cortes` (cuatro, de menor a mayor), `brecha` (tope de la
// diferencia, en la unidad del indicador), `unidad` ("pct" por omisión, o
// "pesos") y `subgrupos`: cortes propios de un subgrupo que con los
// comunes cae en uno o dos tonos.
//
// Muestra de la Plantilla (src/data/muestra/subgrupos.csv, entidades 2010 y
// 2020, mujeres y hombres juntos):
//   indicador_muestra  con la condición 3.0, 13.0, 42.3 % (cuantiles 5, 50 y
//                      95); sin la condición 18.2 a 67.9 %. Subgrupos A y B
//                      de 1 a 54 %; C con grado alto, mediana 1.0 % y
//                      cuantil 95 de 27 %: con los cortes comunes casi todas
//                      las entidades caían en el primer tono.
//   ingreso_muestra    ejemplo de unidad en pesos (sin datos de muestra).
export const RANGOS = {
  indicador_muestra: {cortes: [5, 10, 20, 35], brecha: 40, subgrupos: {C: [1, 2.5, 5, 15]}},
  ingreso_muestra: {cortes: [4000, 5500, 7000, 9000], unidad: "pesos"},
};
// Configuración vigente de un indicador: sus cortes, o los de su subgrupo si
// el mapa pinta un subgrupo con cortes propios. `unidad`: "pct" o "pesos".
export function rangosDe(indicador, subgrupo = null) {
  const cfg = RANGOS[indicador];
  if (!cfg) throw new Error(`«${indicador}» no tiene rangos en RANGOS (vista-mapa.js). Se declaran midiendo, no se calculan.`);
  const propios = Boolean(subgrupo && cfg.subgrupos?.[subgrupo]);
  return {...cfg, unidad: cfg.unidad ?? "pct", cortes: propios ? cfg.subgrupos[subgrupo] : cfg.cortes, propiosDelSubgrupo: propios};
}
const num = (x) => x.toLocaleString("es-MX", {maximumFractionDigits: 1});
const conUnidad = (x, unidad) => (unidad === "pesos" ? `$${num(x)}` : `${num(x)} %`);
export function rangos(cortes, unidad = "pct") {
  const c = cortes, u = (x) => conUnidad(x, unidad), solo = (x) => (unidad === "pesos" ? u(x) : num(x));
  return [{min: -Infinity, max: c[0], texto: `Menos de ${u(c[0])}`},
    ...c.slice(0, -1).map((a, i) => ({min: a, max: c[i + 1], texto: `${solo(a)} a ${u(c[i + 1])}`})),
    {min: c.at(-1), max: Infinity, texto: `${u(c.at(-1))} o más`}];
}
export const rangoDe = (R, x) => (x == null || Number.isNaN(+x) ? -1 : R.findIndex((r) => x >= r.min && x < r.max));

// ------------------------------------------------------------- las claves
const CVE_POR_NOMBRE = new Map(ENTIDADES.map((e) => [e.nombre, e.cve]));
CVE_POR_NOMBRE.set("México", "15");
CVE_POR_NOMBRE.set("Coahuila de Zaragoza", "05");
CVE_POR_NOMBRE.set("Michoacán de Ocampo", "16");
CVE_POR_NOMBRE.set("Veracruz de Ignacio de la Llave", "30");
export const cveEntidad = (nombre) => CVE_POR_NOMBRE.get(nombre) ?? null;
const claveEnt = (f) => f.properties.cve_ent ?? ISO_A_CVE.get(f.properties.id);
// Celdas agregadas por entidad (con `entidad` en nombre) a un Map por clave.
export const porClaveEntidad = (filas) => new Map(filas.map((d) => [cveEntidad(d.entidad), d]).filter(([k]) => k));
// Filas municipales del Parquet (num, den, casos, ee en proporción) a un Map
// por cvegeo, con el porcentaje y el error en 0-100.
export const porMunicipio = (filas) => new Map(filas.map((r) => [r.cvegeo, {...r, pct: r.den > 0 ? (100 * r.num) / r.den : null, ee: r.ee == null || r.ee === "" ? null : 100 * Number(r.ee), fragil: r.casos < MIN_CASOS}]));

// ------------------------------------------------------------------ el mapa
let serieTrama = 0;
const sinDatoCasilla = () => html`<span class="leyenda-item leyenda-sin-dato"><svg width="14" height="12" aria-hidden="true"><rect x="1" y="0" width="12" height="12" rx="2" fill=${P.sinDato} stroke=${P.bordeFuerte} stroke-width="0.8" /></svg><span>${SIN_DATO}</span></span>`;
// Trama de las unidades con pocos casos: dos líneas paralelas, una en tinta
// y otra en el fondo, para que se vea sobre cualquier tono de la rampa.
const tramaDefs = (id) => svg`<pattern id=${id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <line x1="0" y1="0" x2="0" y2="5" stroke=${P.tinta} stroke-width="1" stroke-opacity="0.65" />
  <line x1="2" y1="0" x2="2" y2="5" stroke=${P.fondo} stroke-width="1" stroke-opacity="0.8" /></pattern>`;
const tramaCasilla = (id) => html`<span class="leyenda-item"><svg width="14" height="12" aria-hidden="true"><defs>${tramaDefs(id + "-l")}</defs><rect x="1" y="0" width="12" height="12" rx="2" fill=${P.apagado} /><rect x="1" y="0" width="12" height="12" rx="2" fill=${`url(#${id}-l)`} /></svg><span>Menos de 30 casos en la muestra</span></span>`;

// mapaIndicador({...}) arma el cuerpo de la figura de mapa. Parámetros:
//   nivel       ENTIDAD o MUNICIPIO
//   geoEnt      geojson de entidades (bordes_entidad o entidades)
//   geoMun      geojson de municipios (solo para MUNICIPIO)
//   valores     Map clave → celda {pct, num, den, casos, ee}; clave de dos
//               dígitos (entidad) o cvegeo (municipio). `porClaveEntidad` y
//               `porMunicipio` lo arman.
//   referencia  Map igual al anterior con la celda de referencia (brecha)
//   pinta       NIVEL o BRECHA
//   indicador   llave de RANGOS
//   subgrupo    subgrupo pintado, o null: si RANGOS trae cortes propios de
//               ese subgrupo, mandan sobre los generales
//   grupo       rótulo del grupo pintado («Con la condición»)
//   referenciaTexto  rótulo de la referencia («Sin la condición»)
//   unidad      universo del globo (R117): «personas con la condición»
//   entidad     clave de dos dígitos de la entidad elegida, o null
//   nombres     Map cvegeo → nombre de municipio (por omisión, del geojson)
// Devuelve {cuerpo, unidades, conDato, fragiles, sinDato, cuenta, R,
// descripcion, filasTabla}.
export function mapaIndicador({nivel, geoEnt, geoMun = null, valores, referencia = null, pinta = NIVEL, indicador, ancho,
  grupo = "Con la condición", referenciaTexto = "Sin la condición", unidad = "personas con la condición", entidad = null, nombres = null, sentido = "baja", subgrupo = null}) {
  const cfg = rangosDe(indicador, subgrupo);
  const pesos = cfg.unidad === "pesos";
  const brecha = pinta === BRECHA;
  if (brecha && (!cfg.brecha || !referencia)) throw new Error(`mapaIndicador(): «${indicador}» no admite brecha (falta el tope o la referencia).`);
  const ents = rebobinar(geoEnt);
  const esMun = nivel === MUNICIPIO;
  const muns = esMun ? rebobinar(geoMun) : null;
  const nomEnt = new Map(ENTIDADES.map((e) => [e.cve, e.nombre]));
  const nomMun = nombres ?? (muns ? new Map(muns.features.map((f) => [f.properties.cvegeo, f.properties.nombre])) : new Map());
  const feats = esMun ? muns.features.filter((f) => !entidad || f.properties.cvegeo.startsWith(entidad)) : ents.features;
  const R = rangos(cfg.cortes, cfg.unidad), n = R.length;
  const rampa = rampaTema([0, 1]);
  const tonoK = (k) => rampa.interpolar(0.12 + (0.88 * k) / (n - 1));
  const div = brecha ? rampaCambio(cfg.brecha, {desfavorable: sentido}) : null;

  const unidades = feats.map((f) => {
    const k = esMun ? f.properties.cvegeo : claveEnt(f);
    const d = valores.get(k);
    const o = referencia?.get(k);
    const nombre = esMun ? `${nomMun.get(k) ?? k}, ${nomEnt.get(k.slice(0, 2)) ?? ""}` : nomEnt.get(k) ?? k;
    const fragil = Boolean(d) && (d.casos < MIN_CASOS || (brecha && o != null && o.casos < MIN_CASOS));
    const valor = !d || d.pct == null ? null : brecha ? (o?.pct == null ? null : d.pct - o.pct) : d.pct;
    return {f, k, d: {...(d ?? {}), _nombre: nombre, _valor: valor, _ref: o?.pct ?? null, _refCasos: o?.casos ?? null, _sinDato: valor == null, _fragil: fragil}};
  });
  const color = (u) => (u.d._sinDato ? P.sinDato : brecha ? div(u.d._valor) : tonoK(rangoDe(R, u.d._valor)));
  const fragiles = unidades.filter((u) => !u.d._sinDato && u.d._fragil);
  const idTrama = `trama-mapa-${++serieTrama}`;
  const bordes = esMun ? ents.features.filter((f) => !entidad || claveEnt(f) === entidad) : ents.features;
  const destacado = !esMun && entidad ? ents.features.find((f) => claveEnt(f) === entidad) : null;

  const g = globo({
    marca: (d) => d._nombre, grupo: () => (brecha ? `${grupo} menos ${referenciaTexto.toLowerCase()}` : grupo),
    color: (d) => (!brecha ? P.tonoTexto : d._valor == null || d._valor === 0 ? P.gris : (d._valor < 0) === (sentido === "baja") ? P.rojo : P.azul),
    valor: (d) => d._valor, formato: pesos ? (brecha ? (x) => `${x > 0 ? "+" : x < 0 ? "−" : ""}${formatear(Math.abs(x), "pesos")}` : "pesos") : brecha ? "puntos" : "pct",
    // En pesos, num es masa de dinero: el globo no lleva población.
    personas: brecha || pesos ? null : (d) => d.num, universo: pesos ? null : (d) => d.den, unidad,
    precision: (d) => ({valor: brecha ? d._valor : d.pct, ee: brecha ? null : d.ee, casos: d._fragil ? 0 : d.casos}),
  });
  const w = Math.min(ancho, 980);
  const H = Math.round(Math.max(300, Math.min(640, w * 0.64)));
  const mapa = Plot.plot(base({
    ancho: w, alto: H, margin: 6,
    projection: proyeccionMx({type: "FeatureCollection", features: feats}),
    marks: [
      () => svg`<defs>${tramaDefs(idTrama)}</defs>`,
      // Sin borde entre unidades: un borde claro se ve gris por antialiasing.
      Plot.geo(unidades, {geometry: (u) => u.f.geometry, fill: color, stroke: "none", ...viva(unidades.map((u) => u.d), g, {subir: true})}),
      fragiles.length ? Plot.geo(fragiles, {geometry: (u) => u.f.geometry, fill: `url(#${idTrama})`, stroke: "none", pointerEvents: "none"}) : null,
      // División entre municipios: línea fina de TINTA semitransparente encima
      // de los rellenos (no blanca, que el antialiasing vuelve gris). Sin ella
      // dos municipios del mismo rango se leían como uno solo (noviembre 2026).
      esMun ? Plot.geo(unidades, {geometry: (u) => u.f.geometry, fill: "none", stroke: P.tinta, strokeOpacity: 0.3, strokeWidth: 0.5, pointerEvents: "none"}) : null,
      Plot.geo(bordes, {geometry: (f) => f.geometry, fill: "none", stroke: P.bordeFuerte, strokeWidth: esMun ? 0.7 : 0.6, pointerEvents: "none"}),
      destacado ? Plot.geo([destacado], {geometry: (f) => f.geometry, fill: "none", stroke: P.tinta, strokeWidth: 2, pointerEvents: "none"}) : null,
    ],
  }));
  const conDato = unidades.filter((u) => !u.d._sinDato);
  const sinDato = unidades.length - conDato.length;
  const cuenta = R.map((r, k) => conDato.filter((u) => rangoDe(R, u.d._valor) === k).length);
  const nombreUnidad = esMun ? "municipios" : "entidades";
  const lim = cfg.brecha;
  const enUnidad = pesos ? "pesos al mes" : brecha ? "puntos" : "porcentaje";
  const descripcion = brecha
    ? `Diferencia en ${enUnidad}, ${grupo.toLowerCase()} menos ${referenciaTexto.toLowerCase()}`
    : `${grupo}, ${enUnidad}`;
  mapa.setAttribute("role", "img");
  mapa.setAttribute("aria-label", brecha
    ? `Mapa de ${nombreUnidad}. ${descripcion}. ${conDato.filter((u) => u.d._valor < 0).length} ${nombreUnidad} con diferencia negativa y ${conDato.filter((u) => u.d._valor > 0).length} con diferencia positiva.`
    : `Mapa de ${nombreUnidad}. ${descripcion}. ${R.map((r, k) => `${r.texto}: ${cuenta[k]} ${nombreUnidad}`).join(". ")}.`);
  const tira = brecha
    ? leyendaContinua(div, {titulo: `Diferencia en ${pesos ? "pesos" : "puntos"} (los extremos incluyen ${pesos ? formatear(lim, "pesos") : lim} o más)`, marcas: [-lim, -lim / 2, 0, lim / 2, lim], sinDato: false,
      formato: (x) => (x === 0 ? "0" : `${x > 0 ? "+" : "−"}${pesos ? formatear(Math.abs(x), "pesos") : Math.abs(x)}`), ancho: Math.min(300, ancho - 40)})
    : html`<div class="fr-tira" role="img" aria-label=${`Rangos, de menor a mayor: ${R.map((r) => r.texto).join(", ")}`}>${R.map((r, k) => html`<span class="fr-paso"><i style=${`background:${tonoK(k)}`}></i><span>${r.texto}</span></span>`)}</div>`;
  const leyenda = html`<div class="gc-leyendas">${tira}${sinDato ? sinDatoCasilla() : ""}${fragiles.length ? tramaCasilla(idTrama) : ""}</div>`;
  const filasTabla = conDato.map((u) => ({...u.d, rango: brecha ? null : R[rangoDe(R, u.d._valor)]?.texto})).sort((a, b) => b._valor - a._valor);
  return {cuerpo: html`<div class="forma forma-mapa">${leyenda}${mapa}</div>`, unidades, conDato, fragiles, sinDato, cuenta, R, descripcion, filasTabla, unidad: cfg.unidad, propiosDelSubgrupo: cfg.propiosDelSubgrupo};
}

// Columnas de la tabla de respaldo de un mapa (R47): lo que el globo no dice.
// `unidad`: "pct" o "pesos" (la de RANGOS, que `mapaIndicador` devuelve en
// `r.unidad`). En pesos no van las columnas de población: num es dinero.
export function columnasMapa({nivel, pinta = NIVEL, referenciaTexto = "Sin la condición", unidad = "pct", margen = (x) => (x == null ? SIN_DATO : `± ${(1.96 * x).toLocaleString("es-MX", {maximumFractionDigits: 2})}`)}) {
  const brecha = pinta === BRECHA, pesos = unidad === "pesos";
  const nombre = pesos ? "Pesos al mes" : "Porcentaje", f = pesos ? "pesos" : "pct";
  return [
    {titulo: nivel === MUNICIPIO ? "Municipio" : "Entidad", valor: (d) => d._nombre, texto: true},
    brecha ? {titulo: `Diferencia en ${pesos ? "pesos" : "puntos"}`, valor: (d) => d._valor, formato: pesos ? "pesos" : (x) => puntos(x)} : {titulo: nombre, valor: (d) => d.pct, formato: f},
    brecha ? {titulo: `${nombre}, grupo`, valor: (d) => d.pct, formato: f} : {titulo: "Rango", valor: (d) => d.rango, texto: true},
    {titulo: `${nombre}, ${referenciaTexto.toLowerCase()}`, valor: (d) => d._ref, formato: f},
    {titulo: "Margen de error (95 %)", valor: (d) => d.ee, formato: margen},
    pesos ? null : {titulo: "Población que cumple", valor: (d) => d.num, formato: "conteo"},
    {titulo: pesos ? "Población del grupo" : "Población total", valor: (d) => d.den, formato: "conteo"},
    {titulo: "Casos en la muestra", valor: (d) => d.casos, formato: (x, d) => `${entero(x)}${d._fragil ? " *" : ""}`},
  ].filter(Boolean);
}
// Notas del mapa (R45): solo las que aplican. La nota de la fuente (por
// ejemplo, que la cifra municipal de un año sale de una muestra) la añade la
// página.
export function notasMapa(r, {nivel, anio = null}) {
  const esMun = nivel === MUNICIPIO;
  return [
    r.sinDato ? `${entero(r.sinDato)} ${esMun ? (r.sinDato === 1 ? "municipio no tiene" : "municipios no tienen") : (r.sinDato === 1 ? "entidad no tiene" : "entidades no tienen")} dato${anio ? ` en ${anio}` : ""}.` : null,
    r.fragiles.length ? `${entero(r.fragiles.length)} ${r.fragiles.length === 1 ? (esMun ? "municipio tiene" : "entidad tiene") : (esMun ? "municipios tienen" : "entidades tienen")} menos de 30 casos en la muestra y ${r.fragiles.length === 1 ? "va" : "van"} con trama. La cifra es poco precisa.` : null,
  ];
}
