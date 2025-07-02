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
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let yPos = 20;
      
      // Cabeçalho com logo IA.TEX (cópia exata da visualização)
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      // Logo IA.TEX
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IA.TEX', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Gestão para Confecção', 20, 42);
      
      // Título principal centralizado
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const titleText = 'FICHA TÉCNICA DE PRECIFICAÇÃO';
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, (pageWidth - titleWidth) / 2, 70);
      
      // Data no canto direito
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${currentDate}`, pageWidth - 60, 70);
      
      // Botão Download visual (cópia exata)
      pdf.setFillColor(34, 197, 94);
      pdf.roundedRect((pageWidth - 70) / 2, 80, 70, 15, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📥 Baixar PDF  Ctrl+D', (pageWidth - 65) / 2, 90);
      
      yPos = 110;
      
      // Layout de duas colunas exato da visualização
      const leftCol = 20;
      const rightCol = pageWidth / 2 + 10;
      
      // Coluna esquerda: Informações do Produto
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações do Produto', leftCol, yPos);
      
      // Coluna direita: Tamanhos e Quantidades  
      pdf.text('Tamanhos e Quantidades', rightCol, yPos);
      yPos += 15;
      
      // Informações do produto (esquerda)
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nome: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.modelName, leftCol + 25, yPos);
      
      // Tamanhos (direita)
      const totalQuantity = formData.sizes.reduce((total, size) => total + size.quantity, 0);
      let rightYPos = yPos;
      formData.sizes.forEach((size) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${size.size}: `, rightCol, rightYPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${size.quantity} peças (Peso: ${size.weight}g)`, rightCol + 15, rightYPos);
        rightYPos += 8;
      });
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Referência: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.reference, leftCol + 35, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Tipo: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.garmentType, leftCol + 20, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Modalidade: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças', leftCol + 35, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Descrição: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.description || 'N/A', leftCol + 30, yPos);
      
      // Total no lado direito
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total: ${totalQuantity} peças`, rightCol, Math.max(yPos, rightYPos + 5));
      
      yPos = Math.max(yPos + 20, rightYPos + 20);
      
      // Informações do Tecido
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações do Tecido', leftCol, yPos);
      yPos += 15;
      
      if (selectedFabric) {
        // Informações básicas do tecido (esquerda)
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tecido: ', leftCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(selectedFabric.name, leftCol + 25, yPos);
        
        // Consumo e preços (direita)
        const fabricConsumption = formData.fabricConsumption || 0.32; // Valor padrão baseado na imagem
        pdf.setFont('helvetica', 'bold');
        pdf.text('Consumo por peça: ', rightCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${fabricConsumption.toFixed(2)}m`, rightCol + 55, yPos);
        
        yPos += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tipo: ', leftCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(selectedFabric.type, leftCol + 20, yPos);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Desperdício: ', rightCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text('20%', rightCol + 35, yPos);
        
        yPos += 8;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Composição: ', leftCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(selectedFabric.composition || 'N/A', leftCol + 35, yPos);
        
        const pricePerMeter = parseFloat(selectedFabric.pricePerMeter || '0');
        pdf.setFont('helvetica', 'bold');
        pdf.text('Preço por metro: ', rightCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`R$ ${pricePerMeter.toFixed(2)}`, rightCol + 50, yPos);
      }
      
      yPos += 25;
      
      // Breakdown de Custos - Layout exato da visualização
      pdf.setFillColor(248, 250, 252);
      pdf.rect(15, yPos - 5, pageWidth - 30, 90, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Breakdown de Custos', 20, yPos + 10);
      yPos += 25;
      
      // Primeira linha: Custo do Tecido | Mão de Obra
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Custo do Tecido', leftCol, yPos);
      pdf.text('Mão de Obra', rightCol, yPos);
      yPos += 8;
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`R$ ${costs.fabricCost.toFixed(2)}`, leftCol, yPos);
      
      // Detalhes da mão de obra (lado direito)
      const laborDetails = formData.labor || [];
      let laborYStart = yPos - 5;
      laborDetails.forEach((labor) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${labor.description}: R$ ${labor.total.toFixed(2)}`, rightCol, laborYStart);
        laborYStart += 6;
      });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`R$ ${costs.laborCosts.toFixed(2)}`, rightCol, laborYStart + 5);
      
      yPos += 25;
      
      // Segunda linha: Custos de Criação | Custos Fixos
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Custos de Criação', leftCol, yPos);
      pdf.text('Custos Fixos', rightCol, yPos);
      yPos += 5;
      
      // Detalhes dos custos de criação
      const creationDetails = formData.creationCosts || [];
      let creationYPos = yPos;
      creationDetails.forEach((cost) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${cost.description} (rateio): R$ ${cost.total.toFixed(2)}`, leftCol, creationYPos);
        creationYPos += 6;
      });
      
      // Detalhes dos custos fixos
      const fixedDetails = formData.fixedCosts || [];
      let fixedYPos = yPos;
      fixedDetails.forEach((cost) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${cost.description}: R$ ${cost.total.toFixed(2)}`, rightCol, fixedYPos);
        fixedYPos += 6;
      });
      
      const maxCreationY = creationYPos + 8;
      const maxFixedY = fixedYPos + 8;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`R$ ${costs.creationCosts.toFixed(2)}`, leftCol, maxCreationY);
      pdf.text(`R$ ${costs.fixedCosts.toFixed(2)}`, rightCol, maxFixedY);
      
      yPos = Math.max(maxCreationY, maxFixedY) + 15;
      
      // Insumos (centralizado)
      const insumoCol = (leftCol + rightCol) / 2;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Insumos', insumoCol, yPos);
      yPos += 5;
      
      const suppliesDetails = formData.supplies || [];
      suppliesDetails.forEach((supply) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${supply.description} (rateio): R$ ${supply.total.toFixed(2)}`, insumoCol, yPos);
        yPos += 6;
      });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`R$ ${costs.suppliesCosts.toFixed(2)}`, insumoCol, yPos + 8);
      
      yPos += 25;
      
      // Resultado Final - Caixa verde
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(34, 197, 94);
      pdf.rect(20, yPos, pageWidth - 40, 45, 'FD');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resultado Final', 30, yPos + 15);
      
      yPos += 25;
      pdf.setFontSize(12);
      pdf.text(`Custo Total: R$ ${costs.totalCost.toFixed(2)}`, 30, yPos);
      pdf.text(`Preço Final: R$ ${costs.finalPrice.toFixed(2)}`, rightCol, yPos);
      
      yPos += 8;
      const marginPercent = ((costs.finalPrice - costs.totalCost) / costs.totalCost * 100);
      pdf.text(`Margem de Lucro: ${marginPercent.toFixed(11)}%`, 30, yPos);
      pdf.text(`Preço por peça: R$ ${costs.pricePerUnit.toFixed(2)}`, rightCol, yPos);
      
      yPos += 8;
      pdf.text(`Lucro: R$ ${(costs.finalPrice - costs.totalCost).toFixed(2)}`, 30, yPos);
      
      // Rodapé
      pdf.setTextColor(128, 128, 128);
      pdf.setFontSize(8);
      pdf.text('Esta ficha técnica de precificação foi gerada automaticamente pelo sistema IA.TEX', 20, 280);
      pdf.text(`Template salvo permanentemente - Ref: ${formData.reference}`, 20, 285);
      
      // Salvar e abrir
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ficha_Tecnica_${formData.reference}_${formData.modelName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      setIsExporting(false);
    } catch (error) {
      setIsExporting(false);
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const handleTechnicalSheet = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let yPos = 20;
      
      // Cabeçalho com logo IA.TEX igual ao PDF completo
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IA.TEX', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Gestão para Confecção', 20, 42);
      
      // Título principal
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const titleText = 'FICHA TÉCNICA DO PRODUTO';
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, (pageWidth - titleWidth) / 2, 70);
      
      // Data
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${currentDate}`, pageWidth - 60, 70);
      
      yPos = 90;
      
      // Adicionar imagem do modelo se existir
      if (formData.imageUrl) {
        try {
          // Carregar a imagem
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Calcular dimensões mantendo proporção
              const maxWidth = 60;
              const maxHeight = 80;
              let { width, height } = img;
              
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }
              if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
              }
              
              // Adicionar imagem no canto superior direito
              pdf.addImage(img, 'JPEG', pageWidth - width - 20, yPos, width, height);
              resolve(true);
            };
            img.onerror = () => resolve(false); // Continua sem imagem se falhar
          });
          
          img.src = formData.imageUrl;
        } catch (error) {
          console.log('Não foi possível carregar a imagem do modelo');
        }
      }
      
      // Informações do produto
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações do Produto', 20, yPos + 10);
      yPos += 25;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nome: ', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.modelName, 45, yPos);
      yPos += 8;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Referência: ', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.reference, 55, yPos);
      yPos += 8;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Tipo: ', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.garmentType, 40, yPos);
      yPos += 8;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Modalidade: ', 20, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formData.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças', 55, yPos);
      yPos += 8;
      
      if (formData.description) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Descrição: ', 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formData.description, 50, yPos);
        yPos += 8;
      }
      
      yPos += 15;
      
      // Grade de tamanhos
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Grade de Tamanhos', 20, yPos);
      yPos += 15;
      
      const totalQuantity = formData.sizes.reduce((total, size) => total + size.quantity, 0);
      formData.sizes.forEach((size) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${size.size}: `, 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${size.quantity} peças (Peso: ${size.weight}g)`, 45, yPos);
        yPos += 8;
      });
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total: ${totalQuantity} peças`, 30, yPos + 5);
      yPos += 20;
      
      // Especificações do tecido
      if (selectedFabric) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Especificações do Tecido', 20, yPos);
        yPos += 15;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tecido: ', 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(selectedFabric.name, 55, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tipo: ', 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(selectedFabric.type, 50, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Composição: ', 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(selectedFabric.composition || 'N/A', 70, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Gramatura: ', 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${selectedFabric.gramWeight}g/m²`, 65, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Largura útil: ', 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${selectedFabric.usableWidth}cm`, 70, yPos);
        yPos += 15;
        
        // Consumo de tecido
        const totalWeight = formData.sizes.reduce((total, size) => total + (size.quantity * size.weight), 0);
        const fabricConsumption = formData.fabricConsumption || (totalWeight / 1000) / (selectedFabric.gramWeight / 1000);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Consumo por peça: ', 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${(fabricConsumption / totalQuantity).toFixed(2)}m`, 85, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Consumo total: ', 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${fabricConsumption.toFixed(2)}m`, 80, yPos);
        yPos += 8;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Peso total das peças: ', 30, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${(totalWeight / 1000).toFixed(2)}kg`, 95, yPos);
      }
      
      // Rodapé
      pdf.setTextColor(128, 128, 128);
      pdf.setFontSize(8);
      pdf.text('Esta ficha técnica foi gerada automaticamente pelo sistema IA.TEX', 20, 280);
      pdf.text(`Ficha técnica do produto - Ref: ${formData.reference}`, 20, 285);
      
      // Salvar e abrir
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ficha_Tecnica_Produto_${formData.reference}_${formData.modelName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.open(url, '_blank');
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