// Resultado del validador de daltonismo y contraste sobre cada propuesta de
// paleta (src/components/paletas-propuestas.js), en claro y en oscuro.
// Lo calcula el build con scripts/validar_propuestas.mjs; la página
// «Muestra de colores» solo lo lee. Al cambiar una propuesta se borra la
// caché de este loader (src/.observablehq/cache/data/paletas-propuestas.json).
import {evaluarTodas} from "../../scripts/validar_propuestas.mjs";

process.stdout.write(JSON.stringify({calculado: new Date().toISOString().slice(0, 10), propuestas: evaluarTodas()}));
