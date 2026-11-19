// src/components/libro.js
// El bloque LIBRO se declara UNA vez, en observablehq.config.js, y la
// cabecera lo publica en `window.__LIBRO`. Los componentes lo leen de aquí
// (prefijo de las descargas, crédito, cita, tono de tema).
export const LIBRO = globalThis.__LIBRO ?? {titulo: "Libro de datos", slug: "libro", credito: "Social Data IBERO, Universidad Iberoamericana", autores: [], anio: new Date().getFullYear(), tono: "petroleoIbero"};

// Rótulo visible de las figuras que usan los datos sintéticos de la
// Plantilla. Al cargar datos reales se deja de pasar a `figura()`.
export const MUESTRA = "Datos de muestra";
