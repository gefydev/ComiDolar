// Flechas, puntos y aviso al lector de <Destacados />. El deslizamiento es el
// del navegador (scroll-snap). Se engancha en cada página que lo incluye.
const iniciar = () => {
  const carrusel = document.querySelector<HTMLElement>("[data-carrusel]");
  if (!carrusel) return;
  const pista = carrusel.querySelector<HTMLElement>(".carrusel-pista")!;
  const diapos = [...pista.children] as HTMLElement[];
  if (diapos.length < 2) return;
  const anuncio = carrusel.querySelector<HTMLElement>("[data-anuncio]")!;
  const puntos = [...carrusel.querySelectorAll<HTMLElement>("[data-ir]")];
  const flechas = [...carrusel.querySelectorAll<HTMLElement>("[data-paso]")];

  /** Cuánto hay que desplazar la pista para que quede esa diapositiva. */
  const posicion = (i: number) => diapos[i].offsetLeft - diapos[0].offsetLeft;
  const actual = () => {
    const distancias = diapos.map((_, i) =>
      Math.abs(posicion(i) - pista.scrollLeft),
    );
    return distancias.indexOf(Math.min(...distancias));
  };

  const marcar = (i: number) => {
    puntos.forEach((p, j) => {
      if (i === j) p.setAttribute("aria-current", "true");
      else p.removeAttribute("aria-current");
    });
    // aria-disabled y no disabled: el foco no se pierde en el extremo
    for (const f of flechas) {
      const destino = i + Number(f.dataset.paso);
      f.setAttribute(
        "aria-disabled",
        String(destino < 0 || destino >= diapos.length),
      );
    }
  };

  let elegida: number | null = null;
  const ir = (i: number) => {
    if (i < 0 || i >= diapos.length) return;
    elegida = i;
    marcar(i);
    // el movimiento es suave solo si no se pidió reducirlo (CSS)
    pista.scrollTo({ left: posicion(i) });
  };

  carrusel.addEventListener("click", (e) => {
    const boton = (e.target as Element).closest<HTMLElement>("button");
    if (!boton) return;
    if (boton.dataset.ir) ir(Number(boton.dataset.ir));
    else if (boton.dataset.paso)
      ir((elegida ?? actual()) + Number(boton.dataset.paso));
  });

  let anunciada = 0;
  let espera: ReturnType<typeof setTimeout>;
  pista.addEventListener(
    "scroll",
    () => {
      if (elegida === null) marcar(actual());
      clearTimeout(espera);
      espera = setTimeout(() => {
        elegida = null;
        const i = actual();
        marcar(i);
        if (i === anunciada) return;
        anunciada = i;
        anuncio.textContent = `Diapositiva ${diapos[i].getAttribute("aria-label")}`;
      }, 150);
    },
    { passive: true },
  );
  marcar(actual());
};

document.addEventListener("astro:page-load", iniciar);
