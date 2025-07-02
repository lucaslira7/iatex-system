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

export default function Step8Summary() {
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

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ESC para fechar modal ou cancelar
      if (event.key === 'Escape') {
        if (showPDFPreview) {
          setShowPDFPreview(false);
        }
        event.preventDefault();
      }
      
      // Ctrl/Cmd + P para visualizar PDF
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        handlePreviewPDF();
      }
      
      // Ctrl/Cmd + S para salvar/fechar
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSave();
      }
      
      // Ctrl/Cmd + D para download (apenas quando modal estiver aberto)
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && showPDFPreview) {
        event.preventDefault();
        handleExport();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPDFPreview]);

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

  // Calcular consumo por peça automaticamente baseado no peso médio
  const totalQuantity = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  const totalWeight = formData.sizes.reduce((sum, size) => sum + (size.weight * size.quantity), 0);
  const avgWeightPerPiece = totalQuantity > 0 ? (totalWeight / totalQuantity) : 0;
  
  // Estimativa: 1 metro de tecido ≈ 300g para tecidos leves
  const consumptionPerPiece = avgWeightPerPiece > 0 ? (avgWeightPerPiece / 300) : 0;

  // Função para recalcular margem baseada no preço final editado
  const handleFinalPriceChange = () => {
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
      // Gerar PDF real usando jsPDF
      const pdf = new jsPDF();
      
      // Configurar fonte
      pdf.setFont('helvetica');
      
      // Título
      pdf.setFontSize(20);
      pdf.text('Ficha Técnica de Precificação', 20, 30);
      
      // Informações básicas
      pdf.setFontSize(12);
      pdf.text(`Modelo: ${formData.modelName}`, 20, 50);
      pdf.text(`Referência: ${formData.reference}`, 20, 60);
      pdf.text(`Tipo: ${formData.garmentType}`, 20, 70);
      pdf.text(`Tecido: ${selectedFabric?.name || 'N/A'}`, 20, 80);
      
      // Tamanhos e pesos
      let yPos = 100;
      pdf.setFontSize(14);
      pdf.text('Tamanhos e Pesos:', 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      
      formData.sizes.forEach((size, index) => {
        pdf.text(`${size.size}: ${size.quantity} peças - ${size.weight}g cada`, 25, yPos);
        yPos += 8;
      });
      
      // Custos
      yPos += 10;
      pdf.setFontSize(14);
      pdf.text('Resumo de Custos:', 20, yPos);
      yPos += 10;
      pdf.setFontSize(10);
      
      pdf.text(`Custo do Tecido: R$ ${costs.fabricCost.toFixed(2)}`, 25, yPos);
      yPos += 8;
      pdf.text(`Custos de Criação: R$ ${costs.creationCosts.toFixed(2)}`, 25, yPos);
      yPos += 8;
      pdf.text(`Aviamentos: R$ ${costs.suppliesCosts.toFixed(2)}`, 25, yPos);
      yPos += 8;
      pdf.text(`Mão de Obra: R$ ${costs.laborCosts.toFixed(2)}`, 25, yPos);
      yPos += 8;
      pdf.text(`Custos Fixos: R$ ${costs.fixedCosts.toFixed(2)}`, 25, yPos);
      yPos += 15;
      
      // Resultado final
      pdf.setFontSize(12);
      pdf.text(`Custo Total: R$ ${costs.totalCost.toFixed(2)}`, 25, yPos);
      yPos += 10;
      pdf.text(`Margem de Lucro: ${formData.profitMargin}%`, 25, yPos);
      yPos += 10;
      pdf.text(`Preço Final: R$ ${costs.finalPrice.toFixed(2)}`, 25, yPos);
      yPos += 10;
      pdf.text(`Preço por Peça: R$ ${costs.pricePerUnit.toFixed(2)}`, 25, yPos);
      
      // Rodapé
      pdf.setFontSize(8);
      pdf.text('Esta ficha técnica foi gerada automaticamente pelo sistema IA.TEX', 20, 280);
      
      // Salvar e abrir
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ficha_Tecnica_${formData.reference}_${formData.modelName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Abrir em nova aba
      window.open(url, '_blank');
      
      // Limpar URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      setIsExporting(false);
      console.log('PDF gerado e aberto com sucesso');
    } catch (error) {
      setIsExporting(false);
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const handleTechnicalSheet = () => {
    try {
      // Gerar ficha técnica sem valores financeiros
      const pdf = new jsPDF();
      
      // Configurar fonte
      pdf.setFont('helvetica');
      
      // Título
      pdf.setFontSize(20);
      pdf.text('Ficha Técnica do Produto', 20, 30);
      
      // Informações básicas
      pdf.setFontSize(12);
      pdf.text(`Modelo: ${formData.modelName}`, 20, 50);
      pdf.text(`Referência: ${formData.reference}`, 20, 60);
      pdf.text(`Tipo: ${formData.garmentType}`, 20, 70);
      pdf.text(`Tecido: ${selectedFabric?.name || 'N/A'}`, 20, 80);
      
      // Especificações do tecido
      if (selectedFabric) {
        let yPos = 100;
        pdf.setFontSize(14);
        pdf.text('Especificações do Tecido:', 20, yPos);
        yPos += 10;
        pdf.setFontSize(10);
        
        pdf.text(`Tipo: ${selectedFabric.type}`, 25, yPos);
        yPos += 8;
        pdf.text(`Composição: ${selectedFabric.composition || 'N/A'}`, 25, yPos);
        yPos += 8;
        pdf.text(`Gramatura: ${selectedFabric.gramWeight}g/m²`, 25, yPos);
        yPos += 8;
        pdf.text(`Largura: ${selectedFabric.usableWidth}cm`, 25, yPos);
        yPos += 8;
        pdf.text(`Fornecedor: ${selectedFabric.supplierId || 'N/A'}`, 25, yPos);
        yPos += 20;
        
        // Tamanhos e especificações
        pdf.setFontSize(14);
        pdf.text('Grade de Tamanhos:', 20, yPos);
        yPos += 10;
        pdf.setFontSize(10);
        
        formData.sizes.forEach((size) => {
          pdf.text(`${size.size}: ${size.quantity} peças - ${size.weight}g por peça`, 25, yPos);
          yPos += 8;
        });
        
        // Consumo total
        yPos += 10;
        pdf.setFontSize(12);
        const totalWeight = formData.sizes.reduce((total, size) => total + (size.quantity * size.weight), 0);
        const totalConsumption = (totalWeight / 1000) / (selectedFabric.gramWeight / 1000);
        pdf.text(`Consumo Total de Tecido: ${totalConsumption.toFixed(2)} metros`, 25, yPos);
        yPos += 10;
        pdf.text(`Peso Total das Peças: ${(totalWeight / 1000).toFixed(2)} kg`, 25, yPos);
        
        // Rodapé
        pdf.setFontSize(8);
        pdf.text('Esta ficha técnica foi gerada automaticamente pelo sistema IA.TEX', 20, 280);
      }
      
      // Salvar e abrir
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ficha_Tecnica_${formData.reference}_${formData.modelName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Abrir em nova aba
      window.open(url, '_blank');
      
      // Limpar URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('Ficha técnica gerada com sucesso');
    } catch (error) {
      console.error('Erro ao gerar ficha técnica:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Salvando template de precificação:', formData);
      
      const response = await fetch('/api/pricing-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar template de precificação');
      }

      const result = await response.json();
      console.log('Template de precificação salvo com sucesso:', result);
      
      // Salvar o ID do template criado
      setSavedQuotationId(result.id);
      alert('Template de precificação salvo com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar template de precificação:', error);
      alert('Erro ao salvar template de precificação. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToQuotation = () => {
    // Aqui podemos usar uma prop ou evento para navegar para a seção de orçamentos
    // Por enquanto vamos simular a navegação
    window.dispatchEvent(new CustomEvent('navigateToQuotations', { 
      detail: { quotationId: savedQuotationId } 
    }));
    alert(`Navegando para orçamento #${savedQuotationId}`);
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
              
              {/* Campo editável para preço final */}
              <div className="space-y-2">
                <Label htmlFor="finalPrice">Preço Final (editável)</Label>
                <div className="flex gap-2">
                  {editingFinalPrice ? (
                    <>
                      <Input
                        id="finalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={tempFinalPrice}
                        onChange={(e) => setTempFinalPrice(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFinalPriceChange();
                          if (e.key === 'Escape') setEditingFinalPrice(false);
                        }}
                        autoFocus
                      />
                      <Button onClick={handleFinalPriceChange} size="sm">✓</Button>
                      <Button onClick={() => setEditingFinalPrice(false)} variant="outline" size="sm">✗</Button>
                    </>
                  ) : (
                    <div 
                      className="flex justify-between items-center text-lg font-bold cursor-pointer hover:bg-gray-50 p-2 rounded w-full"
                      onClick={() => {
                        setEditingFinalPrice(true);
                        setTempFinalPrice(costs.finalPrice.toFixed(2));
                      }}
                    >
                      <span className="text-green-900">Preço Final</span>
                      <span className="text-green-900">R$ {costs.finalPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">Clique para editar e recalcular a margem automaticamente</p>
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
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={handlePreviewPDF}
            className="w-full"
            title="Atalho: Ctrl+P"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar PDF
            <span className="ml-auto text-xs text-gray-500">Ctrl+P</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleTechnicalSheet}
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
            title="Ficha técnica sem valores financeiros"
          >
            <FileText className="h-4 w-4 mr-2" />
            Ficha Técnica
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-primary hover:bg-primary/90"
            title="Atalho: Ctrl+S"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
            <span className="ml-auto text-xs text-white/80">Ctrl+S</span>
          </Button>
        </div>
        
        {/* Botão "Ir para Orçamento" - aparece após salvamento */}
        {savedQuotationId && (
          <Button
            onClick={handleGoToQuotation}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            title="Navegar para o orçamento criado"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ir para Orçamento #{savedQuotationId}
          </Button>
        )}
      </div>

      {/* Modal de Preview PDF */}
      <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Preview da Precificação</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPDFPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-white p-6 space-y-4 border rounded-lg">
            {/* Cabeçalho com Logo */}
            <div className="text-center border-b pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg mr-4">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-900">IA.TEX</h1>
                  <p className="text-sm text-gray-600">Sistema de Gestão para Confecção</p>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">FICHA TÉCNICA DE PRECIFICAÇÃO</h2>
              <p className="text-gray-600">Data: {new Date().toLocaleDateString('pt-BR')}</p>
              
              {/* Botão de Download no cabeçalho */}
              <div className="mt-4">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="bg-green-600 hover:bg-green-700"
                  title="Atalho: Ctrl+D"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Baixando...' : 'Baixar PDF'}
                  <span className="ml-2 text-xs text-white/80">Ctrl+D</span>
                </Button>
              </div>
            </div>

            {/* Dados do Produto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Informações do Produto</h3>
                <div className="space-y-2">
                  <p><strong>Nome:</strong> {formData.modelName}</p>
                  <p><strong>Referência:</strong> {formData.reference}</p>
                  <p><strong>Tipo:</strong> {formData.garmentType}</p>
                  <p><strong>Modalidade:</strong> {formData.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças'}</p>
                  <p><strong>Descrição:</strong> {formData.description}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Tamanhos e Quantidades</h3>
                <div className="space-y-1">
                  {formData.sizes.map((size, index) => (
                    <p key={index}>
                      <strong>{size.size}:</strong> {size.quantity} peças (Peso: {size.weight}g)
                    </p>
                  ))}
                  <p className="pt-2 border-t"><strong>Total:</strong> {costs.totalQuantity} peças</p>
                </div>
              </div>
            </div>

            {/* Tecido */}
            {selectedFabric && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Informações do Tecido</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>Tecido:</strong> {selectedFabric.name}</p>
                    <p><strong>Tipo:</strong> {selectedFabric.type}</p>
                    <p><strong>Composição:</strong> {selectedFabric.composition || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong>Consumo por peça:</strong> {consumptionPerPiece.toFixed(2)}m</p>
                    <p><strong>Desperdício:</strong> {formData.wastePercentage}%</p>
                    <p><strong>Preço por metro:</strong> R$ {selectedFabric.pricePerMeter ? parseFloat(selectedFabric.pricePerMeter.toString()).toFixed(2) : '0.00'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Custos Detalhados */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Breakdown de Custos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium">Custo do Tecido</h4>
                    <p className="text-lg font-semibold">R$ {costs.fabricCost.toFixed(2)}</p>
                  </div>

                  {formData.creationCosts.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <h4 className="font-medium">Custos de Criação</h4>
                      {formData.creationCosts.map((cost, index) => (
                        <p key={index} className="text-sm">
                          {cost.description}: R$ {cost.total.toFixed(2)}
                        </p>
                      ))}
                      <p className="text-lg font-semibold pt-1 border-t">
                        R$ {costs.creationCosts.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {formData.supplies.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <h4 className="font-medium">Insumos</h4>
                      {formData.supplies.map((supply, index) => (
                        <p key={index} className="text-sm">
                          {supply.description}: R$ {supply.total.toFixed(2)}
                        </p>
                      ))}
                      <p className="text-lg font-semibold pt-1 border-t">
                        R$ {costs.suppliesCosts.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {formData.labor.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <h4 className="font-medium">Mão de Obra</h4>
                      {formData.labor.map((labor, index) => (
                        <p key={index} className="text-sm">
                          {labor.description}: R$ {labor.total.toFixed(2)}
                        </p>
                      ))}
                      <p className="text-lg font-semibold pt-1 border-t">
                        R$ {costs.laborCosts.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {formData.fixedCosts.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <h4 className="font-medium">Custos Fixos</h4>
                      {formData.fixedCosts.map((fixed, index) => (
                        <p key={index} className="text-sm">
                          {fixed.description}: R$ {fixed.total.toFixed(2)}
                        </p>
                      ))}
                      <p className="text-lg font-semibold pt-1 border-t">
                        R$ {costs.fixedCosts.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="bg-green-50 p-3 rounded border-2 border-green-200">
                    <h4 className="font-medium text-green-800">Resultado Final</h4>
                    <p className="text-sm">Custo Total: R$ {costs.totalCost.toFixed(2)}</p>
                    <p className="text-sm">Margem de Lucro: {formData.profitMargin}%</p>
                    <p className="text-sm">Lucro: R$ {costs.profitAmount.toFixed(2)}</p>
                    <p className="text-xl font-bold text-green-900">
                      Preço Final: R$ {costs.finalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-700">
                      Preço por peça: R$ {costs.pricePerUnit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="border-t pt-4 text-center text-sm text-gray-500">
              <p>Esta ficha técnica de precificação foi gerada automaticamente pelo sistema IA.TEX</p>
              <p>Template salvo permanentemente - Ref: {formData.reference}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}