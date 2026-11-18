// Capturas de pantalla para VERIFICAR MIRANDO: cada página en claro y oscuro,
// a 1366 x 768 y a 390 px, de página completa y con todas las secciones ya
// dibujadas. Se guardan en docs/capturas/.
//
// Las páginas de mapa a pantalla completa (`mapa: true`) y el catálogo de
// formas (`catalogo: true`) se capturan además a 1920 x 1080, y cada una de
// sus `estados` (paginas.mjs) en los tres anchos y
// los dos temas: país, estado elegido, flecha fijada, comparación, pocos
// casos. Así se mira cada paso del flujo de uso, no solo la vista inicial.
//
// Uso:  npm run capturas                         todas las páginas
//       node scripts/capturas.mjs index galeria/mapas   solo esas rutas

import {mkdirSync} from "node:fs";
import path from "node:path";
import {PAGINAS, VENTANAS, rutasDe} from "./paginas.mjs";
import {servidor, navegador, contexto, abrir} from "./navegador.mjs";

const rutas = rutasDe(process.argv.slice(2), PAGINAS.map((p) => p.ruta));
const DIR = path.join(import.meta.dirname, "..", "docs", "capturas");
mkdirSync(DIR, {recursive: true});
const pagina = (ruta) => PAGINAS.find((p) => p.ruta === ruta) ?? {};

const {srv, base} = await servidor();
const nav = await navegador();
for (const [nombre, ventana] of [["1366", VENTANAS.escritorio], ["390", VENTANAS.movil], ["1920", VENTANAS.grande]]) {
  for (const tema of ["claro", "oscuro"]) {
    const ctx = await contexto(nav, {tema, ventana});
    for (const ruta of rutas) {
      const p = pagina(ruta);
      if (nombre === "1920" && !p.mapa && !p.catalogo) continue;
      const raiz = ruta === "/" ? "index" : ruta.slice(1).replace(/\//g, "-");
      for (const estado of [{nombre: "", consulta: ""}, ...(p.estados ?? [])]) {
        const {page} = await abrir(ctx, base, ruta + estado.consulta);
        if (p.mapa) await page.waitForTimeout(1500); // la entrada del mapa termina a los 1.4 s
        const archivo = `${raiz}${estado.nombre ? "-" + estado.nombre : ""}-${tema}-${nombre}.png`;
        await page.screenshot({path: path.join(DIR, archivo), fullPage: true});
        console.log(archivo);
        await page.close();
      }
    }
    await ctx.close();
  }
}
await nav.close(); srv.close();
