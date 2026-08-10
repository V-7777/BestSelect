import type { CSSProperties } from 'react';
import { CATS, LEAD, ROT, STEP_CATS, STEP_FINAL, STEP_RADAR, type CatKey } from '@/lib/best-select/constants';
import { ICONS } from '@/lib/best-select/placement';
import type { View } from './BestSelect';

const GLYPH = Object.fromEntries(CATS.map(c => [c.key, c.glyph])) as Record<CatKey, string>;

/* winnerOnly-Kategorien (Unternehmen): nur der Gewinner-Badge wird gerendert.
   Die übrigen Symbole dürfen nicht ins DOM — pingOut hebt im Sweep auch nie
   enthüllte Symbole kurz auf Deckkraft 1. */
const WINNER_ONLY = new Set(CATS.filter(c => c.winnerOnly).map(c => c.key));
const SHOWN = ICONS.filter(p => !WINNER_ONLY.has(p.cat) || p.win);

/* Symbol-Ebene: Platzierung ist deterministisch und steht auf Modulebene fest —
   hier ändern sich nur die Zustandsklassen (s1…s8 · sweep/done). */
export default function IconsLayer({ view }: { view: View }) {
  const { step, inst, dir } = view;
  const cls = [
    ...STEP_CATS.map((cat, i) => step >= i + 1 && 's' + (i + 1)),
    /* Vorwärts in Schritt 9: der Radar entscheidet.
       Sprung, Zurück-Navigation, ab Schritt 10: Ergebnis-Zustand ohne Choreografie. */
    step >= STEP_RADAR && ((inst || dir < 0 || step >= STEP_FINAL) ? 'done' : 'sweep'),
    /* Trichterphase: die Gewinner räumen die Karte für den Prüfstrom */
    step > STEP_FINAL && 'gone',
  ].filter(Boolean).join(' ');

  return (
    <div id="icons" aria-hidden="true" className={cls}>
      {SHOWN.map((p, i) => (
        <div
          key={i}
          className={'ico ' + p.cat + (p.win ? ' win' : '')}
          style={{
            left: p.x.toFixed(1) + 'px',
            top: p.y.toFixed(1) + 'px',
            '--in': p.delay.toFixed(2) + 's',
            '--pd': (LEAD + p.ang / 360 * ROT).toFixed(2) + 's',
          } as CSSProperties}
        >
          <svg viewBox="0 0 16 16"><use href={GLYPH[p.cat]} /></svg>
        </div>
      ))}
    </div>
  );
}
