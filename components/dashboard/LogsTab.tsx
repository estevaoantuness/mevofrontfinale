import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  MessageCircle,
  ChevronDown,
  Send
} from 'lucide-react';
import { Button } from '../ui/Button';
import * as api from '../../lib/api';
import type { Property, MessageLog } from '../../lib/api';

interface LogsTabProps {
  properties: Property[];
}

export const LogsTab = ({ properties }: LogsTabProps) => {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (reset = false) => {
    try {
      setLoading(true);
      const newOffset = reset ? 0 : offset;
      const data = await api.getLogs();

      if (reset) {
        setLogs(data);
        setOffset(0);
      } else {
        setLogs(data);
      }
      setTotal(data.length);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
    fetchLogs();
  };

  const handleResend = async (log: MessageLog) => {
    if (!confirm(`Reenviar mensagem para ${log.property_name}?`)) return;

    setResendingId(log.id);
    try {
      // TODO: Implementar endpoint de reenvio
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Funcionalidade de reenvio sera implementada em breve!');
    } catch (err: any) {
      alert('Erro ao reenviar: ' + err.message);
    } finally {
      setResendingId(null);
    }
  };

  // Group logs by date
  const groupLogsByDate = (logs: MessageLog[]) => {
    const groups: { [key: string]: MessageLog[] } = {};

    logs.forEach(log => {
      const date = new Date(log.sent_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Ontem';
      } else {
        dateKey = date.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'short',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(log);
    });

    return groups;
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (propertyFilter !== 'all' && log.property_name !== propertyFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        log.property_name.toLowerCase().includes(search) ||
        log.message.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const groupedLogs = groupLogsByDate(filteredLogs);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'failed': return 'Falhou';
      default: return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    }
  };

  // Get unique property names for filter
  const uniqueProperties = [...new Set(logs.map(l => l.property_name))];

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-white">Histórico de Mensagens</h3>
          <p className="text-sm text-slate-500">
            {total} mensagens enviadas
          </p>
        </div>
        <Button variant="secondary" onClick={() => fetchLogs(true)} disabled={loading}>
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar mensagens..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Property Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              value={propertyFilter}
              onChange={e => setPropertyFilter(e.target.value)}
            >
              <option value="all">Todos os imoveis</option>
              {uniqueProperties.map(prop => (
                <option key={prop} value={prop}>{prop}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os status</option>
              <option value="sent">Enviadas</option>
              <option value="failed">Falharam</option>
              <option value="pending">Pendentes</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-6">
        {loading && logs.length === 0 ? (
          <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-12 text-center">
            <RefreshCw className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-spin" />
            <p className="text-slate-500">Carregando historico...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-12 text-center">
            <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-1">Nenhuma mensagem encontrada</p>
            <p className="text-sm text-slate-500">
              {searchTerm || statusFilter !== 'all' || propertyFilter !== 'all'
                ? 'Tente ajustar os filtros'
                : 'As mensagens enviadas aparecerao aqui'}
            </p>
          </div>
        ) : (
          Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-slate-400">{date}</span>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-slate-600">{dateLogs.length} mensagens</span>
              </div>

              {/* Logs for this date */}
              <div className="space-y-2">
                {dateLogs.map(log => (
                  <div
                    key={log.id}
                    className={`bg-[#0B0C15] border rounded-xl transition-all ${
                      expandedLog === log.id
                        ? 'border-blue-500/30 shadow-lg shadow-blue-500/5'
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Main Row */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={`p-2 rounded-lg ${
                          log.status === 'sent' ? 'bg-emerald-500/10' :
                          log.status === 'failed' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                        }`}>
                          {getStatusIcon(log.status)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-white">{log.property_name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(log.status)}`}>
                              {getStatusLabel(log.status)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 truncate">
                            {log.message}
                          </p>
                        </div>

                        {/* Time */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs text-slate-500">
                            {new Date(log.sent_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedLog === log.id && (
                      <div className="px-4 pb-4 border-t border-white/5 mt-2 pt-4">
                        <div className="bg-white/[0.02] rounded-lg p-4 mb-4">
                          <p className="text-sm text-slate-300 whitespace-pre-wrap">
                            {log.message}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            Enviada em {new Date(log.sent_at).toLocaleString('pt-BR')}
                          </div>

                          {log.status === 'failed' && (
                            <Button
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResend(log);
                              }}
                              disabled={resendingId === log.id}
                            >
                              {resendingId === log.id ? (
                                <RefreshCw size={14} className="mr-2 animate-spin" />
                              ) : (
                                <Send size={14} className="mr-2" />
                              )}
                              Reenviar
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {filteredLogs.length > 0 && filteredLogs.length < total && (
          <div className="text-center pt-4">
            <Button variant="secondary" onClick={handleLoadMore} disabled={loading}>
              {loading ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsTab;
