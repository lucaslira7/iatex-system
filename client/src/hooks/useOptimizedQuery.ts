import { useQuery, UseQueryOptions } from '@tanstack/react-query';

export function useOptimizedQuery<T>(
  queryKey: string | string[],
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    staleTime: 2 * 60 * 1000, // 2 minutos - dados considerados frescos
    gcTime: 5 * 60 * 1000, // 5 minutos - tempo em cache (gcTime em v5)
    refetchOnWindowFocus: false, // Não refetch ao voltar para a janela
    refetchOnMount: false, // Não refetch ao montar se há dados em cache
    ...options,
  });
}

// Hook especializado para métricas do dashboard
export function useDashboardMetrics() {
  return useOptimizedQuery(['/api/dashboard/metrics'], {
    staleTime: 60 * 1000, // 1 minuto para métricas
    gcTime: 3 * 60 * 1000, // 3 minutos em cache
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
    retry: 3,
  });
}

// Hook para dados estáticos (tipos de peça, categorias, etc.)
export function useStaticData<T>(queryKey: string | string[]) {
  return useOptimizedQuery<T>(queryKey, {
    staleTime: 10 * 60 * 1000, // 10 minutos - dados estáticos
    gcTime: 30 * 60 * 1000, // 30 minutos em cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Hook para listas que mudam com frequência
export function useDynamicList<T>(queryKey: string | string[]) {
  return useOptimizedQuery<T>(queryKey, {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos em cache
    refetchOnWindowFocus: true,
  });
}