// Mapeamento de codigos de erro do backend para chaves i18n
export const ERROR_CODE_MAP: Record<string, string> = {
  // Auth errors
  'INVALID_CREDENTIALS': 'errors.auth.invalidCredentials',
  'USER_NOT_FOUND': 'errors.auth.userNotFound',
  'EMAIL_ALREADY_EXISTS': 'errors.auth.emailExists',
  'WEAK_PASSWORD': 'errors.auth.weakPassword',
  'TOKEN_EXPIRED': 'errors.auth.tokenExpired',
  'TOKEN_INVALID': 'errors.auth.tokenInvalid',
  'EMAIL_NOT_VERIFIED': 'errors.auth.emailNotVerified',

  // Subscription errors
  'SUBSCRIPTION_REQUIRED': 'errors.subscription.required',
  'SUBSCRIPTION_INACTIVE': 'errors.subscription.inactive',
  'PROPERTY_LIMIT_REACHED': 'errors.subscription.propertyLimit',
  'FREE_LIMIT_REACHED': 'errors.subscription.freeLimit',
  'TRIAL_ALREADY_USED': 'errors.subscription.trialAlreadyUsed',
  'FEATURE_NOT_AVAILABLE': 'errors.subscription.featureNotAvailable',

  // Property errors
  'PROPERTY_NOT_FOUND': 'errors.property.notFound',
  'ICAL_INVALID': 'errors.property.icalInvalid',
  'SYNC_FAILED': 'errors.property.syncFailed',

  // WhatsApp errors
  'WHATSAPP_NOT_CONNECTED': 'errors.whatsapp.notConnected',
  'WHATSAPP_SEND_FAILED': 'errors.whatsapp.sendFailed',

  // Generic errors
  'NETWORK_ERROR': 'errors.network',
  'SERVER_ERROR': 'errors.generic',
  'UNKNOWN_ERROR': 'errors.generic',
  'VALIDATION_ERROR': 'errors.validation.required',
  'UNAUTHORIZED': 'errors.unauthorized',
  'NOT_FOUND': 'errors.notFound',
};

// Helper function to get i18n key from error code
export function getErrorKey(code: string): string {
  return ERROR_CODE_MAP[code] || 'errors.generic';
}

// Type for API error response
export interface ApiError {
  code?: string;
  message?: string;
  error?: string;
  response?: {
    data?: {
      code?: string;
      error?: string;
      message?: string;
    };
  };
}

// Extract error code from various error formats
export function extractErrorCode(error: ApiError | unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  const err = error as ApiError;

  // Direct code property
  if (err.code) return err.code;

  // Axios-style response
  if (err.response?.data?.code) return err.response.data.code;

  return null;
}

// Extract error message from various error formats
export function extractErrorMessage(error: ApiError | unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  const err = error as ApiError;

  // Direct message property
  if (err.message) return err.message;

  // Direct error property
  if (err.error) return err.error;

  // Axios-style response
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.message) return err.response.data.message;

  return null;
}
