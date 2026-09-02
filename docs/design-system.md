# Design system — Portal da consultoria

Referência de como o design system da marca é aplicado neste portal. Serve
para manter as páginas novas consistentes com as existentes.

> **A fonte de verdade da identidade não é este arquivo.** É a skill
> `rafaela-brand`, em `.claude/skills/rafaela-brand/` — a mesma que o site de
> consultoria usa. Cores, tipografia, raios, sombras, container e ritmo de
> seção estão definidos lá, e os valores em `tokens.css` são cópia exata
> daquilo. Este documento explica a **implementação**: quais tokens existem
> aqui, quais componentes o portal tem e o que é decisão só deste projeto.
>
> Antes de escolher uma cor, fonte, espaço, raio ou sombra nova, leia a skill.
> Mudar um token de marca é decisão de identidade visual, não decisão técnica:
> só com pedido explícito da Rafaela, e replicando no site da marca.

A identidade atual é **"Noir & Champagne"**: base grafite quase preta, texto
marfim e dourado champanhe nos detalhes, com Cormorant Garamond nos títulos e
Jost no corpo, os dois em peso 300.

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
token — e, se for valor de identidade, perguntar antes.

---

## Os dois temas

O escuro é o tema principal; o claro é uma alternativa completa. Os dois são
oficiais e **nenhuma tela pode existir só em um deles**.

O tema vive no atributo `data-theme` do `<html>` e é guardado em
`localStorage`, chave `tema` — a mesma chave do site da marca. A resolução é:

1. se a pessoa já escolheu, vale a escolha dela;
2. se não, o sistema decide: `prefers-color-scheme: light` → claro, qualquer
   outra coisa → escuro.

Isso acontece num **script inline no `<head>`**, gerado por
`scripts/sync-layout.js`, antes da primeira pintura. Se ele for movido para um
arquivo externo, a página passa a carregar no tema errado e trocar na frente de
quem está lendo. O botão de troca é `assets/js/tema.js`, e só cuida do clique.

Três regras que decorrem disso:

- **Nunca escreva uma cor literal num componente.** Cor fixa dentro de um
  componente é um bug que só aparece em um dos temas.
- **`--on-gold` inverte** entre os temas. Texto sobre dourado usa sempre
  `var(--on-gold)`, nunca `#fff`.
- **Os painéis são a exceção** e já têm tokens próprios (ver `.painel`).

---

## Tokens

### Cor

Paleta de uma família quente só (grafite → champanhe → marfim). Não introduza
cor de outra família — nem "só para um detalhe".

Os componentes consomem os tokens **semânticos**; os tokens de marca
(`--bg`, `--gold`, `--text`…) existem para montar aqueles.

| Token semântico | Aponta para | Uso |
|---|---|---|
| `--cor-fundo` | `--bg` | Fundo da página |
| `--cor-superficie` | `--surface` | Cartões e campos |
| `--cor-superficie-alt` | `--bg-alt` | Faixas alternadas, rodapé, cabeçalho de tabela |
| `--cor-texto` | `--text` | Títulos e texto forte |
| `--cor-texto-corpo` | `--text-muted` | Corpo de texto |
| `--cor-texto-suave` | `--text-subtle` | Legendas e notas |
| `--cor-borda` | `--border` | Divisórias de 1px |
| `--cor-borda-forte` | `--border-strong` | Bordas com mais presença |
| `--cor-borda-campo` | `--text-subtle` | Contorno de campo de formulário |
| `--cor-acento` | `--gold` | Links, filetes, numerais, ênfase |
| `--cor-acento-escuro` | `--gold-bright` | Hover de link, anel de foco |
| `--cor-acento-suave` | `--gold-wash` | Preenchimento dourado discreto |
| `--cor-acento-borda` | `--gold-dim` | Borda dourada discreta |

Duas notas de contraste:

- **Campo de formulário usa `--text-subtle`, não `--border-strong`.** A borda
  de um controle precisa de 3:1 (WCAG 1.4.11) e `--border-strong` não alcança
  isso em nenhum dos dois temas. Com `--text-subtle` fica em 5,6:1 no escuro e
  4,8:1 no claro, sem sair da paleta da marca. Não "suavize" essa borda.
- **`--text-subtle` foi calibrado, não escolhido no olho.** Não clareie nem
  escureça sem recalcular — a nota está em `tokens.md` da skill.

### Tipografia

- **Cormorant Garamond** nos títulos, **Jost** no corpo. Só os cortes que a
  marca usa: Cormorant 300–400 normal e itálico, Jost 300–500.
- **O peso leve é identidade.** Corpo e títulos em `--peso-leve` (300).
  Destaque se faz com tamanho, respiro ou o itálico dourado do `<em>` —
  **nunca engrossando um título**.
- `<em>` é o grifo da marca: itálico, peso 400, cor `--cor-acento`. Não é
  itálico genérico.
- Escala em níveis (`--fs-xs` a `--fs-4xl`): **decisão deste portal**, não da
  marca — a marca ainda não tem escala oficial. Foi construída no idioma dela:
  tudo fluido com `clamp()`, sem salto por breakpoint, derivada das medidas
  reais do site (h1 do hero, h2 de seção, h3 de card). `--fs-base` e
  `--lh-base` (1.75) são os valores oficiais da marca.
