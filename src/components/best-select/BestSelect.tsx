'use client';

/* Orchestrator: Schrittzustand, Eingabe (Klick/Tastatur), Bühnen-Skalierung
   und Neustart. Jede Ebene (Symbole, Radar, Zähler, Textschiene) ist eine
   reine Funktion des View-Zustands {step, inst, dir}. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CATS, FONDS_IDX, LAST, LEAD, N_CATS, ROT, STEP_FINAL, STEP_RADAR, WIN_ANIM } from '@/lib/best-select/constants';
import { bump, reduced, tx } from '@/lib/best-select/animate';
import Stage from './Stage';
import MapFallback from './MapFallback';
import IconGlyphs from './IconGlyphs';
import IconsLayer from './IconsLayer';
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

/* Grundtakt der Präsentation: jede Sperre der Trichterphase ist ein
   Vielfaches von 632 ms. */
export const BEAT = 632;

/* Sperre folgt der laufenden Choreografie — ein zweiter Klick kann keinen
   Erzählmoment amputieren. Jede Sperre deckt die VOLLE Choreografie ihres
   Schritts inkl. CSS-Nachläufer (Kriterienleiter, Flash); Esc bleibt der
   bewusste Ausstieg für den Berater. Der Radar sperrt bis der letzte Ping
   verglüht und der letzte Gewinner eingerastet ist. Der Fonds-Regen liegt
   nicht mehr auf einem festen Schritt — seine Position kommt aus der
   gemischten Reihenfolge (fondsStep). */
function lockFor(n: number, dir: number, fondsStep: number): number {
  if (dir < 0) return BEAT;        /* rückwärts: Ergebnis-Zustände, kurz sperren */
  if (n === STEP_RADAR) return (LEAD + ROT + WIN_ANIM) * 1000;
                                   /* 4424 ms: letzte Kreuzung 3.16s + 1.264s Schweif
                                      (pingOut wie winLock) — alle übrigen Nachläufer
                                      (Lichtscheibe 3.79s, Welle 1.90s, Strahl 3.48s)
                                      enden früher */
  if (n === fondsStep) return BEAT * 4;        /* 2528: Regen-Fenster 3 Takte + 632ms Auftritt */
  if (n >= 1 && n <= N_CATS) return BEAT * 3;  /* 1896: längster Stagger (~1.17s) + Auftritt */
  if (n === STEP_FINAL) return BEAT * 3;       /* 1896: Schienen-Tausch + done-Übergänge */
  const f = n - STEP_FINAL;        /* Trichterphase */
  if (f === 1) return BEAT * 9;    /* 5688: Flug bis ~3s, Fälle bis ~4.42s, drei treten bis ~5.42s aus */
  if (f === 2) return BEAT * 8;    /* 5056: Wurf bis ~1.9s, Leiter-Neuzündung bis ~4.42s, Tarife bis ~4.5s */
  return BEAT * 6;                 /* 3792: Aufstieg bis ~2.53s, Schriftzug endet exakt mit der
                                      Sperre; erst danach wird Weiter (= Neustart) angenommen */
}

/* Die Auftrittsreihenfolge der Kategorien wird je Durchlauf gemischt —
   bewusste Ausnahme vom Determinismus-Prinzip (Nutzer-Entscheid): jede
   Vorführung zeigt den Markt in neuer Folge. Innerhalb eines Durchlaufs
   steht die Folge fest (Zurück-Navigation bleibt konsistent). */
