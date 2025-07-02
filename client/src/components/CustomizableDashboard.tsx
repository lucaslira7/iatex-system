import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Scissors, ShoppingCart, TrendingUp, Factory, Plus, Calculator, 
  Shirt, ChevronRight, Settings, GripVertical, Package, Users, 
  DollarSign, Clock, Target, Award, BarChart3, PieChart, Activity
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
    subtitle: 'urgentes para hoje',
    icon: ShoppingCart,
    color: 'amber',
    visible: true,
    order: 1,
    type: 'metric'
  },
  {
    id: 'stock-value',
    title: 'Estoque',
    value: 'R$ 1063.2K',
    subtitle: 'baixo estoque tecidos',
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
  { id: 'customer-satisfaction', title: 'Satisfação Cliente', icon: Activity, color: 'violet' }
];

export default function CustomizableDashboard({ onSectionChange }: DashboardProps) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const [cards, setCards] = useState<DashboardCard[]>(defaultCards);
  const { toast } = useToast();

  // Load saved layout on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch {
        // If parsing fails, use default
      }
    }
  }, []);

  // Update card values with real metrics
  const updateCardValues = (cards: DashboardCard[]) => {
    return cards.map(card => {
      switch (card.id) {
        case 'total-fabrics':
          return { ...card, value: (metrics as any)?.totalFabrics || 3 };
        case 'active-orders':
          return { ...card, value: (metrics as any)?.activeOrders || 0 };
        case 'stock-value':
          return { 
            ...card, 
            value: `R$ ${(((metrics as any)?.totalStockValue || 1063200) / 1000).toFixed(1)}K` 
          };
        default:
          return card;
      }
    });
  };

  const visibleCards = updateCardValues(cards)
    .filter(card => card.visible)
    .sort((a, b) => a.order - b.order);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      amber: 'bg-amber-100 text-amber-600 border-amber-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      pink: 'bg-pink-100 text-pink-600 border-pink-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      cyan: 'bg-cyan-100 text-cyan-600 border-cyan-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
      violet: 'bg-violet-100 text-violet-600 border-violet-200'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600 border-gray-200';
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
    localStorage.removeItem('dashboard-layout');
    toast({
      title: "Dashboard Restaurado",
      description: "Layout padrão foi restaurado.",
    });
  };

  const saveLayout = () => {
    localStorage.setItem('dashboard-layout', JSON.stringify(cards));
    toast({
      title: "Layout Salvo",
      description: "Sua configuração foi salva com sucesso.",
    });
  };

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
            <p className="text-sm text-gray-500 mt-1">Visão geral personalizada do sistema</p>
          </div>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Personalizar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Personalizar Dashboard</DialogTitle>
                  <DialogDescription>
                    Escolha quais cards exibir e reorganize-os conforme sua preferência
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Card Visibility Settings */}
                  <div>
                    <h3 className="font-semibold mb-4">Cards Disponíveis</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {availableCards.map((availableCard) => {
                        const currentCard = cards.find(c => c.id === availableCard.id);
                        const IconComponent = availableCard.icon;
                        
                        return (
                          <div key={availableCard.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded ${getColorClasses(availableCard.color)}`}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-medium">{availableCard.title}</span>
                            </div>
                            <Switch 
                              checked={currentCard?.visible || false}
                              onCheckedChange={() => toggleCardVisibility(availableCard.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Layout Actions */}
                  <div className="flex space-x-2">
                    <Button onClick={saveLayout}>
                      Salvar Layout
                    </Button>
                    <Button variant="outline" onClick={resetToDefault}>
                      Restaurar Padrão
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </div>
        </div>
      </div>

      {/* Customizable KPI Cards */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="cards" direction="horizontal">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {visibleCards.map((card, index) => {
                const IconComponent = card.icon;
                
                return (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided, snapshot) => (
                      <Card 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative kpi-card ${snapshot.isDragging ? 'shadow-lg scale-105' : ''} transition-all cursor-pointer`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{card.title}</p>
                              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                            </div>
                            <div className={`kpi-icon ${getColorClasses(card.color)}`}>
                              <IconComponent className="h-6 w-6" />
                            </div>
                          </div>
                          
                          {card.type === 'progress' && card.progressValue && (
                            <div className="mt-4">
                              <Progress value={card.progressValue} className="h-2" />
                              <span className="text-sm text-gray-500 mt-1">
                                Meta: {card.target}%
                              </span>
                            </div>
                          )}
                          
                          {card.changePercent && (
                            <div className="mt-4 flex items-center">
                              <span className={`text-sm font-medium ${card.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {card.changePercent > 0 ? '+' : ''}{card.changePercent}%
                              </span>
                              <span className="text-sm text-gray-500 ml-2">{card.subtitle}</span>
                            </div>
                          )}
                          
                          {card.subtitle && !card.changePercent && (
                            <div className="mt-4">
                              <span className="text-sm text-gray-500">{card.subtitle}</span>
                            </div>
                          )}
                          
                          {/* Drag Handle */}
                          <div 
                            {...provided.dragHandleProps}
                            className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity cursor-grab"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSectionChange('fabrics')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Scissors className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Gerenciar Tecidos</h3>
                <p className="text-sm text-gray-500">Controle de estoque e fornecedores</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSectionChange('models')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Modelos & Precificação</h3>
                <p className="text-sm text-gray-500">Precifique novos modelos</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSectionChange('reports')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Relatórios Inteligentes</h3>
                <p className="text-sm text-gray-500">Insights do negócio</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Factory className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Novo modelo criado: Vestido Midi V-002</p>
                <p className="text-xs text-gray-500">Há 5 minutos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Scissors className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Estoque atualizado: Tecido Algodão Azul</p>
                <p className="text-xs text-gray-500">Há 15 minutos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-full">
                <ShoppingCart className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Pedido #001 finalizado</p>
                <p className="text-xs text-gray-500">Há 1 hora</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}