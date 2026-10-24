# CAFFE — CSS Automation For Front End

Biblioteca front-end nativa (HTML5 + CSS3 + JavaScript ES6+), sem build step e sem dependências externas, construída sobre três pilares: **CSS Cascade Layers** para controle determinístico de especificidade, **Design Tokens** via Custom Properties e um **motor de automação de UI** baseado inteiramente em delegação de eventos.

O objetivo do CAFFE não é competir com utilitários (Tailwind) ou bibliotecas de componentes (Bootstrap), e sim oferecer uma base arquitetural mínima e auditável para quem precisa de HTML/CSS/JS puro com engenharia de front-end real por trás: cascata previsível, acessibilidade nativa e zero binding manual de eventos.

**Versão atual: 1.1.1** — veja o [CHANGELOG](CHANGELOG.md).

## Início rápido

```html
<head>
  <link rel="stylesheet" href="css/index.css">
</head>
<body>
  <!-- seu conteúdo -->
  <script src="js/core-js/index.js" type="module"></script>
</body>
```

`css/index.css` e `js/core-js/index.js` são os **pontos de entrada estáveis**. Mantenha essas referências nos projetos que consumirem o CAFFE, mesmo que os arquivos internos (`core.css`, `ui.css`, `core.js`, `engine.js`) sejam reorganizados no futuro.

## Estrutura de diretórios

```text
caffe/
├── index.html
├── docs.html
├── LICENSE
├── README.md
├── CHANGELOG.md
├── css/
│   ├── index.css              # ponto de entrada (importa os três abaixo)
│   ├── core/
│   │   ├── core.css           # base e layout: tokens, reset, grids
│   │   └── ui.css             # components e utilities
│   └── theme/
│       └── estilo-global.css  # theme: personalização do projeto
└── js/
    └── core-js/
        ├── core.js            # utilitários puros
        ├── engine.js          # UIEngine
        └── index.js           # ponto de entrada
```

## Arquitetura

### 1. Camadas CSS (`@layer`)

A ordem de prioridade é declarada uma única vez, em `core.css`, antes de qualquer regra existir:

```css
@layer base, layout, components, utilities, theme;
```

Isso desacopla especificidade de ordem de carregamento de arquivo: uma regra em `utilities` sempre vence uma regra equivalente em `components`, independentemente de qual arquivo foi importado primeiro. Elimina a necessidade estrutural de `!important` para resolver conflitos de cascata (as exceções que restam são utilitários com `!important` deliberado, para forçar sobrescrita pontual, não para compensar arquitetura).

| Layer        | Responsabilidade                                                            | Arquivo                     |
|--------------|------------------------------------------------------------------------------|-----------------------------|
| `base`       | Tokens (`:root`), reset, tipografia, foco visível, `prefers-reduced-motion`  | `core.css`                  |
| `layout`     | Containers, seções, grids e stacks estruturais                               | `core.css`                  |
| `components` | Header, cards, botões, modais, off-canvas, abas, dropdown, mídia, rodapé     | `ui.css`                    |
| `utilities`  | Classes pontuais de espaçamento, texto e visibilidade (`u-*`)                | `ui.css`                    |
| `theme`      | Personalização do projeto: vence todas as anteriores, sem `!important`       | `theme/estilo-global.css`   |

### 2. Design Tokens

Todos os valores de design vivem em Custom Properties no `:root`:

- **Cor:** `--color-bg-*`, `--color-text-*`, `--color-primary`, `--color-border` (escopadas por `data-theme`)
- **Espaçamento fluido:** `--sp-xs` a `--sp-xl` (o último usando `clamp()`)
- **Tipografia fluida:** `--fs-h1` a `--fs-h4` via `clamp()`
- **Títulos:** `--heading-padding` e `--heading-variant` (por padrão `10px` e `small-caps`; para títulos neutros, sobrescreva na layer `theme` com `0` e `normal`)
- **Header sticky:** `--header-h` reserva espaço para âncoras não ficarem sob o header
- **Camadas de empilhamento:** `--z-header`, `--z-dropdown`, `--z-offcanvas`, `--z-modal`
- **Estado semântico:** `--clr-success`, `--clr-warning`, `--clr-danger`

O tema claro é o padrão (`:root` sem atributo). O tema escuro é ativado por `:root[data-theme="dark"]`, com persistência em `localStorage` (veja a seção Temas).

### 3. Motor de automação (`js/core-js/`)

