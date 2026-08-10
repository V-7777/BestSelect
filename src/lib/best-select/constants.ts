/* Daten & Choreografie-Konstanten — 1:1 aus best-select-v3.html portiert. */

export type CatKey = 'bsp' | 'vv' | 'spk' | 'vers' | 'ibt' | 'stb' | 'bank' | 'fonds';

export interface Cat {
  key: CatKey;
  label: string;
  total: number;
  div: number;   /* 1 Symbol ≈ div reale Anbieter/Produkte */
  seed: number;
  min: number;   /* Mindestabstand zwischen Symbolen */
  pad: number;   /* halber Symbolradius: so weit muss ringsum noch Deutschland liegen */
  stag: number;  /* Auftritts-Stagger in s je Symbol · 0 = zufällig (Fonds-Regen) */
  glyph: string;
}

/* 1 Symbol ≈ div reale Anbieter/Produkte (38→4 · 46→5 · 341→17 · 522→26 ·
   700→10 · 1171→14 · 1400→18 · 10000→282). Die fünf neuen Kategorien sind
   aus dem Fonds-Kontingent herausgeschnitten (früher 333 Punkte) — die
   Gesamtzahl der Symbole bleibt exakt 376. Reihenfolge = Erzählreihenfolge:
   aufsteigend nach Marktgröße, der Fondsmarkt bleibt Maximum und Finale.
   Bei Rucklern auf schwacher Hardware die div-Werte erhöhen. */
export const CATS: Cat[] = [
  { key: 'bsp',   label: 'Bausparkassen',            total: 38,    div: 10,   seed: 404, min: 50, pad: 15, stag: 0.18,  glyph: '#g-home'    },
  { key: 'vv',    label: 'Vermögensverwalter',       total: 46,    div: 10,   seed: 505, min: 50, pad: 15, stag: 0.15,  glyph: '#g-case'    },
  { key: 'spk',   label: 'Sparkassen',               total: 341,   div: 20,   seed: 101, min: 50, pad: 15, stag: 0.06,  glyph: '#g-bank'    },
  { key: 'vers',  label: 'Versicherungsunternehmen', total: 522,   div: 20,   seed: 202, min: 44, pad: 15, stag: 0.045, glyph: '#g-shield'  },
  { key: 'ibt',   label: 'Immobilien-Bauträger',     total: 700,   div: 70,   seed: 606, min: 44, pad: 15, stag: 0.09,  glyph: '#g-tower'   },
  { key: 'stb',   label: 'Steuerberater',            total: 1171,  div: 85,   seed: 707, min: 44, pad: 15, stag: 0.07,  glyph: '#g-percent' },
  { key: 'bank',  label: 'Banken & Kreditinstitute', total: 1400,  div: 78,   seed: 808, min: 44, pad: 15, stag: 0.055, glyph: '#g-euro'    },
  { key: 'fonds', label: 'Investmentfonds & ETFs',   total: 10000, div: 35.5, seed: 303, min: 22, pad: 10, stag: 0,     glyph: '#g-chart'   },
];

export const N_CATS = CATS.length;
export const STEP_RADAR = N_CATS + 1;   /* Schritt 09: der Radar entscheidet */
export const STEP_FINAL = N_CATS + 2;   /* Schritt 10: Best Select */

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
  { k: 'Auswahlprozess',                   h: 'Best Select', s: 'Der ganze Markt. Eine Empfehlung.' },
  { k: 'Schritt 01 · Bausparkassen',       h: 'Jede Bausparkasse im Blick' },
  { k: 'Schritt 02 · Vermögensverwalter',  h: 'Jeder Vermögensverwalter im Blick' },
  { k: 'Schritt 03 · Sparkassen',          h: 'Jede Sparkasse im Blick' },
  { k: 'Schritt 04 · Versicherer',         h: 'Jeder Versicherer im Blick' },
  { k: 'Schritt 05 · Bauträger',           h: 'Jeder Immobilien-Bauträger im Blick' },
  { k: 'Schritt 06 · Steuerberater',       h: 'Jeder Steuerberater im Blick' },
  { k: 'Schritt 07 · Banken',              h: 'Jedes Kreditinstitut im Blick' },
  { k: 'Schritt 08 · Fonds & ETFs',        h: 'Der ganze Fondsmarkt',
    n: 'Darstellung symbolisch verdichtet — jedes Symbol steht für viele Anbieter bzw. Produkte.' },
  { k: 'Schritt 09 · Filter',              h: 'Der Weitblick-Radar' },
  { k: 'Schritt 10 · Best Select',         h: 'Das Beste bleibt',
    n: 'Auswahl anonymisiert — die Namen nennen wir im persönlichen Gespräch.' },
];

export const LAST = T.length - 1;

/* Evidenz je Schritt für Screenreader — die visuellen Ebenen sind aria-hidden */
export function evidenceFor(step: number): string {
  if (step === 1) return 'Am Markt: 38 Bausparkassen.';
  if (step === 2) return 'Dazu kommen 46 Vermögensverwalter.';
  if (step === 3) return 'Dazu kommen 341 Sparkassen.';
  if (step === 4) return 'Dazu kommen 522 Versicherungsunternehmen.';
  if (step === 5) return 'Dazu kommen 700 Immobilien-Bauträger.';
  if (step === 6) return 'Dazu kommen 1.171 Steuerberater.';
  if (step === 7) return 'Dazu kommen 1.400 Banken und Kreditinstitute.';
  if (step === 8) return 'Und über 10.000 Investmentfonds und ETFs.';
  if (step === STEP_RADAR) return 'Der Weitblick-Radar prüft den gesamten Markt nach einem Maßstab — nur die Besten bleiben.';
  if (step === STEP_FINAL) return 'Best Select: acht Empfehlungen aus dem ganzen Markt, geprüft nach einem Maßstab.';
  return '';
}
