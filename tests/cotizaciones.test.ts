import { afterEach, describe, expect, test } from "bun:test";
import {
  brecha,
  leerCriptoYa,
  leerDolarApi,
  obtenerCotizaciones,
} from "../src/lib/cotizaciones";

const dolarApi = [
  // desordenado a propósito: se busca por casa, no por posición
  {
    casa: "blue",
    compra: 1675,
    venta: 1695,
    fechaActualizacion: "2026-11-27T20:59:00.000Z",
  },
  {
    casa: "oficial",
    compra: 1575,
    venta: 1625,
    fechaActualizacion: "2026-11-27T18:00:00.000Z",
  },
];
const criptoYa = {
  oficial: { ask: 1625, bid: 1575, timestamp: 1795824026 },
  tarjeta: { price: 2112.5, timestamp: 1795824026 },
  mep: { al30: { ci: { price: 1660, timestamp: 1795809541 } } },
};

const original = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = original;
});
const simular = (respuestas: Record<string, () => Response>) => {
  globalThis.fetch = (async (url: string) => {
    const host = new URL(url).host;
    if (!respuestas[host]) throw new TypeError("sin red");
    return respuestas[host]();
  }) as typeof fetch;
};

describe("lectura", () => {
  test("DolarApi se lee por casa", () => {
    const casas = leerDolarApi(dolarApi);
    expect(casas.oficial?.venta).toBe(1625);
    expect(brecha(casas)).toBeCloseTo(4.31, 2);
  });

  test("descarta valores inválidos", () => {
    const fecha = "2026-11-27T18:00:00.000Z";
    expect(
      leerDolarApi([
        { casa: "oficial", venta: 0, fechaActualizacion: fecha },
        { casa: "blue", venta: "1695", fechaActualizacion: fecha },
        { casa: "cripto", venta: 1700, fechaActualizacion: "ayer" },
        null,
      ]),
    ).toEqual({});
    expect(leerDolarApi({ error: true })).toEqual({});
  });

  test("CriptoYa: precio único sin compra", () => {
    const casas = leerCriptoYa(criptoYa);
    expect(casas.oficial?.compra).toBe(1575);
    expect(casas.tarjeta).toMatchObject({ venta: 2112.5, compra: null });
    expect(casas.bolsa?.venta).toBe(1660);
    expect(casas.blue).toBeUndefined();
  });
});

describe("obtenerCotizaciones", () => {
  test("usa DolarApi si responde", async () => {
    simular({ "dolarapi.com": () => Response.json(dolarApi) });
    expect((await obtenerCotizaciones())?.fuente).toBe("DolarApi");
  });

  test("cae a CriptoYa si DolarApi falla o responde basura", async () => {
    for (const mala of [
      () => new Response("", { status: 500 }),
      () => Response.json([]),
      () => new Response("<html>"),
    ]) {
      simular({
        "dolarapi.com": mala,
        "criptoya.com": () => Response.json(criptoYa),
      });
      expect((await obtenerCotizaciones())?.fuente).toBe("CriptoYa");
    }
  });

  test("devuelve null si caen las dos", async () => {
    simular({});
    expect(await obtenerCotizaciones()).toBeNull();
  });
});
