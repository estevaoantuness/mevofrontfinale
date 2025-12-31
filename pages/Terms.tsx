import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useTheme } from '../lib/ThemeContext';

export const Terms: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const sectionClass = `mb-8 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;
  const headingClass = `text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`;
  const subheadingClass = `text-lg font-medium mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`;
  const paragraphClass = 'mb-4 leading-relaxed';
  const listClass = 'list-disc list-inside mb-4 space-y-2';

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-[#050509] text-slate-300' : 'bg-[#F8FAFC] text-slate-700'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${isDark ? 'border-white/5 bg-[#050509]/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <Logo size="sm" />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Termos de Uso
        </h1>
        <p className={`text-sm mb-8 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          Ultima atualizacao: 1 de Janeiro de 2025
        </p>

        {/* 1. Aceitacao */}
        <section className={sectionClass}>
          <h2 className={headingClass}>1. Aceitacao dos Termos</h2>
          <p className={paragraphClass}>
            Ao acessar ou usar a plataforma Mevo ("Servico"), voce concorda em ficar vinculado a estes Termos de Uso.
            Se voce nao concordar com qualquer parte destes termos, nao podera acessar ou usar o Servico.
          </p>
          <p className={paragraphClass}>
            Estes termos se aplicam a todos os visitantes, usuarios e outras pessoas que acessam ou usam o Servico.
          </p>
        </section>

        {/* 2. Descricao do Servico */}
        <section className={sectionClass}>
          <h2 className={headingClass}>2. Descricao do Servico</h2>
          <p className={paragraphClass}>
            A Mevo e uma plataforma de automacao para gestao de imoveis de temporada que oferece:
          </p>
          <ul className={listClass}>
            <li>Sincronizacao de calendarios (Airbnb, Booking e outros)</li>
            <li>Envio automatico de mensagens via WhatsApp</li>
            <li>Gestao de reservas e hospedes</li>
            <li>Notificacoes de check-in e check-out</li>
            <li>Templates personalizaveis de mensagens</li>
            <li>Calculadora de precos com inteligencia artificial</li>
          </ul>
        </section>

        {/* 3. Cadastro e Conta */}
        <section className={sectionClass}>
          <h2 className={headingClass}>3. Cadastro e Conta</h2>
          <h3 className={subheadingClass}>3.1 Requisitos</h3>
          <p className={paragraphClass}>
            Para usar o Servico, voce deve ter pelo menos 18 anos e capacidade legal para celebrar contratos.
            Ao criar uma conta, voce declara que as informacoes fornecidas sao verdadeiras e precisas.
          </p>
          <h3 className={subheadingClass}>3.2 Seguranca da Conta</h3>
          <p className={paragraphClass}>
            Voce e responsavel por manter a confidencialidade de sua conta e senha.
            Voce concorda em notificar-nos imediatamente sobre qualquer uso nao autorizado de sua conta.
          </p>
        </section>

        {/* 4. Pagamentos */}
        <section className={sectionClass}>
          <h2 className={headingClass}>4. Pagamentos e Assinaturas</h2>
          <h3 className={subheadingClass}>4.1 Planos</h3>
          <p className={paragraphClass}>
            Oferecemos diferentes planos de assinatura (Starter, Pro e Agency) com diferentes recursos e limites.
            Os precos e recursos de cada plano estao disponiveis em nossa pagina de precos.
          </p>
          <h3 className={subheadingClass}>4.2 Periodo de Teste</h3>
          <p className={paragraphClass}>
            O plano Pro oferece um periodo de teste gratuito de 10 dias. Durante o teste, voce tera acesso a todas
            as funcionalidades do plano. Apos o periodo de teste, sera necessario assinar um plano pago para
            continuar usando o Servico.
          </p>
          <h3 className={subheadingClass}>4.3 Cobranca</h3>
          <p className={paragraphClass}>
            As assinaturas sao cobradas de forma recorrente (mensal ou anual). Os pagamentos sao processados
            de forma segura atraves do Stripe. Ao fornecer informacoes de pagamento, voce autoriza a cobranca
            automatica de acordo com o plano escolhido.
          </p>
        </section>

        {/* 5. Cancelamento */}
        <section className={sectionClass}>
          <h2 className={headingClass}>5. Cancelamento e Reembolso</h2>
          <h3 className={subheadingClass}>5.1 Cancelamento</h3>
          <p className={paragraphClass}>
            Voce pode cancelar sua assinatura a qualquer momento atraves do painel de configuracoes.
            O cancelamento sera efetivo ao final do periodo de cobranca atual.
          </p>
          <h3 className={subheadingClass}>5.2 Reembolso</h3>
          <p className={paragraphClass}>
            Nao oferecemos reembolsos por periodos parciais de uso. Em casos excepcionais, reembolsos
            podem ser considerados a nosso criterio exclusivo.
          </p>
        </section>

        {/* 6. Uso Aceitavel */}
        <section className={sectionClass}>
          <h2 className={headingClass}>6. Uso Aceitavel</h2>
          <p className={paragraphClass}>
            Ao usar o Servico, voce concorda em nao:
          </p>
          <ul className={listClass}>
            <li>Violar qualquer lei ou regulamento aplicavel</li>
            <li>Enviar mensagens de spam ou conteudo nao solicitado</li>
            <li>Interferir ou interromper o funcionamento do Servico</li>
            <li>Tentar acessar areas restritas ou sistemas nao autorizados</li>
            <li>Usar o Servico para fins ilegais ou fraudulentos</li>
            <li>Revender ou sublicenciar o acesso ao Servico</li>
          </ul>
        </section>

        {/* 7. Propriedade Intelectual */}
        <section className={sectionClass}>
          <h2 className={headingClass}>7. Propriedade Intelectual</h2>
          <p className={paragraphClass}>
            O Servico e todo o seu conteudo, recursos e funcionalidades sao de propriedade da Mevo e estao
            protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
          </p>
          <p className={paragraphClass}>
            Voce mantem a propriedade de todos os dados e conteudos que voce insere no Servico. Ao usar o Servico,
            voce nos concede uma licenca limitada para processar e exibir seus dados conforme necessario para
            fornecer o Servico.
          </p>
        </section>

        {/* 8. Limitacao de Responsabilidade */}
        <section className={sectionClass}>
          <h2 className={headingClass}>8. Limitacao de Responsabilidade</h2>
          <p className={paragraphClass}>
            O Servico e fornecido "como esta" e "conforme disponivel". Nao garantimos que o Servico sera
            ininterrupto, seguro ou livre de erros.
          </p>
          <p className={paragraphClass}>
            Em nenhuma circunstancia seremos responsaveis por quaisquer danos indiretos, incidentais, especiais,
            consequenciais ou punitivos, incluindo perda de lucros, dados ou uso.
          </p>
          <p className={paragraphClass}>
            Nossa responsabilidade total em qualquer reclamacao relacionada ao Servico sera limitada ao valor
            que voce pagou pelo Servico nos ultimos 12 meses.
          </p>
        </section>

        {/* 9. Alteracoes */}
        <section className={sectionClass}>
          <h2 className={headingClass}>9. Alteracoes nos Termos</h2>
          <p className={paragraphClass}>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre alteracoes
            significativas por email ou atraves de um aviso no Servico.
          </p>
          <p className={paragraphClass}>
            O uso continuado do Servico apos as alteracoes constitui aceitacao dos novos termos.
          </p>
        </section>

        {/* 10. Contato */}
        <section className={sectionClass}>
          <h2 className={headingClass}>10. Contato</h2>
          <p className={paragraphClass}>
            Se voce tiver duvidas sobre estes Termos de Uso, entre em contato conosco:
          </p>
          <ul className={listClass}>
            <li>Email: suporte@mevoia.com</li>
            <li>Website: https://mevoia.com</li>
          </ul>
        </section>

        {/* Voltar */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Voltar para o inicio
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 text-center ${isDark ? 'border-white/5 bg-[#020205]' : 'border-slate-200 bg-slate-50'}`}>
        <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} Mevo. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Terms;
