import { useEffect, useRef, type FormEvent } from 'react';
import { BudgetTimelineStep } from './components/BudgetTimelineStep';
import { BusinessTypeStep } from './components/BusinessTypeStep';
import { ContactInfoStep } from './components/ContactInfoStep';
import { SuccessMessage } from './components/FormFeedback';
import { ProgressBar } from './components/ProgressBar';
import { ProjectNeedsStep } from './components/ProjectNeedsStep';
import { RequestSummary } from './components/RequestSummary';
import { useProjectRequest } from './hooks/useProjectRequest';
import { SUMMARY_STEP } from './types/projectRequest';

export default function App() {
  const { state, setField, toggleNeed, next, back, goTo, submit, reset } = useProjectRequest();
  const { step, data, errors, status, referenceCode, attempt } = state;

  const focusKey = `${step}-${status === 'success'}`;
  const lastFocusKey = useRef(focusKey);
  useEffect(() => {
    if (lastFocusKey.current === focusKey) return;
    lastFocusKey.current = focusKey;
    document.getElementById('step-title')?.focus();
  }, [focusKey]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.getElementById('step-title')?.focus();
  }, [step, status === 'success']);

  useEffect(() => {
    if (attempt === 0) return;
    document
      .querySelector<HTMLElement>('input[aria-invalid="true"], fieldset[data-invalid="true"] input')
      ?.focus();
  }, [attempt]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    next();
  };

  let content;
  switch (step) {
    case 0:
      content = (
        <BusinessTypeStep
          value={data.businessType}
          error={errors.businessType}
          onChange={(v) => setField('businessType', v)}
        />
      );
      break;
    case 1:
      content = <ProjectNeedsStep value={data.needs} error={errors.needs} onToggle={toggleNeed} />;
      break;
    case 2:
      content = (
        <BudgetTimelineStep
          budget={data.budget}
          timeline={data.timeline}
          errors={errors}
          onBudgetChange={(v) => setField('budget', v)}
          onTimelineChange={(v) => setField('timeline', v)}
        />
      );
      break;
    case 3:
      content = (
        <ContactInfoStep
          fullName={data.fullName}
          mobile={data.mobile}
          errors={errors}
          onChange={(field, value) => setField(field, value)}
        />
      );
      break;
    default:
      content = null;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>درخواست پروژه</h1>
        <p>در چند قدم ساده نیازتان را بگویید.</p>
      </header>

      <main className="card">
        {status === 'success' ? (
          <SuccessMessage referenceCode={referenceCode} onReset={reset} />
        ) : (
          <>
            <ProgressBar step={step} />

            <div className="step" key={step}>
              {step === SUMMARY_STEP ? (
                <RequestSummary
                  data={data}
                  status={status}
                  onEdit={goTo}
                  onBack={back}
                  onSubmit={submit}
                />
              ) : (
                <form noValidate onSubmit={handleSubmit}>
                  {content}
                  <div className="actions">
                    {step > 0 && (
                      <button type="button" className="btn btn-secondary" onClick={back}>
                        بازگشت
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary">
                      {step === 3 ? 'مرور و ارسال' : 'مرحله بعد'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}