import { describe, expect, test } from "bun:test";
import { crearApp, leerDonacion, tokenCsrf } from "../app.js";

const ORIGEN = "https://panel.ejemplo";
const filas = [{ id: 1, name: "<b>Ejemplo</b>", total: "10.00", year: "2026" }];
const llamadas = [];
const usados = new Set();
const db = {
  years: async () => ["2026"],
  nombres: async () => [filas[0].name],
  listar: async () => filas,
  buscar: async (id) => filas.find((f) => String(f.id) === String(id)) ?? null,
  agregar: async (d, envio) => {
    if (usados.has(envio)) return false;
    usados.add(envio);
    llamadas.push(["agregar", d]);
    return true;
  },
  editar: async (id, d) => llamadas.push(["editar", id, d]),
  borrar: async (id) => llamadas.push(["borrar", id]),
};
const app = crearApp({ db, usuario: "gefydev", secreto: "s3creto", origen: ORIGEN });

const pedir = (ruta, { usuario = "gefydev", clave = "s3creto", form, origin = ORIGEN } = {}) => {
  const headers = {
    authorization: "Basic " + btoa(`${usuario}:${clave}`),
    "x-forwarded-user": usuario,
  };
  if (form) Object.assign(headers, { origin, "content-type": "application/x-www-form-urlencoded" });
  return app(new Request(ORIGEN + ruta, { method: form ? "POST" : "GET", headers, body: form && new URLSearchParams({ csrf: tokenCsrf("s3creto", "gefydev"), ...form }) }));
};
const alta = { name: "Persona", total: "1500,50", year: "2026", envio: "11111111-2222-3333-4444-555555555555" };

describe("acceso", () => {
  test("sin cabeceras del proxy no entra", async () => {
    expect((await app(new Request(ORIGEN + "/"))).status).toBe(403);
  });
  test("otro usuario o secreto equivocado no entran, ni leen ni escriben", async () => {
    for (const quien of [{ usuario: "otra-cuenta" }, { clave: "mala" }, { clave: "" }]) {
      expect((await pedir("/", quien)).status).toBe(403);
      expect((await pedir("/alta", { ...quien, form: alta })).status).toBe(403);
    }
    expect(llamadas).toEqual([]);
  });
  test("formulario de otro origen se rechaza", async () => {
    expect((await pedir("/alta", { form: alta, origin: "https://malo.ejemplo" })).status).toBe(403);
    expect(llamadas).toEqual([]);
  });
  test("sin token CSRF válido no escribe", async () => {
    for (const csrf of ["", "0".repeat(64), tokenCsrf("s3creto", "gefydev", 0)])
      expect((await pedir("/borrar", { form: { id: "1", csrf } })).status).toBe(403);
    expect(llamadas).toEqual([]);
  });
  test("ping no necesita login y no muestra datos", async () => {
    expect(await (await app(new Request(ORIGEN + "/ping"))).text()).toBe("ok");
  });
});

describe("operaciones", () => {
  test("lista escapando HTML", async () => {
    const html = await (await pedir("/")).text();
    expect(html).not.toContain("<b>Ejemplo");
    expect(html).toContain("&#60;b&#62;Ejemplo");
  });
  test("alta, edición y baja", async () => {
    expect((await pedir("/alta", { form: alta })).status).toBe(303);
    expect((await pedir("/editar", { form: { ...alta, id: "1" } })).status).toBe(303);
    expect((await pedir("/borrar?id=1")).status).toBe(200);
    expect(llamadas.some(([op]) => op === "borrar")).toBe(false);
    expect((await pedir("/borrar", { form: { id: "1" } })).status).toBe(303);
    expect(llamadas.map(([op]) => op)).toEqual(["agregar", "editar", "borrar"]);
    expect(llamadas[0][1]).toEqual({ name: "Persona", total: 1500.5, year: "2026" });
  });
  test("editar el nombre no obliga a tocar un monto con muchos decimales", () => {
    const actual = { total: "1234.01999999999999" };
    const form = (total) => new URLSearchParams({ name: "Otro", total, year: "2024" });
    expect(leerDonacion(form(actual.total), actual).donacion.total).toBe(actual.total);
    expect(leerDonacion(form("1234.019"), actual).error).toBeDefined();
    expect(leerDonacion(form(actual.total)).error).toBeDefined();
  });
  test("el mismo formulario no carga dos veces", async () => {
    const form = { ...alta, envio: "99999999-2222-3333-4444-555555555555" };
    const antes = llamadas.length;
    const [a, b] = await Promise.all([pedir("/alta", { form }), pedir("/alta", { form })]);
    expect([a, b].map((r) => r.headers.get("location").split("ok=")[1]).sort()).toEqual(["alta", "repetida"]);
    expect(llamadas.length).toBe(antes + 1);
    expect((await pedir("/alta", { form: { ...alta, envio: "" } })).status).toBe(400);
  });
  test("cada formulario trae su token y el botón se bloquea con script propio", async () => {
    const [uno, dos] = [await (await pedir("/")).text(), await (await pedir("/")).text()];
    const token = (h) => h.match(/name="envio" value="([0-9a-f-]{36})"/)[1];
    expect(token(uno)).not.toBe(token(dos));
    expect((await pedir("/")).headers.get("content-security-policy")).toContain("script-src 'self'");
    expect(await (await pedir("/panel.js")).text()).toContain("disabled = true");
  });
  test("datos inválidos no llegan a la base", () => {
    for (const mal of [{ name: " " }, { total: "-5" }, { total: "0" }, { total: "1e9" }, { total: "1.234,5" }, { year: "26" }])
      expect(leerDonacion(new URLSearchParams({ ...alta, ...mal })).error).toBeDefined();
  });
});
