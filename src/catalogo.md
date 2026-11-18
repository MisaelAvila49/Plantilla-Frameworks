---
title: Catálogo de formas
toc: false
---

<header class="capitulo-cabecera cat-cabecera">
  <span class="capitulo-antetitulo">Galería de formas</span>
  <h1>Catálogo de <span class="clave">formas</span></h1>
  <p class="capitulo-entradilla">Todas las formas de gráfica de la Plantilla en un solo índice. Se busca por familia, por la tabla que se parece a tus datos, por lo que quieres mostrar o por la figura que dibuja; cada tarjeta abre la forma implementada en la galería, con datos de muestra.</p>
</header>

<link rel="stylesheet" href="./catalogo.css">

```js
import {catalogo, enlaceRecetas} from "./components/catalogo.js";
import {MINIATURAS} from "./catalogo/miniaturas.js";

const datos = await FileAttachment("data/catalogo.json").json();
display(catalogo(datos, {miniaturas: MINIATURAS}));
```

<section class="cat-descartes" aria-labelledby="descartadas">
  <h2 id="descartadas">Formas que no usamos</h2>
  <p>Varias son famosas y algunas vienen de autores muy buenos, pero en un libro para el público fallan en algo medible. Se deja el motivo para no volver a discutirlo.</p>
  <div class="cat-tabla" tabindex="0" role="region" aria-label="Tabla de formas que no usamos, con su motivo y su reemplazo">
    <table>
      <thead><tr><th scope="col">Forma</th><th scope="col">Por qué no</th><th scope="col">En su lugar</th><th scope="col">Referencia</th></tr></thead>
      <tbody>
        <tr><td>Pastel y dona</td><td>El ángulo se compara mal justo cuando las partes se parecen.</td><td>Apiladas al 100 %, waffle</td><td>-</td></tr>
        <tr><td>Radar</td><td>El área depende del orden de los ejes y no se pueden ordenar muchos radares.</td><td>Heatmap, barras</td><td>-</td></tr>
        <tr><td>Doble eje y</td><td>Dos escalas arbitrarias fabrican correlaciones.</td><td>Índice base 100, dos gráficas</td><td>-</td></tr>
        <tr><td>Streamgraph</td><td>La base ondula y ninguna capa se puede medir.</td><td>Área apilada desde cero, líneas</td><td><a href="https://observablehq.com/@d3/streamgraph/2" target="_blank" rel="noopener">Byron y Wattenberg</a></td></tr>
        <tr><td>Diagrama de cuerdas</td><td>Los arcos cruzados no se siguen ni se leen como cantidad.</td><td>Matriz de adyacencia, Sankey</td><td><a href="https://observablehq.com/@d3/directed-chord-diagram/2" target="_blank" rel="noopener">Krzywinski, D3</a></td></tr>
        <tr><td>Barras y áreas radiales</td><td>El ojo juzga mal longitudes en círculo; solo valen cuando el ciclo es la historia.</td><td>Calendario, heatmap hora × día</td><td><a href="https://www.visualcinnamon.com/portfolio/baby-spike/" target="_blank" rel="noopener">Nadieh Bremer</a></td></tr>
        <tr><td>Sunburst de secuencias</td><td>Los anillos externos son diminutos y sin interacción no se leen.</td><td>Icicle</td><td><a href="https://observablehq.com/@kerryrodden/sequences-sunburst" target="_blank" rel="noopener">Kerry Rodden</a></td></tr>
        <tr><td>Empaquetado de círculos</td><td>Compara áreas de círculos, que el ojo subestima, y desperdicia el espacio entre ellos.</td><td>Treemap</td><td>-</td></tr>
        <tr><td>Glifos de flor</td><td>Memorables, pero el tamaño de un pétalo no se compara con otro.</td><td>Heatmap con una sola escala</td><td><a href="https://well-formed-data.net/archives/618/oecd-better-life-index/" target="_blank" rel="noopener">Moritz Stefaner</a></td></tr>
        <tr><td>Arcoíris y esquemas sin validar</td><td>Inventan fronteras y no cambian con el tema.</td><td>Paletas del sistema</td><td>-</td></tr>
        <tr><td>3D</td><td>Distorsiona magnitudes y oculta datos.</td><td>La versión 2D</td><td>-</td></tr>
      </tbody>
    </table>
  </div>
</section>

```js
display(enlaceRecetas());
```
