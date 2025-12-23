import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import * as api from './api';
import type { Property, DashboardStats, WhatsAppStatus, Settings, Subscription, Reservation } from './api';

// ============================================
// TYPES
// ============================================

interface DashboardState {
  // Properties
  properties: Property[];
  propertiesLoading: boolean;
  propertiesError: string | null;

  // Stats
  stats: DashboardStats;

  // WhatsApp
  whatsapp: WhatsAppStatus;

  // Settings
  settings: Settings;

  // Subscription
  subscription: Subscription | null;

  // Reservations
  upcomingCheckouts: Reservation[];

  // Global
  isLoading: boolean;
}

interface DashboardActions {
  // Properties
  refreshProperties: () => Promise<void>;
  createProperty: (data: api.PropertyInput) => Promise<Property>;
  updateProperty: (id: number, data: Partial<api.PropertyInput>) => Promise<Property>;
  deleteProperty: (id: number) => Promise<void>;
  toggleCheckoutAuto: (id: number, enabled: boolean, phone?: string, time?: string) => Promise<void>;

  // Settings
  refreshSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;

  // WhatsApp
  refreshWhatsApp: () => Promise<void>;

  // Subscription
  refreshSubscription: () => Promise<void>;

  // Global
  refreshAll: () => Promise<void>;
}

type DashboardContextType = DashboardState & DashboardActions;

// ============================================
// CONTEXT
// ============================================

const DashboardContext = createContext<DashboardContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  // State
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ totalProperties: 0, messagesToday: 0, messagesThisMonth: 0 });
  const [whatsapp, setWhatsapp] = useState<WhatsAppStatus>({ configured: false, connected: false });
  const [settings, setSettings] = useState<Settings>({});
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [upcomingCheckouts, setUpcomingCheckouts] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // ACTIONS
  // ============================================

  const refreshProperties = useCallback(async () => {
    setPropertiesLoading(true);
    setPropertiesError(null);
    try {
      const data = await api.getProperties();
      setProperties(data);
    } catch (err: any) {
      setPropertiesError(err.message || 'Erro ao carregar imóveis');
    } finally {
      setPropertiesLoading(false);
    }
  }, []);

  const createProperty = useCallback(async (data: api.PropertyInput): Promise<Property> => {
    const property = await api.createProperty(data);
    setProperties(prev => [property, ...prev]);
    setStats(prev => ({ ...prev, totalProperties: prev.totalProperties + 1 }));
    return property;
  }, []);

  const updateProperty = useCallback(async (id: number, data: Partial<api.PropertyInput>): Promise<Property> => {
    const property = await api.updateProperty(id, data);
    setProperties(prev => prev.map(p => p.id === id ? property : p));
    return property;
  }, []);

  const deleteProperty = useCallback(async (id: number): Promise<void> => {
    await api.deleteProperty(id);
    setProperties(prev => prev.filter(p => p.id !== id));
    setStats(prev => ({ ...prev, totalProperties: Math.max(0, prev.totalProperties - 1) }));
  }, []);

  const toggleCheckoutAuto = useCallback(async (
    id: number,
    enabled: boolean,
    phone?: string,
    time?: string
  ): Promise<void> => {
    const updated = await api.updatePropertyCheckoutAuto(id, { enabled, phone, time });
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    }
  }, []);

  const updateSettingsAction = useCallback(async (newSettings: Partial<Settings>) => {
    await api.updateSettings(newSettings);
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const refreshWhatsApp = useCallback(async () => {
    try {
      const status = await api.getWhatsAppStatus();
      setWhatsapp(status);
    } catch (err) {
      console.error('Erro ao carregar status WhatsApp:', err);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const sub = await api.getSubscription();
      setSubscription(sub);
    } catch (err) {
      console.error('Erro ao carregar assinatura:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propsData, statsData, settingsData, whatsappData, subData, checkoutsData] = await Promise.all([
        api.getProperties().catch(() => []),
        api.getStats().catch(() => ({ totalProperties: 0, messagesToday: 0, messagesThisMonth: 0 })),
        api.getSettings().catch(() => ({})),
        api.getWhatsAppStatus().catch(() => ({ configured: false, connected: false })),
        api.getSubscription().catch(() => null),
        api.getUpcomingCheckouts().catch(() => [])
      ]);

      setProperties(propsData);
      setStats(statsData);
      setSettings(settingsData);
      setWhatsapp(whatsappData);
      setSubscription(subData);
      setUpcomingCheckouts(checkoutsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
      setPropertiesLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ============================================
  // VALUE
  // ============================================

  const value: DashboardContextType = {
    // State
    properties,
    propertiesLoading,
    propertiesError,
    stats,
    whatsapp,
    settings,
    subscription,
    upcomingCheckouts,
    isLoading,

    // Actions
    refreshProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    toggleCheckoutAuto,
    refreshSettings,
    updateSettings: updateSettingsAction,
    refreshWhatsApp,
    refreshSubscription,
    refreshAll
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardContext;
