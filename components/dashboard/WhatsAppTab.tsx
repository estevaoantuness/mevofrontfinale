import React from 'react';
import { Smartphone, ShieldCheck, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import type { WhatsAppStatus } from '../../lib/api';

interface WhatsAppTabProps {
    whatsappStatus: WhatsAppStatus;
    qrCode: string | null;
    onTestClick: () => void;
}

export const WhatsAppTab = ({ whatsappStatus, qrCode, onTestClick }: WhatsAppTabProps) => {
    return (
        <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0B0C15] border border-white/5 rounded-xl p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

                <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center mb-6 text-slate-400">
                    <Smartphone size={32} />
                </div>

                <h3 className="text-xl font-medium text-white mb-2">Conexão WhatsApp</h3>
                <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
                    Escaneie o QR Code para permitir que o Mevo envie mensagens automáticas para sua equipe de limpeza.
                </p>

                <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-8 ${whatsappStatus.status === 'connected'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : whatsappStatus.status === 'connecting'
                                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}
                >
                    ●{' '}
                    {whatsappStatus.status === 'connected'
                        ? 'Conectado'
                        : whatsappStatus.status === 'connecting'
                            ? 'Conectando...'
                            : 'Desconectado'}
                </div>

                {whatsappStatus.status === 'connected' ? (
                    <div className="w-64 h-64 mx-auto border border-emerald-500/20 rounded-xl flex flex-col items-center justify-center bg-emerald-500/5 mb-6">
                        <ShieldCheck size={48} className="text-emerald-400 mb-4" />
                        <span className="text-sm text-emerald-400 font-medium">WhatsApp Conectado!</span>
                        <span className="text-xs text-slate-500 mt-2">Pronto para enviar mensagens</span>
                    </div>
                ) : qrCode ? (
                    <div className="w-64 h-64 mx-auto rounded-xl overflow-hidden mb-6 bg-white p-2">
                        <img src={qrCode} alt="QR Code WhatsApp" className="w-full h-full" />
                    </div>
                ) : (
                    <div className="w-64 h-64 mx-auto border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-black/20 mb-6">
                        <div className="w-8 h-8 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin mb-3" />
                        <span className="text-xs text-slate-500 font-mono">Aguardando QR Code...</span>
                    </div>
                )}

                <p className="text-xs text-slate-600 mb-6">Integração via Evolution API</p>

                {whatsappStatus.status === 'connected' && (
                    <Button onClick={onTestClick} variant="secondary">
                        <Send size={16} className="mr-2" /> Testar Envio
                    </Button>
                )}
            </div>
        </div>
    );
};

export default WhatsAppTab;
