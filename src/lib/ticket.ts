/**
 * Convierte lo que hay en el formulario en el desglose que se muestra. Lo usan
 * el servidor (HTML inicial) y el navegador, así no hay dos versiones.
 */
import {
  cuotaEstimada,
  digital,
  ENVIOS_POR_ANIO,
  envio,
  exterior,
  FOB_MAXIMO_USD,
  FRANQUICIA_USD,
  leerNumero,
  PROVINCIAS,
  viaje,
} from "@/lib/calculadora";
import { pesos } from "@/lib/formato";

export const CASOS = ["exterior", "digital", "viaje", "envio"] as const;
export type Caso = (typeof CASOS)[number];

/** Valores crudos de los campos, por `name`. Los checkbox son "si" o "". */
export type Campos = Record<string, string | undefined>;

export interface Ticket {
  html: string;
  /** Texto corto para la barra de total del celular */
  barra: string;
  /** Mensaje por nombre de campo */
  errores: Record<string, string>;
  /** Total en pesos, si se pudo calcular */
  total: number | null;
}

const MENSAJES = {
  vacio: "Ingresá un monto para ver el total.",
  negativo: "El monto tiene que ser mayor a cero.",
  letras: "Usá solo números. Podés usar coma para los centavos.",
};
const AVISO =
  "Estimación orientativa. No es asesoramiento impositivo. Confirmá con tu banco o con ARCA antes de pagar.";
const PERCEPCION = "Percepción Ganancias / Bienes Personales";

const e = (v: string) => v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const linea = (rotulo: string, detalle: string, valor: string) =>
  `<div class="linea"><span>${e(rotulo)}<small>${e(detalle)}</small></span><b>${e(valor)}</b></div>`;
const suma = (titulo: string, total: string, detalle = "") =>
  `<div class="suma"><span>${e(titulo)}</span><strong>${e(total)}</strong>${detalle ? `<small>${e(detalle)}</small>` : ""}</div>`;
const ojo = (texto: string) => `<p class="warn">${e(texto)}</p>`;
const usd = (n: number) => `US$${pesos(n).slice(1)}`;
const pct = (n: number) => `${pesos(n).slice(1)}%`;

