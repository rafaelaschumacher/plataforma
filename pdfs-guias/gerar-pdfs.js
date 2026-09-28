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
  .guide-index, .market-search, .empty-state, .theme-toggle, .nav-toggle { display: none !important; }
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
`;

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
      margin: { top: '26px', bottom: '26px', left: '0', right: '0' },
    });
    console.log('ok', destino);
    await page.close();
  }
  await browser.close();
})();
