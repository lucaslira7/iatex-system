export interface KanbanTask {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'doing' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    type: 'task' | 'production' | 'maintenance' | 'quality';
    assignedTo: string;
    dueDate: string;
    tags: string[];
    estimatedHours: number;
    actualHours?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductionOrder {
    id: string;
    orderNumber: string;
    modelId: number;
    quantity: number;
    status: 'pending' | 'in_production' | 'completed' | 'cancelled';
    startDate: string;
    dueDate: string;
    assignedFactory: string;
    progress: number;
    createdAt: string;
}

export interface SupplyRequest {
    id: string;
    itemName: string;
    quantity: number;
    unit: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'received';
    requestedBy: string;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
}

export interface DailyGoal {
    id: string;
    date: string;
    target: number;
    completed: number;
    type: 'production' | 'quality' | 'efficiency';
    description: string;
} 