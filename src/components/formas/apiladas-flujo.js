// formas/apiladas-flujo.js
// ¿Cómo se recompone un total entre dos o más cortes? Una barra horizontal
// por corte, partida en categorías (al 100 % o en cantidades), y cintas
// translúcidas que unen el tramo de cada categoría con el suyo en el corte
// siguiente: la cinta que se ensancha es la categoría que ganó parte.
// Las cintas unen SIEMPRE la misma categoría: los cortes son levantamientos
// independientes, no el seguimiento de las mismas personas, así que no se
// dibuja ningún paso de una categoría a otra. El pie de la figura lo dice.
// No: más de cuatro o cinco categorías (tres con tono y «Otras» en gris), más
// de unos ocho cortes, ni datos de transición reales (para eso, aluvial).
import * as d3 from "npm:d3";
import {svg} from "npm:htl";
import {P, tintaSobre} from "../paleta.js";
import {pct, pctEje, entero} from "../formato.js";
import {globoEn} from "../globo.js";
import {vacio, leyendaItems, conLeyenda, TIPO} from "./comun.js";
import {lienzo, anchoTexto} from "./anotaciones.js";

// datos: una fila por (corte, categoría). corte(d), categoria(d), valor(d).
// `cortes`: orden de arriba a abajo (por omisión, ascendente). `categorias`:
// orden fijo de izquierda a derecha. color(categoria). `destacar`: categoría
// que conserva su color mientras las demás pasan a neutro. `absoluto`: barras
// en cantidades, con `tope` como extremo FIJO del eje. El dato del globo de
// un tramo lleva {parte, total, anterior}. El de una cinta (`globoCinta`),
// {categoria, de, a, cambio}, con el tramo de cada corte y el cambio en puntos.
export function apiladasFlujo(datos, {
  ancho, corte, categoria, valor, cortes = null, categorias, color, destacar = null, absoluto = false, tope = null,
  formatoParte = pct, formatoValor = entero, rotuloResto = "Las demás categorías", altoBarra = null, hueco = null, globo: g, globoCinta = null,
}) {
  const validas = datos.filter((d) => valor(d) != null && categorias.includes(categoria(d)));
  const orden = (cortes ?? [...new Set(validas.map(corte))].sort(d3.ascending)).filter((c) => validas.some((d) => corte(d) === c));
  if (!orden.length) return vacio();
  const angosto = ancho < 520;
  const W = Math.min(ancho, 1040), hB = altoBarra ?? (angosto ? 38 : 42), hC = hueco ?? (angosto ? 46 : 60);
  const ml = angosto ? 44 : 62, mr = 16, mt = 30, mb = 6;
  const H = mt + orden.length * hB + (orden.length - 1) * hC + mb;

  // Apilado propio: cada tramo guarda su intervalo, su parte y el tramo de la
  // misma categoría en el corte anterior.
  const porCorte = new Map(orden.map((c) => {
    const f = validas.filter((d) => corte(d) === c), total = d3.sum(f, valor);
    let acum = 0;
    return [c, {total, tramos: categorias.map((cat) => {
      const d = f.find((r) => categoria(r) === cat);
      if (!d || !total) return null;
      const v = valor(d), t = {...d, _cat: cat, _corte: c, parte: 100 * v / total, total, a: acum, b: acum + (absoluto ? v : 100 * v / total)};
      acum = t.b;
      return t;
    }).filter(Boolean)}];
  }));
  const techo = absoluto ? (tope ?? d3.max([...porCorte.values()], (c) => c.total)) : 100;
  const x = d3.scaleLinear([0, techo], [ml, W - mr]);
  const y = (i) => mt + i * (hB + hC);
  const relleno = (cat) => (destacar != null && cat !== destacar ? P.apagado : color(cat));

  const marcas = [], cintas = [], tramosTodos = [];
  orden.forEach((c, i) => {
    const {tramos} = porCorte.get(c), previo = i ? porCorte.get(orden[i - 1]).tramos : [];
    for (const t of tramos) {
      t.anterior = previo.find((p) => p._cat === t._cat) ?? null;
      tramosTodos.push(t);
      const x0 = x(t.a), x1 = x(t.b), w = Math.max(0, x1 - x0 - 1.5), fondo = relleno(t._cat), tinta = tintaSobre(fondo);
      // Rótulo dentro del tramo solo si cabe: nombre y cifra, o solo la cifra.
      const cifra = absoluto ? formatoValor(valor(t)) : formatoParte(t.parte);
      const cabeNombre = anchoTexto(t._cat, 12, 700) + 14 < w, cabeCifra = anchoTexto(cifra, 11.5) + 10 < w;
      const cx = x0 + w / 2 + 0.75, cy = y(i) + hB / 2;
      const nodo = svg`<g class="marca-viva" tabindex="0">
        <rect x=${x0 + 0.75} y=${y(i)} width=${w} height=${hB} rx="2" fill=${fondo} />
        ${cabeNombre ? svg`<text x=${cx} y=${cy - 3} text-anchor="middle" font-size="12" font-weight="700" fill=${tinta} pointer-events="none">${t._cat}</text>` : ""}
        ${cabeCifra ? svg`<text x=${cx} y=${cabeNombre ? cy + 12 : cy + 4} text-anchor="middle" font-size="11.5" fill=${tinta} pointer-events="none">${cifra}</text>` : ""}
      </g>`;
      if (g) globoEn(nodo, g, t);
      marcas.push(nodo);
      // Cinta: del borde inferior del tramo anterior al borde superior de este.
      if (t.anterior) {
        const p = t.anterior, y0 = y(i - 1) + hB, y1 = y(i), ym = (y0 + y1) / 2;
        const a0 = x(p.a) + 0.75, a1 = x(p.b) - 0.75, b0 = x0 + 0.75, b1 = x1 - 0.75;
        const cinta = svg`<path class="marca-viva sankey-cinta ff-aparece" style=${`--i:${i}`} d=${`M${a0},${y0}C${a0},${ym} ${b0},${ym} ${b0},${y1}L${b1},${y1}C${b1},${ym} ${a1},${ym} ${a1},${y0}Z`}
          fill=${fondo} fill-opacity=${destacar != null && t._cat === destacar ? 0.5 : 0.34} />`;
        if (globoCinta) globoEn(cinta, globoCinta, {categoria: t._cat, de: p, a: t, cambio: t.parte - p.parte});
        cintas.push(cinta);
      }
    }
  });

  const marcasEje = absoluto ? d3.ticks(0, techo, angosto ? 3 : 5) : angosto ? [0, 50, 100] : [0, 25, 50, 75, 100];
  const eje = marcasEje.map((v) => svg`<g aria-hidden="true">
    <line x1=${x(v)} x2=${x(v)} y1=${mt - 5} y2=${H - mb} stroke=${P.rejilla} />
    <text x=${x(v)} y=${mt - 11} text-anchor=${v === 0 ? "start" : v === techo ? "end" : "middle"} font-size=${TIPO.ejes - 1} fill=${P.tinta2}>${absoluto ? formatoValor(v) : `${pctEje(v)} %`}</text>
  </g>`);
  const nombres = orden.map((c, i) => svg`<text x=${ml - 10} y=${y(i) + hB / 2} dy="0.35em" text-anchor="end" font-size=${TIPO.ejes} font-weight="700" fill=${P.tinta}>${c}</text>`);

  const foco = destacar ?? categorias[0], primero = porCorte.get(orden[0]).tramos.find((t) => t._cat === foco), ultimo = porCorte.get(orden.at(-1)).tramos.find((t) => t._cat === foco);
  const dibujo = lienzo({
    clase: "apiladas-flujo", ancho: W, alto: H,
    etiqueta: `Barras apiladas de ${orden.length} cortes (${orden.join(", ")}) unidas por cintas de la misma categoría.${primero && ultimo ? ` ${foco}: ${formatoParte(primero.parte)} en ${orden[0]} y ${formatoParte(ultimo.parte)} en ${orden.at(-1)}.` : ""}`,
  }, svg`<g>${eje}</g>`, svg`<g>${cintas}</g>`, svg`<g>${marcas}</g>`, svg`<g aria-hidden="true">${nombres}</g>`);

  const leyenda = destacar != null
    ? [{tipo: "cuadro", color: color(destacar), texto: destacar}, {tipo: "cuadro", color: P.apagado, texto: rotuloResto}]
    : categorias.map((c) => ({tipo: "cuadro", color: color(c), texto: c}));
  const nodo = conLeyenda(leyendaItems(leyenda), dibujo);
  nodo.tramos = tramosTodos;
  return nodo;
}
