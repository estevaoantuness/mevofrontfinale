import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useTheme } from '../lib/ThemeContext';

export const Privacy: React.FC = () => {
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
          Politica de Privacidade
        </h1>
        <p className={`text-sm mb-8 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          Ultima atualizacao: 1 de Janeiro de 2025
        </p>

        <p className={paragraphClass}>
          A Mevo ("nos", "nosso" ou "Servico") esta comprometida em proteger sua privacidade. Esta Politica de
          Privacidade explica como coletamos, usamos e protegemos suas informacoes pessoais em conformidade com
          a Lei Geral de Protecao de Dados (LGPD - Lei 13.709/2018).
        </p>

        {/* 1. Dados Coletados */}
        <section className={sectionClass}>
          <h2 className={headingClass}>1. Dados que Coletamos</h2>

          <h3 className={subheadingClass}>1.1 Dados fornecidos por voce</h3>
          <ul className={listClass}>
            <li>Nome completo e email (para criar sua conta)</li>
            <li>Dados de pagamento (processados de forma segura pelo Stripe)</li>
            <li>Informacoes dos seus imoveis (nome, endereco, URLs de calendario)</li>
            <li>Dados dos seus hospedes (nome, telefone, datas de reserva)</li>
            <li>Templates de mensagens que voce criar</li>
          </ul>

          <h3 className={subheadingClass}>1.2 Dados coletados automaticamente</h3>
          <ul className={listClass}>
            <li>Informacoes do dispositivo (navegador, sistema operacional)</li>
            <li>Endereco IP e localizacao aproximada</li>
            <li>Dados de uso do Servico (paginas visitadas, acoes realizadas)</li>
            <li>Cookies e tecnologias similares</li>
          </ul>

          <h3 className={subheadingClass}>1.3 Dados de terceiros</h3>
          <ul className={listClass}>
            <li>Informacoes de reservas sincronizadas via iCal (Airbnb, Booking)</li>
            <li>Dados de autenticacao do Clerk (provedor de login)</li>
          </ul>
        </section>

        {/* 2. Como Usamos */}
        <section className={sectionClass}>
          <h2 className={headingClass}>2. Como Usamos seus Dados</h2>
          <p className={paragraphClass}>
            Utilizamos seus dados pessoais para as seguintes finalidades:
          </p>
          <ul className={listClass}>
            <li><strong>Fornecer o Servico:</strong> Sincronizar calendarios, enviar mensagens automaticas, gerenciar reservas</li>
            <li><strong>Comunicacao:</strong> Enviar notificacoes importantes, atualizacoes e suporte</li>
            <li><strong>Pagamentos:</strong> Processar assinaturas e faturas</li>
            <li><strong>Melhoria:</strong> Analisar uso para melhorar o Servico</li>
            <li><strong>Seguranca:</strong> Detectar e prevenir fraudes ou abusos</li>
            <li><strong>Obrigacoes legais:</strong> Cumprir requisitos legais e regulatorios</li>
          </ul>
        </section>

        {/* 3. Compartilhamento */}
        <section className={sectionClass}>
          <h2 className={headingClass}>3. Compartilhamento de Dados</h2>
          <p className={paragraphClass}>
            Nao vendemos seus dados pessoais. Compartilhamos dados apenas com:
          </p>
          <ul className={listClass}>
            <li><strong>Stripe:</strong> Para processamento seguro de pagamentos</li>
            <li><strong>Clerk:</strong> Para autenticacao e gerenciamento de contas</li>
            <li><strong>Evolution API:</strong> Para envio de mensagens via WhatsApp</li>
            <li><strong>Sentry:</strong> Para monitoramento de erros (dados anonimizados)</li>
            <li><strong>Provedores de hospedagem:</strong> Railway e Supabase para armazenamento</li>
          </ul>
          <p className={paragraphClass}>
            Todos os nossos parceiros sao obrigados contratualmente a proteger seus dados de acordo com a LGPD.
          </p>
        </section>

        {/* 4. Seguranca */}
        <section className={sectionClass}>
          <h2 className={headingClass}>4. Armazenamento e Seguranca</h2>
          <p className={paragraphClass}>
            Implementamos medidas de seguranca tecnicas e organizacionais para proteger seus dados:
          </p>
          <ul className={listClass}>
            <li>Criptografia em transito (HTTPS/TLS)</li>
            <li>Criptografia em repouso para dados sensiveis</li>
            <li>Autenticacao segura via Clerk</li>
            <li>Controle de acesso baseado em funcoes</li>
            <li>Monitoramento continuo de seguranca</li>
            <li>Backups regulares e redundancia</li>
          </ul>
          <p className={paragraphClass}>
            Seus dados sao armazenados em servidores seguros localizados nos Estados Unidos e na Uniao Europeia,
            em conformidade com padroes internacionais de protecao de dados.
          </p>
        </section>

        {/* 5. Direitos LGPD */}
        <section className={sectionClass}>
          <h2 className={headingClass}>5. Seus Direitos (LGPD)</h2>
          <p className={paragraphClass}>
            De acordo com a Lei Geral de Protecao de Dados, voce tem os seguintes direitos:
          </p>
          <ul className={listClass}>
            <li><strong>Acesso:</strong> Solicitar uma copia dos seus dados pessoais</li>
            <li><strong>Correcao:</strong> Corrigir dados incompletos ou incorretos</li>
            <li><strong>Exclusao:</strong> Solicitar a exclusao dos seus dados</li>
            <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
            <li><strong>Oposicao:</strong> Opor-se ao tratamento de dados em certas situacoes</li>
            <li><strong>Revogacao:</strong> Revogar consentimento previamente dado</li>
            <li><strong>Informacao:</strong> Saber com quem seus dados sao compartilhados</li>
          </ul>
          <p className={paragraphClass}>
            Para exercer qualquer desses direitos, entre em contato pelo email: privacidade@mevoia.com
          </p>
        </section>

        {/* 6. Cookies */}
        <section className={sectionClass}>
          <h2 className={headingClass}>6. Cookies</h2>
          <p className={paragraphClass}>
            Utilizamos cookies e tecnologias similares para:
          </p>
          <ul className={listClass}>
            <li><strong>Cookies essenciais:</strong> Necessarios para o funcionamento do Servico (autenticacao, sessao)</li>
            <li><strong>Cookies de preferencia:</strong> Lembrar suas configuracoes (tema, idioma)</li>
            <li><strong>Cookies analiticos:</strong> Entender como voce usa o Servico</li>
          </ul>
          <p className={paragraphClass}>
            Voce pode gerenciar cookies atraves das configuracoes do seu navegador.
          </p>
        </section>

        {/* 7. Integracoes */}
        <section className={sectionClass}>
          <h2 className={headingClass}>7. Integracoes de Terceiros</h2>

          <h3 className={subheadingClass}>7.1 Clerk (Autenticacao)</h3>
          <p className={paragraphClass}>
            Usamos o Clerk para gerenciar contas e autenticacao. O Clerk processa seu email e dados de login
            de acordo com sua propria politica de privacidade.
          </p>

          <h3 className={subheadingClass}>7.2 Stripe (Pagamentos)</h3>
          <p className={paragraphClass}>
            Pagamentos sao processados pelo Stripe. Nao armazenamos dados de cartao de credito em nossos servidores.
            O Stripe e certificado PCI-DSS Level 1.
          </p>

          <h3 className={subheadingClass}>7.3 WhatsApp (Mensagens)</h3>
          <p className={paragraphClass}>
            Mensagens sao enviadas atraves da Evolution API, que se integra ao WhatsApp. Numeros de telefone
            e conteudo de mensagens sao processados para envio e nao sao compartilhados com terceiros.
          </p>
        </section>

        {/* 8. Retencao */}
        <section className={sectionClass}>
          <h2 className={headingClass}>8. Retencao de Dados</h2>
          <p className={paragraphClass}>
            Mantemos seus dados pelo tempo necessario para fornecer o Servico e cumprir obrigacoes legais:
          </p>
          <ul className={listClass}>
            <li><strong>Dados da conta:</strong> Enquanto sua conta estiver ativa</li>
            <li><strong>Dados de reservas:</strong> 5 anos apos a data do checkout</li>
            <li><strong>Logs de atividade:</strong> 90 dias</li>
            <li><strong>Dados de pagamento:</strong> Conforme exigido por lei (5 anos)</li>
          </ul>
          <p className={paragraphClass}>
            Apos o encerramento da conta, seus dados serao excluidos em ate 30 dias, exceto quando houver
            obrigacao legal de retencao.
          </p>
        </section>

        {/* 9. Alteracoes */}
        <section className={sectionClass}>
          <h2 className={headingClass}>9. Alteracoes nesta Politica</h2>
          <p className={paragraphClass}>
            Podemos atualizar esta Politica de Privacidade periodicamente. Notificaremos sobre alteracoes
            significativas por email ou atraves de um aviso no Servico.
          </p>
          <p className={paragraphClass}>
            Recomendamos que voce revise esta politica regularmente para se manter informado sobre como
            protegemos suas informacoes.
          </p>
        </section>

        {/* 10. Contato */}
        <section className={sectionClass}>
          <h2 className={headingClass}>10. Contato e Encarregado (DPO)</h2>
          <p className={paragraphClass}>
            Se voce tiver duvidas sobre esta Politica de Privacidade ou sobre como tratamos seus dados,
            entre em contato:
          </p>
          <ul className={listClass}>
            <li><strong>Email geral:</strong> suporte@mevoia.com</li>
            <li><strong>Email de privacidade:</strong> privacidade@mevoia.com</li>
            <li><strong>Website:</strong> https://mevoia.com</li>
          </ul>
          <p className={paragraphClass}>
            Nosso Encarregado de Protecao de Dados (DPO) pode ser contatado pelo email privacidade@mevoia.com.
          </p>
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

export default Privacy;
