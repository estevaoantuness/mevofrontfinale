import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from 'react-i18next';

interface PricingPlan {
  id: string;
  propertyLimit: number;
  isPopular: boolean;
  hasTrial: boolean;
  trialDays?: number;
}

const PLAN_CONFIG: PricingPlan[] = [
  {
    id: 'starter',
    propertyLimit: 3,
    isPopular: false,
    hasTrial: false
  },
  {
    id: 'pro',
    propertyLimit: 10,
    isPopular: true,
    hasTrial: true,
    trialDays: 10
  },
  {
    id: 'agency',
    propertyLimit: 30,
    isPopular: false,
    hasTrial: false
  }
];

// Pricing by currency
const PRICING = {
  'pt-BR': {
    symbol: 'R$',
    starter: { monthly: 67, yearly: 49 },
    pro: { monthly: 197, yearly: 149 },
    agency: { monthly: 379, yearly: 289 }
  },
  'en': {
    symbol: '$',
    starter: { monthly: 15, yearly: 12 },
    pro: { monthly: 45, yearly: 35 },
    agency: { monthly: 85, yearly: 65 }
  },
  'es-419': {
    symbol: '$',
    starter: { monthly: 15, yearly: 12 },
    pro: { monthly: 45, yearly: 35 },
    agency: { monthly: 85, yearly: 65 }
  }
};

interface PricingSectionProps {
  onSelectPlan?: (planId: string, interval: 'monthly' | 'yearly') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [isYearly, setIsYearly] = useState(true);
  const { isDark } = useTheme();
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language as keyof typeof PRICING;
  const pricing = PRICING[currentLang] || PRICING['en'];

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId, isYearly ? 'yearly' : 'monthly');
    }
  };

  const getPlanFeatures = (planId: string): string[] => {
    const features = t(`pricing.plans.${planId}.features`, { returnObjects: true });
    return Array.isArray(features) ? features : [];
  };

  const getPlanPrice = (planId: string) => {
    const planPricing = pricing[planId as keyof typeof pricing];
    if (typeof planPricing === 'object' && 'monthly' in planPricing) {
      return {
        monthly: planPricing.monthly,
        yearly: planPricing.yearly
      };
    }
    return { monthly: 0, yearly: 0 };
  };

  return (
    <section className="py-24 px-6" id="pricing">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('pricing.title')}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium cursor-pointer ${!isYearly ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}
            onClick={() => setIsYearly(false)}
          >
            {t('pricing.monthly')}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-12 h-6 rounded-full transition-colors bg-blue-600"
            aria-label="Toggle billing interval"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                isYearly ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium cursor-pointer ${isYearly ? (isDark ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}
            onClick={() => setIsYearly(true)}
          >
            {t('pricing.yearly')}
          </span>
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-500/20 text-green-500 rounded-full">
            {t('pricing.saveUp')}
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLAN_CONFIG.map((plan) => {
            const price = getPlanPrice(plan.id);
            const features = getPlanFeatures(plan.id);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 ${
                  plan.isPopular
                    ? isDark
                      ? 'bg-gradient-to-b from-blue-600/20 to-[#0B0C15] border-2 border-blue-500/50'
                      : 'bg-white border-2 border-blue-500 shadow-xl'
                    : isDark
                      ? 'bg-[#0B0C15] border border-white/10'
                      : 'bg-white border border-slate-200 shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide bg-blue-600 text-white rounded-full">
                      {t('pricing.mostPopular')}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t(`pricing.plans.${plan.id}.name`)}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t(`pricing.plans.${plan.id}.description`)}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{pricing.symbol}</span>
                    <span className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {isYearly ? price.yearly : price.monthly}
                    </span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t('pricing.perMonth')}</span>
                  </div>
                  {!isYearly && price.yearly < price.monthly && (
                    <p className="text-sm text-green-500 mt-2">
                      {t('pricing.orYearly', { price: price.yearly })}
                    </p>
                  )}
                </div>

                {/* Trial Badge */}
                {plan.hasTrial && (
                  <div className="text-center mb-6">
                    <span className="inline-block px-3 py-1.5 text-sm font-medium bg-pink-500 text-white rounded-lg">
                      {t('pricing.freeTrial', { days: plan.trialDays })}
                    </span>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  variant={plan.isPopular ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.hasTrial ? t('pricing.startTrial') : plan.id === 'agency' ? t('pricing.contactSales') : t('pricing.selectPlan')}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Money-back guarantee */}
        <p className={`text-center text-sm mt-12 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          {t('pricing.moneyBack')}
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
