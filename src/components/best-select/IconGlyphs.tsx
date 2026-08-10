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
      </defs>
    </svg>
  );
}
