import type { MouseEvent } from 'react';

/* Hinweis-Pille unten links: Nested CTA — der Pfeil sitzt in eigenem Kreis
   bündig am inneren Rand. Am letzten Schritt wechselt das Glyph auf Neustart.
   Ein echter <button>: fokussierbar, Enter/Leertaste funktionieren, und am
   Finale ist er der einzige Klickweg zum Neustart (die Bühne ist dort inert). */
export default function HintPill({ restart, onAdvance }: {
  restart: boolean;
  onAdvance: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="meta" id="hint">
      <button
        type="button"
        className={'hint-pill' + (restart ? ' is-restart' : '')}
        id="hint-pill"
        onClick={onAdvance}
      >
        {/* Substantivische Labels: „Nächster Schritt" benennt, was der Knopf
            tut — „Klicken für …" liest sich auf dem geteilten Bildschirm als
            Aufforderung an den Kunden, der gar nicht bedienen soll. */}
        <span id="hint-label">
          {restart ? 'Neustart' : 'Nächster Schritt'}
        </span>
        <span className="hint-ico" aria-hidden="true">
          <svg viewBox="0 0 16 16" className="g-next" fill="none" stroke="currentColor"
            strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.2 8h9.4M8.9 4.3 12.6 8l-3.7 3.7" />
          </svg>
          <svg viewBox="0 0 16 16" className="g-restart" fill="none" stroke="currentColor"
            strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13 2.6V5h-2.4" />
          </svg>
        </span>
      </button>
    </div>
  );
}