export function armarTicket(caso: Caso, campos: Campos): Ticket {
  const errores: Record<string, string> = {};

  /** Lee un campo; si falta o está mal, anota el error y devuelve null. */
  const numero = (
    nombre: string,
    mensaje?: string,
    permiteCero = false,
    puntoDecimal = false,
  ) => {
    const r = leerNumero(campos[nombre] ?? "", { permiteCero, puntoDecimal });
    if (r.error === undefined) return r.valor;
    errores[nombre] =
      mensaje && r.error !== "letras" ? mensaje : MENSAJES[r.error];
    return null;
  };
  const tipoDeCambio = (nombre: string) =>
    numero(
      nombre,
      campos["sin-cotizacion"] === "si" && !campos[nombre]?.trim()
        ? "No pudimos cargar la cotización. Cargá el tipo de cambio a mano o probá en unos minutos."
        : "El tipo de cambio tiene que ser mayor a cero.",
    );

  /** Campos de cuotas: [cantidad, tipo de cambio] o null si no aplica. */
  const cuotas = (prefijo: string) => {
    if (campos[`${prefijo}-cuotas`] !== "si") return null;
    const n = leerNumero(campos[`${prefijo}-n`] ?? "").valor;
    if (!n || !Number.isInteger(n) || n < 2) {
      errores[`${prefijo}-n`] =
        "Ingresá un número entero de cuotas, mayor a 1.";
      return null;
    }
    return n;
  };

  const vacio = (): Ticket => ({
    html: `${suma("Total en pesos", "—", Object.values(errores)[0] ?? MENSAJES.vacio)}<p class="note">${AVISO}</p>`,
    barra: "—",
    errores,
    total: null,
  });
  const listo = (
    partes: string[],
    barra: string,
    total: number | null,
  ): Ticket => ({
    html: [...partes, `<p class="note">${AVISO}</p>`].join(""),
    barra,
    errores,
    total,
  });

  /** Cuota estimada: se recalcula el total con el dólar del resumen. */
  const avisoCuotas = (
    prefijo: string,
    n: number,
    totalCon: (tc: number) => number,
  ) => {
    const tc = tipoDeCambio(`${prefijo}-tcc`);
    return tc === null
      ? ""
      : ojo(
          `Estimado: ${n} cuotas de ${pesos(cuotaEstimada(totalCon(tc), n))} si el dólar no cambia. Cada cuota se convierte con el dólar del resumen donde se cobra.`,
        );
  };

  if (caso === "exterior") {
    const moneda = campos["ext-moneda"] ?? "USD";
    const precio = numero("ext-m");
    const cruzada =
      moneda === "USD"
        ? 1
        : numero(
            "ext-x",
            "Cargá la cotización de esa moneda en dólares.",
            false,
            true,
          );
    const tc = tipoDeCambio("ext-tc");
    const n = cuotas("ext");
    if (precio === null || cruzada === null || tc === null) return vacio();
    const enUsd = precio * cruzada;
    const propios = campos["ext-propios"] === "si";
    const r = exterior({ usd: enUsd, tc, dolaresPropios: propios });
    const simbolo = { USD: "US$", EUR: "€", BRL: "R$" }[moneda] ?? "US$";
    const partes = [
      linea(
        "Precio convertido",
        moneda === "USD"
          ? `${usd(enUsd)} × ${pesos(tc)}`
          : `${simbolo}${pesos(precio).slice(1)} = ${usd(enUsd)} × ${pesos(tc)}`,
        pesos(r.convertido),
      ),
      linea(
        PERCEPCION,
        propios ? "No se aplica si pagás con dólares propios" : "30% · RG 5617",
        pesos(r.percepcion),
      ),
      linea(
        "IVA de servicios digitales",
        "No corresponde en compras en el exterior",
        "$0",
      ),
    ];
    if (propios) {
      partes.push(
        suma(
          "Pagás en dólares",
          usd(enUsd),
          `equivale a ${pesos(r.convertido)} al tipo de cambio elegido`,
        ),
        ojo("Según Banco Provincia. Confirmalo con tu banco antes de pagar."),
      );
      return listo(partes, usd(enUsd), r.convertido);
    }
    partes.push(
      suma(
        "Total en pesos",
        pesos(r.total),
        `${pesos(r.porDolar)} por cada dólar`,
      ),
    );
    if (n)
      partes.push(
        avisoCuotas("ext", n, (t) => exterior({ usd: enUsd, tc: t }).total),
      );
    return listo(partes, pesos(r.total), r.total);
  }

  if (caso === "digital") {
    const cobro = campos["dig-cobro"] === "pesos" ? "pesos" : "usd";
    const monto = numero("dig-m");
    const tc = cobro === "usd" ? tipoDeCambio("dig-tc") : 1;
    // Cobrado en pesos hay un campo aparte, en 0 salvo que el resumen diga otra cosa
    const campoIibb = cobro === "usd" ? "dig-iibb" : "dig-iibbp";
    const crudo = (campos[campoIibb] ?? "").trim();
    const iibb = crudo
      ? numero(campoIibb, "Ingresos Brutos no puede ser negativo.", true)
      : 0;
    const n = cuotas("dig");
    if (monto === null || tc === null || iibb === null) return vacio();
    const datos = {
      monto,
      cobro: cobro as "usd" | "pesos",
      tc,
      iibb,
      // la casilla queda oculta (y quizás marcada) al pasar a pesos
      incluyeIva: cobro === "usd" && campos["dig-iva"] === "si",
      sumarIva: campos["dig-sumariva"] === "si",
    };
    const r = digital(datos);
    const provincia =
      PROVINCIAS.find((p) => p.id === campos["dig-provincia"]) ?? PROVINCIAS[0];
    if (cobro === "usd" && campos["dig-propios"] === "si")
      return listo(
        [
          linea(
            "Precio convertido",
            `${usd(monto)} × ${pesos(tc)}`,
            pesos(r.convertido),
          ),
          linea(PERCEPCION, "No se aplica si pagás con dólares propios", "$0"),
          suma("Total", "—", "Todavía no calculamos este caso"),
          ojo("Confirmá con tu banco qué impuestos cobra si pagás en dólares."),
        ],
        "—",
        null,
      );
    const partes = [
      cobro === "usd"
        ? linea(
            "Precio convertido",
            `${usd(monto)} × ${pesos(tc)}`,
            pesos(r.convertido),
          )
        : linea("Precio", "cobrado en pesos", pesos(r.convertido)),
      linea(
        PERCEPCION,
        cobro === "usd" ? "30% · RG 5617" : "No se aplica si se cobra en pesos",
        pesos(r.percepcion),
      ),
      linea(
        "IVA servicios digitales",
        r.iva
          ? datos.incluyeIva
            ? "21% sobre el precio sin IVA · RG 4240"
            : "21% · RG 4240"
          : "Incluido en el precio, o no corresponde",
        pesos(r.iva),
      ),
      linea(
        `Ingresos Brutos${cobro === "pesos" || provincia.id === "otra" ? "" : ` ${provincia.nombre}`}`,
        crudo
          ? `${pct(iibb)} · editable`
          : cobro === "usd"
            ? "sin dato: no está incluido"
            : "0% · editable",
        crudo || cobro === "pesos" ? pesos(r.iibb) : "—",
      ),
      suma(
        "Total estimado",
        pesos(r.total),
        r.porDolar ? `${pesos(r.porDolar)} por cada dólar` : "",
      ),
    ];
    if (cobro === "pesos")
      partes.push(
        ojo(
          "Cobrado en pesos no lleva el 30%. Qué otros impuestos se aplican depende del prestador: revisá tu resumen.",
        ),
      );
    else if (!crudo)
      partes.push(
        ojo(
          "Para esta provincia no tenemos el dato de Ingresos Brutos. El total no lo incluye. Cargá el valor de tu resumen.",
        ),
      );
    else if (provincia.id === "santafe")
      partes.push(
        ojo(
          "Santa Fe, sin confirmar: según la prensa es 3% en suscripciones audiovisuales (Netflix, Spotify) y 4,5% en el resto. Cambialo según tu servicio y revisá tu resumen.",
        ),
      );
    else if (!provincia.confirmado)
      partes.push(
        ojo(
          "La alícuota de esta provincia no está confirmada: revisala en tu resumen.",
        ),
      );
    if (n && cobro === "usd")
      partes.push(
        avisoCuotas("dig", n, (t) => digital({ ...datos, tc: t }).total),
      );
    return listo(partes, pesos(r.total), r.total);
  }

  if (caso === "viaje") {
    const precio = numero("via-m");
    const n = cuotas("via");
    if (precio === null) return vacio();
    const r = viaje(precio, n ?? 1);
    const partes = [
      linea("Precio del servicio", "neto de impuestos y tasas", pesos(precio)),
      linea(PERCEPCION, "30% · RG 5617", pesos(r.percepcion)),
      suma("Total en pesos", pesos(r.total), "sin otras tasas del pasaje"),
    ];
    if (n)
      partes.push(
        ojo(
          `En agencias y transporte la percepción se cobra entera con el primer pago: ${pesos(r.primerPago)} la primera cuota y ${pesos(r.cuota)} las demás, si no hay interés.`,
        ),
      );
    return listo(partes, pesos(r.total), r.total);
  }

  const valor = numero("env-m");
  const tc = tipoDeCambio("env-tc");
  const iva = numero("env-iva", "El IVA no puede ser negativo.", true);
  const sinCupo = campos["env-sincupo"] === "si";
  const crudo = (campos["env-der"] ?? "").trim();
  if (valor === null || tc === null || iva === null) return vacio();
  const base = envio({ usd: valor, tc, iva, sinCupo });
  const derechos =
    base.fueraDeFranquicia && crudo
      ? numero("env-der", "Los derechos no pueden ser negativos.", true)
      : null;
  const r = envio({ usd: valor, tc, iva, sinCupo, derechos });
  if (r.excedeMaximo) {
    errores["env-m"] =
      `El máximo por envío para uso personal es de US$${pesos(FOB_MAXIMO_USD).slice(1)}.`;
    return vacio();
  }
  const partes = [
    linea(
      "Precio convertido",
      `${usd(valor)} × ${pesos(tc)} · sin envío`,
      pesos(r.convertido),
    ),
    linea(PERCEPCION, "30% · si pagás con tarjeta", pesos(r.percepcion)),
    linea("IVA de importación", `${pct(iva)} · editable`, pesos(r.iva)),
    linea(
      "Derechos y tasa estadística",
      !r.fueraDeFranquicia
        ? "Exento dentro de la franquicia"
        : r.incompleto
          ? "Falta cargar el porcentaje"
          : `${pct(derechos!)} sobre ${usd(r.usdGravados)} · editable`,
      r.derechos === null ? "—" : pesos(r.derechos),
    ),
    r.incompleto
      ? suma("Total sin derechos", pesos(r.total), "incompleto: falta un dato")
      : suma("Total estimado", pesos(r.total)),
  ];
  if (r.fueraDeFranquicia)
    partes.push(
      ojo(
        sinCupo
          ? `Sin cupo: la franquicia es para ${ENVIOS_POR_ANIO} envíos por año. Calculamos los derechos sobre todo el valor (según la prensa, sin confirmar).`
          : `Supera la franquicia: los derechos se pagan solo sobre ${usd(r.usdGravados)}, lo que excede los US$${FRANQUICIA_USD} (ARCA).`,
      ),
    );
  partes.push(
    ojo(
      "Estimación: las reglas de courier todavía no están confirmadas con fuente oficial.",
    ),
  );
  return listo(partes, pesos(r.total), r.total);
}
