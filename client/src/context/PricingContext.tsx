import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PricingFormData {
  // Etapa 0 - Modalidade de Precificação
  pricingMode: 'single' | 'multiple'; // single = peça única, multiple = múltiplas peças
  
  // Etapa 1 - Tipo da Peça
  garmentType: string;
  modelName: string;
  reference: string;
  description: string;
  imageUrl: string;
  
  // Etapa 3 - Tamanhos (agora com peso)
  sizes: {
    size: string;
    quantity: number;
    weight: number; // peso em gramas por peça deste tamanho
  }[];
  
  // Etapa 3 - Tecido
  fabricId: number | null;
  fabricConsumption: number;
  wastePercentage: number;
  
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
  loadTemplateData: (templateId: number) => Promise<void>;
}

const defaultFormData: PricingFormData = {
  pricingMode: 'single',
  garmentType: '',
  modelName: '',
  reference: '',
  description: '',
  imageUrl: '',
  sizes: [],
  fabricId: null,
  fabricConsumption: 0,
  wastePercentage: 10,
  creationCosts: [],
  supplies: [],
  labor: [],
  fixedCosts: [],
  profitMargin: 30,
  finalPrice: 0,
  totalCost: 0,
};

// Function to generate automatic reference based on garment type
const generateReference = (garmentType: string, existingReference?: string): string => {
  if (existingReference && existingReference.trim()) {
    return existingReference;
  }
  
  const garmentTypeLower = garmentType.toLowerCase();
  let prefix = '';
  
  if (garmentTypeLower.includes('calça') || garmentTypeLower.includes('calca')) {
    prefix = 'CL';
  } else if (garmentTypeLower.includes('camisa')) {
    prefix = 'C';
  } else if (garmentTypeLower.includes('top')) {
    prefix = 'T';
  } else if (garmentTypeLower.includes('conjunto')) {
    prefix = 'CJ';
  } else if (garmentTypeLower.includes('camiseta')) {
    prefix = 'C';
  } else if (garmentTypeLower.includes('blusa')) {
    prefix = 'C';
  } else if (garmentTypeLower.includes('vestido')) {
    prefix = 'V';
  } else {
    prefix = 'P'; // P for "Peça" (generic piece)
  }
  
  // Generate a sequential number (this is simplified - in production you'd check existing references)
  const timestamp = Date.now().toString().slice(-3);
  return `${prefix}${timestamp}`;
};

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<PricingFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(0);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate reference when garment type changes
      if (field === 'garmentType' && value) {
        updated.reference = generateReference(value, prev.reference);
      }
      
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

  const loadTemplateData = async (templateId: number) => {
    try {
      const response = await fetch(`/api/pricing-templates/${templateId}/details`);
      if (!response.ok) throw new Error('Failed to fetch template details');
      
      const data = await response.json();
      const { template, sizes, costs } = data;
      
      // Converter tamanhos do template
      const templateSizes = sizes.map((size: any) => ({
        size: size.size,
        quantity: parseInt(size.quantity),
        weight: parseFloat(size.weight)
      }));
      
      // Organizar custos por categoria
      const creationCosts: any[] = [];
      const supplies: any[] = [];
      const labor: any[] = [];
      const fixedCosts: any[] = [];
      
      costs.forEach((cost: any) => {
        const costItem = {
          id: cost.id.toString(),
          description: cost.description,
          unitValue: parseFloat(cost.unitValue),
          quantity: parseFloat(cost.quantity),
          wastePercentage: parseFloat(cost.wastePercentage),
          total: parseFloat(cost.total)
        };
        
        switch (cost.category) {
          case 'creation':
            creationCosts.push(costItem);
            break;
          case 'supplies':
            supplies.push(costItem);
            break;
          case 'labor':
            labor.push(costItem);
            break;
          case 'fixed':
            fixedCosts.push(costItem);
            break;
        }
      });
      
      // Carregar todos os dados no formulário
      setFormData({
        pricingMode: template.pricingMode as 'single' | 'multiple',
        garmentType: template.garmentType,
        modelName: template.modelName,
        reference: template.reference,
        description: template.description || '',
        imageUrl: template.imageUrl || '',
        sizes: templateSizes,
        fabricId: template.fabricId,
        fabricConsumption: parseFloat(template.fabricConsumption) || 0,
        wastePercentage: parseFloat(template.wastePercentage) || 20,
        creationCosts,
        supplies,
        labor,
        fixedCosts,
        profitMargin: parseFloat(template.profitMargin) || 50,
        totalCost: parseFloat(template.totalCost) || 0,
        finalPrice: parseFloat(template.finalPrice) || 0,
      });
      
    } catch (error) {
      console.error('Error loading template data:', error);
      throw error;
    }
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
        loadTemplateData,
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