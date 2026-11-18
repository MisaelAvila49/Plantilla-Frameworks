// formas/destacadas.js
// ¿Dónde queda un grupo respecto de todos los demás, año tras año? Muchas
// series en gris muy tenue, como contexto, y un grupo elegido en color y con
// trazo grueso, con su nombre al final de cada línea y un eje de referencia.
// Por omisión el tiempo corre hacia ABAJO y el valor va en horizontal, que es
// la columna angosta que pide un teléfono. También sirve con el tiempo hacia
// la derecha. Con `signo`, cada línea destacada cambia de color al cruzar la
// referencia.
// No: menos de cinco puntos por serie (pendiente o dumbbell), ni más de unas
// diez series destacadas a la vez (se enciman los nombres).
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import {svg} from "npm:htl";
import {P} from "../paleta.js";
import {pctMarca} from "../formato.js";
import {conGlobo, globoEn} from "../globo.js";
import {base, vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";
import {rotulo, separar, anchoTexto} from "./anotaciones.js";

// datos: filas largas. tiempo(d), valor(d), serie(d). destacada(serie): true
// para las series del grupo elegido. color(serie): color de una destacada
// (por omisión, el tono de tema). `signo`: {referencia, abajo, arriba,
// textoAbajo, textoArriba} pinta cada tramo según el lado de la referencia en
// que cae. `referencia`: {valor, texto} dibuja el eje de referencia y lo
// rotula en la leyenda, fuera del lienzo. `dominio`: extremos FIJOS del eje
// del valor. `vertical`: tiempo hacia abajo. corto(serie): nombre abreviado.
export function destacadas(datos, {
  ancho, tiempo, valor, serie, destacada = () => false, color = null, signo = null, referencia = null, dominio = null, vertical = true,
  formato = pctMarca, rotuloValor = null, nombre = String, corto = null, textoDestacadas = "Grupo destacado", textoResto = "Las demás series", prefijo = "destacadas", globo: g,
}) {
  const filas = datos.filter((d) => valor(d) != null);
  if (!filas.length) return vacio();
  const angosto = ancho < 520;
  const tiempos = [...new Set(filas.map(tiempo))].sort(d3.ascending), ultimo = tiempos.at(-1);
  const delGrupo = (d) => Boolean(destacada(serie(d)));
  const fondo = filas.filter((d) => !delGrupo(d)), frente = filas.filter(delGrupo);
  const tinta = (s) => (color ? color(s) : P.serie);
  const tintaDe = (d) => (signo ? (valor(d) < signo.referencia ? signo.abajo : signo.arriba) : tinta(serie(d)));
  const finales = frente.filter((d) => tiempo(d) === ultimo);

  const W = vertical ? Math.min(ancho, 820) : ancho;
  const H = vertical ? Math.round(Math.max(440, Math.min(660, tiempos.length * 34 + 110))) : Math.round(Math.max(300, Math.min(440, ancho * 0.45)));
  const cadaCuanto = Math.ceil(tiempos.length / (vertical ? 9 : angosto ? 4 : 8));
  const marcasTiempo = tiempos.filter((_, i) => i % cadaCuanto === 0);
  const ejeValor = {label: rotuloValor, labelArrow: "none", tickFormat: formato, grid: true, ticks: angosto ? 4 : 7, ...(dominio ? {domain: dominio} : {nice: true})};
  const ejeTiempo = {label: null, tickFormat: (v) => String(v), ticks: marcasTiempo, tickSize: 0};
  const cx = vertical ? valor : tiempo, cy = vertical ? tiempo : valor, curva = vertical ? "monotone-y" : "monotone-x";
  const margenRotulos = vertical ? 0 : angosto ? 58 : 132;
  const plot = Plot.plot(base({
    ancho: W, alto: H, marginTop: vertical ? 44 : 22, marginBottom: vertical ? 64 : 30, marginLeft: vertical ? 50 : 48, marginRight: vertical ? 38 : margenRotulos,
    x: vertical ? {...ejeValor, axis: "top"} : {...ejeTiempo, inset: 6},
    y: vertical ? {...ejeTiempo, reverse: true, inset: 4} : ejeValor,
    marks: [
      referencia?.valor != null ? (vertical ? Plot.ruleX([referencia.valor], {stroke: P.regla, strokeWidth: 1.4}) : Plot.ruleY([referencia.valor], {stroke: P.regla, strokeWidth: 1.4})) : null,
      Plot.line(fondo, {x: cx, y: cy, z: serie, stroke: P.contexto, strokeWidth: 1, strokeOpacity: 0.5, curve: curva}),
      Plot.line(frente, {x: cx, y: cy, z: serie, stroke: (d) => tinta(serie(d)), strokeWidth: 2.4, curve: curva, className: "destacadas-linea"}),
      Plot.dot(finales, {x: cx, y: cy, fill: tintaDe, stroke: P.fondo, strokeWidth: 1, r: 3.8}),
      Plot.dot(filas, Plot.pointer({x: cx, y: cy, r: 6.5, stroke: P.tinta, strokeWidth: 1.6, fill: "none", maxRadius: Infinity})),
    ],
  }));

  const ex = plot.scale("x"), ey = plot.scale("y");
  // Color por lado de la referencia: un degradado de corte seco en el punto
  // de la referencia, aplicado como trazo de las líneas destacadas.
  if (signo && frente.length) {
    const id = `${prefijo}-signo-${vertical ? "v" : "h"}`;
    const corte = vertical ? ex.apply(signo.referencia) / W : ey.apply(signo.referencia) / H;
    const [antes, despues] = vertical ? [signo.abajo, signo.arriba] : [signo.arriba, signo.abajo];
    plot.prepend(svg`<defs><linearGradient id=${id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2=${vertical ? W : 0} y2=${vertical ? 0 : H}>
      <stop offset="0" stop-color=${antes} /><stop offset=${corte} stop-color=${antes} /><stop offset=${corte} stop-color=${despues} /><stop offset="1" stop-color=${despues} />
    </linearGradient></defs>`);
    for (const grupo of plot.querySelectorAll(".destacadas-linea")) {
      for (const camino of grupo.querySelectorAll("path")) camino.removeAttribute("stroke");
      grupo.setAttribute("stroke", `url(#${id})`);
    }
  }
  for (const camino of plot.querySelectorAll(".destacadas-linea path")) { camino.setAttribute("pathLength", "1"); camino.classList.add("ff-traza"); }

  // Nombres al final de cada línea destacada, separados para que no se
  // encimen. Si no caben completos se usan los abreviados, y si aun así no
  // caben se nombran solo los extremos.
  const tam = angosto ? 11.5 : TIPO.valor;
  const puntos = finales.map((d) => ({d, x: ex.apply(cx(d)), y: ey.apply(cy(d))}));
  const capa = svg`<g class="destacadas-rotulos"></g>`;
  if (vertical) {
    // Dos renglones alternados bajo el último año: cada nombre se aleja menos
    // de su línea que en un solo renglón. Si no caben completos se usan los
    // abreviados, y si aun así no caben se nombran solo los extremos.
    const espacio = W - 8;
    let lista = d3.sort(puntos, (p) => p.x).map((p) => ({...p, texto: nombre(serie(p.d))}));
    const renglon = (l, r) => l.filter((_, i) => i % 2 === r);
    const cabe = (l) => [0, 1].every((r) => d3.sum(renglon(l, r), (p) => anchoTexto(p.texto, tam, 600) + 12) <= espacio);
    if (!cabe(lista) && corto) lista = lista.map((p) => ({...p, texto: corto(serie(p.d))}));
    while (!cabe(lista) && lista.length > 2) lista.splice(Math.floor(lista.length / 2), 1);
    for (const r of [0, 1]) {
      const fila = renglon(lista, r);
      const lugares = separar(fila.map((p) => ({pos: p.x, tam: anchoTexto(p.texto, tam, 600)})), {min: 4, max: W - 4, hueco: 12});
      const bajada = 16 + r * (tam + 6);
      fila.forEach((p, i) => {
        capa.append(svg`<line x1=${p.x} y1=${p.y + 5} x2=${lugares[i].lugar} y2=${p.y + bajada} stroke=${P.tinta2} stroke-width="0.8" />`,
          rotulo(lugares[i].lugar, p.y + bajada + tam, p.texto, {ancla: "middle", tam, peso: 600, color: P.tinta}));
      });
    }
  } else {
    const usarCorto = corto && puntos.some((p) => anchoTexto(nombre(serie(p.d)), tam, 600) > margenRotulos - 14);
    const lugares = separar(puntos.map((p) => ({pos: p.y, tam: tam + 3})), {min: 8, max: H - 8, hueco: 0});
    puntos.forEach((p, i) => {
      capa.append(svg`<line x1=${p.x + 5} y1=${p.y} x2=${p.x + 11} y2=${lugares[i].lugar} stroke=${P.tinta2} stroke-width="0.8"/>`,
        rotulo(p.x + 14, lugares[i].lugar + tam * 0.36, usarCorto ? corto(serie(p.d)) : nombre(serie(p.d)), {tam, peso: 600, color: P.tinta}));
    });
  }
  // El último punto de cada destacada recibe foco de teclado y abre su globo.
  // Con el puntero, el globo lo abre el punto más cercano (un solo puntero).
  if (g) for (const p of puntos) {
    const marca = svg`<circle class="marca-viva" tabindex="0" cx=${p.x} cy=${p.y} r="7" fill="transparent" pointer-events="none"/>`;
    globoEn(marca, g, p.d);
    capa.append(marca);
  }
  plot.append(capa);
  const nSeries = new Set(filas.map(serie)).size, nFrente = new Set(frente.map(serie)).size;
  plot.setAttribute("role", "group");
  plot.setAttribute("aria-label", `Líneas de ${nSeries} series de ${tiempos[0]} a ${ultimo}, con ${nFrente} destacadas${finales.length ? `: ${finales.map((d) => `${nombre(serie(d))} termina en ${formato(valor(d))}`).join(", ")}` : ""}.`);

  const leyenda = leyendaItems([
    ...(nFrente ? (signo
      // Solo los lados que alguna línea destacada toca de verdad.
      ? [frente.some((d) => valor(d) < signo.referencia) ? {tipo: "linea", color: signo.abajo, texto: signo.textoAbajo ?? "Bajo la referencia"} : null,
        frente.some((d) => valor(d) >= signo.referencia) ? {tipo: "linea", color: signo.arriba, texto: signo.textoArriba ?? "Sobre la referencia"} : null].filter(Boolean)
      : [{tipo: "linea", color: tinta(serie(frente[0])), texto: textoDestacadas}]) : []),
    ...(fondo.length ? [{tipo: "linea", color: P.contexto, texto: textoResto}] : []),
    ...(referencia ? [{tipo: "linea", color: P.regla, texto: referencia.texto}] : []),
  ]);
  return conLeyenda(leyenda, g ? conGlobo(plot, g) : plot);
}
