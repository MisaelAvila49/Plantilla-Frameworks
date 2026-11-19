# Plantilla de libro de datos · Social Data IBERO

Base de Observable Framework para los libros de datos de Social Data IBERO. Cada libro nuevo se crea copiando esta carpeta. Trae la portada editorial, una sección modelo con la anatomía estándar, una galería con una página por familia de gráficas, metodología y referencias de plantilla, y cinco verificadores que apuntan a sus propias páginas.

Todas las cifras que muestra son **datos de muestra** sintéticos (`scripts/generar_muestra.mjs`, semilla fija) y cada figura lo dice con un sello visible.

> **Antes de crear un libro o tablero nuevo, lee [docs/EMPEZAR-AQUI.md](docs/EMPEZAR-AQUI.md)**: resume las decisiones vigentes (portada, menú, sección, globo, color, datos y verificación) y dice qué leer y en qué orden.

## Correr y verificar

```bash
npm install
npm run dev              # vista previa en http://localhost:3000
npm run build            # construye dist/ y corrige lang y zoom
npm run verificar:todo   # limpia, construye y corre los cinco verificadores
```

| Comando | Qué comprueba |
| --- | --- |
| `npm run verificar:paleta` | Las paletas que `paleta.js` exporta y se dibujan, con el validador de daltonismo, en claro y oscuro. |
| `npm run verificar:render` | Cada página se dibuja: marcas reales en el SVG, globo normado, tres desplegables, tabla, sin desborde a 1366 y 390 px. |
| `npm run verificar:filtros` | Cada filtro cambia el dibujo y ninguna opción deja la gráfica vacía. |
| `npm run verificar:quieto` | El panel de filtros pegajoso no mueve la página en reposo. |
| `npm run verificar:a11y` | axe-core (WCAG 2.1 A y AA) en cada página y en los dos temas. |
| `npm run capturas` | Capturas de cada página en `docs/capturas/` para verificar mirando. |

Los verificadores con navegador usan el Edge o el Chrome instalados y corren sobre `dist/`. Tras tocar datos: `npm run clean && npm run build`.

## Empezar un libro nuevo

1. **Copiar la carpeta** sin `node_modules/`, `dist/` ni `docs/capturas/`, y correr `npm install`.
2. **Editar el bloque `LIBRO`** de `observablehq.config.js`. Es el único lugar donde se escriben título, palabra clave en rojo, `slug`, resumen, autores, año, DOI, licencia y crédito. De ahí salen el título del sitio, los metadatos Open Graph, la marca del menú, la portada, las cuatro citas y el prefijo y el crédito de las descargas. Solo `CITATION.cff` se copia a mano.
3. **Elegir el tono de tema** en `LIBRO.tono`: un nombre de `TONOS` (`rojoIbero`, el de omisión desde el 19 de noviembre de 2026; `rojoGrafito`, el mismo rojo con comparación en grafito; `petroleoIbero`, el anterior; `petroleo`; `ocre`) o un objeto `{claro, oscuro}`. Es el color de la serie única y de la rampa de magnitud. Después, `npm run verificar:paleta`.
4. **Declarar el significado del rojo y el azul en cada capítulo**, arriba de su página:
   ```js
   const SIG = significado({rojo: "pierde población", azul: "gana población", gris: "sin cambio", desfavorable: "baja"});
   ```
   Rojo es lo que se pierde o lo desfavorable, azul lo que se gana o lo favorable y gris lo que no cambia, no tiene dato o es contexto. Las magnitudes de nivel usan `rampaTema(dominio)`, continua y con el dominio en una constante.
5. **Cargar los datos** en `src/data/` y sustituir `src/components/muestra.js` por la lectura propia. Al dejar de usar los datos de muestra se retira `sello: MUESTRA` de cada figura, y se borran `src/data/muestra/` y `scripts/generar_muestra.mjs` (la geometría de entidades se conserva si hay mapas).
6. **Escribir las páginas** a partir de `src/seccion-modelo.md` y registrar cada una en `scripts/paginas.mjs`. Esa lista arma el menú y es la que leen los cinco verificadores.
7. **Cambiar el dibujo de la tapa** en `src/index.md` y generar la imagen de vista previa (1200 × 630) con un nombre nuevo, como `src/images/og-portada-2026-11.png`, declarado en `imagenOg` de `observablehq.config.js` (las redes guardan en caché la imagen por su URL).

## Publicar

