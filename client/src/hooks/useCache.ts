import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";

// Cache inteligente com controle de stale time baseado no tipo de dados
const CACHE_TIMES = {
  // Dados que mudam raramente
  fabrics: 5 * 60 * 1000, // 5 minutos
  garmentTypes: 10 * 60 * 1000, // 10 minutos
  costCategories: 10 * 60 * 1000, // 10 minutos
  
  // Dados que mudam com frequência média
  templates: 2 * 60 * 1000, // 2 minutos
  models: 3 * 60 * 1000, // 3 minutos
  
  // Dados que mudam frequentemente
  orders: 30 * 1000, // 30 segundos
  dashboard: 60 * 1000, // 1 minuto
  
  // Dados em tempo real
  activities: 15 * 1000, // 15 segundos
} as const;

type CacheKey = keyof typeof CACHE_TIMES;

interface UseCacheOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  retry?: boolean | number;
}

export function useSmartCache<T>(
  queryKey: string[],
  cacheType: CacheKey,
  options: UseCacheOptions = {}
) {
  const queryClient = useQueryClient();
  
  const {
    enabled = true,
    refetchInterval,
    staleTime = CACHE_TIMES[cacheType],
    retry = 1
  } = options;

  const query = useQuery<T>({
    queryKey,
    enabled,
    staleTime,
    refetchInterval,
    retry,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const refreshCache = useCallback(() => {
    queryClient.refetchQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    ...query,
    invalidateCache,
    refreshCache,
  };
}

// Hook para prevenir loops infinitos
export function useStableQuery<T>(
  queryKey: string[],
  options: UseCacheOptions = {},
  dependencies: any[] = []
) {
  const [isEnabled, setIsEnabled] = useState(false);
  const stableKey = JSON.stringify(queryKey);
  const stableDeps = JSON.stringify(dependencies);

  useEffect(() => {
    setIsEnabled(true);
  }, [stableKey, stableDeps]);

  return useQuery<T>({
    queryKey,
    enabled: isEnabled && (options.enabled !== false),
    staleTime: options.staleTime || 60 * 1000,
    retry: options.retry || 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Hook para dados com backup local
export function useCachedData<T>(
  queryKey: string[],
  cacheType: CacheKey,
  localStorageKey?: string,
  options: UseCacheOptions = {}
) {
  const [localData, setLocalData] = useState<T | null>(null);
  const query = useSmartCache<T>(queryKey, cacheType, options);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    if (localStorageKey) {
      try {
        const stored = localStorage.getItem(localStorageKey);
        if (stored) {
          setLocalData(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Erro ao carregar cache local:', error);
      }
    }
  }, [localStorageKey]);

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    if (query.data && localStorageKey) {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(query.data));
        setLocalData(query.data);
      } catch (error) {
        console.warn('Erro ao salvar cache local:', error);
      }
    }
  }, [query.data, localStorageKey]);

  return {
    ...query,
    data: query.data || localData,
    hasLocalData: !!localData,
  };
}

// Hook para otimização de imagens
export function useOptimizedImage(imageUrl: string | null) {
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setOptimizedUrl(null);
      return;
    }

    // Se já for uma imagem base64 ou otimizada, usar diretamente
    if (imageUrl.startsWith('data:') || imageUrl.includes('optimized')) {
      setOptimizedUrl(imageUrl);
      return;
    }

    setIsLoading(true);
    
    // Simular otimização (em produção, seria uma API de otimização)
    const img = new Image();
    img.onload = () => {
      setOptimizedUrl(imageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setOptimizedUrl(null);
      setIsLoading(false);
    };
    img.src = imageUrl;

  }, [imageUrl]);

  return {
    optimizedUrl,
    isLoading,
    hasImage: !!optimizedUrl,
  };
}