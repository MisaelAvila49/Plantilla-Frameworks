// Comprueba que cada filtro CAMBIA el dibujo y que ninguna opción deja la
// gráfica vacía. Recorre las páginas de scripts/paginas.mjs que tienen
// filtros, y en cada sección cambia cada control a cada una de sus opciones.
//
// La huella del dibujo incluye POSICIONES además de colores y conteos: un
// filtro que solo mueve puntos no se ve contando marcas. Se revisa:
//   - que toda opción deje una figura con marcas (nunca «Sin dato»);
//   - que cada control produzca al menos dos huellas distintas (un control
//     cuyas opciones dan todas el mismo dibujo se quita y se explica);
//   - que el subtítulo de la figura cambie con el filtro que nombra;
//   - que no haya errores al repintar.
//
// Uso:  npm run verificar:filtros

import {PAGINAS, VENTANAS} from "./paginas.mjs";
import {servidor, navegador, contexto, abrir} from "./navegador.mjs";
import {filtrosMapa} from "./verificar_mapa.mjs";
import {filtrosCatalogo} from "./verificar_catalogo.mjs";

const {srv, base} = await servidor();
const nav = await navegador();
const ctx = await contexto(nav, {tema: "claro", ventana: VENTANAS.escritorio});
const fallos = [], resumen = [];
const MAX_OPCIONES = 8;

const huella = (page, i) => page.evaluate((i) => {
  const s = document.querySelectorAll(".analisis")[i];
  const cuerpo = s.querySelector(".figura-cuerpo");
  if (!cuerpo) return {firma: "", marcas: 0, vacia: true, error: s.dataset.error ?? null, subtitulo: ""};
  const base = cuerpo.getBoundingClientRect();
  const piezas = [...cuerpo.querySelectorAll("svg :is(path, rect, circle, line, ellipse, polygon, use):not(defs *, symbol *, pattern *, clipPath *)")].map((n) => {
    const r = n.getBoundingClientRect();
    return [Math.round(r.left - base.left), Math.round(r.top - base.top), Math.round(r.width), Math.round(r.height), n.getAttribute("fill") ?? "", n.getAttribute("stroke") ?? ""].join(",");
  });
  return {firma: piezas.join(";"), marcas: piezas.length, vacia: Boolean(s.querySelector(".figura-vacia")), error: s.dataset.error ?? null,
    subtitulo: s.querySelector(".figura-subtitulo")?.textContent.trim() ?? ""};
}, i);

