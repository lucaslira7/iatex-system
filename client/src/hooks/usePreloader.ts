import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

interface PreloaderConfig {
  enabled?: boolean;
  routes?: string[];
  delay?: number;
}

export function usePreloader(config: PreloaderConfig = {}) {
  const { enabled = true, routes = [], delay = 2000 } = config;

  useEffect(() => {
    if (!enabled || routes.length === 0) return;

    const preloadTimer = setTimeout(() => {
      routes.forEach(route => {
        // Pré-carrega dados que provavelmente serão necessários
        queryClient.prefetchQuery({
          queryKey: [route],
          staleTime: 5 * 60 * 1000, // 5 minutos
        });
      });
    }, delay);

    return () => clearTimeout(preloadTimer);
  }, [enabled, routes, delay]);
}

// Hook para pré-carregar dados críticos do sistema
export function useSystemPreloader() {
  usePreloader({
    routes: [
      '/api/garment-types',
      '/api/cost-categories',
      '/api/suppliers',
    ],
    delay: 1000, // Pré-carrega após 1 segundo
  });
}

// Hook para pré-carregar dados do dashboard
export function useDashboardPreloader() {
  usePreloader({
    routes: [
      '/api/dashboard/metrics',
      '/api/fabrics',
    ],
    delay: 500, // Pré-carrega rapidamente para dashboard
  });
}