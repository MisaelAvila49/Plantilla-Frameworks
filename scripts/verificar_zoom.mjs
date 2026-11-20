// scripts/verificar_zoom.mjs
// Accesibilidad con zoom y en celular (WCAG 1.4.4 y 1.4.10), en navegador real.
// Nació de lo que se vio en un Android con Brave (noviembre 2026): secciones y
// mapas sin dibujar, el panel de filtros tapando la pantalla con zoom y globos
// fuera de lo visible. Cinco modos por página:
//   movil      Chromium táctil de 412 × 915 (Android): recorrido lento como
//              con el dedo; cada sección se dibuja y un toque en su figura
//              abre el globo DENTRO de lo que se ve.
//   zoom200    1366 × 768 al 200 % (683 × 384 px de CSS): el panel no se fija
//              (tapaba la mitad) y no hay desplazamiento horizontal.
//   zoom400    1366 × 768 al 400 % (342 × 192): igual.
//   pellizco   el celular con zoom de pellizco al doble (visualViewport): el
//              panel no se fija y el globo cae dentro del área visible.
//   webkit     motor de Safari, como iPhone de 390 × 844: cada sección se dibuja.
// Uso: npm run verificar:zoom   ·   OBS_RUTAS=galeria/mapas npm run verificar:zoom
//      npm run verificar:zoom -- movil pellizco   (solo esos modos)
import {webkit} from "playwright-core";
import {servidor, navegador} from "./navegador.mjs";
import {PAGINAS, PUERTO} from "./paginas.mjs";

const MODOS = ["movil", "zoom200", "zoom400", "pellizco", "webkit"];
const pedidos = process.argv.slice(2).filter((m) => MODOS.includes(m));
const modos = pedidos.length ? pedidos : MODOS;
const rutas = PAGINAS.filter((p) => !p.mapa && !p.catalogo).map((p) => p.ruta);
const base = `http://localhost:${PUERTO}`;
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";
const CONTEXTOS = {
  movil: {viewport: {width: 412, height: 915}, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: ANDROID},
  pellizco: {viewport: {width: 412, height: 915}, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, userAgent: ANDROID},
  zoom200: {viewport: {width: 683, height: 384}, deviceScaleFactor: 2},
  zoom400: {viewport: {width: 342, height: 192}, deviceScaleFactor: 4},
  webkit: {viewport: {width: 390, height: 844}, deviceScaleFactor: 3, isMobile: true, hasTouch: true},
};

await servidor(PUERTO);
const chromium = await navegador();
const safari = modos.includes("webkit") ? await webkit.launch() : null;
const fallas = [];

// Recorre la página despacio (como un dedo) y espera a que las secciones
// cercanas terminen; devuelve las que quedaron sin dibujar.
async function recorrer(page) {
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alto; y += 500) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(350); }
  await page.waitForTimeout(2000);
  return page.evaluate(() => [...document.querySelectorAll(".analisis")].filter((s) => !s.dataset.pintado || s.dataset.error).map((s) => `${s.dataset.analisis}${s.dataset.error ? " (error: " + s.dataset.error.slice(0, 60) + ")" : ""}`));
}
// ¿Algún panel fijo tapa más de una cuarta parte de lo que se ve?
const panelTapa = (page) => page.evaluate(() => {
  const vv = window.visualViewport, alto = vv ? vv.height : innerHeight;
  return [...document.querySelectorAll(".panel-filtros")].map((p) => {
    const r = p.getBoundingClientRect(), pos = getComputedStyle(p).position;
    return pos === "sticky" && r.top <= 1 && r.bottom > 0 && r.height > alto * 0.25 ? Math.round((100 * r.height) / alto) : 0;
  }).filter(Boolean);
});
// Toca o apunta la figura de cada sección y mide el globo contra lo visible.
async function globos(page, tocar) {
  const n = await page.evaluate(() => document.querySelectorAll(".analisis").length);
  const fuera = [];
  for (let i = 0; i < n; i++) {
    const caja = await page.evaluate((k) => {
      const s = document.querySelectorAll(".analisis")[k];
      const svg = [...s.querySelectorAll("figure svg")].sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0];
      if (!svg) return null;
      svg.scrollIntoView({block: "center"});
      const r = svg.getBoundingClientRect();
      return {x: r.left + r.width * 0.55, y: r.top + r.height * 0.45, id: s.dataset.analisis};
    }, i);
    if (!caja) continue;
    await page.waitForTimeout(250);
    if (tocar) await page.touchscreen.tap(caja.x, caja.y); else await page.mouse.move(caja.x, caja.y);
    await page.waitForTimeout(250);
    const r = await page.evaluate(() => {
      const t = document.querySelector(".globo-tarjeta");
      if (!t || t.hidden) return null;
      const b = t.getBoundingClientRect(), vv = window.visualViewport;
      const ox = vv ? vv.offsetLeft : 0, oy = vv ? vv.offsetTop : 0, w = vv ? vv.width : innerWidth, h = vv ? vv.height : innerHeight;
      return {dentro: b.left >= ox - 1 && b.top >= oy - 1 && b.right <= ox + w + 1 && b.bottom <= oy + h + 1, caja: [Math.round(b.left - ox), Math.round(b.top - oy), Math.round(b.width), Math.round(b.height)], vista: [Math.round(w), Math.round(h)]};
    });
    if (r && !r.dentro) fuera.push(`${caja.id} globo ${r.caja.join(",")} en ${r.vista.join("×")}`);
  }
  return fuera;
}

