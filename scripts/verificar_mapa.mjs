// Comprobaciones propias de una página de MAPA A PANTALLA COMPLETA
// (`mapa: true` en scripts/paginas.mjs). Las usan verificar_render.mjs y
// verificar_filtros.mjs: esa página no tiene secciones `.analisis`, así que
// las reglas de sección no aplican, pero sí cuenta marcas reales, globo,
// colores, desborde y el flujo de uso completo.
//
// No se corre solo: lo importan los verificadores.

// Medidas del mapa ya dibujado.
export async function medirMapa(page) {
  return await page.evaluate(() => {
    const raiz = document.querySelector(".mapa-pantalla");
    const lienzo = document.querySelector(".mapa-lienzo svg.flechas");
    const caja = (el) => { const r = el?.getBoundingClientRect(); return r ? {x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right} : null; };
    const colores = new Set();
    for (const n of document.querySelectorAll(".mapa-lienzo svg [fill], .mapa-lienzo svg [stroke], .mapa-lienzo svg stop, .mapa-representacion svg [fill], .mapa-representacion svg [stroke]")) {
      for (const a of ["fill", "stroke", "stop-color"]) { const c = n.getAttribute(a); if (c && c !== "none" && c !== "currentColor" && !c.startsWith("url(")) colores.add(c.toLowerCase()); }
    }
    return {
      pintado: +(raiz?.dataset.pintado ?? 0), ms: +(raiz?.dataset.ms ?? 0),
      flechas: document.querySelectorAll(".mapa-lienzo svg.flechas .ff-flecha").length,
      grises: document.querySelectorAll(".mapa-lienzo svg.flechas path.marca-viva:not(.ff-flecha)").length,
      lugares: document.querySelectorAll(".mapa-lienzo svg .mapa-unidad").length,
      cifra: document.querySelector(".mapa-tarjeta .mt-cifra")?.textContent.trim() ?? "",
      modo: document.querySelector(".mapa-tarjeta")?.dataset.modo ?? "",
      leyenda: Boolean(document.querySelector(".mapa-leyenda-caja .ml-ancho")),
      sello: document.querySelector(".mapa-barra .figura-sello")?.textContent.trim() ?? "",
      titulosNativos: document.querySelectorAll(".mapa-lienzo svg title").length,
      h1: document.querySelectorAll("#observablehq-main h1").length,
      desborde: document.documentElement.scrollWidth - innerWidth,
      sobraAlto: document.documentElement.scrollHeight - innerHeight,
      apilada: raiz?.classList.contains("apilada") ?? false,
      lienzo: caja(lienzo), tarjeta: caja(document.querySelector(".mapa-tarjeta")), lateral: caja(document.querySelector(".mapa-lateral")),
      leyendaCaja: caja(document.querySelector(".mapa-leyenda-caja")),
      colores: [...colores],
    };
  });
}

// Globo de la primera flecha de color: debe abrir con cifra, frase y contexto.
export async function globoMapa(page) {
  const pt = await puntoEnFlecha(page);
  if (!pt) return null;
  await page.mouse.move(pt.x, pt.y);
  await page.mouse.move(pt.x + 1, pt.y);
  await page.waitForTimeout(150);
  const r = await page.evaluate(() => {
    const t = document.querySelector(".globo-tarjeta");
    if (!t || t.hidden) return null;
    const txt = (c) => t.querySelector(c)?.textContent.trim() ?? "";
    return {cifra: txt(".gt-cifra"), frase: txt(".gt-frase"), contexto: txt(".gt-contexto"), orden: [...t.children].map((n) => n.className)};
  });
  await page.mouse.move(2, 2);
  return r;
}

const espera = (page, ms = 250) => page.waitForTimeout(ms);

// Punto de pantalla DENTRO del cuerpo de una flecha de color que no tape
// otra marca. El polígono de flechas.js recorre un costado (19 puntos), la
// cabeza (3) y el otro costado de regreso: el punto medio entre el punto 9 de
// un costado y su opuesto cae a media flecha. Devuelve {x, y, clave}.
export async function puntoEnFlecha(page) {
  return await page.evaluate(() => {
    for (const n of document.querySelectorAll(".mapa-lienzo .ff-flecha")) {
      const pts = (n.getAttribute("d").match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) ?? []).map((t) => t.split(",").map(Number));
      if (pts.length < 20) continue;
      const a = pts[9], b = pts[pts.length - 10];
      const m = n.ownerSVGElement.getScreenCTM(), p = new DOMPoint((a[0] + b[0]) / 2, (a[1] + b[1]) / 2).matrixTransform(m);
      if (document.elementFromPoint(p.x, p.y) === n) return {x: p.x, y: p.y, clave: n.dataset.clave};
    }
    return null;
  });
}
const url = (page) => page.evaluate(() => location.search);
const modo = (page) => page.evaluate(() => document.querySelector(".mapa-tarjeta")?.dataset.modo ?? "");

