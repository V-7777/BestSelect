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
      </defs>
    </svg>
  );
}
