// catalogo/herramientas/verificar_catalogo.mjs
// Verifica CatalogoGraficas.html en un navegador real, por file:// y por http:
// errores de consola, fichas por archivo, recetas que no dibujan, miniaturas
// que no cargan, cada opción de cada pestaña (al menos una ficha y queda en la
// URL), combinación por URL con nivel y búsqueda, «Quitar filtros», teclado de
// las pestañas (patrón APG), axe-core WCAG 2.1 A/AA en claro y oscuro a 1366 y
// 390 px con cada pestaña abierta, y scroll horizontal de la página.
// No toca dist/ ni el puerto 4173: sirve la carpeta catalogo/ en un puerto libre.
// Uso (desde la carpeta Plantilla): node catalogo/herramientas/verificar_catalogo.mjs [file|http|ambos]
import {chromium} from "playwright-core";
import {createServer} from "node:http";
import {readFileSync, existsSync, statSync} from "node:fs";
import {join, extname, resolve} from "node:path";
import vm from "node:vm";

const RAIZ = resolve(import.meta.dirname, "..").replaceAll("\\", "/");
const AXE = readFileSync(join(RAIZ, "..", "node_modules", "axe-core", "axe.min.js"), "utf8");
const modo = process.argv[2] ?? "ambos";

// Cuenta de fichas por archivo, leyendo cada script por separado.
for (const a of ["base.js", "plantilla.js", "rescatadas.js"]) {
  const p = join(RAIZ, "fichas", a);
  if (!existsSync(p)) { console.log(`fichas/${a}: no existe`); continue; }
  const ctx = {window: {}}; vm.createContext(ctx);
  try { vm.runInContext(readFileSync(p, "utf8"), ctx); console.log(`fichas/${a}: ${ctx.window.FICHAS.length} fichas`); }
  catch (e) { console.log(`fichas/${a}: error al evaluar fuera del navegador (${e.message})`); }
}

const T = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".png": "image/png", ".css": "text/css"};
const srv = createServer((q, r) => {
  const p = join(RAIZ, decodeURIComponent(new URL(q.url, "http://x").pathname));
  if (!existsSync(p) || statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, {"content-type": T[extname(p)] || "application/octet-stream"}); r.end(readFileSync(p));
});
await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
const URLS = {file: "file:///" + RAIZ + "/CatalogoGraficas.html", http: `http://127.0.0.1:${srv.address().port}/CatalogoGraficas.html`};
const nav = await chromium.launch({channel: "msedge"});
let fallos = 0;
const falla = (m) => { fallos++; console.log("  FALLA:", m); };

async function abrir(url, {tema = "claro", ancho = 1366, alto = 900} = {}) {
  const ctx = await nav.newContext({viewport: {width: ancho, height: alto}, colorScheme: tema === "oscuro" ? "dark" : "light", reducedMotion: "reduce"});
  await ctx.addInitScript((t) => { try { localStorage.setItem("catalogo-tema", t); } catch {} }, tema);
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
  await page.goto(url, {waitUntil: "networkidle"});
  await page.evaluate(() => window.dibujarTodas());
  await page.waitForTimeout(400);
  return {ctx, page, errores};
}
const cuenta = (page) => page.evaluate(() => +document.querySelector("#cuenta b").textContent);

