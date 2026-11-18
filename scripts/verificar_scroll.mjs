// Comprueba que la rueda del ratón mueve la página SIEMPRE en el sentido
// pedido y que la página no se mueve sola entre un paso y el siguiente.
// Reporte de origen: «intento subir en algunas gráficas y no me deja, me baja
// automáticamente». Se recorre cada página con pasos de rueda reales
// (page.mouse.wheel) con el puntero SOBRE las figuras: primero hasta el fondo
// y luego hasta arriba. En cada paso se registra scrollY antes y después y,
// tras ~250 ms quieto, si scrollY cambió solo (salto espontáneo) y cuánto se
// movió el contenido por encima de la vista. Además:
//   · «ancla»: se entra directo al fondo (como al seguir un enlace del índice
//     o al recargar) y se sube; las secciones de arriba se dibujan entonces
//     POR ENCIMA de la vista.
//   · «figura»: con el puntero sobre cada mapa, multitud y fracción se sube
//     y se baja unos pasos; ninguna debe capturar la rueda.
//
// Uso:  npm run verificar:scroll              todas las páginas
//       node scripts/verificar_scroll.mjs galeria/mapas
//       SCROLL_RAPIDO=1 ...                    solo 1366 x 768 y movimiento reducido

import {PAGINAS as LISTA, VENTANAS as V, rutasDe} from "./paginas.mjs";
import {servidor, navegador, contexto} from "./navegador.mjs";

const PAGINAS = rutasDe(process.argv.slice(2), LISTA.map((p) => p.ruta));
const RAPIDO = !!process.env.SCROLL_RAPIDO;
const VENTANAS = RAPIDO ? [V.escritorio] : [V.escritorio, V.grande, V.movil];
const MOVIMIENTOS = RAPIDO ? ["reduce"] : ["reduce", "no-preference"];
const PASO = 240;            // px por paso de rueda (dos o tres muescas)
const ESPERA = 250;          // ms de vigilancia en reposo tras cada paso
const SALTO_MAXIMO = 4;      // px que puede moverse sola la página
// Mapas (mapa base propio o geo de Plot), multitud y fracción, y las formas
// de SVG propio con muchas marcas enfocables: riel, mosaicos partidos y de
// fracciones, ternario y unidades en espejo.
// .mapa-lienzo svg: el mapa de flujos a pantalla completa (src/mapa.md).
const FIGURAS_RUEDA = ".mapa-lienzo svg, svg.multitud, .fraccion, .figura-cuerpo svg:has(g.mapa-base), .figura-cuerpo svg:has(g[aria-label='geo']), svg.riel, svg.mosaico-triangulos, svg.mosaico-fracciones, svg.ternario, svg.unidades-espejo";

const {srv, base} = await servidor();
const nav = await navegador();

// Espera a que el scroll se asiente (la rueda puede animarse unos cuadros).
async function asentar(p) {
  return p.evaluate(async () => {
    let y = scrollY, quietos = 0, t0 = performance.now();
    while (quietos < 4 && performance.now() - t0 < 1500) {
      await new Promise((r) => requestAnimationFrame(r));
      if (scrollY === y) quietos++; else { quietos = 0; y = scrollY; }
    }
    return scrollY;
  });
}

