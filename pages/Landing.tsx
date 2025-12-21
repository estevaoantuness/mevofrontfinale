import React from 'react';
import { Calendar, MessageCircle, LayoutGrid, Zap, Shield, Clock } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { PricingSection } from '../components/pricing/PricingSection';

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

        {/* Features Grid - 6 features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full z-10">
          {[
            { icon: Calendar, title: 'Sincronia iCal', desc: 'Conecte Airbnb, Booking e VRBO em um so lugar. Atualizacao em tempo real.' },
            { icon: MessageCircle, title: 'Avisos Automaticos', desc: 'O Mevo avisa a faxineira todo dia as 08:00. Zero intervencao humana.' },
            { icon: LayoutGrid, title: 'Painel Unificado', desc: 'Gerencie multiplos imoveis e status de limpeza em uma interface limpa.' },
            { icon: Zap, title: 'Automacoes Inteligentes', desc: 'Check-in, checkout, limpeza e reviews automatizados. Configure uma vez.' },
            { icon: Shield, title: 'Seguro e Confiavel', desc: 'Seus dados protegidos com criptografia. Uptime de 99.9% garantido.' },
            { icon: Clock, title: 'Economize Tempo', desc: 'Reduza 80% do tempo gasto com gestao manual. Foque no que importa.' }
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

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-[#020205]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-slate-400">
              Comece a automatizar em 3 passos simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Conecte seus calendarios', desc: 'Cole os links iCal do Airbnb, Booking ou VRBO. Sincronizacao instantanea.' },
              { step: '2', title: 'Configure sua equipe', desc: 'Cadastre suas faxineiras com nome e WhatsApp. Pronto para receber avisos.' },
              { step: '3', title: 'Relaxe e acompanhe', desc: 'O Mevo envia avisos automaticos. Voce so acompanha pelo painel.' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection onSelectPlan={(planId, interval) => {
        console.log('Selected plan:', planId, interval);
        onRegister?.();
      }} />

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-[#020205]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              O que dizem nossos clientes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Marina S.', role: 'Superhost - SP', quote: 'O Mevo mudou minha vida. Antes eu passava horas coordenando limpezas, agora e tudo automatico.' },
              { name: 'Roberto C.', role: '8 imoveis - RJ', quote: 'Gerencio 8 apartamentos sozinho gracas ao Mevo. A sincronia de calendarios e perfeita.' },
              { name: 'Ana Paula M.', role: 'Superhost - SC', quote: 'Minhas faxineiras adoram receber os avisos no WhatsApp. Nunca mais tive problemas com checkout.' }
            ].map((testimonial, i) => (
              <div key={i} className="p-8 rounded-xl bg-[#0B0C15] border border-white/10">
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Preciso instalar algum aplicativo?', a: 'Nao! O Mevo funciona 100% pelo navegador. Basta fazer login e comecar a usar.' },
              { q: 'Funciona com Booking.com e VRBO?', a: 'Sim! Integramos via iCal com Airbnb, Booking.com, VRBO e qualquer plataforma que suporte calendario iCal.' },
              { q: 'Posso cancelar a qualquer momento?', a: 'Claro! Sem fidelidade, sem multas. Cancele quando quiser pelo painel.' },
              { q: 'Como funciona o trial de 14 dias?', a: 'O plano Pro oferece 14 dias gratis sem precisar de cartao. Teste todas as funcionalidades antes de decidir.' },
              { q: 'Meus dados estao seguros?', a: 'Sim! Usamos criptografia de ponta a ponta e servidores seguros. Seus dados nunca sao compartilhados.' }
            ].map((faq, i) => (
              <details key={i} className="group p-6 rounded-xl bg-[#0B0C15] border border-white/10">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-white font-medium">{faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-slate-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#050509] to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para automatizar?
          </h2>
          <p className="text-lg text-slate-400 mb-10">
            Junte-se a centenas de anfitrioes que ja economizam tempo com o Mevo.
            Comece gratis hoje mesmo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" className="h-14 px-10 text-lg" onClick={onRegister || onLogin}>
              Comecar Gratis Agora
            </Button>
            <Button variant="secondary" className="h-14 px-10 text-lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 bg-[#020205] text-center">
        <p className="text-slate-600 text-sm">&copy; {new Date().getFullYear()} mevo.ai - Automacao para anfitrioes exigentes.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
