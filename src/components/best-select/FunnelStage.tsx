'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { STEP_FINAL } from '@/lib/best-select/constants';
import {
  BEST_SCALE, CRIT_C, CRIT_P, DROP_Y, FUNNEL_OFF, FUNNEL_REST, GATHER_DX,
  GATHER_Y, N_PD, PD_DX, ROW_Y, SPOUT, TOSS_Y,
  WIN_PD, WIN_SCALE, WIN_X, WIN_Y,
} from '@/lib/best-select/funnel';
import { WINNER_ICONS } from '@/lib/best-select/placement';
import { later, tx } from '@/lib/best-select/animate';
import type { CSSProperties } from 'react';
import type { View } from './BestSelect';

/* Trichterphase, radikal vereinfacht — Kreise statt Karten.
   Phase = step − STEP_FINAL (1…3):
     1 Prüfung 1: die acht Radar-Gewinner werden zu Lichtkreisen, fliegen in
       den Trichter, EINES — das beste Unternehmen — tritt unten aus (Azur) ·
     2 Prüfung 2: das Beste wird zurückgeworfen, die Kriterien wechseln auf
       Tarife, fünf Tarif-Punkte treten aus (warmes Ecru: andere Gattung) ·
     3 Finale: der beste Tarif leuchtet warm auf und steigt ins Zentrum.
   Alle Ebenen sind reine Funktionen des View-Zustands; vor der Phase (s ≤ 0)
   rendert jede in ihren verborgenen Grundzustand — Neustart inklusive. */

const GLIDE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FALL: [number, number, number, number] = [0.5, 0, 0.85, 0.6];

const gx = (i: number) => 800 + (i - (WINNER_ICONS.length - 1) / 2) * GATHER_DX;
const pdx = (i: number) => 800 + (i - (N_PD - 1) / 2) * PD_DX;

