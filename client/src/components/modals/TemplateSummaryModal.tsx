import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X, FileText, Printer, Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { PricingTemplate } from "@shared/schema";

interface TemplateSummaryModalProps {
  template: PricingTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateSummaryModal({ 
  template, 
  isOpen, 
  onClose
}: TemplateSummaryModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isPrintingPreview, setIsPrintingPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  if (!template) return null;

  const handlePreviewPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let yPos = 20;

      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMO DE PRECIFICAÇÃO - TEMPLATE', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
      
      yPos = 50;
      
      // Informações do produto
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Financeiro', 20, yPos);
      
      yPos += 15;
      
      const leftCol = 20;
      const rightCol = 110;
      
      // Dados básicos
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${template.modelName}`, leftCol, yPos);
      pdf.text(`Custo Total: ${formatPrice(template.totalCost)}`, rightCol, yPos);
      yPos += 8;
      
      pdf.text(`${template.reference}`, leftCol, yPos);
      pdf.text(`Preço Final: ${formatPrice(template.finalPrice)}`, rightCol, yPos);
      yPos += 8;
      
      pdf.text(`${template.garmentType}`, leftCol, yPos);
      pdf.text(`Margem de Lucro: ${parseFloat(template.profitMargin).toFixed(1)}%`, rightCol, yPos);
      yPos += 8;
      
      pdf.text(`Peça Única`, leftCol, yPos);
      const profit = parseFloat(template.finalPrice) - parseFloat(template.totalCost);
      pdf.text(`Lucro: ${formatPrice(profit)}`, rightCol, yPos);
      
      // Gerar blob e abrir em nova aba
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      
      // Limpar URL após um tempo
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
    } catch (error) {
      console.error('Erro ao visualizar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        handlePreviewPDF();
      }
      
      if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleExportResumo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleExportFichaTecnica = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPos = 20;
      
      // Cabeçalho - Header com IA.TEX
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IA.TEX', 20, 25);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Gestão', 20, 32);
      pdf.text('para Confecção', 20, 37);
      
      // Data no canto direito
      const currentDate = new Date().toLocaleDateString('pt-BR');
      pdf.text(currentDate, pageWidth - 30, 25);
      
      yPos = 55;
      
      // Título
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FICHA TÉCNICA DE PRECIFICAÇÃO', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 20;
      
      // Layout em duas colunas
      const leftCol = 20;
      const rightCol = pageWidth / 2 + 10;
      const colWidth = (pageWidth / 2) - 30;
      
      // Coluna Esquerda - Informações do Produto
      pdf.setFillColor(240, 240, 240);
      pdf.rect(leftCol, yPos, colWidth, 15, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMAÇÕES DO PRODUTO', leftCol + 5, yPos + 10);
      
      yPos += 20;
      
      // Dados do produto expandidos
      const productData = [
        ['Nome:', template.modelName],
        ['Referência:', template.reference],
        ['Tipo:', template.garmentType],
        ['Modalidade:', template.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças'],
        ['Descrição:', template.description || 'Modelo padrão']
      ];
      
      pdf.setFontSize(10);
      productData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, leftCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value.toString().substring(0, 30), leftCol + 30, yPos);
        yPos += 8;
      });

      // Informações de produção
      yPos += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Custo Total:', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatPrice(template.totalCost), leftCol + 30, yPos);
      yPos += 8;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Preço Final:', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatPrice(template.finalPrice), leftCol + 30, yPos);
      yPos += 8;

      pdf.setFont('helvetica', 'bold');
      pdf.text('Margem:', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${parseFloat(template.profitMargin).toFixed(1)}%`, leftCol + 30, yPos);
      
      // Resetar yPos para a coluna direita
      yPos = 75; // Mesma altura da primeira seção
      
