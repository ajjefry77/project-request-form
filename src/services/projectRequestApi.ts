import type { ProjectRequestData } from '../types/projectRequest';
import { normalizeMobile } from '../utils/validation';

export interface SubmitResult {
  referenceCode: string;
}

// Fake latency so loading states are visible during dev.
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Mock submit for now, will be swapped with a real endpoint later.
export async function submitProjectRequest(data: ProjectRequestData): Promise<SubmitResult> {
  // Clean up before sending, backend expects English digits.
  const payload = { ...data, mobile: normalizeMobile(data.mobile), fullName: data.fullName.trim() };

  await delay(1200);

  // Add ?mock=error to the URL to test the failure path.
  const forceError =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('mock') === 'error';

  if (forceError) {
    throw new Error('MOCK_NETWORK_ERROR');
  }

  console.info('[mock API] payload:', payload);

  return { referenceCode: 'REQ-' + Math.random().toString(36).slice(2, 8).toUpperCase() };
}