import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import type { DashboardStats, WhatsAppStatus } from '../../lib/api';

interface OverviewTabProps {
    stats: DashboardStats;
    whatsappStatus: WhatsAppStatus;
    onRunWorker: () => void;
}

export const OverviewTab = ({ stats, whatsappStatus, onRunWorker }: OverviewTabProps) => {
    const statCards = [
        { label: 'Imóveis Ativos', val: stats.totalProperties },
        { label: 'Mensagens Hoje', val: stats.messagesToday },
        { label: 'Mensagens no Mês', val: stats.messagesThisMonth }
    ];

    return (
        <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-[#0B0C15] border border-white/5 p-6 rounded-xl hover:border-white/10 transition-colors"
                    >
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            {stat.label}
                        </p>
                        <p className="text-3xl font-semibold text-white">{stat.val}</p>
                    </div>
                ))}
            </div>

            <div className="bg-[#0B0C15]/50 border border-white/5 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-slate-300 font-medium mb-1">Executar Worker Manualmente</h3>
                        <p className="text-slate-500 text-sm">
                            Processa checkouts e envia mensagens agora (sem esperar 08:00)
                        </p>
                    </div>
                    <Button onClick={onRunWorker} variant="secondary">
                        <RefreshCw size={16} className="mr-2" /> Executar Agora
                    </Button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-lg">
                    <div
                        className={`w-2 h-2 rounded-full ${whatsappStatus.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                    />
                    <span className="text-sm text-slate-400">
                        WhatsApp: {whatsappStatus.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
