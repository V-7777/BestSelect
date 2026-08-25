'use client';

import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import { STEP_FINAL } from '@/lib/best-select/constants';
import {
  DROP_Y, FUNNEL_OFF, FUNNEL_REST, FUNNEL_TOP, GATHER_DX, GATHER_Y,
  MID_Y, N_PD, N_SV, PD_DX, ROW_Y, SPOUT, SV_DX, TOSS_DX, TOSS_Y,
  WIN_PD, WIN_SCALE, WIN_X, WIN_Y,
} from '@/lib/best-select/funnel';
import { WINNER_ICONS } from '@/lib/best-select/placement';
import { later, tx } from '@/lib/best-select/animate';
import type { CSSProperties } from 'react';
import type { View } from './BestSelect';

/* Trichterphase, radikal vereinfacht — Kreise statt Karten, ZWEI Maschinen.
   Phase = step − STEP_FINAL (1…2):
     1 Prüfung 1: die acht Radar-Gewinner werden zu Lichtkreisen, fliegen in
       den Unternehmens-Trichter, drei treten unten aus (Azur) ·
     2 Prüfung 2 MIT Finale: der Unternehmens-Trichter fährt nach OBEN davon,
       ein neuer Tarif-Trichter steigt von unten auf — die drei werden
       hineingeworfen, fünf Tarif-Punkte treten aus (warmes Ecru: andere
       Gattung), und im Crescendo desselben Schritts (Takt 9–15) leuchtet
       der beste warm auf und steigt ins Zentrum. Der letzte Schritt ist
       das Finale — kein eigener Klick mehr.
   Alle Ebenen sind reine Funktionen des View-Zustands; vor der Phase (s ≤ 0)
   rendert jede in ihren verborgenen Grundzustand — Neustart inklusive. */

const GLIDE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FALL: [number, number, number, number] = [0.5, 0, 0.85, 0.6];

const gx = (i: number) => 800 + (i - (WINNER_ICONS.length - 1) / 2) * GATHER_DX;
const svx = (i: number) => 800 + (i - (N_SV - 1) / 2) * SV_DX;
const pdx = (i: number) => 800 + (i - (N_PD - 1) / 2) * PD_DX;

