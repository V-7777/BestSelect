/* Hinweis-Pille unten links: Nested CTA — der Pfeil sitzt in eigenem Kreis
   bündig am inneren Rand. Am letzten Schritt wechselt das Glyph auf Neustart. */
export default function HintPill({ restart }: { restart: boolean }) {
  return (
    <div className="meta" id="hint">
      <span className={'hint-pill' + (restart ? ' is-restart' : '')} id="hint-pill">
        <span id="hint-label">
          {restart ? 'Klicken für Neustart' : 'Klicken für den nächsten Schritt'}
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
      </span>
    </div>
  );
}
