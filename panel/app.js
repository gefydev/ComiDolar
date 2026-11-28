// Panel de donaciones: HTML en el servidor, sin dependencias ni JavaScript en el navegador.
// El login lo hace oauth2-proxy; acá se vuelve a comprobar quién llega y desde dónde.
import { createHmac, timingSafeEqual } from "node:crypto";

const igual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Solo pasa lo que reenvía oauth2-proxy (secreto compartido) para el usuario permitido. */
export function autorizado(req, { usuario, secreto }) {
  const [tipo, valor] = (req.headers.get("authorization") ?? "").split(" ");
  if (tipo !== "Basic" || !valor) return false;
  const par = Buffer.from(valor, "base64").toString();
  const clave = par.slice(par.indexOf(":") + 1);
  const quien = req.headers.get("x-forwarded-user") ?? "";
  return (
    Boolean(secreto) &&
    igual(clave, secreto) &&
    quien.toLowerCase() === usuario.toLowerCase()
  );
}

/** Token anti-CSRF atado al usuario y al día; solo el servidor puede generarlo. */
export const tokenCsrf = (secreto, usuario, ahora = Date.now()) =>
  createHmac("sha256", secreto)
    .update(`${usuario.toLowerCase()}|${Math.floor(ahora / 86_400_000)}`)
    .digest("hex");

const csrfValido = (recibido, secreto, usuario) =>
  [0, 86_400_000].some((atras) =>
    igual(recibido, tokenCsrf(secreto, usuario, Date.now() - atras)),
  );

/** `actual` es la fila que se edita: su monto, si no se toca, se conserva exacto. */
export function leerDonacion(form, actual) {
  const name = String(form.get("name") ?? "").trim().replace(/\s+/g, " ");
  const texto = String(form.get("total") ?? "").trim().replace(",", ".");
  const year = String(form.get("year") ?? "").trim();
  const sinCambio =
    actual !== undefined && texto === String(actual.total).trim();
  const total = sinCambio
    ? actual.total
    : /^\d{1,10}(\.\d{1,2})?$/.test(texto)
      ? Number(texto)
      : NaN;
  if (!name || name.length > 100) return { error: "Falta el nombre (máximo 100 caracteres)." };
  if (!(total > 0)) return { error: "El monto tiene que ser un número mayor que cero, con hasta 2 decimales." };
  if (!/^20\d{2}$/.test(year)) return { error: "El año tiene que tener 4 cifras." };
  return { donacion: { name, total, year } };
}

const e = (v) =>
  String(v).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const pesos = (n) =>
  Number(n).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const pagina = (titulo, cuerpo) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(titulo)}</title><style>
