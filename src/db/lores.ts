type Lore = Array<LoreSection>;

interface LoreSection {
  h3: string;
  p: string[];
  ul?: ListElements;
}

type ListElements = Array<ListElement>;

interface ListElement {
  bold?: string;
  text?: string;
}

export const calcuLore: Lore = [
  {
    h3: "Calculadora Dólar Tarjeta",
    p: [
      "Introduce los valores en USD que desees convertir a pesos argentinos y la calculadora hará el resto!",
      "Calcula las 24hs tus compras favoritas en USD y sabras exactamente cuanto valdra en ARS con impuestos.",
    ],
    ul: [
      {
        bold: "Precio en USD:",
        text: "La cotización del dólar en el mercado paralelo, una referencia común en la economía informal.",
      },
      {
        bold: "Precio FINAL en ARS con Impuestos:",
        text: "La cotización del dólar en el mercado paralelo, una referencia común en la economía informal.",
      },
    ],
  },
];
export const wspLore: Lore = [
  {
    h3: "Grupo de Whatsapp de Comi Dólar",
    p: [
      "El grupo de Whatsapp de Comi Dólar es un espacio de intercambio de información y análisis sobre las cotizaciones del dólar en Argentina. Este grupo se ha creado para facilitar la comunicación y la colaboración entre los miembros de Comi Dólar, así como para brindar información actualizada y precisa sobre las diversas cotizaciones del dólar.",
    ],
  },
];
