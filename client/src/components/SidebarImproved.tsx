import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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
  Settings,
  Star,
  StarOff,
  Receipt
} from "lucide-react";
import { ActiveSection } from "../pages/Home";
import { useAuth } from "../hooks/useAuth";

interface SidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export default function SidebarImproved({ activeSection, onSectionChange }: SidebarProps) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('ia-tex-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Salvar favoritos no localStorage
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem('ia-tex-favorites', JSON.stringify(newFavorites));
  };

  // Toggle favorito
  const toggleFavorite = (moduleId: string) => {
    const newFavorites = favorites.includes(moduleId)
      ? favorites.filter(id => id !== moduleId)
      : [...favorites, moduleId];
    saveFavorites(newFavorites);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Lista completa de todos os módulos
  const allModules = [
    // Principais (Core Business)
    { id: 'dashboard', icon: Gauge, label: 'Dashboard', badge: null, section: 'main' },
    { id: 'financial', icon: TrendingUp, label: 'Financeiro', badge: null, section: 'main' },
    
    // Produção & Materiais
    { id: 'fabrics', icon: Scissors, label: 'Tecidos', badge: 3, section: 'production' },
    { id: 'models', icon: Calculator, label: 'Modelos & Precificação', badge: null, section: 'production' },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos', badge: 12, section: 'production' },
    { id: 'production', icon: Factory, label: 'Produção Avançada', badge: null, section: 'production' },
    { id: 'inventory', icon: Package, label: 'Estoque Inteligente', badge: null, section: 'production' },
    
    // Análise & Documentos (Módulos Unificados)
    { id: 'documents-reports', icon: FolderOpen, label: 'Documentos & Relatórios', badge: null, section: 'tools' },
    { id: 'analytics-simulations', icon: BarChart3, label: 'Analytics & Simulações', badge: null, section: 'tools' },
    { id: 'operations-schedule', icon: CheckSquare, label: 'Operações & Cronograma', badge: null, section: 'tools' },
    
    // Gestão de Pessoas & Sistema
    { id: 'clients', icon: Building, label: 'Gestão de Clientes', badge: null, section: 'management' },
    { id: 'team-users', icon: UserCheck, label: 'Equipe & Usuários', badge: null, section: 'management' },
    { id: 'admin-complete', icon: Shield, label: 'Administração Completa', badge: null, section: 'management' },
    
    // Assistentes & Backup
    { id: 'ai-assistant', icon: Bot, label: 'Assistente IA', badge: null, section: 'tools' },
    { id: 'backup', icon: Download, label: 'Backup & Exportação', badge: null, section: 'management' },
  ];

  // Módulos agrupados por seção para exibição
  const mainModules = allModules.filter(m => m.section === 'main');
  const productionModules = allModules.filter(m => m.section === 'production');
  const toolsModules = allModules.filter(m => m.section === 'tools');
  const managementModules = allModules.filter(m => m.section === 'management');

  // Módulos favoritos
  const favoriteModules = allModules.filter(module => favorites.includes(module.id));

  // Componente para renderizar item do menu
  const renderMenuItem = (item: any, showFavoriteButton = false) => {
    const IconComponent = item.icon;
    const isFavorite = favorites.includes(item.id);
    
    return (
      <div key={item.id} className="group relative">
        <button
          onClick={() => onSectionChange(item.id)}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
            activeSection === item.id
              ? 'bg-blue-100 text-blue-900'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <IconComponent className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge variant={typeof item.badge === 'number' ? 'destructive' : 'secondary'} className="text-xs">
                {item.badge}
              </Badge>
            )}
            {showFavoriteButton && (
              <div
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-gray-100 rounded flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id);
                }}
              >
                {isFavorite ? (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 lg:w-64`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">IA.TEX</span>
        </div>
        {user && (
          <p className="text-xs text-gray-500 mt-2 truncate">
            {user.email}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        
        {/* Módulos Favoritos */}
        {favoriteModules.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
              ⭐ Favoritos
            </h3>
            <div className="space-y-1">
              {favoriteModules.map(item => renderMenuItem(item, true))}
            </div>
          </div>
        )}

        {/* Principais */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Principais
          </h3>
          <div className="space-y-1">
            {mainModules.map(item => renderMenuItem(item, true))}
          </div>
        </div>

        {/* Produção & Materiais */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Produção & Materiais
          </h3>
          <div className="space-y-1">
            {productionModules.map(item => renderMenuItem(item, true))}
          </div>
        </div>

        {/* Ferramentas & Relatórios */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Ferramentas & Relatórios
          </h3>
          <div className="space-y-1">
            {toolsModules.map(item => renderMenuItem(item, true))}
          </div>
        </div>

        {/* Gestão */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Gestão
          </h3>
          <div className="space-y-1">
            {managementModules.map(item => renderMenuItem(item, true))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button 
          onClick={handleLogout}
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          Sair
        </Button>
      </div>
    </div>
  );
}