body{font-family:system-ui,sans-serif;max-width:760px;margin:0 auto;padding:16px;color-scheme:light dark}
form.f{display:grid;gap:8px;max-width:360px;margin:12px 0}input,button,select{font:inherit;padding:8px;min-height:44px;box-sizing:border-box}
table{width:100%;border-collapse:collapse}td,th{padding:6px;border-bottom:1px solid #8886;text-align:left}td.n,th.n{text-align:right}
.msg{padding:8px;border:1px solid;border-radius:6px}a{display:inline-block;padding:6px 2px}
</style></head><body>${cuerpo}</body></html>`;

const campos = (d = {}) => `
<label>Nombre <input name="name" required maxlength="100" list="nombres" autocomplete="off" value="${e(d.name ?? "")}"></label>
<label>Monto (ARS) <input name="total" required inputmode="decimal" value="${e(d.total ?? "")}"></label>
<label>Año <input name="year" required pattern="20[0-9]{2}" inputmode="numeric" value="${e(d.year ?? "")}"></label>`;

const AVISOS = { alta: "Donación registrada.", editada: "Cambios guardados.", borrada: "Fila borrada." };

export function crearApp({ db, usuario, secreto, origen }) {
  const html = (cuerpo, status = 200, titulo = "Donaciones ComiDólar") =>
    new Response(pagina(titulo, cuerpo), {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
        "x-content-type-options": "nosniff",
        "referrer-policy": "same-origin",
      },
    });
  const volver = (year, aviso) =>
    new Response(null, { status: 303, headers: { location: `/?year=${year}&ok=${aviso}` } });
  const error = (texto, status = 400) =>
    html(`<p class="msg" role="alert">${e(texto)}</p><p><a href="/">Volver</a></p>`, status);

  async function inicio(url, csrf) {
    const actual = String(new Date().getFullYear());
    const years = [...new Set([actual, ...(await db.years())])].sort().reverse();
    const year = years.includes(url.searchParams.get("year")) ? url.searchParams.get("year") : actual;
    const filas = await db.listar(year);
    const total = filas.reduce((s, f) => s + Number(f.total), 0);
    const aviso = AVISOS[url.searchParams.get("ok")];
    return html(`<h1>Donaciones</h1>
${aviso ? `<p class="msg" role="status">${aviso}</p>` : ""}
<h2>Registrar donación</h2>
<p>Cada donación es una fila nueva. El sitio muestra la suma por persona y año.</p>
<form class="f" method="post" action="/alta">${csrf}${campos({ year: actual })}<button>Registrar</button></form>
<datalist id="nombres">${(await db.nombres()).map((n) => `<option value="${e(n)}">`).join("")}</datalist>
<h2>${e(year)}: ${filas.length} filas, ${pesos(total)}</h2>
<p>${years.map((y) => (y === year ? `<strong>${e(y)}</strong>` : `<a href="/?year=${e(y)}">${e(y)}</a>`)).join(" · ")}</p>
<table><tr><th>Nombre</th><th class="n">Total</th><th></th></tr>
${filas.map((f) => `<tr><td>${e(f.name)}</td><td class="n">${pesos(f.total)}</td><td><a href="/editar?id=${e(f.id)}">Editar</a> <a href="/borrar?id=${e(f.id)}">Borrar</a></td></tr>`).join("")}
</table>
<p><a href="/oauth2/sign_out">Cerrar sesión</a></p>`);
  }

  async function atender(req) {
    const url = new URL(req.url);
    if (url.pathname === "/ping") return new Response("ok");
    if (!autorizado(req, { usuario, secreto })) return new Response("Prohibido", { status: 403 });

    const form = req.method === "POST" ? await req.formData() : null;
    // CSRF: un formulario de otro sitio llega con otro Origin y sin el token
    if (form && req.headers.get("origin") !== origen) return new Response("Origen no permitido", { status: 403 });
    if (form && !csrfValido(String(form.get("csrf") ?? ""), secreto, usuario))
      return new Response("Formulario vencido o inválido: recargá la página.", { status: 403 });
    const csrf = `<input type="hidden" name="csrf" value="${tokenCsrf(secreto, usuario)}">`;

    const id = String(form?.get("id") ?? url.searchParams.get("id") ?? "");
    const fila = /^\d{1,15}$/.test(id) ? await db.buscar(id) : null;

    if (req.method === "GET") {
      if (url.pathname === "/") return inicio(url, csrf);
      if (url.pathname === "/editar" && fila)
        return html(`<h1>Editar</h1><form class="f" method="post" action="/editar">${csrf}<input type="hidden" name="id" value="${e(fila.id)}">${campos(fila)}<button>Guardar</button></form><p><a href="/?year=${e(fila.year)}">Cancelar</a></p>`);
      if (url.pathname === "/borrar" && fila)
        return html(`<h1>¿Borrar esta fila?</h1><p>${e(fila.name)}, ${e(fila.year)}: ${pesos(fila.total)}</p><form class="f" method="post" action="/borrar">${csrf}<input type="hidden" name="id" value="${e(fila.id)}"><button>Sí, borrar</button></form><p><a href="/?year=${e(fila.year)}">Cancelar</a></p>`);
    }
    if (form && url.pathname === "/borrar" && fila) {
      await db.borrar(fila.id);
      return volver(fila.year, "borrada");
    }
    if (form && (url.pathname === "/alta" || (url.pathname === "/editar" && fila))) {
      const { donacion, error: mal } = leerDonacion(
        form,
        url.pathname === "/editar" ? fila : undefined,
      );
      if (mal) return error(mal);
      if (url.pathname === "/alta") await db.agregar(donacion);
      else await db.editar(fila.id, donacion);
      return volver(donacion.year, url.pathname === "/alta" ? "alta" : "editada");
    }
    return error("No encontrado.", 404);
  }

  return async (req) => {
    try {
      return await atender(req);
    } catch (err) {
      console.error(err);
      return error("No se pudo completar. Revisá la lista antes de repetir.", 500);
    }
  };
}