El libro se publica en GitHub Pages con `.github/workflows/deploy.yml` en cada push a `main`. La ruta base `/<repo>/` sale sola de `GITHUB_REPOSITORY`, así que no se escribe el nombre del repositorio en ningún archivo. El procedimiento completo (probar el build con la ruta de producción, crear el repositorio, encender Pages antes del primer push y apagar un sitio) está en [docs/publicar-en-github-pages.md](docs/publicar-en-github-pages.md).

## Dónde está cada cosa

| Ruta | Qué es |
| --- | --- |
| `observablehq.config.js` | Bloque `LIBRO`, menú, cabecera (tema, panel pegajoso, accesibilidad) y pie. |
| `scripts/paginas.mjs` | Lista única de páginas para el menú y los verificadores. |
| `src/estilo.css` | Hoja de estilos. No escribe colores: usa las variables que genera `paleta.js`. |
| `src/components/paleta.js` | Fuente única de color: tonos, semánticos, rampas, `significado`, `sentido`, `definirTema`. |
| `src/components/formato.js` | Formatos únicos: porcentaje, puntos, «N de cada 100», personas, «Sin dato». |
| `src/components/globo.js` | Norma única de globos: `globo({...})`, `conGlobo`, `globoEn`. |
| `src/components/seccion.js` | `analisis`, `seccion`, `figura`, `kpis`, `explicacion`, `verificado`, `tablaDatos`. |
| `src/components/filtros.js` | `panel`, `campo`, `campoUmbral`, `conDato`. |
| `src/components/formas/` | Un archivo por forma de gráfica, reexportadas en `index.js`. |
| `src/components/portada.js` | Hero con la tapa, metadatos y «Cómo citar». |
| `catalogo/` | Catálogo de formas (documentación aparte). Sus fichas y `ubicacion.csv` alimentan la página `/catalogo`. |
| `src/catalogo.md`, `src/components/catalogo.js`, `src/catalogo.css` | Página «Catálogo de formas»: índice de todas las formas que lleva a cada una en la galería. |

## Añadir una forma de gráfica

Se crea `src/components/formas/nombre.js`, se reexporta en `formas/index.js` y se dibuja en la página de su familia en `src/galeria/` con datos de muestra, su globo y su tabla. La forma recibe `(datos, {ancho, globo, ...})`, toma los colores de `paleta.js` y los formatos de `formato.js`, no nombra el tema del libro y abre con un comentario que dice qué pregunta responde y cuándo no usarla. En las plantillas `svg` de `htl`, un atributo interpolado al final de una etiqueta lleva espacio antes de `/>`.

## Catálogo de formas (`/catalogo`)

La página no lee las fichas en el navegador. `scripts/catalogo_datos.mjs` las carga en un `vm` de Node sin ejecutar recetas, les une `catalogo/ubicacion.csv` y escribe `src/data/catalogo.json` (solo metadatos) y `src/catalogo/miniaturas.js` (un `FileAttachment` por miniatura, para que Framework las copie con hash). Corre solo como `prebuild`, así que `npm run build` siempre publica datos al día, y aborta si una ficha no tiene ubicación, si un id se repite o si una forma marcada «implementada» no tiene su ancla en el `.md`.

Las miniaturas salen de la implementación real: `npm run miniaturas` (`scripts/miniaturas_galeria.mjs`) abre cada `pagina#ancla` en `dist/`, captura el cuerpo de la figura en claro y en oscuro a 2x, reduce las PNG a 256 colores y vuelve a generar los datos. Las formas sin sección usan la miniatura de `catalogo/miniaturas/`, la vista previa de su receta en el catálogo HTML o la silueta de su ícono, y llevan la marca «En construcción». Al integrar secciones nuevas: marcar la fila «implementada» en el CSV y correr `npm run build && npm run miniaturas && npm run build`.

`scripts/postbuild.mjs` copia el catálogo HTML de recetas (`CatalogoGraficas.html`, `fichas/` y `miniaturas/`) a `dist/catalogo-recetas/`, que la página enlaza al pie.

## Reglas que la plantilla hace cumplir

- Un solo `analisis()` arma toda sección: ancla `h2.toc-anchor` en el `.md`, panel de filtros, cifras, figura y los tres desplegables en orden fijo.
- El globo lleva grupo, cifra en el color de la serie (el porcentaje o el valor) y población «N de M personas» (REGLAS.md R116). Sin contexto, frase ni comparación; el margen de error va en la tabla.
- Ningún color fuera de `paleta.js`; ningún formato fuera de `formato.js`.
- Un selector solo ofrece opciones con dato y los dependientes se rellenan solos.
- Las API que no existen en todos los navegadores se llaman como `window.X` (ver `diferido.js`).
