import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, X, Download, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PricingTemplate } from "@shared/schema";

interface TemplateViewModalProps {
  template: PricingTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (template: PricingTemplate) => void;
  onEdit: (template: PricingTemplate) => void;
  onShowSummary: (template: PricingTemplate) => void;
}

export default function TemplateViewModal({ 
  template, 
  isOpen, 
  onClose,
  onCopy,
  onEdit,
  onShowSummary
}: TemplateViewModalProps) {
  const { toast } = useToast();

  if (!template) return null;

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCopy = () => {
    onCopy(template);
    toast({
      title: "Template copiado",
      description: "Use este template como base para uma nova precificação",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Template</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com imagem e informações básicas */}
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold">{template.modelName}</h2>
                <Badge variant="secondary" className="text-sm">
                  {template.reference}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Tipo:</span>
                  <p className="font-medium">{template.garmentType}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Modalidade:</span>
                  <p className="font-medium">
                    {template.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Criado em:</span>
                  <p className="font-medium">{formatDate(template.createdAt.toString())}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Última atualização:</span>
                  <p className="font-medium">{formatDate(template.updatedAt.toString())}</p>
                </div>
              </div>

              {template.description && (
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Descrição:</span>
                  <p className="font-medium">{template.description}</p>
                </div>
              )}
            </div>

            {/* Imagem do modelo */}
            {template.imageUrl && (
              <div className="w-48 h-64 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={template.imageUrl} 
                  alt={template.modelName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Resumo financeiro */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Resumo Financeiro</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Custo Total</p>
                <p className="text-xl font-bold">{formatPrice(template.totalCost)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Preço Final</p>
                <p className="text-xl font-bold text-green-600">{formatPrice(template.finalPrice)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Margem de Lucro</p>
                <p className="text-xl font-bold text-blue-600">
                  {((parseFloat(template.finalPrice.toString()) - parseFloat(template.totalCost.toString())) / parseFloat(template.totalCost.toString()) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Lucro</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatPrice(parseFloat(template.finalPrice.toString()) - parseFloat(template.totalCost.toString()))}
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar Template
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onEdit(template)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar Template
            </Button>
            
            <Button 
              onClick={() => onShowSummary(template)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Ver Resumo Completo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}