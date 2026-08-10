/* Daten & Choreografie-Konstanten — 1:1 aus best-select-v3.html portiert. */

export type CatKey = 'spk' | 'vers' | 'fonds';

export interface Cat {
  key: CatKey;
  label: string;
  total: number;
  div: number;   /* 1 Symbol ≈ div reale Anbieter/Produkte */
  seed: number;
  min: number;   /* Mindestabstand zwischen Symbolen */
  pad: number;   /* halber Symbolradius: so weit muss ringsum noch Deutschland liegen */
  glyph: string;
}

/* 1 Symbol ≈ div reale Anbieter/Produkte (341→17 · 522→26 · 10000→333).
   Fonds laufen bewusst dünner (größere Symbole brauchen Platz).
   Bei Rucklern auf schwacher Hardware die div-Werte erhöhen. */
export const CATS: Cat[] = [
  { key: 'spk',   label: 'Sparkassen',               total: 341,   div: 20, seed: 101, min: 50, pad: 15, glyph: '#g-bank'   },
  { key: 'vers',  label: 'Versicherungsunternehmen', total: 522,   div: 20, seed: 202, min: 44, pad: 15, glyph: '#g-shield' },
  { key: 'fonds', label: 'Investmentfonds & ETFs',   total: 10000, div: 30, seed: 303, min: 22, pad: 10, glyph: '#g-chart'  },
];

export const HUB = { x: 805, y: 430 };   /* Radar-Nabe ≈ geographische Mitte */
export const BEAM_R = 470;               /* deckt den entferntesten Umrisspunkt (~450px) */
export const LEAD = 0.8;                 /* Radar: Vorlauf in Sekunden */
export const ROT = 2.8;                  /* Sekunden je Umlauf */
export const WIN_ANIM = 1.45;            /* = winFlip-Dauer im CSS */
export const BEAM_FADE = 0.7;
export const BEAM_OUT = LEAD + ROT + 0.25 - BEAM_FADE;

export interface StepText {
  k: string;
  h: string;
  s?: string;
  n?: string;
}

/* Nur der Titel trägt eine Unterzeile — der Berater spricht, die Bühne zeigt */
export const T: StepText[] = [
  { k: 'Auswahlprozess',            h: 'Best Select', s: 'Der ganze Markt. Eine Empfehlung.' },
  { k: 'Schritt 01 · Sparkassen',   h: 'Jede Sparkasse im Blick' },
  { k: 'Schritt 02 · Versicherer',  h: 'Jeder Versicherer im Blick' },
  { k: 'Schritt 03 · Fonds & ETFs', h: 'Der ganze Fondsmarkt',
    n: 'Darstellung symbolisch verdichtet — jedes Symbol steht für viele Anbieter bzw. Produkte.' },
  { k: 'Schritt 04 · Filter',       h: 'Der Weitblick-Radar' },
  { k: 'Schritt 05 · Best Select',  h: 'Das Beste bleibt',
    n: 'Auswahl anonymisiert — die Namen nennen wir im persönlichen Gespräch.' },
];

export const LAST = T.length - 1;

/* Evidenz je Schritt für Screenreader — die visuellen Ebenen sind aria-hidden */
export function evidenceFor(step: number): string {
  if (step === 1) return 'Am Markt: 341 Sparkassen.';
  if (step === 2) return 'Dazu kommen 522 Versicherungsunternehmen.';
  if (step === 3) return 'Und über 10.000 Investmentfonds und ETFs.';
  if (step === 4) return 'Der Weitblick-Radar prüft den gesamten Markt nach einem Maßstab — nur die Besten bleiben.';
  if (step === 5) return 'Best Select: acht Empfehlungen aus dem ganzen Markt, geprüft nach einem Maßstab.';
  return '';
}
