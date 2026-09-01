---
name: rafaela-brand
description: Design system oficial e fonte de verdade da identidade visual da marca Rafaela Schumacher (nutricionista) — cores, tipografia, raios, sombras, breakpoints, padrões visuais e componentes reutilizáveis (botões, cards de plano, tags, cabeçalhos de seção, accordion de FAQ, animação de scroll-reveal). Use esta skill SEMPRE que for criar, editar ou revisar qualquer peça visual/UI da marca — tanto neste site de consultoria quanto na plataforma de pacientes (mesmo em outra stack, como React ou Vue). Consulte ANTES de escolher uma cor, fonte, espaçamento, raio de borda ou sombra, e antes de construir qualquer botão, card, badge, formulário, seção ou tela nova — mesmo que o pedido pareça pequeno ("só precisa de um verde um pouco diferente", "cria um badge novo", "monta a tela de login do app de pacientes", "que cor fica bom nesse botão"). O objetivo é impedir a criação de cores/fontes/estilos ad-hoc e o retrabalho de componentes que já existem, mantendo os dois projetos visualmente consistentes.
---

# Design system oficial — Rafaela Schumacher

Esta skill é o **design system oficial e estável** da marca Rafaela Schumacher: a fonte
única de verdade da identidade visual. Ela existe para que a marca continue parecendo a
mesma marca em qualquer lugar onde apareça — o site de consultoria (este repositório) e
a futura plataforma de pacientes (outro projeto, possivelmente em outra stack técnica) —
mesmo sendo trabalhada por sessões diferentes, em momentos diferentes, sem memória
compartilhada entre elas. Os tokens, componentes e padrões documentados aqui são o
contrato que substitui essa memória.

Este documento **não define** identidade visual nova — ele **registra e estrutura** a
identidade que já existe no código do site atual. Nenhum valor aqui foi inventado ou
ajustado; onde algo ainda não está decidido, isso é declarado explicitamente na seção
"Decisões em aberto" em vez de ser preenchido com um palpite.

> **Versão atual da identidade: "Noir & Champagne" (aprovada pela usuária em 2026-08-31).**
> Base grafite quase preta (`#0F0E0C`), texto marfim (`#F2EDE4`) e dourado champanhe
> (`#C8A96A`) nos detalhes, com Cormorant Garamond 300 nos títulos e Jost 300 no corpo.
> **O escuro é o tema principal e o claro é uma alternativa completa** — os dois são
> oficiais, escolhidos por `data-theme` no elemento raiz com a preferência guardada no
> navegador, e nenhuma tela pode existir só em um deles. A assinatura da marca passou a
> ser selo + nome + cargo, e o filete horizontal continua sendo o motivo no lugar do ✦.
>
> Isso **substituiu integralmente** as duas identidades anteriores: bronze e creme
> (`#9c8362` + `#fefcf9`, assinatura em duas tipografias) e, antes dela, verde-sálvia +
> dourado (`#7c8f6a` + `#c8a24d`, Playfair Display + Plus Jakarta Sans, motivo ✦). Se
> você encontrar aqueles valores em algum projeto da marca, é resíduo e deve ser migrado.

## Regra central

> **Quando existir um padrão visual no design system, reutilizá-lo. Não criar uma nova
> solução visual sem necessidade.**

Antes de escrever qualquer CSS, HTML ou estilo inline novo, siga esta ordem:

1. **Existe um token que já resolve isso?** Consulte `references/tokens.md` (cores,
   fontes, raios, sombras, espaçamento, breakpoints). Se existe, use-o — nunca digite
   um valor hexadecimal, `px` ou nome de fonte novo "à mão" quando um token já cobre a
   necessidade.
2. **Existe um padrão que já resolve isso?** Consulte `references/patterns.md` (ritmo
   de seção, motivo de bullets, ênfase com `<em>`, hover/elevação, dark mode, uso de
   breakpoints). Reaproveitar um padrão existente é sempre preferível a inventar um novo
   comportamento visual.
3. **Existe um componente que já resolve isso?** Consulte `references/components.md`
   (botões, cards, tags, cabeçalho de seção, FAQ, etc.). Adaptar um componente existente
   (nova variante de `.btn`, novo item em um grid de cards) é sempre preferível a
   desenhar algo do zero.
