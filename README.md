# CAFFE — CSS Automation For Front End

O **CAFFE (CSS Automation For Front End)** é uma biblioteca front-end baseada em HTML5, CSS3 e JavaScript ES6+, desenvolvida para projetos que utilizam tecnologias nativas da Web, sem etapas obrigatórias de build e sem dependências externas.

A proposta é oferecer uma base arquitetural enxuta, organizada e auditável, com foco em previsibilidade da cascata CSS, reutilização de estilos, acessibilidade e automação de comportamentos da interface.

Em vez de substituir o HTML, o CSS e o JavaScript por abstrações adicionais, o CAFFE organiza essas tecnologias para tornar o desenvolvimento front-end mais consistente e sustentável.

## Arquitetura

A biblioteca está organizada em três pilares: controle da cascata CSS, design tokens e automação de interface por delegação de eventos.

### 1. CSS Cascade Layers

O CAFFE utiliza `@layer` para estabelecer uma ordem explícita de prioridade entre as camadas de estilos:

```css
@layer base, layout, components, utilities;
```

Essa declaração define a precedência das camadas independentemente da ordem em que seus arquivos são carregados. Para declarações normais, uma regra de `utilities` prevalece sobre uma regra de `components`, por exemplo, sem depender de seletores artificialmente mais específicos.

A organização reduz conflitos de especificidade e a necessidade de utilizar `!important` para corrigir problemas estruturais da cascata.

| Camada | Responsabilidade | Organização |
|---|---|---|
| `base` | Reset, tokens, tipografia e estilos fundamentais | `core.css` |
| `layout` | Contêineres, grids e estruturas de página | Estilos de layout |
| `components` | Cabeçalhos, botões, cards, modais, abas, dropdowns e outros componentes | `ui.css` |
| `utilities` | Espaçamento, alinhamento e visibilidade | `core.css` e `ui.css` |

Os arquivos e as responsabilidades específicas poderão evoluir conforme a modularização da biblioteca.

### 2. Design Tokens

Os valores de design são centralizados em Custom Properties, facilitando a manutenção, a consistência visual e a personalização dos projetos.

As principais categorias incluem:

- **Cores:** `--color-bg-*`, `--color-text-*`, `--color-primary` e `--color-border`.
- **Espaçamento:** `--sp-xs` até `--sp-xl`, incluindo valores fluidos quando apropriado.
- **Tipografia:** `--fs-h1` até `--fs-h4`, com escalas responsivas baseadas em `clamp()`.
- **Camadas de empilhamento:** `--z-header`, `--z-dropdown`, `--z-offcanvas` e `--z-modal`.
- **Estados semânticos:** `--clr-success`, `--clr-warning` e `--clr-danger`.

A nomenclatura definitiva dos tokens deve acompanhar a implementação efetiva dos arquivos CSS.

### 3. Motor de automação de interface

O núcleo JavaScript está organizado em `js/basic/`, com responsabilidades separadas por módulo.

| Arquivo | Responsabilidade |
|---|---|
| `core.js` | Utilitários independentes de componentes, como `rafThrottle`, `getFocusable` e `trapFocus` |
| `engine.js` | Motor `UIEngine`, responsável pelos comportamentos da interface |
| `index.js` | Ponto de entrada e inicialização do motor |

O `UIEngine` utiliza delegação de eventos para centralizar o tratamento de interações. Em vez de registrar listeners individuais para cada componente, identifica os elementos acionados por meio de atributos `data-*` e métodos como `closest()`.

Essa abordagem simplifica a manutenção e permite que elementos adicionados dinamicamente ao DOM utilizem os comportamentos delegados sem exigir a instalação individual de novos listeners.

Entre os comportamentos contemplados pelo motor estão:

- Toggles genéricos por `[data-toggle]`.
- Modais e painéis off-canvas.
- Dropdowns.
- Abas por `[data-tab-target]`.
- Alternância de tema por `[data-theme-toggle]`.
- Rolagem suave para âncoras.
- Cabeçalho sticky.
- Integração de navegação de carrossel por `[data-carousel-prev]` e `[data-carousel-next]`.

A disponibilidade de cada comportamento depende de sua implementação no código da versão utilizada.

## CAFFE Carousel 1.1

O carrossel é a próxima etapa de evolução da biblioteca. Seu contrato técnico estabelece uma arquitetura híbrida, com recursos nativos do navegador como base e um motor JavaScript próprio para funcionalidades avançadas.

O objetivo é oferecer um componente responsivo, acessível e leve, capaz de apresentar diferentes tipos de conteúdo sem exigir bibliotecas externas.

