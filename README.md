# CAFFE 1.1 (CSS Automation For Front End)

Um Design System e framework front-end leve, semântico e focado em performance, construído com arquitetura modular, camadas CSS nativas (`@layer`) e motor JavaScript baseado em delegação de eventos.

##  Tecnologias e Arquitetura

* **CSS Layers (`@layer`)**: Controle absoluto de especificidade, dividindo o design em tokens, layout e componentes.
* **JS Engine Minimalista**: Motor modular em ES6 (`js/arquivos`) utilizando delegação de eventos. Zero bindings manuais por elemento.
* **Acessibilidade e Semântica**: Componentes estruturados nativamente pensando em *Mobile First* e padrões web modernos.

##  Estrutura de Diretórios

O projeto segue uma padronização estrita em letras minúsculas:

```text
caffe/
├── css/
│   └── index.css          # Ponto centralizador das camadas CSS
├── js/
│   └── arquivos/          # Motor JavaScript modular (ES Modules)
├── index.html             # Página principal de demonstração
└── docs.html              # Documentação técnica e guia de uso
