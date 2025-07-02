import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSmartCache } from "@/hooks/useCache";
import { ContextualLoading } from "@/components/ui/loading-states";
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  FileText, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Download,
  Calendar
} from "lucide-react";
import { useState, useMemo } from 'react';

interface AnalyticsData {
  totalTemplates: number;
  avgMargin: number;
  totalRevenue: number;
  costSavings: number;
  topPerformingTypes: Array<{
    type: string;
    count: number;
    avgPrice: number;
    margin: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    template: string;
    date: string;
    value: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const { data: analytics, isLoading, error } = useSmartCache<AnalyticsData>(
    ['/api/analytics', selectedPeriod],
    'dashboard'
  );

  // Dados simulados para demonstração
  const mockAnalytics: AnalyticsData = useMemo(() => ({
    totalTemplates: 145,
    avgMargin: 32.5,
    totalRevenue: 125000,
    costSavings: 15000,
    topPerformingTypes: [
      { type: 'Camisetas', count: 45, avgPrice: 25.50, margin: 35.2 },
      { type: 'Calças', count: 32, avgPrice: 65.00, margin: 28.5 },
      { type: 'Vestidos', count: 28, avgPrice: 89.90, margin: 42.1 },
      { type: 'Conjuntos', count: 25, avgPrice: 125.00, margin: 38.8 },
    ],
    recentActivity: [
      { id: '1', action: 'Criou template', template: 'Camiseta Basic', date: '2h atrás', value: 24.90 },
      { id: '2', action: 'Editou template', template: 'Calça Jeans', date: '4h atrás', value: 85.50 },
      { id: '3', action: 'Exportou ficha', template: 'Vestido Floral', date: '6h atrás', value: 95.00 },
    ]
  }), []);

  const displayData = analytics || mockAnalytics;

  if (isLoading) {
    return <ContextualLoading type="dashboard" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar analytics</h3>
          <p className="text-gray-500">Tente novamente em alguns instantes</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics e Relatórios</h1>
          <p className="text-sm text-gray-500 mt-1">Análise completa de performance e custos</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Criados</p>
                <p className="text-2xl font-bold">{displayData.totalTemplates}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+12% vs período anterior</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Margem Média</p>
                <p className="text-2xl font-bold">{formatPercent(displayData.avgMargin)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+2.3% vs período anterior</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Projetada</p>
                <p className="text-2xl font-bold">{formatCurrency(displayData.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+18% vs período anterior</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Economia de Custos</p>
                <p className="text-2xl font-bold">{formatCurrency(displayData.costSavings)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">Otimização automatizada</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas de análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top performing types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Peça - Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayData.topPerformingTypes.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-xs text-gray-500">{item.count} templates</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.avgPrice)}</p>
                    <Badge variant={item.margin > 30 ? "default" : "secondary"}>
                      {formatPercent(item.margin)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividade recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border-l-4 border-blue-400 bg-blue-50">
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-blue-600 font-medium">{activity.template}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{formatCurrency(activity.value)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}