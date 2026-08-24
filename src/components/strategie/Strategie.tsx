'use client';

/* Kapitel 3 — Strategie: der Boardroom mit dem Wandschirm. Die Erzählung
   spielt AUF dem Fernseher: erst übernimmt unsere Oberfläche den Schirm
   (Information — fünf Chips mit allem, was das Gespräch ergeben hat), dann
   verdichtet die Analyse die Chips über eine Nabe zu drei Bedarfen, zuletzt
   baut sich das Strategie-Dashboard auf — Absicherung, Vermögensaufbau und
   die Altersvorsorge als Cashflow-Verlauf (Ansparphase → Renteneintritt →
   Rentenphase), zuletzt der Monats-Cashflow als Sankey-Fluss von oben nach
   unten (Brutto → Abzüge → Netto → Fixkosten → freier Betrag). Damit die
   Overlays pixelgenau auf dem Fernseher sitzen,
   ist die Bühne wie in der Präsentation eine feste 1600×900-Fläche — hier
   im Cover-Fit (randlos, Beschnitt statt Letterbox): Bühnen-Koordinaten
   bleiben 1:1 Foto-Koordinaten. Konventionen wie BestSelect:
   go()/lock()/settle(), 632-ms-Raster, ?step-Spiegel in der URL. */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bump, pad, reduced, tx } from '@/lib/best-select/animate';
import { useStageFit } from '@/lib/best-select/stage-fit';
import IconGlyphs from '@/components/best-select/IconGlyphs';
import './strategie.css';

const BEAT = 632;
const ST_LAST = 5;   /* 0 Intro · 1 Information · 2 Analyse · 3 Strategie · 4 Cashflow · 5 Kapitelwahl */

/* Der Fernseher im Foto (leuchtendes Panel, Bezel-sicher eingerückt):
   gemessen 936→1634 / 366→740 px im 2560×1440-Original, ×0.625 auf die
   1600×900-Bühne — strategie.css führt dieselben Werte als --tv-…. */

/* Die fünf Chips der Information: alles, was das Gespräch ergeben hat */
const INFO = [
  { key: 'org', glyph: '#g-org', label: 'Situation' },
  { key: 'euro', glyph: '#g-euro', label: 'Einkommen' },
  { key: 'chart', glyph: '#g-chart', label: 'Ziele' },
  { key: 'doc', glyph: '#g-doc', label: 'Verträge' },
  { key: 'shield', glyph: '#g-shield', label: 'Risikoprofil' },
];

/* Analyse-Bühne (Screen-Koordinaten 436×233): Chips im Bogen über der Nabe */
const ARC: Array<[number, number]> = [[74, 52], [146, 30], [218, 22], [290, 30], [362, 52]];
const HUB: [number, number] = [218, 106];
const BEDARFE = ['Absichern', 'Aufbauen', 'Vorsorgen'];

/* Cashflow (viewBox 230×132): neun azurne Anspar-Balken, Marker am
   Renteneintritt, fünf goldene Entnahme-Balken */
const SAVE_H = [10, 14, 19, 23, 28, 32, 37, 41, 46];
const DRAW_H = [40, 34, 28, 22, 17];
const CF_BASE = 104;

interface StView {
  step: number;
  inst: boolean;   /* Sofort-Render ohne Choreografie */
  dir: 1 | -1;
  n: number;       /* Render-Token */
}

/* Sperren decken die volle Choreografie des Schritts; rückwärts sind es
   Ergebnis-Zustände, kurz sperren */
function lockFor(n: number, dir: number): number {
  if (dir < 0) return BEAT;
  if (n === 1) return BEAT * 5;    /* 3160: Schirm-Übernahme + fünf Chips */
  if (n === 2) return BEAT * 7;    /* 4424: Bogen, Linien, Nabe, drei Bedarfe */
  if (n === 3) return BEAT * 10;   /* 6320: Dashboard-Aufbau + Renten-Crescendo */
  if (n === 4) return BEAT * 12;   /* 7584: Cashflow-Fluss Brutto → frei, Takt für Takt */
  return BEAT * 2;                 /* Intro / Kapitelwahl: 1264 */
}