| Arquivo     | Responsabilidade                                                                         |
|-------------|-------------------------------------------------------------------------------------------|
| `core.js`   | Utilitários puros: `rafThrottle`, `getFocusable`, `trapFocus`                             |
| `engine.js` | `UIEngine`: toda a automação de comportamento; auto-inicializa ao ser carregado            |
| `index.js`  | Ponto de entrada estável; reexporta `UIEngine` e `VERSION`                                |

O `UIEngine` registra poucos listeners no `document` e delega internamente por atributo `data-*` e `closest()`. Elementos inseridos dinamicamente funcionam sem re-binding.

### Atributos suportados

| Atributo                    | Onde                | O que faz                                                                           |
|-----------------------------|---------------------|--------------------------------------------------------------------------------------|
| `data-toggle="#id"`         | botão ou link       | Abre/fecha modal, off-canvas, dropdown ou menu; sincroniza `aria-expanded`/`aria-controls` |
| `data-tab-target="#id"`     | botão em `.tabs-nav`| Ativa a aba e o painel; aplica `role`, `aria-selected` e navegação por setas         |
| `data-theme-toggle`         | botão               | Alterna claro/escuro e salva a escolha                                               |
| `data-position="right"`     | `.offcanvas`        | Abre o painel pela direita                                                           |
| `data-no-submit`            | `<form>`            | Impede o envio (demonstrações)                                                       |

**Regra de ouro:** classe define aparência, `data-*` define comportamento e `aria-*` expressa estado. A página atual no menu usa `aria-current="page"`, não uma classe.

## Acessibilidade

Tratada como requisito de arquitetura, não como ajuste posterior:

- Foco visível global via `:focus-visible`; *skip link* (`.skip-link`) para pular ao conteúdo.
- Modal e off-canvas implementam focus trap (Tab/Shift+Tab ciclam dentro do dialog), recebem nome acessível automaticamente (`aria-labelledby` a partir do primeiro título) e devolvem o foco ao gatilho ao fechar.
- Dropdown, menu mobile e overlays fecham por clique externo, por clique em link interno e por Esc.
- Todo `<button data-toggle>` recebe `aria-controls` e `aria-expanded` automaticamente.
- Abas com `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby` e roving tabindex.
- Itens do header ocultados ao rolar voltam a ficar visíveis quando recebem foco (WCAG 2.4.7).
- `prefers-reduced-motion` neutraliza animações, transições e rolagem suave globalmente.
- `.sr-only` implementado via `clip` (compatível com leitores de tela), não `display: none`.

## Temas (dark/light)

A escolha do usuário é lida do `localStorage` em duas camadas redundantes e intencionais:

1. Um script síncrono e inline no `<head>` de cada página, que roda antes do CSS e evita o flash do tema errado no primeiro paint:

   ```html
   <script>
     try {
       var t = localStorage.getItem('caffe-theme');
       if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
     } catch (e) {}
   </script>
   ```

2. `UIEngine.initTheme()`, que repete a leitura como reforço idempotente e cobre a troca em tempo de execução via `[data-theme-toggle]`. Precedência: escolha salva, depois `data-theme` do HTML, depois `light`.

Sob uma CSP restritiva (`script-src` sem `'unsafe-inline'`), o script inline do `<head>` precisa de *nonce* ou *hash*; sem ele, o engine ainda aplica o tema, só que depois do primeiro paint.

## Validação de formulário

Estados de campo usam `:user-valid` / `:user-invalid`, que reagem só após a primeira interação do usuário (ao contrário de `:valid`/`:invalid`, que marcariam campos obrigatórios como inválidos antes de qualquer digitação). Mensagens de apoio usam `.field-message` (variantes `--success`, `--warning`, `--danger`), associadas ao campo via `aria-describedby`.

## Compatibilidade

CSS Cascade Layers (`@layer`), `:has()`, `:user-valid`/`:user-invalid` e unidades como `dvh` têm suporte nos navegadores evergreen atuais (Chromium, Firefox, Safari). Não há fallback para Internet Explorer nem para navegadores sem suporte a ES Modules.

## Status

Em desenvolvimento ativo. Pendências conhecidas:

- Componente de carrossel: o comportamento existe no engine, mas o CSS e a documentação ficam para uma etapa própria (previsto para a versão 1.2.0).
- Sem testes automatizados.
- Publicação no npm (`package.json`, `exports`, tipos) ainda não realizada.

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).
