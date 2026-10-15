// Gera a Lista de substituições (lista-de-substituicoes.pdf) a partir dos
// mesmos dados e da mesma conta da calculadora do portal (assets/js/data.js e
// assets/js/app.js): uma página por grupo, com a quantidade de cada alimento
// que equivale à porção de referência do grupo.
// Depois de gerar, rode comprimir.py para juntar a capa na frente.
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');
const { LARGURA, ALTURA, CSS_CAPA, RODAPE } = require('./comum');

const RAIZ = path.join(__dirname, '..');
const SAIDA = process.argv[2] || __dirname;
const NOME = 'lista-de-substituicoes.pdf';

// Os dados da calculadora, lidos do próprio arquivo do portal: se um alimento
// mudar lá, a lista acompanha na próxima geração.
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(RAIZ, 'assets/js/data.js'), 'utf8') + '\nthis.GRUPOS = GRUPOS;', ctx);
const GRUPOS = ctx.GRUPOS;

// Organização de cada página: subgrupos em duas colunas, para a pessoa achar
// o alimento pelo tipo. 'larga' ocupa a largura toda, com a lista em duas
// colunas por dentro (frutas, que é um subgrupo grande só).
const PAGINAS = {
  carboidratos: [
    [['Pães e biscoitos', ['pao_frances', 'pao_forma_integral', 'pao_forma_tradicional', 'pao_sirio', 'cream_cracker', 'torrada', 'magic_toast', 'biscoito_arroz']],
     ['Raízes e tubérculos', ['batata_inglesa', 'batata_doce', 'mandioca', 'inhame']]],
    [['Arroz, massa e grãos', ['arroz_branco', 'arroz_integral', 'macarrao', 'quinoa', 'milho_verde']],
     ['Flocos e farinhas', ['aveia', 'granola', 'cuscuz', 'tapioca', 'farinha_mandioca']]],
  ],
  proteinas: [
    [['Carnes e aves', ['frango_grelhado', 'coxa_sobrecoxa', 'patinho_grelhado', 'alcatra_grelhada', 'carne_moida', 'lombo_suino']],
     ['Proteínas vegetais', ['tofu', 'pts']]],
    [['Peixes e frutos do mar', ['tilapia', 'salmao', 'atum_lata', 'camarao']],
     ['Ovos e frios', ['ovo_cozido', 'clara_ovo', 'peito_peru']]],
  ],
  gorduras: [
    [['Óleos e pastas', ['azeite', 'oleo_vegetal', 'margarina', 'pasta_amendoim']],
     ['Sementes', ['chia', 'linhaca']]],
    [['Castanhas e amendoim', ['castanha_para', 'castanha_caju', 'amendoas', 'nozes', 'amendoim']],
     ['Coco e abacate', ['coco_ralado', 'abacate']]],
  ],
  leguminosas: [
    [['Feijões', ['feijao_carioca', 'feijao_preto', 'feijao_branco', 'feijao_fradinho', 'fava']]],
    [['Lentilha, grão-de-bico e outros', ['lentilha', 'grao_bico', 'ervilha_seca', 'ervilha_fresca', 'soja_grao', 'homus']]],
  ],
  frutas: 'larga',
  laticinios: [
    [['Leites', ['leite_desnatado', 'leite_semidesnatado', 'leite_integral', 'leite_po_integral', 'leite_po_desnatado']],
     ['Queijos', ['queijo_minas', 'queijo_cottage', 'queijo_mucarela', 'queijo_prato']]],
    [['Iogurtes', ['iogurte_natural_desnatado', 'iogurte_natural_integral', 'iogurte_grego', 'iogurte_zero_gordura']],
     ['Cremosos para passar', ['requeijao_light', 'creme_ricota', 'creme_ricota_light']]],
  ],
  doces: [
    [['Para adoçar e passar', ['mel', 'melado_cana', 'doce_leite', 'doce_leite_zero', 'leite_condensado', 'goiabada', 'geleia_fruta', 'geleia_fruta_zero']],
     ['Cereais matinais', ['cereal_milho', 'mucilon']]],
    [['Chocolates e bombons', ['chocolate_ao_leite', 'chocolate_amargo', 'bombom', 'ferrero_rocher', 'trento']],
     ['Docinhos', ['brigadeiro', 'pacoca', 'suspiro']]],
  ],
};
const FRUTAS = [
  ['Frutas frescas', ['banana_prata', 'banana_nanica', 'abacaxi', 'ameixa_fresca', 'caqui', 'goiaba', 'kiwi', 'laranja', 'maca', 'mamao', 'manga', 'melancia', 'melao', 'morango', 'pera', 'tangerina', 'uva']],
  ['Frutas secas', ['ameixa_seca', 'uva_passa']],
];

