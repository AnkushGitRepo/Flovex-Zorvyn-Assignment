import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 1200, start = 0) {
  const [count, setCount] = useState(start);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null) return;
    const startTime = performance.now();
    const range = target - start;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + range * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, start]);

  return count;
}
