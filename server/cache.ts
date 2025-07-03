import { LRUCache } from 'lru-cache';

// Cache para dados que não mudam com frequência
const staticDataCache = new LRUCache<string, any>({
  max: 100,
  ttl: 5 * 60 * 1000, // 5 minutos
});

// Cache para métricas do dashboard
const metricsCache = new LRUCache<string, any>({
  max: 20,
  ttl: 2 * 60 * 1000, // 2 minutos
});

// Cache para consultas de usuário
const userCache = new LRUCache<string, any>({
  max: 50,
  ttl: 10 * 60 * 1000, // 10 minutos
});

export class CacheManager {
  // Cache para dados estáticos
  static setStaticData(key: string, data: any) {
    staticDataCache.set(key, data);
  }

  static getStaticData(key: string) {
    return staticDataCache.get(key);
  }

  static clearStaticData(key?: string) {
    if (key) {
      staticDataCache.delete(key);
    } else {
      staticDataCache.clear();
    }
  }

  // Cache para métricas
  static setMetrics(key: string, data: any) {
    metricsCache.set(key, data);
  }

  static getMetrics(key: string) {
    return metricsCache.get(key);
  }

  static clearMetrics(key?: string) {
    if (key) {
      metricsCache.delete(key);
    } else {
      metricsCache.clear();
    }
  }

  // Cache para usuários
  static setUser(key: string, data: any) {
    userCache.set(key, data);
  }

  static getUser(key: string) {
    return userCache.get(key);
  }

  static clearUser(key?: string) {
    if (key) {
      userCache.delete(key);
    } else {
      userCache.clear();
    }
  }

  // Invalidar cache relacionado
  static invalidateRelated(module: string) {
    switch (module) {
      case 'fabrics':
        this.clearStaticData('fabrics');
        this.clearMetrics('dashboard');
        break;
      case 'models':
        this.clearStaticData('models');
        this.clearStaticData('templates');
        this.clearMetrics('dashboard');
        break;
      case 'orders':
        this.clearStaticData('orders');
        this.clearMetrics('dashboard');
        break;
      case 'clients':
        this.clearStaticData('clients');
        break;
      default:
        this.clearMetrics('dashboard');
        break;
    }
  }
}