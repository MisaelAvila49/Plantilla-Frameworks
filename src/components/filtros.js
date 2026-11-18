// src/components/filtros.js
// Panel de filtros de una sección. UN panel por gráfica (así se puede dejar
// una en un año y otra en otro), con las mismas piezas, el mismo orden y los
// mismos rótulos en todo el libro.
//
// Reglas que el componente hace cumplir:
//   - El rótulo va ARRIBA de cada control y los controles miden lo mismo.
//   - Los campos van en grupos rotulados (fieldset + legend), de lo grande a
//     lo específico: primero dónde, luego entre quiénes, luego cuándo.
//   - Un selector NUNCA ofrece una opción que deja la gráfica vacía: las
//     opciones de cada campo salen de una función de la selección vigente
//     (solo lo que tiene dato).
//   - Los dependientes se rellenan cuando cambia el campo que los gobierna, y
//     la jerarquía es coherente en los dos sentidos: elegir el padre limpia al
//     hijo; elegir el hijo fija al padre (`alElegir`).
//   - Fijo arriba al desplazar la página, se compacta sin cambiar el largo de
//     la página (lo hace el script de la cabecera; `npm run verificar:quieto`).

import {html} from "npm:htl";

let serie = 0;
const comoOpcion = (o) => (o != null && typeof o === "object" ? o : {valor: o, texto: String(o)});

// Campo de lista. `opciones`: arreglo o función de la selección vigente
// `(v) => [...]`; cada opción es un valor suelto, {valor, texto} o un grupo
// {grupo: "Rótulo", opciones: [...]}. `inicial`: valor por omisión (la vista
// más simple que ya cuenta algo). `alElegir(valor, v)`: devuelve los cambios
// que este campo impone a otros (el hijo fija al padre).
export function campo({id, rotulo, opciones, inicial = null, alElegir = null, oculto = null}) {
  return {tipo: "lista", id, rotulo, opciones, inicial, alElegir, oculto};
}

// Umbral escrito como frase, con la cifra editable dentro:
//   «Unidades con [40] % o más en el primer año».
export function campoUmbral({id, antes = "", despues = "", min = 0, max = 100, paso = 1, inicial = 0, rotulo = "Umbral"}) {
  return {tipo: "umbral", id, rotulo, antes, despues, min, max, paso, inicial};
}

