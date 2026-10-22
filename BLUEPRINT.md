# Project Blueprint: ComiDólar 💵💰

Este documento detalla la estructura técnica, funcional y el contexto (lore) del proyecto **ComiDólar** (Comisión de Dólar del Colegio Nacional de Buenos Aires). Debe actualizarse de forma obligatoria con cada cambio estructural o funcional relevante en el código.

---

## 1. Contexto y Propósito del Proyecto (Lore)

ComiDólar nació el **5 de octubre de 2022**, fundado por **Genaro Febbo Yapur (Gena)**, estudiante del Colegio Nacional de Buenos Aires (CNBA).
Surgió originalmente como un grupo de WhatsApp para seguir la cotización diaria del Dólar Blue y del Dólar Oficial en un contexto de alta volatilidad cambiaria. El grupo de WhatsApp se convirtió en una comunidad de aprendizaje y debate sobre finanzas y economía que alcanzó rápidamente el límite de **1025 miembros** (el máximo técnico permitido por WhatsApp).

Para expandir el alcance de la comunidad, se desarrolló la plataforma web **comidolar.com.ar**, la cual sirve como centro de información en tiempo real, calculadora impositiva y blog educativo.

---

## 2. Ficha Técnica y Stack Tecnológico

El proyecto está construido sobre una arquitectura moderna orientada a la performance, SEO y soporte para islas interactivas.

