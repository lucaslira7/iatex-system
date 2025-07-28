import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Gauge, TrendingUp, TrendingDown, Package, DollarSign, Users, Factory, Settings, RefreshCw, Clock, Database, Zap, BarChart3, Target, AlertTriangle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Cache de performance para métricas
interface DashboardCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number; // Time to live em milissegundos
  };
}

// Cache em memória
const dashboardCache: DashboardCache = {};

// Função para gerenciar cache
const getCachedData = (key: string, ttl: number = 5 * 60 * 1000) => {
  const cached = dashboardCache[key];
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
  dashboardCache[key] = {
    data,
    timestamp: Date.now(),
    ttl
  };
};

// Função para limpar cache expirado
const cleanupExpiredCache = () => {
  const now = Date.now();
  Object.keys(dashboardCache).forEach(key => {
    if (now - dashboardCache[key].timestamp > dashboardCache[key].ttl) {
      delete dashboardCache[key];
    }
  });
};

// Limpar cache expirado a cada 5 minutos
setInterval(cleanupExpiredCache, 5 * 60 * 1000);

interface DashboardMetrics {
  totalFabrics: number;
  lowStockFabrics: number;
  activeOrders: number;
  totalStockValue: number;
  productionEfficiency: number;
  monthlyRevenue: number;
  pendingDeliveries: number;
  completedOrders: number;
  averageOrderValue: number;
  topSellingFabrics: Array<{
    id: number;
    name: string;
    salesCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  performanceTrends: {
    revenue: number[];
    orders: number[];
    efficiency: number[];
    dates: string[];
  };
}

interface DashboardCard {
  id: string;
  title: string;
  value: string;
  rawValue?: number;
  icon: any;
  color: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'yellow';
  visible: boolean;
  order: number;
  description?: string;
  progress?: number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  cacheKey?: string;
  cacheTTL?: number;
}

interface DashboardConfig {
  cards: DashboardCard[];
  layout: 'grid' | 'list';
  refreshInterval: number;
  cacheEnabled: boolean;
  performanceMode: boolean;
}

export default function CustomizableDashboardFixed({ onSectionChange }: { onSectionChange: (section: string) => void }) {
  const [config, setConfig] = useState<DashboardConfig>({
    cards: [
      {
        id: 'total-fabrics',
        title: 'Total de Tecidos',
        value: '0',
        icon: Package,
        color: 'blue',
        visible: true,
        order: 1,
        cacheKey: 'total_fabrics',
        cacheTTL: 2 * 60 * 1000 // 2 minutos
      },
      {
        id: 'low-stock',
        title: 'Estoque Baixo',
        value: '0',
        icon: AlertTriangle,
        color: 'red',
        visible: true,
        order: 2,
        cacheKey: 'low_stock',
        cacheTTL: 1 * 60 * 1000 // 1 minuto
      },
      {
        id: 'active-orders',
        title: 'Pedidos Ativos',
        value: '0',
        icon: Factory,
        color: 'green',
        visible: true,
        order: 3,
        cacheKey: 'active_orders',
        cacheTTL: 30 * 1000 // 30 segundos
      },
      {
        id: 'stock-value',
        title: 'Valor do Estoque',
        value: 'R$ 0,00',
        icon: DollarSign,
        color: 'purple',
        visible: true,
        order: 4,
        cacheKey: 'stock_value',
        cacheTTL: 5 * 60 * 1000 // 5 minutos
      },
      {
        id: 'efficiency',
        title: 'Eficiência',
        value: '0%',
        icon: Target,
        color: 'orange',
        visible: true,
        order: 5,
        cacheKey: 'efficiency',
        cacheTTL: 2 * 60 * 1000 // 2 minutos
      },
      {
        id: 'revenue',
        title: 'Receita Mensal',
        value: 'R$ 0,00',
        icon: TrendingUp,
        color: 'green',
        visible: true,
        order: 6,
        cacheKey: 'revenue',
        cacheTTL: 10 * 60 * 1000 // 10 minutos
      }
    ],
    layout: 'grid',
    refreshInterval: 30000,
    cacheEnabled: true,
    performanceMode: true
  });

  const [showSettings, setShowSettings] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Função para buscar dados com cache
  const fetchWithCache = async (endpoint: string, cacheKey: string, ttl: number) => {
    if (config.cacheEnabled) {
      const cached = getCachedData(cacheKey, ttl);
      if (cached) {
        setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
        return cached;
      }
    }

    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (config.cacheEnabled) {
        setCachedData(cacheKey, data, ttl);
      }

      return data;
    } catch (error) {
      console.error(`Erro ao buscar dados de ${endpoint}:`, error);
      return null;
    }
  };

