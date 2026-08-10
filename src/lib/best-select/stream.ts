/* Prüfstrom (Schritt 11) — deterministisch wie placement.ts: läuft einmal
   auf Modulebene, Server und Client rechnen identisch (kein Hydration-
   Mismatch). Die Werte liegen fertig formatiert mit Einheit vor, damit die
   Inline-Styles byte-identisch serialisiert werden.

   54 Symbole im Rundlauf durch alle neun Kategorien: sichtbar mehr als
   neun — der Strom steht für den ganzen Markt, der durch den Trichter
   geprüft wird. Start breit über dem Trichtermund, Ziel gebündelt auf der
   Auslauf-Achse; der Trichterkorpus (z2) verdeckt das Eintauchen. */

import { CATS, type CatKey } from './constants';
import { mulberry32 } from './placement';

export interface StreamIcon {
  key: CatKey;
  glyph: string;
  x0: string;   /* Start-X über dem Trichtermund */
  x1: string;   /* Ziel-X auf der Auslauf-Achse */
  d: string;    /* Startverzögerung */
  dur: string;  /* Falldauer */
}

const N_STREAM = 54;

function buildStream(): StreamIcon[] {
  const rng = mulberry32(1111);
  const out: StreamIcon[] = [];
  for (let i = 0; i < N_STREAM; i++) {
    const cat = CATS[i % CATS.length];
    out.push({
      key: cat.key,
      glyph: cat.glyph,
      x0: (560 + rng() * 480).toFixed(1) + 'px',
      x1: (782 + rng() * 36).toFixed(1) + 'px',
      d: (0.8 + i * 0.04 + rng() * 0.03).toFixed(2) + 's',
      dur: (0.7 + rng() * 0.25).toFixed(2) + 's',
    });
  }
  return out;
}

export const STREAM: StreamIcon[] = buildStream();
