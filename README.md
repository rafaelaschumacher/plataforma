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

## Estrutura

- `assets/css/style.css` — estilos compartilhados (tons de cinza, layout
  responsivo, menu mobile).
- `assets/js/nav.js` — menu mobile (compartilhado por todas as páginas).
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
