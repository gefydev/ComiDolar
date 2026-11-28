// Textos de cada página /dolar-<slug>: textos.md §6 (Borges). Sin números de
// cotización. Los enlaces van como [texto](/ruta).
export interface TextoCotizacion {
  titulo: string;
  descripcion: string;
  h1: string;
  bajada: string;
  queEs: string[];
  diferencias: string[];
  faq: { pregunta: string; respuesta: string }[];
  /** Texto alternativo del gráfico */
  grafico: string;
}

export const TEXTOS_COTIZACION: Record<string, TextoCotizacion> = {
  oficial: {
    titulo: "Dólar oficial hoy: cotización y cómo se calcula",
    descripcion:
      "Cotización del dólar oficial hoy, compra y venta, con el gráfico de los últimos 10 días y qué precio aplica en cada compra.",
    h1: "Dólar oficial hoy",
    bajada:
      "Compra y venta del dólar oficial, con la fuente y la hora de cada cotización.",
    queEs: [
      "El dólar oficial es el tipo de cambio que se usa en el sistema bancario para comprar y vender dólares. Es la base sobre la que se calculan otras cotizaciones, como la del dólar tarjeta.",
      "Se compra en bancos, con las condiciones que cada entidad fije en cada momento. Las condiciones para operar pueden cambiar según la normativa vigente del BCRA; consultá en tu banco o entidad.",
      "Lo usan personas que compran dólares en el banco o que necesitan un valor de referencia para cuentas y precios en dólares. Comprarlo en el banco no tiene percepción del 30 %; esa percepción se aplica a compras con tarjeta en el exterior.",
    ],
    diferencias: [
      "[Dólar tarjeta](/dolar-tarjeta): el oficial más la percepción del 30 % en compras con tarjeta en el exterior.",
      "[Dólar blue](/dolar-blue): se compra y vende fuera del sistema bancario.",
      "[Dólar MEP](/dolar-mep): se obtiene con bonos en la bolsa.",
    ],
    faq: [
      {
        pregunta: "¿Qué es el dólar oficial?",
        respuesta:
          "Es el tipo de cambio del sistema bancario. Sirve de base para otras cotizaciones.",
      },
      {
        pregunta: "¿Dónde compro dólar oficial?",
        respuesta:
          "En bancos y en otras entidades autorizadas a operar en cambios.",
      },
      {
        pregunta: "¿Por qué el oficial no es igual al blue?",
        respuesta:
          "Porque son mercados distintos, con oferta y demanda propias.",
      },
      {
        pregunta: "¿El dólar oficial paga la percepción del 30 %?",
        respuesta:
          "No. La percepción del 30 % aplica a consumos con tarjeta en el exterior, no a la compra de dólares en el banco.",
      },
      {
        pregunta: "¿Cambia durante el día?",
        respuesta:
          "Cambia según la fuente. La cotización de arriba se actualiza en vivo y muestra la hora.",
      },
    ],
    grafico:
      "Gráfico de la cotización de venta del dólar oficial en los últimos 10 días. Los valores diarios están en la tabla debajo.",
  },
  blue: {
    titulo: "Dólar blue hoy: cotización y qué es",
    descripcion:
      "Cotización del dólar blue hoy: qué es, dónde se compra fuera del banco y en qué se diferencia del oficial y del MEP.",
    h1: "Dólar blue hoy",
    bajada:
      "Cotización del dólar blue en el mercado libre, con el gráfico de los últimos 10 días y la comparación con el oficial.",
    queEs: [
      "El dólar blue es la cotización del dólar que se compra y vende fuera del sistema bancario, en el mercado libre. No es un tipo de cambio oficial.",
      "Se consigue con personas o casas de cambio que operan fuera de los bancos. El precio cambia durante el día y puede variar entre un lugar y otro. Por eso el sitio muestra la venta y la fuente de cada cotización.",
      "Lo usan personas que quieren dólares en efectivo sin pasar por el banco.",
    ],
    diferencias: [
      "[Dólar oficial](/dolar-oficial): se compra en el banco, con un precio de referencia.",
      "[Dólar MEP](/dolar-mep): se obtiene vendiendo y comprando bonos en la bolsa.",
      "[Dólar tarjeta](/dolar-tarjeta): el oficial más la percepción del 30 % en compras con tarjeta en el exterior. El blue no tiene esa percepción.",
    ],
    faq: [
      {
        pregunta: "¿Qué es el dólar blue?",
        respuesta:
          "Es la cotización del dólar en el mercado libre, fuera de los bancos.",
      },
      {
        pregunta: "¿Es legal comprar dólar blue?",
        respuesta:
          "No es un tipo de cambio oficial. El BCRA fija reglas para las operaciones dentro del mercado de cambios; no encontré una norma que regule la compra fuera de él.",
      },
      {
        pregunta: "¿Por qué el blue es distinto del oficial?",
        respuesta: "Son mercados distintos, con oferta y demanda propias.",
      },
      {
        pregunta: "¿Dónde se compra el dólar blue?",
        respuesta:
          "Fuera de los bancos, en casas de cambio o con personas que lo operan. Antes de pagar, revisá los billetes.",
      },
      {
        pregunta: "¿El dólar blue paga la percepción del 30 %?",
        respuesta:
          "No. La percepción del 30 % aplica a compras con tarjeta en el exterior.",
      },
      {
        pregunta: "¿Cómo se calcula el dólar blue?",
        respuesta: "No tiene una fórmula oficial: lo fija el mercado.",
      },
    ],
    grafico:
      "Gráfico de la cotización de venta del dólar blue en los últimos 10 días. Los valores diarios están en la tabla debajo.",
  },
  mep: {
    titulo: "Dólar MEP hoy: qué es y cómo se calcula",
    descripcion:
      "Cotización del dólar MEP hoy: cómo se obtiene con bonos en la bolsa y en qué se diferencia del CCL, del blue y del oficial.",
    h1: "Dólar MEP hoy",
    bajada:
      "Cotización del dólar MEP, también llamado dólar bolsa: el que resulta de comprar y vender bonos en pesos y en dólares dentro del mercado de valores.",
    queEs: [
      "El dólar MEP es el precio que surge de comprar un bono en pesos y venderlo en dólares (o al revés) dentro del mercado de valores. También se lo llama dólar bolsa.",
      "Se consigue con una cuenta en un agente o broker habilitado por la CNV. El precio sale de las operaciones del día y cambia en cada una.",
      "Lo usan personas que quieren dólares sin pasar por el banco, a través de su cuenta de bolsa.",
    ],
    diferencias: [
      "[Dólar CCL](/dolar-ccl): también sale de bonos, pero la liquidación se hace en el exterior.",
      "[Dólar blue](/dolar-blue): se compra fuera de los bancos y de la bolsa.",
      "[Dólar oficial](/dolar-oficial): es el tipo de cambio del sistema bancario.",
    ],
    faq: [
      {
        pregunta: "¿Qué es el dólar MEP?",
        respuesta:
          "Es el precio que resulta de comprar y vender bonos en pesos y en dólares en la bolsa.",
      },
      {
        pregunta: "¿Es legal el dólar MEP?",
        respuesta:
          "Se opera dentro del mercado de valores regulado por la CNV. Las condiciones para operar pueden cambiar según la normativa vigente del BCRA; consultá en tu banco o entidad.",
      },
      {
        pregunta: "¿Cómo se compra el dólar MEP?",
        respuesta:
          "Con una cuenta en un broker habilitado: vendés un bono en pesos y comprás un bono en dólares, o al revés.",
      },
      {
        pregunta: "¿El MEP es igual al CCL?",
        respuesta:
          "No. Se obtienen por caminos distintos, aunque los precios pueden ser parecidos.",
      },
      {
        pregunta: "¿El dólar MEP paga la percepción del 30 %?",
        respuesta:
          "No. La percepción del 30 % aplica a compras con tarjeta en el exterior.",
      },
      {
        pregunta: "¿Cuánto cuesta el dólar MEP hoy?",
        respuesta: "La cotización de arriba se actualiza en vivo.",
      },
    ],
    grafico:
      "Gráfico de la cotización de venta del dólar MEP en los últimos 10 días. Los valores diarios están en la tabla debajo.",
  },
  ccl: {
    titulo: "Dólar CCL hoy: contado con liqui y cómo se calcula",
    descripcion:
      "Cotización del dólar CCL (contado con liqui) hoy: cómo se obtiene con títulos y en qué se diferencia del MEP.",
    h1: "Dólar CCL hoy",
    bajada:
      "Cotización del contado con liquidación: el dólar que se obtiene comprando títulos en pesos en la Argentina y liquidándolos en dólares en el exterior.",
    queEs: [
      "El contado con liquidación (CCL) es el tipo de cambio que surge de comprar títulos en pesos en la Argentina y venderlos en dólares en otra plaza, con liquidación en el exterior.",
      "Se consigue con una cuenta en un broker, dentro del mercado de valores. El precio cambia en cada operación.",
      "Lo usan personas que quieren tener dólares en una cuenta del exterior.",
    ],
    diferencias: [
      "[Dólar MEP](/dolar-mep): también sale de bonos, pero la liquidación se hace en el país.",
      "[Dólar blue](/dolar-blue): se compra fuera de los bancos y de la bolsa.",
      "[Dólar oficial](/dolar-oficial): es el tipo de cambio del sistema bancario.",
    ],
    faq: [
      {
        pregunta: "¿Qué es el dólar CCL?",
        respuesta:
          "Es el precio del contado con liquidación: comprar títulos en pesos y liquidarlos en dólares en el exterior.",
      },
      {
        pregunta: '¿Qué significa "contado con liqui"?',
        respuesta: "Es la forma coloquial de decir contado con liquidación.",
      },
      {
        pregunta: "¿Es legal el dólar CCL?",
        respuesta:
          "Se opera dentro del mercado de valores regulado por la CNV, como el MEP. Las condiciones para operar pueden cambiar según la normativa vigente del BCRA; consultá en tu banco o entidad.",
      },
      {
        pregunta: "¿Cuál es la diferencia con el MEP?",
        respuesta:
          "El MEP se liquida en el país y el CCL se liquida en el exterior.",
      },
      {
        pregunta: "¿El dólar CCL paga la percepción del 30 %?",
        respuesta:
          "No. La percepción del 30 % aplica a compras con tarjeta en el exterior.",
      },
      {
        pregunta: "¿Cómo se consigue el dólar CCL?",
        respuesta:
          "Con una cuenta en un broker habilitado, comprando títulos en pesos y liquidándolos en dólares en el exterior.",
      },
    ],
    grafico:
      "Gráfico de la cotización de venta del contado con liquidación en los últimos 10 días. Los valores diarios están en la tabla debajo.",
  },
  tarjeta: {
    titulo: "Dólar tarjeta hoy: cotización y percepción 30 %",
    descripcion:
      "Dólar tarjeta hoy: el oficial más la percepción del 30 % en compras con tarjeta en el exterior, con la norma y cómo recuperarla.",
    h1: "Dólar tarjeta hoy",
    bajada:
      "Cuánto cuesta cada dólar en una compra con tarjeta en el exterior, con la percepción del 30 % incluida.",
    queEs: [
      "El dólar tarjeta es el dólar oficial más la percepción de ganancias del 30 %, según la RG 5617/2024 de ARCA. Se aplica a compras con tarjeta en moneda extranjera en el exterior, como compras en portales del exterior.",
      "La percepción se paga en el resumen de la tarjeta. Si no pagás Ganancias ni Bienes Personales, como los monotributistas, podés pedir la devolución a ARCA una vez terminado el año calendario, con CUIT, CBU y Domicilio Fiscal Electrónico. Quien computa la percepción en su declaración jurada la usa allí.",
      "Los servicios digitales tienen otro cálculo: suman IVA del 21 % y dependen de la moneda de cobro. La [calculadora](/calculadora) separa los casos.",
    ],
    diferencias: [
      "[Dólar oficial](/dolar-oficial): es la base del cálculo, sin la percepción.",
      "[Calculadora](/calculadora): arma el total para cada tipo de compra.",
      "[Dólar blue](/dolar-blue) y [dólar MEP](/dolar-mep): no tienen la percepción del 30 %, porque no son compras con tarjeta en el exterior.",
    ],
    faq: [
      {
        pregunta: "¿Cuánto es la percepción del dólar tarjeta?",
        respuesta: "El 30 % sobre la compra en dólares, según la RG 5617/2024.",
      },
      {
        pregunta: "¿Netflix y Spotify pagan el 30 %?",
        respuesta:
          "Depende de la moneda de cobro. Si cobran en pesos, según ARCA no aplica el 30 %. Si cobran en dólares con tarjeta, sí aplica. La calculadora tiene un selector para esto.",
      },
      {
        pregunta: "¿Cómo recupero la percepción?",
        respuesta:
          "Si no pagás Ganancias ni Bienes Personales, la pedís en ARCA después del cierre del año, con CUIT, CBU y Domicilio Fiscal Electrónico.",
      },
      {
        pregunta: "¿El 30 % se cobra con cuotas?",
        respuesta:
          "Se cobra en el resumen de la tarjeta. En compras en cuotas, consultá con tu banco cómo se cobra.",
      },
      {
        pregunta: "¿Sigue existiendo el impuesto PAIS?",
        respuesta:
          "No. Venció el 23/12/2024. ARCA lo confirmó en su novedad del 19/12/2024.",
      },
      {
        pregunta: "¿Cómo calculo el total de mi compra?",
        respuesta:
          "Usá la [calculadora](/calculadora): elegís el tipo de compra y la moneda de cobro, y te muestra el desglose.",
      },
    ],
    grafico:
      "Gráfico de la cotización de venta del dólar tarjeta en los últimos 10 días. Los valores diarios están en la tabla debajo.",
  },
  cripto: {
    titulo: "Dólar cripto hoy: cotización y cómo se calcula",
    descripcion:
      "Dólar cripto hoy: qué es, cómo se obtiene con stablecoins y en qué se diferencia del blue, el MEP y el oficial.",
    h1: "Dólar cripto hoy",
    bajada:
      "Cotización del dólar cripto, calculada con stablecoins que buscan valer un dólar, y sus diferencias con los otros dólares.",
    queEs: [
      "El dólar cripto es el precio al que se compran y venden stablecoins en plataformas de criptomonedas. Una stablecoin es una criptomoneda que busca valer un dólar. Por eso su precio muestra cuánto cuesta un dólar en ese mercado.",
      "Se obtiene cambiando pesos por una stablecoin en una plataforma y vendiéndola después. El precio es el de cada plataforma y puede variar un poco entre ellas.",
      "Lo usan personas que operan con cripto o que quieren mover dólares sin pasar por el banco.",
    ],
    diferencias: [
      "[Dólar blue](/dolar-blue): se compra en efectivo, fuera de las plataformas.",
      "[Dólar MEP](/dolar-mep): se obtiene en la bolsa, con bonos.",
      "[Dólar oficial](/dolar-oficial): es el tipo de cambio del sistema bancario.",
    ],
    faq: [
      {
        pregunta: "¿Qué es el dólar cripto?",
        respuesta:
          "Es el precio de las stablecoins en plataformas de criptomonedas, que siguen al dólar.",
      },
      {
        pregunta: "¿Qué es una stablecoin?",
        respuesta: "Una criptomoneda que busca mantener el valor de un dólar.",
      },
      {
        pregunta: "¿El dólar cripto es igual al blue?",
        respuesta:
          "No. Es otro mercado: el precio sigue a las stablecoins en plataformas, no a la compra en efectivo.",
      },
      {
        pregunta: "¿Por qué cambia entre plataformas?",
        respuesta:
          "Cada plataforma fija su precio con su propia oferta y demanda.",
      },
      {
        pregunta: "¿Es legal el dólar cripto?",
        respuesta:
          "Las stablecoins no son moneda de curso legal en la Argentina. Para comprarlas o venderlas, usá un proveedor de servicios de activos virtuales (PSAV) inscripto en la CNV.",
      },
      {
        pregunta: "¿El dólar cripto paga la percepción del 30 %?",
        respuesta:
          "No. La percepción del 30 % aplica a compras con tarjeta en el exterior.",
      },
    ],
    grafico:
      "Gráfico de la cotización del dólar cripto en los últimos 10 días. Los valores diarios están en la tabla debajo.",
  },
  mayorista: {
    titulo: "Dólar mayorista hoy: cotización y qué es",
    descripcion:
      "Dólar mayorista hoy: la cotización de referencia de las operaciones entre bancos, qué mide y en qué se diferencia del oficial.",
    h1: "Dólar mayorista hoy",
    bajada:
      "Cotización del dólar mayorista, la referencia de las operaciones entre bancos y del mercado de cambios.",
    queEs: [
      "El dólar mayorista es el tipo de cambio de las operaciones grandes entre bancos y de comercio exterior. Es la referencia del mercado de cambios. Es la que publica el BCRA como tipo de cambio de referencia (Comunicación A 3500).",
      "En general, las personas no operan directamente en el mayorista: acceden al dólar oficial en el banco.",
      "Lo siguen quienes analizan la economía y el mercado de cambios.",
    ],
    diferencias: [
      "[Dólar oficial](/dolar-oficial): es la cotización que se usa para compras en el banco.",
      "[Dólar blue](/dolar-blue): se compra fuera del sistema bancario.",
      "[Dólar tarjeta](/dolar-tarjeta): el oficial más la percepción del 30 % en compras con tarjeta en el exterior.",
    ],
    faq: [
      {
        pregunta: "¿Qué es el dólar mayorista?",
        respuesta:
          "Es la cotización de las operaciones grandes entre bancos y de comercio exterior.",
      },
      {
        pregunta: "¿Es lo mismo que el dólar oficial?",
        respuesta:
          "No. El mayorista es la referencia entre bancos que publica el BCRA; el oficial es la cotización que se usa para compras en el banco.",
      },
      {
        pregunta: "¿Puedo comprar dólar mayorista como persona?",
        respuesta: "En general no directamente.",
      },
      {
        pregunta: "¿Cambia todos los días?",
        respuesta:
          "Sí, cambia en cada rueda de operaciones. La cotización de arriba se actualiza en vivo.",
      },
    ],
    grafico:
      "Gráfico de la cotización mayorista en los últimos 10 días. Los valores diarios están en la tabla debajo.",
  },
};
