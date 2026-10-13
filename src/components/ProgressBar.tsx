import { STEP_LABELS, SUMMARY_STEP, TOTAL_STEPS, type StepNumber } from '../types/projectRequest';
import { toPersianDigits } from '../utils/persianDigits';

export function ProgressBar({ step }: { step: StepNumber }) {
  // Review screen counts as step 4 of 4 so the bar shows full.
  const current = step === SUMMARY_STEP ? TOTAL_STEPS : step + 1;
  const label = STEP_LABELS[step];
  const text = `مرحله ${toPersianDigits(current)} از ${toPersianDigits(TOTAL_STEPS)}`;

  return (
    <div className="progress">
      <div className="progress-meta">
        <span>{text}</span>
        <span className="progress-label">{label}</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="پیشرفت فرم"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={current}
        aria-valuetext={`${text}: ${label}`}
      >
        <div className="progress-fill" style={{ width: `${(current / TOTAL_STEPS) * 100}%` }} />
      </div>
    </div>
  );
}
