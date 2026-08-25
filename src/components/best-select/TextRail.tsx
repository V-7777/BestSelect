import { evidenceFor } from '@/lib/best-select/constants';
import type { View } from './BestSelect';

/* Textschiene: steht die GANZE Vorführung buchstäblich still — Titel und
   Unterzeile, kein Kicker, kein Tausch. Nur die unsichtbare Screenreader-
   Evidenz wandert mit dem Schritt (aria-live); die visuellen Ebenen sind
   aria-hidden. */
export default function TextRail({ view, order }: { view: View; order: number[] }) {
  return (
    <div className="rail" id="rail" aria-live="polite">
      <h1 id="head">Weitblick Best Select</h1>
      <div className="sub" id="sub">Der ganze Markt. Eine Empfehlung.</div>
      <div className="sr-only" id="sr-evidence">{evidenceFor(view.step, order)}</div>
    </div>
  );
}