for (const p of PAGINAS.filter((x) => x.filtros || x.catalogo)) {
  const {page, errores} = await abrir(ctx, base, p.ruta);
  // Catálogo de formas: pestañas, botones, nivel, buscador y URL.
  if (p.catalogo) {
    const r = await filtrosCatalogo(page, base, p.ruta);
    for (const f of r.fallas) fallos.push(`${p.ruta} catálogo — ${f}`);
    for (const e of errores) fallos.push(`${p.ruta} — error de JavaScript al filtrar: ${e.slice(0, 160)}`);
    resumen.push(`${p.ruta.padEnd(26)} catálogo pestañas=${r.pestanas} cambios probados=${r.cambios}`);
    await page.close();
    continue;
  }
  // Mapa a pantalla completa: un solo panel en la columna lateral.
  if (p.mapa) {
    const r = await filtrosMapa(page);
    for (const f of r.fallas) fallos.push(`${p.ruta} mapa — ${f}`);
    for (const e of errores) fallos.push(`${p.ruta} — error de JavaScript al filtrar: ${e.slice(0, 160)}`);
    resumen.push(`${p.ruta.padEnd(26)} mapa controles=${r.controles} cambios probados=${r.cambios}`);
    await page.close();
    continue;
  }
  const nSec = await page.locator(".analisis").count();
  let controles = 0, cambios = 0;
  for (let i = 0; i < nSec; i++) {
    const sec = page.locator(".analisis").nth(i);
    const id = await sec.getAttribute("data-analisis");
    const selects = sec.locator(".panel-filtros select");
    const nSel = await selects.count();
    // Un campo oculto (el grado sin tipo elegido, los campos del mapa en
    // vista de gráfica) no se prueba desde el estado inicial: se prueba
    // cuando el campo que lo gobierna lo hace visible, una sola vez.
    const visible = (sel) => sel.evaluate((n) => !n.closest("[hidden]") && n.getBoundingClientRect().height > 0);
    const probados = new Set();
    // Ningún campo oculto se pinta (R65): se mide, no se lee el atributo.
    const pintados = await sec.evaluate((s) => [...s.querySelectorAll(".panel-filtros .campo[hidden]")].filter((c) => c.getBoundingClientRect().height > 0).length);
    if (pintados) fallos.push(`${p.ruta} ${id} — ${pintados} campo(s) con hidden siguen pintados`);
    const probar = async (k, contexto = "") => {
      const sel = selects.nth(k);
      const nombre = await sel.getAttribute("name");
      if (probados.has(nombre) || (await sel.isDisabled()) || !(await visible(sel))) return;
      probados.add(nombre);
      const inicial = await sel.inputValue();
      const opciones = (await sel.locator("option").evaluateAll((os) => os.map((o) => o.value))).slice(0, MAX_OPCIONES);
      const rotulo = contexto ? `«${nombre}» (con ${contexto})` : `«${nombre}»`;
      if (opciones.length < 2) { fallos.push(`${p.ruta} ${id} — el filtro ${rotulo} ofrece una sola opción y no está deshabilitado`); return; }
      controles++;
      const firmas = new Set(), subtitulos = new Set(), pendientes = new Map();
      for (const o of opciones) {
        await sel.selectOption(o);
        await page.waitForTimeout(120);
        const h = await huella(page, i);
        cambios++;
        if (h.error) fallos.push(`${p.ruta} ${id} — ${rotulo} = ${o}: ${h.error}`);
        else if (h.vacia || h.marcas < 4) fallos.push(`${p.ruta} ${id} — ${rotulo} = ${o} deja la gráfica vacía (${h.marcas} marcas): el selector ofrece una opción sin dato`);
        firmas.add(h.firma); subtitulos.add(h.subtitulo);
        for (let k2 = 0; k2 < nSel; k2++) {
          if (k2 === k || pendientes.has(k2)) continue;
          const s2 = selects.nth(k2);
          if (!probados.has(await s2.getAttribute("name")) && !(await s2.isDisabled()) && (await visible(s2))) pendientes.set(k2, o);
        }
      }
      if (firmas.size < 2) fallos.push(`${p.ruta} ${id} — el filtro ${rotulo} no cambia el dibujo con ninguna de sus ${opciones.length} opciones`);
      if (subtitulos.size < 2) fallos.push(`${p.ruta} ${id} — el subtítulo de la figura no cambia al mover ${rotulo}`);
      await sel.selectOption(inicial);
      await page.waitForTimeout(80);
      // Los campos que solo aparecen con otra opción de este campo.
      for (const [k2, o] of pendientes) {
        if (await visible(selects.nth(k2))) continue; // ya visibles en el estado inicial: los prueba el recorrido normal
        await sel.selectOption(o);
        await page.waitForTimeout(120);
        await probar(k2, `${nombre} = ${o}`);
        await sel.selectOption(inicial);
        await page.waitForTimeout(80);
      }
    };
    for (let k = 0; k < nSel; k++) await probar(k);
    // Umbral escrito como frase: mover la cifra tiene que cambiar el dibujo.
    const umbral = sec.locator(".panel-filtros input[type=number]");
    if (await umbral.count()) {
      controles++;
      const antes = await huella(page, i);
      const max = +(await umbral.getAttribute("max")), paso = +(await umbral.getAttribute("step"));
      await umbral.fill(String(Math.round(max / 2 / paso) * paso)); await umbral.dispatchEvent("change");
      await page.waitForTimeout(150);
      const medio = await huella(page, i);
      if (medio.firma === antes.firma) fallos.push(`${p.ruta} ${id} — el umbral no cambia el dibujo`);
      await umbral.fill(String(max)); await umbral.dispatchEvent("change");
      await page.waitForTimeout(150);
      const tope = await huella(page, i);
      if (tope.error) fallos.push(`${p.ruta} ${id} — umbral al máximo: ${tope.error}`);
      if (!tope.marcas && !tope.vacia) fallos.push(`${p.ruta} ${id} — umbral al máximo deja la figura en blanco, sin aviso`);
    }
  }
  for (const e of errores) fallos.push(`${p.ruta} — error de JavaScript al filtrar: ${e.slice(0, 160)}`);
  resumen.push(`${p.ruta.padEnd(26)} secciones=${nSec} controles=${controles} cambios probados=${cambios}`);
  await page.close();
}
await ctx.close(); await nav.close(); srv.close();

console.log(resumen.join("\n"));
console.log("\n" + "=".repeat(60));
if (fallos.length) {
  console.log(`FALLOS (${fallos.length}):`);
  for (const f of [...new Set(fallos)].slice(0, 60)) console.log("  - " + f);
  process.exit(1);
}
console.log("Todos los filtros cambian el dibujo y ninguna opción deja la gráfica vacía.");
