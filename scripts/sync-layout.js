#!/usr/bin/env node
/**
 * sync-layout.js — propaga <head>, cabeçalho e rodapé para todas as páginas.
 *
 * Por que um script em vez de injetar por JavaScript no navegador:
 * o HTML publicado continua estático e completo. A navegação existe no
 * documento mesmo com JS desligado, não há salto de layout enquanto o script
 * carrega, e leitores de tela encontram o menu de imediato. Este arquivo roda
 * só em tempo de edição — o site publicado não depende dele.
 *
 * Uso:
 *   node scripts/sync-layout.js            aplica o layout nas páginas
 *   node scripts/sync-layout.js --check    só verifica se algo está fora de sincronia
 *
 * Como funciona: cada página tem blocos delimitados por marcadores HTML.
 * O script substitui o conteúdo entre eles, preservando todo o resto.
 *
 *   <!-- layout:head -->  ... gerado ...  <!-- /layout:head -->
 *   <!-- layout:header --> ... gerado ... <!-- /layout:header -->
 *   <!-- layout:footer --> ... gerado ... <!-- /layout:footer -->
 */

const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const PASTA_LAYOUT = path.join(RAIZ, "assets", "layout");

/** Endereço público do site. Trocar aqui se um dia houver domínio próprio. */
const BASE = "https://rafaschumacherr.github.io/consultoria-online";

/** Imagem padrão de compartilhamento (WhatsApp, Instagram, redes). */
const OG_PADRAO = "assets/img/og/og-default.jpg";

/**
 * Metadados de cada página. É a fonte única de título, descrição e imagem
 * de compartilhamento — não edite essas tags direto no HTML, elas são
 * regeradas a cada execução.
 *
 * nav: valor do data-nav do link que deve ficar marcado como página atual.
 */
const PAGINAS = {
  "index.html": {
    nav: null,
    titulo: "Rafaela Schumacher · Consultoria online nutricional",
    tituloOg: "Sua área de apoio · Rafaela Schumacher",
    descricao:
      "Área de apoio às pacientes da consultoria: calculadora de substituição, guia do mercado, orientações e guia da refeição livre.",
  },
  "calculadora.html": {
    nav: "calculadora",
    titulo: "Calculadora de substituição · Rafaela Schumacher",
    descricao:
      "Consulte a quantidade indicada na sua prescrição, escolha o alimento que quer trocar e veja quanto consumir de outra opção equivalente.",
  },
  "orientacoes-gerais.html": {
    nav: "orientacoes-gerais",
    titulo: "Como colocar seu plano em prática · Rafaela Schumacher",
    descricao:
      "O que realmente faz diferença no dia a dia: saber pesar, se organizar, entender o seu plano e não transformar cada imprevisto em um problema.",
  },
  "refeicao-livre.html": {
    nav: "refeicao-livre",
    titulo: "Guia da refeição livre · Rafaela Schumacher",
    descricao:
      "Sugestões prontas de refeição livre por tipo de programa, com orientações para antes, durante e depois.",
  },
  "guia-mercado.html": {
    nav: "guia-mercado",
    titulo: "Guia do mercado · Rafaela Schumacher",
    descricao:
      "Como ler rótulos e listas de ingredientes, com sugestões de marcas para facilitar suas escolhas na hora da compra.",
  },
};

