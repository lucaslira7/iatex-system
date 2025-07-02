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

      // BREAKDOWN DETALHADO DE CUSTOS
      yPos = createSection(pdf, 'BREAKDOWN DE CUSTOS', yPos);
      
      // Custos de Criação
      if (formData.creationCosts && formData.creationCosts.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Custos de Criação:', 20, yPos);
        yPos += 10;
        
        const creationHeaders = ['Descrição', 'Valor Unit.', 'Qtd', 'Total'];
        const creationRows = formData.creationCosts.map(cost => [
          cost.description,
          `R$ ${cost.unitValue.toFixed(2)}`,
          cost.quantity.toString(),
          `R$ ${(cost.unitValue * cost.quantity).toFixed(2)}`
        ]);
        creationRows.push([
          'SUBTOTAL CRIAÇÃO',
          '',
          '',
          `R$ ${costs.creationCosts.toFixed(2)}`
        ]);
        
        yPos = createSimpleTable(pdf, creationHeaders, creationRows, yPos);
      }

      // Custos de Insumos
      if (formData.supplies && formData.supplies.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Insumos e Materiais:', 20, yPos);
        yPos += 10;
        
        const suppliesHeaders = ['Descrição', 'Valor Unit.', 'Qtd', 'Desperdício', 'Total'];
        const suppliesRows = formData.supplies.map(cost => [
          cost.description,
          `R$ ${cost.unitValue.toFixed(2)}`,
          cost.quantity.toString(),
          `${cost.wastePercentage}%`,
          `R$ ${(cost.unitValue * cost.quantity * (1 + cost.wastePercentage / 100)).toFixed(2)}`
        ]);
        suppliesRows.push([
          'SUBTOTAL INSUMOS',
          '',
          '',
          '',
          `R$ ${costs.suppliesCosts.toFixed(2)}`
        ]);
        
        yPos = createSimpleTable(pdf, suppliesHeaders, suppliesRows, yPos);
      }

      // Custos de Mão de Obra
      if (formData.labor && formData.labor.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Mão de Obra:', 20, yPos);
        yPos += 10;
        
        const laborHeaders = ['Descrição', 'Valor Unit.', 'Qtd', 'Total'];
        const laborRows = formData.labor.map(cost => [
          cost.description,
          `R$ ${cost.unitValue.toFixed(2)}`,
          cost.quantity.toString(),
          `R$ ${(cost.unitValue * cost.quantity).toFixed(2)}`
        ]);
        laborRows.push([
          'SUBTOTAL MÃO DE OBRA',
          '',
          '',
          `R$ ${costs.laborCosts.toFixed(2)}`
        ]);
        
        yPos = createSimpleTable(pdf, laborHeaders, laborRows, yPos);
      }

      // Custos Fixos
      if (formData.fixedCosts && formData.fixedCosts.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Custos Fixos:', 20, yPos);
        yPos += 10;
        
        const fixedHeaders = ['Descrição', 'Valor Unit.', 'Qtd', 'Total'];
        const fixedRows = formData.fixedCosts.map(cost => [
          cost.description,
          `R$ ${cost.unitValue.toFixed(2)}`,
          cost.quantity.toString(),
          `R$ ${(cost.unitValue * cost.quantity).toFixed(2)}`
        ]);
        fixedRows.push([
          'SUBTOTAL CUSTOS FIXOS',
          '',
          '',
          `R$ ${costs.fixedCosts.toFixed(2)}`
        ]);
        
        yPos = createSimpleTable(pdf, fixedHeaders, fixedRows, yPos);
      }
      
      // Resumo Financeiro Final
      yPos = createSection(pdf, 'RESUMO FINANCEIRO FINAL', yPos);
      
      const financialData = {
        totalCost: costs.totalCost,
        finalPrice: costs.finalPrice,
        profit: costs.finalPrice - costs.totalCost,
        marginPercent: costs.totalCost > 0 ? ((costs.finalPrice - costs.totalCost) / costs.totalCost) * 100 : 0,
        pricePerUnit: costs.pricePerUnit
      };
      
      yPos = createFinancialSummary(pdf, financialData, yPos);

      // Preço Final Editável em destaque
      yPos += 10;
      pdf.setFillColor(72, 187, 120);
      pdf.rect(20, yPos - 5, 170, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PREÇO FINAL (EDITÁVEL)', 105, yPos + 5, { align: 'center' });
      pdf.setFontSize(20);
      pdf.text(`R$ ${costs.finalPrice.toFixed(2)}`, 105, yPos + 15, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      yPos += 30;
      
      // Rodapé profissional
      createFooter(
        pdf,
        'Este resumo de precificação foi gerado automaticamente pelo sistema IA.TEX',
        `Template salvo permanentemente - Ref: ${formData.reference} - ${new Date().toLocaleDateString('pt-BR')}`
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
      
      // Especificações técnicas básicas
      yPos = createSection(pdf, 'ESPECIFICAÇÕES TÉCNICAS', yPos);
      
      const techSpecs = [
        { label: 'Modelo', value: formData.modelName },
        { label: 'Referência', value: formData.reference, highlight: true },
        { label: 'Tipo de Peça', value: formData.garmentType },
        { label: 'Modalidade', value: formData.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças' },
        { label: 'Total de Peças', value: totalQuantity.toString() },
        { label: 'Peso Total', value: `${(totalWeight / 1000).toFixed(2)}kg` },
        { label: 'Descrição', value: formData.description || 'N/A' }
      ];
      
      yPos = createInfoCard(pdf, 'Informações Básicas', techSpecs, yPos);

      // Informações do Tecido - Expandidas
      if (selectedFabric) {
        yPos = createSection(pdf, 'ESPECIFICAÇÕES DO TECIDO', yPos);
        
        const fabricSpecs = [
          { label: 'Nome do Tecido', value: selectedFabric.name },
          { label: 'Tipo', value: selectedFabric.type },
          { label: 'Composição', value: selectedFabric.composition || 'N/A' },
          { label: 'Largura Útil', value: `${selectedFabric.usableWidth}cm` },
          { label: 'Gramatura', value: `${selectedFabric.gramWeight}g/m²` },
          { label: 'Cor', value: 'N/A' },
          { label: 'Fornecedor', value: 'N/A' },
          { label: 'Consumo por Peça', value: `${consumptionPerPiece.toFixed(3)}m` },
          { label: 'Consumo Total', value: `${fabricConsumption.toFixed(3)}m` },
          { label: 'Percentual Desperdício', value: `${formData.wastePercentage}%` },
          { label: 'Preço por KG', value: selectedFabric.pricePerKg ? `R$ ${parseFloat(selectedFabric.pricePerKg.toString()).toFixed(2)}` : 'N/A' }
        ];
        
        yPos = createInfoCard(pdf, 'Detalhes do Tecido', fabricSpecs, yPos);
      }
      
      // Tabela de tamanhos detalhada
      yPos = createSection(pdf, 'GRADE COMPLETA DE TAMANHOS', yPos);
      
      const sizesHeaders = ['Tamanho', 'Quantidade', 'Peso Unit. (g)', 'Peso Total (g)', 'Custo Tecido/Peça'];
      const sizesRows = formData.sizes.map(size => {
        const fabricCostPerPiece = selectedFabric ? 
          (size.weight / 1000) * parseFloat(selectedFabric.pricePerKg?.toString() || '0') * (1 + formData.wastePercentage / 100) : 0;
        
        return [
          size.size,
          `${size.quantity} pç`,
          `${size.weight}g`,
          `${(size.quantity * size.weight)}g`,
          `R$ ${fabricCostPerPiece.toFixed(2)}`
        ];
      });
      
      // Adicionar totais
      const totalFabricCost = formData.sizes.reduce((total, size) => {
        if (selectedFabric) {
          const costPerPiece = (size.weight / 1000) * parseFloat(selectedFabric.pricePerKg?.toString() || '0') * (1 + formData.wastePercentage / 100);
          return total + (costPerPiece * size.quantity);
        }
        return total;
      }, 0);

      sizesRows.push([
        'TOTAL',
        `${totalQuantity} pç`,
        '-',
        `${totalWeight}g`,
        `R$ ${totalFabricCost.toFixed(2)}`
      ]);
      
      yPos = createSimpleTable(pdf, sizesHeaders, sizesRows, yPos);

      // Informações de Produção
      yPos = createSection(pdf, 'INFORMAÇÕES DE PRODUÇÃO', yPos);
      
      const productionInfo = [
        { label: 'Custo Total de Produção', value: `R$ ${costs.totalCost.toFixed(2)}` },
        { label: 'Preço de Venda', value: `R$ ${costs.finalPrice.toFixed(2)}` },
        { label: 'Margem de Lucro', value: `${formData.profitMargin.toFixed(1)}%` },
        { label: 'Lucro por Peça', value: `R$ ${((costs.finalPrice - costs.totalCost) / totalQuantity).toFixed(2)}` },
        { label: 'Custo por Peça', value: `R$ ${(costs.totalCost / totalQuantity).toFixed(2)}` },
        { label: 'Preço por Peça', value: `R$ ${costs.pricePerUnit.toFixed(2)}` }
      ];
      
      yPos = createInfoCard(pdf, 'Análise Financeira', productionInfo, yPos);

      // Observações Técnicas
      yPos = createSection(pdf, 'OBSERVAÇÕES E INSTRUÇÕES', yPos);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const observations = [
        '• Verificar a gramatura do tecido antes do corte',
        '• Considerar encolhimento pós-lavagem na modelagem',
        '• Manter margem de segurança para desperdício no corte',
        '• Conferir medidas conforme tabela de tamanhos',
        '• Seguir orientações específicas do fornecedor do tecido',
        '• Documentar qualquer alteração durante a produção'
      ];
      
      observations.forEach((obs, index) => {
        pdf.text(obs, 20, yPos + (index * 8));
      });
      
      yPos += observations.length * 8 + 10;
      
      // Rodapé
      createFooter(
        pdf,
        'Esta ficha técnica foi gerada automaticamente pelo sistema IA.TEX - Use como referência para produção',
        `Ficha técnica completa - Ref: ${formData.reference} - ${new Date().toLocaleDateString('pt-BR')}`
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
        // Limpar dados após salvar
        setSavedQuotationId(result.id);
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

      {/* Controles de Preço e Margem */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Ajustar Valores Finais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium mb-2">Preço Final (R$)</Label>
              <div className="flex gap-2">
                {editingFinalPrice ? (
                  <>
                    <Input
                      type="number"
                      value={tempFinalPrice}
                      onChange={(e) => setTempFinalPrice(e.target.value)}
                      step="0.01"
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleFinalPriceSubmit}>
                      ✓
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingFinalPrice(false)}>
                      ✕
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-3 py-2 bg-white border rounded-md">
                      R$ {costs.finalPrice.toFixed(2)}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setEditingFinalPrice(true)}>
                      Editar
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2">Margem de Lucro (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.profitMargin}
                  onChange={(e) => handleProfitMarginChange(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="w-16 text-center font-medium">{formData.profitMargin.toFixed(1)}%</span>
              </div>
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
              Salvar Modelo
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