// Flujo de uso completo, con ratón y con teclado. Devuelve la lista de
// fallas (texto) y un resumen de lo que se probó.
export async function flujoDeUso(page, base, ruta) {
  const fallas = [], hechos = [];
  const ir = async (q = "") => {
    await page.goto(base + ruta + q, {waitUntil: "load"});
    await page.waitForFunction(() => document.querySelector(".mapa-pantalla")?.dataset.pintado, null, {timeout: 30000}).catch(() => {});
    await espera(page, 400);
  };
  await ir();
  // 1. Llegada: país, sin rojo ni azul en las flechas de color.
  if ((await modo(page)) !== "pais") fallas.push("la vista inicial no es «Todo el país»");
  // 2. Clic en una flecha la fija; Escape la suelta.
  const pt = await puntoEnFlecha(page);
  if (!pt) { fallas.push("no hay ninguna flecha de color a la que se pueda apuntar"); return {fallas, hechos}; }
  const clave = pt.clave;
  const flecha = page.locator(`.mapa-lienzo .ff-flecha[data-clave="${clave}"]`);
  await page.mouse.click(pt.x, pt.y);
  await espera(page);
  if ((await modo(page)) !== "fijado") fallas.push("clic en una flecha: la tarjeta no muestra el flujo fijado");
  if (!(await url(page)).includes(`fija=${clave}`)) fallas.push("clic en una flecha: la URL no guarda la flecha fijada");
  if ((await flecha.getAttribute("aria-pressed")) !== "true") fallas.push("la flecha fijada no se anuncia con aria-pressed=true");
  const atenuadas = await page.evaluate(() => document.querySelector(".mapa-lienzo svg.flechas")?.classList.contains("ff-con-fijo"));
  if (!atenuadas) fallas.push("al fijar una flecha las demás no se atenúan");
  const botones = await page.locator(".mapa-tarjeta .mt-botones button").allTextContents();
  if (!botones.some((t) => /^Ver todo lo que llega a /.test(t)) || !botones.some((t) => /^Ver todo lo que sale de /.test(t))) fallas.push(`la tarjeta fijada no ofrece los dos botones para seguir el flujo (${botones.join(" | ")})`);
  await page.keyboard.press("Escape");
  await espera(page);
  if ((await modo(page)) === "fijado" || (await url(page)).includes("fija=")) fallas.push("Escape no suelta la flecha fijada");
  hechos.push("fijar y soltar");
  // 3. «Ver todo lo que llega a…» desde una flecha fijada.
  await page.mouse.click(pt.x, pt.y);
  await espera(page);
  const llega = page.locator(".mapa-tarjeta .mt-botones button", {hasText: "Ver todo lo que llega a"});
  const destino = clave?.split("-")[1];
  await llega.click();
  await espera(page, 400);
  const q1 = await url(page);
  if (!q1.includes(`ent=${destino}`) || !q1.includes("sentido=llegan")) fallas.push(`«Ver todo lo que llega a…» no lleva a las llegadas de ${destino} (URL ${q1})`);
  if ((await modo(page)) !== "estado") fallas.push("«Ver todo lo que llega a…» no deja la tarjeta del estado");
  const pulsado = await page.locator(".mt-segmentado button[aria-pressed=true]").textContent().catch(() => "");
  if (pulsado?.trim() !== "Llegan") fallas.push("el control Salen | Llegan de la tarjeta no refleja «Llegan»");
  const selSentido = await page.locator(".mapa-lateral select[name=sentido]").inputValue();
  if (selSentido !== "llegan") fallas.push("el selector Sentido del panel no se sincroniza con la tarjeta");
  hechos.push("seguir el flujo");
  // 4. Renglón de la lista ↔ flecha.
  const renglon = page.locator(".mapa-tarjeta .mt-renglon").first();
  if (await renglon.count()) {
    const k = await renglon.getAttribute("data-clave");
    await renglon.hover();
    await espera(page, 150);
    const resaltada = await page.evaluate((k) => document.querySelector(`.mapa-lienzo .ff-flecha[data-clave="${k}"]`)?.classList.contains("ff-resaltada"), k);
    if (!resaltada) fallas.push("pasar el cursor por un renglón no resalta su flecha");
    await page.mouse.move(2, 2);
    await page.locator(`.mapa-lienzo .ff-flecha[data-clave="${k}"]`).dispatchEvent("pointerenter");
    await espera(page, 150);
    const fila = await page.evaluate((k) => document.querySelector(`.mapa-tarjeta .mt-renglon[data-clave="${k}"]`)?.classList.contains("resaltado"), k);
    if (!fila) fallas.push("pasar el cursor por una flecha no resalta su renglón");
    await page.mouse.move(2, 2);
    hechos.push("renglón y flecha");
  } else fallas.push("la tarjeta del estado no tiene la lista de destinos u orígenes");
  // 5. Segmentado de la tarjeta: «Salen».
  await page.locator(".mt-segmentado button", {hasText: "Salen"}).click();
  await espera(page);
  if ((await page.locator(".mapa-lateral select[name=sentido]").inputValue()) !== "salen") fallas.push("«Salen» en la tarjeta no cambia el selector del panel");
  // 6. Volver a todo el país.
  await page.locator(".mapa-tarjeta button", {hasText: "Volver a todo el país"}).click();
  await espera(page);
  if ((await modo(page)) !== "pais" || (await url(page)).includes("ent=")) fallas.push("«Volver a todo el país» no regresa a la vista del país");
  // 7. Teclado: la capa de lugares tiene UNA parada de tabulador; las
  // flechas del teclado recorren y Enter elige.
  const paradas = await page.locator(".mapa-lienzo .mapa-unidad[tabindex='0']").count();
  if (paradas !== 1) fallas.push(`la capa de lugares tiene ${paradas} paradas de tabulador (debe tener una)`);
  await page.locator(".mapa-lienzo .mapa-unidad[tabindex='0']").focus();
  // Inicio y Fin llevan a la primera y la última entidad en orden
  // alfabético; Zacatecas tiene salidas con cualquier filtro por omisión.
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await espera(page, 400);
  if (!(await url(page)).includes("ent=")) fallas.push("Enter sobre un lugar del mapa no elige la entidad");
  const enfocado = await page.evaluate(() => document.activeElement?.classList.contains("mapa-unidad"));
  if (!enfocado) fallas.push("tras elegir un lugar con el teclado el foco no vuelve al mapa");
  // Enter sobre una flecha la fija.
  await page.locator(".mapa-lienzo .ff-flecha").first().focus({timeout: 5000}).catch(() => fallas.push("tras elegir Zacatecas con el teclado no hay flechas que enfocar"));
  await page.keyboard.press("Enter");
  await espera(page);
  if ((await modo(page)) !== "fijado") fallas.push("Enter sobre una flecha no la fija");
  await page.keyboard.press("Escape");
  hechos.push("teclado");
  // 8. La URL se lee al cargar.
  await ir("?ent=15&sentido=llegan&comparar=no_migrantes");
  const leido = await page.evaluate(() => ({
    ent: document.querySelector(".mapa-lateral select[name=entidad]")?.value, sentido: document.querySelector(".mapa-lateral select[name=sentido]")?.value,
    comparar: document.querySelector(".mapa-lateral select[name=comparar]")?.value, repr: !document.querySelector(".mapa-representacion")?.hidden,
    filas: document.querySelectorAll(".mapa-representacion .mr-fila").length,
  }));
  if (leido.ent !== "15" || leido.sentido !== "llegan" || leido.comparar !== "no_migrantes") fallas.push(`la URL no se lee al cargar (${JSON.stringify(leido)})`);
  if (!leido.repr || leido.filas < 5) fallas.push(`la comparación no se dibuja (${leido.filas} filas)`);
  await ir("?ent=12&fija=12-22");
  if ((await modo(page)) !== "fijado") fallas.push("la flecha fijada de la URL (fija=12-22) no se restaura al cargar");
  hechos.push("URL");
  // 9. Pocos casos y sin flujos: nunca un mapa en blanco sin explicación.
  await ir("?grupo=afro");
  const pocos = await page.locator(".mapa-tarjeta .mt-aviso").count();
  if (!pocos) fallas.push("con todas las flechas punteadas la tarjeta no avisa de los pocos casos");
  await ir("?grupo=afro&ent=04&sentido=llegan");
  const vacio = await page.evaluate(() => { const v = document.querySelector(".mapa-vacio"); return v && !v.hidden ? v.textContent.trim() : ""; });
  if (!/pocos casos/.test(vacio)) fallas.push("sin flujos, el mapa no muestra el aviso de pocos casos");
  hechos.push("pocos casos");
  // 10. Tiempo de repintado al cambiar un filtro.
  await ir();
  const tiempos = [];
  for (const valor of ["18+", "todas", "5-17"]) {
    await page.locator(".mapa-lateral select[name=edad]").selectOption(valor);
    await espera(page, 150);
    tiempos.push(await page.evaluate(() => +document.querySelector(".mapa-pantalla").dataset.ms));
  }
  const peor = Math.max(...tiempos);
  if (peor > 250) fallas.push(`cambiar un filtro tarda ${peor} ms en repintar (tope 250 ms)`);
  hechos.push(`repintado ${tiempos.map((t) => t.toFixed(0)).join("/")} ms`);
  return {fallas, hechos};
}

