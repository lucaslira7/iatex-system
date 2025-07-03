import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Save, Calculator, TrendingUp, Eye, X, FileText, ExternalLink, Info } from 'lucide-react';
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

  // Cálculos baseados na etapa 9 - mesma lógica detalhada
  const totalPieces = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  
  // Função para calcular custos detalhados por tamanho (mesma da etapa 9)
  const calculateCostsBySize = () => {
    const pricePerKg = parseFloat(selectedFabric?.pricePerKg?.toString() || '0');
    const wasteMultiplier = 1 + (formData.wastePercentage / 100);
    
    // Custos fixos (rateados)
    const totalCreationCosts = formData.creationCosts?.reduce((sum, cost) => 
      sum + (cost.unitValue * cost.quantity), 0) || 0;
    const creationCostPerPiece = totalCreationCosts / totalPieces;
    
    // Custos por peça
    const supplyCostPerPiece = formData.supplies?.reduce((sum, supply) => 
      sum + (supply.unitValue * supply.quantity * (1 + supply.wastePercentage / 100)), 0) || 0;
    const laborCostPerPiece = formData.labor?.reduce((sum, labor) => 
      sum + (labor.unitValue * labor.quantity), 0) || 0;
    const fixedCostPerPiece = formData.fixedCosts?.reduce((sum, fixed) => 
      sum + (fixed.unitValue * fixed.quantity), 0) || 0;
    
    return formData.sizes.map(size => {
      const fabricCost = (size.weight / 1000) * pricePerKg * wasteMultiplier;
      const totalCostPerPiece = fabricCost + creationCostPerPiece + supplyCostPerPiece + laborCostPerPiece + fixedCostPerPiece;
      
      return {
        size: size.size,
        quantity: size.quantity,
        weight: size.weight,
        fabricCost,
        creationCost: creationCostPerPiece,
        supplyCost: supplyCostPerPiece,
        laborCost: laborCostPerPiece,
        fixedCost: fixedCostPerPiece,
        totalCostPerPiece,
        totalCostForSize: totalCostPerPiece * size.quantity
      };
    });
  };
  
  const costsBySize = calculateCostsBySize();
  
  // Calcular totais gerais baseados nos custos detalhados
  const costs = {
    creationCosts: formData.creationCosts?.reduce((sum, cost) => sum + (cost.unitValue * cost.quantity), 0) || 0,
    suppliesCosts: (formData.supplies?.reduce((sum, supply) => sum + (supply.unitValue * supply.quantity * (1 + supply.wastePercentage / 100)), 0) || 0) * totalPieces,
    laborCosts: (formData.labor?.reduce((sum, labor) => sum + (labor.unitValue * labor.quantity), 0) || 0) * totalPieces,
    fixedCosts: (formData.fixedCosts?.reduce((sum, fixed) => sum + (fixed.unitValue * fixed.quantity), 0) || 0) * totalPieces,
    fabricTotalCost: costsBySize.reduce((sum, item) => sum + item.totalCostForSize, 0),
    
    get totalCost() {
      return this.creationCosts + this.suppliesCosts + this.laborCosts + this.fixedCosts + this.fabricTotalCost;
    },
    
    get averageCostPerPiece() {
      return totalPieces > 0 ? this.totalCost / totalPieces : 0;
    },
    
    get finalPrice() {
      return formData.finalPrice;
    },
    
    get averagePricePerPiece() {
      return totalPieces > 0 ? this.finalPrice / totalPieces : 0;
    }
  };

  // Calcular totais
  const totalWeight = formData.sizes.reduce((sum, size) => sum + (size.quantity * size.weight), 0);
  const consumptionPerPiece = totalWeight > 0 ? formData.fabricConsumption / totalPieces : 0;
  
  // Calcular preço sugerido com margem padrão
  const suggestedPrice = costs.totalCost * 1.4; // 40% de margem
  const suggestedMargin = 40;

  useEffect(() => {
    updateFormData('totalCost', costs.totalCost);
    
    // Se finalPrice ainda for 0, usar o preço sugerido
    if (formData.finalPrice === 0 && costs.totalCost > 0) {
      updateFormData('finalPrice', suggestedPrice);
      updateFormData('profitMargin', suggestedMargin);
      setTempFinalPrice(suggestedPrice.toFixed(2));
    }
  }, [costs.totalCost, updateFormData, formData.finalPrice, suggestedPrice]);

  const handleFinalPriceSubmit = () => {
    const newFinalPrice = parseFloat(tempFinalPrice) || 0;
    if (newFinalPrice > 0 && costs.totalCost > 0) {
      const newProfitAmount = newFinalPrice - costs.totalCost;
      const newProfitMargin = (newProfitAmount / costs.totalCost) * 100; // Margem sobre o custo (markup)
      
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
              <div className="text-2xl font-bold text-orange-600">R$ {costs.averageCostPerPiece.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Preço por Unidade</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Preço Sugerido e Final */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preço Sugerido */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Preço Sugerido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                R$ {suggestedPrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Margem de {suggestedMargin}% aplicada
              </div>
              <Button 
                onClick={() => {
                  updateFormData('finalPrice', suggestedPrice);
                  updateFormData('profitMargin', suggestedMargin);
                  setTempFinalPrice(suggestedPrice.toFixed(2));
                }}
                variant="outline" 
                size="sm"
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                Usar Preço Sugerido
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custos Detalhados por Tamanho - Baseado na Etapa 9 */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Calculator className="h-5 w-5" />
              Custos Detalhados por Tamanho (da Etapa 9)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costsBySize.map((item, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{item.size}</span>
                      <span className="text-sm text-gray-600">({item.quantity} peças)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.totalCostPerPiece)}
                      </div>
                      <div className="text-sm text-gray-500">por peça</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tecido:</span>
                      <span className="font-medium text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.fabricCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Criação:</span>
                      <span className="font-medium text-blue-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.creationCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insumos:</span>
                      <span className="font-medium text-orange-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.supplyCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mão de obra:</span>
                      <span className="font-medium text-purple-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.laborCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fixos:</span>
                      <span className="font-medium text-gray-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.fixedCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso:</span>
                      <span className="font-medium">{item.weight}g</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-2 border-t border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Custo Total ({item.quantity} peças):</span>
                      <span className="font-bold text-red-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.totalCostForSize)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Resumo médio */}
            <div className="mt-6 p-4 bg-orange-100 rounded-lg border-2 border-orange-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-orange-700">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(costs.averageCostPerPiece)}
                  </div>
                  <div className="text-sm text-gray-600">Custo Médio/Peça</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-700">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(costs.averagePricePerPiece)}
                  </div>
                  <div className="text-sm text-gray-600">Preço Médio/Peça</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-700">{totalPieces}</div>
                  <div className="text-sm text-gray-600">Total de Peças</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-700">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(costs.averagePricePerPiece - costs.averageCostPerPiece)}
                  </div>
                  <div className="text-sm text-gray-600">Lucro Médio/Peça</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preço Final Editável */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calculator className="h-5 w-5" />
              Preço Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {editingFinalPrice ? (
                <div className="space-y-3">
                  <Input
                    type="number"
                    value={tempFinalPrice}
                    onChange={(e) => setTempFinalPrice(e.target.value)}
                    className="text-center text-xl font-bold"
                    step="0.01"
                    min="0"
                    autoFocus
                    placeholder="Digite o preço"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleFinalPriceSubmit} size="sm">
                      Confirmar
                    </Button>
                    <Button 
                      onClick={() => setEditingFinalPrice(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {formData.finalPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Markup: {formData.profitMargin.toFixed(1)}% | Lucro: R$ {(formData.finalPrice - costs.totalCost).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Margem sobre vendas: {costs.totalCost > 0 ? (((formData.finalPrice - costs.totalCost) / formData.finalPrice) * 100).toFixed(1) : 0}%
                  </div>
                  <Button 
                    onClick={() => {
                      setEditingFinalPrice(true);
                      setTempFinalPrice(formData.finalPrice.toFixed(2));
                    }}
                    variant="outline" 
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Editar Preço
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <span className="font-bold text-blue-600">R$ {(costs.creationCosts / totalPieces).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Tecido por peça</span>
                    <span className="font-bold text-green-600">R$ {(costs.fabricTotalCost / totalPieces).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Aviamentos por peça</span>
                    <span className="font-bold text-orange-600">R$ {(costs.suppliesCosts / totalPieces).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Mão de obra por peça</span>
                    <span className="font-bold text-purple-600">R$ {(costs.laborCosts / totalPieces).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm font-medium">Fixos por peça</span>
                    <span className="font-bold text-gray-600">R$ {(costs.fixedCosts / totalPieces).toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded border-2 border-red-200">
                    <span className="font-bold text-red-700">CUSTO POR PEÇA:</span>
                    <span className="font-bold text-xl text-red-700">R$ {costs.averageCostPerPiece.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-200">
                    <span className="font-bold text-green-700">PREÇO POR PEÇA:</span>
                    <span className="font-bold text-xl text-green-700">R$ {costs.averagePricePerPiece.toFixed(2)}</span>
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
                  const sizeUnitCost = costs.averageCostPerPiece + (fabricCostWithWaste - (costs.fabricTotalCost / totalPieces));
                  const sizeFinalPrice = costs.averagePricePerPiece + (fabricCostWithWaste - (costs.fabricTotalCost / totalPieces));
                  
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

      {/* Card Explicativo dos Cálculos */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 text-lg">
            <Info className="h-5 w-5" />
            Como Funcionam os Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">Markup (Margem sobre Custo):</h4>
              <p className="text-gray-700">
                <strong>Fórmula:</strong> (Preço de Venda - Custo) ÷ Custo × 100%
              </p>
              <p className="text-gray-600">
                Se o custo é R$ 10 e o preço R$ 14, o markup é 40%
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">Margem de Lucro (sobre Vendas):</h4>
              <p className="text-gray-700">
                <strong>Fórmula:</strong> (Preço de Venda - Custo) ÷ Preço de Venda × 100%
              </p>
              <p className="text-gray-600">
                Se o custo é R$ 10 e o preço R$ 14, a margem é 28,6%
              </p>
            </div>
          </div>
          <div className="p-3 bg-white rounded border-l-4 border-amber-400">
            <p className="text-sm text-gray-700">
              <strong>💡 Dica:</strong> Digite qualquer preço final desejado no campo "Preço Final" e o sistema 
              calculará automaticamente tanto o <strong>markup</strong> quanto a <strong>margem de lucro</strong> para você.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}