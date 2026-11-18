// formas/contexto.js
// ¿Cómo les fue a unas pocas unidades elegidas frente a todas las demás? Las
// demás series van en gris tenue, como contexto, y hasta tres elegidas por el
// lector van en color de identidad y con trazo grueso, con su nombre al final
// de la línea. El tiempo corre hacia la DERECHA.
//
// Es la variante horizontal de `destacadas` (formas/destacadas.js), que ya
// dibuja series en gris con un grupo destacado y por omisión pone el tiempo
// hacia abajo. Aquí no se reescribe esa forma: se llama con `vertical: false`
// y un color por serie elegida, y solo se cambia la leyenda, que en
// `destacadas` tiene una sola entrada para todo el grupo y aquí nombra cada
// serie con su tono.
// No: cuando todas las series importan por igual (heatmap o mosaico de
// mini-series), con menos de cinco puntos por serie (pendiente) ni con más
// de tres elegidas (el cuarto tono no se distingue: R107).
import {P} from "../paleta.js";
import {destacadas} from "./destacadas.js";
import {leyendaItems, vacio} from "./comun.js";

// datos, tiempo, valor, serie: como en `destacadas`. `elegidas`: lista de
// hasta tres series, en el orden en que el lector las eligió (de ahí sale su
// color, no de la frecuencia). `color(serie)`: tono de identidad.
export function contexto(datos, {ancho, tiempo, valor, serie, elegidas = [], color, referencia = null, dominio = null, formato, rotuloValor = null, corto = null,
  textoResto = "Las demás", globo: g}) {
  const lista = [...new Set(elegidas)].filter(Boolean).slice(0, 3);
  if (!datos.some((d) => valor(d) != null)) return vacio();
  const nodo = destacadas(datos, {ancho, tiempo, valor, serie, destacada: (s) => lista.includes(s), color, referencia, dominio, vertical: false, formato,
    rotuloValor, corto, textoResto, prefijo: "contexto", globo: g});
  const leyenda = leyendaItems([
    ...lista.map((s) => ({tipo: "linea", color: color(s), texto: s})),
    {tipo: "linea", color: P.contexto, texto: textoResto},
    ...(referencia ? [{tipo: "linea", color: P.regla, texto: referencia.texto}] : []),
  ]);
  nodo.querySelector(":scope > .leyenda-items")?.replaceWith(leyenda);
  return nodo;
}
