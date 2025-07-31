import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, CheckCircle, AlertTriangle, XCircle, Info, Settings, Trash2, Eye, EyeOff, Zap, TrendingUp, TrendingDown, Package, DollarSign, Users, Factory, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  module: 'inventory' | 'orders' | 'clients' | 'production' | 'financial' | 'system';
  read: boolean;
  important: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'alert' | 'metric' | 'system' | 'business';
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  module: string;
  condition: 'above' | 'below' | 'equals' | 'changes';
  threshold: number;
  metric: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  checkInterval: number; // em minutos
  lastChecked?: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  modules: {
    inventory: boolean;
    orders: boolean;
    clients: boolean;
    production: boolean;
    financial: boolean;
    system: boolean;
  };
  alertRules: AlertRule[];
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    browserNotifications: true,
    soundEnabled: true,
    modules: {
      inventory: true,
      orders: true,
      clients: true,
      production: true,
      financial: true,
      system: false
    },
    alertRules: [
      {
        id: '1',
        name: 'Estoque Baixo',
        description: 'Alerta quando tecido está com estoque baixo',
        module: 'inventory',
        condition: 'below',
        threshold: 10,
        metric: 'stock_level',
        enabled: true,
        priority: 'high',
        message: 'O tecido "{fabric_name}" está com estoque baixo ({current_stock} unidades restantes)',
        checkInterval: 30
      },
      {
        id: '2',
        name: 'Inadimplência Alta',
        description: 'Alerta quando inadimplência supera 10%',
        module: 'financial',
        condition: 'above',
        threshold: 10,
        metric: 'overdue_percentage',
        enabled: true,
        priority: 'critical',
        message: 'Inadimplência em {percentage}% - Ação necessária',
        checkInterval: 60
      },
      {
        id: '3',
        name: 'Eficiência Baixa',
        description: 'Alerta quando eficiência de produção cai',
        module: 'production',
        condition: 'below',
        threshold: 80,
        metric: 'efficiency_rate',
        enabled: true,
        priority: 'medium',
        message: 'Eficiência de produção em {efficiency}% - Abaixo da meta',
        checkInterval: 120
      },
      {
        id: '4',
        name: 'Pedidos Pendentes',
        description: 'Alerta quando há muitos pedidos pendentes',
        module: 'orders',
        condition: 'above',
        threshold: 20,
        metric: 'pending_orders',
        enabled: true,
        priority: 'medium',
        message: '{count} pedidos pendentes - Revisão necessária',
        checkInterval: 60
      }
    ],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const { toast } = useToast();

  // Simular métricas em tempo real
  const [metrics, setMetrics] = useState({
    stockLevel: 15,
    overduePercentage: 8.5,
    efficiencyRate: 85,
    pendingOrders: 18,
    revenue: 152000,
    activeProductions: 12
  });

  // Verificar alertas inteligentes
  useEffect(() => {
    const checkAlerts = () => {
      const newAlerts: Notification[] = [];

      preferences.alertRules.forEach(rule => {
        if (!rule.enabled) return;

        let shouldAlert = false;
        let currentValue = 0;

        switch (rule.metric) {
          case 'stock_level':
            currentValue = metrics.stockLevel;
            shouldAlert = rule.condition === 'below' ? currentValue < rule.threshold : currentValue > rule.threshold;
            break;
          case 'overdue_percentage':
            currentValue = metrics.overduePercentage;
            shouldAlert = rule.condition === 'above' ? currentValue > rule.threshold : currentValue < rule.threshold;
            break;
          case 'efficiency_rate':
            currentValue = metrics.efficiencyRate;
            shouldAlert = rule.condition === 'below' ? currentValue < rule.threshold : currentValue > rule.threshold;
            break;
          case 'pending_orders':
            currentValue = metrics.pendingOrders;
            shouldAlert = rule.condition === 'above' ? currentValue > rule.threshold : currentValue < rule.threshold;
            break;
        }

        if (shouldAlert) {
          const message = rule.message
            .replace('{fabric_name}', 'Algodão Premium')
            .replace('{current_stock}', currentValue.toString())
            .replace('{percentage}', currentValue.toString())
            .replace('{efficiency}', currentValue.toString())
            .replace('{count}', currentValue.toString());

          newAlerts.push({
            id: `alert_${rule.id}_${Date.now()}`,
            title: rule.name,
            message,
            type: rule.priority === 'critical' ? 'error' : rule.priority === 'high' ? 'warning' : 'info',
            module: rule.module as any,
            read: false,
            important: rule.priority === 'critical' || rule.priority === 'high',
            createdAt: new Date().toISOString(),
            priority: rule.priority,
            category: 'alert',
            data: { ruleId: rule.id, currentValue, threshold: rule.threshold }
          });
        }
      });

      if (newAlerts.length > 0) {
        setNotifications(prev => [...newAlerts, ...prev]);

        // Mostrar toast para alertas críticos
        newAlerts.filter(alert => alert.priority === 'critical').forEach(alert => {
          toast({
            title: alert.title,
            description: alert.message,
            variant: "destructive"
          });
        });
      }
    };

    // Verificar alertas a cada 30 segundos
    const interval = setInterval(checkAlerts, 30000);
    checkAlerts(); // Verificação inicial

    return () => clearInterval(interval);
  }, [preferences.alertRules, metrics, toast]);

  // Simular mudanças nas métricas
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        stockLevel: Math.max(0, prev.stockLevel + (Math.random() > 0.5 ? -1 : 1)),
        overduePercentage: Math.max(0, Math.min(20, prev.overduePercentage + (Math.random() - 0.5) * 2)),
        efficiencyRate: Math.max(60, Math.min(95, prev.efficiencyRate + (Math.random() - 0.5) * 5)),
        pendingOrders: Math.max(0, prev.pendingOrders + (Math.random() > 0.5 ? -1 : 1))
      }));
    };

    const interval = setInterval(updateMetrics, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'inventory': return Package;
      case 'orders': return Bell;
      case 'clients': return Users;
      case 'production': return Factory;
      case 'financial': return DollarSign;
      case 'system': return Settings;
      default: return Info;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast({
      title: "Todas as notificações foram marcadas como lidas",
      description: "Você está em dia com todas as atualizações."
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
    toast({
      title: "Notificação removida",
      description: "A notificação foi excluída permanentemente."
    });
  };

  const toggleAlertRule = (ruleId: string) => {
    setPreferences(prev => ({
      ...prev,
      alertRules: prev.alertRules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    }));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'alerts') return notification.category === 'alert';
    if (activeTab === 'metrics') return notification.category === 'metric';
    return notification.module === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const alertCount = notifications.filter(n => n.category === 'alert' && !n.read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Central de Notificações</h1>
            <p className="text-gray-600">Alertas inteligentes e notificações em tempo real</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Zap className="h-3 w-3" />
            <span>{alertCount} alertas ativos</span>
          </Badge>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurações de Notificações</DialogTitle>
                <DialogDescription>
                  Configure alertas inteligentes e preferências de notificação
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Preferências Gerais</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Notificações por Email</Label>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Notificações do Navegador</Label>
                      <Switch
                        checked={preferences.browserNotifications}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, browserNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Sons de Notificação</Label>
                      <Switch
                        checked={preferences.soundEnabled}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, soundEnabled: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-3">Alertas Inteligentes</h3>
                  <div className="space-y-3">
                    {preferences.alertRules.map(rule => (
                      <Card key={rule.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={rule.enabled}
                                onCheckedChange={() => toggleAlertRule(rule.id)}
                              />
                              <div>
                                <p className="font-medium">{rule.name}</p>
                                <p className="text-sm text-gray-600">{rule.description}</p>
                              </div>
                            </div>
                          </div>
                          <Badge className={getPriorityColor(rule.priority)}>
                            {rule.priority}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas em Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Métricas em Tempo Real</span>
          </CardTitle>
          <CardDescription>Monitoramento contínuo para alertas inteligentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Estoque Baixo</p>
              <p className={`text-lg font-bold ${metrics.stockLevel < 10 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.stockLevel} unidades
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Inadimplência</p>
              <p className={`text-lg font-bold ${metrics.overduePercentage > 10 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.overduePercentage}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Eficiência</p>
              <p className={`text-lg font-bold ${metrics.efficiencyRate < 80 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.efficiencyRate}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Pedidos Pendentes</p>
              <p className={`text-lg font-bold ${metrics.pendingOrders > 20 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.pendingOrders}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center space-x-1">
            <Bell className="h-4 w-4" />
            <span>Todas</span>
            {unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Alertas</span>
            {alertCount > 0 && <Badge variant="destructive" className="ml-1">{alertCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>Não Lidas</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" />
            <span>Métricas</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>Sistema</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredNotifications.length} notificação{filteredNotifications.length !== 1 ? 's' : ''}
            </p>
            {activeTab === 'all' && unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`transition-all ${notification.read ? 'opacity-60' : 'border-l-4 border-l-blue-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        {React.createElement(getNotificationIcon(notification.type), { className: "h-4 w-4" })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          {notification.important && (
                            <Badge variant="destructive" className="text-xs">
                              Importante
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          <span className="flex items-center space-x-1">
                            {React.createElement(getModuleIcon(notification.module), { className: "h-3 w-3" })}
                            <span>{notification.module}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'all' ? 'Nenhuma notificação' :
                    activeTab === 'unread' ? 'Todas as notificações foram lidas' :
                      activeTab === 'alerts' ? 'Nenhum alerta ativo' :
                        'Nenhuma notificação encontrada'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'all' ? 'Você está em dia com todas as atualizações.' :
                    activeTab === 'unread' ? 'Parabéns! Você está atualizado.' :
                      activeTab === 'alerts' ? 'Todos os sistemas estão funcionando normalmente.' :
                        'Não há notificações neste filtro.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}