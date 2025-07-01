import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import FabricManagement from "@/components/FabricManagement";
import PricingCalculator from "@/components/PricingCalculator";
import ModelManagement from "@/components/ModelManagement";
import OrderManagement from "@/components/OrderManagement";
import ProductionTracking from "@/components/ProductionTracking";

export type ActiveSection = 'dashboard' | 'fabrics' | 'pricing' | 'models' | 'orders' | 'production' | 'employees' | 'financial' | 'inventory';

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onSectionChange={setActiveSection} />;
      case 'fabrics':
        return <FabricManagement />;
      case 'pricing':
        return <PricingCalculator />;
      case 'models':
        return <ModelManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'production':
        return <ProductionTracking />;
      default:
        return <Dashboard onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {renderContent()}
      </div>
    </div>
  );
}
