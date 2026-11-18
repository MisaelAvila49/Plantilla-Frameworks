// Framework emite maximum-scale=1 (bloquea el zoom) y lang="en". Se corrige en dist/.
//
// Además publica el catálogo HTML de recetas copiables como archivo estático:
// catalogo/CatalogoGraficas.html con sus fichas (fichas/*.js) y sus
// miniaturas (miniaturas/*.png) van a dist/catalogo-recetas/, con la misma
// estructura relativa para que el HTML las encuentre. Se copia aquí y no con
// FileAttachment porque el HTML carga sus fichas por ruta relativa, que
// Framework no sigue. La carpeta se llama distinto de la página /catalogo
// (dist/catalogo.html): una carpeta dist/catalogo/ le ganaría la ruta.
// No se publican catalogo/referencias/ (capturas de terceros) ni las
// herramientas ni los .md. La página lo enlaza desde enlaceRecetas()
// (src/components/catalogo.js).
import {readdirSync, readFileSync, writeFileSync, statSync, copyFileSync, mkdirSync, existsSync} from "node:fs";
import {join} from "node:path";
function* html(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* html(p);
    else if (n.endsWith(".html")) yield p;
  }
}
let n = 0;
for (const p of html("dist")) {
  const s = readFileSync(p, "utf8");
  const t = s.replace(/,\s*maximum-scale=1/g, "").replace(/<html lang="[^"]*"/, '<html lang="es"');
  if (t !== s) { writeFileSync(p, t); n++; }
}
console.log(`postbuild: ${n} páginas corregidas (zoom y lang)`);

const RECETAS = join("dist", "catalogo-recetas");
// copyFileSync y no cpSync: en Windows, cpSync de Node 24 falla al
// sobrescribir dentro de una ruta con «ñ» («Pruebas Diseño»).
function copiar(origen, destino) {
  if (statSync(origen).isDirectory()) {
    mkdirSync(destino, {recursive: true});
    return readdirSync(origen).reduce((k, x) => k + copiar(join(origen, x), join(destino, x)), 0);
  }
  copyFileSync(origen, destino);
  return 1;
}
mkdirSync(RECETAS, {recursive: true});
let archivos = copiar(join("catalogo", "CatalogoGraficas.html"), join(RECETAS, "CatalogoGraficas.html"));
for (const carpeta of ["fichas", "miniaturas"]) {
  const origen = join("catalogo", carpeta);
  if (existsSync(origen)) archivos += copiar(origen, join(RECETAS, carpeta));
}
console.log(`postbuild: catálogo de recetas copiado a ${RECETAS} (${archivos} archivos)`);
