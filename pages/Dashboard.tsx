import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Home,
  MessageCircle,
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
  AlertTriangle
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { BillingTab } from '../components/dashboard/BillingTab';
import { ProfileTab } from '../components/dashboard/ProfileTab';
import * as api from '../lib/api';
import type { Property, DashboardStats, WhatsAppStatus, WhatsAppQRResponse, Subscription } from '../lib/api';

interface DashboardProps {
  onLogout: () => void;
  onGoToLanding?: () => void;
}

export const Dashboard = ({ onLogout, onGoToLanding }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ totalProperties: 0, messagesToday: 0, messagesThisMonth: 0 });
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({ configured: false, connected: false });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // New Property Form State
  const [newProp, setNewProp] = useState({ name: '', ical_airbnb: '', ical_booking: '', employee_name: '', employee_phone: '' });

  // Edit Property State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProp, setEditProp] = useState<Property | null>(null);

  // WhatsApp Test State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Ola! Esta e uma mensagem de teste do Mevo.');
  const [testLoading, setTestLoading] = useState(false);

  // Settings State
  const [messageTemplate, setMessageTemplate] = useState('Olá (nome da funcionária), tudo bem? Hoje tem checkout no (nome do imóvel). Pode preparar a limpeza? Obrigado!');
  const [sendTime, setSendTime] = useState('08:00');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propsData, statsData, subData] = await Promise.all([
        api.getProperties(),
        api.getStats(),
        api.getSubscription().catch(() => null)
      ]);
      setProperties(propsData);
      setStats(statsData);
      if (subData) setSubscription(subData);
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

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;

    try {
      await api.disconnectWhatsApp();
      setWhatsappStatus({ configured: false, connected: false });
      setQrCode(null);
    } catch (err: any) {
      alert('Erro ao desconectar: ' + err.message);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const property = await api.createProperty(newProp);
      setProperties([property, ...properties]);
      setNewProp({ name: '', ical_airbnb: '', ical_booking: '', employee_name: '', employee_phone: '' });
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este imovel?')) {
      try {
        await api.deleteProperty(id);
        setProperties(properties.filter(p => p.id !== id));
      } catch (err: any) {
        alert(err.message);
      }
    }
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
        ical_booking: editProp.ical_booking,
        employee_name: editProp.employee_name,
        employee_phone: editProp.employee_phone
      });
      setProperties(properties.map(p => p.id === updated.id ? updated : p));
      setIsEditModalOpen(false);
      setEditProp(null);
    } catch (err: any) {
      alert(err.message);
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

  const fetchSettings = async () => {
    try {
      const settings = await api.getSettings();
      if (settings.message_template) setMessageTemplate(settings.message_template);
      if (settings.send_time) setSendTime(settings.send_time);
    } catch (err) {
      console.error('Erro ao buscar configuracoes:', err);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    setSettingsSaved(false);
    try {
      await api.updateSetting('message_template', messageTemplate);
      await api.updateSetting('send_time', sendTime);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Fetch settings when tab changes
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const handleRunWorker = async () => {
    try {
      await api.runWorker();
      alert('Worker executado! Verifique os logs.');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all mb-1 ${
        activeTab === id
          ? 'bg-white/5 text-white shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
      }`}
    >
      <Icon size={16} className={`mr-3 ${activeTab === id ? 'text-blue-400' : 'text-slate-500'}`} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#050509] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#080911] flex flex-col">
        <div className="h-14 flex items-center px-6 border-b border-white/5">
          <Logo size="text-lg" />
          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">PRO</span>
        </div>

        <nav className="flex-1 p-3">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Menu</div>
          <NavItem id="overview" icon={LayoutGrid} label="Visao Geral" />
          <NavItem id="properties" icon={Home} label="Meus Imoveis" />
          <NavItem id="whatsapp" icon={MessageCircle} label="Conexao WhatsApp" />
          <NavItem id="billing" icon={CreditCard} label="Assinatura" />
          <NavItem id="profile" icon={User} label="Meu Perfil" />
          <NavItem id="settings" icon={Settings} label="Configuracoes" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              AD
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-slate-500 truncate">admin@mevo.app</p>
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
      <main className="flex-1 flex flex-col min-w-0 bg-[#050509]">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-8 border-b border-white/5 bg-[#050509]/50 backdrop-blur-sm z-10">
          <h2 className="text-sm font-medium text-slate-200">
            {activeTab === 'overview' && 'Visao Geral'}
            {activeTab === 'properties' && 'Gerenciar Imoveis'}
            {activeTab === 'whatsapp' && 'Conexao WhatsApp'}
            {activeTab === 'billing' && 'Assinatura'}
            {activeTab === 'profile' && 'Meu Perfil'}
            {activeTab === 'settings' && 'Configuracoes'}
          </h2>

          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-xs text-slate-500 font-medium">System Operational</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {/* Trial Warning Banner */}
          {subscription?.status === 'trialing' && subscription?.trialEndsAt && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium">
                    Seu trial termina em {Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} dias
                  </p>
                  <p className="text-sm text-yellow-400/70">
                    Faca upgrade para continuar usando todas as funcionalidades.
                  </p>
                </div>
              </div>
              <Button variant="primary" onClick={() => setActiveTab('billing')}>
                Fazer Upgrade
              </Button>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Imoveis Ativos', val: stats.totalProperties },
                  { label: 'Mensagens Hoje', val: stats.messagesToday },
                  { label: 'Mensagens no Mes', val: stats.messagesThisMonth }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0B0C15] border border-white/5 p-6 rounded-xl hover:border-white/10 transition-colors">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{stat.label}</p>
                    <p className="text-3xl font-semibold text-white">{stat.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#0B0C15]/50 border border-white/5 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-slate-300 font-medium mb-1">Executar Worker Manualmente</h3>
                    <p className="text-slate-500 text-sm">Processa checkouts e envia mensagens agora (sem esperar 08:00)</p>
                  </div>
                  <Button onClick={handleRunWorker} variant="secondary">
                    <RefreshCw size={16} className="mr-2" /> Executar Agora
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${whatsappStatus.connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-slate-400">
                    WhatsApp: {whatsappStatus.connected ? `Conectado (${whatsappStatus.phone || 'verificando...'})` : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROPERTIES */}
          {activeTab === 'properties' && (
            <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-white">Meus Imoveis</h3>
                  <p className="text-sm text-slate-500">Gerencie suas conexoes iCal e faxineiras</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} className="mr-2" /> Adicionar Imovel
                </Button>
              </div>

              <div className="bg-[#0B0C15] border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Imovel</th>
                      <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Funcionaria</th>
                      <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone</th>
                      <th className="py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Calendarios</th>
                      <th className="py-3 px-6 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {properties.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-slate-500">
                          Nenhum imovel cadastrado. Adicione o primeiro acima.
                        </td>
                      </tr>
                    ) : (
                      properties.map((p) => (
                        <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center mr-3 text-slate-500">
                                <Home size={14} />
                              </div>
                              <span className="text-sm font-medium text-slate-200">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-300">
                            {p.employee_name}
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-400 font-mono text-xs">
                            {p.employee_phone}
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
                                className="p-2 text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                title="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
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
              <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50"></div>

                <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center mb-6 text-slate-400">
                  <Smartphone size={32} />
                </div>

                <h3 className="text-xl font-medium text-white mb-2">Conexao WhatsApp</h3>
                <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
                  Conecte seu WhatsApp para enviar mensagens automaticas para suas funcionarias.
                </p>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-8 ${
                  whatsappStatus.connected
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : qrCode
                    ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {whatsappStatus.connected ? `Conectado: ${whatsappStatus.phone || ''}` : qrCode ? 'Aguardando escaneamento...' : 'Desconectado'}
                </div>

                {whatsappStatus.connected ? (
                  <div className="w-64 h-64 mx-auto border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center bg-emerald-500/5 mb-6">
                    <ShieldCheck size={48} className="text-emerald-400 mb-4" />
                    <span className="text-sm text-emerald-400 font-medium">WhatsApp Conectado!</span>
                    <span className="text-xs text-slate-500 mt-2">{whatsappStatus.phone}</span>
                    <span className="text-xs text-slate-600 mt-1">Pronto para enviar mensagens</span>
                  </div>
                ) : qrCode ? (
                  <div className="w-64 h-64 mx-auto rounded-xl overflow-hidden mb-6 bg-white p-2">
                    <img src={`data:image/png;base64,${qrCode}`} alt="QR Code WhatsApp" className="w-full h-full" />
                  </div>
                ) : (
                  <div className="w-64 h-64 mx-auto border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-black/20 mb-6">
                    <Smartphone size={48} className="text-slate-600 mb-4" />
                    <span className="text-sm text-slate-500">Clique no botao abaixo</span>
                    <span className="text-xs text-slate-600 mt-1">para conectar seu WhatsApp</span>
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  {whatsappStatus.connected ? (
                    <>
                      <Button onClick={() => setIsTestModalOpen(true)} variant="secondary">
                        <Send size={16} className="mr-2" /> Testar Envio
                      </Button>
                      <Button onClick={handleDisconnectWhatsApp} variant="secondary" className="text-red-400 hover:text-red-300">
                        <LogOut size={16} className="mr-2" /> Desconectar
                      </Button>
                    </>
                  ) : qrCode ? (
                    <Button onClick={() => setQrCode(null)} variant="secondary">
                      Cancelar
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

          {/* TAB: BILLING */}
          {activeTab === 'billing' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BillingTab />
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProfileTab onLogout={onLogout} />
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-8">
                <h3 className="text-lg font-medium text-white mb-6">Template de Mensagem</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Mensagem para funcionarias</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
                      rows={5}
                      placeholder="Digite o template da mensagem..."
                      value={messageTemplate}
                      onChange={e => setMessageTemplate(e.target.value)}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Use <code className="px-1 py-0.5 bg-white/5 rounded text-blue-400">(nome da funcionária)</code> e <code className="px-1 py-0.5 bg-white/5 rounded text-blue-400">(nome do imóvel)</code> para personalizar
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Horario de envio</label>
                    <input
                      type="time"
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
                      value={sendTime}
                      onChange={e => setSendTime(e.target.value)}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Horario em que as mensagens serao enviadas automaticamente
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <Button onClick={handleSaveSettings} disabled={settingsLoading}>
                      {settingsLoading ? 'Salvando...' : 'Salvar Configuracoes'}
                    </Button>
                    {settingsSaved && (
                      <span className="text-sm text-emerald-400">Configuracoes salvas!</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-[#0B0C15]/50 border border-white/5 rounded-xl p-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Preview da mensagem</h4>
                <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-400">
                  {messageTemplate
                    .replace('(nome da funcionária)', 'Maria')
                    .replace('(nome do imóvel)', 'Loft Centro 402')}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Imovel"
      >
        <form onSubmit={handleAddProperty} className="space-y-4">
          <Input
            label="Nome do Imovel"
            placeholder="Ex: Loft Centro 402"
            required
            value={newProp.name}
            onChange={e => setNewProp({...newProp, name: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome da Funcionaria"
              placeholder="Ex: Maria"
              required
              value={newProp.employee_name}
              onChange={e => setNewProp({...newProp, employee_name: e.target.value})}
            />
            <Input
              label="Telefone (WhatsApp)"
              placeholder="41999990000"
              required
              value={newProp.employee_phone}
              onChange={e => setNewProp({...newProp, employee_phone: e.target.value})}
            />
          </div>
          <Input
            label="Airbnb iCal URL"
            placeholder="https://airbnb.com/calendar/ical/..."
            value={newProp.ical_airbnb}
            onChange={e => setNewProp({...newProp, ical_airbnb: e.target.value})}
          />
          <Input
            label="Booking iCal URL (opcional)"
            placeholder="https://admin.booking.com/..."
            value={newProp.ical_booking}
            onChange={e => setNewProp({...newProp, ical_booking: e.target.value})}
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar Imovel</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Property Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditProp(null); }}
        title="Editar Imovel"
      >
        {editProp && (
          <form onSubmit={handleUpdateProperty} className="space-y-4">
            <Input
              label="Nome do Imovel"
              placeholder="Ex: Loft Centro 402"
              required
              value={editProp.name}
              onChange={e => setEditProp({...editProp, name: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome da Funcionaria"
                placeholder="Ex: Maria"
                required
                value={editProp.employee_name}
                onChange={e => setEditProp({...editProp, employee_name: e.target.value})}
              />
              <Input
                label="Telefone (WhatsApp)"
                placeholder="41999990000"
                required
                value={editProp.employee_phone}
                onChange={e => setEditProp({...editProp, employee_phone: e.target.value})}
              />
            </div>
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
    </div>
  );
};

export default Dashboard;
