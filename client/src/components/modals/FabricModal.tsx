import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Scissors, Upload, Save, Trash2 } from "lucide-react";
import type { Fabric, Supplier } from "@shared/schema";

interface FabricModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabric: Fabric | null;
  isCreating: boolean;
  onDelete?: (fabric: Fabric) => void;
}

export default function FabricModal({ isOpen, onClose, fabric, isCreating, onDelete }: FabricModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    color: '',
    composition: '',
    gramWeight: '',
    usableWidth: '',
    pricePerMeter: '',
    currentStock: '',
    yieldPercentage: '85',
    supplierId: '',
    imageUrl: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch suppliers for dropdown
  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
    enabled: isOpen,
  });

  useEffect(() => {
    if (fabric) {
      setFormData({
        name: fabric.name || '',
        type: fabric.type || '',
        color: fabric.color || '',
        composition: fabric.composition || '',
        gramWeight: fabric.gramWeight?.toString() || '',
        usableWidth: fabric.usableWidth?.toString() || '',
        pricePerMeter: fabric.pricePerMeter?.toString() || '',
        currentStock: fabric.currentStock?.toString() || '',
        yieldPercentage: fabric.yieldPercentage?.toString() || '85',
        supplierId: fabric.supplierId?.toString() || '',
        imageUrl: fabric.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        type: '',
        color: '',
        composition: '',
        gramWeight: '',
        usableWidth: '',
        pricePerMeter: '',
        currentStock: '',
        yieldPercentage: '85',
        supplierId: '',
        imageUrl: '',
      });
    }
  }, [fabric, isOpen]);

  const saveFabricMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = isCreating ? "POST" : "PUT";
      const url = isCreating ? "/api/fabrics" : `/api/fabrics/${fabric?.id}`;
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fabrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Sucesso",
        description: `Tecido ${isCreating ? 'criado' : 'atualizado'} com sucesso`,
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você será redirecionado para fazer login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: `Falha ao ${isCreating ? 'criar' : 'atualizar'} tecido`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.type || !formData.color || !formData.gramWeight || 
        !formData.usableWidth || !formData.pricePerMeter || !formData.currentStock) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      name: formData.name,
      type: formData.type,
      color: formData.color,
      composition: formData.composition,
      gramWeight: parseInt(formData.gramWeight),
      usableWidth: parseInt(formData.usableWidth),
      pricePerMeter: parseFloat(formData.pricePerMeter),
      currentStock: parseFloat(formData.currentStock),
      yieldPercentage: parseInt(formData.yieldPercentage),
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
      imageUrl: formData.imageUrl,
      status: parseFloat(formData.currentStock) < 20 ? 'low_stock' : 'available',
    };

    saveFabricMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePricePerKg = () => {
    if (formData.pricePerMeter && formData.gramWeight && formData.usableWidth) {
      const pricePerMeter = parseFloat(formData.pricePerMeter);
      const gramWeight = parseInt(formData.gramWeight);
      const usableWidth = parseInt(formData.usableWidth);
      
      // Price per kg = (price per meter * 10000) / (gram weight * usable width)
      const pricePerKg = (pricePerMeter * 10000) / (gramWeight * usableWidth);
      return pricePerKg.toFixed(2);
    }
    return '0.00';
  };

  const calculateStockValue = () => {
    if (formData.currentStock && formData.pricePerMeter) {
      const stock = parseFloat(formData.currentStock);
      const price = parseFloat(formData.pricePerMeter);
      return (stock * price).toFixed(2);
    }
    return '0.00';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Novo Tecido' : 'Editar Tecido'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Section */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {formData.imageUrl ? (
                  <img 
                    src={formData.imageUrl} 
                    alt="Tecido"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Scissors className="h-16 w-16 text-blue-400" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <Button type="button" variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Fazer Upload
                </Button>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Suplex">Suplex</SelectItem>
                      <SelectItem value="Dry Fit">Dry Fit</SelectItem>
                      <SelectItem value="Cotton">Cotton</SelectItem>
                      <SelectItem value="Lycra">Lycra</SelectItem>
                      <SelectItem value="Malha">Malha</SelectItem>
                      <SelectItem value="Polyester">Polyester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Cor *</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gramWeight">Gramatura (g/m²) *</Label>
                  <Input
                    id="gramWeight"
                    type="number"
                    value={formData.gramWeight}
                    onChange={(e) => handleInputChange('gramWeight', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usableWidth">Largura Útil (cm) *</Label>
                  <Input
                    id="usableWidth"
                    type="number"
                    value={formData.usableWidth}
                    onChange={(e) => handleInputChange('usableWidth', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pricePerMeter">Preço por Metro (R$) *</Label>
                  <Input
                    id="pricePerMeter"
                    type="number"
                    step="0.01"
                    value={formData.pricePerMeter}
                    onChange={(e) => handleInputChange('pricePerMeter', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="supplierId">Fornecedor</Label>
                <Select value={formData.supplierId} onValueChange={(value) => handleInputChange('supplierId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier: Supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentStock">Estoque Atual (metros) *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    step="0.01"
                    value={formData.currentStock}
                    onChange={(e) => handleInputChange('currentStock', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="yieldPercentage">Rendimento (%)</Label>
                  <Input
                    id="yieldPercentage"
                    type="number"
                    value={formData.yieldPercentage}
                    onChange={(e) => handleInputChange('yieldPercentage', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="composition">Composição</Label>
                <Textarea
                  id="composition"
                  rows={3}
                  value={formData.composition}
                  onChange={(e) => handleInputChange('composition', e.target.value)}
                  placeholder="Ex: 92% Poliamida, 8% Elastano"
                />
              </div>

              {/* Calculated Fields */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-900">Campos Calculados</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Preço por kg:</span>
                    <span className="font-medium text-gray-900 ml-2">R$ {calculatePricePerKg()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor em estoque:</span>
                    <span className="font-medium text-gray-900 ml-2">R$ {calculateStockValue()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {!isCreating && fabric && onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => onDelete(fabric)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={saveFabricMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="mr-2 h-4 w-4" />
              {saveFabricMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
