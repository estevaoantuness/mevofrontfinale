import React, { useState, useEffect } from 'react';
import { Sun, Moon, Trash2, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getProfile, deleteAccount, updatePreferences, Profile } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from 'react-i18next';

interface SettingsTabProps {
  onLogout: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onLogout }) => {
  const { theme, setTheme, isDark } = useTheme();
  const { i18n } = useTranslation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Preferences state
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: 'dark' | 'light') => {
    setSavingPrefs(true);
    try {
      setTheme(newTheme);
      await updatePreferences({ theme: newTheme });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar preferências');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleLanguageChange = async (newLang: 'pt-BR' | 'en' | 'es-419') => {
    setSavingPrefs(true);
    try {
      i18n.changeLanguage(newLang);
      await updatePreferences({ language: newLang });
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar preferências');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'DELETE_MY_ACCOUNT') {
      setError('Digite DELETE_MY_ACCOUNT para confirmar');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await deleteAccount('DELETE_MY_ACCOUNT');
      onLogout();
    } catch (err: any) {
      setError(err.message || 'Erro ao deletar conta');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Error */}
      {error && (
        <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Preferences */}
      <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Preferências</h3>
          {prefsSaved && (
            <span className="text-sm text-green-400 flex items-center gap-1">
              <Check size={16} />
              Salvo!
            </span>
          )}
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className={`block text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tema</label>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('dark')}
                disabled={savingPrefs}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : isDark
                      ? 'bg-[#050509] border-white/10 text-slate-400 hover:border-white/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Moon size={20} />
                <span className="font-medium">Dark</span>
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                disabled={savingPrefs}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                  theme === 'light'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : isDark
                      ? 'bg-[#050509] border-white/10 text-slate-400 hover:border-white/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Sun size={20} />
                <span className="font-medium">Light</span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className={`block text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Idioma</label>
            <div className="flex gap-2">
              {[
                { code: 'pt-BR', label: '(pt-br)' },
                { code: 'en', label: '(en)' },
                { code: 'es-419', label: '(es)' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as 'pt-BR' | 'en' | 'es-419')}
                  disabled={savingPrefs}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                    i18n.language === lang.code
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : isDark
                        ? 'bg-[#050509] border-white/10 text-slate-400 hover:border-white/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      {profile?.stats && (
        <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Estatísticas</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 text-center ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.stats.properties}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Propriedades</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.stats.reservations}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Reservas</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.stats.employees}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Funcionários</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.stats.whatsappInstances}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>WhatsApps</p>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-red-500/20' : 'bg-white border border-red-200 shadow-sm'}`}>
        <h3 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Zona de Perigo
        </h3>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Ações irreversíveis. Prossiga com cuidado.
        </p>

        {!showDeleteConfirm ? (
          <Button
            variant="secondary"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar Minha Conta
          </Button>
        ) : (
          <div className={`rounded-lg p-4 space-y-4 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              Esta ação irá deletar permanentemente sua conta, todas as propriedades, reservas e dados.
              Digite <code className={`px-1 py-0.5 rounded ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>DELETE_MY_ACCOUNT</code> para confirmar.
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE_MY_ACCOUNT"
            />
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={handleDelete}
                disabled={deleting || deleteConfirmText !== 'DELETE_MY_ACCOUNT'}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmar Deleção'
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
