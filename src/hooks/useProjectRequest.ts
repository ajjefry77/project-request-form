import { useCallback, useEffect, useReducer } from 'react';
import { submitProjectRequest } from '../services/projectRequestApi';
import {
  BUDGET_OPTIONS,
  BUSINESS_OPTIONS,
  INITIAL_DATA,
  NEED_OPTIONS,
  SUMMARY_STEP,
  TIMELINE_OPTIONS,
  type FieldName,
  type FormState,
  type NeedType,
  type Option,
  type ProjectRequestData,
  type StepNumber,
} from '../types/projectRequest';
import { toEnglishDigits } from '../utils/persianDigits';
import { findFirstInvalidStep, normalizeMobile, validateStep } from '../utils/validation';



export const DRAFT_KEY = 'project-request-draft:v1';

export interface Draft {
  data: ProjectRequestData;
  step: StepNumber;
}

function isOption<T extends string>(options: readonly Option<T>[], value: unknown): value is T {
  return options.some((o) => o.value === value);
}

function sanitizeDraft(raw: unknown): Draft | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const d = (typeof r.data === 'object' && r.data !== null ? r.data : {}) as Record<string, unknown>;

  const data: ProjectRequestData = {
    businessType: isOption(BUSINESS_OPTIONS, d.businessType) ? d.businessType : null,
    needs: Array.isArray(d.needs)
      ? d.needs.filter((n): n is NeedType => isOption(NEED_OPTIONS, n))
      : [],
    budget: isOption(BUDGET_OPTIONS, d.budget) ? d.budget : null,
    timeline: isOption(TIMELINE_OPTIONS, d.timeline) ? d.timeline : null,
    fullName: typeof d.fullName === 'string' ? d.fullName : '',
    mobile: typeof d.mobile === 'string' ? d.mobile : '',
  };

  let step: StepNumber = 0;
  if (typeof r.step === 'number' && Number.isInteger(r.step) && r.step >= 0 && r.step <= 4) {
    step = r.step as StepNumber;
  }

  const firstInvalid = findFirstInvalidStep(data);
  if (firstInvalid !== null && step > firstInvalid) step = firstInvalid;

  return { data, step };
}

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? sanitizeDraft(JSON.parse(raw)) : null;
  } catch {
    return null; 
  }
}

function saveDraft(draft: Draft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
  }
}


type Action =
  | { type: 'SET_FIELD'; field: FieldName; value: ProjectRequestData[FieldName] }
  | { type: 'TOGGLE_NEED'; need: NeedType }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GO_TO'; step: StepNumber }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; referenceCode: string }
  | { type: 'SUBMIT_FAILURE' }
  | { type: 'RESET' };

export function createInitialState(): FormState {
  const draft = loadDraft();
  return {
    step: draft?.step ?? 0,
    data: draft?.data ?? INITIAL_DATA,
    errors: {},
    status: 'idle',
    referenceCode: null,
    attempt: 0,
  };
}

export function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD': {
      const value =
        action.field === 'mobile' ? toEnglishDigits(action.value as string) : action.value;
      const errors = { ...state.errors };
      delete errors[action.field];
      return {
        ...state,
        data: { ...state.data, [action.field]: value } as ProjectRequestData,
        errors,
        status: state.status === 'error' ? 'idle' : state.status,
      };
    }

    case 'TOGGLE_NEED': {
      const current = state.data.needs;
      let needs: NeedType[];
      if (current.includes(action.need)) {
        needs = current.filter((n) => n !== action.need);
      } else if (action.need === 'unsure') {
        needs = ['unsure']; 
      } else {
        needs = [...current.filter((n) => n !== 'unsure'), action.need];
      }
      const errors = { ...state.errors };
      delete errors.needs;
      return { ...state, data: { ...state.data, needs }, errors };
    }

    case 'NEXT': {
      if (state.step >= SUMMARY_STEP) return state;
      const errors = validateStep(state.step, state.data);
      if (Object.keys(errors).length > 0) {
        return { ...state, errors, attempt: state.attempt + 1 };
      }
      const data =
        state.step === 3
          ? {
              ...state.data,
              fullName: state.data.fullName.trim(),
              mobile: normalizeMobile(state.data.mobile),
            }
          : state.data;
      return { ...state, data, errors: {}, step: (state.step + 1) as StepNumber };
    }

    case 'BACK': {
      if (state.step === 0) return state;
      return { ...state, errors: {}, status: 'idle', step: (state.step - 1) as StepNumber };
    }

    case 'GO_TO': {
      if (action.step > state.step) return state; // فقط به مرحله‌های قبلی
      return { ...state, errors: {}, status: 'idle', step: action.step };
    }

    case 'SUBMIT_START':
      return { ...state, status: 'loading' };

    case 'SUBMIT_SUCCESS':
      return { ...state, status: 'success', referenceCode: action.referenceCode };

    case 'SUBMIT_FAILURE':
      return { ...state, status: 'error' };

    case 'RESET':
      return {
        step: 0,
        data: INITIAL_DATA,
        errors: {},
        status: 'idle',
        referenceCode: null,
        attempt: 0,
      };

    default:
      return state;
  }
}

/* ───────────── hook ───────────── */

export function useProjectRequest() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    if (state.status === 'success') {
      clearDraft();
      return;
    }
    saveDraft({ data: state.data, step: state.step });
  }, [state.data, state.step, state.status]);

  const setField = useCallback(
    <K extends FieldName>(field: K, value: ProjectRequestData[K]) =>
      dispatch({ type: 'SET_FIELD', field, value }),
    [],
  );
  const toggleNeed = useCallback((need: NeedType) => dispatch({ type: 'TOGGLE_NEED', need }), []);
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const back = useCallback(() => dispatch({ type: 'BACK' }), []);
  const goTo = useCallback((step: StepNumber) => dispatch({ type: 'GO_TO', step }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const submit = useCallback(async () => {
    if (state.status === 'loading') return;
    dispatch({ type: 'SUBMIT_START' });
    try {
      const result = await submitProjectRequest(state.data);
      dispatch({ type: 'SUBMIT_SUCCESS', referenceCode: result.referenceCode });
    } catch {
      dispatch({ type: 'SUBMIT_FAILURE' });
    }
  }, [state.data, state.status]);

  return { state, setField, toggleNeed, next, back, goTo, submit, reset };
}