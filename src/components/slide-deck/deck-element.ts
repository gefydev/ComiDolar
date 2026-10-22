const SWIPE_THRESHOLD = 48;
const SLIDE_WIDTH = 1920;

type FullscreenHost = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

class SlideDeckElement extends HTMLElement {
  private root!: ShadowRoot;
  private slides: HTMLElement[] = [];
  private segments: HTMLButtonElement[] = [];
  private current = 0;
  private visited = new Set<number>([0]);
  private pointerStart: { x: number; y: number } | null = null;
  private resizeObserver?: ResizeObserver;
  private abort?: AbortController;

  connectedCallback() {
    const root = this.shadowRoot ?? this.attachDeclarativeRoot();
    if (!root) return;
    this.root = root;
    this.slides = [...root.querySelectorAll<HTMLElement>(".slide")];
    this.segments = [
      ...root.querySelectorAll<HTMLButtonElement>(".progress button"),
    ];
    if (this.slides.length === 0) return;

    this.abort = new AbortController();
    const { signal } = this.abort;
    const viewport = root.querySelector<HTMLElement>(".viewport");

    root
      .querySelector(".prev")
      ?.addEventListener("click", () => this.go(this.current - 1), { signal });
    root
      .querySelector(".next")
      ?.addEventListener("click", () => this.go(this.current + 1), { signal });
    root
      .querySelector(".fullscreen")
      ?.addEventListener("click", () => this.toggleFullscreen(), { signal });
    this.segments.forEach((segment, index) =>
      segment.addEventListener("click", () => this.go(index), { signal }),
    );

    this.addEventListener("keydown", (event) => this.onKey(event), { signal });
    document.addEventListener(
      "keydown",
      (event) => {
        if (this.isExpanded() && event.target !== this) this.onKey(event);
      },
      { signal },
    );
    document.addEventListener(
      "fullscreenchange",
      () => this.syncFullscreenButton(),
      { signal },
    );
    window.addEventListener("resize", () => this.syncRotation(), { signal });
    window.addEventListener(
      "hashchange",
      () => {
        const index = this.indexFromHash();
        if (index !== null && index !== this.current) {
          this.go(index, { updateHash: false });
          this.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
      { signal },
    );

    if (viewport) {
      viewport.addEventListener(
        "pointerdown",
        (event) => {
          this.pointerStart = { x: event.clientX, y: event.clientY };
        },
        { signal },
      );
      viewport.addEventListener(
        "pointerup",
        (event) => this.onPointerUp(event, viewport),
        { signal },
      );
      this.resizeObserver = new ResizeObserver(([entry]) => {
        const width =
          entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        viewport.style.setProperty("--s", String(width / SLIDE_WIDTH));
      });
      this.resizeObserver.observe(viewport);
    }

    this.go(this.indexFromHash() ?? 0, { updateHash: false, focus: false });
    this.setAttribute("data-ready", "");
  }

  disconnectedCallback() {
    this.abort?.abort();
    this.resizeObserver?.disconnect();
  }

  private attachDeclarativeRoot() {
    const template = this.querySelector<HTMLTemplateElement>(
      "template[shadowrootmode]",
    );
    if (!template) return null;
    const root = this.attachShadow({ mode: "open" });
    root.append(template.content.cloneNode(true));
    template.remove();
    return root;
  }

  private get deckId() {
    return this.dataset.deck ?? "presentacion";
  }

  private indexFromHash() {
    const match = location.hash.match(new RegExp(`^#${this.deckId}-(\\d+)$`));
    if (!match) return null;
    const index = Number(match[1]) - 1;
    return index >= 0 && index < this.slides.length ? index : null;
  }

  private go(
    target: number,
    {
      updateHash = true,
      focus = false,
    }: { updateHash?: boolean; focus?: boolean } = {},
  ) {
    const index = Math.max(0, Math.min(this.slides.length - 1, target));
    this.slides.forEach((slide, i) => {
      const active = i === index;
      slide.classList.toggle("is-active", active);
      slide.toggleAttribute("inert", !active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    this.visited.add(index);
    this.segments.forEach((segment, i) => {
      segment.setAttribute("aria-current", String(i === index));
      segment.dataset.state = this.visited.has(i) ? "seen" : "new";
    });

    const prev = this.root.querySelector<HTMLButtonElement>(".prev");
    const next = this.root.querySelector<HTMLButtonElement>(".next");
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === this.slides.length - 1;

    const counter = this.root.querySelector(".counter b");
    if (counter) counter.textContent = String(index + 1);
    const live = this.root.querySelector(".sr-only");
    if (live && index !== this.current) {
      live.textContent =
        this.slides[index].getAttribute("aria-label") ?? `${index + 1}`;
    }

    this.current = index;
    if (updateHash) {
      history.replaceState(history.state, "", `#${this.deckId}-${index + 1}`);
    }
    if (focus) this.focus({ preventScroll: true });
  }

  private onKey(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const actions: Record<string, () => void> = {
      ArrowRight: () => this.go(this.current + 1),
      ArrowDown: () => this.go(this.current + 1),
      PageDown: () => this.go(this.current + 1),
      " ": () => this.go(this.current + (event.shiftKey ? -1 : 1)),
      ArrowLeft: () => this.go(this.current - 1),
      ArrowUp: () => this.go(this.current - 1),
      PageUp: () => this.go(this.current - 1),
      Home: () => this.go(0),
      End: () => this.go(this.slides.length - 1),
      f: () => this.toggleFullscreen(),
      F: () => this.toggleFullscreen(),
      Escape: () => this.collapse(),
    };
    const action = actions[event.key];
    if (!action) return;
    if (event.key === "Escape" && !this.hasAttribute("data-expanded")) return;
    event.preventDefault();
    action();
  }

  private onPointerUp(event: PointerEvent, viewport: HTMLElement) {
    const start = this.pointerStart;
    this.pointerStart = null;
    if (!start) return;
    const rotated = this.hasAttribute("data-rotated");
    const screenDx = event.clientX - start.x;
    const screenDy = event.clientY - start.y;
    const dx = rotated ? screenDy : screenDx;
    const dy = rotated ? screenDx : screenDy;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      this.go(this.current + (dx < 0 ? 1 : -1));
      return;
    }
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && event.pointerType === "mouse") {
      const { left, top, width, height } = viewport.getBoundingClientRect();
      const ratio = rotated
        ? (event.clientY - top) / height
        : (event.clientX - left) / width;
      this.go(this.current + (ratio < 0.3 ? -1 : 1), { focus: true });
    }
  }

  private isExpanded() {
    const doc = document as FullscreenDocument;
    return (
      (doc.fullscreenElement ?? doc.webkitFullscreenElement) === this ||
      this.hasAttribute("data-expanded")
    );
  }

  private toggleFullscreen() {
    const doc = document as FullscreenDocument;
    const host = this as FullscreenHost;
    if ((doc.fullscreenElement ?? doc.webkitFullscreenElement) === this) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
      return;
    }
    if (this.hasAttribute("data-expanded")) {
      this.collapse();
      return;
    }
    const request = host.requestFullscreen ?? host.webkitRequestFullscreen;
    if (request && document.fullscreenEnabled !== false) {
      Promise.resolve(request.call(host))
        .then(() => this.lockLandscape())
        .catch(() => this.expand());
    } else {
      this.expand();
    }
    this.focus({ preventScroll: true });
  }

  private lockLandscape() {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };
    orientation?.lock?.("landscape").catch(() => undefined);
  }

  private syncRotation() {
    const portrait = window.innerHeight > window.innerWidth;
    this.toggleAttribute("data-rotated", this.isExpanded() && portrait);
  }

  private expand() {
    this.setAttribute("data-expanded", "");
    document.documentElement.style.overflow = "hidden";
    this.syncFullscreenButton();
  }

  private collapse() {
    if (!this.hasAttribute("data-expanded")) return;
    this.removeAttribute("data-expanded");
    document.documentElement.style.overflow = "";
    this.syncFullscreenButton();
  }

  private syncFullscreenButton() {
    this.syncRotation();
    const button = this.root.querySelector(".fullscreen");
    const expanded = this.isExpanded();
    button?.setAttribute(
      "aria-label",
      expanded ? "Salir de pantalla completa" : "Pantalla completa",
    );
    button?.setAttribute("aria-pressed", String(expanded));
  }
}

if (!customElements.get("cd-slide-deck")) {
  customElements.define("cd-slide-deck", SlideDeckElement);
}
