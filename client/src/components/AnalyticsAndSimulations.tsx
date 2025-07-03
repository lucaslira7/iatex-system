import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Package,
  Users,
  Calendar,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Fabric, Model } from '@shared/schema';

interface SimulationResult {
  fabric: string;
  cost: number;
  margin: number;
  finalPrice: number;
  savings: number;
}

interface KPIData {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  description: string;
  target?: string;
  progress?: number;
}

export default function AnalyticsAndSimulations() {
  const [activeTab, setActiveTab] = useState('simulations');
  const [selectedModel, setSelectedModel] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState('');
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Buscar dados do sistema
  const { data: fabrics = [] } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });

  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  // Mock data para KPIs e relatórios
  const kpiData: KPIData[] = [
    {
      title: 'Receita Total',
      value: 'R$ 85.420',
      change: 12.5,
      trend: 'up',
      description: 'vs mês anterior',
      target: 'R$ 100.000',
      progress: 85
    },
    {
      title: 'Margem Média',
      value: '68%',
      change: -2.1,
      trend: 'down',
      description: 'vs mês anterior',
      target: '70%',
      progress: 68
    },
    {
      title: 'Pedidos Ativos',
      value: '24',
      change: 15.8,
      trend: 'up',
      description: 'novos pedidos',
      target: '30',
      progress: 80
    },
    {
      title: 'Satisfação Cliente',
      value: '4.8/5',
      change: 5.2,
      trend: 'up',
      description: 'média de avaliações',
      target: '5.0',
      progress: 96
    }
  ];

  const topPerformingModels = [
    { name: 'Camisa Social Premium', sales: 45, revenue: 'R$ 12.650', margin: '72%' },
    { name: 'Vestido Casual Verão', sales: 38, revenue: 'R$ 9.880', margin: '65%' },
    { name: 'Calça Alfaiataria', sales: 32, revenue: 'R$ 8.960', margin: '58%' },
    { name: 'Blazer Executivo', sales: 28, revenue: 'R$ 11.200', margin: '68%' },
    { name: 'Saia Midi Elegante', sales: 25, revenue: 'R$ 6.250', margin: '62%' }
  ];

  const fabricAnalysis = [
    { name: 'Algodão Premium', usage: 35, cost: 'R$ 45/m', efficiency: 'Alta', trend: 'up' },
    { name: 'Linho Importado', usage: 22, cost: 'R$ 68/m', efficiency: 'Média', trend: 'down' },
    { name: 'Poliéster Técnico', usage: 28, cost: 'R$ 32/m', efficiency: 'Alta', trend: 'up' },
    { name: 'Seda Natural', usage: 15, cost: 'R$ 95/m', efficiency: 'Baixa', trend: 'down' }
  ];

  const monthlyTrends = [
    { month: 'Jan', revenue: 45000, orders: 18, margin: 65 },
    { month: 'Fev', revenue: 52000, orders: 22, margin: 68 },
    { month: 'Mar', revenue: 48000, orders: 19, margin: 66 },
    { month: 'Abr', revenue: 58000, orders: 26, margin: 70 },
    { month: 'Mai', revenue: 62000, orders: 28, margin: 69 },
    { month: 'Jun', revenue: 71000, orders: 32, margin: 72 }
  ];

  const runFabricComparison = async () => {
    if (!selectedModel) {
      toast({
        title: "Selecione um modelo",
        description: "Escolha um modelo para executar a simulação.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular análise com delay
    setTimeout(() => {
      const mockResults: SimulationResult[] = fabrics.slice(0, 4).map((fabric, index) => {
        const baseCost = 25 + (index * 8);
        const margin = 60 + (index * 5);
        const finalPrice = baseCost * (1 + margin / 100);
        const savings = index === 0 ? 0 : (finalPrice - 45) * -1;
        
        return {
          fabric: fabric.name,
          cost: baseCost,
          margin: margin,
          finalPrice: finalPrice,
          savings: savings
        };
      });
      
      setSimulationResults(mockResults);
      setIsLoading(false);
      
      toast({
        title: "Simulação concluída!",
        description: "Comparação de tecidos gerada com sucesso.",
      });
    }, 2000);
  };

  const runReverseMarkup = () => {
    if (!targetPrice || !markupPercentage) {
      toast({
        title: "Preencha todos os campos",
        description: "Informe o preço final e a margem desejada.",
        variant: "destructive",
      });
      return;
    }

    const finalPrice = parseFloat(targetPrice);
    const markup = parseFloat(markupPercentage);
    const maxCost = finalPrice / (1 + markup / 100);
    
    toast({
      title: "Cálculo realizado!",
      description: `Custo máximo: R$ ${maxCost.toFixed(2)}`,
    });
  };

  const exportReport = (type: string) => {
    toast({
      title: "Relatório exportado!",
      description: `${type} foi baixado com sucesso.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Simulações</h2>
          <p className="text-gray-600">Análises avançadas e simulações para otimização do negócio</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simulations">Simulações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        {/* Aba Simulações */}
        <TabsContent value="simulations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Comparação de Tecidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpDown className="h-5 w-5 mr-2 text-blue-600" />
                  Comparação de Tecidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="model-select">Modelo para Análise</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={runFabricComparison} 
                  disabled={isLoading || !selectedModel}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Executar Simulação
                    </>
                  )}
                </Button>

                {simulationResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Resultados da Comparação:</h4>
                    {simulationResults.map((result, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                        <div>
                          <span className="font-medium">{result.fabric}</span>
                          <div className="text-sm text-gray-600">
                            Custo: R$ {result.cost.toFixed(2)} | Margem: {result.margin}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            R$ {result.finalPrice.toFixed(2)}
                          </div>
                          {result.savings !== 0 && (
                            <div className={`text-sm ${result.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.savings > 0 ? '+' : ''}R$ {result.savings.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Markup Reverso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Markup Reverso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="target-price">Preço Final Desejado (R$)</Label>
                  <Input
                    id="target-price"
                    type="number"
                    step="0.01"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="100.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="markup">Margem Desejada (%)</Label>
                  <Input
                    id="markup"
                    type="number"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(e.target.value)}
                    placeholder="70"
                  />
                </div>
                
                <Button onClick={runReverseMarkup} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Custo Máximo
                </Button>

                <div className="p-3 bg-blue-50 rounded">
                  <h4 className="font-medium text-blue-800 mb-2">Como funciona:</h4>
                  <p className="text-sm text-blue-700">
                    Informe o preço que deseja cobrar e a margem desejada. 
                    O sistema calculará qual deve ser o custo máximo para atingir essa meta.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projeções de Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Projeções de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded">
                  <h4 className="font-medium text-green-800">Tendência de Alta</h4>
                  <p className="text-2xl font-bold text-green-600">+15%</p>
                  <p className="text-sm text-green-700">Algodão premium nos próximos 3 meses</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded">
                  <h4 className="font-medium text-yellow-800">Estável</h4>
                  <p className="text-2xl font-bold text-yellow-600">±2%</p>
                  <p className="text-sm text-yellow-700">Sintéticos mantêm preços estáveis</p>
                </div>
                <div className="p-4 bg-red-50 rounded">
                  <h4 className="font-medium text-red-800">Tendência de Queda</h4>
                  <p className="text-2xl font-bold text-red-600">-8%</p>
                  <p className="text-sm text-red-700">Linho importado em declínio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend === 'up' ? '+' : ''}{kpi.change}% {kpi.description}
                  </div>
                  {kpi.progress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Meta: {kpi.target}</span>
                        <span>{kpi.progress}%</span>
                      </div>
                      <Progress value={kpi.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Modelos com Melhor Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Top 5 Modelos - Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformingModels.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <span className="font-medium">{model.name}</span>
                        <div className="text-sm text-gray-600">{model.sales} vendas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{model.revenue}</div>
                      <div className="text-sm text-gray-600">Margem: {model.margin}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Análise de Tecidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Análise de Uso de Tecidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fabricAnalysis.map((fabric, index) => (
                  <div key={index} className="p-4 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{fabric.name}</h4>
                      {fabric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uso:</span>
                        <span>{fabric.usage}%</span>
                      </div>
                      <Progress value={fabric.usage} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Custo:</span>
                        <span className="font-medium">{fabric.cost}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Eficiência:</span>
                        <Badge variant={fabric.efficiency === 'Alta' ? 'default' : fabric.efficiency === 'Média' ? 'secondary' : 'destructive'}>
                          {fabric.efficiency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Relatórios Rápidos */}
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Executivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportReport('Relatório de Vendas Mensal')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Vendas Mensal
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportReport('Análise de Margem')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Análise de Margem
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportReport('Performance de Modelos')}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Performance Modelos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportReport('Análise de Custos')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Análise de Custos
                </Button>
              </CardContent>
            </Card>

            {/* Gráficos de Tendência */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências (6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{trend.month}</span>
                      <div className="flex space-x-4 text-sm">
                        <span>R$ {(trend.revenue / 1000).toFixed(0)}k</span>
                        <span>{trend.orders} pedidos</span>
                        <span>{trend.margin}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <LineChart className="h-4 w-4 mr-2" />
                  Ver Gráfico Completo
                </Button>
              </CardContent>
            </Card>

            {/* Alertas e Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Alertas e Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Meta Atingida</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Vendas de junho superaram meta em 12%
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">Atenção</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Margem do modelo "Vestido Casual" em queda
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Oportunidade</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Demanda por "Blazer Executivo" cresceu 25%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Insights IA */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Insights Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 rounded">
                <h4 className="font-medium text-purple-800 mb-2">📈 Análise de Tendências</h4>
                <p className="text-sm text-purple-700">
                  Com base nos dados dos últimos 6 meses, recomendamos aumentar a produção de 
                  "Camisas Sociais" em 20% e reduzir "Vestidos Casuais" em 10%.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded">
                <h4 className="font-medium text-green-800 mb-2">💰 Otimização de Custos</h4>
                <p className="text-sm text-green-700">
                  Substituindo 30% do uso de "Linho Importado" por "Algodão Premium", 
                  você pode economizar R$ 2.450 por mês mantendo a qualidade.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded">
                <h4 className="font-medium text-blue-800 mb-2">🎯 Precificação Inteligente</h4>
                <p className="text-sm text-blue-700">
                  O modelo "Blazer Executivo" pode ter o preço aumentado em 8% sem impacto significativo 
                  na demanda, gerando R$ 1.200 adicionais mensais.
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded">
                <h4 className="font-medium text-orange-800 mb-2">⚠️ Alertas Preditivos</h4>
                <p className="text-sm text-orange-700">
                  Atenção: Estoque de "Algodão Premium" deve ser reabastecido em 15 dias 
                  para evitar parada na produção de 3 modelos principais.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}