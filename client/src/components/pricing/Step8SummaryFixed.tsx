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

  // Cálculos de custos
  const costs = {
    creationCosts: formData.creationCosts?.reduce((total: number, cost: any) => total + (cost.unitValue * cost.quantity), 0) || 0,
    suppliesCosts: formData.supplies?.reduce((total: number, cost: any) => {
      const withWaste = cost.unitValue * cost.quantity * (1 + cost.wastePercentage / 100);
      return total + withWaste;
    }, 0) || 0,
    laborCosts: formData.labor?.reduce((total: number, cost: any) => total + (cost.unitValue * cost.quantity), 0) || 0,
    fixedCosts: formData.fixedCosts?.reduce((total: number, cost: any) => total + (cost.unitValue * cost.quantity), 0) || 0,
    get totalCost() {
      return this.creationCosts + this.suppliesCosts + this.laborCosts + this.fixedCosts;
    },
    get finalPrice() {
      return formData.finalPrice;
    },
    get pricePerUnit() {
      const totalQuantity = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
      return totalQuantity > 0 ? this.finalPrice / totalQuantity : 0;
    }
  };

  // Calcular totais
  const totalQuantity = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  const totalWeight = formData.sizes.reduce((sum, size) => sum + (size.quantity * size.weight), 0);
  const consumptionPerPiece = totalWeight > 0 ? formData.fabricConsumption / totalQuantity : 0;

  useEffect(() => {
    updateFormData('totalCost', costs.totalCost);
  }, [costs.totalCost, updateFormData]);

  const handleFinalPriceSubmit = () => {
    const newFinalPrice = parseFloat(tempFinalPrice) || 0;
    if (newFinalPrice > 0 && costs.totalCost > 0) {
      const newProfitAmount = newFinalPrice - costs.totalCost;
      const newProfitMargin = (newProfitAmount / costs.totalCost) * 100;
      
      updateFormData('finalPrice', newFinalPrice);
      updateFormData('profitMargin', Math.max(0, newProfitMargin));
      updateFormData('fabricConsumption', consumptionPerPiece);
    }
    setEditingFinalPrice(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Preparar dados para o PDF profissional
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

      // Gerar PDF profissional de resumo
      const pdf = generateProfessionalPricingSummary(pdfData);
      
      // Salvar e baixar o PDF
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
      // Preparar dados para o PDF profissional de ficha técnica
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

      // Gerar PDF profissional de ficha técnica
      const pdf = generateProfessionalTechnicalSheet(pdfData);
      
      // Salvar e abrir o PDF da ficha técnica
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

      const requestBody = {
        template: templateData,
        sizes: sizesData,
        costs: costsData
      };

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

      {/* Detalhes dos Custos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Breakdown de Custos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Custos de Criação:</span>
              <span className="font-medium">R$ {costs.creationCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Insumos:</span>
              <span className="font-medium">R$ {costs.suppliesCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Mão de Obra:</span>
              <span className="font-medium">R$ {costs.laborCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Custos Fixos:</span>
              <span className="font-medium">R$ {costs.fixedCosts.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>R$ {costs.totalCost.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Modelo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              <strong>Total de Peças:</strong> {totalQuantity}
            </div>
            <div>
              <strong>Peso Total:</strong> {(totalWeight / 1000).toFixed(2)}kg
            </div>
            {selectedFabric && (
              <div>
                <strong>Tecido:</strong> {selectedFabric.name}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}