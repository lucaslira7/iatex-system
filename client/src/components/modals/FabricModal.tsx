import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Scissors, Upload, Save, Trash2, Calculator } from "lucide-react";
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
    composition: '',
    gramWeight: '',
    usableWidth: '',
    pricePerKg: '',
    currentStock: '',
    supplierId: '',
    imageUrl: '',
  });

  const [calculatedValues, setCalculatedValues] = useState({
    yieldEstimate: 0,
    pricePerMeter: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch suppliers for dropdown
  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
    enabled: isOpen,
  });

  // Função para calcular rendimento e preço por metro automaticamente
  const calculateValues = (gramWeight: number, usableWidth: number, pricePerKg: number) => {
    if (gramWeight > 0 && usableWidth > 0) {
      // Fórmula correta baseada no exemplo:
      // 150g/m² e 165cm deve resultar em 4,04 m/kg
      // Rendimento = (1000 / gramatura) / (largura em metros)
      // Para 150g/m² e 165cm: (1000/150) / 1.65 = 6.67 / 1.65 = 4.04 m/kg
      const widthInMeters = usableWidth / 100;
      const yieldEstimate = (1000 / gramWeight) / widthInMeters;
      
      // Preço por metro = preço por kg / rendimento
      const pricePerMeter = pricePerKg > 0 ? pricePerKg / yieldEstimate : 0;
      
      setCalculatedValues({
        yieldEstimate: parseFloat(yieldEstimate.toFixed(2)),
        pricePerMeter: parseFloat(pricePerMeter.toFixed(3))
      });
    } else {
      setCalculatedValues({ yieldEstimate: 0, pricePerMeter: 0 });
    }
  };

  // Recalcular quando gramatura, largura ou preço por kg mudarem
  useEffect(() => {
    const gramWeight = parseFloat(formData.gramWeight);
    const usableWidth = parseFloat(formData.usableWidth);
    const pricePerKg = parseFloat(formData.pricePerKg);
    
    calculateValues(gramWeight, usableWidth, pricePerKg);
  }, [formData.gramWeight, formData.usableWidth, formData.pricePerKg]);

  useEffect(() => {
    if (fabric) {
      setFormData({
        name: fabric.name || '',
        type: fabric.type || '',
        composition: fabric.composition || '',
        gramWeight: fabric.gramWeight?.toString() || '',
        usableWidth: fabric.usableWidth?.toString() || '',
        pricePerKg: fabric.pricePerKg?.toString() || '',
        currentStock: fabric.currentStock?.toString() || '',
        supplierId: fabric.supplierId?.toString() || '',
        imageUrl: fabric.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        type: '',
        composition: '',
        gramWeight: '',
        usableWidth: '',
        pricePerKg: '',
        currentStock: '',
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
      console.error("Fabric save error:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
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
      // Show more detailed error message
      let errorMessage = error.message || `Falha ao ${isCreating ? 'criar' : 'atualizar'} tecido`;
      if (error.message && error.message.includes('Validation error')) {
        errorMessage = "Erro de validação. Verifique os dados preenchidos.";
      }
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.type || !formData.gramWeight || 
        !formData.usableWidth || !formData.pricePerKg || !formData.currentStock) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    // Clean and prepare data
    const submitData = {
      name: formData.name.trim(),
      type: formData.type.trim(),
      composition: formData.composition || null,
      gramWeight: parseInt(formData.gramWeight),
      usableWidth: parseInt(formData.usableWidth),
      pricePerKg: formData.pricePerKg,
      pricePerMeter: calculatedValues.pricePerMeter.toString(),
      currentStock: formData.currentStock,
      yieldEstimate: calculatedValues.yieldEstimate.toString(),
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
      imageUrl: formData.imageUrl && formData.imageUrl.trim() ? formData.imageUrl.trim().substring(0, 500) : null,
    };

    // Debug log
    console.log("Submitting fabric data:", submitData);

    saveFabricMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll just set a placeholder. In a real app, you'd upload to a service
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, imageUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-blue-600" />
            {isCreating ? 'Novo Tecido' : 'Editar Tecido'}
          </DialogTitle>
          <DialogDescription>
            {isCreating ? 'Cadastre um novo tecido no sistema' : 'Edite as informações do tecido'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Sport Dry"
                className="w-full"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                placeholder="Ex: Poliamida"
                className="w-full"
              />
            </div>
          </div>

          {/* Composição */}
          <div className="space-y-2">
            <Label htmlFor="composition">Composição</Label>
            <Textarea
              id="composition"
              value={formData.composition}
              onChange={(e) => handleInputChange('composition', e.target.value)}
              placeholder="Ex: 91% Poliamida, 9% Elastano"
              className="w-full"
              rows={2}
            />
          </div>

          {/* Fornecedor */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Select value={formData.supplierId} onValueChange={(value) => handleInputChange('supplierId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {(suppliers as Supplier[]).map((supplier: Supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gramatura */}
            <div className="space-y-2">
              <Label htmlFor="gramWeight">Gramatura (g/m²) *</Label>
              <Input
                id="gramWeight"
                type="number"
                value={formData.gramWeight}
                onChange={(e) => handleInputChange('gramWeight', e.target.value)}
                placeholder="150"
                className="w-full"
              />
            </div>

            {/* Largura Útil */}
            <div className="space-y-2">
              <Label htmlFor="usableWidth">Largura útil (cm) *</Label>
              <Input
                id="usableWidth"
                type="number"
                value={formData.usableWidth}
                onChange={(e) => handleInputChange('usableWidth', e.target.value)}
                placeholder="165"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preço por Kg */}
            <div className="space-y-2">
              <Label htmlFor="pricePerKg">Preço por kg *</Label>
              <Input
                id="pricePerKg"
                type="number"
                step="0.01"
                value={formData.pricePerKg}
                onChange={(e) => handleInputChange('pricePerKg', e.target.value)}
                placeholder="70"
                className="w-full"
              />
            </div>

            {/* Estoque Atual */}
            <div className="space-y-2">
              <Label htmlFor="currentStock">Estoque atual (kg) *</Label>
              <Input
                id="currentStock"
                type="number"
                step="0.1"
                value={formData.currentStock}
                onChange={(e) => handleInputChange('currentStock', e.target.value)}
                placeholder="100"
                className="w-full"
              />
            </div>
          </div>

          {/* Upload de Imagem */}
          <div className="space-y-2">
            <Label htmlFor="image">Imagem</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {formData.imageUrl ? 'Clique para alterar a imagem' : 'Escolher arquivo Nenhum arquivo escolhido'}
                </span>
              </label>
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Valores Calculados */}
          {(calculatedValues.yieldEstimate > 0 || calculatedValues.pricePerMeter > 0) && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Cálculos Automáticos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Rendimento estimado (m/kg):</span>
                  <div className="font-medium text-gray-900">{calculatedValues.yieldEstimate}</div>
                </div>
                <div>
                  <span className="text-gray-600">Preço por metro (calculado):</span>
                  <div className="font-medium text-gray-900">R$ {calculatedValues.pricePerMeter.toFixed(3)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {!isCreating && fabric && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(fabric)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saveFabricMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saveFabricMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}