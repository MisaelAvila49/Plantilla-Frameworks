// src/components/formato.js
// FORMATOS ÚNICOS del libro. Toda cifra que se escribe (globo, tarjeta, eje,
// leyenda, tabla) pasa por una de estas funciones; ninguna página ni forma
// define un formato propio. Reglas:
//   - Un valor ausente se escribe «Sin dato», nunca un guion ni «s/d».
//   - Un porcentaje lleva decimales según su magnitud, y un valor que redondea
//     a cero se escribe «menos de 0.001 %» (pueden ser cientos de personas).
//   - La diferencia entre dos porcentajes va en «puntos», no en %.
//   - Las personas van enteras, con separador de miles y con su unidad.

export const SIN_DATO = "Sin dato";
const ausente = (v) => v == null || v === "" || Number.isNaN(+v);
const es = (v, dec = 0) => (+v).toLocaleString("es-MX", {minimumFractionDigits: dec, maximumFractionDigits: dec});

// Decimales según la magnitud: uno si es 0 o ≥ 1, dos si ≥ 0.1, tres si es menor.
export function decimales(v) {
  const a = Math.abs(+v);
  return a === 0 || a >= 1 ? 1 : a >= 0.1 ? 2 : 3;
}

// Entero con separador de miles: 1,234.
export const entero = (v) => (ausente(v) ? SIN_DATO : es(Math.round(+v)));

// Número con decimales fijos (para ejes y tablas).
export const numero = (v, dec = 1) => (ausente(v) ? SIN_DATO : es(v, dec));

// Porcentaje: «12.3 %», «0.42 %», «menos de 0.001 %». `v` ya viene en 0-100.
export function pct(v, dec = null) {
  if (ausente(v)) return SIN_DATO;
  if (+v > 0 && +v < 0.001) return "menos de 0.001 %";
  return `${es(v, dec ?? decimales(v))} %`;
}
// Porcentaje corto para celdas y leyendas: sin el signo si el título ya lo dice.
export const pctEje = (v) => (ausente(v) ? "" : es(v, Number.isInteger(+v) ? 0 : 1));
// Marca de un eje de porcentaje: «40 %». Es el formato por omisión de todo eje
// en 0-100, para que la unidad se lea en el eje y no solo en su título.
export const pctMarca = (v) => (ausente(v) ? "" : `${pctEje(v)} %`);

// Signo tipográfico: «+», «−» (menos verdadero) o nada en el cero.
const signo = (v, dec) => (Math.abs(+v) < 0.5 / 10 ** dec ? "" : +v > 0 ? "+" : "−");

// Diferencia entre dos porcentajes: «−5.0 puntos», «+0.42 puntos».
export function puntos(v, dec = null) {
  if (ausente(v)) return SIN_DATO;
  const d = dec ?? decimales(v);
  const texto = es(Math.abs(+v), d);
  return `${signo(v, d)}${texto} ${texto === "1.0" && d === 1 ? "punto" : "puntos"}`;
}
// Cambio relativo: «+12.4 %».
export function cambioRelativo(v) {
  if (ausente(v)) return SIN_DATO;
  return `${signo(v, 1)}${es(Math.abs(+v), 1)} %`;
}
// «61 de cada 100».
export const deCada100 = (v) => (ausente(v) ? SIN_DATO : `${es(Math.round(+v))} de cada 100`);
// «4 de cada 1,000»: el mismo porcentaje `v` (0-100) contado sobre otra base,
// para proporciones menores a 1 de cada 100. Lo que redondea a cero se
// escribe «menos de 1 de cada 10,000», nunca «0 de cada…».
export function deCada(v, base = 100) {
  if (ausente(v)) return SIN_DATO;
  const k = Math.round((+v * base) / 100);
  return +v > 0 && k === 0 ? `menos de 1 de cada ${es(base)}` : `${es(k)} de cada ${es(base)}`;
}

// Personas (u otra unidad): «1,234 personas», o con universo
// «1,234 de 10,032 personas de 5 a 17 años». Nunca abreviado.
export function personas(n, {universo = null, unidad = "personas", apellido = ""} = {}) {
  if (ausente(n)) return SIN_DATO;
  const cola = `${unidad}${apellido ? " " + apellido : ""}`;
  return ausente(universo) ? `${entero(n)} ${cola}` : `${entero(n)} de ${entero(universo)} ${cola}`;
}
// Dos años: «1,234 → 1,180 personas».
export function deA(a, b, formato = entero, cola = "") {
  return `${formato(a)} → ${formato(b)}${cola ? " " + cola : ""}`;
}
// Montos y tiempos: medias, no proporciones (nunca se multiplican por cien).
export const pesos = (v) => (ausente(v) ? SIN_DATO : `$${es(Math.round(+v))}`);
export const horas = (v) => (ausente(v) ? SIN_DATO : `${es(v, 1)} horas`);
export const razon = (v) => (ausente(v) ? SIN_DATO : `${es(v, 2)} veces`);
// El año es un identificador: sin separador de miles.
export const anio = (v) => (ausente(v) ? SIN_DATO : String(v));

// Formato por nombre, para que `globo()`, las tarjetas y las tablas compartan
// la misma tabla de formatos.
export const FORMATOS = {pct, puntos, de100: deCada100, conteo: entero, razon, pesos, horas, relativo: cambioRelativo, numero};
export function formatear(v, tipo = "pct") {
  const f = FORMATOS[tipo];
  if (!f) throw new Error(`Formato desconocido: ${tipo}. Opciones: ${Object.keys(FORMATOS).join(", ")}`);
  return f(v);
}

// Margen de error al 95 % a partir del error estándar. Va en la TABLA, no en
// el globo. Una celda sin varianza estimable queda vacía, nunca en cero.
export const margen = (ee, dec = null) => (ausente(ee) ? "" : `± ${es(1.96 * +ee, dec ?? decimales(1.96 * +ee))}`);
// ¿La estimación es poco precisa? Coeficiente de variación mayor a 30 % o
// menos de 30 casos en la muestra (criterio habitual de las encuestas).
export function pocoPrecisa({valor, ee = null, casos = null} = {}) {
  if (casos != null && +casos < 30) return true;
  if (ee != null && valor != null && +valor !== 0) return Math.abs(+ee / +valor) > 0.3;
  return false;
}

// Nombre de archivo o de ancla a partir de un texto: sin acentos ni signos.
export const aSlug = (t) => String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
