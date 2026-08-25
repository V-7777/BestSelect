/* Trichterphase (Schritte 11–13) — Daten & Geometrie, radikal vereinfacht:
   Kreise statt Karten, ZWEI Maschinen. Acht Unternehmen fallen in den
   Unternehmens-Trichter, drei treten aus (Azur). Der Trichter fährt nach
   oben davon, ein neuer Tarif-Trichter steigt von unten auf: die drei
   werden hineingeworfen, fünf Tarife treten aus (warmes Ecru — die zweite
   Markenfamilie: eine andere Gattung Ding), der beste Tarif bleibt.
   Alles anonym — nur Lichtpunkte. */

export const CRIT_C = ['Service & Regulierung', 'Bestandsführung', 'Bilanzqualität', 'Finanzstärke', 'Beitrag'];
export const CRIT_P = ['Leistungsumfang', 'Bedingungswerk', 'Flexibilität', 'Beitrag', 'Rating'];

export const N_SV = 3;      /* Unternehmen, die Prüfung 1 bestehen */
export const N_PD = 5;      /* Tarife, die aus Prüfung 2 austreten */
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
export const MID_Y = 430;                        /* Warteposition Fenstermitte: über der Mundkante (496)
                                                    der nächsten Maschine — bereit zum Einwurf */
export const SV_DX = 76;                         /* Abstand der drei bestehenden Unternehmen */
export const PD_DX = 64;                         /* Abstand der fünf Tarif-Punkte */
export const TOSS_Y = 400;                       /* Wurf-Scheitel über der Mundkante (Schritt 12) */
export const TOSS_DX = 60;                       /* Wurfziele um die Trichtermitte */
export const WIN_X = 800;                        /* Finale: der beste Tarif steigt ins Zentrum */
export const WIN_Y = 448;
export const WIN_SCALE = 2.6;                    /* 18px-Punkt → ~47px Lichtkreis */
export const FUNNEL_REST = 0;                    /* Auslauf endet an der Tischkante */
export const FUNNEL_OFF = 520;                   /* Parkstand unter dem Bild — tief genug, dass auch
                                                    der Maschinen-Titel (abs 470) unter der Kante liegt */
export const FUNNEL_TOP = -1100;                 /* Abgang nach oben: vollständig über dem Bild */
