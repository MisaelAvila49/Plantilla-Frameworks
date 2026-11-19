// scripts/verificar_rapido.mjs
// Batería en PARALELO para iterar (tres a la vez, OBS_PARALELO): build sin `clean` (Framework reutiliza su
// caché) y los verificadores de navegador a la vez, cada uno con su puerto,
// en lugar de uno tras otro. Imprime el renglón de resultado de cada uno y
// el detalle solo de los que fallan.
//
//   npm run verificar:rapido                     todo el libro
//   OBS_RUTAS=tipos,escuela npm run verificar:rapido   solo esas páginas
//   npm run verificar:rapido -- --sin-build      sobre el dist/ que ya existe
//   npm run verificar:rapido -- render filtros   solo esos verificadores
//
// No sustituye a `verificar:todo`: tras tocar un loader o antes de publicar
// se corre la completa (lección 83: la caché puede servir datos viejos).
import {spawn} from "node:child_process";

const args = process.argv.slice(2);
const sinBuild = args.includes("--sin-build");
const TODOS = ["paleta", "render", "filtros", "quieto", "a11y", "scroll"];
const elegidos = args.filter((a) => TODOS.includes(a));
const lista = elegidos.length ? elegidos : TODOS;
const base = Number(process.env.OBS_PUERTO) || 4173;
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function correr(nombre, guion, env = {}) {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const hijo = spawn(npm, ["run", guion], {env: {...process.env, ...env}, shell: process.platform === "win32"});
    let salida = "";
    hijo.stdout.on("data", (d) => { salida += d; });
    hijo.stderr.on("data", (d) => { salida += d; });
    hijo.on("close", (codigo) => resolve({nombre, codigo, salida, segundos: Math.round((Date.now() - t0) / 1000)}));
  });
}
// El renglón que resume cada verificador: el último que no está vacío ni es
// una línea de separación.
const resumen = (s) => s.trim().split(/\r?\n/).filter((l) => l.trim() && !/^=+$/.test(l.trim()) && !/^\[exited/.test(l)).at(-1) ?? "";

const t0 = Date.now();
if (!sinBuild) {
  const b = await correr("build", "build");
  console.log(`build        ${b.codigo === 0 ? "ok   " : "FALLA"} ${b.segundos}s`);
  if (b.codigo !== 0) { console.log(b.salida.slice(-3000)); process.exit(1); }
}
// A lo más OBS_PARALELO verificadores a la vez (3 por omisión): con los seis
// juntos el navegador se quedaba sin memoria («Target crashed») en una laptop.
const paralelo = Math.max(1, Number(process.env.OBS_PARALELO) || 3);
const res = new Array(lista.length);
let siguiente = 0;
await Promise.all(Array.from({length: Math.min(paralelo, lista.length)}, async () => {
  while (siguiente < lista.length) {
    const i = siguiente++;
    res[i] = await correr(lista[i], `verificar:${lista[i]}`, {OBS_PUERTO: String(base + 1 + i)});
  }
}));
let fallas = 0;
for (const r of res) {
  console.log(`${r.nombre.padEnd(12)} ${r.codigo === 0 ? "ok   " : "FALLA"} ${String(r.segundos).padStart(4)}s  ${resumen(r.salida)}`);
  if (r.codigo !== 0) fallas++;
}
for (const r of res.filter((x) => x.codigo !== 0)) console.log(`\n--- ${r.nombre} ---\n${r.salida.trim().split(/\r?\n/).slice(-40).join("\n")}`);
console.log(`\nTotal ${Math.round((Date.now() - t0) / 1000)}s${process.env.OBS_RUTAS ? ` · solo ${process.env.OBS_RUTAS}` : ""}`);
process.exit(fallas ? 1 : 0);
