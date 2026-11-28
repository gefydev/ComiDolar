import { expect, test } from "bun:test";
import { leerDonantes } from "../src/lib/donantes";

test("normaliza filas y descarta las incompletas", () => {
  expect(
    leerDonantes([
      { name: "Ejemplo", total: "1500.50", year: 2026 },
      { name: "Sin total" },
    ]),
  ).toEqual([{ name: "Ejemplo", total: 1500.5, year: "2026" }]);
  expect(() => leerDonantes({ message: "error" })).toThrow();
});
