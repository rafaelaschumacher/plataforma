// Gera um PDF por guia publicado, com a identidade do portal e tipografia
// ampliada para leitura no celular, em folha A4.
// Depois de gerar, rode comprimir.py para reduzir o tamanho e juntar os guias.
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.join(__dirname, '..');
const SAIDA = process.argv[2] || __dirname;
// Padrão aprovado pela Rafaela em 01/10/2026: tema claro, letra encorpada.
const TEMA = process.argv[3] || 'light';
// 'forte': variante de leitura com letra maior e mais encorpada (corpo em 400,
// destaques em 500, títulos em 400), para quem lê no celular com dificuldade.
const FORTE = process.argv[4] !== 'leve';
// [página, nome do arquivo, capa: início do título, grifo dourado, frase]
const GUIAS = [
  ['guia-mercado.html', '1-guia-do-mercado', 'Guia para o', 'mercado', 'O que colocar no carrinho para a semana'],
  ['comer-fora.html', '2-comer-fora-no-dia-a-dia', 'Guia para', 'comer fora', 'Como escolher no cardápio sem travar'],
  ['refeicao-livre.html', '3-guia-da-refeicao-livre', 'Guia de', 'refeição livre', 'Como comer o que você gosta sem bagunçar a semana'],
  ['whey-protein.html', '4-whey-protein', 'Guia de', 'whey protein', 'Como ler o rótulo e escolher a marca'],
];


// Folha A4 (210 × 297 mm = 794 × 1123 px), o formato em que materiais de
// paciente costumam circular. O corpo fica em ~13,5 pt: um pouco acima do
// usual em PDFs de nutrição (9–11 pt), para ler no celular sem zoom.
const LARGURA = 794;
const ALTURA = 1123;

// Capa: página inteira no painel escuro da marca (escuro nos dois temas),
// com selo, título com grifo dourado, filete e assinatura. Sai num PDF à
// parte, sem margem nem número de página; comprimir.py junta na frente.
const CSS_CAPA = `
  @page { margin: 0; }
  html, body { margin: 0; padding: 0; background: #100F0C; }
  .capa {
    box-sizing: border-box; width: ${LARGURA}px; height: ${ALTURA}px;
    background: var(--panel-grad); color: var(--panel-text);
    display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    padding: 96px 80px 72px; text-align: center;
  }
  .capa-selo { width: 92px; height: 92px; color: var(--gold-on-panel); }
  .capa-meio { display: flex; flex-direction: column; align-items: center; }
  .capa h1 {
    margin: 0; font-family: var(--fonte-titulo); font-weight: 400; font-size: 64px;
    line-height: 1.12; letter-spacing: -0.005em; color: var(--panel-text);
  }
  .capa h1 em { display: block; font-style: italic; font-weight: 400; color: var(--gold-on-panel); }
  .capa-filete { width: 64px; height: 1px; background: var(--gold-on-panel); margin: 40px 0 32px; opacity: .8; }
  .capa-frase {
    margin: 0; max-width: 460px; font-family: var(--fonte-corpo); font-weight: 400;
    font-size: 19px; line-height: 1.5; color: var(--panel-muted);
  }
  .capa-assinatura {
    margin: 0; font-family: var(--fonte-corpo); font-weight: 400; font-size: 12px;
    letter-spacing: .32em; text-transform: uppercase; color: var(--panel-muted);
  }
`;

const CSS = `
  html { font-size: 116% !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { background: var(--bg) !important; }
  @page { background: var(--bg); }
  .site-header, .nav-scrim, .instalar-banner, .pular-conteudo,
  .market-search, .empty-state, .theme-toggle, .nav-toggle { display: none !important; }
  [data-reveal], [data-reveal-cascata] > * { opacity: 1 !important; transform: none !important; transition: none !important; }
  * { animation: none !important; }
  .container { padding-inline: 56px !important; }
  .guide-layout { display: block !important; }
  .pdf-assinatura { display: flex; justify-content: flex-start; margin-bottom: 64px; }
  h1, h2, h3, h4, .section-label { break-after: avoid; page-break-after: avoid; }
  p, li, .callout, .guide-block, .guide-defs > div, .market-subgroup h4, .product-chip, .product-card, tr, .guide-note, .meal-card
    { break-inside: avoid; page-break-inside: avoid; }
  a { text-decoration: none; }
  .site-footer { break-inside: avoid; page-break-inside: avoid; margin-top: 48px !important; }
  /* Capa: assinatura, título, resumo e sumário ocupam a primeira página inteira. */
  .hero { min-height: ${ALTURA - 110}px; box-sizing: border-box; break-after: page; page-break-after: always;
          border-bottom: 0 !important; padding-block: 48px 0 !important; }
  .hero h1 { font-size: 3.2rem; }
  .hero .guide-index { margin-top: 56px; max-width: 520px; }
  .article-section { padding-top: 16px !important; }

  /* ---- Diagramação de PDF, não de site ----
     No site, cada bloco é um card que a pessoa rola. No papel, um card alto
     acaba partido entre duas páginas. Aqui: cada seção abre página nova, os
     cards de conteúdo viram blocos separados por um fio, e nada que seja uma
     unidade de leitura (bloco, destaque, card de produto ou de refeição) é
     dividido entre páginas. */
  .guide-section { break-before: page; page-break-before: always; margin: 0 !important; }
  .section-label { margin-bottom: 28px !important; }
  .guide-content > .guide-note { break-before: page; page-break-before: always; }
  .info-card:not(.meal-card) {
    background: none !important; border: 0 !important; box-shadow: none !important;
    border-radius: 0 !important; padding: 0 !important; margin: 0 0 36px !important;
  }
  .info-card:not(.meal-card) + .info-card:not(.meal-card),
  .info-grid > .info-card + .info-card {
    border-top: 1px solid var(--cor-borda) !important; padding-top: 30px !important;
  }
  .info-grid { display: block !important; }
  .guide-intro p { font-size: 1.08rem; color: var(--cor-texto); }
  .info-card h3 { font-size: 1.7rem; margin-bottom: 14px; }
  h3, h4, .section-label, .guide-list-title, .market-subgroup > h4 { break-after: avoid; page-break-after: avoid; }
  h3 + p, h4 + p, h4 + ul, h4 + ol, .market-subgroup > h4 + * { break-before: avoid; page-break-before: avoid; }
  p { orphans: 3; widows: 3; }
  .guide-block, .guide-defs > div, .callout, .guide-note, .meal-card, .product-card,
  .table-wrapper, table, ol, .info-grid > .info-card { break-inside: avoid; page-break-inside: avoid; }
  .meal-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
  .product-grid--fotos { grid-template-columns: repeat(5, 1fr) !important; gap: 10px !important; }
  .product-card figcaption { font-size: .78rem !important; padding: 6px 8px 8px !important; }
  .guide-note { margin-top: 0 !important; }
  /* Grupos de produtos cabem numa página: título e fotos ficam juntos. */
  .market-subgroup { break-inside: avoid; page-break-inside: avoid; }
  /* Destaque e frase final ficam com o texto que comentam, nunca sozinhos. */
  p + .callout, .callout + p, .info-card > p:last-child { break-before: avoid; page-break-before: avoid; }
`;

