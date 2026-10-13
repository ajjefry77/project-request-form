import { NEED_OPTIONS, type NeedType } from '../types/projectRequest';
import { ChoiceGroup } from './ChoiceGroup';

interface Props {
  value: NeedType[];
  error?: string;
  onToggle: (value: NeedType) => void;
}

export function ProjectNeedsStep({ value, error, onToggle }: Props) {
  // Multi-select step, "not sure" logic lives in the reducer.
  return (
    <>
      <h2 id="step-title" tabIndex={-1} className="step-title">
        چه چیزی نیاز دارید؟
      </h2>
      <p className="step-hint">می‌توانید بیشتر از یک مورد انتخاب کنید.</p>
      <ChoiceGroup
        type="checkbox"
        name="needs"
        legend="نیازهای پروژه"
        hideLegend
        options={NEED_OPTIONS}
        value={value}
        error={error}
        onChange={onToggle}
      />
    </>
  );
}