// Elemento de referencia: lo que el lector está viendo a media pantalla. Se
// juzga por él y no por scrollY: cuando una sección se dibuja POR ENCIMA de la
// vista, el anclaje de scroll del navegador cambia scrollY justo para que lo
// visible NO se mueva, y eso no es un salto. Se descartan el panel pegajoso,
// el globo y las secciones que aún no se dibujan (cambian de alto solas).
async function marcarReferencia(p) {
  return p.evaluate(() => {
    const x = Math.min(innerWidth - 2, Math.max(2, (document.querySelector("#observablehq-main")?.getBoundingClientRect().left ?? 0) + 40));
    window.__ref = null;
    for (const f of [0.5, 0.62, 0.38, 0.75, 0.25]) {
      let el = document.elementFromPoint(x, innerHeight * f);
      if (!el || el === document.body || el === document.documentElement) continue;
      let malo = false;
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).position === "sticky" || a.classList?.contains("globo-tarjeta") || (a.classList?.contains("analisis") && !a.dataset.pintado)) { malo = true; break; }
      }
      if (malo) continue;
      // Un contenedor de secciones (el <main> cuando el punto cae en un hueco
      // entre bloques) no es «lo que se ve»: su borde superior queda muy
      // arriba de la vista y se mueve con todo lo que se dibuja encima, que
      // es justo lo que el anclaje de scroll compensa. Se toma otro punto.
      if (el.querySelector?.(".analisis")) continue;
      window.__ref = el;
      return el.getBoundingClientRect().top;
    }
    return null;
  });
}
const posReferencia = (p) => p.evaluate(() => (window.__ref?.isConnected ? window.__ref.getBoundingClientRect().top : null));

// Vigila el reposo: cuánto se mueve solo lo que se ve (y scrollY, como dato)
// y cuánto se desplaza el contenido de arriba (posición en el documento del
// elemento que está en el borde superior de la vista).
async function vigilar(p, ms) {
  return p.evaluate(async (ms) => {
    const ancla = () => {
      const x = Math.min(innerWidth - 2, Math.max(2, document.querySelector("#observablehq-main")?.getBoundingClientRect().left + 40 || 40));
      for (const y of [140, 220, 320]) {
        let el = document.elementFromPoint(x, y);
        while (el && el !== document.body && getComputedStyle(el).position === "sticky") el = el.parentElement;
        if (el && el !== document.body && el !== document.documentElement) return el;
      }
      return null;
    };
    const el = ancla();
    const ref = window.__ref?.isConnected ? window.__ref : null;
    const y0 = scrollY, top0 = el ? el.getBoundingClientRect().top + scrollY : null, alto0 = document.documentElement.scrollHeight;
    const ref0 = ref ? ref.getBoundingClientRect().top : null;
    let maxDesvio = 0, maxDesvioVista = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      await new Promise((r) => requestAnimationFrame(r));
      maxDesvio = Math.max(maxDesvio, Math.abs(scrollY - y0));
      if (ref?.isConnected) maxDesvioVista = Math.max(maxDesvioVista, Math.abs(ref.getBoundingClientRect().top - ref0));
    }
    const top1 = el && el.isConnected ? el.getBoundingClientRect().top + scrollY : null;
    return {y0, y1: scrollY, maxDesvio, maxDesvioVista: ref ? maxDesvioVista : maxDesvio, desplazaArriba: top0 != null && top1 != null ? Math.round(top1 - top0) : 0, cambioLargo: document.documentElement.scrollHeight - alto0};
  }, ms);
}

// Pone el puntero sobre la figura más visible; si no hay, al centro del texto.
async function apuntar(p) {
  const pt = await p.evaluate(() => {
    let mejor = null, area = 0;
    for (const f of document.querySelectorAll("#observablehq-main .figura-cuerpo")) {
      const r = f.getBoundingClientRect();
      const h = Math.min(r.bottom, innerHeight - 4) - Math.max(r.top, 130);
      if (h > 20 && r.width > 20 && h * r.width > area) { area = h * r.width; mejor = {f, r, h}; }
    }
    const nombre = (el) => el?.closest(".analisis")?.dataset.analisis ?? (el?.closest("section,div[id]")?.id || "texto");
    if (mejor) {
      const y = Math.max(mejor.r.top, 130) + mejor.h / 2;
      return {x: mejor.r.left + Math.min(mejor.r.width / 2, 300), y, sobre: nombre(mejor.f)};
    }
    const m = document.querySelector("#observablehq-main")?.getBoundingClientRect();
    return {x: m ? m.left + Math.min(m.width / 2, 300) : innerWidth / 2, y: innerHeight / 2, sobre: "texto"};
  });
  await p.mouse.move(pt.x, pt.y);
  return pt.sobre;
}

