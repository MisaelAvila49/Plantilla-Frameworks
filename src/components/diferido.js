// src/components/diferido.js
// Dibujo diferido: un análisis se dibuja cuando se acerca a la pantalla, no
// al abrir la página. Reserva alto para que el índice y el scroll no brinquen,
// observa con un margen amplio y ejecuta `fn` UNA sola vez (con respaldo por
// posición: ver abajo).

export function alAcercarse(el, fn, {margen = "1200px 0px", alto = 520} = {}) {
  el.style.minHeight = alto + "px";
  // La reserva se suelta DESPUÉS de dibujar, no antes. Si se suelta antes, el
  // dibujo mide el ancho (layout forzado) con la sección vacía y encogida;
  // Chrome toma ese estado intermedio para su ancla de scroll y, si la
  // sección está por encima de la vista, compensa de más: al subir con la
  // rueda la página brincaba unos 300 px hacia abajo (docs/scroll-bug.md).
  let hecho = false;
  const listo = () => {
    if (hecho) return;
    hecho = true;
    soltar();
    fn();
    el.style.minHeight = "";
  };
  if (!("IntersectionObserver" in window)) { hecho = true; fn(); el.style.minHeight = ""; return () => {}; }
  const vigia = new IntersectionObserver((entradas) => {
    if (entradas.some((e) => e.isIntersecting)) listo();
  }, {rootMargin: margen});
  vigia.observe(el);
  // Respaldo: en celulares (Brave y Chrome en Android) el observador a veces no
  // avisa y la sección se quedaba en blanco para siempre (noviembre 2026: la
  // mitad de Trabajo y algunos mapas, también en verificar:render). Se revisa
  // la posición al desplazar, al cambiar el tamaño o el zoom (visualViewport) y
  // cada segundo; con el mismo margen del observador. Pasivo y sin bucle una
  // vez dibujada.
  const px = (parseInt(margen, 10) || 0);
  const cerca = () => {
    if (hecho || !el.isConnected) return;
    const r = el.getBoundingClientRect();
    const alto = window.visualViewport?.height ?? innerHeight;
    if (r.bottom >= -px && r.top <= alto + px) listo();
  };
  let pendiente = false;
  const alMover = () => { if (pendiente) return; pendiente = true; requestAnimationFrame(() => { pendiente = false; cerca(); }); };
  addEventListener("scroll", alMover, {passive: true});
  addEventListener("resize", alMover, {passive: true});
  window.visualViewport?.addEventListener("resize", alMover, {passive: true});
  window.visualViewport?.addEventListener("scroll", alMover, {passive: true});
  const reloj = setInterval(cerca, 1000);
  function soltar() {
    vigia.disconnect();
    clearInterval(reloj);
    removeEventListener("scroll", alMover);
    removeEventListener("resize", alMover);
    window.visualViewport?.removeEventListener("resize", alMover);
    window.visualViewport?.removeEventListener("scroll", alMover);
  }
  return soltar;
}

// Espera a que el navegador quede libre antes de cargar una tanda pesada de
// datos. Las API que no existen en todos los navegadores se invocan SIEMPRE
// como propiedad de `window`, en la detección y en la llamada: con el nombre
// suelto, Framework lo toma como una entrada de la celda y en Safari la celda
// entera falla.
export function cuandoLibre(espera = 1500) {
  return new Promise((ok) => (window.requestIdleCallback ? window.requestIdleCallback(() => ok(), {timeout: espera}) : setTimeout(ok, 300)));
}
