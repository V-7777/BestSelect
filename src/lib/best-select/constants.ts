/* Daten & Choreografie-Konstanten — 1:1 aus best-select-v3.html portiert;
   Trichterphase (Schritte 11–13) radikal vereinfacht: Kreise statt Karten. */

import { CRIT_C, CRIT_P } from './funnel';

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
/* Die Auftrittsreihenfolge der Kategorien wird je Durchlauf gemischt
   (BestSelect hält sie als Zustand) — fest bleibt nur der Index des
   Fonds-Regens, dessen Schritt eine längere Sperre braucht. */
export const FONDS_IDX = CATS.findIndex(c => c.key === 'fonds');
export const STEP_RADAR = N_CATS + 1;   /* Schritt 9: der Radar entscheidet */
export const STEP_FINAL = N_CATS + 2;   /* Schritt 10: Best Select auf der Karte */

export const HUB = { x: 805, y: 430 };   /* Radar-Nabe ≈ geographische Mitte */
export const BEAM_R = 470;               /* deckt den entferntesten Umrisspunkt (~450px) */
/* Radar auf dem 632-ms-Grundtakt: Vorlauf 1 Takt, Umlauf 4 Takte,
   Nachglüh-/Einrast-Schweif 2 Takte — die Sperre (LEAD+ROT+WIN_ANIM)
   ist exakt 7 Takte */
export const LEAD = 0.632;               /* Radar: Vorlauf in Sekunden */
export const ROT = 2.528;                /* Sekunden je Umlauf */
export const WIN_ANIM = 1.264;           /* gemeinsamer 1.264s-Schweif von winLock
                                            UND pingOut im CSS — ändert sich einer,
                                            muss die Sperre neu hergeleitet werden */
export const PULSE = 1.264;              /* Ping-Welle: Ausbreitung ab LEAD, 2 Takte */
export const BEAM_FADE = 0.632;
export const BEAM_OUT = LEAD + ROT + 0.316 - BEAM_FADE;

export interface StepText {
  k: string;
  h: string;
  s?: string;
  n?: string;
}

/* Nur der Titel trägt eine Unterzeile — der Berater spricht, die Bühne zeigt.
   Während die Kategorien auftreten (Schritte 1–8), steht die Schiene STILL:
   ein Text für den ganzen Aufmarsch, die Bühne trägt den Wechsel allein.
   Ein einziges Objekt für alle acht Schritte — die Referenzgleichheit ist
   das Signal an TextRail, keinen Tausch zu choreografieren. */
const ANON = 'Darstellung anonymisiert — die Namen nennen wir im persönlichen Gespräch.';
const MARKET: StepText = {
  k: 'Der deutsche Markt',
  h: 'Der ganze Markt im Blick',
  n: 'Darstellung symbolisch verdichtet — jedes Symbol steht für viele Anbieter bzw. Produkte.',
};
export const T: StepText[] = [
  { k: 'Auswahlprozess',                   h: 'Weitblick Best Select', s: 'Der ganze Markt. Eine Empfehlung.' },
  MARKET, MARKET, MARKET, MARKET, MARKET, MARKET, MARKET, MARKET,
  { k: 'Schritt 09 · Filter',              h: 'Der Weitblick-Radar' },
  { k: 'Schritt 10 · Best Select',         h: 'Das Beste bleibt', n: ANON },
  /* ---- Trichterphase: zwei Prüfungen — erst gewinnt das beste Unternehmen,
     dann gewinnt sein bester Tarif. Die Kicker tragen die Zwei-Phasen-
     Erzählung (Prüfung 1/2). ---- */
  { k: 'Prüfung 1 von 2 · Unternehmen',    h: 'Das beste Unternehmen setzt sich durch', n: ANON },
  { k: 'Prüfung 2 von 2 · Tarife',         h: 'Die Tarife des Besten',
    s: 'Das beste Unternehmen steht fest —\njetzt entscheidet der Tarif.', n: ANON },
  { k: 'Best Select',                      h: 'Der beste Tarif bleibt' },
];

export const LAST = T.length - 1;

/* Evidenz je Schritt für Screenreader — die visuellen Ebenen sind aria-hidden.
   Die Kategorie-Schritte folgen der gemischten Auftrittsreihenfolge (order);
   ohne order gilt die CATS-Reihenfolge (Server-Render vor dem Mischen). */
export function evidenceFor(step: number, order?: number[]): string {
  if (step >= 1 && step <= N_CATS) {
    const cat = CATS[order ? order[step - 1] : step - 1];
    const num = (cat.key === 'fonds' ? 'über ' : '') + cat.total.toLocaleString('de-DE');
    return step === 1
      ? 'Am Markt: ' + num + ' ' + cat.label + '.'
      : 'Dazu kommen ' + num + ' ' + cat.label + '.';
  }
  if (step === STEP_RADAR) return 'Der Weitblick-Radar prüft den gesamten Markt nach einem Maßstab — nur die Besten bleiben.';
  if (step === STEP_FINAL) return 'Best Select: acht Empfehlungen aus dem ganzen Markt, geprüft nach einem Maßstab.';
  const f = step - STEP_FINAL;
  if (f === 1) return 'Prüfung 1 von 2: Die acht besten Unternehmen durchlaufen den Trichter — fünf Kriterien: '
    + CRIT_C.join(', ') + '. Das beste Unternehmen setzt sich durch.';
  if (f === 2) return 'Prüfung 2 von 2: Die Tarife des besten Unternehmens durchlaufen den Trichter — '
    + 'fünf Kriterien: ' + CRIT_P.join(', ') + '.';
  if (f === 3) return 'Die Empfehlung: der beste Tarif des besten Unternehmens — Best Select, geprüft nach '
    + CRIT_P.join(', ') + '.';
  return '';
}
