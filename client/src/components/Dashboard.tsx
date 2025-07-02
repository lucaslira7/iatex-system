import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Scissors, ShoppingCart, TrendingUp, Factory, Plus, Calculator, 
  Shirt, ChevronRight, Settings, Eye, EyeOff, GripVertical,
  Package, Users, DollarSign, Clock, Target, Award, Zap,
  BarChart3, PieChart, Activity, Gauge
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ActiveSection } from "@/pages/Home";

interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
  visible: boolean;
  order: number;
  type: 'metric' | 'progress' | 'trend' | 'status';
  changePercent?: number;
  progressValue?: number;
  target?: number;
}

interface DashboardProps {
  onSectionChange: (section: ActiveSection) => void;
}

const defaultCards: DashboardCard[] = [
  {
    id: 'total-fabrics',
    title: 'Total de Tecidos',
    value: 0,
    subtitle: 'vs mês anterior',
    icon: Scissors,
    color: 'blue',
    visible: true,
    order: 0,
    type: 'metric',
    changePercent: 12
  },
  {
    id: 'active-orders',
    title: 'Pedidos Ativos',
    value: 0,
    subtitle: 'para hoje',
    icon: ShoppingCart,
    color: 'amber',
    visible: true,
    order: 1,
    type: 'metric'
  },
  {
    id: 'stock-value',
    title: 'Estoque',
    value: 'R$ 0K',
    subtitle: 'tecidos',
    icon: TrendingUp,
    color: 'green',
    visible: true,
    order: 2,
    type: 'metric'
  },
  {
    id: 'production-efficiency',
    title: 'Produção',
    value: '89%',
    subtitle: 'eficiência',
    icon: Factory,
    color: 'purple',
    visible: true,
    order: 3,
    type: 'progress',
    progressValue: 89,
    target: 95
  },
  {
    id: 'revenue-month',
    title: 'Receita Mensal',
    value: 'R$ 45.8K',
    subtitle: 'meta: R$ 50K',
    icon: DollarSign,
    color: 'indigo',
    visible: false,
    order: 4,
    type: 'metric',
    changePercent: 8.5
  },
  {
    id: 'employees',
    title: 'Funcionários',
    value: 12,
    subtitle: 'ativos',
    icon: Users,
    color: 'pink',
    visible: false,
    order: 5,
    type: 'metric'
  },
  {
    id: 'models',
    title: 'Modelos',
    value: 25,
    subtitle: 'ativos',
    icon: Shirt,
    color: 'orange',
    visible: false,
    order: 6,
    type: 'metric'
  },
  {
    id: 'avg-time',
    title: 'Tempo Médio',
    value: '8.5 dias',
    subtitle: 'produção',
    icon: Clock,
    color: 'cyan',
    visible: false,
    order: 7,
    type: 'metric'
  }
];

const availableCards = [
  { id: 'total-fabrics', title: 'Total de Tecidos', icon: Scissors, color: 'blue' },
  { id: 'active-orders', title: 'Pedidos Ativos', icon: ShoppingCart, color: 'amber' },
  { id: 'stock-value', title: 'Valor do Estoque', icon: TrendingUp, color: 'green' },
  { id: 'production-efficiency', title: 'Eficiência Produção', icon: Factory, color: 'purple' },
  { id: 'revenue-month', title: 'Receita Mensal', icon: DollarSign, color: 'indigo' },
  { id: 'employees', title: 'Funcionários', icon: Users, color: 'pink' },
  { id: 'models', title: 'Modelos Ativos', icon: Shirt, color: 'orange' },
  { id: 'avg-time', title: 'Tempo Médio', icon: Clock, color: 'cyan' },
  { id: 'quality-score', title: 'Score Qualidade', icon: Award, color: 'yellow' },
  { id: 'cost-efficiency', title: 'Eficiência Custos', icon: Target, color: 'red' },
  { id: 'profit-margin', title: 'Margem Lucro', icon: BarChart3, color: 'emerald' },
  { id: 'customer-satisfaction', title: 'Satisfação Cliente', icon: Zap, color: 'violet' }
];

export default function Dashboard({ onSectionChange }: DashboardProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const [cards, setCards] = useState<DashboardCard[]>(defaultCards);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { toast } = useToast();

  // Update card values with real metrics
  const updateCardValues = (cards: DashboardCard[]) => {
    return cards.map(card => {
      switch (card.id) {
        case 'total-fabrics':
          return { ...card, value: metrics?.totalFabrics || 0 };
        case 'active-orders':
          return { ...card, value: metrics?.activeOrders || 0 };
        case 'stock-value':
          return { ...card, value: `R$ ${((metrics?.totalStockValue || 0) / 1000).toFixed(1)}K` };
        default:
          return card;
      }
    });
  };

  const visibleCards = updateCardValues(cards)
    .filter(card => card.visible)
    .sort((a, b) => a.order - b.order);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'amber': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'green': return 'bg-green-100 text-green-600 border-green-200';
      case 'purple': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'indigo': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      case 'pink': return 'bg-pink-100 text-pink-600 border-pink-200';
      case 'orange': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'cyan': return 'bg-cyan-100 text-cyan-600 border-cyan-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-600 border-red-200';
      case 'emerald': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'violet': return 'bg-violet-100 text-violet-600 border-violet-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(visibleCards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedCards = cards.map(card => {
      const newIndex = items.findIndex(item => item.id === card.id);
      if (newIndex !== -1) {
        return { ...card, order: newIndex };
      }
      return card;
    });

    setCards(updatedCards);
    toast({
      title: "Dashboard Reorganizado",
      description: "A ordem dos cards foi atualizada.",
    });
  };

  const toggleCardVisibility = (cardId: string) => {
    setCards(cards.map(card => 
      card.id === cardId 
        ? { ...card, visible: !card.visible }
        : card
    ));
  };

  const resetToDefault = () => {
    setCards(defaultCards);
    toast({
      title: "Dashboard Restaurado",
      description: "Layout padrão foi restaurado.",
    });
  };

  const saveLayout = () => {
    // Here you could save to localStorage or API
    localStorage.setItem('dashboard-layout', JSON.stringify(cards));
    toast({
      title: "Layout Salvo",
      description: "Sua configuração foi salva com sucesso.",
    });
  };

  // Load saved layout on mount
  useState(() => {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch {
        // If parsing fails, use default
      }
    }
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
