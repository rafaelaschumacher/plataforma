/**
 * Convite para adicionar o portal à tela de início do celular.
 *
 * Android/Chrome expõe o evento beforeinstallprompt e permite abrir o
 * diálogo nativo. O iOS não tem essa API: lá só dá para explicar o caminho
 * pelo menu Compartilhar. O banner respeita a dispensa — quem fecha, não
 * vê de novo.
 */
(function () {
  const CHAVE = "nrs:instalar-dispensado";
  const banner = document.getElementById("instalarBanner");
  if (!banner) return;

  const instrucao = document.getElementById("instalarInstrucao");
  const acao = document.getElementById("instalarAcao");
  const depois = document.getElementById("instalarDepois");
  const fechar = document.getElementById("instalarFechar");

  let promptAdiado = null;

  function jaInstalado() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function foiDispensado() {
    try {
      return localStorage.getItem(CHAVE) === "1";
    } catch (erro) {
      // Navegação anônima pode bloquear o localStorage: seguimos sem lembrar.
      return false;
    }
  }

  function dispensar() {
    try {
      localStorage.setItem(CHAVE, "1");
    } catch (erro) {
      /* sem persistência, apenas esconde nesta visita */
    }
    esconder();
  }

  function mostrar() {
    banner.hidden = false;
    banner.setAttribute("data-visivel", "true");
  }

  function esconder() {
    banner.removeAttribute("data-visivel");
    banner.hidden = true;
  }

  function ehIOS() {
    return (
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !window.MSStream
    );
  }

  if (jaInstalado() || foiDispensado()) return;

  // Android e desktop: o navegador avisa quando a instalação é possível.
  window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();
    promptAdiado = evento;
    mostrar();
  });

  // iOS: não há API, então mostramos o caminho manual.
  if (ehIOS()) {
    instrucao.textContent =
      "Toque no botão Compartilhar do Safari e escolha “Adicionar à Tela de Início”.";
    acao.hidden = true;
    // Dá tempo de a pessoa ver a página antes de aparecer o convite.
    window.setTimeout(mostrar, 4000);
  }

  acao.addEventListener("click", async () => {
    if (!promptAdiado) return;
    promptAdiado.prompt();
    await promptAdiado.userChoice;
    promptAdiado = null;
    dispensar();
  });

  depois.addEventListener("click", dispensar);
  fechar.addEventListener("click", dispensar);

  window.addEventListener("appinstalled", dispensar);
})();
