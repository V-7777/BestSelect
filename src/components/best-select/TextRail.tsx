'use client';

import { useEffect, useRef, useState } from 'react';
import { T, evidenceFor } from '@/lib/best-select/constants';
import { later, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

/* Textschiene: Kicker-Pille, Headline, Unterzeile, Fußnote — plus unsichtbare
   Evidenz je Schritt für Screenreader (die visuellen Ebenen sind aria-hidden).
   Schwerer Auftritt: aus der Unschärfe nach oben in die Schärfe.
   Innerhalb der „… im Blick"-Familie (Schritte 1–7) tauscht nur das
   wechselnde Wort: die Headline ist ein zweizeiliges Lockup (.h-lead /
   .h-tail), „im Blick" und die identische Fußnote stehen still. */

const TAIL = ' im Blick';

export default function TextRail({ view }: { view: View }) {
  const railRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  const kickerRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    /* inst läuft auch bei gleichem Schritt durch (Esc mitten im Tausch darf
       die Schiene nicht unsichtbar zurücklassen) */
    if (lastRef.current === view.step && !view.inst) return;
    const rail = railRef.current;
    const next = view.step;
    const prev = T[lastRef.current], nx = T[next];
    const apply = () => {
      setStep(next);
      tx(rail, { y: 0, opacity: 1, blur: 0 }, { duration: view.inst ? 0 : 1.1 });
    };
    if (view.inst) {
      tx(rail, { y: 0, opacity: 1, blur: 0 }, { duration: 0 });
      tx(leadRef.current, { y: 0, opacity: 1, blur: 0 }, { duration: 0 });
      tx(kickerRef.current, { opacity: 1 }, { duration: 0 });
      apply();
    } else if (prev.h.endsWith(TAIL) && nx.h.endsWith(TAIL)
        && prev.n === nx.n && !prev.s && !nx.s) {
      /* Teiltausch: nur das wechselnde Wort + Kicker — der Rest steht */
      tx(leadRef.current, { y: -10, opacity: 0, blur: 4 }, { duration: 0.3, ease: [0.4, 0, 1, 1] });
      tx(kickerRef.current, { opacity: 0 }, { duration: 0.25 });
      later(() => {
        setStep(next);
        tx(leadRef.current, { y: 12, opacity: 0, blur: 6 }, { duration: 0 });
        requestAnimationFrame(() => {
          tx(leadRef.current, { y: 0, opacity: 1, blur: 0 }, { duration: 0.8 });
          tx(kickerRef.current, { opacity: 1 }, { duration: 0.5 });
        });
      }, 330);
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
      <div className="kicker" id="kicker" ref={kickerRef}>{t.k}</div>
      <h1 id="head">
        {t.h.endsWith(TAIL)
          ? <>
              <span className="h-lead" ref={leadRef}>{t.h.slice(0, -TAIL.length)}</span>
              <span className="h-tail">im Blick</span>
            </>
          : t.h}
      </h1>
      <div className="sub" id="sub" style={t.s ? undefined : { display: 'none' }}>{t.s || ''}</div>
      <div className="note" id="note" style={t.n ? undefined : { display: 'none' }}>{t.n || ''}</div>
      <div className="sr-only" id="sr-evidence">{evidenceFor(step)}</div>
    </div>
  );
}
