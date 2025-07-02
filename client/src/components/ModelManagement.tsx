import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Shirt, 
  Calculator, 
  Eye,
  Edit,
  Trash2,
  FileText,
  Download,
  TrendingUp,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Model {
  id: number;
  name: string;
  description?: string;
  garmentType?: {
    id: number;
    name: string;
  };
  fabric?: {
    id: number;
    name: string;
    color: string;
  };
  pricingTemplates?: PricingTemplate[];
  createdAt: string;
}

interface PricingTemplate {
  id: number;
  modelName: string;
  reference: string;
  garmentType: string;
  totalCost: string;
  finalPrice: string;
  profitMargin: string;
  pricingMode: string;
  imageUrl?: string;
  createdAt: string;
}

export default function ModelManagement() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar modelos
  const { data: models = [], isLoading } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  // Query para buscar templates de precificação
  const { data: allTemplates = [] } = useQuery<PricingTemplate[]>({
    queryKey: ['/api/pricing-templates'],
  });

  // Mutation para deletar template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/pricing-templates/${id}`, { method: 'DELETE' })
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-templates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/models'] });
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

  const handleDeleteTemplate = (template: PricingTemplate) => {
    if (confirm(`Tem certeza que deseja excluir o template ${template.reference}?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  // Estatísticas
  const totalModels = models.length;
  const totalTemplates = allTemplates.length;
  const avgPrice = allTemplates.length > 0 
    ? allTemplates.reduce((sum, t) => sum + parseFloat(t.finalPrice), 0) / allTemplates.length 
    : 0;

  if (isLoading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modelos</h1>
            <p className="text-sm text-gray-500 mt-1">Catálogo de modelos e templates de precificação</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Modelos</h1>
          <p className="text-sm text-gray-500 mt-1">Catálogo de modelos e templates de precificação</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => window.location.href = '#pricing'}
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
              <Shirt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Modelos</p>
                <p className="text-2xl font-bold text-gray-900">{totalModels}</p>
              </div>
            </div>
          </CardContent>
        </Card>

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
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Templates de Precificação</TabsTrigger>
          <TabsTrigger value="models">Modelos Cadastrados</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          {allTemplates.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto max-w-sm">
                <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum template encontrado</h3>
                <p className="text-gray-500 mb-6">Crie templates de precificação que ficarão salvos aqui para reutilização.</p>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '#pricing'}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Criar Primeira Precificação
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.modelName}</CardTitle>
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
                    <div className="space-y-2">
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
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="px-2"
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
        </TabsContent>

        <TabsContent value="models">
          {models.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto max-w-sm">
                <Shirt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum modelo encontrado</h3>
                <p className="text-gray-500 mb-6">Os modelos criados aparecerão aqui para organização.</p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Modelo
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.map((model) => (
                <Card key={model.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    {model.description && (
                      <p className="text-sm text-gray-500">{model.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      {model.garmentType && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tipo:</span>
                          <Badge variant="secondary">{model.garmentType.name}</Badge>
                        </div>
                      )}
                      
                      {model.fabric && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tecido:</span>
                          <span className="font-medium text-sm">{model.fabric.name}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Templates:</span>
                        <Badge variant="outline">
                          {model.pricingTemplates?.length || 0} templates
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
