---
title: Mapa de flujos
toc: false
footer: false
pager: false
---

<!-- Mapa de flujos a pantalla completa, CON el menú de Framework a la
     izquierda. Sin índice, pie ni paginador (front matter). La disposición,
     el flujo de uso y las decisiones están en src/components/mapa-flujos.js
     y en docs/mapa-flujos.md. Datos de muestra: scripts/muestra_mapa.mjs. -->
<link rel="stylesheet" href="./mapa-flujos.css">

<header class="mapa-barra">
  <h1>Mapa de <span class="clave">flujos</span></h1>
  <span class="figura-sello">Datos de muestra</span>
  <a class="mapa-barra-enlace" href="./metodologia#m-mapa-flujos">Cómo se hizo</a>
</header>

```js
import {mapaFlujos} from "./components/mapa-flujos.js";
import {leerFlujosGrupos, leerPoblacionGrupos} from "./components/muestra-mapa.js";

const [flujos, poblacion, geo] = await Promise.all([
  FileAttachment("data/muestra/flujos_grupos.csv").csv().then(leerFlujosGrupos),
  FileAttachment("data/muestra/poblacion_grupos.csv").csv().then(leerPoblacionGrupos),
  FileAttachment("data/muestra/entidades.geojson").json(),
]);
```

```js
display(mapaFlujos({flujos, poblacion, geo}));
```
