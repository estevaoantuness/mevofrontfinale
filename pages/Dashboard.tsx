import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Home,
  Bell,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Settings,
  Send,
  ExternalLink,
  CreditCard,
  User,
  AlertTriangle,
  AlertCircle,
  Mail,
  Calculator,
  HelpCircle,
  X
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ProfileTab } from '../components/dashboard/ProfileTab';
import { CalendarView } from '../components/dashboard/CalendarView';
import { CheckoutAutoTab } from '../components/dashboard/CheckoutAutoTab';
import { PricingTab } from '../components/dashboard/PricingTab';
import { SettingsTab } from '../components/dashboard/SettingsTab';
import { MobileNav } from '../components/dashboard/MobileNav';
import { MobileHeader } from '../components/dashboard/MobileHeader';
import { SubscriptionRequiredModal } from '../components/billing/SubscriptionRequiredModal';
import { EmailVerificationModal } from '../components/billing/EmailVerificationModal';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import * as api from '../lib/api';
import type { Property, DashboardStats, WhatsAppStatus, WhatsAppQRResponse, Subscription } from '../lib/api';

interface DashboardProps {
  onLogout: () => void;
  onGoToLanding?: () => void;
}

export const Dashboard = ({ onLogout, onGoToLanding }: DashboardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const allowedTabs = useMemo(
    () => new Set(['overview', 'properties', 'checkout', 'pricing', 'whatsapp', 'profile', 'settings']),
    []
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ totalProperties: 0, messagesToday: 0, messagesThisMonth: 0 });
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({ configured: false, connected: false });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New Property Form State
  const [newProp, setNewProp] = useState({
    name: '',
    ical_airbnb: '',
    ical_booking: ''
  });

  // iCal Help Modal State
  const [icalHelpModal, setIcalHelpModal] = useState<'airbnb' | 'booking' | null>(null);

  // Edit Property State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProp, setEditProp] = useState<Property | null>(null);

  // Scroll to plans section in profile tab
  const scrollToPlans = useCallback((planId?: string) => {
    setActiveTab('profile');

    setTimeout(() => {
      const plansSection = document.getElementById('subscription-plans');
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Add highlight animation
        plansSection.classList.add('highlight-pulse');
        setTimeout(() => plansSection.classList.remove('highlight-pulse'), 2000);
      }

      // If planId provided, highlight specific plan
      if (planId) {
        navigate(`/dashboard?tab=profile&plan=${planId}`, { replace: true });
      }
    }, 100);
  }, [navigate]);

  const handleSelectPlan = (planId: 'starter' | 'pro') => {
    scrollToPlans(planId);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && allowedTabs.has(tab)) {
      setActiveTab(tab);
    }
  }, [allowedTabs, location.search]);

  // WhatsApp Test State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do Mevo.');
  const [testLoading, setTestLoading] = useState(false);

  // WhatsApp Connection Method State
  const [connectionMethod, setConnectionMethod] = useState<'qr' | 'code'>('qr');
  const [pairingPhoneNumber, setPairingPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingCodeLoading, setPairingCodeLoading] = useState(false);


  // Subscription Required Modal State
  const [subscriptionModal, setSubscriptionModal] = useState<{
    isOpen: boolean;
    reason: 'no_subscription' | 'limit_reached';
    currentPlan?: string;
    currentLimit?: number;
    propertyCount?: number;
  }>({ isOpen: false, reason: 'no_subscription' });

  // Worker Loading State
  const [workerLoading, setWorkerLoading] = useState(false);

  // Email Verification Modal State
  const [emailVerificationModalOpen, setEmailVerificationModalOpen] = useState(false);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning';
    onConfirm: () => void;
    loading?: boolean;
  }>({ isOpen: false, title: '', message: '', variant: 'danger', onConfirm: () => {} });

  // Get plan badge text based on subscription status
  const getPlanBadge = (): { text: string; color: string } => {
    if (!subscription) return { text: 'Free', color: 'slate' };
    if (subscription.status === 'trialing') return { text: 'Free Trial', color: 'purple' };
    if (subscription.status === 'active' && subscription.planId) {
      const planName = subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1);
      return { text: planName, color: 'blue' };
    }
    return { text: 'Free', color: 'slate' };
  };

  const planBadge = getPlanBadge();

  // Fetch data on mount (includes WhatsApp status)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propsData, statsData, subData, whatsappData] = await Promise.all([
        api.getProperties(),
        api.getStats(),
        api.getSubscription().catch(() => null),
        api.getWhatsAppStatus().catch(() => ({ configured: false, connected: false }))
      ]);
      setProperties(propsData);
      setStats(statsData);
      if (subData) setSubscription(subData);
      if (whatsappData) setWhatsappStatus(whatsappData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch WhatsApp status when tab changes
  useEffect(() => {
    if (activeTab === 'whatsapp') {
      fetchWhatsAppStatus();
      const interval = setInterval(fetchWhatsAppStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchWhatsAppStatus = async () => {
    try {
      const status = await api.getWhatsAppStatus();
      setWhatsappStatus(status);

      // Se conectou, limpa o QR
      if (status.connected) {
        setQrCode(null);
      }
    } catch (err) {
      console.error('Erro ao buscar status WhatsApp:', err);
    }
  };

  const handleConnectWhatsApp = async () => {
    setQrLoading(true);
    try {
      const result = await api.getWhatsAppQR();
      if (result.connected) {
        setWhatsappStatus({ ...whatsappStatus, connected: true, phone: result.phone });
        setQrCode(null);
      } else {
        setQrCode(result.qr || null);
      }
    } catch (err: any) {
      alert('Erro ao gerar QR Code: ' + err.message);
    } finally {
      setQrLoading(false);
    }
  };

  const handleGetPairingCode = async () => {
    if (!pairingPhoneNumber) {
      alert('Digite o número do WhatsApp que será conectado');
      return;
    }
    setPairingCodeLoading(true);
    try {
      const result = await api.getWhatsAppPairingCode(pairingPhoneNumber);
      if (result.connected) {
        setWhatsappStatus({ ...whatsappStatus, connected: true, phone: result.phone });
        setPairingCode(null);
      } else {
        setPairingCode(result.pairingCode || null);
      }
    } catch (err: any) {
      alert('Erro ao gerar código de pareamento: ' + err.message);
    } finally {
      setPairingCodeLoading(false);
    }
  };

  const handleDisconnectWhatsApp = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Desconectar WhatsApp',
      message: 'Tem certeza que deseja desconectar o WhatsApp? Você precisará reconectar para enviar mensagens.',
      variant: 'warning',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await api.disconnectWhatsApp();
          setWhatsappStatus({ configured: false, connected: false });
          setQrCode(null);
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (err: any) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          alert('Erro ao desconectar: ' + err.message);
        }
      }
    });
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const property = await api.createProperty({
        name: newProp.name,
        ical_airbnb: newProp.ical_airbnb,
        ical_booking: newProp.ical_booking
      });
      setProperties([property, ...properties]);
      setNewProp({ name: '', ical_airbnb: '', ical_booking: '' });
      setIsModalOpen(false);
    } catch (err: any) {
      // Verificar se é erro de assinatura/limite
      const errorCode = err.code || err.response?.data?.code;
      const errorData = err.response?.data || {};

      if (errorCode === 'SUBSCRIPTION_REQUIRED' || errorCode === 'FREE_LIMIT_REACHED') {
        // Usuário não tem assinatura ou atingiu limite grátis - mostrar modal de trial
        setIsModalOpen(false); // Fecha o modal de criar imóvel mas mantém os dados
        setSubscriptionModal({
          isOpen: true,
          reason: 'no_subscription'
        });
      } else if (errorCode === 'PROPERTY_LIMIT_REACHED') {
        // Limite de propriedades atingido - mostrar modal de upgrade
        setIsModalOpen(false);
        setSubscriptionModal({
          isOpen: true,
          reason: 'limit_reached',
          currentPlan: errorData.currentPlan,
          currentLimit: errorData.limit,
          propertyCount: errorData.currentCount
        });
      } else {
        // Outro erro - mostrar mensagem
        alert(err.message || 'Erro ao criar imóvel');
      }
    }
  };

  const handleDelete = (id: number) => {
    const property = properties.find(p => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Imóvel',
      message: `Tem certeza que deseja excluir "${property?.name || 'este imóvel'}"? Esta ação não pode ser desfeita.`,
      variant: 'danger',
      loading: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        try {
          await api.deleteProperty(id);
          setProperties(properties.filter(p => p.id !== id));
          setConfirmModal(prev => ({ ...prev, isOpen: false, loading: false }));
        } catch (err: any) {
          setConfirmModal(prev => ({ ...prev, loading: false }));
          alert(err.message);
        }
      }
    });
  };

  const handleEdit = (property: Property) => {
    setEditProp(property);
    setIsEditModalOpen(true);
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProp) return;

    try {
      const updated = await api.updateProperty(editProp.id, {
        name: editProp.name,
        ical_airbnb: editProp.ical_airbnb,
        ical_booking: editProp.ical_booking
      });
      setProperties(properties.map(p => p.id === updated.id ? updated : p));
      setIsEditModalOpen(false);
      setEditProp(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openTestModal = async () => {
    setIsTestModalOpen(true);
    // Carrega o telefone padrão das configurações
    try {
      const settings = await api.getSettings();
      if (settings.default_employee_phone && !testPhone) {
        setTestPhone(settings.default_employee_phone);
      }
    } catch (err) {
      console.error('Erro ao carregar telefone padrão:', err);
    }
  };

  const handleTestWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    try {
      const result = await api.testWhatsApp(testPhone, testMessage);
      alert(result.message);
      if (result.success) {
        setIsTestModalOpen(false);
        setTestPhone('');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleRunWorker = async () => {
    setWorkerLoading(true);
    try {
      const result = await api.runWorker();
      // Aguarda 1 segundo mostrando o loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      fetchData();

      // Mostra resultado
      if (result.success) {
        const details = result.details;
        let message = result.message;
        if (details) {
          message = `✅ ${details.propertiesChecked} imóvel(is) verificado(s)\n`;
          message += `📅 ${details.checkoutsFound} checkout(s) para hoje\n`;
          if (details.messagesSent > 0) {
            message += `📨 ${details.messagesSent} mensagem(ns) enviada(s)`;
          }
          if (details.messagesFailed > 0) {
            message += `\n❌ ${details.messagesFailed} falha(s)`;
          }
        }
        alert(message);
      }
    } catch (err: any) {
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setWorkerLoading(false);
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all mb-1 ${
        activeTab === id
          ? isDark
            ? 'bg-white/5 text-white shadow-sm'
            : 'bg-blue-50 text-blue-700 shadow-sm'
          : isDark
            ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <Icon size={16} className={`mr-3 ${activeTab === id ? 'text-blue-400' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
      {label}
    </button>
  );

  // Show full-screen loading while initial data is being fetched
  if (loading) {
    return (
      <LoadingOverlay
        isVisible={true}
        title="Carregando Dashboard"
        subtitle="Sincronizando seus dados..."
      />
    );
  }

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${isDark ? 'bg-[#050509] text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onGoToLanding={onGoToLanding}
        userName={user?.name}
        userEmail={user?.email}
      />

      {/* Sidebar - Hidden on mobile */}
      <aside className={`hidden md:flex w-64 flex-shrink-0 border-r flex-col ${isDark ? 'border-white/5 bg-[#080911]' : 'border-slate-200 bg-white'}`}>
        <div className={`h-14 flex items-center px-6 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <Logo size="text-lg" onClick={onGoToLanding} />
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
            planBadge.color === 'purple'
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
              : planBadge.color === 'blue'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
          }`}>
            {planBadge.text}
          </span>
        </div>

        <nav className="flex-1 p-3">
          <div className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Menu</div>
          <NavItem id="overview" icon={LayoutGrid} label="Visão Geral" />
          <NavItem id="properties" icon={Home} label="Meus Imóveis" />
          <NavItem id="checkout" icon={Bell} label="Checkout Auto" />
          <NavItem id="pricing" icon={Calculator} label="Calculadora" />
          <NavItem id="whatsapp" icon={Smartphone} label="Conexão WhatsApp" />
          <NavItem id="profile" icon={User} label="Meu Perfil" />
          <NavItem id="settings" icon={Settings} label="Configurações" />
        </nav>

        <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          {/* Email Verification Warning */}
          {user && !user.emailVerified && (
            <button
              onClick={() => setEmailVerificationModalOpen(true)}
              className="w-full mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/15 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-yellow-400 font-medium">Email não verificado</p>
                  <p className="text-[10px] text-yellow-400/70 truncate">Clique para confirmar</p>
                </div>
              </div>
            </button>
          )}

          <div className="flex items-center mb-4 px-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {/* Email verification badge on avatar */}
              {user && !user.emailVerified && (
                <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-yellow-500 border-2 ${isDark ? 'border-[#080911]' : 'border-white'} flex items-center justify-center`}>
                  <span className="sr-only">Email não verificado</span>
                </div>
              )}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Usuário'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <div className="space-y-1">
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                className="w-full flex items-center px-2 py-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors"
              >
                <ExternalLink size={14} className="mr-2" /> Ver Site
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full flex items-center px-2 py-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} className="mr-2" /> Sair da conta
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-w-0 ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
        {/* Mobile Header - Only visible on mobile */}
        <MobileHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          onGoToLanding={onGoToLanding}
          userName={user?.name}
        />

        {/* Desktop Topbar - Hidden on mobile */}
        <header className={`hidden md:flex h-14 items-center justify-between px-8 border-b backdrop-blur-sm z-10 ${isDark ? 'border-white/5 bg-[#050509]/50' : 'border-slate-200 bg-white/80'}`}>
          <h2 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
            {activeTab === 'overview' && 'Visão Geral'}
            {activeTab === 'properties' && 'Gerenciar Imóveis'}
            {activeTab === 'checkout' && 'Checkout Automático'}
            {activeTab === 'pricing' && 'Calculadora'}
            {activeTab === 'whatsapp' && 'Conexão WhatsApp'}
            {activeTab === 'profile' && 'Meu Perfil'}
            {activeTab === 'settings' && 'Configurações'}
          </h2>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className={`flex items-center space-x-2 pl-4 border-l ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              <span className="text-xs text-slate-500 font-medium">Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Trial Warning Banner - esconde no calendário */}
          {subscription?.status === 'trialing' && subscription?.trialEndsAt && activeTab !== 'overview' && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium">
                    Seu trial termina em {Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dias
                  </p>
                  <p className="text-sm text-yellow-400/70">
                    Faça upgrade para continuar usando todas as funcionalidades.
                  </p>
                </div>
              </div>
              <Button variant="primary" onClick={() => scrollToPlans()}>
                Fazer Upgrade
              </Button>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Calendário de Reservas */}
              <CalendarView
                properties={properties}
                stats={stats}
                subscription={subscription}
                onActivateTrial={() => handleSelectPlan('pro')}
                onSelectPlan={handleSelectPlan}
              />

              {/* Ações Rápidas */}
              <div className={`mt-6 border rounded-xl p-6 ${isDark ? 'bg-[#0B0C15]/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
                      <div className={`w-2 h-2 rounded-full ${whatsappStatus.connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        WhatsApp: {whatsappStatus.connected ? `Conectado (${whatsappStatus.phone || 'verificando...'})` : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Meus Imóveis</h3>
                  <p className="text-sm text-slate-500">Gerencie suas conexões iCal e equipe de limpeza</p>
                </div>
                <Button onClick={() => {
                  setNewProp({ name: '', ical_airbnb: '', ical_booking: '' });
                  setIsModalOpen(true);
                }}>
                  <Plus size={16} className="mr-2" /> Adicionar Imóvel
                </Button>
              </div>

              <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#0B0C15] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={isDark ? 'border-b border-white/5 bg-white/[0.02]' : 'border-b border-slate-200 bg-slate-50'}>
                      <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Imóvel</th>
                      <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Calendários</th>
                      <th className="py-3 px-6 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? 'divide-y divide-white/5' : 'divide-y divide-slate-200'}>
                    {properties.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-sm text-slate-500">
                          Nenhum imóvel cadastrado. Adicione o primeiro acima.
                        </td>
                      </tr>
                    ) : (
                      properties.map((p) => (
                        <tr key={p.id} className={`group transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                <Home size={14} />
                              </div>
                              <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{p.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              {p.ical_airbnb && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                  Airbnb
                                </span>
                              )}
                              {p.ical_booking && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  Booking
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEdit(p)}
                                className="p-2 text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                title="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`rounded-xl p-10 text-center relative overflow-hidden ${isDark ? 'bg-[#0B0C15] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  <Smartphone size={32} />
                </div>

                <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Conexão WhatsApp</h3>
                <p className={`text-sm mb-6 max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Conecte seu WhatsApp para enviar mensagens automáticas para sua equipe de limpeza.
                </p>

                {/* Toggle QR Code / Código de Pareamento */}
                {!whatsappStatus.connected && !qrCode && !pairingCode && (
                  <div className="flex justify-center gap-2 mb-6">
                    <button
                      onClick={() => setConnectionMethod('qr')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        connectionMethod === 'qr'
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      QR Code
                    </button>
                    <button
                      onClick={() => setConnectionMethod('code')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        connectionMethod === 'code'
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Código de Pareamento
                    </button>
                  </div>
                )}

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-6 ${
                  whatsappStatus.connected
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : qrCode || pairingCode
                    ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {whatsappStatus.connected
                    ? `Conectado: ${whatsappStatus.phone || ''}`
                    : qrCode
                    ? 'Aguardando escaneamento...'
                    : pairingCode
                    ? 'Digite o código no WhatsApp'
                    : 'Desconectado'}
                </div>

                {whatsappStatus.connected ? (
                  <div className="w-64 h-64 mx-auto border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center bg-emerald-500/5 mb-6">
                    <ShieldCheck size={48} className="text-emerald-400 mb-4" />
                    <span className="text-sm text-emerald-400 font-medium">WhatsApp Conectado!</span>
                    <span className="text-xs text-slate-500 mt-2">{whatsappStatus.phone}</span>
                    <span className="text-xs text-slate-600 mt-1">Pronto para enviar mensagens</span>
                  </div>
                ) : qrCode ? (
                  <div className="w-full max-w-64 aspect-square mx-auto rounded-xl overflow-hidden mb-6 bg-white p-3">
                    <img
                      src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                      alt="QR Code WhatsApp"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : pairingCode ? (
                  <div className="max-w-sm mx-auto mb-6">
                    <div className={`p-6 rounded-xl border mb-4 ${isDark ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-200 bg-blue-50'}`}>
                      <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        No WhatsApp, vá em <strong>Configurações</strong> → <strong>Dispositivos conectados</strong> → <strong>Conectar dispositivo</strong> → <strong>Conectar com número de telefone</strong>
                      </p>
                      <div className="text-4xl font-mono font-bold tracking-[0.3em] text-blue-500 text-center py-4">
                        {pairingCode}
                      </div>
                      <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        Digite este código no seu WhatsApp
                      </p>
                    </div>
                  </div>
                ) : connectionMethod === 'code' ? (
                  <div className="max-w-sm mx-auto mb-6">
                    <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Digite o número do WhatsApp que será conectado para gerar o código de pareamento.
                    </p>
                    <Input
                      label="Número do WhatsApp"
                      placeholder="5541999990000"
                      value={pairingPhoneNumber}
                      onChange={(e) => setPairingPhoneNumber(e.target.value)}
                      className="mb-4"
                    />
                  </div>
                ) : (
                  <div className={`w-full max-w-64 aspect-square mx-auto border-2 border-dashed rounded-xl flex flex-col items-center justify-center mb-6 ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-300 bg-slate-50'}`}>
                    <Smartphone size={48} className="text-slate-400 mb-4" />
                    <span className="text-sm text-slate-500">Clique no botão abaixo</span>
                    <span className="text-xs text-slate-400 mt-1">para conectar seu WhatsApp</span>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  {whatsappStatus.connected ? (
                    <>
                      <Button onClick={openTestModal} variant="secondary">
                        <Send size={16} className="mr-2" /> Testar Envio
                      </Button>
                      <Button onClick={handleDisconnectWhatsApp} variant="secondary" className="text-red-400 hover:text-red-300">
                        <LogOut size={16} className="mr-2" /> Desconectar
                      </Button>
                    </>
                  ) : qrCode || pairingCode ? (
                    <Button onClick={() => { setQrCode(null); setPairingCode(null); }} variant="secondary">
                      Cancelar
                    </Button>
                  ) : connectionMethod === 'code' ? (
                    <Button onClick={handleGetPairingCode} disabled={pairingCodeLoading || !pairingPhoneNumber}>
                      {pairingCodeLoading ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" /> Gerando Código...
                        </>
                      ) : (
                        <>
                          <MessageCircle size={16} className="mr-2" /> Gerar Código de Pareamento
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleConnectWhatsApp} disabled={qrLoading}>
                      {qrLoading ? (
                        <>
                          <RefreshCw size={16} className="mr-2 animate-spin" /> Gerando QR Code...
                        </>
                      ) : (
                        <>
                          <MessageCircle size={16} className="mr-2" /> Conectar WhatsApp
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHECKOUT AUTO */}
          {activeTab === 'checkout' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CheckoutAutoTab />

              {/* Teste Manual do Worker */}
              <div className={`mt-6 rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Teste Manual</h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Executa o worker manualmente para processar checkouts de hoje
                    </p>
                  </div>
                  <Button onClick={handleRunWorker} variant="secondary">
                    <RefreshCw size={16} className="mr-2" /> Executar Worker
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LOGS */}
          {activeTab === 'pricing' && (
            <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PricingTab properties={properties} subscription={subscription} />
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProfileTab onLogout={onLogout} />
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsTab onLogout={onLogout} />
          )}
        </div>
      </main>

      {/* Add Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Imóvel"
      >
        <form onSubmit={handleAddProperty} className="space-y-4">
          <Input
            label="Nome do Imóvel"
            placeholder="Ex: Loft Centro 402"
            required
            value={newProp.name}
            onChange={e => setNewProp({...newProp, name: e.target.value})}
          />

          {/* Airbnb iCal com botão de ajuda */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Airbnb iCal URL
              </label>
              <button
                type="button"
                onClick={() => setIcalHelpModal('airbnb')}
                className={`p-0.5 rounded-full transition-colors ${isDark ? 'text-slate-500 hover:text-blue-400 hover:bg-white/5' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'}`}
                title="Como obter o link iCal do Airbnb"
              >
                <HelpCircle size={14} />
              </button>
            </div>
            <input
              type="text"
              placeholder="https://airbnb.com/calendar/ical/..."
              value={newProp.ical_airbnb}
              onChange={e => setNewProp({...newProp, ical_airbnb: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
          </div>

          {/* Booking iCal com botão de ajuda */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Booking iCal URL (opcional)
              </label>
              <button
                type="button"
                onClick={() => setIcalHelpModal('booking')}
                className={`p-0.5 rounded-full transition-colors ${isDark ? 'text-slate-500 hover:text-blue-400 hover:bg-white/5' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'}`}
                title="Como obter o link iCal do Booking"
              >
                <HelpCircle size={14} />
              </button>
            </div>
            <input
              type="text"
              placeholder="https://admin.booking.com/..."
              value={newProp.ical_booking}
              onChange={e => setNewProp({...newProp, ical_booking: e.target.value})}
              className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar Imóvel</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Property Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditProp(null); }}
        title="Editar Imóvel"
      >
        {editProp && (
          <form onSubmit={handleUpdateProperty} className="space-y-4">
            <Input
              label="Nome do Imóvel"
              placeholder="Ex: Loft Centro 402"
              required
              value={editProp.name}
              onChange={e => setEditProp({...editProp, name: e.target.value})}
            />
            <Input
              label="Airbnb iCal URL"
              placeholder="https://airbnb.com/calendar/ical/..."
              value={editProp.ical_airbnb || ''}
              onChange={e => setEditProp({...editProp, ical_airbnb: e.target.value})}
            />
            <Input
              label="Booking iCal URL (opcional)"
              placeholder="https://admin.booking.com/..."
              value={editProp.ical_booking || ''}
              onChange={e => setEditProp({...editProp, ical_booking: e.target.value})}
            />
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => { setIsEditModalOpen(false); setEditProp(null); }}>Cancelar</Button>
              <Button type="submit">Atualizar</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Test WhatsApp Modal */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Testar WhatsApp"
      >
        <form onSubmit={handleTestWhatsApp} className="space-y-4">
          <Input
            label="Numero de Telefone"
            placeholder="5541999990000"
            required
            value={testPhone}
            onChange={e => setTestPhone(e.target.value)}
          />
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Mensagem</label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
              rows={4}
              placeholder="Digite a mensagem de teste..."
              value={testMessage}
              onChange={e => setTestMessage(e.target.value)}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsTestModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={testLoading}>
              {testLoading ? 'Enviando...' : 'Enviar Teste'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Subscription Required Modal */}
      <SubscriptionRequiredModal
        isOpen={subscriptionModal.isOpen}
        onClose={() => {
          setSubscriptionModal({ ...subscriptionModal, isOpen: false });
          // Reabre o modal de criar imóvel para o usuário continuar
          if (newProp.name) {
            setIsModalOpen(true);
          }
        }}
        reason={subscriptionModal.reason}
        currentPlan={subscriptionModal.currentPlan}
        currentLimit={subscriptionModal.currentLimit}
        propertyCount={subscriptionModal.propertyCount}
        user={user}
        onRefreshUser={() => {
          fetchData();
        }}
        onSuccess={() => {
          // Trial ativado com sucesso - recarregar dados
          fetchData();
        }}
      />

      {/* Worker Loading Overlay */}
      <LoadingOverlay
        isVisible={workerLoading}
        title="Executando Worker"
        subtitle="Processando checkouts e enviando mensagens..."
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={emailVerificationModalOpen}
        onClose={() => setEmailVerificationModalOpen(false)}
        userEmail={user?.email || ''}
        onEmailSent={() => {
          // Optionally refresh user data after email is sent
        }}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        loading={confirmModal.loading}
      />

      {/* iCal Help Modal */}
      {icalHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIcalHelpModal(null)} />
          <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-xl ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {icalHelpModal === 'airbnb' ? 'Como obter o link do Airbnb' : 'Como obter o link do Booking'}
              </h3>
              <button
                onClick={() => setIcalHelpModal(null)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className={`space-y-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {icalHelpModal === 'airbnb' ? (
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Abra o <strong>app do Airbnb</strong> no celular</li>
                  <li>Toque em <strong>Anúncios</strong> e escolha o imóvel</li>
                  <li>Toque em <strong>Calendário</strong></li>
                  <li>Procure <strong>"Sincronizar calendário"</strong> ou <strong>"Exportar calendário"</strong></li>
                  <li>Toque em <strong>Copiar</strong> quando aparecer o link</li>
                  <li>Cole o link aqui no campo acima</li>
                </ol>
              ) : (
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Abra o <strong>app de anfitrião da Booking</strong> ou a página de parceiros</li>
                  <li>Vá em <strong>Calendário</strong> ou <strong>Tarifas e disponibilidade</strong></li>
                  <li>Procure <strong>"Sincronizar calendários"</strong> ou <strong>"Exportar calendário"</strong></li>
                  <li>Toque em <strong>Copiar</strong> quando aparecer o link</li>
                  <li>Cole o link aqui no campo acima</li>
                </ol>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setIcalHelpModal(null)}>
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
