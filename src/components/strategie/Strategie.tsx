'use client';

/* Kapitel 3 — Strategie: der Boardroom mit dem Wandschirm. Die Erzählung
   spielt AUF dem Fernseher und folgt dem gesprochenen Weg: erst DEIN Ziel,
   daraus die Ist-Situation als Finanzplan (dein Leben in Zahlen), daraus
   ein maßgeschneiderter Plan — der Auftrag: bei gleichem Brutto mehr Netto.
   Schritt 1 stellt diesen Weg als drei Stationen auf den Schirm, Schritt 2
   verdichtet die Bausteine des Finanzplans im Karussell zu vier Hebeln
   (Immobilie, Förderungen, Investments, Steuern), Schritt 3 zeigt den
   Monats-Cashflow als Lichtader (Brutto → Abzüge → Netto → Fixkosten →
   frei verfügbar), und als Schlussbild beweist das Dashboard den Auftrag:
   gleiches Brutto, mehr Netto — der freie Betrag wächst um die vier Hebel;
   es bleibt bis zum Kapitelende stehen. Family-Office-Erzählung, kein
   Versicherungsvertrieb.
   Damit die Overlays pixelgenau auf dem Fernseher sitzen,
   ist die Bühne wie in der Präsentation eine feste 1600×900-Fläche im
   Contain-Fit (das ganze Foto bleibt sichtbar, Letterbox statt Beschnitt —
   auch auf 4:3-Beamern): Bühnen-Koordinaten bleiben 1:1 Foto-Koordinaten. Konventionen wie BestSelect:
   go()/lock()/settle(), 632-ms-Raster, ?step-Spiegel in der URL. */

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bump, fmt, pad, reduced, tx } from '@/lib/best-select/animate';
import { useStageFit } from '@/lib/best-select/stage-fit';
import IconGlyphs from '@/components/best-select/IconGlyphs';
import './strategie.css';

const BEAT = 632;
const ST_LAST = 5;   /* 0 Intro · 1 Dein Weg · 2 Analyse · 3 Cashflow · 4 Strategie · 5 Kapitelende */

/* Der Fernseher im Foto (leuchtendes Panel, Bezel-sicher eingerückt):
   gemessen 936→1634 / 366→740 px im 2560×1440-Original, ×0.625 auf die
   1600×900-Bühne — strategie.css führt dieselben Werte als --tv-…. */

/* Schritt 1 — Dein Weg: die drei Stationen des gesprochenen Textes
   (Ziel → Ist-Situation als Finanzplan → maßgeschneiderter Plan) */
const STEPS = [
  { key: 'ziel', glyph: '#g-target', label: 'Dein Ziel', sub: 'Wo willst du hin?' },
  { key: 'ist', glyph: '#g-doc', label: 'Ist-Situation', sub: 'Dein Leben in Zahlen' },
  { key: 'plan', glyph: '#g-chart', label: 'Dein Plan', sub: 'Maßgeschneidert' },
];

/* Schritt 2 — die fünf Bausteine des Finanzplans, die um die Analyse kreisen */
const FINANZPLAN = [
  { key: 'ziel', glyph: '#g-target', label: 'Ziel' },
  { key: 'euro', glyph: '#g-euro', label: 'Einkommen' },
  { key: 'wallet', glyph: '#g-wallet', label: 'Ausgaben' },
  { key: 'bank', glyph: '#g-bank', label: 'Vermögen' },
  { key: 'doc', glyph: '#g-doc', label: 'Verträge' },
];

/* Analyse-Bühne (Screen-Koordinaten 436×233): der Planet bei (218, 97),
   die fünf Bausteine stehen als Monde auf EINER Bahn um ihn — ein
   Karussell, das NUR auf Klick in den Monitor weiterdreht (sonst steht
   das Bild). Basis-Phasen so gelegt, dass ein Mond exakt vorn (25 % =
   unten) steht; jeder Klick addiert 20 % auf --spin, offset-distance
   wickelt auf der geschlossenen Bahn über 100 % hinaus weiter.
   fx/fy sind die statische Stellung, falls der Browser offset-path
   nicht kennt. Reihenfolge = FINANZPLAN. */
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
/* Die vier Hebel als Ergebnis der Analyse — Kurzform für die Pillen */
const HEBEL_PILLS = ['Immobilie', 'Förderungen', 'Investments', 'Steuern'];

