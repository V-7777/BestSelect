/* Daten & Choreografie-Konstanten — 1:1 aus best-select-v3.html portiert;
   Trichterphase (Schritte 11–16) aus Assets.html weiterentwickelt. */

import { CRIT_C, CRIT_P, PRODUCTS, WINNERS, WIN_COL } from './funnel';

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
   700→10 · 1171→14 · 1400→18 · 10000→282). Reihenfolge = Erzählreihenfolge:
   aufsteigend nach Marktgröße; der Fondsmarkt bleibt das Produkt-Maximum.
   Bei Rucklern auf schwacher Hardware die div-Werte erhöhen. */
export const CATS: Cat[] = [
  { key: 'bsp',   label: 'Bausparkassen',            total: 38,      div: 10,     seed: 404, min: 50, pad: 15, stag: 0.18,  glyph: '#g-home'    },
  { key: 'vv',    label: 'Vermögensverwalter',       total: 46,      div: 10,     seed: 505, min: 50, pad: 15, stag: 0.15,  glyph: '#g-case'    },
  { key: 'spk',   label: 'Sparkassen',               total: 341,     div: 20,     seed: 101, min: 50, pad: 15, stag: 0.06,  glyph: '#g-bank'    },
  { key: 'vers',  label: 'Versicherungsunternehmen', total: 522,     div: 20,     seed: 202, min: 44, pad: 15, stag: 0.045, glyph: '#g-shield'  },
  { key: 'ibt',   label: 'Immobilien-Bauträger',     total: 700,     div: 70,     seed: 606, min: 44, pad: 15, stag: 0.09,  glyph: '#g-tower'   },
  { key: 'stb',   label: 'Steuerberater',            total: 1171,    div: 85,     seed: 707, min: 44, pad: 15, stag: 0.07,  glyph: '#g-percent' },
  { key: 'bank',  label: 'Banken & Kreditinstitute', total: 1400,    div: 78,     seed: 808, min: 44, pad: 15, stag: 0.055, glyph: '#g-euro'    },
  { key: 'fonds', label: 'Investmentfonds & ETFs',   total: 10000,   div: 35.5,   seed: 303, min: 22, pad: 10, stag: 0,     glyph: '#g-chart'   },
];

export const N_CATS = CATS.length;
export const STEP_FONDS = CATS.findIndex(c => c.key === 'fonds') + 1;
export const STEP_RADAR = N_CATS + 1;   /* Schritt 9: der Radar entscheidet */
export const STEP_FINAL = N_CATS + 2;   /* Schritt 10: Best Select auf der Karte */

export const HUB = { x: 805, y: 430 };   /* Radar-Nabe ≈ geographische Mitte */
export const BEAM_R = 470;               /* deckt den entferntesten Umrisspunkt (~450px) */
/* Radar auf dem 632-ms-Grundtakt: Vorlauf 1 Takt, Umlauf 4 Takte,
   Gewinner-Flip 2 Takte — die Sperre (LEAD+ROT+WIN_ANIM) ist exakt 7 Takte */
export const LEAD = 0.632;               /* Radar: Vorlauf in Sekunden */
export const ROT = 2.528;                /* Sekunden je Umlauf */
export const WIN_ANIM = 1.264;           /* = winFlip-Dauer im CSS */
export const BEAM_FADE = 0.632;
export const BEAM_OUT = LEAD + ROT + 0.316 - BEAM_FADE;

export interface StepText {
  k: string;
  h: string;
  s?: string;
  n?: string;
}

/* Nur der Titel trägt eine Unterzeile — der Berater spricht, die Bühne zeigt.
   Die Verdichtungs-Fußnote steht ab dem ersten Evidenzmoment: die Zahl 38
   neben vier Symbolen darf keine offene Frage lassen. */