/* Layout-Effekt: die Übernahme der Karten-Gewinner muss VOR dem Paint sitzen,
   in dem #icons.gone die Originale ausblendet — sonst blitzt ein leerer
   Frame. (SSR-sicher: auf dem Server fällt er auf useEffect zurück.) */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function FunnelStage({ view }: { view: View }) {
  const dotsRef = useRef<HTMLDivElement>(null);
  const coRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bestRef = useRef<HTMLDivElement>(null);
  const pdRefs = useRef<(HTMLDivElement | null)[]>([]);
  const funnelRef = useRef<SVGSVGElement>(null);
  const critRefs = useRef<(SVGTextElement | null)[]>([]);
  const finaleRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const { step, inst, dir } = view;
    const s = Math.max(0, step - STEP_FINAL);   /* 0 = vor der Phase */

    /* Finale: die Punkte-Ebene hebt sich ÜBER den Trichter (z2) — die
       contain-Ebene deckelt die z-Indizes ihrer Kinder, ein .front am
       Kreis allein käme nie vor dem Korpus an. In den Prüfungen bleibt
       sie darunter: das Verschlucken braucht den deckenden Korpus. */
    dotsRef.current?.classList.toggle('lift', s === 3);

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

    /* ---- Das Beste besteht: tritt größer und leuchtend im Kegel aus ---- */
    const best = bestRef.current;
    if (best) {
      if (s === 1 && dir >= 0 && !inst) {
        /* Klein und verdeckt im Auslauf gesät, sichtbar geschaltet, wenn der
           Korpus es überdeckt, dann wachsend ausgespuckt — der Bloom zündet
           erst, wenn es steht: das Licht gehört dem Ergebnis */
        best.classList.remove('glow');
        later(() => {
          tx(best, { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 }, { duration: 0 });
        }, 3792);
        later(() => {
          tx(best, { opacity: 1 }, { duration: 0 });
          tx(best, { x: 800, y: ROW_Y, scale: BEST_SCALE }, { duration: 1.264, ease: SPRING });
        }, 3842);
        later(() => { best.classList.add('glow'); }, 5056);
      } else if (s === 2 && dir >= 0 && !inst) {
        /* Der Wurf: das beste Unternehmen — noch leuchtend — hoch über die
           Mundkante (federnd), dann hinein: der Trichter verwandelt es in
           seine Tarife */
        tx(best, { x: 800, y: ROW_Y, scale: BEST_SCALE, opacity: 1 }, { duration: 0 });
        later(() => {
          tx(best, { x: 800, y: TOSS_Y, scale: 0.9 }, { duration: 0.632, ease: SPRING });
        }, 50);
        later(() => {
          tx(best, { y: DROP_Y, scale: 0.5 }, { duration: 0.632, ease: FALL });
          tx(best, { opacity: 0 }, { duration: 0.158, delay: 0.632 });
        }, 682);
      } else {
        best.classList.toggle('glow', s === 1);
        tx(best, s === 1
          ? { x: 800, y: ROW_Y, scale: BEST_SCALE, opacity: 1 }
          : { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 },
          { duration: inst ? 0 : (s === 1 ? 1.264 : 0.632) });
      }
    }

    /* ---- Tarife: treten warm aus (Prüfung 2), der beste steigt auf ---- */
    if (s === 2 && dir >= 0 && !inst) {
      later(() => {
        pdRefs.current.forEach(el => {
          tx(el, { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 }, { duration: 0 });
        });
      }, 2528);
      later(() => {
        pdRefs.current.forEach((el, i) => {
          if (!el) return;
          tx(el, { opacity: 1 }, { duration: 0 });
          tx(el, { x: pdx(i), y: ROW_Y, scale: 1 },
            { duration: 1.264, delay: i * 0.158, ease: SPRING });
        });
      }, 2578);
    } else if (s === 3 && dir >= 0 && !inst) {
      pdRefs.current.forEach((el, i) => {
        if (!el) return;
        tx(el, { x: pdx(i), y: ROW_Y, scale: 1, opacity: 1 }, { duration: 0 });
      });
      later(() => {
        pdRefs.current.forEach((el, i) => {
          if (!el) return;
          if (i === WIN_PD) return;
          /* Die übrigen sinken und verlöschen — das Licht gehört dem einen */
          tx(el, { y: ROW_Y + 26, opacity: 0 }, { duration: 1.264, delay: i * 0.158 });
        });
      }, 50);
      later(() => {
        const el = pdRefs.current[WIN_PD];
        if (el) tx(el, { x: WIN_X, y: WIN_Y, scale: WIN_SCALE }, { duration: 1.896, ease: GLIDE });
      }, 632);
    } else {
      pdRefs.current.forEach((el, i) => {
        if (!el) return;
        let t;
        if (s === 2) t = { x: pdx(i), y: ROW_Y, scale: 1, opacity: 1 };
        else if (s === 3 && i === WIN_PD) t = { x: WIN_X, y: WIN_Y, scale: WIN_SCALE, opacity: 1 };
        else t = { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 };
        tx(el, t, { duration: inst ? 0 : (s >= 2 ? 1.264 : 0.632) });
      });
    }
    pdRefs.current.forEach((el, i) => {
      if (!el) return;
      if (s === 3 && i === WIN_PD) {
        if (inst) { el.classList.add('glow'); el.classList.add('front'); }
        else {
          /* front beim Abflug (der Kreis kreuzt den verlöschenden Trichter),
             glow erst bei ANKUNFT — der Flug bleibt nüchtern, das Licht
             gehört dem Ankommen */
          later(() => { el.classList.add('front'); }, 632);
          later(() => { el.classList.add('glow'); }, 2528);
        }
      } else { el.classList.remove('glow'); el.classList.remove('front'); }
    });

    /* ---- Trichter: hochfahren, prüfen, Kriterien wechseln, verlöschen ---- */
    const funnel = funnelRef.current;
    if (funnel) {
      const lit = s === 1 || s === 2;
      const setCrits = (set: string[]) =>
        critRefs.current.forEach((el, i) => { if (el) el.textContent = set[i]; });
      /* fast: Kriterienleiter im Strom-Takt · flash nur vorwärts unten */
      funnel.classList.toggle('fast', lit);
      funnel.classList.remove('flash');
      /* Vorwärts in Prüfung 2 wechselt der Text erst nach dem Abdunkeln —
         alle anderen Pfade setzen ihn sofort auf den Endzustand */
      if (!(s === 2 && dir >= 0 && !inst)) setCrits(s >= 2 ? CRIT_P : CRIT_C);
      if (lit) {
        funnel.classList.remove('recede');
        if (inst) {
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 0 });
          funnel.classList.add('active');
        } else if (dir >= 0 && s === 1) {
          /* Die Maschine steigt aus dem Parkstand (Schritt 10 hat sie
             geladen), die Leiter zündet, wenn die ersten Kreise fallen */
          funnel.classList.remove('active');
          tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 1 }, { duration: 0 });
          tx(funnel, { y: FUNNEL_REST }, { duration: 1.264 });
          later(() => { funnel.classList.add('active'); funnel.classList.add('flash'); }, 2528);
          later(() => { funnel.classList.remove('flash'); }, 4424);
        } else if (dir >= 0 && s === 2) {
          /* Prüfung 2: die Leiter dunkelt ab (1.264s Transition), der
             Maßstab wechselt unsichtbar, dann zündet sie neu — dieselbe
             Maschine, neue Kriterien */
          funnel.classList.remove('active');
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 0 });
          later(() => { setCrits(CRIT_P); }, 1264);
          later(() => { funnel.classList.add('active'); funnel.classList.add('flash'); }, 1896);
          later(() => { funnel.classList.remove('flash'); }, 3792);
        } else {
          /* rückwärts in eine Prüfung: an Ort und Stelle wieder aufleuchten */
          funnel.classList.add('active');
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 1.264 });
        }
      } else if (s === 3) {
        /* Finale: die Maschine bleibt stehen und löst sich, während der
           beste Tarif an ihr vorbei aufsteigt */
        if (inst) {
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 0 }, { duration: 0 });
          funnel.classList.add('recede');
        } else {
          funnel.classList.remove('recede');
          funnel.classList.add('active');
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 0 });
          later(() => {
            funnel.classList.add('recede');
            tx(funnel, { opacity: 0 }, { duration: 1.896 });
          }, 632);
        }
      } else if (step === STEP_FINAL) {
        /* Schritt 10: geparkt und bereit — der Aufstieg in Schritt 11
           startet dann ohne Einblendung. Nur rückwärts aus der Prüfung
           gleitet sie sichtbar hinab. */
        funnel.classList.remove('recede');
        funnel.classList.remove('active');
        if (!inst && dir < 0) tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 1 }, { duration: 1.896 });
        else tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 1 }, { duration: 0 });
      } else {
        /* Vor Schritt 10: unsichtbar und stumm geparkt */
        funnel.classList.remove('recede');
        funnel.classList.remove('active');
        tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 0 }, { duration: 0 });
      }
    }

    /* ---- Finale-Schriftzug unter dem aufgestiegenen Tarif ---- */
    const showFinale = s === 3;
    if (inst) {
      tx(finaleRef.current, { opacity: showFinale ? 1 : 0 }, { duration: 0 });
    } else if (showFinale) {
      later(() => { tx(finaleRef.current, { opacity: 1 }, { duration: 1.264 }); }, 2528);
    } else {
      tx(finaleRef.current, { opacity: 0 }, { duration: 0.316 });
    }
  }, [view]);

  return (
    <>
      {/* Lichtkreise: 8 Unternehmen (Azur) · das Beste · 5 Tarife (Ecru) —
          anonym, z1 hält Fälle und Würfe HINTER dem Trichterkorpus (z2) */}
      <div id="dots" aria-hidden="true" ref={dotsRef}>
        {WINNER_ICONS.map((p, i) => (
          <div key={'c' + p.cat} className="dot co"
            ref={el => { coRefs.current[i] = el; }} />
        ))}
        <div className="dot co" ref={bestRef} />
        {Array.from({ length: N_PD }, (_, i) => (
          <div key={'p' + i} className="dot pd"
            ref={el => { pdRefs.current[i] = el; }} />
        ))}
      </div>

      <svg id="funnel" viewBox="0 0 1600 900" aria-hidden="true" ref={funnelRef}>
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

          {/* Kriterien-Trennlinien (ätzen sich zeilenweise mit dem Ladebalken ein) */}
          <line className="sep" style={{ '--i': 1 } as CSSProperties} x1="559" y1="604" x2="1041" y2="604" />
          <line className="sep" style={{ '--i': 2 } as CSSProperties} x1="621" y1="636" x2="979" y2="636" />
          <line className="sep" style={{ '--i': 3 } as CSSProperties} x1="683" y1="668" x2="917" y2="668" />
          <line className="sep" style={{ '--i': 4 } as CSSProperties} x1="741" y1="698" x2="859" y2="698" />

          {/* Glaskanten */}
          <line className="edge" x1="460" y1="560" x2="770" y2="720" stroke="url(#fEdge)" />
          <line className="edge" x1="1140" y1="560" x2="830" y2="720" stroke="url(#fEdge)" />
          <line x1="770" y1="720" x2="770" y2="758" stroke="rgba(180,210,255,.25)" strokeWidth="1.5" />
          <line x1="830" y1="720" x2="830" y2="758" stroke="rgba(180,210,255,.25)" strokeWidth="1.5" />

          {/* Leuchtender Rand + Auslauf */}
          <line className="lip" x1="460" y1="561" x2="1140" y2="561" filter="url(#fGlow)" />
          <line x1="772" y1="758" x2="828" y2="758" stroke="#5FA3F5" strokeWidth="2.5" filter="url(#fGlow)" />

          <g id="crits">
            {[586, 624, 656, 687, 713].map((y, i) => (
              <text key={y} className="crit" style={{ '--i': i } as CSSProperties}
                x="800" y={y} ref={el => { critRefs.current[i] = el; }} />
            ))}
          </g>
        </g>
      </svg>

      <div id="finale" aria-hidden="true" ref={finaleRef}>
        <div className="tag">Best Select</div>
        <div className="fsub">Der beste Tarif des besten Unternehmens</div>
      </div>
    </>
  );
}