      // Coluna Direita - Tamanhos e Quantidades
      pdf.setFillColor(240, 240, 240);
      pdf.rect(rightCol, yPos, colWidth, 15, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TAMANHOS E QUANTIDADES', rightCol + 5, yPos + 10);
      
      yPos += 20;
      
      // Informações de custos detalhados
      const costData = [
        ['Consumo de Tecido:', `${parseFloat(template.fabricConsumption).toFixed(2)}m`],
        ['Desperdício:', `${parseFloat(template.wastePercentage).toFixed(1)}%`],
        ['Custo Unitário:', formatPrice(parseFloat(template.totalCost) / (template.pricingMode === 'single' ? 1 : 3))],
        ['Preço Unitário:', formatPrice(parseFloat(template.finalPrice) / (template.pricingMode === 'single' ? 1 : 3))]
      ];
      
      pdf.setFontSize(10);
      costData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, rightCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, rightCol + 45, yPos);
        yPos += 8;
      });
      
      yPos += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lucro por Peça:', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      const profitPerUnit = (parseFloat(template.finalPrice) - parseFloat(template.totalCost)) / (template.pricingMode === 'single' ? 1 : 3);
      pdf.text(formatPrice(profitPerUnit), rightCol + 45, yPos);
      
      // Nova seção - Informações do Tecido
      yPos += 25;
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(leftCol, yPos, colWidth, 15, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMAÇÕES DO TECIDO', leftCol + 5, yPos + 10);
      
      yPos += 20;
      
      // Dados do tecido (simulados)
      const fabricData = [
        ['Tecido:', 'Sport Dry'],
        ['Tipo:', 'Poliamida'],
        ['Composição:', '91% Poliamida, 9% Elastano'],
        ['Consumo por peça:', '0,32m'],
        ['Desperdício:', '20%'],
        ['Preço por metro:', formatPrice(16.80)]
      ];
      
      pdf.setFontSize(10);
      fabricData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, leftCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, leftCol + 40, yPos);
        yPos += 8;
      });
      
      // Seção de Breakdown de Custos
      yPos += 15;
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(leftCol, yPos, pageWidth - 40, 15, 'F');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BREAKDOWN DE CUSTOS', leftCol + 5, yPos + 10);
      
      yPos += 25;
      
      // Layout em 3 colunas para custos
      const col1 = leftCol;
      const col2 = leftCol + 70;
      const col3 = leftCol + 140;
      
      // Custos principais
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Custo do Tecido', col1, yPos);
      pdf.text('Mão de Obra', col2, yPos);
      pdf.text('Outros Custos', col3, yPos);
      
      yPos += 8;
      
      pdf.setFontSize(18);
      pdf.setTextColor(34, 197, 94);
      pdf.text(formatPrice(8.09), col1, yPos);
      pdf.text(formatPrice(5.20), col2, yPos);
      pdf.text(formatPrice(6.54), col3, yPos);
      
      yPos += 15;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Detalhes dos custos
      const costDetails = [
        ['Modelagem: R$ 0,50', 'Acabamento/Revisão: R$ 1,50', 'Embalagem: R$ 0,50'],
        ['Piloto: R$ 0,26', 'Corte: R$ 1,20', 'Custos de Criação: R$ 5,54'],
        ['Linha: R$ 0,45', '', 'Tributos e Impostos: R$ 0,40'],
        ['Graduação: R$ 0,15', '', ''],
        ['Consultoria: R$ 0,2', '', ''],
        ['Costura: R$ 3,20', '', '']
      ];
      
      costDetails.forEach(([detail1, detail2, detail3]) => {
        if (detail1) pdf.text(detail1, col1, yPos);
        if (detail2) pdf.text(detail2, col2, yPos);
        if (detail3) pdf.text(detail3, col3, yPos);
        yPos += 6;
      });

      // Seção de Instruções Técnicas
      yPos += 10;
      
      pdf.setFillColor(255, 248, 220);
      pdf.rect(leftCol, yPos, pageWidth - 40, 15, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INSTRUÇÕES DE PRODUÇÃO', leftCol + 5, yPos + 10);
      
      yPos += 20;
      
      const instructions = [
        '• Verificar a gramatura e composição do tecido antes do corte',
        '• Considerar margem de segurança de 5% para desperdício',
        '• Seguir rigorosamente a tabela de medidas padrão',
        '• Documentar qualquer alteração durante a produção',
        '• Conferir acabamentos conforme especificação técnica',
        '• Validar qualidade antes da embalagem final'
      ];
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      instructions.forEach((instruction, index) => {
        pdf.text(instruction, leftCol, yPos + (index * 6));
      });
      
      yPos += instructions.length * 6 + 10;
      
      // Resultado final
      yPos = pageHeight - 40;
      
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(34, 197, 94);
      pdf.rect(leftCol, yPos - 10, pageWidth - 40, 25, 'FD');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Preço Final (editável)', leftCol + 10, yPos);
      
      pdf.setFontSize(18);
      pdf.setTextColor(34, 197, 94);
      pdf.text(formatPrice(template.finalPrice), pageWidth - 50, yPos, { align: 'right' });
      
      // Salvar PDF
      const fileName = `Ficha_${template.reference}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar ficha técnica:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportResumo = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      let yPos = 20;
      
      // Cabeçalho com logo IA.TEX
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
      const titleText = 'RESUMO DE PRECIFICAÇÃO - TEMPLATE';
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, (pageWidth - titleWidth) / 2, 70);
      
      // Data
      const todayDate = new Date().toLocaleDateString('pt-BR');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${todayDate}`, pageWidth - 60, 70);
      
      // Botão Download visual
      pdf.setFillColor(34, 197, 94);
      pdf.roundedRect((pageWidth - 70) / 2, 80, 70, 15, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📥 Baixar PDF  Ctrl+D', (pageWidth - 65) / 2, 90);
      
      yPos = 110;
      
      // Layout de duas colunas
      const leftCol = 20;
      const rightCol = pageWidth / 2 + 10;
      
      // Informações do Produto
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações do Produto', leftCol, yPos);
      pdf.text('Resumo Financeiro', rightCol, yPos);
      yPos += 15;
      
      // Informações básicas (esquerda)
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nome: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(template.modelName, leftCol + 25, yPos);
      
      // Valores financeiros (direita)
      pdf.setFont('helvetica', 'bold');
      pdf.text('Custo Total: ', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatPrice(template.totalCost), rightCol + 45, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Referência: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(template.reference, leftCol + 35, yPos);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Preço Final: ', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatPrice(template.finalPrice), rightCol + 45, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Tipo: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(template.garmentType, leftCol + 20, yPos);
      
      const marginPercent = ((parseFloat(template.finalPrice.toString()) - parseFloat(template.totalCost.toString())) / parseFloat(template.totalCost.toString()) * 100);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Margem: ', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${marginPercent.toFixed(1)}%`, rightCol + 30, yPos);
      
      yPos += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Modalidade: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(template.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças', leftCol + 35, yPos);
      
      const profit = parseFloat(template.finalPrice.toString()) - parseFloat(template.totalCost.toString());
      pdf.setFont('helvetica', 'bold');
      pdf.text('Lucro: ', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatPrice(profit), rightCol + 25, yPos);
      
      yPos += 8;
      if (template.description) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Descrição: ', leftCol, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(template.description, leftCol + 30, yPos);
        yPos += 8;
      }
      
      yPos += 15;
      
      // Datas
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações do Template', leftCol, yPos);
      yPos += 15;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Criado em: ', leftCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(template.createdAt.toString()), leftCol + 35, yPos);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Atualizado em: ', rightCol, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(template.updatedAt.toString()), rightCol + 45, yPos);
      
      yPos += 25;
      
      // Resultado Final - Caixa destacada
      pdf.setFillColor(240, 253, 244);
      pdf.setDrawColor(34, 197, 94);
      pdf.rect(20, yPos, pageWidth - 40, 35, 'FD');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Template Salvo com Sucesso', 30, yPos + 15);
      
      pdf.setFontSize(12);
      pdf.text(`Referência: ${template.reference}`, 30, yPos + 25);
      pdf.text(`Preço: ${formatPrice(template.finalPrice)}`, rightCol, yPos + 25);
      
      // Rodapé
      pdf.setTextColor(128, 128, 128);
      pdf.setFontSize(8);
      pdf.text('Este resumo foi gerado a partir de um template salvo no sistema IA.TEX', 20, 280);
      pdf.text(`Template: ${template.reference} - Gerado em ${todayDate}`, 20, 285);
      
      // Salvar e abrir
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const fileDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resumo_${template.reference}_${fileDate}.pdf`;
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

  const handlePrintPreview = async () => {
    setIsPrintingPreview(true);
    try {
      if (!previewRef.current) return;

      // Capturar screenshot do preview
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Criar PDF com a imagem do preview
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular dimensões para manter proporção
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10; // margem superior
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Salvar PDF do preview
      const fileDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Preview_${template.reference}_${fileDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      setIsPrintingPreview(false);
      
    } catch (error) {
      setIsPrintingPreview(false);
      console.error('Erro ao salvar preview:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Resumo Completo - {template.modelName}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Replica exata da visualização do sistema */}
        <div ref={previewRef} className="space-y-6">
          {/* Cabeçalho igual ao sistema */}
          <div className="bg-blue-600 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">IA.TEX</h1>
                <p className="text-blue-100">Sistema de Gestão para Confecção</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">RESUMO DE PRECIFICAÇÃO - TEMPLATE</h2>
              <p className="text-gray-500">Data: {formatDate(new Date().toString())}</p>
              
              {/* Botões reorganizados conforme layout solicitado */}
              <div className="flex gap-4 mt-6 justify-center">
                <Button 
                  onClick={handlePreviewPDF}
                  variant="outline"
                  disabled={isExporting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  title="Ctrl+P"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar PDF
                  <span className="ml-2 text-xs text-gray-500">Ctrl+P</span>
                </Button>
                
                <Button 
                  onClick={handleExportFichaTecnica}
                  disabled={isExporting}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {isExporting ? (
                    <>Gerando...</>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Ficha Técnica
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleExportResumo}
                  disabled={isExporting}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  title="Ctrl+S"
                >
                  {isExporting ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Salvar
                      <span className="ml-2 text-xs text-blue-200">Ctrl+S</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Layout de duas colunas igual ao sistema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna esquerda */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações do Produto</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Nome:</span>
                    <span>{template.modelName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Referência:</span>
                    <Badge variant="secondary">{template.reference}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tipo:</span>
                    <span>{template.garmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Modalidade:</span>
                    <span>{template.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças'}</span>
                  </div>
                  {template.description && (
                    <div className="flex justify-between">
                      <span className="font-medium">Descrição:</span>
                      <span>{template.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna direita */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Resumo Financeiro</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Custo Total:</span>
                    <span className="font-bold">{formatPrice(template.totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Preço Final:</span>
                    <span className="font-bold text-green-600">{formatPrice(template.finalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Margem de Lucro:</span>
                    <span className="font-bold text-blue-600">
                      {((parseFloat(template.finalPrice.toString()) - parseFloat(template.totalCost.toString())) / parseFloat(template.totalCost.toString()) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Lucro:</span>
                    <span className="font-bold text-purple-600">
                      {formatPrice(parseFloat(template.finalPrice.toString()) - parseFloat(template.totalCost.toString()))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do template */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Informações do Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="font-medium">Criado em:</span>
                  <span>{formatDate(template.createdAt.toString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Última atualização:</span>
                  <span>{formatDate(template.updatedAt.toString())}</span>
                </div>
              </div>
            </div>

            {/* Resultado final destacado */}
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Template Salvo com Sucesso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-green-700">Referência: </span>
                  <span className="font-bold">{template.reference}</span>
                </div>
                <div>
                  <span className="text-green-700">Preço: </span>
                  <span className="font-bold">{formatPrice(template.finalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}