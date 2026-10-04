// Gera o Caderno de registros (caderno-de-registros.pdf) a partir de
// caderno-de-registros.html, com a mesma capa e o mesmo rodapé dos guias.
// Depois de gerar, rode comprimir.py para juntar a capa na frente.
const path = require('path');
const { chromium } = require('playwright');
const { LARGURA, ALTURA, CSS_CAPA, RODAPE } = require('./comum');

const SAIDA = process.argv[2] || __dirname;
const NOME = 'caderno-de-registros.pdf';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA } });
  await page.emulateMedia({ media: 'screen' });
  await page.goto('file://' + path.join(__dirname, 'caderno-de-registros.html'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: path.join(SAIDA, NOME),
    width: LARGURA + 'px',
    height: ALTURA + 'px',
    printBackground: true,
    margin: { top: '48px', bottom: '56px', left: '0', right: '0' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: RODAPE,
  });

  // Capa, com o selo da marca que está escondido na própria página.
  await page.evaluate(() => {
    const selo = document.querySelector('.selo-fonte').innerHTML;
    document.body.innerHTML = `
      <div class="capa">
        <div class="capa-selo">${selo}</div>
        <div class="capa-meio">
          <h1>Caderno de<em>registros</em></h1>
          <div class="capa-filete"></div>
          <p class="capa-frase">Para perceber seus padrões e mudar hábitos com mais leveza</p>
        </div>
        <p class="capa-assinatura">Rafaela Schumacher · Nutricionista</p>
      </div>`;
  });
  await page.addStyleTag({ content: CSS_CAPA });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: path.join(SAIDA, '_capa-' + NOME),
    width: LARGURA + 'px',
    height: ALTURA + 'px',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  console.log('ok', path.join(SAIDA, NOME));
  await browser.close();
})();
