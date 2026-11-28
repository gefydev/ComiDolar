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

- **Framework Principal:** [Astro v7.4](https://astro.build/) con salida estática y adaptador `@astrojs/vercel`. Solo `/` y `/calculadora` (`prerender = false`) se renderizan en el servidor con ISR de 60 s.
- **Cotizaciones:** módulo único `src/lib/cotizaciones.ts` (DolarApi, respaldo CriptoYa; lectura por `casa`, validación y timeout). El navegador las refresca cada minuto y al volver a la pestaña (`cotizaciones-cliente.ts`), y guarda la última en `localStorage`. Si fallan las dos fuentes en el servidor, la página responde 503 para que ISR conserve la última versión buena.
- **Framework de UI (Islas):** [React v19.3](https://react.dev/) para la herramienta "Tu Futuro" (el resto del sitio es HTML con scripts chicos).
- **Estilos:** [Tailwind CSS v4.3](https://tailwindcss.com/) integrado vía `@tailwindcss/vite` (configuración moderna y performante).
- **Donantes:** API de solo lectura (PostgREST sobre Postgres en Coolify) en `donantes.comidolar.com.ar`, consultada desde el navegador (`src/lib/donantes.ts`). Sin credenciales en el sitio.
- **Manejador de Paquetes:** [Bun](https://bun.sh/) (debe usarse siempre para scripts, instalaciones y ejecuciones).
- **Hosting:** Optimizado para Vercel (`vercel.json` configurado).
- **CI:** `.github/workflows/ci.yml` corre `bun run lint`, `bun run test` y `bun run build` en cada PR.
- **Librerías de UI Clave:**
  - `markdown-it` y `sanitize-html` para el procesamiento seguro de posts del blog.
  - `@astrojs/mdx` (v7.0.8) para poder usar componentes Astro dentro de los posts `.mdx`.

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
│   ├── content/                # Colecciones de contenido Markdown (Blog)
│   │   └── blog/               # Entradas del blog del sitio
│   ├── content.config.ts       # Esquema y definición de tipos para colecciones
│   ├── decks/                  # Presentaciones nativas (deck.json + slides/*.html) que renderiza SlideDeck.astro
│   ├── db/                     # Archivos de datos estáticos y lógica de mockeo/pagos
│   │   └── carrerasUba.ts      # Base de datos de materias del CBC y equivalencias de carreras
│   ├── layouts/                # Plantillas HTML base para las páginas
│   │   └── layout.astro        # Layout global del sitio con soporte SEO y transiciones
│   ├── lib/                    # Utilidades de código y configuraciones de clientes (cotizaciones, donantes)
│   ├── pages/                  # Enrutamiento basado en archivos
│   ├── styles/                 # Hojas de estilo globales
│   │   └── global.css          # CSS global con configuración de temas y variables
│   └── types/                  # Definición de tipos TypeScript globales
├── astro.config.mjs            # Configuración de Astro e integraciones
├── package.json                # Dependencias y scripts de construcción
├── tsconfig.json               # Configuración de TypeScript y aliases como "@/components"
└── vercel.json                 # Reglas de redirección, headers y configuración para Vercel
```

---

## 4. Detalle de Rutas y Páginas (`src/pages/`)

El enrutamiento es estático y dinámico, estructurado de la siguiente forma:

1. **Página de Inicio (`/` - `src/pages/index.astro`):**
   - Render en servidor con ISR y refresco en el navegador (ver **Cotizaciones**).
   - Bloque de la calculadora con dos ejemplos y las ocho fichas (`FichaCotizacion.astro`, datos en `src/lib/fichas.ts`), un espacio de anuncio y la presentación del proyecto.

2. **Calculadora de Dólar Tarjeta (`/calculadora` - `src/pages/calculadora/index.astro`):**
   - Cuatro casos: compra en el exterior (30 %), servicio digital (en dólares: 30 % + IVA 21 % + IIBB; en pesos: sin 30 %), viaje en pesos (30 %) y envío del exterior (franquicia US$400, 5 por año, máximo US$3.000; derechos solo sobre el excedente si queda cupo, sobre todo el valor sin cupo).
   - Fórmulas en `src/lib/calculadora.ts`, desglose en `src/lib/ticket.ts` (mismo código en servidor y navegador), formulario en `src/lib/calculadora-pagina.ts`. Con tests.
   - Alícuotas de Ingresos Brutos en `PROVINCIAS`: solo CABA confirmada; lo no confirmado es editable y avisa.
   - Preguntas frecuentes en `src/db/faqCalculadora.ts` (página y JSON-LD `FAQPage`). Dos espacios de anuncio (`calculadora-1` y `calculadora-2`).
   - Subruta `/calculadora/servicios`: lista de servicios digitales alcanzados.

3. **Página de Donaciones (`/donaciones` - `src/pages/donaciones.astro`):**
   - Explica el carácter sin fines de lucro de la comisión e invita a realizar aportes voluntarios.
   - Utiliza `PaymentMethod.astro` para mostrar métodos de pago (CBU y alias asociados a Genaro Febbo Yapur):
     - _Mercado Pago:_ alias `el.gena` | CBU `0000003100092757058924` (billetera virtual)
     - _Banco Provincia:_ alias `el.gena.prov` | CBU `0140012003401253312851`
     - _Banco Nación:_ alias `el.gena.bna` | CBU `0110015030001511859447`
     - _Banco Ciudad:_ alias `el.gena.cdad` | CBU `0290020910000602047211`
     - _Banco Santander:_ alias `el.gena.std` | CBU `0720032830000001024851`
     - _NaranjaX:_ alias `el.gena.nja` | CBU `4530000800016413921560` (billetera virtual)
   - Incorpora `Donantes.astro` para listar las contribuciones recibidas en tiempo real consultando la API de donantes; si falla muestra la última copia con su fecha o un botón para reintentar.

4. **Grupo de WhatsApp (`/whatsapp` - `src/pages/whatsapp.astro`):**
   - Página puente con diseño limpio para redirigir al link de invitación oficial del grupo: `https://chat.whatsapp.com/CA29UgWsmr32O0kH6NysG2`.

5. **Blog (`/blog` - `src/pages/blog.astro` y `src/pages/blog/[...slug].astro`):**
   - Renderiza las entradas de blog a partir del contenido de `src/content/blog/` mediante la API Content Layer de Astro (usando el loader `glob` en `src/content.config.ts`), donde las entradas se identifican a través de su `id` en lugar del antiguo `slug`.
   - Los posts con `draft: true` no se publican: todas las páginas, el RSS y el sitemap leen con `getPosts()` (`src/lib/blog.ts`).
   - Soporte para búsquedas por etiquetas (`tag/`), temas (`tema/`) y autores (`autor/`).
   - Los posts actuales son:
     - `comprar-exterior-barato.md`: Guía de compras en Amazon usando la tarifa plana de $5 e importando con dólar MEP (opción recomendada por ser más económica que el dólar tarjeta).
     - `eliminacion-impuesto-pais.md`: Detalle del impacto de la eliminación del Impuesto PAIS a fines de 2024.
     - `resultados-encuesta-cenba-2024.md` / `resultados-encuesta-cenba-2025.md`: Resultados de las encuestas electorales del Centro de Estudiantes del CNBA (embed de Canva).
     - `resultados-encuesta-cenba-2026.mdx`: Resultados de la encuesta 2026, con la presentación embebida de forma nativa mediante `<SlideDeck deck="cenba-2026" />`.
   - Los posts pueden ser `.md` o `.mdx`. En `.mdx` se importan componentes con el alias `@/`. El feed `rss.xml.ts` descarta las líneas `import`/`export` de MDX antes de renderizar el cuerpo.
     - `sugerencias-comidolar-2026.md`: Formulario interactivo para sugerencias e ideas de cara al 2026.
     - `lanzamiento-herramienta-futuro.md`: Anuncio y guía interactiva sobre la nueva herramienta de equivalencias del CBC y comparación con 6to año.

- **Detalle de cada dólar (`/dolar-oficial`, `-tarjeta`, `-blue`, `-mep`, `-ccl`, `-cripto`, `-mayorista`):** valor en vivo (ISR 60 s y refresco en el navegador), gráfico SVG de los últimos 10 días (ArgentinaDatos, en el servidor, `src/lib/historial.ts`), textos y preguntas (`src/db/textosCotizacion.ts`) con `FAQPage`. Los tipos están en `src/lib/tipos.ts`; las fichas de la home enlazan a cada uno.

6. **Páginas Institucionales y SEO:**
   - `privacidad.astro` (Políticas de privacidad y tratamiento de datos).
   - `terminos.astro` (Términos y condiciones de uso del portal).
   - `404.astro` (Página de error personalizada).
   - Generación automática de feeds y mapas de sitio en `rss.xml.ts` y `sitemap.xml.ts` (solo indexables, sin barra final).
   - JSON-LD: `WebSite` y `Organization` en todas las páginas, `BreadcrumbList` en las internas (`src/lib/seo.ts`; cada página pasa `metadata.migas`).
   - Imágenes para compartir 1200×630 generadas en el build (`src/lib/og.ts`, `src/pages/og/[nombre].png.ts`, plantillas en `src/assets/og/`). Cada página pasa `metadata.og.nombre`.

7. **Página de Articulación del CBC ("Tu Futuro" - `/futuro` - `src/pages/futuro.astro`):**
   - Compara las materias necesarias para cualquier carrera de la UBA con las aprobadas de forma automática al egresar de 5to año (resolución `RESCS-2026-890-E-UBA-REC`).
   - Muestra las opciones y estimaciones temporales del CBC regular frente al 6to año de CNBA o Pellegrini.
   - Enlace directo a los documentos PDF oficiales de los planes y resoluciones.

---

## 5. Arquitectura de Componentes Clave (`src/components/`)

- **`layout.astro` (Layout principal):**
  - Administra todas las etiquetas meta cruciales para SEO (título, meta descripción, canonical) y OpenGraph/Twitter Cards.
  - Habilita `ClientRouter` (View Transitions) para navegación instantánea sin recarga de página.
  - Implementa la inyección de PostHog para analíticas y AdSense diferido.
- **`Header.astro` y `Footer.astro`:**
  - Marca, píldoras de navegación (con `aria-current`) y botón "Instalar", que solo aparece si tocarlo sirve: con el aviso del navegador, o con los pasos para iPhone, iPad y Safari de Mac (`src/lib/instalacion.ts` decide, `src/lib/instalar.ts` actúa y mide en PostHog). No hay menú lateral.
- **App instalable y sin conexión:** `public/manifest.json` (íconos `maskable` y `monochrome`, atajos) y `public/sw.js`, que no guarda páginas: sin red muestra `public/offline.html` con la última cotización guardada en el dispositivo y su fecha. Si cambia `sw.js` o `offline.html`, subir la versión de `CACHE`.
- **`AdSlot.astro`:** espacio de publicidad responsive con alto reservado (250 px; 90 px desde 900 px) en cada página pública (menos la 404). La unidad de cada ubicación está en `src/config/anuncios.ts` y el script se carga una vez, diferido (`src/lib/anuncios.ts`). Sin anuncios automáticos.
- **`Lore.astro`:**
  - Componente que obtiene textos del archivo estático `src/db/lores.ts` y los renderiza según la sección actual para otorgar profundidad histórica al portal.
- **`Donantes.astro`:** lista de donantes por año, con búsqueda y orden, leída de la API de solo lectura.
- **`PaymentMethod.astro`:**
  - Cada medio de pago con el color del banco en el borde, CBU/alias completos y botón de copiar.
- **`FutureCalculator.tsx` (React):**
  - Componente interactivo que permite seleccionar el colegio de egreso (CNBA o Pelle), la facultad y la carrera deseada.
  - Calcula automáticamente porcentajes de avance del CBC, materias restantes, estimación del tiempo de egreso y compara de forma pedagógica el camino de egresar en 5to vs hacer 6to año.
- **`SlideDeck.astro` (presentaciones nativas, sin Canva):**
  - Uso en un post `.mdx`: `import SlideDeck from "@/components/SlideDeck.astro";` y luego `<SlideDeck deck="cenba-2026" />` (prop opcional `title` para la etiqueta accesible).
  - Lee `src/decks/<deck>/deck.json` (`title`, `order` con los ids de las diapositivas y `fonts` con links de Google Fonts) y cada `src/decks/<deck>/slides/<id>.html` (una `<section>` de 1920×1080 con estilos inline). Las imágenes viven en `public/assets/decks/<deck>/`.
  - `src/lib/decks.ts` prepara el HTML en build: quita las notas del orador (`<aside>`), convierte `<x-icon>` en SVG inline, agrega `loading="lazy"` desde la segunda diapositiva y extrae el título de cada una para la barra de progreso.
  - Renderiza dentro de un Shadow DOM declarativo para que los estilos `.markdown` del blog no rompan las diapositivas (`src/components/slide-deck/deck.css`), escalando el lienzo con `ResizeObserver`.
  - `src/components/slide-deck/deck-element.ts` define el custom element `<cd-slide-deck>`: flechas, Inicio/Fin, barra espaciadora, swipe en celulares, clic en la diapositiva (izquierda vuelve, derecha avanza), barra de progreso clickeable, pantalla completa con la tecla F (con rotación automática a horizontal en celulares en vertical) y enlace directo a cada diapositiva con `#<deck>-<número>`. Funciona también tras la navegación del `ClientRouter`.

---

## 6. Configuración de Estilo y Sistema de Diseño

Dirección "Ticket": tokens claro/oscuro (`prefers-color-scheme`), tipografía Archivo auto-alojada, sin sombras ni degradados, un color + ícono + etiqueta por tipo de dólar y controles de al menos 44 px. Todo en [global.css](./src/styles/global.css). PostHog se carga después de la página, solo visitas y eventos.

---

## 7. Protocolos de Mantenimiento y Calidad de Código

Para cualquier modificación sobre el repositorio, se deben cumplir los siguientes pasos:

1. **Validación de Código:** Ejecutar herramientas de análisis estático y formateo tras realizar cualquier cambio.
2. **Actualización de Documentos:** Cualquier cambio estructural, nuevo componente, integración o ruta requiere actualizar inmediatamente este archivo `BLUEPRINT.md`.
