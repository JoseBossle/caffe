# CAFFE — CSS Automation For Front End

Biblioteca front-end nativo (HTML5 + CSS3 + JavaScript ES6+), sem build step e sem dependências externas, construído sobre três pilares: CSS Cascade Layers para controle determinístico de especificidade, Design Tokens via Custom Properties, e um motor de automação de UI baseado inteiramente em delegação de eventos.

O objetivo do CAFFE não é competir com  utilitários (Tailwind) ou bibliotecas de componentes (Bootstrap), e sim oferecer uma base arquitetural mínima e auditável para quem precisa de HTML/CSS/JS puro com engenharia de front-end real por trás — cascata previsível, acessibilidade nativa e zero binding manual de eventos.

## Arquitetura

### 1. Camadas CSS (@layer)

A ordem de prioridade é declarada uma única vez, antes de qualquer regra existir:

css
@layer base, layout, components, utilities;


Isso desacopla especificidade de ordem de carregamento de arquivo: uma regra em utilities sempre vence uma regra equivalente em components independentemente de qual arquivo CSS foi importado primeiro. Elimina a necessidade estrutural de !important para resolver conflitos de cascata (as exceções que restam no projeto são utilitários com !important deliberado, para forçar sobrescrita pontual — não para compensar arquitetura).

 Layer  Responsabilidade Arquivo 

 base Reset, tokens (:root), tipografia, foco visível, prefers-reduced-motioncore.css
 layoutContaineres, grids estruturais, variantes de css 
 components Header, cards, botões, modais, off-canvas, tabs, dropdow nui.css 
 utilities Classes de espaçamento, alinhamento, visibilidade core.css / ui.css 

### 2. Design Tokens

Todos os valores de design vivem em Custom Properties no :root, escopadas por data-theme:

- Cor: --color-bg-, --color-text-, --color-primary, --color-border
- Espa�amento fluido: --sp-xs a --sp-xl (o último usando clamp())
- Tipografia fluida: --fs-h1 a --fs-h4 via clamp()
- Camadas de empilhamento nomeadas: --z-header, --z-dropdown, --z-offcanvas, --z-modal
- Estado sem�ntico: --clr-success, --clr-warning, --clr-danger

O tema dark/light � resolvido por :root[data-theme="light"] / :root[data-theme="dark"], com persist�ncia em localStorage e leitura s�ncrona no <head> (ver seção Temas).

### 3. Motor de automação (js/basic/)

Arquivo  Responsabilidade 

 core.js  Utilitários puros, sem dependência de DOM de componente: rafThrottle, getFocusable, trapFocus 
 engine.js  UIEngine - toda a automação de comportamento 
 index.js  Ponto de entrada; inicializa UIEngine em DOMContentLoaded 

UIEngine registra um único listener de click e um único listener de keydown no document, delegando internamente por data- attribute e closest(). Novos elementos inseridos dinamicamente no DOM funcionam sem re-binding - não há addEventListener por instância de componente.

Componentes cobertos pelo engine: toggle genérico ([data-toggle]), modal, off-canvas, dropdown, tabs ([data-tab-target]), tema ([data-theme-toggle]), scroll suave para ancoras, header sticky, e carrossel nativo ([data-carousel-prev/next], aguardando componente CSS correspondente).
## Acessibilidade

Tratada como requisito de arquitetura, não como ajuste posterior:

- Foco visível global via :focus-visible, sem remoção de outline sem substituição.
- Modal e off-canvas implementam focus trap (Tab/Shift+Tab ciclam dentro do dialog) e retornam o foco ao elemento que abriu o componente, ao fechar.
- Dropdown e overlays fecham por clique externo e por tecla Escape.
- Sistema de abas com role="tablist", role="tab", role="tabpanel", aria-selected e tabindex sincronizados via JS a cada troca.
- Estado de navegação atual expresso via aria-current="page", não por classe CSS sem semántica.
- prefers-reduced-motion neutraliza animaçõees e transições globalmente.
- .sr-only implementado via clip (compatível com leitores de tela), não display: none.

 Temas (dark/light)

O tema  lido de localStorage em duas camadas redundantes e intencionais:

1. Um script síncrono, inline, no <head> de cada pagina HTML - roda antes do CSS e antes de qualquer módulo JS, evitando flash do tema errado no primeiro paint.
2. UIEngine.initTheme(), no módulo JS - mantém o mesmo comportamento como fallback idempotente e cobre a troca de tema em tempo de execução via [data-theme-toggle].

 Validação de formulário

Estados de campo usam :user-valid / :user-invalid (reagem após a primeira interação do usuário, ao contrário de :valid/:invalid, que marcariam campos obrigatóios como inválidos antes mesmo de o usuário interagir) para aplicarclr-success /clr-danger na borda. Mensagens de apoio usam a classe .field-message, associada ao campo via aria-describedby, em três variantes semânticas (success,warning,danger). 
## Estrutura de diretórios


caffe/
├── index.html
├── docs.html
├── css/
│   ├── core.css        # base, layout, tokens
│   └── ui.css           # components, utilities
└── js/
    └── basic/
        ├── core.js       # utilitários puros
        ├── engine.js     # UIEngine
        └── index.js      # entry point


## Uso

html
<link rel="stylesheet" href="css/index.css">

<script src="js/basic/index.js" type="module"></script>


css/index.cssejs/basic/index.jsfuncionam como pontos de entrada centralizadores - mantenha essa referência nos projetos que consumirem o CAFFE, mesmo que os arquivos internos (core.css,ui.css,core.js,engine.js) sejam reorganizados no futuro.

## Compatibilidade

CSS Cascade Layers (@layer),:has()-adjacent selectors ausentes,:user-valid/:user-invalide unidades como dvh tem suporte em todos os navegadores evergreen atuais (Chromium, Firefox, Safari). Não há fallback para Internet Explorer ou navegadores sem suporte a ES Modules.

## Status

Em desenvolvimento ativo. Pendências conhecidas:

- Componente de carrossel (.c-carousel__viewport) referenciado no engine, ainda sem implementaçãoo CSS correspondente.
- Sem testes automatizados.
## Licença

MIT.