4. **Realmente não existe nada parecido?** Isso é legítimo — a marca vai crescer. Mas
   antes de introduzir um valor, padrão ou componente novo, **pergunte ao usuário** e
   proponha estender o design system existente (ex: adicionar `--color-info` em vez de
   escrever `#3b82f6` solto num componente). Nunca decida sozinho que a marca precisa de
   uma cor, fonte, escala ou padrão novo — isso é uma decisão de identidade visual, não
   uma decisão técnica.
5. **Nunca altere os valores dos tokens existentes** (ex: mudar o dourado, trocar a
   fonte, inverter qual tema é o principal) sem o usuário pedir isso explicitamente. Um
   pedido de "deixa esse botão mais bonito" não é permissão para redefinir `--gold`.

Isso vale igualmente para o site atual e para a plataforma de pacientes — mudar um token
ou padrão em um projeto sem replicar no outro é exatamente o tipo de "drift" visual que
esta skill existe para evitar.

## Como o design system está organizado (camadas A/B/C/D)

Cada elemento documentado nas referências desta skill pertence a uma destas quatro
camadas. Essa classificação está marcada explicitamente em `components.md` e é usada
para decidir o que deve ser portado "ao pé da letra" para a plataforma de pacientes e o
que é específico deste site:

| Camada | O que é | Deve ir para o segundo projeto? |
|---|---|---|
| **A — Identidade da marca** | Cores dos **dois temas** e o mecanismo de tema em si, família tipográfica e seu peso leve, o motivo de "grifo" com `<em>`, o motivo do filete horizontal, a assinatura selo + nome + cargo, o rótulo em caixa alta com entreletra larga. O que torna algo "visualmente a marca Rafaela Schumacher", independente de onde aparece. | Sim, sempre — sem alterar valores. |
| **B — Componentes reutilizáveis** | Peças de UI genéricas construídas com os tokens da camada A: botões, tags, cabeçalho de seção, card, accordion, avatar, placeholder, animação de entrada. | Sim, como padrão/estrutura — a marcação HTML/CSS exata pode se adaptar à stack nova, mas a forma e o comportamento devem ser os mesmos. |
| **C — Padrões específicos deste site** | Composições de página e componentes ligados ao conteúdo/funcionalidade deste site de consultoria (navegação, mockup de WhatsApp, botão flutuante de WhatsApp, grid do Instagram, layout de cada seção da home). | Não necessariamente — são decisões de produto deste site, não da marca. Avaliar caso a caso. |
| **D — Decisões ainda não definidas** | Lacunas do design system que ainda não têm um valor oficial (ver seção abaixo). | Não usar até serem definidas — perguntar ao usuário. |

## Identidade vs. implementação de referência

**A identidade da marca não é o arquivo `css/styles.css`.** A identidade é o conjunto de
valores e regras documentado em `references/tokens.json`, `tokens.md`, `components.md` e
`patterns.md` — esses arquivos são agnósticos de tecnologia.

`css/styles.css` (bloco `:root`, linhas 1–25, com overrides de dark mode nas linhas
27–36, e o restante do arquivo para componentes/layout) é apenas a **implementação de
referência**: como essa identidade foi construída em CSS puro, neste projeto específico.
Ela é útil como exemplo funcional e como o lugar onde qualquer mudança de token deste
site precisa acontecer (com aprovação do usuário) — mas **não é a fonte de verdade em
si**. A fonte de verdade são os valores documentados nas referências desta skill.

Essa distinção importa porque a plataforma de pacientes não vai (necessariamente) usar
CSS puro — pode ser React, Vue, um design system com tema do Tailwind, etc. Nesses casos,
não existe "o styles.css" para copiar; existe a identidade (camada A), os componentes
(camada B) e os padrões (`patterns.md`) para reimplementar na tecnologia escolhida.

## Portabilidade para a plataforma de pacientes

Quando esta skill for usada em um segundo projeto (a plataforma de pacientes), a stack
técnica pode ser diferente. Nesse caso:

- Os **valores** de identidade e tokens (camada A e os tokens de suporte da camada B —
  cores, fontes, raios, sombras, breakpoints) devem ser portados **exatamente como
  estão** em `references/tokens.json` — eles são o contrato de marca, independente de
  como são implementados tecnicamente. Não arredondar, não "melhorar", não escolher um
  tom próximo — copiar o valor exato.
- A **forma de implementação** deve se adaptar ao projeto novo (ex: CSS custom
  properties, tema do Tailwind, tokens do styled-components, variáveis do design system
  escolhido) — não é necessário nem esperado copiar `styles.css` literalmente.