// Rodapé de cada página: a assinatura em texto e a paginação. O template roda
// isolado da página, sem acesso às fontes dela, por isso usa fonte do sistema.
const CSS_FORTE = `
  html { font-size: 130% !important; }
  body, p, li, td, figcaption, .product-chip, .hero-lead { font-weight: 400 !important; }
  strong, b, .info-card h4, .market-subgroup h4, .section-label, .guide-note-label { font-weight: 500 !important; }
  h1, h2, h3, .brand-nome, em { font-weight: 400 !important; }
  .product-card figcaption { color: var(--cor-texto) !important; }
`;

const RODAPE = `
  <div style="width:100%; padding:0 56px 14px; display:flex; justify-content:space-between;
              font-family: Helvetica, Arial, sans-serif; font-size:10px; letter-spacing:.16em;
              text-transform:uppercase; color:#A79C8B;">
    <span>Rafaela Schumacher · Nutricionista</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: LARGURA, height: ALTURA },
    reducedMotion: 'reduce',
  });
  await ctx.addInitScript((tema) => {
    try { localStorage.setItem('tema', tema); localStorage.setItem('instalar-dispensado', '1'); } catch (e) {}
  }, TEMA);

  for (const [arquivo, nome, capaInicio, capaGrifo, capaFrase] of GUIAS) {
    const page = await ctx.newPage();
    await page.emulateMedia({ media: 'screen' });
    await page.goto('file://' + path.join(RAIZ, arquivo), { waitUntil: 'load' });
    await page.addStyleTag({ content: CSS + (FORTE ? CSS_FORTE : '') });
    await page.evaluate((tema) => {
      document.documentElement.dataset.theme = tema;
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('visivel'));
      // Assinatura da marca (selo + nome + cargo) no topo, como no header do portal.
      const brand = document.querySelector('.site-footer .brand');
      const hero = document.querySelector('.hero-inner');
      if (brand && hero) {
        const topo = document.createElement('div');
        topo.className = 'pdf-assinatura';
        topo.appendChild(brand.cloneNode(true));
        hero.prepend(topo);
      }
      // O índice "Nesta página" vira o sumário da capa, com links internos.
      const indice = document.querySelector('.guide-index');
      if (indice && hero) hero.appendChild(indice);
      document.querySelectorAll('details').forEach((d) => (d.open = true));
    }, TEMA);
    // As fotos de produto carregam sob demanda na página; no PDF não há
    // rolagem, então todas são carregadas antes de imprimir.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.removeAttribute('loading'));
      await Promise.all([...document.images].map((i) =>
        i.complete && i.naturalWidth ? 0 : new Promise((r) => { i.onload = i.onerror = r; })));
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const destino = path.join(SAIDA, `${nome}${TEMA === 'dark' ? '-escuro' : ''}${FORTE ? '' : '-letra-fina'}.pdf`);
    await page.pdf({
      path: destino,
      width: LARGURA + 'px',
      height: ALTURA + 'px',
      printBackground: true,
      margin: { top: '40px', bottom: '52px', left: '0', right: '0' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: RODAPE,
    });
    console.log('ok', destino);

    // Capa, na mesma página já carregada (tokens e fontes da marca prontos).
    await page.evaluate(({ inicio, grifo, frase }) => {
      const selo = document.querySelector('.brand-selo').innerHTML;
      document.body.innerHTML = `
        <div class="capa">
          <div class="capa-selo">${selo}</div>
          <div class="capa-meio">
            <h1>${inicio}<em>${grifo}</em></h1>
            <div class="capa-filete"></div>
            <p class="capa-frase">${frase}</p>
          </div>
          <p class="capa-assinatura">Rafaela Schumacher · Nutricionista</p>
        </div>`;
    }, { inicio: capaInicio, grifo: capaGrifo, frase: capaFrase });
    await page.addStyleTag({ content: CSS_CAPA });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: path.join(path.dirname(destino), '_capa-' + path.basename(destino)),
      width: LARGURA + 'px',
      height: ALTURA + 'px',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    await page.close();
  }
  await browser.close();
})();
