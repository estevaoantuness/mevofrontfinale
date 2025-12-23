import React, { useMemo, useState } from 'react';
import { Calculator, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { Property } from '../../lib/api';
import { getPropertyPricingConfig, updatePropertyPricingConfig } from '../../lib/api';
import type { PropertyPricingConfigInput } from '../../lib/pricing';
import { getEffectiveHolidayValue } from '../../lib/pricing';

const HOLIDAY_MULTIPLIERS = [1.5, 1.75, 2];
const ANNUAL_ADJUSTMENTS = [0, 5, 10, 15];

const defaultForm: PropertyPricingConfigInput = {
  minValue: 0,
  weekdayNormalValue: 0,
  weekendValue: 0,
  holidayValueManual: null,
  holidayMultiplier: 1.5,
  annualAdjustmentPercent: 5,
  applyMonthlyAdjustment: false,
  applyMonthlyCostsToCalendar: false
};

type PricingTabProps = {
  properties: Property[];
};

export const PricingTab: React.FC<PricingTabProps> = ({ properties }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [useManualHolidayValue, setUseManualHolidayValue] = useState(false);
  const [form, setForm] = useState<PropertyPricingConfigInput>(defaultForm);

  const pricingSummary = useMemo(() => {
    const holidayValue = getEffectiveHolidayValue({
      ...form,
      holidayValueManual: useManualHolidayValue ? form.holidayValueManual ?? null : null,
      propertyId: selectedProperty ? String(selectedProperty.id) : '0'
    });

    return {
      minValue: form.minValue,
      weekdayNormalValue: form.weekdayNormalValue,
      weekendValue: form.weekendValue,
      holidayValue
    };
  }, [form, selectedProperty, useManualHolidayValue]);

  const openPricing = async (property: Property) => {
    setSelectedProperty(property);
    setIsOpen(true);
    setError('');
    setLoading(true);
    try {
      const config = await getPropertyPricingConfig(property.id);
      setForm({
        minValue: config.minValue || 0,
        weekdayNormalValue: config.weekdayNormalValue || 0,
        weekendValue: config.weekendValue || 0,
        holidayValueManual: config.holidayValueManual ?? null,
        holidayMultiplier: config.holidayMultiplier || 1.5,
        annualAdjustmentPercent: config.annualAdjustmentPercent ?? 5,
        applyMonthlyAdjustment: config.applyMonthlyAdjustment ?? false,
        applyMonthlyCostsToCalendar: config.applyMonthlyCostsToCalendar ?? false
      });
      setUseManualHolidayValue(!!(config.holidayValueManual && config.holidayValueManual > 0));
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar precificação');
      setForm(defaultForm);
      setUseManualHolidayValue(false);
    } finally {
      setLoading(false);
    }
  };

  const closePricing = () => {
    setIsOpen(false);
    setSelectedProperty(null);
    setError('');
    setSaving(false);
    setLoading(false);
    setForm(defaultForm);
    setUseManualHolidayValue(false);
  };

  const toInt = (value: string) => {
    if (!value) return 0;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const handleSave = async () => {
    if (!selectedProperty) return;
    if (form.minValue <= 0 || form.weekdayNormalValue <= 0 || form.weekendValue <= 0) {
      setError('Preencha os valores mínimos, normal e de fim de semana.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload: PropertyPricingConfigInput = {
        ...form,
        holidayValueManual: useManualHolidayValue ? form.holidayValueManual ?? null : null
      };
      await updatePropertyPricingConfig(selectedProperty.id, payload);
      closePricing();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar precificação');
    } finally {
      setSaving(false);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-8 text-center">
        <Calculator className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">Cadastre um imóvel para definir a precificação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white">Precificação por imóvel</h3>
        <p className="text-sm text-slate-500">Defina valores base e regras de reajuste para cada imóvel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {properties.map(property => (
          <div
            key={property.id}
            className="bg-[#0B0C15] border border-white/10 rounded-xl p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-white font-medium">{property.name}</p>
              <p className="text-xs text-slate-500">Configuração individual de preços</p>
            </div>
            <Button variant="secondary" onClick={() => openPricing(property)}>
              Configurar
            </Button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closePricing}
        title={selectedProperty ? `Precificação - ${selectedProperty.name}` : 'Precificação'}
      >
        {loading ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Diária mínima aceitável (R$)</label>
                <input
                  type="number"
                  min="0"
                  value={form.minValue}
                  onChange={e => setForm({ ...form, minValue: toInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Diária seg–qui (R$)</label>
                <input
                  type="number"
                  min="0"
                  value={form.weekdayNormalValue}
                  onChange={e => setForm({ ...form, weekdayNormalValue: toInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Diária sex–dom (R$)</label>
                <input
                  type="number"
                  min="0"
                  value={form.weekendValue}
                  onChange={e => setForm({ ...form, weekendValue: toInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Multiplicador de datas especiais</label>
                <select
                  value={form.holidayMultiplier}
                  onChange={e => setForm({ ...form, holidayMultiplier: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {HOLIDAY_MULTIPLIERS.map(multiplier => (
                    <option key={multiplier} value={multiplier}>{multiplier}x</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Reajuste anual (%)</label>
                <select
                  value={form.annualAdjustmentPercent}
                  onChange={e => setForm({ ...form, annualAdjustmentPercent: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {ANNUAL_ADJUSTMENTS.map(percent => (
                    <option key={percent} value={percent}>{percent}%</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={useManualHolidayValue}
                  onChange={e => {
                    const enabled = e.target.checked;
                    setUseManualHolidayValue(enabled);
                    if (!enabled) {
                      setForm(prev => ({ ...prev, holidayValueManual: null }));
                    }
                  }}
                  className="h-4 w-4 rounded border border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/40"
                />
                Definir valor específico para datas especiais
              </label>

              {useManualHolidayValue && (
                <input
                  type="number"
                  min="0"
                  placeholder="Valor caríssimo (R$)"
                  value={form.holidayValueManual ?? ''}
                  onChange={e => setForm({ ...form, holidayValueManual: toInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.applyMonthlyAdjustment}
                  onChange={e => setForm({ ...form, applyMonthlyAdjustment: e.target.checked })}
                  className="h-4 w-4 rounded border border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/40"
                />
                Aplicar correção automaticamente todo mês
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.applyMonthlyCostsToCalendar}
                  onChange={e => setForm({ ...form, applyMonthlyCostsToCalendar: e.target.checked })}
                  className="h-4 w-4 rounded border border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/40"
                />
                Adicionar custos mensais no calendário deste imóvel
              </label>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-slate-300">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Resumo calculado</span>
              </div>
              <p>
                Mínimo: R$ {pricingSummary.minValue}, Normal (seg–qui): R$ {pricingSummary.weekdayNormalValue}, Fim de semana: R$ {pricingSummary.weekendValue}, Datas especiais: R$ {pricingSummary.holidayValue}.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closePricing}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PricingTab;
