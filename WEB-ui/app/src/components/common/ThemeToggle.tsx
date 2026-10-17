import React, { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore, applyThemeToDocumentRoot } from '../../store/useThemeStore';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const isLight = theme === 'light';

  useEffect(() => {
    applyThemeToDocumentRoot(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isLight}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      title={`Current theme: ${isLight ? 'Frost Protocol (Light)' : 'Arc Reactor (Dark)'}. Click to toggle.`}
      className="relative inline-flex items-center justify-between w-14 h-7 p-0.5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] cursor-pointer select-none shrink-0"
      style={{
        backgroundColor: 'var(--surface-elevated)',
        border: '1px solid var(--border-color)',
      }}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-150 ${
          isLight
            ? 'bg-[var(--color-blue)] text-white shadow-xs'
            : 'text-[var(--text-muted)]'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-150 ${
          !isLight
            ? 'bg-[#202F46] text-[#45D9CF] shadow-xs'
            : 'text-[var(--text-muted)]'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </span>
    </button>
  );
};

export default ThemeToggle;
