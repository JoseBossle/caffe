/**
 * CAFFE ENGINE - Motor de Automação de Comportamentos
 *
 * Tudo por delegação de eventos no document: nenhum componente precisa de
 * binding próprio. Auto-inicializa ao ser carregado (<script type="module">);
 * init() é idempotente, então chamá-lo de novo manualmente é inofensivo.
 */

import { rafThrottle, getFocusable, trapFocus } from './core.js';

// Versão única da biblioteca (engine, CSS e páginas seguem este número)
export const VERSION = '1.1.1';

const THEME_KEY = 'caffe-theme';
const THEMES = ['light', 'dark'];

/* localStorage pode lançar exceção (cookies bloqueados, modo privado do Safari,
   cota cheia). Sem este invólucro, uma falha aqui interromperia o init() e
   deixaria os handlers seguintes sem registrar. */
const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignora */ }
  },
};

export const UIEngine = {
  _initialized: false,

  // Overlay (modal/off-canvas) ativo no momento — um por vez, por design
  _overlay: { target: null, trigger: null, releaseTrap: null },

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this.initTheme(); // primeiro: o tema não pode esperar os demais handlers
    this.handleToggles();
    this.handleStickyHeader();
    this.handleModals();
    this.handleTabs();
    this.handleCarousel();
    this.handleForms();
    this.handleActiveNavLink();
    this.enhanceA11y();
  },

  // Resolve o alvo de um atributo data-* e AVISA quando não acha (antes, um
  // data-toggle sem "#" falhava em silêncio e o console ficava limpo).
  _resolve(selector, attr, source) {
    let el = null;
    try {
      el = document.querySelector(selector);
    } catch { /* seletor inválido */ }

    if (!el) {
      console.warn(
        `[CAFFE] ${attr}="${selector}" não encontrou nenhum elemento — faltou "#" (id) ou "." (classe)?`,
        source
      );
    }
    return el;
  },

  // aria-expanded só é válido em botões: em <a> ou <div> (ex.: o backdrop do
  // off-canvas) o atributo seria ARIA inválido.
  _setExpanded(trigger, value) {
    if (trigger && trigger.matches('button, [role="button"]')) {
      trigger.setAttribute('aria-expanded', String(value));
    }
  },

  // --- Overlays (modal / off-canvas): foco, trap e estado ---
  _openOverlay(target, trigger) {
    // Só um overlay por vez: abrir outro fecha o anterior (sem trap órfão)
    if (this._overlay.target && this._overlay.target !== target) {
      this._closeOverlay();
    }

    const panel = target.querySelector('.modal__content, .offcanvas__panel') || target;
    this._overlay = { target, trigger, releaseTrap: trapFocus(panel) };

    const focusInto = () => {
      const [first] = getFocusable(panel);
      if (first) {
        first.focus({ preventScroll: true });
      } else {
        panel.setAttribute('tabindex', '-1');
        panel.focus({ preventScroll: true });
      }
    };
    focusInto();
    // Se o foco não entrou (ex.: CSS ainda revelando o painel), tenta no próximo frame
    if (!panel.contains(document.activeElement)) requestAnimationFrame(focusInto);
  },

  // restoreFocus=false é usado quando o fechamento vem de um link de âncora
  // dentro do overlay: o foco deve seguir a navegação, não voltar ao gatilho.
  _closeOverlay({ restoreFocus = true } = {}) {
    const { target, trigger, releaseTrap } = this._overlay;
    if (releaseTrap) releaseTrap();

    target?.classList.remove('is-active');
    this._setExpanded(trigger, false);
    this._overlay = { target: null, trigger: null, releaseTrap: null };

    if (restoreFocus) trigger?.focus({ preventScroll: true });
  },

  // --- Dropdown e menu mobile (.dropdown / .nav-menu): abertos via data-toggle ---
  _dismissables() {
    return document.querySelectorAll('.dropdown.is-active, .nav-menu.is-active');
  },

  _triggersOf(el) {
    return Array.from(document.querySelectorAll('[data-toggle]')).filter((t) => {
      try { return document.querySelector(t.dataset.toggle) === el; } catch { return false; }
    });
  },

  _closeDismissable(el, { restoreFocus = false } = {}) {
    el.classList.remove('is-active');
    const triggers = this._triggersOf(el);
    triggers.forEach((t) => this._setExpanded(t, false));
    if (restoreFocus) triggers[0]?.focus({ preventScroll: true });
  },

  // 1. Alternância genérica via [data-toggle] — overlays ganham focus trap;
  //    os demais (dropdown, nav-menu) seguem com o toggle simples de classe.
  handleToggles() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-toggle]');
      if (!trigger) return;

      const target = this._resolve(trigger.dataset.toggle, 'data-toggle', trigger);
      if (!target) return;

      const isOverlay = target.classList.contains('modal') || target.classList.contains('offcanvas');
      const isActive = target.classList.contains('is-active');

      if (isOverlay) {
        if (isActive) {
          this._closeOverlay({ restoreFocus: !trigger.matches('a[href]') });
        } else {
          target.classList.add('is-active');
          this._setExpanded(trigger, true);
          this._openOverlay(target, trigger);
        }
        return;
      }

      target.classList.toggle('is-active', !isActive);
      this._setExpanded(trigger, !isActive);
    });
  },

  // 2. Fechamento por clique fora, por link interno e por Esc —
  //    overlays, dropdowns e menu mobile
  handleModals() {
    document.addEventListener('click', (e) => {
      // Clique direto no fundo do overlay (o próprio .modal / .offcanvas)
      const isModalBackdrop = e.target.classList.contains('modal')
        && e.target.classList.contains('is-active');
      const isOffcanvasBackdrop = e.target.classList.contains('offcanvas')
        && e.target.classList.contains('is-active');
      if (isModalBackdrop || isOffcanvasBackdrop) {
        this._closeOverlay();
      }

      // Dropdown / menu mobile: clique fora fecha, e clique num link DENTRO do
      // painel também (numa página única o menu aberto cobriria o destino da
      // âncora). Clique em outro ponto do painel ou no gatilho é ignorado aqui
      // (o gatilho é decidido por handleToggles).
      const link = e.target.closest('a[href]');
      this._dismissables().forEach((el) => {
        if (link && el.contains(link)) {
          this._closeDismissable(el);
          return;
        }
        if (el.contains(e.target)) return;
        if (this._triggersOf(el).some((t) => t.contains(e.target))) return;
        this._closeDismissable(el);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;

      if (this._overlay.target) {
        this._closeOverlay();
        return;
      }
      this._dismissables().forEach((el) => this._closeDismissable(el, { restoreFocus: true }));
    });
  },

  // 3. Abas — troca de painel, ARIA e navegação por teclado (padrão WAI-ARIA)
  handleTabs() {
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-tab-target]');
      if (!tabBtn) return;

      const targetPanel = this._resolve(tabBtn.dataset.tabTarget, 'data-tab-target', tabBtn);
      if (!targetPanel) return;

      const navContainer = tabBtn.closest('.tabs-nav');
      if (navContainer) {
        navContainer.querySelectorAll('[data-tab-target]').forEach((btn) => {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-selected', 'false');
          btn.setAttribute('tabindex', '-1');
        });
      }
      tabBtn.classList.add('is-active');
      tabBtn.setAttribute('aria-selected', 'true');
      tabBtn.setAttribute('tabindex', '0');

      const parentContainer = targetPanel.closest('.tabs-container') || document;
      parentContainer.querySelectorAll('.tab-panel').forEach((panel) => {
        panel.classList.remove('is-active');
      });
      targetPanel.classList.add('is-active');
    });

    // Com tabindex="-1" nas abas inativas (roving tabindex), as setas são a ÚNICA
    // forma de teclado chegar nelas — sem isto, só a aba ativa seria alcançável.
    document.addEventListener('keydown', (e) => {
      const tab = e.target.closest?.('[data-tab-target]');
      const nav = tab?.closest('.tabs-nav');
      if (!nav || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;

      const tabs = Array.from(nav.querySelectorAll('[data-tab-target]'));
      let i = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') i = 0;
      if (e.key === 'End') i = tabs.length - 1;

      e.preventDefault();
      tabs[i].focus();
      tabs[i].click(); // reaproveita a lógica de ativação do clique
    });

    // Estado ARIA inicial — cobre a aba que já nasce .is-active no HTML
    document.querySelectorAll('.tabs-nav').forEach((nav) => {
      nav.setAttribute('role', 'tablist');
      nav.querySelectorAll('[data-tab-target]').forEach((btn) => {
        btn.setAttribute('role', 'tab');
        const active = btn.classList.contains('is-active');
        btn.setAttribute('aria-selected', String(active));
        btn.setAttribute('tabindex', active ? '0' : '-1');

        // Liga aba <-> painel (aria-controls / aria-labelledby), gerando o id
        // da aba quando o HTML não traz um. O painel precisa ter id, pois é ele
        // que o data-tab-target referencia.
        let panel = null;
        try { panel = document.querySelector(btn.dataset.tabTarget); } catch { /* aviso sai no clique */ }
        if (!panel || !panel.id) return;

        btn.setAttribute('aria-controls', panel.id);
        if (!btn.id) btn.id = `${panel.id}-tab`;
        if (!panel.hasAttribute('aria-labelledby')) panel.setAttribute('aria-labelledby', btn.id);
      });
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.setAttribute('role', 'tabpanel');
    });
  },

  // 4. Tema Dark/Light
  //    Precedência: escolha salva do usuário > data-theme do HTML > 'light'.
  //    (Antes, um data-theme fixo no <html> impedia a leitura do valor salvo.)
  initTheme() {
    const root = document.documentElement;
    const saved = storage.get(THEME_KEY);

    if (THEMES.includes(saved)) {
      root.setAttribute('data-theme', saved);
    } else if (!root.hasAttribute('data-theme')) {
      root.setAttribute('data-theme', 'light');
    }

    document.addEventListener('click', (e) => {
      const themeToggle = e.target.closest('[data-theme-toggle]');
      if (!themeToggle) return;

      const currentTheme = root.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      root.setAttribute('data-theme', newTheme);
      storage.set(THEME_KEY, newTheme);
    });
  },

  // 5. Carrossel (mantido sem alterações nesta versão — será tratado em etapa
  //    própria; o CSS de .c-carousel__* ainda está pendente)
  handleCarousel() {
    document.addEventListener('click', (e) => {
      const prevBtn = e.target.closest('[data-carousel-prev]');
      const nextBtn = e.target.closest('[data-carousel-next]');

      const btn = prevBtn || nextBtn;
      if (!btn) return;

      const targetSelector = btn.dataset.carouselPrev || btn.dataset.carouselNext;
      const carousel = this._resolve(targetSelector, 'data-carousel-prev/next', btn);
      if (!carousel) return;

      const viewport = carousel.querySelector('.c-carousel__viewport');
      if (!viewport) return;

      const scrollAmount = viewport.clientWidth;
      viewport.scrollBy({
        left: prevBtn ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    });
  },

  // 6. Formulários de demonstração: <form data-no-submit> não envia.
  //    Substitui o onsubmit="..." inline, que quebra sob CSP restritiva.
  handleForms() {
    document.addEventListener('submit', (e) => {
      if (e.target.matches?.('[data-no-submit]')) e.preventDefault();
    });
  },

  // 7. Header sticky: is-scrolled (>50px) e is-transparent (>150px)
  handleStickyHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 50);
      header.classList.toggle('is-transparent', y > 150);
    };

    update(); // estado inicial: recarregar no meio da página não espera o 1º scroll
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
  },

  // 8. Link de navegação ativo (aria-current="page")
  //    A rolagem para âncoras é nativa: o scroll-behavior e o scroll-padding-top
  //    do core.css cuidam da animação e do header sticky; o navegador move o
  //    foco e o histórico; o hashchange abaixo atualiza o aria-current.
  handleActiveNavLink() {
    if (!document.querySelectorAll('.nav-link[href^="#"]').length) return;

    this._updateActiveNavLink();
    window.addEventListener('hashchange', () => this._updateActiveNavLink());
  },

  _updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!navLinks.length) return;

    const currentHash = window.location.hash || navLinks[0].getAttribute('href');
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === currentHash) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  },

  // 9. Acessibilidade automática: o autor só escreve data-toggle e o engine
  //    completa o que o HTML não traz.
  enhanceA11y() {
    // aria-controls e estado inicial de aria-expanded em todo botão-gatilho
    document.querySelectorAll('button[data-toggle]').forEach((trigger) => {
      let target = null;
      try { target = document.querySelector(trigger.dataset.toggle); } catch { /* aviso sai no clique */ }
      if (!target) return;

      if (target.id && !trigger.hasAttribute('aria-controls')) {
        trigger.setAttribute('aria-controls', target.id);
      }
      if (!trigger.hasAttribute('aria-expanded')) {
        this._setExpanded(trigger, target.classList.contains('is-active'));
      }
    });

    // Nome acessível para [role="dialog"] sem aria-label/aria-labelledby:
    // usa o primeiro título interno.
    document.querySelectorAll('[role="dialog"]').forEach((dialog, n) => {
      if (dialog.hasAttribute('aria-label') || dialog.hasAttribute('aria-labelledby')) return;

      const heading = dialog.querySelector('h1, h2, h3, h4, h5, h6');
      if (!heading) return;

      if (!heading.id) heading.id = `caffe-dialog-title-${n + 1}`;
      dialog.setAttribute('aria-labelledby', heading.id);
    });
  },
};

// Auto-inicialização: se o script rodar antes do DOM pronto, espera; se rodar
// depois (import dinâmico, async), inicia na hora — antes, nesse caso o init()
// nunca acontecia porque o DOMContentLoaded já tinha disparado.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => UIEngine.init(), { once: true });
} else {
  UIEngine.init();
}
