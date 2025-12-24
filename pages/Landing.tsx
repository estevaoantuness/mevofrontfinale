import React, { useState, useCallback } from 'react';
import { Layers, Sparkles, Calculator, MessageCircle, LayoutGrid, Bot, Building2, User, ChevronDown } from 'lucide-react';
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
  starter: { id: 'starter', name: 'Starter', monthlyPrice: 67, yearlyPrice: 49, features: ['Até 3 propriedades', 'Sync iCal (Airbnb/Booking)', 'Integração WhatsApp', 'Templates com placeholders', 'Avisos de checkout', '1 usuário'], hasTrial: false },
  pro: { id: 'pro', name: 'Pro', monthlyPrice: 197, yearlyPrice: 149, features: ['Até 10 propriedades', 'Sync iCal (Airbnb/Booking)', 'Integração WhatsApp', 'Templates com placeholders', 'Avisos de checkout', 'Calculadora de Preços IA', 'Webhooks personalizados', 'Até 3 usuários', 'Suporte prioritário'], hasTrial: true, trialDays: 10 },
  agency: { id: 'agency', name: 'Agency', monthlyPrice: 379, yearlyPrice: 289, features: ['Até 30 propriedades', 'Sync iCal (Airbnb/Booking)', 'Integração WhatsApp', 'Templates com placeholders', 'Avisos de checkout', 'Calculadora de Preços IA', 'Webhooks personalizados', 'Maya IA (em breve)', 'Multi-usuários (até 10)', 'API Access', 'Suporte dedicado', 'Gerente dedicado'], hasTrial: false }
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

  // Navegação direta (sem delay - Dashboard já tem loading overlay)
  const handleNavigate = useCallback((_target: 'login' | 'register' | 'dashboard' | 'profile', callback?: () => void) => {
    callback?.();
  }, []);

  const handleNavigateToDashboard = useCallback(() => {
    handleNavigate('dashboard', onDashboard);
  }, [handleNavigate, onDashboard]);

  const handleNavigateToProfile = useCallback(() => {
    handleNavigate('profile', onProfile);
  }, [handleNavigate, onProfile]);

  const handleNavigateToLogin = useCallback(() => {
    handleNavigate('login', onLogin);
  }, [handleNavigate, onLogin]);

  const handleNavigateToRegister = useCallback(() => {
    handleNavigate('register', onRegister);
  }, [handleNavigate, onRegister]);

  const handleSelectPlan = (planId: string, interval: 'monthly' | 'yearly') => {
    const plan = PLANS_DATA[planId as keyof typeof PLANS_DATA];
    if (!plan) return;

    if (isAuthenticated) {
      // Usuário logado - abre checkout direto
      setCheckoutModal({ isOpen: true, plan, interval });
    } else {
      // Usuário não logado - salva plano e redireciona para registro
      localStorage.setItem('mevo_pending_plan', JSON.stringify({ planId, interval }));
      handleNavigateToRegister();
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 ${isDark ? 'bg-[#050509] text-slate-300' : 'bg-[#F8FAFC] text-slate-700'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-40 border-b backdrop-blur-md ${isDark ? 'border-white/5 bg-[#050509]/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Logo size="text-xl sm:text-2xl" />
          <div className="flex gap-2 sm:gap-3 items-center">
            {/* Language and Theme Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <LanguageSwitcher compact />
              <ThemeToggle />
            </div>
            {isAuthenticated && user ? (
              <>
                <Button
                  variant="primary"
                  onClick={handleNavigateToDashboard}
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
                          onClick={() => { handleNavigateToDashboard(); setUserMenuOpen(false); }}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                          <Building2 size={16} />
                          {t('nav.myProperties')}
                        </button>
                        <button
                          onClick={() => { handleNavigateToProfile(); setUserMenuOpen(false); }}
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
                <Button variant="ghost" onClick={handleNavigateToLogin} className="hidden sm:inline-flex">{t('nav.login')}</Button>
                <Button variant="primary" onClick={handleNavigateToRegister}>{t('nav.register')}</Button>
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
          {isAuthenticated ? (
            <>
              <Button variant="primary" className="h-12 px-8 text-base" onClick={handleNavigateToDashboard}>
                <Building2 size={20} className="mr-2" />
                {t('landing.cta.manageProperties')}
              </Button>
              <Button variant="secondary" className="h-12 px-8 text-base" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                {t('landing.cta.viewPlans')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="primary" className="h-12 px-8 text-base" onClick={handleNavigateToRegister}>
                {t('landing.cta.createAccount')}
              </Button>
              <Button variant="secondary" className="h-12 px-8 text-base" onClick={handleNavigateToLogin}>
                {t('landing.cta.login')}
              </Button>
            </>
          )}
        </div>

        {/* Features Grid - 6 features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full z-10">
          {[
            { icon: Layers, key: 'multiPlatform' },
            { icon: Sparkles, key: 'autoCleaning' },
            { icon: Calculator, key: 'priceCalculator', badge: t('landing.features.priceCalculator.badge') },
            { icon: MessageCircle, key: 'smartMessages' },
            { icon: LayoutGrid, key: 'dashboard' },
            { icon: Bot, key: 'maya', badge: t('landing.features.maya.badge'), comingSoon: t('landing.features.maya.comingSoon') }
          ].map((feature, i) => (
            <div key={i} className={`group p-8 rounded-xl border transition-all relative ${isDark ? 'bg-[#0B0C15] border-white/5 hover:border-blue-500/30 hover:bg-[#0E0F1A]' : 'bg-white border-slate-200 hover:border-blue-500/50 hover:shadow-lg'}`}>
              {feature.badge && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${feature.key === 'maya' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {feature.badge}
                  </span>
                  {feature.comingSoon && (
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded">
                      {feature.comingSoon}
                    </span>
                  )}
                </div>
              )}
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className={`font-medium mb-3 text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{t(`landing.features.${feature.key}.title`)}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t(`landing.features.${feature.key}.desc`)}</p>
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
            {isAuthenticated ? t('landing.finalCta.loggedInTitle') : t('landing.finalCta.title')}
          </h2>
          <p className={`text-lg mb-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isAuthenticated ? t('landing.finalCta.loggedInSubtitle') : t('landing.finalCta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button variant="primary" className="h-14 px-10 text-lg" onClick={handleNavigateToDashboard}>
                  <Building2 size={22} className="mr-2" />
                  {t('landing.cta.goToDashboard')}
                </Button>
                <Button variant="secondary" className="h-14 px-10 text-lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                  {t('landing.cta.viewPlans')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" className="h-14 px-10 text-lg" onClick={handleNavigateToRegister}>
                  {t('landing.cta.startFree')}
                </Button>
                <Button variant="secondary" className="h-14 px-10 text-lg" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                  {t('landing.cta.viewPlans')}
                </Button>
              </>
            )}
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
