import type { PropertyPricingConfig, PropertyPricingConfigInput } from './pricing';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  emailVerified?: boolean;
  emailVerifiedAt?: string;
}

export interface Property {
  id: number;
  name: string;
  ical_airbnb?: string;
  ical_booking?: string;
  employee_name?: string;
  employee_phone?: string;
  employee_id?: number;
  checkout_time?: string;
  // Checkout Auto Config
  checkout_auto_enabled: boolean;
  checkout_notify_phone?: string;
  checkout_notify_time?: string;
  created_at: string;
}

export interface PropertyInput {
  name: string;
  ical_airbnb?: string;
  ical_booking?: string;
  employee_name?: string;
  employee_phone?: string;
  employee_id?: number;
}

export interface DashboardStats {
  totalProperties: number;
  messagesToday: number;
  messagesThisMonth: number;
}

export interface Guest {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface Reservation {
  id: number;
  propertyId: number;
  guestId?: number;
  checkinDate: string;
  checkoutDate: string;
  checkinTime?: string;
  checkoutTime?: string;
  welcomeMessageSent?: boolean;
  checkinReminderSent?: boolean;
  checkoutReminderSent?: boolean;
  reviewRequestSent?: boolean;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  source?: string;
  externalId?: string;
  notes?: string;
  totalAmount?: number;
  property?: { id: number; name: string };
  guest?: Guest;
  createdAt: string;
}

export interface ReservationsResponse {
  reservations: Reservation[];
  total: number;
  limit: number;
  offset: number;
}

export interface TodayReservations {
  checkins: Reservation[];
  checkouts: Reservation[];
}

export interface Settings {
  // Mensagens (legado)
  message_template?: string;
  send_time?: string;

  // Horarios Padrao
  default_checkin_time?: string;
  default_checkout_time?: string;
  cleaning_buffer_minutes?: string;

  // Notificacoes
  checkin_reminder_hours?: string;
  review_request_days?: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;

  // Automacao
  auto_create_guests?: string;
  auto_send_welcome?: string;
  auto_send_reminders?: string;

  // Allow any string key
  [key: string]: string | undefined;
}

export interface WhatsAppStatus {
  configured: boolean;
  connected: boolean;
  phone?: string;
  connectedAt?: string;
  instance?: string;
  state?: string;
  message?: string;
  error?: string;
}

export interface WhatsAppQRResponse {
  connected: boolean;
  qr?: string;
  code?: string;
  pairingCode?: string;
  phone?: string;
  message?: string;
}

export interface ApiHealth {
  status: string;
  timestamp: string;
  whatsapp?: WhatsAppStatus;
}

// Token management
const getToken = () => localStorage.getItem('mevo_token');
const setToken = (token: string) => localStorage.setItem('mevo_token', token);
const removeToken = () => localStorage.removeItem('mevo_token');

// Normalize reservation payloads to keep backward compatibility in UI
const normalizeReservation = (reservation: Reservation): Reservation => ({
  ...reservation,
  guestName: reservation.guestName ?? reservation.guest?.name,
  guestEmail: reservation.guestEmail ?? reservation.guest?.email,
  guestPhone: reservation.guestPhone ?? reservation.guest?.phone
});

const normalizeReservationList = (reservations: Reservation[]) =>
  reservations.map(normalizeReservation);

// Base fetch helper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (networkError) {
    // Network error (offline, CORS, server unreachable)
    const error = new Error('Erro de conexão. Verifique sua internet e tente novamente.') as Error & { code?: string };
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  const text = await response.text();

  if (!text) {
    if (!response.ok) {
      const error = new Error('Erro na requisição') as Error & { code?: string };
      error.code = 'SERVER_ERROR';
      throw error;
    }
    return {} as T;
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    const error = new Error('Resposta inválida do servidor') as Error & { code?: string };
    error.code = 'SERVER_ERROR';
    throw error;
  }

  if (!response.ok) {
    // Criar erro com dados adicionais para o frontend tratar
    const error = new Error(data.error || 'Erro na requisição') as Error & { code?: string; response?: { data: typeof data } };
    error.code = data.code;
    error.response = { data };
    throw error;
  }

  return data as T;
}

// Auth
export async function register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await apiFetch<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setToken(response.token);
  return response;
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const response = await apiFetch<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(response.token);
  return response;
}

