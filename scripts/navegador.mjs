// scripts/navegador.mjs
// Piezas comunes de los verificadores con navegador: servidor de dist/,
// lanzamiento del navegador y apertura de una página lista para medir.
// Los verificadores corren sobre el sitio CONSTRUIDO (npm run build).

import {chromium} from "playwright-core";
import {existsSync} from "node:fs";
import path from "node:path";
import {servirEstatico} from "./servidor_estatico.mjs";
import {PUERTO} from "./paginas.mjs";

// OBS_SALIDA: misma variable que observablehq.config.js (build en otra carpeta).
export const DIST = path.join(import.meta.dirname, "..", process.env.OBS_SALIDA || "dist");

export async function servidor(puerto = PUERTO) {
  if (!existsSync(path.join(DIST, "index.html"))) {
    console.error("No existe dist/index.html. Corre primero: npm run build");
    process.exit(2);
  }
  const srv = await servirEstatico(DIST, puerto);
  return {srv, base: `http://127.0.0.1:${puerto}`};
}

// Usa el Edge o el Chrome instalados (playwright-core no descarga navegador).
export async function navegador() {
  for (const channel of ["msedge", "chrome"]) {
    try { return await chromium.launch({channel}); } catch { /* se prueba el siguiente */ }
  }
  try { return await chromium.launch(); } catch (e) {
    console.error("No se encontró Edge ni Chrome, ni un Chromium de Playwright (npx playwright install chromium).");
    process.exit(2);
  }
}

// Contexto con tema y tamaño de ventana fijos. El tema se escribe en
// localStorage antes de cargar, que es de donde lo lee el script de cabecera.
export async function contexto(nav, {tema = "claro", ventana = {width: 1366, height: 768}, movimiento = "reduce"} = {}) {
  const ctx = await nav.newContext({viewport: ventana, reducedMotion: movimiento, deviceScaleFactor: 1});
  await ctx.addInitScript((m) => { try { localStorage.setItem("sdi-tema", m); } catch {} }, tema);
  return ctx;
}

// Abre una ruta y espera a que todo esté dibujado. Las secciones se dibujan
// al acercarse a la pantalla, así que se recorre la página entera antes de
// medir: un verificador que no la recorre cuenta gráficas que aún no existen.
export async function abrir(ctx, base, ruta, {recorrer = true} = {}) {
  const page = await ctx.newPage();
  const errores = [];
  page.on("pageerror", (e) => errores.push(String(e.message ?? e)));
  page.on("console", (m) => { if (m.type() === "error") errores.push(m.text()); });
  await page.goto(base + ruta, {waitUntil: "load", timeout: 120000});
  await page.waitForFunction(() => !document.querySelector("observablehq-loading"), null, {timeout: 90000}).catch(() => {});
  await page.waitForTimeout(700);
  if (recorrer) await recorrerPagina(page);
  return {page, errores};
}

export async function recorrerPagina(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 450) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
    scrollTo(0, 0);
  });
  // Espera a que cada sección haya pintado (o haya reportado su error).
  await page.waitForFunction(() => [...document.querySelectorAll(".analisis")].every((s) => s.dataset.pintado || s.dataset.error), null, {timeout: 30000}).catch(() => {});
  await page.waitForTimeout(500);
}
