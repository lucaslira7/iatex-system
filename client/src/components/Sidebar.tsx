import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Gauge, 
  Scissors, 
  Calculator, 
  Shirt, 
  ShoppingCart, 
  Factory,
  Users,
  TrendingUp,
  Package,
  Settings
} from "lucide-react";
import type { ActiveSection } from "@/pages/Home";

interface SidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const sectionConfig = {
    dashboard: { icon: Gauge, label: "Dashboard", badge: null },
    fabrics: { icon: Scissors, label: "Tecidos", badge: 3 },
    pricing: { icon: Calculator, label: "Precificação", badge: null },
    models: { icon: Shirt, label: "Modelos", badge: null },
    orders: { icon: ShoppingCart, label: "Pedidos", badge: 12 },
    production: { icon: Factory, label: "Produção", badge: null },
    employees: { icon: Users, label: "Funcionários", badge: null },
    financial: { icon: TrendingUp, label: "Financeiro", badge: null },
    inventory: { icon: Package, label: "Estoque", badge: null },
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background shadow-lg">
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border bg-sidebar-background">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">IA.TEX</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 p-4">
          <div className="space-y-1">
            {Object.entries(sectionConfig).slice(0, 6).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeSection === key;
              
              return (
                <button
                  key={key}
                  onClick={() => onSectionChange(key as ActiveSection)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {config.label}
                  {config.badge && (
                    <Badge variant="destructive" className="ml-auto">
                      {config.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <div className="text-sidebar-foreground/60 text-xs font-semibold uppercase tracking-wide mb-2">
              Gestão
            </div>
            {Object.entries(sectionConfig).slice(6).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = activeSection === key;
              
              return (
                <button
                  key={key}
                  onClick={() => onSectionChange(key as ActiveSection)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"} 
              alt="Profile" 
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">
                {user?.firstName || user?.email || "Usuário"}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
