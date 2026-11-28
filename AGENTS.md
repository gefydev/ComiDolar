# Instrucciones para Agentes de IA (AGENTS.md) 🤖💼

¡Hola, Agente! Estás trabajando en el repositorio de **ComiDólar** (Comisión de Dólar del Colegio Nacional de Buenos Aires). Para garantizar que el desarrollo sea fluido, coherente y respete el contexto e historia del proyecto, debés seguir rigurosamente las pautas descritas en este documento.

---

## 1. Reglas de Mantenimiento Obligatorias (Flujo de Trabajo)

Antes de dar por finalizada cualquier tarea o proponer cambios, debés seguir este protocolo:

1. **Explorar las Skills Locales:**
   - En el directorio [`.agents/skills/`](./.agents/skills) se encuentran herramientas y guías específicas para este proyecto.
   - Antes de implementar cualquier cambio importante en SEO, accesibilidad (a11y), Tailwind, React, Bun, TypeScript o Supabase, consultá la skill respectiva en esa carpeta para seguir los patrones correctos.

2. **Actualizar el Project Blueprint:**
   - La estructura técnica y funcional está documentada en el archivo [`BLUEPRINT.md`](./BLUEPRINT.md).
   - Si creás una nueva ruta, agregás un componente, modificás el esquema de base de datos o cambiás alguna regla de negocio (como los impuestos de la calculadora), es **obligatorio** que actualices el archivo `BLUEPRINT.md` detallando dichos cambios.

3. **Formatear y Lintear:**
   - Tras realizar cualquier modificación en los archivos del código fuente, debés correr:
     - Formateo del repositorio completo: `bun run format` (no uses `prettier .` o similares para todo el repositorio).
     - Linter del repositorio completo: `bun run lint` (no uses `eslint .` o similares para todo el repositorio).
     - Formateo o linter de archivo/s específico/s: Usar `bunx prettier --write <archivo>` o `bunx eslint <archivo>` únicamente cuando se quiera formatear o lintear un archivo o conjunto de archivos en particular (y corregir los errores/warnings que surjan antes de reportar la tarea como completada).

4. **Actualización de Versión:**
   - Si se te solicita actualizar la versión de ComiDólar, **únicamente** debés modificar el texto plano dentro del componente [`src/components/Release.astro`](./src/components/Release.astro). No modifiques la versión en otros lados; este componente actúa como la fuente única de verdad y se renderiza automáticamente donde corresponda.

---

## 2. Todo Sobre el Proyecto ComiDólar (Contexto y Lore)

Para comprender qué estás modificando y mantener la coherencia en el copywriting y los componentes, debés conocer el lore y la estructura del proyecto:

### ¿Qué es ComiDólar?

Es la **Comisión de Dólar del Colegio Nacional de Buenos Aires (CNBA)**. Fue fundada el **5 de octubre de 2022** por **Genaro Febbo Yapur (cariñosamente apodado Gena)**, alumno del CNBA.
Nació como un grupo de WhatsApp destinado a compartir la cotización diaria del Dólar Blue y del Dólar Oficial en Argentina. Debido al alto interés, la comunidad creció exponencialmente hasta alcanzar el límite máximo de **1025 miembros** en su grupo de WhatsApp. Para canalizar y expandir la comunidad, se creó el sitio web oficial `comidolar.com.ar`.

### Cotizaciones de Dólar Monitoreadas

El proyecto brinda información precisa sobre:

- **Dólar Blue:** Referencia clave del mercado informal.
- **Dólar Oficial:** Cotización del Banco Central (BCRA).
- **Dólar Tarjeta:** Aplicado a consumos en el exterior con recargos impositivos.
- **Contado con Liquidación (CCL) / MEP:** Utilizado en transacciones bursátiles.
- **Dólar Mayorista:** Transacciones comerciales de grandes empresas y bancos.
- **Dólar Cripto:** Cotización de monedas estables en plataformas digitales.

### Funcionalidades y Secciones del Sitio

#### 1. Calculadora Impositiva (`/calculadora`)

Permite a los usuarios calcular el costo real de sus consumos en dólares con tarjeta (como compras generales o servicios digitales).

