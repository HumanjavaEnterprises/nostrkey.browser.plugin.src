import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copySecret, SECRET_CLEAR_MS } from '../src/utilities/copy-secret.js';

function fakeClipboard() {
  const cb = { value: null, writeText: vi.fn(async (s) => { cb.value = s; }) };
  return cb;
}

describe('copySecret', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('clears after 60 seconds', async () => {
    const clipboard = fakeClipboard();
    await copySecret('nsec1secret', { clipboard });
    expect(clipboard.value).toBe('nsec1secret');
    expect(SECRET_CLEAR_MS).toBe(60000);
    await vi.advanceTimersByTimeAsync(59999);
    expect(clipboard.value).toBe('nsec1secret');
    await vi.advanceTimersByTimeAsync(1);
    expect(clipboard.value).toBe('');
  });

  it('a second copy restarts the timer instead of clearing early', async () => {
    const clipboard = fakeClipboard();
    await copySecret('one', { clipboard });
    await vi.advanceTimersByTimeAsync(30000);
    await copySecret('two', { clipboard });
    await vi.advanceTimersByTimeAsync(30000);
    expect(clipboard.value).toBe('two');
    await vi.advanceTimersByTimeAsync(30000);
    expect(clipboard.value).toBe('');
  });

  it('a refused clear does not throw', async () => {
    const clipboard = fakeClipboard();
    await copySecret('x', { clipboard });
    clipboard.writeText.mockImplementation(async () => { throw new Error('denied'); });
    await vi.advanceTimersByTimeAsync(SECRET_CLEAR_MS);
    expect(clipboard.value).toBe('x');
  });

  it('rejects when there is no clipboard', async () => {
    await expect(copySecret('x', { clipboard: {} })).rejects.toThrow();
  });
});
