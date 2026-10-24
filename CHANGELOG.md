# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versionamento semântico.

## [1.1.1] — Correções de consistência, acessibilidade e documentação

Versão de correção: nenhuma classe foi renomeada e nenhum `data-*` mudou de significado. O carrossel ficou **fora** desta versão, de propósito.

### Corrigido

- **Tema salvo não era aplicado ao recarregar.** O `data-theme="light"` fixo no `<html>` impedia a leitura do `localStorage`. Agora: script inline no `<head>` (sem flash), `initTheme()` com precedência *escolha salva > `data-theme` do HTML > light*, valores validados, e tokens de tema claro também em `:root` (a página nunca fica sem cores).
- **Header transparente deixava links invisíveis e focáveis** (WCAG 2.4.7). Com `:focus-within`, o header volta a ser visível quando o foco entra nele.
- **Âncoras ficavam escondidas sob o header sticky.** Novo token `--header-h` e `scroll-padding-top` no `html`.
- **Menu mobile não fechava ao clicar em link interno.** Agora fecha (e o foco não volta ao gatilho quando o clique é um link de âncora).
- **Página atual do `docs.html` não era destacada** (usava `.is-active`, mas o CSS lê `aria-current`). Corrigido para `aria-current="page"`.
- **ARIA inválido:** `aria-expanded` era escrito em `<a>` e `<div>`; agora só em botões.
- **Abas sem ligação aba/painel:** o engine passa a criar `aria-controls` e `aria-labelledby` (gera o id da aba quando falta).
- **Diálogos sem nome acessível:** `[role="dialog"]` sem `aria-label`/`aria-labelledby` passa a usar o primeiro título interno.
- **`nav-dropdown-trigger` não tinha CSS:** o botão aparecia com aparência nativa. Criado `button.nav-link` / `.nav-dropdown-trigger`.
- **Colisão de `.brand-logo`** (imagem em `ui.css` × texto no tema): a marca em texto agora usa `.header-brand` + `.brand-title`; `.brand-logo` fica só para `<img>`. Efeito colateral positivo: a marca passa a obedecer ao estado `is-transparent`.
- **`.section-alt` duplicada** (core e tema): mantida só no `core.css`.
- **Classes genéricas presas no arquivo de demonstração** (`lead-text`, `action-group`, `btn-sm`): movidas para `ui.css`.
- **Camada `theme` nunca usada:** `estilo-global.css` declarava `@layer components`; agora usa `@layer theme`, a última da ordem, como a arquitetura previa.
- **`docs.html`:** removido o resíduo `[cite: 1, 2]`; corrigido o link do GitHub (`JoseBosslen`); emoji do botão de tema estava com codificação quebrada; removido `style=""` inline sem efeito; arquivo terminava truncado em `</htm`.
- **Três caminhos diferentes para o script** (`js/basic`, `js/core-js`, `javascript/basic`): unificado em `js/core-js/index.js`.
- **README:** UTF-8 corrompido, blocos de código sem cerca, tabelas quebradas, estrutura de pastas e tabela de camadas desatualizadas.

### Alterado

- **Versão única `1.1.1`** (engine exporta `VERSION`; páginas, README e comentários seguem o mesmo número).
- **Rolagem de âncoras agora é nativa.** Removido `handleSmoothScroll` do engine: o `scroll-behavior` do CSS anima, o navegador move o foco e o histórico, e o `hashchange` atualiza o `aria-current`. Menos código e foco correto.
- **`index.js` apenas reexporta o engine**, que já se auto-inicializa (antes havia inicialização duplicada).
- **Títulos `h1`–`h6`:** o `padding: 10px` e o `small-caps` viraram os tokens `--heading-padding` e `--heading-variant`, com os **mesmos valores de antes** (visual idêntico). Para títulos neutros: `0` e `normal` na layer `theme`.
- **HTML de demonstração:** skip link; `aria-label` distinto em cada `<nav>`; rodapé como `<nav><ul>`; cards como lista; emojis e setas com `aria-hidden`; botões "Saiba mais" com texto para leitor de tela; "Saiba mais" que navega virou link; `target="_blank"` com `rel="noopener noreferrer"`; formulário com `name`, `autocomplete` e `required`; botão "Fechar" no modal; links apontam para o repositório (`JoseBossle/caffe`).

### Adicionado

- `.skip-link` (ui.css), `:where(pre)`/`:where(code)` (ui.css), `--header-h`, `--heading-padding`, `--heading-variant`.
- `data-no-submit` em `<form>`, no lugar do `onsubmit` inline (compatível com CSP).
- `aria-controls` e `aria-expanded` iniciais automáticos em todo `button[data-toggle]`.
- Documentação dos atributos `data-*`, do tema e da regra *classe = aparência, `data-*` = comportamento, `aria-*` = estado*.

### Não alterado (de propósito)

- `core.js` e `LICENSE`.
- **Carrossel:** `handleCarousel` e a menção no README permanecem como estavam. Nome das classes (`c-carousel__*` × `carousel__*`), CSS, ARIA e autoplay serão decididos na etapa própria (previsto para 1.2.0).

### Pendências conhecidas

- Carrossel (1.2.0).
- Decidir o nome da pasta `js/core-js/` antes do npm: `core-js` é também o nome de uma biblioteca muito conhecida no npm.
- Padrão de tema escuro via `prefers-color-scheme` quando não há escolha salva.
- Bundle único (`dist/`) para evitar a cascata de `@import` em produção.
- `package.json` (`exports`, `files`, `sideEffects`, tipos) e primeira publicação.
- Testes automatizados (validação HTML, acessibilidade, comportamento do engine).
- Comentários-TODO antigos removidos do código: "melhorar títulos e parágrafos" no `.u-stack` continua como ideia pendente.
