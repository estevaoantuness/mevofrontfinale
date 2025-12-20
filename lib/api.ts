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
    throw new Error(data.error || 'Erro na requisicao');
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

export { API_URL };
