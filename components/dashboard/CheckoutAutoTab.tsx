import React, { useState, useEffect } from 'react';
import { Bell, Phone, Clock, MessageSquare, Save, Loader2, CheckCircle, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../lib/ThemeContext';
import * as api from '../../lib/api';

interface CheckoutConfig {
  defaultEmployeePhone: string;
  defaultCheckoutTime: string;
  defaultCheckoutMessage: string;
}

const DEFAULT_MESSAGE = 'Olá! Hoje tem checkout no {propriedade} às {horário}. Bom trabalho!';

export const CheckoutAutoTab: React.FC = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('08:00');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  // Defaults checkboxes
  const [phoneAsDefault, setPhoneAsDefault] = useState(true);
  const [timeAsDefault, setTimeAsDefault] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settings = await api.getSettings();

      if (settings.default_employee_phone) {
        setPhone(settings.default_employee_phone);
      }
      if (settings.default_checkout_time) {
        setTime(settings.default_checkout_time);
      }
      if (settings.default_checkout_message) {
        setMessage(settings.default_checkout_message);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      // Save all settings
      await Promise.all([
        api.updateSetting('default_employee_phone', phone),
        api.updateSetting('default_checkout_time', time),
        api.updateSetting('default_checkout_message', message)
      ]);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Erro ao salvar configurações');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Formata como +55 (XX) XXXXX-XXXX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `+${numbers.slice(0, 2)} (${numbers.slice(2)}`;
    if (numbers.length <= 9) return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4)}`;
    return `+${numbers.slice(0, 2)} (${numbers.slice(2, 4)}) ${numbers.slice(4, 9)}-${numbers.slice(9, 13)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  // Preview with variables replaced
  const previewMessage = message
    .replace('{propriedade}', 'Apartamento Centro 402')
    .replace('{horário}', time);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-50'
        }`}>
          <Bell className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Checkout Automático
        </h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Configure avisos automáticos de checkout para sua equipe de limpeza
        </p>
      </div>

      {/* Phone Number */}
      <div className={`rounded-xl p-6 ${
        isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-green-500/10' : 'bg-green-50'
          }`}>
            <Phone className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <div>
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Número do Responsável
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              WhatsApp que receberá os avisos de checkout
            </p>
          </div>
        </div>

        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+55 (11) 99999-9999"
          className={`w-full rounded-lg px-4 py-3 text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white placeholder-slate-500'
              : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
          }`}
        />

        <label className={`flex items-center gap-2 mt-3 cursor-pointer ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <input
            type="checkbox"
            checked={phoneAsDefault}
            onChange={(e) => setPhoneAsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/40"
          />
          <span className="text-sm">Usar como padrão para novos imóveis</span>
        </label>
      </div>

      {/* Time */}
      <div className={`rounded-xl p-6 ${
        isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-orange-500/10' : 'bg-orange-50'
          }`}>
            <Clock className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
          <div>
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Horário do Envio
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Quando a mensagem será enviada automaticamente
            </p>
          </div>
        </div>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={`w-full sm:w-32 rounded-lg px-4 py-3 text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white'
              : 'bg-slate-50 border border-slate-200 text-slate-900'
          }`}
        />

        <label className={`flex items-center gap-2 mt-3 cursor-pointer ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <input
            type="checkbox"
            checked={timeAsDefault}
            onChange={(e) => setTimeAsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500/40"
          />
          <span className="text-sm">Usar como padrão para novos imóveis</span>
        </label>
      </div>

      {/* Message */}
      <div className={`rounded-xl p-6 ${
        isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-purple-500/10' : 'bg-purple-50'
          }`}>
            <MessageSquare className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <div>
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Mensagem
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Personalize o texto enviado
            </p>
          </div>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className={`w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none ${
            isDark
              ? 'bg-white/5 border border-white/10 text-white placeholder-slate-500'
              : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
          }`}
        />

        {/* Variables */}
        <div className={`flex items-center gap-2 mt-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          <Info className="w-4 h-4" />
          <span className="text-xs">
            Variáveis disponíveis:
            <code className={`mx-1 px-1.5 py-0.5 rounded ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>{'{propriedade}'}</code>
            <code className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>{'{horário}'}</code>
          </span>
        </div>

        {/* Preview */}
        <div className={`mt-4 p-4 rounded-lg ${
          isDark ? 'bg-green-500/5 border border-green-500/20' : 'bg-green-50 border border-green-200'
        }`}>
          <p className={`text-xs font-medium mb-2 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            Preview da mensagem:
          </p>
          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {previewMessage}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSave}
          disabled={saving || !phone}
          className="w-full sm:w-auto px-8"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <div className={`rounded-xl p-4 ${
        isDark ? 'bg-blue-500/5 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex gap-3">
          <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <p className="font-medium mb-1">Como funciona?</p>
            <ul className="space-y-1 text-xs opacity-80">
              <li>• O sistema verifica seus calendários iCal todos os dias</li>
              <li>• Quando detecta um checkout para o dia, envia a mensagem automaticamente</li>
              <li>• A mensagem é enviada no horário configurado via WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAutoTab;
