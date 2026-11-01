import { useEffect, useRef } from 'react';

// Calls `callback` every `interval` ms while `enabled`. Skips ticks while the previous
// call is still pending or the tab is hidden, and refreshes once when the tab is shown again.
export default function usePolling(callback, interval, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let inFlight = false;
    const tick = () => {
      if (inFlight || document.hidden) {
        return;
      }
      inFlight = true;
      Promise.resolve()
        .then(() => savedCallback.current())
        .catch(() => {})
        .finally(() => {
          inFlight = false;
        });
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tick();
      }
    };

    const intervalId = setInterval(tick, interval);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interval, enabled]);
}
