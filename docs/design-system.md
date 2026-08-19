# Design system — Portal da consultoria

Referência dos tokens e componentes do portal. Serve para manter as páginas
novas consistentes com as existentes.

## Como o CSS está organizado

Os arquivos são carregados nesta ordem, e cada um só depende dos anteriores:

| Arquivo | O que contém |
|---|---|
| `assets/css/fontes.css` | Declarações `@font-face` das fontes auto-hospedadas |
| `assets/css/tokens.css` | Todas as variáveis: cor, tipografia, espaço, raio, sombra, movimento |
| `assets/css/base.css` | Reset, tipografia padrão, foco, formulários, `.container` |
| `assets/css/componentes.css` | Peças usadas em mais de uma página |
| `assets/css/paginas.css` | Estilos de uma página só |

**Regra principal:** fora de `tokens.css`, nenhum arquivo declara valor cru de
cor, espaçamento ou tamanho de fonte. Se falta um valor, o certo é criar um
token, não escrever o número direto no componente.

---

## Tokens

### Cor

A paleta é "Argila": neutros quentes com um acento terracota. Os componentes
consomem os tokens **semânticos**, nunca os primitivos.

| Token semântico | Uso | Contraste |
|---|---|---|
| `--cor-fundo` | Fundo da página | — |
| `--cor-superficie` | Cartões, campos, cabeçalho | — |
| `--cor-superficie-alt` | Faixas e cabeçalho de tabela | — |
| `--cor-texto` | Títulos e texto forte | 16,5:1 |
| `--cor-texto-corpo` | Corpo de texto | 8,5:1 |
| `--cor-texto-suave` | Legendas e notas | 6,0:1 |
| `--cor-borda` | Divisórias decorativas | — |
| `--cor-borda-campo` | Borda de campo de formulário | 4,4:1 |
| `--cor-acento-forte` | Links e texto de acento | 6,5:1 |
| `--cor-acento-suave` | Fundo de nota de destaque | — |

Todos os pares de texto passam em WCAG AA. Duas armadilhas:

- `--sand-400` e `--clay-300` são **decorativos**. Nunca use em texto: ficam
  abaixo de 3:1 e reprovam.
- `--cor-texto-suave` é o tom mais claro permitido para texto. Nada além dele.

### Tipografia

Escala modular de razão 1.25, de `--fs-xs` (10,2px) a `--fs-4xl` (49px).
Para títulos que precisam acompanhar a largura da tela existem
`--fs-h1`, `--fs-h2` e `--fs-display`, já com `clamp()`.

- **Fraunces** nos títulos. Variável, com eixo de tamanho óptico: os títulos
  grandes usam `font-variation-settings: "opsz" 96` e ganham contraste de
  traço; os pequenos usam valores menores e continuam legíveis.
- **Inter** no corpo. Tem algarismos tabulares, usados na tabela da
  calculadora com `font-variant-numeric: tabular-nums`.
- Altura de linha do corpo: `--lh-base` (1.65).
- Largura de leitura: `--measure` (66ch), aplicada por padrão em `p`, `ul`
  e `ol`. Elementos que são régua ou faixa precisam de `max-width: none`.

### Espaçamento

`--sp-4` a `--sp-96`, nos valores 4, 8, 12, 16, 24, 32, 48, 64 e 96. O nome
do token é o valor em pixels, então não há tabela para decorar.

### Movimento

`--transicao` (220ms) e `--transicao-lenta` (300ms), sempre `ease-out`.
Ambos caem para 1ms sob `prefers-reduced-motion: reduce`, junto com a
rolagem suave.

---

## Componentes

### Cartão — `.info-card`

Bloco branco com borda. Base de quase todo o conteúdo.

```html
<div class="info-card">
  <h3>Título do cartão</h3>
  <p>Texto do cartão.</p>
</div>
```

Variações: `.info-card-full` (ocupa a largura toda e ganha margem inferior),
`.guide-intro` (texto de abertura de seção).
Para duas colunas, envolva em `.info-grid`.

### Cartão de lista — `.meal-card`

Usado nas sugestões de refeição. Título com régua, lista de itens e uma nota
de rodapé em `.meal-note`. Envolva em `.meal-grid`.

