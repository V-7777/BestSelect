import type { ReactNode, Ref } from 'react';

/* 1600×900-Bühne mit Nachtkarte; Scrims (Lesbarkeit oben, Vignette) liegen
   als ::before/::after im CSS. #scrim-low ist die dritte, schaltbare Scrim
   für das helle Kartenzentrum (Schritte 12/16, Klasse .lowlit). Die
   Skalierung auf den Viewport setzt BestSelect über die ref (fit()). */
export default function Stage({ ref, children }: { ref: Ref<HTMLDivElement>; children: ReactNode }) {
  return (
    <div id="stage" ref={ref}>
      <div id="scrim-low" aria-hidden="true" />
      {/* Finale-Scrim: dunkelt die Karte unter dem Schlussbild deutlich
          stärker ab — nur bei .final sichtbar */}
      <div id="scrim-final" aria-hidden="true" />
      {children}
    </div>
  );
}
