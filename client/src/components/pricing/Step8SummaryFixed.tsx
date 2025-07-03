import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Save, Calculator, TrendingUp, Eye, X, FileText, ExternalLink } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';
import type { Fabric } from '@shared/schema';
import {
  generateProfessionalPricingSummary,
  generateProfessionalTechnicalSheet,
  type PDFData
} from '@/lib/pdfProfessional';

export default function Step8SummaryFixed() {
  const { formData, updateFormData } = usePricing();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingFinalPrice, setEditingFinalPrice] = useState(false);
  const [tempFinalPrice, setTempFinalPrice] = useState(formData.finalPrice.toString());

  // Fetch fabric details
  const { data: fabrics = [] } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });

  const selectedFabric = fabrics.find(f => f.id === formData.fabricId);

  // Cálculos de custos para múltiplas peças
  const totalPieces = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  
  const costs = {
    creationCosts: formData.creationCosts?.reduce((total: number, cost: any) => total + (cost.unitValue * cost.quantity), 0) || 0,
    suppliesCosts: formData.supplies?.reduce((total: number, cost: any) => {
      const withWaste = cost.unitValue * cost.quantity * (1 + (cost.wastePercentage || 0) / 100);
      if (formData.pricingMode === 'single') {
        return total + withWaste;
      } else {
        return total + (withWaste * totalPieces);
      }
    }, 0) || 0,
    
    // Mão de obra: multiplica pelo total de peças se for modo múltiplo
    laborCosts: formData.labor?.reduce((total: number, cost: any) => {
      const costPerPiece = cost.unitValue * cost.quantity;
      if (formData.pricingMode === 'single') {
        return total + costPerPiece;
      } else {
        return total + (costPerPiece * totalPieces);
      }
    }, 0) || 0,
    
    // Custos fixos: multiplica pelo total de peças se for modo múltiplo
    fixedCosts: formData.fixedCosts?.reduce((total: number, cost: any) => {
      const costPerPiece = cost.unitValue * cost.quantity;
      if (formData.pricingMode === 'single') {
        return total + costPerPiece;
      } else {
        return total + (costPerPiece * totalPieces);
      }
    }, 0) || 0,
    
    // Calcular custo do tecido total
    get fabricTotalCost() {
      if (!selectedFabric) return 0;
      
      // Custo por metro do tecido
      const fabricCostPerMeter = Number(selectedFabric.pricePerMeter || 0);
      
      // Consumo total considerando desperdício
      const totalConsumption = formData.fabricConsumption * (1 + formData.wastePercentage / 100);
      
      if (formData.pricingMode === 'single') {
        // Para peça única: consumo total × preço por metro
        return totalConsumption * fabricCostPerMeter;
      } else {
        // Para múltiplas peças: consumo por peça × quantidade × preço por metro
        const totalPieces = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
        return totalConsumption * totalPieces * fabricCostPerMeter;
      }
    },
    
    get totalCost() {
      if (formData.pricingMode === 'multiple') {
        // Para múltiplas peças: soma custos fixos (criação) + custos variáveis por peça
        const perPieceCosts = this.suppliesCosts + this.laborCosts + this.fixedCosts + this.fabricTotalCost;
        return this.creationCosts + perPieceCosts;
      } else {
        return this.creationCosts + this.suppliesCosts + this.laborCosts + this.fixedCosts + this.fabricTotalCost;
      }
    },
    
    get finalPrice() {
      return formData.finalPrice;
    },
    
    get pricePerUnit() {
      return totalPieces > 0 ? this.totalCost / totalPieces : 0;
    },
    
    get finalPricePerUnit() {
      return totalPieces > 0 ? this.finalPrice / totalPieces : 0;
    },
    
    // Custos divididos por categoria (valores totais e por peça)
    get creationCostPerUnit() {
      return totalPieces > 0 ? this.creationCosts / totalPieces : 0;
    },
    
    get suppliesCostPerUnit() {
      return totalPieces > 0 ? this.suppliesCosts / totalPieces : 0;
    },
    
    get laborCostPerUnit() {
      return totalPieces > 0 ? this.laborCosts / totalPieces : 0;
    },
    
    get fixedCostPerUnit() {
      return totalPieces > 0 ? this.fixedCosts / totalPieces : 0;
    },
    
    get fabricCostPerUnit() {
      return totalPieces > 0 ? this.fabricTotalCost / totalPieces : 0;
    }
  };

  // Calcular totais
  const totalWeight = formData.sizes.reduce((sum, size) => sum + (size.quantity * size.weight), 0);
  const consumptionPerPiece = totalWeight > 0 ? formData.fabricConsumption / totalPieces : 0;

  useEffect(() => {
    updateFormData('totalCost', costs.totalCost);
  }, [costs.totalCost, updateFormData]);

  const handleFinalPriceSubmit = () => {
    const newFinalPrice = parseFloat(tempFinalPrice) || 0;
    if (newFinalPrice > 0 && costs.totalCost > 0) {
      const newProfitAmount = newFinalPrice - costs.totalCost;
      const newProfitMargin = (newProfitAmount / newFinalPrice) * 100;
      
      updateFormData('finalPrice', newFinalPrice);
      updateFormData('profitMargin', Math.max(0, newProfitMargin));
      updateFormData('fabricConsumption', consumptionPerPiece);
    }
    setEditingFinalPrice(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pdfData: PDFData = {
        modelName: formData.modelName,
        reference: formData.reference,
        description: formData.description,
        garmentType: formData.garmentType,
        fabricName: selectedFabric?.name,
        fabricConsumption: formData.fabricConsumption,
        wastePercentage: formData.wastePercentage,
        profitMargin: formData.profitMargin,
        totalCost: costs.totalCost,
        finalPrice: costs.finalPrice,
        creationCosts: formData.creationCosts || [],
        supplies: formData.supplies || [],
        labor: formData.labor || [],
        fixedCosts: formData.fixedCosts || [],
        sizes: formData.sizes || []
      };

      const pdf = generateProfessionalPricingSummary(pdfData);
      
      const fileDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '');
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resumo_${formData.reference}_${fileDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTechnicalSheet = async () => {
    try {
      const pdfData: PDFData = {
        modelName: formData.modelName,
        reference: formData.reference,
        description: formData.description,
        garmentType: formData.garmentType,
        fabricName: selectedFabric?.name,
        fabricConsumption: formData.fabricConsumption,
        wastePercentage: formData.wastePercentage,
        profitMargin: formData.profitMargin,
        totalCost: costs.totalCost,
        finalPrice: costs.finalPrice,
        creationCosts: formData.creationCosts || [],
        supplies: formData.supplies || [],
        labor: formData.labor || [],
        fixedCosts: formData.fixedCosts || [],
        sizes: formData.sizes || []
      };

      const pdf = generateProfessionalTechnicalSheet(pdfData);
      
      const fileDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '');
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ficha_${formData.reference}_${fileDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Erro ao gerar ficha técnica:', error);
      alert('Erro ao gerar ficha técnica. Tente novamente.');
    }
  };

  const handleSaveTemplate = async () => {
    if (!formData.modelName || !formData.reference) {
      alert('Por favor, preencha o nome do modelo e referência antes de salvar.');
      return;
    }

    setIsSaving(true);
    try {
      const templateData = {
        modelName: formData.modelName,
        reference: formData.reference,
        garmentType: formData.garmentType,
        description: formData.description || '',
        imageUrl: formData.imageUrl || '',
        pricingMode: formData.pricingMode,
        fabricId: formData.fabricId,
        fabricConsumption: consumptionPerPiece.toString(),
        wastePercentage: formData.wastePercentage.toString(),
        profitMargin: formData.profitMargin.toString(),
        totalCost: costs.totalCost.toString(),
        finalPrice: formData.finalPrice.toString()
      };

      const sizesData = formData.sizes.map(size => ({
        size: size.size,
        quantity: size.quantity,
        weight: size.weight
      }));

      const costsData = [
        ...formData.creationCosts?.map(cost => ({
          category: 'creation',
          description: cost.description,
          unitValue: cost.unitValue,
          quantity: cost.quantity,
          wastePercentage: 0,
          total: cost.unitValue * cost.quantity
        })) || [],
        ...formData.supplies?.map(cost => ({
          category: 'supplies',
          description: cost.description,
          unitValue: cost.unitValue,
          quantity: cost.quantity,
          wastePercentage: cost.wastePercentage,
          total: cost.unitValue * cost.quantity * (1 + cost.wastePercentage / 100)
        })) || [],
        ...formData.labor?.map(cost => ({
          category: 'labor',
          description: cost.description,
          unitValue: cost.unitValue,
          quantity: cost.quantity,
          wastePercentage: 0,
          total: cost.unitValue * cost.quantity
        })) || [],
        ...formData.fixedCosts?.map(cost => ({
          category: 'fixed',
          description: cost.description,
          unitValue: cost.unitValue,
          quantity: cost.quantity,
          wastePercentage: 0,
          total: cost.unitValue * cost.quantity
        })) || []
      ];

      // Enviar dados no formato que a API espera
      const requestBody = {
        modelName: formData.modelName,
        reference: formData.reference,
        garmentType: formData.garmentType,
        description: formData.description || '',
        imageUrl: formData.imageUrl || '',
        pricingMode: formData.pricingMode,
        fabricId: formData.fabricId,
        fabricConsumption: consumptionPerPiece.toString(),
        wastePercentage: formData.wastePercentage.toString(),
        profitMargin: formData.profitMargin.toString(),
        totalCost: costs.totalCost.toString(),
        finalPrice: formData.finalPrice.toString(),
        sizes: sizesData,
        creationCosts: formData.creationCosts || [],
        supplies: formData.supplies || [],
        labor: formData.labor || [],
        fixedCosts: formData.fixedCosts || []
      };

      console.log('Enviando dados para salvar:', requestBody);

      const response = await fetch('/api/pricing-templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Modelo salvo com sucesso!');
      } else {
        console.error('Erro no servidor:', result);
        alert(`Erro ao salvar modelo: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      alert('Erro ao salvar modelo. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Resumo Final da Precificação</h2>
        <p className="text-gray-600">Confira todos os dados e valores calculados</p>
      </div>

      {/* Resumo Financeiro Principal */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-5 w-5" />
            Resultado Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">R$ {costs.totalCost.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Custo Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">R$ {costs.finalPrice.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Preço Final</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formData.profitMargin.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Margem de Lucro</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">R$ {costs.pricePerUnit.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Preço por Unidade</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Preço Final Editável */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calculator className="h-5 w-5" />
            Preço Final (editável)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {editingFinalPrice ? (
                <div className="flex items-center gap-3">
                  <Label htmlFor="finalPrice" className="text-sm font-medium">
                    Novo Preço:
                  </Label>
                  <Input
                    id="finalPrice"
                    type="number"
                    value={tempFinalPrice}
                    onChange={(e) => setTempFinalPrice(e.target.value)}
                    className="w-32"
                    step="0.01"
                    min="0"
                    autoFocus
                  />
                  <Button onClick={handleFinalPriceSubmit} size="sm">
                    Confirmar
                  </Button>
                  <Button 
                    onClick={() => setEditingFinalPrice(false)} 
                    variant="outline" 
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-green-600">
                    R$ {formData.finalPrice.toFixed(2)}
                  </div>
                  <Button 
                    onClick={() => setEditingFinalPrice(true)}
                    variant="outline" 
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              )}
            </div>
            <div className="text-right text-sm text-gray-600">
              <div className="font-medium">Margem: {formData.profitMargin.toFixed(1)}%</div>
              <div className="font-medium">Lucro: R$ {(formData.finalPrice - costs.totalCost).toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown de Custos para Peça Única */}
      {formData.pricingMode === 'single' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Breakdown Detalhado de Custos - Peça Única
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custos de Criação */}
              <div>
                <h4 className="font-semibold text-lg mb-3 text-blue-700">Custos de Criação</h4>
                <div className="space-y-2">
                  {formData.creationCosts?.map((cost, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm">{cost.description} ({cost.quantity}x):</span>
                      <span className="font-medium">R$ {(cost.unitValue * cost.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 bg-blue-100 p-2 rounded">
                    <div className="flex justify-between font-bold">
                      <span>Total Criação:</span>
                      <span>R$ {costs.creationCosts.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custos Variáveis */}
              <div>
                <h4 className="font-semibold text-lg mb-3 text-green-700">Custos Variáveis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm">Tecido ({formData.fabricConsumption}m):</span>
                    <span className="font-medium">R$ {costs.fabricTotalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm">Insumos/Aviamentos:</span>
                    <span className="font-medium">R$ {costs.suppliesCosts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm">Mão de Obra:</span>
                    <span className="font-medium">R$ {costs.laborCosts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm">Custos Fixos:</span>
                    <span className="font-medium">R$ {costs.fixedCosts.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 bg-green-100 p-2 rounded">
                    <div className="flex justify-between font-bold">
                      <span>Total Variáveis:</span>
                      <span>R$ {(costs.suppliesCosts + costs.laborCosts + costs.fixedCosts + costs.fabricTotalCost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-red-600">R$ {costs.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Custo Total</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">R$ {costs.finalPrice.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Preço Final</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">R$ {(costs.finalPrice - costs.totalCost).toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Lucro</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown de Custos Destrinchado */}
      {formData.pricingMode === 'multiple' && totalPieces > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumo Destrinchado - Múltiplas Peças ({totalPieces} peças)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Valores Totais */}
              <div>
                <h4 className="font-semibold text-lg mb-4 text-yellow-800">📊 Valores Totais</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Custos de Criação</span>
                    <span className="font-bold text-blue-600">R$ {costs.creationCosts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Tecido Total</span>
                    <span className="font-bold text-green-600">R$ {costs.fabricTotalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Aviamentos Total</span>
                    <span className="font-bold text-orange-600">R$ {costs.suppliesCosts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Mão de Obra Total</span>
                    <span className="font-bold text-purple-600">R$ {costs.laborCosts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Custos Fixos Total</span>
                    <span className="font-bold text-gray-600">R$ {costs.fixedCosts.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded border-2 border-red-200">
                    <span className="font-bold text-red-700">CUSTO TOTAL:</span>
                    <span className="font-bold text-xl text-red-700">R$ {costs.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-200">
                    <span className="font-bold text-green-700">PREÇO FINAL:</span>
                    <span className="font-bold text-xl text-green-700">R$ {costs.finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Valores Por Peça */}
              <div>
                <h4 className="font-semibold text-lg mb-4 text-yellow-800">🔢 Valores Por Peça</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Criação (rateio)</span>
                    <span className="font-bold text-blue-600">R$ {costs.creationCostPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Tecido por peça</span>
                    <span className="font-bold text-green-600">R$ {costs.fabricCostPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Aviamentos por peça</span>
                    <span className="font-bold text-orange-600">R$ {costs.suppliesCostPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Mão de obra por peça</span>
                    <span className="font-bold text-purple-600">R$ {costs.laborCostPerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Fixos por peça</span>
                    <span className="font-bold text-gray-600">R$ {costs.fixedCostPerUnit.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded border-2 border-red-200">
                    <span className="font-bold text-red-700">CUSTO POR PEÇA:</span>
                    <span className="font-bold text-xl text-red-700">R$ {costs.pricePerUnit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-200">
                    <span className="font-bold text-green-700">PREÇO POR PEÇA:</span>
                    <span className="font-bold text-xl text-green-700">R$ {costs.finalPricePerUnit.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown por Tamanho */}
            <div className="mt-6">
              <h4 className="font-semibold text-lg mb-4 text-yellow-800">👕 Preço por Tamanho</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {formData.sizes.map((size) => {
                  const fabricCostPerGram = selectedFabric ? Number(selectedFabric.pricePerMeter || 0) / Number(selectedFabric.gramWeight || 1) : 0;
                  const fabricCostWithWaste = (size.weight * fabricCostPerGram) * (1 + formData.wastePercentage / 100);
                  const sizeUnitCost = costs.pricePerUnit + (fabricCostWithWaste - costs.fabricCostPerUnit);
                  const sizeFinalPrice = costs.finalPricePerUnit + (fabricCostWithWaste - costs.fabricCostPerUnit);
                  
                  return (
                    <div key={size.size} className="p-3 bg-white rounded border text-center">
                      <div className="font-bold text-lg text-blue-600">{size.size}</div>
                      <div className="text-sm text-gray-600">{size.quantity} peças</div>
                      <div className="text-sm font-medium text-red-600">Custo: R$ {sizeUnitCost.toFixed(2)}</div>
                      <div className="text-sm font-bold text-green-600">Preço: R$ {sizeFinalPrice.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown de Custos Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown Detalhado de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Custos de Criação */}
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">Custos de Criação</h4>
              {formData.creationCosts?.map((cost, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{cost.description}:</span>
                  <span>R$ {(cost.unitValue * cost.quantity).toFixed(2)}</span>
                </div>
              )) || <div className="text-sm text-gray-500">Nenhum custo</div>}
              <div className="border-t pt-2 font-medium">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>R$ {costs.creationCosts.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Insumos */}
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">Insumos</h4>
              {formData.supplies?.map((cost, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{cost.description}:</span>
                  <span>R$ {(cost.unitValue * cost.quantity * (1 + cost.wastePercentage / 100)).toFixed(2)}</span>
                </div>
              )) || <div className="text-sm text-gray-500">Nenhum insumo</div>}
              <div className="border-t pt-2 font-medium">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>R$ {costs.suppliesCosts.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Mão de Obra */}
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">Mão de Obra</h4>
              {formData.labor?.map((cost, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{cost.description}:</span>
                  <span>R$ {(cost.unitValue * cost.quantity).toFixed(2)}</span>
                </div>
              )) || <div className="text-sm text-gray-500">Nenhum custo</div>}
              <div className="border-t pt-2 font-medium">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>R$ {costs.laborCosts.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Custos Fixos */}
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-700">Custos Fixos</h4>
              {formData.fixedCosts?.map((cost, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{cost.description}:</span>
                  <span>R$ {(cost.unitValue * cost.quantity).toFixed(2)}</span>
                </div>
              )) || <div className="text-sm text-gray-500">Nenhum custo</div>}
              <div className="border-t pt-2 font-medium">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>R$ {costs.fixedCosts.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Geral */}
          <Separator className="my-4" />
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              CUSTO TOTAL: R$ {costs.totalCost.toFixed(2)}
            </div>
            <div className="text-lg font-semibold text-green-600 mt-2">
              PREÇO FINAL: R$ {costs.finalPrice.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Gerando...' : 'Gerar Resumo PDF'}
        </Button>
        
        <Button 
          onClick={handleTechnicalSheet}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Gerar Ficha Técnica
        </Button>
        
        <Button 
          onClick={handleSaveTemplate}
          disabled={isSaving}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Template'}
        </Button>
      </div>

      {/* Informações do Modelo */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Nome:</strong> {formData.modelName}
            </div>
            <div>
              <strong>Referência:</strong> {formData.reference}
            </div>
            <div>
              <strong>Tipo:</strong> {formData.garmentType}
            </div>
            <div>
              <strong>Total de Peças:</strong> {totalPieces}
            </div>
            <div>
              <strong>Peso Total:</strong> {(totalWeight / 1000).toFixed(2)}kg
            </div>
            {selectedFabric && (
              <div>
                <strong>Tecido:</strong> {selectedFabric.name}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}