// Huella del mapa: posición, tamaño y color de cada marca del lienzo y de la
// comparación, más los textos de la tarjeta, la leyenda y la comparación. Un
// filtro que solo mueve flechas o que solo cambia la comparación se ve aquí.
const huellaMapa = (page) => page.evaluate(() => {
  const zona = document.querySelector(".mapa-zona")?.getBoundingClientRect() ?? {left: 0, top: 0};
  const piezas = [...document.querySelectorAll(".mapa-lienzo svg.flechas :is(path, circle, line, rect):not(defs *), .mapa-representacion svg :is(circle, line)")]
    .filter((n) => !n.closest(".mapa-base"))
    .map((n) => { const r = n.getBoundingClientRect(); return [Math.round(r.left - zona.left), Math.round(r.top - zona.top), Math.round(r.width), Math.round(r.height), n.getAttribute("fill") ?? "", n.getAttribute("stroke") ?? ""].join(","); });
  const base = [...document.querySelectorAll(".mapa-lienzo .mapa-base path")].map((n) => n.getAttribute("fill")).join(",");
  const texto = ["mapa-tarjeta", "mapa-leyenda-caja", "mapa-representacion"].map((c) => document.querySelector("." + c)?.textContent.replace(/\s+/g, " ").trim() ?? "").join(" | ");
  const vacio = document.querySelector(".mapa-vacio");
  return {firma: piezas.join(";") + "|" + base, marcas: piezas.length, texto,
    vacioExplicado: Boolean(vacio && !vacio.hidden && /pocos casos/.test(vacio.textContent)),
    flechas: document.querySelectorAll(".mapa-lienzo .ff-flecha").length};
});

