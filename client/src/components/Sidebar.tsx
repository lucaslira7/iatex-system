import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Gauge, 
  Scissors, 
  Calculator, 
  FileText,
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

  const mainMenuItems = [
    { id: 'dashboard', icon: Gauge, label: 'Dashboard', badge: null },
    { id: 'fabrics', icon: Scissors, label: 'Tecidos', badge: 3 },
    { id: 'models', icon: Calculator, label: 'Modelos & Precificação', badge: null },
    { id: 'quotations', icon: FileText, label: 'Orçamentos', badge: null },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos', badge: 12 },
    { id: 'production', icon: Factory, label: 'Produção', badge: null },
  ];

  const managementItems = [
    { id: 'employees', icon: Users, label: 'Funcionários', badge: null },
    { id: 'financial', icon: TrendingUp, label: 'Financeiro', badge: null },
    { id: 'inventory', icon: Package, label: 'Estoque', badge: null },
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-800 shadow-lg">
      <div className="flex h-full flex-col">
        {/* Logo Area */}
        <div className="flex h-20 items-center px-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">IA.TEX</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {/* Main Menu Items */}
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id as ActiveSection)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}

          {/* Section Divider */}
          <div className="py-4">
            <div className="border-t border-slate-700"></div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4 px-4">
              GESTÃO
            </p>
          </div>

          {/* Management Items */}
          {managementItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id as ActiveSection)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-slate-400"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email || 'Usuário'}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Sair
              </button>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}