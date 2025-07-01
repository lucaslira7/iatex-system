import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Shirt } from "lucide-react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GARMENT_TYPES = [
  { id: 'shirt', name: 'Camiseta', icon: 'fas fa-tshirt' },
  { id: 'top', name: 'Top', icon: 'fas fa-vest' },
  { id: 'pants', name: 'Calça', icon: 'fas fa-male' },
  { id: 'shorts', name: 'Shorts', icon: 'fas fa-male' },
];

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    garmentType: '',
    name: '',
    reference: '',
    notes: '',
    imageUrl: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGarmentTypeSelect = (type: string) => {
    handleInputChange('garmentType', type);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      garmentType: '',
      name: '',
      reference: '',
      notes: '',
      imageUrl: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const steps = [
    { number: 1, title: 'Tipo da Peça', active: currentStep === 1 },
    { number: 2, title: 'Modelo', active: currentStep === 2 },
    { number: 3, title: 'Tecido', active: currentStep === 3 },
    { number: 4, title: 'Custos', active: currentStep === 4 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calculadora de Precificação</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div className={`step-indicator ${step.active ? 'step-indicator-active' : 'step-indicator-inactive'}`}>
                  {step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${step.active ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo da Peça
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {GARMENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleGarmentTypeSelect(type.id)}
                      className={`price-step-card ${
                        formData.garmentType === type.id 
                          ? 'price-step-card-active' 
                          : 'price-step-card-inactive'
                      }`}
                    >
                      <Shirt className="mx-auto h-8 w-8 mb-2 text-current" />
                      <div className="text-sm font-medium">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nome do Modelo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Camiseta Fitness Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="reference">Referência</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    placeholder="Ex: CF-001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Informações adicionais sobre o modelo..."
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Modelo
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600">Clique para fazer upload ou arraste a imagem aqui</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG até 5MB</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Etapa 2: Dados do Modelo</h3>
              <p className="text-gray-500">Conteúdo da etapa 2 será implementado aqui.</p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Etapa 3: Escolha do Tecido</h3>
              <p className="text-gray-500">Conteúdo da etapa 3 será implementado aqui.</p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Etapa 4: Custos e Simulação</h3>
              <p className="text-gray-500">Conteúdo da etapa 4 será implementado aqui.</p>
            </div>
          )}
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
            {currentStep < 4 ? (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={currentStep === 1 && !formData.garmentType}
                className="bg-primary hover:bg-primary/90"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" className="bg-primary hover:bg-primary/90">
                Finalizar Precificação
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
