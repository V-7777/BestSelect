'use client';

import { useEffect, useRef } from 'react';
import { CATS } from '@/lib/best-select/constants';
import { countUp, fmt, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

/* Zähler-Karte: Zeilen erscheinen mit ihrem Schritt, die Zahl läuft beim
   ersten Vorwärts-Auftritt hoch (danach steht sie sofort). Die Ziffern
   werden imperativ gesetzt — React rendert den Textknoten nie neu, weil
   sich sein JSX-Wert ('0') zwischen Renders nicht ändert. */
export default function CounterCard({ view }: { view: View }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const { step, inst, dir } = view;
    const on = step >= 1;
    tx(cardRef.current, { opacity: on ? (step >= 4 ? 0.55 : 1) : 0 }, { duration: inst ? 0 : 0.9 });
    CATS.forEach((cat, i) => {
      const row = rowRefs.current[i], num = numRefs.current[i];
      if (!row || !num) return;
      const vis = step >= i + 1;
      if (!vis) {
        tx(row, { y: 10, opacity: 0 }, { duration: inst ? 0 : 0.5 });
        return;
      }
      const fresh = !inst && dir >= 0 && step === i + 1;
      tx(row, { y: 0, opacity: 1 }, { duration: inst ? 0 : 0.9, delay: inst ? 0 : 0.15 });
      if (fresh) {
        num.textContent = '0';
        countUp(num, cat.total, i === 2 ? 2200 : 1400);
      } else {
        num.textContent = fmt(cat.total);
      }
    });
  }, [view]);

  return (
    <div id="counter" ref={cardRef} aria-hidden="true">
      <div className="core">
        {CATS.map((cat, i) => (
          <div className="crow" key={cat.key} ref={el => { rowRefs.current[i] = el; }}>
            <span className="clabel">
              <span className={'cico ci-' + cat.key}>
                <svg viewBox="0 0 16 16"><use href={cat.glyph} /></svg>
              </span>
              {cat.label}
            </span>
            <span className="cnum" ref={el => { numRefs.current[i] = el; }}>0</span>
          </div>
        ))}
      </div>
    </div>
  );
}
