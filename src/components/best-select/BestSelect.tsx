'use client';

/* Orchestrator: Schrittzustand, Eingabe (Klick/Tastatur), Bühnen-Skalierung
   und Neustart. Jede Ebene (Symbole, Radar, Zähler, Textschiene) ist eine
   reine Funktion des View-Zustands {step, inst, dir}. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { LAST, LEAD, N_CATS, ROT, STEP_FINAL, STEP_FONDS, STEP_RADAR, WIN_ANIM } from '@/lib/best-select/constants';
import { bump, reduced, tx } from '@/lib/best-select/animate';
import Stage from './Stage';
import IconGlyphs from './IconGlyphs';
import IconsLayer from './IconsLayer';
import WinnersLineup from './WinnersLineup';
import Radar from './Radar';
import FunnelStage from './FunnelStage';
import CounterCard from './CounterCard';
import TextRail from './TextRail';
import HintPill from './HintPill';
import StepCounter from './StepCounter';
import DebugOverlay from './DebugOverlay';
import './best-select.css';

export interface View {
  step: number;
  inst: boolean;   /* Sofort-Render ohne Choreografie */
  dir: 1 | -1;
  n: number;       /* Render-Token: erzwingt Effekte auch bei gleichem Schritt */
}

/* Sperre folgt der laufenden Choreografie — ein zweiter Klick kann keinen
   Erzählmoment amputieren. Der Radar sperrt bis der letzte Gewinner steht:
   Vorlauf + voller Umlauf + Gewinner-Flip. */
function lockFor(n: number, dir: number): number {
  if (dir < 0) return 900;         /* rückwärts: Ergebnis-Zustände, kurz sperren */
  if (n === STEP_RADAR) return (LEAD + ROT + WIN_ANIM) * 1000;
                                   /* bis der letzte Gewinner (Nordwesten) steht —
                                      vorher wäre die Aussage des Schritts amputiert */
  if (n === STEP_FONDS) return 2600;     /* Fonds-Kaskade */
  if (n >= 1 && n < N_CATS) return 1900;
  if (n === STEP_FINAL) return 1600;
  const f = n - STEP_FINAL;        /* Trichterphase */
  if (f === 1) return 4900;              /* Prüfung: Aufstellung bis 1.65s, Fälle bis ~4.6s */
  if (f === 2) return 2800;              /* Trichter fährt hoch (1.4s), drei treten aus */
  if (f === 5) return 2600;              /* Tarif-Einsaugen */
  if (f === 6) return 2900;              /* Fall + Aufstieg ins Zentrum */
  return 700;
}

