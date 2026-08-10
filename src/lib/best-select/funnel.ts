/* Trichterphase (Schritte 11–16) — Daten & Geometrie, aus Assets.html
   weiterentwickelt. Ein Symbolstrom steht für den ganzen Markt, der durch
   den Trichter geprüft wird; die drei Gewinner bleiben anonymisiert
   (Anbieter A/B/C). */

export const CRIT_C = ['Service & Regulierung', 'Bestandsführung', 'Bilanzqualität', 'Finanzstärke', 'Beitrag'];
export const CRIT_P = ['Leistungsumfang', 'Bedingungswerk', 'Flexibilität', 'Beitrag', 'Rating'];

export interface Winner { n: string; mono: string }
export const WINNERS: Winner[] = [
  { n: 'Anbieter A', mono: 'A' },
  { n: 'Anbieter B', mono: 'B' },
  { n: 'Anbieter C', mono: 'C' },
];

/* 3 Tarife je Anbieter, Spalte = col, Zeile = row.
   Nur die Empfehlung erreicht 3/3 — der Maßstab muss sein eigenes Ergebnis tragen */
export interface Product { n: string; v: number; col: number; row: number }
export const PRODUCTS: Product[] = [
  { n: 'Basis',        v: 1, col: 0, row: 0 },
  { n: 'Komfort',      v: 2, col: 0, row: 1 },
  { n: 'Komfort Plus', v: 2, col: 0, row: 2 },
  { n: 'Start',        v: 1, col: 1, row: 0 },
  { n: 'Plus',         v: 2, col: 1, row: 1 },
  { n: 'Premium',      v: 3, col: 1, row: 2 },
  { n: 'Classic',      v: 1, col: 2, row: 0 },
  { n: 'Aktiv',        v: 2, col: 2, row: 1 },
  { n: 'Aktiv Plus',   v: 2, col: 2, row: 2 },
];
export const WIN_P = 5;                          /* Anbieter B · Premium */
export const WIN_COL = Math.floor(WIN_P / 3);

/* ---------- Geometrie (Bühnenmitte = 800/450, alles zentriert) ---------- */
export const CANVAS_X = 0;                       /* abs 800 */
export const COLS3 = [-300, 0, 300];             /* abs 500 / 800 / 1100 */
export const PR_ROWS = [-148, -72, 4];           /* abs 302 / 378 / 454 */
export const HEAD_Y = -228;                      /* abs 222 */
export const SINK_Y = 145;                       /* abs 595 — im Inneren des Trichters an der Tischkante */
export const OUT_Y = 320;                        /* abs 770 — Ergebnisse unter dem Auslauf */
export const FUNNEL_REST = 0;                    /* Auslauf endet an der Tischkante (Schritte 11 / 12 / 15 / 16) */
export const FUNNEL_OFF = 420;                   /* Trichter unterhalb des Bildes geparkt */
