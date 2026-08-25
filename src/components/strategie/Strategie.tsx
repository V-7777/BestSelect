'use client';

/* Kapitel 3 — Strategie: der Boardroom mit dem Wandschirm. Die Erzählung
   spielt AUF dem Fernseher: erst übernimmt unsere Oberfläche den Schirm
   (Information — fünf Chips mit allem, was das Gespräch ergeben hat), dann
   verdichtet die Analyse die Chips über eine Nabe zu drei Bedarfen, dann
   zeigt der Monats-Cashflow als Sankey-Fluss von oben nach unten den
   Spielraum (Brutto → Abzüge → Netto → Fixkosten → freier Betrag), und als
   Schlussbild baut sich das Strategie-Dashboard auf — Absicherung,
   Vermögensaufbau und die Altersvorsorge als Cashflow-Verlauf (Ansparphase
   → Renteneintritt → Rentenphase); es bleibt bis zum Kapitelende stehen.
   Damit die Overlays pixelgenau auf dem Fernseher sitzen,
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
const ST_LAST = 5;   /* 0 Intro · 1 Information · 2 Analyse · 3 Cashflow · 4 Strategie · 5 Kapitelende */

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

/* Analyse-Bühne (Screen-Koordinaten 436×233): der Planet bei (218, 97),
   die fünf Informationen stehen als Monde auf EINER Bahn um ihn — ein
   Karussell, das NUR auf Klick in den Monitor weiterdreht (sonst steht
   das Bild). Basis-Phasen so gelegt, dass ein Mond exakt vorn (25 % =
   unten) steht; jeder Klick addiert 20 % auf --spin, offset-distance
   wickelt auf der geschlossenen Bahn über 100 % hinaus weiter.
   fx/fy sind die statische Stellung, falls der Browser offset-path
   nicht kennt. Reihenfolge = INFO. */
const ORBIT = { rx: 130, ry: 54 };
const MOONS = [
  { od: 25, fx: 218, fy: 151 },
  { od: 45, fx: 94, fy: 114 },
  { od: 65, fx: 142, fy: 53 },
  { od: 85, fx: 294, fy: 53 },
  { od: 5, fx: 342, fy: 114 },
];
/* Tiefe je Karussell-Platz p = (i + spin) mod 5: vorn groß und voll da,
   die hinteren klein und leise — man liest die Karte, die vorn steht */
const DEPTH = [
  { s: 1.55, o: 1 },    /* 25 %: vorn unten */
  { s: 1, o: 0.85 },    /* 45 %: links */
  { s: 0.7, o: 0.5 },   /* 65 %: hinten links */
  { s: 0.7, o: 0.5 },   /* 85 %: hinten rechts */
  { s: 1, o: 0.85 },    /* 5 %: rechts */
];
const BEDARFE = ['Absichern', 'Aufbauen', 'Vorsorgen'];

/* Cashflow (viewBox 230×132): neun azurne Anspar-Balken, Marker am
   Renteneintritt, fünf goldene Entnahme-Balken */
const SAVE_H = [10, 14, 19, 23, 28, 32, 37, 41, 46];
const DRAW_H = [40, 34, 28, 22, 17];
const CF_BASE = 104;

/* Finanzstrom (Schritt 3, Screen-Koordinaten 436×233) — EINE fließende
   Lichtlinie durchläuft alle fünf Stationen der Reihe nach:
   Brutto → Abzüge → Netto → Fixkosten → Frei verfügbar. Die Linie
   pendelt dabei im 90°-Winkel zwischen Mitte, rechter Seite (Abzüge)
   und linker Seite (Fixkosten) — jede Station ist Teil des Flusses,
   kein Abzweig. Leitungsenden liegen einige Pixel unter den Karten,
   damit Auto-Höhen nie eine Lücke reißen. */
const TREE = [
  { left: 159, top: 24, title: 'Bruttogehalt', amount: '3.000,00 €', gold: false, fd: 0.632 },
  { left: 159, top: 100, title: 'Netto', amount: '2.067,50 €', gold: false, fd: 3.16 },
  { left: 159, top: 178, title: 'Frei verfügbar', amount: '817,50 €', gold: true, fd: 5.688 },
];
const TREE_SIDE = [
  {
    left: 294, top: 54, fd: 1.896, title: 'Abzüge', amount: '−932,50 €',
    rows: [['Sozialabgaben', '−634,50 €'], ['Steuern', '−298,00 €']],
  },
  {
    left: 6, top: 130, fd: 4.424, title: 'Fixkosten', amount: '−1.250,00 €',
    rows: [['Miete', '−800,00 €'], ['Lebenshaltung', '−450,00 €']],
  },
];
/* Leitungen in Fluss-Richtung — jedes Segment gehört zur Hauptader
   und führt den wandernden Lichtimpuls */
