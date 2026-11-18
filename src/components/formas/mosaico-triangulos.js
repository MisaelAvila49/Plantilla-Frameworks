// formas/mosaico-triangulos.js
// ¿Cómo se comparan dos cortes o dos grupos en las 32 entidades a la vez? El
// mosaico de entidades (la misma rejilla mx_state_grid3 de mosaico.js) con
// cada cuadro partido en diagonal: el triángulo de arriba a la izquierda lleva
// un valor (el primer corte, o el primer grupo) y el de abajo a la derecha el
// otro, con la MISMA escala de color. Un cuadro de un solo tono no cambió; uno
// de dos tonos salta a la vista. Una pastilla en la esquina puede decir el
// sentido del cambio con el rojo, azul o gris declarados en el capítulo.
// Inspirada en The Wall Street Journal (Dispatch del 20 de octubre de 2026).
// En pantallas angostas el mosaico pierde la forma del país y se ordena en
// una rejilla de cinco columnas, para que cada cuadro conserve su rótulo.
// No: más de dos valores por entidad, ni conteos (la rampa es de tasas).
import {html, svg} from "npm:htl";
import {P, tintaSobre} from "../paleta.js";
import {pctEje} from "../formato.js";
import {mostrarGlobo, ocultarGlobo} from "../globo.js";
import {ENTIDADES, REJILLA, REJILLA_COLUMNAS, REJILLA_FILAS} from "../geografia.js";
import {leyendaContinua, TIPO} from "./comun.js";
import {tintaLegible, anchoTexto} from "./unidad.js";

const r1 = (v) => Math.round(v * 10) / 10;

// Flecha de la pastilla: hacia arriba, hacia abajo, una raya («igual») o un
// punto («punto»: la pastilla solo dice qué grupo es mayor, con su color).
export function glifoSentido(signo, x, y, color, t = 4) {
  if (signo === "punto") return svg`<circle cx=${x} cy=${y} r=${t} fill=${color} />`;
  if (signo === "sube") return svg`<path d=${`M${x - t},${y + t * 0.6}L${x},${y - t * 0.8}L${x + t},${y + t * 0.6}Z`} fill=${color} />`;
  if (signo === "baja") return svg`<path d=${`M${x - t},${y - t * 0.6}L${x},${y + t * 0.8}L${x + t},${y - t * 0.6}Z`} fill=${color} />`;
  return svg`<rect x=${x - t} y=${y - 1.2} width=${2 * t} height="2.4" rx="1" fill=${color} />`;
}

