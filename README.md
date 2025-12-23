# Mevo Frontend

> Plataforma SaaS de automação para anfitriões de aluguel por temporada - Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Sobre

Frontend do **Mevo** - plataforma SaaS para anfitriões de aluguel por temporada. Interface moderna e responsiva para gerenciar propriedades, reservas, funcionários e automações de comunicação.

### Funcionalidades

- **Landing Page** moderna com animações Framer Motion
- **Dashboard** completo para gestão de propriedades
- **Calendário** visual de reservas
- **Gestão de Funcionários** com histórico de reservas
- **Templates de Mensagens** com preview em tempo real
- **Automações** configuráveis (check-in, checkout, limpeza, review)
- **Integração WhatsApp** com QR Code para conexão
- **Billing** com checkout Stripe integrado
- **Internacionalização** (pt-BR, en, es)
- **Tema Claro/Escuro** com preferências salvas

### Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| Framework | React 19 |
| Linguagem | TypeScript 5.x |
| Build Tool | Vite 6.x |
| Styling | Tailwind CSS 3.x |
| Animações | Framer Motion |
| Roteamento | React Router 6.x |
| i18n | react-i18next |
| Ícones | Lucide React |
| 3D | Three.js |

## Começando

### Pré-requisitos

- Node.js >= 20.0.0
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/estevaoantuness/mevofrontfinale.git
cd mevofrontfinale

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com a URL do backend

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `VITE_API_URL` | URL base da API backend | Sim |

Exemplo `.env`:
```env
VITE_API_URL=https://api.mevo.app.br/api
```

## Estrutura do Projeto

```
mevofrontfinale/
├── components/
│   ├── dashboard/       # Componentes do Dashboard
│   │   ├── CalendarView.tsx
│   │   ├── GuestsTab.tsx
│   │   ├── PricingTab.tsx
│   │   ├── ProfileTab.tsx
│   │   ├── PropertiesTab.tsx
│   │   ├── ReservationCard.tsx
│   │   ├── ReservationsTab.tsx
│   │   ├── SettingsTab.tsx
│   │   └── TemplatesTab.tsx
│   ├── landing/         # Componentes da Landing Page
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   └── ...
│   └── ui/              # Componentes UI reutilizáveis
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── LanguageSwitcher.tsx
│       ├── Modal.tsx
│       ├── ThemeToggle.tsx
│       └── ...
├── hooks/               # Custom React Hooks
│   └── useTheme.ts
├── lib/                 # Bibliotecas e utilitários
│   ├── api.ts           # Cliente da API
│   ├── AuthContext.tsx  # Contexto de autenticação
│   ├── ThemeContext.tsx # Contexto de tema
│   ├── i18n.ts          # Configuração i18n
│   └── utils.ts         # Funções utilitárias
├── locales/             # Arquivos de tradução
│   ├── pt-BR/
│   ├── en/
│   └── es-419/
├── pages/               # Páginas da aplicação
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ...
├── App.tsx              # Componente raiz
├── index.tsx            # Entry point
├── index.html           # HTML template
├── tailwind.config.js   # Configuração Tailwind
├── vite.config.ts       # Configuração Vite
└── package.json
```

## Páginas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Landing | Página inicial pública |
| `/login` | Login | Autenticação |
| `/register` | Register | Cadastro de usuário |
| `/verify-email` | VerifyEmail | Verificação de email |
| `/forgot-password` | ForgotPassword | Recuperação de senha |
| `/reset-password` | ResetPassword | Redefinição de senha |
| `/dashboard` | Dashboard | Painel principal |
| `/terms` | Terms | Termos de uso |
| `/privacy` | Privacy | Política de privacidade |

## Dashboard Tabs

| Tab | Funcionalidade |
|-----|---------------|
| Home | Visão geral, check-ins/outs do dia |
| Calendar | Calendário visual de reservas |
| Reservations | Lista de todas as reservas |
| Properties | Gestão de propriedades e calendários iCal |
| Guests | Base de funcionários com histórico |
| Templates | Templates de mensagens |
| Settings | Automações e configurações |
| Pricing | Calculadora por imóvel |
| Profile | Perfil do usuário e preferências |
| Billing | Plano, assinatura e upgrade |

## Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev (hot reload)

# Build
npm run build            # Build de produção
npm run preview          # Preview do build

# Produção
npm start                # Serve arquivos estáticos (prod)

# Qualidade
npm run lint             # Verifica código
npm run lint:fix         # Corrige problemas

# Testes
npm test                 # Roda testes
npm run test:watch       # Testes em watch mode
```

### Comandos Úteis

```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Analisar bundle
npm run build && npx vite-bundle-visualizer
```

## Deploy

O projeto está configurado para deploy no **Railway**:

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Variáveis no Railway

Configure `VITE_API_URL` apontando para o backend.

## Internacionalização (i18n)

O Mevo suporta 3 idiomas:

| Código | Idioma |
|--------|--------|
| `pt-BR` | Português (Brasil) - padrão |
| `en` | English |
| `es-419` | Español (Latinoamérica) |

### Adicionar Traduções

1. Edite o arquivo em `locales/{código}/translation.json`
2. Use a chave no componente:
```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('common.title')}</h1>;
}
```

## Tema

O Mevo suporta tema claro e escuro:

```tsx
import { useTheme } from './hooks/useTheme';

function Component() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Tema atual: {theme}
    </button>
  );
}
```

Classes CSS disponíveis:
- `theme-bg-primary` - Background principal
- `theme-bg-card` - Background de cards
- `theme-text-primary` - Texto principal
- `theme-text-secondary` - Texto secundário
- `theme-border` - Bordas

## API Client

O arquivo `lib/api.ts` fornece um cliente tipado para a API:

```tsx
import { getProperties, createProperty } from './lib/api';

// Listar propriedades
const properties = await getProperties();

// Criar propriedade
const newProperty = await createProperty({
  name: 'Apartamento 101',
  icalAirbnb: 'https://...'
});
```

## Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.

## Contato

- **Autor**: Estevão Antunes
- **GitHub**: [@estevaoantuness](https://github.com/estevaoantuness)
- **Projeto**: [mevofrontfinale](https://github.com/estevaoantuness/mevofrontfinale)
