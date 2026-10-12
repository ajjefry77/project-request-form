import type { FormErrors, ProjectRequestData, StepNumber } from '../types/projectRequest';
import { toEnglishDigits } from './persianDigits';


export function normalizeMobile(raw: string): string {
  let v = toEnglishDigits(raw).replace(/[\s\-()‌]/g, '');
  if (v.startsWith('+98')) v = '0' + v.slice(3);
  else if (v.startsWith('0098')) v = '0' + v.slice(4);
  else if (v.startsWith('98') && v.length === 12) v = '0' + v.slice(2);
  else if (v.startsWith('9') && v.length === 10) v = '0' + v;
  return v;
}

export function validateMobile(raw: string): string | null {
  const m = normalizeMobile(raw);
  if (m === '') return 'شماره موبایل را وارد کنید.';
  if (!/^\d+$/.test(m)) return 'شماره موبایل فقط باید شامل رقم باشد.';
  if (!m.startsWith('09')) return 'شماره موبایل باید با ۰۹ شروع شود. مثال: ۰۹۱۲۳۴۵۶۷۸۹';
  if (m.length !== 11) return 'شماره موبایل باید ۱۱ رقم باشد. مثال: ۰۹۱۲۳۴۵۶۷۸۹';
  return null;
}

const NAME_PATTERN = /^[\p{L}\p{M}\u200c\s.'-]+$/u;

export function validateFullName(raw: string): string | null {
  const name = raw.trim();
  if (name === '') return 'نام و نام خانوادگی را وارد کنید.';
  if (name.length < 3) return 'نام وارد‌شده خیلی کوتاه است.';
  if (!NAME_PATTERN.test(name)) return 'نام فقط می‌تواند شامل حروف باشد.';
  return null;
}

/** خطاهای یک مرحله را برمی‌گرداند. اگر آبجکت خالی باشد، مرحله معتبر است. */
export function validateStep(step: StepNumber, data: ProjectRequestData): FormErrors {
  const errors: FormErrors = {};

  switch (step) {
    case 0:
      if (!data.businessType) errors.businessType = 'لطفاً نوع کسب‌وکار خود را انتخاب کنید.';
      break;
    case 1:
      if (data.needs.length === 0) {
        errors.needs = 'حداقل یک مورد را انتخاب کنید. اگر مطمئن نیستید، «نمی‌دانم» را بزنید.';
      }
      break;
    case 2:
      if (!data.budget) errors.budget = 'لطفاً یک بازه‌ی بودجه انتخاب کنید.';
      if (!data.timeline) errors.timeline = 'لطفاً زمان‌بندی مورد نظر را انتخاب کنید.';
      break;
    case 3: {
      const nameError = validateFullName(data.fullName);
      if (nameError) errors.fullName = nameError;
      const mobileError = validateMobile(data.mobile);
      if (mobileError) errors.mobile = mobileError;
      break;
    }
    default:
      break;
  }

  return errors;
}


export function findFirstInvalidStep(data: ProjectRequestData): StepNumber | null {
  for (const step of [0, 1, 2, 3] as const) {
    if (Object.keys(validateStep(step, data)).length > 0) return step;
  }
  return null;
}