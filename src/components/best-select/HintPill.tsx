import Link from 'next/link';
import type { MouseEvent } from 'react';

/* Hinweis-Pille unten links: Nested CTA — der Pfeil sitzt in eigenem Kreis
   bündig am inneren Rand. Am Finale wird daraus ein Pillen-Paar: primär
   führt der Link ins Strategie-Kapitel (die Chronologie), sekundär startet
   der Knopf die Präsentation neu. Echte Bedienelemente: fokussierbar,
   Enter/Leertaste funktionieren, und am Finale sind sie der einzige
   Klickweg (die Bühne ist dort inert). */
export default function HintPill({ restart, onAdvance, onRestart }: {
  restart: boolean;
  onAdvance: (e: MouseEvent<HTMLButtonElement>) => void;
  onRestart: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  if (restart) {
    return (
      <div className="meta" id="hint">
        <Link
          href="/strategie"
          className="hint-pill"
          onClick={e => e.stopPropagation()}
        >
          {/* Substantivisch: benennt das nächste Kapitel, keine Aufforderung */}
          <span>Weiter: Strategie</span>
          <span className="hint-ico" aria-hidden="true">
            <svg viewBox="0 0 16 16" className="g-next" fill="none" stroke="currentColor"
              strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.2 8h9.4M8.9 4.3 12.6 8l-3.7 3.7" />
            </svg>
          </span>
        </Link>
        <button type="button" className="hint-pill quiet" onClick={onRestart}>
          <span>Neustart</span>
          <span className="hint-ico" aria-hidden="true">
            <svg viewBox="0 0 16 16" className="g-restart" fill="none" stroke="currentColor"
              strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13 2.6V5h-2.4" />
            </svg>
          </span>
        </button>
      </div>
    );
  }
  return (
    <div className="meta" id="hint">
      <button
        type="button"
        className="hint-pill"
        id="hint-pill"
        onClick={onAdvance}
      >
        {/* Substantivische Labels: „Nächster Schritt" benennt, was der Knopf
            tut — „Klicken für …" liest sich auf dem geteilten Bildschirm als
            Aufforderung an den Kunden, der gar nicht bedienen soll. */}
        <span id="hint-label">Nächster Schritt</span>
        <span className="hint-ico" aria-hidden="true">
          <svg viewBox="0 0 16 16" className="g-next" fill="none" stroke="currentColor"
            strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.2 8h9.4M8.9 4.3 12.6 8l-3.7 3.7" />
          </svg>
        </span>
      </button>
    </div>
  );
}
