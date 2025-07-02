import { Loader2, Package, Calculator, TrendingUp, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
}

// Skeleton específico para cards de template
export function TemplateCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full mb-4" />
        <div className="space-y-3">
          <Skeleton count={4} className="h-4 w-full" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-8 w-full mt-2" />
      </CardContent>
    </Card>
  );
}

// Skeleton para cards de tecido
export function FabricCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24 w-full mb-4" />
        <div className="space-y-2">
          <Skeleton count={5} className="h-3 w-full" />
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

// Loading state para dashboard
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Métricas cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Estados de loading específicos por contexto
interface ContextualLoadingProps {
  type: "templates" | "fabrics" | "orders" | "dashboard";
  message?: string;
}

export function ContextualLoading({ type, message }: ContextualLoadingProps) {
  const config = {
    templates: {
      icon: Calculator,
      title: "Carregando Templates",
      defaultMessage: "Buscando templates de precificação...",
      color: "text-blue-600"
    },
    fabrics: {
      icon: Package,
      title: "Carregando Tecidos", 
      defaultMessage: "Buscando informações dos tecidos...",
      color: "text-green-600"
    },
    orders: {
      icon: FileText,
      title: "Carregando Pedidos",
      defaultMessage: "Buscando pedidos...",
      color: "text-purple-600"
    },
    dashboard: {
      icon: TrendingUp,
      title: "Carregando Dashboard",
      defaultMessage: "Preparando métricas...",
      color: "text-orange-600"
    }
  };

  const { icon: Icon, title, defaultMessage, color } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${color} mb-4`}>
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md">
        {message || defaultMessage}
      </p>
      <div className="mt-4">
        <LoadingSpinner size="lg" className={color} />
      </div>
    </div>
  );
}

// Loading para operações específicas
interface OperationLoadingProps {
  operation: "saving" | "deleting" | "exporting" | "calculating";
  item?: string;
}

export function OperationLoading({ operation, item = "" }: OperationLoadingProps) {
  const messages = {
    saving: `Salvando ${item}...`,
    deleting: `Excluindo ${item}...`,
    exporting: `Exportando ${item}...`,
    calculating: `Calculando ${item}...`,
  };

  return (
    <div className="flex items-center gap-3">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-gray-600">
        {messages[operation]}
      </span>
    </div>
  );
}