/* Layout-Effekt: die Übernahme der Karten-Gewinner muss VOR dem Paint sitzen,
   in dem #icons.gone die Originale ausblendet — sonst blitzt ein leerer
   Frame. (SSR-sicher: auf dem Server fällt er auf useEffect zurück.) */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function FunnelStage({ view }: { view: View }) {
  const dotsRef = useRef<HTMLDivElement>(null);
  const coRefs = useRef<(HTMLDivElement | null)[]>([]);
  const svRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pdRefs = useRef<(HTMLDivElement | null)[]>([]);
  const f1Ref = useRef<SVGSVGElement>(null);
  const f2Ref = useRef<SVGSVGElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const { step, inst, dir } = view;
    const s = Math.max(0, step - STEP_FINAL);   /* 0 = vor der Phase */

    /* Der Sieger-Aufstieg (Takt 10) hebt die Punkte-Ebene ÜBER die Trichter
       (z2) — die contain-Ebene deckelt die z-Indizes ihrer Kinder, ein
       .front am Kreis allein käme nie vor dem Korpus an. Solange geschluckt
       wird, bleibt sie darunter: das braucht den deckenden Korpus. */
    if (s === 2 && dir >= 0 && !inst) {
      dotsRef.current?.classList.remove('lift');
      later(() => { dotsRef.current?.classList.add('lift'); }, 6320);
    } else {
      dotsRef.current?.classList.toggle('lift', s === 2);
    }

    /* ---- Unternehmen: von der Karte in den Trichter (Prüfung 1) ---- */
    if (s === 1 && dir >= 0 && !inst) {
      /* Übernahme: die Kreise erscheinen auf den Gewinner-Positionen, während
         #icons.gone die Badges weich schrumpfen lässt (316 ms Cross-Morph).
         Seed → later(50): Motion-Store-Muster — der Flug startet einen Tick
         nach dem Seed, sonst liest er Werte von vor dem Seed. */
      coRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = WINNER_ICONS[i];
        tx(el, { x: p.x, y: p.y, scale: 1.55, opacity: 0 }, { duration: 0 });
      });
      later(() => {
        coRefs.current.forEach((el, i) => {
          if (!el) return;
          tx(el, { opacity: 1 }, { duration: 0.316 });
          /* Sammelflug über die Mundkante: links → rechts, ruhig, mit Masse */
          tx(el, { x: gx(i), y: GATHER_Y, scale: 1 },
            { duration: 1.264, delay: 0.632 + i * 0.158, ease: GLIDE });
        });
      }, 50);
      coRefs.current.forEach((el, i) => {
        /* Fall in den Mund (Takt 4 + Stagger): das Verschlucken übernimmt der
           deckende Korpus (z2), der Rest-Fade läuft unsichtbar hinterm Glas */
        later(() => {
          if (!el) return;
          tx(el, { y: DROP_Y, scale: 0.5 }, { duration: 0.632, ease: FALL });
          tx(el, { opacity: 0 }, { duration: 0.158, delay: 0.632 });
        }, 2528 + i * 158);
      });
    } else {
      /* Endzustand: unsichtbar, auf der Kartenposition geparkt — ein späterer
         Vorwärts-Flug startet selbst im Renn-Fall vom richtigen Ort */
      coRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = WINNER_ICONS[i];
        tx(el, { x: p.x, y: p.y, scale: 1.55, opacity: 0 }, { duration: inst ? 0 : 0.316 });
      });
    }

    /* ---- Drei bestehen: treten aus und steigen zur Fenstermitte ---- */
    if (s === 1 && dir >= 0 && !inst) {
      /* Klein und verdeckt im Auslauf gesät, sichtbar geschaltet, wenn der
         Korpus sie überdeckt, dann wachsend in die Reihe ausgespuckt */
      later(() => {
        svRefs.current.forEach(el => {
          tx(el, { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 }, { duration: 0 });
        });
      }, 3792);
      later(() => {
        svRefs.current.forEach((el, i) => {
          if (!el) return;
          tx(el, { opacity: 1 }, { duration: 0 });
          tx(el, { x: svx(i), y: ROW_Y, scale: 1 },
            { duration: 1.264, delay: i * 0.158, ease: SPRING });
        });
      }, 3842);
      /* Takt 9: die Maschine fährt nach oben davon, die drei steigen mit —
         und warten in der Fenstermitte, bereit für den Einwurf in die
         nächste Maschine (deren Mundkante liegt darunter) */
      later(() => {
        svRefs.current.forEach((el, i) => {
          if (!el) return;
          tx(el, { y: MID_Y }, { duration: 1.896, delay: i * 0.158, ease: GLIDE });
        });
      }, 5688);
    } else if (s === 2 && dir >= 0 && !inst) {
      /* Die drei warten schon über der Mundkante: kleiner Ansatz nach oben
         (Takt 3, wenn die neue Maschine steht), dann hinein — gestaffelt */
      svRefs.current.forEach((el, i) => {
        if (!el) return;
        tx(el, { x: svx(i), y: MID_Y, scale: 1, opacity: 1 }, { duration: 0 });
      });
      later(() => {
        svRefs.current.forEach((el, i) => {
          if (!el) return;
          tx(el, { x: 800 + (i - (N_SV - 1) / 2) * TOSS_DX, y: TOSS_Y, scale: 0.9 },
            { duration: 0.316, delay: i * 0.316, ease: SPRING });
        });
      }, 1896);
      svRefs.current.forEach((el, i) => {
        later(() => {
          if (!el) return;
          tx(el, { y: DROP_Y, scale: 0.5 }, { duration: 0.632, ease: FALL });
          tx(el, { opacity: 0 }, { duration: 0.158, delay: 0.632 });
        }, 2212 + i * 316);
      });
    } else {
      svRefs.current.forEach((el, i) => {
        if (!el) return;
        tx(el, s === 1
          ? { x: svx(i), y: MID_Y, scale: 1, opacity: 1 }
          : { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 },
          { duration: inst ? 0 : (s === 1 ? 1.264 : 0.632) });
      });
    }

    /* ---- Tarife: treten warm aus (Prüfung 2), der beste steigt auf ---- */
    if (s === 2 && dir >= 0 && !inst) {
      later(() => {
        pdRefs.current.forEach(el => {
          tx(el, { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 }, { duration: 0 });
        });
      }, 3792);
      later(() => {
        pdRefs.current.forEach((el, i) => {
          if (!el) return;
          tx(el, { opacity: 1 }, { duration: 0 });
          tx(el, { x: pdx(i), y: ROW_Y, scale: 1 },
            { duration: 1.264, delay: i * 0.079, ease: SPRING });
        });
      }, 3842);
      /* Finale-Crescendo im selben Schritt: die Reihe steht bei ~5.42s —
         ab Takt 9 sinken die übrigen und verlöschen (das Licht gehört dem
         einen), ab Takt 10 steigt der beste ins Zentrum */
      later(() => {
        pdRefs.current.forEach((el, i) => {
          if (!el || i === WIN_PD) return;
          tx(el, { y: ROW_Y + 26, opacity: 0 }, { duration: 1.264, delay: i * 0.158 });
        });
      }, 5688);
      later(() => {
        const el = pdRefs.current[WIN_PD];
        if (el) tx(el, { x: WIN_X, y: WIN_Y, scale: WIN_SCALE }, { duration: 1.896, ease: GLIDE });
      }, 6320);
    } else {
      pdRefs.current.forEach((el, i) => {
        if (!el) return;
        let t;
        if (s === 2) t = i === WIN_PD
          ? { x: WIN_X, y: WIN_Y, scale: WIN_SCALE, opacity: 1 }
          : { x: pdx(i), y: ROW_Y + 26, scale: 1, opacity: 0 };
        else t = { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 };
        tx(el, t, { duration: inst ? 0 : (s === 2 ? 1.264 : 0.632) });
      });
    }
    pdRefs.current.forEach((el, i) => {
      if (!el) return;
      if (s === 2 && i === WIN_PD) {
        if (inst || dir < 0) { el.classList.add('glow'); el.classList.add('front'); }
        else {
          /* front beim Abflug (der Kreis kreuzt den verlöschenden Trichter),
             glow erst bei ANKUNFT — der Flug bleibt nüchtern, das Licht
             gehört dem Ankommen */
          later(() => { el.classList.add('front'); }, 6320);
          later(() => { el.classList.add('glow'); }, 8216);
        }
      } else { el.classList.remove('glow'); el.classList.remove('front'); }
    });

    /* ---- Trichter 1 (Unternehmen): aufsteigen, prüfen, nach oben davon ---- */
    const f1 = f1Ref.current;
    if (f1) {
      f1.classList.remove('flash');
      if (s === 1 && dir >= 0 && !inst) {
        /* Die Maschine steigt aus dem Parkstand (Schritt 10 hat sie
           geladen), die Bänder laden, wenn die ersten Kreise fallen —
           und ab Takt 9 fährt sie nach oben davon (die drei steigen mit):
           die Bühne ist frei für die nächste Maschine */
        f1.classList.remove('active');
        tx(f1, { y: FUNNEL_OFF, opacity: 1 }, { duration: 0 });
        tx(f1, { y: FUNNEL_REST }, { duration: 1.264 });
        later(() => { f1.classList.add('active'); f1.classList.add('flash'); }, 2528);
        later(() => { f1.classList.remove('flash'); }, 4424);
        later(() => {
          f1.classList.remove('active');
          tx(f1, { y: FUNNEL_TOP }, { duration: 1.896, ease: GLIDE });
        }, 5688);
      } else if (s >= 1) {
        /* Endzustand ab Prüfung 1: nach oben davongefahren — vollständig
           über dem Bild geparkt, bereit für die Rückwärts-Navigation */
        f1.classList.remove('active');
        tx(f1, { y: FUNNEL_TOP, opacity: 1 }, { duration: inst ? 0 : 1.896 });
      } else if (step === STEP_FINAL) {
        /* Schritt 10: geparkt und bereit — der Aufstieg in Schritt 11
           startet dann ohne Einblendung. Nur rückwärts aus der Prüfung
           gleitet sie sichtbar hinab. */
        if (!inst && dir < 0) tx(f1, { y: FUNNEL_OFF, opacity: 1 }, { duration: 1.896 });
        else tx(f1, { y: FUNNEL_OFF, opacity: 1 }, { duration: 0 });
      } else {
        /* Vor Schritt 10: unsichtbar und stumm geparkt */
        tx(f1, { y: FUNNEL_OFF, opacity: 0 }, { duration: 0 });
      }
    }

    /* ---- Trichter 2 (Tarife): steigt von unten, prüft, verlöscht ---- */
    const f2 = f2Ref.current;
    if (f2) {
      f2.classList.remove('flash');
      if (s === 2) {
        if (!inst && dir >= 0) {
          /* Die neue Maschine steigt, WÄHREND die alte nach oben abfährt —
             eine Staffelübergabe; die Leiter zündet mit dem ersten Wurf,
             und im Crescendo (Takt 10) löst sich das Glas, während der
             beste Tarif an ihm vorbei aufsteigt */
          f2.classList.remove('recede');
          f2.classList.remove('active');
          tx(f2, { y: FUNNEL_OFF, opacity: 1 }, { duration: 0 });
          tx(f2, { y: FUNNEL_REST }, { duration: 1.896 });
          later(() => { f2.classList.add('active'); f2.classList.add('flash'); }, 2528);
          later(() => { f2.classList.remove('flash'); }, 4424);
          later(() => {
            f2.classList.add('recede');
            tx(f2, { opacity: 0 }, { duration: 1.896 });
          }, 6320);
        } else {
          /* Endzustand des letzten Schritts = Finale: Maschine aufgelöst */
          f2.classList.add('active');
          f2.classList.add('recede');
          tx(f2, { y: FUNNEL_REST, opacity: 0 }, { duration: 0 });
        }
      } else {
        /* Vor Prüfung 2: unten geparkt — rückwärts aus Prüfung 2 gleitet
           sie sichtbar hinab (die Staffelübergabe rückwärts) */
        f2.classList.remove('recede');
        f2.classList.remove('active');
        tx(f2, { y: FUNNEL_OFF, opacity: 1 }, { duration: inst ? 0 : 1.896 });
      }
    }

    /* ---- Finale-Schriftzug unter dem aufgestiegenen Tarif ---- */
    const showFinale = s === 2;
    if (inst) {
      tx(finaleRef.current, { opacity: showFinale ? 1 : 0 }, { duration: 0 });
    } else if (showFinale) {
      later(() => { tx(finaleRef.current, { opacity: 1 }, { duration: 1.264 }); }, 8216);
    } else {
      tx(finaleRef.current, { opacity: 0 }, { duration: 0.316 });
    }
  }, [view]);

  return (
    <>
      {/* Lichtkreise: 8 Unternehmen (Azur) · 3 Bestehende · 5 Tarife (Ecru) —
          anonym, z1 hält Fälle und Würfe HINTER den Trichterkorpussen (z2) */}
      <div id="dots" aria-hidden="true" ref={dotsRef}>
        {WINNER_ICONS.map((p, i) => (
          <div key={'c' + p.cat} className="dot co"
            ref={el => { coRefs.current[i] = el; }} />
        ))}
        {Array.from({ length: N_SV }, (_, i) => (
          <div key={'s' + i} className="dot co"
            ref={el => { svRefs.current[i] = el; }} />
        ))}
        {Array.from({ length: N_PD }, (_, i) => (
          <div key={'p' + i} className="dot pd"
            ref={el => { pdRefs.current[i] = el; }} />
        ))}
      </div>

      {/* Zwei Maschinen: Trichter 1 prüft Unternehmen (und trägt die defs),
          Trichter 2 prüft Tarife — das Typenschild benennt die Prüfung */}
      <FunnelGlass ref={f1Ref} title="Unternehmensanalyse" withDefs />
      <FunnelGlass ref={f2Ref} title="Produktanalyse" />

      <div id="finale" aria-hidden="true" ref={finaleRef}>
        <div className="tag">Best Select</div>
        <div className="fsub">Die Empfehlung aus dem ganzen Markt</div>
      </div>
    </>
  );
}

