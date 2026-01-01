import React from 'react';
import { Sparkles, Lock, LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface TrialBannerProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  onActivate: () => void;
  onSelectPlan?: (plan: string) => void;
}

/**
 * Banner de Trial - Estilo igual ao CalendarView
 * Usado para incentivar usuários sem subscription a ativar o trial
 * Versão slim no mobile, expandida no desktop
 */
export const TrialBanner: React.FC<TrialBannerProps> = ({
  icon: Icon = Lock,
  title,
  description,
  onActivate,
  onSelectPlan
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-6 mb-6">
      {/* Mobile: versão compacta */}
      <div className="flex items-center gap-3 sm:hidden">
        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Lock size={18} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Disponível no{' '}
            <button
              type="button"
              onClick={() => onSelectPlan?.('starter') || onActivate()}
              className="text-blue-400 font-medium"
            >
              Starter
            </button>
            {' '}ou{' '}
            <button
              type="button"
              onClick={() => onSelectPlan?.('pro') || onActivate()}
              className="text-purple-400 font-medium"
            >
              Trial
            </button>
          </p>
        </div>
        <Button
          onClick={onActivate}
          size="sm"
          className="flex-shrink-0 px-3 py-1.5 text-xs"
        >
          <Sparkles size={12} className="mr-1" />
          Trial
        </Button>
      </div>

      {/* Desktop: versão completa */}
      <div className="hidden sm:flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Lock size={24} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-slate-400">
              {description}{' '}
              Disponível no plano{' '}
              <button
                type="button"
                onClick={() => onSelectPlan?.('starter') || onActivate()}
                className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
              >
                Starter
              </button>{' '}
              ou{' '}
              <button
                type="button"
                onClick={() => onSelectPlan?.('pro') || onActivate()}
                className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
              >
                Trial Gratuito
              </button>.
            </p>
          </div>
        </div>
        <Button
          onClick={onActivate}
          className="flex-shrink-0 w-full md:w-auto"
        >
          <Sparkles size={16} className="mr-2" />
          Ativar Trial Grátis
        </Button>
      </div>
    </div>
  );
};

// Configurações de banner por aba
export const TRIAL_BANNER_CONFIG: Record<string, { icon: string; title: string; description: string }> = {
  overview: {
    icon: 'LayoutGrid',
    title: 'Painel de Controle',
    description: 'Visualize todas as suas reservas e gerencie seus imóveis em um só lugar.'
  },
  properties: {
    icon: 'Home',
    title: 'Gestão de Imóveis',
    description: 'Cadastre seus imóveis e sincronize automaticamente com Airbnb e Booking.'
  },
  guests: {
    icon: 'Users',
    title: 'Gestão de Hóspedes',
    description: 'Acesse histórico completo de hóspedes e envie mensagens automáticas.'
  },
  templates: {
    icon: 'MessageSquare',
    title: 'Templates de Mensagens',
    description: 'Crie mensagens personalizadas para check-in, check-out e lembretes.'
  },
  pricing: {
    icon: 'Calculator',
    title: 'Calculadora de Preços',
    description: 'Configure preços dinâmicos e regras de tarifação automática.'
  },
  whatsapp: {
    icon: 'MessageCircle',
    title: 'Integração WhatsApp',
    description: 'Conecte seu WhatsApp e envie mensagens automáticas para sua equipe de limpeza.'
  },
  profile: {
    icon: 'User',
    title: 'Perfil Completo',
    description: 'Gerencie suas configurações e dados de conta.'
  },
  settings: {
    icon: 'Settings',
    title: 'Configurações Avançadas',
    description: 'Personalize notificações, horários e preferências do sistema.'
  },
  checkout: {
    icon: 'Home',
    title: 'Checkout Automático',
    description: 'Configure alertas automáticos de checkout para sua equipe de limpeza.'
  }
};

export default TrialBanner;
