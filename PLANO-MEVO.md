# Plano de Desenvolvimento - Mevo

## Visão Geral do Produto
Sistema de automação para anfitriões de Airbnb/Booking com:
- Calendário unificado de reservas
- Envio automático de mensagens WhatsApp
- Gestão de imóveis e equipe de limpeza

---

## FASE 1: Dashboard Completo (Prioridade Alta)

### 1.1 Visão Geral - Calendário de Reservas ⭐
**Objetivo:** Calendário mensal mostrando TODAS as reservas de TODOS os imóveis

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Visão Geral                                                         │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ [< Anterior]  Dezembro 2024  [Próximo >]    [Hoje]   [Mensal ▼] │ │
│ │                                                                 │ │
│ │ [Buscar imóvel...]  [Filtrar ▼]  [Exportar CSV]                │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │  Dom    Seg    Ter    Qua    Qui    Sex    Sab                 │ │
│ │ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                    │ │
│ │ │  1  │  2  │  3  │  4  │  5  │  6  │  7  │                    │ │
│ │ │     │ 🏠  │ 🏠  │     │ 🔴  │ 🔴  │     │                    │ │
│ │ │     │Loft │Loft │     │Apt  │Apt  │     │                    │ │
│ │ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                    │ │
│ │ │  8  │  9  │ 10  │ 11  │ 12  │ 13  │ 14  │                    │ │
│ │ │ 🟢  │ 🟢  │ 🔴  │     │ 🏠  │ 🏠  │ 🏠  │                    │ │
│ │ │Casa │Casa │Apt  │     │Stud │Stud │Stud │                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Legenda:                                                        │ │
│ │ 🟢 Check-in    🔴 Check-out    🏠 Ocupado    ⬜ Disponível      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│ │ 📊 5 Imóveis    │ │ 📅 3 Checkouts  │ │ 💬 12 Msgs Mês  │        │
│ │    Ativos       │ │    Hoje         │ │    Enviadas     │        │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Navegação mês anterior/próximo
- Botão "Hoje" para voltar ao dia atual
- Filtrar por imóvel específico
- Cores diferentes por imóvel
- Clique no dia abre detalhes das reservas
- Destaque visual para checkouts de hoje
- Mini cards de stats abaixo do calendário

**Dados necessários (já existem no backend):**
- GET /api/reservations/upcoming - próximas reservas
- GET /api/properties/:id/reservations - reservas por imóvel
- Sync iCal já popula as reservas no banco

---

### 1.2 Tab de Logs/Histórico
**Objetivo:** Ver todas as mensagens enviadas automaticamente

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Histórico de Mensagens                         [Filtrar ▼] [Buscar]│
├─────────────────────────────────────────────────────────────────────┤
│ Hoje                                                                │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ✅ 08:00  Loft Centro 402 → Maria (41999990000)                 │ │
│ │    "Olá Maria, hoje tem checkout no Loft Centro..."             │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ ✅ 08:00  Apt Batel 101 → João (41988880000)                    │ │
│ │    "Olá João, hoje tem checkout no Apt Batel..."                │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Ontem                                                               │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ❌ 08:00  Casa Praia → Ana (41977770000)                        │ │
│ │    Erro: Número não encontrado no WhatsApp                      │ │
│ │    [Reenviar]                                                   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Lista agrupada por data
- Status visual (✅ enviada, ❌ falhou, ⏳ pendente)
- Preview da mensagem
- Botão reenviar para mensagens que falharam
- Filtrar por imóvel, status, data

---

### 1.3 Tab de Reservas/Agenda
**Objetivo:** Lista de reservas com foco em checkouts

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Reservas                    [Hoje] [Esta Semana] [Este Mês] [Todas]│
├─────────────────────────────────────────────────────────────────────┤
│ 🔴 CHECKOUTS HOJE (3)                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Loft Centro 402        │ Guest: Carlos Silva │ Check-out: 11:00 │ │
│ │ Responsável: Maria     │ WhatsApp: ✅ Avisada │ [Ver Detalhes]  │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ Apt Batel 101          │ Guest: Ana Paula    │ Check-out: 14:00 │ │
│ │ Responsável: João      │ WhatsApp: ✅ Avisado │ [Ver Detalhes]  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🟢 CHECK-INS HOJE (1)                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Studio Centro          │ Guest: Pedro Santos │ Check-in: 15:00  │ │
│ │ Responsável: Ana       │ Status: Aguardando  │ [Ver Detalhes]   │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 📅 PRÓXIMOS 7 DIAS                                                 │
│ ...                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## FASE 2: Melhorias de UX (Prioridade Média)

