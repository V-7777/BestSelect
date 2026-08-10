import { LAST } from '@/lib/best-select/constants';
import { pad } from '@/lib/best-select/animate';

/* Fortschritt unten rechts: „0N / 05" */
export default function StepCounter({ step }: { step: number }) {
  return (
    <div className="meta" id="count">{pad(step)} / {pad(LAST)}</div>
  );
}