export default function BestSelect() {
  const [view, setView] = useState<View>({ step: 0, inst: true, dir: 1, n: 0 });
  const [debug, setDebug] = useState(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const busyRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  /* Die Sperre trägt eine Klasse auf die Bühne: die Hinweis-Pille nimmt sich
     zurück und quittiert keine Klicks, die ohnehin verschluckt würden */
  const lock = useCallback((ms: number) => {
    busyRef.current = true;
    stageRef.current?.classList.add('busy');
    setTimeout(() => {
      busyRef.current = false;
      stageRef.current?.classList.remove('busy');
    }, reduced() ? 120 : ms);
  }, []);

  const go = useCallback((n: number) => {
    if (busyRef.current) return;
    if (n > LAST) {
      lock(1300);
      bump();
      tx(stageRef.current, { opacity: 0 }, { duration: 0.6 });
      setTimeout(() => {
        setView(v => ({ step: 0, inst: true, dir: 1, n: v.n + 1 }));
        tx(stageRef.current, { opacity: 1 }, { duration: 1.0 });
      }, 640);
      return;
    }
    const dir: 1 | -1 = n < viewRef.current.step ? -1 : 1;
    const step = Math.max(0, n);
    lock(lockFor(step, dir));
    bump();
    setView(v => ({ step, inst: false, dir, n: v.n + 1 }));
  }, [lock]);

  /* Zwischenfrage im Termin: Esc beendet die laufende Choreografie sofort in
     ihren Endzustand und löst die Sperre — der Berater kann sprechen, die
     Bühne wartet. Deterministisch: derselbe Endzustand wie nach dem Ablauf. */
  const settle = useCallback(() => {
    if (!busyRef.current) return;
    busyRef.current = false;
    stageRef.current?.classList.remove('busy');
    bump();                                       /* later()/countUp verfallen */
    setView(v => ({ step: v.step, inst: true, dir: 1, n: v.n + 1 }));
  }, []);

  /* Tastatur: ←/Backspace/PageUp zurück · →/Leertaste/Enter/PageDown weiter ·
     Esc settelt die laufende Choreografie */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') {
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

  /* Finale: Bühnen-Klicks sind inert (ein Streifschuss darf den Schlussmoment
     nicht wegwischen) — der Neustart läuft nur über die Pille oder Tastatur */
  useEffect(() => {
    stageRef.current?.classList.toggle('final', view.step === LAST);
    /* Schritte 12 und 16: Inhalte liegen auf dem hellen Kartenzentrum —
       die untere Lese-Scrim (#scrim-low) blendet sich nur hier ein */
    stageRef.current?.classList.toggle('lowlit',
      view.step === STEP_FINAL + 2 || view.step === LAST);
  }, [view]);

  /* ?step=N springt direkt zu einem Schritt (Probe / Screenshot);
     &play spielt die Choreografie dieses Schritts ab statt sofort zu landen —
     mit derselben Sperre wie im Termin, damit die Probe die echte Mechanik hat;
     ?debug=1 blendet das Polygon-Overlay ein */
  useEffect(() => {
    const search = window.location.search;
    if (/[?&]debug/.test(search)) setDebug(true);
    const jump = (search.match(/[?&]step=(\d+)/) || [])[1];
    if (jump) {
      const step = Math.min(LAST, +jump);
      const play = /[?&]play/.test(search);
      bump();
      if (play) lock(lockFor(step, 1));
      setView(v => ({ step, inst: !play, dir: 1, n: v.n + 1 }));
    }
  }, [lock]);

  /* Der aktuelle Schritt steht immer in der URL (replaceState, keine History-
     Einträge): ein F5 mitten im Termin landet wieder auf demselben Schritt,
     und jeder Moment ist als Link teilbar. &play wird dabei verbraucht. */
  useEffect(() => {
    if (view.n === 0) return;                    /* Mount: erst der Deep-Link */
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

  /* Browser-Zoom darf die Bühne wirklich vergrößern (Barrierefreiheit):
     Zoom hebt devicePixelRatio an — die Skalierung wächst mit und der
     Viewport wird scrollbar statt die Vergrößerung wegzurechnen. */
  useEffect(() => {
    const viewport = viewportRef.current, stage = stageRef.current;
    if (!viewport || !stage) return;
    const baseDpr = window.devicePixelRatio || 1;
    function fit() {
      if (!viewport || !stage) return;
      const zoom = (window.devicePixelRatio || 1) / baseDpr;
      const s = Math.min(window.innerWidth / 1600, window.innerHeight / 900) * Math.max(1, zoom);
      const over = 1600 * s > window.innerWidth + 1 || 900 * s > window.innerHeight + 1;
      document.documentElement.style.overflow = over ? 'auto' : 'hidden';
      document.body.style.overflow = over ? 'auto' : 'hidden';
      if (over) {
        viewport.style.position = 'absolute';
        viewport.style.width = Math.max(window.innerWidth, Math.ceil(1600 * s)) + 'px';
        viewport.style.height = Math.max(window.innerHeight, Math.ceil(900 * s)) + 'px';
      } else {
        viewport.style.position = 'fixed';
        viewport.style.width = '';
        viewport.style.height = '';
      }
      stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    }
    window.addEventListener('resize', fit);
    fit();
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <div
      id="viewport"
      ref={viewportRef}
      onClick={() => {
        if (viewRef.current.step === LAST) return;   /* Finale: nur die Pille startet neu */
        go(viewRef.current.step + 1);
      }}
    >
      <Stage ref={stageRef}>
        <IconGlyphs />
        <IconsLayer view={view} />
        <WinnersLineup view={view} />
        <Radar view={view} />
        <FunnelStage view={view} />
        <CounterCard view={view} />
        <TextRail view={view} />
        <HintPill
          restart={view.step === LAST}
          onAdvance={e => { e.stopPropagation(); go(viewRef.current.step + 1); }}
        />
        <StepCounter step={view.step} />
        {debug && <DebugOverlay />}
      </Stage>
    </div>
  );
}
