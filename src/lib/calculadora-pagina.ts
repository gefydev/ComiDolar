// Conecta el formulario de /calculadora con los cálculos.
import { conDolares, leerNumero } from "@/lib/calculadora";
import type { Cotizaciones } from "@/lib/cotizaciones";
import { enPagina } from "@/lib/cotizaciones-dom";
import { pesos } from "@/lib/formato";
import { armarTicket, CASOS, type Campos, type Caso } from "@/lib/ticket";

const PROVINCIA = "comidolar:provincia";
const ANCLAS: Record<Caso, string> = {
  exterior: "exterior",
  digital: "servicios-digitales",
  viaje: "viaje",
  envio: "envio",
};

declare global {
  interface Window {
    posthog?: { capture?: (evento: string, datos?: object) => void };
  }
}
const medir = (evento: string, datos: object) =>
  window.posthog?.capture?.(evento, datos);

let casas: Cotizaciones["casas"] = {};
let refrescar = () => {};

enPagina("calculadora", (c) => {
  casas = c.casas;
  refrescar();
});

const leerCampos = (form: HTMLFormElement): Campos => {
  const campos: Campos = {};
  for (const el of form.querySelectorAll<HTMLInputElement>("[name]")) {
    if (el.type === "radio" && !el.checked) continue;
    campos[el.name] =
      el.type === "checkbox" ? (el.checked ? "si" : "") : el.value;
  }
  return campos;
};

/** Mensaje debajo del campo con problema. */
const marcarErrores = (
  form: HTMLFormElement,
  errores: Record<string, string>,
) => {
  for (const el of form.querySelectorAll<HTMLInputElement>("input[name]")) {
    if (el.type === "radio" || el.type === "checkbox") continue;
    const mensaje = errores[el.name];
    const id = `error-${el.name}`;
    let p = form.querySelector(`#${id}`);
    el.toggleAttribute("aria-invalid", Boolean(mensaje));
    if (!mensaje) {
      p?.remove();
      el.removeAttribute("aria-describedby");
      continue;
    }
    if (!p) {
      p = document.createElement("p");
      p.id = id;
      p.className = "error";
      (el.closest(".monto") ?? el).after(p);
    }
    p.textContent = `⚠ ${mensaje}`;
    el.setAttribute("aria-describedby", id);
  }
};

