/**
 * Menu de navegação no celular.
 * Abre e fecha o menu, mantendo aria-expanded correto e permitindo
 * fechar com a tecla Esc ou clicando fora.
 */
(function () {
  const botao = document.getElementById("navToggle");
  const menu = document.getElementById("mainNav");
  if (!botao || !menu) return;

  function definirEstado(aberto) {
    menu.classList.toggle("open", aberto);
    botao.classList.toggle("open", aberto);
    botao.setAttribute("aria-expanded", aberto ? "true" : "false");
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  }

  function fechar(devolverFoco) {
    if (!menu.classList.contains("open")) return;
    definirEstado(false);
    if (devolverFoco) botao.focus();
  }

  botao.addEventListener("click", () => {
    definirEstado(!menu.classList.contains("open"));
  });

  // Ao escolher um destino, o menu sai da frente.
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => fechar(false));
  });

  // Esc fecha e devolve o foco ao botão, para quem navega por teclado.
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fechar(true);
  });

  // Clique fora também fecha.
  document.addEventListener("click", (evento) => {
    if (!menu.contains(evento.target) && !botao.contains(evento.target)) {
      fechar(false);
    }
  });
})();
