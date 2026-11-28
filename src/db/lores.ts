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

export const wspLore: Lore = [
  {
    h3: "Grupo de Whatsapp de Comi Dólar",
    p: [
      "El grupo de Whatsapp de Comi Dólar es un espacio de intercambio de información y análisis sobre las cotizaciones del dólar en Argentina. Este grupo se ha creado para facilitar la comunicación y la colaboración entre los miembros de Comi Dólar, así como para brindar información actualizada y precisa sobre las diversas cotizaciones del dólar.",
    ],
  },
];
