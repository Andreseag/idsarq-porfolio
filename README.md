# idsarq — Sitio en Astro

Proyecto migrado desde un único archivo HTML (React vía CDN) a **Astro** con:

- **Astro 5** como framework base (renderizado estático).
- **React** (`@astrojs/react`) para las islas interactivas: navegación, galería de proyectos y wizard de cotización.
- **Tailwind CSS v4** (`@tailwindcss/vite`) con la paleta de marca definida en `src/styles/global.css`.
- **Framer Motion** para las animaciones.

## Instalación y desarrollo

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera /dist
npm run preview  # sirve /dist localmente
```

## Estructura

```
src/
  components/       Componentes .astro (estáticos) y .tsx (islas React)
  data/              services.ts y projects.ts — contenido centralizado
  layouts/Layout.astro
  pages/
    index.astro                 Home (une todas las secciones)
    servicios/[slug].astro      Página de detalle de cada "solución integral"
  styles/global.css
```

## Novedades de esta versión

1. **Validaciones en el wizard de cotización** (`src/components/QuoteWizard.tsx`)

   - Paso 1: nombre (mín. 3 caracteres), email con formato válido, teléfono con mínimo 8 dígitos.
   - Paso 2: tipo de proyecto obligatorio.
   - Paso 3: metros cuadrados, presupuesto, ciudad, dirección y fecha (no puede ser pasada) obligatorios.
   - Paso 4: al menos un servicio seleccionado.
   - Los errores se muestran por campo (`onBlur` + al intentar avanzar) y el botón "Siguiente" bloquea el avance si el paso tiene errores.
   - Al enviar, se revalida todo el formulario; si falta algo, el wizard regresa automáticamente al primer paso con errores.

2. **Páginas de detalle de "Soluciones integrales"** (`src/pages/servicios/[slug].astro`)
   - Ruta dinámica generada estáticamente (`getStaticPaths`) para cada servicio: `/servicios/diseno-arquitectonico`, `/servicios/diseno-residencial`, etc.
   - Incluye hero, descripción extendida, proceso paso a paso, features, beneficios, galería, FAQ y servicios relacionados.
   - Las tarjetas de la sección "Soluciones integrales" en el home ahora enlazan (`Conocer más →`) a estas páginas.

## Contenido editable

Todo el contenido de servicios y proyectos vive en `src/data/services.ts` y `src/data/projects.ts` — puedes agregar/editar servicios o proyectos ahí sin tocar los componentes.
