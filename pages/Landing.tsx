import React, { useState } from 'react';
import { Calendar, MessageCircle, LayoutGrid, Zap, Shield, Clock, Building2, User, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { PricingSection } from '../components/pricing/PricingSection';
import { CheckoutModal } from '../components/billing/CheckoutModal';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';

const BRAND_TEXT_GRADIENT = 'bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#22D3EE]';

// Planos para o CheckoutModal
const PLANS_DATA = {
  starter: { id: 'starter', name: 'Starter', monthlyPrice: 67, yearlyPrice: 49, features: ['Até 3 propriedades', 'Sync iCal', 'Automações básicas', 'Integração WhatsApp'], hasTrial: false },
  pro: { id: 'pro', name: 'Pro', monthlyPrice: 197, yearlyPrice: 149, features: ['Até 10 propriedades', 'Tudo do Starter', 'Webhooks', 'Suporte prioritário'], hasTrial: true, trialDays: 10 },
  agency: { id: 'agency', name: 'Agency', monthlyPrice: 379, yearlyPrice: 289, features: ['Até 30 propriedades', 'Tudo do Pro', 'Multi-usuários', 'API completa'], hasTrial: false }
};

interface LandingPageProps {
  onLogin: () => void;
  onRegister?: () => void;
  onDashboard?: () => void;
  onProfile?: () => void;
}

export const LandingPage = ({ onLogin, onRegister, onDashboard, onProfile }: LandingPageProps) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    plan: typeof PLANS_DATA.starter | null;
    interval: 'monthly' | 'yearly';
  }>({ isOpen: false, plan: null, interval: 'yearly' });

  const handleSelectPlan = (planId: string, interval: 'monthly' | 'yearly') => {
    const plan = PLANS_DATA[planId as keyof typeof PLANS_DATA];
    if (!plan) return;

    if (isAuthenticated) {
      // Usuário logado - abre checkout direto
      setCheckoutModal({ isOpen: true, plan, interval });
    } else {
      // Usuário não logado - salva plano e redireciona para registro
      localStorage.setItem('mevo_pending_plan', JSON.stringify({ planId, interval }));
      onRegister?.();
    }
  };
  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 ${isDark ? 'bg-[#050509] text-slate-300' : 'bg-[#F8FAFC] text-slate-700'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-40 border-b backdrop-blur-md ${isDark ? 'border-white/5 bg-[#050509]/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex gap-3 items-center">
            {/* Language and Theme Controls */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher compact />
              <ThemeToggle />
            </div>
            {isAuthenticated && user ? (
              <>
                <Button
                  variant="primary"
                  onClick={onDashboard}
                  className="flex items-center gap-2"
                >
                  <Building2 size={18} />
                  <span className="hidden sm:inline">{t('nav.myProperties')}</span>
                </Button>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-slate-100 hover:bg-slate-200 border-slate-200'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className={`hidden sm:inline text-sm font-medium max-w-[120px] truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {user.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${isDark ? 'text-slate-400' : 'text-slate-500'} ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className={`absolute right-0 mt-2 w-48 py-2 border rounded-xl shadow-xl z-50 ${isDark ? 'bg-[#0B0C15] border-white/10' : 'bg-white border-slate-200'}`}>
                        <button
                          onClick={() => { onDashboard?.(); setUserMenuOpen(false); }}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                          <Building2 size={16} />
                          {t('nav.myProperties')}
                        </button>
                        <button
                          onClick={() => { onProfile?.(); setUserMenuOpen(false); }}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                          <User size={16} />
                          {t('nav.myProfile')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={onLogin} className="hidden sm:inline-flex">{t('nav.login')}</Button>
                <Button variant="primary" onClick={onRegister || onLogin}>{t('nav.register')}</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="pt-32 pb-20 px-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow Effect */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/20'}`} />

        <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-medium uppercase tracking-wide mb-8 z-10">
          {t('landing.hero.badge')}
        </div>

        <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 z-10 max-w-4xl leading-[1.1] ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t('landing.hero.title')} <br />
          <span className={BRAND_TEXT_GRADIENT}>{t('landing.hero.titleGradient')}</span>
        </h1>

        <p className={`text-lg md:text-xl max-w-2xl mb-10 leading-relaxed z-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {t('landing.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <Button variant="primary" className="h-12 px-8 text-base" onClick={onRegister || onLogin}>
            {t('landing.cta.createAccount')}
          </Button>
          <Button variant="secondary" className="h-12 px-8 text-base" onClick={onLogin}>
            {t('landing.cta.login')}
          </Button>
        </div>

        {/* Features Grid - 6 features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full z-10">
          {[
            { icon: Calendar, titleKey: 'landing.features.icalSync.title', descKey: 'landing.features.icalSync.desc' },
            { icon: MessageCircle, titleKey: 'landing.features.autoNotify.title', descKey: 'landing.features.autoNotify.desc' },
            { icon: LayoutGrid, titleKey: 'landing.features.dashboard.title', descKey: 'landing.features.dashboard.desc' },
            { icon: Zap, titleKey: 'landing.features.automations.title', descKey: 'landing.features.automations.desc' },
            { icon: Shield, titleKey: 'landing.features.security.title', descKey: 'landing.features.security.desc' },
            { icon: Clock, titleKey: 'landing.features.saveTime.title', descKey: 'landing.features.saveTime.desc' }
          ].map((feature, i) => (
            <div key={i} className={`group p-8 rounded-xl border transition-all ${isDark ? 'bg-[#0B0C15] border-white/5 hover:border-blue-500/30 hover:bg-[#0E0F1A]' : 'bg-white border-slate-200 hover:border-blue-500/50 hover:shadow-lg'}`}>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className={`font-medium mb-3 text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{t(feature.titleKey)}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t(feature.descKey)}</p>
            </div>
          ))}
        </div>
      </main>

      {/* How It Works Section */}
      <section className={`py-24 px-6 ${isDark ? 'bg-[#020205]' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('landing.howItWorks.title')}
            </h2>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', titleKey: 'landing.howItWorks.step1.title', descKey: 'landing.howItWorks.step1.desc' },
              { step: '2', titleKey: 'landing.howItWorks.step2.title', descKey: 'landing.howItWorks.step2.desc' },
              { step: '3', titleKey: 'landing.howItWorks.step3.title', descKey: 'landing.howItWorks.step3.desc' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t(item.titleKey)}</h3>
                <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection onSelectPlan={handleSelectPlan} />

      {/* Testimonials Section */}
      <section className={`py-24 px-6 ${isDark ? 'bg-[#020205]' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('landing.testimonials.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { nameKey: 'landing.testimonials.testimonial1.name', roleKey: 'landing.testimonials.testimonial1.role', quoteKey: 'landing.testimonials.testimonial1.quote' },
              { nameKey: 'landing.testimonials.testimonial2.name', roleKey: 'landing.testimonials.testimonial2.role', quoteKey: 'landing.testimonials.testimonial2.quote' },
              { nameKey: 'landing.testimonials.testimonial3.name', roleKey: 'landing.testimonials.testimonial3.role', quoteKey: 'landing.testimonials.testimonial3.quote' }
            ].map((testimonial, i) => (
              <div key={i} className={`p-8 rounded-xl border ${isDark ? 'bg-[#0B0C15] border-white/10' : 'bg-white border-slate-200'}`}>
                <p className={`mb-6 italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>"{t(testimonial.quoteKey)}"</p>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t(testimonial.nameKey)}</p>
                  <p className="text-sm text-slate-500">{t(testimonial.roleKey)}</p>
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
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t('landing.faq.title')}
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { qKey: 'landing.faq.q1.question', aKey: 'landing.faq.q1.answer' },
              { qKey: 'landing.faq.q2.question', aKey: 'landing.faq.q2.answer' },
              { qKey: 'landing.faq.q3.question', aKey: 'landing.faq.q3.answer' },
              { qKey: 'landing.faq.q4.question', aKey: 'landing.faq.q4.answer' },
              { qKey: 'landing.faq.q5.question', aKey: 'landing.faq.q5.answer' }
            ].map((faq, i) => (
              <details key={i} className={`group p-6 rounded-xl border ${isDark ? 'bg-[#0B0C15] border-white/10' : 'bg-white border-slate-200'}`}>
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{t(faq.qKey)}</span>
                  <span className={`group-open:rotate-180 transition-transform ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t(faq.aKey)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={`py-24 px-6 ${isDark ? 'bg-gradient-to-b from-[#050509] to-blue-900/20' : 'bg-gradient-to-b from-white to-blue-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('landing.finalCta.title')}
          </h2>
          <p className={`text-lg mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('landing.finalCta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" className="h-14 px-10 text-lg" onClick={onRegister || onLogin}>
              {t('landing.cta.startFree')}
            </Button>
            <Button variant="secondary" className="h-14 px-10 text-lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('landing.cta.viewPlans')}
            </Button>
          </div>
        </div>
      </section>

      <footer className={`border-t py-12 text-center ${isDark ? 'border-white/5 bg-[#020205]' : 'border-slate-200 bg-slate-50'}`}>
        <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} {t('landing.footer.copyright')}</p>
      </footer>

      {/* Checkout Modal */}
      {checkoutModal.plan && (
        <CheckoutModal
          isOpen={checkoutModal.isOpen}
          onClose={() => setCheckoutModal({ isOpen: false, plan: null, interval: 'yearly' })}
          plan={checkoutModal.plan}
          interval={checkoutModal.interval}
        />
      )}
    </div>
  );
};

export default LandingPage;
