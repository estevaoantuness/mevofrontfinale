import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Home,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import * as api from '../../lib/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'whatsapp' | 'property' | 'complete';

export const OnboardingModal = ({ isOpen, onClose, onComplete }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('whatsapp');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [propertyData, setPropertyData] = useState({
    name: '',
    employee_name: '',
    employee_phone: '',
    ical_airbnb: ''
  });
  const [saving, setSaving] = useState(false);

  // Poll WhatsApp status
  useEffect(() => {
    if (currentStep === 'whatsapp' && qrCode) {
      const interval = setInterval(async () => {
        try {
          const status = await api.getWhatsAppStatus();
          if (status.connected) {
            setWhatsappConnected(true);
            setQrCode(null);
          }
        } catch (err) {
          console.error('Error checking WhatsApp status:', err);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentStep, qrCode]);

  const handleGetQR = async () => {
    setQrLoading(true);
    try {
      const result = await api.getWhatsAppQR();
      if (result.connected) {
        setWhatsappConnected(true);
      } else {
        setQrCode(result.qr || null);
      }
    } catch (err: any) {
      alert('Erro ao gerar QR Code: ' + err.message);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSaveProperty = async () => {
    if (!propertyData.name || !propertyData.employee_name || !propertyData.employee_phone) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      await api.createProperty({
        name: propertyData.name,
        employee_name: propertyData.employee_name,
        employee_phone: propertyData.employee_phone,
        ical_airbnb: propertyData.ical_airbnb || undefined
      });
      setCurrentStep('complete');
    } catch (err: any) {
      alert('Erro ao criar imóvel: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('mevo_onboarding_completed', 'true');
    onComplete();
    onClose();
  };

  const handleSkipToProperty = () => {
    setCurrentStep('property');
  };

  const handleSkipAll = () => {
    localStorage.setItem('mevo_onboarding_completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'property', label: 'Imóvel' },
    { id: 'complete', label: 'Pronto!' }
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0B0C15] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleSkipAll}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-white/5">
          <h2 className="text-2xl font-semibold text-white mb-2">Bem-vindo ao Mevo!</h2>
          <p className="text-slate-400">Vamos configurar sua conta em 3 passos simples</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 gap-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  idx < currentIndex
                    ? 'bg-emerald-500 text-white'
                    : idx === currentIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-slate-500'
                }`}>
                  {idx < currentIndex ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${
                    idx < currentIndex ? 'bg-emerald-500' : 'bg-white/10'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-2">
            {steps.map(step => (
              <span key={step.id} className="text-[10px] text-slate-500 w-16 text-center">
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: WhatsApp */}
          {currentStep === 'whatsapp' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 mx-auto flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Conecte seu WhatsApp</h3>
              <p className="text-sm text-slate-400 mb-6">
                Escaneie o QR code com o WhatsApp do celular que receberá as notificações
              </p>

              {whatsappConnected ? (
                <div className="w-48 h-48 mx-auto border border-emerald-500/30 rounded-xl flex flex-col items-center justify-center bg-emerald-500/5 mb-6">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
                  <span className="text-sm text-emerald-400 font-medium">Conectado!</span>
                </div>
              ) : qrCode ? (
                <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden mb-6 bg-white p-2">
                  <img
                    src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                    alt="QR Code WhatsApp"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-black/20 mb-6">
                  <Smartphone className="w-12 h-12 text-slate-600 mb-3" />
                  <span className="text-sm text-slate-500">Clique para conectar</span>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                {!whatsappConnected && !qrCode && (
                  <Button onClick={handleGetQR} disabled={qrLoading}>
                    {qrLoading ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} className="mr-2" />
                        Conectar WhatsApp
                      </>
                    )}
                  </Button>
                )}
                {whatsappConnected && (
                  <Button onClick={() => setCurrentStep('property')}>
                    Próximo
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>

              {!whatsappConnected && (
                <button
                  onClick={handleSkipToProperty}
                  className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Pular por enquanto
                </button>
              )}
            </div>
          )}

          {/* Step 2: Property */}
          {currentStep === 'property' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 mx-auto flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Adicione seu primeiro imóvel</h3>
                <p className="text-sm text-slate-400">
                  Configure as informações básicas do seu imóvel
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nome do Imóvel *"
                  placeholder="Ex: Loft Centro 402"
                  value={propertyData.name}
                  onChange={e => setPropertyData({ ...propertyData, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Responsável *"
                    placeholder="Ex: Maria"
                    value={propertyData.employee_name}
                    onChange={e => setPropertyData({ ...propertyData, employee_name: e.target.value })}
                  />
                  <Input
                    label="WhatsApp *"
                    placeholder="41999990000"
                    value={propertyData.employee_phone}
                    onChange={e => setPropertyData({ ...propertyData, employee_phone: e.target.value })}
                  />
                </div>
                <Input
                  label="Airbnb iCal URL (opcional)"
                  placeholder="https://airbnb.com/calendar/ical/..."
                  value={propertyData.ical_airbnb}
                  onChange={e => setPropertyData({ ...propertyData, ical_airbnb: e.target.value })}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setCurrentStep('whatsapp')}>
                  <ArrowLeft size={16} className="mr-2" />
                  Voltar
                </Button>
                <Button className="flex-1" onClick={handleSaveProperty} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar e Continuar'}
                </Button>
              </div>

              <button
                onClick={() => setCurrentStep('complete')}
                className="w-full mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors text-center"
              >
                Pular por enquanto
              </button>
            </div>
          )}

          {/* Step 3: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 mx-auto flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Tudo pronto!</h3>
              <p className="text-slate-400 mb-2">
                Sua conta está configurada e pronta para usar.
              </p>
              <p className="text-sm text-slate-500 mb-8">
                As mensagens para sua equipe de limpeza serão enviadas automaticamente às 08:00
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
                <h4 className="text-sm font-medium text-white mb-3">Próximos passos:</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    Adicione mais imóveis na aba "Meus Imóveis"
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    Personalize o template de mensagem em "Configurações"
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    Acompanhe seus checkouts no calendário
                  </li>
                </ul>
              </div>

              <Button className="w-full" onClick={handleComplete}>
                Começar a usar o Mevo
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
