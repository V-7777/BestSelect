'use client';

/* Orchestrator: Schrittzustand, Eingabe (Klick/Tastatur), Bühnen-Skalierung
   und Neustart. Jede Ebene (Symbole, Radar, Zähler, Textschiene) ist eine
   reine Funktion des View-Zustands {step, inst, dir}. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { LAST, LEAD, ROT, WIN_ANIM } from '@/lib/best-select/constants';
import { bump, reduced, tx } from '@/lib/best-select/animate';
import Stage from './Stage';
import IconGlyphs from './IconGlyphs';
import IconsLayer from './IconsLayer';
import Radar from './Radar';
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
   Erzählmoment amputieren; der Radar darf bewusst früh Richtung Finale
   verlassen werden, sobald die Auslese lesbar ist */
function lockFor(n: number, dir: number): number {
  if (dir < 0) return 900;    /* rückwärts: Ergebnis-Zustände, kurz sperren */
  if (n === 4) return (LEAD + ROT + WIN_ANIM) * 1000;
                              /* bis der letzte Gewinner (Nordwesten) steht —
                                 vorher wäre die Aussage des Schritts amputiert */
  if (n === 3) return 2600;   /* 500er-Kaskade + Zähler */
  if (n === 1 || n === 2) return 1900;
  if (n === 5) return 1600;
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

  const lock = useCallback((ms: number) => {
    busyRef.current = true;
    setTimeout(() => { busyRef.current = false; }, reduced() ? 120 : ms);
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

  /* Tastatur: ←/Backspace/PageUp zurück · →/Leertaste/Enter/PageDown weiter */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') {
        e.preventDefault(); go(viewRef.current.step + 1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault(); go(viewRef.current.step - 1);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go]);

  /* ?step=N springt direkt zu einem Schritt (Probe / Screenshot);
     &play spielt die Choreografie dieses Schritts ab statt sofort zu landen;
     ?debug=1 blendet das Polygon-Overlay ein */
  useEffect(() => {
    const search = window.location.search;
    if (/[?&]debug/.test(search)) setDebug(true);
    const jump = (search.match(/[?&]step=(\d)/) || [])[1];
    if (jump) {
      const step = Math.min(LAST, +jump);
      const play = /[?&]play/.test(search);
      bump();
      setView(v => ({ step, inst: !play, dir: 1, n: v.n + 1 }));
    }
  }, []);

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
    <div id="viewport" ref={viewportRef} onClick={() => go(viewRef.current.step + 1)}>
      <Stage ref={stageRef}>
        <IconGlyphs />
        <IconsLayer view={view} />
        <Radar view={view} />
        <CounterCard view={view} />
        <TextRail view={view} />
        <HintPill restart={view.step === LAST} />
        <StepCounter step={view.step} />
        {debug && <DebugOverlay />}
      </Stage>
    </div>
  );
}
