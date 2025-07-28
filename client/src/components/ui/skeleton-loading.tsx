import { Skeleton } from '@/components/ui/skeleton';

// Skeleton para cards do dashboard
export const DashboardCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-48 mb-4" />
        <div className="flex items-center justify-between">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-2 w-12" />
        </div>
    </div>
);

// Skeleton para lista de tecidos
export const FabricCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-3" />
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
        </div>
    </div>
);

// Skeleton para tabelas
export const TableRowSkeleton = () => (
    <div className="flex items-center space-x-4 p-4 border-b">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20 rounded" />
    </div>
);

// Skeleton para formulários
export const FormFieldSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
    </div>
);

// Skeleton para painel operacional
export const KanbanColumnSkeleton = () => (
    <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-3 border">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Skeleton para chat IA
export const ChatMessageSkeleton = () => (
    <div className="flex items-start space-x-3 p-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    </div>
);

// Skeleton para gráficos
export const ChartSkeleton = () => (
    <div className="bg-white rounded-lg p-6 border">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
        </div>
    </div>
);

// Skeleton para modal
export const ModalSkeleton = () => (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <FormFieldSkeleton />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
    </div>
);

// Skeleton para sidebar
export const SidebarSkeleton = () => (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-6">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    </div>
); 