async function paso(p, dy, sobre) {
  const antes = await p.evaluate(() => ({y: scrollY, max: document.documentElement.scrollHeight - innerHeight}));
  const ref0 = await marcarReferencia(p);
  await p.mouse.wheel(0, dy);
  const despues = await asentar(p);
  const ref1 = await posReferencia(p);
  const v = await vigilar(p, ESPERA);
  // Lo que el lector ve moverse: el contenido sube cuando la página baja.
  const movidoY = despues - antes.y;
  const movido = ref0 != null && ref1 != null ? ref0 - ref1 : movidoY;
  const disponible = dy > 0 ? antes.max - antes.y : antes.y;
  const esperado = Math.min(Math.abs(dy), Math.max(0, disponible));
  const bloqueado = esperado > 2 && (Math.sign(movido) !== Math.sign(dy) || Math.abs(movido) < esperado * 0.5);
  const salto = v.maxDesvioVista > SALTO_MAXIMO;
  return {dy, sobre, y0: antes.y, y1: despues, y2: v.y1, movido, movidoY, esperado, bloqueado, salto, desvio: v.maxDesvioVista, desvioY: v.maxDesvio, desplazaArriba: v.desplazaArriba, cambioLargo: v.cambioLargo, enBorde: disponible <= 2};
}

async function recorrer(p, sentido, fase, registro) {
  const dy = sentido * PASO;
  let quietosEnBorde = 0;
  for (let i = 0; i < 400; i++) {
    const sobre = await apuntar(p);
    const r = await paso(p, dy, sobre);
    registro.push({fase, ...r});
    if (r.enBorde) { if (++quietosEnBorde >= 2) break; } else quietosEnBorde = 0;
    // Al bajar, un paso al fondo puede haber cargado más página: se sigue.
  }
}

async function revisar(ruta, ventana, movimiento) {
  const ctx = await contexto(nav, {ventana, movimiento});
  const p = await ctx.newPage();
  const errores = [];
  p.on("pageerror", (e) => errores.push(String(e.message ?? e)));
  const abrirLimpio = async () => {
    await p.goto(base + ruta, {waitUntil: "load", timeout: 120000});
    await p.waitForFunction(() => !document.querySelector("observablehq-loading"), null, {timeout: 90000}).catch(() => {});
    await p.waitForTimeout(600);
  };
  const registro = [];

  // 1. Desde arriba: bajar con la rueda hasta el fondo y volver a subir.
  await abrirLimpio();
  await p.mouse.move(ventana.width / 2, ventana.height / 2);
  await recorrer(p, +1, "bajar", registro);
  await recorrer(p, -1, "subir", registro);

  // 2. Entrar directo al fondo y subir: las secciones intermedias no se han
  // dibujado y se dibujan por encima de la vista.
  await abrirLimpio();
  await p.evaluate(() => scrollTo({top: document.documentElement.scrollHeight, behavior: "instant"}));
  await p.waitForTimeout(400);
  await recorrer(p, -1, "ancla", registro);

  // 3. Con el puntero quieto sobre cada mapa, multitud y fracción.
  const nFig = await p.evaluate((sel) => document.querySelectorAll(sel).length, FIGURAS_RUEDA);
  for (let i = 0; i < nFig; i++) {
    const info = await p.evaluate(async ({sel, i}) => {
      const el = document.querySelectorAll(sel)[i];
      const r0 = el.getBoundingClientRect();
      scrollTo({top: Math.max(0, r0.top + scrollY - innerHeight / 2 + Math.min(r0.height, innerHeight * 0.5) / 2), behavior: "instant"});
      await new Promise((r) => setTimeout(r, 300));
      const r = el.getBoundingClientRect();
      const y = Math.min(Math.max(r.top + Math.min(r.height, 200) / 2, 140), innerHeight - 20);
      return {x: r.left + Math.min(r.width / 2, 260), y, nombre: (el.closest(".analisis")?.dataset.analisis ?? "?") + " (" + (el.getAttribute("class") || el.tagName).split(" ")[0] + ")"};
    }, {sel: FIGURAS_RUEDA, i});
    for (const dy of [-PASO, -PASO, PASO, PASO]) {
      await p.mouse.move(info.x, info.y);
      // El puntero se queda en el mismo punto de la ventana: como un lector
      // que gira la rueda sin mover la mano.
      registro.push({fase: "figura", ...(await paso(p, dy, info.nombre))});
    }
  }
  await ctx.close();
  return {registro, errores, nFig};
}

