// Comprueba que cada página de scripts/paginas.mjs se DIBUJA de verdad.
// Una gráfica sin error en consola puede seguir vacía, así que se cuentan
// marcas reales en el SVG, en claro y en oscuro, en escritorio y a 390 px.
//
// Por página: sin errores de JavaScript; el número de secciones declarado en
// paginas.mjs; cada sección pintada y sin error; cada figura con marcas, con
// su título, su pie y su sello; los tres desplegables en su orden; ningún
// <title> nativo como globo; el globo normado abre y trae cifra y frase;
// los colores cambian entre temas; sin desborde horizontal.
//
// Uso:  npm run verificar:render

import {PAGINAS, VENTANAS} from "./paginas.mjs";
import {servidor, navegador, contexto, abrir} from "./navegador.mjs";
import {medirMapa, globoMapa, flujoDeUso} from "./verificar_mapa.mjs";
import {datosCatalogo, medirCatalogo, revisarDestinos} from "./verificar_catalogo.mjs";

const {srv, base} = await servidor();
const nav = await navegador();
const fallos = [], resumen = [];
const coloresPorTema = {};
// Colores por omisión de Plot y de d3: si aparecen, una marca no tomó su
// color de paleta.js.
const PROHIBIDOS = [...["4269d0", "efb118", "ff725c", "6cc5b0", "1f77b4"].map((c) => "#" + c), "steelblue"];

async function medir(page) {
  return await page.evaluate(() => {
    const marcas = (el) => el.querySelectorAll("svg :is(path, rect, circle, line, ellipse, polygon, use):not(defs *, symbol *, pattern *, clipPath *)").length;
    const colores = new Set();
    for (const n of document.querySelectorAll(".figura-cuerpo svg [fill], .figura-cuerpo svg [stroke]")) {
      for (const a of ["fill", "stroke"]) { const c = n.getAttribute(a); if (c && c !== "none" && c !== "currentColor" && !c.startsWith("url(")) colores.add(c.toLowerCase()); }
    }
    const secciones = [...document.querySelectorAll(".analisis")].map((s) => {
      const fig = s.querySelector("figure.figura");
      const desplegables = [...s.querySelectorAll(".desplegables details")].map((d) => d.querySelector("summary")?.textContent.trim());
      return {
        id: s.dataset.analisis, pintado: +(s.dataset.pintado ?? 0), error: s.dataset.error ?? null,
        marcas: fig ? marcas(fig.querySelector(".figura-cuerpo")) : 0,
        titulo: fig?.querySelector(".figura-titulo")?.textContent.trim() ?? "",
        pie: fig?.querySelector(".figura-pie")?.textContent.trim() ?? "",
        sello: fig?.querySelector(".figura-sello")?.textContent.trim() ?? "",
        vacia: Boolean(s.querySelector(".figura-vacia")),
        desplegables,
        filasTabla: s.querySelectorAll(".tabla-datos tbody tr").length,
        titulosNativos: s.querySelectorAll(".figura-cuerpo svg title").length,
        ancla: Boolean(document.querySelector(`h2.toc-anchor#${CSS.escape(s.dataset.analisis)}`)),
        mismoTitulo: document.querySelector(`h2.toc-anchor#${CSS.escape(s.dataset.analisis)}`)?.textContent.trim() === s.querySelector(".seccion-titulo")?.textContent.trim(),
      };
    });
    return {secciones, colores: [...colores], desborde: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll("#observablehq-main h1").length};
  });
}