/* Ein Trichter aus dimensionalem Glas. Die SVG-defs (Verläufe, Maske,
   Glühfilter) liegen nur in der ERSTEN Instanz — url(#…) löst dokumentweit
   auf, die zweite Maschine trinkt aus denselben Verläufen. */
const FunnelGlass = forwardRef<SVGSVGElement, { title: string; withDefs?: boolean }>(
  function FunnelGlass({ title, withDefs }, ref) {
    return (
      <svg className="funnel fast" viewBox="0 0 1600 900" aria-hidden="true" ref={ref}>
        {withDefs && (
          <defs>
            <linearGradient id="fg" x1="0" y1="560" x2="0" y2="758" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#15375A" />
              <stop offset="1" stopColor="#0A1E33" />
            </linearGradient>
            <radialGradient id="fInner" cx="800" cy="570" r="340" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(95,163,245,.24)" />
              <stop offset="1" stopColor="rgba(95,163,245,0)" />
            </radialGradient>
            <linearGradient id="fEdge" x1="0" y1="560" x2="0" y2="720" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(180,210,255,.42)" />
              <stop offset="1" stopColor="rgba(180,210,255,.05)" />
            </linearGradient>
            <linearGradient id="fBeam" x1="0" y1="758" x2="0" y2="862" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(95,163,245,.3)" />
              <stop offset="1" stopColor="rgba(95,163,245,0)" />
            </linearGradient>
            {/* Horizontale Maske: der Lichtkegel löst sich an den Flanken auf,
               statt als Rechteckkante auf der Karte zu stehen */}
            <linearGradient id="fBeamX" x1="768" y1="0" x2="832" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.22" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.78" stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="fBeamMask">
              <rect x="768" y="758" width="64" height="104" fill="url(#fBeamX)" />
            </mask>
            <filter id="fGlow" x="-60%" y="-600%" width="220%" height="1300%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        )}

        <g transform="translate(0,-64)">
          {/* Lichtkegel unter dem Auslauf — beidseitig weich auslaufend */}
          <rect x="768" y="758" width="64" height="104" fill="url(#fBeam)" mask="url(#fBeamMask)" />

          {/* Korpus + Innenlicht */}
          <path d="M460 560 H1140 L830 720 V758 H770 V720 Z" fill="url(#fg)" />
          <path d="M460 560 H1140 L830 720 V758 H770 V720 Z" fill="url(#fInner)" />

          {/* Ladebalken-Zeilenbänder (leuchten sequenziell mit den Kriterien) */}
          <path className="rowband" style={{ '--i': 0 } as CSSProperties} d="M460 560 H1140 L1054.75 604 H545.25 Z" />
          <path className="rowband alt" style={{ '--i': 1 } as CSSProperties} d="M545.25 604 H1054.75 L992.75 636 H607.25 Z" />
          <path className="rowband" style={{ '--i': 2 } as CSSProperties} d="M607.25 636 H992.75 L930.75 668 H669.25 Z" />
          <path className="rowband alt" style={{ '--i': 3 } as CSSProperties} d="M669.25 668 H930.75 L872.625 698 H727.375 Z" />
          <path className="rowband" style={{ '--i': 4 } as CSSProperties} d="M727.375 698 H872.625 L830 720 V758 H770 V720 Z" />

          {/* Wandstärke: dunkles Band unter dem Rand */}
          <path d="M460 560 H1140 L1124.5 568 H475.5 Z" fill="rgba(4,11,20,.6)" />
          <line x1="475.5" y1="568" x2="1124.5" y2="568" stroke="rgba(180,210,255,.15)" strokeWidth="1" />

          {/* Glaskanten */}
          <line className="edge" x1="460" y1="560" x2="770" y2="720" stroke="url(#fEdge)" />
          <line className="edge" x1="1140" y1="560" x2="830" y2="720" stroke="url(#fEdge)" />
          <line x1="770" y1="720" x2="770" y2="758" stroke="rgba(180,210,255,.25)" strokeWidth="1.5" />
          <line x1="830" y1="720" x2="830" y2="758" stroke="rgba(180,210,255,.25)" strokeWidth="1.5" />

          {/* Leuchtender Rand + Auslauf */}
          <line className="lip" x1="460" y1="561" x2="1140" y2="561" filter="url(#fGlow)" />
          <line x1="772" y1="758" x2="828" y2="758" stroke="#5FA3F5" strokeWidth="2.5" filter="url(#fGlow)" />

          {/* Das Typenschild der Maschine: EIN Wort auf dem Glas statt
             Kriterienzeilen — benennt, WAS geprüft wird */}
          <text className="flabel" x="800" y="612">{title}</text>
        </g>
      </svg>
    );
  });
