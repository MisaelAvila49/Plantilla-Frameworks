// scripts/miniaturas_galeria.mjs
// Miniaturas de la página «Catálogo de formas», tomadas de la implementación
// REAL: abre cada `pagina#ancla` de catalogo/ubicacion.csv en el sitio
// construido (dist/) y captura como elemento el cuerpo de la figura de esa
// sección (`section.analisis[aria-labelledby=ancla] .figura-cuerpo`, el
// contenedor que arma figura() en src/components/seccion.js), en claro y en
// oscuro, a 2x y con unos 640 px de ancho de figura. Guarda
// src/catalogo/miniaturas/<id>.png y <id>-oscuro.png.
//
// Formas cuya sección todavía no existe (llevan la marca «En construcción»):
//   1. la miniatura del catálogo, catalogo/miniaturas/<id>.png, si la hay;
//   2. si no, la vista previa viva de su receta en el catálogo HTML
//      (dist/catalogo-recetas/CatalogoGraficas.html), sin título ni pie;
//   3. si tampoco, ninguna: la página dibuja la silueta de su ícono de Forma.
// El origen de cada una queda en src/catalogo/miniaturas/origen.json.
//
// Al terminar reduce las PNG a 256 colores (scripts/reducir_miniaturas.py) y
// vuelve a correr scripts/catalogo_datos.mjs, que actualiza
// src/data/catalogo.json y src/catalogo/miniaturas.js. Después hay que volver
// a construir para que entren al sitio:
//
//   npm run build && npm run miniaturas && npm run build
//
// Es idempotente: cada corrida reescribe todas las miniaturas de la lista.
// Sirve dist/ en un puerto libre, así que no choca con los verificadores,
// pero no se corre mientras un build reescribe dist/.
//
// Uso:  npm run miniaturas              todas
//       node scripts/miniaturas_galeria.mjs riel barras   solo esas fichas

import {existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync} from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {servirEstatico} from "./servidor_estatico.mjs";
import {navegador} from "./navegador.mjs";

const RAIZ = path.join(import.meta.dirname, "..");
const DIST = path.join(RAIZ, "dist");
const SALIDA = path.join(RAIZ, "src", "catalogo", "miniaturas");
const DEL_CATALOGO = path.join(RAIZ, "catalogo", "miniaturas");
const RECETAS = "/catalogo-recetas/CatalogoGraficas.html";
// Con 704 px de ventana el menú lateral se pliega y el cuerpo de la figura
// mide unos 640 px; con 740 px la ficha del catálogo HTML va a una columna y
// su lienzo mide lo mismo.
const VENTANA_GALERIA = 704, VENTANA_RECETAS = 740;
// La miniatura se recorta a la parte de arriba si la figura es muy alta: la
// tarjeta la muestra en una caja de 8:5 y una figura larga quedaría diminuta.
const ALTO_MAXIMO = 0.8;
const MARGEN = 10;
const SOLO = new Set(process.argv.slice(2));

if (!existsSync(path.join(DIST, "index.html"))) { console.error("No existe dist/index.html. Corre primero: npm run build"); process.exit(2); }

// Datos al día: la lista sale de las fichas y de ubicacion.csv.
const nodo = (script) => spawnSync(process.execPath, [path.join(RAIZ, "scripts", script)], {cwd: RAIZ, stdio: "inherit"}).status;
if (nodo("catalogo_datos.mjs") !== 0) process.exit(1);
const {fichas} = JSON.parse(readFileSync(path.join(RAIZ, "src", "data", "catalogo.json"), "utf8"));
const LISTA = fichas.filter((f) => !SOLO.size || SOLO.has(f.id));
if (!LISTA.length) { console.error(`Ninguna ficha con id ${[...SOLO].join(", ")}`); process.exit(1); }
mkdirSync(SALIDA, {recursive: true});
const rutaPng = (id, tema) => path.join(SALIDA, tema === "oscuro" ? `${id}-oscuro.png` : `${id}.png`);
const origenPrevio = (() => { try { return JSON.parse(readFileSync(path.join(SALIDA, "origen.json"), "utf8")); } catch { return {}; } })();
const origen = SOLO.size ? {...origenPrevio} : {};

