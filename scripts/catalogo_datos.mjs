// scripts/catalogo_datos.mjs
// Datos de la página «Catálogo de formas» (/catalogo).
//
// Lee las fichas de catalogo/fichas/{base,plantilla,rescatadas}.js en un
// contexto `vm` de Node (las recetas NO se ejecutan: solo se definen), les une
// su ubicación de catalogo/ubicacion.csv y escribe:
//
//   src/data/catalogo.json        metadatos de cada ficha, sin funciones, con
//                                 su destino en la galería y su miniatura
//   src/catalogo/miniaturas.js    un FileAttachment por miniatura que existe,
//                                 para que Framework las copie a dist/ con
//                                 hash (las rutas dinámicas no se copian)
//
// Aborta (código 1) si una ficha no tiene ubicación, si un id se repite en
// las fichas o en el CSV, si una fila del CSV no tiene ficha, si un código de
// clasificación no existe o si una forma marcada «implementada» no tiene su
// ancla <h2 id="…" class="toc-anchor"> en el .md de su página.
//
// Una forma está «En la galería» cuando el CSV dice «implementada» Y su ancla
// existe en el .md. Si el ancla existe pero el CSV dice «por-implementar», se
// avisa: hay que poner el CSV al día.
//
// CUÁNDO CORRE: como `prebuild` de package.json, así que `npm run build` (y
// `npm run verificar:todo`, que lo llama) siempre publica datos al día. Se
// corre suelto con `npm run catalogo`. Las miniaturas las hace aparte
// scripts/miniaturas_galeria.mjs, que al terminar vuelve a correr este script.

import vm from "node:vm";
import {readFileSync, writeFileSync, existsSync, mkdirSync, openSync, readSync, closeSync} from "node:fs";
import path from "node:path";
import {DIMENSIONES, NIVELES, PAGINAS_GALERIA} from "../src/components/catalogo-clasificacion.js";
import {PAGINAS} from "./paginas.mjs";

const RAIZ = path.join(import.meta.dirname, "..");
const FICHAS = path.join(RAIZ, "catalogo", "fichas");
const CSV = path.join(RAIZ, "catalogo", "ubicacion.csv");
const MINIATURAS = path.join(RAIZ, "src", "catalogo", "miniaturas");
const SALIDA = path.join(RAIZ, "src", "data", "catalogo.json");
const MODULO = path.join(RAIZ, "src", "catalogo", "miniaturas.js");

const errores = [], avisos = [];

// ------------------------------------------------------------------ fichas
const ctx = {window: {}, console: {warn: () => {}, log: () => {}, error: () => {}}};
vm.createContext(ctx);
for (const a of ["base.js", "plantilla.js", "rescatadas.js"]) {
  const p = path.join(FICHAS, a);
  if (!existsSync(p)) { if (a !== "rescatadas.js") errores.push(`falta catalogo/fichas/${a}`); continue; }
  try { vm.runInContext(readFileSync(p, "utf8"), ctx, {filename: a}); }
  catch (e) { errores.push(`catalogo/fichas/${a} no se pudo leer: ${e.message}`); }
}
const fichas = ctx.window.FICHAS ?? [];
const vistos = new Set();
for (const f of fichas) {
  if (!f || typeof f.id !== "string") { errores.push(`ficha sin id: ${JSON.stringify(f?.nombre ?? f)}`); continue; }
  if (vistos.has(f.id)) errores.push(`id repetido en las fichas: ${f.id}`);
  vistos.add(f.id);
}

// --------------------------------------------------------------- ubicación
function leerCsv(texto) {
  const filas = [];
  let fila = [], campo = "", comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); campo = "";
      if (fila.some((x) => x !== "")) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  fila.push(campo);
  if (fila.some((x) => x !== "")) filas.push(fila);
  const [cab, ...resto] = filas;
  return resto.map((r) => Object.fromEntries(cab.map((k, i) => [k.trim(), (r[i] ?? "").trim()])));
}
const ubicaciones = new Map();
for (const u of leerCsv(readFileSync(CSV, "utf8").replace(/^﻿/, ""))) {
  if (ubicaciones.has(u.id)) errores.push(`id repetido en ubicacion.csv: ${u.id}`);
  if (!["implementada", "por-implementar"].includes(u.estado)) errores.push(`ubicacion.csv, ${u.id}: estado desconocido «${u.estado}»`);
  if (!/^\/galeria\/[a-z0-9-]+$/.test(u.pagina)) errores.push(`ubicacion.csv, ${u.id}: página inválida «${u.pagina}»`);
  if (!/^[a-z0-9-]+$/.test(u.ancla)) errores.push(`ubicacion.csv, ${u.id}: ancla inválida «${u.ancla}»`);
  ubicaciones.set(u.id, u);
}
for (const id of ubicaciones.keys()) if (!vistos.has(id)) errores.push(`ubicacion.csv tiene «${id}», que no es ninguna ficha`);
const destinos = new Map();
for (const u of ubicaciones.values()) {
  const k = `${u.pagina}#${u.ancla}`;
  if (destinos.has(k)) avisos.push(`dos formas apuntan a la misma sección ${k}: ${destinos.get(k)} y ${u.id}`);
  else destinos.set(k, u.id);
}