// Abre el globo de una sección y devuelve lo que muestra.
async function globoDe(page, i) {
  const sec = page.locator(".analisis").nth(i);
  await sec.scrollIntoViewIfNeeded();
  // El panel pegajoso se compacta al desplazarse: se espera a que la página
  // quede quieta, o el puntero cae sobre el panel y la marca se mueve debajo
  // sin recibir el evento (pasaba con bloques chicos, como la multitud).
  await page.waitForTimeout(300);
  const viva = sec.locator(".figura-cuerpo .marca-viva").first();
  if (await viva.count()) await viva.hover({force: true, timeout: 5000}).catch(() => {});
  else {
    // Gráfica con puntero: se lleva su parte alta a la ventana y se mueve el
    // puntero a un punto que esté dentro de la gráfica Y dentro de la ventana.
    const grafica = sec.locator(".figura-cuerpo svg").last();
    await grafica.evaluate((n) => n.scrollIntoView({block: "start"}));
    const caja = await grafica.boundingBox();
    if (!caja) return null;
    const y = caja.y + Math.min(caja.height * 0.5, 260);
    await page.mouse.move(caja.x + caja.width * 0.5, y);
    await page.mouse.move(caja.x + caja.width * 0.52, y + 2);
  }
  await page.waitForTimeout(150);
  const r = await page.evaluate(() => {
    const t = document.querySelector(".globo-tarjeta");
    if (!t || t.hidden) return null;
    const txt = (c) => t.querySelector(c)?.textContent.trim() ?? "";
    return {cifra: txt(".gt-cifra"), frase: txt(".gt-frase"), contexto: txt(".gt-contexto"), personas: txt(".gt-personas"), orden: [...t.children].map((n) => n.className)};
  });
  await page.mouse.move(2, 2);
  return r;
}
const ORDEN_GLOBO = ["gt-contexto", "gt-grupo", "gt-cifra", "gt-frase", "gt-personas", "gt-comparacion", "gt-aviso"];
const ORDEN_DESPLEGABLES = ["Fuentes y verificación", "¿Qué quiere decir este análisis?", "Ver los datos"];

