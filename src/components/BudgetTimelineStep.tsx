import {
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  type BudgetRange,
  type FormErrors,
  type Timeline,
} from '../types/projectRequest';
import { ChoiceGroup } from './ChoiceGroup';

interface Props {
  budget: BudgetRange | null;
  timeline: Timeline | null;
  errors: FormErrors;
  onBudgetChange: (value: BudgetRange) => void;
  onTimelineChange: (value: Timeline) => void;
}

export function BudgetTimelineStep({
  budget,
  timeline,
  errors,
  onBudgetChange,
  onTimelineChange,
}: Props) {
  // Two radio groups on one screen, each with its own error.
  return (
    <>
      <h2 id="step-title" tabIndex={-1} className="step-title">
        بودجه و زمان‌بندی
      </h2>
      <p className="step-hint">تخمین تقریبی کافی است؛ بعداً با هم دقیق‌تر می‌کنیم.</p>

      <ChoiceGroup
        type="radio"
        name="budget"
        legend="بودجه‌ی تقریبی"
        options={BUDGET_OPTIONS}
        value={budget}
        error={errors.budget}
        onChange={onBudgetChange}
      />

      <ChoiceGroup
        type="radio"
        name="timeline"
        legend="زمان‌بندی مورد نظر"
        options={TIMELINE_OPTIONS}
        value={timeline}
        error={errors.timeline}
        onChange={onTimelineChange}
      />
    </>
  );
}