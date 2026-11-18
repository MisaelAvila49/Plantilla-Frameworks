// Comprobaciones propias del CATÁLOGO DE FORMAS (`catalogo: true` en
// scripts/paginas.mjs). Las usan verificar_render.mjs y verificar_filtros.mjs:
// esa página no tiene secciones `.analisis` sino tarjetas, así que se cuentan
// tarjetas, enlaces y miniaturas, y se prueba que cada pestaña y cada botón
// cambien el conjunto de tarjetas.
//
// No se corre solo: lo importan los verificadores.

import {readFileSync} from "node:fs";
import path from "node:path";

// Lo que la página debe mostrar sale de los mismos datos que publica.
export function datosCatalogo() {
  const {fichas} = JSON.parse(readFileSync(path.join(import.meta.dirname, "..", "src", "data", "catalogo.json"), "utf8"));
  return {
    total: fichas.length,
    enGaleria: fichas.filter((f) => f.enGaleria).length,
    conMiniatura: fichas.filter((f) => f.miniatura).length,
    conOscura: fichas.filter((f) => f.miniatura?.oscuro).length,
    destinos: fichas.filter((f) => f.enGaleria).map((f) => ({id: f.id, pagina: f.pagina, ancla: f.ancla})),
  };
}

// Medidas de la página ya abierta (y recorrida, para que carguen las
// miniaturas diferidas).
export async function medirCatalogo(page) {
  return await page.evaluate(() => {
    const items = [...document.querySelectorAll(".cat-item")];
    const imgs = [...document.querySelectorAll(".cat-mini img")];
    return {
      tarjetas: items.length,
      grupos: document.querySelectorAll(".cat-grupo").length,
      enlaces: [...document.querySelectorAll("a.cat-enlace[href]")].map((a) => ({id: a.closest(".cat-tarjeta").id.replace(/^forma-/, ""), href: a.getAttribute("href"), nombre: a.textContent.trim().length})),
      anidados: document.querySelectorAll("a.cat-enlace a, a.cat-enlace button, a.cat-enlace details").length,
      enObra: document.querySelectorAll(".cat-en-obra").length,
      sellosObra: document.querySelectorAll(".cat-sello-obra").length,
      sellosGaleria: document.querySelectorAll(".cat-sello-galeria").length,
      detalles: document.querySelectorAll(".cat-tarjeta > details.cat-detalle").length,
      siluetas: document.querySelectorAll(".cat-mini svg.cat-silueta").length,
      imgs: imgs.length,
      lazy: imgs.filter((i) => i.loading === "lazy").length,
      rotas: imgs.filter((i) => i.complete && i.getAttribute("src") && i.naturalWidth === 0).map((i) => i.getAttribute("src")),
      cargadas: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
      oscuras: imgs.filter((i) => /-oscuro\.[0-9a-f]+\.png$|-oscuro\.png$/.test(i.getAttribute("src") ?? "")).length,
      fuentes: imgs.map((i) => i.getAttribute("src")).join("|"),
      cuenta: document.querySelector(".cat-cuenta")?.textContent.trim() ?? "",
      pestanas: document.querySelectorAll(".cat-pestanas [role=tab]").length,
      descartes: document.querySelectorAll(".cat-descartes tbody tr").length,
      recetas: document.querySelector(".cat-recetas a[href]")?.getAttribute("href") ?? "",
      h1: document.querySelectorAll("#observablehq-main h1").length,
      desborde: document.documentElement.scrollWidth - innerWidth,
    };
  });
}

// Cada «Ver implementada» lleva a una sección que EXISTE: se abre cada página
// destino y se busca el ancla del índice y la sección con ese nombre.
export async function revisarDestinos(ctx, base, enlaces) {
  const fallas = [];
  const porPagina = new Map();
  for (const e of enlaces) {
    const url = new URL(e.href, base + "/catalogo");
    const pagina = url.pathname;
    (porPagina.get(pagina) ?? porPagina.set(pagina, []).get(pagina)).push({...e, ancla: decodeURIComponent(url.hash.slice(1))});
  }
  let revisados = 0;
  for (const [pagina, lista] of porPagina) {
    const page = await ctx.newPage();
    const r = await page.goto(base + pagina, {waitUntil: "load", timeout: 120000});
    if (!r || r.status() >= 400) { fallas.push(`${pagina} responde ${r?.status()}`); await page.close(); continue; }
    await page.waitForFunction(() => !document.querySelector("observablehq-loading"), null, {timeout: 90000}).catch(() => {});
    for (const e of lista) {
      // La sección la arma una celda que primero espera sus datos.
      await page.waitForSelector(`section.analisis[aria-labelledby="${e.ancla}"]`, {state: "attached", timeout: 45000}).catch(() => {});
      const ok = await page.evaluate((a) => ({
        ancla: Boolean(document.getElementById(a)?.matches("h2.toc-anchor")),
        seccion: Boolean(document.querySelector(`section.analisis[aria-labelledby="${CSS.escape(a)}"]`)),
      }), e.ancla);
      revisados++;
      if (!ok.ancla) fallas.push(`«${e.id}» lleva a ${pagina}#${e.ancla}, que no tiene su ancla h2.toc-anchor`);
      else if (!ok.seccion) fallas.push(`«${e.id}» lleva a ${pagina}#${e.ancla}, que no tiene sección .analisis con ese nombre`);
    }
    await page.close();
  }
  return {fallas, revisados, paginas: porPagina.size};
}

