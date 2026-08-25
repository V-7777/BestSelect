import Link from 'next/link';
import type { MouseEvent } from 'react';

/* Hinweis-Pille unten links: Nested CTA — der Pfeil sitzt in eigenem Kreis
   bündig am inneren Rand. Am Finale wird daraus das Kapitelende-Paar, das
   alle Kapitel teilen: „Nochmal" startet die Präsentation neu, „Zurück zur
   Übersicht" führt zum Index (Kapitelwahl). Echte Bedienelemente: fokussierbar,
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
        <button type="button" className="hint-pill" onClick={onRestart}>
          <span>Nochmal</span>
          <span className="hint-ico" aria-hidden="true">
            <svg viewBox="0 0 16 16" className="g-restart" fill="none" stroke="currentColor"
              strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13 2.6V5h-2.4" />
            </svg>
          </span>
        </button>
        <Link
          href="/"
          className="hint-pill quiet"
          onClick={e => e.stopPropagation()}
        >
          <span>Zurück zur Übersicht</span>
          <span className="hint-ico" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
              strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.8 8H3.4M7.1 4.3 3.4 8l3.7 3.7" />
            </svg>
          </span>
        </Link>
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
