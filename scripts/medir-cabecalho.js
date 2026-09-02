#!/usr/bin/env node
/**
 * medir-cabecalho.js — encontra a largura mínima do cabeçalho.
 *
 * O menu vira gaveta abaixo de um breakpoint, e esse número precisa ser
 * medido, não estimado: ao acrescentar ou tirar um link, o cabeçalho muda de
 * largura e o breakpoint pode ficar apertado demais. Como o CSS usa
 * `overflow-x: clip`, um cabeçalho que não cabe não gera barra de rolagem —
 * ele simplesmente empurra o botão de tema para fora da tela, sem aviso.
 *
 * O que o script faz: desliga as duas media queries da gaveta numa cópia
 * temporária do CSS, para o menu ficar em linha em qualquer largura, e depois
 * encolhe o viewport de 1px em 1px até a navegação ganhar uma segunda linha ou
 * o cabeçalho estourar. Mede duas vezes — com as fontes da marca e com elas
 * bloqueadas, porque Georgia e a sans do sistema são mais largas e é esse o
 * caso que manda.
 *
 * Uso:
 *   node scripts/medir-cabecalho.js
 *
 * Precisa do Playwright disponível (NODE_PATH, ou instalado no projeto).
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const PAGINA = "index.html";

/** Copia o site para uma pasta temporária com a gaveta desligada. */
function prepararCopia() {
  const destino = fs.mkdtempSync(path.join(os.tmpdir(), "medir-cabecalho-"));
  for (const item of ["index.html", "assets"]) {
    fs.cpSync(path.join(RAIZ, item), path.join(destino, item), { recursive: true });
  }

  const cssPath = path.join(destino, "assets", "css", "componentes.css");
  const css = fs
    .readFileSync(cssPath, "utf8")
    .replace(/@media \(max-width: \d+px\)(?=[\s\S]{0,80}\.nav-toggle)/, "@media (max-width: 1px)")
    .replace(/@media \(min-width: \d+px\)(?=[\s\S]{0,80}\.nav-scrim)/, "@media (min-width: 2px)");
  fs.writeFileSync(cssPath, css);

  return destino;
}

async function medir(chromium, arquivo, bloquearFontes) {
  const contexto = await chromium.newContext({ viewport: { width: 1400, height: 900 } });
  const pagina = await contexto.newPage();
  if (bloquearFontes) await pagina.route("**/*.woff2", (rota) => rota.abort());

  await pagina.goto("file://" + arquivo);
  if (!bloquearFontes) await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(300);

  const alturaBase = await pagina.evaluate(
    () => document.querySelector(".main-nav").getBoundingClientRect().height
  );

  let quebra = null;
  for (let largura = 1400; largura >= 400; largura -= 1) {
    await pagina.setViewportSize({ width: largura, height: 900 });
    const naoCoube = await pagina.evaluate((altura) => {
      const menu = document.querySelector(".main-nav");
      const interno = document.querySelector(".header-inner");
      return (
        menu.getBoundingClientRect().height > altura + 2 ||
        interno.scrollWidth > interno.clientWidth + 1
      );
    }, alturaBase);
    if (naoCoube) {
      quebra = largura;
      break;
    }
  }

  await contexto.close();
  return quebra === null ? null : quebra + 1;
}

(async () => {
  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch (erro) {
    console.error("Playwright não encontrado. Rode com NODE_PATH apontando para ele.");
    process.exit(1);
  }

  const copia = prepararCopia();
  const arquivo = path.join(copia, PAGINA);
  const navegador = await chromium.launch();

  // Conta só os links de dentro da <nav>, não a assinatura nem o "pular".
  const cabecalho = fs.readFileSync(
    path.join(RAIZ, "assets", "layout", "header.html"),
    "utf8"
  );
  const menu = cabecalho.match(/<nav class="main-nav"[\s\S]*?<\/nav>/);
  const links = menu ? menu[0].match(/<a\b/g) : null;

  console.log(`\n  Menu com ${links ? links.length : "?"} links.\n`);

  for (const [rotulo, bloquear] of [
    ["fontes da marca", false],
    ["fontes de fallback", true],
  ]) {
    const minimo = await medir(navegador, arquivo, bloquear);
    console.log(`  ${rotulo.padEnd(20)} cabe a partir de ${minimo}px`);
  }

  console.log(
    "\n  É a segunda linha que manda. O breakpoint da gaveta precisa ficar\n" +
      "  acima dela, com folga. Ao mexer nele, ajuste os três lugares que\n" +
      "  andam juntos — ver docs/design-system.md.\n"
  );

  await navegador.close();
  fs.rmSync(copia, { recursive: true, force: true });
})();
