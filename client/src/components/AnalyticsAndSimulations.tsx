import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Factory,
  Clock,
  Filter,
  Download,
  Eye,
  Settings,
  RefreshCw,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PieChart,
  LineChart,
  Activity,
  Calendar,
  Zap,
  BarChart,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChartData {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'radar' | 'gauge';
  title: string;
  description: string;
  data: any[];
  config: any;
  filters: ChartFilter[];
  drillDownEnabled: boolean;
  lastUpdated: string;
}

interface ChartFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'number' | 'boolean';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
}

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  color: string;
  icon: any;
}

interface SimulationConfig {
  id: string;
  name: string;
  description: string;
  parameters: SimulationParameter[];
  results: SimulationResult[];
  status: 'idle' | 'running' | 'completed' | 'failed';
}

interface SimulationParameter {
  id: string;
  name: string;
  type: 'number' | 'percentage' | 'boolean';
  value: any;
  min?: number;
  max?: number;
  step?: number;
}

interface SimulationResult {
  id: string;
  name: string;
  value: number;
  target: number;
  variance: number;
  status: 'success' | 'warning' | 'error';
}

export default function AnalyticsAndSimulations() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChart, setSelectedChart] = useState<ChartData | null>(null);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showSimulationDialog, setShowSimulationDialog] = useState(false);
  const [globalFilters, setGlobalFilters] = useState({
    dateRange: '30d',
    category: 'all',
    factory: 'all'
  });
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [simulations, setSimulations] = useState<SimulationConfig[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);

  const { toast } = useToast();

  // Simular dados de métricas
  useEffect(() => {
    setMetrics([
      {
        id: '1',
        name: 'Receita Total',
        value: 152000,
        change: 12.5,
        trend: 'up',
        unit: 'R$',
        color: 'text-green-600',
        icon: DollarSign
      },
      {
        id: '2',
        name: 'Pedidos Ativos',
        value: 23,
        change: -5.2,
        trend: 'down',
        unit: '',
        color: 'text-red-600',
        icon: Package
      },
      {
        id: '3',
        name: 'Eficiência',
        value: 87,
        change: 3.8,
        trend: 'up',
        unit: '%',
        color: 'text-green-600',
        icon: Target
      },
      {
        id: '4',
        name: 'Clientes Ativos',
        value: 156,
        change: 8.3,
        trend: 'up',
        unit: '',
        color: 'text-green-600',
        icon: Users
      }
    ]);

    // Simular dados de gráficos
    setCharts([
      {
        id: '1',
        type: 'bar',
        title: 'Vendas por Mês',
        description: 'Comparativo de vendas nos últimos 12 meses',
        data: [
          { month: 'Jan', sales: 120000, orders: 18 },
          { month: 'Fev', sales: 135000, orders: 22 },
          { month: 'Mar', sales: 142000, orders: 25 },
          { month: 'Abr', sales: 152000, orders: 23 },
          { month: 'Mai', sales: 148000, orders: 21 },
          { month: 'Jun', sales: 165000, orders: 28 }
        ],
        config: {
          xAxis: 'month',
          yAxis: 'sales',
          color: 'blue',
          stacked: false
        },
        filters: [
          { id: '1', name: 'Período', type: 'select', value: '6m', options: ['3m', '6m', '12m'] },
          { id: '2', name: 'Tipo', type: 'select', value: 'sales', options: ['sales', 'orders'] }
        ],
        drillDownEnabled: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        type: 'line',
        title: 'Eficiência de Produção',
        description: 'Evolução da eficiência por facção',
        data: [
          { date: '2025-01-01', faccaoA: 85, faccaoB: 78, faccaoC: 92 },
          { date: '2025-01-08', faccaoA: 87, faccaoB: 82, faccaoC: 89 },
          { date: '2025-01-15', faccaoA: 89, faccaoB: 85, faccaoC: 91 },
          { date: '2025-01-22', faccaoA: 91, faccaoB: 88, faccaoC: 93 }
        ],
        config: {
          xAxis: 'date',
          yAxis: 'percentage',
          color: 'multi',
          smooth: true
        },
        filters: [
          { id: '1', name: 'Facção', type: 'select', value: 'all', options: ['all', 'faccaoA', 'faccaoB', 'faccaoC'] }
        ],
        drillDownEnabled: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        type: 'pie',
        title: 'Distribuição de Produtos',
        description: 'Participação de cada produto nas vendas',
        data: [
          { product: 'Camisetas', sales: 45, percentage: 35 },
          { product: 'Calças', sales: 32, percentage: 25 },
          { product: 'Vestidos', sales: 28, percentage: 22 },
          { product: 'Outros', sales: 23, percentage: 18 }
        ],
        config: {
          value: 'sales',
          label: 'product',
          color: 'palette'
        },
        filters: [
          { id: '1', name: 'Período', type: 'select', value: '30d', options: ['7d', '30d', '90d'] }
        ],
        drillDownEnabled: false,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        type: 'area',
        title: 'Fluxo de Caixa',
        description: 'Entradas e saídas de caixa ao longo do tempo',
        data: [
          { date: '2025-01-01', receitas: 45000, despesas: 32000, saldo: 13000 },
          { date: '2025-01-08', receitas: 52000, despesas: 38000, saldo: 14000 },
          { date: '2025-01-15', receitas: 48000, despesas: 35000, saldo: 13000 },
          { date: '2025-01-22', receitas: 55000, despesas: 42000, saldo: 13000 }
        ],
        config: {
          xAxis: 'date',
          yAxis: 'value',
          color: 'gradient',
          stacked: true
        },
        filters: [
          { id: '1', name: 'Tipo', type: 'select', value: 'all', options: ['all', 'receitas', 'despesas'] }
        ],
        drillDownEnabled: true,
        lastUpdated: new Date().toISOString()
      }
    ]);

    // Simular dados de simulações
    setSimulations([
      {
        id: '1',
        name: 'Simulação de Preços',
        description: 'Análise de impacto de mudanças de preço',
        parameters: [
          { id: '1', name: 'Aumento de Preço (%)', type: 'percentage', value: 10, min: 0, max: 50, step: 5 },
          { id: '2', name: 'Redução de Demanda (%)', type: 'percentage', value: 5, min: 0, max: 30, step: 2 },
          { id: '3', name: 'Custos Fixos', type: 'number', value: 15000, min: 10000, max: 25000, step: 1000 }
        ],
        results: [
          { id: '1', name: 'Receita Projetada', value: 167200, target: 160000, variance: 4.5, status: 'success' },
          { id: '2', name: 'Margem de Lucro', value: 28.5, target: 25, variance: 14, status: 'success' },
          { id: '3', name: 'Volume de Vendas', value: 21.8, target: 23, variance: -5.2, status: 'warning' }
        ],
        status: 'completed'
      },
      {
        id: '2',
        name: 'Otimização de Produção',
        description: 'Análise de eficiência com diferentes cenários',
        parameters: [
          { id: '1', name: 'Horas Extras (%)', type: 'percentage', value: 20, min: 0, max: 50, step: 5 },
          { id: '2', name: 'Nova Máquina', type: 'boolean', value: true },
          { id: '3', name: 'Treinamento Equipe', type: 'boolean', value: false }
        ],
        results: [
          { id: '1', name: 'Capacidade de Produção', value: 125, target: 120, variance: 4.2, status: 'success' },
          { id: '2', name: 'Custos Operacionais', value: 18500, target: 18000, variance: 2.8, status: 'warning' },
          { id: '3', name: 'Eficiência Geral', value: 92, target: 90, variance: 2.2, status: 'success' }
        ],
        status: 'completed'
      }
    ]);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar': return BarChart;
      case 'line': return LineChart;
      case 'pie': return PieChart;
      case 'area': return Activity;
      case 'scatter': return BarChart;
      case 'heatmap': return BarChart;
      case 'radar': return BarChart;
      case 'gauge': return BarChart;
      default: return BarChart3;
    }
  };

  const handleChartClick = (chart: ChartData) => {
    setSelectedChart(chart);
    setShowChartDialog(true);
  };

  const handleSimulationRun = (simulationId: string) => {
    setSimulations(prev =>
      prev.map(s =>
        s.id === simulationId
          ? { ...s, status: 'running' as const }
          : s
      )
    );

    // Simular execução da simulação
    setTimeout(() => {
      setSimulations(prev =>
        prev.map(s =>
          s.id === simulationId
            ? { ...s, status: 'completed' as const }
            : s
        )
      );

      toast({
        title: "Simulação concluída",
        description: "Os resultados foram atualizados com sucesso.",
      });
    }, 3000);
  };

  const handleChartFilterChange = (chartId: string, filterId: string, value: any) => {
    setCharts(prev =>
      prev.map(chart =>
        chart.id === chartId
          ? {
            ...chart,
            filters: chart.filters.map(filter =>
              filter.id === filterId
                ? { ...filter, value }
                : filter
            )
          }
          : chart
      )
    );
  };

  const handleGlobalFilterChange = (filter: string, value: any) => {
    setGlobalFilters(prev => ({ ...prev, [filter]: value }));
  };

  const exportChart = (chart: ChartData) => {
    toast({
      title: "Exportando gráfico",
      description: `Gráfico "${chart.title}" exportado com sucesso.`,
    });
  };

  const refreshData = () => {
    toast({
      title: "Atualizando dados",
      description: "Dados dos gráficos atualizados.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Simulações</h1>
            <p className="text-gray-600">Gráficos interativos e simulações avançadas</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={showSimulationDialog} onOpenChange={setShowSimulationDialog}>
            <DialogTrigger asChild>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                Nova Simulação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Simulação</DialogTitle>
                <DialogDescription>
                  Configure parâmetros para análise de cenários
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome da Simulação</Label>
                  <Input placeholder="Ex: Análise de Preços 2025" />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input placeholder="Descreva o objetivo da simulação" />
                </div>
                <div>
                  <Label>Tipo de Análise</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pricing">Análise de Preços</SelectItem>
                      <SelectItem value="production">Otimização de Produção</SelectItem>
                      <SelectItem value="inventory">Gestão de Estoque</SelectItem>
                      <SelectItem value="financial">Projeções Financeiras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros Globais</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div>
              <Label>Período</Label>
              <Select
                value={globalFilters.dateRange}
                onValueChange={(value) => handleGlobalFilterChange('dateRange', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select
                value={globalFilters.category}
                onValueChange={(value) => handleGlobalFilterChange('category', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="operational">Operacional</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Facção</Label>
              <Select
                value={globalFilters.factory}
                onValueChange={(value) => handleGlobalFilterChange('factory', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="faccaoA">Facção A</SelectItem>
                  <SelectItem value="faccaoB">Facção B</SelectItem>
                  <SelectItem value="faccaoC">Facção C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend);
          const MetricIcon = metric.icon;

          return (
            <Card key={metric.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <MetricIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.unit}{metric.value.toLocaleString()}
                </div>
                <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metric.trend)}`}>
                  <TrendIcon className="h-3 w-3" />
                  <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                  <span>vs mês anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-1">
            <BarChart3 className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center space-x-1">
            <LineChart className="h-4 w-4" />
            <span>Gráficos</span>
          </TabsTrigger>
          <TabsTrigger value="simulations" className="flex items-center space-x-1">
            <Zap className="h-4 w-4" />
            <span>Simulações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.slice(0, 4).map((chart) => {
              const ChartIcon = getChartIcon(chart.type);

              return (
                <Card key={chart.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChartIcon className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg">{chart.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-1">
                        {chart.drillDownEnabled && (
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => exportChart(chart)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{chart.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Gráfico {chart.type}</p>
                        <p className="text-xs text-gray-500">
                          {chart.data.length} pontos de dados
                        </p>
                      </div>
                    </div>

                    {/* Filtros do Gráfico */}
                    {chart.filters.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm font-medium">Filtros:</Label>
                        <div className="flex flex-wrap gap-2">
                          {chart.filters.map(filter => (
                            <Select
                              key={filter.id}
                              value={filter.value}
                              onValueChange={(value) => handleChartFilterChange(chart.id, filter.id, value)}
                            >
                              <SelectTrigger className="w-auto">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {filter.options?.map(option => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Gráficos Interativos</h2>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo de gráfico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="line">Linhas</SelectItem>
                  <SelectItem value="pie">Pizza</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.map((chart) => {
              const ChartIcon = getChartIcon(chart.type);

              return (
                <Card key={chart.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleChartClick(chart)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ChartIcon className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg">{chart.title}</CardTitle>
                      </div>
                      <Badge variant="outline">{chart.type}</Badge>
                    </div>
                    <CardDescription>{chart.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ChartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-600">Clique para expandir</p>
                        <p className="text-sm text-gray-500">
                          Visualização interativa com drill-down
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>Atualizado: {new Date(chart.lastUpdated).toLocaleDateString()}</span>
                      <span>{chart.data.length} pontos</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="simulations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Simulações de Cenários</h2>
            <Button onClick={() => setShowSimulationDialog(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Nova Simulação
            </Button>
          </div>

          <div className="grid gap-6">
            {simulations.map((simulation) => (
              <Card key={simulation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{simulation.name}</CardTitle>
                      <CardDescription>{simulation.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={simulation.status === 'completed' ? 'default' :
                          simulation.status === 'running' ? 'secondary' : 'outline'}
                      >
                        {simulation.status === 'completed' ? 'Concluída' :
                          simulation.status === 'running' ? 'Executando' : 'Pendente'}
                      </Badge>
                      {simulation.status === 'idle' && (
                        <Button size="sm" onClick={() => handleSimulationRun(simulation.id)}>
                          <Zap className="h-4 w-4 mr-2" />
                          Executar
                        </Button>
                      )}
                      {simulation.status === 'running' && (
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Processando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Parâmetros */}
                    <div>
                      <h4 className="font-medium mb-3">Parâmetros de Entrada</h4>
                      <div className="space-y-3">
                        {simulation.parameters.map(param => (
                          <div key={param.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{param.name}</p>
                              <p className="text-sm text-gray-600">
                                {param.type === 'percentage' ? `${param.value}%` :
                                  param.type === 'boolean' ? (param.value ? 'Sim' : 'Não') :
                                    param.value}
                              </p>
                            </div>
                            {param.type === 'number' && (
                              <Input
                                type="number"
                                value={param.value}
                                className="w-24"
                                min={param.min}
                                max={param.max}
                                step={param.step}
                              />
                            )}
                            {param.type === 'percentage' && (
                              <Input
                                type="number"
                                value={param.value}
                                className="w-24"
                                min={param.min}
                                max={param.max}
                                step={param.step}
                              />
                            )}
                            {param.type === 'boolean' && (
                              <Switch checked={param.value} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resultados */}
                    <div>
                      <h4 className="font-medium mb-3">Resultados da Simulação</h4>
                      <div className="space-y-3">
                        {simulation.results.map(result => (
                          <div key={result.id} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{result.name}</p>
                              <Badge
                                variant={result.status === 'success' ? 'default' :
                                  result.status === 'warning' ? 'secondary' : 'destructive'}
                              >
                                {result.status === 'success' ? '✓' :
                                  result.status === 'warning' ? '⚠' : '✗'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <p className="text-gray-600">Atual</p>
                                <p className="font-medium">{result.value}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Meta</p>
                                <p className="font-medium">{result.target}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Variação</p>
                                <p className={`font-medium ${result.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {result.variance > 0 ? '+' : ''}{result.variance}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Detalhes do Gráfico */}
      <Dialog open={showChartDialog} onOpenChange={setShowChartDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedChart?.title}</DialogTitle>
            <DialogDescription>{selectedChart?.description}</DialogDescription>
          </DialogHeader>
          {selectedChart && (
            <div className="space-y-4">
              <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {(() => {
                    const ChartIcon = getChartIcon(selectedChart.type);
                    return <ChartIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />;
                  })()}
                  <p className="text-xl font-medium text-gray-600">Gráfico Interativo</p>
                  <p className="text-sm text-gray-500">
                    Visualização completa com filtros avançados e drill-down
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filtros Avançados</Label>
                  <div className="space-y-2 mt-2">
                    {selectedChart.filters.map(filter => (
                      <div key={filter.id} className="flex items-center space-x-2">
                        <Label className="w-24 text-sm">{filter.name}:</Label>
                        <Select value={filter.value}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {filter.options?.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Configurações</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label className="text-sm">Drill-down habilitado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label className="text-sm">Animações</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch />
                      <Label className="text-sm">Modo escuro</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}