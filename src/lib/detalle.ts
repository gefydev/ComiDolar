// Números de la página de un tipo de dólar. Los usan el servidor y el navegador.
import { brecha, type Cotizaciones } from "@/lib/cotizaciones";
import { formatearCorta, pesos, porcentaje } from "@/lib/formato";
import type { Tipo } from "@/lib/tipos";

const linea = (rotulo: string, detalle: string, valor: string) =>
  `<div class="linea"><span>${rotulo}<small>${detalle}</small></span><b>${valor}</b></div>`;
const suma = (titulo: string, valor: string) =>
  `<div class="suma"><span>${titulo}</span><strong>${valor}</strong></div>`;

/** Todo texto de acá es propio o un número formateado: no hay que escapar. */
export function vistaDetalle(tipo: Tipo, casas: Cotizaciones["casas"]) {
  const c = casas[tipo.casa];
  const oficial = casas.oficial;
  const venta = c ? pesos(c.venta) : "—";
  const nota = c ? `Venta · actualizado ${formatearCorta(c.fecha)}` : "Sin dato";

  if (tipo.casa === "tarjeta") {
    const base = oficial?.venta;
    return {
      venta,
      nota,
      html:
        linea("Dólar oficial", "venta", base ? pesos(base) : "—") +
        linea("Percepción 30 %", "RG 5617", base ? pesos(base * 0.3) : "—") +
        suma("Por cada dólar", venta),
    };
  }

  const diferencia =
    tipo.casa === "blue"
      ? brecha(casas)
      : c && oficial && tipo.casa !== "oficial"
        ? ((c.venta - oficial.venta) / oficial.venta) * 100
        : null;
  return {
    venta,
    nota,
    html:
      linea("Compra", "lo que te pagan", c?.compra ? pesos(c.compra) : "—") +
      linea("Venta", "lo que pagás", venta) +
      (tipo.casa === "oficial"
        ? suma(
            "Diferencia entre compra y venta",
            c?.compra ? pesos(c.venta - c.compra) : "—",
          )
        : suma(
            "Diferencia con el oficial",
            diferencia === null ? "—" : porcentaje(diferencia),
          )),
  };
}