const srv = await servirEstatico(DIST, 0);
const base = `http://127.0.0.1:${srv.address().port}`;
const nav = await navegador();
const fallos = [];
const hechos = new Map(); // id → {claro, oscuro} (true si se capturó)

// Recorte en coordenadas de documento para una captura de página completa:
// con la página entera no hay panel pegajoso encima ni scroll que mover.
async function capturar(page, selector, archivo) {
  const caja = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height};
  }, selector);
  if (!caja || caja.w < 50 || caja.h < 50) return false;
  const alto = Math.min(caja.h, caja.w * ALTO_MAXIMO);
  await page.screenshot({path: archivo, fullPage: true, animations: "disabled",
    clip: {x: Math.max(0, caja.x - MARGEN), y: Math.max(0, caja.y - MARGEN), width: caja.w + 2 * MARGEN, height: alto + 2 * MARGEN}});
  return true;
}

for (const tema of ["claro", "oscuro"]) {
  // -------------------------------------------------- 1. secciones de la galería
  const ctx = await nav.newContext({viewport: {width: VENTANA_GALERIA, height: 1000}, deviceScaleFactor: 2, reducedMotion: "reduce"});
  await ctx.addInitScript((m) => { try { localStorage.setItem("sdi-tema", m); } catch {} }, tema);
  const porPagina = Map.groupBy(LISTA, (f) => f.pagina);
  for (const [pagina, lista] of porPagina) {
    if (!existsSync(path.join(DIST, pagina.replace(/^\//, "") + ".html"))) continue;
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.log(`  error en ${pagina}: ${e.message}`));
    await page.goto(base + pagina, {waitUntil: "load", timeout: 120000});
    await page.waitForFunction(() => !document.querySelector("observablehq-loading"), null, {timeout: 90000}).catch(() => {});
    // Paneles quietos y globo oculto: la captura es solo la figura.
    await page.addStyleTag({content: ".panel-filtros{position:static!important}.globo-tarjeta{display:none!important}"});
    for (const f of lista) {
      const sel = `section.analisis[aria-labelledby="${f.ancla}"] .figura-cuerpo`;
      // Dos formas en la misma ancla (una implementada y otra por hacer):
      // la sección es de la implementada.
      const duenia = fichas.find((g) => g.pagina === f.pagina && g.ancla === f.ancla && g.enGaleria);
      if (duenia && duenia.id !== f.id) continue;
      // El ancla del índice (h2 estático) dice si la sección existe; la
      // sección la arma después una celda que espera sus datos.
      if (!(await page.evaluate((a) => Boolean(document.getElementById(a)), f.ancla))) continue;
      try { await page.waitForSelector(`section.analisis[aria-labelledby="${f.ancla}"]`, {state: "attached", timeout: 45000}); }
      catch { fallos.push(`${f.id}: ${pagina} tiene el ancla #${f.ancla} pero no su sección`); continue; }
      await page.evaluate((a) => document.getElementById(a)?.scrollIntoView({block: "start"}), f.ancla);
      try {
        await page.waitForFunction((s) => { const c = document.querySelector(s); return c && c.querySelector("svg, canvas, img") && c.getBoundingClientRect().height > 80; }, sel, {timeout: 20000});
      } catch { fallos.push(`${f.id}: la sección ${pagina}#${f.ancla} existe pero su figura no se dibujó`); continue; }
      await page.waitForTimeout(1200);
      await page.mouse.move(1, 1);
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(250);
      if (await capturar(page, sel, rutaPng(f.id, tema))) {
        (hechos.get(f.id) ?? hechos.set(f.id, {}).get(f.id))[tema] = true;
        origen[f.id] = "galeria";
        console.log(`${tema.padEnd(6)} ${f.id.padEnd(22)} galería  ${pagina}#${f.ancla}`);
      } else fallos.push(`${f.id}: no se pudo recortar ${sel}`);
    }
    await page.close();
  }
  await ctx.close();

  // ----------------------------------- 2. respaldo para lo que no tiene sección
  const pendientes = LISTA.filter((f) => !hechos.get(f.id)?.[tema]);
  for (const f of pendientes) if (f.enGaleria) fallos.push(`${f.id}: está en la galería pero no se encontró ${f.pagina}#${f.ancla}`);
  const sinCopia = [];
  for (const f of pendientes) {
    const desde = path.join(DEL_CATALOGO, tema === "oscuro" ? `${f.id}-oscuro.png` : `${f.id}.png`);
    if (existsSync(desde)) {
      copyFileSync(desde, rutaPng(f.id, tema));
      origen[f.id] = "catalogo";
      console.log(`${tema.padEnd(6)} ${f.id.padEnd(22)} catálogo (miniatura)`);
    } else sinCopia.push(f);
  }
  const conReceta = sinCopia.filter((f) => f.receta);
  if (conReceta.length && existsSync(path.join(DIST, RECETAS))) {
    const ctxR = await nav.newContext({viewport: {width: VENTANA_RECETAS, height: 1000}, deviceScaleFactor: 2, reducedMotion: "reduce"});
    await ctxR.addInitScript((m) => { try { localStorage.setItem("catalogo-tema", m); } catch {} }, tema);
    const page = await ctxR.newPage();
    await page.goto(base + RECETAS, {waitUntil: "load", timeout: 120000});
    const listo = await page.waitForFunction(() => typeof window.dibujarTodas === "function", null, {timeout: 30000}).then(() => true, () => false);
    if (listo) {
      await page.evaluate(() => window.dibujarTodas());
      // Solo la gráfica: sin el título, el subtítulo ni el pie de la receta.
      await page.addStyleTag({content: ".lienzo{border-top:0!important;padding-top:0!important}.lienzo figure>:is(h2,h3,p,figcaption),.lienzo>:is(h3,p),.lienzo .miniatura figcaption{display:none!important}"});
      await page.waitForTimeout(800);
      await page.mouse.move(1, 1);
      for (const f of conReceta) {
        const sel = `#ficha-${f.id} .lienzo`;
        const ok = await page.evaluate((s) => { const c = document.querySelector(s); return Boolean(c?.querySelector("svg, canvas") && !c.querySelector(".error")); }, sel);
        if (ok && await capturar(page, sel, rutaPng(f.id, tema))) {
          origen[f.id] = "receta";
          console.log(`${tema.padEnd(6)} ${f.id.padEnd(22)} catálogo (receta viva)`);
        } else sinCopia.push({...f, receta: false});
      }
    } else console.log("  el catálogo HTML no cargó sus librerías (¿sin red?): se usan siluetas");
    await ctxR.close();
  }
  // ------------------------------------------------ 3. sin nada: silueta
  for (const f of new Map(sinCopia.map((x) => [x.id, x])).values()) {
    if (f.receta && origen[f.id] === "receta") continue;
    rmSync(rutaPng(f.id, tema), {force: true});
    if (tema === "claro") delete origen[f.id];
    console.log(`${tema.padEnd(6)} ${f.id.padEnd(22)} silueta del ícono`);
  }
}
await nav.close(); srv.close();

writeFileSync(path.join(SALIDA, "origen.json"), JSON.stringify(Object.fromEntries(Object.entries(origen).sort()), null, 1) + "\n");
const py = spawnSync(process.platform === "win32" ? "python" : "python3", ["-I", path.join(RAIZ, "scripts", "reducir_miniaturas.py"), ...SOLO], {cwd: RAIZ, encoding: "utf8"});
console.log((py.stdout || "").trim() || `reducir_miniaturas: no corrió (${(py.stderr || "").trim().split("\n").pop()})`);
nodo("catalogo_datos.mjs");

const cuenta = (o) => Object.values(origen).filter((x) => x === o).length;
console.log(`\nMiniaturas: ${cuenta("galeria")} de la galería, ${cuenta("catalogo")} de la miniatura del catálogo, ${cuenta("receta")} de la receta viva; ${LISTA.length - Object.keys(origen).filter((k) => LISTA.some((f) => f.id === k)).length} con silueta.`);
console.log("Vuelve a construir (npm run build) para que entren al sitio.");
if (fallos.length) {
  console.log(`\nFALLOS (${fallos.length}):`);
  for (const x of fallos) console.log("  - " + x);
  process.exit(1);
}
