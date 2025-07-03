import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { cachedRequest } from '@/utils/simpleCache';

export interface PricingFormData {
  // Etapa 0 - Modalidade de Precificação
  pricingMode: 'single' | 'multiple';
  
  // Etapa 1 - Tipo da Peça
  garmentType: string;
  modelName: string;
  reference: string;
  description: string;
  imageUrl: string;
  
  // Etapa 3 - Tamanhos
  sizes: {
    size: string;
    quantity: number;
    weight: number;
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
  totalCost: number;
  finalPrice: number;
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
  wastePercentage: 20,
  creationCosts: [],
  supplies: [],
  labor: [],
  fixedCosts: [],
  profitMargin: 40,
  totalCost: 0,
  finalPrice: 0,
};

interface PricingContextType {
  formData: PricingFormData;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  updateFormData: (field: string, value: any) => void;
  updateMultipleFields: (updates: Partial<PricingFormData>) => void;
  resetForm: () => void;
  calculateTotals: () => void;
  loadTemplateData: (templateId: number) => Promise<void>;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export function PricingProviderOptimized({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<PricingFormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(0);

  // Função otimizada para atualizar múltiplos campos de uma vez
  const updateMultipleFields = useCallback((updates: Partial<PricingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Função otimizada para atualizar um campo específico
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate reference when garment type changes
      if (field === 'garmentType' && value) {
        const timestamp = Date.now().toString().slice(-4);
        let prefix = '';
        
        const cleanValue = value.toLowerCase().trim();
        if (cleanValue.includes('calça') || cleanValue.includes('calca')) {
          prefix = 'CL';
        } else if (cleanValue.includes('camisa') || cleanValue.includes('blusa')) {
          prefix = 'C';
        } else if (cleanValue.includes('top') || cleanValue.includes('cropped')) {
          prefix = 'T';
        } else if (cleanValue.includes('conjunto')) {
          prefix = 'CJ';
        } else if (cleanValue.includes('vestido')) {
          prefix = 'V';
        } else if (cleanValue.includes('short') || cleanValue.includes('bermuda')) {
          prefix = 'S';
        } else if (cleanValue.includes('saia')) {
          prefix = 'SK';
        } else {
          prefix = 'M';
        }
        
        updated.reference = `${prefix}-${timestamp}`;
      }
      
      return updated;
    });
  }, []);

  // Reset otimizado
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setCurrentStep(0);
  }, []);

  // Cálculo de totais otimizado com memoização
  const calculateTotals = useCallback(() => {
    setFormData(prev => {
      const creationTotal = prev.creationCosts.reduce((sum, item) => sum + item.total, 0);
      const suppliesTotal = prev.supplies.reduce((sum, item) => sum + item.total, 0);
      const laborTotal = prev.labor.reduce((sum, item) => sum + item.total, 0);
      const fixedTotal = prev.fixedCosts.reduce((sum, item) => sum + item.total, 0);
      
      const totalCost = creationTotal + suppliesTotal + laborTotal + fixedTotal;
      const finalPrice = totalCost * (1 + prev.profitMargin / 100);
      
      return {
        ...prev,
        totalCost,
        finalPrice
      };
    });
  }, []);

  // Carregamento de template otimizado
  const loadTemplateData = useCallback(async (templateId: number) => {
    try {
      const data = await cachedRequest(`/api/pricing-templates/${templateId}/details`);
      const { template, sizes, costs } = data;
      
      // Processar tamanhos
      const templateSizes = sizes.map((size: any) => ({
        size: size.size,
        quantity: parseInt(size.quantity),
        weight: parseFloat(size.weight)
      }));

      // Categorizar custos de forma otimizada
      const costCategories = costs.reduce((acc: any, cost: any) => {
        const costItem = {
          id: cost.id?.toString() || Math.random().toString(),
          description: cost.description,
          unitValue: parseFloat(cost.unitValue),
          quantity: parseFloat(cost.quantity),
          wastePercentage: parseFloat(cost.wastePercentage || 0),
          total: parseFloat(cost.total)
        };

        if (!acc[cost.category]) acc[cost.category] = [];
        acc[cost.category].push(costItem);
        return acc;
      }, {});
      
      // Atualizar todos os dados de uma vez para evitar múltiplos re-renders
      updateMultipleFields({
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
        creationCosts: costCategories.creation || [],
        supplies: costCategories.supplies || [],
        labor: costCategories.labor || [],
        fixedCosts: costCategories.fixed || [],
        profitMargin: parseFloat(template.profitMargin) || 50,
        totalCost: parseFloat(template.totalCost) || 0,
        finalPrice: parseFloat(template.finalPrice) || 0,
      });
      
    } catch (error) {
      console.error('Error loading template data:', error);
      throw error;
    }
  }, [updateMultipleFields]);

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  const contextValue = useMemo(() => ({
    formData,
    currentStep,
    setCurrentStep,
    updateFormData,
    updateMultipleFields,
    resetForm,
    calculateTotals,
    loadTemplateData,
  }), [
    formData,
    currentStep,
    updateFormData,
    updateMultipleFields,
    resetForm,
    calculateTotals,
    loadTemplateData,
  ]);

  return (
    <PricingContext.Provider value={contextValue}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricingOptimized() {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricingOptimized must be used within a PricingProviderOptimized');
  }
  return context;
}