import { useEffect } from 'react';
export function useDialogAccessibility() {
  useEffect(() => {
    const stack: { dialog: HTMLElement; previous: HTMLElement | null }[] = [];
    const focusable = (d: HTMLElement) =>
      Array.from(
        d.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), a[href], summary, [tabindex="0"]',
        ),
      ).filter((e) => e.getClientRects().length > 0);
    const top = () => Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).at(-1);
    const check = () => {
      const d = top();
      while (stack.length && !document.contains(stack.at(-1)!.dialog)) {
        const v = stack.pop()!;
        if (v.previous && document.contains(v.previous)) v.previous.focus();
      }
      if (d && !stack.some((v) => v.dialog === d)) {
        stack.push({
          dialog: d,
          previous: document.activeElement instanceof HTMLElement ? document.activeElement : null,
        });
        focusable(d)[0]?.focus();
      }
      document.body.style.overflow = d ? 'hidden' : '';
    };
    const key = (e: KeyboardEvent) => {
      const d = top();
      if (!d) return;
      const items = focusable(d);
      if (e.key === 'Escape') {
        e.preventDefault();
        (
          d.querySelector<HTMLElement>('.modal-close') ??
          d.querySelector<HTMLElement>('.modal-actions .secondary')
        )?.click();
      } else if (e.key === 'Tab' && items.length) {
        const first = items[0],
          last = items.at(-1)!;
        if (
          e.shiftKey &&
          (document.activeElement === first || !d.contains(document.activeElement))
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || !d.contains(document.activeElement))
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', key);
    check();
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', key);
      document.body.style.overflow = '';
    };
  }, []);
}
