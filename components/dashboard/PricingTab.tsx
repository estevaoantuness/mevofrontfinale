import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, CheckCircle, Loader2, DollarSign, Calendar, TrendingUp, Settings2, Lock, Sparkles, Zap, Brain, ArrowRight, Plus, Trash2, Sun } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useTheme } from '../../lib/ThemeContext';
import { useToast } from '../ui/ToastContext';
import type { Property, Subscription } from '../../lib/api';
import { getPropertyPricingConfig, updatePropertyPricingConfig, createCheckout } from '../../lib/api';
import type { PropertyPricingConfigInput, CustomSeason } from '../../lib/pricing';
import { getEffectiveHolidayValue } from '../../lib/pricing';

const HOLIDAY_MULTIPLIERS = [1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const ANNUAL_ADJUSTMENTS = [0, 3, 5, 7, 10, 12, 15, 20, 25, 30];
const SEASON_MULTIPLIERS = [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.75, 2, 2.25, 2.5, 3];

// Temporadas padrão do sistema
const DEFAULT_SEASONS: CustomSeason[] = [
  { name: 'Alta Temporada Verão', startMonth: 12, startDay: 15, endMonth: 2, endDay: 28, multiplier: 1.75 },
  { name: 'Réveillon', startMonth: 12, startDay: 26, endMonth: 1, endDay: 5, multiplier: 2 },
  { name: 'Férias de Julho', startMonth: 7, startDay: 10, endMonth: 7, endDay: 25, multiplier: 1.3 }
];

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

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
  subscription: Subscription | null;
};

