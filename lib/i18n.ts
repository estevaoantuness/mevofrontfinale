import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from '../locales/pt-BR/translation.json';
import en from '../locales/en/translation.json';
import es419 from '../locales/es-419/translation.json';

// Supported languages - clean labels
export const LANGUAGES = [
  { code: 'pt-BR', label: 'pt', name: 'Português' },
  { code: 'en', label: 'en', name: 'English' },
  { code: 'es-419', label: 'es', name: 'Español' }
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

// Map browser language codes to our supported languages
// Example: 'es-ES' -> 'es-419', 'pt-PT' -> 'pt-BR', 'en-US' -> 'en'
const mapBrowserLanguage = (lng: string): string => {
  const lang = lng.toLowerCase();

  // Portuguese variations -> pt-BR
  if (lang.startsWith('pt')) return 'pt-BR';

  // Spanish variations -> es-419
  if (lang.startsWith('es')) return 'es-419';

  // English variations -> en
  if (lang.startsWith('en')) return 'en';

  // Default fallback
  return 'pt-BR';
};

// Custom language detector that maps browser languages
const customLanguageDetector = {
  name: 'customNavigator',
  lookup() {
    const browserLangs = navigator.languages || [navigator.language];
    for (const lang of browserLangs) {
      const mapped = mapBrowserLanguage(lang);
      if (mapped) return mapped;
    }
    return 'pt-BR';
  }
};

// Create a new LanguageDetector and add our custom detector
const languageDetector = new LanguageDetector();
languageDetector.addDetector(customLanguageDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en': { translation: en },
      'es-419': { translation: es419 }
    },
    supportedLngs: ['pt-BR', 'en', 'es-419'],
    fallbackLng: 'pt-BR',
    detection: {
      // Check localStorage first, then use our custom navigator detector
      order: ['localStorage', 'customNavigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'mevo_language'
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
