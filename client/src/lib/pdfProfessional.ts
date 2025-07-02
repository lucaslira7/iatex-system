import jsPDF from 'jspdf';

export interface PDFData {
  modelName: string;
  reference: string;
  description?: string;
  garmentType: string;
  fabricName?: string;
  fabricConsumption: number;
  wastePercentage: number;
  profitMargin: number;
  totalCost: number;
  finalPrice: number;
  creationCosts: Array<{
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    total: number;
  }>;
  supplies: Array<{
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    total: number;
  }>;
  labor: Array<{
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    total: number;
  }>;
  fixedCosts: Array<{
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    total: number;
  }>;
  sizes: Array<{
    size: string;
    quantity: number;
    weight: number;
  }>;
}

/**
 * Gera PDF profissional com layout estruturado e elementos visuais
 */
export function generateProfessionalPDF(data: PDFData, type: 'ficha' | 'resumo'): jsPDF {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = 20;

  // ===== CABEÇALHO PROFISSIONAL =====
  // Fundo azul do cabeçalho
  pdf.setFillColor(99, 102, 241);
  pdf.rect(0, 0, pageWidth, 40, 'F');

  // Logo e nome da empresa
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IA.TEX', margin, 15);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sistema de Gestão para Confecção', margin, 22);

  // Título do documento
  const title = type === 'ficha' ? 'FICHA TÉCNICA' : 'RESUMO DE PRECIFICAÇÃO';
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, 32);

  // Informações no canto direito
  const date = new Date().toLocaleDateString('pt-BR');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Referência: ${data.reference}`, pageWidth - 70, 20);
  pdf.text(`Data: ${date}`, pageWidth - 70, 27);

  currentY = 50;

  // ===== FUNÇÃO PARA ADICIONAR SEÇÃO =====
  function addSection(title: string) {
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, currentY, pageWidth - (margin * 2), 8, 'F');
    
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(margin, currentY, pageWidth - (margin * 2), 8);
    
    pdf.setTextColor(30, 41, 59);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 5, currentY + 5.5);
    
    currentY += 13;
  }

  // ===== FUNÇÃO PARA ADICIONAR TABELA DE CUSTOS =====
  function addCostTable(costs: any[], title: string) {
    if (costs.length === 0) return;

    addSection(title);

    // Cabeçalho da tabela
    const headers = ['Descrição', 'Valor Unit.', 'Qtd.', 'Desp.', 'Total'];
    const colWidths = [65, 25, 15, 15, 25];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = margin;
    
    // Fundo do cabeçalho
    pdf.setFillColor(156, 163, 175);
    pdf.rect(startX, currentY, tableWidth, 8, 'F');
    
    // Bordas e texto do cabeçalho
    pdf.setDrawColor(100, 100, 100);
    let x = startX;
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    for (let i = 0; i < headers.length; i++) {
      pdf.rect(x, currentY, colWidths[i], 8);
      pdf.text(headers[i], x + 2, currentY + 5.5);
      x += colWidths[i];
    }

    currentY += 8;

    // Linhas de dados
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    costs.forEach((cost, index) => {
      // Cor alternada para as linhas
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(startX, currentY, tableWidth, 6, 'F');
      }

      // Bordas da linha
      x = startX;
      for (let i = 0; i < colWidths.length; i++) {
        pdf.rect(x, currentY, colWidths[i], 6);
        x += colWidths[i];
      }

      // Dados da linha
      const values = [
        cost.description.length > 25 ? cost.description.substring(0, 25) + '...' : cost.description,
        `R$ ${cost.unitValue.toFixed(2)}`,
        cost.quantity.toString(),
        `${cost.wastePercentage}%`,
        `R$ ${cost.total.toFixed(2)}`
      ];

      x = startX;
      for (let i = 0; i < values.length; i++) {
        const textX = i === 0 ? x + 2 : x + colWidths[i] - 2;
        const align = i === 0 ? undefined : { align: 'right' as const };
        pdf.text(values[i], textX, currentY + 4, align);
        x += colWidths[i];
      }

      currentY += 6;
    });

    currentY += 5;
  }

  // ===== INFORMAÇÕES DO MODELO =====
  addSection('INFORMAÇÕES DO MODELO');

  const modelInfo = [
    ['Nome do Modelo:', data.modelName],
    ['Referência:', data.reference],
    ['Tipo de Peça:', data.garmentType],
    ['Descrição:', data.description || 'Não informado'],
    ['Tecido:', data.fabricName || 'Não informado'],
    ['Consumo de Tecido:', `${data.fabricConsumption} metros`],
    ['Desperdício:', `${data.wastePercentage}%`]
  ];

  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(10);

  modelInfo.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, margin + 5, currentY);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, margin + 70, currentY);
    
    currentY += 6;
  });

  currentY += 10;

  // ===== GRADE DE TAMANHOS (apenas para ficha técnica) =====
  if (type === 'ficha' && data.sizes.length > 0) {
    addSection('GRADE DE TAMANHOS');

    const sizeHeaders = ['Tamanho', 'Quantidade', 'Peso (g)'];
    const sizeColWidths = [40, 40, 40];
    let x = margin;
    
    // Cabeçalho da tabela de tamanhos
    pdf.setFillColor(156, 163, 175);
    pdf.rect(x, currentY, sizeColWidths.reduce((a, b) => a + b, 0), 8, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    let tempX = x;
    sizeHeaders.forEach((header, i) => {
      pdf.rect(tempX, currentY, sizeColWidths[i], 8);
      pdf.text(header, tempX + 2, currentY + 5.5);
      tempX += sizeColWidths[i];
    });

    currentY += 8;

    // Dados dos tamanhos
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'normal');
    
    data.sizes.forEach((size, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(x, currentY, sizeColWidths.reduce((a, b) => a + b, 0), 6, 'F');
      }

      tempX = x;
      const sizeValues = [size.size, size.quantity.toString(), `${size.weight}g`];
      
      sizeValues.forEach((value, i) => {
        pdf.rect(tempX, currentY, sizeColWidths[i], 6);
        pdf.text(value, tempX + 2, currentY + 4);
        tempX += sizeColWidths[i];
      });

      currentY += 6;
    });

    currentY += 10;
  }

  // ===== BREAKDOWN DE CUSTOS (apenas para ficha técnica) =====
  if (type === 'ficha') {
    addCostTable(data.creationCosts, 'CUSTOS DE CRIAÇÃO');
    addCostTable(data.supplies, 'INSUMOS');
    addCostTable(data.labor, 'MÃO DE OBRA');
    addCostTable(data.fixedCosts, 'CUSTOS FIXOS');
  }

  // ===== RESUMO FINANCEIRO =====
  addSection('RESUMO FINANCEIRO');

  const totalCreation = data.creationCosts.reduce((sum, cost) => sum + cost.total, 0);
  const totalSupplies = data.supplies.reduce((sum, cost) => sum + cost.total, 0);
  const totalLabor = data.labor.reduce((sum, cost) => sum + cost.total, 0);
  const totalFixed = data.fixedCosts.reduce((sum, cost) => sum + cost.total, 0);

  const financialData = [
    ['Custos de Criação:', `R$ ${totalCreation.toFixed(2)}`],
    ['Insumos:', `R$ ${totalSupplies.toFixed(2)}`],
    ['Mão de Obra:', `R$ ${totalLabor.toFixed(2)}`],
    ['Custos Fixos:', `R$ ${totalFixed.toFixed(2)}`]
  ];

  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  financialData.forEach(([label, value]) => {
    pdf.text(label, margin + 5, currentY);
    pdf.text(value, pageWidth - margin - 5, currentY, { align: 'right' });
    currentY += 6;
  });

  currentY += 5;

  // Totais destacados
  const totals = [
    ['CUSTO TOTAL:', `R$ ${data.totalCost.toFixed(2)}`],
    ['Margem de Lucro:', `${data.profitMargin}%`],
    ['PREÇO FINAL:', `R$ ${data.finalPrice.toFixed(2)}`]
  ];

  totals.forEach(([label, value], index) => {
    const isMainTotal = label.includes('TOTAL') || label.includes('FINAL');
    
    if (isMainTotal) {
      // Fundo verde para totais principais
      pdf.setFillColor(34, 197, 94);
      pdf.rect(margin, currentY - 2, pageWidth - (margin * 2), 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setTextColor(30, 41, 59);
      pdf.setFont('helvetica', 'normal');
    }

    pdf.setFontSize(11);
    pdf.text(label, margin + 5, currentY + 2);
    pdf.text(value, pageWidth - margin - 5, currentY + 2, { align: 'right' });
    
    currentY += 10;
  });

  // ===== RODAPÉ PROFISSIONAL =====
  const footerY = pageHeight - 25;
  
  // Linha divisória
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  // Texto do rodapé
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text('IA.TEX - Sistema de Gestão para Confecção', margin, footerY);
  pdf.text('www.iatex.com.br | contato@iatex.com.br', margin, footerY + 5);
  
  // Número da página
  pdf.text('Página 1 de 1', pageWidth - margin, footerY, { align: 'right' });

  return pdf;
}

/**
 * Gera ficha técnica profissional
 */
export function generateProfessionalTechnicalSheet(data: PDFData): jsPDF {
  return generateProfessionalPDF(data, 'ficha');
}

/**
 * Gera resumo de precificação profissional
 */
export function generateProfessionalPricingSummary(data: PDFData): jsPDF {
  return generateProfessionalPDF(data, 'resumo');
}