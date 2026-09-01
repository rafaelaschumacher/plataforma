# Nutri Rafaela Schumacher — Portal da Consultoria

Site estático (HTML/CSS/JS puro, sem dependências) com o material de apoio
para os pacientes da nutricionista Rafaela Schumacher.

## Páginas

- `index.html` — home com acesso às 4 ferramentas.
- `calculadora.html` — calculadora de substituição de alimentos por
  equivalência calórica, organizada nos grupos: Carboidratos, Proteínas,
  Gorduras, Leguminosas, Frutas, Laticínios e Doces.
- `orientacoes-gerais.html` — como pesar alimentos, planejamento,
  monitoramento do processo, alimentação consciente e frequência alimentar.
- `refeicao-livre.html` — guia da refeição livre: orientações e sugestões de
  refeições de ~1000-1200 kcal.
- `guia-mercado.html` — guia de industrializados: como avaliar rótulos e
  sugestões de marcas por categoria, com busca.

## Como usar localmente

Basta servir a pasta com qualquer servidor estático, por exemplo:

```bash
python3 -m http.server 8080
```

e acessar `http://localhost:8080`.

## Cabeçalho, rodapé e `<head>`

São gerados, não editados à mão. Para mudar o menu, o rodapé ou os títulos e
descrições de compartilhamento:

1. edite `assets/layout/header.html`, `assets/layout/footer.html` ou o mapa
   `PAGINAS` dentro de `scripts/sync-layout.js`;
2. rode `node scripts/sync-layout.js`.

`node scripts/sync-layout.js --check` avisa se alguma página ficou fora de
sincronia, sem alterar arquivo. O script roda só em tempo de edição — o site
publicado é HTML estático completo e não depende dele.

## Identidade visual

O portal usa o design system oficial da marca, **"Noir & Champagne"**, o mesmo
do site de consultoria. A fonte de verdade é a skill `rafaela-brand`, em
`.claude/skills/rafaela-brand/` — cores dos dois temas, tipografia, raios,
sombras, padrões e componentes. **Antes de escolher uma cor, fonte ou espaço
novo, leia a skill**: valor que já existe lá não se reinventa aqui, e mudar um
token é decisão de identidade, não decisão técnica.

Como o design system é aplicado neste projeto: `docs/design-system.md`.

O tema escuro é o principal e o claro é uma alternativa completa. Os dois são
oficiais: nenhuma tela pode existir só em um deles.

## Estrutura

- `assets/css/` — `fontes.css`, `tokens.css`, `base.css`, `componentes.css`
  e `paginas.css`, carregados nessa ordem.
- `assets/fonts/` — Cormorant Garamond e Jost auto-hospedadas (SIL OFL 1.1).
- `assets/layout/` — cabeçalho e rodapé compartilhados.
- `assets/js/nav.js` — gaveta de navegação no celular (todas as páginas).
- `assets/js/tema.js` — botão de troca entre tema claro e escuro.
- `assets/js/interface.js` — contorno do cabeçalho ao rolar e revelação dos
  blocos ao entrar na tela.
- `assets/js/instalar.js` — convite para adicionar à tela de início.
- `assets/js/data.js` + `assets/js/app.js` — base de alimentos e lógica da
  calculadora.
- `assets/js/mercado.js` — busca de produtos no guia do mercado.

## Fonte dos dados

Calculadora: valores de calorias baseados na Tabela Brasileira de Composição
de Alimentos (TACO — NEPA/UNICAMP), na Tabela Brasileira de Composição de
Alimentos (TBCA — USP) e, quando aplicável, em rótulos de fabricantes.
Medidas caseiras são aproximações e podem variar conforme preparo, marca e
tamanho do alimento.

Orientações gerais, guia da refeição livre e guia do mercado: material
elaborado pela nutricionista Rafaela Schumacher para sua consultoria online.

## Deploy

Por ser um site 100% estático, pode ser publicado em qualquer serviço de
hospedagem estática (GitHub Pages, Netlify, Vercel, etc.) sem necessidade de
build.
