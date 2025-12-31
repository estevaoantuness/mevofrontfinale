import React from 'react';
import { Sparkles, LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface TrialBannerProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onActivate: () => void;
}

/**
 * Banner de Trial - Estilo igual ao CalendarView
 * Usado para incentivar usuários sem subscription a ativar o trial
 */
export const TrialBanner: React.FC<TrialBannerProps> = ({
  icon: Icon,
  title,
  description,
  onActivate
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Icon size={20} className="text-blue-400 sm:hidden" />
            <Icon size={24} className="text-blue-400 hidden sm:block" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {description}
            </p>
          </div>
        </div>
        <Button
          onClick={onActivate}
          className="flex-shrink-0 w-full md:w-auto"
        >
          <Sparkles size={16} className="mr-2" />
          Ativar Trial Gratis
        </Button>
      </div>
    </div>
  );
};

// Configuracoes de banner por aba
export const TRIAL_BANNER_CONFIG: Record<string, { icon: string; title: string; description: string }> = {
  overview: {
    icon: 'LayoutGrid',
    title: 'Painel de Controle',
    description: 'Visualize todas as suas reservas e gerencie seus imoveis em um so lugar. Disponivel no Trial Gratuito.'
  },
  properties: {
    icon: 'Home',
    title: 'Gestao de Imoveis',
    description: 'Cadastre ate 10 imoveis e sincronize automaticamente com Airbnb e Booking. Disponivel no Trial Gratuito.'
  },
  guests: {
    icon: 'Users',
    title: 'Gestao de Hospedes',
    description: 'Acesse historico completo de hospedes e envie mensagens automaticas. Disponivel no Trial Gratuito.'
  },
  templates: {
    icon: 'MessageSquare',
    title: 'Templates de Mensagens',
    description: 'Crie mensagens personalizadas para check-in, check-out e lembretes. Disponivel no Trial Gratuito.'
  },
  pricing: {
    icon: 'Calculator',
    title: 'Calculadora de Precos',
    description: 'Configure precos dinamicos e regras de tarifacao automatica. Disponivel no Trial Gratuito.'
  },
  whatsapp: {
    icon: 'MessageCircle',
    title: 'Automacao WhatsApp',
    description: 'Conecte seu WhatsApp e envie mensagens automaticas aos hospedes. Disponivel no Trial Gratuito.'
  },
  profile: {
    icon: 'User',
    title: 'Perfil Completo',
    description: 'Gerencie suas configuracoes e dados de conta. Disponivel no Trial Gratuito.'
  },
  settings: {
    icon: 'Settings',
    title: 'Configuracoes Avancadas',
    description: 'Personalize notificacoes, horarios e preferencias do sistema. Disponivel no Trial Gratuito.'
  },
  checkout: {
    icon: 'Home',
    title: 'Check-out Automatico',
    description: 'Configure alertas automaticos de check-out para sua equipe de limpeza. Disponivel no Trial Gratuito.'
  }
};

export default TrialBanner;
