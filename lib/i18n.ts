import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from '../locales/pt-BR/translation.json';
import en from '../locales/en/translation.json';
import es419 from '../locales/es-419/translation.json';

// Supported languages
export const LANGUAGES = [
  { code: 'pt-BR', label: 'PT', flag: '🇧🇷', name: 'Português' },
  { code: 'en', label: 'EN', flag: '🇺🇸', name: 'English' },
  { code: 'es-419', label: 'ES', flag: '🇲🇽', name: 'Español' }
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en': { translation: en },
      'es-419': { translation: es419 }
    },
    fallbackLng: 'pt-BR',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'mevo_language'
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
