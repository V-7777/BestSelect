import { BEAM_R, HUB } from '@/lib/best-select/constants';
import { GERMANY } from '@/lib/best-select/germany';

/* Debug-Overlay (?debug=1): Deutschland-Polygon mit Punktindizes, Nabe und
   Strahlradius über der Karte — zum visuellen Nachjustieren des Umrisses. */
export default function DebugOverlay() {
  return (
    <svg
      viewBox="0 0 1600 900"
      style={{ position: 'absolute', inset: 0, width: 1600, height: 900, zIndex: 9, pointerEvents: 'none' }}
    >
      <polygon
        points={GERMANY.map(v => v.join(',')).join(' ')}
        fill="none" stroke="#22FF88" strokeWidth="1.5" strokeDasharray="6 4"
      />
      {GERMANY.map((v, i) => (
        <g key={i}>
          <circle cx={v[0]} cy={v[1]} r="3" fill="#22FF88" />
          <text x={v[0] + 6} y={v[1] - 4} fill="#22FF88" fontSize="10">{i}</text>
        </g>
      ))}
      <circle cx={HUB.x} cy={HUB.y} r="5" fill="#FF5577" />
      <circle cx={HUB.x} cy={HUB.y} r={BEAM_R} fill="none" stroke="rgba(255,85,119,.4)" />
    </svg>
  );
}
