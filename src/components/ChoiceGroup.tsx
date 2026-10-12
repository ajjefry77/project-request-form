import type { Option } from '../types/projectRequest';
import { FieldError } from './FormFeedback';

interface CommonProps<T extends string> {
  name: string;
  legend: string;
  hideLegend?: boolean;
  options: readonly Option<T>[];
  error?: string;
}
interface RadioProps<T extends string> extends CommonProps<T> {
  type: 'radio';
  value: T | null;
  onChange: (value: T) => void;
}
interface CheckboxProps<T extends string> extends CommonProps<T> {
  type: 'checkbox';
  value: T[];
  onChange: (value: T) => void;
}

/** گروه کارت‌های قابل انتخاب؛ زیرِ کارت‌ها از radio/checkbox واقعی استفاده می‌کند. */
export function ChoiceGroup<T extends string>(props: RadioProps<T> | CheckboxProps<T>) {
  const { name, legend, hideLegend, options, error } = props;
  const errorId = `${name}-error`;

  return (
    <fieldset
      className="choice-group"
      aria-describedby={error ? errorId : undefined}
      data-invalid={error ? 'true' : undefined}
    >
      <legend className={hideLegend ? 'sr-only' : 'group-title'}>{legend}</legend>

      <div className="choice-grid">
        {options.map((option) => {
          const checked =
            props.type === 'radio' ? props.value === option.value : props.value.includes(option.value);

          return (
            <label key={option.value} className="choice">
              <input
                className="choice-input"
                type={props.type}
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => props.onChange(option.value)}
              />
              <span className="choice-card">
                {option.icon && (
                  <span className="choice-icon" aria-hidden="true">
                    {option.icon}
                  </span>
                )}
                <span className="choice-text">
                  <span className="choice-label">{option.label}</span>
                  {option.description && <span className="choice-desc">{option.description}</span>}
                </span>
                <span className={`choice-mark choice-mark-${props.type}`} aria-hidden="true" />
              </span>
            </label>
          );
        })}
      </div>

      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}