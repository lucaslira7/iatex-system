import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CustomizableDashboardFixed from "@/components/CustomizableDashboardFixed";
import FabricManagement from "@/components/FabricManagement";
import PricingCalculator from "@/components/PricingCalculator";
import QuotationManagement from "@/components/QuotationManagement";
import ModelManagement from "@/components/ModelManagement";
import AdvancedSimulations from "@/components/AdvancedSimulations";
import EmployeeManagement from "@/components/EmployeeManagement";
import FinancialManagement from "@/components/FinancialManagement";
import InventoryManagement from "@/components/InventoryManagement";
import AdvancedProduction from "@/components/AdvancedProduction";
import DocumentCenter from "@/components/DocumentCenter";
import IntelligentReports from "@/components/IntelligentReports";
import ProductionCalendar from "@/components/ProductionCalendar";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import OrderManagement from "@/components/OrderManagement";
import ClientManagement from "@/components/ClientManagement";
import AdminPanel from "@/components/AdminPanel";
import BackupExport from "@/components/BackupExport";
import NotificationCenter from "@/components/NotificationCenter";
import BrandSettings from "@/components/BrandSettings";

import AIAssistant from "@/components/AIAssistant";
import UserPanels from "@/components/UserPanels";
import OperationalPanelFixed from "@/components/OperationalPanelFixed";

export type ActiveSection = 'dashboard' | 'fabrics' | 'quotations' | 'models' | 'simulations' | 'orders' | 'production' | 'advanced-production' | 'documents' | 'clients' | 'employees' | 'financial' | 'inventory' | 'admin' | 'backup' | 'notifications' | 'brand-settings' | 'reports' | 'calendar' | 'qrcodes' | 'ai-assistant' | 'user-panels' | 'operational';

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [showAIChat, setShowAIChat] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <CustomizableDashboardFixed onSectionChange={setActiveSection} />;
      case 'fabrics':
        return <FabricManagement />;
      case 'quotations':
        return <QuotationManagement />;
      case 'models':
        return <ModelManagement />;
      case 'simulations':
        return <AdvancedSimulations />;
      case 'orders':
        return <OrderManagement />;
      case 'production':
        return <AdvancedProduction />;
      case 'advanced-production':
        return <AdvancedProduction />;
      case 'documents':
        return <DocumentCenter />;
      case 'clients':
        return <ClientManagement />;
      case 'employees':
        return <EmployeeManagement />;
      case 'financial':
        return <FinancialManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'admin':
        return <AdminPanel />;
      case 'backup':
        return <BackupExport />;
      case 'notifications':
        return <NotificationCenter />;
      case 'brand-settings':
        return <BrandSettings />;
      case 'reports':
        return <IntelligentReports />;
      case 'calendar':
        return <ProductionCalendar />;
      case 'qrcodes':
        return <QRCodeGenerator />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'user-panels':
        return <UserPanels />;
      case 'operational':
        return <OperationalPanelFixed />;
      default:
        return <CustomizableDashboardFixed onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-72">
        {renderContent()}
      </div>

      {/* Botão Flutuante da IA */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          title="Assistente IA"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </button>
      </div>

      {/* Modal da IA */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
                Assistente IA
              </h3>
              <button
                onClick={() => setShowAIChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <AIAssistant />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