const TREE_WIRES = [
  { d: 'M218 54 V76 H298', fd: 1.264, pulse: true },   /* Brutto → Abzüge (rechts) */
  { d: 'M362 92 V118 H273', fd: 2.528, pulse: true },  /* Abzüge → Netto (Mitte) */
  { d: 'M218 130 V152 H138', fd: 3.792, pulse: true }, /* Netto → Fixkosten (links) */
  { d: 'M74 168 V196 H163', fd: 5.056, pulse: true },  /* Fixkosten → Frei (Mitte) */
];

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
  if (n === 3) return BEAT * 10;   /* 6320: Finanzstrom durchläuft alle fünf Stationen bis zum Gold */
  if (n === 4) return BEAT * 10;   /* 6320: Dashboard-Aufbau + Renten-Crescendo */
  return BEAT * 2;                 /* Intro / Kapitelende: 1264 */
}

/* Evidenz je Schritt für Screenreader — der Schirm ist aria-hidden */
function stEvidence(step: number): string {
  if (step === 1) return 'Schritt 1 von 4, Information: Persönliche Situation, Einkommen, '
    + 'Ziele, bestehende Verträge und Risikoprofil — alle Informationen aus dem Gespräch, '
    + 'gesammelt auf einem Schirm.';
  if (step === 2) return 'Schritt 2 von 4, Analyse: Die Informationen kreisen wie Monde um '
    + 'die Analyse — daraus entstehen drei Bedarfe: Absichern, Aufbauen, Vorsorgen.';
  if (step === 3) return 'Schritt 3 von 4, Cashflow: Vom Bruttogehalt von 3.000 Euro gehen '
    + 'Abzüge von 932,50 Euro ab — netto bleiben 2.067,50 Euro. Nach den Fixkosten — Miete '
    + 'und Lebenshaltung, zusammen 1.250 Euro — bleibt der freie Betrag: 817,50 Euro.';
  if (step === 4) return 'Schritt 4 von 4, Strategie: Drei Bausteine — Absicherung, '
    + 'Vermögensaufbau und Altersvorsorge als Cashflow-Verlauf: Ansparphase bis zum '
    + 'Renteneintritt, danach Rentenphase.';
  if (step === ST_LAST) return 'Kapitelende: Nochmal spielt das Kapitel noch einmal. '
    + 'Zurück zur Übersicht öffnet die Kapitelwahl.';
  return 'Kapitel 3, Strategie: Aus allen Informationen des Gesprächs entsteht eine '
    + 'individuell entwickelte Finanzstrategie. Klick oder Pfeiltaste führt durch vier Schritte.';
}

