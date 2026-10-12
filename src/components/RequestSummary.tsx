import {
  BUDGET_OPTIONS,
  BUSINESS_OPTIONS,
  NEED_OPTIONS,
  TIMELINE_OPTIONS,
  labelOf,
  type ProjectRequestData,
  type StepNumber,
  type SubmitStatus,
} from '../types/projectRequest';
import { toPersianDigits } from '../utils/persianDigits';
import { SubmitFeedback } from './FormFeedback';

interface Props {
  data: ProjectRequestData;
  status: SubmitStatus;
  onEdit: (step: StepNumber) => void;
  onBack: () => void;
  onSubmit: () => void;
}

interface Row {
  title: string;
  step: StepNumber;
  value: string;
  ltr?: boolean;
}

export function RequestSummary({ data, status, onEdit, onBack, onSubmit }: Props) {
  // Join selected needs into one line for the review list.
  const needsText = data.needs.map((n) => labelOf(NEED_OPTIONS, n)).join('، ');

  // Each row knows which step it came from so Edit jumps back there.
  const rows: Row[] = [
    { title: 'نوع کسب‌وکار', step: 0, value: labelOf(BUSINESS_OPTIONS, data.businessType) },
    { title: 'نیاز پروژه', step: 1, value: needsText },
    { title: 'بودجه', step: 2, value: labelOf(BUDGET_OPTIONS, data.budget) },
    { title: 'زمان‌بندی', step: 2, value: labelOf(TIMELINE_OPTIONS, data.timeline) },
    { title: 'نام', step: 3, value: data.fullName },
    { title: 'شماره موبایل', step: 3, value: toPersianDigits(data.mobile), ltr: true },
  ];

  const loading = status === 'loading'; // disables buttons while submitting

  return (
    <>
      <h2 id="step-title" tabIndex={-1} className="step-title">
        بازبینی و ارسال
      </h2>
      <p className="step-hint">اطلاعات را بررسی کنید. در صورت نیاز می‌توانید ویرایش کنید.</p>

      <dl className="summary">
        {rows.map((row) => (
          <div className="summary-row" key={row.title}>
            <div className="summary-text">
              <dt>{row.title}</dt>
              <dd dir={row.ltr ? 'ltr' : undefined} className={row.ltr ? 'summary-ltr' : undefined}>
                {row.value}
              </dd>
            </div>
            <button
              type="button"
              className="btn-link"
              onClick={() => onEdit(row.step)}
              aria-label={`ویرایش ${row.title}`}
              disabled={loading}
            >
              ویرایش
            </button>
          </div>
        ))}
      </dl>

      <SubmitFeedback status={status} />

      <div className="actions">
        <button type="button" className="btn btn-secondary" onClick={onBack} disabled={loading}>
          بازگشت
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {status === 'error' ? 'تلاش دوباره' : 'ارسال درخواست'}
        </button>
      </div>
    </>
  );
}