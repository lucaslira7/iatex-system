// Sistema de notificações inteligentes para IA.TEX
import { useToast } from "@/hooks/use-toast";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface SmartNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'system' | 'business' | 'user' | 'production';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
  autoHide?: boolean;
  persistUntilRead?: boolean;
}

class NotificationManager {
  private static instance: NotificationManager;
  private notifications: SmartNotification[] = [];
  private toast: ReturnType<typeof useToast>['toast'] | null = null;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  setToast(toast: ReturnType<typeof useToast>['toast']): void {
    this.toast = toast;
  }

  // Criar notificação inteligente
  create(notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read'>): void {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newNotification: SmartNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);

    // Mostrar toast apenas para prioridades médias ou altas
    if (notification.priority !== 'low' && this.toast) {
      this.showToast(newNotification);
    }

    // Salvar no localStorage
    this.saveToStorage();

    // Auto-limpar notificações antigas (mais de 7 dias)
    this.cleanupOldNotifications();
  }

  // Notificações pré-definidas para contextos específicos
  success(title: string, message: string, category: SmartNotification['category'] = 'system'): void {
    this.create({
      type: 'success',
      title,
      message,
      category,
      priority: 'medium',
      autoHide: true
    });
  }

  error(title: string, message: string, category: SmartNotification['category'] = 'system'): void {
    this.create({
      type: 'error',
      title,
      message,
      category,
      priority: 'high',
      persistUntilRead: true
    });
  }

  warning(title: string, message: string, category: SmartNotification['category'] = 'system'): void {
    this.create({
      type: 'warning',
      title,
      message,
      category,
      priority: 'medium',
      persistUntilRead: true
    });
  }

  info(title: string, message: string, category: SmartNotification['category'] = 'system'): void {
    this.create({
      type: 'info',
      title,
      message,
      category,
      priority: 'low',
      autoHide: true
    });
  }

  // Notificações específicas do domínio
  lowStock(fabricName: string, currentStock: number): void {
    this.warning(
      'Estoque Baixo',
      `Tecido ${fabricName} com apenas ${currentStock}m em estoque`,
      'business'
    );
  }

  orderCompleted(orderReference: string): void {
    this.success(
      'Pedido Finalizado',
      `Pedido ${orderReference} foi concluído com sucesso`,
      'production'
    );
  }

  templateSaved(templateName: string): void {
    this.success(
      'Template Salvo',
      `Template "${templateName}" foi salvo com sucesso`,
      'user'
    );
  }

  productionDelay(batchId: string, delay: string): void {
    this.warning(
      'Atraso na Produção',
      `Lote ${batchId} atrasado em ${delay}`,
      'production'
    );
  }

  paymentDue(amount: string, dueDate: string): void {
    this.create({
      type: 'warning',
      title: 'Pagamento Vencendo',
      message: `Pagamento de ${amount} vence em ${dueDate}`,
      category: 'business',
      priority: 'high',
      persistUntilRead: true,
      actionUrl: '/financeiro',
      actionLabel: 'Ver Detalhes'
    });
  }

  // Marcar como lida
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
    }
  }

  // Marcar todas como lidas
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
  }

  // Buscar notificações
  getAll(): SmartNotification[] {
    return this.notifications;
  }

  getUnread(): SmartNotification[] {
    return this.notifications.filter(n => !n.read);
  }

  getByCategory(category: SmartNotification['category']): SmartNotification[] {
    return this.notifications.filter(n => n.category === category);
  }

  // Exibir toast
  private showToast(notification: SmartNotification): void {
    if (!this.toast) return;

    const variant = notification.type === 'error' ? 'destructive' : 'default';
    
    this.toast({
      title: notification.title,
      description: notification.message,
      variant
    });
  }

  // Salvar no localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem('iatex_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.warn('Não foi possível salvar notificações no localStorage:', error);
    }
  }

  // Carregar do localStorage
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('iatex_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Não foi possível carregar notificações do localStorage:', error);
    }
  }

  // Limpar notificações antigas
  private cleanupOldNotifications(): void {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.notifications = this.notifications.filter(
      n => n.timestamp > sevenDaysAgo || n.persistUntilRead && !n.read
    );
    
    this.saveToStorage();
  }

  // Estatísticas
  getStats(): { total: number; unread: number; byCategory: Record<string, number> } {
    const byCategory = this.notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.notifications.length,
      unread: this.getUnread().length,
      byCategory
    };
  }
}

// Instância global
export const notificationManager = NotificationManager.getInstance();

// Hook para usar notificações em componentes React
export const useSmartNotifications = () => {
  const { toast } = useToast();
  
  // Configurar toast no manager na primeira execução
  if (!notificationManager['toast']) {
    notificationManager.setToast(toast);
  }

  return {
    notify: notificationManager,
    notifications: notificationManager.getAll(),
    unreadCount: notificationManager.getUnread().length,
    markAsRead: (id: string) => notificationManager.markAsRead(id),
    markAllAsRead: () => notificationManager.markAllAsRead()
  };
};