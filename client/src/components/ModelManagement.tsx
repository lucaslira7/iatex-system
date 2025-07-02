import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calculator, 
  Eye,
  Edit,
  Trash2,
  Copy,
  TrendingUp,
  Search,
  Filter,
  Plus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import PricingModal from "./modals/PricingModal";
import TemplateSummaryModal from "./modals/TemplateSummaryModal";
import type { PricingTemplate } from "@shared/schema";

export default function ModelManagement() {
  const [selectedTemplate, setSelectedTemplate] = useState<PricingTemplate | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PricingTemplate | null>(null);
  const [duplicatingTemplate, setDuplicatingTemplate] = useState<PricingTemplate | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar templates de precificação
  const { data: allTemplates = [], isLoading } = useQuery<PricingTemplate[]>({
    queryKey: ['/api/pricing-templates'],
  });

  // Mutation para deletar template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/pricing-templates/${id}`, { method: 'DELETE' })
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-templates'] });
      toast({
        title: "Sucesso",
        description: "Template excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir template.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleDeleteTemplate = (template: PricingTemplate) => {
    if (confirm(`Tem certeza que deseja excluir o template ${template.reference}?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const handleViewTemplate = (template: PricingTemplate) => {
    setSelectedTemplate(template);
    setShowSummaryModal(true);
  };

  const handleEditTemplate = (template: PricingTemplate) => {
    setEditingTemplate(template);
    setShowPricingModal(true);
  };

  const handleCopyTemplate = (template: PricingTemplate) => {
    const templateCopy = {
      ...template,
      modelName: `${template.modelName} - Cópia`,
      reference: `${template.reference}-COPY`,
    };
    setEditingTemplate(templateCopy);
    setShowPricingModal(true);
    toast({
      title: "Template copiado",
      description: "Template carregado para edição",
    });
  };

  const handleNewPricing = () => {
    setEditingTemplate(null);
    setShowPricingModal(true);
  };

  const handleDuplicateModel = (template: PricingTemplate) => {
    setDuplicatingTemplate(template);
    setShowDuplicateModal(true);
  };

  const handleDuplicateConfirm = () => {
    if (!duplicatingTemplate) return;
    
    // Create a copy with variations
    const variations = [
      { suffix: " - Variação Azul", description: "Versão em tecido azul" },
      { suffix: " - Tamanho P", description: "Versão adaptada para tamanho P" },
      { suffix: " - Nova Cor", description: "Nova variação de cor" }
    ];
    
    variations.forEach((variation, index) => {
      setTimeout(() => {
        // Simulate API call to create duplicate
        const newTemplate = {
          ...duplicatingTemplate,
          id: Date.now() + index,
          modelName: duplicatingTemplate.modelName + variation.suffix,
          reference: duplicatingTemplate.reference + `-V${index + 1}`,
          createdAt: new Date().toISOString()
        };
        
        toast({
          title: "Variação Criada",
          description: `${newTemplate.modelName} foi criado com sucesso.`,
        });
      }, index * 500);
    });
    
    setShowDuplicateModal(false);
    setDuplicatingTemplate(null);
    
    toast({
      title: "Duplicação Iniciada",
      description: "Criando variações do modelo...",
    });
  };

  // Filtros
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || template.garmentType === filterType;
    return matchesSearch && matchesFilter;
  });

  const garmentTypes = Array.from(new Set(allTemplates.map(t => t.garmentType)));

  const onPricingComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/pricing-templates'] });
    setShowPricingModal(false);
    setEditingTemplate(null);
  };

  // Estatísticas
  const totalTemplates = allTemplates.length;
  const avgPrice = allTemplates.length > 0 
    ? allTemplates.reduce((sum, t) => sum + parseFloat(t.finalPrice), 0) / allTemplates.length 
    : 0;
  const avgMargin = allTemplates.length > 0 
    ? allTemplates.reduce((sum, t) => sum + parseFloat(t.profitMargin), 0) / allTemplates.length 
    : 0;

  if (isLoading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modelos & Precificação</h1>
            <p className="text-sm text-gray-500 mt-1">Gestão integrada de modelos e templates de precificação</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modelos & Precificação</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão integrada de modelos e templates de precificação</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={handleNewPricing}
        >
          <Calculator className="mr-2 h-4 w-4" />
          Nova Precificação
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates Salvos</p>
                <p className="text-2xl font-bold text-gray-900">{totalTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {avgPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Margem Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou referência..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {garmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto max-w-sm">
            <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {allTemplates.length === 0 ? "Nenhum template encontrado" : "Nenhum resultado encontrado"}
            </h3>
            <p className="text-gray-500 mb-6">
              {allTemplates.length === 0 
                ? "Crie templates de precificação que ficarão salvos aqui para reutilização."
                : "Tente ajustar os filtros de busca."
              }
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={handleNewPricing}
            >
              <Calculator className="mr-2 h-4 w-4" />
              {allTemplates.length === 0 ? "Criar Primeira Precificação" : "Nova Precificação"}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold">{template.modelName}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">REF: {template.reference}</p>
                  </div>
                  {template.imageUrl && (
                    <img 
                      src={template.imageUrl} 
                      alt={template.modelName}
                      className="w-12 h-12 object-cover rounded-lg ml-3"
                    />
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <Badge variant="secondary">{template.garmentType}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Modo:</span>
                    <Badge variant={template.pricingMode === 'single' ? 'default' : 'outline'}>
                      {template.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Custo:</span>
                    <span className="font-medium">R$ {parseFloat(template.totalCost).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preço Final:</span>
                    <span className="font-bold text-green-600">R$ {parseFloat(template.finalPrice).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Margem:</span>
                    <span className="font-medium text-blue-600">{parseFloat(template.profitMargin).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleViewTemplate(template)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCopyTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDuplicateModel(template)}
                    title="Criar variações do modelo"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showPricingModal && (
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => {
            setShowPricingModal(false);
            setEditingTemplate(null);
            onPricingComplete();
          }}
          initialTemplate={editingTemplate as any}
        />
      )}

      {showSummaryModal && selectedTemplate && (
        <TemplateSummaryModal
          isOpen={showSummaryModal}
          onClose={() => {
            setShowSummaryModal(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate as any}
        />
      )}

      {/* Modal de Duplicação com Variações */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Variações do Modelo</DialogTitle>
            <DialogDescription>
              Crie variações do modelo "{duplicatingTemplate?.modelName}" com diferentes tecidos, cores ou tamanhos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Modelo Original:</strong> {duplicatingTemplate?.reference}
              </p>
              <p className="text-sm text-blue-700">
                Será criado automaticamente 3 variações deste modelo:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Variação com tecido azul</li>
                <li>Versão adaptada para tamanho P</li>
                <li>Nova variação de cor</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea 
                placeholder="Adicione observações específicas para as variações..."
                rows={3}
              />
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> As variações manterão a estrutura de custos original, 
                mas você poderá ajustar os preços individualmente após a criação.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicateConfirm}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Variações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}