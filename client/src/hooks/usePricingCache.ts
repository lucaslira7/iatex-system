import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface CachedFormData {
  [key: string]: any;
  timestamp: number;
}

const CACHE_KEY = 'pricing_form_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const usePricingCache = () => {
  const queryClient = useQueryClient();
  
  // Função para salvar dados no cache
  const saveToCache = useCallback((data: any, stepKey: string) => {
    try {
      const cacheData: CachedFormData = {
        ...data,
        timestamp: Date.now(),
        step: stepKey
      };
      
      // Salva no localStorage
      localStorage.setItem(`${CACHE_KEY}_${stepKey}`, JSON.stringify(cacheData));
      
      // Salva no cache do React Query também
      queryClient.setQueryData(['pricing-cache', stepKey], cacheData);
    } catch (error) {
      console.warn('Erro ao salvar cache:', error);
    }
  }, [queryClient]);

  // Função para recuperar dados do cache
  const getFromCache = useCallback((stepKey: string) => {
    try {
      // Tenta primeiro do React Query
      const queryCache = queryClient.getQueryData(['pricing-cache', stepKey]);
      if (queryCache) {
        const cached = queryCache as CachedFormData;
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          return cached;
        }
      }

      // Se não encontrar, tenta do localStorage
      const stored = localStorage.getItem(`${CACHE_KEY}_${stepKey}`);
      if (stored) {
        const cached: CachedFormData = JSON.parse(stored);
        
        // Verifica se ainda está válido
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          // Recoloca no cache do React Query
          queryClient.setQueryData(['pricing-cache', stepKey], cached);
          return cached;
        } else {
          // Remove se expirou
          localStorage.removeItem(`${CACHE_KEY}_${stepKey}`);
        }
      }
    } catch (error) {
      console.warn('Erro ao recuperar cache:', error);
    }
    
    return null;
  }, [queryClient]);

  // Função para limpar cache
  const clearCache = useCallback((stepKey?: string) => {
    if (stepKey) {
      localStorage.removeItem(`${CACHE_KEY}_${stepKey}`);
      queryClient.removeQueries({ queryKey: ['pricing-cache', stepKey] });
    } else {
      // Limpa todos os caches relacionados
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
      queryClient.removeQueries({ queryKey: ['pricing-cache'] });
    }
  }, [queryClient]);

  // Função para verificar se existe cache válido
  const hasCachedData = useCallback((stepKey: string) => {
    return getFromCache(stepKey) !== null;
  }, [getFromCache]);

  return {
    saveToCache,
    getFromCache,
    clearCache,
    hasCachedData
  };
};

// Hook para debounce de inputs
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};