### Variantes previstas

A primeira versão contemplará três variantes:

**Hero**

Carrossel de destaque para imagens amplas, conteúdo editorial e chamadas para ação. A apresentação deverá preservar a proporção configurada ou aplicar um recorte controlado, conforme a finalidade da imagem.

**Cards**

Carrossel para conjuntos de cards, com quantidade de itens visíveis adaptada ao espaço disponível e espaçamento configurável.

**Galeria**

Carrossel para imagens e conteúdo visual, com suporte a diferentes proporções, legendas opcionais e navegação por controles ou gestos.

### Arquitetura híbrida

O modo básico utilizará recursos nativos, incluindo `overflow`, CSS Scroll Snap e rolagem do navegador. O motor JavaScript avançado será utilizado apenas quando necessário para comportamentos que não sejam atendidos adequadamente pela solução nativa.

A divisão de responsabilidades prevista é:

- CSS: layout, proporções, espaçamento, estados visuais e variantes.
- JavaScript: inicialização, navegação, estado ativo, acessibilidade e ciclo de vida.
- Motor avançado: loop controlado, gestos avançados e transições especiais, quando necessários.
- Configuração: valores padrão, validação e normalização das opções.

### Inicialização e configuração

A inicialização automática será identificada pelo atributo `data-caffe-carousel`, com uma API JavaScript complementar para inicialização explícita e controle programático.

Exemplo de marcação prevista:

```html
<section
  class="caffe-carousel caffe-carousel--cards"
  data-caffe-carousel
  data-loop="false"
  aria-label="Projetos em destaque"
>
  <div class="caffe-carousel__viewport">
    <div class="caffe-carousel__track">
      <article class="caffe-carousel__slide">
        <!-- Conteúdo do primeiro slide -->
      </article>

      <article class="caffe-carousel__slide">
        <!-- Conteúdo do segundo slide -->
      </article>
    </div>
  </div>

  <div class="caffe-carousel__controls">
    <button type="button" data-carousel-prev
      aria-label="Slide anterior">
      Anterior
    </button>

    <button type="button" data-carousel-next
      aria-label="Próximo slide">
      Próximo
    </button>
  </div>
</section>
```

O exemplo descreve a estrutura prevista para o componente. Sua utilização dependerá da implementação correspondente dos estilos e do JavaScript.

### API programática prevista

A interface pública proposta permitirá operações como:

```js
const carousel = CaffeCarousel.init(element, {
  loop: false,
  slidesPerView: "auto",
  gap: "1rem"
});

carousel.next();
carousel.prev();
carousel.goTo(2);
carousel.refresh();
carousel.pause();
carousel.play();
carousel.destroy();
```

A API definitiva será validada durante a implementação e deverá respeitar os padrões de inicialização e configuração já adotados pela biblioteca.

### Responsividade e proporções

O carrossel deverá se adaptar a diferentes larguras de contêiner, dispositivos e proporções de conteúdo.

Os requisitos incluem:

- Uso de `aspect-ratio` quando a variante exigir proporção definida.
- Aplicação de `object-fit: cover` ou `contain` conforme o conteúdo.
- Dimensionamento fluido dos cards.
- Recalibração após alterações de tamanho ou conteúdo.
- Prevenção de deslocamentos inesperados de layout.
- Navegação funcional em telas estreitas, tablets, desktops e monitores ultrawide.

### Loop e reprodução automática

O loop infinito será opcional e permanecerá desativado por padrão. Quando habilitado, deverá respeitar os limites técnicos do conjunto de slides e evitar clonagem indiscriminada de conteúdo.

A reprodução automática também ficará desativada por padrão. Caso seja habilitada, deverá oferecer mecanismos acessíveis de pausa e respeitar as preferências de movimento do usuário.

### Acessibilidade e desempenho

A implementação deverá considerar:

- Navegação por teclado.
- Foco visível e nomes acessíveis para os controles.
- Compatibilidade com leitores de tela.
- Respeito à preferência `prefers-reduced-motion`.
- Inicialização idempotente.
- Limpeza de listeners e observadores ao destruir a instância.
- Ausência de dependências externas obrigatórias.
- Carregamento de imagens adequado à posição e à importância do conteúdo.

O componente será validado funcionalmente e em diferentes proporções de tela antes de ser considerado concluído.

## Acessibilidade

A acessibilidade é tratada como requisito de arquitetura, e não como um ajuste posterior.

Os princípios adotados incluem:

- Foco visível por meio de `:focus-visible`, sem remover o contorno sem substituição adequada.
- Gerenciamento de foco em modais e off-canvas, incluindo retorno ao elemento que iniciou a interação.
- Fechamento de overlays por clique externo e pela tecla Escape, quando aplicável.
- Sincronização de atributos ARIA e estados de navegação.
- Uso de `aria-current="page"` para identificar a página atual quando apropriado.
- Respeito à preferência `prefers-reduced-motion`.
- Utilização de `.sr-only` para conteúdo destinado a leitores de tela, sem recorrer a `display: none` para ocultá-lo.

Os componentes deverão ser verificados individualmente para garantir que os comportamentos documentados estejam efetivamente implementados.

## Temas: dark e light

O sistema de temas prevê a utilização de atributos no elemento raiz:

```css
:root[data-theme="light"] {
  /* Tokens do tema claro */
}

:root[data-theme="dark"] {
  /* Tokens do tema escuro */
}
```

A persistência da preferência pode ser realizada por `localStorage`, conforme a implementação do projeto.

Para evitar o flash do tema incorreto durante o carregamento, recomenda-se aplicar a preferência antes da renderização dos estilos, por meio de um script síncrono no `<head>`. O método `UIEngine.initTheme()` poderá complementar esse comportamento e inicializar os controles de alternância.

O script inicial e o motor deverão permanecer consistentes e evitar inicializações duplicadas.

## Validação de formulários

Os estados visuais dos campos podem utilizar `:user-valid` e `:user-invalid`, evitando indicar erros de validação antes da interação do usuário, nos navegadores que oferecem suporte a esses seletores.

Os tokens semânticos `--clr-success` e `--clr-danger` podem ser utilizados para representar os estados de validação. O token `--clr-warning` pode identificar mensagens de atenção.

A classe `.field-message` poderá ser usada para mensagens de apoio associadas ao campo por meio de `aria-describedby`, com variantes semânticas para sucesso, alerta e erro.

A validação visual não substitui a validação funcional dos dados nem as mensagens acessíveis de erro.

## Estrutura de diretórios

A estrutura de referência atual é:

```text
caffe/
├── index.html
├── docs.html
├── css/
│   ├── core.css
│   └── ui.css
└── js/
    └── basic/
        ├── core.js
        ├── engine.js
        └── index.js
```

O CAFFE Carousel acrescentará uma estrutura modular compatível com essa organização. A localização definitiva dos arquivos do componente será definida após a conferência dos diretórios e das convenções existentes no repositório.

## Uso

A integração de uma página com a estrutura atual utiliza os pontos de entrada centrais:

```html
<link rel="stylesheet" href="css/index.css">

<script src="js/basic/index.js" type="module"></script>
```

Os caminhos acima pressupõem que  os arquivos de entrada indicados estejam disponíveis na distribuição utilizada. Na estrutura de referência apresentada, os arquivos listados são core.css e ui.css; portanto, a existência e a função de css/index.css devem ser confirmadas antes de adotá-lo como ponto de entrada oficial.

A recomendação é centralizar as referências públicas de CSS e JavaScript, evitando que os projetos consumidores precisem conhecer detalhes internos dos módulos.

Compatibilidade

O CAFFE utiliza recursos modernos da plataforma Web, incluindo CSS Cascade Layers (@layer), Custom Properties, ES Modules e seletores de validação de formulários.

A compatibilidade deverá ser verificada com os navegadores evergreen suportados pelo projeto, considerando os recursos específicos utilizados por cada componente.

Não há previsão de suporte ao Internet Explorer ou a navegadores sem suporte a ES Modules. Recursos com suporte variável deverão possuir uma estratégia de fallback quando isso for necessário para manter a funcionalidade essencial.

Status do projeto

O CAFFE 1.1 está em desenvolvimento ativo.

A arquitetura central contempla a organização dos estilos, os tokens de design e o motor de automação da interface. O CAFFE Carousel encontra-se na etapa de especificação técnica, com contrato definido para as variantes Hero, Cards e Galeria, inicialização automática, API programática e loop opcional.

Próximas etapas

Implementar o núcleo do CAFFE Carousel.

Desenvolver as variantes Hero, Cards e Galeria.

Integrar o componente ao UIEngine sem duplicar responsabilidades.

Criar exemplos funcionais e documentação da API.

Validar acessibilidade, responsividade e desempenho.

Estabelecer testes automatizados para os comportamentos críticos.

A documentação será atualizada conforme os recursos forem implementados e validados.

Licença

O projeto é distribuído sob a licença MIT. Consulte o arquivo LICENSE do repositório para conhecer os termos aplicáveis.
