// Accesibilidad MEDIDA, no declarada: axe-core (WCAG 2.1 A y AA) en un
// navegador real sobre cada página de scripts/paginas.mjs, en los dos temas
// y con todas las secciones ya dibujadas. Falla con cualquier violación
// «serious» o «critical». Además comprueba nombres accesibles de los
// controles, el botón de tema, el enlace de salto y el idioma del documento.
//
// Uso:  npm run verificar:a11y

import {readFileSync} from "node:fs";
import path from "node:path";
import {PAGINAS} from "./paginas.mjs";
import {servidor, navegador, contexto, abrir} from "./navegador.mjs";

const AXE = readFileSync(path.join(import.meta.dirname, "..", "node_modules", "axe-core", "axe.min.js"), "utf8");
const {srv, base} = await servidor();
const nav = await navegador();
const fallos = [], avisos = [], resumen = [];

for (const tema of ["claro", "oscuro"]) {
  const ctx = await contexto(nav, {tema, ventana: {width: 1400, height: 1000}});
  for (const p of PAGINAS) {
    const {page} = await abrir(ctx, base, p.ruta);
    // Se abren los desplegables para que axe mida también su contenido.
    await page.evaluate(() => { for (const d of document.querySelectorAll("#observablehq-main details")) d.open = true; });
    await page.waitForTimeout(300);
    await page.addScriptTag({content: AXE});
    const correrAxe = () => page.evaluate(async () => await window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]}}));
    let r = await correrAxe();
    // Mapa a pantalla completa: además de la vista inicial se miden la
    // pestaña «Información» (con sus desplegables abiertos) y una vista con
    // estado elegido, flecha fijada y comparación, que pintan otros bloques.
    if (p.mapa) {
      const juntar = (x) => { r = {...r, violations: [...r.violations, ...x.violations]}; };
      await page.click("#mapa-tab-info");
      await page.evaluate(() => { for (const d of document.querySelectorAll("#observablehq-main details")) d.open = true; });
      await page.waitForTimeout(200);
      juntar(await correrAxe());
      await page.goto(base + p.ruta + "?ent=12&comparar=no_migrantes&fija=12-22", {waitUntil: "load"});
      await page.waitForFunction(() => document.querySelector(".mapa-pantalla")?.dataset.pintado, null, {timeout: 30000}).catch(() => {});
      await page.waitForTimeout(500);
      await page.addScriptTag({content: AXE});
      juntar(await correrAxe());
      // Una regla que falla en varias vistas cuenta una vez.
      const vistas = new Map();
      for (const v of r.violations) vistas.set(v.id, vistas.has(v.id) ? {...v, nodes: [...vistas.get(v.id).nodes, ...v.nodes]} : v);
      r = {...r, violations: [...vistas.values()]};
    }
    const propias = await page.evaluate(() => {
      const sinNombre = [...document.querySelectorAll("button, a[href], input, select")].filter((el) => {
        const c = el.getBoundingClientRect();
        if (c.width < 2 || c.height < 2) return false;
        const alt = [...el.querySelectorAll("img[alt], svg[aria-label]")].map((i) => i.getAttribute("alt") || i.getAttribute("aria-label")).join(" ");
        const nombre = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || el.getAttribute("placeholder") || alt || "").trim();
        const label = el.id && document.querySelector(`label[for="${el.id}"]`);
        return !nombre && !label && !el.closest("label");
      }).map((el) => el.tagName + "." + String(el.className).slice(0, 30));
      const b = document.querySelector(".boton-tema");
      return {sinNombre, tema: Boolean(b) && b.textContent.trim().length > 0 && b.hasAttribute("aria-pressed"), salto: Boolean(document.querySelector(".saltar-contenido")), lang: document.documentElement.lang};
    });
    const graves = r.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    const leves = r.violations.filter((v) => !["serious", "critical"].includes(v.impact));
    resumen.push(`${tema.padEnd(7)} ${p.ruta.padEnd(24)} graves=${graves.length} leves=${leves.length} pasan=${r.passes.length} sinNombre=${propias.sinNombre.length}`);
    for (const v of graves) {
      const ejemplos = v.nodes.slice(0, 3).map((n) => `${n.target?.[0] ?? ""} · ${(n.failureSummary ?? "").split("\n")[1]?.trim() ?? ""}`);
      fallos.push(`[${tema}] ${p.ruta} — ${v.id} (${v.impact}): ${v.help}. Nodos: ${v.nodes.length}.\n      ${ejemplos.join("\n      ")}`);
    }
    for (const v of leves) avisos.push(`${v.id} (${v.impact}): ${v.help} · p. ej. ${p.ruta} ${v.nodes[0]?.target?.[0] ?? ""}`);
    if (propias.sinNombre.length) fallos.push(`[${tema}] ${p.ruta} — controles sin nombre accesible: ${propias.sinNombre.slice(0, 5).join(", ")}`);
    if (!propias.tema) fallos.push(`[${tema}] ${p.ruta} — el botón de tema no tiene texto o aria-pressed`);
    if (!propias.salto) fallos.push(`[${tema}] ${p.ruta} — falta el enlace de salto al contenido`);
    if (propias.lang !== "es") fallos.push(`[${tema}] ${p.ruta} — el documento no declara lang="es"`);
    await page.close();
  }
  await ctx.close();
}
await nav.close(); srv.close();

console.log(resumen.join("\n"));
if (avisos.length) {
  const unicos = new Map();
  for (const a of avisos) { const k = a.split(" · ")[0]; if (!unicos.has(k)) unicos.set(k, a); }
  console.log(`\nAVISOS (${unicos.size} reglas, no bloquean):`);
  for (const a of [...unicos.values()].slice(0, 25)) console.log("  · " + a);
}
console.log("\n" + "=".repeat(60));
if (fallos.length) {
  console.log(`FALLOS GRAVES (${fallos.length}):`);
  for (const f of [...new Set(fallos)].slice(0, 40)) console.log("  - " + f);
  process.exit(1);
}
console.log("Sin violaciones serias ni críticas de WCAG 2.1 A/AA en ninguna página ni tema.");
