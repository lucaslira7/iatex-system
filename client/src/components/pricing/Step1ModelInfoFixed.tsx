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

        {/* Resumo de custos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumo de Custos do Tecido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium">Preço do Tecido:</Label>
                <p className="text-lg font-semibold">{selectedFabric ? 
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(parseFloat(selectedFabric.pricePerKg?.toString() || '0')) + '/kg' 
                  : 'Não selecionado'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Custo Médio do Tecido:</Label>
                <p className="text-lg font-semibold text-green-600">{calculateAverageFabricCost()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}