- **Rótulo em caixa alta**: todo rótulo curto — eyebrow, links do menu, botões,
  cabeçalho de tabela, etiqueta de subgrupo, cargo da assinatura — usa
  `text-transform: uppercase` com entreletra entre `.12em` e `.34em` (quanto
  menor o texto, maior a entreletra). É esse tratamento, e não uma cor, que dá
  o tom editorial.
- Largura de leitura: `--measure` (66ch), aplicada por padrão em `p`, `ul` e
  `ol`. Elemento que é régua ou faixa precisa de `max-width: none`.

### Espaçamento e ritmo

`--sp-4` a `--sp-96` — escala do portal; o nome do token é o valor em pixels.

O ritmo vertical vem da marca: **toda seção usa `padding-block: var(--section-y)`**
(`clamp(64px, 8.5vw, 118px)`). Uma seção nova não define o próprio padding
vertical — assim o respiro da página inteira muda num lugar só. Seções de apoio
podem usar `--section-y-curta`.

Container: `--container` (1160px) com `--gutter` (`clamp(20px, 5vw, 32px)`).

### Forma e sombra

`--radius-sm` (10px), `--radius-md` (16px), `--radius-lg` (22px) e
`--radius-full` (pill, para botões e chips). `--shadow-sm` e `--shadow-md` têm
escala própria por tema. `--shadow-gold` é exclusiva do hover do botão
primário — não use como sombra genérica.

### Movimento

`--ease` é a curva da marca (`cubic-bezier(.22, .61, .36, 1)`) e vale para
**toda** transição — não misture `ease-in-out`. As durações (`--transicao`,
`--transicao-lenta`) são do portal. Ambas caem para 1ms sob
`prefers-reduced-motion: reduce`, junto com a rolagem suave e a revelação.

---

## Padrões visuais

### O filete como marcador

O motivo mais recorrente da marca é um **filete horizontal de 1px** dourado.
Aparece na `.eyebrow` (antes do rótulo) e como bullet das listas de conteúdo,
no lugar do disco. Lista nova segue esse motivo, não `list-style: disc`.

Numeração fica só onde a ordem é informação de verdade (um processo, uma
cronologia). O numeral usa a serifada da marca, em dourado, com zero à esquerda
(`01`, `02`) — o zero vem do CSS.

### Painel escuro — `.painel`

Marca uma virada na página. É escuro **nos dois temas**, então tudo dentro dele
usa os tokens próprios `--panel-text`, `--panel-muted` e `--gold-on-panel`, e o
anel de foco vira marfim. Não tente "adaptar" um painel ao tema claro.

Na home é o bloco de fechamento ("Quando precisar, me chama"):
`<section class="about-section painel">`.

### Hover é para o que é clicável

Cartão de conteúdo (`.info-card`, `.meal-card`) **não** tem hover — ele não vai
a lugar nenhum. Cartão que é link (`.guia-item`) tem o hover completo da marca:
sobe 3px, troca `--shadow-sm` por `--shadow-md` e a borda vira dourada.
Botões sobem 2px.

### Revelação ao rolar

Bloco de conteúdo pode receber `data-reveal`: entra com `opacity: 0` e
`translateY(22px)` e é trazido para o lugar por `assets/js/interface.js`. Para
cascata, o container recebe `data-reveal-cascata` e cada filho um
`style="--i:N"`.

**Nunca ponha `data-reveal` em algo que o JavaScript esconde e mostra** — no
guia do mercado, a busca colapsa seções e cartões, e por isso lá a revelação
fica só no hero e no campo de busca.

Se o script não rodar, ou se a pessoa pediu menos movimento, o CSS força
`opacity: 1` — inclusive na impressão, onde não existe rolagem para disparar
nada. Esse bloco fica no fim de `componentes.css` para vencer no cascade: não
mova para cima.

---

## Componentes

### Assinatura da marca — `.brand`

Selo + nome + cargo, numa composição fixa. É a forma de escrever o nome da
marca, não um logotipo decorativo — reproduza igual sempre que o nome aparecer
como marca. Está no cabeçalho e no rodapé, gerada pelos parciais de layout.
O selo é SVG inline em `currentColor`, para acompanhar o dourado do tema.

### Cartão — `.info-card`

Superfície com borda de 1px e `--radius-lg`. Base de quase todo o conteúdo.

```html
<div class="info-card">
  <h3>Título do cartão</h3>
  <p>Texto do cartão.</p>
</div>
```

Variações: `.info-card-full` (largura toda e margem inferior), `.guide-intro`
(texto de abertura de seção). Para duas colunas, envolva em `.info-grid`.
Listas dentro do cartão ganham o bullet de filete automaticamente.

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
CSS (`counter`) em dourado, então a ordem do HTML basta. Abaixo de 820px vira
um cartão no topo.

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

Preenchimento dourado suave, borda dourada discreta e um filete de 2px na
esquerda. Reservada às frases que carregam a regra — se tudo virar destaque,
nada é destaque.

