/* Platzierung — deterministisch (fester Seed je Kategorie).
   Läuft einmal auf Modulebene: Server und Client rechnen identisch,
   darum kein Hydration-Mismatch und keine Neuberechnung beim Re-Render. */

import { CATS, HUB, type CatKey } from './constants';
import { GERMANY, BB } from './germany';

export interface PlacedIcon {
  x: number;
  y: number;
  cat: CatKey;
  delay: number;   /* Auftritts-Stagger in s */
  ang: number;     /* Winkel zur Nabe, 0° = Norden, im Uhrzeigersinn */
  win: boolean;
}

export function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inPoly(x: number, y: number): boolean {
  if (x < BB.x0 || x > BB.x1 || y < BB.y0 || y > BB.y1) return false;   /* Schnellabweisung */
  let inside = false;
  for (let i = 0, j = GERMANY.length - 1; i < GERMANY.length; j = i++) {
    const xi = GERMANY[i][0], yi = GERMANY[i][1], xj = GERMANY[j][0], yj = GERMANY[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* Das ganze Symbol muss auf deutschem Boden stehen, nicht nur sein Mittelpunkt:
   geprüft werden Mittelpunkt, vier Achsen und vier Diagonalen im halben
   Symbolradius. Ohne die Diagonalen rutschen an schrägen Grenzabschnitten
   (Alpenrand, Oder) Ecken über die Linie. */
function inland(x: number, y: number, m: number): boolean {
  const d = m * 0.72;
  return inPoly(x, y) &&
         inPoly(x - m, y) && inPoly(x + m, y) && inPoly(x, y - m) && inPoly(x, y + m) &&
         inPoly(x - d, y - d) && inPoly(x + d, y - d) &&
         inPoly(x - d, y + d) && inPoly(x + d, y + d);
}

/* Textschiene und Zähler-Karte bleiben frei — beide liegen über dem Nordwesten */
const RESERVED = [
  { x0: 76, y0: 36, x1: 530, y1: 274 },    /* Kicker · Headline · Unterzeile */
  { x0: 88, y0: 252, x1: 472, y1: 606 },   /* Zähler-Karte (8 Zeilen) */
];

function free(x: number, y: number): boolean {
  for (const r of RESERVED) {
    if (x > r.x0 - 12 && x < r.x1 + 12 && y > r.y0 - 12 && y < r.y1 + 12) return false;
  }
  return true;
}

function buildIcons(): PlacedIcon[] {
  const icons: PlacedIcon[] = [];

  CATS.forEach(function (cat) {
    const rng = mulberry32(cat.seed);
    const n = Math.round(cat.total / cat.div);
    let minD = cat.min, fails = 0, placed = 0;
    while (placed < n) {
      const x = BB.x0 + rng() * (BB.x1 - BB.x0);
      const y = BB.y0 + rng() * (BB.y1 - BB.y0);
      let ok = inland(x, y, cat.pad) && free(x, y);
      if (ok) {
        for (let i = 0; i < icons.length && ok; i++) {
          const p = icons[i];
          /* Fonds-Punkte und Badges brauchen zueinander nur 32px (die kleinen
             Punkte liegen unter den Badges auf z1), Badges untereinander und
             Punkte untereinander den vollen minD. */
          const need = (cat.key === 'fonds') !== (p.cat === 'fonds') ? 32 : minD;
          const dx = p.x - x, dy = p.y - y;
          if (dx * dx + dy * dy < need * need) ok = false;
        }
      }
      if (ok) {
        /* Fonds-Regen: Fenster = 3 Takte (632 ms) — mit dem 632-ms-Auftritt
           endet der letzte Punkt exakt auf Takt 4 (Sperre 2528 ms) */
        const stag = cat.stag > 0 ? placed * cat.stag : rng() * 1.896;
        const ang = (Math.atan2(x - HUB.x, -(y - HUB.y)) * 180 / Math.PI + 360) % 360;
        icons.push({ x, y, cat: cat.key, delay: stag, ang, win: false });
        placed++; fails = 0;
      } else if (++fails > 120) {
        minD *= 0.92; fails = 0;  /* Terminierung garantiert, sanft — größere
                                     Symbole vertragen keinen harten Einbruch */
      }
    }
  });

  /* Die drei nabenfernsten Versicherer-Symbole entfallen (Randlagen wirkten
     verloren) — der Zähler zeigt weiterhin die echte Marktgröße. */
  icons.filter(p => p.cat === 'vers')
    .sort((a, b) => {
      const da = (a.x - HUB.x) * (a.x - HUB.x) + (a.y - HUB.y) * (a.y - HUB.y);
      const db = (b.x - HUB.x) * (b.x - HUB.x) + (b.y - HUB.y) * (b.y - HUB.y);
      return db - da;
    })
    .slice(0, 3)
    .forEach(p => { icons.splice(icons.indexOf(p), 1); });

  /* Gewinner: deterministisch, weit gestreut (Greedy-Farthest-Point) — genau
     eine Empfehlung je Kategorie, acht insgesamt. Große Pools zuerst: der
     erste liegt nah an der Nabe, jeder weitere maximiert den Mindestabstand
     zu allen bisherigen Gewinnern; die kleinen Kategorien wählen zuletzt. */
  const order: CatKey[] = ['vers', 'spk', 'fonds', 'bank', 'stb', 'ibt', 'vv', 'bsp'];
  const chosen: PlacedIcon[] = [];
  order.forEach(function (catKey) {
    const pool = icons.filter(function (p) {
      if (p.cat !== catKey || p.win) return false;
      const dx = p.x - HUB.x, dy = p.y - HUB.y;
      /* nicht unter der Nabe, nicht hinter der Textschiene */
      return (dx * dx + dy * dy > 90 * 90) && p.y > 185;
    });
    let best: PlacedIcon | null = null, bestScore = -Infinity;
    pool.forEach(function (p) {
      let score: number;
      if (!chosen.length) {
        const dx = p.x - HUB.x, dy = p.y - HUB.y;
        score = -(dx * dx + dy * dy);           /* erster: nah an der Nabe */
      } else {
        score = Infinity;
        chosen.forEach(function (c) {
          const dx = c.x - p.x, dy = c.y - p.y;
          score = Math.min(score, dx * dx + dy * dy);
        });
      }
      if (score > bestScore) { bestScore = score; best = p; }
    });
    if (best) { (best as PlacedIcon).win = true; chosen.push(best); }
  });

  return icons;
}

export const ICONS: PlacedIcon[] = buildIcons();

/* Die acht Gewinner, nach Karten-x sortiert — die Flugbahnen in die
   Aufstellungs-Reihe (Schritt 11) kreuzen sich so nicht. */
export const WINNER_ICONS: PlacedIcon[] = ICONS.filter(p => p.win).sort((a, b) => a.x - b.x);
