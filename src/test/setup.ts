import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Fresh DOM + storage for every test so they can't leak into each other.
afterEach(() => {
  cleanup();
  localStorage.clear();
});