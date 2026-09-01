# Tokens de marca — Rafaela Schumacher

Parte do design system oficial da marca (ver `SKILL.md`). Estes valores documentam a
identidade **atual** da marca: **"Noir & Champagne"** — base grafite quase preta, texto
marfim e dourado champanhe nos detalhes, com tipografia serifada de traço fino.

> **Nota de versão.** Esta identidade substitui integralmente as duas anteriores:
> bronze e creme (`#9c8362` + `#fefcf9`) e, antes dela, verde-sálvia + dourado
> (`#7c8f6a` + `#c8a24d`). Nada daquelas paletas continua válido — se você encontrar um
> bronze `#9c8362`, um verde-sálvia ou um glifo ✦ em algum lugar do código ou de outro
> projeto da marca, é resíduo e deve ser migrado para os valores desta página.

Fonte real: `css/styles.css`, blocos `:root, [data-theme="dark"]` e `[data-theme="light"]`.
**`styles.css` é a implementação de referência, não a identidade em si** — os valores
abaixo são a identidade, independente de tecnologia (ver "Identidade vs. implementação de
referência" em `SKILL.md`).

Estes são os únicos valores de cor/fonte/raio/sombra/espaçamento que devem ser usados.
Se uma necessidade não é coberta por nenhum destes, siga a regra "Realmente não existe
nada parecido?" em `SKILL.md` antes de inventar um valor novo.

## Os dois temas são iguais em posto

*Camada A — identidade da marca.*

Diferente das identidades anteriores, aqui **o escuro é o tema principal** e o claro é uma
alternativa completa, não um "modo". Os dois são oficiais e devem ser desenhados juntos:
nenhuma tela pode existir só em um deles.

O tema é escolhido por **atributo no elemento raiz** — `data-theme="dark"` ou
`data-theme="light"` — e não por `prefers-color-scheme` sozinho. A regra de resolução é:

1. Se a pessoa já escolheu um tema, vale a escolha dela (guardada em `localStorage`, chave
   `tema`).
2. Se não escolheu, o sistema operacional decide: `prefers-color-scheme: light` → claro;
   qualquer outra coisa → **escuro**.

Essa decisão precisa acontecer **antes da primeira pintura da tela**, num script inline no
`<head>`, senão a página pisca no tema errado ao carregar.

## Cores

*Camada A — identidade da marca.*

Toda a paleta pertence a **uma única família quente** (grafite → champanhe → marfim). Não
introduza uma cor de outra família (verde, azul, rosa) — nem "só para um badge".

| Token | Escuro (principal) | Claro | Uso |
|---|---|---|---|
| `--gold` | `#C8A96A` | `#856830` | Dourado da marca. Links, itálico de destaque, rótulos, sobrenome da assinatura. |
| `--gold-bright` | `#DFC48D` | `#6E5522` | Extremo claro do degradê, anel de foco. |
| `--gold-dim` | `rgba(200,169,106,.30)` | `rgba(133,104,48,.34)` | Bordas douradas discretas (plano em destaque). |
| `--gold-wash` | `rgba(200,169,106,.07)` | `rgba(133,104,48,.08)` | Preenchimento suave (hover do botão outline). |
| `--on-gold` | `#0F0E0C` | `#FFFFFF` | Texto **sobre** o dourado. Inverte entre os temas — nunca fixe. |
| `--bg` | `#0F0E0C` | `#FAF7F1` | Fundo padrão de página. |
| `--bg-alt` | `#15130F` | `#F2ECE1` | Fundo alternado de seção e do rodapé. |
| `--surface` | `#1B1815` | `#FFFFFF` | Fundo de card, sobre `bg` ou `bg-alt`. |
| `--text` | `#F2EDE4` | `#14120F` | Texto principal e títulos. |
| `--text-muted` | `#A79C8B` | `#5F5749` | Corpo de texto, legendas, links do menu. |
| `--text-subtle` | `#8D8374` | `#6E6657` | Texto de apoio menor (cargo na assinatura, rodapé). |
| `--border` | `#2B2620` | `#E4DCCC` | Bordas de 1px (cards, divisores). |
| `--border-strong` | `#3A332A` | `#D3C7B1` | Bordas com mais presença (botão outline). |
| `--header-bg` | `rgba(15,14,12,.82)` | `rgba(250,247,241,.85)` | Fundo do header, com `backdrop-filter: blur`. |
| `--scrim` | `rgba(6,6,5,.72)` | `rgba(20,18,15,.45)` | Véu atrás do menu mobile aberto. |

> **`--text-subtle` foi calibrado, não escolhido no olho.** Os valores originais
> (`#7C7365` escuro / `#877D6E` claro) reprovavam em AA — 4,13:1 e 3,78:1. Os atuais dão
> 4,97:1 e 4,83:1 sobre `--bg-alt`, que é o fundo mais claro/escuro em que esse texto
> aparece. Não clareie nem escureça esses dois valores sem recalcular.

### Degradês oficiais

Três degradês fazem parte da identidade — não são decoração livre, reproduza os valores:

- **Botão primário** (`--gold-grad`):
  - escuro: `linear-gradient(135deg, #DFC48D 0%, #C8A96A 45%, #A88B4F 100%)`
  - claro: `linear-gradient(135deg, #8F7030 0%, #7D6029 50%, #684E1E 100%)`
  - O hover **não troca o degradê**: ele sobe 2px e aplica `filter: brightness(1.06)`.
- **Painéis escuros** (`--panel-grad`), um radial sutil para o fundo não ficar chapado:
  - escuro: `radial-gradient(120% 140% at 50% 0%, #221D15 0%, #100F0C 72%)`
  - claro: `radial-gradient(120% 140% at 50% 0%, #262019 0%, #14120F 72%)`

### Cores que não acompanham o tema

Três valores são **constantes nos dois temas**, e isso é proposital:

| Token | Valor | Por quê |
|---|---|---|
| `--gold-on-panel` | `#DFC48D` | Os painéis `.panel` são escuros nos dois temas, então o dourado sobre eles precisa ser sempre o claro. |
| `--panel-text` | `#F4EFE6` | Texto sobre painel escuro. |
| `--panel-muted` | `rgba(244,239,230,.72)` | Corpo de texto sobre painel escuro. |

### Exceções propositais (não são tokens de marca)

- `.whatsapp-float` e o ícone do WhatsApp: `#25d366` (verde oficial do WhatsApp).
- `--chat-paper: #EDE7DC` — fundo do painel de print de depoimento, escolhido para casar
  com o papel de parede que já vem dentro das imagens.

Não trate essas cores como precedente para "cores soltas são aceitáveis".

## Tipografia

*Camada A — identidade da marca. (A escala completa de tamanhos por nível ainda não é
oficial — ver "Decisões em aberto" em `SKILL.md`.)*

- `--font-display`: **`"Cormorant Garamond"`**, fallback
  `Georgia, "Times New Roman", serif`. Serifada de alto contraste e traço fino.
- `--font-body`: **`"Jost"`**, fallback `ui-sans-serif, system-ui, "Segoe UI", sans-serif`.
  Sans geométrica leve.
- Carregadas via Google Fonts — Cormorant Garamond `300,400` normal e itálico; Jost
  `300,400,500`. **Só esses cortes**: a versão anterior baixava mais variações do que usava.
- **O peso leve é identidade.** Corpo em `300` com `line-height: 1.75`; `h1`–`h4` em
  `font-weight: 300`, `line-height: 1.12`, `letter-spacing: -.005em`, `text-wrap: balance`.
  Não engrosse um título para "dar destaque" — destaque se faz com tamanho, respiro ou
  itálico dourado.
- Tamanhos fluidos com `clamp()`, nunca saltos por breakpoint. O corpo é
  `clamp(.95rem, .92rem + .15vw, 1.02rem)`.
- `<em>` é o **grifo de marca**, não itálico genérico: `font-style: italic`,
  `font-weight: 400`, `color: var(--gold)`. Usado para destacar uma palavra-chave dentro
  de um título ("caiba na *sua rotina*", "Acompanhamento *Trimestral*").

### Assinatura do nome — selo + nome + cargo

O nome da marca é escrito com **três partes numa composição fixa**: o selo circular com o
monograma RS à esquerda, o nome em serifada e o cargo em caixa alta embaixo.

```html
<span class="brand">
  <span class="brand__mark" aria-hidden="true"><!-- SVG do monograma --></span>
  <span class="brand__text">
    <span class="brand__name">Rafaela <em>Schumacher</em></span>
    <span class="brand__role">Nutricionista</span>
  </span>
</span>
```

| Parte | Fonte | Peso | Tamanho | Cor |
|---|---|---|---|---|
| Selo | SVG, `currentColor` | — | 40px (34px abaixo de 420px) | `--gold` |
| Nome | `--font-display` | 300 | `1.34rem` (1.12rem abaixo de 420px) | `--text` |
| Sobrenome (`<em>`) | `--font-display` itálico | 300 | herda | `--gold` |
| Cargo | `--font-body` | 400 | `.53rem`, `letter-spacing: .34em` | `--text-subtle` |

`gap: 13px` entre selo e texto; `white-space: nowrap` no nome e no cargo. Reproduza essa
composição sempre que o nome aparecer como marca — inclusive na plataforma de pacientes.

### Rótulo em caixa alta

Tratamento único para todo rótulo curto — eyebrow, links do menu, botões, tags, cargo da
assinatura, nome no card de depoimento, títulos e rodapé do footer:

- `text-transform: uppercase`
- `letter-spacing` entre `.12em` e `.34em` (quanto menor o texto, maior a entreletra)
- `font-weight` entre `400` e `500`
- `font-size` entre `.53rem` e `.75rem`

É esse tratamento, e não uma cor, que dá o tom editorial da marca.

## Raios de borda

*Camada B — token de suporte, reutilizável.*

| Token | Valor | Uso típico |
|---|---|---|
| `--radius-sm` | `10px` | Elementos pequenos, anel de foco. |
| `--radius-md` | `16px` | Cards médios (`.includes__item`, `.step`). |
| `--radius-lg` | `22px` | Cards grandes/destacados (`.plan-card`, `.about-photo`). |
| — | `999px` (pill) | Botões, tags e badges — o padrão para "arredondado total". |

## Sombras

*Camada B — token de suporte, reutilizável.*

Cada tema tem a sua escala: no escuro as sombras são pretas e profundas; no claro são
difusas, de baixa opacidade e com tinta quente — nunca cinza neutro.

| Token | Escuro | Claro |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,.28), 0 6px 20px rgba(0,0,0,.22)` | `0 1px 2px rgba(58,44,30,.05), 0 6px 20px rgba(58,44,30,.06)` |
| `--shadow-md` | `0 2px 6px rgba(0,0,0,.32), 0 24px 60px rgba(0,0,0,.40)` | `0 2px 6px rgba(58,44,30,.06), 0 24px 60px rgba(58,44,30,.12)` |
| `--shadow-gold` | `0 10px 34px rgba(200,169,106,.16)` | `0 10px 34px rgba(147,116,56,.14)` |

`--shadow-gold` é exclusiva do hover do botão primário — é o brilho dourado que confirma a
ação principal. Não use como sombra genérica.

## Layout, espaçamento e breakpoints

*Camada B — tokens de suporte, reutilizáveis. (Uma escala geral de espaçamento além
destes valores ainda não existe — ver "Decisões em aberto" em `SKILL.md`.)*

- `--container: 1160px` — largura máxima do conteúdo (`.container`).
- `--gutter: clamp(20px, 5vw, 32px)` — respiro lateral do container.
- `--section-y: clamp(64px, 8.5vw, 118px)` — ritmo vertical de seção, fluido. O respiro
  generoso é parte da identidade premium — qualquer seção nova usa `--section-y`, não um
  padding próprio.
- `--ease: cubic-bezier(.22, .61, .36, 1)` — a curva de todas as transições da marca.
- Breakpoints usados no site (mobile-first via `max-width`):
  `1180px` (menu de navegação vira mobile), `1080px`, `1020px`, `940px`, `880px`, `860px`,
  `840px`, `820px`, `800px`, `680px`, `640px`, `620px`, `420px`, `340px`.
  Reutilize esses valores em vez de criar um breakpoint novo só para um componente.

> **O breakpoint de `1180px` é calculado, não arbitrário.** É a largura mínima em que o
> header inteiro — selo + nome + cargo, sete links, o CTA e o botão de tema — cabe dentro
> do container de 1160px. Abaixo disso a navegação **precisa** virar gaveta, senão o botão
> de tema é empurrado para fora da tela. Se você adicionar ou remover um item do menu,
> **remeça o header e ajuste esse breakpoint**, junto com o `min-width: 1181px` do
> `.nav-scrim` no CSS e o `matchMedia('(min-width: 1181px)')` no `js/main.js` — os três
> andam juntos.

## Nomenclatura

*Camada B — convenção reutilizável.*

Todas as classes seguem BEM-like: `.bloco__elemento--modificador`
(ex: `.plan-card__badge`, `.btn--outline`, `.brand__role`). Componentes novos devem seguir
o mesmo padrão.

## O que não está nesta página

Esta página só documenta o que já é oficial. Escala tipográfica completa, escala de
espaçamento, durações de motion, z-index, sistema de ícones e estados de erro/desabilitado
**ainda não existem como decisão de marca** — estão listados em "Decisões em aberto" em
`SKILL.md`. Para padrões de uso (ritmo de seção, filetes, ênfase, hover, temas), veja
`references/patterns.md`.
