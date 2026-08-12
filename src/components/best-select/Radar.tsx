'use client';

import { useEffect, useRef } from 'react';
import { BEAM_FADE, BEAM_OUT, BEAM_R, HUB, LEAD, PULSE, ROT, STEP_FINAL, STEP_RADAR } from '@/lib/best-select/constants';
import { later, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

/* Radar: Strahl + Nabe mit Weitblick-W. #sweep ist eine rotierende Hülle —
   ihr Inhalt wird einmal gerastert und danach als fertige Textur gedreht.
   Tempo und Vorlauf kommen aus ROT/LEAD statt doppelt im CSS zu stehen. */
export default function Radar({ view }: { view: View }) {
  const radarRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const radar = radarRef.current, sweep = sweepRef.current;
    if (!radar || !sweep) return;
    const { step, inst, dir } = view;
    const animatedSweep = step === STEP_RADAR && !inst && dir >= 0;
    if (step === STEP_RADAR || step === STEP_FINAL) {
      tx(radar, { opacity: 1 }, { duration: inst ? 0 : 0.632 });
      if (animatedSweep) {
        radar.classList.remove('run');
        void sweep.offsetWidth;                   /* Animation neu starten */
        tx(sweep, { opacity: 1 }, { duration: 0.632, delay: 0.316 });
        radar.classList.add('run');
        /* Er verabschiedet sich erst mit dem letzten Symbol. Die Nabe bleibt. */
        later(() => { tx(sweep, { opacity: 0 }, { duration: BEAM_FADE }); }, BEAM_OUT * 1000);
      } else {
        radar.classList.remove('run');
        tx(sweep, { opacity: 0 }, { duration: inst ? 0 : 0.632 });
      }
    } else {
      radar.classList.remove('run');
      tx(radar, { opacity: 0 }, { duration: inst ? 0 : 0.632 });
      tx(sweep, { opacity: 0 }, { duration: 0 });
    }
  }, [view]);

  return (
    <div id="radar" ref={radarRef} aria-hidden="true">
      {/* Ping-Welle: läuft unter Nachlauf/Arm/Nabe; .run startet sie mit,
          der Reflow-Neustart und das Entfernen von .run räumen sie mit ab */}
      <div
        id="pulse"
        style={{
          width: BEAM_R * 2, height: BEAM_R * 2,
          left: HUB.x - BEAM_R, top: HUB.y - BEAM_R,
          animationDuration: PULSE + 's', animationDelay: LEAD + 's',
        }}
      />
      <div
        id="sweep"
        ref={sweepRef}
        style={{
          width: BEAM_R * 2, height: BEAM_R * 2,
          left: HUB.x - BEAM_R, top: HUB.y - BEAM_R,
          animationDuration: ROT + 's', animationDelay: LEAD + 's',
        }}
      >
        <div id="trail" /><div id="arm" />
      </div>
      <div
        id="ring"
        style={{
          width: BEAM_R * 2 * 0.62, height: BEAM_R * 2 * 0.62,
          left: HUB.x - BEAM_R * 0.62, top: HUB.y - BEAM_R * 0.62,
        }}
      />
      <div id="hub" style={{ left: HUB.x - 32, top: HUB.y - 32 }}>
        <svg viewBox="0 0 96.9 67.44" aria-hidden="true">
          <path fill="currentColor" d="M65.1,2.94l-14.6,32.2c-.3.6-.9,1.1-1.7,1.1h-.8c-.7,0-1.4-.4-1.7-1.1L31.7,2.94c-.3-.6-.9-1.1-1.7-1.1H1.8c-1,0-1.8.8-1.8,1.8v38.2c0,.4.1.8.4,1.1l17.8,23.8c.3.5.9.7,1.5.7h16.8c.6,0,1.2-.3,1.6-.9l8.5-14.1c.2-.4.6-.6,1-.6h1.7c.4,0,.8.2,1,.6l8.5,14.1c.3.5.9.9,1.6.9h16.8c.6,0,1.1-.3,1.5-.7l17.8-23.8c.2-.3.4-.7.4-1.1V3.64c0-1-.8-1.8-1.8-1.8h-28.2c-.7,0-1.4.4-1.7,1.1h-.1Z" />
        </svg>
      </div>
    </div>
  );
}
