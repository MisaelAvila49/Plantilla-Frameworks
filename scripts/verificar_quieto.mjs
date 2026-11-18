// Comprueba que el panel de filtros pegajoso NO mueve la página en reposo.
// Al fijarse arriba el panel se compacta; si eso cambiara el largo de la
// página, cerca del final de cada sección el panel se pegaría y despegaría
// solo y la pantalla temblaría. Se coloca la ventana en 16 posiciones junto
// al final de cada sección y se vigila un segundo: no debe cambiar ni la
// clase del panel ni la posición del scroll. También mide el alto del panel
// fijo (tope de 110 px en escritorio).
//
// Uso:  npm run verificar:quieto            todas las páginas con filtros
//       node scripts/verificar_quieto.mjs seccion-modelo

import {PAGINAS as LISTA, VENTANAS as V, rutasDe} from "./paginas.mjs";
import {servidor, navegador, contexto, abrir} from "./navegador.mjs";

// Las páginas de mapa a pantalla completa (`mapa: true`) no tienen panel
// pegajoso: su panel vive en su propia columna con scroll.
const PAGINAS = rutasDe(process.argv.slice(2), LISTA.filter((p) => p.filtros && !p.mapa).map((p) => p.ruta));
const VENTANAS = [V.escritorio, V.grande];
const PASOS = Array.from({length: 16}, (_, i) => 300 - 20 * i); // 300, 280, ..., 0
const ALTO_MAXIMO = 110;

const {srv, base} = await servidor();
const nav = await navegador();

async function revisarPagina(ruta, ventana) {
  const ctx = await contexto(nav, {ventana});
  const {page: p} = await abrir(ctx, base, ruta);
  const nSec = await p.evaluate(() => document.querySelectorAll("#observablehq-main .panel-filtros[data-compacto]").length);
  const resultados = [];
  for (let i = 0; i < nSec; i++) {
    for (const d of PASOS) {
      const r = await p.evaluate(async ({i, d}) => {
        const panel = document.querySelectorAll("#observablehq-main .panel-filtros[data-compacto]")[i];
        const seccion = panel.parentElement;
        const fin = seccion.getBoundingClientRect().bottom + scrollY;
        scrollTo(0, Math.max(0, Math.round(fin - d)));
        await new Promise((res) => setTimeout(res, 400));
        let cambiosClase = 0, cambiosScroll = 0, ultimoY = scrollY, sigue = true;
        const mo = new MutationObserver((ms) => { cambiosClase += ms.length; });
        for (const el of document.querySelectorAll("#observablehq-main .panel-filtros[data-compacto]")) mo.observe(el, {attributes: true, attributeFilter: ["class", "style"]});
        const mirar = () => { if (!sigue) return; if (scrollY !== ultimoY) { cambiosScroll++; ultimoY = scrollY; } requestAnimationFrame(mirar); };
        requestAnimationFrame(mirar);
        await new Promise((res) => setTimeout(res, 700));
        sigue = false; mo.disconnect();
        const pegado = panel.classList.contains("pegado");
        return {d, cambiosClase, cambiosScroll, pegado, alto: pegado ? Math.round(panel.getBoundingClientRect().height) : 0};
      }, {i, d});
      resultados.push({seccion: i + 1, ...r});
    }
  }
  await ctx.close();
  return {nSec, resultados};
}

let totalPos = 0, totalMalas = 0, altoMayor = 0, pegados = 0;
const malas = [];
for (const v of VENTANAS) {
  console.log(`\n=== ${v.width} x ${v.height} ===`);
  const cola = [...PAGINAS];
  const trabajo = async () => {
    while (cola.length) {
      const ruta = cola.shift();
      const {nSec, resultados} = await revisarPagina(ruta, v);
      const m = resultados.filter((r) => r.cambiosClase || r.cambiosScroll);
      totalPos += resultados.length; totalMalas += m.length;
      pegados += resultados.filter((r) => r.pegado).length;
      const alto = Math.max(0, ...resultados.map((r) => r.alto));
      altoMayor = Math.max(altoMayor, alto);
      console.log(`${m.length ? "FALLA" : "ok   "} ${ruta.padEnd(26)} paneles=${String(nSec).padStart(2)} posiciones=${String(resultados.length).padStart(3)} con cambios=${String(m.length).padStart(3)} alto fijo máx=${alto} px`);
      for (const r of m) malas.push(`${v.width}x${v.height} ${ruta} panel ${r.seccion} a ${r.d} px del final: clase ${r.cambiosClase}, scrollY ${r.cambiosScroll}`);
      if (alto > ALTO_MAXIMO) { totalMalas++; malas.push(`${v.width}x${v.height} ${ruta}: el panel fijo mide ${alto} px (tope ${ALTO_MAXIMO})`); }
    }
  };
  await Promise.all([trabajo(), trabajo(), trabajo()]);
}
await nav.close(); srv.close();
console.log("\n" + "=".repeat(60));
console.log(`Posiciones revisadas: ${totalPos}; con el panel fijo: ${pegados}; con cambios: ${totalMalas}; alto máximo del panel fijo: ${altoMayor} px`);
for (const m of malas.slice(0, 40)) console.log("  " + m);
if (!pegados) { console.log("Ningún panel llegó a fijarse: la prueba no midió nada."); process.exit(1); }
if (totalMalas) { console.log("El panel pegajoso mueve la página en reposo o mide de más."); process.exit(1); }
console.log("Ninguna posición cambia de clase ni de scroll en reposo.");
