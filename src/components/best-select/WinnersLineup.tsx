'use client';

import { useEffect, useRef } from 'react';
import { CATS, STEP_FINAL, type CatKey } from '@/lib/best-select/constants';
import { WINNER_ICONS } from '@/lib/best-select/placement';
import { DROP_Y, LINE_DX, LINE_Y } from '@/lib/best-select/funnel';
import { later, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

const GLYPH = Object.fromEntries(CATS.map(c => [c.key, c.glyph])) as Record<CatKey, string>;

/* Aufstellung (Schritt 11): Die neun Gewinner räumen die Karte nicht mehr —
   sie treten unter der Schlagzeile in einer Reihe an und fallen dann einzeln
   in den Trichter. Choreografiert werden Klone: die Original-Symbole
   (.ico.win) tragen CSS-Transitions auf transform, die mit Motion-Inline-
   Transforms kollidieren würden; die Klone gehören Motion allein. Die
   Übernahme geschieht im selben Frame — #icons.gone .win verschwindet ohne
   Transition (CSS), während hier jeder Klon auf der Kartenposition erscheint. */

const LX = (i: number) => 800 + (i - 4) * LINE_DX;
/* Startgröße = Anzeigegröße der Karten-Gewinner: Standard --ws 1.4 auf 38px;
   der Fonds-Gewinner ist ein 23px-Symbol bei --ws 1.7 → 39.1/38 ≈ 1.03 */
const startScale = (cat: CatKey) => (cat === 'fonds' ? 1.03 : 1.4);

export default function WinnersLineup({ view }: { view: View }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const { step, inst, dir } = view;
    const s = step - STEP_FINAL;
    if (s === 1 && dir >= 0 && !inst) {
      refs.current.forEach((el, i) => {
        if (!el) return;
        const p = WINNER_ICONS[i];
        /* Übernahme auf der Kartenposition, Flug in die Reihe, dann der
           Fall hinter das Trichterglas — links beginnend, im Strom-Takt */
        tx(el, { x: p.x, y: p.y, scale: startScale(p.cat), opacity: 1 }, { duration: 0 });
        tx(el, { x: LX(i), y: LINE_Y, scale: 1.4 },
          { duration: 1.1, delay: 0.05 + i * 0.06, ease: [0.32, 0.72, 0, 1] });
        later(() => {
          tx(el, { y: DROP_Y, scale: 0.3 }, { duration: 0.6, ease: [0.5, 0, 0.85, 0.6] });
          tx(el, { opacity: 0 }, { duration: 0.25, delay: 0.35 });
        }, 1900 + i * 260);
      });
    } else {
      /* Endzustand: unsichtbar (gefallen bzw. noch auf der Karte) — deckt
         Sprung, Settle, Zurück-Navigation und Neustart deterministisch ab */
      refs.current.forEach((el, i) => {
        if (!el) return;
        const p = WINNER_ICONS[i];
        tx(el, { x: s >= 1 ? LX(i) : p.x, y: s >= 1 ? DROP_Y : p.y, scale: 0.3, opacity: 0 },
          { duration: inst ? 0 : 0.4 });
      });
    }
  }, [view]);

  return (
    <div id="lineup" aria-hidden="true">
      {WINNER_ICONS.map((p, i) => (
        <div key={p.cat} className={'lico ' + p.cat + ' win'}
          ref={el => { refs.current[i] = el; }}>
          <svg viewBox="0 0 16 16"><use href={GLYPH[p.cat]} /></svg>
        </div>
      ))}
    </div>
  );
}