// Paywall overlay component - mostra blur sobre o conteúdo
const PricingPaywall: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: 'pro' | 'agency') => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createCheckout(plan, 'monthly');
      window.location.href = checkoutUrl;
    } catch (err) {
      setLoading(false);
      showError(t('notifications.error.checkoutStart'));
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      {/* Blur overlay */}
      <div className={`absolute inset-0 backdrop-blur-sm ${
        isDark ? 'bg-black/70' : 'bg-white/70'
      }`} />

      {/* Content */}
      <div className={`relative z-10 max-w-md mx-4 rounded-2xl p-8 text-center shadow-2xl ${
        isDark
          ? 'bg-gradient-to-b from-[#0B0C15] to-[#050509] border border-white/10'
          : 'bg-white border border-slate-200'
      }`}>
        {/* Glow effect */}
        {isDark && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        )}

        {/* Icon */}
        <div className={`relative w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
          isDark
            ? 'bg-gradient-to-br from-purple-500 to-blue-600'
            : 'bg-gradient-to-br from-purple-500 to-blue-600'
        }`}>
          <Brain className="w-10 h-10 text-white" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Calculadora Inteligente de Preços
        </h3>

        {/* Description */}
        <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Nossa calculadora usa <strong className={isDark ? 'text-purple-400' : 'text-purple-600'}>inteligência artificial</strong> para
          otimizar automaticamente seus preços com base em feriados, alta temporada,
          demanda do mercado e concorrência — maximizando sua receita sem esforço.
        </p>

        {/* Features */}
        <div className={`rounded-xl p-4 mb-6 text-left ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'
        }`}>
          <div className="space-y-3">
            {[
              { icon: Zap, text: 'Precificação dinâmica automática' },
              { icon: Calendar, text: 'Feriados e alta temporada integrados' },
              { icon: TrendingUp, text: 'Reajuste inteligente mês a mês' },
              { icon: Calculator, text: 'Cálculo otimizado por imóvel' }
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <Icon className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 ${
          isDark
            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            : 'bg-purple-50 text-purple-600 border border-purple-200'
        }`}>
          <Lock className="w-3 h-3" />
          Disponível nos planos Pro e Agency
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full h-12 text-base bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            onClick={() => handleUpgrade('pro')}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Fazer Upgrade para Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            A partir de R$ 67/mês • Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  );
};

export const PricingTab: React.FC<PricingTabProps> = ({ properties, subscription }) => {
  const { isDark } = useTheme();

  // Check if user has access (PAID pro or agency plan only)
  // Free users have: planId='starter', status='inactive'
  // Trial users have: planId='pro', status='trialing' - NO ACCESS (can only preview with blur)
  // Paid users have: planId='pro'|'agency', status='active' - FULL ACCESS
  const isActivePaid = subscription?.status === 'active';
  const isProOrAgency = subscription?.planId === 'pro' || subscription?.planId === 'agency';
  const hasAccess = Boolean(isActivePaid && isProOrAgency);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [useManualHolidayValue, setUseManualHolidayValue] = useState(false);
  const [form, setForm] = useState<PropertyPricingConfigInput>(defaultForm);
  const [useCustomSeasons, setUseCustomSeasons] = useState(false);
  const [customSeasons, setCustomSeasons] = useState<CustomSeason[]>([]);

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
      // Carregar temporadas customizadas
      if (config.customSeasons && Array.isArray(config.customSeasons) && config.customSeasons.length > 0) {
        setUseCustomSeasons(true);
        setCustomSeasons(config.customSeasons as CustomSeason[]);
      } else {
        setUseCustomSeasons(false);
        setCustomSeasons([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar configuração da calculadora');
      setForm(defaultForm);
      setUseManualHolidayValue(false);
      setUseCustomSeasons(false);
      setCustomSeasons([]);
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
    setUseCustomSeasons(false);
    setCustomSeasons([]);
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
        holidayValueManual: useManualHolidayValue ? form.holidayValueManual ?? null : null,
        customSeasons: useCustomSeasons && customSeasons.length > 0 ? customSeasons : null
      };
      await updatePropertyPricingConfig(selectedProperty.id, payload);
      closePricing();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configuração da calculadora');
    } finally {
      setSaving(false);
    }
  };

  // Funções para gerenciar temporadas
  const addSeason = () => {
    setCustomSeasons([
      ...customSeasons,
      { name: '', startMonth: 1, startDay: 1, endMonth: 1, endDay: 31, multiplier: 1.5 }
    ]);
  };

  const removeSeason = (index: number) => {
    setCustomSeasons(customSeasons.filter((_, i) => i !== index));
  };

  const updateSeason = (index: number, field: keyof CustomSeason, value: string | number) => {
    const updated = [...customSeasons];
    updated[index] = { ...updated[index], [field]: value };
    setCustomSeasons(updated);
  };

  // Styled input component for consistency
  const PricingInput = ({ label, value, onChange, placeholder, icon: Icon }: {
    label: string;
    value: number | string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    icon?: React.ElementType;
  }) => (
    <div>
      <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <Icon size={16} />
          </div>
        )}
        <input
          type="number"
          min="0"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            Icon ? 'pl-10' : ''
          } ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white placeholder-slate-500'
              : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
          }`}
        />
      </div>
    </div>
  );

  // Styled select component
  const PricingSelect = ({ label, value, onChange, options }: {
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: number; label: string }[];
  }) => (
    <div>
      <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          isDark
            ? 'bg-white/5 border border-white/10 text-white'
            : 'bg-slate-50 border border-slate-200 text-slate-900'
        }`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className={isDark ? 'bg-slate-800' : 'bg-white'}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  // Styled checkbox component
  const PricingCheckbox = ({ checked, onChange, children }: {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children: React.ReactNode;
  }) => (
    <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
      isDark
        ? 'hover:bg-white/5'
        : 'hover:bg-slate-50'
    }`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          checked
            ? 'bg-blue-500 border-blue-500'
            : isDark
              ? 'border-slate-600 bg-transparent'
              : 'border-slate-300 bg-white'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{children}</span>
    </label>
  );

  if (properties.length === 0) {
    return (
      <div className={`rounded-xl p-12 text-center ${
        isDark
          ? 'bg-[#0B0C15] border border-white/5'
          : 'bg-white border border-slate-200 shadow-sm'
      }`}>
        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
          isDark ? 'bg-white/5' : 'bg-slate-100'
        }`}>
          <Calculator className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>
        <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Nenhum imóvel cadastrado
        </h3>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Cadastre um imóvel para configurar a calculadora de preços.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px]">
      {/* Paywall overlay com blur para não-assinantes */}
      {!hasAccess && <PricingPaywall isDark={isDark} />}

      <div className={`space-y-6 ${!hasAccess ? 'pointer-events-none select-none' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Calculadora de Preços
            </h3>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Configure valores e regras de precificação para cada imóvel
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!hasAccess && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isDark
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-purple-50 text-purple-600 border border-purple-200'
              }`}>
                <Lock className="w-3 h-3 inline mr-1" />
                Pro
              </div>
            )}
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              isDark
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}>
              {properties.length} {properties.length === 1 ? 'imóvel' : 'imóveis'}
            </div>
          </div>
        </div>

        {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map(property => (
          <div
            key={property.id}
            className={`group rounded-xl p-5 transition-all hover:shadow-lg ${
              isDark
                ? 'bg-[#0B0C15] border border-white/5 hover:border-white/10'
                : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <Calculator className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <Settings2 className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`} />
            </div>

            <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {property.name}
            </h4>
            <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Configuração individual de preços
            </p>

            <Button
              variant="secondary"
              onClick={() => openPricing(property)}
              className="w-full justify-center"
            >
              Configurar Preços
            </Button>
          </div>
        ))}
      </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closePricing}
        title={selectedProperty ? `Calculadora - ${selectedProperty.name}` : 'Calculadora'}
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Carregando configurações...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Valores Base */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Valores Base
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PricingInput
                  label="Diária mínima (R$)"
                  value={form.minValue}
                  onChange={e => setForm({ ...form, minValue: toInt(e.target.value) })}
                  icon={DollarSign}
                />
                <PricingInput
                  label="Seg–Qui (R$)"
                  value={form.weekdayNormalValue}
                  onChange={e => setForm({ ...form, weekdayNormalValue: toInt(e.target.value) })}
                  icon={DollarSign}
                />
                <PricingInput
                  label="Sex–Dom (R$)"
                  value={form.weekendValue}
                  onChange={e => setForm({ ...form, weekendValue: toInt(e.target.value) })}
                  icon={DollarSign}
                />
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Ajustes e Multiplicadores
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PricingSelect
                  label="Multiplicador datas especiais"
                  value={form.holidayMultiplier}
                  onChange={e => setForm({ ...form, holidayMultiplier: Number(e.target.value) })}
                  options={HOLIDAY_MULTIPLIERS.map(m => ({ value: m, label: `${m}x` }))}
                />
                <PricingSelect
                  label="Reajuste anual"
                  value={form.annualAdjustmentPercent}
                  onChange={e => setForm({ ...form, annualAdjustmentPercent: Number(e.target.value) })}
                  options={ANNUAL_ADJUSTMENTS.map(p => ({ value: p, label: `${p}%` }))}
                />
              </div>
            </div>

            {/* Opções */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Opções Adicionais
                </span>
              </div>
              <div className={`rounded-lg border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <PricingCheckbox
                  checked={useManualHolidayValue}
                  onChange={e => {
                    const enabled = e.target.checked;
                    setUseManualHolidayValue(enabled);
                    if (!enabled) {
                      setForm(prev => ({ ...prev, holidayValueManual: null }));
                    }
                  }}
                >
                  Definir valor fixo para datas especiais
                </PricingCheckbox>

                {useManualHolidayValue && (
                  <div className="px-3 pb-3">
                    <PricingInput
                      label="Valor datas especiais (R$)"
                      value={form.holidayValueManual ?? ''}
                      onChange={e => setForm({ ...form, holidayValueManual: toInt(e.target.value) })}
                      placeholder="Ex: 500"
                      icon={DollarSign}
                    />
                  </div>
                )}

                <div className={`border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <PricingCheckbox
                    checked={form.applyMonthlyAdjustment}
                    onChange={e => setForm({ ...form, applyMonthlyAdjustment: e.target.checked })}
                  >
                    Aplicar correção automaticamente todo mês
                  </PricingCheckbox>
                </div>

                <div className={`border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <PricingCheckbox
                    checked={form.applyMonthlyCostsToCalendar}
                    onChange={e => setForm({ ...form, applyMonthlyCostsToCalendar: e.target.checked })}
                  >
                    Adicionar Preços no calendário
                  </PricingCheckbox>
                </div>
              </div>
            </div>

            {/* Temporadas Personalizadas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sun className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Temporadas de Alta Demanda
                </span>
              </div>
              <div className={`rounded-lg border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <PricingCheckbox
                  checked={useCustomSeasons}
                  onChange={e => {
                    const enabled = e.target.checked;
                    setUseCustomSeasons(enabled);
                    if (enabled && customSeasons.length === 0) {
                      // Iniciar com temporadas padrão
                      setCustomSeasons([...DEFAULT_SEASONS]);
                    }
                  }}
                >
                  Personalizar períodos de alta temporada
                </PricingCheckbox>

                {useCustomSeasons && (
                  <div className={`px-3 pb-3 space-y-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className={`text-xs pt-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Configure seus próprios períodos de alta temporada com multiplicadores de preço.
                    </p>

                    {customSeasons.map((season, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={season.name}
                            onChange={e => updateSeason(index, 'name', e.target.value)}
                            placeholder="Nome da temporada"
                            className={`flex-1 text-sm font-medium bg-transparent border-none outline-none ${
                              isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => removeSeason(index)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-red-500/20 text-red-400'
                                : 'hover:bg-red-50 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                              Início - Mês
                            </label>
                            <select
                              value={season.startMonth}
                              onChange={e => updateSeason(index, 'startMonth', Number(e.target.value))}
                              className={`w-full text-xs rounded px-2 py-1.5 ${
                                isDark
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-white border border-slate-200 text-slate-900'
                              }`}
                            >
                              {MONTHS.map(m => (
                                <option key={m.value} value={m.value} className={isDark ? 'bg-slate-800' : 'bg-white'}>
                                  {m.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                              Início - Dia
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={season.startDay}
                              onChange={e => updateSeason(index, 'startDay', Number(e.target.value))}
                              className={`w-full text-xs rounded px-2 py-1.5 ${
                                isDark
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-white border border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                              Fim - Mês
                            </label>
                            <select
                              value={season.endMonth}
                              onChange={e => updateSeason(index, 'endMonth', Number(e.target.value))}
                              className={`w-full text-xs rounded px-2 py-1.5 ${
                                isDark
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-white border border-slate-200 text-slate-900'
                              }`}
                            >
                              {MONTHS.map(m => (
                                <option key={m.value} value={m.value} className={isDark ? 'bg-slate-800' : 'bg-white'}>
                                  {m.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                              Fim - Dia
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="31"
                              value={season.endDay}
                              onChange={e => updateSeason(index, 'endDay', Number(e.target.value))}
                              className={`w-full text-xs rounded px-2 py-1.5 ${
                                isDark
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-white border border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-[10px] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                              Multiplicador
                            </label>
                            <select
                              value={season.multiplier}
                              onChange={e => updateSeason(index, 'multiplier', Number(e.target.value))}
                              className={`w-full text-xs rounded px-2 py-1.5 ${
                                isDark
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-white border border-slate-200 text-slate-900'
                              }`}
                            >
                              {SEASON_MULTIPLIERS.map(m => (
                                <option key={m} value={m} className={isDark ? 'bg-slate-800' : 'bg-white'}>
                                  {m}x
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addSeason}
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDark
                          ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Temporada
                    </button>
                  </div>
                )}

                {!useCustomSeasons && (
                  <div className={`px-3 pb-3 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <p className={`text-xs pt-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Usando temporadas padrão do sistema: Verão (1.75x), Réveillon (2x), Julho (1.3x)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo */}
            <div className={`rounded-lg p-4 ${
              isDark
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Resumo dos Valores
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Mínimo</p>
                  <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    R$ {pricingSummary.minValue}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Seg–Qui</p>
                  <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    R$ {pricingSummary.weekdayNormalValue}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Sex–Dom</p>
                  <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    R$ {pricingSummary.weekendValue}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Especiais</p>
                  <p className={`text-lg font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    R$ {pricingSummary.holidayValue}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={closePricing}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Configuração'
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PricingTab;