  // Query principal com cache otimizado
  const { data: metrics, isLoading, error, refetch } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const startTime = performance.now();

      // Buscar dados em paralelo com cache
      const promises = config.cards.map(async (card) => {
        if (!card.cacheKey) return null;

        const endpoint = `/api/dashboard/${card.cacheKey}`;
        return fetchWithCache(endpoint, card.cacheKey, card.cacheTTL || 5 * 60 * 1000);
      });

      const results = await Promise.all(promises);

      const endTime = performance.now();
      console.log(`Dashboard carregado em ${endTime - startTime}ms`);

      // Simular dados para demonstração
      return {
        totalFabrics: 156,
        lowStockFabrics: 8,
        activeOrders: 23,
        totalStockValue: 45230.50,
        productionEfficiency: 87,
        monthlyRevenue: 152000,
        pendingDeliveries: 12,
        completedOrders: 89,
        averageOrderValue: 5428.50,
        topSellingFabrics: [
          { id: 1, name: 'Algodão Premium', salesCount: 45 },
          { id: 2, name: 'Malha Básica', salesCount: 38 },
          { id: 3, name: 'Tecido Elástico', salesCount: 32 }
        ],
        recentActivity: [
          { id: '1', type: 'order', description: 'Novo pedido #1234 criado', timestamp: new Date().toISOString() },
          { id: '2', type: 'production', description: 'Lote #567 concluído', timestamp: new Date(Date.now() - 300000).toISOString() },
          { id: '3', type: 'fabric', description: 'Tecido "Algodão Premium" adicionado', timestamp: new Date(Date.now() - 600000).toISOString() }
        ],
        performanceTrends: {
          revenue: [120000, 135000, 142000, 152000],
          orders: [18, 22, 25, 23],
          efficiency: [82, 85, 86, 87],
          dates: ['Jan', 'Fev', 'Mar', 'Abr']
        }
      };
    },
    staleTime: config.performanceMode ? 5 * 60 * 1000 : 30 * 1000, // 5 min em modo performance
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: config.refreshInterval,
    refetchIntervalInBackground: false
  });

  // Atualizar estatísticas de cache
  useEffect(() => {
    setCacheStats({
      hits: 0,
      misses: 0,
      size: Object.keys(dashboardCache).length
    });
  }, []);

  // Atualizar valores dos cards com dados em cache
  useEffect(() => {
    if (metrics) {
      setConfig(prev => ({
        ...prev,
        cards: prev.cards.map(card => {
          let value = '0';
          let rawValue = 0;
          let change = undefined;
          let trend: 'up' | 'down' | 'stable' = 'stable';

          switch (card.id) {
            case 'total-fabrics':
              value = metrics.totalFabrics.toString();
              rawValue = metrics.totalFabrics;
              change = '+12%';
              trend = 'up';
              break;
            case 'low-stock':
              value = metrics.lowStockFabrics.toString();
              rawValue = metrics.lowStockFabrics;
              change = '-3%';
              trend = 'down';
              break;
            case 'active-orders':
              value = metrics.activeOrders.toString();
              rawValue = metrics.activeOrders;
              change = '+5%';
              trend = 'up';
              break;
            case 'stock-value':
              value = `R$ ${metrics.totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              rawValue = metrics.totalStockValue;
              change = '+8%';
              trend = 'up';
              break;
            case 'efficiency':
              value = `${metrics.productionEfficiency}%`;
              rawValue = metrics.productionEfficiency;
              change = '+2%';
              trend = 'up';
              break;
            case 'revenue':
              value = `R$ ${metrics.monthlyRevenue.toLocaleString('pt-BR')}`;
              rawValue = metrics.monthlyRevenue;
              change = '+15%';
              trend = 'up';
              break;
          }

          return {
            ...card,
            value,
            rawValue,
            change,
            trend
          };
        })
      }));
    }
  }, [metrics]);

  const handleRefresh = async () => {
    setLastRefresh(new Date());

    // Limpar cache se solicitado
    if (!config.cacheEnabled) {
      Object.keys(dashboardCache).forEach(key => delete dashboardCache[key]);
    }

    await refetch();

    toast({
      title: "Dashboard atualizado",
      description: "Dados atualizados com sucesso!",
    });
  };

  const toggleCardVisibility = (cardId: string) => {
    setConfig(prev => ({
      ...prev,
      cards: prev.cards.map(card =>
        card.id === cardId ? { ...card, visible: !card.visible } : card
      )
    }));
  };

  const toggleCache = () => {
    setConfig(prev => ({ ...prev, cacheEnabled: !prev.cacheEnabled }));
  };

  const togglePerformanceMode = () => {
    setConfig(prev => ({ ...prev, performanceMode: !prev.performanceMode }));
  };

  const clearCache = () => {
    Object.keys(dashboardCache).forEach(key => delete dashboardCache[key]);
    setCacheStats(prev => ({ ...prev, size: 0 }));

    toast({
      title: "Cache limpo",
      description: "Todos os dados em cache foram removidos.",
    });
  };

  const visibleCards = config.cards.filter(card => card.visible).sort((a, b) => a.order - b.order);

  if (error) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dashboard</h3>
            <p className="text-gray-600 mb-4">Não foi possível carregar os dados do dashboard.</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Gauge className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Visão geral e métricas em tempo real</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Database className="h-3 w-3" />
            <span>Cache: {cacheStats.hits}/{cacheStats.hits + cacheStats.misses}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>{config.performanceMode ? 'Performance' : 'Normal'}</span>
          </Badge>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurações do Dashboard</DialogTitle>
                <DialogDescription>
                  Configure performance, cache e exibição dos cards
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Modo Performance</Label>
                      <Switch
                        checked={config.performanceMode}
                        onCheckedChange={togglePerformanceMode}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Cache Habilitado</Label>
                      <Switch
                        checked={config.cacheEnabled}
                        onCheckedChange={toggleCache}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Intervalo de Atualização</Label>
                      <Select
                        value={config.refreshInterval.toString()}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          refreshInterval: parseInt(value)
                        }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15000">15s</SelectItem>
                          <SelectItem value="30000">30s</SelectItem>
                          <SelectItem value="60000">1min</SelectItem>
                          <SelectItem value="300000">5min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Cards do Dashboard</h3>
                  <div className="space-y-2">
                    {config.cards.map(card => (
                      <div key={card.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={card.visible}
                            onCheckedChange={() => toggleCardVisibility(card.id)}
                          />
                          <span className="font-medium">{card.title}</span>
                        </div>
                        <Badge variant="outline">{card.order}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Estatísticas de Cache</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{cacheStats.hits}</p>
                      <p className="text-sm text-gray-600">Cache Hits</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{cacheStats.misses}</p>
                      <p className="text-sm text-gray-600">Cache Misses</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{cacheStats.size}</p>
                      <p className="text-sm text-gray-600">Itens em Cache</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" onClick={clearCache}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Cache
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Informações de Performance */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                Última atualização: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Cache Hit Rate: {cacheStats.hits + cacheStats.misses > 0 ? Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100) : 0}%</span>
              <span>Itens em Cache: {cacheStats.size}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards do Dashboard */}
      <div className={`grid gap-6 ${config.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {visibleCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card key={card.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.change && (
                  <div className="flex items-center space-x-1 text-xs">
                    {card.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : card.trend === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : (
                      <div className="h-3 w-3" />
                    )}
                    <span className={card.trend === 'up' ? 'text-green-600' : card.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                      {card.change}
                    </span>
                    <span className="text-gray-500">vs mês anterior</span>
                  </div>
                )}
                {card.progress !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${card.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{card.progress}% completo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Atividade Recente */}
      {metrics?.recentActivity && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-2 border rounded">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}