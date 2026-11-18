// scripts/paginas.mjs
// LISTA ÚNICA de páginas del libro. La leen la configuración del sitio (para
// armar el menú) y los cinco verificadores. Al añadir, renombrar o retirar
// una página se cambia AQUÍ y en ningún otro lado: un verificador que apunta
// a páginas de otro proyecto pasa sin comprobar nada.
//
//   ruta       ruta del sitio, sin extensión
//   nombre     texto del menú
//   grupo      nombre del grupo del menú (optativo)
//   analisis   cuántas secciones con gráfica debe dibujar la página
//   filtros    true si alguna de sus secciones tiene panel de filtros
//   mapa       true en una página de mapa a pantalla completa: no tiene
//              secciones `.analisis`, su panel vive en `.mapa-lateral` y
//              los verificadores la revisan con sus propias reglas
//   pager      false para sacar la página de los enlaces «anterior» y
//              «siguiente». Con `pages` explícito en la configuración,
//              Framework ignora el `pager: false` del front matter.
//   catalogo   true en el Catálogo de formas: tarjetas en vez de secciones;
//              render cuenta tarjetas y filtros prueba cada pestaña y botón
//   estados    vistas de la página que se capturan además de la inicial
//              (consulta de la URL), para revisar cada paso del flujo de uso
//
// Una página que se retira lleva `draft: true` en su front matter y sale de
// esta lista; no se borra.

export const PAGINAS = [
  {ruta: "/", nombre: "Inicio", analisis: 0, filtros: false},
  {ruta: "/seccion-modelo", nombre: "Sección modelo", grupo: "Ejemplos", analisis: 1, filtros: true},
  {ruta: "/mapa", nombre: "Mapa de flujos", grupo: "Ejemplos", analisis: 0, filtros: true, mapa: true, pager: false, estados: [
    {nombre: "estado-salen", consulta: "?ent=12"},
    {nombre: "estado-llegan", consulta: "?ent=15&sentido=llegan"},
    {nombre: "flecha-fijada", consulta: "?ent=12&fija=12-22"},
    {nombre: "comparacion", consulta: "?ent=12&edad=todas&grupo=indigena&comparar=no_migrantes"},
    {nombre: "comparacion-pais", consulta: "?edad=todas&comparar=otra_causa&grupo=indigena"},
    {nombre: "pocos-casos", consulta: "?grupo=afro"},
    {nombre: "sin-flujos", consulta: "?grupo=afro&ent=04&sentido=llegan"},
  ]},
  // Índice de todas las formas. No tiene secciones `.analisis`: los
  // verificadores lo revisan con sus propias reglas (`catalogo: true`).
  {ruta: "/catalogo", nombre: "Catálogo de formas", grupo: "Herramientas", analisis: 0, filtros: false, catalogo: true, estados: [
    {nombre: "entrada", consulta: "?vista=entrada"},
    {nombre: "forma", consulta: "?vista=forma"},
    {nombre: "combinado", consulta: "?vista=forma&familia=grafica&forma=barras&nivel=1"},
  ]},
  // Muestra de colores: propuestas de paleta sobre las mismas figuras, con el
  // resultado del validador. Sus figuras no son secciones `.analisis` (no
  // llevan filtros ni desplegables): el control es de página, no de sección.
  {ruta: "/colores", nombre: "Muestra de colores", grupo: "Herramientas", analisis: 0, filtros: false, estados: [
    // A, la recomendada, es la vista inicial; el resto va de mejor a peor resultado del validador.
    ...["b", "c", "d", "e", "f", "g", "h", "i"].map((x) => ({nombre: x, consulta: `?propuesta=${x}`})),
  ]},
  // Galería, por función como Data Viz Project. Orden final con las páginas
  // nuevas: Comparación, Precisión e incertidumbre, Tablas, Distribución,
  // Correlación, Parte de un todo, Tiempo, Flujo, Mapas, Unidades, Conceptos
  // y diagramas.
  {ruta: "/galeria/comparacion", nombre: "Comparación", grupo: "Galería de formas", analisis: 9, filtros: true},
  {ruta: "/galeria/precision", nombre: "Precisión e incertidumbre", grupo: "Galería de formas", analisis: 6, filtros: true},
  {ruta: "/galeria/tablas", nombre: "Tablas", grupo: "Galería de formas", analisis: 3, filtros: true},
  {ruta: "/galeria/distribucion", nombre: "Distribución", grupo: "Galería de formas", analisis: 10, filtros: true},
  {ruta: "/galeria/correlacion", nombre: "Correlación", grupo: "Galería de formas", analisis: 3, filtros: true},
  {ruta: "/galeria/parte-todo", nombre: "Parte de un todo", grupo: "Galería de formas", analisis: 10, filtros: true},
  {ruta: "/galeria/tiempo", nombre: "Tiempo", grupo: "Galería de formas", analisis: 13, filtros: true},
  {ruta: "/galeria/flujo", nombre: "Flujo", grupo: "Galería de formas", analisis: 11, filtros: true},
  {ruta: "/galeria/mapas", nombre: "Mapas", grupo: "Galería de formas", analisis: 13, filtros: true},
  {ruta: "/galeria/unidades", nombre: "Unidades", grupo: "Galería de formas", analisis: 8, filtros: true},
  {ruta: "/galeria/conceptos", nombre: "Conceptos y diagramas", grupo: "Galería de formas", analisis: 3, filtros: true},
  {ruta: "/metodologia", nombre: "Metodología", analisis: 0, filtros: false},
  {ruta: "/referencias", nombre: "Referencias", analisis: 0, filtros: false},
];

// Menú de Framework a partir de la lista: las páginas con `grupo` se juntan.
export function menu() {
  const salida = [];
  for (const p of PAGINAS) {
    const item = {name: p.nombre, path: p.ruta, ...(p.pager === false ? {pager: null} : {})};
    if (!p.grupo) { salida.push(item); continue; }
    let g = salida.find((x) => x.name === p.grupo && x.pages);
    if (!g) salida.push((g = {name: p.grupo, open: true, pages: []}));
    g.pages.push(item);
  }
  return salida;
}

// Tamaños de ventana de las pruebas: escritorio de trabajo y teléfono.
export const VENTANAS = {escritorio: {width: 1366, height: 768}, grande: {width: 1920, height: 1080}, tableta: {width: 1024, height: 768}, movil: {width: 390, height: 844}};
// OBS_PUERTO: cada build paralelo verifica en su propio puerto.
export const PUERTO = Number(process.env.OBS_PUERTO) || 4173;

// Rutas pasadas por línea de comandos. Se aceptan sin la diagonal inicial
// («seccion-modelo», «galeria/mapas», «index»): Git Bash en Windows convierte
// un argumento que empieza con «/» en una ruta de disco.
export function rutasDe(args, porOmision) {
  if (!args.length) return porOmision;
  return args.map((a) => (a === "index" || a === "inicio" ? "/" : a.startsWith("/") ? a : "/" + a));
}
