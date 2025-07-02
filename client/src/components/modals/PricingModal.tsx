import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { useEffect } from "react";
import { PricingProvider, usePricing } from "@/context/PricingContext";
import Step0PricingMode from "@/components/pricing/Step0PricingMode";
import Step1GarmentType from "@/components/pricing/Step1GarmentType";
import Step2Sizes from "@/components/pricing/Step2Sizes";
import Step3Fabric from "@/components/pricing/Step3Fabric";
import Step4CreationCosts from "@/components/pricing/Step4CreationCosts";
import Step5Supplies from "@/components/pricing/Step5Supplies";
import Step6Labor from "@/components/pricing/Step6Labor";
import Step7FixedCosts from "@/components/pricing/Step7FixedCosts";
import Step8Summary from "@/components/pricing/Step8Summary";
import type { PricingTemplate } from "@shared/schema";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: PricingTemplate | null;
}

function PricingModalContent({ onClose, initialTemplate }: { onClose: () => void; initialTemplate?: PricingTemplate | null }) {
  const { currentStep, setCurrentStep, resetForm, formData, updateFormData, loadTemplateData } = usePricing();

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Carregar dados do template inicial
  useEffect(() => {
    if (initialTemplate) {
      // Carregar todos os dados do template usando a nova função
      loadTemplateData(initialTemplate.id).catch(error => {
        console.error('Erro ao carregar dados do template:', error);
        // Fallback para dados básicos apenas
        updateFormData('modelName', initialTemplate.modelName);
        updateFormData('reference', initialTemplate.reference);
        updateFormData('garmentType', initialTemplate.garmentType);
        updateFormData('description', initialTemplate.description || '');
        updateFormData('imageUrl', initialTemplate.imageUrl || '');
        updateFormData('pricingMode', initialTemplate.pricingMode);
      });
    }
  }, [initialTemplate, loadTemplateData, updateFormData]);

  // Atalhos de teclado para navegação
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC para fechar modal
      if (event.key === 'Escape') {
        handleClose();
        event.preventDefault();
      }
      
      // Ctrl+F3 para próxima etapa, Ctrl+F1 para etapa anterior
      if (event.ctrlKey && event.key === 'F3' && currentStep < 8 && canGoNext()) {
        handleNext();
        event.preventDefault();
      }
      
      if (event.ctrlKey && event.key === 'F1' && currentStep > 0) {
        handlePrevious();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 0, title: 'Modalidade', active: currentStep === 0, completed: currentStep > 0 },
    { number: 1, title: 'Tipo da Peça', active: currentStep === 1, completed: currentStep > 1 },
    { number: 2, title: 'Tecido', active: currentStep === 2, completed: currentStep > 2 },
    { number: 3, title: 'Tamanhos', active: currentStep === 3, completed: currentStep > 3 },
    { number: 4, title: 'Criação', active: currentStep === 4, completed: currentStep > 4 },
    { number: 5, title: 'Insumos', active: currentStep === 5, completed: currentStep > 5 },
    { number: 6, title: 'Mão de Obra', active: currentStep === 6, completed: currentStep > 6 },
    { number: 7, title: 'Custos Fixos', active: currentStep === 7, completed: currentStep > 7 },
    { number: 8, title: 'Resumo', active: currentStep === 8, completed: false },
  ];

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return formData.pricingMode;
      case 1:
        return formData.garmentType && formData.modelName && formData.reference;
      case 2:
        return formData.fabricId;
      case 3:
        return formData.sizes.some(s => s.weight > 0);
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Step0PricingMode />;
      case 1:
        return <Step1GarmentType />;
      case 2:
        return <Step3Fabric />;
      case 3:
        return <Step2Sizes />;
      case 4:
        return <Step4CreationCosts />;
      case 5:
        return <Step5Supplies />;
      case 6:
        return <Step6Labor />;
      case 7:
        return <Step7FixedCosts />;
      case 8:
        return <Step8Summary />;
      default:
        return <Step0PricingMode />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Calculadora de Precificação</DialogTitle>
              <DialogDescription>
                {formData.modelName ? `${formData.modelName} - Etapa ${currentStep} de 8` : `Etapa ${currentStep} de 8`}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center min-w-0">
              <div 
                className="flex items-center cursor-pointer hover:opacity-80"
                onClick={() => setCurrentStep(step.number)}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${step.active 
                      ? 'bg-blue-600 text-white' 
                      : step.completed 
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  {step.completed ? '✓' : step.number}
                </div>
                <span className={`ml-2 text-xs font-medium whitespace-nowrap transition-colors
                  ${step.active ? 'text-blue-600' : step.completed ? 'text-green-600 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-px mx-2 min-w-8
                  ${step.completed ? 'bg-green-300' : 'bg-gray-300'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white min-h-96">
          {renderStepContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} title="Atalho: ESC">
            Cancelar
            <span className="ml-2 text-xs text-gray-500">ESC</span>
          </Button>
          <div className="space-x-3">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious} title="Atalho: Ctrl+F1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
                <span className="ml-2 text-xs text-gray-500">Ctrl+F1</span>
              </Button>
            )}
            {currentStep < 8 && (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={!canGoNext()}
                className="bg-primary hover:bg-primary/90"
                title="Atalho: Ctrl+F3"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
                <span className="ml-2 text-xs text-white/80">Ctrl+F3</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PricingModal({ isOpen, onClose, initialTemplate }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <PricingProvider>
      <PricingModalContent onClose={onClose} initialTemplate={initialTemplate} />
    </PricingProvider>
  );
}