// Página de mapa a pantalla completa (`mapa: true`): flechas reales en el
// SVG, tarjeta con cifra, leyenda con la escala, panel visible, sin desborde
// y, en escritorio, sin scroll vertical (el mapa cabe en la ventana). En
// escritorio claro se recorre además el flujo de uso completo.
async function revisarMapa(page, p, errores, nombreVentana, tema) {
  const m = await medirMapa(page);
  const donde = `[${nombreVentana} ${tema}] ${p.ruta}`;
  const falla = (t) => fallos.push(`${donde} — ${t}`);
  for (const e of errores) falla(`error de JavaScript: ${e.slice(0, 160)}`);
  if (!m.pintado) falla("el mapa no se dibujó");
  if (m.h1 !== 1) falla(`la página tiene ${m.h1} encabezados h1 (debe tener uno)`);
  if (m.desborde > 1) falla(`desborde horizontal de ${m.desborde} px`);
  if (m.flechas < 4) falla(`mapa vacío: ${m.flechas} flechas de color`);
  if (m.lugares !== 32) falla(`el mapa tiene ${m.lugares} entidades elegibles (deben ser 32)`);
  if (!m.cifra) falla("la tarjeta no tiene cifra");
  if (!m.leyenda) falla("la leyenda no dice a cuántas personas equivale el ancho");
  if (!m.sello) falla("falta el sello «Datos de muestra»");
  if (m.titulosNativos) falla(`${m.titulosNativos} <title> nativos dentro del mapa`);
  if (!m.lateral || m.lateral.w < 200 || m.lateral.h < 100) falla("el panel no se ve");
  for (const c of m.colores) if (PROHIBIDOS.includes(c)) falla(`color por omisión de la librería: ${c}`);
  for (const c of m.colores) if (!/^(#[0-9a-f]{3}|#[0-9a-f]{6}|#[0-9a-f]{8}|rgba?([^)]*)|var([^)]*)|[a-z]+)$/.test(c)) falla(`color inválido: «${c}»`);
  if (nombreVentana !== "movil") {
    if (m.apilada) falla("en escritorio la página quedó en una sola columna");
    if (m.sobraAlto > 1) falla(`en escritorio la página no cabe en la ventana: sobran ${m.sobraAlto} px de alto`);
    // La tarjeta flota en la banda superior: el mapa empieza debajo de ella.
    if (m.tarjeta && m.lienzo && m.leyendaCaja && m.leyendaCaja.b > m.lienzo.b + 1) falla("la leyenda se sale del mapa");
  } else if (!m.apilada) falla("a 390 px la página no pasó a una columna");
  let globos = "-";
  if (nombreVentana !== "movil") {
    const g = await globoMapa(page);
    if (!g) falla("el globo de una flecha no abre");
    else {
      globos = 1;
      if (!g.cifra || !g.frase || !g.contexto) falla(`globo incompleto: ${JSON.stringify(g)}`);
      const pos = g.orden.map((c) => ORDEN_GLOBO.indexOf(c));
      if (pos.some((x) => x < 0) || pos.some((x, k) => k && x <= pos[k - 1])) falla(`renglones del globo fuera de orden (${g.orden.join(", ")})`);
    }
  }
  let flujo = "";
  if (nombreVentana === "escritorio" && tema === "claro") {
    const r = await flujoDeUso(page, base, p.ruta);
    for (const f of r.fallas) falla(`flujo de uso: ${f}`);
    flujo = ` flujo=${r.hechos.join(", ")}`;
  }
  if (nombreVentana !== "movil") (coloresPorTema[p.ruta + " " + nombreVentana] ??= {})[tema] = m.colores.sort().join(",");
  resumen.push(`${nombreVentana.padEnd(10)} ${tema.padEnd(6)} ${p.ruta.padEnd(24)} mapa: flechas=${m.flechas} grises=${m.grises} tarjeta=${m.modo} globos=${globos} desborde=${Math.max(0, m.desborde)} alto sobrante=${Math.max(0, m.sobraAlto)} repintado=${m.ms} ms${flujo}`);
}

// Catálogo de formas (`catalogo: true`): una tarjeta por ficha de
// src/data/catalogo.json, un enlace por forma en la galería (sin enlaces
// anidados) y con destino que EXISTE, la marca «En construcción» en las
// demás, un desplegable por tarjeta, miniaturas diferidas que cargan y que
// cambian con el tema, sin desborde.
const CATALOGO = datosCatalogo();
const miniaturasPorTema = {};
async function revisarCatalogo(ctx, page, p, errores, nombreVentana, tema) {
  // Las miniaturas son diferidas: el recorrido las pidió; se espera a que lleguen.
  await page.waitForFunction(() => [...document.querySelectorAll(".cat-mini img")].every((i) => i.complete), null, {timeout: 20000}).catch(() => {});
  const m = await medirCatalogo(page);
  const donde = `[${nombreVentana} ${tema}] ${p.ruta}`;
  const falla = (t) => fallos.push(`${donde} — ${t}`);
  for (const e of errores) falla(`error de JavaScript: ${e.slice(0, 160)}`);
  if (m.h1 !== 1) falla(`la página tiene ${m.h1} encabezados h1 (debe tener uno)`);
  if (m.desborde > 1) falla(`desborde horizontal de ${m.desborde} px`);
  if (m.tarjetas !== CATALOGO.total) falla(`hay ${m.tarjetas} tarjetas y catalogo.json tiene ${CATALOGO.total} formas`);
  if (m.enlaces.length !== CATALOGO.enGaleria) falla(`hay ${m.enlaces.length} enlaces «Ver implementada» y ${CATALOGO.enGaleria} formas en la galería`);
  if (m.sellosGaleria !== CATALOGO.enGaleria) falla(`${m.sellosGaleria} marcas «En la galería» para ${CATALOGO.enGaleria} formas`);
  if (m.enObra !== CATALOGO.total - CATALOGO.enGaleria || m.sellosObra !== m.enObra) falla(`${m.sellosObra} marcas «En construcción» para ${CATALOGO.total - CATALOGO.enGaleria} formas sin sección`);
  if (m.anidados) falla(`${m.anidados} controles anidados dentro del enlace de una tarjeta`);
  if (m.detalles !== m.tarjetas) falla(`${m.detalles} desplegables para ${m.tarjetas} tarjetas`);
  if (m.imgs !== CATALOGO.conMiniatura) falla(`${m.imgs} miniaturas y catalogo.json tiene ${CATALOGO.conMiniatura}`);
  if (m.imgs + m.siluetas !== m.tarjetas) falla(`${m.tarjetas - m.imgs - m.siluetas} tarjetas sin miniatura ni silueta`);
  if (m.lazy !== m.imgs) falla(`${m.imgs - m.lazy} miniaturas sin loading="lazy"`);
  if (m.rotas.length) falla(`${m.rotas.length} miniaturas rotas: ${m.rotas.slice(0, 3).join(", ")}`);
  if (m.cargadas < m.imgs) falla(`${m.imgs - m.cargadas} miniaturas no cargaron tras recorrer la página`);
  if (tema === "oscuro" && m.oscuras !== CATALOGO.conOscura) falla(`en oscuro ${m.oscuras} miniaturas oscuras de ${CATALOGO.conOscura}`);
  if (tema === "claro" && m.oscuras) falla(`en claro hay ${m.oscuras} miniaturas oscuras`);
  if (m.pestanas !== 5) falla(`la barra tiene ${m.pestanas} pestañas (Todas, Familia, Entrada, Función, Forma)`);
  if (!m.descartes) falla("falta la tabla «Formas que no usamos»");
  if (!/catalogo-recetas\/CatalogoGraficas\.html$/.test(m.recetas)) falla("falta el enlace al catálogo de recetas");
  let destinos = "";
  if (nombreVentana === "escritorio" && tema === "claro") {
    const r = await revisarDestinos(ctx, base, m.enlaces);
    for (const f of r.fallas) falla(f);
    const recetas = await ctx.newPage();
    const rr = await recetas.goto(new URL(m.recetas, base + p.ruta).href, {waitUntil: "load"});
    if (!rr || rr.status() >= 400) falla(`el catálogo de recetas responde ${rr?.status()}`);
    await recetas.close();
    destinos = ` destinos=${r.revisados} en ${r.paginas} páginas`;
  }
  if (m.imgs && nombreVentana === "escritorio") (miniaturasPorTema[p.ruta] ??= {})[tema] = m.fuentes;
  resumen.push(`${nombreVentana.padEnd(10)} ${tema.padEnd(6)} ${p.ruta.padEnd(24)} catálogo: tarjetas=${m.tarjetas} grupos=${m.grupos} enlaces=${m.enlaces.length} en construcción=${m.enObra} miniaturas=${m.cargadas}/${m.imgs} siluetas=${m.siluetas} desborde=${Math.max(0, m.desborde)}${destinos}`);
}

for (const [nombreVentana, ventana] of [["escritorio", VENTANAS.escritorio], ["movil", VENTANAS.movil], ["grande", VENTANAS.grande]]) {
  for (const tema of ["claro", "oscuro"]) {
    const ctx = await contexto(nav, {tema, ventana});
    for (const p of PAGINAS) {
      // A 1920 x 1080 solo se revisan el mapa a pantalla completa y el catálogo.
      if (nombreVentana === "grande" && !p.mapa && !p.catalogo) continue;
      const {page, errores} = await abrir(ctx, base, p.ruta);
      if (p.mapa) { await revisarMapa(page, p, errores, nombreVentana, tema); await page.close(); continue; }
      if (p.catalogo) { await revisarCatalogo(ctx, page, p, errores, nombreVentana, tema); await page.close(); continue; }
      const m = await medir(page);
      const donde = `[${nombreVentana} ${tema}] ${p.ruta}`;
      const falla = (t) => fallos.push(`${donde} — ${t}`);
      for (const e of errores) falla(`error de JavaScript: ${e.slice(0, 160)}`);
      if (m.secciones.length !== p.analisis) falla(`se esperaban ${p.analisis} secciones y hay ${m.secciones.length}`);
      if (m.h1 !== 1) falla(`la página tiene ${m.h1} encabezados h1 (debe tener uno)`);
      if (m.desborde > 1) falla(`desborde horizontal de ${m.desborde} px`);
      for (const c of m.colores) if (PROHIBIDOS.includes(c)) falla(`color por omisión de la librería en una marca: ${c}`);
      // Un color mal escrito no da error: el navegador pinta la marca en negro.
      for (const c of m.colores) if (!/^(#[0-9a-f]{3}|#[0-9a-f]{6}|#[0-9a-f]{8}|rgba?([^)]*)|var([^)]*)|[a-z]+)$/.test(c)) falla(`color inválido en una marca: «${c}»`);
      for (const s of m.secciones) {
        if (s.error) falla(`sección ${s.id}: ${s.error}`);
        if (!s.pintado) falla(`sección ${s.id} no se dibujó`);
        if (s.vacia) falla(`sección ${s.id} quedó en «Sin dato» con los filtros por omisión`);
        if (s.marcas < 4) falla(`sección ${s.id}: gráfica vacía (${s.marcas} marcas)`);
        if (!s.titulo) falla(`sección ${s.id}: figura sin título`);
        const palabras = s.pie.split(/\s+/).filter(Boolean).length;
        if (palabras < 12 || palabras > 35) falla(`sección ${s.id}: el pie tiene ${palabras} palabras (de 12 a 35)`);
        if (!s.sello) falla(`sección ${s.id}: figura sin el sello de datos de muestra`);
        if (s.desplegables.join("|") !== ORDEN_DESPLEGABLES.join("|")) falla(`sección ${s.id}: desplegables ${JSON.stringify(s.desplegables)}`);
        if (!s.filasTabla) falla(`sección ${s.id}: sin tabla de respaldo`);
        if (s.titulosNativos) falla(`sección ${s.id}: ${s.titulosNativos} <title> nativos dentro de la gráfica`);
        if (!s.ancla) falla(`sección ${s.id}: falta su ancla h2.toc-anchor en el .md`);
        else if (!s.mismoTitulo) falla(`sección ${s.id}: el título visible y el del índice no son el mismo texto`);
      }
      // Globos: solo en escritorio (en el teléfono no hay puntero).
      let globos = 0;
      if (nombreVentana === "escritorio") {
        for (let i = 0; i < m.secciones.length; i++) {
          const g = await globoDe(page, i);
          const id = m.secciones[i].id;
          if (!g) { falla(`sección ${id}: el globo no abre`); continue; }
          globos++;
          if (!g.cifra) falla(`sección ${id}: globo sin cifra`);
          if (g.cifra !== "Sin dato" && !g.frase) falla(`sección ${id}: globo sin la frase del denominador`);
          if (!g.contexto) falla(`sección ${id}: globo sin contexto`);
          if (/±/.test(g.cifra + g.personas)) falla(`sección ${id}: el margen de error va en la tabla, no en el globo`);
          const pos = g.orden.map((c) => ORDEN_GLOBO.indexOf(c));
          if (pos.some((x) => x < 0) || pos.some((x, k) => k && x <= pos[k - 1])) falla(`sección ${id}: renglones del globo fuera de orden (${g.orden.join(", ")})`);
        }
      }
      if (nombreVentana === "escritorio" && p.analisis) (coloresPorTema[p.ruta] ??= {})[tema] = m.colores.sort().join(",");
      resumen.push(`${nombreVentana.padEnd(10)} ${tema.padEnd(6)} ${p.ruta.padEnd(24)} secciones=${m.secciones.length} marcas=${m.secciones.map((s) => s.marcas).join("/") || "-"} globos=${nombreVentana === "escritorio" ? globos : "-"} desborde=${Math.max(0, m.desborde)}`);
      await page.close();
    }
    await ctx.close();
  }
}
for (const [ruta, c] of Object.entries(miniaturasPorTema)) {
  if (c.claro && c.claro === c.oscuro) fallos.push(`${ruta} — las miniaturas no cambian entre el tema claro y el oscuro`);
}
for (const [ruta, c] of Object.entries(coloresPorTema)) {
  if (c.claro && c.claro === c.oscuro) fallos.push(`${ruta} — los colores de las gráficas no cambian entre el tema claro y el oscuro`);
}
await nav.close(); srv.close();

console.log(resumen.join("\n"));
console.log("\n" + "=".repeat(60));
if (fallos.length) {
  console.log(`FALLOS (${fallos.length}):`);
  for (const f of [...new Set(fallos)].slice(0, 60)) console.log("  - " + f);
  process.exit(1);
}
console.log(`Las ${PAGINAS.length} páginas se dibujan completas en claro y oscuro, en escritorio y a 390 px (y el mapa a pantalla completa también a 1920 px, con su flujo de uso).`);
