/** API pública de solo lectura (PostgREST) con la lista que muestra /donaciones. */
const URL_DONANTES =
  "https://donantes.comidolar.com.ar/donantes?select=name,total,year";
const CLAVE = "comidolar:donantes";

export interface Donante {
  name: string;
  total: number;
  year: string;
}

export interface Lista {
  donantes: Donante[];
  /** Momento de la consulta (epoch ms) */
  consultado: number;
}

export function leerDonantes(json: unknown): Donante[] {
  if (!Array.isArray(json)) throw new Error("respuesta inesperada");
  return json.flatMap((fila) => {
    const total = Number(fila?.total);
    return typeof fila?.name === "string" && Number.isFinite(total)
      ? [{ name: fila.name, total, year: String(fila.year) }]
      : [];
  });
}

export function listaGuardada(): Lista | null {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    return Array.isArray(lista?.donantes) ? lista : null;
  } catch {
    return null;
  }
}

export async function pedirDonantes(timeoutMs = 8000): Promise<Lista> {
  const res = await fetch(URL_DONANTES, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const lista = {
    donantes: leerDonantes(await res.json()),
    consultado: Date.now(),
  };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // Sin copia local
  }
  return lista;
}
