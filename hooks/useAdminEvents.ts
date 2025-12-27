import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

type AdminEventType = 'plan-changed' | 'user-updated' | 'metrics-changed' | 'user-created' | 'user-deleted' | 'connected';

interface AdminEventData {
  timestamp: number;
  userId?: number;
  subscription?: {
    planId: string;
    status: string;
    propertyLimit: number;
    billingInterval: string;
    trialEndsAt?: string;
    currentPeriodEnd?: string;
  };
  user?: {
    id: number;
    email: string;
    name: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
  };
  message?: string;
}

type EventHandler = (event: AdminEventType, data: AdminEventData) => void;

/**
 * Hook para conectar ao stream de eventos SSE do admin
 * Permite receber atualizações em tempo real quando dados são modificados
 *
 * @param onEvent - Callback chamado quando um evento é recebido
 * @param enabled - Se deve conectar ao stream (default: true)
 */
export function useAdminEvents(onEvent: EventHandler, enabled: boolean = true) {
  const { getToken } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async () => {
    if (!enabled) return;

    try {
      const token = await getToken();
      if (!token) {
        console.warn('[AdminSSE] Token não disponível');
        return;
      }

      // Fechar conexão existente
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Criar nova conexão SSE com token no header via fetch API não é possível
      // SSE não suporta headers customizados, então usamos query param
      const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const apiBaseUrl = rawBaseUrl.endsWith('/api')
        ? rawBaseUrl
        : `${rawBaseUrl.replace(/\/$/, '')}/api`;
      const url = `${apiBaseUrl}/admin/events/stream?token=${encodeURIComponent(token)}`;

      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('[AdminSSE] Conectado ao stream de eventos');
      };

      eventSource.onerror = (error) => {
        console.error('[AdminSSE] Erro na conexão:', error);
        eventSource.close();

        // Tentar reconectar após 5 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[AdminSSE] Tentando reconectar...');
          connect();
        }, 5000);
      };

      // Listener para eventos específicos
      const events: AdminEventType[] = [
        'plan-changed',
        'user-updated',
        'metrics-changed',
        'user-created',
        'user-deleted',
        'connected'
      ];

      events.forEach(eventType => {
        eventSource.addEventListener(eventType, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data) as AdminEventData;
            onEvent(eventType, data);
          } catch (parseError) {
            console.error(`[AdminSSE] Erro ao parsear evento ${eventType}:`, parseError);
          }
        });
      });

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('[AdminSSE] Erro ao conectar:', error);
    }
  }, [enabled, getToken, onEvent]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  // Retorna função para reconectar manualmente se necessário
  return { reconnect: connect };
}

/**
 * Hook simplificado que automaticamente refaz queries quando eventos relevantes acontecem
 *
 * @param refetchUsers - Função para refazer query de usuários
 * @param refetchMetrics - Função para refazer query de métricas
 * @param enabled - Se deve conectar (default: true)
 */
export function useAdminRealtime(
  refetchUsers: () => void,
  refetchMetrics: () => void,
  enabled: boolean = true
) {
  const handleEvent = useCallback((event: AdminEventType, data: AdminEventData) => {
    console.log(`[AdminSSE] Evento recebido: ${event}`, data);

    switch (event) {
      case 'plan-changed':
      case 'user-updated':
      case 'user-created':
      case 'user-deleted':
        refetchUsers();
        break;
      case 'metrics-changed':
        refetchMetrics();
        break;
      case 'connected':
        // Evento de conexão estabelecida
        console.log('[AdminSSE] Conexão estabelecida');
        break;
    }
  }, [refetchUsers, refetchMetrics]);

  return useAdminEvents(handleEvent, enabled);
}
