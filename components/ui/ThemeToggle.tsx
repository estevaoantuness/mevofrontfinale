import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center p-1.5 sm:p-2 rounded-lg theme-bg-input hover:theme-bg-hover border theme-border transition-all duration-300 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-4 h-4 sm:w-5 sm:h-5">
        {/* Sun icon - visible in dark mode */}
        <Sun
          className={`absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 transition-all duration-300 ${
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'
          }`}
        />
        {/* Moon icon - visible in light mode */}
        <Moon
          className={`absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 text-slate-600 transition-all duration-300 ${
            isDark ? 'opacity-0 -rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