- **Framework Principal:** [Astro v7.0.2](https://astro.build/) configurado en modo estático/híbrido utilizando la API Content Layer. Para optimizar el build, se implementó un mecanismo de caché en memoria de 1 minuto para llamadas externas a DolarAPI (`src/lib/dolarApi.ts`) y Better Stack (`src/lib/getMonitorStatus.ts`), lo que reduce drásticamente el tiempo de compilación.
- **Framework de UI (Islas):** [React v19.2.4](https://react.dev/) para componentes interactivos y carruseles.
- **Estilos:** [Tailwind CSS v4.2.1](https://tailwindcss.com/) integrado vía `@tailwindcss/vite` (configuración moderna y performante).
- **Base de Datos / Backend-as-a-Service:** [Supabase](https://supabase.com/) (`@supabase/supabase-js` v2.98.0) para almacenamiento y consulta de datos en tiempo real (ej. tabla de donaciones).
- **Manejador de Paquetes:** [Bun](https://bun.sh/) (debe usarse siempre para scripts, instalaciones y ejecuciones).
- **Hosting:** Optimizado para Vercel (`vercel.json` configurado).
- **Librerías de UI Clave:**
  - `embla-carousel-react` (v8.6.0) para sliders adaptables y touch-friendly.
  - `astro-loading-indicator` (v0.7.1) para feedback visual en transiciones de página.
  - `markdown-it` y `sanitize-html` para el procesamiento seguro de posts del blog.
  - `@astrojs/mdx` (v7.0.8, compatible con Astro 7.0.x) para poder usar componentes Astro dentro de los posts `.mdx`.

---

## 3. Arquitectura de Archivos y Directorios

La estructura de directorios sigue los estándares de Astro con aliases definidos en [tsconfig.json](./tsconfig.json):

```
/home/elgena/Proyectos/ComiDolar/
├── .agents/                    # Directorio de habilidades personalizadas para agentes de IA
│   └── skills/                 # Skills especializadas (SEO, Tailwind, React, Bun, etc.)
├── public/                     # Recursos estáticos (imágenes, fuentes, manifest.json)
│   └── assets/img/             # Assets visuales del sitio y favicons
├── src/
│   ├── components/             # Componentes de interfaz (Astro y React)
│   │   └── Release.astro       # Componente de versión única del sitio (fuente de verdad)
│   ├── content/                # Colecciones de contenido Markdown (Blog)
│   │   └── blog/               # Entradas del blog del sitio
│   ├── content.config.ts       # Esquema y definición de tipos para colecciones
│   ├── decks/                  # Presentaciones nativas (deck.json + slides/*.html) que renderiza SlideDeck.astro
│   ├── db/                     # Archivos de datos estáticos y lógica de mockeo/pagos
│   │   └── carrerasUba.ts      # Base de datos de materias del CBC y equivalencias de carreras
│   ├── layouts/                # Plantillas HTML base para las páginas
│   │   └── layout.astro        # Layout global del sitio con soporte SEO y transiciones
│   ├── lib/                    # Utilidades de código y configuraciones de clientes (Supabase)
│   ├── pages/                  # Enrutamiento basado en archivos
│   ├── styles/                 # Hojas de estilo globales
│   │   └── global.css          # CSS global con configuración de temas y variables
│   └── types/                  # Definición de tipos TypeScript globales
├── astro.config.mjs            # Configuración de Astro e integraciones
├── package.json                # Dependencias y scripts de construcción
├── tailwind.config.mjs         # Configuración específica para el compilador de Tailwind
├── tsconfig.json               # Configuración de TypeScript y aliases como "@/components"
└── vercel.json                 # Reglas de redirección, headers y configuración para Vercel
```

---

## 4. Detalle de Rutas y Páginas (`src/pages/`)

El enrutamiento es estático y dinámico, estructurado de la siguiente forma:

1. **Página de Inicio (`/` - `src/pages/index.astro`):**
   - Consume en tiempo de compilación o render la API externa de `https://dolarapi.com/v1/dolares`.
   - Renderiza las tarjetas (`DolarCard.astro`) de Dólar Oficial, Dólar Blue, etc.
   - Calcula y renderiza de forma dinámica la **Brecha Cambiaria** en una tarjeta dedicada.
   - Muestra el carrusel de proyectos destacados de Gena (`CarouselElement.tsx`) y una introducción histórica (`Lore.astro`).
   - Promociona el último post del blog mediante `ArticlePromote.astro`.

2. **Calculadora de Dólar Tarjeta (`/calculadora` - `src/pages/calculadora/index.astro`):**
   - Permite estimar en tiempo real compras en moneda extranjera y su equivalente en ARS con recargos.
   - **Lógica de Impuestos:**
     - **Percepción de Ganancias:** 30% fijo sobre el valor oficial del dólar.
     - **IVA Servicios Digitales:** 21% (aplicado solo si el switch "Es un servicio digital" está activado).
     - **Impuesto PAIS:** 0% (eliminado el 24 de diciembre de 2024; previamente era del 30%).
     - **Total Recargos:** 51% para servicios digitales (como Netflix, Spotify, Steam) o 30% para bienes físicos/otros consumos.
   - Integra scripts reactivos optimizados para los View Transitions (`astro:page-load`) con lógica de debounce en inputs.
   - Subruta: `/calculadora/servicios` (`src/pages/calculadora/servicios.astro`) que detalla qué servicios están gravados por el IVA digital.

3. **Página de Donaciones (`/donaciones` - `src/pages/donaciones.astro`):**
   - Explica el carácter sin fines de lucro de la comisión e invita a realizar aportes voluntarios.
   - Utiliza `PaymentMethod.astro` para mostrar métodos de pago (CBU y alias asociados a Genaro Febbo Yapur):
     - _Mercado Pago:_ alias `el.gena` | CBU `0000003100092757058924` (billetera virtual)
     - _Banco Provincia:_ alias `el.gena.prov` | CBU `0140012003401253312851`
     - _Banco Nación:_ alias `el.gena.bna` | CBU `0110015030001511859447`
     - _Banco Ciudad:_ alias `el.gena.cdad` | CBU `0290020910000602047211`
     - _Banco Santander:_ alias `el.gena.std` | CBU `0720032830000001024851`
     - _NaranjaX:_ alias `el.gena.nja` | CBU `4530000800016413921560` (billetera virtual)
   - Incorpora `DonationTable.tsx` para listar las contribuciones recibidas en tiempo real consultando la base de datos Supabase.

4. **Grupo de WhatsApp (`/whatsapp` - `src/pages/whatsapp.astro`):**
   - Página puente con diseño limpio para redirigir al link de invitación oficial del grupo: `https://chat.whatsapp.com/CA29UgWsmr32O0kH6NysG2`.

5. **Blog (`/blog` - `src/pages/blog.astro` y `src/pages/blog/[...slug].astro`):**
   - Renderiza las entradas de blog a partir del contenido de `src/content/blog/` mediante la API Content Layer de Astro (usando el loader `glob` en `src/content.config.ts`), donde las entradas se identifican a través de su `id` en lugar del antiguo `slug`.
   - Soporte para búsquedas por etiquetas (`tag/`), temas (`tema/`) y autores (`autor/`).
   - Los posts actuales son:
     - `comprar-exterior-barato.md`: Guía de compras en Amazon usando la tarifa plana de $5 e importando con dólar MEP (opción recomendada por ser más económica que el dólar tarjeta).
     - `eliminacion-impuesto-pais.md`: Detalle del impacto de la eliminación del Impuesto PAIS a fines de 2024.
     - `resultados-encuesta-cenba-2024.md` / `resultados-encuesta-cenba-2025.md`: Resultados de las encuestas electorales del Centro de Estudiantes del CNBA (embed de Canva).
     - `resultados-encuesta-cenba-2026.mdx`: Resultados de la encuesta 2026, con la presentación embebida de forma nativa mediante `<SlideDeck deck="cenba-2026" />`.
   - Los posts pueden ser `.md` o `.mdx`. En `.mdx` se importan componentes con el alias `@/`. El feed `rss.xml.ts` descarta las líneas `import`/`export` de MDX antes de renderizar el cuerpo.
     - `sugerencias-comidolar-2026.md`: Formulario interactivo para sugerencias e ideas de cara al 2026.
     - `lanzamiento-herramienta-futuro.md`: Anuncio y guía interactiva sobre la nueva herramienta de equivalencias del CBC y comparación con 6to año.

6. **Páginas Institucionales y SEO:**
   - `privacidad.astro` (Políticas de privacidad y tratamiento de datos).
   - `terminos.astro` (Términos y condiciones de uso del portal).
   - `404.astro` (Página de error personalizada).
   - Generación automática de feeds y mapas de sitio en `rss.xml.ts` y `sitemap.xml.ts`.

7. **Página de Articulación del CBC ("Tu Futuro" - `/futuro` - `src/pages/futuro.astro`):**
   - Compara las materias necesarias para cualquier carrera de la UBA con las aprobadas de forma automática al egresar de 5to año (resolución `RESCS-2026-890-E-UBA-REC`).
   - Muestra las opciones y estimaciones temporales del CBC regular frente al 6to año de CNBA o Pellegrini.
   - Enlace directo a los documentos PDF oficiales de los planes y resoluciones.

---

## 5. Arquitectura de Componentes Clave (`src/components/`)

- **`layout.astro` (Layout principal):**
  - Administra todas las etiquetas meta cruciales para SEO (título, meta descripción, canonical) y OpenGraph/Twitter Cards.
  - Habilita `ClientRouter` (View Transitions) para navegación instantánea sin recarga de página.
  - Implementa la inyección de PostHog para analíticas y scripts de AdSense condicionales para monetización.
- **`Header.astro` y `Footer.astro`:**
  - El Header controla el menú de navegación adaptativo, el switch de tema (modo oscuro / claro) e inyecta la opción "Tu Futuro" apuntando a `/futuro`.
- **`LinkIcon.astro`:**
  - Componente que asocia de forma dinámica los iconos en SVG a cada enlace de navegación en base al título (por ejemplo, incorporando un gorro de graduado en SVG para "Tu Futuro").
- **`Lore.astro`:**
  - Componente que obtiene textos del archivo estático `src/db/lores.ts` y los renderiza según la sección actual para otorgar profundidad histórica al portal.
- **`CarouselElement.tsx` (React):**
  - Carrusel horizontal interactivo que promociona proyectos hermanos del ecosistema de Gena:
    - **BlackMaps** (`https://blackmaps.vercel.app`): Sitio de mapas temáticos.
    - **YourProfiles** (`https://yourprofiles.vercel.app`): Creador de perfiles compartibles.
    - **Comi Buenas Noches** (`https://comibuenasnoches.vercel.app`): Plataforma lúdica para candidatos románticos de los administradores.
- **`DonationTable.tsx` (React):**
  - Se suscribe o consulta Supabase para mostrar el listado histórico y en tiempo real de donantes.
- **`PaymentMethod.astro`:**
  - Renderiza cada opción de transferencia bancaria, aplicando degradados de color específicos adaptados a la marca visual de cada banco (Mercado Pago, Provincia, Nación, Ciudad, Santander, NaranjaX).
- **`FutureCalculator.tsx` (React):**
  - Componente interactivo que permite seleccionar el colegio de egreso (CNBA o Pelle), la facultad y la carrera deseada.
  - Calcula automáticamente porcentajes de avance del CBC, materias restantes, estimación del tiempo de egreso y compara de forma pedagógica el camino de egresar en 5to vs hacer 6to año.
- **`SlideDeck.astro` (presentaciones nativas, sin Canva):**
  - Uso en un post `.mdx`: `import SlideDeck from "@/components/SlideDeck.astro";` y luego `<SlideDeck deck="cenba-2026" />` (prop opcional `title` para la etiqueta accesible).
  - Lee `src/decks/<deck>/deck.json` (`title`, `order` con los ids de las diapositivas y `fonts` con links de Google Fonts) y cada `src/decks/<deck>/slides/<id>.html` (una `<section>` de 1920×1080 con estilos inline). Las imágenes viven en `public/assets/decks/<deck>/`.
  - `src/lib/decks.ts` prepara el HTML en build: quita las notas del orador (`<aside>`), convierte `<x-icon>` en SVG inline, agrega `loading="lazy"` desde la segunda diapositiva y extrae el título de cada una para la barra de progreso.
  - Renderiza dentro de un Shadow DOM declarativo para que los estilos `.markdown` del blog no rompan las diapositivas (`src/components/slide-deck/deck.css`), escalando el lienzo con `ResizeObserver`.
  - `src/components/slide-deck/deck-element.ts` define el custom element `<cd-slide-deck>`: flechas, Inicio/Fin, barra espaciadora, swipe en celulares, clic en la diapositiva (izquierda vuelve, derecha avanza), barra de progreso clickeable, pantalla completa con la tecla F (con rotación automática a horizontal en celulares en vertical) y enlace directo a cada diapositiva con `#<deck>-<número>`. Funciona también tras la navegación del `ClientRouter`.
- **`Release.astro`:**
  - Componente minimalista que almacena únicamente el número de versión actual de ComiDólar en texto plano. Funciona como la fuente única de verdad para el control de versiones y es consumido por otros componentes como el pie de página para renderizar la versión.

---

## 6. Configuración de Estilo y Sistema de Diseño

El diseño visual está alineado con las directrices de premium frontend:

- Utiliza gradientes suaves, efectos de desenfoque de fondo (`backdrop-blur`) y mallas de fondo dinámicas (`bg-light-mesh`, `bg-dark-mesh`) configuradas en [global.css](./src/styles/global.css).
- Respeta de forma estricta los modos claro/oscuro mediante clases `dark:` y variables personalizadas en CSS.
- El color corporativo y de acento principal es el **verde dólar** (`#14b54f` / `#0e9f6e`).

---

## 7. Protocolos de Mantenimiento y Calidad de Código

Para cualquier modificación sobre el repositorio, se deben cumplir los siguientes pasos:

1. **Validación de Código:** Ejecutar herramientas de análisis estático y formateo tras realizar cualquier cambio.
2. **Actualización de Documentos:** Cualquier cambio estructural, nuevo componente, integración o ruta requiere actualizar inmediatamente este archivo `BLUEPRINT.md`.
