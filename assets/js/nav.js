/**
 * Menu de navegação no celular.
 *
 * Abaixo de 1020px a navegação vira uma gaveta lateral, no padrão do design
 * system da marca: escurece o fundo com um véu, trava a rolagem da página,
 * fecha no Esc ou no clique fora e prende o Tab dentro da gaveta enquanto
 * ela estiver aberta.
 *
 * O 1020 aparece em três lugares que precisam andar juntos: o
 * `@media (max-width: 1020px)` e o `@media (min-width: 1021px)` em
 * componentes.css, e o matchMedia aqui embaixo. Ao mexer no menu, remeça o
 * cabeçalho também com as fontes de fallback: é esse o caso mais largo.
 */
(function () {
  const botao = document.getElementById("navToggle");
  const menu = document.getElementById("mainNav");
  const veu = document.getElementById("navScrim");
  if (!botao || !menu) return;

  function definirEstado(aberto) {
    menu.classList.toggle("open", aberto);
    botao.classList.toggle("open", aberto);
    document.body.classList.toggle("nav-aberto", aberto);
    botao.setAttribute("aria-expanded", aberto ? "true" : "false");
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    if (veu) veu.hidden = !aberto;
    if (aberto) {
      const primeiro = menu.querySelector("a");
      if (primeiro) primeiro.focus();
    }
  }

  function fechar(devolverFoco) {
    if (!menu.classList.contains("open")) return;
    definirEstado(false);
    if (devolverFoco) botao.focus();
  }

  botao.addEventListener("click", () => {
    definirEstado(!menu.classList.contains("open"));
  });

  // O véu cobre a página inteira: clicar nele é o "clique fora".
  if (veu) veu.addEventListener("click", () => fechar(false));

  // Ao escolher um destino, o menu sai da frente.
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => fechar(false));
  });

  document.addEventListener("keydown", (evento) => {
    if (!menu.classList.contains("open")) return;

    // Esc fecha e devolve o foco ao botão, para quem navega por teclado.
    if (evento.key === "Escape") {
      fechar(true);
      return;
    }

    // Enquanto a gaveta está aberta, o Tab circula dentro dela.
    if (evento.key !== "Tab") return;
    const focaveis = Array.from(menu.querySelectorAll("a, button"));
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    }
  });

  // Volta ao estado normal ao passar para o layout de desktop — senão a
  // trava de rolagem continua valendo com o menu já visível na barra.
  const desktop = matchMedia("(min-width: 1021px)");
  desktop.addEventListener("change", (evento) => {
    if (evento.matches) fechar(false);
  });
})();
