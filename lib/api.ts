const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export interface Property {
  id: number;
  name: string;
  ical_airbnb?: string;
  ical_booking?: string;
  employee_name: string;
  employee_phone: string;
  created_at: string;
}

export interface PropertyInput {
  name: string;
  ical_airbnb?: string;
  ical_booking?: string;
  employee_name: string;
  employee_phone: string;
}

export interface DashboardStats {
  totalProperties: number;
  messagesToday: number;
  messagesThisMonth: number;
}

export interface MessageLog {
  id: number;
  property_name: string;
  message: string;
  sent_at: string;
  status: string;
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
  message_template: string;
  send_time: string;
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

// Base fetch helper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();

  if (!text) {
    if (!response.ok) throw new Error('Erro na requisicao');
    return {} as T;
  }

  const data = JSON.parse(text);

  if (!response.ok) {
    // Criar erro com dados adicionais para o frontend tratar
    const error = new Error(data.error || 'Erro na requisicao') as Error & { code?: string; response?: { data: typeof data } };
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

// Dashboard
export async function getStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/dashboard/stats');
}

export async function getLogs(): Promise<MessageLog[]> {
  return apiFetch<MessageLog[]>('/logs');
}

export async function runWorker(): Promise<void> {
  await apiFetch<void>('/dashboard/run-worker', { method: 'POST' });
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
  return apiFetch<ReservationsResponse>(`/reservations${query ? `?${query}` : ''}`);
}

export async function getReservationsToday(): Promise<TodayReservations> {
  return apiFetch<TodayReservations>('/reservations/today');
}

export async function getReservationsUpcoming(): Promise<Reservation[]> {
  return apiFetch<Reservation[]>('/reservations/upcoming');
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
    guests: number;
    reservations: number;
    whatsappInstances: number;
  };
}

export interface ProfileStats {
  properties: { count: number; limit: number; percentage: number };
  reservations: { active: number; upcomingCheckins: number };
  guests: { total: number };
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

export { API_URL };
