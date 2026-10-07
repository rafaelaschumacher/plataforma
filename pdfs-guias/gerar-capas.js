// Exporta a capa de cada guia (e do caderno) como imagem PNG em alta
// resolução, idêntica à capa dos PDFs. Uso: node gerar-capas.js <pasta>
// As capas saem em A4 com 3x a densidade (2382 × 3369 px).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { LARGURA, ALTURA, CSS_CAPA } = require('./comum');

const SAIDA = process.argv[2] || path.join(__dirname, 'capas');
const ESCALA = 3;

// Mesma lista de títulos de gerar-pdfs.js, lida do próprio arquivo para não
// duplicar os textos das capas.
const fonte = fs.readFileSync(path.join(__dirname, 'gerar-pdfs.js'), 'utf8');
const CAPAS = [...fonte.matchAll(/\['[^']+\.html', '([^']+)', '([^']+)', '([^']+)', '([^']+)'\]/g)]
  .map((m) => m.slice(1));
CAPAS.push(['caderno-de-registros', 'Caderno de', 'registros', 'Para perceber seus padrões e mudar hábitos com mais leveza']);

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA }, deviceScaleFactor: ESCALA });
  for (const [nome, inicio, grifo, frase] of CAPAS) {
    // Carrega uma página do portal para ter os tokens, as fontes e o selo da marca.
    await page.goto('file://' + path.join(__dirname, '..', 'guias.html'), { waitUntil: 'load' });
    await page.evaluate(({ inicio, grifo, frase }) => {
      document.documentElement.dataset.theme = 'light';
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
    }, { inicio, grifo, frase });
    await page.addStyleTag({ content: CSS_CAPA + 'html,body{overflow:hidden}' });
    await page.evaluate(() => document.fonts.ready);
    const destino = path.join(SAIDA, `capa-${nome.replace(/^\d-/, '')}.png`);
    await page.screenshot({ path: destino, clip: { x: 0, y: 0, width: LARGURA, height: ALTURA } });
    console.log('ok', destino);
  }
  await browser.close();
})();
