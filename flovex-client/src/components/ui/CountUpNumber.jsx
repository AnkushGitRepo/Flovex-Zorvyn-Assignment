import { useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useCountUp } from '../../hooks/useCountUp';

export default function CountUpNumber({ value = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(isInView ? value : 0, 1400);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}
