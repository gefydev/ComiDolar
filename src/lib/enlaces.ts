// [texto](/ruta) de los textos propios → enlace o texto pelado.
const ENLACE = /\[([^\]]+)\]\((\/[^)]*)\)/g;

export const conEnlaces = (texto: string) =>
  texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(ENLACE, '<a class="enlace" href="$2">$1</a>');

export const sinEnlaces = (texto: string) => texto.replace(ENLACE, "$1");
