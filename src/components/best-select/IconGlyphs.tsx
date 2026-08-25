/* Symbol-Glyphen (einmal definiert, per <use> referenziert) */
export default function IconGlyphs() {
  return (
    <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <symbol id="g-bank" viewBox="0 0 16 16">
          <path d="M2.5 6.5 L8 3 L13.5 6.5 M4 6.5 V11.5 M6.7 6.5 V11.5 M9.3 6.5 V11.5 M12 6.5 V11.5 M2.5 13 H13.5"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-shield" viewBox="0 0 16 16">
          <path d="M8 2 L13 3.8 V7.6 C13 10.9 8 13.8 8 13.8 C8 13.8 3 10.9 3 7.6 V3.8 Z"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-chart" viewBox="0 0 16 16">
          <path d="M2.5 12.5 L6.5 8.5 L9 10.5 L13.5 5 M10.9 5 H13.5 V7.6"
            fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-home" viewBox="0 0 16 16">
          <path d="M2.8 8 L8 3.2 L13.2 8 M4.6 6.9 V12.8 H11.4 V6.9"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-case" viewBox="0 0 16 16">
          <path d="M3 6 H13 V12.5 H3 Z M6.3 6 V4.3 H9.7 V6 M3 9 H13"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-tower" viewBox="0 0 16 16">
          <path d="M3.6 12.8 V7 H7.4 V12.8 M8.9 12.8 V3.4 H12.7 V12.8 M2.2 12.8 H13.8"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-percent" viewBox="0 0 16 16">
          <path d="M12.4 3.6 L3.6 12.4 M6.3 4.9 A1.5 1.5 0 1 1 3.3 4.9 A1.5 1.5 0 1 1 6.3 4.9 M12.7 11.1 A1.5 1.5 0 1 1 9.7 11.1 A1.5 1.5 0 1 1 12.7 11.1"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-euro" viewBox="0 0 16 16">
          <path d="M12 4.4 A4.6 4.6 0 1 0 12 11.6 M3.2 6.8 H9.4 M3.2 9.2 H8.8"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        {/* Typ-Glyphen der Prüfkarten (Schritte 11–16): Unternehmen · Tarif */}
        <symbol id="g-org" viewBox="0 0 16 16">
          <path d="M6.5 2.8 H9.5 V5.4 H6.5 Z M2.8 10.6 H5.8 V13.2 H2.8 Z M10.2 10.6 H13.2 V13.2 H10.2 Z M8 5.4 V8 M4.3 10.6 V8 H11.7 V10.6"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-doc" viewBox="0 0 16 16">
          <path d="M4.2 2.5 H9.3 L11.8 5 V13.5 H4.2 Z M9.3 2.5 V5 H11.8 M6.3 8.2 H9.7 M6.3 10.6 H9.7"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        {/* Lebenslinie (Kapitel 7 — Status Quo): Heute · Hochzeit · Nachwuchs ·
            Gehaltserhöhung · Häkchen der Aktualisierungen (Neuer Job = g-case) */}
        <symbol id="g-today" viewBox="0 0 16 16">
          <path d="M12.6 8 A4.6 4.6 0 1 1 3.4 8 A4.6 4.6 0 1 1 12.6 8"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        </symbol>
        <symbol id="g-rings" viewBox="0 0 16 16">
          <path d="M9.4 8.5 A3.4 3.4 0 1 1 2.6 8.5 A3.4 3.4 0 1 1 9.4 8.5 M13.4 8.5 A3.4 3.4 0 1 1 6.6 8.5 A3.4 3.4 0 1 1 13.4 8.5"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-child" viewBox="0 0 16 16">
          <path d="M7.4 4.6 A1.8 1.8 0 1 1 3.8 4.6 A1.8 1.8 0 1 1 7.4 4.6 M2.4 13 V11.4 A3.2 3 0 0 1 8.8 11.4 V13 M13 7.4 A1.4 1.4 0 1 1 10.2 7.4 A1.4 1.4 0 1 1 13 7.4 M9.4 13 V12 A2.2 2 0 0 1 13.8 12 V13"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-raise" viewBox="0 0 16 16">
          <path d="M8 12.6 V3.8 M4.6 7.2 L8 3.8 L11.4 7.2 M3.4 12.6 H12.6"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        {/* Rente: Sonne am Horizont */}
        <symbol id="g-sun" viewBox="0 0 16 16">
          <path d="M4.2 10.6 A3.8 3.8 0 0 1 11.8 10.6 M2.4 10.6 H13.6 M8 3.2 V4.6 M3.4 5.2 L4.4 6.2 M12.6 5.2 L11.6 6.2 M3.2 13.2 H12.8"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="g-check" viewBox="0 0 16 16">
          <path d="M3.4 8.4 L6.6 11.6 L12.6 5.2"
            fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        {/* Strategie-Kapitel: Ziel (Zielscheibe) · Ausgaben (Geldbörse) */}
        <symbol id="g-target" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="5.3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="1.7" fill="currentColor" />
          <path d="M8 1.6 V3.4 M8 12.6 V14.4 M1.6 8 H3.4 M12.6 8 H14.4"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </symbol>
        <symbol id="g-wallet" viewBox="0 0 16 16">
          <path d="M2.5 5.6 H12.2 A1.3 1.3 0 0 1 13.5 6.9 V12.2 A1.3 1.3 0 0 1 12.2 13.5 H3.8 A1.3 1.3 0 0 1 2.5 12.2 Z M2.5 5.6 V4.1 A1.3 1.3 0 0 1 3.8 2.8 H10.6 V5.6 M13.5 8.6 H10.6 A1 1 0 0 0 10.6 10.6 H13.5"
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
      </defs>
    </svg>
  );
}
