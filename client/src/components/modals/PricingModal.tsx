import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { PricingProvider, usePricing } from "@/context/PricingContext";
import Step1GarmentType from "@/components/pricing/Step1GarmentType";
import Step2Sizes from "@/components/pricing/Step2Sizes";
import Step3Fabric from "@/components/pricing/Step3Fabric";
import Step4CreationCosts from "@/components/pricing/Step4CreationCosts";
import Step5Supplies from "@/components/pricing/Step5Supplies";
import Step6Labor from "@/components/pricing/Step6Labor";
import Step7FixedCosts from "@/components/pricing/Step7FixedCosts";
import Step8Summary from "@/components/pricing/Step8Summary";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PricingModalContent({ onClose }: { onClose: () => void }) {
  const { currentStep, setCurrentStep, resetForm, formData } = usePricing();

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
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
      case 1:
        return formData.garmentType && formData.modelName && formData.reference;
      case 2:
        return formData.fabricId;
      case 3:
        return formData.sizes.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
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
        return <Step1GarmentType />;
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
                {formData.modelName && `${formData.modelName} - Etapa ${currentStep} de 8`}
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
              <div className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step.active 
                      ? 'bg-blue-600 text-white' 
                      : step.completed 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {step.completed ? '✓' : step.number}
                </div>
                <span className={`ml-2 text-xs font-medium whitespace-nowrap
                  ${step.active ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'}`}>
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
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <div className="space-x-3">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            )}
            {currentStep < 8 ? (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={!canGoNext()}
                className="bg-primary hover:bg-primary/90"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" className="bg-green-600 hover:bg-green-700 text-white">
                Finalizar Precificação
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <PricingProvider>
      <PricingModalContent onClose={onClose} />
    </PricingProvider>
  );
}