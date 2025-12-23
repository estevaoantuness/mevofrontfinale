import React, { useState, useEffect } from 'react';
import { Mail, Calendar, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getProfile, updateProfile, Profile } from '../../lib/api';
import { useTheme } from '../../lib/ThemeContext';

interface ProfileTabProps {
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onLogout }) => {
  const { isDark } = useTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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

      {/* Profile Info */}
      <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.name || 'Usuário'}</h3>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                'Salvar Alterações'
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
      <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0B0C15] border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Informações da Conta</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
            <Mail className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className={isDark ? 'text-white' : 'text-slate-900'}>{profile?.email}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'bg-[#050509]' : 'bg-slate-50'}`}>
            <Calendar className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <div>
              <p className="text-xs text-slate-500">Membro desde</p>
              <p className={isDark ? 'text-white' : 'text-slate-900'}>
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
    </div>
  );
};

export default ProfileTab;
