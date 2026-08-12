'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { CATS, STEP_FINAL, STEP_RADAR } from '@/lib/best-select/constants';
import { countUp, fmt, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

/* Zähler-Karte: Zeilen erscheinen mit ihrem Schritt, die Zahl läuft beim
   ersten Vorwärts-Auftritt hoch (danach steht sie sofort). Die Ziffern
   werden imperativ gesetzt — React rendert den Textknoten nie neu, weil
   sich sein JSX-Wert ('0') zwischen Renders nicht ändert.
   --rows lässt die Glasplatte mit ihren Zeilen wachsen (Höhe im CSS).
   Die DOM-Reihenfolge bleibt fest (SSR-stabil) — die gemischte Auftritts-
   folge sortiert die Zeilen rein visuell über flex order: die zuerst
   gezeigte Kategorie steht oben, jede neue landet darunter. */
export default function CounterCard({ view, order }: { view: View; order: number[] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const { step, inst, dir } = view;
    /* Ab der Trichterphase verabschiedet sich die Marktleiter — die Bühne
       gehört dem Trichter */
    const on = step >= 1 && step <= STEP_FINAL;
    /* Radar-Phase: zurücknehmen, aber lesbar bleiben — 0.78 hält die
       Zeilenbeschriftungen mit Reserve über dem AA-Kontrast */
    tx(cardRef.current, { opacity: on ? (step >= STEP_RADAR ? 0.78 : 1) : 0 }, { duration: inst ? 0 : 0.632 });
    CATS.forEach((cat, i) => {
      const row = rowRefs.current[i], num = numRefs.current[i];
      if (!row || !num) return;
      const pos = order.indexOf(i) + 1;   /* Schritt, mit dem diese Zeile auftritt */
      const vis = step >= pos;
      if (!vis) {
        tx(row, { y: -14, opacity: 0 }, { duration: inst ? 0 : 0.474 });
        return;
      }
      const fresh = !inst && dir >= 0 && step === pos;
      /* Landung von oben: fallen und aufsetzen (ease-out-quint, kein Wippen) */
      tx(row, { y: 0, opacity: 1 },
        { duration: inst ? 0 : 0.632, delay: inst ? 0 : 0.158, ease: [0.22, 1, 0.36, 1] });
      if (fresh) {
        num.textContent = '0';
        countUp(num, cat.total, cat.key === 'fonds' ? 1896 : 1264);
      } else {
        num.textContent = fmt(cat.total);
      }
    });
  }, [view, order]);

  const rows = Math.max(1, Math.min(view.step, CATS.length));
  return (
    <div id="counter" ref={cardRef} aria-hidden="true"
      style={{ '--rows': rows } as CSSProperties}>
      <div className="core">
        {CATS.map((cat, i) => (
          <div className="crow" key={cat.key} ref={el => { rowRefs.current[i] = el; }}
            style={{ order: order.indexOf(i) } as CSSProperties}>
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
