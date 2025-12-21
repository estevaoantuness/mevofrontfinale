import React, { useState } from 'react';
import { Check
 } from 'lucide-react';
import { Button } from '../ui/Button';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  propertyLimit: number;
  features: string[];
  isPopular: boolean;
  hasTrial: boolean;
  trialDays?: number;
}

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para quem esta comecando',
    monthlyPrice: 67,
    yearlyPrice: 49,
    propertyLimit: 3,
    features: [
      'Ate 3 propriedades',
      'Sync iCal (Airbnb/Booking/VRBO)',
      'Automacoes basicas',
      '1 usuario',
      'Templates com placeholders',
      'Integracao WhatsApp',
      'Suporte por email'
    ],
    isPopular: false,
    hasTrial: false
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para anfitrioes profissionais',
    monthlyPrice: 197,
    yearlyPrice: 149,
    propertyLimit: 10,
    features: [
      'Ate 10 propriedades',
      'Tudo do Starter',
      'Multi-canais iCal avancados',
      'Webhooks para integracoes',
      'Prioridade de fila',
      'Logs completos',
      'Suporte prioritario'
    ],
    isPopular: true,
    hasTrial: true,
    trialDays: 14
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'Para gestores de multiplas propriedades',
    monthlyPrice: 379,
    yearlyPrice: 289,
    propertyLimit: 30,
    features: [
      'Ate 30 propriedades',
      'Tudo do Pro',
      'Multiplos usuarios e permissoes',
      'Auditoria e logs avancados',
      'Suporte prioritario (SLA)',
      'API completa',
      'White-label',
      'Gerente de conta dedicado'
    ],
    isPopular: false,
    hasTrial: false
  }
];

interface PricingSectionProps {
  onSelectPlan?: (planId: string, interval: 'monthly' | 'yearly') => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [isYearly, setIsYearly] = useState(true);

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId, isYearly ? 'yearly' : 'monthly');
    }
  };

  return (
    <section className="py-24 px-6" id="pricing">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Precos simples e transparentes
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho do seu negocio. Cancele quando quiser.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium cursor-pointer ${!isYearly ? 'text-white' : 'text-slate-500'}`}
            onClick={() => setIsYearly(false)}
          >
            Mensal
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-12 h-6 rounded-full transition-colors bg-blue-600"
            aria-label="Alternar entre mensal e anual"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                isYearly ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium cursor-pointer ${isYearly ? 'text-white' : 'text-slate-500'}`}
            onClick={() => setIsYearly(true)}
          >
            Anual
          </span>
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
            Economize ate 27%
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-blue-600/20 to-[#0B0C15] border-2 border-blue-500/50'
                  : 'bg-[#0B0C15] border border-white/10'
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide bg-blue-600 text-white rounded-full">
                    Mais Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-slate-400 text-lg">R$</span>
                  <span className="text-5xl font-bold text-white">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-slate-400">/mes</span>
                </div>
                {isYearly && (
                  <p className="text-sm text-slate-500 mt-2">
                    Cobrado R${plan.yearlyPrice * 12}/ano
                  </p>
                )}
                {!isYearly && plan.yearlyPrice < plan.monthlyPrice && (
                  <p className="text-sm text-green-400 mt-2">
                    ou R${plan.yearlyPrice}/mes no anual
                  </p>
                )}
              </div>

              {/* Trial Badge */}
              {plan.hasTrial && (
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1.5 text-sm font-medium bg-purple-500/20 text-purple-400 rounded-lg">
                    {plan.trialDays} dias gratis
                  </span>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.isPopular ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.hasTrial ? 'Comecar Trial Gratis' : plan.id === 'agency' ? 'Falar com Vendas' : 'Escolher Plano'}
              </Button>
            </div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <p className="text-center text-sm text-slate-500 mt-12">
          Garantia de 7 dias. Nao gostou? Devolvemos seu dinheiro.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