const fmt = (n, casas = 0) => n.toLocaleString('pt-BR', { maximumFractionDigits: casas });
const unidade = (a) => a.unidade || 'g';

// A mesma conta da calculadora (app.js): kcal da porção de referência
// dividida pelas kcal do alimento, arredondada de 5 em 5 (mínimo 5).
function equivalente(grupo, alimento) {
  const base = grupo.alimentos.find((a) => a.id === grupo.baseId);
  if (alimento.id === base.id) return base.g;
  const kcalBase = (base.kcal * base.g) / 100;
  return Math.max(5, Math.round((kcalBase * 100) / alimento.kcal / 5) * 5);
}

// Confere que cada alimento da calculadora aparece uma vez, e só uma.
for (const grupo of GRUPOS) {
  const org = PAGINAS[grupo.id] === 'larga' ? [FRUTAS] : PAGINAS[grupo.id];
  if (!org) throw new Error('Grupo sem organização: ' + grupo.id);
  const usados = org.flat().flatMap(([, ids]) => ids);
  const ids = grupo.alimentos.map((a) => a.id);
  const faltam = ids.filter((id) => !usados.includes(id));
  const sobram = usados.filter((id) => !ids.includes(id));
  const repetidos = usados.filter((id, i) => usados.indexOf(id) !== i);
  if (faltam.length || sobram.length || repetidos.length)
    throw new Error(`${grupo.id}: faltam ${faltam} | não existem ${sobram} | repetidos ${repetidos}`);
}

function subgrupo(grupo, [titulo, ids], larga) {
  const linhas = ids.map((id) => {
    const a = grupo.alimentos.find((x) => x.id === id);
    const ref = id === grupo.baseId;
    return `<li${ref ? ' class="ref"' : ''}><span class="nome">${a.nome}</span>` +
      `<span class="qtd">${fmt(equivalente(grupo, a), 1)}&nbsp;${unidade(a)}</span></li>`;
  }).join('');
  return `<div class="sub${larga ? ' larga' : ''}"><h3>${titulo}</h3><ul>${linhas}</ul></div>`;
}

function paginaGrupo(grupo, i) {
  const base = grupo.alimentos.find((a) => a.id === grupo.baseId);
  const kcal = (base.kcal * base.g) / 100;
  const org = PAGINAS[grupo.id];
  const corpo = org === 'larga'
    ? FRUTAS.map((s) => subgrupo(grupo, s, true)).join('')
    : `<div class="colunas">${org.map((col) => `<div>${col.map((s) => subgrupo(grupo, s)).join('')}</div>`).join('')}</div>`;
  return `
  <section class="folha" id="${grupo.id}">
    <p class="rotulo"><span class="num">${String(i + 1).padStart(2, '0')}</span>Grupo ${i + 1} de ${GRUPOS.length}</p>
    <h2>${grupo.nome}</h2>
    <p class="desc">${grupo.descricao}</p>
    <div class="referencia">
      <p>Cada quantidade desta página equivale a <strong>${fmt(base.g, 1)} ${unidade(base)} de ${base.nome.toLowerCase()}</strong>
      <span class="kcal">(≈ ${fmt(kcal)} kcal)</span>. Troque um alimento por outro na quantidade indicada.</p>
    </div>
    ${corpo}
    ${grupo.id === 'gorduras' || grupo.id === 'doces'
      ? '<p class="rodape-grupo">Aqui as porções são pequenas e o arredondamento de 5 em 5 pesa mais: use o número como referência, não como medida fechada.</p>'
      : ''}
  </section>`;
}