// valores: Map de clave de entidad (dos dígitos) al dato. a(d) y b(d): los
// dos valores (null = sin dato). `escala`: rampaTema(dominio) para los dos
// triángulos, o `colorA(d)` / `colorB(d)` si cada mitad es un grupo con su
// color. `nombreA` y `nombreB`: qué es cada mitad («2000», «Mujeres»).
// `marca(d)`: {signo: "sube"|"baja"|"igual", color, texto} para la pastilla
// de la esquina (optativa). `leyendaMarca`: [{signo, color, texto}].
// `destacar`: clave con contorno grueso. `ordenAngosto(p, q)`: orden de los
// cuadros en pantallas angostas (por omisión, el de la rejilla).
// El globo recibe el dato con `_lado` = "a" o "b".
export function mosaicoTriangulos(valores, {ancho, a, b, escala, colorA = null, colorB = null, nombreA, nombreB, marca = null, leyendaMarca = null,
  destacar = null, ordenAngosto = null, tituloLeyenda = "", formatoLeyenda = pctEje, marcasLeyenda = null, globo: g}) {
  const angosto = ancho < 560;
  const columnas = angosto ? 5 : REJILLA_COLUMNAS;
  const c = Math.floor(Math.min(ancho, angosto ? ancho : 980) / columnas), lado = c - (angosto ? 5 : 4);
  const lugares = new Map();
  if (angosto) {
    const orden = ENTIDADES.map((e) => ({e, d: valores.get(e.cve) ?? null}));
    if (ordenAngosto) orden.sort((p, q) => ordenAngosto(p.d, q.d));
    orden.forEach(({e}, i) => lugares.set(e.cve, [i % columnas, Math.floor(i / columnas)]));
  } else for (const e of ENTIDADES) lugares.set(e.cve, REJILLA[e.cve]);
  const filas = angosto ? Math.ceil(ENTIDADES.length / columnas) : REJILLA_FILAS;
  const W = c * columnas, H = c * filas;
  const relleno = (lado2, d, v) => (v == null ? P.sinDato : (lado2 === "a" ? colorA : colorB)?.(d) ?? escala(v));
  const fTexto = lado >= 56 ? 12 : lado >= 40 ? 10.5 : 9;

  const celdas = ENTIDADES.map((e) => {
    const d = valores.get(e.cve) ?? null;
    const va = d == null ? null : a(d), vb = d == null ? null : b(d);
    const [col, fila] = lugares.get(e.cve);
    const fa = relleno("a", d, va), fb = relleno("b", d, vb);
    const triA = svg`<path class="marca-viva" d=${`M0,0L${lado},0L0,${lado}Z`} fill=${fa} stroke=${P.fondo} stroke-width="0.8" stroke-linejoin="round" />`;
    const triB = svg`<path class="marca-viva" d=${`M${lado},0L${lado},${lado}L0,${lado}Z`} fill=${fb} stroke=${P.fondo} stroke-width="0.8" stroke-linejoin="round" />`;
    const datoA = {...(d ?? {cve: e.cve, entidad: e.nombre, _sinDato: true}), _lado: "a"}, datoB = {...datoA, _lado: "b"};
    if (g) {
      for (const [n, dato] of [[triA, datoA], [triB, datoB]]) {
        n.addEventListener("pointerenter", (ev) => mostrarGlobo(g.html(dato), ev.clientX, ev.clientY));
        n.addEventListener("pointermove", (ev) => mostrarGlobo(g.html(dato), ev.clientX, ev.clientY));
        n.addEventListener("pointerleave", ocultarGlobo);
      }
    }
    // Pastilla del sentido, sobre el triángulo de abajo, con fondo propio para
    // que la cifra no dependa del tono que tiene debajo.
    const m = d && marca ? marca(d) : null;
    let pastilla = "";
    if (m) {
      const conTexto = lado >= 52 && m.texto;
      const tinta = tintaLegible(m.color, 4.5);
      const w = conTexto ? Math.ceil(anchoTexto(m.texto, 10.5, true)) + 19 : 15, h = 15;
      const px = lado - w - 3, py = lado - h - 3;
      pastilla = svg`<g class="mt-pastilla" aria-hidden="true" pointer-events="none">
        <rect x=${px} y=${py} width=${w} height=${h} rx="7.5" fill=${P.fondo} fill-opacity="0.94" stroke=${m.color} stroke-width="1" />
        ${glifoSentido(m.signo, px + 7.5, py + h / 2, m.signo === "punto" ? m.color : tinta, 3.6)}
        ${conTexto ? svg`<text x=${px + 14} y=${py + 11} font-size="10.5" font-weight="700" fill=${tinta}>${m.texto}</text>` : ""}
      </g>`;
    }
    const tintaA = va == null ? P.tinta2 : tintaSobre(fa);
    const esDestacada = e.cve === destacar;
    const nodo = svg`<g class="mt-celda fc-aparece" tabindex="0" style=${`--i:${col + fila}`} transform=${`translate(${col * c + 2},${fila * c + 2})`}>
      ${triA}${triB}
      <text x="5" y=${fTexto + 3} font-size=${fTexto} font-weight="800" fill=${tintaA} pointer-events="none">${e.corto}</text>
      ${pastilla}
      <rect class="mt-marco" x="0" y="0" width=${lado} height=${lado} fill="none" stroke=${esDestacada ? P.tinta : "none"} stroke-width=${esDestacada ? 2.8 : 0} pointer-events="none" />
    </g>`;
    // Teclado: el cuadro entero toma el foco, se anuncia con los dos valores y
    // abre el globo del segundo.
    if (g) {
      const rA = g.renglones(datoA), rB = g.renglones(datoB);
      nodo.setAttribute("role", "img");
      nodo.setAttribute("aria-label", `${e.nombre}: ${nombreA}, ${rA.cifra}; ${nombreB}, ${rB.cifra}${m?.texto ? `; ${m.texto}` : ""}`);
      nodo.addEventListener("focus", () => { const r = nodo.getBoundingClientRect(); mostrarGlobo(g.html(datoB), r.right - 6, r.bottom - 6); });
      nodo.addEventListener("blur", ocultarGlobo);
    }
    return nodo;
  });

  const dibujo = svg`<svg class="mosaico-triangulos" role="group" aria-label=${`Mosaico de las 32 entidades, cada cuadro partido en dos: ${nombreA} arriba a la izquierda y ${nombreB} abajo a la derecha.`} width=${W} height=${H} viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;font-family:var(--sans-serif)">${celdas}</svg>`;

  // Leyenda: un cuadro de ejemplo que dice qué mitad es cuál, la rampa y, si
  // hay pastilla, qué dice su flecha.
  const tono = (t) => (escala?.interpolar ? escala.interpolar(t) : P.serie);
  const clave = html`<div class="leyenda-items mt-clave">
    <span class="leyenda-item"><svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
      <path d="M1,1L43,1L1,43Z" fill=${colorA ? P.tinta2 : tono(0.35)} stroke=${P.fondo} />
      <path d="M43,1L43,43L1,43Z" fill=${colorB ? P.tinta3 : tono(0.8)} stroke=${P.fondo} />
      <text x="5" y="14" font-size="10" font-weight="800" fill=${colorA ? P.blanco : tintaSobre(tono(0.35))}>A</text>
      <text x="39" y="39" text-anchor="end" font-size="10" font-weight="800" fill=${colorB ? P.blanco : tintaSobre(tono(0.8))}>B</text>
    </svg><span class="mt-clave-texto"><strong>A</strong> arriba a la izquierda: ${nombreA}<br><strong>B</strong> abajo a la derecha: ${nombreB}</span></span>
    ${(leyendaMarca ?? []).map((i) => html`<span class="leyenda-item"><svg width="16" height="16" aria-hidden="true"><rect x="0.5" y="0.5" width="15" height="15" rx="7.5" fill=${P.fondo} stroke=${i.color} />${glifoSentido(i.signo, 8, 8, tintaLegible(i.color, 3), 3.6)}</svg><span>${i.texto}</span></span>`)}
  </div>`;
  const rampa = escala?.dominio ? leyendaContinua(escala, {titulo: tituloLeyenda, formato: formatoLeyenda, marcas: marcasLeyenda, ancho: Math.min(300, ancho - 70)}) : "";
  return html`<div class="forma"><div class="forma-leyendas">${clave}${rampa}</div>${dibujo}</div>`;
}