const SYM = 'Darstellung symbolisch verdichtet — jedes Symbol steht für viele Anbieter.';
const ANON = 'Darstellung anonymisiert — die Namen nennen wir im persönlichen Gespräch.';
export const T: StepText[] = [
  { k: 'Auswahlprozess',                   h: 'Weitblick Best Select', s: 'Der ganze Markt. Eine Empfehlung.' },
  { k: 'Schritt 01 · Bausparkassen',       h: 'Bausparkassen im Blick', n: SYM },
  { k: 'Schritt 02 · Vermögensverwalter',  h: 'Vermögensverwalter im Blick', n: SYM },
  { k: 'Schritt 03 · Sparkassen',          h: 'Sparkassen im Blick', n: SYM },
  { k: 'Schritt 04 · Versicherer',         h: 'Versicherer im Blick', n: SYM },
  { k: 'Schritt 05 · Bauträger',           h: 'Immobilien-Bauträger im Blick', n: SYM },
  { k: 'Schritt 06 · Steuerberater',       h: 'Steuerberater im Blick', n: SYM },
  { k: 'Schritt 07 · Banken',              h: 'Kreditinstitute im Blick', n: SYM },
  { k: 'Schritt 08 · Fonds & ETFs',        h: 'Der ganze Fondsmarkt',
    n: 'Darstellung symbolisch verdichtet — jedes Symbol steht für viele Anbieter bzw. Produkte.' },
  { k: 'Schritt 09 · Filter',              h: 'Der Weitblick-Radar' },
  { k: 'Schritt 10 · Best Select',         h: 'Das Beste bleibt',
    n: 'Auswahl anonymisiert — die Namen nennen wir im persönlichen Gespräch.' },
  /* ---- Trichterphase: zwei Prüfungen — erst die Unternehmen, dann ihre Tarife.
     Die Kicker tragen die Zwei-Phasen-Erzählung (Prüfung 1/2), damit der
     Wechsel auf die Tarif-Ebene (Schritt 13) unübersehbar ist. ---- */
  { k: 'Prüfung 1 von 2 · Unternehmen',    h: 'Die besten Unternehmen werden geprüft' },
  { k: 'Prüfung 1 von 2 · Unternehmen',    h: 'Drei bleiben übrig', n: ANON },
  /* Unterzeile dreizeilig gebrochen (\n, .sub ist pre-line): auf Kopfzeilen-
     Höhe steht ab x 370 die Karte „Unternehmen A" — die Zeilen müssen davor
     enden */
  { k: 'Prüfung 2 von 2 · Tarife',         h: 'Blick in die Unternehmen',
    s: 'Die besten Unternehmen stehen\nfest — jetzt prüfen wir ihre\nTarife nach demselben Maßstab.' },
  { k: 'Prüfung 2 von 2 · Tarife',         h: 'Neun Tarife' },
  { k: 'Prüfung 2 von 2 · Tarife',         h: 'Derselbe Maßstab' },
  { k: 'Prüfung 2 von 2 · Tarife',         h: 'Ein Tarif bleibt' },
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
  const f = step - STEP_FINAL;
  if (f === 1) return 'Prüfung 1 von 2: Die acht besten Unternehmen durchlaufen den Trichter — fünf Kriterien: ' + CRIT_C.join(', ') + '.';
  if (f === 2) return 'Übrig bleiben: ' + WINNERS.map(w => w.n).join(', ') + '.';
  if (f === 3) return 'Prüfung 2 von 2: Der Blick geht in die Unternehmen — jetzt werden die Tarife der drei Besten geprüft.';
  if (f === 4) {
    const tarife = (col: number) => PRODUCTS.filter(p => p.col === col)
      .map(p => p.n + ' ' + p.v + ' von 3').join(', ');
    return WINNERS.map((w, i) => w.n + ': ' + tarife(i)).join('. ') + '.';
  }
  if (f === 5) return 'Die fünf Tarif-Kriterien: ' + CRIT_P.join(', ') + '.';
  if (f === 6) return 'Die Empfehlung: ' + WINNERS[WIN_COL].n + ', Tarif Premium — 3 von 3. ' +
    'Alle fünf Kriterien erfüllt: ' + CRIT_P.join(', ') + '.';
  return '';
}
