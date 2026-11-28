import { describe, expect, test } from "bun:test";
import { modoInstalacion } from "../src/lib/instalacion";

const UA = {
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/146.0 Mobile/15E148 Safari/604.1",
  instagram:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 400.0",
  webview:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  safariMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
  safariViejo:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
  chromeMac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0 Safari/537.36",
  firefox:
    "Mozilla/5.0 (X11; Linux x86_64; rv:140.0) Gecko/20100101 Firefox/140.0",
};
const modo = (ua: string, extra = {}) =>
  modoInstalacion({ aviso: false, instalada: false, ua, toques: 0, ...extra });

describe("botón instalar", () => {
  test("con aviso del navegador, se usa el aviso", () => {
    expect(modo(UA.chromeMac, { aviso: true })).toBe("aviso");
  });
  test("ya instalada: nunca", () => {
    expect(modo(UA.iphone, { instalada: true })).toBeNull();
    expect(modo(UA.chromeMac, { aviso: true, instalada: true })).toBeNull();
  });
  test("iPhone, iPad y Safari de Mac muestran pasos", () => {
    expect(modo(UA.iphone, { toques: 5 })).toBe("ios");
    expect(modo(UA.iphoneChrome, { toques: 5 })).toBe("ios");
    expect(modo(UA.safariMac, { toques: 5 })).toBe("ios");
    expect(modo(UA.safariMac)).toBe("safari-mac");
  });
  test("si no se puede, no hay botón", () => {
    for (const ua of [
      UA.instagram,
      UA.webview,
      UA.safariViejo,
      UA.chromeMac,
      UA.firefox,
    ])
      expect(modo(ua)).toBeNull();
  });
});
