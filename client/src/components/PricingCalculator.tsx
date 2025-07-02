import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Calculator, Eye, Copy, Download, Edit, Trash2, BarChart3 } from "lucide-react";
import { TemplateCardSkeleton } from "@/components/ui/loading-states";
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import AnalyticsDashboard from "./analytics/AnalyticsDashboard";
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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    template: PricingTemplate | null;
    isDeleting: boolean;
  }>({ isOpen: false, template: null, isDeleting: false });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar templates com cache otimizado
  const { data: templates = [], isLoading } = useQuery<PricingTemplate[]>({
    queryKey: ['/api/pricing-templates'],
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
  });

  // Mutation para deletar template
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await fetch(`/api/pricing-templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-templates'] });
      toast({
        title: "Template excluído",
        description: "Template de precificação excluído com sucesso.",
        variant: "success",
      });
      setDeleteConfirmation({ isOpen: false, template: null, isDeleting: false });
    },
    onError: (error) => {
      console.error('Erro ao deletar template:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template. Tente novamente.",
        variant: "destructive",
      });
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
    },
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
    setTemplateToEdit(template);
    setIsModalOpen(true);
    toast({
      title: "Template carregado",
      description: `Template "${template.modelName}" carregado para edição.`,
      variant: "default",
    });
  };

  const handleEditTemplate = (template: PricingTemplate) => {
    setTemplateToEdit(template);
    setIsModalOpen(true);
    toast({
      title: "Editando template",
      description: `Editando template "${template.modelName}".`,
      variant: "default",
    });
  };

  const handleDeleteTemplate = (template: PricingTemplate) => {
    setDeleteConfirmation({
      isOpen: true,
      template,
      isDeleting: false,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.template) {
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));
      deleteTemplateMutation.mutate(deleteConfirmation.template.id);
    }
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

  // Mostrar analytics se selecionado
  if (showAnalytics) {
    return (
      <>
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">Análise completa de performance</p>
            </div>
            <Button 
              onClick={() => setShowAnalytics(false)} 
              variant="outline"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Voltar para Templates
            </Button>
          </div>
          <AnalyticsDashboard />
        </main>
      </>
    );
  }

  return (
    <>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Precificação</h1>
            <p className="text-sm text-gray-500 mt-1">Calculadora de custos e preços avançada</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowAnalytics(true)} 
              variant="outline"
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Precificação
            </Button>
          </div>
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
                  
                  <div className="mt-4 grid grid-cols-4 gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewTemplate(template);
                      }}
                      title="Visualizar template"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                      title="Editar template"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyTemplate(template);
                      }}
                      title="Copiar template"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template);
                      }}
                      className="text-red-600 hover:bg-red-50 border-red-300"
                      title="Excluir template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowSummary(template);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Gerar PDFs
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

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, template: null, isDeleting: false })}
        onConfirm={confirmDelete}
        title="Excluir Template"
        description={`Tem certeza que deseja excluir o template "${deleteConfirmation.template?.modelName}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={deleteConfirmation.isDeleting}
      />
    </>
  );
}
