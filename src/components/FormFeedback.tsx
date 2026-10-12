import type { SubmitStatus } from '../types/projectRequest';

interface FieldErrorProps {
  id: string;
  message?: string;
}

// Inline error under a field, announced via role=alert.
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null; // nothing to show, keeps DOM clean
  return (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  );
}

// Submit state: spinner while sending, message on failure.
export function SubmitFeedback({ status }: { status: SubmitStatus }) {
  if (status === 'loading') {
    return (
      <p className="feedback feedback-loading" role="status">
        <span className="spinner" aria-hidden="true" />
        در حال ارسال درخواست…
      </p>
    );
  }
  if (status === 'error') {
    return (
      <p className="feedback feedback-error" role="alert">
        ارسال انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. اطلاعات شما حفظ شده است.
      </p>
    );
  }
  return null;
}

interface SuccessMessageProps {
  referenceCode: string | null;
  onReset: () => void;
}

export function SuccessMessage({ referenceCode, onReset }: SuccessMessageProps) {
  // Final screen after a successful submit.
  return (
    <section className="success" aria-live="polite">
      <div className="success-icon" aria-hidden="true">✓</div>
      <h2 id="step-title" tabIndex={-1} className="step-title">
        درخواست شما ثبت شد
      </h2>
      <p>به‌زودی برای هماهنگی با شما تماس می‌گیریم.</p>
      {referenceCode && (
        <p className="success-code">
          کد پیگیری: <strong dir="ltr">{referenceCode}</strong>
        </p>
      )}
      <button type="button" className="btn btn-secondary" onClick={onReset}>
        ثبت درخواست جدید
      </button>
    </section>
  );
}
