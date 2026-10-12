import type { FormErrors } from '../types/projectRequest';
import { FieldError } from './FormFeedback';

interface Props {
  fullName: string;
  mobile: string;
  errors: FormErrors;
  onChange: (field: 'fullName' | 'mobile', value: string) => void;
}

export function ContactInfoStep({ fullName, mobile, errors, onChange }: Props) {
  const mobileDescribedBy = ['mobile-hint', errors.mobile ? 'mobile-error' : null]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <h2 id="step-title" tabIndex={-1} className="step-title">
        اطلاعات تماس
      </h2>
      <p className="step-hint">برای هماهنگی و ارسال پیشنهاد با شما تماس می‌گیریم.</p>

      <div className="field">
        <label htmlFor="fullName">
          نام و نام خانوادگی <span aria-hidden="true">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          aria-required="true"
          aria-invalid={errors.fullName ? true : undefined}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        <FieldError id="fullName-error" message={errors.fullName} />
      </div>

      <div className="field">
        <label htmlFor="mobile">
          شماره موبایل <span aria-hidden="true">*</span>
        </label>
        <input
          id="mobile"
          name="mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          className="input-ltr"
          placeholder="09123456789"
          value={mobile}
          onChange={(e) => onChange('mobile', e.target.value)}
          aria-required="true"
          aria-invalid={errors.mobile ? true : undefined}
          aria-describedby={mobileDescribedBy}
        />
        <p id="mobile-hint" className="field-hint">
          با ارقام فارسی یا انگلیسی بنویسید.
        </p>
        <FieldError id="mobile-error" message={errors.mobile} />
      </div>
    </>
  );
}