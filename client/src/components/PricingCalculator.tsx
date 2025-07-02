import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Calculator, Eye, Copy, Download, Edit } from "lucide-react";
import PricingModal from "./modals/PricingModal";
import TemplateViewModal from "./modals/TemplateViewModal";
import TemplateSummaryModal from "./modals/TemplateSummaryModal";
import type { PricingTemplate } from "@shared/schema";

export default function PricingCalculator() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PricingTemplate | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<PricingTemplate | null>(null);

  // Buscar templates de precificação salvos
  const { data: templates = [], isLoading } = useQuery<PricingTemplate[]>({
    queryKey: ['/api/pricing-templates'],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  const handleViewTemplate = (template: PricingTemplate) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const handleCopyTemplate = (template: PricingTemplate) => {
    // Copiar template como base para nova precificação
    setTemplateToEdit(template);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template: PricingTemplate) => {
    // Editar template existente
    setTemplateToEdit(template);
    setIsModalOpen(true);
  };

  const handleShowSummary = (template: PricingTemplate) => {
    setSelectedTemplate(template);
    setIsSummaryModalOpen(true);
  };

  const closeModals = () => {
    setIsViewModalOpen(false);
    setIsSummaryModalOpen(false);
    setSelectedTemplate(null);
  };

  const closePricingModal = () => {
    setIsModalOpen(false);
    setTemplateToEdit(null);
  };

  return (
    <>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Precificação</h1>
            <p className="text-sm text-gray-500 mt-1">Calculadora de custos e preços</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nova Precificação
          </Button>
        </div>

        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando templates...</p>
          </Card>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto max-w-sm">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Calculator className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma precificação encontrada</h3>
              <p className="text-gray-500 mb-6">Comece criando sua primeira precificação de produto.</p>
              <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Precificação
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewTemplate(template)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{template.modelName}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {template.reference}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Imagem do modelo se existir */}
                  {template.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={template.imageUrl} 
                        alt={template.modelName}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium">{template.garmentType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Modalidade:</span>
                      <span className="font-medium">
                        {template.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Custo Total:</span>
                      <span className="font-medium">{formatPrice(template.totalCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Preço Final:</span>
                      <span className="font-bold text-green-600">{formatPrice(template.finalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Criado em:</span>
                      <span className="text-gray-600">{formatDate(template.createdAt.toString())}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTemplate(template);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyTemplate(template);
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowSummary(template);
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Resumo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <PricingModal
        isOpen={isModalOpen}
        onClose={closePricingModal}
        initialTemplate={templateToEdit}
      />

      <TemplateViewModal
        template={selectedTemplate}
        isOpen={isViewModalOpen}
        onClose={closeModals}
        onCopy={handleCopyTemplate}
        onEdit={handleEditTemplate}
        onShowSummary={handleShowSummary}
      />

      <TemplateSummaryModal
        template={selectedTemplate}
        isOpen={isSummaryModalOpen}
        onClose={closeModals}
      />
    </>
  );
}
