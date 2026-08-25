'use client';

/* Kapitel 7 — Status Quo: der Boardroom mit der zweiteiligen Videowand.
   Die Erzählung spielt AUF den beiden Schirmen und sagt eines: wir
   bleiben dran. Links läuft deine Lebenslinie als Timeline — Jahres-
   Ticks ab dem laufenden Jahr, nur „Heute" trägt die Jahreszahl (die
   Zukunft bleibt offen: Ticks und Spur laufen nach rechts aus), die
   Ereignisse folgen ohne Datum: Hochzeit, Nachwuchs, neuer Job, Rente —
   wir sind ein Leben lang dabei. Ein weicher Balken füllt sich wie ein
   Fortschritt hinter der gezeichneten Linie, EIN Lichtimpuls läuft die
   ganze gezeichnete Strecke ab, und zu jedem Ereignis erscheint, was
   am Plan angepasst wird. Sprache: gesprochenes Deutsch im Du (Singular),
   Karten als Checkliste — Stichworte aus dem deutschen Steuer- und
   Förderrecht, keine Wir-Sätze, keine Slogans. Rechts steht der Berater-Schirm: die vier Hebel
   des Family Office (Steueroptimierung · Förderungen · Immobilie ·
   Investments, wie in Kapitel 3) füllen sich mit jedem Ereignis neu, das
   Protokoll sammelt die Aktualisierungen. Am Ende läuft die Linie über
   den Schirmrand hinaus weiter. Register: du.
   Die beiden Panels im Foto stehen perspektivisch in EINER Ebene; damit
   die Overlays pixelgenau sitzen, werden zwei flache Flächen per
   matrix3d-Homographie auf die gemessenen Vierecke gelegt (Werte in
   status-quo.css). Gegen die Unschärfe projizierter Layer sind die Panels
   doppelt so groß angelegt und in der Matrix halbiert; der Inhalt läuft
   in einer .sq-face/.sq-body mit zoom:2 — die Koordinaten hier bleiben
   die Panelmaße 443×351 bzw. 346×383, gerastert wird mit 2× Dichte.
   Bühne 1600×900 im Contain-Fit: Bühnen-Koordinaten sind
   Foto-Koordinaten ×0.625. Konventionen wie Strategie/BestSelect:
   go()/lock()/settle(), 632-ms-Raster, ?step-Spiegel in der URL.
   Zustandsregel: JEDE Klasse leitet sich aus dem Schritt s ab (s >= k,
   s === k) — nie aus Sequenzen. So rendern Deep-Link, Zurück und Esc
   immer den vollständigen Stand. */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { bump, pad, reduced, tx } from '@/lib/best-select/animate';
import { useStageFit } from '@/lib/best-select/stage-fit';
import IconGlyphs from '@/components/best-select/IconGlyphs';
import './status-quo.css';

const BEAT = 632;
const SQ_LAST = 6;   /* 0 Intro · 1 Status Quo · 2 Hochzeit · 3 Nachwuchs · 4 Neuer Job · 5 Rente · 6 Kapitelende */

/* Gemessene Schirm-Vierecke (Bühnen-Pixel) — für ?debug=1 nachgezeichnet;
   die Homographien in status-quo.css bilden die flachen Panels genau
   auf diese Ecken ab */
const QUAD_L = '525.6,224.4 968.8,196.3 968.8,547.5 525.6,536.9';
const QUAD_R = '981.3,195 1326.9,172.5 1326.9,555.6 981.3,547.5';

/* Timeline (linkes Panel, 443×351): 42 px je Jahr ab dem laufenden Jahr,
   fünf Knoten im Zwei-Jahres-Raster (84 px), Beschriftungen bleiben in
   Lesegröße innerhalb des Schirms; Ticks laufen bis über den Rand */
const YEAR0 = new Date().getFullYear();
const PX_YEAR = 42;
const NODE_X = [40, 124, 208, 292, 376];
const TICKS = Array.from({ length: 11 }, (_, k) => 40 + k * PX_YEAR);
const LINE_Y = 96;
const EVENTS = [
  { key: 'heute', glyph: '#g-today', label: 'Heute' },
  { key: 'ehe', glyph: '#g-rings', label: 'Hochzeit' },
  { key: 'kind', glyph: '#g-child', label: 'Nachwuchs' },
  { key: 'job', glyph: '#g-case', label: 'Neuer Job' },
  { key: 'rente', glyph: '#g-sun', label: 'Rente' },
];

