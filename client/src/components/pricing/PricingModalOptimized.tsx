import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { usePricing } from "@/context/PricingContext";
import PricingOptimized from "@/components/pricing/PricingOptimized";
import type { PricingTemplate } from "@shared/schema";
import { cachedRequest } from "@/utils/simpleCache";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: PricingTemplate | Partial<PricingTemplate> | null;
}

// Hook customizado para gerenciar carregamento de template
function useTemplateLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedId, setLoadedId] = useState<number | null>(null);
  const { resetForm, updateFormData } = usePricing();

  const loadTemplate = useCallback(async (template: PricingTemplate | Partial<PricingTemplate>) => {
    if (!template) return;

    // Evitar carregamentos duplicados
    if (template.id && template.id === loadedId && !isLoading) return;

    resetForm();
    setLoadedId(null);

    if (template.id) {
      setIsLoading(true);
      try {
        const data = await cachedRequest(`/api/pricing-templates/${template.id}/details`);
        const { template: fullTemplate, sizes, costs } = data;

        // Processar tamanhos
        const templateSizes = sizes.map((size: any) => ({
          size: size.size,
          quantity: parseInt(size.quantity),
          weight: parseFloat(size.weight)
        }));

        // Categorizar custos
        const costCategories = { creation: [], supplies: [], labor: [], fixed: [] };
        costs.forEach((cost: any) => {
          const costItem = {
            id: cost.id?.toString() || Math.random().toString(),
            description: cost.description,
            unitValue: parseFloat(cost.unitValue),
            quantity: parseFloat(cost.quantity),
            wastePercentage: parseFloat(cost.wastePercentage || 0),
            total: parseFloat(cost.total)
          };
          const category = cost.category as keyof typeof costCategories;
          if (costCategories[category]) {
            (costCategories[category] as any[]).push(costItem);
          }
        });

        // Aplicar dados em lote para evitar múltiplos re-renders
        const formUpdates = {
          pricingMode: fullTemplate.pricingMode,
          garmentType: fullTemplate.garmentType,
          modelName: fullTemplate.modelName,
          reference: fullTemplate.reference,
          description: fullTemplate.description || '',
          imageUrl: fullTemplate.imageUrl || '',
          sizes: templateSizes,
          fabricId: fullTemplate.fabricId,
          fabricConsumption: parseFloat(fullTemplate.fabricConsumption) || 0,
          wastePercentage: parseFloat(fullTemplate.wastePercentage) || 20,
          creationCosts: costCategories.creation,
          supplies: costCategories.supplies,
          labor: costCategories.labor,
          fixedCosts: costCategories.fixed,
          profitMargin: parseFloat(fullTemplate.profitMargin) || 50,
          totalCost: parseFloat(fullTemplate.totalCost) || 0,
          finalPrice: parseFloat(fullTemplate.finalPrice) || 0,
        };

        // Aplicar todas as atualizações de uma vez
        Object.entries(formUpdates).forEach(([key, value]) => {
          updateFormData(key, value);
        });

        setLoadedId(template.id);
      } catch (error) {
        console.error('Erro ao carregar template:', error);
        // Fallback com dados básicos
        updateFormData('modelName', template.modelName || '');
        updateFormData('reference', template.reference || '');
        updateFormData('garmentType', template.garmentType || '');
        updateFormData('description', template.description || '');
        updateFormData('imageUrl', template.imageUrl || '');
        updateFormData('pricingMode', template.pricingMode || 'single');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Template para cópia - usar dados diretamente
      const updates = {
        modelName: template.modelName || '',
        reference: template.reference || '',
        garmentType: template.garmentType || '',
        description: template.description || '',
        imageUrl: template.imageUrl || '',
        pricingMode: template.pricingMode || 'single',
        fabricId: template.fabricId || null,
        fabricConsumption: parseFloat(template.fabricConsumption as any) || 0,
        wastePercentage: parseFloat(template.wastePercentage as any) || 20,
        profitMargin: parseFloat(template.profitMargin as any) || 40,
        totalCost: parseFloat(template.totalCost as any) || 0,
        finalPrice: parseFloat(template.finalPrice as any) || 0,
      };

      Object.entries(updates).forEach(([key, value]) => {
        updateFormData(key, value);
      });

      // Carregar dados adicionais se disponíveis
      if ((template as any).sizes) {
        updateFormData('sizes', (template as any).sizes);
      }
      if ((template as any).costs) {
        const costs = (template as any).costs;
        const costsByCategory = costs.reduce((acc: any, cost: any) => {
          if (!acc[cost.category]) acc[cost.category] = [];
          acc[cost.category].push(cost);
          return acc;
        }, {});

        Object.entries(costsByCategory).forEach(([category, costs]) => {
          const key = category === 'creation' ? 'creationCosts' : 
                     category === 'supplies' ? 'supplies' :
                     category === 'labor' ? 'labor' : 'fixedCosts';
          updateFormData(key, costs);
        });
      }
    }
  }, [loadedId, isLoading, resetForm, updateFormData]);

  return { loadTemplate, isLoading, loadedId };
}

function PricingModalContent({ onClose, initialTemplate }: { 
  onClose: () => void; 
  initialTemplate?: PricingTemplate | Partial<PricingTemplate> | null 
}) {
  const { currentStep, setCurrentStep, formData } = usePricing();
  const { loadTemplate, isLoading } = useTemplateLoader();

  // Memorizar título do modal baseado no step
  const modalTitle = useMemo(() => {
    const steps = [
      "Modalidade de Precificação",
      "Informações do Modelo", 
      "Seleção do Tecido",
      "Configuração de Tamanhos",
      "Custos de Criação",
      "Insumos e Materiais", 
      "Mão de Obra",
      "Custos Fixos",
      "Resumo Final"
    ];
    return `${steps[currentStep]} (${currentStep + 1}/${steps.length})`;
  }, [currentStep]);

  // Carregar template apenas quando necessário
  useEffect(() => {
    if (initialTemplate) {
      loadTemplate(initialTemplate);
    }
  }, [initialTemplate?.id, loadTemplate]);

  const handleClose = useCallback(() => {
    setCurrentStep(0);
    onClose();
  }, [setCurrentStep, onClose]);

  // Atalhos de teclado otimizados
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Carregando dados do template...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="pb-4">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            {modalTitle}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        <PricingOptimized currentStep={currentStep} />
        
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <Button 
            onClick={() => setCurrentStep(Math.min(8, currentStep + 1))}
            disabled={currentStep === 8}
            className="flex items-center gap-2"
          >
            Próximo
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PricingModalOptimized({ isOpen, onClose, initialTemplate }: PricingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <PricingModalContent onClose={onClose} initialTemplate={initialTemplate} />
      </DialogContent>
    </Dialog>
  );
}