import type { ReactNode, Ref } from 'react';

/* 1600×900-Bühne mit Nachtkarte; Scrims (Lesbarkeit oben, Vignette) liegen
   als ::before/::after im CSS. Die Skalierung auf den Viewport setzt
   BestSelect über die ref (fit()). */
export default function Stage({ ref, children }: { ref: Ref<HTMLDivElement>; children: ReactNode }) {
  return (
    <div id="stage" ref={ref}>
      {children}
    </div>
  );
}
