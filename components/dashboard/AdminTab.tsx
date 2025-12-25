import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Building,
  DollarSign,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Crown,
  X,
  Check,
  RefreshCw,
  UserPlus,
  UserMinus,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../lib/ThemeContext';
import { useAuth } from '../../lib/AuthContext';
import * as api from '../../lib/api';
import type { AdminMetrics, AdminUser, AdminListItem } from '../../lib/api';

// Plan configuration for testing
const TEST_PLANS = [
  { id: null, name: 'Free', limit: 1, color: 'slate' },
  { id: 'starter', name: 'Starter', limit: 3, color: 'blue' },
  { id: 'pro', name: 'Pro', limit: 10, color: 'purple' },
  { id: 'agency', name: 'Agency', limit: 30, color: 'amber' },
  { id: 'pro', name: 'Trial', limit: 10, color: 'green', status: 'trialing' }
];

export const AdminTab: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  // State
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Admin management
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Current plan for test section
  const [currentTestPlan, setCurrentTestPlan] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [metricsData, usersData, adminsData] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers({ page, limit: 15, search, planId: planFilter, status: statusFilter }),
        api.getAdminList()
      ]);

      setMetrics(metricsData);
      setUsers(usersData.users);
      setTotalPages(usersData.totalPages);
      setAdmins(adminsData.admins);
      setIsSuperadmin(adminsData.isSuperadmin);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh metrics only
  const refreshMetrics = async () => {
    setMetricsLoading(true);
    try {
      const metricsData = await api.getAdminMetrics();
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Test plan change
  const handleTestPlan = async (planId: string | null, status: string = 'active') => {
    setChangingPlan(true);
    try {
      await api.testAdminPlan(planId, status);
      setCurrentTestPlan(planId);
      // Refresh to see changes
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Erro ao mudar plano');
    } finally {
      setChangingPlan(false);
    }
  };

  // Change user plan
  const handleChangeUserPlan = async (userId: number, planId: string | null, status: string = 'active') => {
    try {
      await api.changeUserPlan(userId, planId, status);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Erro ao mudar plano');
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId: number) => {
    try {
      await api.toggleUserStatus(userId);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Erro ao alterar status');
    }
  };

  // Promote to admin
  const handlePromoteAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setAddingAdmin(true);
    try {
      await api.promoteToAdmin(newAdminEmail.trim());
      setNewAdminEmail('');
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Erro ao promover admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  // Demote admin
  const handleDemoteAdmin = async (userId: number) => {
    if (!confirm('Remover privilégios de admin deste usuário?')) return;
    try {
      await api.demoteAdmin(userId);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Erro ao remover admin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Painel Administrativo
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Gerencie usuários, métricas e planos do sistema
          </p>
        </div>
        <Button variant="secondary" onClick={refreshMetrics} disabled={metricsLoading}>
          <RefreshCw size={16} className={`mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Test Plan Section */}
      <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Testar Plano
            </h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
            Seu plano atual: {user?.subscription?.planId || 'Free'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {TEST_PLANS.map((plan) => {
            const isActive = currentTestPlan === plan.id ||
              (!currentTestPlan && !plan.id && !user?.subscription?.planId);

            return (
              <button
                key={plan.name}
                onClick={() => handleTestPlan(plan.id, plan.status || 'active')}
                disabled={changingPlan}
                className={`p-4 rounded-lg border text-center transition-all ${
                  isActive
                    ? isDark
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-blue-500 bg-blue-50'
                    : isDark
                      ? 'border-white/10 hover:border-white/20'
                      : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.limit} imóvel{plan.limit > 1 ? 'is' : ''}
                </div>
                {isActive && (
                  <div className="mt-2 text-xs text-blue-400 font-medium">Atual</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Users */}
          <div className={`rounded-xl p-5 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Usuários</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.users.total}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              +{metrics.users.newMonth} este mês
            </div>
          </div>

          {/* MRR */}
          <div className={`rounded-xl p-5 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>MRR</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.revenue.mrrFormatted}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {metrics.subscriptions.active} assinaturas ativas
            </div>
          </div>

          {/* Properties */}
          <div className={`rounded-xl p-5 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <Building className="w-5 h-5 text-purple-500" />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Imóveis</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.properties.total}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {metrics.properties.avgPerUser}/usuário
            </div>
          </div>

          {/* WhatsApp */}
          <div className={`rounded-xl p-5 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                <MessageSquare className="w-5 h-5 text-green-500" />
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>WhatsApp</span>
            </div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.whatsapp.usersConnected}/{metrics.users.total}
            </div>
            <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {metrics.whatsapp.successRate}% taxa de sucesso
            </div>
          </div>
        </div>
      )}

      {/* Secondary Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Verificados</div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.users.verified} ({metrics.users.verificationRate}%)
            </div>
          </div>
          <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Free/Trial</div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.users.free} / {metrics.subscriptions.byStatus['trialing'] || 0}
            </div>
          </div>
          <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Com Airbnb</div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.properties.withAirbnb}
            </div>
          </div>
          <div className={`rounded-lg p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Msgs Hoje</div>
            <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {metrics.whatsapp.messagesToday}
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className={`rounded-xl ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <div className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Usuários ({users.length})
          </h3>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-9 pr-3 py-1.5 text-sm rounded-lg border w-40 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900'
                } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>

            {/* Plan filter */}
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <option value="">Todos planos</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="agency">Agency</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <option value="">Todos status</option>
              <option value="active">Ativo</option>
              <option value="trialing">Trial</option>
              <option value="canceled">Cancelado</option>
              <option value="past_due">Inadimplente</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={isDark ? 'border-b border-white/5 bg-white/[0.02]' : 'border-b border-slate-200 bg-slate-50'}>
                <th className="py-2 px-4 text-xs font-medium text-slate-500">Usuário</th>
                <th className="py-2 px-4 text-xs font-medium text-slate-500">Plano</th>
                <th className="py-2 px-4 text-xs font-medium text-slate-500">Status</th>
                <th className="py-2 px-4 text-xs font-medium text-slate-500">Props</th>
                <th className="py-2 px-4 text-xs font-medium text-slate-500">WhatsApp</th>
                <th className="py-2 px-4 text-xs font-medium text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-y divide-white/5' : 'divide-y divide-slate-200'}>
              {users.map((u) => (
                <tr key={u.id} className={`group ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' && <Shield size={14} className="text-amber-400" />}
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.subscription?.planId === 'agency' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      u.subscription?.planId === 'pro' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      u.subscription?.planId === 'starter' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {u.subscription?.planId || 'Free'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.subscription?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      u.subscription?.status === 'trialing' ? 'bg-purple-500/10 text-purple-400' :
                      u.subscription?.status === 'canceled' ? 'bg-red-500/10 text-red-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>
                      {u.subscription?.status || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">
                    {u.propertyCount}/{u.subscription?.propertyLimit || 1}
                  </td>
                  <td className="py-3 px-4">
                    {u.whatsappConnected ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <X size={16} className="text-slate-500" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100">
                      {/* Plan dropdown */}
                      <select
                        value={u.subscription?.planId || ''}
                        onChange={(e) => handleChangeUserPlan(u.id, e.target.value || null)}
                        className={`px-2 py-1 text-xs rounded border ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <option value="">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="agency">Agency</option>
                      </select>

                      {/* Toggle active */}
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`p-1.5 rounded transition-colors ${
                          u.isActive
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-red-400 hover:bg-red-500/10'
                        }`}
                        title={u.isActive ? 'Desativar' : 'Ativar'}
                      >
                        {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`p-4 border-t flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <span className="text-sm text-slate-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Management - Only for Superadmin */}
      {isSuperadmin && (
        <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Gerenciar Administradores
            </h3>
          </div>

          {/* Current admins */}
          <div className="space-y-2 mb-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  {admin.isSuperadmin && <Crown size={14} className="text-amber-400" />}
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {admin.email}
                  </span>
                  {admin.isSuperadmin && (
                    <span className="text-xs text-amber-400">(superadmin)</span>
                  )}
                </div>
                {!admin.isSuperadmin && (
                  <button
                    onClick={() => handleDemoteAdmin(admin.id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Remover admin"
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add new admin */}
          <div className="flex gap-2">
            <Input
              placeholder="email@exemplo.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handlePromoteAdmin} disabled={addingAdmin || !newAdminEmail.trim()}>
              <UserPlus size={16} className="mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTab;
