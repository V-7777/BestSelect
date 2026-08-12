'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { CATS, STEP_FINAL, type CatKey } from '@/lib/best-select/constants';
import { WINNER_ICONS } from '@/lib/best-select/placement';
import { DROP_Y, LINE_DX, LINE_Y } from '@/lib/best-select/funnel';
import { later, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

const GLYPH = Object.fromEntries(CATS.map(c => [c.key, c.glyph])) as Record<CatKey, string>;

/* Aufstellung (Schritt 11): Die acht Gewinner räumen die Karte nicht mehr —
   sie treten unter der Schlagzeile in einer Reihe an und fallen dann einzeln
   in den Trichter. Choreografiert werden Klone: die Original-Symbole
   (.ico.win) tragen CSS-Transitions auf transform, die mit Motion-Inline-
   Transforms kollidieren würden; die Klone gehören Motion allein. Die
   Übernahme geschieht im selben Frame — #icons.gone .win verschwindet ohne
   Transition (CSS), während hier jeder Klon auf der Kartenposition erscheint. */

const LX = (i: number) => 800 + (i - 3.5) * LINE_DX;   /* 8 Gewinner, mittig um 800 */
/* Startgröße = Anzeigegröße der Karten-Gewinner: Standard --ws 1.4 auf 38px;
   der Fonds-Gewinner ist ein 23px-Symbol bei --ws 1.7 → 39.1/38 ≈ 1.03 */
const startScale = (cat: CatKey) => (cat === 'fonds' ? 1.03 : 1.4);

/* Layout-Effekt: die Übernahme muss VOR dem Paint sitzen, in dem
   #icons.gone die Originale versteckt — sonst blitzt ein leerer Frame.
   (SSR-sicher: auf dem Server fällt er auf useEffect zurück.) */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function WinnersLineup({ view }: { view: View }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useIsoLayoutEffect(() => {
    const { step, inst, dir } = view;
    const s = step - STEP_FINAL;
    if (s === 1 && dir >= 0 && !inst) {
      /* Übernahme auf der Kartenposition, dann gleiten alle nacheinander
         (links → rechts) auf ihren Platz in der Reihe — ruhig, mit Masse.
         Erst wenn die Reihe steht, beginnen die Fälle in den Trichter.
         Der Seed muss ÜBER Motion laufen (nie per Inline-Stil: Motion rendert
         jede Eigenschaft aus seinem eigenen Wertespeicher und überschriebe
         den Stil), und der Flug startet einen Tick später — sonst liest er
         seine Startwerte, bevor der Seed im Speicher angekommen ist. */
      refs.current.forEach((el, i) => {
        if (!el) return;
        const p = WINNER_ICONS[i];
        tx(el, { x: p.x, y: p.y, scale: startScale(p.cat), opacity: 1 }, { duration: 0 });
      });
      later(() => {
        refs.current.forEach((el, i) => {
          if (!el) return;
          tx(el, { x: LX(i), y: LINE_Y, scale: 1.4 },
            { duration: 1.896, delay: 0.05 + i * 0.09, ease: [0.22, 1, 0.36, 1] });
          later(() => {
            /* Volle Deckkraft über den ganzen Fall (Mund abs 496, erreicht
               bei ~0.58s) — das Verschlucken übernimmt der deckende Korpus
               (z2); der Rest-Fade läuft nach der Landung unsichtbar hinter
               dem Glas (Delay = 1 Takt = Falldauer). */
            tx(el, { y: DROP_Y, scale: 0.3 }, { duration: 0.632, ease: [0.5, 0, 0.85, 0.6] });
            tx(el, { opacity: 0 }, { duration: 0.158, delay: 0.632 });
          }, 2844 + i * 220);
        });
      }, 50);
    } else {
      /* Endzustand: unsichtbar (gefallen bzw. noch auf der Karte) — deckt
         Sprung, Settle, Zurück-Navigation und Neustart deterministisch ab.
         Auf der Karte parken die Klone in Gewinner-Größe: ein späterer
         Vorwärts-Flug startet damit selbst im Renn-Fall vom richtigen Look. */
      refs.current.forEach((el, i) => {
        if (!el) return;
        const p = WINNER_ICONS[i];
        tx(el, {
          x: s >= 1 ? LX(i) : p.x,
          y: s >= 1 ? DROP_Y : p.y,
          scale: s >= 1 ? 0.3 : startScale(p.cat),
          opacity: 0,
        }, { duration: inst ? 0 : 0.316 });
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