// panel({grupos: [{leyenda, campos: [...]}]}) devuelve un <form> con:
//   .value        la selección vigente, {id: valor}
//   .fijar(obj)   cambia valores desde fuera (un clic en la gráfica)
// y emite `input` cada vez que cambia.
export function panel({grupos}) {
  const campos = grupos.flatMap((g) => g.campos);
  const v = {};
  const controles = new Map();
  const n = ++serie;

  const aplanar = (lista) => lista.flatMap((o) => (o?.grupo != null ? o.opciones.map(comoOpcion) : [comoOpcion(o)]));
  const opcionesDe = (c) => (typeof c.opciones === "function" ? c.opciones(v) : c.opciones) ?? [];

  // Vuelve a calcular las opciones de cada lista con la selección vigente y
  // corrige los valores que ya no tienen dato. Se repite hasta que nada
  // cambia (un campo puede depender de otro que acaba de corregirse).
  function reconciliar() {
    for (let vuelta = 0; vuelta < 4; vuelta++) {
      let cambio = false;
      for (const c of campos) {
        if (c.tipo !== "lista") continue;
        const lista = opcionesDe(c), planas = aplanar(lista);
        const valido = planas.some((o) => String(o.valor) === String(v[c.id]));
        if (!valido) {
          const porOmision = planas.find((o) => String(o.valor) === String(c.inicial)) ?? planas[0];
          const nuevo = porOmision ? porOmision.valor : null;
          if (v[c.id] !== nuevo) { v[c.id] = nuevo; cambio = true; }
        }
        const sel = controles.get(c.id);
        const firma = JSON.stringify(lista);
        if (sel.dataset.firma !== firma) {
          sel.dataset.firma = firma;
          const opcion = (o) => html`<option value=${String(o.valor)}>${o.texto}</option>`;
          sel.replaceChildren(...lista.map((o) => (o?.grupo != null ? html`<optgroup label=${o.grupo}>${o.opciones.map(comoOpcion).map(opcion)}</optgroup>` : opcion(comoOpcion(o)))));
        }
        sel.value = String(v[c.id]);
        // Un campo con una sola opción no decide nada: se deshabilita.
        sel.disabled = planas.length <= 1;
        const caja = sel.closest(".campo");
        if (caja && c.oculto) caja.hidden = Boolean(c.oculto(v));
      }
      if (!cambio) break;
    }
  }

  const armarLista = (c) => {
    const id = `f${n}-${c.id}`;
    const sel = html`<select id=${id} name=${c.id}></select>`;
    controles.set(c.id, sel);
    sel.addEventListener("change", () => {
      const planas = aplanar(opcionesDe(c));
      const elegida = planas.find((o) => String(o.valor) === sel.value);
      v[c.id] = elegida ? elegida.valor : sel.value;
      if (c.alElegir) Object.assign(v, c.alElegir(v[c.id], v) ?? {});
      reconciliar();
      forma.dispatchEvent(new Event("input", {bubbles: true}));
    });
    return html`<div class="campo"><label class="campo-rotulo" for=${id}>${c.rotulo}</label>${sel}</div>`;
  };
  const armarUmbral = (c) => {
    const id = `f${n}-${c.id}`;
    v[c.id] = c.inicial;
    const numero = html`<input type="number" id=${id} name=${c.id} min=${c.min} max=${c.max} step=${c.paso} value=${c.inicial}>`;
    const barra = html`<input type="range" aria-label=${c.rotulo} min=${c.min} max=${c.max} step=${c.paso} value=${c.inicial}>`;
    const poner = (x) => {
      const val = Math.max(c.min, Math.min(c.max, Number.isFinite(+x) ? +x : c.inicial));
      v[c.id] = val; numero.value = val; barra.value = val;
      forma.dispatchEvent(new Event("input", {bubbles: true}));
    };
    numero.addEventListener("change", () => poner(numero.value));
    barra.addEventListener("input", () => poner(barra.value));
    controles.set(c.id, {poner});
    return html`<div class="campo campo-umbral"><label class="campo-rotulo solo-lector" for=${id}>${c.rotulo}</label><span class="campo-frase">${c.antes} ${numero} ${c.despues}</span>${barra}</div>`;
  };

  const forma = html`<form class="panel-filtros" aria-label="Filtros de esta gráfica">${grupos.map((g) => html`<fieldset class="panel-grupo">
    <legend>${g.leyenda}</legend>
    <div class="panel-campos">${g.campos.map((c) => (c.tipo === "umbral" ? armarUmbral(c) : armarLista(c)))}</div>
  </fieldset>`)}</form>`;
  forma.addEventListener("submit", (e) => e.preventDefault());

  for (const c of campos) if (c.tipo === "lista") v[c.id] = c.inicial;
  reconciliar();

  Object.defineProperty(forma, "value", {get: () => ({...v})});
  forma.fijar = (cambios) => {
    for (const [k, x] of Object.entries(cambios)) {
      const c = campos.find((q) => q.id === k);
      if (!c) continue;
      if (c.tipo === "umbral") controles.get(k).poner(x);
      else { v[k] = x; if (c.alElegir) Object.assign(v, c.alElegir(x, v) ?? {}); }
    }
    reconciliar();
    forma.dispatchEvent(new Event("input", {bubbles: true}));
  };
  return forma;
}

// Ayudas para construir opciones «solo con dato».
// Valores distintos de una columna entre las filas que pasan `filtro`.
export function conDato(filas, columna, filtro = () => true) {
  return [...new Set(filas.filter(filtro).map((d) => (typeof columna === "function" ? columna(d) : d[columna])))].filter((x) => x != null);
}