- **Esquema Impositivo Actual (Post-Eliminación Impuesto PAIS - 24/12/2024):**
  - **Impuesto PAIS:** 0% (se eliminó a finales de 2024).
  - **Percepción de Ganancias:** 30% fijo sobre el dólar oficial para todas las compras en moneda extranjera.
  - **IVA Servicios Digitales:** 21% (se suma únicamente si el usuario marca el switch indicando que es un _servicio digital_ registrado en AFIP como Netflix, Spotify, Steam, etc.).
  - **Cálculo Final:** 51% de recargo impositivo total para servicios digitales, o 30% de recargo impositivo para otras compras físicas.
- En la calculadora, si el usuario desactiva el check "Es un servicio digital", el IVA (21%) se oculta en la UI y el texto del total impositivo pasa dinámicamente de "Solo Impuestos (51%)" a "Solo Impuestos (30%)".

#### 2. Donaciones (`/donaciones`)

ComiDólar es un proyecto comunitario sin fines de lucro. Los usuarios pueden donar de forma voluntaria.
Los alias y CBUs oficiales del fundador (Genaro Febbo Yapur) para recibir transferencias son:

- **Mercado Pago:** alias `el.gena` | CBU `0000003100092757058924`
- **Banco Provincia:** alias `el.gena.prov` | CBU `0140012003401253312851`
- **Banco Nación:** alias `el.gena.bna` | CBU `0110015030001511859447`
- **Banco Ciudad:** alias `el.gena.cdad` | CBU `0290020910000602047211`
- **Banco Santander:** alias `el.gena.std` | CBU `0720032830000001024851`
- **NaranjaX:** alias `el.gena.nja` | CBU `4530000800016413921560`
  La página también muestra una tabla reactiva con el listado de donaciones anteriores obtenidas de la API de donantes (`donantes.comidolar.com.ar`).

#### 3. Redirección de WhatsApp (`/whatsapp`)

Permite acceder directamente al enlace de invitación del grupo oficial: `https://chat.whatsapp.com/CA29UgWsmr32O0kH6NysG2`.

#### 4. Blog Educativo (`/blog`)

Contiene artículos y guías sobre finanzas personales elaborados por Gena. Algunos posts destacados:

- _Amazon con Tarifa Plana:_ Guía para importar artículos de tecnología y del hogar de EE. UU. pagando solo USD 5 de envío y abonándolos mediante dólar MEP (comprado en billeteras como Brubank o Prex), siendo esta una opción más económica que pagar con dólar tarjeta.
- _Fin del Impuesto PAIS:_ Explicación técnica de la baja del costo del dólar tarjeta del $1.671,20 a $1.358 (según cotizaciones de finales de 2024).
- _Encuestas y Censo CENBA (2024/2025):_ Sondeos interactivos de intención de voto para las elecciones del Centro de Estudiantes del Colegio Nacional de Buenos Aires (CENBA).

#### 5. Proyectos Destacados del Ecosistema

En la página principal se promocionan otros desarrollos creados por Gena:

- **BlackMaps** (`https://blackmaps.vercel.app`): Cartografía interactiva y mapas temáticos basados en datos de redes sociales.
- **YourProfiles** (`https://yourprofiles.vercel.app`): Plataforma para crear y compartir perfiles/tarjetas personales virtuales.
- **Comi Buenas Noches** (`https://comibuenasnoches.vercel.app`): Sitio web humorístico para postularse como pretendiente de los administradores.

---

## 3. Guía de Ejecución y Tecnologías en Desarrollo

- Al instalar dependencias o correr scripts, priorizá siempre el uso de **`bun`** (ej. `bun run dev`, `bun add <package>`, etc.).
- Asegurá la coherencia visual usando el tema oscuro/claro establecido en [global.css](./src/styles/global.css) y los componentes compartidos.
- Si vas a realizar cambios estructurales, por favor lee detenidamente el [tsconfig.json](./tsconfig.json) y utilizá la ruta absoluta con el alias `@/` (por ejemplo: `import DolarCard from "@/components/DolarCard.astro"`).

¡Mucho éxito con las tareas de desarrollo en ComiDólar! 💵📈