// Exemplo da página de abertura, calculado com os dados reais.
const carbo = GRUPOS.find((g) => g.id === 'carboidratos');
const arroz = carbo.alimentos.find((a) => a.id === 'arroz_branco');
const batata = carbo.alimentos.find((a) => a.id === 'batata_doce');
const qArroz = equivalente(carbo, arroz);
const qBatata = equivalente(carbo, batata);
const pao = carbo.alimentos.find((a) => a.id === carbo.baseId);

const selo = fs.readFileSync(path.join(RAIZ, 'assets/layout/header.html'), 'utf8')
  .match(/<span class="brand-selo"[^>]*>(<svg[\s\S]*?<\/svg>)<\/span>/)[1];
const css = (f) => `<link rel="stylesheet" href="file://${path.join(RAIZ, 'assets/css', f)}" />`;

const HTML = `<!doctype html>
<html lang="pt-BR" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <title>Lista de substituições · Rafaela Schumacher</title>
  ${css('fontes.css')}${css('tokens.css')}${css('base.css')}
  <style>
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body { background: var(--bg); }
    @page { background: var(--bg); }
    body { margin: 0; font-weight: 400; font-size: 17px; line-height: 1.55; color: var(--cor-texto-corpo); }
    .selo-fonte { display: none; }
    .folha p, .folha li { max-width: none; }
    .folha { box-sizing: border-box; padding: 0 52px; break-before: page; page-break-before: always; }
    .folha:first-of-type { break-before: auto; page-break-before: auto; }
    a { color: inherit; text-decoration: none; }
    strong { color: var(--cor-texto); font-weight: 500; }
    h1, h2 { font-family: var(--fonte-titulo); font-weight: 400; color: var(--cor-texto); line-height: 1.1; margin: 0; }
    h1 { font-size: 50px; margin: 0 0 10px; }
    h1 em { font-style: italic; color: var(--cor-acento); }
    h2 { font-size: 50px; margin: 2px 0 6px; }

    .rotulo { display: flex; align-items: baseline; gap: 12px; margin: 0; font-size: 12.5px; font-weight: 500;
      letter-spacing: .2em; text-transform: uppercase; color: var(--cor-texto); }
    .rotulo .num { font-family: var(--fonte-titulo); font-size: 22px; letter-spacing: 0; color: var(--cor-acento); font-weight: 400; }
    .desc { margin: 0 0 22px; font-size: 17px; color: var(--cor-texto-suave); }

    .referencia { background: var(--gold-wash); border-left: 3px solid var(--cor-acento);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0; padding: 16px 22px; margin: 0 0 26px; }
    .referencia p { margin: 0; font-size: 17.5px; line-height: 1.5; color: var(--cor-texto); }
    .referencia .kcal { color: var(--cor-texto-suave); white-space: nowrap; }

    .colunas { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
    .colunas > div { display: flex; flex-direction: column; gap: 20px; }
    .sub { background: var(--cor-superficie); border: 1px solid var(--cor-borda); border-radius: var(--radius-md);
      padding: 16px 20px 8px; break-inside: avoid; page-break-inside: avoid; }
    .sub.larga { margin-bottom: 20px; }
    .sub h3 { margin: 0 0 6px; padding-bottom: 10px; border-bottom: 1px solid var(--cor-acento-borda);
      font-family: var(--fonte-corpo); font-size: 13px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: var(--cor-acento); }
    .sub ul { list-style: none; margin: 0; padding: 0; }
    .sub.larga ul { columns: 2; column-gap: 40px; }
    .sub li { display: flex; justify-content: space-between; align-items: baseline; gap: 14px;
      padding: 8px 0; border-bottom: 1px solid var(--cor-borda); break-inside: avoid; }
    .sub li:last-child { border-bottom: 0; }
    .sub.larga li:last-child { border-bottom: 1px solid var(--cor-borda); }
    .nome { font-size: 17.5px; line-height: 1.3; color: var(--cor-texto); }
    .qtd { flex: none; font-size: 18px; font-weight: 500; color: var(--cor-texto); font-variant-numeric: tabular-nums; }
    /* O alimento de referência do grupo: linha com fundo dourado. */
    .sub li.ref { background: var(--gold-wash); margin: 0 -10px; padding-inline: 10px; border-radius: var(--radius-sm); }
    .ref .qtd { color: var(--cor-acento); }
    .rodape-grupo { margin: 22px 0 0; font-size: 14px; color: var(--cor-texto-suave); }

    /* abertura */
    .assinatura { display: flex; align-items: center; gap: 12px; margin: 0 0 28px; }
    .assinatura .s { width: 40px; height: 40px; color: var(--cor-acento); }
    .assinatura .n { font-family: var(--fonte-titulo); font-size: 22px; color: var(--cor-texto); line-height: 1; }
    .assinatura .n em { font-style: italic; color: var(--cor-acento); }
    .assinatura .c { display: block; margin-top: 4px; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--cor-texto-suave); }
    .eyebrow { margin: 0 0 14px; font-size: 12.5px; font-weight: 500; letter-spacing: .2em; text-transform: uppercase; color: var(--cor-acento); }
    .lead { margin: 0 0 22px; font-size: 18.5px; color: var(--cor-texto-corpo); }
    .passos { list-style: none; margin: 0 0 26px; padding: 0; counter-reset: p; }
    .passos li { counter-increment: p; position: relative; padding: 0 0 10px 50px; font-size: 17px; line-height: 1.5; }
    .passos li::before { content: counter(p); position: absolute; left: 0; top: -4px; width: 34px; height: 34px; border-radius: 50%;
      border: 1px solid var(--cor-acento-borda); display: grid; place-items: center;
      font-family: var(--fonte-titulo); font-size: 20px; color: var(--cor-acento); }
    .passos b { display: block; font-weight: 500; color: var(--cor-texto); }
    .exemplo { background: var(--cor-superficie); border: 1px solid var(--cor-borda); border-radius: var(--radius-md);
      padding: 16px 22px; margin: 6px 0 20px; font-size: 16.5px; }
    .exemplo .rot, .indice .rot { margin: 0 0 8px; font-size: 12px; font-weight: 500; letter-spacing: .16em; text-transform: uppercase; color: var(--cor-acento); }
    .exemplo p { margin: 0 0 6px; }
    .exemplo p:last-child { margin: 0; }
    .indice { display: grid; grid-template-columns: repeat(4, auto); justify-content: space-between; gap: 0 20px; margin: 0; padding: 0; list-style: none; }
    .indice-bloco { border-top: 1px solid var(--cor-borda); padding-top: 18px; }
    .indice li a { display: flex; gap: 12px; align-items: baseline; padding: 7px 0; font-size: 17.5px; color: var(--cor-texto); }
    .indice li span { font-family: var(--fonte-titulo); font-size: 19px; color: var(--cor-acento); min-width: 22px; }
    .aviso { margin: 12px 0 0; font-size: 13.5px; line-height: 1.55; color: var(--cor-texto-suave); }
  </style>
</head>
<body>
  <div class="selo-fonte">${selo}</div>
  <section class="folha">
    <div class="assinatura"><span class="s">${selo}</span>
      <span><span class="n">Rafaela <em>Schumacher</em></span><span class="c">Nutricionista</span></span></div>
    <p class="eyebrow">Acompanhamento nutricional</p>
    <h1>Lista de <em>substituições</em></h1>
    <p class="lead">Para trocar um alimento do seu plano por outro do mesmo grupo, na quantidade certa, sem precisar fazer conta.</p>
    <ol class="passos">
      <li><b>Troque dentro do mesmo grupo e na mesma refeição.</b>Cada página é um grupo. É isso que mantém a estratégia do seu plano de pé.</li>
      <li><b>Todas as quantidades de uma página valem o mesmo.</b>Qualquer alimento pode entrar no lugar de outro da mesma página, na quantidade que está ao lado dele.</li>
      <li><b>Se o seu plano traz o dobro, use o dobro.</b>Veja quantas vezes a quantidade do seu plano cabe na quantidade da lista e multiplique a opção nova pelo mesmo número.</li>
      <li><b>Se a troca for virar rotina, me chama.</b>Alimentos do mesmo grupo variam em fibra, saciedade e volume. Uma troca pontual não muda nada; uma frequente, eu ajusto no plano.</li>
    </ol>
    <div class="exemplo">
      <p class="rot">Exemplo</p>
      <p>Na página de carboidratos, <strong>${fmt(qArroz)} g de arroz branco cozido</strong> equivalem a <strong>${fmt(qBatata)} g de batata doce cozida</strong>.</p>
      <p>Se o seu plano indica <strong>${fmt(qArroz * 2)} g de arroz</strong> (duas vezes ${fmt(qArroz)} g), a troca é por <strong>${fmt(qBatata * 2)} g de batata doce</strong>.</p>
    </div>
    <div class="indice-bloco">
      <p class="rot" style="margin:0 0 6px;font-size:12px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--cor-acento)">Grupos</p>
      <ul class="indice">
        ${GRUPOS.map((g, i) => `<li><a href="#${g.id}"><span>${String(i + 1).padStart(2, '0')}</span>${g.nome}</a></li>`).join('')}
      </ul>
    </div>
    <p class="aviso">As quantidades são arredondadas de 5 em 5, para facilitar a medida. Quando a quantidade do seu plano não for um múltiplo simples, use a <a href="https://rafaelaschumacher.github.io/plataforma/calculadora.html"><strong>calculadora de substituição</strong></a> do portal: ela usa os mesmos valores e faz a conta exata.
    Valores de referência: TACO (NEPA/UNICAMP), TBCA (USP) e, quando indicado, rótulos de fabricantes. Podem variar com o preparo, a marca e o tamanho do alimento.</p>
  </section>
  ${GRUPOS.map(paginaGrupo).join('')}
</body>
</html>`;

(async () => {
  const arquivo = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'subst-')), 'lista.html');
  fs.writeFileSync(arquivo, HTML);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA } });
  await page.emulateMedia({ media: 'screen' });
  await page.goto('file://' + arquivo, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  // Cada folha precisa caber numa página: confere antes de imprimir.
  const UTIL = ALTURA - 48 - 56;
  const alturas = await page.$$eval('.folha', (fs) => fs.map((f) => [f.id || 'abertura', Math.ceil(f.getBoundingClientRect().height)]));
  for (const [id, h] of alturas) console.log(h > UTIL ? 'NÃO CABE' : 'cabe   ', id, h, '/', UTIL);

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

  await page.evaluate(() => {
    const selo = document.querySelector('.selo-fonte').innerHTML;
    document.body.innerHTML = `
      <div class="capa">
        <div class="capa-selo">${selo}</div>
        <div class="capa-meio">
          <h1>Lista de<em>substituições</em></h1>
          <div class="capa-filete"></div>
          <p class="capa-frase">Para trocar um alimento por outro do mesmo grupo, na quantidade certa</p>
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
  fs.rmSync(path.dirname(arquivo), { recursive: true });
})();
