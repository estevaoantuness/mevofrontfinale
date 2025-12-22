import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Trash2, Loader2, AlertTriangle, Check, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getProfile, updateProfile, deleteAccount, getPreferences, updatePreferences, Profile, UserPreferences } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ProfileTabProps {
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onLogout }) => {
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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
      setName(data.name || '');
      setPhone(data.phone || '');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');

    try {
      const updated = await updateProfile({ name, phone: phone || undefined });
      setProfile(prev => prev ? { ...prev, ...updated } : null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Profile Info */}
      <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{profile?.name || 'Usuario'}</h3>
            <p className="text-slate-400">{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
            <Input
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Alteracoes'
              )}
            </Button>
            {saved && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <Check size={16} />
                Salvo!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informações da Conta</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-[#050509] rounded-lg">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-white">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#050509] rounded-lg">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Membro desde</p>
              <p className="text-white">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric'
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Preferências</h3>
          {prefsSaved && (
            <span className="text-sm text-green-400 flex items-center gap-1">
              <Check size={16} />
              Salvo!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm text-slate-400 mb-3">Tema</label>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('dark')}
                disabled={savingPrefs}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-[#050509] border-white/10 text-slate-400 hover:border-white/20'
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
                    : 'bg-[#050509] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <Sun size={20} />
                <span className="font-medium">Light</span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm text-slate-400 mb-3">Idioma</label>
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
                      : 'bg-[#050509] border-white/10 text-slate-400 hover:border-white/20'
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
        <div className="bg-[#0B0C15] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Estatisticas</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#050509] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{profile.stats.properties}</p>
              <p className="text-sm text-slate-400">Propriedades</p>
            </div>
            <div className="bg-[#050509] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{profile.stats.reservations}</p>
              <p className="text-sm text-slate-400">Reservas</p>
            </div>
            <div className="bg-[#050509] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{profile.stats.guests}</p>
              <p className="text-sm text-slate-400">Hóspedes</p>
            </div>
            <div className="bg-[#050509] rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-white">{profile.stats.whatsappInstances}</p>
              <p className="text-sm text-slate-400">WhatsApps</p>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-[#0B0C15] border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Zona de Perigo
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Acoes irreversiveis. Prossiga com cuidado.
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
          <div className="bg-red-500/10 rounded-lg p-4 space-y-4">
            <p className="text-sm text-red-400">
              Esta acao ira deletar permanentemente sua conta, todas as propriedades, reservas e dados.
              Digite <code className="px-1 py-0.5 bg-red-500/20 rounded">DELETE_MY_ACCOUNT</code> para confirmar.
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
                  'Confirmar Delecao'
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

export default ProfileTab;
