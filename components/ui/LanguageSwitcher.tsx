import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, LanguageCode } from '../../lib/i18n';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  compact = false
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const handleChange = (code: LanguageCode) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-slate-400 hover:text-slate-200 transition-colors font-medium"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        {currentLang.label}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 theme-bg-card border theme-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code as LanguageCode)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                lang.code === i18n.language
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'theme-text-secondary hover:theme-bg-hover'
              }`}
            >
              <span className="font-medium">{lang.label}</span>
              <span className="ml-2 text-xs opacity-60">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
