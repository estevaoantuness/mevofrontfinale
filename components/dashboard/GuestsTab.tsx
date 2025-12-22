import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Mail,
  Phone,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/Button';
import { GuestModal } from './GuestModal';
import { GuestDetailModal } from './GuestDetailModal';
import * as api from '../../lib/api';
import type { GuestFull } from '../../lib/api';

export const GuestsTab: React.FC = () => {
  const [guests, setGuests] = useState<GuestFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Pagination
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestFull | null>(null);

  // Detail modal state
  const [detailGuest, setDetailGuest] = useState<GuestFull | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [page, searchDebounced]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.getGuests({
        search: searchDebounced || undefined,
        limit,
        offset: (page - 1) * limit
      });
      setGuests(result.guests);
      setTotal(result.total);
    } catch (err) {
      setError('Erro ao carregar hospedes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGuest(null);
    setModalOpen(true);
  };

  const handleEdit = (guest: GuestFull) => {
    setEditingGuest(guest);
    setModalOpen(true);
  };

  const handleDelete = async (guest: GuestFull) => {
    if (!confirm(`Tem certeza que deseja excluir o hospede "${guest.name}"?`)) return;

    try {
      await api.deleteGuest(guest.id);
      setGuests(guests.filter(g => g.id !== guest.id));
      setTotal(t => t - 1);
    } catch (err) {
      alert('Erro ao excluir hospede');
    }
  };

  const handleViewDetail = async (guest: GuestFull) => {
    setDetailLoading(true);
    setDetailGuest(guest);
    try {
      const fullGuest = await api.getGuest(guest.id);
      setDetailGuest(fullGuest);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSave = async (data: Partial<GuestFull>) => {
    try {
      if (editingGuest) {
        const updated = await api.updateGuest(editingGuest.id, data);
        setGuests(guests.map(g => g.id === editingGuest.id ? updated : g));
      } else {
        const created = await api.createGuest(data);
        setGuests([created, ...guests]);
        setTotal(t => t + 1);
      }
      setModalOpen(false);
      setEditingGuest(null);
    } catch (err) {
      throw err;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && guests.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Hospedes</h3>
          <p className="text-sm text-slate-500">Gerencie os hospedes cadastrados</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size={16} className="mr-2" /> Novo Hospede
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Guests Table */}
      <div className="bg-[#0B0C15] border border-white/10 rounded-xl overflow-hidden">
        {guests.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Nenhum hospede encontrado</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchDebounced ? 'Tente uma busca diferente' : 'Adicione seu primeiro hospede'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <div className="col-span-3">Nome</div>
              <div className="col-span-3">Contato</div>
              <div className="col-span-2">Documento</div>
              <div className="col-span-2">Cadastro</div>
              <div className="col-span-2 text-right">Acoes</div>
            </div>

            {/* Table Body */}
            {guests.map(guest => (
              <div
                key={guest.id}
                className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors ${
                  !guest.isActive ? 'opacity-50' : ''
                }`}
              >
                {/* Name */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{guest.name}</p>
                    {guest.nationality && (
                      <p className="text-xs text-slate-500">{guest.nationality}</p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="col-span-3 flex flex-col gap-1">
                  {guest.email && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Mail size={12} />
                      <span className="truncate">{guest.email}</span>
                    </div>
                  )}
                  {guest.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Phone size={12} />
                      <span>{guest.phone}</span>
                    </div>
                  )}
                  {!guest.email && !guest.phone && (
                    <span className="text-xs text-slate-600">Sem contato</span>
                  )}
                </div>

                {/* Document */}
                <div className="col-span-2">
                  {guest.document ? (
                    <div>
                      <span className="text-xs text-slate-300 font-mono">{guest.document}</span>
                      {guest.documentType && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-500 uppercase">
                          {guest.documentType}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">-</span>
                  )}
                </div>

                {/* Created */}
                <div className="col-span-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={12} />
                  <span>{formatDate(guest.createdAt)}</span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleViewDetail(guest)}
                    className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                    title="Ver detalhes"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(guest)}
                    className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(guest)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total} hospedes
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      page === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Guest Modal */}
      <GuestModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingGuest(null);
        }}
        onSave={handleSave}
        guest={editingGuest}
      />

      {/* Guest Detail Modal */}
      <GuestDetailModal
        isOpen={!!detailGuest}
        onClose={() => setDetailGuest(null)}
        guest={detailGuest}
        loading={detailLoading}
        onEdit={(guest) => {
          setDetailGuest(null);
          handleEdit(guest);
        }}
      />
    </div>
  );
};

export default GuestsTab;
