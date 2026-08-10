'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { STEP_FINAL } from '@/lib/best-select/constants';
import {
  CANVAS_X, COLS3, CRIT_C, CRIT_P, FUNNEL_OFF,
  FUNNEL_REST, HEAD_Y, OUT_Y, PRODUCTS, PR_ROWS, SINK_Y, WINNERS, WIN_COL, WIN_P,
} from '@/lib/best-select/funnel';
import { STREAM } from '@/lib/best-select/stream';
import { later, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

/* Trichterphase — aus Assets.html weiterentwickelt.
   Phase = step − STEP_FINAL (1…6):
     1 Prüfstrom (Trichter + fünf Kriterien + Symbolstrom) ·
     2 Drei bleiben übrig · 3 Blick in die Häuser · 4 Neun Tarife ·
     5 Derselbe Maßstab · 6 Ein Tarif bleibt.
   Alle Ebenen sind reine Funktionen des View-Zustands; vor der Phase (s ≤ 0)
   rendert jede in ihren verborgenen Grundzustand — Neustart inklusive. */

function prState(s: number, i: number) {
  const p = PRODUCTS[i];
  const hx = COLS3[p.col], hy = PR_ROWS[p.row];
  if (s < 4) return { x: hx, y: hy + 24, scale: 0.94, opacity: 0 };
  if (s === 4) return { x: hx, y: hy, scale: 1, opacity: 1 };
  if (s === 5) return { x: CANVAS_X, y: SINK_Y, scale: 0.5, opacity: 1 };
  return i === WIN_P
    ? { x: CANVAS_X, y: 40, scale: 1.4, opacity: 1 }
    : { x: CANVAS_X, y: SINK_Y, scale: 0.5, opacity: 0 };
}

export default function FunnelStage({ view }: { view: View }) {
  const streamRef = useRef<HTMLDivElement>(null);
  const wnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const funnelRef = useRef<SVGSVGElement>(null);
  const critRefs = useRef<(SVGTextElement | null)[]>([]);
  const finaleRef = useRef<HTMLDivElement>(null);
  const fcritRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const { step, inst, dir } = view;
    const s = Math.max(0, step - STEP_FINAL);   /* 0 = vor der Phase */

    /* ---- Prüfstrom: Symbole gießen sich durch den Trichter (nur CSS) ---- */
    streamRef.current?.classList.toggle('run', s === 1 && dir >= 0 && !inst);

    /* ---- Gewinner: aus dem Auslauf auf den Tisch, dann als Kopfzeile ---- */
    wnRefs.current.forEach((el, i) => {
      if (!el) return;
      let t;
      if (s < 2) t = { x: CANVAS_X, y: SINK_Y, scale: 0.55, opacity: 0 };
      else if (s === 2) t = { x: COLS3[i], y: OUT_Y, scale: 1, opacity: 1 };
      else t = { x: COLS3[i], y: HEAD_Y, scale: 1, opacity: (s === 6 && i !== WIN_COL ? 0.45 : 1) };
      if (s === 2 && !inst && dir >= 0) {
        /* Aus dem Auslauf: am Austritt schnell sichtbar, dann gebremster Fall —
           der Trichter steht schon an der Tischkante, darum kurzer Vorlauf */
        tx(el, { x: CANVAS_X, y: FUNNEL_REST + 250, scale: 0.5, opacity: 0 }, { duration: 0 });
        tx(el, { opacity: 1 }, { duration: 0.45, delay: 0.8 + i * 0.35 });
        tx(el, { x: COLS3[i], y: OUT_Y, scale: 1 }, { duration: 1.6, delay: 0.8 + i * 0.35 });
      } else {
        tx(el, t, {
          duration: inst ? 0 : (s === 3 ? 1.7 : 1.6),
          delay: inst ? 0 : (s === 3 ? 0.5 + i * 0.16 : 0),
        });
      }
      el.classList.toggle('glow', s === 2);
      el.classList.toggle('head', s >= 3);
    });

    /* ---- Tarife: Batterien laden, Einsaugen, Finale in zwei Akten ---- */
    const prIntake = s === 5 && dir >= 0 && !inst;
    prRefs.current.forEach((el, i) => {
      if (!el) return;
      if (prIntake) {
        tx(el, prState(4, i), { duration: 0 });
        later(() => { tx(el, prState(5, i), { duration: 1.7, delay: i * 0.08 }); }, 2200);
      } else if (s === 6 && i === WIN_P && !inst) {
        /* Zwei Akte: Fall aus dem Auslauf, dann Aufstieg ins Zentrum */
        tx(el, { x: CANVAS_X, y: OUT_Y, scale: 1.15, opacity: 1 }, { duration: 1.8, delay: 0.6 });
        later(() => { tx(el, prState(6, i), { duration: 2.0 }); }, 2600);
      } else {
        tx(el, prState(s, i), {
          duration: inst ? 0 : 1.6,
          delay: inst ? 0 : (s === 4 ? 0.45 + i * 0.1 : 0),
        });
      }
      if (s === 6 && i === WIN_P) {
        if (inst) el.classList.add('glow');
        else later(() => { el.classList.add('glow'); }, 2600);
      } else el.classList.remove('glow');
      if (s >= 4) {
        if (inst) el.classList.add('charged');
        else if (s === 4) later(() => { el.classList.add('charged'); }, 850 + i * 160);
        else if (s === 6 && i === WIN_P) {
          el.classList.remove('charged');
          later(() => { el.classList.add('charged'); }, 1300);
        } else el.classList.add('charged');
      } else el.classList.remove('charged');
    });

    /* ---- Spalten-Spines (nur Portfolio- und Tarif-Schritt) ---- */
    const showSpines = s === 3 || s === 4;
    spineRefs.current.forEach(el => {
      tx(el, { opacity: showSpines ? 1 : 0 },
        { duration: inst ? 0 : 1.1, delay: inst ? 0 : (showSpines ? 0.8 : 0) });
    });

    /* ---- Trichter: hochfahren, laden, zur Tischkante, Kulisse ---- */
    const funnel = funnelRef.current;
    if (funnel) {
      const set = s >= 4 ? CRIT_P : CRIT_C;
      critRefs.current.forEach((el, i) => { if (el) el.textContent = set[i]; });
      const lit = s === 1 || s === 5;
      /* fast: Kriterienleiter im Prüfstrom-Takt · flash setzt nur die
         Vorwärts-Choreografie unten — hier immer zurück auf den Endzustand */
      funnel.classList.toggle('fast', s === 1);
      funnel.classList.remove('flash');
      if (lit) {
        /* Die Maschine fährt von unten hoch an die Tischkante */
        funnel.classList.remove('recede');
        if (inst) tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 0 });
        else if (dir >= 0) {
          tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 1 }, { duration: 0 });
          tx(funnel, { y: FUNNEL_REST }, { duration: s === 1 ? 1.2 : 2.0 });
        } else {
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 1.8 });
        }
      } else if (s === 2) {
        /* Bleibt an der Tischkante — Ergebnisse treten unter dem Auslauf aus */
        funnel.classList.remove('recede');
        tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: inst ? 0 : 1.6 });
      } else if (s === 6) {
        /* Finale: Trichter sinkt zur Tischkante zurück und wird Kulisse */
        if (inst) {
          tx(funnel, { y: FUNNEL_REST + 60, scale: 0.97, opacity: 0.12 }, { duration: 0 });
          funnel.classList.add('recede');
        } else later(() => {
          tx(funnel, { y: FUNNEL_REST + 60, scale: 0.97, opacity: 0.12 }, { duration: 1.6 });
          funnel.classList.add('recede');
        }, 2600);
      } else {
        /* Kartenphase · Portfolio · Tarife: unterhalb des Bildes geparkt */
        funnel.classList.remove('recede');
        if (inst) tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 1 }, { duration: 0 });
        else if (dir < 0) tx(funnel, { y: FUNNEL_OFF, opacity: 1 }, { duration: 1.8 });
        else {
          tx(funnel, { opacity: 0 }, { duration: 0.7 });
          later(() => { tx(funnel, { y: FUNNEL_OFF, opacity: 1 }, { duration: 0 }); }, 800);
        }
      }
      if (lit && dir >= 0 && !inst) {
        funnel.classList.remove('active');
        /* Prüfstrom (s=1): Leiter startet mit dem ersten Symbol und läuft im
           fast-Takt, der Trichter blitzt, solange der Strom fließt.
           Tarif-Einsaugen (s=5): Ladebalken erst nach der letzten Karte. */
        later(() => { funnel.classList.add('active'); }, s === 1 ? 1200 : 5000);
        if (s === 1) {
          later(() => { funnel.classList.add('flash'); }, 1000);
          later(() => { funnel.classList.remove('flash'); }, 3600);
        }
      } else funnel.classList.toggle('active', lit);
    }

    /* ---- Finale: Empfehlung im Zentrum, Kriterien-Häkchen nacheinander ---- */
    const showFinale = s === 6;
    if (inst) {
      tx(finaleRef.current, { opacity: showFinale ? 1 : 0 }, { duration: 0 });
      fcritRefs.current.forEach(el => {
        tx(el, { y: showFinale ? 0 : 8, opacity: showFinale ? 1 : 0 }, { duration: 0 });
      });
    } else if (showFinale) {
      later(() => {
        tx(finaleRef.current, { opacity: 1 }, { duration: 1.4 });
        fcritRefs.current.forEach((el, i) => {
          tx(el, { y: 8, opacity: 0 }, { duration: 0 });
          tx(el, { y: 0, opacity: 1 }, { duration: 1.0, delay: 1.0 + i * 0.6 });
        });
      }, 3300);
    } else {
      tx(finaleRef.current, { opacity: 0 }, { duration: 0.4 });
      fcritRefs.current.forEach(el => { tx(el, { y: 8, opacity: 0 }, { duration: 0.3 }); });
    }
  }, [view]);

  return (
    <>
      {[500, 800, 1100].map((x, i) => (
        <div key={x} className="spine" style={{ left: x }}
          ref={el => { spineRefs.current[i] = el; }} />
      ))}

      <div id="stream" aria-hidden="true" ref={streamRef}>
        {STREAM.map((p, i) => (
          <div key={i} className={'sico ' + p.key}
            style={{ '--x0': p.x0, '--x1': p.x1, '--d': p.d, '--dur': p.dur } as CSSProperties}>
            <svg viewBox="0 0 16 16"><use href={p.glyph} /></svg>
          </div>
        ))}
      </div>

      <div id="winners" aria-hidden="true">
        {WINNERS.map((w, i) => (
          <div key={w.n} className="card wn" ref={el => { wnRefs.current[i] = el; }}>
            <span className="logo"><span className="mono">{w.mono}</span></span>
            <span className="wname">{w.n}</span>
          </div>
        ))}
      </div>

      <div id="products" aria-hidden="true">
        {PRODUCTS.map((p, i) => (
          <div key={p.n} className="card pr" ref={el => { prRefs.current[i] = el; }}>
            <span className="pname">{p.n}</span>
            <span className="tier">
              {[0, 1, 2].map(j => (
                <i key={j} className={j < p.v ? 'on' : undefined}
                  style={{ '--s': j } as CSSProperties}><b /></i>
              ))}
            </span>
          </div>
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
          <filter id="fGlow" x="-60%" y="-600%" width="220%" height="1300%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g transform="translate(0,-64)">
          {/* Lichtkegel unter dem Auslauf */}
          <rect x="768" y="758" width="64" height="104" fill="url(#fBeam)" />

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
        <div className="fname">{WINNERS[WIN_COL].n} · {PRODUCTS[WIN_P].n}</div>
        <div id="fcrits">
          {CRIT_P.map((c, i) => (
            <span key={c} className="fcrit" ref={el => { fcritRefs.current[i] = el; }}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5" /></svg>
              {c}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