- Os **componentes da camada B** (`references/components.md`) devem ser recriados na
  tecnologia do novo projeto preservando estrutura, variantes e comportamento — o nome
  da classe CSS pode mudar, o conceito e a aparência não.
- Os **padrões da camada C** (navegação, mockup de WhatsApp, etc.) não precisam ser
  portados automaticamente — são decisões de produto deste site específico. Avalie com o
  usuário se algo equivalente faz sentido no app de pacientes.
- As **decisões em aberto (camada D)** não devem ser inventadas no novo projeto só
  porque ele "precisa" de uma escala tipográfica ou de espaçamento — pergunte ao usuário
  e, quando decidido, registre a resposta aqui, nos dois projetos.
- Se o segundo projeto ainda não tem nenhuma definição de tokens, copie
  `references/tokens.json` para dentro dele como ponto de partida e adapte o formato.
- Se esta skill (a pasta `rafaela-brand` inteira) ainda não existir no segundo projeto,
  ela pode ser copiada para lá em `.claude/skills/rafaela-brand/` — o conteúdo já foi
  escrito para não depender de nada específico deste repositório.

## Decisões em aberto (camada D)

Estas partes do design system **ainda não têm um valor oficial**. Elas existem hoje no
código apenas como valores soltos, repetidos e não nomeados — não como uma decisão de
marca documentada. **Não escolha um valor por conta própria para nenhum item desta
lista.** Se uma tarefa exigir uma decisão aqui, pergunte ao usuário e, quando ele
decidir, registre a resposta em `tokens.md`/`tokens.json` (promovendo o item de "aberto"
para "oficial").

- **Escala tipográfica completa** — hoje só a família da fonte é oficial; tamanhos,
  pesos e line-heights por nível (display/h1/h2/h3/body/small/caption) não têm uma
  escala nomeada, só valores soltos usados caso a caso no site atual.
- **Escala de espaçamento** — não existe um conjunto de valores nomeados (ex: 4/8/16/24)
  para `gap`/`padding`/`margin`; o site atual usa valores ad hoc.
- **Durações de motion** — a *curva* já é oficial (`--ease: cubic-bezier(.22,.61,.36,1)`,
  usada em toda transição), mas as durações ainda são escolhidas caso a caso
  (`.2s` a `.7s`), sem critério documentado de quando usar cada uma.
- **Escala de z-index** — não existe uma ordem de empilhamento documentada; o site atual
  só tem valores soltos (`1`, `90`, `98`, `99`, `100` e `999`).
- **Sistema de ícones** — não existe uma definição de qual conjunto de ícones usar, nem
  regra de tamanho/cor; o site atual usa apenas SVGs inline ad hoc, com traço de `1.5`–`1.6`
  (o glifo ✦ das identidades anteriores foi aposentado em favor do filete).
- **Estados de erro e desabilitado** — não existem definidos em lugar nenhum do CSS atual
  (nenhum estado de erro de formulário, nenhum estado desabilitado de botão). Isso é
  especialmente relevante para a plataforma de pacientes, que provavelmente terá
  formulários e login. O estado de **foco** já existe e é oficial: `outline: 2px solid
  var(--gold-bright)` com `outline-offset: 3px`, virando `#F4EFE6` dentro dos painéis
  escuros (`.panel`).

## Referências

- `references/tokens.md` — tabela legível de cores (light/dark), tipografia, raios,
  sombras, espaçamento vertical de seção e breakpoints, com explicação de cada um e a
  camada (A/B) de cada grupo.
- `references/tokens.json` — os mesmos tokens em formato estruturado, com marcação de
  camada e a lista de decisões em aberto em formato de dados, pensado para ser
  copiado/parseado ao configurar o segundo projeto.
- `references/components.md` — todo componente visual identificável no site, sua(s)
  classe(s) CSS, onde está definido em `css/styles.css`, um trecho de exemplo real
  extraído de `index.html`, e a camada (B ou C) à qual pertence.
- `references/patterns.md` — padrões visuais/comportamentais que já existem no site
  (ritmo de seção, motivo de bullets, ênfase com `<em>`, hover/elevação, dark mode,
  reuso de breakpoints, uso de cor de terceiros) e as regras necessárias para preservá-
  los ao criar algo novo.

Leia o(s) arquivo(s) de referência relevante(s) antes de propor ou escrever qualquer
CSS/HTML novo — não confie apenas no resumo desta página para os valores exatos.
