export interface DashboardMetrics {
    totalFabrics: number;
    lowStockFabrics: number;
    activeOrders: number;
    totalStockValue: number;
    productionEfficiency: number;
    monthlyRevenue: number;
    pendingDeliveries: number;
    completedOrders: number;
    averageOrderValue: number;
    topSellingFabrics: Array<{
        id: number;
        name: string;
        salesCount: number;
    }>;
}

export interface DashboardCard {
    id: string;
    title: string;
    value: string;
    rawValue?: number;
    icon: any; // TODO: Melhorar tipagem quando React estiver disponível
    color: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'yellow';
    visible: boolean;
    order: number;
    description?: string;
    progress?: number;
    change?: string;
    trend?: 'up' | 'down' | 'stable';
}

export interface DashboardConfig {
    cards: DashboardCard[];
    layout: 'grid' | 'list';
    refreshInterval: number;
} 