const etiqueta = (v, m) => `${v.width}x${v.height} ${m === "reduce" ? "reducido" : "con movimiento"}`;
let totalPasos = 0, totalBloq = 0, totalSaltos = 0, totalFig = 0;
const detalles = [];
for (const v of VENTANAS) for (const m of MOVIMIENTOS) {
  console.log(`\n=== ${etiqueta(v, m)} ===`);
  const cola = [...PAGINAS];
  const trabajo = async () => {
    while (cola.length) {
      const ruta = cola.shift();
      let res;
      try { res = await revisar(ruta, v, m); }
      catch (e) { console.log(`ERROR ${ruta}: ${e.message}`); totalBloq++; continue; }
      const {registro, errores, nFig} = res;
      const bloq = registro.filter((r) => r.bloqueado), saltos = registro.filter((r) => r.salto);
      totalPasos += registro.length; totalBloq += bloq.length; totalSaltos += saltos.length; totalFig += nFig;
      const porFase = (f) => registro.filter((r) => r.fase === f).length;
      const maxArriba = Math.max(0, ...registro.map((r) => Math.abs(r.desplazaArriba)));
      console.log(`${bloq.length || saltos.length ? "FALLA" : "ok   "} ${ruta.padEnd(24)} pasos bajar/subir/ancla/figura=${porFase("bajar")}/${porFase("subir")}/${porFase("ancla")}/${porFase("figura")} bloqueados=${bloq.length} saltos=${saltos.length} contenido de arriba movido máx=${maxArriba} px${errores.length ? " errores JS=" + errores.length : ""}`);
      for (const r of [...bloq, ...saltos].slice(0, 12)) {
        detalles.push(`${etiqueta(v, m)} ${ruta} [${r.fase}] sobre ${r.sobre}: rueda ${r.dy > 0 ? "+" : ""}${r.dy}, scrollY ${Math.round(r.y0)} -> ${Math.round(r.y1)} -> ${Math.round(r.y2)} en reposo (esperado ${r.dy > 0 ? "+" : "-"}${Math.round(r.esperado)}; lo visible se movió ${Math.round(r.movido)}; desvío en reposo ${Math.round(r.desvio)} px a la vista, ${Math.round(r.desvioY)} en scrollY; contenido de arriba ${r.desplazaArriba} px; largo ${r.cambioLargo > 0 ? "+" : ""}${r.cambioLargo} px)${r.bloqueado ? " BLOQUEADO" : ""}${r.salto ? " SALTO" : ""}`);
      }
    }
  };
  await Promise.all([trabajo(), trabajo(), trabajo()]);
}
await nav.close(); srv.close();
console.log("\n" + "=".repeat(60));
console.log(`Pasos de rueda: ${totalPasos}; figuras con rueda probadas: ${totalFig}; bloqueados: ${totalBloq}; saltos espontáneos > ${SALTO_MAXIMO} px: ${totalSaltos}`);
for (const d of detalles.slice(0, 60)) console.log("  " + d);
if (!totalPasos) { console.log("No se dio ningún paso: la prueba no midió nada."); process.exit(1); }
if (totalBloq || totalSaltos) { console.log("La rueda no mueve la página como se pide o la página se mueve sola."); process.exit(1); }
console.log("Todos los pasos de rueda se movieron en el sentido pedido y la página no se movió sola.");
