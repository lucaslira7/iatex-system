import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, Target, Award, Lightbulb, Download, RefreshCw, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Insight {
  id: number;
  type: 'success' | 'warning' | 'info' | 'error';
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  metrics?: any;
  createdAt: Date;
}

interface KPIComparison {
  metric: string;
  current: number;
  previous: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface ReportData {
  period: string;
  insights: Insight[];
  kpis: KPIComparison[];
  recommendations: string[];
}

const mockInsights: Insight[] = [
  {
    id: 1,
    type: 'success',
    category: 'Vendas',
    title: 'Crescimento Excepcional em Vestidos',
    description: 'Categoria "Vestidos" teve crescimento de 45% em relação ao mês anterior, com margem média de 62%.',
    impact: 'high',
    actionable: true,
    metrics: { growth: 45, margin: 62, pieces: 156 },
    createdAt: new Date('2025-07-02')
  },
  {
    id: 2,
    type: 'warning',
    category: 'Produção',
    title: 'Aumento de Perdas na Facção ABC',
    description: 'Facção ABC apresentou 8,5% de perda na última semana, acima da meta de 5%. Revisar processos.',
    impact: 'medium',
    actionable: true,
    metrics: { waste: 8.5, target: 5, pieces: 120 },
    createdAt: new Date('2025-07-01')
  },
  {
    id: 3,
    type: 'info',
    category: 'Estoque',
    title: 'Oportunidade de Compra - Tecido Algodão',
    description: 'Tecido algodão com 30% de desconto do fornecedor até 15/07. Estoque atual suficiente para 2 semanas.',
    impact: 'medium',
    actionable: true,
    metrics: { discount: 30, stockDays: 14 },
    createdAt: new Date('2025-07-02')
  },
  {
    id: 4,
    type: 'error',
    category: 'Financeiro',
    title: 'Meta de Margem Não Atingida',
    description: 'Margem média de junho foi 28%, abaixo da meta de 35%. Revisar precificação de camisas básicas.',
    impact: 'high',
    actionable: true,
    metrics: { margin: 28, target: 35, category: 'Camisas' },
    createdAt: new Date('2025-06-30')
  },
  {
    id: 5,
    type: 'success',
    category: 'Eficiência',
    title: 'Redução de Tempo de Produção',
    description: 'Novo processo de costura reduziu tempo médio de produção em 22%, melhorando a eficiência geral.',
    impact: 'high',
    actionable: false,
    metrics: { reduction: 22, efficiency: 94 },
    createdAt: new Date('2025-07-01')
  }
];

const mockKPIs: KPIComparison[] = [
  { metric: 'Receita Total', current: 45680, previous: 42300, target: 50000, unit: 'R$', trend: 'up' },
  { metric: 'Margem Média', current: 32.5, previous: 29.8, target: 35, unit: '%', trend: 'up' },
  { metric: 'Peças Produzidas', current: 1247, previous: 1156, target: 1300, unit: 'un', trend: 'up' },
  { metric: 'Eficiência Produção', current: 91.2, previous: 88.7, target: 95, unit: '%', trend: 'up' },
  { metric: 'Perda Média', current: 6.8, previous: 7.2, target: 5, unit: '%', trend: 'down' },
  { metric: 'Tempo Médio Entrega', current: 8.5, previous: 9.2, target: 7, unit: 'dias', trend: 'down' }
];

export default function IntelligentReports() {
  const [activeTab, setActiveTab] = useState("insights");
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [insights, setInsights] = useState<Insight[]>(mockInsights);
  const [kpis, setKpis] = useState<KPIComparison[]>(mockKPIs);
  const { toast } = useToast();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <Award className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Lightbulb className="h-5 w-5 text-blue-600" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return <Badge variant="destructive">Alto Impacto</Badge>;
      case 'medium': return <Badge variant="secondary">Médio Impacto</Badge>;
      case 'low': return <Badge variant="outline">Baixo Impacto</Badge>;
      default: return <Badge variant="outline">{impact}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateKPIProgress = (kpi: KPIComparison) => {
    const isReverse = kpi.metric.includes('Perda') || kpi.metric.includes('Tempo');
    if (isReverse) {
      return Math.max(0, Math.min(100, ((kpi.target / kpi.current) * 100)));
    }
    return Math.max(0, Math.min(100, ((kpi.current / kpi.target) * 100)));
  };

  const getKPIStatus = (kpi: KPIComparison) => {
    const isReverse = kpi.metric.includes('Perda') || kpi.metric.includes('Tempo');
    if (isReverse) {
      return kpi.current <= kpi.target ? 'success' : 'warning';
    }
    return kpi.current >= kpi.target ? 'success' : 'warning';
  };

  const filteredInsights = insights.filter(insight => {
    if (selectedCategory !== 'all' && insight.category !== selectedCategory) return false;
    return true;
  });

  const handleGenerateReport = () => {
    toast({
      title: "Relatório Gerado",
      description: "Novo relatório inteligente foi gerado com insights atualizados.",
    });
  };

  const handleExportReport = () => {
    toast({
      title: "Exportando Relatório",
      description: "Relatório sendo exportado em PDF...",
    });
  };

  const getRecommendations = () => {
    return [
      "Aumentar produção de vestidos devido ao alto crescimento e margem",
      "Revisar processos da Facção ABC para reduzir perdas de 8.5% para meta de 5%",
      "Aproveitar desconto de 30% no tecido algodão para estoque estratégico",
      "Ajustar precificação de camisas básicas para atingir meta de margem de 35%",
      "Implementar novo processo de costura em todas as facções para ganho de eficiência"
    ];
  };

  const getCriticalAlerts = () => {
    return insights.filter(i => i.type === 'error' || (i.type === 'warning' && i.impact === 'high'));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios Inteligentes</h1>
            <p className="text-gray-600">Insights automáticos e análises estratégicas do negócio</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={handleGenerateReport}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Insights
          </Button>
        </div>
      </div>

      {/* Period and Category Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Período de análise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Mês Atual</SelectItem>
                <SelectItem value="last-month">Mês Anterior</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Ano Atual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="Vendas">Vendas</SelectItem>
                <SelectItem value="Produção">Produção</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="Estoque">Estoque</SelectItem>
                <SelectItem value="Eficiência">Eficiência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {getCriticalAlerts().length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alertas Críticos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getCriticalAlerts().map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                  {getInsightIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                  {getImpactBadge(alert.impact)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                          <Badge variant="outline">{insight.category}</Badge>
                          {getImpactBadge(insight.impact)}
                        </div>
                        <p className="text-gray-700">{insight.description}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {insight.createdAt.toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  {insight.metrics && (
                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {Object.entries(insight.metrics).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <p className="font-semibold">
                              {typeof value === 'number' ? 
                                (key.includes('growth') || key.includes('margin') || key.includes('waste') ? `${value}%` : 
                                 key.includes('pieces') ? `${value} peças` : String(value)) 
                                : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {insight.actionable && (
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                      <Button size="sm" variant="outline">
                        <Target className="h-3 w-3 mr-1" />
                        Criar Ação
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kpis.map((kpi, index) => {
              const progress = calculateKPIProgress(kpi);
              const status = getKPIStatus(kpi);
              const changePercent = ((kpi.current - kpi.previous) / kpi.previous) * 100;
              
              return (
                <Card key={index} className={status === 'success' ? 'border-green-200' : 'border-yellow-200'}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-gray-900">{kpi.metric}</h3>
                      {getTrendIcon(kpi.trend)}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {kpi.current.toLocaleString('pt-BR')} {kpi.unit}
                          </p>
                          <p className="text-sm text-gray-600">
                            Meta: {kpi.target.toLocaleString('pt-BR')} {kpi.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">vs anterior</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso da Meta</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={`h-2 ${status === 'success' ? 'bg-green-100' : 'bg-yellow-100'}`}
                        />
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Anterior: {kpi.previous.toLocaleString('pt-BR')} {kpi.unit}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Vestidos</p>
                      <p className="text-sm text-gray-600">Crescimento de 45%</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Blusas</p>
                      <p className="text-sm text-gray-600">Crescimento de 12%</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Camisas</p>
                      <p className="text-sm text-gray-600">Queda de 8%</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sazonalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Verão (Atual)</h4>
                    <p className="text-sm text-blue-700">Vestidos e blusas em alta</p>
                    <p className="text-sm text-blue-700">Tecidos leves com 30% mais demanda</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800">Projeção Outono</h4>
                    <p className="text-sm text-gray-700">Aumentar produção de casacos</p>
                    <p className="text-sm text-gray-700">Tecidos mais pesados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-4">
            {getRecommendations().map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-900">{recommendation}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Agendar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Target className="h-3 w-3 mr-1" />
                        Implementar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Resumo Estratégico</h3>
              </div>
              <div className="space-y-3 text-blue-800">
                <p>• <strong>Foco prioritário:</strong> Expandir produção de vestidos (45% crescimento)</p>
                <p>• <strong>Ação urgente:</strong> Reduzir perdas na Facção ABC de 8.5% para 5%</p>
                <p>• <strong>Oportunidade:</strong> Aproveitar desconto de tecidos para estoque estratégico</p>
                <p>• <strong>Ajuste necessário:</strong> Revisar precificação para atingir margem de 35%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}