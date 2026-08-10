/* Animations-Wrapper um Motion + Sequenz-Token für abbrechbare Verzögerungen.
   Portiert die tx()/later()/countUp()-Helfer aus best-select-v3.html. */

import { animate } from 'motion';

export const EASE: [number, number, number, number] = [0.76, 0, 0.1, 1];

export function reduced(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Sequenz-Token: jeder Schrittwechsel erhöht seq (bump), wodurch alle noch
   ausstehenden later()-Callbacks und laufenden countUp()-Frames verfallen. */
let seq = 0;
export function bump(): void { seq++; }

export function later(fn: () => void, ms: number): void {
  const my = seq;
  setTimeout(function () { if (my === seq) fn(); }, reduced() ? 0 : ms);
}

export interface TxProps { x?: number; y?: number; scale?: number; opacity?: number; blur?: number }
export interface TxOpts { duration?: number; delay?: number; ease?: [number, number, number, number] }

/* blur: nur für die Textschiene — ein kleiner Kasten, der ohnehin bei jedem
   Schritt neu gesetzt wird. Nie auf der Symbol-Ebene verwenden. */
export function tx(el: Element | null, p: TxProps, o: TxOpts = {}): void {
  if (!el) return;
  const d = reduced() ? 0 : (o.duration === undefined ? 1.5 : o.duration);
  const dl = reduced() ? 0 : (o.delay || 0);
  const t: Record<string, number | string> = {};
  if (p.x !== undefined) t.x = p.x;
  if (p.y !== undefined) t.y = p.y;
  if (p.scale !== undefined) t.scale = p.scale;
  if (p.opacity !== undefined) t.opacity = p.opacity;
  if (p.blur !== undefined) t.filter = 'blur(' + p.blur + 'px)';
  animate(el, t, { duration: d, delay: dl, ease: o.ease || EASE });
}

export function pad(n: number): string { return (n < 10 ? '0' : '') + n; }
export function fmt(n: number): string { return n.toLocaleString('de-DE'); }

export function countUp(el: HTMLElement, target: number, dur: number): void {
  if (reduced()) { el.textContent = fmt(target); return; }
  const my = seq;
  let t0: number | null = null;
  function frame(t: number) {
    if (my !== seq) return;
    if (t0 === null) t0 = t;
    let p = Math.min(1, (t - t0) / dur);
    p = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(Math.round(target * p));
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
