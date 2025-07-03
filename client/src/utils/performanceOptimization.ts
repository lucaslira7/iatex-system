// Sistema de cache e throttling para melhorar performance

// Cache global para evitar requisições duplicadas
const requestsInProgress = new Set<string>();
const responseCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_DURATION = 60000; // 1 minuto

export async function throttledFetch(url: string, options?: RequestInit): Promise<any> {
  const cacheKey = `${url}_${JSON.stringify(options || {})}`;
  
  // Verificar cache primeiro
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Se já há uma requisição em andamento para esta URL, aguardar
  if (requestsInProgress.has(cacheKey)) {
    // Aguardar um pouco e tentar novamente
    await new Promise(resolve => setTimeout(resolve, 100));
    const retryCache = responseCache.get(cacheKey);
    if (retryCache) return retryCache.data;
  }
  
  // Marcar requisição como em andamento
  requestsInProgress.add(cacheKey);
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    // Salvar no cache
    responseCache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } finally {
    // Remover da lista de requisições em andamento
    requestsInProgress.delete(cacheKey);
  }
}

export function clearPerformanceCache() {
  requestsInProgress.clear();
  responseCache.clear();
}

export function clearCacheForUrl(url: string) {
  for (const key of responseCache.keys()) {
    if (key.includes(url)) {
      responseCache.delete(key);
    }
  }
  for (const key of requestsInProgress) {
    if (key.includes(url)) {
      requestsInProgress.delete(key);
    }
  }
}