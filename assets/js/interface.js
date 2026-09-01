/**
 * Acabamento visual da página: contorno do cabeçalho ao rolar e revelação
 * dos blocos de conteúdo.
 *
 * Nenhum dos dois altera conteúdo ou comportamento — se o script não rodar,
 * a página continua completa: o cabeçalho fica sem sombra e os blocos
 * aparecem normalmente (o CSS força `opacity: 1` sempre que a revelação não
 * puder acontecer).
 */
(function () {
  const cabecalho = document.getElementById("siteHeader");
  const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Cabeçalho ganha contorno depois de sair do topo ---------- */
  if (cabecalho) {
    let agendado = false;

    const aoRolar = () => {
      cabecalho.classList.toggle("is-stuck", window.scrollY > 8);
      agendado = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!agendado) {
          agendado = true;
          requestAnimationFrame(aoRolar);
        }
      },
      { passive: true }
    );

    aoRolar();
  }

  /* ---------- Revelação ao rolar ----------
     Quem pediu menos movimento, ou usa um navegador sem
     IntersectionObserver, recebe tudo visível de imediato. */
  const blocos = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!blocos.length) return;

  if (semMovimento || !("IntersectionObserver" in window)) {
    blocos.forEach((bloco) => bloco.classList.add("visivel"));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  blocos.forEach((bloco) => observador.observe(bloco));
})();
