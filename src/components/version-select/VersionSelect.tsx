'use client';

/* Einstiegsseite: Kurzfassung der Präsentation in zwei Schritten auf dem
   Showroom-Hintergrund, danach die Versionswahl. Zeigen statt erzählen:
   die Dioramen bauen sich als Hologramme aus dem Präsentationstisch auf
   (2 Takte, von unten nach oben, im Azur des Tisch-Leuchtstreifens), die
   Titel liegen an der vorderen Tischkante im Lampenlicht — das Weitblick-
   Logo an der Wand bleibt frei. Schritt 2 ist EINE durchgehende Maschinen-
   Choreografie: Prüfung 1 arbeitet, fährt ab, ihre drei Besten wandern in
   Prüfung 2, der beste Tarif bleibt. Konventionen wie BestSelect:
   go()/lock()/settle(), 632-ms-Raster, ?step-Spiegel in der URL. */

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { CATS } from '@/lib/best-select/constants';
import { WINNER_ICONS } from '@/lib/best-select/placement';
import { bump, countUp, fmt, later, pad, reduced, tx } from '@/lib/best-select/animate';
import IconGlyphs from '@/components/best-select/IconGlyphs';
import './version-select.css';

const BEAT = 632;
const VS_LAST = 3;                 /* 0 Intro · 1 Markt · 2 Auswahl · 3 Versionswahl */

/* Summe aller Marktkategorien — bleibt automatisch synchron zur Präsentation */
const TOTAL = CATS.reduce((s, c) => s + c.total, 0);
const GLYPH = Object.fromEntries(CATS.map(c => [c.key, c.glyph]));

/* ---- Maschinen-Bühne (feste 400×289 px, viewBox 360×260 skaliert) ----
   Absolute Koordinaten wie in der Trichterphase der Präsentation:
   die Punkte liegen auf left/top 0 und fliegen per Transform. */
const F2_WIN = 2;                            /* der beste Tarif tritt mittig aus */
const IN_Y = 20;                             /* Sammelreihe über der Mundkante */
const OUT_Y = 254;                           /* Ergebnis-Reihe im Lichtkegel */
const FALL_Y = 150;                          /* Fallziel im Glas */
const WIN_Y = 240;                           /* Bloom-Position des Siegers */
const SPOUT = { x: 200, y: 228 };            /* Saatpunkt im Auslauf */
const gx1 = (i: number) => 72 + (i * 256) / 7;   /* acht Unternehmen */
const sox = (i: number) => 160 + i * 40;         /* drei Bestehende, Reihe */
const gx2 = (i: number) => 152 + i * 48;         /* drei über Maschine 2 */
const pdx = (i: number) => 120 + i * 40;         /* fünf Tarife */

const GLIDE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const FALL: [number, number, number, number] = [0.5, 0, 0.85, 0.6];

interface VsView {
  step: number;
  inst: boolean;   /* Sofort-Render ohne Choreografie */
  dir: 1 | -1;
  n: number;       /* Render-Token */
}

/* Sperren decken die volle Choreografie des Schritts; rückwärts sind es
   Ergebnis-Zustände, kurz sperren */
function lockFor(n: number, dir: number): number {
  if (dir < 0) return BEAT;
  if (n === 1) return BEAT * 5;    /* 3160: Hologramm-Aufbau (2 Takte), Leiter, Zählen */
  if (n === 2) return BEAT * 15;   /* 9480: Prüfung 1 → Staffelübergabe → Prüfung 2 → Sieger */
  return BEAT * 2;                 /* Intro / Versionswahl: 1264 */
}

