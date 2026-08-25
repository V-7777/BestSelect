import type { CSSProperties } from 'react';
import { CATS, LEAD, ROT, STEP_FINAL, STEP_RADAR, type CatKey } from '@/lib/best-select/constants';
import { ICONS } from '@/lib/best-select/placement';
import type { View } from './BestSelect';

const GLYPH = Object.fromEntries(CATS.map(c => [c.key, c.glyph])) as Record<CatKey, string>;

/* Symbol-Ebene: Platzierung ist deterministisch und steht auf Modulebene fest —
   hier ändern sich nur die Zustandsklassen. Welche Kategorie mit welchem
   Schritt auftritt, bestimmt die gemischte Reihenfolge (order): ein Symbol
   trägt .on, sobald der Schritt die Position seiner Kategorie erreicht. */
export default function IconsLayer({ view, order }: { view: View; order: number[] }) {
  const { step, inst, dir } = view;
  const stepOf = {} as Record<CatKey, number>;
  order.forEach((ci, p) => { stepOf[CATS[ci].key] = p + 1; });
  const cls = [
    /* Vorwärts in Schritt 9: der Radar entscheidet.
       Sprung, Zurück-Navigation, ab Schritt 10: Ergebnis-Zustand ohne Choreografie. */
    step >= STEP_RADAR && ((inst || dir < 0 || step >= STEP_FINAL) ? 'done' : 'sweep'),
    /* Trichterphase: die Gewinner räumen die Karte für die Lichtkreise */
    step > STEP_FINAL && 'gone',
  ].filter(Boolean).join(' ');

  return (
    <div id="icons" aria-hidden="true" className={cls}>
      {ICONS.map((p, i) => (
        <div
          key={i}
          className={'ico ' + p.cat + (p.win ? ' win' : '') + (step >= stepOf[p.cat] ? ' on' : '')}
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
