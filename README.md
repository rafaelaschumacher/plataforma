# Nutri Rafaela Schumacher — Calculadora de Substituição de Alimentos

Site estático (HTML/CSS/JS puro, sem dependências) para pacientes calcularem
equivalências calóricas entre alimentos, organizados nos grupos:
Carboidratos, Proteínas, Gorduras, Leguminosas, Frutas e Laticínios e Doces.

## Como usar localmente

Basta abrir `index.html` no navegador, ou servir a pasta com qualquer
servidor estático, por exemplo:

```bash
python3 -m http.server 8080
```

e acessar `http://localhost:8080`.

## Estrutura

- `index.html` — estrutura da página.
- `assets/css/style.css` — estilos (tons de cinza, layout responsivo).
- `assets/js/data.js` — base de alimentos por grupo (kcal/100g e medida caseira).
- `assets/js/app.js` — lógica da calculadora de equivalência.

## Fonte dos dados

Valores de calorias baseados na Tabela Brasileira de Composição de Alimentos
(TACO — NEPA/UNICAMP), na Tabela Brasileira de Composição de Alimentos
(TBCA — USP) e, quando aplicável, em rótulos de fabricantes. Medidas caseiras
são aproximações e podem variar conforme preparo, marca e tamanho do alimento.

## Deploy

Por ser um site 100% estático, pode ser publicado em qualquer serviço de
hospedagem estática (GitHub Pages, Netlify, Vercel, etc.) sem necessidade de
build.
