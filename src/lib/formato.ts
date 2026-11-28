const fechaHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Fecha y hora de Argentina, igual en el servidor y en el navegador. */
export const formatearFecha = (valor: string | number) =>
  fechaHora.format(new Date(valor));

const numero = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    // decimales solo si no son cero, y siempre dos
    minimumFractionDigits: Math.round(n * 100) % 100 ? 2 : 0,
    maximumFractionDigits: 2,
    useGrouping: "always",
  }).format(n);

export const pesos = (n: number) => `$${numero(n)}`;
export const porcentaje = (n: number) =>
  `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(n)}%`;

const diaHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
export const formatearCorta = (valor: string | number) =>
  diaHora.format(new Date(valor));
