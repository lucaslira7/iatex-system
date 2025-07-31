// Cache simples e eficiente para evitar requisições duplicadas
let activeRequests: Record<string, Promise<any>> = {};
let cachedData: Record<string, { data: any; timestamp: number }> = {};

const CACHE_DURATION = 30000; // 30 segundos

export async function cachedRequest(url: string): Promise<any> {
  // Verificar cache primeiro
  const cached = cachedData[url];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  // Se já há uma requisição ativa, retornar a mesma promise
  if (activeRequests[url] !== undefined) {
    return activeRequests[url];
  }
  
  // Criar nova requisição
  const request = fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      // Salvar no cache
      cachedData[url] = { data, timestamp: Date.now() };
      // Remover da lista de requisições ativas
      delete activeRequests[url];
      return data;
    })
    .catch(error => {
      // Remover da lista de requisições ativas em caso de erro
      delete activeRequests[url];
      throw error;
    });
  
  // Salvar na lista de requisições ativas
  activeRequests[url] = request;
  
  return request;
}

export function clearSimpleCache() {
  activeRequests = {};
  cachedData = {};
}

export function removeCacheEntry(url: string) {
  delete cachedData[url];
  delete activeRequests[url];
}