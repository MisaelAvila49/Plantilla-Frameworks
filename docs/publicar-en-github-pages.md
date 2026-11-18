# Publicar un libro en GitHub Pages

El sitio se construye y se publica con GitHub Actions cada vez que se empuja a `main`. No hace falta
construir en local ni subir `dist/`: el runner instala, construye, valida las paletas y publica.

## Lo que ya trae la Plantilla

- `.github/workflows/deploy.yml`: dos trabajos. `construir` corre `npm ci`, `npm run build` (que
  incluye `prebuild` del catálogo y `postbuild` de lang, zoom y recetas), `npm run verificar:paleta`,
  copia `src/images/og-*.png` a `dist/images/`, crea `dist/.nojekyll` y sube `dist/` como artefacto
  de Pages. `publicar` lo despliega con `actions/deploy-pages`.
- `observablehq.config.js` calcula la ruta base sola. Dentro de Actions (`GITHUB_ACTIONS` y
  `GITHUB_REPOSITORY` definidos) usa `/<repo>/` y la URL `https://<dueño>.github.io/<repo>/` para
  Open Graph; en local usa `/`. Por eso el nombre del repositorio no se escribe en ningún archivo.
- `.gitignore` deja fuera `node_modules/`, `dist/`, la caché de Framework, las capturas de
  verificación (`docs/capturas/`, más de 100 MB) y `catalogo/referencias/` (capturas de proyectos
  de terceros, con derechos de sus autores).

## Pasos para un libro nuevo

Se requiere `gh` (GitHub CLI) autenticado una vez con `gh auth login`.

```bash
# 1. Probar el build con la ruta base de producción antes de crear nada.
#    Todos los enlaces del pie y del menú deben salir relativos (../mapa, ./tiempo).
rm -rf src/.observablehq/cache dist
GITHUB_ACTIONS=true GITHUB_REPOSITORY=<dueño>/<repo> npm run build

# 2. Repositorio local con un solo commit en main.
git init -b main
git add -A
git status --short | wc -l        # revisar que no entren capturas, datos crudos ni credenciales
git commit -m "Primera versión del libro"

# 3. Crear el repositorio en GitHub, todavía sin empujar.
gh repo create <dueño>/<repo> --public --source . --remote origin

# 4. Encender Pages con GitHub Actions como fuente (una sola vez por repositorio).
#    Se hace ANTES del primer push: si no, el trabajo «publicar» falla porque el
#    sitio no existe y hay que relanzarlo con `gh workflow run deploy.yml`.
gh api -X POST repos/<dueño>/<repo>/pages -f build_type=workflow

# 5. Empujar y seguir la corrida hasta que termine.
git push -u origin main
gh run watch --repo <dueño>/<repo> --exit-status $(gh run list --repo <dueño>/<repo> -L 1 --json databaseId --jq '.[0].databaseId')

# 6. Comprobar la URL publicada.
gh api repos/<dueño>/<repo>/pages --jq .html_url
```

Si el repositorio es de una organización (SocialDataIbero), `<dueño>` es la organización y hace falta
permiso de administración en ese repositorio para el paso 4. Al repositorio del equipo solo se publica
con permiso explícito en cada entrega (lección 127 de la skill).

## Errores que ya pasaron o que se previenen

- **Rutas sensibles a mayúsculas.** Windows no distingue `Logo.svg` de `logo.svg`; el runner de Linux
  sí, y el build falla o una imagen sale rota. Si el build pasa en local y falla en Actions, se busca
  primero esto.
- **`npm ci` sin `package-lock.json`.** El workflow usa `npm ci`, que exige el lock versionado.
- **Imagen Open Graph ausente.** Framework no copia a `dist/` un archivo que ninguna página enlaza
  con `href` o `src`; el workflow copia `og-*.png` a mano.
- **Carpetas con guion bajo.** Sin `.nojekyll`, Pages ignora `_observablehq/`, `_file/` y `_npm/`, y
  el sitio sale sin estilos ni scripts.
- **Ruta base escrita a mano.** Un `base: "/mi-repo/"` fijo rompe la vista previa local y se olvida al
  renombrar el repositorio; la Plantilla la deriva de `GITHUB_REPOSITORY`.
- **Caché de Framework.** El runner parte de cero, así que no le afecta; en local, tras tocar datos o
  loaders, `npm run clean && npm run build` antes de comparar.

## Apagar un sitio

```bash
gh api -X DELETE repos/<dueño>/<repo>/pages
```

Quita la publicación y deja el repositorio y el workflow intactos; el siguiente push volverá a fallar en
«publicar» hasta que se encienda de nuevo con el paso 4. Para que no corra más, se desactiva también
el workflow: `gh workflow disable deploy.yml --repo <dueño>/<repo>`.