// Anclas que existen hoy en cada .md de la galería.
const anclasDe = new Map();
function anclas(pagina) {
  if (!anclasDe.has(pagina)) {
    const md = path.join(RAIZ, "src", pagina.replace(/^\//, "") + ".md");
    const texto = existsSync(md) ? readFileSync(md, "utf8") : "";
    anclasDe.set(pagina, new Set([...texto.matchAll(/<h2\s+id="([^"]+)"\s+class="toc-anchor"/g)].map((m) => m[1])));
  }
  return anclasDe.get(pagina);
}
const nombrePagina = (ruta) => PAGINAS.find((p) => p.ruta === ruta)?.nombre ?? PAGINAS_GALERIA[ruta] ?? ruta.split("/").pop();

// --------------------------------------------------------------- miniaturas
// Ancho y alto de un PNG, leídos de su cabecera IHDR.
function medidaPng(p) {
  const b = Buffer.alloc(24);
  const fd = openSync(p, "r");
  readSync(fd, b, 0, 24, 0);
  closeSync(fd);
  return {ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20)};
}
const origenes = (() => {
  const p = path.join(MINIATURAS, "origen.json");
  try { return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {}; } catch { return {}; }
})();
function miniatura(id) {
  const claro = path.join(MINIATURAS, `${id}.png`), oscuro = path.join(MINIATURAS, `${id}-oscuro.png`);
  if (!existsSync(claro)) return null;
  return {
    claro: `catalogo/miniaturas/${id}.png`,
    oscuro: existsSync(oscuro) ? `catalogo/miniaturas/${id}-oscuro.png` : null,
    ...medidaPng(claro),
    origen: origenes[id] ?? "galeria",
  };
}

// ------------------------------------------------------------------ salida
const lista = [];
for (const f of fichas) {
  if (!f || typeof f.id !== "string") continue;
  const u = ubicaciones.get(f.id);
  if (!u) { errores.push(`la ficha «${f.id}» no tiene ubicación en catalogo/ubicacion.csv`); continue; }
  const clasif = {};
  for (const d of DIMENSIONES) {
    const valores = [].concat(f[d.id] ?? []);
    const malos = valores.filter((v) => !d.lista.some((o) => o.id === v));
    if (!valores.length) errores.push(`la ficha «${f.id}» no tiene ${d.id}`);
    if (malos.length) errores.push(`la ficha «${f.id}» trae ${d.id} desconocido: ${malos.join(", ")}`);
    clasif[d.id] = valores;
  }
  if (!Number.isInteger(f.nivel) || f.nivel < 0 || f.nivel >= NIVELES.length) errores.push(`la ficha «${f.id}» trae nivel ${f.nivel}`);
  const existe = anclas(u.pagina).has(u.ancla);
  if (u.estado === "implementada" && !existe) errores.push(`«${f.id}» está implementada en ubicacion.csv pero ${u.pagina}.md no tiene el ancla #${u.ancla}`);
  if (u.estado === "por-implementar" && existe && destinos.get(`${u.pagina}#${u.ancla}`) === f.id) avisos.push(`«${f.id}»: ${u.pagina}#${u.ancla} ya existe; marca la fila como «implementada» en ubicacion.csv`);
  lista.push({
    id: f.id,
    nombre: f.nombre,
    nivel: f.nivel,
    ...clasif,
    pregunta: f.pregunta ?? "",
    si: f.si ?? "",
    no: f.no ?? "",
    datosForma: f.datosForma ?? "",
    fuentes: (f.fuentes ?? []).filter((x) => x?.texto).map((x) => ({texto: x.texto, url: x.url ?? null})),
    componente: f.plantilla?.componente ?? null,
    // Tiene receta viva en el catálogo HTML (de ahí sale su miniatura de
    // respaldo mientras su sección no exista).
    receta: typeof f.receta === "function",
    enGaleria: u.estado === "implementada" && existe,
    pagina: u.pagina,
    paginaNombre: nombrePagina(u.pagina),
    ancla: u.ancla,
    // Destino relativo a la raíz del sitio, sin diagonal inicial: el
    // componente le antepone window.__RAIZ.
    destino: `${u.pagina.replace(/^\//, "")}#${u.ancla}`,
    miniatura: miniatura(f.id),
  });
}

if (errores.length) {
  console.error(`catalogo_datos: ${errores.length} errores, no se escribe nada.`);
  for (const e of errores) console.error("  - " + e);
  process.exit(1);
}

mkdirSync(path.dirname(SALIDA), {recursive: true});
writeFileSync(SALIDA, JSON.stringify({fichas: lista}, null, 1) + "\n");

// FileAttachment necesita nombres literales para que Framework copie cada
// archivo a dist/. Este módulo se genera: no se edita a mano.
const literales = lista.flatMap((f) => (f.miniatura ? [f.miniatura.claro, f.miniatura.oscuro].filter(Boolean) : []));
mkdirSync(path.dirname(MODULO), {recursive: true});
writeFileSync(MODULO, `// src/catalogo/miniaturas.js
// GENERADO por scripts/catalogo_datos.mjs: no se edita a mano.
// Un FileAttachment por miniatura, con nombre literal, para que Framework las
// copie a dist/ con hash. La llave es la ruta que guarda src/data/catalogo.json.
import {FileAttachment} from "observablehq:stdlib";

export const MINIATURAS = {
${literales.map((r) => `  ${JSON.stringify(r)}: FileAttachment(${JSON.stringify("./" + r.replace(/^catalogo\//, ""))}).href,`).join("\n")}
};
`);

const enGaleria = lista.filter((f) => f.enGaleria).length;
const conMini = lista.filter((f) => f.miniatura).length;
console.log(`catalogo_datos: ${lista.length} formas (${enGaleria} en la galería, ${lista.length - enGaleria} en construcción), ${conMini} con miniatura → src/data/catalogo.json`);
for (const a of avisos) console.log("  aviso: " + a);