export function logout(): void {
  removeToken();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

export async function updateMe(data: { name?: string; email?: string; password?: string }): Promise<User> {
  return apiFetch<User>('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Properties
export async function getProperties(): Promise<Property[]> {
  return apiFetch<Property[]>('/properties');
}

export async function createProperty(data: PropertyInput): Promise<Property> {
  return apiFetch<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProperty(id: number, data: Partial<PropertyInput>): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(id: number): Promise<void> {
  await apiFetch<void>(`/properties/${id}`, { method: 'DELETE' });
}

export interface CheckoutAutoConfig {
  enabled?: boolean;
  phone?: string;
  time?: string;
}

export async function updatePropertyCheckoutAuto(
  id: number,
  config: CheckoutAutoConfig
): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}/checkout-auto`, {
    method: 'PATCH',
    body: JSON.stringify(config),
  });
}

export async function getPropertyPricingConfig(propertyId: number): Promise<PropertyPricingConfig> {
  return apiFetch<PropertyPricingConfig>(`/properties/${propertyId}/pricing-config`);
}

export async function updatePropertyPricingConfig(
  propertyId: number,
  data: PropertyPricingConfigInput
): Promise<PropertyPricingConfig> {
  return apiFetch<PropertyPricingConfig>(`/properties/${propertyId}/pricing-config`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Dashboard
export async function getStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/dashboard/stats');
}

export interface WorkerResult {
  success: boolean;
  message: string;
  details?: {
    propertiesChecked: number;
    checkoutsFound: number;
    messagesSent: number;
    messagesFailed: number;
  };
  error?: string;
}

export async function runWorker(): Promise<WorkerResult> {
  return apiFetch<WorkerResult>('/dashboard/run-worker', { method: 'POST' });
}

// Reservations
export async function getReservations(params?: {
  propertyId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ReservationsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.propertyId) searchParams.append('propertyId', params.propertyId.toString());
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());

  const query = searchParams.toString();
  const response = await apiFetch<ReservationsResponse>(`/reservations${query ? `?${query}` : ''}`);
  return {
    ...response,
    reservations: normalizeReservationList(response.reservations)
  };
}

export async function getReservationsToday(): Promise<TodayReservations> {
  const response = await apiFetch<TodayReservations>('/reservations/today');
  return {
    checkins: normalizeReservationList(response.checkins),
    checkouts: normalizeReservationList(response.checkouts)
  };
}

export async function getReservationsUpcoming(): Promise<Reservation[]> {
  const response = await apiFetch<Reservation[]>('/reservations/upcoming');
  return normalizeReservationList(response);
}

// Settings
export async function getSettings(): Promise<Settings> {
  return apiFetch<Settings>('/settings');
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await apiFetch<void>(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const promises = Object.entries(settings).map(([key, value]) =>
    updateSetting(key, String(value))
  );
  await Promise.all(promises);
}

// WhatsApp
export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  return apiFetch<WhatsAppStatus>('/whatsapp/status');
}

export async function getWhatsAppQR(): Promise<WhatsAppQRResponse> {
  return apiFetch<WhatsAppQRResponse>('/whatsapp/qr');
}

export async function disconnectWhatsApp(): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>('/whatsapp/disconnect', { method: 'POST' });
}

export async function reconnectWhatsApp(): Promise<WhatsAppQRResponse> {
  return apiFetch<WhatsAppQRResponse>('/whatsapp/reconnect', { method: 'POST' });
}

export async function testWhatsApp(phone: string, message: string): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>('/whatsapp/test', {
    method: 'POST',
    body: JSON.stringify({ phone, message }),
  });
}

export interface WhatsAppPairingCodeResponse {
  connected: boolean;
  pairingCode?: string;
  phone?: string;
  message?: string;
}

export async function getWhatsAppPairingCode(phoneNumber: string): Promise<WhatsAppPairingCodeResponse> {
  return apiFetch<WhatsAppPairingCodeResponse>('/whatsapp/pairing-code', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });
}

// Health
export async function getHealth(): Promise<ApiHealth> {
  return apiFetch<ApiHealth>('/health');
}

// Billing Types
export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  propertyLimit: number;
  features: string[];
  isPopular: boolean;
  trial: { days: number; requiresPaymentMethod: boolean } | null;
  pricing: {
    monthly: { amount: number; display: string };
    yearly: { amount: number; display: string; yearlyTotal: number };
  };
  savings: { savingsPercent: number; savingsAmount: number };
}

export interface Subscription {
  id?: string;
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive';
  billingInterval?: 'monthly' | 'yearly';
  propertyLimit: number;
  propertyCount: number;
  propertyUsagePercent?: number;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  hasStripeSubscription?: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  amountFormatted: string;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  invoiceUrl?: string;
  invoicePdf?: string;
  paidAt?: string;
  createdAt: string;
}

export interface UsageStats {
  properties: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  reservationsThisMonth: number;
  messagesThisMonth: number;
  currentPlan: string;
}

// Billing API
export async function getPlans(): Promise<BillingPlan[]> {
  return apiFetch<BillingPlan[]>('/billing/plans');
}

export async function getSubscription(): Promise<Subscription> {
  return apiFetch<Subscription>('/billing/subscription');
}

export async function createCheckout(planId: string, interval: 'monthly' | 'yearly'): Promise<{ checkoutUrl: string; sessionId: string }> {
  return apiFetch<{ checkoutUrl: string; sessionId: string }>('/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ planId, interval }),
  });
}

export async function openBillingPortal(): Promise<{ portalUrl: string }> {
  return apiFetch<{ portalUrl: string }>('/billing/portal', { method: 'POST' });
}

export async function cancelSubscription(immediately = false): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/billing/cancel', {
    method: 'POST',
    body: JSON.stringify({ immediately }),
  });
}

export async function reactivateSubscription(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/billing/reactivate', { method: 'POST' });
}

export async function getInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>('/billing/invoices');
}

export async function getUsage(): Promise<UsageStats> {
  return apiFetch<UsageStats>('/billing/usage');
}

// Profile Types
export interface Profile {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  whatsappConnected: boolean;
  whatsappPhone?: string;
  subscription?: {
    planId: string;
    planName: string;
    status: string;
    propertyLimit: number;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
    features: string[];
  };
  stats: {
    properties: number;
    employees: number;
    reservations: number;
    whatsappInstances: number;
  };
}

export interface ProfileStats {
  properties: { count: number; limit: number; percentage: number };
  reservations: { active: number; upcomingCheckins: number };
  employees: { total: number };
  messages: { thisMonth: number; thisWeek: number };
  subscription: {
    plan: string;
    status: string;
    trialEndsAt?: string;
    daysRemaining?: number;
  };
}

// Profile API
export async function getProfile(): Promise<Profile> {
  return apiFetch<Profile>('/profile');
}

export async function updateProfile(data: { name?: string; phone?: string }): Promise<Profile> {
  return apiFetch<Profile>('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getProfileStats(): Promise<ProfileStats> {
  return apiFetch<ProfileStats>('/profile/stats');
}

export async function deleteAccount(confirmation: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/profile', {
    method: 'DELETE',
    body: JSON.stringify({ confirmation }),
  });
}

// User Preferences
export interface UserPreferences {
  theme: 'dark' | 'light';
  language: 'pt-BR' | 'en' | 'es-419';
}

export async function getPreferences(): Promise<UserPreferences> {
  return apiFetch<UserPreferences>('/profile/preferences');
}

export async function updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
  return apiFetch<UserPreferences>('/profile/preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Email Verification Types
export interface VerificationStatus {
  verified: boolean;
  verifiedAt?: string;
  email: string;
}

export interface TrialActivationResponse {
  success: boolean;
  message: string;
  subscription: {
    id: number;
    planId: string;
    planName: string;
    status: string;
    propertyLimit: number;
    trialEndsAt: string;
    daysRemaining: number;
  };
}

// Email Verification API
export async function sendVerificationEmail(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/send-verification', { method: 'POST' });
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/auth/verify-email?token=${token}`);
}

export async function getVerificationStatus(): Promise<VerificationStatus> {
  return apiFetch<VerificationStatus>('/auth/verification-status');
}

// Trial API
export async function activateTrial(): Promise<TrialActivationResponse> {
  return apiFetch<TrialActivationResponse>('/billing/activate-trial', { method: 'POST' });
}

// Password Reset API
export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function verifyResetToken(token: string): Promise<{ valid: boolean; error?: string }> {
  return apiFetch<{ valid: boolean; error?: string }>(`/auth/verify-reset-token?token=${token}`);
}

// Message Templates Types
export interface MessageTemplate {
  id: number;
  name: string;
  type: string;
  channel: string;
  subject?: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  userId?: number;
}

export interface TemplateType {
  value: string;
  label: string;
  description: string;
}

export interface Placeholder {
  placeholder: string;
  description: string;
}

// Message Templates API
export async function getTemplates(params?: { type?: string; channel?: string; isActive?: boolean }): Promise<MessageTemplate[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append('type', params.type);
  if (params?.channel) searchParams.append('channel', params.channel);
  if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
  const query = searchParams.toString();
  return apiFetch<MessageTemplate[]>(`/templates${query ? `?${query}` : ''}`);
}

export async function getTemplateTypes(): Promise<TemplateType[]> {
  return apiFetch<TemplateType[]>('/templates/types');
}

export async function getPlaceholders(): Promise<Placeholder[]> {
  return apiFetch<Placeholder[]>('/templates/placeholders');
}

export async function createTemplate(data: Partial<MessageTemplate>): Promise<MessageTemplate> {
  return apiFetch<MessageTemplate>('/templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTemplate(id: number, data: Partial<MessageTemplate>): Promise<MessageTemplate> {
  return apiFetch<MessageTemplate>(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTemplate(id: number): Promise<void> {
  await apiFetch<void>(`/templates/${id}`, { method: 'DELETE' });
}

export async function previewTemplate(id: number, data?: object): Promise<{ subject?: string; content: string }> {
  return apiFetch<{ subject?: string; content: string }>(`/templates/${id}/preview`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function duplicateTemplate(id: number): Promise<MessageTemplate> {
  return apiFetch<MessageTemplate>(`/templates/${id}/duplicate`, { method: 'POST' });
}

// Guests Types
export interface GuestFull {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  document?: string;
  documentType?: string;
  nationality?: string;
  notes?: string;
  preferredLanguage?: string;
  isActive: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  reservations?: Reservation[];
  properties?: { id: number; name: string }[];
}

export interface GuestsResponse {
  guests: GuestFull[];
  total: number;
  limit: number;
  offset: number;
}

export interface GuestReservationsResponse {
  reservations: Reservation[];
  total: number;
  limit: number;
  offset: number;
}

// Guests API
export async function getGuests(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<GuestsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.append('search', params.search);
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  const query = searchParams.toString();
  return apiFetch<GuestsResponse>(`/guests${query ? `?${query}` : ''}`);
}

export async function getGuest(id: number): Promise<GuestFull> {
  return apiFetch<GuestFull>(`/guests/${id}`);
}

export async function createGuest(data: Partial<GuestFull>): Promise<GuestFull> {
  return apiFetch<GuestFull>('/guests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateGuest(id: number, data: Partial<GuestFull>): Promise<GuestFull> {
  return apiFetch<GuestFull>(`/guests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteGuest(id: number): Promise<void> {
  await apiFetch<void>(`/guests/${id}`, { method: 'DELETE' });
}

export async function getGuestReservations(id: number, params?: {
  limit?: number;
  offset?: number;
}): Promise<GuestReservationsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.offset) searchParams.append('offset', params.offset.toString());
  const query = searchParams.toString();
  const response = await apiFetch<GuestReservationsResponse>(`/guests/${id}/reservations${query ? `?${query}` : ''}`);
  return {
    ...response,
    reservations: normalizeReservationList(response.reservations)
  };
}

// Holidays Types
export interface Holiday {
  date: string;
  year: number;
  month: number;
  day: number;
  name: string;
  type: 'national' | 'carnival' | 'optional';
}

export interface FixedHoliday {
  month: number;
  day: number;
  name: string;
  type: string;
}

export interface HighSeasonPeriod {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  name: string;
  multiplier: number;
}

export interface HolidaysResponse {
  holidays: Holiday[];
  fixedHolidays: FixedHoliday[];
  highSeasonPeriods: HighSeasonPeriod[];
}

export interface CalendarDay {
  date: string;
  day: number;
  dayOfWeek: number;
  dayName: string;
  price: number;
  priceType: 'holiday' | 'highSeason' | 'weekend' | 'weekday';
  priceReason: string;
  isHoliday: boolean;
  holidayName: string | null;
  isWeekend: boolean;
}

export interface CalendarPricingResponse {
  propertyId: number;
  propertyName: string;
  month: number;
  year: number;
  hasPricingConfig: boolean;
  pricingConfig: {
    minValue: number;
    weekdayNormalValue: number;
    weekendValue: number;
    holidayValue: number;
  } | null;
  calendar: CalendarDay[];
}

// Holidays API
export async function getHolidays(params?: { year?: number; startYear?: number; endYear?: number }): Promise<HolidaysResponse> {
  const searchParams = new URLSearchParams();
  if (params?.year) searchParams.append('year', params.year.toString());
  if (params?.startYear) searchParams.append('startYear', params.startYear.toString());
  if (params?.endYear) searchParams.append('endYear', params.endYear.toString());
  const query = searchParams.toString();
  return apiFetch<HolidaysResponse>(`/holidays${query ? `?${query}` : ''}`);
}

export async function getCalendarPricing(propertyId: number, month: number, year: number): Promise<CalendarPricingResponse> {
  return apiFetch<CalendarPricingResponse>(`/holidays/calendar/${propertyId}?month=${month}&year=${year}`);
}

export { API_URL };
