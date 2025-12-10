import React from 'react';
import {
    LayoutGrid,
    Home,
    MessageCircle,
    LogOut,
    Settings,
    ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import { useAuth } from '../../lib/AuthContext';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const NavItem = ({
    id,
    icon: Icon,
    label,
    activeTab,
    onClick
}: {
    id: string;
    icon: React.ElementType;
    label: string;
    activeTab: string;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all mb-1 ${activeTab === id
                ? 'bg-white/5 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
            }`}
    >
        <Icon size={16} className={`mr-3 ${activeTab === id ? 'text-blue-400' : 'text-slate-500'}`} />
        {label}
    </button>
);

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#080911] flex flex-col">
            <div className="h-14 flex items-center px-6 border-b border-white/5">
                <Logo size="text-lg" />
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    PRO
                </span>
            </div>

            <nav className="flex-1 p-3">
                <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Menu
                </div>
                <NavItem id="overview" icon={LayoutGrid} label="Visão Geral" activeTab={activeTab} onClick={() => onTabChange('overview')} />
                <NavItem id="properties" icon={Home} label="Meus Imóveis" activeTab={activeTab} onClick={() => onTabChange('properties')} />
                <NavItem id="whatsapp" icon={MessageCircle} label="Conexão WhatsApp" activeTab={activeTab} onClick={() => onTabChange('whatsapp')} />
                <NavItem id="settings" icon={Settings} label="Configurações" activeTab={activeTab} onClick={() => onTabChange('settings')} />
            </nav>

            <div className="p-4 border-t border-white/5">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        {user ? getInitials(user.name) : 'U'}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {user?.email || ''}
                        </p>
                    </div>
                </div>
                <div className="space-y-1">
                    <Link
                        to="/"
                        className="w-full flex items-center px-2 py-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors"
                    >
                        <ExternalLink size={14} className="mr-2" /> Ver Site
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-2 py-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={14} className="mr-2" /> Sair da conta
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
