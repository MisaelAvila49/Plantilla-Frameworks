# La rueda no deja subir: el panel pegajoso y el anclaje de scroll

## Reporte

«El scroll está roto: intento subir a veces en algunas gráficas, pero ya no me
deja, como que se buguea y me baja automáticamente.»

## Reproducción

Se escribió `scripts/verificar_scroll.mjs` (`npm run verificar:scroll`, último
paso de `verificar:todo`). Recorre cada página de `paginas.mjs` con pasos de
rueda reales (`page.mouse.wheel`, 240 px) con el puntero sobre la figura más
visible: baja hasta el fondo, sube hasta arriba, entra directo al fondo y sube
(«ancla»), y gira la rueda con el puntero quieto sobre cada mapa, multitud y
fracción. Mide 1366 × 768, 1920 × 1080 y 390 × 844, con movimiento reducido y
sin reducir, en Chromium (Edge instalado). Firefox y WebKit de Playwright no
están instalados en esta máquina y no se probaron.

Antes del arreglo: 3,473 pasos, 193 bloqueados y 0 saltos en reposo. Todos los
bloqueos fueron al subir, en las seis páginas de la galería con varias
secciones, en escritorio; a 390 px solo uno, en Unidades. Ejemplo en
`/galeria/unidades`, 1366 × 768, puntero sobre «escalones»: tres pasos
seguidos de −240 px dejaron `scrollY` en 5676 → 5586 → 5495 → 5404, es decir
−90 px por paso en vez de −240. La página se devolvía 150 px hacia abajo.

## Causa

Se registraron los eventos de un solo paso (rueda, scroll y cambios de clase
de los paneles):

    wheel  −240               scrollY 5436   (la rueda sí movió 240 px)
    panel 4 se fija (197 → 46 px de alto)
    panel 5 se suelta
    scroll                    scrollY 5586   (+150, nadie lo pidió)
    panel 4 se suelta (la sección 4 ya salió de la vista)

Al subir, la parte baja de la sección de arriba asoma en la vista y su panel
se fija y se compacta. `fijar()` en el script de cabecera de
`observablehq.config.js` lo hace en dos tiempos: añade `pegado` y mide con un
layout forzado (el panel ya mide 151 px menos y el contenido de debajo sube),
y luego da a `.panel-reserva` un margen para devolver ese contenido a su
lugar. El cambio neto del largo es cero, pero Chrome elige el ancla de scroll
en el estado intermedio; cuando el margen devuelve el contenido a su lugar,
cree que el ancla bajó 150 px y baja la página lo mismo. La sección de arriba
vuelve a salir de la vista, su panel se suelta y en el siguiente paso todo se
repite: cada paso pierde unos 150 px y en las secciones cortas parece que la
página no deja subir.

Pruebas que lo confirman, en la misma posición (`scrollY` 5676 → 5436):

- Repetir a mano los pasos de `fijar()` en una sola tarea: `scrollY` sigue en
  5436 tras el primer layout forzado y pasa a 5586 en el segundo, cuando el
  margen de la reserva devuelve el contenido.
- Con `overflow-anchor: none` en `<html>` no hay salto (`scrollY` se queda en
  5436). Con `overflow-anchor: none` solo en los paneles el salto sigue: el
  ancla no está en el panel, sino en el contenido de debajo de él.

Se descartaron, con los datos del verificador: captura de la rueda (ningún
`wheel` con `preventDefault`, ni d3-zoom; los 36 pasos sobre mapas, multitud y
fracción solo fallaban donde coincidían con el cruce de una sección),
`scrollIntoView`/`focus()` (no existen en `src/`), `scroll-behavior` y
`scroll-snap` (no se usan), el dibujo diferido (el contenido de arriba no se
movió en reposo en ningún paso, ni en la fase «ancla», porque el anclaje de
Chrome compensa cuando una sección se dibuja por encima de la vista) y
saltos espontáneos (0 en todas las fases).

## Arreglo

En `fijar()` de `observablehq.config.js` (rama de fijar el panel) se apaga el
anclaje de scroll del documento (`document.documentElement.style.overflowAnchor
= "none"`) mientras se compacta el panel y se calcula la reserva, se fuerza el
layout final y se restaura el valor anterior. El cambio neto de esa operación
es cero por construcción, así que no hay nada que anclar; fuera de ella el
anclaje sigue activo y sigue compensando el dibujo diferido. La rama de soltar
el panel no se tocó: lo hace en un solo cambio, sin layout intermedio.