```html
<div class="meal-card">
  <h3>Nome do programa</h3>
  <ul><li>Item</li></ul>
  <p class="meal-note">Observação de contexto.</p>
</div>
```

### Seção numerada — `.guide-section` + `.section-label`

Estrutura das páginas de conteúdo. O número vem em `.section-num`.

```html
<section class="guide-section" id="ancora">
  <p class="section-label"><span class="section-num">01</span> Nome da seção</p>
  <div class="info-card info-card-full">…</div>
</section>
```

Dentro do cartão, `.guide-block` cria um subbloco separado por linha, e
`.guide-defs` (ou `.guide-defs-2`) cria a grade de definições curtas.

### Sumário lateral — `.guide-index`

Índice fixo à esquerda, dentro de `.guide-layout`. A numeração é gerada por
CSS (`counter`), então a ordem do HTML basta. No celular vira um cartão no
topo.

```html
<div class="container guide-layout">
  <aside class="guide-index" aria-label="Índice da página">
    <p class="guide-index-title">Nesta página</p>
    <ol><li><a href="#ancora">Nome da seção</a></li></ol>
  </aside>
  <div class="guide-content">…</div>
</div>
```

### Nota de destaque — `.callout`

Reservada às frases que carregam a regra. Se tudo virar destaque, nada é
destaque.

```html
<div class="callout">
  <strong>Atenção:</strong> texto da observação.
</div>
```

`.callout-spaced` acrescenta respiro acima.

### Chip — `.product-chip`

Item de marca no guia do mercado, dentro de `.product-grid`.

```html
<div class="product-grid">
  <span class="product-chip">Nome da marca</span>
</div>
```

### Botões — `.btn`

```html
<a href="#" class="btn btn-primary">Ação principal</a>
<button type="button" class="btn btn-secondary">Ação secundária</button>
```

### Carimbo de atualização — `.atualizacao`

Vai logo abaixo do `.hero-lead` nas páginas cujo conteúdo envelhece.

```html
<p class="atualizacao">
  Atualizado em <time datetime="2026-08">agosto de 2026</time>
</p>
```

### Rodapé legal — `.guide-note`

Bloco de encerramento das páginas de conteúdo, fora dos cartões.

```html
<aside class="guide-note" aria-label="Observação importante">
  <p class="guide-note-label">Importante</p>
  <p>Texto da observação.</p>
</aside>
```

O aviso "conteúdo de apoio educativo — consulte sempre sua nutricionista"
fica no rodapé do site (`.footer-legal`) e é obrigatório em todas as páginas.

### Pendentes

`acordeao` ainda não existe — entra junto com a página de perguntas
frequentes, se ela for feita.

---

## Cabeçalho e rodapé

Não edite o cabeçalho nem o rodapé direto nas páginas: eles são gerados.

1. Edite `assets/layout/header.html` ou `assets/layout/footer.html`.
2. Rode `node scripts/sync-layout.js`.

O mesmo script gera todo o `<head>` — título, descrição e tags de
compartilhamento — a partir do mapa `PAGINAS` dentro dele. Para adicionar uma
página nova, inclua a entrada nesse mapa e deixe os três marcadores no HTML:

```html
<head>
  <!-- layout:head --><!-- /layout:head -->
</head>
<body>
  <!-- layout:header --><!-- /layout:header -->
  <main id="conteudo">…</main>
  <!-- layout:footer --><!-- /layout:footer -->
</body>
```

`node scripts/sync-layout.js --check` falha se alguma página estiver fora de
sincronia, sem alterar nada.

---

## Acessibilidade — o que já é garantido

- Link "pular para o conteúdo" como primeiro elemento focável.
- `:focus-visible` com contorno de 2px no acento, em todos os controles.
- Um único `<h1>` por página.
- Menu do celular com `aria-expanded`, `aria-controls`, fechamento por `Esc`
  e devolução do foco ao botão.
- `prefers-reduced-motion` respeitado, inclusive na rolagem suave.
- Todos os pares de texto verificados em AA.

Ao criar página nova, confira estes seis pontos antes de publicar.
