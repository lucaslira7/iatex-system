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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  createModernHeader,
  createSection,
  createInfoCard,
  createFinancialSummary,
  createSimpleTable,
  createFooter,
  addImageToPDF
} from '@/lib/pdfUtils';

export default function Step8SummaryFixed() {
  const { formData, updateFormData } = usePricing();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [savedQuotationId, setSavedQuotationId] = useState<number | null>(null);
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
    finalPrice: formData.finalPrice,
    get pricePerUnit() {
      const totalQuantity = formData.sizes.reduce((total, size) => total + size.quantity, 0);
      return totalQuantity > 0 ? this.finalPrice / totalQuantity : 0;
    }
  };

  // Cálculo do consumo de tecido
  const totalWeight = formData.sizes.reduce((total, size) => total + (size.quantity * size.weight), 0);
  const fabricConsumption = selectedFabric ? (totalWeight / selectedFabric.gramWeight) * (1 + formData.wastePercentage / 100) : 0;
  const totalQuantity = formData.sizes.reduce((total, size) => total + size.quantity, 0);
  const consumptionPerPiece = totalQuantity > 0 ? fabricConsumption / totalQuantity : 0;

  // Atualizar valores automaticamente
  useEffect(() => {
    updateFormData('totalCost', costs.totalCost);
    updateFormData('fabricConsumption', consumptionPerPiece);
  }, [costs.totalCost, consumptionPerPiece]);

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

  const handleProfitMarginChange = (margin: number) => {
    updateFormData('profitMargin', Math.max(0, Math.min(100, margin)));
  };

  const handlePreviewPDF = () => {
    setShowPDFPreview(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      
      // Criar cabeçalho profissional
      let yPos = createModernHeader(pdf, 'RESUMO DE PRECIFICAÇÃO', formData.reference);
      
      // Seção de Informações do Produto
      yPos = createSection(pdf, 'INFORMAÇÕES DO PRODUTO', yPos);
      
      const productInfo = [
        { label: 'Nome do Modelo', value: formData.modelName },
        { label: 'Referência', value: formData.reference, highlight: true },
        { label: 'Tipo de Peça', value: formData.garmentType },
        { label: 'Modalidade', value: formData.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças' },
        { label: 'Descrição', value: formData.description || 'N/A' }
      ];
      
      yPos = createInfoCard(pdf, 'Dados do Produto', productInfo, yPos);
      
      // Seção de Tamanhos e Quantidades
      yPos = createSection(pdf, 'COMPOSIÇÃO E QUANTIDADES', yPos);
      
      const sizesHeaders = ['Tamanho', 'Quantidade', 'Peso Unit. (g)', 'Peso Total (g)'];
      const sizesRows = formData.sizes.map(size => [
        size.size,
        size.quantity.toString(),
        size.weight.toString(),
        (size.quantity * size.weight).toString()
      ]);
      
      // Adicionar linha de totais
      sizesRows.push([
        'TOTAL',
        totalQuantity.toString(),
        '-',
        totalWeight.toString()
      ]);
      
      yPos = createSimpleTable(pdf, sizesHeaders, sizesRows, yPos);
      
      // Informações do Tecido se disponível
      if (selectedFabric) {
        yPos = createSection(pdf, 'INFORMAÇÕES DO TECIDO', yPos);
        
        const fabricInfo = [
          { label: 'Nome', value: selectedFabric.name },
          { label: 'Tipo', value: selectedFabric.type },
          { label: 'Composição', value: selectedFabric.composition || 'N/A' },
          { label: 'Largura', value: `${selectedFabric.usableWidth}cm` },
          { label: 'Peso', value: `${selectedFabric.gramWeight}g/m²` },
          { label: 'Consumo', value: `${consumptionPerPiece.toFixed(2)}m/peça` },
          { label: 'Desperdício', value: `${formData.wastePercentage}%` }
        ];
        
        yPos = createInfoCard(pdf, 'Especificações do Tecido', fabricInfo, yPos);
      }
      
      // Resumo Financeiro Final
      yPos = createSection(pdf, 'RESUMO FINANCEIRO', yPos);
      
      const financialData = {
        totalCost: costs.totalCost,
        finalPrice: costs.finalPrice,
        profit: costs.finalPrice - costs.totalCost,
        marginPercent: ((costs.finalPrice - costs.totalCost) / costs.totalCost) * 100,
        pricePerUnit: costs.pricePerUnit
      };
      
      yPos = createFinancialSummary(pdf, financialData, yPos);
      
      // Rodapé profissional
      createFooter(
        pdf,
        'Este resumo de precificação foi gerado automaticamente pelo sistema IA.TEX',
        `Template salvo permanentemente - Ref: ${formData.reference}`
      );
      
      // Salvar e baixar o PDF
      const fileDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
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
    } finally {
      setIsExporting(false);
    }
  };

  const handleTechnicalSheet = async () => {
    try {
      const pdf = new jsPDF();
      
      // Criar cabeçalho profissional para ficha técnica
      let yPos = createModernHeader(pdf, 'FICHA TÉCNICA DO PRODUTO', formData.reference);
      
      // Adicionar imagem do modelo se existir
      if (formData.imageUrl) {
        try {
          yPos = await addImageToPDF(pdf, formData.imageUrl, 120, yPos, 60, 80);
        } catch (error) {
          console.error('Erro ao adicionar imagem:', error);
          yPos += 20;
        }
      }
      
      // Especificações técnicas
      yPos = createSection(pdf, 'ESPECIFICAÇÕES TÉCNICAS', yPos);
      
      const techSpecs = [
        { label: 'Modelo', value: formData.modelName },
        { label: 'Referência', value: formData.reference, highlight: true },
        { label: 'Tipo', value: formData.garmentType },
        { label: 'Total de Peças', value: totalQuantity.toString() },
        { label: 'Peso Total', value: `${(totalWeight / 1000).toFixed(2)}kg` }
      ];
      
      if (selectedFabric) {
        techSpecs.push(
          { label: 'Tecido', value: selectedFabric.name },
          { label: 'Consumo Total', value: `${fabricConsumption.toFixed(2)}m` },
          { label: 'Consumo/Peça', value: `${consumptionPerPiece.toFixed(2)}m` }
        );
      }
      
      yPos = createInfoCard(pdf, 'Informações Técnicas', techSpecs, yPos);
      
      // Tabela de tamanhos
      yPos = createSection(pdf, 'GRADE DE TAMANHOS', yPos);
      
      const sizesHeaders = ['Tamanho', 'Quantidade', 'Peso Unitário', 'Peso Total'];
      const sizesRows = formData.sizes.map(size => [
        size.size,
        `${size.quantity} pç`,
        `${size.weight}g`,
        `${(size.quantity * size.weight)}g`
      ]);
      
      yPos = createSimpleTable(pdf, sizesHeaders, sizesRows, yPos);
      
      // Rodapé
      createFooter(
        pdf,
        'Esta ficha técnica foi gerada automaticamente pelo sistema IA.TEX',
        `Ficha técnica do produto - Ref: ${formData.reference}`
      );
      
      // Salvar e abrir
      const fileDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
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
      console.error('Erro ao gerar PDF:', error);
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
        description: formData.description,
        imageUrl: formData.imageUrl,
        pricingMode: formData.pricingMode,
        fabricId: formData.fabricId,
        fabricConsumption: consumptionPerPiece,
        wastePercentage: formData.wastePercentage,
        profitMargin: formData.profitMargin,
        totalCost: costs.totalCost,
        finalPrice: formData.finalPrice
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

      const response = await fetch('/api/pricing-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: templateData,
          sizes: sizesData,
          costs: costsData
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Template salvo com sucesso!');
      } else {
        throw new Error('Erro ao salvar template');
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template. Tente novamente.');
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
              <p className="text-sm text-gray-600">Custo Total</p>
              <p className="text-xl font-bold text-gray-900">
                R$ {costs.totalCost.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Preço Final</p>
              <p className="text-xl font-bold text-green-600">
                R$ {costs.finalPrice.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Lucro</p>
              <p className="text-xl font-bold text-blue-600">
                R$ {(costs.finalPrice - costs.totalCost).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Margem</p>
              <p className="text-xl font-bold text-purple-600">
                {costs.totalCost > 0 ? (((costs.finalPrice - costs.totalCost) / costs.totalCost) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isExporting ? (
            <>Gerando...</>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Resumo PDF
            </>
          )}
        </Button>

        <Button 
          onClick={handleTechnicalSheet}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <FileText className="mr-2 h-4 w-4" />
          Ficha Técnica
        </Button>

        <Button 
          onClick={handleSaveTemplate}
          disabled={isSaving}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {isSaving ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Template
            </>
          )}
        </Button>

        <Button 
          onClick={handlePreviewPDF}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </Button>
      </div>

      {/* Informações do Produto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Nome do Modelo</Label>
              <p className="text-lg">{formData.modelName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Referência</Label>
              <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                {formData.reference}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Tipo de Peça</Label>
              <p className="text-lg">{formData.garmentType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Modalidade</Label>
              <p className="text-lg">
                {formData.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.sizes.map((size, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{size.size}:</span>
                  <span>{size.quantity} peças ({size.weight}g)</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold">
                <span>Total:</span>
                <span>{totalQuantity} peças ({totalWeight}g)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedFabric && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Tecido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Nome</Label>
                <p className="font-medium">{selectedFabric.name}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Tipo</Label>
                <p className="font-medium">{selectedFabric.type}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Composição</Label>
                <p className="font-medium">{selectedFabric.composition || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Consumo Total</Label>
                <p className="font-medium">{fabricConsumption.toFixed(2)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}