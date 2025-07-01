import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PricingFormData {
  // Etapa 1 - Tipo da Peça
  garmentType: string;
  modelName: string;
  reference: string;
  description: string;
  imageUrl: string;
  
  // Etapa 2 - Tamanhos
  sizes: {
    size: string;
    quantity: number;
  }[];
  
  // Etapa 3 - Tecido
  fabricId: number | null;
  fabricConsumption: number;
  
  // Etapa 4 - Custos de Criação
  creationCosts: {
    id: string;
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    total: number;
  }[];
  
  // Etapa 5 - Insumos
  supplies: {
    id: string;
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    total: number;
  }[];
  
  // Etapa 6 - Mão de Obra
  labor: {
    id: string;
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    total: number;
  }[];
  
  // Etapa 7 - Custos Fixos
  fixedCosts: {
    id: string;
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    total: number;
  }[];
  
  // Etapa 8 - Resumo
  profitMargin: number;
  finalPrice: number;
  totalCost: number;
}

interface PricingContextType {
  formData: PricingFormData;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  updateFormData: (field: string, value: any) => void;
  resetForm: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  calculateTotals: () => void;
}

const defaultFormData: PricingFormData = {
  garmentType: '',
  modelName: '',
  reference: '',
  description: '',
  imageUrl: '',
  sizes: [],
  fabricId: null,
  fabricConsumption: 0,
  creationCosts: [],
  supplies: [],
  labor: [],
  fixedCosts: [],
  profitMargin: 30,
  finalPrice: 0,
  totalCost: 0,
};

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<PricingFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-save to localStorage
      localStorage.setItem('ia-tex-pricing-data', JSON.stringify(updated));
      return updated;
    });
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setCurrentStep(1);
    localStorage.removeItem('ia-tex-pricing-data');
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('ia-tex-pricing-data', JSON.stringify(formData));
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('ia-tex-pricing-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...defaultFormData, ...parsed });
      } catch (error) {
        console.error('Error loading pricing data from localStorage:', error);
      }
    }
  };

  const calculateTotals = () => {
    const creationTotal = formData.creationCosts.reduce((sum, item) => sum + item.total, 0);
    const suppliesTotal = formData.supplies.reduce((sum, item) => sum + item.total, 0);
    const laborTotal = formData.labor.reduce((sum, item) => sum + item.total, 0);
    const fixedTotal = formData.fixedCosts.reduce((sum, item) => sum + item.total, 0);
    
    const totalCost = creationTotal + suppliesTotal + laborTotal + fixedTotal;
    const finalPrice = totalCost * (1 + formData.profitMargin / 100);
    
    setFormData(prev => ({
      ...prev,
      totalCost,
      finalPrice
    }));
  };

  // Load data on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Auto-calculate totals when costs change
  useEffect(() => {
    calculateTotals();
  }, [formData.creationCosts, formData.supplies, formData.labor, formData.fixedCosts, formData.profitMargin]);

  return (
    <PricingContext.Provider
      value={{
        formData,
        currentStep,
        setCurrentStep,
        updateFormData,
        resetForm,
        saveToLocalStorage,
        loadFromLocalStorage,
        calculateTotals,
      }}
    >
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
}