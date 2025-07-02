import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Scissors, ShoppingCart, TrendingUp, Factory, Plus, Calculator, 
  Shirt, ChevronRight, Settings, GripVertical, Package, Users, 
  DollarSign, Clock, Target, Award, BarChart3, PieChart, Activity,
  ArrowUp, ArrowDown, MoveUp, MoveDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ActiveSection } from "@/pages/Home";

interface DashboardCard {
  id: string;
  title: string;
  value: string;
  icon: any;
  color: string;
  visible: boolean;
  order: number;
  description?: string;
  progress?: number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface CustomizableDashboardProps {
  onSectionChange: (section: ActiveSection) => void;
}

export default function CustomizableDashboardFixed({ onSectionChange }: CustomizableDashboardProps) {
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const { toast } = useToast();

  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    refetchInterval: 30000
  });

  // Initialize default cards
  useEffect(() => {
    const defaultCards: DashboardCard[] = [
      {
        id: 'total-fabrics',
        title: 'Total de Tecidos',
        value: metrics?.totalFabrics?.toString() || '0',
        icon: Scissors,
        color: 'blue',
        visible: true,
        order: 1,
        description: 'Tecidos cadastrados no sistema',
        progress: 85,
        change: '+12%',
        trend: 'up'
      },
      {
        id: 'low-stock',
        title: 'Estoque Baixo',
        value: metrics?.lowStockFabrics?.toString() || '0',
        icon: Package,
        color: 'red',
        visible: true,
        order: 2,
        description: 'Tecidos com estoque baixo',
        progress: 25,
        change: '-5%',
        trend: 'down'
      },
      {
        id: 'active-orders',
        title: 'Pedidos Ativos',
        value: metrics?.activeOrders?.toString() || '0',
        icon: ShoppingCart,
        color: 'green',
        visible: true,
        order: 3,
        description: 'Pedidos em andamento',
        progress: 65,
        change: '+8%',
        trend: 'up'
      },
      {
        id: 'stock-value',
        title: 'Valor do Estoque',
        value: `R$ ${(metrics?.totalStockValue || 0).toLocaleString('pt-BR')}`,
        icon: DollarSign,
        color: 'purple',
        visible: true,
        order: 4,
        description: 'Valor total dos tecidos em estoque',
        progress: 90,
        change: '+15%',
        trend: 'up'
      },
      {
        id: 'production-efficiency',
        title: 'Eficiência Produção',
        value: '87%',
        icon: Factory,
        color: 'orange',
        visible: true,
        order: 5,
        description: 'Produtividade média das facções',
        progress: 87,
        change: '+3%',
        trend: 'up'
      },
      {
        id: 'monthly-revenue',
        title: 'Receita Mensal',
        value: 'R$ 45.280',
        icon: TrendingUp,
        color: 'green',
        visible: true,
        order: 6,
        description: 'Receita do mês atual',
        progress: 78,
        change: '+22%',
        trend: 'up'
      },
      {
        id: 'pending-deliveries',
        title: 'Entregas Pendentes',
        value: '7',
        icon: Clock,
        color: 'yellow',
        visible: true,
        order: 7,
        description: 'Pedidos aguardando entrega',
        progress: 40,
        change: '-2',
        trend: 'down'
      },
      {
        id: 'quality-score',
        title: 'Score de Qualidade',
        value: '9.2',
        icon: Award,
        color: 'indigo',
        visible: true,
        order: 8,
        description: 'Avaliação média da qualidade',
        progress: 92,
        change: '+0.3',
        trend: 'up'
      },
      {
        id: 'active-employees',
        title: 'Funcionários Ativos',
        value: '23',
        icon: Users,
        color: 'cyan',
        visible: false,
        order: 9,
        description: 'Funcionários trabalhando hoje',
        progress: 95,
        change: '+2',
        trend: 'up'
      },
      {
        id: 'models-created',
        title: 'Modelos Criados',
        value: '156',
        icon: Shirt,
        color: 'pink',
        visible: false,
        order: 10,
        description: 'Total de modelos catalogados',
        progress: 75,
        change: '+18',
        trend: 'up'
      },
      {
        id: 'profit-margin',
        title: 'Margem de Lucro',
        value: '34%',
        icon: BarChart3,
        color: 'emerald',
        visible: false,
        order: 11,
        description: 'Margem média de lucro',
        progress: 34,
        change: '+2%',
        trend: 'up'
      },
      {
        id: 'customer-satisfaction',
        title: 'Satisfação Cliente',
        value: '4.8/5',
        icon: Activity,
        color: 'violet',
        visible: false,
        order: 12,
        description: 'Avaliação média dos clientes',
        progress: 96,
        change: '+0.2',
        trend: 'up'
      }
    ];

    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('iatex_dashboard_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setCards(parsedConfig);
      } catch (error) {
        setCards(defaultCards);
      }
    } else {
      setCards(defaultCards);
    }
  }, [metrics]);

  // Save configuration to localStorage
  const saveConfiguration = (newCards: DashboardCard[]) => {
    localStorage.setItem('iatex_dashboard_config', JSON.stringify(newCards));
    setCards(newCards);
    toast({
      title: "Configuração Salva",
      description: "Layout do dashboard personalizado com sucesso.",
    });
  };

  // Toggle card visibility
  const toggleCardVisibility = (cardId: string) => {
    const newCards = cards.map(card => 
      card.id === cardId ? { ...card, visible: !card.visible } : card
    );
    saveConfiguration(newCards);
  };

  // Move card up/down
  const moveCard = (cardId: string, direction: 'up' | 'down') => {
    const cardIndex = cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;

    const newCards = [...cards];
    const targetIndex = direction === 'up' ? cardIndex - 1 : cardIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    // Swap cards
    [newCards[cardIndex], newCards[targetIndex]] = [newCards[targetIndex], newCards[cardIndex]];
    
    // Update order
    newCards.forEach((card, index) => {
      card.order = index + 1;
    });

    saveConfiguration(newCards);
  };

  // Get visible cards sorted by order
  const visibleCards = cards
    .filter(card => card.visible)
    .sort((a, b) => a.order - b.order);

  // Color mapping
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500 text-white',
      red: 'bg-red-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      orange: 'bg-orange-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      indigo: 'bg-indigo-500 text-white',
      cyan: 'bg-cyan-500 text-white',
      pink: 'bg-pink-500 text-white',
      emerald: 'bg-emerald-500 text-white',
      violet: 'bg-violet-500 text-white'
    };
    return colorMap[color] || 'bg-gray-500 text-white';
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard IA.TEX</h1>
            <p className="text-gray-600 mt-2">Visão geral do sistema de gestão têxtil</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard IA.TEX</h1>
          <p className="text-gray-600 mt-2">Visão geral do sistema de gestão têxtil</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {visibleCards.length} de {cards.length} cards visíveis
          </Badge>
          
          <Dialog open={showCustomizationModal} onOpenChange={setShowCustomizationModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Personalizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Personalizar Dashboard</DialogTitle>
                <DialogDescription>
                  Configure quais cards exibir e sua ordem no dashboard
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {cards.map((card) => {
                  const IconComponent = card.icon;
                  return (
                    <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(card.color)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{card.title}</p>
                          <p className="text-xs text-gray-500">{card.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveCard(card.id, 'up')}
                            disabled={card.order === 1}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveCard(card.id, 'down')}
                            disabled={card.order === cards.length}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Switch
                          checked={card.visible}
                          onCheckedChange={() => toggleCardVisibility(card.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCustomizationModal(false)}>
                  Fechar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customizable KPI Cards - SEM DRAG & DROP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {visibleCards.map((card) => {
          const IconComponent = card.icon;
          
          return (
            <Card key={card.id} className="relative kpi-card transition-all cursor-pointer hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                    {card.change && (
                      <div className="flex items-center gap-1 mt-1">
                        {getTrendIcon(card.trend)}
                        <span className={`text-xs ${card.trend === 'up' ? 'text-green-600' : card.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                          {card.change}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`kpi-icon ${getColorClasses(card.color)}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
                
                {card.progress !== undefined && (
                  <div className="mt-4">
                    <Progress value={card.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSectionChange('fabrics')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Gestão de Tecidos</h3>
                <p className="text-gray-600 text-sm">Gerencie estoque, cadastre novos tecidos e controle fornecedores</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSectionChange('models')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Modelos & Precificação</h3>
                <p className="text-gray-600 text-sm">Crie templates, calcule preços e gerencie catálogo de modelos</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSectionChange('operational')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Painel Operacional</h3>
                <p className="text-gray-600 text-sm">Gerencie tarefas, produção e acompanhe metas diárias</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.recentActivities?.slice(0, 5).map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}