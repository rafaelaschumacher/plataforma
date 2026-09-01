/**
 * Tema claro / escuro.
 *
 * Na marca o escuro é o tema principal e o claro é uma alternativa completa:
 * os dois são oficiais. A escolha vive no atributo `data-theme` do <html> e
 * é guardada em localStorage sob a chave "tema" — a mesma chave do site da
 * marca, para quem passa de um para o outro encontrar o tema que escolheu.
 *
 * Quem aplica o tema na carga é um script inline no <head> (gerado por
 * scripts/sync-layout.js), antes da primeira pintura. Este arquivo só cuida
 * do botão: se ele rodasse antes da pintura, a página piscaria no tema
 * errado ao carregar.
 */
(function () {
  const raiz = document.documentElement;
  const botao = document.getElementById("themeToggle");
  if (!botao) return;

  function sincronizarRotulo() {
    const escuro = raiz.dataset.theme !== "light";
    botao.setAttribute(
      "aria-label",
      escuro ? "Ativar tema claro" : "Ativar tema escuro"
    );
  }

  sincronizarRotulo();

  botao.addEventListener("click", () => {
    raiz.dataset.theme = raiz.dataset.theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem("tema", raiz.dataset.theme);
    } catch (erro) {
      /* localStorage bloqueado: o tema vale só para esta visita. */
    }
    sincronizarRotulo();
  });
})();
