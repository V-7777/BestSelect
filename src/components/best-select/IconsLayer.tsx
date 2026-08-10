import type { CSSProperties } from 'react';
import { CATS, LEAD, ROT, type CatKey } from '@/lib/best-select/constants';
import { ICONS } from '@/lib/best-select/placement';
import type { View } from './BestSelect';

const GLYPH = Object.fromEntries(CATS.map(c => [c.key, c.glyph])) as Record<CatKey, string>;

/* Symbol-Ebene: Platzierung ist deterministisch und steht auf Modulebene fest —
   hier ändern sich nur die Zustandsklassen (s1/s2/s3 · sweep/done). */
export default function IconsLayer({ view }: { view: View }) {
  const { step, inst, dir } = view;
  const cls = [
    step >= 1 && 's1',
    step >= 2 && 's2',
    step >= 3 && 's3',
    /* Vorwärts in Schritt 4: der Radar entscheidet.
       Sprung, Zurück-Navigation, Schritt 05: Ergebnis-Zustand ohne Choreografie. */
    step >= 4 && ((inst || dir < 0 || step === 5) ? 'done' : 'sweep'),
  ].filter(Boolean).join(' ');

  return (
    <div id="icons" aria-hidden="true" className={cls}>
      {ICONS.map((p, i) => (
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
