import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Home,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Eye
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import * as api from '../../lib/api';
import type { MessageLog, MessageLogsStats, Property } from '../../lib/api';

interface LogsTabProps {
  properties: Property[];
}

type StatusFilter = 'all' | 'sent' | 'failed' | 'pending';
type RecipientTypeFilter = 'all' | 'staff' | 'guest';

export const LogsTab = ({ properties }: LogsTabProps) => {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [stats, setStats] = useState<MessageLogsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [recipientTypeFilter, setRecipientTypeFilter] = useState<RecipientTypeFilter>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  // Modal
  const [selectedLog, setSelectedLog] = useState<MessageLog | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter, recipientTypeFilter, propertyFilter, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const params: Parameters<typeof api.getMessageLogs>[0] = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (statusFilter !== 'all') params.status = statusFilter;
      if (recipientTypeFilter !== 'all') params.recipientType = recipientTypeFilter;
      if (propertyFilter !== 'all') params.propertyId = parseInt(propertyFilter, 10);

      const [logsResponse, statsResponse] = await Promise.all([
        api.getMessageLogs(params),
        api.getMessageLogsStats()
      ]);

      setLogs(logsResponse.logs);
      setPagination(logsResponse.pagination);
      setStats(statsResponse);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleViewLog = (log: MessageLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sent':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          label: 'Enviada'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          label: 'Falhou'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          label: 'Pendente'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          label: status
        };
    }
  };

  const getRecipientTypeBadge = (type: string) => {
    if (type === 'staff') {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Staff
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
        Guest
      </span>
    );
  };

  const getTriggeredByLabel = (triggeredBy?: string) => {
    switch (triggeredBy) {
      case 'manual':
        return 'Manual';
      case 'scheduler':
        return 'Agendado';
      case 'auto':
        return 'Automatico';
      default:
        return 'Sistema';
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Historico de Mensagens</h3>
          <p className="text-sm text-slate-500">
            Acompanhe todas as mensagens enviadas
          </p>
        </div>
        <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Enviadas</span>
            </div>
            <p className="text-2xl font-semibold text-emerald-400">{stats.sent}</p>
          </div>
          <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Falharam</span>
            </div>
            <p className="text-2xl font-semibold text-red-400">{stats.failed}</p>
          </div>
          <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Staff</span>
            </div>
            <p className="text-2xl font-semibold text-blue-400">{stats.byRecipientType.staff}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'sent', label: 'Enviadas' },
              { id: 'failed', label: 'Falharam' },
              { id: 'pending', label: 'Pendentes' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id as StatusFilter);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Recipient Type Filter */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'staff', label: 'Staff' },
              { id: 'guest', label: 'Guest' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setRecipientTypeFilter(tab.id as RecipientTypeFilter);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  recipientTypeFilter === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Property Filter */}
          <div className="relative ml-auto">
            <select
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              value={propertyFilter}
              onChange={e => {
                setPropertyFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">Todos os imoveis</option>
              {properties.map(prop => (
                <option key={prop.id} value={prop.id.toString()}>{prop.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-spin" />
          <p className="text-slate-500">Carregando mensagens...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma mensagem encontrada</p>
          <p className="text-sm text-slate-500 mt-1">
            As mensagens enviadas aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="bg-[#0B0C15] border border-white/5 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {logs.map(log => {
              const statusConfig = getStatusConfig(log.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => handleViewLog(log)}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white truncate">
                          {log.recipientName || log.recipient}
                        </span>
                        {getRecipientTypeBadge(log.recipientType)}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Message Preview */}
                      <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                        {log.message || 'Sem conteudo'}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {log.property && (
                          <span className="flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            {log.property.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(log.sentAt)}
                        </span>
                        <span>{getTriggeredByLabel(log.triggeredBy)}</span>
                      </div>

                      {/* Error Message */}
                      {log.errorMessage && (
                        <p className="mt-2 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                          Erro: {log.errorMessage}
                        </p>
                      )}
                    </div>

                    {/* View Button */}
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-white/5 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} mensagens)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedLog && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedLog(null);
          }}
          title="Detalhes da Mensagem"
        >
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              {(() => {
                const config = getStatusConfig(selectedLog.status);
                const Icon = config.icon;
                return (
                  <>
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <span className={`text-lg font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    {getRecipientTypeBadge(selectedLog.recipientType)}
                  </>
                );
              })()}
            </div>

            {/* Recipient */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Destinatario</label>
              <p className="text-white mt-1">
                {selectedLog.recipientName && (
                  <span className="font-medium">{selectedLog.recipientName}</span>
                )}
                {selectedLog.recipientName && selectedLog.recipient && ' - '}
                <span className="text-slate-400">{selectedLog.recipient}</span>
              </p>
            </div>

            {/* Property */}
            {selectedLog.property && (
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Imovel</label>
                <p className="text-white mt-1">{selectedLog.property.name}</p>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider">Mensagem</label>
              <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white whitespace-pre-wrap text-sm">
                  {selectedLog.message || 'Sem conteudo'}
                </p>
              </div>
            </div>

            {/* Error */}
            {selectedLog.errorMessage && (
              <div>
                <label className="text-xs text-red-400 uppercase tracking-wider">Erro</label>
                <p className="text-red-400 mt-1 text-sm">{selectedLog.errorMessage}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Enviada em</label>
                <p className="text-white mt-1 text-sm">
                  {new Date(selectedLog.sentAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider">Disparado por</label>
                <p className="text-white mt-1 text-sm">
                  {getTriggeredByLabel(selectedLog.triggeredBy)}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LogsTab;