for (const modo of modos) {
  const nav = modo === "webkit" ? safari : chromium;
  const ctx = await nav.newContext(CONTEXTOS[modo]);
  await ctx.addInitScript(() => { try { localStorage.setItem("sdi-tema", "claro"); } catch {} });
  console.log(`\n=== ${modo} ===`);
  for (const ruta of rutas) {
    const page = await ctx.newPage();
    const errores = [];
    page.on("pageerror", (e) => errores.push(String(e.message ?? e).slice(0, 120)));
    await page.goto(base + ruta, {waitUntil: "load", timeout: 120000});
    await page.waitForTimeout(1200);
    const notas = [];
    if (modo === "pellizco") {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setPageScaleFactor", {pageScaleFactor: 2});
      await page.waitForTimeout(400);
    }
    const sinDibujar = await recorrer(page);
    if (sinDibujar.length) notas.push(`sin dibujar: ${sinDibujar.join(", ")}`);
    if (modo !== "webkit") {
      // El panel no debe tapar: se revisa en varias posiciones de la página.
      const alto = await page.evaluate(() => document.documentElement.scrollHeight);
      const tapa = new Set();
      for (let y = 0; y < alto; y += Math.max(300, Math.round(alto / 25))) {
        await page.evaluate((yy) => scrollTo(0, yy), y);
        await page.waitForTimeout(120);
        for (const p of await panelTapa(page)) tapa.add(p);
      }
      if (tapa.size) notas.push(`panel fijo que tapa ${[...tapa].join("/")} % de lo visible`);
    }
    if (modo === "zoom200" || modo === "zoom400") {
      const desborde = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (desborde > 2) notas.push(`desplazamiento horizontal de ${desborde} px`);
    }
    if (modo === "movil" || modo === "pellizco") {
      const fuera = await globos(page, true);
      if (fuera.length) notas.push(`globo fuera de lo visible: ${fuera.slice(0, 3).join("; ")}`);
    }
    if (errores.length) notas.push(`errores JS: ${errores.slice(0, 2).join(" | ")}`);
    console.log(`${notas.length ? "FALLA" : "ok   "} ${ruta.padEnd(28)} ${notas.join(" · ")}`);
    for (const n of notas) fallas.push(`[${modo}] ${ruta} — ${n}`);
    await page.close();
  }
  await ctx.close();
}
await chromium.close();
await safari?.close();
console.log("\n" + "=".repeat(60));
if (fallas.length) { console.log(`FALLOS (${fallas.length}):`); for (const f of fallas) console.log("  - " + f); process.exit(1); }
console.log("Todas las páginas se dibujan completas con zoom y en celular, el panel no tapa lo visible y los globos caen dentro de la pantalla.");
