---
toc: false
---

```js
// Portada editorial. Todo sale del bloque LIBRO de observablehq.config.js:
// aquí no se escribe ni el título ni los autores ni la cita.
import {LIBRO} from "./components/libro.js";
import {portada, metadatos, comoCitar, tapaMosaico} from "./components/portada.js";
import {leerIndicador} from "./components/muestra.js";

// Dato del dibujo de la tapa: el indicador de muestra por entidad, 2020.
const indicador = leerIndicador(await FileAttachment("data/muestra/indicador.csv").csv());
const logoTapa = await FileAttachment("images/social_data_gris.svg").url();
```

```js
const porEntidad = new Map(indicador.filter((r) => r.anio === 2020 && r.sexo === "Total").map((r) => [r.cve, r.pct]));
display(portada(LIBRO, {dibujo: tapaMosaico(porEntidad, [0, 100]), logo: logoTapa}));
```

<div class="instituciones-fila portada-instituciones">
  <span class="instituciones-rotulo">Un proyecto de</span>
  <a class="instituciones-chip" href="https://ibero.mx" target="_blank" rel="noopener"><img src="./images/ibero/ibero-logo-color.webp" alt="Universidad Iberoamericana Ciudad de México"></a>
  <a class="instituciones-chip" href="https://socialdata.ibero.mx" target="_blank" rel="noopener"><img src="./images/social_data_original.svg" alt="Social Data IBERO"></a>
</div>

```js
display(metadatos(LIBRO));
```

<ul class="indice-libro" aria-label="Contenido de la plantilla">
  <li><a href="./catalogo">Catálogo de formas</a><span>Todas las formas de gráfica por familia, entrada, función y figura, con enlace a su galería.</span></li>
  <li><a href="./seccion-modelo">Sección modelo</a><span>Una sección completa con la anatomía estándar: filtros, cifras, figura y los tres desplegables.</span></li>
  <li><a href="./mapa">Mapa de flujos</a><span>Mapa a pantalla completa con flechas de entrada y salida por entidad.</span></li>
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

```js
display(comoCitar(LIBRO));
```