/* Evidenz je Schritt für Screenreader — die Dioramen sind aria-hidden */
function vsEvidence(step: number): string {
  if (step === 1) return 'Rückblick 1 von 2: Acht Märkte gescannt, '
    + fmt(TOTAL) + ' geprüfte Anbieter und Produkte — von Bausparkassen bis Investmentfonds.';
  if (step === 2) return 'Rückblick 2 von 2: Prüfung 1, Unternehmensanalyse — von acht Unternehmen '
    + 'bestehen drei. Die drei wandern in Prüfung 2, Produktanalyse — der beste Tarif bleibt: Best Select.';
  if (step === VS_LAST) return 'Versionswahl: Version 1 startet die vollständige Präsentation. '
    + 'Kapitel 3 öffnet das Strategie-Kapitel. Version 2 spielt die Kurzfassung erneut.';
  return 'Weitblick Best Select — die Kurzfassung. Klick oder Pfeiltaste führt durch zwei Schritte.';
}

export default function VersionSelect() {
  const [view, setView] = useState<VsView>({ step: 0, inst: true, dir: 1, n: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const busyRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const f1Ref = useRef<SVGSVGElement>(null);
  const f2Ref = useRef<SVGSVGElement>(null);
  const finRef = useRef<HTMLDivElement>(null);
  const coRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const svRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pdRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const lock = useCallback((ms: number) => {
    busyRef.current = true;
    rootRef.current?.classList.add('busy');
    setTimeout(() => {
      busyRef.current = false;
      rootRef.current?.classList.remove('busy');
    }, reduced() ? 120 : ms);
  }, []);

  /* Neustart der Kurzfassung (Pille „Version 2" / Weiter am letzten Schritt):
     Ausblenden 1 Takt, Rücksprung, Einblenden 2 Takte — wie in BestSelect */
  const replay = useCallback(() => {
    if (busyRef.current) return;
    lock(BEAT * 3);
    bump();
    tx(rootRef.current, { opacity: 0 }, { duration: 0.632 });
    setTimeout(() => {
      setView(v => ({ step: 0, inst: true, dir: 1, n: v.n + 1 }));
      tx(rootRef.current, { opacity: 1 }, { duration: 1.264 });
    }, BEAT);
  }, [lock]);

  const go = useCallback((n: number) => {
    if (busyRef.current) return;
    if (n > VS_LAST) { replay(); return; }
    const dir: 1 | -1 = n < viewRef.current.step ? -1 : 1;
    const step = Math.max(0, n);
    lock(lockFor(step, dir));
    bump();
    setView(v => ({ step, inst: false, dir, n: v.n + 1 }));
  }, [lock, replay]);

  /* Esc beendet die laufende Choreografie sofort in ihren Endzustand */
  const settle = useCallback(() => {
    if (!busyRef.current) return;
    busyRef.current = false;
    rootRef.current?.classList.remove('busy');
    bump();
    setView(v => ({ step: v.step, inst: true, dir: 1, n: v.n + 1 }));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') {
        if (document.activeElement instanceof HTMLElement &&
            document.activeElement.closest('.vs-pill')) return;   /* Pille behält Enter/Leertaste */
        e.preventDefault(); go(viewRef.current.step + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault(); go(viewRef.current.step - 1);
      }
      if (e.key === 'Escape') {
        e.preventDefault(); settle();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, settle]);

  /* Mount: Deep-Link ?step=N, dann Einblenden der Seite */
  useEffect(() => {
    const jump = (window.location.search.match(/[?&]step=(\d+)/) || [])[1];
    if (jump) {
      bump();
      setView(v => ({ step: Math.min(VS_LAST, +jump), inst: true, dir: 1, n: v.n + 1 }));
    }
    lock(BEAT * 2);
    tx(rootRef.current, { opacity: 1 }, { duration: 1.264 });
  }, [lock]);

  /* ?step-Spiegel: F5 landet wieder auf demselben Schritt */
  useEffect(() => {
    if (view.n === 0) return;
    const url = new URL(window.location.href);
    if (view.step === 0) url.searchParams.delete('step');
    else url.searchParams.set('step', String(view.step));
    window.history.replaceState(null, '', url);
  }, [view.step, view.n]);

  /* Sofort-Render: für einen Frame alle CSS-Übergänge kappen */
  useEffect(() => {
    if (!view.inst) return;
    const root = rootRef.current;
    if (!root) return;
    root.classList.add('noanim');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { root.classList.remove('noanim'); });
    });
  }, [view]);

  /* Markt-Schritt: die Summe zählt hoch, sobald ihre Zeile auftritt;
     bei Sofort-Render steht sie sofort */
  useEffect(() => {
    const el = numRef.current;
    if (!el || view.step !== 1) return;
    if (view.inst) { el.textContent = fmt(TOTAL); return; }
    el.textContent = fmt(0);
    later(() => { if (el) countUp(el, TOTAL, 632); }, 2528);
  }, [view]);

  /* ---- Schritt 2: EINE durchgehende Maschinen-Choreografie ----
     Prüfung 1 baut sich auf, acht Kreise fallen hinein, drei treten aus.
     Dann die Staffelübergabe: Maschine 1 verlischt, die drei steigen zur
     Sammelreihe, Maschine 2 baut sich auf, schluckt sie — fünf Tarife
     treten aus, der beste blüht warm auf. Alles über tx()/later(), wie
     die Trichterphase der Präsentation; bump() macht jeden Rest wertlos. */
  useEffect(() => {
    const { step, inst, dir } = view;
    const on = step === 2;
    const f1 = f1Ref.current, f2 = f2Ref.current, fin = finRef.current;
    if (!f1 || !f2) return;
    const seed = { duration: 0 };

    if (!on || inst || dir < 0) {
      /* Endzustand (Sprung, Esc, Zurück-Navigation) oder Verlassen */
      const d = (!on || inst) ? 0 : 0.632;
      const D = { duration: d };
      f1.classList.toggle('built', on);
      f2.classList.toggle('built', on);
      tx(f1, { opacity: 0, y: on ? -30 : 40 }, D);
      tx(f2, { opacity: on ? 1 : 0, y: on ? 0 : 40 }, D);
      coRefs.current.forEach((el, i) => tx(el, { x: gx1(i), y: IN_Y, scale: 1, opacity: 0 }, seed));
      svRefs.current.forEach((el, i) => tx(el, { x: gx2(i), y: IN_Y, scale: 1, opacity: 0 }, seed));
      pdRefs.current.forEach((el, i) => {
        if (!el) return;
        el.classList.toggle('glow', on && i === F2_WIN);
        tx(el, on
          ? (i === F2_WIN
            ? { x: 200, y: WIN_Y, scale: 1.6, opacity: 1 }
            : { x: pdx(i), y: OUT_Y + 8, scale: 1, opacity: 0.42 })
          : { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 }, D);
      });
      tx(fin, { opacity: on ? 1 : 0 }, D);
      return;
    }

    /* Vorwärts-Choreografie — Saat der Grundzustände */
    f1.classList.remove('built'); f2.classList.remove('built');
    pdRefs.current.forEach(el => el?.classList.remove('glow'));
    tx(f1, { opacity: 0, y: 40 }, seed);
    tx(f2, { opacity: 0, y: 40 }, seed);
    tx(fin, { opacity: 0 }, seed);
    coRefs.current.forEach((el, i) => tx(el, { x: gx1(i), y: IN_Y, scale: 1, opacity: 0 }, seed));
    svRefs.current.forEach(el => tx(el, { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 }, seed));
    pdRefs.current.forEach(el => tx(el, { x: SPOUT.x, y: SPOUT.y, scale: 0.4, opacity: 0 }, seed));

    /* Maschine 1 baut sich aus dem Tisch (2 Takte) */
    later(() => { f1.classList.add('built'); tx(f1, { opacity: 1, y: 0 }, { duration: 1.264 }); }, 316);
    /* Acht Unternehmen treten an und fallen hinein */
    coRefs.current.forEach((el, i) => {
      later(() => { tx(el, { opacity: 1 }, { duration: 0.632 }); }, 1264 + i * 79);
      later(() => {
        tx(el, { y: FALL_Y, scale: 0.5 }, { duration: 0.632, ease: FALL });
        tx(el, { opacity: 0 }, { duration: 0.158, delay: 0.474 });
      }, 2212 + i * 79);
    });
    /* Drei bestehen: treten unten in den Lichtkegel aus */
    later(() => {
      svRefs.current.forEach((el, i) => {
        if (!el) return;
        tx(el, { opacity: 1 }, { duration: 0 });
        tx(el, { x: sox(i), y: OUT_Y, scale: 1 },
          { duration: 1.264, delay: i * 0.158, ease: SPRING });
      });
    }, 3160);
    /* Staffelübergabe: Maschine 1 verlischt nach oben, die drei steigen
       zur Sammelreihe — Maschine 2 baut sich darunter auf */
    later(() => {
      tx(f1, { opacity: 0, y: -30 }, { duration: 1.264 });
      svRefs.current.forEach((el, i) =>
        tx(el, { x: gx2(i), y: IN_Y }, { duration: 1.264, delay: i * 0.158, ease: GLIDE }));
    }, 5056);
    later(() => { f2.classList.add('built'); tx(f2, { opacity: 1, y: 0 }, { duration: 1.264 }); }, 5688);
    /* Einwurf in Prüfung 2 */
    svRefs.current.forEach((el, i) => {
      later(() => {
        tx(el, { y: FALL_Y, scale: 0.5 }, { duration: 0.632, ease: FALL });
        tx(el, { opacity: 0 }, { duration: 0.158, delay: 0.474 });
      }, 6952 + i * 158);
    });
    /* Fünf Tarife treten aus … */
    later(() => {
      pdRefs.current.forEach((el, i) => {
        if (!el) return;
        tx(el, { opacity: 1 }, { duration: 0 });
        tx(el, { x: pdx(i), y: OUT_Y, scale: 1 },
          { duration: 1.264, delay: i * 0.079, ease: SPRING });
      });
    }, 7584);
    /* … die Verlierer treten zurück, der beste blüht warm auf */
    later(() => {
      pdRefs.current.forEach((el, i) => {
        if (!el || i === F2_WIN) return;
        tx(el, { y: OUT_Y + 8, opacity: 0.42 }, { duration: 0.632 });
      });
      const w = pdRefs.current[F2_WIN];
      if (w) { w.classList.add('glow'); tx(w, { x: 200, y: WIN_Y, scale: 1.6 }, { duration: 0.632, ease: GLIDE }); }
      tx(fin, { opacity: 1 }, { duration: 0.632 });
    }, 8848);
  }, [view]);

  return (
    <div
      id="vs-root"
      ref={rootRef}
      onClick={() => {
        if (viewRef.current.step === VS_LAST) return;   /* Versionswahl: nur die Pillen */
        go(viewRef.current.step + 1);
      }}
    >
      <div id="vs-bg" aria-hidden="true" />
      <IconGlyphs />

      <main id="vs-content">
        <section className={'vs-panel' + (view.step === 0 ? ' on' : '')}>
          <h1 className="vs-h1 vs-rise">Weitblick Best Select</h1>
          <p className="vs-sub vs-rise d1">Der ganze Markt. Eine Empfehlung.</p>
        </section>

        {/* Rückblick 1: Nachtkarte + Marktleiter als Tisch-Hologramme,
            der Titel liegt an der vorderen Tischkante */}
        <section className={'vs-panel wide' + (view.step === 1 ? ' on' : '')}>
          <div className="vi-market" aria-hidden="true">
            <figure className="vi-holo hmap" style={{ '--fd': '.316s' } as CSSProperties}>
              <div className="vi-map">
                {WINNER_ICONS.map((p, i) => (
                  <span
                    key={p.cat}
                    className={'vi-ico vi-' + p.cat}
                    style={{
                      left: (p.x / 16).toFixed(1) + '%',
                      top: (p.y / 9).toFixed(1) + '%',
                      '--fd': (1.58 + i * 0.079).toFixed(3) + 's',
                    } as CSSProperties}
                  >
                    <svg viewBox="0 0 16 16"><use href={GLYPH[p.cat]} /></svg>
                  </span>
                ))}
              </div>
              <span className="vi-base" />
            </figure>
            <figure className="vi-holo hledger" style={{ '--fd': '.632s' } as CSSProperties}>
              <div className="vi-ledger">
                <div className="vi-core">
                  {CATS.map((c, i) => (
                    <div
                      key={c.key}
                      className="vi-row"
                      style={{ '--fd': (1.896 + i * 0.079).toFixed(3) + 's' } as CSSProperties}
                    >
                      <span className={'vi-tile vi-' + c.key}>
                        <svg viewBox="0 0 16 16"><use href={c.glyph} /></svg>
                      </span>
                      <span className="vi-label">{c.label}</span>
                      <span className="vi-count">{fmt(c.total)}</span>
                    </div>
                  ))}
                  <div className="vi-row vi-total" style={{ '--fd': '2.528s' } as CSSProperties}>
                    <span className="vi-label">Gesamt</span>
                    <span className="vi-count" ref={numRef}>{fmt(TOTAL)}</span>
                  </div>
                </div>
              </div>
              <span className="vi-base" />
            </figure>
          </div>
          <h1 className="vs-h1 vi-ttitle">Der ganze Markt, gescannt.</h1>
        </section>

        {/* Rückblick 2: eine Bühne, zwei Maschinen nacheinander — der Fluss
            acht → drei → der beste, in einem Zug */}
        <section className={'vs-panel wide p2' + (view.step === 2 ? ' on' : '')}>
          <div className="vi-funnelstage" aria-hidden="true">
            <div className="vi-stage2">
              <MiniFunnel ref={f1Ref} title="Unternehmensanalyse" withDefs />
              <MiniFunnel ref={f2Ref} title="Produktanalyse" />
              {Array.from({ length: 8 }, (_, i) => (
                <span key={'c' + i} className="vi-dot co"
                  ref={el => { coRefs.current[i] = el; }} />
              ))}
              {Array.from({ length: 3 }, (_, i) => (
                <span key={'s' + i} className="vi-dot co out"
                  ref={el => { svRefs.current[i] = el; }} />
              ))}
              {Array.from({ length: 5 }, (_, i) => (
                <span key={'p' + i} className="vi-dot pd"
                  ref={el => { pdRefs.current[i] = el; }} />
              ))}
              <span className="vi-base" />
            </div>
            <div className="vi-finale" ref={finRef}>
              <span className="vi-tag">Best Select</span>
            </div>
          </div>
          <h1 className="vs-h1 vi-ttitle">Zwei Prüfungen. Eine Empfehlung.</h1>
        </section>

        <section className={'vs-panel' + (view.step === VS_LAST ? ' on' : '')}>
          <p className="vs-kicker vs-rise">Wie geht es weiter?</p>
          <div className="vs-pills" onClick={e => e.stopPropagation()}>
            <Link href="/presentation" className="vs-pill vs-rise d1">
              <span>Version 1 — Präsentation</span>
              <span className="vs-ico" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.2 8h9.4M8.9 4.3 12.6 8l-3.7 3.7" />
                </svg>
              </span>
            </Link>
            <Link href="/strategie" className="vs-pill vs-rise d2">
              <span>Kapitel 3 — Strategie</span>
              <span className="vs-ico" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.2 8h9.4M8.9 4.3 12.6 8l-3.7 3.7" />
                </svg>
              </span>
            </Link>
            <button type="button" className="vs-pill vs-rise d3" onClick={replay}>
              <span>Version 2 — Kurzfassung erneut</span>
              <span className="vs-ico" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13 2.6V5h-2.4" />
                </svg>
              </span>
            </button>
          </div>
        </section>
      </main>

      <div className="sr-only" aria-live="polite">{vsEvidence(view.step)}</div>

      <div className={'vs-meta' + (view.step === 1 || view.step === 2 ? ' show' : '')}
        aria-hidden="true">
        {pad(Math.min(view.step, 2))}&thinsp;/&thinsp;02
      </div>
    </div>
  );
}

