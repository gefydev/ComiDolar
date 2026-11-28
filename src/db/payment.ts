export interface PaymentMethodType {
  name: string;
  short: string;
  image: string;
  pallete: {
    background: string;
    gradientfrom: string;
    gradientto: string;
    border: string;
    shadow: string;
  };
  cbu?: string;
  alias?: string;
  isWallet?: boolean;
}

export const PAYMENT_METHODS: PaymentMethodType[] = [
  {
    name: "Mercado Pago",
    short: "mp",
    image: "/assets/img/mp.webp",
    pallete: {
      background: "rgb(152, 206, 247)",
      gradientfrom: "rgb(67, 163, 236)",
      gradientto: "rgba(79, 178, 252, 1)",
      border: "rgb(0, 128, 255)",
      shadow: "rgb(67, 163, 236)",
    },
    cbu: "0000003100092757058924",
    alias: "el.gena",
    isWallet: true,
  },
  {
    name: "Banco Provincia",
    short: "bp",
    image: "/assets/img/bp.webp",
    pallete: {
      background: "rgb(152, 247, 158)",
      gradientfrom: "rgb(64, 243, 75)",
      gradientto: "rgb(25, 133, 59)",
      border: "rgb(55, 193, 96)",
      shadow: "rgb(64, 243, 75)",
    },
    cbu: "0140012003401253312851",
    alias: "el.gena.prov",
  },
  {
    name: "Banco Nación",
    short: "bn",
    image: "/assets/img/bn.webp",
    pallete: {
      background: "rgb(45, 106, 128)",
      gradientfrom: "rgb(49, 151, 188)",
      gradientto: "rgb(9, 57, 89)",
      border: "rgb(44, 145, 182)",
      shadow: "rgb(49, 151, 188)",
    },
    cbu: "0110015030001511859447",
    alias: "el.gena.bna",
  },
  {
    name: "Banco Ciudad",
    short: "bc",
    image: "/assets/img/bc.webp",
    pallete: {
      background: "rgb(1, 48, 255)",
      gradientfrom: "rgb(1, 48, 255)",
      gradientto: "rgb(49, 151, 188)",
      border: "rgb(0, 166, 255)",
      shadow: "rgb(1, 48, 255)",
    },
    cbu: "0290020910000602047211",
    alias: "el.gena.cdad",
  },
  {
    name: "Banco Santander",
    short: "bs",
    image: "/assets/img/bs.webp",
    pallete: {
      background: "rgb(224, 6, 17)",
      gradientfrom: "rgb(224, 6, 17)",
      gradientto: "rgb(255, 91, 113)",
      border: "rgb(189, 2, 2)",
      shadow: "rgb(224, 6, 17)",
    },
    cbu: "0720032830000001024851",
    alias: "el.gena.std",
  },
  {
    name: "NaranjaX",
    short: "nx",
    image: "/assets/img/nx.webp",
    pallete: {
      background: "rgb(253, 148, 0)",
      gradientfrom: "rgb(253, 148, 0)",
      gradientto: "rgb(251, 90, 4)",
      border: "rgb(253, 148, 0)",
      shadow: "rgb(251, 90, 4)",
    },
    cbu: "4530000800016413921560",
    alias: "el.gena.nja",
    isWallet: true,
  },
];