Regla que se desprende: **un cambio de layout que se compensa en dos tiempos
con medidas intermedias (añadir clase, medir, corregir margen) va con el
anclaje de scroll apagado durante la operación**, o Chrome toma el estado
intermedio como referencia y mueve la página.

## Un falso positivo que se corrigió en el verificador

La primera versión del verificador juzgaba por `scrollY`. Tras el arreglo
quedaban dos pasos «bloqueados», ambos a 390 px en Unidades, fase «ancla»: la
rueda pedía −240 y `scrollY` subía +221. Se midió la posición en pantalla de
un elemento a media vista: lo visible se movió 241 px en el sentido correcto.
La sección «fracción», sin dibujar todavía, se dibujó por encima de la vista
(911 → 1373 px de alto) y el anclaje de Chrome subió `scrollY` lo justo para
que lo visible no brincara. Desde entonces el verificador juzga por lo que se
ve (un elemento de referencia fuera del panel pegajoso, del globo y de
secciones sin dibujar) y reporta `scrollY` como dato. Con el arreglo
desactivado a mano en `dist/` sigue detectando el bug (22 pasos bloqueados en
Unidades y Mapas a 1366 × 768).

Pendiente, no verificable aquí: en un navegador sin anclaje de scroll (Safari
lo soportaba de forma limitada) ese mismo dibujo diferido por encima de la
vista sí empujaría la página unos 460 px. Si se reporta en Safari, el arreglo
es reservar en `alAcercarse` un alto más cercano al final, no un `scrollBy`.

## Cómo se verifica

`npm run verificar:scroll` debe dar 0 pasos bloqueados y 0 saltos en reposo
mayores de 4 px; `npm run verificar:quieto` sigue cubriendo el temblor en
reposo al final de cada sección. Después del arreglo, dentro de
`verificar:todo` (que salió con código 0): 3,381 pasos de rueda, 36 figuras
con rueda, 0 bloqueados y 0 saltos mayores de 4 px. Para una prueba rápida,
`SCROLL_RAPIDO=1 node scripts/verificar_scroll.mjs galeria/unidades` solo
mide 1366 × 768 con movimiento reducido.

## Segundo caso: la reserva del dibujo diferido (noviembre de 2026)

Al integrar las formas de territorio, `verificar:todo` volvió a dar un paso
bloqueado en Unidades, fase «ancla», casi siempre con movimiento: la rueda
pedía −240 y `scrollY` subía +383 (lo visible se movió 304 px al revés). Pasaba
igual con las formas nuevas quitadas del build, así que era previo. Se registró
el paso: la sección «histograma-unidades», por encima de la vista, se dibujó
durante el paso y creció 80 px, pero Chrome compensó 623 px. `alAcercarse()`
soltaba la reserva de 520 px ANTES de dibujar y `pintar()` mide el ancho con un
layout forzado en ese estado intermedio (sección vacía y encogida); Chrome tomó
ahí su ancla. Ahora la reserva se suelta después de dibujar
(`src/components/diferido.js`). Con la caza repetida (6 vueltas, la mitad con
movimiento), antes del arreglo cada vuelta con movimiento daba un paso al
revés; después, ninguna.

En `verificar_scroll.mjs` se corrigió además la elección del elemento de
referencia: cuando el punto de muestra caía en un hueco entre bloques, tomaba
el `<main>`, cuyo borde superior se mueve con todo lo que se dibuja encima y
reportaba como salto la compensación del anclaje (falso positivo en Mapas).
Ya no se toma como referencia un contenedor de secciones. Con el arreglo de
2026 desactivado a mano en `dist/` el verificador sigue detectando el bug
original (34 pasos bloqueados en Unidades y Mapas a 1366 × 768).

## Tercer caso: la entrada con `transform` (noviembre de 2026)

Al construir las formas de composición y tiempo, en una copia aparte, se
reprodujo el paso bloqueado de la fase «ancla» en Unidades con movimiento
activado, antes de añadir ninguna forma. Ahí se atribuyó a la animación común
`entrar` de `src/estilo.css`, que subía cada bloque 10 px con `transform`:
Chrome tomaba el estado desplazado como ancla y compensaba de más. Con
animación solo de opacidad la compensación fue exacta. El arreglo de
`diferido.js` (segundo caso) y este atacan el mismo síntoma por dos lados, así
que se dejaron los dos: `entrar` anima solo la opacidad en todo el sitio. Regla
general: ninguna animación de entrada mueve el bloque (`transform`,
`translate`, `margin`, `top`); solo cambia su opacidad.
