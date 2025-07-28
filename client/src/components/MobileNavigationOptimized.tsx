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

export default function MobileNavigationOptimized({ activeSection, onSectionChange, isDarkMode, onToggleDarkMode }: MobileNavigationProps) {
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
    { id: 'dashboard', label: 'Dashboard & Notificações', icon: Gauge, section: 'main' },
    { id: 'financial', label: 'Financeiro', icon: TrendingUp, section: 'main' },

    // Produção & Materiais
    { id: 'fabrics', label: 'Tecidos', icon: Scissors, section: 'production' },
    { id: 'models', label: 'Modelos & Precificação', icon: BarChart3, section: 'production' },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, section: 'production' },
    { id: 'production', label: 'Produção & QR Codes', icon: Factory, section: 'production' },
    { id: 'inventory', label: 'Estoque Inteligente', icon: Package, section: 'production' },

    // Análise & Documentos
    { id: 'reports-analytics', label: 'Relatórios & Analytics', icon: FolderOpen, section: 'tools' },
    { id: 'operations-schedule', label: 'Operações & Calendário', icon: CheckSquare, section: 'tools' },

    // Gestão
    { id: 'clients', label: 'Gestão de Clientes', icon: Building, section: 'management' },
    { id: 'team-users', label: 'Equipe & Usuários', icon: UserCheck, section: 'management' },
    { id: 'admin-backup', label: 'Administração & Backup', icon: Shield, section: 'management' },
  ];

  const groupedMenuItems = {
    main: allMenuItems.filter(item => item.section === 'main'),
    production: allMenuItems.filter(item => item.section === 'production'),
    tools: allMenuItems.filter(item => item.section === 'tools'),
    management: allMenuItems.filter(item => item.section === 'management'),
  };

  return (
    <>
      {/* Header with Menu Toggle - Mobile Only */}
      <div className={`md:hidden border-b p-4 flex items-center justify-between ${isDarkMode
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
        }`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMenu(true)}
          className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : ''}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>IA.TEX</h1>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleDarkMode}
          className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : ''}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Bottom Navigation - Principais */}
      <div className={`fixed bottom-0 left-0 right-0 border-t z-40 md:hidden ${isDarkMode
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
        }`}>
        <div className="grid grid-cols-5 h-16">
          {mainMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id as ActiveSection)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${isActive
                    ? isDarkMode
                      ? 'text-blue-400 bg-blue-900/20'
                      : 'text-blue-600 bg-blue-50'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium truncate px-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className={`w-80 max-w-[85vw] h-full shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'
            }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>IA.TEX</h2>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(false)}
                className={isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : ''}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto h-full pb-24">
              {/* Principais */}
              <div>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Principais
                </h3>
                <div className="space-y-1">
                  {groupedMenuItems.main.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id as ActiveSection);
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${isActive
                            ? isDarkMode
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                            : isDarkMode
                              ? 'text-gray-300 hover:bg-gray-800'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Produção & Materiais */}
              <div>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Produção & Materiais
                </h3>
                <div className="space-y-1">
                  {groupedMenuItems.production.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id as ActiveSection);
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${isActive
                            ? isDarkMode
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                            : isDarkMode
                              ? 'text-gray-300 hover:bg-gray-800'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Análise & Ferramentas */}
              <div>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Análise & Ferramentas
                </h3>
                <div className="space-y-1">
                  {groupedMenuItems.tools.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id as ActiveSection);
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${isActive
                            ? isDarkMode
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                            : isDarkMode
                              ? 'text-gray-300 hover:bg-gray-800'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gestão */}
              <div>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Gestão
                </h3>
                <div className="space-y-1">
                  {groupedMenuItems.management.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id as ActiveSection);
                          setShowMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${isActive
                            ? isDarkMode
                              ? 'bg-blue-900/30 text-blue-400 border border-blue-800'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                            : isDarkMode
                              ? 'text-gray-300 hover:bg-gray-800'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}