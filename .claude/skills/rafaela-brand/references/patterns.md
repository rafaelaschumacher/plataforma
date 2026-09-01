# Padrões visuais — Rafaela Schumacher

Parte do design system oficial da marca (ver `SKILL.md`). Estes são comportamentos e
composições que já existem no site e que precisam ser **preservados** ao criar qualquer
coisa nova — aqui ou na plataforma de pacientes. Para os valores em si (cores, fontes,
raios, sombras), veja `references/tokens.md`.

---

## Os dois temas são um só desenho

O tema é aplicado por `data-theme="dark"` / `data-theme="light"` no elemento raiz, com a
escolha guardada em `localStorage` (chave `tema`). Ver `tokens.md` → "Os dois temas são
iguais em posto" para a ordem de resolução.

Três regras que decorrem disso:

1. **Nunca escreva uma cor literal num componente.** Todo componente lê tokens
   (`var(--surface)`, `var(--text-muted)`), e são os tokens que trocam de valor. Uma cor
   fixa dentro de um componente é um bug que só aparece em um dos temas.
2. **`--on-gold` inverte.** No escuro o texto sobre o dourado é quase preto (`#0F0E0C`);
   no claro é branco. Se você fixar `#fff` num botão dourado, ele fica ilegível no tema
   escuro. Use sempre `var(--on-gold)`.
3. **Os painéis são a exceção, e já têm tokens próprios.** `.panel` é escuro nos dois
   temas, então o que fica sobre ele usa `--panel-text`, `--panel-muted` e
   `--gold-on-panel`, que não acompanham o tema. Não tente "adaptar" um painel ao tema
   claro.

O script que resolve o tema roda **inline no `<head>`, antes da primeira pintura**. Se ele
for movido para o fim da página ou para um arquivo externo com `defer`, a página passa a
piscar no tema errado ao carregar. Isso não é detalhe de performance — é visível.

## Ritmo de seção

Toda seção usa `padding-block: var(--section-y)` — `clamp(64px, 8.5vw, 118px)`. O respiro
generoso é parte da identidade premium. Uma seção nova **não** define o próprio padding
vertical; usa o token, para que o ritmo da página inteira mude num lugar só.

Fundos alternam entre `--bg` e `--bg-alt` para separar seções vizinhas, e os painéis
escuros (`.panel`) marcam os dois momentos de virada da página: "Para você" e o CTA final.

## O filete como marcador

O motivo visual mais recorrente da marca é um **filete horizontal de 1px** em dourado, com
`opacity: .7`. Ele substituiu o glifo ✦ das identidades anteriores — **não volte a
renderizar um glifo** no lugar dele.

Aparece em três formas:

- **Eyebrow** (`.eyebrow::before`) — filete de `clamp(20px, 4vw, 34px)` antes do rótulo,
  com `gap: 14px`.
- **Eyebrow centralizada** (`.section-head .eyebrow::after`) — quando a eyebrow está num
  cabeçalho de seção centralizado, ganha um **segundo** filete depois do texto, formando
  uma composição simétrica.
- **Bullets de lista** — o mesmo filete curto marca cada item em `.plan-card__list`,
  `.who__list` e `.includes__item`, no lugar de um marcador redondo.

Uma lista nova segue esse motivo, não `list-style: disc`.

## Ênfase: itálico dourado, nunca negrito

`<em>` é o grifo da marca: itálico, peso `400`, cor `var(--gold)`. É assim que se destaca
uma palavra dentro de um título ("caiba na *sua rotina*", "Acompanhamento *Trimestral*") e
é assim que o sobrenome aparece na assinatura.

**Contraste se faz por peso leve e tamanho, não por engrossamento.** Títulos são `300`.
Se um título precisa de mais presença, aumente o tamanho ou o respiro em volta — não o
peso.

## Quebra de linha: títulos equilibram, parágrafos centralizados não

`text-wrap: balance` está ligado em `h1`–`h4`, para um título nunca terminar com uma
palavra sozinha na última linha. Em parágrafo comum vale `text-wrap: pretty`.

**Em parágrafo centralizado, nenhum dos dois.** Isso foi testado no `.final-cta` e
reprovado pela usuária: com o reequilíbrio, as linhas ficam quase do mesmo tamanho e,
empilhadas sob um `h2` centralizado, o conjunto vira um bloco afunilado — o texto passa a
"desenhar um triângulo" no meio da seção. O visual desejado é o parágrafo preenchendo a
linha normalmente, mesmo que a última fique curta.

Por isso `.hero__inner p`, `.who__content p`, `.section-head p`, `.services__payment` e
`.final-cta p` recebem `text-wrap: auto` explicitamente. Não "conserte" uma última linha
curta de parágrafo centralizado — é uma decisão de estilo, não um defeito. Se um
parágrafo realmente precisar de quebra controlada, ajuste o `max-width` do bloco ou
reescreva a frase.

## Hover e elevação

- **Botões** sobem `translateY(-2px)`. O primário ganha `--shadow-gold` (o brilho dourado
  que confirma a ação principal) e `filter: brightness(1.06)`; o outline ganha borda
  dourada e o preenchimento `--gold-wash`.
