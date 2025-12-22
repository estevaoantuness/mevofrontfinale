import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg theme-bg-input hover:theme-bg-hover border theme-border transition-colors"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe size={16} className="theme-text-secondary" />
        {!compact && (
          <span className="text-sm theme-text-primary font-medium">{currentLang.label}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 theme-bg-card border theme-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code as LanguageCode)}
              className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors ${
                lang.code === i18n.language
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'theme-text-secondary hover:theme-bg-hover'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {lang.code === i18n.language && (
                <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
