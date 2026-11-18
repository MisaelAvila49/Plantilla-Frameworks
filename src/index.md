---
toc: false
---

```js
// Portada editorial. Todo sale del bloque LIBRO de observablehq.config.js:
// aquí no se escribe ni el título ni los autores ni la cita.
import {LIBRO} from "./components/libro.js";
import {portada, metadatos, comoCitar} from "./components/portada.js";
// Tapa con una ilustración de personas (R184): «El cruce», del equipo de
// Social Data IBERO (créditos en referencias). Cada libro la cambia por una
// figura de su propio tema. Posición en % del ancho de la tapa.
const figuraTapa = await FileAttachment("images/cruce-baston.svg").url();
const logoTapa = await FileAttachment("images/social_data_gris.svg").url();
```

```js
display(portada(LIBRO, {
  imagen: {url: figuraTapa, izquierda: 10, abajo: 18, ancho: 78},
  logo: logoTapa,
  antetitulo: "Herramienta · Social Data IBERO",
  explorar: "./seccion-modelo", textoExplorar: "Ver la sección modelo",
  metodo: "#empezar", textoMetodo: "Cómo empezar un libro",
}));
```

<div class="instituciones-fila portada-instituciones">
  <span class="instituciones-rotulo">Un proyecto de</span>
  <a class="instituciones-chip" href="https://ibero.mx" target="_blank" rel="noopener"><img src="./images/ibero/ibero-logo-color.webp" alt="Universidad Iberoamericana Ciudad de México"></a>
  <a class="instituciones-chip" href="https://socialdata.ibero.mx" target="_blank" rel="noopener"><img src="./images/social_data_original.svg" alt="Social Data IBERO"></a>
</div>

```js
display(metadatos(LIBRO));
```

```js
display(comoCitar(LIBRO));
```

<h2 class="indice-rotulo">Contenido</h2>
<div class="indice-grupos">
  <h3 class="indice-grupo">Ejemplos</h3>
  <ul class="indice-libro" aria-label="Ejemplos">
  <li><a href="./seccion-modelo">Sección modelo</a><span>Una sección completa con la anatomía estándar: filtros, cifras, figura y los tres desplegables.</span></li>
  <li><a href="./mapa">Mapa de flujos</a><span>Mapa a pantalla completa con flechas de entrada y salida por entidad.</span></li>
  </ul>
  <h3 class="indice-grupo">Herramientas</h3>
  <ul class="indice-libro" aria-label="Herramientas">
  <li><a href="./catalogo">Catálogo de formas</a><span>Todas las formas de gráfica por familia, entrada, función y figura, con enlace a su galería.</span></li>
  <li><a href="./colores">Muestra de colores</a><span>Propuestas de paleta sobre las mismas figuras, con el resultado del validador de daltonismo y contraste.</span></li>
  </ul>
  <h3 class="indice-grupo">Galería de formas</h3>
  <ul class="indice-libro" aria-label="Galería de formas">
  <li><a href="./galeria/comparacion">Comparación</a><span>Ranking, brecha entre dos valores y cruce de dos dimensiones.</span></li>
  <li><a href="./galeria/precision">Precisión e incertidumbre</a><span>Intervalos, márgenes de error y qué cifras se distinguen.</span></li>
  <li><a href="./galeria/tablas">Tablas</a><span>Tablas con barras, color y minigráficas.</span></li>
  <li><a href="./galeria/distribucion">Distribución</a><span>Franjas, crestas, pirámide, histograma y caja.</span></li>
  <li><a href="./galeria/correlacion">Correlación</a><span>Dos medidas a la vez: dispersión, hexágonos y trayectoria.</span></li>
  <li><a href="./galeria/parte-todo">Parte de un todo</a><span>Rectángulos por tamaño, barras al cien por ciento y cascada.</span></li>
  <li><a href="./galeria/tiempo">Tiempo</a><span>Series de tiempo, cambio entre dos ediciones y posiciones.</span></li>
  <li><a href="./galeria/flujo">Flujo</a><span>De dónde a dónde, entre dos o más cortes.</span></li>
  <li><a href="./galeria/mapas">Mapas</a><span>Mapa por entidad, mapa del cambio, mosaico y mapa bivariado.</span></li>
  <li><a href="./galeria/unidades">Unidades</a><span>Cuántos de cada cien.</span></li>
  <li><a href="./galeria/conceptos">Conceptos y diagramas</a><span>Árbol de la pregunta, embudo y conjuntos.</span></li>
  </ul>
</div>

<section id="empezar" class="empezar" aria-labelledby="empezar-titulo">
  <h2 id="empezar-titulo" class="indice-rotulo">Cómo empezar un libro</h2>
  <p class="empezar-entrada">Un libro nuevo es una copia de esta carpeta con sus propios datos. Antes de empezar se lee <code>docs/EMPEZAR-AQUI.md</code>, que resume las decisiones vigentes; los pasos completos están en el <code>README.md</code>.</p>
  <ol class="empezar-pasos">
  <li><strong>Copiar la carpeta</strong> sin <code>node_modules/</code>, <code>dist/</code> ni <code>docs/capturas/</code>, y correr <code>npm install</code>.</li>
  <li><strong>Editar el bloque <code>LIBRO</code></strong> de <code>observablehq.config.js</code>: título, palabra clave en rojo, resumen, autores, año, DOI y licencia. De ahí salen la portada, el menú, las citas y las descargas; solo <code>CITATION.cff</code> se copia a mano.</li>
  <li><strong>Elegir el tono de tema</strong> en <code>LIBRO.tono</code> y correr <code>npm run verificar:paleta</code>. Cada capítulo declara arriba qué significan el rojo y el azul con <code>significado()</code>.</li>
  <li><strong>Cargar los datos</strong> en <code>src/data/</code> en lugar de <code>src/components/muestra.js</code>, y quitar el sello «Datos de muestra» de cada figura.</li>
  <li><strong>Escribir las páginas</strong> a partir de la <a href="./seccion-modelo">sección modelo</a> y registrar cada una en <code>scripts/paginas.mjs</code>, la lista que arma el menú y que leen los verificadores.</li>
  <li><strong>Cambiar la tapa</strong> en <code>src/index.md</code> por una ilustración del tema del libro, con su licencia anotada en Referencias, y generar la vista previa <code>src/images/og-portada.png</code>.</li>
  <li><strong>Verificar</strong> con <code>npm run verificar:todo</code>: build, dibujo de cada página, filtros, accesibilidad, paleta y panel quieto.</li>
  <li><strong>Publicar</strong> en GitHub Pages con el procedimiento de <code>docs/publicar-en-github-pages.md</code>.</li>
  </ol>
</section>