export default function Strategie() {
  const [view, setView] = useState<StView>({ step: 0, inst: true, dir: 1, n: 0 });
  /* Karussell der Analyse: Klicks in den Monitor drehen weiter (je +20 %);
     beim Verlassen des Schritts zurück auf Anfang — jeder Durchlauf startet
     gleich (Determinismus-Prinzip) */
  const [spin, setSpin] = useState(0);
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

  /* Neustart des Kapitels (Pille „Nochmal"): Ausblenden 1 Takt,
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
      /* Kapitelende: Weiter (Tastatur) führt zurück zur Übersicht, wie die
         Link-Pille — „Nochmal" läuft nur über die Pille */
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

  /* Karussell zurücksetzen, sobald die Analyse verlassen wird */
  useEffect(() => {
    if (view.step !== 2) setSpin(0);
  }, [view.step]);

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
        if (viewRef.current.step === ST_LAST) return;   /* Kapitelende: nur die Pillen */
        go(viewRef.current.step + 1);
      }}
    >
      <div id="st-stage" ref={stageRef}>
        <IconGlyphs />

        {/* Der Wandschirm: ab Schritt 1 übernimmt unsere Oberfläche das
            Panel (deckende Fläche über dem eingebackenen Dashboard).
            Während der Analyse dreht ein Klick IN den Monitor das Karussell
            weiter, statt den Schritt zu wechseln — die Bühne drumherum
            behält ihre normale Weiter-Geste. */}
        <div
          id="st-screen"
          className={s >= 1 ? ' live' : ''}
          aria-hidden="true"
          onClick={e => {
            if (viewRef.current.step !== 2) return;
            e.stopPropagation();
            if (busyRef.current) return;
            setSpin(v => v + 1);
          }}
        >

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

          {/* Schritt 2 — Analyse: der Planet (die Analyse) hält die fünf
              Informationen als Monde auf einer Bahn — ein Karussell: erst
              zeichnet sich der Ring, die Monde treten an ihre Plätze, und
              jeder Klick in den Monitor dreht die nächste Karte nach vorn;
              darunter treten die drei Bedarfe aus */}
          <section
            className={'st-spanel' + (s === 2 ? ' on' : '')}
            style={{ '--spin': spin * 20 + '%' } as CSSProperties}
          >
            <p className="st-shead" style={{ '--fd': '.158s' } as CSSProperties}>
              Finanzstrategie — Analyse
            </p>
            <svg className="st-orbits" viewBox="0 0 436 233" aria-hidden="true">
              <ellipse
                className="st-ring"
                cx="218" cy="97" rx={ORBIT.rx} ry={ORBIT.ry}
                pathLength={1}
                style={{ '--fd': '.632s' } as CSSProperties}
              />
            </svg>
            <span className="st-planet" />
            {MOONS.map((m, i) => {
              const d = DEPTH[(i + spin) % 5];
              return (
                <span
                  key={INFO[i].key}
                  className="st-moon"
                  style={{
                    '--orb': `ellipse(${ORBIT.rx}px ${ORBIT.ry}px at 218px 97px)`,
                    '--od': m.od + '%',
                    '--fx': m.fx + 'px', '--fy': m.fy + 'px',
                    '--fd': (1.264 + i * 0.158).toFixed(3) + 's',
                    '--s': d.s, '--o': d.o,
                  } as CSSProperties}
                >
                  <span className="st-moonbody">
                    <span className="st-moontile">
                      <svg viewBox="0 0 16 16"><use href={INFO[i].glyph} /></svg>
                    </span>
                    <span className="st-moonlabel">{INFO[i].label}</span>
                  </span>
                </span>
              );
            })}
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

          {/* Schritt 4 — Strategie: das Dashboard baut sich als Schlussbild
              auf und bleibt am letzten Schritt gedimmt stehen (das Ergebnis
              bleibt im Raum — nur einmal, am Ende) */}
          <section className={'st-spanel' + (s === 4 || s === ST_LAST ? ' on' : '') + (s === ST_LAST ? ' dim' : '')}>
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

          {/* Schritt 3 — Cashflow: eine Lichtader schlängelt sich durch
              alle fünf Stationen in Fluss-Reihenfolge Brutto → Abzüge →
              Netto → Fixkosten → Frei verfügbar. Verbinder strikt im
              90°-Winkel; jedes Segment führt den wandernden Impuls, jede
              Karte poppt auf, sobald ihre Leitung sie erreicht. */}
          <section className={'st-spanel' + (s === 3 ? ' on' : '')}>
            <p className="st-shead" style={{ '--fd': '.158s' } as CSSProperties}>
              Finanzstrategie — Cashflow
            </p>
            <svg className="st-flowmap" viewBox="0 0 436 233" aria-hidden="true">
              {TREE_WIRES.map((w, i) => (
                <path key={'w' + i} className="st-wire" d={w.d} pathLength={1}
                  style={{ '--fd': w.fd + 's' } as CSSProperties} />
              ))}
              {TREE_WIRES.filter(w => w.pulse).map((w, i) => (
                <path key={'p' + i} className="st-pulse" d={w.d} pathLength={1}
                  style={{ '--fd': w.fd + 's' } as CSSProperties} />
              ))}
            </svg>
            {TREE.map(c => (
              <div
                key={c.title}
                className={'st-tcard' + (c.gold ? ' gold' : '')}
                style={{ left: c.left + 'px', top: c.top + 'px', '--fd': c.fd + 's' } as CSSProperties}
              >
                <span className="st-ftitle">{c.title}</span>
                <span className="st-famount">{c.amount}</span>
              </div>
            ))}
            {TREE_SIDE.map(c => (
              <div
                key={c.title}
                className="st-tside"
                style={{ left: c.left + 'px', top: c.top + 'px', '--fd': c.fd + 's' } as CSSProperties}
              >
                <div className="st-trow head"><span>{c.title}</span><span className="neg">{c.amount}</span></div>
                {c.rows.map(([l, a]) => (
                  <div className="st-trow" key={l}><span>{l}</span><span>{a}</span></div>
                ))}
              </div>
            ))}
          </section>
        </div>

        {/* Tischkante: Titel je Schritt im Lampenlicht, am Ende die Pillen */}
        <main id="st-captions">
          {/* Keine Tischtexte: das Bild spricht — nur am Ende steht das
              Kapitelende-Paar, das alle Kapitel teilen: Nochmal · Zurück
              zur Übersicht */}
          <section className={'st-panel' + (s === ST_LAST ? ' on' : '')}>
            <div className="st-pills" onClick={e => e.stopPropagation()}>
              <button type="button" className="st-pill st-rise d1" onClick={replay}>
                <span>Nochmal</span>
                <span className="st-ico" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13 2.6V5h-2.4" />
                </svg>
                </span>
              </button>
              <Link href="/" className="st-pill st-rise d3">
                <span>Zurück zur Übersicht</span>
                <span className="st-ico" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                  strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.8 8H3.4M7.1 4.3 3.4 8l3.7 3.7" />
                </svg>
                </span>
              </Link>
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
