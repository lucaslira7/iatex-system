import { useState, useEffect } from "react";
import SidebarImproved from "@/components/SidebarImproved";
import MobileNavigation from "@/components/MobileNavigation";
import CustomizableDashboardFixed from "@/components/CustomizableDashboardFixed";
import FabricManagement from "@/components/FabricManagement";
import ModelManagement from "@/components/ModelManagement";
import OrderManagement from "@/components/OrderManagement";
import AdvancedProduction from "@/components/AdvancedProduction";
import FinancialManagement from "@/components/FinancialManagement";
import InventoryManagement from "@/components/InventoryManagement";
import ReportsAnalytics from "@/components/ReportsAnalytics";
import OperationalPanelFixed from "@/components/OperationalPanelFixed";
import ClientManagement from "@/components/ClientManagement";
import EmployeeManagement from "@/components/EmployeeManagement";
import AdminBackup from "@/components/AdminBackup";
import NotificationCenter from "@/components/NotificationCenter";
import AIAssistantImproved from "@/components/AIAssistantImproved";

// Tipos atualizados para os 12 módulos consolidados
export type ActiveSection = 'dashboard' | 'fabrics' | 'models' | 'orders' | 'production' | 'clients' | 'financial' | 'inventory' | 'reports-analytics' | 'operations-schedule' | 'team-users' | 'admin-backup';

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [showAIChat, setShowAIChat] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Carregar preferência de modo escuro do localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Aplicar modo escuro ao documento
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <CustomizableDashboardFixed onSectionChange={setActiveSection} />
            <NotificationCenter />
          </div>
        );
      case 'fabrics':
        return <FabricManagement />;
      case 'models':
        return <ModelManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'production':
        return <AdvancedProduction />;
      case 'clients':
        return <ClientManagement />;
      case 'financial':
        return <FinancialManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports-analytics':
        return <ReportsAnalytics />;
      case 'operations-schedule':
        return <OperationalPanelFixed />;
      case 'team-users':
        return <EmployeeManagement />;
      case 'admin-backup':
        return <AdminBackup />;
      default:
        return (
          <div className="space-y-6">
            <CustomizableDashboardFixed onSectionChange={setActiveSection} />
            <NotificationCenter />
          </div>
        );
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <SidebarImproved
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`p-3 sm:p-6 overflow-y-auto pb-20 md:pb-6 transition-colors duration-200 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
          {renderContent()}
        </div>
      </div>

      {/* Botão Flutuante da IA - Repositionado para não interferir com navegação mobile */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 md:bottom-6">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className={`rounded-full p-3 sm:p-4 shadow-lg transition-all duration-200 hover:scale-105 ${isDarkMode
            ? 'bg-blue-700 hover:bg-blue-800 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          title="Assistente IA"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
        </button>
      </div>

      {/* Modal da IA */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
                Assistente IA
              </h3>
              <button
                onClick={() => setShowAIChat(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AIAssistantImproved />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