// Cambia cada control del panel del mapa a cada una de sus opciones (hasta
// `maximo`) y comprueba que la huella cambie, que el texto que nombra el
// filtro cambie y que ninguna opción deje el mapa sin flechas SIN el aviso
// explícito de pocos casos. El selector Sentido, oculto sin entidad, se prueba
// con una entidad elegida, y se comprueba que oculto no ocupe lugar.
export async function filtrosMapa(page, {maximo = 8} = {}) {
  const fallas = [];
  let controles = 0, cambios = 0;
  const sentidoOculto = await page.evaluate(() => {
    const s = document.querySelector(".mapa-lateral select[name=sentido]")?.closest(".campo");
    return s ? s.getBoundingClientRect().height : -1;
  });
  if (sentidoOculto !== 0) fallas.push(`sin entidad, el selector Sentido ocupa ${sentidoOculto} px (debe ocultarse)`);
  const probar = async (nombre, antes = null) => {
    if (antes) { await page.locator(`.mapa-lateral select[name=${antes.nombre}]`).selectOption(antes.valor); await page.waitForTimeout(150); }
    const sel = page.locator(`.mapa-lateral select[name=${nombre}]`);
    if (!(await sel.isVisible()) || (await sel.isDisabled())) { fallas.push(`el filtro «${nombre}» no está disponible`); return; }
    const inicial = await sel.inputValue();
    const opciones = (await sel.locator("option").evaluateAll((os) => os.map((o) => o.value))).slice(0, maximo);
    if (opciones.length < 2) { fallas.push(`el filtro «${nombre}» ofrece una sola opción`); return; }
    controles++;
    const firmas = new Set(), textos = new Set();
    for (const o of opciones) {
      await sel.selectOption(o);
      await page.waitForTimeout(120);
      const h = await huellaMapa(page);
      cambios++;
      if (h.flechas === 0 && !h.vacioExplicado) fallas.push(`«${nombre}» = ${o} deja el mapa sin flechas y sin explicar por qué`);
      firmas.add(h.firma); textos.add(h.texto);
    }
    if (firmas.size < 2) fallas.push(`el filtro «${nombre}» no cambia el dibujo con ninguna de sus ${opciones.length} opciones`);
    if (textos.size < 2) fallas.push(`la tarjeta y la leyenda no cambian al mover «${nombre}»`);
    await sel.selectOption(inicial);
    await page.waitForTimeout(100);
    if (antes) { await page.locator(`.mapa-lateral select[name=${antes.nombre}]`).selectOption(antes.inicial); await page.waitForTimeout(150); }
  };
  for (const nombre of ["periodo", "causa", "cuantos", "entidad", "edad", "sexo", "grupo"]) await probar(nombre);
  await probar("sentido", {nombre: "entidad", valor: "12", inicial: "todas"});
  // «Comparar con» solo cambia el bloque de comparación (no las flechas):
  // su huella incluye los puntos de ese bloque.
  await probar("comparar");
  return {fallas, controles, cambios};
}