/** Monta o <head> completo de uma página. */
function montarHead(arquivo, meta) {
  const url = arquivo === "index.html" ? `${BASE}/` : `${BASE}/${arquivo}`;
  const imagem = `${BASE}/${meta.og || OG_PADRAO}`;
  const tituloOg = meta.tituloOg || meta.titulo;

  return `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.titulo}</title>
  <meta name="description" content="${meta.descricao}" />
  <meta name="author" content="Rafaela Schumacher" />
  <link rel="canonical" href="${url}" />

  <!-- Compartilhamento (WhatsApp, Instagram, redes) -->
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="Rafaela Schumacher · Consultoria online" />
  <meta property="og:title" content="${tituloOg}" />
  <meta property="og:description" content="${meta.descricao}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${imagem}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Rafaela Schumacher — consultoria online nutricional" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${tituloOg}" />
  <meta name="twitter:description" content="${meta.descricao}" />
  <meta name="twitter:image" content="${imagem}" />

  <!-- Ícones e instalação -->
  <link rel="icon" href="favicon.ico" sizes="32x32" />
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
  <link rel="manifest" href="manifest.json" />
  <meta name="theme-color" content="#fbf9f6" />
  <meta name="apple-mobile-web-app-title" content="Nutri Rafaela" />

  <!-- Tipografia auto-hospedada: sem conexão externa no caminho crítico -->
  <link rel="preload" href="assets/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin />

  <!-- Estilos -->
  <link rel="stylesheet" href="assets/css/fontes.css" />
  <link rel="stylesheet" href="assets/css/tokens.css" />
  <link rel="stylesheet" href="assets/css/base.css" />
  <link rel="stylesheet" href="assets/css/componentes.css" />
  <link rel="stylesheet" href="assets/css/paginas.css" />`;
}

/** Marca o link da página atual no cabeçalho. */
function marcarNavegacao(html, nav) {
  return html.replace(
    /<a href="([^"]+)" data-nav="([^"]+)">/g,
    (linhaInteira, href, chave) =>
      chave === nav
        ? `<a href="${href}" data-nav="${chave}" class="active" aria-current="page">`
        : linhaInteira
  );
}

/** Substitui o conteúdo entre <!-- layout:X --> e <!-- /layout:X -->. */
function substituirBloco(html, nome, conteudo, arquivo) {
  const marcador = new RegExp(
    `([ \\t]*)<!-- layout:${nome} -->[\\s\\S]*?<!-- /layout:${nome} -->`
  );

  if (!marcador.test(html)) {
    throw new Error(
      `Marcador "layout:${nome}" não encontrado em ${arquivo}. ` +
        `Adicione <!-- layout:${nome} --><!-- /layout:${nome} --> na posição desejada.`
    );
  }

  return html.replace(
    marcador,
    (_, recuo) =>
      `${recuo}<!-- layout:${nome} -->\n${conteudo}\n${recuo}<!-- /layout:${nome} -->`
  );
}

function main() {
  const apenasVerificar = process.argv.includes("--check");

  const header = fs.readFileSync(path.join(PASTA_LAYOUT, "header.html"), "utf8").trim();
  const footer = fs.readFileSync(path.join(PASTA_LAYOUT, "footer.html"), "utf8").trim();

  let desatualizados = 0;

  for (const [arquivo, meta] of Object.entries(PAGINAS)) {
    const caminho = path.join(RAIZ, arquivo);
    const original = fs.readFileSync(caminho, "utf8");

    let html = original;
    html = substituirBloco(html, "head", montarHead(arquivo, meta), arquivo);
    html = substituirBloco(html, "header", marcarNavegacao(header, meta.nav), arquivo);
    html = substituirBloco(html, "footer", footer, arquivo);

    if (html === original) {
      console.log(`  em dia    ${arquivo}`);
      continue;
    }

    desatualizados += 1;

    if (apenasVerificar) {
      console.log(`  DESATUAL. ${arquivo}`);
    } else {
      fs.writeFileSync(caminho, html);
      console.log(`  aplicado  ${arquivo}`);
    }
  }

  if (apenasVerificar && desatualizados > 0) {
    console.error(
      `\n${desatualizados} página(s) fora de sincronia. Rode: node scripts/sync-layout.js`
    );
    process.exit(1);
  }

  console.log(
    `\n${Object.keys(PAGINAS).length} páginas verificadas.` +
      (apenasVerificar ? "" : ` ${desatualizados} atualizada(s).`)
  );
}

main();
