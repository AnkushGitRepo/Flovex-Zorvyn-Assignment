import { useState, useEffect } from 'react';
import Avatar from './Avatar';

const TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN;

// Common words to strip when deriving a domain from a transaction name
const NOISE_WORDS = new Set([
  'order', 'orders', 'payment', 'subscription', 'credit', 'debit',
  'salary', 'purchase', 'bill', 'fee', 'charge', 'transfer', 'refund',
  'cashback', 'reward', 'bonus', 'interest', 'emi', 'invoice',
]);

function extractDomain(name) {
  if (!name) return null;
  const words = name.trim().toLowerCase().split(/\s+/);
  // Pick the first word that isn't a noise word and is long enough to be a brand
  const brand = words.find((w) => w.length > 2 && !NOISE_WORDS.has(w));
  if (!brand) return null;
  // Strip any non-alpha characters (punctuation, numbers)
  const cleaned = brand.replace(/[^a-z]/g, '');
  return cleaned ? `${cleaned}.com` : null;
}

function useDarkMode() {
  const [dark, setDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return dark;
}

/**
 * Displays a company logo via Logo.dev.
 * Falls back to the Avatar (coloured initials circle) when no logo is available.
 *
 * Props:
 *   name  — transaction / company name used to derive a domain
 *   size  — pixel size for both the logo and the fallback avatar (default 36)
 */
export default function CompanyLogo({ name = '', size = 36 }) {
  const isDark = useDarkMode();
  const domain = extractDomain(name);

  const [status, setStatus] = useState('idle'); // idle | loading | loaded | error

  // Reset whenever the name changes so we re-attempt the logo
  useEffect(() => {
    setStatus(domain ? 'loading' : 'error');
  }, [domain]);

  if (!domain || status === 'error') {
    return <Avatar name={name} size={size} />;
  }

  const src = `https://img.logo.dev/${domain}?token=${TOKEN}&size=${size * 2}&format=webp&theme=${isDark ? 'dark' : 'light'}`;

  return (
    <div
      style={{ width: size, height: size }}
      className="relative rounded-full overflow-hidden shrink-0 bg-border flex items-center justify-center"
    >
      {status === 'loading' && (
        <div className="absolute inset-0 rounded-full bg-border animate-pulse" />
      )}
      <img
        src={src}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          opacity: status === 'loaded' ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}
