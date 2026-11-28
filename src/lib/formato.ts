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
