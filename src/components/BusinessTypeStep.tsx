import { BUSINESS_OPTIONS, type BusinessType } from '../types/projectRequest';
import { ChoiceGroup } from './ChoiceGroup';

interface Props {
  value: BusinessType | null;
  error?: string;
  onChange: (value: BusinessType) => void;
}

export function BusinessTypeStep({ value, error, onChange }: Props) {
  return (
    <>
      <h2 id="step-title" tabIndex={-1} className="step-title">
        کسب‌وکار شما چه نوعی است؟
      </h2>
      <p className="step-hint">یکی را انتخاب کنید تا پیشنهاد مناسب‌تری بدهیم.</p>
      <ChoiceGroup
        type="radio"
        name="businessType"
        legend="نوع کسب‌وکار"
        hideLegend
        options={BUSINESS_OPTIONS}
        value={value}
        error={error}
        onChange={onChange}
      />
    </>
  );
}