for (const via of modo === "ambos" ? ["file", "http"] : [modo]) {
  console.log(`\n== ${via}: ${URLS[via]}`);
  const {ctx, page, errores} = await abrir(URLS[via]);
  // Las miniaturas cargan con loading="lazy": se fuerzan para medir si existen.
  await page.evaluate(async () => { const imgs = [...document.querySelectorAll(".lienzo img")]; imgs.forEach((i) => (i.loading = "eager"));
    await Promise.all(imgs.map((i) => i.decode().catch(() => null))); });
  const r = await page.evaluate(() => ({
    total: document.querySelectorAll("article.ficha").length,
    dibujadas: document.querySelectorAll(".lienzo svg, .lienzo figure, .lienzo div").length,
    errorDibujo: [...document.querySelectorAll(".lienzo .error")].map((e) => e.closest("article").id + ": " + e.textContent),
    imagenes: [...document.querySelectorAll(".lienzo img")].map((i) => ({id: i.closest("article").id, ok: i.complete && i.naturalWidth > 0})),
    cuenta: document.querySelector("#cuenta").textContent,
    grupos: [...document.querySelectorAll("#catalogo > section h2")].map((h) => h.textContent),
  }));
  console.log(`fichas en la página: ${r.total} · cuenta: «${r.cuenta}» · errores de consola: ${errores.length}`);
  if (errores.length) { falla("consola"); console.log("   ", errores.slice(0, 8).join("\n    ")); }
  if (r.errorDibujo.length) falla("recetas que no dibujan: " + r.errorDibujo.join(" | "));
  const rotas = r.imagenes.filter((i) => !i.ok);
  console.log(`miniaturas: ${r.imagenes.length} · sin cargar: ${rotas.length ? rotas.map((i) => i.id).join(", ") : 0}`);
  console.log(`grupos (por función): ${r.grupos.join(" · ")}`);

  if (via === "file") {
    // Cada opción de cada pestaña, sola: devuelve al menos una ficha.
    const total = await cuenta(page);
    for (const dim of ["familia", "entrada", "funcion", "forma"]) {
      await page.click(`#pestana-${dim}`);
      const opciones = await page.$$eval(`[data-dim="${dim}"]`, (bs) => bs.map((b) => b.dataset.valor));
      const res = [];
      for (const v of opciones) {
        await page.click(`[data-dim="${dim}"][data-valor="${v}"]`);
        const k = await cuenta(page);
        const h = await page.evaluate(() => location.hash);
        if (k < 1) falla(`${dim}=${v} da cero`);
        if (!h.includes(`${dim}=${v}`)) falla(`${dim}=${v} no quedó en la URL (${h})`);
        res.push(`${v} ${k}`);
        await page.click(`[data-dim="${dim}"][data-valor="${v}"]`);
      }
      console.log(`${dim} (${opciones.length} opciones): ${res.join(" · ")}`);
    }
    if (await cuenta(page) !== total) falla("al deseleccionar no vuelve al total");

    // Combinación por URL, nivel y búsqueda; luego «Quitar filtros».
    await page.goto(URLS.file + "#vista=forma&familia=mapa&forma=puntos", {waitUntil: "networkidle"});
    const combo = await page.evaluate(() => ({k: +document.querySelector("#cuenta b").textContent,
      ids: [...document.querySelectorAll("article.ficha")].filter((a) => a.isConnected).map((a) => a.id.slice(6)),
      vista: document.querySelector("[role=tab][aria-selected=true]").id, pulsados: [...document.querySelectorAll("[data-dim][aria-pressed=true]")].map((b) => b.dataset.dim + "=" + b.dataset.valor),
      activos: document.querySelector("#activos").textContent.trim()}));
    console.log(`URL #vista=forma&familia=mapa&forma=puntos → ${combo.k} fichas (${combo.ids.join(", ")}) · pestaña ${combo.vista} · pulsados ${combo.pulsados.join(", ")} · «${combo.activos}»`);
    if (combo.k < 1 || combo.vista !== "pestana-forma" || combo.pulsados.length !== 2) falla("combinación por URL");
    await page.click('[data-nivel="2"]');
    const conNivel = await cuenta(page);
    await page.fill("#buscar", "semitonos");
    const conTexto = await cuenta(page);
    console.log(`+ nivel Avanzado → ${conNivel} · + búsqueda «semitonos» → ${conTexto} · URL ${await page.evaluate(() => location.hash)}`);
    await page.click("#quitar");
    const limpio = await page.evaluate(() => ({k: +document.querySelector("#cuenta b").textContent, h: location.hash, q: document.querySelector("#buscar").value, quitar: document.querySelector("#quitar").disabled}));
    console.log(`Quitar filtros → ${limpio.k} fichas · hash «${limpio.h}» · búsqueda «${limpio.q}» · botón desactivado ${limpio.quitar}`);
    if (limpio.k !== total || !["", "#vista=forma"].includes(limpio.h)) falla("Quitar filtros");

    // Teclado en las pestañas (APG).
    await page.focus("#pestana-forma");
    const teclas = [];
    for (const k of ["ArrowRight", "ArrowRight", "End", "Home", "ArrowLeft"]) {
      await page.keyboard.press(k);
      teclas.push(`${k}→${await page.evaluate(() => document.activeElement.id + (document.activeElement.getAttribute("aria-selected") === "true" ? "✓" : ""))}`);
    }
    console.log("teclado:", teclas.join(" "));
    const tabindex = await page.$$eval("[role=tab]", (ts) => ts.map((t) => t.tabIndex).join(","));
    console.log("tabindex de las pestañas:", tabindex);
  }
  await ctx.close();
}

// axe y desborde, claro y oscuro, en 1366 y 390, con cada pestaña abierta.
if (modo !== "http") {
  for (const tema of ["claro", "oscuro"]) for (const ancho of [1366, 390]) {
    const {ctx, page, errores} = await abrir(URLS.file, {tema, ancho, alto: 900});
    const graves = new Map(), leves = new Map();
    for (const vista of ["todas", "familia", "entrada", "funcion", "forma"]) {
      await page.click(`#pestana-${vista}`);
      if (vista === "forma") await page.click('[data-dim="forma"][data-valor="puntos"]');
      await page.evaluate(() => { for (const d of document.querySelectorAll("details")) d.open = true; window.dibujarTodas(); });
      await page.waitForTimeout(250);
      await page.addScriptTag({content: AXE});
      const r = await page.evaluate(async () => await window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]}}));
      for (const v of r.violations) {
        const m = ["serious", "critical"].includes(v.impact) ? graves : leves;
        m.set(v.id, `${v.id} (${v.impact}) ×${v.nodes.length} p. ej. ${v.nodes[0]?.target?.[0]} · ${(v.nodes[0]?.failureSummary ?? "").split("\n")[1]?.trim() ?? ""}`);
      }
      if (vista === "forma") await page.click("#quitar");
    }
    const desborde = await page.evaluate(() => ({doc: document.documentElement.scrollWidth, vista: innerWidth,
      culpables: [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".carril-desliza, .lienzo, .tabla-caja, pre")).slice(0, 5).map((e) => e.tagName + "." + e.className)}));
    console.log(`\naxe ${tema} ${ancho}: graves ${graves.size} · leves ${leves.size} · desborde ${desborde.doc}/${desborde.vista} · consola ${errores.length}`);
    for (const g of graves.values()) { falla("axe"); console.log("   ", g); }
    for (const g of leves.values()) console.log("    leve:", g);
    if (desborde.doc > desborde.vista) { falla("scroll horizontal de página"); console.log("   ", desborde.culpables.join(", ")); }
    await ctx.close();
  }
}
await nav.close(); srv.close();
console.log(`\n${fallos ? `${fallos} fallos` : "sin fallos"}`);
process.exit(fallos ? 1 : 0);
