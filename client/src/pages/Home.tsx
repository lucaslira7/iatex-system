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
import ProductionTracking from "@/components/ProductionTracking";

export type ActiveSection = 'dashboard' | 'fabrics' | 'quotations' | 'models' | 'simulations' | 'orders' | 'production' | 'advanced-production' | 'documents' | 'employees' | 'financial' | 'inventory' | 'reports' | 'calendar' | 'qrcodes';

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
        return <ProductionTracking />;
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
