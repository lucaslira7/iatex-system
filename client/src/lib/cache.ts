// Sistema de cache inteligente para IA.TEX
import { queryClient } from './queryClient';

export class SmartCache {
  private static instance: SmartCache;
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  static getInstance(): SmartCache {
    if (!SmartCache.instance) {
      SmartCache.instance = new SmartCache();
    }
    return SmartCache.instance;
  }

  // Cache com TTL personalizado
  set(key: string, data: any, ttl?: number): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });
  }

  // Buscar do cache
  get(key: string): any | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    // Verificar se expirou
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Invalidar cache específico
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    queryClient.invalidateQueries({ queryKey: [key] });
  }

  // Invalidar múltiplas chaves
  invalidateMultiple(keys: string[]): void {
    keys.forEach(key => this.invalidate(key));
  }

  // Invalidar por padrão
  invalidateByPattern(pattern: string): void {
    const keysToDelete = Array.from(this.memoryCache.keys())
      .filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => this.invalidate(key));
  }

  // Limpar cache expirado
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.memoryCache.entries());
    for (const [key, cached] of entries) {
      if (now - cached.timestamp > cached.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Pre-carregar dados importantes
  preload(endpoints: string[]): void {
    endpoints.forEach(endpoint => {
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: this.DEFAULT_TTL
      });
    });
  }

  // Cache inteligente baseado em uso
  getStats(): { size: number; hitRate: number; memoryUsage: string } {
    return {
      size: this.memoryCache.size,
      hitRate: 0, // Implementar contador de hits
      memoryUsage: `${JSON.stringify(Array.from(this.memoryCache.values())).length} bytes`
    };
  }
}

// Instância global
export const smartCache = SmartCache.getInstance();

// Auto-limpeza a cada 10 minutos
setInterval(() => {
  smartCache.cleanup();
}, 10 * 60 * 1000);

// Pre-carregar dados críticos na inicialização
export const preloadCriticalData = () => {
  smartCache.preload([
    '/api/dashboard/metrics',
    '/api/fabrics',
    '/api/pricing-templates',
    '/api/models'
  ]);
};