/* Die vier Hebel der Strategie (Schritt 4): Beispielwerte je Monat, die
   auf dem freien Betrag aus Schritt 3 aufsetzen — Reihenfolge = Stapel
   von unten nach oben. Farben aus der Haus-Familie (Gold, Creme, Azur,
   helles Azur), damit Balkensegment und Hebel-Zeile zusammenlesen. */
const HEBEL = [
  { key: 'steuer', label: 'Steueroptimierung', glyph: '#g-percent', plus: 250, color: '#F5C866' },
  { key: 'foerder', label: 'Staatl. Förderungen', glyph: '#g-bank', plus: 200, color: '#F7EFE9' },
  { key: 'immo', label: 'Immobilie', glyph: '#g-home', plus: 150, color: '#5FA3F5' },
  { key: 'invest', label: 'Investments', glyph: '#g-chart', plus: 100, color: '#9ED1FF' },
];

/* Beispielrechnung — EINE Basis für Schritt 3 und 4 */
const BRUTTO = 4000;
const FREI = 1000;   /* frei verfügbar heute — das goldene Ergebnis von Schritt 3 */
const GAIN = HEBEL.reduce((a, h) => a + h.plus, 0);

/* Hero-Diagramm (viewBox 230×132): zwei Säulen — Heute · Mit Strategie.
   Der Maßstab richtet sich nach dem Endwert (frei + Hebel = obere Kante
   CF_TOP), nicht nach dem Brutto: am Brutto-Maßstab wären die Segmente
   nur 2–4 px hoch. Dass das Brutto gleich bleibt, sagt die Klammer über
   beiden Säulen. Segmente stapeln kumuliert nach oben, jedes mit eigenem
   Takt auf dem 632-Raster (2.528 → 4.424 s). */
const CF_BASE = 110;
const CF_TOP = 30;
const CF_K = (CF_BASE - CF_TOP) / (FREI + GAIN);
const CF_FREI_Y = CF_BASE - FREI * CF_K;
const SEGS = (() => {
  let acc = FREI;
  return HEBEL.map((h, i) => {
    const y0 = acc; acc += h.plus;
    return { ...h, y: CF_BASE - (y0 + h.plus) * CF_K, h: h.plus * CF_K, fd: (2.528 + i * 0.632).toFixed(3) };
  });
})();

/* Finanzstrom (Schritt 3, Screen-Koordinaten 436×233) — EINE fließende
   Lichtlinie durchläuft alle fünf Stationen der Reihe nach:
   Brutto → Abzüge → Netto → Fixkosten → Frei verfügbar. Die Linie
   pendelt dabei im 90°-Winkel zwischen Mitte, rechter Seite (Abzüge)
   und linker Seite (Fixkosten) — jede Station ist Teil des Flusses,
   kein Abzweig. Leitungsenden liegen einige Pixel unter den Karten,
   damit Auto-Höhen nie eine Lücke reißen. */