```html
<div class="callout">
  <strong>Atenção:</strong> texto da observação.
</div>
```

`.callout-spaced` acrescenta respiro acima.

### Chip — `.product-chip`

Pill de contorno fino, no formato da tag da marca. Item de marca no guia do
mercado, dentro de `.product-grid`.

```html
<div class="product-grid">
  <span class="product-chip">Nome da marca</span>
</div>
```

Fica em **caixa baixa**, e isso é proposital: o conteúdo é nome próprio de
produto, e em caixa alta a leitura piora e o nome deixa de ser reconhecível na
prateleira. É a única exceção ao rótulo em caixa alta.

### Botões — `.btn`

Pill de `min-height: 48px`, sempre em caixa alta com entreletra `.15em`.
O texto do botão nunca é caixa baixa.

```html
<a href="#" class="btn btn-primary">Ação principal</a>
<button type="button" class="btn btn-secondary">Ação secundária</button>
```

`.btn-primary` usa o degradê dourado oficial; o hover não troca o degradê —
sobe 2px, ganha `--shadow-gold` e clareia. `.btn-sm` é a versão compacta.
Sobre `.painel` o primário inverte para marfim sólido.

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
frequentes, se ela for feita. O componente equivalente na marca é o
`.faq__item`; reaproveite o desenho dele em vez de inventar outro.

---

## Cabeçalho e rodapé

Não edite o cabeçalho nem o rodapé direto nas páginas: eles são gerados.

1. Edite `assets/layout/header.html` ou `assets/layout/footer.html`.
2. Rode `node scripts/sync-layout.js`.

O mesmo script gera todo o `<head>` — título, descrição, tags de
compartilhamento, script de tema e preload das fontes — a partir do mapa
`PAGINAS` dentro dele. Para adicionar uma página nova, inclua a entrada nesse
mapa e deixe os três marcadores no HTML:

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

### O cabeçalho tem um limite de largura real

Abaixo de **1020px** a navegação vira gaveta lateral. O número não é
arbitrário — foi medido no navegador, com os cinco links atuais:

| Estado | Assinatura | Menu | Tema | Mínimo com respiros e gutter |
|---|---|---|---|---|
| Com as fontes da marca | 211px | 510px | 44px | **861px** |
| Com as fontes de fallback | 230px | 538px | 44px | **908px** |

**É a segunda linha que manda.** Enquanto Cormorant e Jost não carregam, o
texto cai em Georgia e na sans do sistema, que são mais largas. Um breakpoint
dimensionado só para o primeiro caso estoura durante o carregamento — e, como
o CSS usa `overflow-x: clip`, o botão de tema sairia da tela sem gerar barra de
rolagem, ou seja, sem nenhum aviso visual.

Com 1021px de viewport sobram 957px de conteúdo, contra os 908 necessários.

Esse número está em três lugares que **precisam andar juntos**:

| Onde | O quê |
|---|---|
| `assets/css/componentes.css` | `@media (max-width: 1020px)` — transforma a `.main-nav` em gaveta |
| `assets/css/componentes.css` | `@media (min-width: 1021px)` — esconde o `.nav-scrim` |
| `assets/js/nav.js` | `matchMedia('(min-width: 1021px)')` — fecha o menu ao voltar ao desktop |

**Ao adicionar ou remover um item do menu, remeça o cabeçalho nos dois estados
e ajuste os três.**

A gaveta fica estacionada fora da tela à direita, e é por isso que `html` e
`body` usam `overflow-x: clip` — `clip`, e não `hidden`, porque `hidden` cria
contexto de rolagem e quebraria o `position: sticky` do cabeçalho. Se mexer no
cabeçalho ou na gaveta, teste as duas coisas juntas: ausência de rolagem
lateral e o cabeçalho continuando grudado no topo.

`.header-ferramentas` carrega `z-index: 100` de propósito: a gaveta é filha do
mesmo cabeçalho e, sem isso, passaria por cima do X de fechar e do botão de
tema, deixando os dois inalcançáveis com o menu aberto.

### Breakpoints

Reaproveite os que já existem — **1020**, **820**, **640**, **620** e **420** —
em vez de criar uma quebra nova para um componente só. Todos são valores que o
site da marca também usa.

---

## Acessibilidade — o que já é garantido

- Link "pular para o conteúdo" como primeiro elemento focável.
- `:focus-visible` com contorno de 2px em `--cor-foco`, virando marfim dentro
  dos painéis escuros.
- Um único `<h1>` por página.
- Alvos de toque de no mínimo 44px em todo controle; botões com 48px.
- Gaveta do celular com `aria-expanded`, `aria-controls`, véu, trava de
  rolagem, fechamento por `Esc`, clique fora, e `Tab` preso dentro dela
  enquanto está aberta.
- `prefers-reduced-motion` respeitado, inclusive na rolagem suave e na
  revelação ao rolar.
- Contraste verificado em AA nos dois temas, incluindo a borda dos campos.

Ao criar página nova, confira estes sete pontos antes de publicar — nos dois
temas.
