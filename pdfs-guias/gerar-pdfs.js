// Gera um PDF por guia publicado, com a identidade do portal e tipografia
// ampliada para leitura no celular (página estreita, formato 9:16).
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.join(__dirname, '..');
const SAIDA = process.argv[2] || __dirname;
const TEMA = process.argv[3] || 'dark';
const GUIAS = [
  ['guia-mercado.html', '1-guia-do-mercado'],
  ['comer-fora.html', '2-comer-fora-no-dia-a-dia'],
  ['refeicao-livre.html', '3-guia-da-refeicao-livre'],
  ['whey-protein.html', '4-whey-protein'],
];

// Largura de página ~ largura de um celular; a altura segue 9:16.
const LARGURA = 420;
const ALTURA = Math.round(LARGURA * 16 / 9);

const CSS = `
  html { font-size: 128% !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { background: var(--bg) !important; }
  @page { background: var(--bg); }
  .site-header, .nav-scrim, .instalar-banner, .pular-conteudo,
  .market-search, .empty-state, .theme-toggle, .nav-toggle { display: none !important; }
  [data-reveal], [data-reveal-cascata] > * { opacity: 1 !important; transform: none !important; transition: none !important; }
  * { animation: none !important; }
  .guide-layout { display: block !important; }
  .pdf-assinatura { display: flex; justify-content: flex-start; margin-bottom: 28px; }
  .pdf-assinatura .brand-nome { font-size: 1.2rem; }
  .pdf-assinatura .brand-cargo { font-size: .5rem; }
  h1, h2, h3, h4, .section-label { break-after: avoid; page-break-after: avoid; }
  p, li, .callout, .guide-block, .guide-defs > div, .market-subgroup h4, .product-chip, tr, .guide-note
    { break-inside: avoid; page-break-inside: avoid; }
  a { text-decoration: none; }
  .site-footer { break-inside: avoid; page-break-inside: avoid; margin-top: 40px !important; }
  /* Capa: assinatura, título, resumo e sumário ocupam a primeira página inteira. */
  .hero { min-height: ${ALTURA - 60}px; box-sizing: border-box; break-after: page; page-break-after: always; border-bottom: 0 !important; }
  .hero { padding-block: 20px 0 !important; }
  .hero .pdf-assinatura { margin-bottom: 22px; }
  .hero .eyebrow { display: none; }
  .hero .hero-lead { font-size: 1rem; line-height: 1.5; }
  .hero .guide-index { margin-top: 18px; padding: 14px 18px !important; }
  .hero .guide-index-title { margin-bottom: 8px !important; }
  .hero .guide-index a { padding-top: 2px !important; padding-bottom: 2px !important; line-height: 1.3; font-size: .8rem; }
  .article-section { padding-top: 8px !important; }
`;

// Rodapé de cada página: a assinatura em texto e a paginação. O template roda
// isolado da página, sem acesso às fontes dela, por isso usa fonte do sistema.
const RODAPE = `
  <div style="width:100%; padding:0 24px 10px; display:flex; justify-content:space-between;
              font-family: Helvetica, Arial, sans-serif; font-size:8px; letter-spacing:.16em;
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

  for (const [arquivo, nome] of GUIAS) {
    const page = await ctx.newPage();
    await page.emulateMedia({ media: 'screen' });
    await page.goto('file://' + path.join(RAIZ, arquivo), { waitUntil: 'load' });
    await page.addStyleTag({ content: CSS });
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
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const destino = path.join(SAIDA, `${nome}${TEMA === 'light' ? '-claro' : ''}.pdf`);
    await page.pdf({
      path: destino,
      width: LARGURA + 'px',
      height: ALTURA + 'px',
      printBackground: true,
      margin: { top: '26px', bottom: '40px', left: '0', right: '0' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: RODAPE,
    });
    console.log('ok', destino);
    await page.close();
  }
  await browser.close();
})();
