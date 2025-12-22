import { useTranslation } from 'react-i18next';
import { getErrorKey, extractErrorCode, extractErrorMessage, ApiError } from '../lib/error-messages';

interface TranslatedErrorResult {
  translateError: (error: ApiError | unknown) => string;
  getErrorMessage: (code: string) => string;
}

/**
 * Hook to translate error messages using i18n
 *
 * Usage:
 * const { translateError } = useTranslatedError();
 *
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   setError(translateError(error));
 * }
 */
export function useTranslatedError(): TranslatedErrorResult {
  const { t, i18n } = useTranslation();

  const getErrorMessage = (code: string): string => {
    const key = getErrorKey(code);
    return t(key);
  };

  const translateError = (error: ApiError | unknown): string => {
    // Try to get error code first
    const code = extractErrorCode(error);
    if (code) {
      const translated = getErrorMessage(code);
      // If translation key was found and translated
      if (translated && !translated.startsWith('errors.')) {
        return translated;
      }
    }

    // Fall back to error message
    const message = extractErrorMessage(error);
    if (message) {
      // Check if message is already a known pattern (e.g., from backend in Portuguese)
      // Return as-is if it seems like a user-friendly message
      if (message.length > 10 && !message.includes('Error:') && !message.includes('error')) {
        return message;
      }
    }

    // Default fallback
    return t('errors.generic');
  };

  return { translateError, getErrorMessage };
}

export default useTranslatedError;
