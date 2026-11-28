import type { Cotizaciones } from "@/lib/cotizaciones";
import { mantenerCotizaciones } from "@/lib/cotizaciones-cliente";
import { textoEstado } from "@/lib/estado";

/**
 * Conecta una página que incluye <EstadoCotizaciones /> con el refresco.
 * `pintar` actualiza los números propios de esa página.
 */
export function enPagina(
  pagina: "home" | "calculadora",
  pintar: (c: Cotizaciones) => void,
) {
  let detener: (() => void) | undefined;

  document.addEventListener("astro:page-load", () => {
    detener?.();
    detener = undefined;
    const datos = document.querySelector("[data-cotizaciones]");
    const estado = document.querySelector("[data-estado-cotizaciones]");
    // El módulo queda cargado al navegar: solo actúa en su propia página
    if (
      !datos ||
      !estado ||
      !document.querySelector(`[data-pagina-cotizaciones="${pagina}"]`)
    )
      return;

    detener = mantenerCotizaciones(
      JSON.parse(datos.textContent || "null"),
      (c, fallo) => {
        estado.textContent = textoEstado(c, fallo);
        // dato viejo o sin dato: con estilo de aviso
        estado.classList.toggle("warn", fallo);
        if (c) pintar(c);
      },
    );
  });

  document.addEventListener("astro:before-swap", () => {
    detener?.();
    detener = undefined;
  });
}
