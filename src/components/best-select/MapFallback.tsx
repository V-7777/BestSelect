import { GERMANY } from '@/lib/best-select/germany';
import { HUB } from '@/lib/best-select/constants';

/* Nothalt-Kulisse: fällt germany-night.png aus (Asset nicht kopiert, leerer
   Offline-Cache), zeichnet der gemessene Umriss aus germany.ts den Boden —
   Symbole, Radar und Trichter spielen weiter auf festem Land statt im Leeren.
   Gleiche Lichtsprache wie die Nachtkarte: weicher Glühsaum, dunkle Fläche,
   Glut um die Nabe. Unsichtbar, solange die Karte lädt (#stage.nomap). */
export default function MapFallback() {
  const pts = GERMANY.map(v => v.join(',')).join(' ');
  return (
    <svg id="map-fallback" viewBox="0 0 1600 900" aria-hidden="true">
      <defs>
        <radialGradient id="mfGlow" cx={HUB.x} cy={HUB.y} r="480" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgba(95,163,245,.15)" />
          <stop offset="0.6" stopColor="rgba(35,120,231,.06)" />
          <stop offset="1" stopColor="rgba(35,120,231,0)" />
        </radialGradient>
        <filter id="mfBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {/* Glühsaum jenseits der Grenze — das Küstenleuchten der Karte */}
      <polygon points={pts} fill="rgba(120,180,255,.16)" filter="url(#mfBlur)" />
      {/* Landfläche: dunkler als der Viewport-Verlauf, hebt sich als Form ab */}
      <polygon points={pts} fill="rgba(13,34,57,.55)" />
      <polygon points={pts} fill="url(#mfGlow)" />
      <polygon
        points={pts} fill="none" stroke="rgba(150,195,255,.28)"
        strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}
