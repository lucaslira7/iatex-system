// Cache global para evitar requisições duplicadas
const requestCache = new Map<string, Promise<any>>();
const dataCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function cachedFetch(url: string, options?: RequestInit): Promise<any> {
  const cacheKey = `${url}_${JSON.stringify(options || {})}`;
  
  // Verificar cache de dados primeiro
  const cached = dataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Verificar se já há uma requisição em andamento
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }
  
  // Criar nova requisição
  const requestPromise = fetch(url, options)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      // Salvar no cache de dados
      dataCache.set(cacheKey, { data, timestamp: Date.now() });
      // Remover da cache de requisições
      requestCache.delete(cacheKey);
      return data;
    })
    .catch(error => {
      // Remover da cache de requisições em caso de erro
      requestCache.delete(cacheKey);
      throw error;
    });
  
  // Salvar na cache de requisições
  requestCache.set(cacheKey, requestPromise);
  
  return requestPromise;
}

export function clearCache() {
  requestCache.clear();
  dataCache.clear();
}

export function clearCacheByPattern(pattern: string) {
  Array.from(requestCache.keys()).forEach(key => {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  });
  Array.from(dataCache.keys()).forEach(key => {
    if (key.includes(pattern)) {
      dataCache.delete(key);
    }
  });
}