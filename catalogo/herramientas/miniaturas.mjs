// catalogo/herramientas/miniaturas.mjs
// Miniaturas de las fichas que no tienen receta viva: captura el cuerpo de la
// figura (.figura-cuerpo) de su sección en la galería CONSTRUIDA (dist/), en
// claro y en oscuro, a 2x y con 10 px de margen, y la guarda en
// catalogo/miniaturas/<id>.png y <id>-oscuro.png.
//
// Qué fichas captura: las de fichas/*.js con `imagen` y con `plantilla.galeria`
// ("src/galeria/tiempo.md#riel" → página galeria/tiempo, sección #riel). No hay
// lista aparte que mantener.
//
// Uso (desde la carpeta Plantilla, con dist/ ya construido):
//   node catalogo/herramientas/miniaturas.mjs            todas
//   node catalogo/herramientas/miniaturas.mjs riel       una sola ficha
//   python catalogo/herramientas/reducir_miniaturas.py   después: 256 colores, ~60 % menos peso
//
// Sirve dist/ con un servidor propio en un puerto libre, así que no choca con
// el 4173 de los verificadores; aun así, no se corre mientras un build o un
// verificador estén reescribiendo dist/.
import {chromium} from "playwright-core";
import {createServer} from "node:http";
import {readFileSync, existsSync, statSync} from "node:fs";
import {join, extname} from "node:path";
import vm from "node:vm";

const CATALOGO = join(import.meta.dirname, "..");
const DIST = join(CATALOGO, "..", "dist");
const VENTANA = 760; // con esta ventana el cuerpo de la figura mide unos 696 px de ancho
const SOLO = process.argv[2] ?? null;

if (!existsSync(join(DIST, "galeria"))) { console.error("No existe dist/galeria. Corre primero: npm run build"); process.exit(2); }

const fichas = [];
for (const a of ["base.js", "plantilla.js", "rescatadas.js"]) {
  const p = join(CATALOGO, "fichas", a);
  if (!existsSync(p)) continue;
  const ctx = {window: {}}; vm.createContext(ctx);
  try { vm.runInContext(readFileSync(p, "utf8"), ctx); fichas.push(...(ctx.window.FICHAS ?? [])); }
  catch (e) { console.warn(`fichas/${a}: no se pudo leer fuera del navegador (${e.message})`); }
}
const LISTA = fichas.filter((f) => f.imagen && f.plantilla?.galeria && (!SOLO || f.id === SOLO)).map((f) => {
  const [archivo, ancla] = f.plantilla.galeria.split("#");
  return {id: f.id, salida: join(CATALOGO, f.imagen), pagina: archivo.replace(/^src\//, "").replace(/\.md$/, ""), ancla};
});
if (!LISTA.length) { console.error("Ninguna ficha con imagen y sección de galería" + (SOLO ? ` con id ${SOLO}` : "")); process.exit(1); }

const TIPOS = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".csv": "text/csv", ".woff2": "font/woff2"};
const srv = createServer((q, r) => {
  let p = join(DIST, decodeURIComponent(new URL(q.url, "http://x").pathname));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
  else if (!existsSync(p) && existsSync(p + ".html")) p += ".html";
  if (!existsSync(p)) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, {"content-type": TIPOS[extname(p)] || "application/octet-stream"}); r.end(readFileSync(p));
});
await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${srv.address().port}`;

let nav;
for (const channel of ["msedge", "chrome"]) { try { nav = await chromium.launch({channel}); break; } catch { /* se prueba el siguiente */ } }
if (!nav) { console.error("No se encontró Edge ni Chrome."); process.exit(2); }

let fallos = 0;
for (const tema of ["claro", "oscuro"]) {
  const ctx = await nav.newContext({viewport: {width: VENTANA, height: 1000}, deviceScaleFactor: 2, reducedMotion: "reduce"});
  await ctx.addInitScript((m) => { try { localStorage.setItem("sdi-tema", m); } catch {} }, tema);
  const paginas = new Map();
  for (const {id, salida, pagina, ancla} of LISTA) {
    let page = paginas.get(pagina);
    if (!page) {
      page = await ctx.newPage();
      page.on("pageerror", (e) => console.log(`  error en ${pagina}: ${e.message}`));
      await page.goto(`${base}/${pagina}`, {waitUntil: "networkidle"});
      paginas.set(pagina, page);
    }
    // La sección se dibuja al entrar en vista: se lleva su ancla a la vista y se espera el dibujo.
    await page.evaluate((a) => document.getElementById(a)?.scrollIntoView(), ancla);
    const sel = `section.analisis[aria-labelledby="${ancla}"] .figura-cuerpo`;
    try {
      await page.waitForFunction((s) => { const c = document.querySelector(s); return c && c.querySelector("svg, canvas") && c.getBoundingClientRect().height > 80; }, sel, {timeout: 20000});
    } catch { console.log(`${id}: no apareció ${sel}`); fallos++; continue; }
    await page.waitForTimeout(1500);
    await page.locator(sel).first().scrollIntoViewIfNeeded();
    await page.mouse.move(1, 1);
    await page.waitForTimeout(300);
    const pos = await page.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return {x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height}; }, sel);
    const archivo = tema === "oscuro" ? salida.replace(/\.png$/, "-oscuro.png") : salida;
    await page.screenshot({path: archivo, animations: "disabled", fullPage: true, clip: {x: Math.max(0, pos.x - 10), y: Math.max(0, pos.y - 10), width: pos.w + 20, height: pos.h + 20}});
    console.log(`${tema.padEnd(6)} ${id}: ${Math.round(pos.w)}×${Math.round(pos.h)} px → ${archivo.split(/[\\/]/).pop()}`);
  }
  await ctx.close();
}
await nav.close(); srv.close();
process.exit(fallos ? 1 : 0);
