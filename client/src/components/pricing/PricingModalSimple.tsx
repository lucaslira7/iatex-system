import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { PricingProvider, usePricing } from "@/context/PricingContext";
import PricingOptimized from "@/components/pricing/PricingOptimized";
import type { PricingTemplate } from "@shared/schema";
import { cachedRequest } from "@/utils/simpleCache";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: PricingTemplate | Partial<PricingTemplate> | null;
}

function PricingModalContent({ onClose, initialTemplate }: { 
  onClose: () => void; 
  initialTemplate?: PricingTemplate | Partial<PricingTemplate> | null 
}) {
  const { currentStep, setCurrentStep, resetForm, updateFormData } = usePricing();
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Carregamento simplificado de template
  useEffect(() => {
    if (!initialTemplate || hasLoaded) return;

    const loadTemplate = async () => {
      resetForm();
      
      if (initialTemplate.id) {
        try {
          const data = await cachedRequest(`/api/pricing-templates/${initialTemplate.id}/details`);
          const { template, sizes, costs } = data;

          // Aplicar dados básicos
          updateFormData('pricingMode', template.pricingMode);
          updateFormData('garmentType', template.garmentType);
          updateFormData('modelName', template.modelName);
          updateFormData('reference', template.reference);
          updateFormData('description', template.description || '');
          updateFormData('imageUrl', template.imageUrl || '');
          
          // Aplicar tamanhos
          if (sizes?.length > 0) {
            const templateSizes = sizes.map((size: any) => ({
              size: size.size,
              quantity: parseInt(size.quantity),
              weight: parseFloat(size.weight)
            }));
            updateFormData('sizes', templateSizes);
          }

          // Aplicar custos
          if (costs?.length > 0) {
            const costsByCategory = costs.reduce((acc: any, cost: any) => {
              if (!acc[cost.category]) acc[cost.category] = [];
              acc[cost.category].push({
                id: cost.id?.toString() || Math.random().toString(),
                description: cost.description,
                unitValue: parseFloat(cost.unitValue),
                quantity: parseFloat(cost.quantity),
                wastePercentage: parseFloat(cost.wastePercentage || 0),
                total: parseFloat(cost.total)
              });
              return acc;
            }, {});

            if (costsByCategory.creation) updateFormData('creationCosts', costsByCategory.creation);
            if (costsByCategory.supplies) updateFormData('supplies', costsByCategory.supplies);
            if (costsByCategory.labor) updateFormData('labor', costsByCategory.labor);
            if (costsByCategory.fixed) updateFormData('fixedCosts', costsByCategory.fixed);
          }

          // Aplicar valores finais
          updateFormData('fabricId', template.fabricId);
          updateFormData('fabricConsumption', parseFloat(template.fabricConsumption) || 0);
          updateFormData('wastePercentage', parseFloat(template.wastePercentage) || 20);
          updateFormData('profitMargin', parseFloat(template.profitMargin) || 50);
          updateFormData('totalCost', parseFloat(template.totalCost) || 0);
          updateFormData('finalPrice', parseFloat(template.finalPrice) || 0);

        } catch (error) {
          console.error('Erro ao carregar template:', error);
          // Fallback com dados básicos
          updateFormData('modelName', initialTemplate.modelName || '');
          updateFormData('reference', initialTemplate.reference || '');
          updateFormData('garmentType', initialTemplate.garmentType || '');
        }
      } else {
        // Template para cópia
        updateFormData('modelName', initialTemplate.modelName || '');
        updateFormData('reference', initialTemplate.reference || '');
        updateFormData('garmentType', initialTemplate.garmentType || '');
        updateFormData('description', initialTemplate.description || '');
        updateFormData('imageUrl', initialTemplate.imageUrl || '');
        updateFormData('pricingMode', initialTemplate.pricingMode || 'single');
      }
      
      setHasLoaded(true);
    };

    loadTemplate();
  }, [initialTemplate?.id, hasLoaded, resetForm, updateFormData]);

  // Reset hasLoaded quando modal fecha
  useEffect(() => {
    if (!initialTemplate) {
      setHasLoaded(false);
    }
  }, [initialTemplate]);

  return (
    <div className="max-w-4xl mx-auto">
      <DialogHeader className="pb-4">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Precificação ({currentStep + 1}/9)
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

export default function PricingModalSimple({ isOpen, onClose, initialTemplate }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <PricingProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <PricingModalContent onClose={onClose} initialTemplate={initialTemplate} />
        </DialogContent>
      </Dialog>
    </PricingProvider>
  );
}