/* Die Karte unter der Timeline: je Schritt 1–5 eine — was am Plan
   angepasst wird, als Checkliste: Stichworte aus dem deutschen Steuer-
   und Förderrecht (Zusammenveranlagung, Sparerpauschbetrag, Kindergeld,
   Elterngeld, VL/Arbeitnehmersparzulage …), bewusst vage — keine
   Zusagen, keine Wir-Sätze; Titel ein Begriff. */
const CARDS = [
  { tag: 'Heute', title: 'Dein Finanzplan',
    rows: ['Steuern, Förderungen, Immobilie, Investments', 'Aufgebaut auf deiner Situation heute'] },
  { tag: 'Hochzeit', title: 'Ehegattensplitting',
    rows: ['Steuerklassenwahl und Zusammenveranlagung', 'Sparerpauschbetrag 2.000 €', 'Förderungen zu zweit'] },
  { tag: 'Nachwuchs', title: 'Förderungen fürs Kind',
    rows: ['Kindergeld und Kinderfreibetrag', 'Elterngeld', 'Kinderbetreuungskosten absetzbar'] },
  /* Neuer Job: das Netto rechnet er selbst — die Aufteilung nicht. Alle
     vier Hebel bleiben im Verhältnis, die Lebenshaltung frisst das Plus
     nicht auf. */
  { tag: 'Neuer Job', title: 'Aufteilung',
    rows: ['Neues Netto auf alle vier Hebel verteilt', 'Lebenshaltung bleibt im Rahmen', 'Vermögenswirksame Leistungen und Sachbezüge'] },
  /* Rente: aus dem Aufbau wird die Entnahme — dabei bleiben wir */
  { tag: 'Rente', title: 'Entnahme',
    rows: ['Sparrate wird Entnahme', 'Immobilie abbezahlt', 'Rentenbesteuerung und Freibeträge'] },
];
const CLOSE = { tag: 'Status Quo', title: 'Immer aktuell',
  rows: ['Bei jeder Veränderung wird der Plan angepasst'] };

/* Berater-Schirm (rechtes Panel, 346×383): die vier Hebel aus Kapitel 3
   (gleiche Reihenfolge und Farben), Füllstand je Ereignis-Index;
   Protokoll und Prüfvermerk */
const LEVERS = [
  { key: 'steuer', label: 'Steueroptimierung', color: '#F5C866' },
  { key: 'foerder', label: 'Förderungen', color: '#F7EFE9' },
  { key: 'immo', label: 'Immobilie', color: '#5FA3F5' },
  { key: 'invest', label: 'Investments', color: '#9ED1FF' },
];
const FILL = [
  [0.30, 0.28, 0.34, 0.36],   /* Heute */
  [0.48, 0.42, 0.34, 0.40],   /* Hochzeit: Splitting, Förderungen für zwei */
  [0.52, 0.62, 0.40, 0.46],   /* Nachwuchs: Förderungen fürs Kind */
  [0.64, 0.68, 0.46, 0.56],   /* Neuer Job: Netto neu, Arbeitgeber-Förderung */
  [0.76, 0.72, 1.00, 0.84],   /* Rente: Immobilie abbezahlt, Entnahme aus Investments, Steuern neu */
];
const LOG = ['Hochzeit', 'Nachwuchs', 'Neuer Job', 'Rente'];
const CHECKED = ['heute', 'Hochzeit', 'Nachwuchs', 'Neuer Job', 'Rente'];

interface SqView {
  step: number;
  inst: boolean;   /* Sofort-Render ohne Choreografie */
  dir: 1 | -1;
  n: number;       /* Render-Token */
}

/* Sperren decken die volle Choreografie des Schritts; rückwärts laufen
   nur Ergebnis-Übergänge ohne Verzögerung (.rev), kurz sperren */
function lockFor(n: number, dir: number): number {
  if (dir < 0) return BEAT * 2;              /* 1264: längster Rück-Übergang */
  if (n === 1) return BEAT * 5;              /* 3160: Schirme, Linie, Heute, Hebel, Karte */
  if (n >= 2 && n <= 5) return BEAT * 7;     /* 4424: Linie → Knoten → Karte → Hebel → Protokoll */
  if (n === SQ_LAST) return BEAT * 3;        /* 1896: Dimmen, Linie läuft weiter, Schlusskarte */
  return BEAT * 2;                           /* Intro: 1264 */
}

