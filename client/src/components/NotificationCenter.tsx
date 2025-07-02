import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRing,
  Check,
  Trash2,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  module: string;
  read: boolean;
  important: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: any;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  modules: {
    [key: string]: boolean;
  };
}

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Estoque Baixo',
      message: 'O tecido "Algodão Premium" está com estoque baixo (5 unidades restantes)',
      type: 'warning',
      module: 'inventory',
      read: false,
      important: true,
      createdAt: '2025-01-02T10:30:00Z',
      actionUrl: '/inventory',
      data: { fabricId: 1, currentStock: 5 }
    },
    {
      id: '2',
      title: 'Pedido Finalizado',
      message: 'Pedido #1234 foi concluído e está pronto para entrega',
      type: 'success',
      module: 'orders',
      read: false,
      important: false,
      createdAt: '2025-01-02T09:15:00Z',
      actionUrl: '/orders',
      data: { orderId: 1234 }
    },
    {
      id: '3',
      title: 'Novo Cliente Cadastrado',
      message: 'Cliente "Moda & Estilo Ltda" foi adicionado ao sistema',
      type: 'info',
      module: 'clients',
      read: true,
      important: false,
      createdAt: '2025-01-02T08:45:00Z',
      actionUrl: '/clients',
      data: { clientId: 15 }
    },
    {
      id: '4',
      title: 'Meta de Produção Atingida',
      message: 'A facção "Confecções Rápidas" atingiu 105% da meta semanal',
      type: 'success',
      module: 'production',
      read: true,
      important: false,
      createdAt: '2025-01-01T16:20:00Z',
      actionUrl: '/production',
      data: { factoryId: 3, achievement: 105 }
    },
    {
      id: '5',
      title: 'Backup Realizado',
      message: 'Backup automático dos dados realizado com sucesso',
      type: 'info',
      module: 'system',
      read: true,
      important: false,
      createdAt: '2025-01-01T12:00:00Z',
      data: { backupSize: '45.2MB' }
    }
  ]);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    browserNotifications: true,
    modules: {
      inventory: true,
      orders: true,
      clients: true,
      production: true,
      financial: true,
      system: false
    }
  });

  const { toast } = useToast();

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

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'inventory': return Package;
      case 'orders': return ShoppingCart;
      case 'clients': return Users;
      case 'production': return Settings;
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

  const clearAllRead = () => {
    setNotifications(prev => 
      prev.filter(n => !n.read)
    );
    toast({
      title: "Notificações lidas foram removidas",
      description: "Apenas notificações não lidas permaneceram."
    });
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'important':
        return notifications.filter(n => n.important);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const importantCount = notifications.filter(n => n.important && !n.read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-blue-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Central de Notificações</h1>
            <p className="text-gray-600">Acompanhe todas as atualizações e alertas do sistema</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Marcar Todas como Lidas
          </Button>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações de Notificações</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Preferências Gerais</h3>
                  <div className="flex items-center justify-between">
                    <span>Notificações por E-mail</span>
                    <input 
                      type="checkbox" 
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev, 
                        emailNotifications: e.target.checked
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notificações do Navegador</span>
                    <input 
                      type="checkbox" 
                      checked={preferences.browserNotifications}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev, 
                        browserNotifications: e.target.checked
                      }))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="font-medium">Notificações por Módulo</h3>
                  {Object.entries(preferences.modules).map(([module, enabled]) => (
                    <div key={module} className="flex items-center justify-between">
                      <span className="capitalize">{module}</span>
                      <input 
                        type="checkbox" 
                        checked={enabled}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          modules: {
                            ...prev.modules,
                            [module]: e.target.checked
                          }
                        }))}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button>Salvar Configurações</Button>
                  <Button variant="outline" onClick={() => setShowSettings(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BellRing className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-gray-600">Total de Notificações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-gray-600">Não Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{notifications.filter(n => n.read).length}</p>
                <p className="text-sm text-gray-600">Lidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{importantCount}</p>
                <p className="text-sm text-gray-600">Importantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Notificações</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllRead}
              disabled={notifications.filter(n => n.read).length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Lidas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Todas ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Não Lidas ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="important">
                Importantes ({notifications.filter(n => n.important).length})
              </TabsTrigger>
              <TabsTrigger value="read">
                Lidas ({notifications.filter(n => n.read).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {getFilteredNotifications().map((notification) => {
                    const NotificationIcon = getNotificationIcon(notification.type);
                    const ModuleIcon = getModuleIcon(notification.module);
                    
                    return (
                      <div 
                        key={notification.id}
                        className={`p-4 border rounded-lg transition-all cursor-pointer ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-white border-blue-200 shadow-sm'
                        }`}
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                            <NotificationIcon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h3>
                              {notification.important && (
                                <Badge variant="destructive" className="text-xs">
                                  Importante
                                </Badge>
                              )}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <ModuleIcon className="h-3 w-3" />
                                <span className="capitalize">{notification.module}</span>
                                <span>•</span>
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(notification.createdAt).toLocaleDateString('pt-BR')} às{' '}
                                  {new Date(notification.createdAt).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              
                              <div className="flex gap-1">
                                {notification.actionUrl && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Navigate to actionUrl
                                    }}
                                  >
                                    Ver Detalhes
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {getFilteredNotifications().length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma notificação encontrada
                      </h3>
                      <p className="text-gray-600">
                        {activeTab === 'unread' && 'Você está em dia! Não há notificações não lidas.'}
                        {activeTab === 'important' && 'Nenhuma notificação importante no momento.'}
                        {activeTab === 'read' && 'Nenhuma notificação foi lida ainda.'}
                        {activeTab === 'all' && 'Não há notificações para exibir.'}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}