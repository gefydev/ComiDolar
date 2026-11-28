import { describe, expect, test } from "bun:test";
import { armarTicket } from "../src/lib/ticket";

const texto = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("desglose", () => {
  test("exterior US$100", () => {
    const t = armarTicket("exterior", { "ext-m": "100", "ext-tc": "1625" });
    expect(t.barra).toBe("$211.250");
    expect(texto(t.html)).toContain("$2.112,50 por cada dólar");
  });
  test("digital US$10 en CABA", () => {
    const t = armarTicket("digital", {
      "dig-m": "10",
      "dig-tc": "1625",
      "dig-iibb": "2",
      "dig-provincia": "caba",
    });
    expect(t.barra).toBe("$24.862,50");
    expect(texto(t.html)).toContain("Ingresos Brutos CABA 2% · editable $325");
  });
  test("provincia sin dato: avisa y no lo suma", () => {
    const t = armarTicket("digital", {
      "dig-m": "10",
      "dig-tc": "1625",
      "dig-iibb": "",
      "dig-provincia": "cordoba",
    });
    expect(t.barra).toBe("$24.537,50");
    expect(texto(t.html)).toContain("no tenemos el dato de Ingresos Brutos");
  });
  test("negativo, vacío o letras no dan número", () => {
    for (const m of ["-5", "", "abc"]) {
      const t = armarTicket("exterior", { "ext-m": m, "ext-tc": "1625" });
      expect([t.barra, t.total]).toEqual(["—", null]);
      expect(t.errores["ext-m"]).toBeDefined();
      expect(t.html).not.toContain("$-");
    }
  });
  test("sin cotización no inventa un total", () => {
    expect(
      armarTicket("exterior", { "ext-m": "100", "ext-tc": "" }).total,
    ).toBeNull();
  });
  test("euros piden la cotización cruzada", () => {
    const sin = armarTicket("exterior", {
      "ext-m": "100",
      "ext-tc": "1625",
      "ext-moneda": "EUR",
    });
    expect(sin.total).toBeNull();
    const con = armarTicket("exterior", {
      "ext-m": "100",
      "ext-tc": "1625",
      "ext-moneda": "EUR",
      "ext-x": "1,10",
    });
    expect(con.total).toBe(232375);
  });
  test("cuotas inválidas", () => {
    const t = armarTicket("exterior", {
      "ext-m": "100",
      "ext-tc": "1625",
      "ext-cuotas": "si",
      "ext-n": "1,5",
    });
    expect(t.errores["ext-n"]).toContain("entero");
  });
  test("envío: más de US$3.000 no se calcula", () => {
    const t = armarTicket("envio", {
      "env-m": "3.500",
      "env-tc": "1625",
      "env-iva": "21",
    });
    expect([t.total, t.errores["env-m"]?.includes("3.000")]).toEqual([
      null,
      true,
    ]);
  });
  test("lo escrito por la persona no entra como HTML", () => {
    const t = armarTicket("exterior", {
      "ext-m": "<img src=x>",
      "ext-tc": "1625",
    });
    expect(t.html).not.toContain("<img");
  });
});
