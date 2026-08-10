import { LAST } from '@/lib/best-select/constants';
import { pad } from '@/lib/best-select/animate';

/* Fortschritt unten rechts: „0N / 10" — vor dem ersten Schritt ausgeblendet,
   ein Fortschritt von null ist keine Aussage */
export default function StepCounter({ step }: { step: number }) {
  return (
    <div className={'meta' + (step === 0 ? ' zero' : '')} id="count">{pad(step)} / {pad(LAST)}</div>
  );
}