/* Die Prüf-Maschine der Präsentation im Miniaturformat, holographisch:
   lichtdurchlässiges Azur im Ton des Tisch-Leuchtstreifens. Beide Maschinen
   liegen übereinander auf der Bühne; .built gibt sie von unten frei
   (clip-path), Deckkraft und Hub fährt die Choreografie per tx(). Die defs
   liegen nur in der ERSTEN Instanz — url(#…) löst dokumentweit auf. */
const MiniFunnel = forwardRef<SVGSVGElement, { title: string; withDefs?: boolean }>(
  function MiniFunnel({ title, withDefs }, ref) {
    return (
      <svg className="vi-glass" viewBox="0 0 360 260" aria-hidden="true" ref={ref}>
        {withDefs && (
          <defs>
            <linearGradient id="vfg" x1="0" y1="60" x2="0" y2="192" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(95,163,245,.30)" />
              <stop offset="1" stopColor="rgba(60,110,180,.10)" />
            </linearGradient>
            <radialGradient id="vfInner" cx="180" cy="70" r="150" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(158,209,255,.30)" />
              <stop offset="1" stopColor="rgba(158,209,255,0)" />
            </radialGradient>
            <linearGradient id="vfEdge" x1="0" y1="60" x2="0" y2="168" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(158,209,255,.6)" />
              <stop offset="1" stopColor="rgba(158,209,255,.08)" />
            </linearGradient>
            <linearGradient id="vfBeam" x1="0" y1="192" x2="0" y2="240" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(120,190,255,.4)" />
              <stop offset="1" stopColor="rgba(120,190,255,0)" />
            </linearGradient>
            <linearGradient id="vfBeamX" x1="164" y1="0" x2="196" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.22" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.78" stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id="vfBeamMask">
              <rect x="164" y="192" width="32" height="48" fill="url(#vfBeamX)" />
            </mask>
            <filter id="vfGlow" x="-60%" y="-600%" width="220%" height="1300%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        )}

        {/* Lichtkegel unter dem Auslauf — beidseitig weich auslaufend */}
        <rect x="164" y="192" width="32" height="48" fill="url(#vfBeam)" mask="url(#vfBeamMask)" />

        {/* Korpus + Innenlicht: lichtdurchlässig, der Raum scheint durch */}
        <path d="M40 60 H320 L192 168 V192 H168 V168 Z" fill="url(#vfg)" />
        <path d="M40 60 H320 L192 168 V192 H168 V168 Z" fill="url(#vfInner)" />

        {/* Zeilenbänder */}
        <path className="vi-band" d="M40 60 H320 L286.8 88 H73.2 Z" />
        <path className="vi-band alt" d="M73.2 88 H286.8 L253.6 116 H106.4 Z" />
        <path className="vi-band" d="M106.4 116 H253.6 L222.8 142 H137.2 Z" />
        <path className="vi-band alt" d="M137.2 142 H222.8 L192 168 V192 H168 V168 Z" />

        {/* Wandstärke: lichtes Band unter dem Rand */}
        <path d="M40 60 H320 L313 63.6 H47 Z" fill="rgba(120,190,255,.28)" />
        <line x1="47" y1="63.6" x2="313" y2="63.6" stroke="rgba(158,209,255,.3)" strokeWidth="1" />

        {/* Glaskanten */}
        <line className="vi-edge" x1="40" y1="60" x2="168" y2="168" stroke="url(#vfEdge)" />
        <line className="vi-edge" x1="320" y1="60" x2="192" y2="168" stroke="url(#vfEdge)" />
        <line x1="168" y1="168" x2="168" y2="192" stroke="rgba(158,209,255,.45)" strokeWidth="1.5" />
        <line x1="192" y1="168" x2="192" y2="192" stroke="rgba(158,209,255,.45)" strokeWidth="1.5" />

        {/* Leuchtender Rand + Auslauf */}
        <line className="vi-lip" x1="40" y1="61" x2="320" y2="61" filter="url(#vfGlow)" />
        <line x1="170" y1="192" x2="190" y2="192" stroke="#9ED1FF" strokeWidth="2" filter="url(#vfGlow)" />

        {/* Typenschild: EIN Wort auf dem Glas — benennt, WAS geprüft wird */}
        <text className="vi-flabel" x="180" y="80">{title}</text>
      </svg>
    );
  });
