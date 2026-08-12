'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { STEP_FINAL } from '@/lib/best-select/constants';
import {
  CANVAS_X, COLS3, CRIT_C, CRIT_P, FUNNEL_OFF,
  FUNNEL_REST, FUNNEL_UP, HEAD_Y, OUT2_Y, OUT_Y, PRODUCTS, PR_ROWS, SINK_Y, SPOUT_Y, WINNERS, WIN_COL, WIN_P,
} from '@/lib/best-select/funnel';
import { later, tx } from '@/lib/best-select/animate';
import type { View } from './BestSelect';

/* Trichterphase — aus Assets.html weiterentwickelt.
   Phase = step − STEP_FINAL (1…6):
     1 Prüfung der acht Gewinner (Trichter + fünf Kriterien; die Aufstellung
       und die Fälle choreografiert WinnersLineup) ·
     2 Drei bleiben übrig (Trichter fährt hoch, Ergebnisse in Fenstermitte) ·
     3 Blick in die Unternehmen · 4 Produktvergleich ·
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

    /* ---- Gewinner: aus dem Auslauf in die Fenstermitte, dann als Kopfzeile ---- */
    wnRefs.current.forEach((el, i) => {
      if (!el) return;
      let t;
      if (s < 2) t = { x: CANVAS_X, y: SINK_Y, scale: 0.55, opacity: 0 };
      else if (s === 2) t = { x: COLS3[i], y: OUT2_Y, scale: 1, opacity: 1 };
      else t = { x: COLS3[i], y: HEAD_Y, scale: 1, opacity: (s === 6 && i !== WIN_COL ? 0.45 : 1) };
      if (s === 2 && !inst && dir >= 0) {
        /* Aus dem Auslauf: erst fährt der Trichter hoch (1.4s). Die Karten
           warten klein UND verdeckt im Spout (abs ≈ 355, Spout 336–374,
           Breite 60px — Scale .22 ≈ 57px passt dahinter), werden erst
           sichtbar geschaltet, wenn der Korpus sie überdeckt, und treten
           dann wachsend unter dem Auslauf aus — physisch ausgespuckt statt
           eingeblendet. Seed → later(50): Motion-Store-Muster, s. Lineup. */
        tx(el, { x: CANVAS_X, y: FUNNEL_UP + SPOUT_Y, scale: 0.22, opacity: 0 }, { duration: 0 });
        later(() => {
          tx(el, { opacity: 1 }, { duration: 0, delay: 1.264 });
          tx(el, { x: COLS3[i], y: OUT2_Y, scale: 1 }, { duration: 1.264, delay: 1.264 + i * 0.35 });
        }, 50);
      } else {
        tx(el, t, {
          duration: inst ? 0 : 1.896,
          delay: inst ? 0 : (s === 3 ? 0.474 + i * 0.16 : 0),
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
        later(() => { tx(el, prState(5, i), { duration: 1.896, delay: i * 0.08 }); }, 2212);
      } else if (s === 6 && i === WIN_P && !inst) {
        /* Wie Schritt 12, nur solo: klein im Auslauf gesät (Scale .22 ≈ 57px
           ≤ Spout 60px), hinter dem deckenden Korpus sichtbar geschaltet und
           physisch ausgespuckt (Takt 1–3) — dabei wächst die Karte auf die
           Rastergröße (Scale 1), mit der sie in Schritt 15 eingesaugt wurde:
           so groß raus, wie sie rein ging. Erst wenn das Glas sich danach
           löst, steigt sie auf und wächst ins Bild (Takt 6–9, auf 1.4). */
        tx(el, { x: CANVAS_X, y: SPOUT_Y, scale: 0.22, opacity: 0 }, { duration: 0 });
        later(() => { tx(el, { opacity: 1 }, { duration: 0 }); }, 50);
        later(() => { tx(el, { y: OUT_Y, scale: 1 }, { duration: 1.264 }); }, 632);
        later(() => { tx(el, prState(6, i), { duration: 1.896 }); }, 3792);
      } else if (s === 6 && !inst && dir >= 0) {
        /* Verlierer: bleiben im Glas gestapelt und lösen sich MIT dem Glas
           (ab Takt 3) — einen Takt schneller als der Korpus (1.264 vs 1.896),
           damit das halbtransparente Glas keinen Stapel-Geist durchscheinen
           lässt. */
        tx(el, prState(5, i), { duration: 0 });
        later(() => { tx(el, { opacity: 0 }, { duration: 1.264 }); }, 1896);
      } else {
        tx(el, prState(s, i), {
          duration: inst ? 0 : 1.896,
          delay: inst ? 0 : (s === 4 ? 0.474 + i * 0.1 : 0),
        });
      }
      if (s === 6 && i === WIN_P) {
        /* front: erst beim Aufstieg vor den (aufgelösten, aber z2) Trichter
           heben — Auswurf und Wartezeit bleiben hinter Korpus und Lichtkegel.
           shine (Takt 15): einmaliger Lichtlauf über die Karte, NACHDEM
           das letzte Häkchen (Rating, ~9.16s) gelandet ist — kein
           Endzustand, darum nicht im inst-Pfad. */
        if (inst) {
          el.classList.add('glow'); el.classList.add('front'); el.classList.remove('shine');
        } else {
          /* glow erst bei ANKUNFT (Takt 9): zündet der Bloom schon beim
             Aufstieg, blitzt die Karte im Flug weiß auf der dunklen
             Bühne — der Flug bleibt nüchternes Glas, das Licht gehört
             dem Ankommen. */
          later(() => { el.classList.add('front'); }, 3792);
          later(() => { el.classList.add('glow'); }, 5688);
          later(() => { el.classList.add('shine'); }, 9480);
        }
      } else { el.classList.remove('glow'); el.classList.remove('front'); el.classList.remove('shine'); }
      if (s >= 4) {
        /* Ladezustand bleibt ab Schritt 14 stehen — auch im Finale kein
           Leeren/Wiederfüllen: die Batterie ist Teil des Kartenzustands,
           nicht der Choreografie */
        if (inst) el.classList.add('charged');
        else if (s === 4) later(() => { el.classList.add('charged'); }, 790 + i * 160);
        else el.classList.add('charged');
      } else el.classList.remove('charged');
    });

    /* ---- Spalten-Spines (nur Portfolio- und Tarif-Schritt) ---- */
    const showSpines = s === 3 || s === 4;
    spineRefs.current.forEach(el => {
      tx(el, { opacity: showSpines ? 1 : 0 },
        { duration: inst ? 0 : 1.264, delay: inst ? 0 : (showSpines ? 0.79 : 0) });
    });

    /* ---- Trichter: hochfahren, laden, zur Tischkante, Kulisse ---- */
    const funnel = funnelRef.current;
    if (funnel) {
      const set = s >= 4 ? CRIT_P : CRIT_C;
      critRefs.current.forEach((el, i) => { if (el) el.textContent = set[i]; });
      const lit = s === 1 || s === 5;
      /* fast: Kriterienleiter im Prüfstrom-Takt — in beiden Prüfungen ·
         flash setzt nur die Vorwärts-Choreografie unten — hier immer
         zurück auf den Endzustand */
      funnel.classList.toggle('fast', lit);
      funnel.classList.remove('flash');
      if (lit) {
        /* Die Maschine fährt von unten hoch an die Tischkante. Prüfung 1
           steigt physisch aus dem Parkstand (Schritt 10 hat sie geladen);
           Prüfung 2 blendet sich beim Aufstieg ein — in den Schritten 13/14
           existiert sie sichtbar nicht. */
        funnel.classList.remove('recede');
        if (inst) tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 0 });
        else if (dir >= 0) {
          tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: s === 1 ? 1 : 0 }, { duration: 0 });
          tx(funnel, { y: FUNNEL_REST, opacity: 1 }, { duration: s === 1 ? 1.264 : 1.896 });
        } else {
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 1.896 });
        }
      } else if (s === 2) {
        /* Fährt hoch: der Auslauf hebt sich, die Ergebnisse treten in
           Fenstermitte aus — vorwärts 2 Takte Gleiten, rückwärts aus dem Parken */
        funnel.classList.remove('recede');
        tx(funnel, { y: FUNNEL_UP, scale: 1, opacity: 1 },
          { duration: inst ? 0 : (dir >= 0 ? 1.264 : 1.896) });
      } else if (s === 6) {
        /* Finale: die Maschine bleibt stehen und spuckt die Siegerkarte
           physisch aus (Takt 1–3) — erst DANACH löst sich das Glas (Takt
           3–6), mitsamt allem, was es noch verdeckt, und die Karte steigt
           allein auf der abgedunkelten Karte auf. */
        if (inst) {
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 0 }, { duration: 0 });
          funnel.classList.add('recede');
        } else {
          tx(funnel, { y: FUNNEL_REST, scale: 1, opacity: 1 }, { duration: 0 });
          later(() => {
            funnel.classList.add('recede');
            tx(funnel, { opacity: 0 }, { duration: 1.896 });
          }, 1896);
        }
      } else if (s === 3 || s === 4) {
        /* Portfolio · Tarife: unsichtbar — vorwärts wie rückwärts blendet
           die Maschine an Ort und Stelle aus und parkt dann verdeckt;
           kein sichtbares Hinabgleiten durch das Bild */
        funnel.classList.remove('recede');
        if (inst) tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 0 }, { duration: 0 });
        else {
          tx(funnel, { opacity: 0 }, { duration: 0.632 });
          later(() => { tx(funnel, { y: FUNNEL_OFF, opacity: 0 }, { duration: 0 }); }, 790);
        }
      } else if (step === STEP_FINAL) {
        /* Schritt 10: die Maschine lädt einen Schritt vor ihrem Einsatz —
           geparkt und bereit, ohne Übergang; der Aufstieg in Schritt 11
           startet dann ohne Einblendung. Nur rückwärts aus der Prüfung
           gleitet sie sichtbar hinab. (s ist auf 0 geklemmt — die Karten-
           Schritte davor unterscheidet nur der step-Vergleich.) */
        funnel.classList.remove('recede');
        if (!inst && dir < 0) tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 1 }, { duration: 1.896 });
        else tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 1 }, { duration: 0 });
      } else {
        /* Vor Schritt 10 (Karten-Akt): unsichtbar und stumm — kein
           Umpositionieren, keine Übergänge bei Schrittwechseln */
        funnel.classList.remove('recede');
        tx(funnel, { y: FUNNEL_OFF, scale: 1, opacity: 0 }, { duration: 0 });
      }
      if (lit && dir >= 0 && !inst) {
        funnel.classList.remove('active');
        /* Beide Prüfungen: Leiter ab Takt 4 (2528 ms) im Prüfstrom-Takt —
           bei s=1 steht die Reihe dann gerade (~2.7s), bei s=5 sinken die
           Tarife noch (Einsaugen 2.21–4.75s): „Derselbe Maßstab" leuchtet,
           WÄHREND der Strom läuft, und endet exakt mit der Sperre. Der
           Trichter blitzt in Prüfung 1, solange die Gewinner fallen
           (WinnersLineup: Fälle 2.84–5.17s bei acht Gewinnern). */
        later(() => { funnel.classList.add('active'); }, 2528);
        if (s === 1) {
          later(() => { funnel.classList.add('flash'); }, 2844);
          later(() => { funnel.classList.remove('flash'); }, 5372);
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
      /* Ab Takt 7 (die Karte steigt schon): Titel 2 Takte, Häkchen je
         2 Takte im Takt-Stagger — das letzte endet bei ~9.16s, danach
         der Lichtlauf (Takt 15–17) bis zur Sperre */
      later(() => {
        tx(finaleRef.current, { opacity: 1 }, { duration: 1.264 });
        fcritRefs.current.forEach((el, i) => {
          tx(el, { y: 8, opacity: 0 }, { duration: 0 });
          tx(el, { y: 0, opacity: 1 }, { duration: 1.264, delay: 0.948 + i * 0.632 });
        });
      }, 4424);
    } else {
      tx(finaleRef.current, { opacity: 0 }, { duration: 0.316 });
      fcritRefs.current.forEach(el => { tx(el, { y: 8, opacity: 0 }, { duration: 0.316 }); });
    }
  }, [view]);

  return (
    <>
      {[500, 800, 1100].map((x, i) => (
        <div key={x} className="spine" style={{ left: x }}
          ref={el => { spineRefs.current[i] = el; }} />
      ))}

      {/* Typ-Glyphen statt Buchstaben-Kacheln: das Org-Zeichen sagt
          „Unternehmen", das Dokument sagt „Tarif" — A/B/C trägt der Name */}
      <div id="winners" aria-hidden="true">
        {WINNERS.map((w, i) => (
          <div key={w.n} className="card wn" ref={el => { wnRefs.current[i] = el; }}>
            <span className="logo"><svg viewBox="0 0 16 16"><use href="#g-org" /></svg></span>
            <span className="wname">{w.n}</span>
          </div>
        ))}
      </div>

      <div id="products" aria-hidden="true">
        {PRODUCTS.map((p, i) => (
          <div key={p.n} className="card pr" ref={el => { prRefs.current[i] = el; }}>
            <span className="plabel">
              <span className="pico"><svg viewBox="0 0 16 16"><use href="#g-doc" /></svg></span>
              <span className="pname">{p.n}</span>
            </span>
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
