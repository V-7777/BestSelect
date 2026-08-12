/* Trichterphase (Schritte 11–13) — Daten & Geometrie, radikal vereinfacht:
   Kreise statt Karten. Acht Unternehmen fallen in den Trichter, EINES —
   das beste — tritt aus (Azur). Es wird zurückgeworfen, seine Tarife
   treten aus (warmes Ecru, die zweite Markenfamilie: eine andere Gattung
   Ding), der beste Tarif bleibt. Alles anonym — nur Lichtpunkte. */

export const CRIT_C = ['Service & Regulierung', 'Bestandsführung', 'Bilanzqualität', 'Finanzstärke', 'Beitrag'];
export const CRIT_P = ['Leistungsumfang', 'Bedingungswerk', 'Flexibilität', 'Beitrag', 'Rating'];

export const N_PD = 5;      /* Tarife des besten Unternehmens (Prüfung 2) */
export const WIN_PD = 2;    /* der beste Tarif tritt mittig aus und steigt lotrecht */

/* ---------- Geometrie (absolute Bühnenkoordinaten, 1600×900) ----------
   Trichter in Ruhelage: Mundkante abs y 496 (x 460–1140), Auslauf-Unterkante
   abs 694, Lichtkegel bis 798. Die Punkte-Ebene positioniert absolut
   (left/top 0 + Transform), wie zuvor die Aufstellungs-Klone. */
export const GATHER_Y = 420;                     /* Sammelhöhe über der Mundkante */
export const GATHER_DX = 56;                     /* Reihenabstand der acht Unternehmen */
export const DROP_Y = 560;                       /* Fallziel hinter dem Glas (Mund abs 496) */
export const SPOUT = { x: 800, y: 675 };         /* Saatpunkt im Auslauf (verdeckt vom Korpus) */
export const ROW_Y = 792;                        /* Ergebnis-Reihe im Lichtkegel unter dem Auslauf */
export const BEST_SCALE = 1.2;                   /* das beste Unternehmen tritt größer aus als es fiel */
export const PD_DX = 64;                         /* Abstand der fünf Tarif-Punkte */
export const TOSS_Y = 400;                       /* Wurf-Scheitel über der Mundkante (Schritt 12) */
export const WIN_X = 800;                        /* Finale: der beste Tarif steigt ins Zentrum */
export const WIN_Y = 448;
export const WIN_SCALE = 2.6;                    /* 18px-Punkt → ~47px Lichtkreis */
export const FUNNEL_REST = 0;                    /* Auslauf endet an der Tischkante */
export const FUNNEL_OFF = 420;                   /* Trichter unterhalb des Bildes geparkt */
