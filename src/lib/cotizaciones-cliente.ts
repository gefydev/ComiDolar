import { obtenerCotizaciones, type Cotizaciones } from "@/lib/cotizaciones";

const CLAVE = "comidolar:cotizaciones";
const CADA_MS = 60_000;

const leerGuardadas = (): Cotizaciones | null => {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    return c?.casas?.oficial && Number.isFinite(c.consultado) ? c : null;
  } catch {
    return null;
  }
};

const guardar = (c: Cotizaciones) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(c));
  } catch {
    // Modo privado o sin espacio: se sigue sin copia local
  }
};

const masNueva = (a: Cotizaciones | null, b: Cotizaciones | null) =>
  !a ? b : !b || a.consultado >= b.consultado ? a : b;

/**
 * Mantiene frescas las cotizaciones de la página: al cargar, cada minuto y al
 * volver a la pestaña. Si no hay conexión con las fuentes, conserva el último
 * valor conocido y avisa con `fallo = true`.
 * Devuelve la función que detiene el refresco.
 */
export function mantenerCotizaciones(
  inicial: Cotizaciones | null,
  pintar: (c: Cotizaciones | null, fallo: boolean) => void,
) {
  let actual = masNueva(inicial, leerGuardadas());
  let activo = true;
  let enCurso = false;
  if (actual) pintar(actual, false);

  const refrescar = async () => {
    if (enCurso || document.visibilityState === "hidden") return;
    enCurso = true;
    const nuevas = await obtenerCotizaciones();
    enCurso = false;
    if (!activo) return;
    if (nuevas) {
      actual = nuevas;
      guardar(nuevas);
    }
    pintar(actual, !nuevas);
  };

  const intervalo = setInterval(refrescar, CADA_MS);
  document.addEventListener("visibilitychange", refrescar);
  refrescar();

  return () => {
    activo = false;
    clearInterval(intervalo);
    document.removeEventListener("visibilitychange", refrescar);
  };
}