/* Evidenz je Schritt für Screenreader — die Schirme sind aria-hidden */
function sqEvidence(step: number): string {
  if (step === 1) return 'Schritt 1 von 5, Heute: Deine Timeline beginnt ' + YEAR0 + '. Dein Finanzplan — '
    + 'Steuern, Förderungen, Immobilie, Investments — aufgebaut auf deiner Situation heute.';
  if (step === 2) return 'Schritt 2 von 5, Hochzeit: Ehegattensplitting — Steuerklassenwahl und '
    + 'Zusammenveranlagung, Sparerpauschbetrag 2.000 Euro, Förderungen zu zweit. Der Plan wird angepasst.';
  if (step === 3) return 'Schritt 3 von 5, Nachwuchs: Förderungen fürs Kind — Kindergeld und '
    + 'Kinderfreibetrag, Elterngeld, Kinderbetreuungskosten absetzbar. Der Plan wird angepasst.';
  if (step === 4) return 'Schritt 4 von 5, Neuer Job: Aufteilung — das neue Netto wird auf alle vier '
    + 'Hebel verteilt, die Lebenshaltung bleibt im Rahmen, vermögenswirksame Leistungen und '
    + 'Sachbezüge. Der Plan wird angepasst.';
  if (step === 5) return 'Schritt 5 von 5, Rente: Entnahme — die Sparrate wird zur Entnahme, die '
    + 'Immobilie ist abbezahlt, Rentenbesteuerung und Freibeträge. Der Plan wird angepasst.';
  if (step === SQ_LAST) return 'Kapitelende: Immer aktuell — bei jeder Veränderung wird der Plan '
    + 'angepasst. Nochmal spielt das Kapitel noch einmal. Zurück zur Übersicht öffnet die Kapitelwahl.';
  return 'Kapitel 7, Status Quo: Deine Timeline — Hochzeit, Nachwuchs, neuer Job, Rente: '
    + 'bei jeder Veränderung wird der Plan angepasst. Klick oder Pfeiltaste führt durch fünf Schritte.';
}

