import { useState, useEffect } from 'react';

const STORAGE_KEY = 'flovex-theme';

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}

/** Tracks whether the .dark class is currently on <html> */
export function useIsDark() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'system';
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for OS-level preference changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (next) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  };

  return { theme, setTheme };
}