// Filtros: cada pestaña cambia el panel y (salvo Función, que agrupa igual que
// Todas) los grupos; cada botón de opción, cada nivel y el buscador cambian el
// conjunto de tarjetas, dejan al menos una y su cuenta coincide con la del
// botón; la URL guarda la selección y la reproduce al abrirla.
export async function filtrosCatalogo(page, base, ruta) {
  const fallas = [];
  let cambios = 0;
  const huella = () => page.evaluate(() => ({
    ids: [...document.querySelectorAll(".cat-grupos .cat-tarjeta")].map((t) => t.id).join(","),
    grupos: [...document.querySelectorAll(".cat-grupo-titulo")].map((h) => h.firstChild.textContent.trim()).join("|"),
    n: document.querySelectorAll(".cat-grupos .cat-tarjeta").length,
    vacio: !document.querySelector(".cat-vacio").hidden,
    url: location.search,
    panel: [...document.querySelectorAll(".cat-panel")].filter((p) => !p.hidden).map((p) => p.id).join(","),
  }));
  const base0 = await huella();
  if (base0.n < 10) fallas.push(`sin filtros solo hay ${base0.n} tarjetas`);

  // Pestañas.
  const tabs = await page.locator(".cat-pestanas [role=tab]").evaluateAll((ts) => ts.map((t) => t.dataset.vista));
  for (const v of tabs) {
    await page.click(`#cat-pestana-${v}`);
    const h = await huella();
    cambios++;
    if (h.panel !== `cat-panel-${v}`) fallas.push(`la pestaña «${v}» no muestra su panel (${h.panel})`);
    if (h.ids.split(",").sort().join() !== base0.ids.split(",").sort().join()) fallas.push(`la pestaña «${v}» cambió las tarjetas sin filtro`);
    if (!["todas", "funcion"].includes(v) && h.grupos === base0.grupos) fallas.push(`la pestaña «${v}» no reagrupa las tarjetas`);
    if (v !== "todas" && !h.url.includes(`vista=${v}`)) fallas.push(`la pestaña «${v}» no queda en la URL (${h.url})`);
  }
  // Teclado (patrón APG): flecha derecha pasa a la pestaña siguiente.
  await page.click("#cat-pestana-todas");
  await page.keyboard.press("ArrowRight");
  const tecla = await page.evaluate(() => ({sel: document.querySelector(".cat-pestanas [aria-selected=true]")?.dataset.vista, foco: document.activeElement?.dataset?.vista}));
  if (tecla.sel !== "familia" || tecla.foco !== "familia") fallas.push(`la flecha derecha no pasa de «Todas» a «Familia» (${JSON.stringify(tecla)})`);

  // Botones de cada dimensión.
  for (const dim of tabs.filter((v) => v !== "todas")) {
    await page.click(`#cat-pestana-${dim}`);
    const botones = await page.locator(`[data-dim="${dim}"]`).evaluateAll((bs) => bs.map((b) => ({valor: b.dataset.valor, n: +b.querySelector("[data-cuenta]").textContent, deshabilitado: b.disabled})));
    for (const b of botones) {
      if (b.deshabilitado) { fallas.push(`${dim}=${b.valor} está deshabilitado sin filtros`); continue; }
      const sel = `[data-dim="${dim}"][data-valor="${b.valor}"]`;
      await page.locator(sel).scrollIntoViewIfNeeded();
      await page.click(sel);
      const h = await huella();
      cambios++;
      if (!h.n || h.vacio) fallas.push(`${dim}=${b.valor} deja el catálogo vacío`);
      if (h.n !== b.n) fallas.push(`${dim}=${b.valor}: el botón dice ${b.n} y se ven ${h.n} tarjetas`);
      if (h.ids === base0.ids && b.n === base0.n) fallas.push(`${dim}=${b.valor} no cambia el conjunto de tarjetas (lo tienen todas)`);
      if (!h.url.includes(`${dim}=${b.valor}`)) fallas.push(`${dim}=${b.valor} no queda en la URL (${h.url})`);
      const pulsado = await page.locator(sel).getAttribute("aria-pressed");
      if (pulsado !== "true") fallas.push(`${dim}=${b.valor} no queda con aria-pressed`);
      await page.click(sel);
      const h2 = await huella();
      if (h2.n !== base0.n) fallas.push(`${dim}=${b.valor}: al soltarlo no vuelven las ${base0.n} tarjetas (${h2.n})`);
    }
  }

  // Nivel.
  await page.click("#cat-pestana-todas");
  const niveles = await page.locator("[data-nivel]").evaluateAll((bs) => bs.map((b) => b.dataset.nivel).filter((v) => v !== "todos"));
  const vistos = new Set();
  for (const n of niveles) {
    await page.click(`[data-nivel="${n}"]`);
    const h = await huella();
    cambios++;
    if (!h.n) fallas.push(`nivel ${n} deja el catálogo vacío`);
    if (h.ids === base0.ids) fallas.push(`nivel ${n} no cambia el conjunto de tarjetas`);
    if (!h.url.includes(`nivel=${n}`)) fallas.push(`nivel ${n} no queda en la URL`);
    vistos.add(h.ids);
  }
  if (vistos.size !== niveles.length) fallas.push("dos niveles dan el mismo conjunto de tarjetas");
  await page.click(`[data-nivel="todos"]`);

  // Filtro combinado, chips de filtros activos y «Quitar filtros».
  await page.click("#cat-pestana-familia");
  const familia = await page.locator(`[data-dim="familia"]:not(:disabled)`).first().getAttribute("data-valor");
  await page.click(`[data-dim="familia"][data-valor="${familia}"]`);
  const soloFamilia = await huella();
  await page.click("#cat-pestana-forma");
  const forma = await page.locator(`[data-dim="forma"]:not(:disabled)`).first().getAttribute("data-valor");
  await page.click(`[data-dim="forma"][data-valor="${forma}"]`);
  const combinado = await huella();
  cambios++;
  if (!combinado.n || combinado.n > soloFamilia.n) fallas.push(`familia=${familia} y forma=${forma} juntos no acotan el conjunto (${soloFamilia.n} → ${combinado.n})`);
  const chips = await page.locator(".cat-activo").count();
  if (chips !== 2) fallas.push(`con dos filtros hay ${chips} chips de filtro activo`);
  // La URL reproduce la selección.
  const ctx = page.context();
  const otra = await ctx.newPage();
  await otra.goto(base + ruta + combinado.url, {waitUntil: "load"});
  await otra.waitForSelector(".cat-tarjeta", {timeout: 30000}).catch(() => {});
  const reabierta = await otra.evaluate(() => [...document.querySelectorAll(".cat-grupos .cat-tarjeta")].map((t) => t.id).join(","));
  if (reabierta !== combinado.ids) fallas.push(`al abrir ${combinado.url} no se reproduce la selección`);
  await otra.close();
  await page.click(".cat-activo >> nth=0");
  const sinUno = await huella();
  if (sinUno.n < combinado.n) fallas.push("quitar un chip no amplía el conjunto");
  await page.click(".cat-quitar");
  const limpio = await huella();
  if (limpio.n !== base0.n || limpio.url.match(/familia=|forma=|nivel=|q=/)) fallas.push(`«Quitar filtros» no vuelve al catálogo completo (${limpio.n}, ${limpio.url})`);

  // Buscador.
  await page.fill(".cat-buscar", "mapa");
  const busca = await huella();
  cambios++;
  if (!busca.n || busca.ids === base0.ids) fallas.push("buscar «mapa» no acota el conjunto");
  if (!busca.url.includes("q=mapa")) fallas.push("la búsqueda no queda en la URL");
  await page.fill(".cat-buscar", "zzzzqx");
  const nada = await huella();
  if (nada.n || !nada.vacio) fallas.push("una búsqueda sin coincidencias no muestra el aviso de vacío");
  await page.fill(".cat-buscar", "");
  return {fallas, cambios, pestanas: tabs.length};
}