- **Cards** (`.plan-card`, `.step`, `.includes__item`) sobem e trocam `--shadow-sm` por
  `--shadow-md`.
- **Links de navegação** ganham um filete dourado que cresce da esquerda
  (`transform: scaleX()` com `transform-origin` alternando entre `right` e `left`), e a
  cor sobe de `--text-muted` para `--text`.
- **Links de texto simples** só mudam de cor para `--gold`.

Toda transição usa `var(--ease)` — `cubic-bezier(.22, .61, .36, 1)`. Essa curva é da
marca; não misture `ease-in-out` no meio.

## Entrada ao rolar

Blocos de conteúdo recebem `data-reveal`: começam em `opacity: 0` e `translateY(22px)`, e
a classe `.is-visible` (adicionada por um `IntersectionObserver`, uma vez só) os traz para
o lugar em `.7s`.

Para uma grade em que os itens devem entrar em cascata, o container recebe
`data-reveal-stagger` e cada filho um `style="--i:N"` — o atraso é
`calc(var(--i, 0) * 70ms)`. Reutilize esse par em vez de escrever uma animação nova.

## Movimento reduzido é obrigatório

O bloco `@media (prefers-reduced-motion: reduce)` no fim do CSS desliga o scroll suave,
força todo `[data-reveal]` a ficar visível e reduz qualquer transição/animação a `.01ms`.
Qualquer animação nova precisa continuar coberta por ele — e por isso o bloco fica **no
fim do arquivo**, para vencer no cascade. Não mova para cima.

## Acessibilidade que já está resolvida

Estes pontos já funcionam e não devem regredir:

- **Link "pular para o conteúdo"** (`.skip-link`), escondido acima da tela até receber
  foco.
- **Foco visível**: `outline: 2px solid var(--gold-bright)` com `outline-offset: 3px`,
  aplicado via `:where(a, button, summary, [tabindex]):focus-visible`. Dentro de `.panel`
  o anel vira `#F4EFE6`, senão some no fundo escuro.
- **Alvos de toque de no mínimo 44px** em todo controle. O botão de tema e o de menu têm
  exatamente 44×44; os botões têm `min-height: 48px`.
- **Menu mobile**: escurece o fundo (`.nav-scrim`), trava a rolagem da página
  (`body.nav-open { overflow: hidden }`), fecha no `Esc` e prende o `Tab` dentro da gaveta
  enquanto está aberto.
- **Lightbox de depoimento**: `<dialog>` nativo, fecha no `Esc` e no clique fora, e
  devolve o foco ao botão que o abriu.
- **FAQ**: `aria-expanded` e `aria-controls` no botão, altura animada por `max-height`.

## A gaveta do menu não pode criar rolagem lateral

A `.nav` mobile fica estacionada fora da tela à direita (`transform: translateX(100%)`).
Sem tratamento, isso cria rolagem horizontal no celular e empurra o botão flutuante do
WhatsApp para fora da borda.

A solução em uso é `overflow-x: clip` em `html` **e** em `body` — `clip`, e não `hidden`,
porque `hidden` cria um contexto de rolagem e quebraria o `position: sticky` do header.
Se você mexer no header ou na gaveta, **teste as duas coisas juntas**: ausência de rolagem
lateral e o header continuando grudado no topo.

## O header tem um limite de largura real

O header inteiro — selo + nome + cargo, sete links, o CTA e o botão de tema — ocupa cerca
de 1090px. O container tem 1160px. A folga é de algumas dezenas de pixels, e é por isso
que a navegação vira gaveta abaixo de **1180px**.

Esse número está em três lugares que precisam andar juntos:

| Onde | O quê |
|---|---|
| `css/styles.css` | `@media (max-width: 1180px)` — transforma a `.nav` em gaveta |
| `css/styles.css` | `@media (min-width: 1181px)` — esconde o `.nav-scrim` |
| `js/main.js` | `matchMedia('(min-width: 1181px)')` — fecha o menu ao voltar para desktop |

**Ao adicionar ou remover um item do menu, remeça o header e ajuste os três.** Um item a
mais sem esse ajuste empurra o botão de tema para fora da tela — e como o CSS usa
`overflow-x: clip`, ele some sem gerar barra de rolagem, ou seja, sem nenhum aviso visual.

## Imagens

- Toda foto entra em **WebP com fallback JPG**, via `<picture>` + `<source>`.
- Toda `<img>` declara `width` e `height` — é isso que impede o layout de "pular" enquanto
  a página carrega.
- Fotos abaixo da primeira dobra usam `loading="lazy"` e `decoding="async"`.
- O formato oficial de foto de pessoa é o **painel retangular alto** (`.about-photo`), com
  cantos arredondados — nunca recorte circular.

## Reuso de breakpoints

Os breakpoints em uso estão listados em `tokens.md`. Reutilize um valor existente em vez
de criar uma quebra nova só para um componente — cada breakpoint novo é mais um lugar onde
o layout pode divergir entre seções.
