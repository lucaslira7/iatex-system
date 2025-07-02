import { Badge } from "@/components/ui/badge";
import { 
  Brain,
  Gauge,
  TrendingUp,
  Scissors,
  Calculator,
  BarChart3,
  FileText,
  ShoppingCart,
  Factory,
  FolderOpen,
  PieChart,
  Calendar,
  QrCode,
  CheckSquare,
  UserCheck,
  Bot,
  Building,
  Users,
  Package,
  Shield,
  Download,
  Bell,
  Settings
} from "lucide-react";
import { ActiveSection } from "../pages/Home";
import { useAuth } from "../hooks/useAuth";

interface SidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export default function SidebarImproved({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Módulos Principais
  const mainModules = [
    { id: 'dashboard', icon: Gauge, label: 'Dashboard', badge: null },
    { id: 'financial', icon: TrendingUp, label: 'Financeiro', badge: null },
  ];

  // Produção & Materiais
  const productionModules = [
    { id: 'fabrics', icon: Scissors, label: 'Tecidos', badge: 3 },
    { id: 'models', icon: Calculator, label: 'Modelos & Precificação', badge: null },
    { id: 'simulations', icon: BarChart3, label: 'Simulações Avançadas', badge: null },
    { id: 'quotations', icon: FileText, label: 'Orçamentos', badge: null },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos', badge: 12 },
    { id: 'advanced-production', icon: Factory, label: 'Produção Avançada', badge: null },
  ];

  // Ferramentas & Relatórios
  const toolsModules = [
    { id: 'documents', icon: FolderOpen, label: 'Central de Documentos', badge: null },
    { id: 'reports', icon: PieChart, label: 'Relatórios Inteligentes', badge: null },
    { id: 'calendar', icon: Calendar, label: 'Calendário Produção', badge: null },
    { id: 'qrcodes', icon: QrCode, label: 'QR Code & Etiquetas', badge: null },
  ];

  // Painéis Operacionais
  const operationalModules = [
    { id: 'operational', icon: CheckSquare, label: 'Painel Operacional', badge: 'NOVO' },
    { id: 'user-panels', icon: UserCheck, label: 'Painéis de Usuário', badge: null },
    { id: 'ai-assistant', icon: Bot, label: 'Assistente IA', badge: 'NOVO' },
  ];

  // Gestão & Administração
  const managementModules = [
    { id: 'clients', icon: Building, label: 'Clientes', badge: null },
    { id: 'employees', icon: Users, label: 'Funcionários', badge: null },
    { id: 'inventory', icon: Package, label: 'Estoque', badge: null },
  ];

  // Configurações & Sistema
  const systemModules = [
    { id: 'admin', icon: Shield, label: 'Administração', badge: 'NOVO' },
    { id: 'backup', icon: Download, label: 'Backup & Export', badge: null },
    { id: 'notifications', icon: Bell, label: 'Notificações', badge: null },
    { id: 'brand-settings', icon: Settings, label: 'Configurações da Marca', badge: 'NOVO' },
  ];

  const sections = [
    { title: '', items: mainModules },
    { title: 'PRODUÇÃO & MATERIAIS', items: productionModules },
    { title: 'FERRAMENTAS & RELATÓRIOS', items: toolsModules },
    { title: 'PAINÉIS OPERACIONAIS', items: operationalModules },
    { title: 'GESTÃO & ADMINISTRAÇÃO', items: managementModules },
    { title: 'CONFIGURAÇÕES & SISTEMA', items: systemModules },
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
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Header */}
              {section.title && (
                <div className="py-3">
                  {sectionIndex > 0 && <div className="border-t border-slate-700 mb-3"></div>}
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
                    {section.title}
                  </p>
                </div>
              )}
              
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id as ActiveSection)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all duration-200 text-sm ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold flex-shrink-0 ml-2"
                        >
                          {typeof item.badge === 'string' ? item.badge.slice(0, 3) : item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
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