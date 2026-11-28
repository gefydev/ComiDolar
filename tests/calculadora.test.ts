import { describe, expect, test } from "bun:test";
import {
  conDolares,
  cuotaEstimada,
  digital,
  envio,
  exterior,
  leerNumero,
  PROVINCIAS,
  viaje,
} from "../src/lib/calculadora";

const TC = 1625; // oficial venta de los ejemplos de textos.md y b2

describe("compra en el exterior", () => {
  test("US$100 = $211.250 ($2.112,50 por dólar)", () => {
    expect(exterior({ usd: 100, tc: TC })).toEqual({
      convertido: 162500,
      percepcion: 48750,
      total: 211250,
      porDolar: 2112.5,
    });
  });
  test("con dólares propios no hay percepción", () => {
    const r = exterior({ usd: 100, tc: TC, dolaresPropios: true });
    expect([r.percepcion, r.total]).toEqual([0, 162500]);
  });
  test("3 cuotas estimadas", () => {
    expect(cuotaEstimada(211250, 3)).toBe(70416.67);
  });
  test("comparación con MEP y cripto (ejemplos de b2)", () => {
    expect(conDolares(100, 1653)).toBe(165300);
    expect(conDolares(100, 1745.23)).toBe(174523);
  });
});

describe("servicio digital", () => {
  test("US$10 en CABA = $24.862,50", () => {
    expect(
      digital({ monto: 10, cobro: "usd", tc: TC, iibb: 2 }),
    ).toMatchObject({
      convertido: 16250,
      percepcion: 4875,
      iva: 3412.5,
      iibb: 325,
      total: 24862.5,
      porDolar: 2486.25,
    });
  });
  test("sin Ingresos Brutos: $24.537,50 (investigación §7.2, caso A)", () => {
    expect(digital({ monto: 10, cobro: "usd", tc: TC, iibb: 0 }).total).toBe(
      24537.5,
    );
  });
  test("precio con IVA incluido: $23.945,25 (§7.2, caso B)", () => {
    const r = digital({
      monto: 10,
      cobro: "usd",
      tc: TC,
      iibb: 0,
      incluyeIva: true,
    });
    expect([r.iva, r.total]).toEqual([2820.25, 23945.25]);
  });
  test("cobrado en pesos no lleva el 30 %", () => {
    const base = { monto: 10000, cobro: "pesos" as const, tc: TC, iibb: 0 };
    expect(digital(base)).toMatchObject({
      percepcion: 0,
      iva: 0,
      total: 10000,
      porDolar: null,
    });
    expect(digital({ ...base, sumarIva: true }).total).toBe(12100);
  });
  test("CABA es la única alícuota confirmada", () => {
    expect(PROVINCIAS.filter((p) => p.confirmado).map((p) => p.id)).toEqual([
      "caba",
    ]);
  });
});

describe("viaje en pesos", () => {
  test("$1.000.000 = $1.300.000", () => {
    expect(viaje(1_000_000)).toMatchObject({
      percepcion: 300000,
      total: 1300000,
    });
  });
  test("en cuotas la percepción va entera en el primer pago", () => {
    expect(viaje(900_000, 3)).toMatchObject({
      primerPago: 570000,
      cuota: 300000,
    });
  });
});

describe("envío del exterior", () => {
  test("US$100 dentro de la franquicia = $245.375", () => {
    expect(envio({ usd: 100, tc: TC, iva: 21 })).toMatchObject({
      convertido: 162500,
      percepcion: 48750,
      iva: 34125,
      derechos: 0,
      incompleto: false,
      total: 245375,
    });
  });
  test("US$400 entra; US$401 o sin cupo queda afuera", () => {
    expect(envio({ usd: 400, tc: TC, iva: 21 }).fueraDeFranquicia).toBe(false);
    expect(envio({ usd: 401, tc: TC, iva: 21 }).fueraDeFranquicia).toBe(true);
    expect(
      envio({ usd: 50, tc: TC, iva: 21, sinCupo: true }).fueraDeFranquicia,
    ).toBe(true);
  });
  test("afuera sin derechos cargados queda incompleto", () => {
    const r = envio({ usd: 500, tc: TC, iva: 21 });
    expect([r.derechos, r.incompleto]).toEqual([null, true]);
    expect(
      envio({ usd: 500, tc: TC, iva: 21, derechos: 50 }),
    ).toMatchObject({ derechos: 406250, incompleto: false });
  });
  test("más de US$3.000 supera el máximo", () => {
    expect(envio({ usd: 3000, tc: TC, iva: 21 }).excedeMaximo).toBe(false);
    expect(envio({ usd: 3001, tc: TC, iva: 21 }).excedeMaximo).toBe(true);
  });
});

describe("lectura de números", () => {
  test("formato es-AR", () => {
    expect(leerNumero("1.000.000").valor).toBe(1000000);
    expect(leerNumero("1.234,5").valor).toBe(1234.5);
    expect(leerNumero("10,50").valor).toBe(10.5);
    expect(leerNumero("10.5").valor).toBe(10.5);
    expect(leerNumero(" US$ 100 ").valor).toBe(100);
  });
  test("rechaza vacíos, negativos, cero y letras", () => {
    expect(leerNumero("").error).toBe("vacio");
    expect(leerNumero("-5").error).toBe("negativo");
    expect(leerNumero("0").error).toBe("negativo");
    expect(leerNumero("0", { permiteCero: true }).valor).toBe(0);
    for (const mal of ["abc", "1e5", "1,2,3", "--1", "Infinity"])
      expect(leerNumero(mal).error).toBe("letras");
  });
});
