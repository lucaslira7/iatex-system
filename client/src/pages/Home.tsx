import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import FabricManagement from "@/components/FabricManagement";
import PricingCalculator from "@/components/PricingCalculator";
import QuotationManagement from "@/components/QuotationManagement";
import ModelManagement from "@/components/ModelManagement";
import AdvancedSimulations from "@/components/AdvancedSimulations";
import EmployeeManagement from "@/components/EmployeeManagement";
import OrderManagement from "@/components/OrderManagement";
import ProductionTracking from "@/components/ProductionTracking";

export type ActiveSection = 'dashboard' | 'fabrics' | 'quotations' | 'models' | 'simulations' | 'orders' | 'production' | 'employees' | 'financial' | 'inventory';

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onSectionChange={setActiveSection} />;
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
      case 'employees':
        return <EmployeeManagement />;
      default:
        return <Dashboard onSectionChange={setActiveSection} />;
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
