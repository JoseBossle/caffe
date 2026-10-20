/**
 * CAFFE CORE - Utilitários genéricos, sem dependência de nenhum componente.
 * Import isolado propositalmente: qualquer parte do engine.js (ou futuros
 * módulos) pode reaproveitar essas funções sem precisar do motor inteiro.
 */

/**
 * Agrupa chamadas repetidas de um callback para no máximo uma execução por
 * frame de animação (requestAnimationFrame). Usado para eventos de alta
 * frequência como 'scroll' e 'resize'.
 */
export function rafThrottle(fn) {
  let scheduled = false;

  return function throttled(...args) {
    if (scheduled) return;
    scheduled = true;
    const ctx = this;

    requestAnimationFrame(() => {
      fn.apply(ctx, args);
      scheduled = false;
    });
  };
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), ' +
  'input:not([disabled]), select:not([disabled]), ' +
  '[tabindex]:not([tabindex="-1"])';

/**
 * Retorna, na ordem do DOM, os elementos focáveis dentro de um container.
 *
 * A checagem de "visível" usa getClientRects() (vazio só quando o elemento não
 * gera caixa: display:none). Não usa offsetParent — que é null em elementos
 * position:fixed — nem a propriedade visibility, que ainda pode estar em
 * transição (hidden) no instante em que um overlay acabou de abrir.
 */
export function getFocusable(container) {
  if (!container) return [];

  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0 || el === document.activeElement
  );
}

/**
 * Prende a navegação por Tab/Shift+Tab dentro de `container` enquanto ele
 * estiver aberto. O listener fica no document (não no container): assim o
 * trap também funciona se, por qualquer motivo, o foco inicial não chegou a
 * entrar no painel — o próximo Tab traz o foco de volta para dentro.
 *
 * @param {HTMLElement} container
 * @returns {Function} releaseTrap — remove o listener; chamar ao fechar
 */
export function trapFocus(container) {
  if (!container) return () => {};

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusable(container);
    if (!focusable.length) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (!container.contains(active)) {
      // Foco fora do painel: traz de volta
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', handleKeydown);

  return function releaseTrap() {
    document.removeEventListener('keydown', handleKeydown);
  };
}