document.addEventListener("astro:page-load", () => {
  const form = document.querySelector<HTMLFormElement>("[data-calc]");
  if (!form) return;
  const $ = <T extends HTMLElement>(s: string) => form.querySelector<T>(s)!;
  const escribir = (el: Element | null, texto: string) => {
    if (el && el.textContent !== texto) el.textContent = texto;
  };
  const editados = new Set<string>();
  let medido = "";
  let espera: ReturnType<typeof setTimeout>;
  let esperaMedir: ReturnType<typeof setTimeout>;

  const caso = () =>
    (form.querySelector<HTMLInputElement>('[name="caso"]:checked')?.value ??
      "exterior") as Caso;

  const pintar = () => {
    const campos = leerCampos(form);
    const errores: Record<string, string> = {};
    for (const id of CASOS) {
      const t = armarTicket(id, campos);
      const caja = $(`[data-ticket="${id}"]`);
      // solo si cambió, para que el lector de pantalla no lo repita
      if (caja.dataset.html !== t.html) {
        caja.innerHTML = t.html;
        caja.dataset.html = t.html;
      }
      escribir($(`[data-barra="${id}"]`), t.barra);
      Object.assign(errores, t.errores);
    }
    marcarErrores(form, errores);

    // Envío: los derechos solo hacen falta fuera de la franquicia
    const valor = leerNumero(campos["env-m"] ?? "").valor ?? 0;
    form.classList.toggle(
      "fuera-de-franquicia",
      valor > 400 || campos["env-sincupo"] === "si",
    );

    // Comparación con dólares propios, solo para compras en el exterior
    const precio = leerNumero(campos["ext-m"] ?? "").valor;
    const cruzada =
      campos["ext-moneda"] === "USD"
        ? 1
        : leerNumero(campos["ext-x"] ?? "").valor;
    const usd = precio && cruzada ? precio * cruzada : null;
    const total = armarTicket("exterior", {
      ...campos,
      "ext-propios": "",
    }).total;
    const fila = (id: string, v: number | null) =>
      escribir(
        document.querySelector(`[data-compara="${id}"]`),
        v === null ? "—" : pesos(v),
      );
    escribir(
      document.querySelector("[data-comparacion-usd]"),
      usd ? `US$${pesos(usd).slice(1)}` : "—",
    );
    fila("pesos", total);
    for (const id of ["bolsa", "cripto"] as const)
      fila(id, usd && casas[id] ? conDolares(usd, casas[id].venta) : null);
  };

  const medirCalculo = () => {
    clearTimeout(esperaMedir);
    esperaMedir = setTimeout(() => {
      const id = caso();
      const t = armarTicket(id, leerCampos(form));
      // sin montos: solo qué caso se usó
      const clave = `${id}:${t.total}`;
      if (t.total === null || clave === medido) return;
      medido = clave;
      medir("calcular", { caso: id });
    }, 1500);
  };

  refrescar = () => {
    if (!casas.oficial) return;
    const texto = pesos(casas.oficial.venta).slice(1);
    for (const el of form.querySelectorAll<HTMLInputElement>("[data-tc]"))
      if (!editados.has(el.name)) el.value = texto;
    escribir(
      document.querySelector("[data-oficial]"),
      pesos(casas.oficial.venta),
    );
    pintar();
  };

  const provincia = $<HTMLSelectElement>("#dig-provincia");
  const iibb = $<HTMLInputElement>("#dig-iibb");
  const usarProvincia = () => {
    iibb.value = (provincia.selectedOptions[0].dataset.iibb ?? "").replace(
      ".",
      ",",
    );
  };
  const guardada = localStorage.getItem(PROVINCIA);
  if (guardada && [...provincia.options].some((o) => o.value === guardada)) {
    provincia.value = guardada;
    usarProvincia();
  }

  const elegir = () => {
    const id = Object.entries(ANCLAS).find(
      ([, ancla]) => `#${ancla}` === location.hash,
    )?.[0];
    if (id) $<HTMLInputElement>(`#c-${id}`).checked = true;
  };
  elegir();
  window.onhashchange = elegir;

  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("input", (e) => {
    const el = e.target as HTMLInputElement;
    if (el.name === "caso") return;
    if (el.matches("[data-tc]")) editados.add(el.name);
    clearTimeout(espera);
    espera = setTimeout(pintar, 120);
    medirCalculo();
  });
  form.addEventListener("change", (e) => {
    const el = e.target as HTMLInputElement;
    if (el.name === "caso") {
      history.replaceState(history.state, "", `#${ANCLAS[el.value as Caso]}`);
      medir("cambiar_caso", { caso: el.value });
    }
    if (el.name === "dig-provincia") {
      localStorage.setItem(PROVINCIA, el.value);
      usarProvincia();
    }
    pintar();
    medirCalculo();
  });

  $("[data-compartir]").addEventListener("click", async () => {
    const t = armarTicket(caso(), leerCampos(form));
    const aviso = $("[data-compartido]");
    if (t.total === null) {
      aviso.textContent = "Ingresá un monto para ver el total.";
      return;
    }
    const url = `${location.origin}/calculadora#${ANCLAS[caso()]}`;
    const text = `Total estimado con dólar tarjeta: ${t.barra}`;
    try {
      if (navigator.share) await navigator.share({ text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        aviso.textContent = "Copiado ✓";
      }
      medir("compartir_resultado", { caso: caso() });
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        aviso.textContent = "No se pudo compartir.";
    }
  });

  // El precio puede haber llegado antes que este código
  pintar();
  refrescar();
});
