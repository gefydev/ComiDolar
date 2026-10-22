export interface DeckManifest {
  title: string;
  order: string[];
  fonts: string[];
}

export interface DeckSlide {
  id: string;
  title: string;
  html: string;
}

export interface LoadedDeck {
  title: string;
  fonts: string[];
  slides: DeckSlide[];
}

const manifests = import.meta.glob<DeckManifest>("/src/decks/*/deck.json", {
  import: "default",
  eager: true,
});

const slideSources = import.meta.glob<string>("/src/decks/*/slides/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

const ICONS: Record<string, string> = {
  CheckCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  Check: '<path d="M20 6 9 17l-5-5"/>',
  Warning:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  Star: '<path d="M11.5 2.3a.5.5 0 0 1 1 0l2.6 5.4 5.9.8a.5.5 0 0 1 .3.9l-4.3 4.2 1 5.9a.5.5 0 0 1-.7.5L12 17.3 6.7 20a.5.5 0 0 1-.7-.5l1-5.9-4.3-4.2a.5.5 0 0 1 .3-.9l5.9-.8z"/>',
};

const FALLBACK_ICON = '<circle cx="12" cy="12" r="10"/>';

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const plainText = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const renderIcons = (html: string) =>
  html.replace(
    /<x-icon\s+name="([A-Za-z]+)"(?:\s+style="([^"]*)")?\s*><\/x-icon>/g,
    (_, name: string, style = "") =>
      `<svg class="x-icon" style="${style}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? FALLBACK_ICON}</svg>`,
  );

const prepareSlide = (raw: string, index: number, total: number) => {
  const withoutNotes = raw.replace(/<aside>[\s\S]*?<\/aside>/g, "");
  const heading = withoutNotes.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/);
  const title = heading ? plainText(heading[1]) : `Diapositiva ${index + 1}`;
  const lazyImages =
    index === 0
      ? withoutNotes
      : withoutNotes.replace(/<img\b/g, '<img loading="lazy" decoding="async"');
  const html = renderIcons(lazyImages).replace(
    /<section\b/,
    `<section class="${index === 0 ? "slide is-active" : "slide"}" data-index="${index}" aria-roledescription="diapositiva" aria-label="${escapeAttribute(`${index + 1} de ${total}: ${title}`)}"`,
  );
  return { title, html };
};

export const loadDeck = (deck: string): LoadedDeck => {
  const manifest = manifests[`/src/decks/${deck}/deck.json`];
  if (!manifest) {
    throw new Error(
      `No existe la presentación "${deck}". Creá src/decks/${deck}/deck.json`,
    );
  }
  const total = manifest.order.length;
  const slides = manifest.order.map((id, index) => {
    const raw = slideSources[`/src/decks/${deck}/slides/${id}.html`];
    if (raw === undefined) {
      throw new Error(
        `Falta la diapositiva "${id}" en src/decks/${deck}/slides/${id}.html`,
      );
    }
    return { id, ...prepareSlide(raw, index, total) };
  });
  return { title: manifest.title, fonts: manifest.fonts, slides };
};