/* Evidenz je Schritt für Screenreader — der Schirm ist aria-hidden */
function stEvidence(step: number): string {
  if (step === 1) return 'Schritt 1 von 4, Information: Persönliche Situation, Einkommen, '
    + 'Ziele, bestehende Verträge und Risikoprofil — alle Informationen aus dem Gespräch, '
    + 'gesammelt auf einem Schirm.';
  if (step === 2) return 'Schritt 2 von 4, Analyse: Die Informationen laufen in einer Nabe '
    + 'zusammen — daraus entstehen drei Bedarfe: Absichern, Aufbauen, Vorsorgen.';
  if (step === 3) return 'Schritt 3 von 4, Strategie: Drei Bausteine — Absicherung, '
    + 'Vermögensaufbau und Altersvorsorge als Cashflow-Verlauf: Ansparphase bis zum '
    + 'Renteneintritt, danach Rentenphase.';
  if (step === 4) return 'Schritt 4 von 4, Cashflow: Vom Bruttogehalt von 3.000 Euro gehen '
    + 'Steuern und Sozialabgaben ab, es bleiben netto 2.067,50 Euro. Nach Miete und '
    + 'Lebenshaltung bleibt der freie Betrag: 817,50 Euro — die Basis der Strategie.';
  if (step === ST_LAST) return 'Kapitelwahl: Weiter öffnet die Zusammenfassung. '
    + 'Strategie erneut spielt das Kapitel noch einmal.';
  return 'Kapitel 3, Strategie: Aus allen Informationen des Gesprächs entsteht eine '
    + 'individuell entwickelte Finanzstrategie. Klick oder Pfeiltaste führt durch vier Schritte.';
}