export default function StatusQuo() {
  const [view, setView] = useState<SqView>({ step: 0, inst: true, dir: 1, n: 0 });
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
    if (n > SQ_LAST) {
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
            document.activeElement.closest('.sq-pill')) return;   /* Pille behält Enter/Leertaste */
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
     ?debug=1 zeichnet die gemessenen Schirm-Vierecke nach), dann Einblenden */
  useEffect(() => {
    const search = window.location.search;
    if (/[?&]debug/.test(search)) setDebug(true);
    const jump = (search.match(/[?&]step=(\d+)/) || [])[1];
    if (jump) {
      const step = Math.min(SQ_LAST, +jump);
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
  /* Ereignis-Index für die Hebel: 0 Heute … 4 Rente; das
     Kapitelende hält den letzten Stand */
  const ev = Math.min(Math.max(s - 1, 0), 4);
  const prev = FILL[Math.max(ev - 1, 0)];
  /* Der Berater-Punkt schlägt nur bei einer vorwärts gespielten
     Aktualisierung aus (nie bei Deep-Link, Esc oder Zurück) */
  const burst = s >= 2 && s <= 5 && !view.inst && view.dir > 0;
  const stageClass = (view.dir < 0 && !view.inst ? 'rev' : '') + (debug ? ' debug' : '');

  return (
    <div
      id="sq-viewport"
      ref={viewportRef}
      onClick={() => {
        if (viewRef.current.step === SQ_LAST) return;   /* Kapitelende: nur die Pillen */
        go(viewRef.current.step + 1);
      }}
    >
      <div id="sq-stage" ref={stageRef} className={stageClass.trim()}>
        <IconGlyphs />

        {/* Die Videowand: ab Schritt 1 übernehmen unsere Flächen beide Panels
            (deckend über dem eingebackenen Dashboard). Keine Interaktion im
            Schirm — Klicks fallen zur Bühne durch. */}
        <div id="sq-screens" className={s >= 1 ? 'live' : ''} aria-hidden="true">

          {/* Linkes Panel — deine Lebenslinie */}
          <div className={'sq-panel left' + (s === SQ_LAST ? ' dim' : '')}>
           {/* Die Fläche: Panelmaße in 2×-Raster (zoom) */}
           <div className="sq-face">
            <p className="sq-shead">Deine Lebenslinie</p>
            <svg className="sq-timeline" viewBox="0 0 443 351" aria-hidden="true">
              {/* Geisterspur der Zukunft — sie liegt schon da; Jahres-Ticks
                  (alle zwei Jahre stärker) und die Pfeilspitze am Rand
                  machen die Linie zur Timeline */}
              <defs>
                <linearGradient id="sq-fade" gradientUnits="userSpaceOnUse" x1="30" x2="470" y1="0" y2="0">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset=".5" stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id="sq-fademask"><rect x="0" y="0" width="480" height="351" fill="url(#sq-fade)" /></mask>
              </defs>
              <g mask="url(#sq-fademask)">
                <path className="sq-track" d={`M30 ${LINE_Y} H470`} pathLength={1} />
                {TICKS.map((x, k) => (
                  <line key={'t' + k} className={'sq-tick' + (k % 2 === 0 ? ' major' : '')}
                    x1={x} y1={LINE_Y - (k % 2 === 0 ? 6 : 4)} x2={x} y2={LINE_Y + (k % 2 === 0 ? 6 : 4)} />
                ))}
                <path className="sq-tick major" d={`M462 ${LINE_Y - 5} L470 ${LINE_Y} L462 ${LINE_Y + 5}`} />
              </g>
              {/* Fortschritt: ein weicher Balken hinter jedem gezeichneten Segment */}
              {EVENTS.slice(1).map((e, i) => {
                const k = i + 1;
                return (
                  <path key={'g' + e.key} className={'sq-prog' + (s >= k + 1 ? ' on' : '')}
                    d={`M${NODE_X[k - 1]} ${LINE_Y} H${NODE_X[k]}`} pathLength={1} />
                );
              })}
              {/* Je Ereignis ein Segment, das sich zeichnet */}
              {EVENTS.slice(1).map((e, i) => {
                const k = i + 1;
                return (
                  <path key={e.key} className={'sq-wire' + (s >= k + 1 ? ' on' : '')}
                    d={`M${NODE_X[k - 1]} ${LINE_Y} H${NODE_X[k]}`} pathLength={1} />
                );
              })}
              {/* Kapitelende: die Linie läuft über den Schirmrand hinaus */}
              <path className={'sq-wire beyond' + (s === SQ_LAST ? ' on' : '')}
                d={`M${NODE_X[4]} ${LINE_Y} H470`} pathLength={1} />
              {/* EIN Lichtimpuls läuft die ganze gezeichnete Strecke ab — von
                  Heute bis zum aktiven Knoten, am Kapitelende über den Rand */}
              {s >= 2 && (
                <path className="sq-pulse on" pathLength={1}
                  d={`M${NODE_X[0]} ${LINE_Y} H${s === SQ_LAST ? 470 : NODE_X[Math.min(s - 1, 4)]}`} />
              )}
            </svg>
            {EVENTS.map((e, k) => (
              <span
                key={e.key}
                className={'sq-node' + (s >= k + 1 ? ' on' : '') + (s === k + 1 ? ' now' : '')}
                style={{
                  left: NODE_X[k] + 'px', top: LINE_Y + 'px',
                  '--fd': k === 0 ? '1.264s' : '.79s',
                } as CSSProperties}
              >
                <span className="sq-ntile"><svg viewBox="0 0 16 16"><use href={e.glyph} /></svg></span>
                <span className="sq-nlabel">{e.label}</span>
                {k === 0 && <span className="sq-nyear">{YEAR0}</span>}
              </span>
            ))}
            <div className="sq-cards">
              {CARDS.map((c, k) => (
                <article
                  key={c.tag}
                  className={'sq-card' + (s === k + 1 ? ' on' : '')}
                  style={{ '--fd': k === 0 ? '1.896s' : '1.264s' } as CSSProperties}
                >
                  <span className="sq-tag">{c.tag}</span>
                  <span className="sq-title">{c.title}</span>
                  <div className="sq-rows">
                    {c.rows.map((r, i) => (
                      <span key={r} className="sq-crow"
                        style={{ '--fd': (k === 0 ? 2.212 : 1.58) + i * 0.158 + 's' } as CSSProperties}>
                        <span className="sq-ntile sm"><svg viewBox="0 0 16 16"><use href="#g-check" /></svg></span>
                        {r}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
              <article
                className={'sq-card close' + (s === SQ_LAST ? ' on' : '')}
                style={{ '--fd': '.632s' } as CSSProperties}
              >
                <span className="sq-tag">{CLOSE.tag}</span>
                <span className="sq-title">{CLOSE.title}</span>
                <div className="sq-rows">
                  {CLOSE.rows.map(r => (
                    <span key={r} className="sq-crow" style={{ '--fd': '.948s' } as CSSProperties}>
                      <span className="sq-ntile sm"><svg viewBox="0 0 16 16"><use href="#g-check" /></svg></span>
                      {r}
                    </span>
                  ))}
                </div>
              </article>
            </div>
           </div>
          </div>

          {/* Rechtes Panel — der Berater-Schirm */}
          <div className={'sq-panel right' + (s === SQ_LAST ? ' dim' : '')}>
           {/* Gedimmt wird der Inhalt, nie das Panel: es bleibt deckend über dem Foto */}
           <div className="sq-body">
            <p className="sq-shead">Dein Berater</p>
            <div className="sq-adv">
              <span key={burst ? 'b' + view.n : 'live'} className={'sq-live' + (burst ? ' burst' : '')} />
              <span className="sq-alabel">Laufende Betreuung</span>
              <span className="sq-checked">
                {CHECKED.map((t, i) => (
                  <span key={t} className={ev === i ? 'on' : ''}
                    style={{ '--fd': i === 0 ? '.632s' : '3.792s' } as CSSProperties}>
                    Geprüft · {t}
                  </span>
                ))}
              </span>
            </div>
            <div className="sq-blocks">
              <p className="sq-sub" style={{ '--fd': '1.264s' } as CSSProperties}>Vier Hebel</p>
              {LEVERS.map((l, i) => {
                const w = FILL[ev][i];
                const up = s >= 2 && w > prev[i];
                return (
                  <div
                    key={l.key}
                    className={'sq-brow' + (up ? ' up' : '')}
                    style={{ '--fd': (1.264 + i * 0.158).toFixed(3) + 's', '--c': l.color } as CSSProperties}
                  >
                    <span className="sq-blabel">{l.label}</span>
                    <span className="sq-btrack">
                      <span
                        className="sq-fill"
                        style={{
                          '--w': w,
                          '--fd': ((s === 1 ? 1.58 : 2.528) + i * 0.158).toFixed(3) + 's',
                        } as CSSProperties}
                      />
                    </span>
                    <span className="sq-up">↑</span>
                  </div>
                );
              })}
            </div>
            <div className="sq-log">
              <p className="sq-sub" style={{ '--fd': '2.212s' } as CSSProperties}>Protokoll</p>
              <div className={'sq-empty' + (s === 1 ? ' on' : '')}>Alles aktuell</div>
              {LOG.map((l, k) => (
                <div
                  key={l}
                  className={'sq-lrow' + (s >= k + 2 ? ' on' : '')}
                  style={{ top: 20 + k * 26 + 'px' }}
                >
                  <span className="sq-ntile sm"><svg viewBox="0 0 16 16"><use href="#g-check" /></svg></span>
                  <span>Aktualisiert · {l}</span>
                </div>
              ))}
            </div>
           </div>
          </div>
        </div>

        {/* Tischkante: keine Tischtexte — das Bild spricht; am Ende das
            Kapitelende-Paar, das alle Kapitel teilen: Nochmal · Zurück zur Übersicht */}
        <main id="sq-captions">
          <section className={'sq-panelc' + (s === SQ_LAST ? ' on' : '')}>
            <div className="sq-pills" onClick={e => e.stopPropagation()}>
              <button type="button" className="sq-pill sq-rise d1" onClick={replay}>
                <span>Nochmal</span>
                <span className="sq-ico" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                    strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 8a5 5 0 1 1-1.6-3.7" /><path d="M13 2.6V5h-2.4" />
                  </svg>
                </span>
              </button>
              <Link href="/" className="sq-pill sq-rise d3">
                <span>Zurück zur Übersicht</span>
                <span className="sq-ico" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                    strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.8 8H3.4M7.1 4.3 3.4 8l3.7 3.7" />
                  </svg>
                </span>
              </Link>
            </div>
          </section>
        </main>

        <div className="sr-only" aria-live="polite">{sqEvidence(s)}</div>

        <div className={'sq-meta' + (s >= 1 && s <= 5 ? ' show' : '')} aria-hidden="true">
          {pad(Math.min(s, 5))}&thinsp;/&thinsp;05
        </div>

        {debug && (
          <svg id="sq-tv-debug" viewBox="0 0 1600 900" aria-hidden="true">
            <polygon points={QUAD_L} />
            <polygon points={QUAD_R} />
          </svg>
        )}
      </div>
    </div>
  );
}
