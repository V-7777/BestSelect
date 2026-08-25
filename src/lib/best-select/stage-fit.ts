/* Bühnen-Fit: skaliert eine feste Pixel-Bühne (w×h) in den Viewport —
   extrahiert aus BestSelect, damit alle Kapitel dieselbe Zoom-Logik teilen.

   fit 'contain': die ganze Bühne bleibt sichtbar (Letterbox) — die
   Präsentation auf der Nachtkarte. fit 'cover': die Bühne füllt den
   Viewport randlos, Überstand wird beschnitten — Foto-Kapitel, deren
   Inhalte pixelgenau auf dem Bild sitzen müssen (Bühnen-Koordinaten
   bleiben 1:1 Bild-Koordinaten).

   Browser-Zoom darf die Bühne wirklich vergrößern (Barrierefreiheit):
   Zoom hebt devicePixelRatio an — die Skalierung wächst mit und der
   Viewport wird scrollbar statt die Vergrößerung wegzurechnen.
   Aber: auch ein Monitorwechsel ändert devicePixelRatio (Laptop 2× →
   Beamer 1× — der Ernstfall im Termin). Dann wird die Basis neu geeicht
   statt skaliert, sonst halbiert/verdoppelt sich die Bühne beim Rüberziehen.
   Unterscheidung über die Bildschirm-Identität: Zoom lässt in Chromium
   die CSS-Maße (screen.*) stehen, in Firefox die physischen Maße
   (screen.* · dpr); die availLeft/Top-Origin trennt gleichgroße Monitore.
   Ändern sich CSS- UND Physik-Signatur, ist es ein anderer Bildschirm. */

import { useEffect, type RefObject } from 'react';

export interface StageFitOpts {
  w: number;
  h: number;
  fit: 'contain' | 'cover';
}

export function useStageFit(
  viewportRef: RefObject<HTMLDivElement | null>,
  stageRef: RefObject<HTMLDivElement | null>,
  { w, h, fit }: StageFitOpts,
): void {
  useEffect(() => {
    const viewport = viewportRef.current, stage = stageRef.current;
    if (!viewport || !stage) return;
    const screenKeys = () => {
      const d = window.devicePixelRatio || 1;
      const scr = window.screen as Screen & { availLeft?: number; availTop?: number };
      const l = scr.availLeft ?? 0, t = scr.availTop ?? 0;
      const r = (v: number) => Math.round(v / 8);   /* Rundungsjitter schlucken */
      return {
        css: `${scr.width},${scr.height},${l},${t}`,
        phys: `${r(scr.width * d)},${r(scr.height * d)},${r(l * d)},${r(t * d)}`,
      };
    };
    let baseDpr = window.devicePixelRatio || 1;
    let last = { dpr: baseDpr, ...screenKeys() };
    function fitStage() {
      if (!viewport || !stage) return;
      const dpr = window.devicePixelRatio || 1;
      const k = screenKeys();
      if (dpr !== last.dpr && k.css !== last.css && k.phys !== last.phys) {
        baseDpr = dpr;             /* anderer Bildschirm: neu eichen, Zoom = 1 */
      }
      last = { dpr, ...k };
      const zoom = dpr / baseDpr;
      const base = fit === 'cover'
        ? Math.max(window.innerWidth / w, window.innerHeight / h)
        : Math.min(window.innerWidth / w, window.innerHeight / h);
      const s = base * Math.max(1, zoom);
      /* cover überragt den Viewport schon bei Zoom 1 — der Beschnitt ist
         gewollt und darf nicht scrollen; erst echter Zoom öffnet Scrollen */
      const over = (fit === 'contain' || zoom > 1) &&
        (w * s > window.innerWidth + 1 || h * s > window.innerHeight + 1);
      document.documentElement.style.overflow = over ? 'auto' : 'hidden';
      document.body.style.overflow = over ? 'auto' : 'hidden';
      if (over) {
        viewport.style.position = 'absolute';
        viewport.style.width = Math.max(window.innerWidth, Math.ceil(w * s)) + 'px';
        viewport.style.height = Math.max(window.innerHeight, Math.ceil(h * s)) + 'px';
      } else {
        viewport.style.position = 'fixed';
        viewport.style.width = '';
        viewport.style.height = '';
      }
      stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    }
    /* resize feuert beim Monitorwechsel nicht in jedem Browser — eine
       matchMedia-Kette auf die jeweils aktuelle Auflösung schließt die Lücke
       und wird nach jedem dpr-Wechsel neu gespannt */
    let mq: MediaQueryList | null = null;
    const onDprChange = () => { fitStage(); armDprWatch(); };
    const armDprWatch = () => {
      mq?.removeEventListener('change', onDprChange);
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      mq.addEventListener('change', onDprChange);
    };
    window.addEventListener('resize', fitStage);
    armDprWatch();
    fitStage();
    return () => {
      window.removeEventListener('resize', fitStage);
      mq?.removeEventListener('change', onDprChange);
    };
  }, [viewportRef, stageRef, w, h, fit]);
}
