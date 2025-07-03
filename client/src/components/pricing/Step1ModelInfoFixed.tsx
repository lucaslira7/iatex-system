import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Info, Scale, Package, Camera, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { usePricing } from '@/context/PricingContext';
import type { Fabric } from '@shared/schema';

export default function Step1ModelInfoFixed() {
  const { formData } = usePricing();
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Fetch fabrics para mostrar dados do tecido
  const { data: fabrics = [] } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });

  const selectedFabric = fabrics.find(f => f.id === formData.fabricId);

  // Função para capturar e baixar imagem da tela
  const handleDownloadScreenshot = async () => {
    setIsCapturing(true);
    try {
      const element = document.getElementById('model-info-content');
      if (element) {
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const link = document.createElement('a');
        link.download = `informacoes-modelo-${formData.reference || 'sem-ref'}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Erro ao capturar tela:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Cálculos
  const totalPieces = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  const totalWeight = formData.sizes.reduce((sum, size) => sum + (size.weight * size.quantity), 0);
  const totalWeightAverage = totalWeight / totalPieces;

  const calculateAverageFabricCost = () => {
    if (!selectedFabric) return 'R$ 0,00';
    
    const pricePerKg = parseFloat(selectedFabric.pricePerKg?.toString() || '0');
    const wasteMultiplier = 1 + (formData.wastePercentage / 100);
    
    const totalCost = formData.sizes.reduce((sum, size) => {
      const costPerPiece = (size.weight / 1000) * pricePerKg * wasteMultiplier;
      return sum + (costPerPiece * size.quantity);
    }, 0);
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(totalCost / totalPieces);
  };

  return (
    <div className="space-y-6">
      {/* Botão de Download */}
      <div className="flex justify-end">
        <Button 
          onClick={handleDownloadScreenshot}
          disabled={isCapturing}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isCapturing ? <Camera className="h-4 w-4 animate-pulse" /> : <Download className="h-4 w-4" />}
          {isCapturing ? 'Capturando...' : 'Baixar Imagem'}
        </Button>
      </div>

      <div id="model-info-content" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações do Modelo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nome:</Label>
                <p className="text-sm text-muted-foreground">{formData.modelName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Referência:</Label>
                <p className="text-sm text-muted-foreground">{formData.reference}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Tipo:</Label>
                <p className="text-sm text-muted-foreground">{formData.garmentType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total de Peças:</Label>
                <p className="text-sm text-muted-foreground">{totalPieces}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Peso Médio:</Label>
                <p className="text-sm text-muted-foreground">{totalWeightAverage.toFixed(0)}g</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tecido:</Label>
                <p className="text-sm text-muted-foreground">{selectedFabric?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhamento por tamanho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Detalhamento por Tamanho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.sizes.map((size) => {
                const pricePerKg = parseFloat(selectedFabric?.pricePerKg?.toString() || '0');
                const wasteMultiplier = 1 + (formData.wastePercentage / 100);
                const costPerPiece = (size.weight / 1000) * pricePerKg * wasteMultiplier;
                
                return (
                  <div key={size.size} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-sm font-medium">
                        {size.size}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Scale className="h-4 w-4" />
                        {size.weight}g
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {size.quantity} peça{size.quantity > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(costPerPiece)}
                      </div>
                      <div className="text-xs text-muted-foreground">custo do tecido</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Resumo completo de custos por tamanho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumo Completo de Custos por Tamanho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.sizes.map((size) => {
                // Custo do tecido
                const pricePerKg = parseFloat(selectedFabric?.pricePerKg?.toString() || '0');
                const wasteMultiplier = 1 + (formData.wastePercentage / 100);
                const fabricCost = (size.weight / 1000) * pricePerKg * wasteMultiplier;
                
                // Custos de criação (rateado)
                const totalCreationCosts = formData.creationCosts?.reduce((sum, cost) => 
                  sum + (cost.unitValue * cost.quantity), 0) || 0;
                const creationCostPerPiece = totalCreationCosts / totalPieces;
                
                // Custos de insumos por peça
                const supplyCostPerPiece = formData.supplies?.reduce((sum, supply) => 
                  sum + (supply.unitValue * supply.quantity * (1 + supply.wastePercentage / 100)), 0) || 0;
                
                // Custos de mão de obra por peça
                const laborCostPerPiece = formData.labor?.reduce((sum, labor) => 
                  sum + (labor.unitValue * labor.quantity), 0) || 0;
                
                // Custos fixos por peça
                const fixedCostPerPiece = formData.fixedCosts?.reduce((sum, fixed) => 
                  sum + (fixed.unitValue * fixed.quantity), 0) || 0;
                
                // Custo total por peça
                const totalCostPerPiece = fabricCost + creationCostPerPiece + supplyCostPerPiece + laborCostPerPiece + fixedCostPerPiece;
                
                return (
                  <div key={size.size} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="outline" className="text-lg font-bold">
                        {size.size}
                      </Badge>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(totalCostPerPiece)}
                        </div>
                        <div className="text-sm text-gray-500">custo total</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Tecido:</span>
                        <div className="font-medium text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(fabricCost)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Criação:</span>
                        <div className="font-medium text-blue-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(creationCostPerPiece)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Insumos:</span>
                        <div className="font-medium text-orange-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(supplyCostPerPiece)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Mão de obra:</span>
                        <div className="font-medium text-purple-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(laborCostPerPiece)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Fixos:</span>
                        <div className="font-medium text-gray-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(fixedCostPerPiece)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantidade:</span>
                        <div className="font-medium">{size.quantity} peças</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custos médios */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h4 className="font-bold text-blue-700 mb-3">Custos Médios por Peça</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tecido Médio:</span>
                  <div className="font-bold text-green-600">{calculateAverageFabricCost()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Criação Média:</span>
                  <div className="font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format((formData.creationCosts?.reduce((sum, cost) => 
                      sum + (cost.unitValue * cost.quantity), 0) || 0) / totalPieces)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Médio:</span>
                  <div className="font-bold text-red-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(
                      parseFloat(calculateAverageFabricCost().replace('R$', '').replace(',', '.')) +
                      ((formData.creationCosts?.reduce((sum, cost) => sum + (cost.unitValue * cost.quantity), 0) || 0) / totalPieces) +
                      (formData.supplies?.reduce((sum, supply) => sum + (supply.unitValue * supply.quantity * (1 + supply.wastePercentage / 100)), 0) || 0) +
                      (formData.labor?.reduce((sum, labor) => sum + (labor.unitValue * labor.quantity), 0) || 0) +
                      (formData.fixedCosts?.reduce((sum, fixed) => sum + (fixed.unitValue * fixed.quantity), 0) || 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}