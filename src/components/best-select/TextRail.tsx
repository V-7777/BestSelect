'use client';

import { useEffect, useRef, useState } from 'react';
import { T, evidenceFor } from '@/lib/best-select/constants';
import { later, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

/* Textschiene: Kicker-Pille, Headline, Unterzeile, Fußnote — plus unsichtbare
   Evidenz je Schritt für Screenreader (die visuellen Ebenen sind aria-hidden).
   Schwerer Auftritt: aus der Unschärfe nach oben in die Schärfe. */
export default function TextRail({ view }: { view: View }) {
  const railRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (lastRef.current === view.step) return;
    const rail = railRef.current;
    const next = view.step;
    const apply = () => {
      setStep(next);
      tx(rail, { y: 0, opacity: 1, blur: 0 }, { duration: view.inst ? 0 : 1.1 });
    };
    if (view.inst) {
      tx(rail, { y: 0, opacity: 1, blur: 0 }, { duration: 0 });
      apply();
    } else {
      tx(rail, { y: -12, opacity: 0, blur: 4 }, { duration: 0.4, ease: [0.4, 0, 1, 1] });
      later(() => {
        tx(rail, { y: 14, opacity: 0, blur: 7 }, { duration: 0 });
        requestAnimationFrame(apply);
      }, 460);
    }
    lastRef.current = next;
  }, [view]);

  const t = T[step];
  return (
    <div className="rail" id="rail" ref={railRef} aria-live="polite">
      <div className="kicker" id="kicker">{t.k}</div>
      <h1 id="head">{t.h}</h1>
      <div className="sub" id="sub" style={t.s ? undefined : { display: 'none' }}>{t.s || ''}</div>
      <div className="note" id="note" style={t.n ? undefined : { display: 'none' }}>{t.n || ''}</div>
      <div className="sr-only" id="sr-evidence">{evidenceFor(step)}</div>
    </div>
  );
}
