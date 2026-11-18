// formas/mosaico-series.js
// ¿Cómo evolucionó cada entidad, todas a la vez y acomodadas como el país?
// Una casilla por entidad, en la rejilla publicada `mx_state_grid3`
// (REJILLA de geografia.js), con su serie dibujada adentro sobre la MISMA
// escala fija, la referencia del país en raya gris y la cifra del último
// corte escrita en la esquina. El patrón regional se ve de un vistazo.
// En un teléfono la rejilla del país no cabe: las casillas pasan a cuatro
// columnas, ordenadas de mayor a menor en el último corte.
// No: menos de cinco cortes por entidad (mosaico de triángulos), ni cuando
// importa el valor exacto de un año (la tabla).
import * as d3 from "npm:d3";
import {html, svg} from "npm:htl";
import {P} from "../paleta.js";
import {pct, SIN_DATO} from "../formato.js";
import {mostrarGlobo, ocultarGlobo} from "../globo.js";
import {ENTIDADES, REJILLA, REJILLA_COLUMNAS, REJILLA_FILAS} from "../geografia.js";
import {vacio, leyendaItems} from "./comun.js";

const r1 = (v) => Math.round(v * 10) / 10;

// series: Map clave de entidad → filas de esa entidad (una por corte).
// tiempo(d), valor(d) (null = Sin dato). cortes: lista ordenada de cortes.
// dominio: extremos FIJOS del eje del valor, iguales con cualquier filtro.
// referencia: [{tiempo, valor}] la serie del país (valor null rompe la raya).
// destacar: clave de la entidad que lleva marco grueso.
export function mosaicoSeries(series, {ancho, tiempo, valor, cortes, dominio, referencia = null, destacar = null, formato = pct, formatoCorto = (v) => d3.format(".0f")(v),
  textoReferencia = "Todo el país", textoSerie = "La entidad", globo: g}) {
  if (![...series.values()].some((f) => f.some((d) => valor(d) != null))) return vacio();
  const amplio = ancho >= 720;
  const hueco = amplio ? 5 : 6;
  const ultimoDe = (cve) => d3.greatest((series.get(cve) ?? []).filter((d) => valor(d) != null), tiempo);
  const orden = [...ENTIDADES].sort((a, b) => (valor(ultimoDe(b.cve) ?? {}) ?? -1) - (valor(ultimoDe(a.cve) ?? {}) ?? -1));
  const columnas = amplio ? REJILLA_COLUMNAS : 4;
  const filasRejilla = amplio ? REJILLA_FILAS : Math.ceil(ENTIDADES.length / 4);
  const lado = (ancho - (columnas - 1) * hueco) / columnas;
  const alto = Math.round(lado * (amplio ? 0.84 : 0.78));
  const H = filasRejilla * (alto + hueco);
  const pos = new Map((amplio ? ENTIDADES : orden).map((e, i) => [e.cve, amplio ? REJILLA[e.cve] : [i % 4, Math.floor(i / 4)]]));
  const arriba = 17, abajo = 5, lados = 5;
  const x = d3.scaleLinear([cortes[0], cortes.at(-1)], [lados, lado - lados]);
  const y = d3.scaleLinear(dominio, [alto - abajo, arriba]).clamp(true);
  const linea = d3.line().defined((d) => d.v != null).x((d) => r1(x(d.t))).y((d) => r1(y(d.v)));
  const area = d3.area().defined((d) => d.v != null).x((d) => r1(x(d.t))).y0(alto - abajo).y1((d) => r1(y(d.v)));
  const tam = lado < 64 ? 10.5 : 11.5;

  const casillas = ENTIDADES.map((e, i) => {
    const [c, f] = pos.get(e.cve);
    const filas = [...(series.get(e.cve) ?? [])].sort((a, b) => tiempo(a) - tiempo(b));
    const pts = cortes.map((t) => { const d = filas.find((q) => tiempo(q) === t); return {t, v: d ? valor(d) : null, d}; });
    const conDato = pts.filter((p) => p.v != null);
    const ultimo = conDato.at(-1);
    const marcado = e.cve === destacar;
    const marca = svg`<circle r="3.6" fill=${P.fondo} stroke=${P.tinta} stroke-width="1.6" visibility="hidden" pointer-events="none" />`;
    const nodo = svg`<g class="marca-viva ms-celda" tabindex="0" transform=${`translate(${r1(c * (lado + hueco))},${r1(f * (alto + hueco))})`}>
      <rect class="ms-fondo" width=${r1(lado)} height=${alto} rx="3" fill=${P.fondo2} stroke=${marcado ? P.tinta : "none"} stroke-width=${marcado ? 2 : 0} />
      ${conDato.length ? svg`<path d=${area(pts)} fill=${P.tonoSuave} stroke="none" />` : ""}
      ${referencia ? svg`<path d=${linea(cortes.map((t) => ({t, v: referencia.find((r) => r.tiempo === t)?.valor ?? null})))} fill="none" stroke=${P.regla} stroke-width="1" stroke-dasharray="2 2" />` : ""}
      ${referencia ? referencia.filter((r) => r.valor != null).map((r) => svg`<circle cx=${r1(x(r.tiempo))} cy=${r1(y(r.valor))} r="1.8" fill=${P.regla} stroke="none" />`) : ""}
      ${conDato.length ? svg`<path d=${linea(pts)} fill="none" stroke=${P.serie} stroke-width=${marcado ? 2.6 : 2} stroke-linejoin="round" />` : ""}
      ${conDato.filter((p) => !pts.some((q) => q !== p && q.v != null && Math.abs(cortes.indexOf(q.t) - cortes.indexOf(p.t)) === 1)).map((p) => svg`<circle cx=${r1(x(p.t))} cy=${r1(y(p.v))} r="2" fill=${P.serie} stroke="none" />`)}
      ${ultimo ? svg`<circle cx=${r1(x(ultimo.t))} cy=${r1(y(ultimo.v))} r="2.6" fill=${P.serie} stroke="none" />` : ""}
      <text x="5" y="13" font-size=${tam} font-weight="700" fill=${P.tinta} stroke="none">${e.corto}</text>
      <text x=${r1(lado - 5)} y="13" text-anchor="end" font-size=${tam} fill=${P.tinta2} stroke="none">${ultimo ? formatoCorto(ultimo.v) : SIN_DATO}</text>
      ${marca}
    </g>`;
    // Un punto por corte: el globo es el del corte más cercano al puntero.
    if (g && conDato.length) {
      const abrir = (p, cx, cy) => {
        marca.setAttribute("cx", r1(x(p.t))); marca.setAttribute("cy", r1(y(p.v))); marca.setAttribute("visibility", "visible");
        mostrarGlobo(g.html(p.d), cx, cy);
      };
      nodo.addEventListener("pointermove", (ev) => {
        const caja = nodo.getBoundingClientRect();
        const escala = caja.width / lado;
        const t = x.invert((ev.clientX - caja.left) / escala);
        abrir(d3.least(conDato, (p) => Math.abs(p.t - t)), ev.clientX, ev.clientY);
      });
      nodo.addEventListener("pointerleave", () => { marca.setAttribute("visibility", "hidden"); ocultarGlobo(); });
      nodo.addEventListener("focus", () => { const caja = nodo.getBoundingClientRect(); abrir(ultimo, caja.left + caja.width / 2, caja.top + caja.height / 2); });
      nodo.addEventListener("blur", () => { marca.setAttribute("visibility", "hidden"); ocultarGlobo(); });
      const r = g.renglones(ultimo.d);
      nodo.setAttribute("role", "img");
      nodo.setAttribute("aria-label", `${e.nombre}: ${conDato.map((p) => `${p.t}, ${formato(p.v)}`).join("; ")}. ${r.frase}`);
    } else {
      nodo.setAttribute("role", "img");
      nodo.setAttribute("aria-label", `${e.nombre}: ${SIN_DATO}`);
    }
    nodo.style.setProperty("--i", i);
    return nodo;
  });
  const dibujo = svg`<svg class="mosaico-series" role="group" aria-label=${`Mosaico de ${ENTIDADES.length} entidades, cada una con su serie de ${cortes[0]} a ${cortes.at(-1)}.`}
    width=${ancho} height=${H} viewBox="0 0 ${ancho} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">${casillas}</svg>`;
  const leyenda = leyendaItems([
    {tipo: "linea", color: P.serie, texto: textoSerie},
    ...(referencia ? [{tipo: "punto", color: P.regla, texto: textoReferencia}] : []),
  ]);
  const clave = html`<span class="ms-clave">Cada casilla va de ${formatoCorto(dominio[0])} a ${formatoCorto(dominio[1])} y de ${cortes[0]} a ${cortes.at(-1)}. La cifra de la esquina es ${cortes.at(-1)}.</span>`;
  leyenda.append(clave);
  return html`<div class="forma">${leyenda}${dibujo}</div>`;
}
