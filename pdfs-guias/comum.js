// Medidas, capa e rodapé compartilhados pelos PDFs dos guias e do caderno.

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

// Rodapé de cada página: a assinatura em texto e a paginação. O template roda
// isolado da página, sem acesso às fontes dela, por isso usa fonte do sistema.
const RODAPE = `
  <div style="width:100%; padding:0 56px 14px; display:flex; justify-content:space-between;
              font-family: Helvetica, Arial, sans-serif; font-size:10px; letter-spacing:.16em;
              text-transform:uppercase; color:#A79C8B;">
    <span>Rafaela Schumacher · Nutricionista</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

module.exports = { LARGURA, ALTURA, CSS_CAPA, RODAPE };
