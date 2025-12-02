import React from 'react';
import { Calendar, MessageCircle, LayoutGrid } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';

const BRAND_TEXT_GRADIENT = 'bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#22D3EE]';

interface LandingPageProps {
  onLogin: () => void;
  onRegister?: () => void;
}

export const LandingPage = ({ onLogin, onRegister }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-[#050509] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 border-b border-white/5 bg-[#050509]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex gap-4">
            <Button variant="ghost" onClick={onLogin} className="hidden sm:inline-flex">Fazer Login</Button>
            <Button variant="primary" onClick={onRegister || onLogin}>Criar Conta Gratis</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="pt-32 pb-20 px-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium uppercase tracking-wide mb-8 z-10">
          Automated Property Management
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 z-10 max-w-4xl leading-[1.1]">
          A Gestao do Seu Airbnb, <br />
          <span className={BRAND_TEXT_GRADIENT}>Elevada a Perfeicao.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed z-10">
          Automatize a limpeza com WhatsApp e sincronize calendarios.
          Nunca mais esqueca um checkout.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <Button variant="primary" className="h-12 px-8 text-base" onClick={onRegister || onLogin}>
            Criar Minha Conta
          </Button>
          <Button variant="secondary" className="h-12 px-8 text-base" onClick={onLogin}>
            Fazer Login
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full z-10">
          {[
            { icon: Calendar, title: 'Sincronia iCal', desc: 'Conecte Airbnb e Booking em um so lugar. Atualizacao em tempo real.' },
            { icon: MessageCircle, title: 'Avisos Automaticos', desc: 'O Mevo avisa a faxineira todo dia as 08:00. Zero intervencao humana.' },
            { icon: LayoutGrid, title: 'Painel Unificado', desc: 'Gerencie multiplos imoveis e status de limpeza em uma interface limpa.' }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-xl bg-[#0B0C15] border border-white/5 hover:border-blue-500/30 transition-all hover:bg-[#0E0F1A]">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className="text-white font-medium mb-3 text-lg">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 bg-[#020205] text-center">
        <p className="text-slate-600 text-sm">&copy; {new Date().getFullYear()} mevo.ai - Automacao para anfitrioes exigentes.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
