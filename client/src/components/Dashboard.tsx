import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, ShoppingCart, TrendingUp, Factory, Plus, Calculator, Shirt, ChevronRight } from "lucide-react";
import type { ActiveSection } from "@/pages/Home";

interface DashboardProps {
  onSectionChange: (section: ActiveSection) => void;
}

export default function Dashboard({ onSectionChange }: DashboardProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Visão geral do sistema</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="kpi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tecidos</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.totalFabrics || 0}</p>
              </div>
              <div className="kpi-icon bg-blue-100">
                <Scissors className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600 font-medium">+12%</span>
              <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Ativos</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.activeOrders || 0}</p>
              </div>
              <div className="kpi-icon bg-amber-100">
                <ShoppingCart className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-amber-600 font-medium">3 urgentes</span>
              <span className="text-sm text-gray-500 ml-2">para hoje</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque</p>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {((metrics?.totalStockValue || 0) / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="kpi-icon bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${metrics?.lowStockFabrics > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics?.lowStockFabrics || 0} baixo estoque
              </span>
              <span className="text-sm text-gray-500 ml-2">tecidos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produção</p>
                <p className="text-3xl font-bold text-gray-900">89%</p>
              </div>
              <div className="kpi-icon bg-purple-100">
                <Factory className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "89%" }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-between p-3 bg-blue-50 hover:bg-blue-100 text-left h-auto"
                onClick={() => onSectionChange('fabrics')}
              >
                <div className="flex items-center">
                  <Scissors className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Cadastrar Tecido</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-between p-3 bg-green-50 hover:bg-green-100 text-left h-auto"
                onClick={() => onSectionChange('pricing')}
              >
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Nova Precificação</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-between p-3 bg-purple-50 hover:bg-purple-100 text-left h-auto"
                onClick={() => onSectionChange('orders')}
              >
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Criar Pedido</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              {!metrics?.recentActivities?.length ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Nenhuma atividade recente encontrada.</p>
                  <p className="text-xs mt-1">As atividades do sistema aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.recentActivities.map((activity: any, index: number) => (
                    <div key={activity.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Scissors className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.module} • {new Date(activity.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