const TREE = [
  { left: 159, top: 24, title: 'Bruttogehalt', amount: '4.000,00 €', gold: false, fd: 0.632 },
  { left: 159, top: 100, title: 'Netto', amount: '2.600,00 €', gold: false, fd: 3.16 },
  { left: 159, top: 178, title: 'Frei verfügbar', amount: '1.000,00 €', gold: true, fd: 5.688 },
];
const TREE_SIDE = [
  {
    left: 294, top: 54, fd: 1.896, title: 'Abzüge', amount: '−1.400,00 €',
    rows: [['Sozialabgaben', '−840,00 €'], ['Steuern', '−560,00 €']],
  },
  {
    left: 6, top: 130, fd: 4.424, title: 'Fixkosten', amount: '−1.600,00 €',
    rows: [['Miete', '−1.000,00 €'], ['Lebenshaltung', '−600,00 €']],
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
  if (n === 1) return BEAT * 5;    /* 3160: Schirm-Übernahme, drei Stationen, Auftrag */
  if (n === 2) return BEAT * 7;    /* 4424: Bogen, Monde, Nabe, vier Hebel */
  if (n === 3) return BEAT * 10;   /* 6320: Finanzstrom durchläuft alle fünf Stationen bis zum Gold */
  if (n === 4) return BEAT * 10;   /* 6320: Dashboard-Aufbau + Hebel-Stapel bis zum Gold */
  return BEAT * 2;                 /* Intro / Kapitelende: 1264 */
}

/* Evidenz je Schritt für Screenreader — der Schirm ist aria-hidden */
function stEvidence(step: number): string {
  if (step === 1) return 'Schritt 1 von 4, Dein Weg: Zuerst dein Ziel, daraus die Ist-Situation '
    + 'als Finanzplan — dein Leben in Zahlen —, daraus ein maßgeschneiderter Plan. '
    + 'Der Auftrag: bei gleichem Brutto mehr Netto.';
  if (step === 2) return 'Schritt 2 von 4, Analyse: Die Bausteine des Finanzplans — Ziel, '
    + 'Einkommen, Ausgaben, Vermögen, Verträge — kreisen um die Analyse; daraus entstehen '
    + 'vier Hebel: Immobilie, Förderungen, Investments, Steuern.';
  if (step === 3) return 'Schritt 3 von 4, Cashflow: Vom Bruttogehalt von 4.000 Euro gehen '
    + 'Abzüge von 1.400 Euro ab — netto bleiben 2.600 Euro. Nach den Fixkosten — Miete '
    + 'und Lebenshaltung, zusammen 1.600 Euro — bleibt der freie Betrag: 1.000 Euro.';
  if (step === 4) return 'Schritt 4 von 4, Strategie: Gleiches Brutto von ' + fmt(BRUTTO)
    + ' Euro, mehr Netto — der frei verfügbare Betrag wächst von ' + fmt(FREI) + ' auf '
    + fmt(FREI + GAIN) + ' Euro im Monat durch vier Hebel: '
    + HEBEL.map(h => h.label + ' plus ' + fmt(h.plus)).join(', ') + ' Euro.';
  if (step === ST_LAST) return 'Kapitelende: Nochmal spielt das Kapitel noch einmal. '
    + 'Zurück zur Übersicht öffnet die Kapitelwahl.';
  return 'Kapitel 3, Strategie: Vom Ziel über den Finanzplan zum maßgeschneiderten Plan — '
    + 'Immobilie, staatliche Förderungen, Investments und Steueroptimierung. '
    + 'Klick oder Pfeiltaste führt durch vier Schritte.';
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

  useStageFit(viewportRef, stageRef, { w: 1600, h: 900, fit: 'contain' });

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

          {/* Schritt 1 — Dein Weg: drei Stationen steigen vom Tisch auf,
              Pfeile verbinden sie in Sprechreihenfolge, zuletzt der
              Auftrag in Gold: gleiches Brutto, mehr Netto */}
          <section className={'st-spanel' + (s === 1 ? ' on' : '')}>
            <p className="st-shead" style={{ '--fd': '.316s' } as CSSProperties}>
              Finanzstrategie — Dein Weg
            </p>
            <div className="st-chips">
              {STEPS.map((c, i) => (
                <Fragment key={c.key}>
                  {i > 0 && (
                    <span
                      className="st-arrow"
                      style={{ '--fd': (0.474 + i * 0.316).toFixed(3) + 's' } as CSSProperties}
                    >
                      <svg viewBox="0 0 16 16"><path d="M3 8h9.5M8.6 4.1 12.5 8l-3.9 3.9" /></svg>
                    </span>
                  )}
                  <span
                    className="st-chip"
                    style={{ '--fd': (0.632 + i * 0.316).toFixed(3) + 's' } as CSSProperties}
                  >
                    <span className="st-tile"><svg viewBox="0 0 16 16"><use href={c.glyph} /></svg></span>
                    <span className="st-clabel">{c.label}</span>
                    <span className="st-csub">{c.sub}</span>
                  </span>
                </Fragment>
              ))}
            </div>
            <p className="st-mission" style={{ '--fd': '1.896s' } as CSSProperties}>
              Gleiches Brutto. Mehr Netto.
            </p>
          </section>

          {/* Schritt 2 — Analyse: der Planet (die Analyse) hält die fünf
              Bausteine des Finanzplans als Monde auf einer Bahn — ein
              Karussell: erst zeichnet sich der Ring, die Monde treten an
              ihre Plätze, und jeder Klick in den Monitor dreht die nächste
              Karte nach vorn; darunter treten die vier Hebel aus */}
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
                  key={FINANZPLAN[i].key}
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
                      <svg viewBox="0 0 16 16"><use href={FINANZPLAN[i].glyph} /></svg>
                    </span>
                    <span className="st-moonlabel">{FINANZPLAN[i].label}</span>
                  </span>
                </span>
              );
            })}
            <div className="st-needs">
              {HEBEL_PILLS.map((b, i) => (
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
              Deine Strategie
            </p>
            <div className="st-grid">

              {/* Hero: gleiches Brutto, mehr Netto — zwei Säulen, der
                  freie Betrag von heute (Schritt 3) und derselbe Betrag
                  mit den vier Hebeln aufgestapelt */}
              <figure className="st-card" style={{ '--fd': '.632s' } as CSSProperties}>
                <figcaption className="st-ctitle">
                  <span className="st-tile sm"><svg viewBox="0 0 16 16"><use href="#g-euro" /></svg></span>
                  Gleiches Brutto · mehr Netto
                </figcaption>
                <svg className="st-cashflow" viewBox="0 0 230 132" aria-hidden="true">
                  {/* Klammer über beiden Säulen: das Brutto bleibt gleich */}
                  <path className="st-bracket" d="M48 17 V12 H182 V17" pathLength={1}
                    style={{ '--fd': '1.264s' } as CSSProperties} />
                  <text className="st-cftext bracket" x="115" y="8"
                    style={{ '--fd': '1.580s' } as CSSProperties}>
                    Brutto {fmt(BRUTTO)} € — gleich
                  </text>
                  {/* Grundlinie */}
                  <line className="st-axis" x1="14" y1={CF_BASE} x2="222" y2={CF_BASE}
                    style={{ '--fd': '1.264s' } as CSSProperties} />

                  {/* Heute: der freie Betrag aus dem Cashflow */}
                  <rect className="st-bar base" x="48" y={CF_FREI_Y} width="44" height={FREI * CF_K}
                    style={{ '--fd': '1.896s' } as CSSProperties} />
                  <text className="st-cftext amount" x="70" y={CF_FREI_Y - 6}
                    style={{ '--fd': '2.212s' } as CSSProperties}>{fmt(FREI)} €</text>
                  <text className="st-cftext phase" x="70" y="124"
                    style={{ '--fd': '1.896s' } as CSSProperties}>Heute</text>

                  {/* Mit Strategie: dieselbe Basis, darauf die vier Hebel */}
                  <line className="st-ghost" x1="92" y1={CF_FREI_Y} x2="138" y2={CF_FREI_Y}
                    style={{ '--fd': '2.212s' } as CSSProperties} />
                  <rect className="st-bar base" x="138" y={CF_FREI_Y} width="44" height={FREI * CF_K}
                    style={{ '--fd': '2.212s' } as CSSProperties} />
                  {SEGS.map(seg => (
                    <rect
                      key={seg.key}
                      className="st-bar st-seg"
                      x="138" y={seg.y} width="44" height={seg.h}
                      style={{ '--fd': seg.fd + 's', '--c': seg.color } as CSSProperties}
                    />
                  ))}
                  <circle className="st-ping" cx="160" cy={CF_TOP} r="10"
                    style={{ '--fd': '5.056s' } as CSSProperties} />
                  <text className="st-cftext amount gold" x="160" y={CF_TOP - 6}
                    style={{ '--fd': '5.056s' } as CSSProperties}>{fmt(FREI + GAIN)} €</text>
                  <text className="st-cftext delta" x="205" y={(CF_TOP + CF_FREI_Y) / 2 + 3}
                    style={{ '--fd': '5.688s' } as CSSProperties}>+{fmt(GAIN)} €</text>
                  <text className="st-cftext phase warm" x="160" y="124"
                    style={{ '--fd': '2.212s' } as CSSProperties}>Mit Strategie</text>
                </svg>
              </figure>

              {/* Vier Hebel: jede Zeile füllt sich im Takt ihres Segments */}
              <figure className="st-card" style={{ '--fd': '.948s' } as CSSProperties}>
                <figcaption className="st-ctitle">
                  <span className="st-tile sm"><svg viewBox="0 0 16 16"><use href="#g-org" /></svg></span>
                  Vier Hebel
                </figcaption>
                <div className="st-covers">
                  {HEBEL.map((h, i) => (
                    <div className="st-cover" key={h.key}>
                      <span className="st-covhead">
                        <span className="st-tile sm"><svg viewBox="0 0 16 16"><use href={h.glyph} /></svg></span>
                        <span className="st-covlabel">{h.label}</span>
                      </span>
                      <span className="st-covrow">
                        <span className="st-track">
                          <span
                            className="st-fill"
                            style={{ '--w': h.plus / HEBEL[0].plus, '--fd': SEGS[i].fd + 's', '--c': h.color } as CSSProperties}
                          />
                        </span>
                        <span className="st-covamt" style={{ '--fd': SEGS[i].fd + 's' } as CSSProperties}>
                          +{fmt(h.plus)} €
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
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
