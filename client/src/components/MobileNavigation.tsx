import { useState } from "react";
import { 
  Gauge, Scissors, BarChart3, ShoppingCart, Factory, 
  Menu, X, Users, Package, Bot, Settings, TrendingUp,
  FolderOpen, CheckSquare, Building, Shield, Download,
  UserCheck, Sun, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveSection } from "../pages/Home";

interface MobileNavigationProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function MobileNavigation({ activeSection, onSectionChange, isDarkMode, onToggleDarkMode }: MobileNavigationProps) {
  const [showMenu, setShowMenu] = useState(false);

  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Gauge },
    { id: 'fabrics', label: 'Tecidos', icon: Scissors },
    { id: 'models', label: 'Modelos', icon: BarChart3 },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'financial', label: 'Financeiro', icon: TrendingUp },
  ];

  const allMenuItems = [
    // Principais
    { id: 'dashboard', label: 'Dashboard', icon: Gauge, section: 'main' },
    { id: 'financial', label: 'Financeiro', icon: TrendingUp, section: 'main' },
    
    // Produção & Materiais
    { id: 'fabrics', label: 'Tecidos', icon: Scissors, section: 'production' },
    { id: 'models', label: 'Modelos & Precificação', icon: BarChart3, section: 'production' },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, section: 'production' },
    { id: 'production', label: 'Produção Avançada', icon: Factory, section: 'production' },
    { id: 'inventory', label: 'Estoque Inteligente', icon: Package, section: 'production' },
    
    // Análise & Documentos
    { id: 'documents-reports', label: 'Documentos & Relatórios', icon: FolderOpen, section: 'tools' },
    { id: 'analytics-simulations', label: 'Analytics & Simulações', icon: BarChart3, section: 'tools' },
    { id: 'operations-schedule', label: 'Operações & Cronograma', icon: CheckSquare, section: 'tools' },
    
    // Gestão
    { id: 'clients', label: 'Gestão de Clientes', icon: Building, section: 'management' },
    { id: 'team-users', label: 'Equipe & Usuários', icon: UserCheck, section: 'management' },
    { id: 'admin-complete', label: 'Administração Completa', icon: Shield, section: 'management' },
    
    // Assistentes
    { id: 'ai-assistant', label: 'Assistente IA', icon: Bot, section: 'tools' },
    { id: 'backup', label: 'Backup & Exportação', icon: Download, section: 'management' },
  ];

  return (
    <>
      {/* Bottom Navigation - Principais */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {mainMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id as ActiveSection)}
                className={`flex flex-col items-center justify-center h-full text-xs font-medium transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <IconComponent className="h-5 w-5 mb-1" />
                <span className="truncate max-w-full px-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Button */}
      <button
        onClick={() => setShowMenu(true)}
        className="fixed top-4 left-4 z-50 bg-white rounded-lg p-2 shadow-lg border border-gray-200 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Full Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu Content */}
          <div className="absolute top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">IA.TEX</span>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-4 px-3 space-y-1 overflow-y-auto h-full pb-20">
              {allMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id as ActiveSection);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}