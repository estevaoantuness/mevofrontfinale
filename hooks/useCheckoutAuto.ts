import { useState, useCallback } from 'react';
import { useDashboard } from '../lib/DashboardContext';
import type { Property } from '../lib/api';

interface CheckoutAutoState {
  configModalOpen: boolean;
  selectedProperty: Property | null;
  saving: boolean;
  error: string | null;
}

export const useCheckoutAuto = () => {
  const { properties, toggleCheckoutAuto, refreshProperties } = useDashboard();

  const [state, setState] = useState<CheckoutAutoState>({
    configModalOpen: false,
    selectedProperty: null,
    saving: false,
    error: null
  });

  // Open config modal for a property
  const openConfig = useCallback((property: Property) => {
    setState(prev => ({
      ...prev,
      configModalOpen: true,
      selectedProperty: property,
      error: null
    }));
  }, []);

  // Close config modal
  const closeConfig = useCallback(() => {
    setState(prev => ({
      ...prev,
      configModalOpen: false,
      selectedProperty: null,
      error: null
    }));
  }, []);

  // Toggle checkout auto on/off
  const toggle = useCallback(async (property: Property, enabled: boolean) => {
    setState(prev => ({ ...prev, saving: true, error: null }));

    try {
      // If enabling and no phone, open config modal instead
      if (enabled && !property.checkout_notify_phone) {
        setState(prev => ({
          ...prev,
          saving: false,
          configModalOpen: true,
          selectedProperty: property
        }));
        return;
      }

      await toggleCheckoutAuto(property.id, enabled);
      setState(prev => ({ ...prev, saving: false }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: err.message || 'Erro ao atualizar configuração'
      }));
    }
  }, [toggleCheckoutAuto]);

  // Save checkout auto config
  const saveConfig = useCallback(async (
    propertyId: number,
    phone: string,
    time: string,
    enabled: boolean = true
  ) => {
    setState(prev => ({ ...prev, saving: true, error: null }));

    try {
      await toggleCheckoutAuto(propertyId, enabled, phone, time);
      setState(prev => ({
        ...prev,
        saving: false,
        configModalOpen: false,
        selectedProperty: null
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: err.message || 'Erro ao salvar configuração'
      }));
      throw err;
    }
  }, [toggleCheckoutAuto]);

  // Get properties with checkout auto status
  const propertiesWithStatus = properties.map(p => ({
    ...p,
    hasIcal: !!(p.ical_airbnb || p.ical_booking),
    canEnable: !!(p.ical_airbnb || p.ical_booking),
    isConfigured: !!p.checkout_notify_phone,
    status: getPropertyStatus(p)
  }));

  return {
    properties: propertiesWithStatus,
    ...state,
    openConfig,
    closeConfig,
    toggle,
    saveConfig,
    refreshProperties
  };
};

// Helper to get property status
function getPropertyStatus(property: Property): 'active' | 'inactive' | 'unconfigured' | 'no_ical' {
  const hasIcal = !!(property.ical_airbnb || property.ical_booking);

  if (!hasIcal) return 'no_ical';
  if (!property.checkout_notify_phone) return 'unconfigured';
  if (!property.checkout_auto_enabled) return 'inactive';
  return 'active';
}

export default useCheckoutAuto;
