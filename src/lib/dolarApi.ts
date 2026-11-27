export interface Dolar {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

let cachedDolaresPromise: Promise<Dolar[]> | null = null;
let lastFetchedDolares = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache TTL

export async function fetchDolares(): Promise<Dolar[]> {
  const now = Date.now();
  if (cachedDolaresPromise && now - lastFetchedDolares < CACHE_TTL_MS) {
    return cachedDolaresPromise;
  }

  lastFetchedDolares = now;
  cachedDolaresPromise = (async () => {
    try {
      const response = await fetch("https://dolarapi.com/v1/dolares");
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching data from DolarAPI:", error);
      // Reset cache on failure
      cachedDolaresPromise = null;
      lastFetchedDolares = 0;
      return [];
    }
  })();

  return cachedDolaresPromise;
}