export default function Strategie() {
  const [view, setView] = useState<StView>({ step: 0, inst: true, dir: 1, n: 0 });
  const [debug, setDebug] = useState(false);
  const router = useRouter();
  const viewRef = useRef(view);
  viewRef.current = view;
  const busyRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useStageFit(viewportRef, stageRef, { w: 1600, h: 900, fit: 'cover' });

  const lock = useCallback((ms: number) => {
    busyRef.current = true;
    stageRef.current?.classList.add('busy');
    setTimeout(() => {
      busyRef.current = false;
      stageRef.current?.classList.remove('busy');
    }, reduced() ? 120 : ms);
  }, []);

  /* Neustart des Kapitels (Pille „Strategie erneut"): Ausblenden 1 Takt,
     Rücksprung, Einblenden 2 Takte — wie in den anderen Kapiteln */
  const replay = useCallback(() => {
    if (busyRef.current) return;
    lock(BEAT * 3);
    bump();
    tx(viewportRef.current, { opacity: 0 }, { duration: 0.632 });
    setTimeout(() => {
      setView(v => ({ step: 0, inst: true, dir: 1, n: v.n + 1 }));
      tx(viewportRef.current, { opacity: 1 }, { duration: 1.264 });
    }, BEAT);
  }, [lock]);

  const go = useCallback((n: number) => {
    if (busyRef.current) return;
    if (n > ST_LAST) {
      /* Chronologie: nach der Strategie folgt die Zusammenfassung */
      router.push('/');
      return;
    }
    const dir: 1 | -1 = n < viewRef.current.step ? -1 : 1;
    const step = Math.max(0, n);
    lock(lockFor(step, dir));
    bump();
    setView(v => ({ step, inst: false, dir, n: v.n + 1 }));
  }, [lock, router]);

  /* Esc beendet die laufende Choreografie sofort in ihren Endzustand */
  const settle = useCallback(() => {
    if (!busyRef.current) return;
    busyRef.current = false;
    stageRef.current?.classList.remove('busy');
    bump();
    setView(v => ({ step: v.step, inst: true, dir: 1, n: v.n + 1 }));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') {
        if (document.activeElement instanceof HTMLElement &&
            document.activeElement.closest('.st-pill')) return;   /* Pille behält Enter/Leertaste */
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

  /* Mount: Deep-Link ?step=N (&play spielt die Choreografie des Schritts,
     ?debug=1 zeichnet den Fernseher-Rahmen nach), dann Einblenden */
  useEffect(() => {
    const search = window.location.search;
    if (/[?&]debug/.test(search)) setDebug(true);
    const jump = (search.match(/[?&]step=(\d+)/) || [])[1];
    if (jump) {
      const step = Math.min(ST_LAST, +jump);
      const play = /[?&]play/.test(search);
      bump();
      if (play) lock(lockFor(step, 1));
      setView(v => ({ step, inst: !play, dir: 1, n: v.n + 1 }));
    }
    lock(BEAT * 2);
    tx(viewportRef.current, { opacity: 1 }, { duration: 1.264 });
  }, [lock]);

  /* ?step-Spiegel: F5 landet wieder auf demselben Schritt; &play wird verbraucht */
  useEffect(() => {
    if (view.n === 0) return;
    const url = new URL(window.location.href);
    if (view.step === 0) url.searchParams.delete('step');
    else url.searchParams.set('step', String(view.step));
    url.searchParams.delete('play');
    window.history.replaceState(null, '', url);
  }, [view.step, view.n]);

  /* Sofort-Render: für einen Frame alle CSS-Übergänge kappen */
  useEffect(() => {
    if (!view.inst) return;
    const stage = stageRef.current;
    if (!stage) return;
    stage.classList.add('noanim');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { stage.classList.remove('noanim'); });
    });
  }, [view]);

  const s = view.step;
  return (
    <div
      id="st-viewport"
      ref={viewportRef}
      onClick={() => {
        if (viewRef.current.step === ST_LAST) return;   /* Kapitelwahl: nur die Pillen */
        go(viewRef.current.step + 1);
      }}
    >
      <div id="st-stage" ref={stageRef}>
        <IconGlyphs />

        {/* Der Wandschirm: ab Schritt 1 übernimmt unsere Oberfläche das
            Panel (deckende Fläche über dem eingebackenen Dashboard) */}
        <div id="st-screen" className={s >= 1 ? ' live' : ''} aria-hidden="true">

          {/* Schritt 1 — Information: fünf Chips steigen vom Tisch auf */}
          <section className={'st-spanel' + (s === 1 ? ' on' : '')}>
            <p className="st-shead" style={{ '--fd': '.316s' } as CSSProperties}>
              Finanzstrategie — Information
            </p>
            <div className="st-chips">
              {INFO.map((c, i) => (
                <span
                  key={c.key}
                  className="st-chip"
                  style={{ '--fd': (0.632 + i * 0.158).toFixed(3) + 's' } as CSSProperties}
                >
                  <span className="st-tile"><svg viewBox="0 0 16 16"><use href={c.glyph} /></svg></span>
                  <span className="st-clabel">{c.label}</span>
                </span>
              ))}
            </div>
          </section>

          {/* Schritt 2 — Analyse: die Chips laufen über Lichtlinien in einer
              Nabe zusammen, drei Bedarfe treten darunter aus */}
          <section className={'st-spanel' + (s === 2 ? ' on' : '')}>
            <p className="st-shead" style={{ '--fd': '.158s' } as CSSProperties}>
              Finanzstrategie — Analyse
            </p>
            <svg className="st-links" viewBox="0 0 436 233" aria-hidden="true">
              {ARC.map(([x, y], i) => (
                <line
                  key={i}
                  className="st-link"
                  x1={x} y1={y + 14} x2={HUB[0]} y2={HUB[1]}
                  pathLength={1}
                  style={{ '--fd': (0.632 + i * 0.079).toFixed(3) + 's' } as CSSProperties}
                />
              ))}
            </svg>
            {ARC.map(([x, y], i) => (
              <span
                key={INFO[i].key}
                className="st-node"
                style={{
                  left: x + 'px', top: y + 'px',
                  '--fd': (i * 0.079).toFixed(3) + 's',
                } as CSSProperties}
              >
                <svg viewBox="0 0 16 16"><use href={INFO[i].glyph} /></svg>
              </span>
            ))}
            <span className="st-hub" style={{ left: HUB[0] + 'px', top: HUB[1] + 'px' }} />
            <div className="st-needs">
              {BEDARFE.map((b, i) => (
                <span
                  key={b}
                  className="st-need"
                  style={{ '--fd': (3.16 + i * 0.158).toFixed(3) + 's' } as CSSProperties}
                >
                  {b}
                </span>
              ))}
            </div>
          </section>

          {/* Schritt 3 — Strategie: das Dashboard baut sich auf; am letzten
              Schritt bleibt es gedimmt stehen (das Ergebnis bleibt im Raum) */}
          <section className={'st-spanel' + (s === 3 || s === ST_LAST ? ' on' : '') + (s === ST_LAST ? ' dim' : '')}>
            <p className="st-shead" style={{ '--fd': '.158s' } as CSSProperties}>
              Ihre Strategie
            </p>
            <div className="st-grid">

              {/* Altersvorsorge: der Cashflow-Verlauf trägt das Panel */}
              <figure className="st-card cf" style={{ '--fd': '.632s' } as CSSProperties}>
                <figcaption className="st-ctitle">
                  <span className="st-tile sm"><svg viewBox="0 0 16 16"><use href="#g-euro" /></svg></span>
                  Altersvorsorge
                </figcaption>
                <svg className="st-cashflow" viewBox="0 0 230 132" aria-hidden="true">
                  {/* Grundlinie */}
                  <line className="st-axis" x1="14" y1={CF_BASE} x2="222" y2={CF_BASE} />
                  {/* Ansparphase: Einzahlungen wachsen */}
                  {SAVE_H.map((h, i) => (
                    <rect
                      key={'s' + i}
                      className="st-bar save"
                      x={18 + i * 12} y={CF_BASE - h} width="8" height={h}
                      style={{ '--fd': (2.528 + i * 0.079).toFixed(3) + 's' } as CSSProperties}
                    />
                  ))}
                  {/* Kapitalkurve über die ganze Lebenslinie */}
                  <path
                    className="st-curve"
                    d="M14 102 C 52 96, 92 82, 122 64 C 132 58, 138 55, 143 54
                       C 156 54, 176 64, 222 86"
                    pathLength={1}
                  />
                  {/* Renteneintritt: der Umschlagpunkt */}
                  <line className="st-mark" x1="143" y1="26" x2="143" y2={CF_BASE} />
                  <circle className="st-ping" cx="143" cy="54" r="10" pathLength={1} />
                  <text className="st-cftext mark" x="143" y="18">Renteneintritt</text>
                  {/* Rentenphase: Entnahmen, warm wie der Gewinner-Tarif */}
                  {DRAW_H.map((h, i) => (
                    <rect
                      key={'d' + i}
                      className="st-bar draw"
                      x={148 + i * 12} y={CF_BASE - h} width="8" height={h}
                      style={{ '--fd': (4.74 + i * 0.079).toFixed(3) + 's' } as CSSProperties}
                    />
                  ))}
                  {/* Phasen-Beschriftung */}
                  <text className="st-cftext phase" x="72" y="122">Ansparphase</text>
                  <text className="st-cftext phase warm" x="184" y="122">Rentenphase</text>
                </svg>
              </figure>

              {/* Absicherung: drei Deckungsbalken füllen sich */}
              <figure className="st-card" style={{ '--fd': '.948s' } as CSSProperties}>
                <figcaption className="st-ctitle">
                  <span className="st-tile sm"><svg viewBox="0 0 16 16"><use href="#g-shield" /></svg></span>
                  Absicherung
                </figcaption>
                <div className="st-covers">
                  {[
                    { label: 'Berufsunfähigkeit', w: 0.9, d: '1.264s' },
                    { label: 'Haftpflicht', w: 0.74, d: '1.422s' },
                    { label: 'Existenz', w: 0.58, d: '1.580s' },
                  ].map(r => (
                    <div className="st-cover" key={r.label}>
                      <span className="st-covlabel">{r.label}</span>
                      <span className="st-track">
                        <span className="st-fill" style={{ '--w': r.w, '--fd': r.d } as CSSProperties} />
                      </span>
                    </div>
                  ))}
                </div>
              </figure>

              {/* Vermögensaufbau: die Sparlinie zeichnet sich */}
              <figure className="st-card" style={{ '--fd': '1.264s' } as CSSProperties}>
                <figcaption className="st-ctitle">
                  <span className="st-tile sm"><svg viewBox="0 0 16 16"><use href="#g-chart" /></svg></span>
                  Vermögensaufbau
                </figcaption>
                <svg className="st-spark" viewBox="0 0 130 42" aria-hidden="true">
                  <line className="st-axis" x1="4" y1="38" x2="126" y2="38" />
                  <path
                    className="st-sparkline"
                    d="M4 34 L22 30 L38 32 L56 24 L72 26 L90 16 L108 12 L126 6"
                    pathLength={1}
                  />
                </svg>
              </figure>
            </div>
          </section>

          {/* Schritt 4 — Cashflow: vom Brutto zum freien Betrag als Fluss von
              oben nach unten (Sankey-Teaser). Der Hauptstrom verjüngt sich mit
              jeder Station, die Abzüge zweigen als warme Bänder nach rechts ab;
              was unten ankommt, ist gold — der Spielraum der Strategie. */}
          <section className={'st-spanel' + (s === 4 ? ' on' : '')}>
            <p className="st-shead" style={{ '--fd': '.158s' } as CSSProperties}>
              Finanzstrategie — Cashflow
            </p>
            <svg className="st-sankey" viewBox="0 0 436 233" aria-hidden="true">
              <defs>
                <linearGradient id="stFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(120,185,255,.36)" />
                  <stop offset="1" stopColor="rgba(95,163,245,.16)" />
                </linearGradient>
              </defs>
              {/* Hauptstrom Brutto → Netto (Breite ∝ Betrag: 84 → 58) */}
              <path className="st-flowseg f1"
                d="M108 46 C108 66 121 84 121 102 L179 102 C179 84 192 66 192 46 Z" />
              {/* Abzweig Steuern & Sozialabgaben */}
              <path className="st-branch b1"
                d="M191 48 C238 51 260 56 284 62 L284 88 C256 78 228 66 188 62 Z" />
              {/* Hauptstrom Netto → frei (58 → 24) */}
              <path className="st-flowseg f2"
                d="M121 124 C121 140 138 148 138 162 L162 162 C162 148 179 140 179 124 Z" />
              {/* Abzweig Miete & Lebenshaltung */}
              <path className="st-branch b2"
                d="M179 126 C232 130 258 137 284 143 L284 167 C256 159 224 146 177 140 Z" />
              {/* Auslauf in den freien Betrag */}
              <path className="st-flowseg f3" d="M138 162 L138 192 L162 192 L162 162 Z" />
            </svg>
            <div className="st-fnode brutto">
              <span className="st-flabel">Bruttogehalt</span>
              <span className="st-famount">3.000,00 €</span>
            </div>
            <div className="st-fnode netto">
              <span className="st-flabel">Netto</span>
              <span className="st-famount">2.067,50 €</span>
            </div>
            <div className="st-fnode frei">
              <span className="st-flabel">Frei verfügbar</span>
              <span className="st-famount">817,50 €</span>
            </div>
            <div className="st-fbox b1">
              <div className="st-frow head"><span>Abzüge</span><span className="neg">−932,50 €</span></div>
              <div className="st-frow"><span>Lohnsteuer</span><span>−298,00 €</span></div>
              <div className="st-frow"><span>Sozialabgaben</span><span>−634,50 €</span></div>
            </div>
            <div className="st-fbox b2">
              <div className="st-frow head"><span>Fixkosten</span><span className="neg">−1.250,00 €</span></div>
              <div className="st-frow"><span>Miete</span><span>−800,00 €</span></div>
              <div className="st-frow"><span>Lebenshaltung</span><span>−450,00 €</span></div>
            </div>
          </section>
        </div>

        {/* Tischkante: Titel je Schritt im Lampenlicht, am Ende die Pillen */}
        <main id="st-captions">
          <section className={'st-panel' + (s === 0 ? ' on' : '')}>
            <p className="st-kicker st-rise">Kapitel 3 — Strategie</p>
            <h1 className="st-h1 st-rise d1">Ihre Strategie.</h1>
            <p className="st-sub st-rise d2">Aus allen Informationen. Individuell entwickelt.</p>
          </section>
          <section className={'st-panel' + (s === 1 ? ' on' : '')}>
            <h1 className="st-h1 st-line st-rise">Alle Informationen. Gesammelt.</h1>
          </section>
          <section className={'st-panel' + (s === 2 ? ' on' : '')}>
            <h1 className="st-h1 st-line st-rise">Aus Informationen wird Bedarf.</h1>
          </section>
          <section className={'st-panel' + (s === 3 ? ' on' : '')}>
            <h1 className="st-h1 st-line st-rise">Drei Bausteine. Ein Plan.</h1>
          </section>
          <section className={'st-panel' + (s === 4 ? ' on' : '')}>
            <h1 className="st-h1 st-line st-rise">Vom Brutto zum freien Betrag.</h1>
          </section>
          <section className={'st-panel' + (s === ST_LAST ? ' on' : '')}>
            <p className="st-kicker st-rise">Wie geht es weiter?</p>
            <div className="st-pills" onClick={e => e.stopPropagation()}>
              <Link href="/" className="st-pill st-rise d1">
                <span>Weiter — Zusammenfassung</span>
                <span className="st-ico" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                    strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.2 8h9.4M8.9 4.3 12.6 8l-3.7 3.7" />
                  </svg>
                </span>
              </Link>
              <button type="button" className="st-pill st-rise d3" onClick={replay}>
                <span>Strategie erneut</span>
                <span className="st-ico" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                    strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13 2.6V5h-2.4" />
                  </svg>
                </span>
              </button>
            </div>
          </section>
        </main>

        <div className="sr-only" aria-live="polite">{stEvidence(s)}</div>

        <div className={'st-meta' + (s >= 1 && s <= 4 ? ' show' : '')} aria-hidden="true">
          {pad(Math.min(s, 4))}&thinsp;/&thinsp;04
        </div>

        {debug && <div id="st-tv-debug" aria-hidden="true" />}
      </div>
    </div>
  );
}