### 2.1 Onboarding (Primeiro Acesso)
**Onde:** Modal após primeiro login

**Passos:**
1. "Bem-vindo ao Mevo! Vamos configurar em 3 passos"
2. "Conecte seu WhatsApp" → Mostra QR
3. "Adicione seu primeiro imóvel" → Form simplificado
4. "Pronto! Suas mensagens serão enviadas automaticamente às 08:00"

### 2.2 Responsividade Mobile
**Onde:** Todo o Dashboard

**Mudanças:**
- Sidebar vira menu hamburger
- Calendário vira lista no mobile
- Cards empilham verticalmente
- Botões maiores para touch

### 2.3 Notificações In-App
**Onde:** Sino no header do dashboard

**Tipos:**
- "Mensagem falhou para Casa Praia - número inválido"
- "Novo checkout amanhã - Loft Centro"
- "Trial termina em 3 dias"

---

## FASE 3: Features Avançadas (Prioridade Baixa)

### 3.1 Multi-Templates
**Onde:** Tab Configurações expandida

**Templates:**
- Aviso de checkout (atual)
- Aviso de check-in
- Lembrete de limpeza
- Mensagem personalizada

### 3.2 Recuperação de Senha
**Onde:** Tela de Login

**Fluxo:**
1. "Esqueci minha senha"
2. Digite email
3. Recebe link por email
4. Redefine senha

### 3.3 Relatórios/Analytics
**Onde:** Nova tab "Relatórios"

**Métricas:**
- Taxa de ocupação por imóvel
- Mensagens enviadas por mês
- Gráfico de reservas

### 3.4 Validação de WhatsApp
**Onde:** Form de criar imóvel

**Funcionalidade:**
- Antes de salvar, verifica se número existe no WhatsApp
- Mostra ✅ ou ❌ ao lado do campo

---

## Ordem de Implementação

### Sprint 1 (Agora)
1. ✅ Calendário na Visão Geral
2. Tab de Logs/Histórico

### Sprint 2
3. Tab de Reservas/Agenda
4. Responsividade Mobile

### Sprint 3
5. Onboarding
6. Notificações In-App

### Sprint 4
7. Recuperação de Senha
8. Multi-Templates

### Sprint 5
9. Relatórios
10. Validação WhatsApp

---

## Arquivos a Criar/Modificar

### Fase 1.1 - Calendário
```
components/dashboard/Calendar.tsx        # Componente do calendário
components/dashboard/CalendarDay.tsx     # Célula do dia
components/dashboard/ReservationBadge.tsx # Badge de reserva
lib/api.ts                               # Adicionar getReservations()
pages/Dashboard.tsx                      # Substituir overview atual
```

### Fase 1.2 - Calculadora
```
components/dashboard/PricingTab.tsx      # Tab de calculadora por imóvel
lib/api.ts                               # Adicionar endpoints da calculadora
```

### Fase 1.3 - Reservas
```
components/dashboard/ReservationsTab.tsx # Tab de reservas
components/dashboard/ReservationCard.tsx # Card de reserva
```

---

## Estimativa de Complexidade

| Feature | Complexidade | Arquivos |
|---------|--------------|----------|
| Calendário | Alta | 4-5 |
| Calculadora | Média | 2-3 |
| Reservas | Média | 2-3 |
| Mobile | Média | Todos |
| Onboarding | Baixa | 1-2 |
| Notificações | Média | 3-4 |
| Recuperar Senha | Média | 3-4 (back+front) |
| Multi-Templates | Média | 2-3 |
| Relatórios | Alta | 4-5 |
| Validar WhatsApp | Baixa | 1-2 |
