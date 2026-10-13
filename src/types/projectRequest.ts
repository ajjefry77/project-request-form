// Allowed values for each dropdown/radio group.
// Kept as unions so a typo fails at compile time.
export type BusinessType =
  | 'clinic'
  | 'factory'
  | 'shop'
  | 'restaurant'
  | 'education'
  | 'other';

export type NeedType = 'website' | 'app' | 'store' | 'system' | 'unsure';

export type BudgetRange = 'under10' | '10to30' | '30to100' | 'over100' | 'unknown';

export type Timeline = 'urgent' | 'one_to_three' | 'over_three' | 'flexible';

// Everything the form collects, in one place.
export interface ProjectRequestData {
  businessType: BusinessType | null;
  needs: NeedType[];
  budget: BudgetRange | null;
  timeline: Timeline | null;
  fullName: string;
  mobile: string;
}

export type FieldName = keyof ProjectRequestData;
export type FormErrors = Partial<Record<FieldName, string>>;

// Steps 0-3 are the form, 4 is the review screen.
export type StepNumber = 0 | 1 | 2 | 3 | 4;
export type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FormState {
  step: StepNumber;
  data: ProjectRequestData;
  errors: FormErrors;
  status: SubmitStatus;
  referenceCode: string | null;
  // Bumped on each failed "next" so App can move focus to the first error.
  attempt: number;
}

// Generic option used by the card-style radio/checkbox groups.
export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
}

export const TOTAL_STEPS = 4;
export const SUMMARY_STEP: StepNumber = 4;

// Fresh form, also used when resetting after a successful submit.
export const INITIAL_DATA: ProjectRequestData = {
  businessType: null,
  needs: [],
  budget: null,
  timeline: null,
  fullName: '',
  mobile: '',
};

// Labels shown in the progress bar.
export const STEP_LABELS: Record<StepNumber, string> = {
  0: 'نوع کسب‌وکار',
  1: 'نیاز پروژه',
  2: 'بودجه و زمان‌بندی',
  3: 'اطلاعات تماس',
  4: 'بازبینی نهایی',
};

export const BUSINESS_OPTIONS: Option<BusinessType>[] = [
  { value: 'clinic', label: 'مطب یا کلینیک', description: 'پزشک، دندان‌پزشک، مرکز درمانی', icon: '🩺' },
  { value: 'factory', label: 'کارخانه یا تولیدی', description: 'تولید، صنعت، انبار', icon: '🏭' },
  { value: 'shop', label: 'فروشگاه', description: 'خرده‌فروشی یا عمده‌فروشی', icon: '🛍️' },
  { value: 'restaurant', label: 'رستوران یا کافه', description: 'غذا، نوشیدنی، سفارش آنلاین', icon: '🍽️' },
  { value: 'education', label: 'آموزشی', description: 'آموزشگاه، مدرسه، دوره‌های آنلاین', icon: '🎓' },
  { value: 'other', label: 'سایر', description: 'مورد دیگری که در فهرست نیست', icon: '✨' },
];

export const NEED_OPTIONS: Option<NeedType>[] = [
  { value: 'website', label: 'وب‌سایت', description: 'معرفی کسب‌وکار و جذب مشتری', icon: '🌐' },
  { value: 'app', label: 'اپلیکیشن موبایل', description: 'برنامه برای اندروید یا iOS', icon: '📱' },
  { value: 'store', label: 'فروشگاه اینترنتی', description: 'فروش آنلاین و پرداخت', icon: '🛒' },
  { value: 'system', label: 'سامانه‌ی مدیریتی', description: 'نوبت‌دهی، انبار، حسابداری و مانند آن', icon: '⚙️' },
  { value: 'unsure', label: 'نمی‌دانم، راهنمایی بگیرم', description: 'با هم بررسی می‌کنیم', icon: '🤔' },
];

export const BUDGET_OPTIONS: Option<BudgetRange>[] = [
  { value: 'under10', label: 'کمتر از ۱۰ میلیون تومان' },
  { value: '10to30', label: '۱۰ تا ۳۰ میلیون تومان' },
  { value: '30to100', label: '۳۰ تا ۱۰۰ میلیون تومان' },
  { value: 'over100', label: 'بیشتر از ۱۰۰ میلیون تومان' },
  { value: 'unknown', label: 'هنوز نمی‌دانم' },
];

export const TIMELINE_OPTIONS: Option<Timeline>[] = [
  { value: 'urgent', label: 'فوری (کمتر از یک ماه)' },
  { value: 'one_to_three', label: 'حدود یک تا سه ماه' },
  { value: 'over_three', label: 'بیش از سه ماه' },
  { value: 'flexible', label: 'زمان‌بندی مهم نیست' },
];

export function labelOf<T extends string>(options: readonly Option<T>[], value: T | null): string {
  // Falls back to a dash so the summary never renders empty.
  return options.find((o) => o.value === value)?.label ?? '—';
}