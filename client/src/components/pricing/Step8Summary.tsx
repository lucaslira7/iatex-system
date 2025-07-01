import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Save, Calculator, TrendingUp, Eye } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';
import type { Fabric } from '@shared/schema';

export default function Step8Summary() {
  const { formData, updateFormData } = usePricing();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Fetch fabric details
  const { data: fabrics = [] } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });

  const selectedFabric = fabrics.find(f => f.id === formData.fabricId);

  const calculateCosts = () => {
    // Para o resumo, calculamos custo por peça (não total de produção)
    const configuredSizes = formData.sizes.filter(s => s.weight > 0);
    
    // Custo médio do tecido por peça
    let fabricCostPerPiece = 0;
    if (selectedFabric && configuredSizes.length > 0) {
      const averageWeight = configuredSizes.reduce((sum, size) => sum + size.weight, 0) / configuredSizes.length;
      const pricePerKg = parseFloat(selectedFabric.pricePerKg?.toString() || '0');
      const wasteMultiplier = 1 + (formData.wastePercentage / 100);
      fabricCostPerPiece = (averageWeight / 1000) * pricePerKg * wasteMultiplier;
    }

    // Other costs (por peça)
    const creationCosts = formData.creationCosts.reduce((sum, item) => sum + item.total, 0);
    const suppliesCosts = formData.supplies.reduce((sum, item) => sum + item.total, 0);
    const laborCosts = formData.labor.reduce((sum, item) => sum + item.total, 0);
    const fixedCosts = formData.fixedCosts.reduce((sum, item) => sum + item.total, 0);

    const totalCostPerPiece = fabricCostPerPiece + creationCosts + suppliesCosts + laborCosts + fixedCosts;
    
    const profitAmount = totalCostPerPiece * (formData.profitMargin / 100);
    const finalPricePerPiece = totalCostPerPiece + profitAmount;

    return {
      fabricCost: fabricCostPerPiece,
      creationCosts,
      suppliesCosts,
      laborCosts,
      fixedCosts,
      totalCost: totalCostPerPiece,
      costPerUnit: totalCostPerPiece,
      profitAmount,
      finalPrice: finalPricePerPiece,
      pricePerUnit: finalPricePerPiece,
      totalQuantity: configuredSizes.length
    };
  };

  const costs = calculateCosts();

  const handleProfitMarginChange = (margin: number) => {
    updateFormData('profitMargin', Math.max(0, Math.min(100, margin)));
  };

  const handlePreviewPDF = () => {
    setShowPDFPreview(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // Here you would implement actual export functionality
      console.log('Exporting pricing data...', formData);
    }, 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save process
    setTimeout(() => {
      setIsSaving(false);
      // Here you would implement actual save functionality
      console.log('Saving pricing data...', formData);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Resumo da Precificação</h3>
        <p className="text-sm text-gray-500">
          Revise todos os dados e ajuste a margem de lucro conforme necessário.
        </p>
      </div>

      {/* Resumo do Produto */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-blue-600" />
            Dados do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900">{formData.modelName}</h5>
              <p className="text-sm text-gray-600">Ref: {formData.reference}</p>
              <p className="text-sm text-gray-600">Tipo: {formData.garmentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Total de peças: <span className="font-semibold">{costs.totalQuantity}</span>
              </p>
              <p className="text-sm text-gray-600">
                Tamanhos: {formData.sizes.map(s => `${s.size}(${s.quantity})`).join(', ')}
              </p>
              {selectedFabric && (
                <p className="text-sm text-gray-600">
                  Tecido: {selectedFabric.name} - {formData.fabricConsumption}m/peça
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown de Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tecido</span>
              <span className="font-medium">R$ {costs.fabricCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Custos de Criação</span>
              <span className="font-medium">R$ {costs.creationCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Insumos</span>
              <span className="font-medium">R$ {costs.suppliesCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mão de Obra</span>
              <span className="font-medium">R$ {costs.laborCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Custos Fixos</span>
              <span className="font-medium">R$ {costs.fixedCosts.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Custo Total</span>
              <span>R$ {costs.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Custo por Peça</span>
              <span>R$ {costs.costPerUnit.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Margem */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Margem de Lucro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
              <Input
                id="profitMargin"
                type="number"
                min="0"
                max="100"
                value={formData.profitMargin}
                onChange={(e) => handleProfitMarginChange(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProfitMarginChange(20)}
                className="text-xs"
              >
                20%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProfitMarginChange(30)}
                className="text-xs"
              >
                30%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProfitMarginChange(50)}
                className="text-xs"
              >
                50%
              </Button>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-green-700">Lucro</span>
                <span className="font-semibold text-green-900">R$ {costs.profitAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-green-900">Preço Final</span>
                <span className="text-green-900">R$ {costs.finalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Preço por Peça</span>
                <span className="font-semibold">R$ {costs.pricePerUnit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={handlePreviewPDF}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          Visualizar PDF
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar PDF'}
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Finalizar Precificação'}
        </Button>
      </div>
    </div>
  );
}