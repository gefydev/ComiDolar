// Qué puede hacer el botón "Instalar" en este navegador. Sin DOM.
export type Modo = "aviso" | "ios" | "safari-mac";

export interface Entorno {
  /** El navegador ya ofreció instalar (beforeinstallprompt guardado) */
  aviso: boolean;
  /** Ya se abrió como app */
  instalada: boolean;
  ua: string;
  toques: number;
}

// Navegadores dentro de otras apps: no pueden agregar a la pantalla de inicio
const DENTRO_DE_APP = /FBAN|FBAV|Instagram|Line\/|GSA\/|Twitter|WhatsApp/;

/** `null`: no se muestra el botón, porque tocarlo no haría nada. */
export function modoInstalacion(e: Entorno): Modo | null {
  if (e.instalada) return null;
  if (e.aviso) return "aviso";
  if (DENTRO_DE_APP.test(e.ua)) return null;
  const mac = /Macintosh/.test(e.ua);
  // el iPad se presenta como Mac, pero tiene pantalla táctil
  if (/iPad|iPhone|iPod/.test(e.ua) || (mac && e.toques > 1))
    return /Safari\//.test(e.ua) ? "ios" : null;
  // Safari de Mac permite "Agregar al Dock" desde la versión 17
  const version = Number(/Version\/(\d+)[.\d]* Safari\//.exec(e.ua)?.[1]);
  return mac && version >= 17 ? "safari-mac" : null;
}
