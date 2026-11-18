// src/components/diferido.js
// Dibujo diferido: un análisis se dibuja cuando se acerca a la pantalla, no
// al abrir la página. Reserva alto para que el índice y el scroll no brinquen,
// observa con un margen amplio y ejecuta `fn` UNA sola vez.

export function alAcercarse(el, fn, {margen = "1200px 0px", alto = 520} = {}) {
  el.style.minHeight = alto + "px";
  // La reserva se suelta DESPUÉS de dibujar, no antes. Si se suelta antes, el
  // dibujo mide el ancho (layout forzado) con la sección vacía y encogida;
  // Chrome toma ese estado intermedio para su ancla de scroll y, si la
  // sección está por encima de la vista, compensa de más: al subir con la
  // rueda la página brincaba unos 300 px hacia abajo (docs/scroll-bug.md).
  const listo = () => { fn(); el.style.minHeight = ""; };
  if (!("IntersectionObserver" in window)) { listo(); return () => {}; }
  const vigia = new IntersectionObserver((entradas) => {
    if (!entradas.some((e) => e.isIntersecting)) return;
    vigia.disconnect();
    listo();
  }, {rootMargin: margen});
  vigia.observe(el);
  return () => vigia.disconnect();
}

// Espera a que el navegador quede libre antes de cargar una tanda pesada de
// datos. Las API que no existen en todos los navegadores se invocan SIEMPRE
// como propiedad de `window`, en la detección y en la llamada: con el nombre
// suelto, Framework lo toma como una entrada de la celda y en Safari la celda
// entera falla.
export function cuandoLibre(espera = 1500) {
  return new Promise((ok) => (window.requestIdleCallback ? window.requestIdleCallback(() => ok(), {timeout: espera}) : setTimeout(ok, 300)));
}
