import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CustomizableDashboard from "@/components/CustomizableDashboard";
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

import AIAssistant from "@/components/AIAssistant";
import UserPanels from "@/components/UserPanels";
import OperationalPanelFixed from "@/components/OperationalPanelFixed";

export type ActiveSection = 'dashboard' | 'fabrics' | 'quotations' | 'models' | 'simulations' | 'orders' | 'production' | 'advanced-production' | 'documents' | 'employees' | 'financial' | 'inventory' | 'reports' | 'calendar' | 'qrcodes' | 'ai-assistant' | 'user-panels' | 'operational';

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <CustomizableDashboard onSectionChange={setActiveSection} />;
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
      case 'employees':
        return <EmployeeManagement />;
      case 'financial':
        return <FinancialManagement />;
      case 'inventory':
        return <InventoryManagement />;
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
        return <CustomizableDashboard onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-72">
        {renderContent()}
      </div>
    </div>
  );
}
