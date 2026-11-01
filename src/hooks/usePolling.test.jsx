import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePolling from './usePolling';

function setHidden(hidden) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    setHidden(false);
  });

  test('polls on the interval only while enabled', async () => {
    const callback = vi.fn(() => Promise.resolve());
    const { rerender } = renderHook(({ enabled }) => usePolling(callback, 1000, enabled), {
      initialProps: { enabled: false },
    });

    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(callback).not.toHaveBeenCalled();

    rerender({ enabled: true });
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('skips ticks while a request is still pending', async () => {
    let resolve;
    const callback = vi.fn(() => new Promise((r) => { resolve = r; }));
    renderHook(() => usePolling(callback, 1000));

    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(callback).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test('pauses while hidden and refreshes when visible again', async () => {
    const callback = vi.fn(() => Promise.resolve());
    renderHook(() => usePolling(callback, 1000));

    setHidden(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });
    expect(callback).not.toHaveBeenCalled();

    await act(async () => { setHidden(false); });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('swallows rejected polls', async () => {
    const callback = vi.fn(() => Promise.reject(new Error('offline')));
    renderHook(() => usePolling(callback, 1000));

    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