function shuffleOrder(): number[] {
  const a = CATS.map((_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function BestSelect() {
  const [view, setView] = useState<View>({ step: 0, inst: true, dir: 1, n: 0 });
  /* Identität bis zum Mount (Server und Client rendern gleich — bei Schritt 0
     ist ohnehin nichts sichtbar), danach je Durchlauf frisch gemischt */
  const [order, setOrder] = useState<number[]>(() => CATS.map((_, i) => i));
  const [debug, setDebug] = useState(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const orderRef = useRef(order);
  orderRef.current = order;
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
      lock(BEAT * 3);              /* 1896: Ausblenden 1 Takt + Einblenden 2 Takte, exakt */
      bump();
      tx(stageRef.current, { opacity: 0 }, { duration: 0.632 });
      setTimeout(() => {
        setOrder(shuffleOrder());  /* Neustart = neuer Durchlauf = neue Folge */
        setView(v => ({ step: 0, inst: true, dir: 1, n: v.n + 1 }));
        tx(stageRef.current, { opacity: 1 }, { duration: 1.264 });
      }, BEAT);
      return;
    }
    const dir: 1 | -1 = n < viewRef.current.step ? -1 : 1;
    const step = Math.max(0, n);
    lock(lockFor(step, dir, orderRef.current.indexOf(FONDS_IDX) + 1));
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
    /* Prüfungen (Schritte 11–12): die Ergebnis-Kreise liegen auf dem hellen
       Kartenzentrum — die untere Lese-Scrim (#scrim-low) blendet sich ein;
       das Finale trägt die breitere #scrim-final */
    stageRef.current?.classList.toggle('lowlit',
      view.step > STEP_FINAL && view.step < LAST);
  }, [view]);

  /* Mount: erst die Reihenfolge mischen, dann der Deep-Link — ?step=N springt
     direkt zu einem Schritt (Probe / Screenshot); &play spielt die Choreografie
     dieses Schritts ab statt sofort zu landen — mit derselben Sperre wie im
     Termin (die Fonds-Position kommt aus der frisch gemischten Folge);
     ?debug=1 blendet das Polygon-Overlay ein */
  useEffect(() => {
    const ord = shuffleOrder();
    setOrder(ord);
    const search = window.location.search;
    if (/[?&]debug/.test(search)) setDebug(true);
    const jump = (search.match(/[?&]step=(\d+)/) || [])[1];
    if (jump) {
      const step = Math.min(LAST, +jump);
      const play = /[?&]play/.test(search);
      bump();
      if (play) lock(lockFor(step, 1, ord.indexOf(FONDS_IDX) + 1));
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

  /* Nothalt: lädt die Nachtkarte nicht (Asset fehlt auf dem Präsentations-
     rechner, leerer Offline-Cache), trägt die Bühne .nomap — der gemessene
     Umriss (MapFallback) wird zum Boden, kein Symbol schwebt im Leeren */
  useEffect(() => {
    const probe = new Image();
    probe.onerror = () => stageRef.current?.classList.add('nomap');
    probe.src = '/germany-night.png';
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
     Viewport wird scrollbar statt die Vergrößerung wegzurechnen.
     Aber: auch ein Monitorwechsel ändert devicePixelRatio (Laptop 2× →
     Beamer 1× — der Ernstfall im Termin). Dann wird die Basis neu geeicht
     statt skaliert, sonst halbiert/verdoppelt sich die Bühne beim Rüberziehen.
     Unterscheidung über die Bildschirm-Identität: Zoom lässt in Chromium
     die CSS-Maße (screen.*) stehen, in Firefox die physischen Maße
     (screen.* · dpr); die availLeft/Top-Origin trennt gleichgroße Monitore.
     Ändern sich CSS- UND Physik-Signatur, ist es ein anderer Bildschirm. */
  useEffect(() => {
    const viewport = viewportRef.current, stage = stageRef.current;
    if (!viewport || !stage) return;
    const screenKeys = () => {
      const d = window.devicePixelRatio || 1;
      const scr = window.screen as Screen & { availLeft?: number; availTop?: number };
      const l = scr.availLeft ?? 0, t = scr.availTop ?? 0;
      const r = (v: number) => Math.round(v / 8);   /* Rundungsjitter schlucken */
      return {
        css: `${scr.width},${scr.height},${l},${t}`,
        phys: `${r(scr.width * d)},${r(scr.height * d)},${r(l * d)},${r(t * d)}`,
      };
    };
    let baseDpr = window.devicePixelRatio || 1;
    let last = { dpr: baseDpr, ...screenKeys() };
    function fit() {
      if (!viewport || !stage) return;
      const dpr = window.devicePixelRatio || 1;
      const k = screenKeys();
      if (dpr !== last.dpr && k.css !== last.css && k.phys !== last.phys) {
        baseDpr = dpr;             /* anderer Bildschirm: neu eichen, Zoom = 1 */
      }
      last = { dpr, ...k };
      const zoom = dpr / baseDpr;
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
    /* resize feuert beim Monitorwechsel nicht in jedem Browser — eine
       matchMedia-Kette auf die jeweils aktuelle Auflösung schließt die Lücke
       und wird nach jedem dpr-Wechsel neu gespannt */
    let mq: MediaQueryList | null = null;
    const onDprChange = () => { fit(); armDprWatch(); };
    const armDprWatch = () => {
      mq?.removeEventListener('change', onDprChange);
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      mq.addEventListener('change', onDprChange);
    };
    window.addEventListener('resize', fit);
    armDprWatch();
    fit();
    return () => {
      window.removeEventListener('resize', fit);
      mq?.removeEventListener('change', onDprChange);
    };
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
        <MapFallback />
        <IconGlyphs />
        <IconsLayer view={view} order={order} />
        <Radar view={view} />
        <FunnelStage view={view} />
        <CounterCard view={view} order={order} />
        <TextRail view={view} order={order} />
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
