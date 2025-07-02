import jsPDF from 'jspdf';

// Cores do sistema IA.TEX
export const PDF_COLORS = {
  primary: [99, 102, 241] as const,
  secondary: [156, 163, 175] as const,
  accent: [34, 197, 94] as const,
  warning: [251, 191, 36] as const,
  danger: [239, 68, 68] as const,
  dark: [17, 24, 39] as const,
  light: [249, 250, 251] as const,
  white: [255, 255, 255] as const,
  black: [0, 0, 0] as const
};

/**
 * Cria um cabeçalho profissional padronizado
 */
export function createModernHeader(pdf: jsPDF, title: string, reference?: string): number {
  const pageWidth = pdf.internal.pageSize.width;
  
  // Fundo do cabeçalho
  pdf.setFillColor(99, 102, 241); // Índigo
  pdf.rect(0, 0, pageWidth, 60, 'F');
  
  // Linha decorativa superior
  pdf.setFillColor(34, 197, 94); // Verde
  pdf.rect(0, 0, pageWidth, 4, 'F');
  
  // Logo/Nome da empresa
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IA.TEX', 25, 35);
  
  // Slogan
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sistema de Gestão para Confecção', 25, 47);
  
  // Informações de contato (lado direito)
  pdf.setFontSize(9);
  pdf.text('Tel: (11) 9999-9999', pageWidth - 80, 25);
  pdf.text('contato@iatex.com.br', pageWidth - 80, 35);
  pdf.text('www.iatex.com.br', pageWidth - 80, 45);
  
  // Título do documento
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, (pageWidth - titleWidth) / 2, 85);
  
  // Referência e data
  let yPos = 100;
  if (reference) {
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Referência: ', 25, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(reference, 65, yPos);
  }
  
  const dateText = `Data: ${new Date().toLocaleDateString('pt-BR')}`;
  const dateWidth = pdf.getTextWidth(dateText);
  pdf.text(dateText, pageWidth - dateWidth - 25, yPos);
  
  yPos += 15;
  
  // Linha divisória
  pdf.setDrawColor(156, 163, 175);
  pdf.setLineWidth(0.5);
  pdf.line(25, yPos, pageWidth - 25, yPos);
  
  return yPos + 20;
}

/**
 * Cria uma seção com título e fundo colorido
 */
export function createSection(pdf: jsPDF, title: string, yPos: number): number {
  const pageWidth = pdf.internal.pageSize.width;
  
  // Fundo da seção
  pdf.setFillColor(249, 250, 251);
  pdf.rect(25, yPos - 5, pageWidth - 50, 25, 'F');
  
  // Borda esquerda colorida
  pdf.setFillColor(99, 102, 241);
  pdf.rect(25, yPos - 5, 4, 25, 'F');
  
  // Título da seção
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 35, yPos + 8);
  
  return yPos + 30;
}

/**
 * Cria um card de informações destacado
 */
export function createInfoCard(
  pdf: jsPDF,
  title: string,
  items: Array<{ label: string; value: string; highlight?: boolean }>,
  yPos: number
): number {
  const pageWidth = pdf.internal.pageSize.width;
  const cardWidth = pageWidth - 50;
  const cardHeight = (items.length * 8) + 20;
  
  // Fundo do card
  pdf.setFillColor(249, 250, 251);
  pdf.rect(25, yPos, cardWidth, cardHeight, 'F');
  
  // Borda do card
  pdf.setDrawColor(99, 102, 241);
  pdf.setLineWidth(1);
  pdf.rect(25, yPos, cardWidth, cardHeight);
  
  // Título do card
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 35, yPos + 15);
  
  let itemY = yPos + 25;
  
  // Items do card
  pdf.setFontSize(11);
  items.forEach(item => {
    // Label
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text(`${item.label}: `, 35, itemY);
    
    // Value
    pdf.setFont('helvetica', 'normal');
    if (item.highlight) {
      pdf.setTextColor(99, 102, 241);
    } else {
      pdf.setTextColor(17, 24, 39);
    }
    
    const labelWidth = pdf.getTextWidth(`${item.label}: `);
    pdf.text(item.value, 35 + labelWidth, itemY);
    
    itemY += 8;
  });
  
  return yPos + cardHeight + 15;
}

/**
 * Cria um resumo financeiro destacado
 */
export function createFinancialSummary(
  pdf: jsPDF,
  data: {
    totalCost: number;
    finalPrice: number;
    profit: number;
    marginPercent: number;
    pricePerUnit?: number;
  },
  yPos: number
): number {
  const pageWidth = pdf.internal.pageSize.width;
  
  // Fundo verde claro
  pdf.setFillColor(240, 253, 244);
  pdf.rect(25, yPos, pageWidth - 50, 50, 'F');
  
  // Borda verde
  pdf.setDrawColor(34, 197, 94);
  pdf.setLineWidth(2);
  pdf.rect(25, yPos, pageWidth - 50, 50);
  
  // Título
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESULTADO FINANCEIRO', 35, yPos + 15);
  
  // Valores principais
  pdf.setFontSize(12);
  const col1X = 35;
  const col2X = pageWidth / 2 + 20;
  let valueY = yPos + 25;
  
  // Primeira coluna
  pdf.setFont('helvetica', 'bold');
  pdf.text('Custo Total:', col1X, valueY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`R$ ${data.totalCost.toFixed(2)}`, col1X + 50, valueY);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Lucro:', col1X, valueY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(34, 197, 94);
  pdf.text(`R$ ${data.profit.toFixed(2)}`, col1X + 50, valueY + 8);
  
  // Segunda coluna
  pdf.setTextColor(17, 24, 39);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Preço Final:', col2X, valueY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`R$ ${data.finalPrice.toFixed(2)}`, col2X + 50, valueY);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Margem:', col2X, valueY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(99, 102, 241);
  pdf.text(`${data.marginPercent.toFixed(1)}%`, col2X + 50, valueY + 8);
  
  // Preço por unidade se disponível
  if (data.pricePerUnit) {
    pdf.setTextColor(17, 24, 39);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Preço/Unidade:', col1X, valueY + 16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`R$ ${data.pricePerUnit.toFixed(2)}`, col1X + 65, valueY + 16);
  }
  
  return yPos + 65;
}

/**
 * Cria uma tabela simples e elegante
 */
export function createSimpleTable(
  pdf: jsPDF,
  headers: string[],
  rows: string[][],
  yPos: number
): number {
  const pageWidth = pdf.internal.pageSize.width;
  const tableWidth = pageWidth - 50;
  const colWidth = tableWidth / headers.length;
  
  let currentY = yPos;
  
  // Cabeçalho da tabela
  pdf.setFillColor(99, 102, 241);
  pdf.rect(25, currentY, tableWidth, 12, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  
  headers.forEach((header, index) => {
    const x = 25 + (index * colWidth) + 5;
    pdf.text(header, x, currentY + 8);
  });
  
  currentY += 12;
  
  // Linhas da tabela
  pdf.setTextColor(17, 24, 39);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  rows.forEach((row, rowIndex) => {
    // Fundo alternado
    if (rowIndex % 2 === 1) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(25, currentY, tableWidth, 10, 'F');
    }
    
    row.forEach((cell, colIndex) => {
      const x = 25 + (colIndex * colWidth) + 5;
      pdf.text(cell, x, currentY + 7);
    });
    
    currentY += 10;
  });
  
  // Bordas da tabela
  pdf.setDrawColor(156, 163, 175);
  pdf.setLineWidth(0.3);
  pdf.rect(25, yPos, tableWidth, currentY - yPos);
  
  // Linhas verticais
  for (let i = 1; i < headers.length; i++) {
    const x = 25 + (i * colWidth);
    pdf.line(x, yPos, x, currentY);
  }
  
  return currentY + 10;
}

/**
 * Cria um rodapé profissional
 */
export function createFooter(pdf: jsPDF, mainText: string, subtitle?: string): void {
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Linha divisória
  pdf.setDrawColor(156, 163, 175);
  pdf.setLineWidth(0.5);
  pdf.line(25, pageHeight - 25, pageWidth - 25, pageHeight - 25);
  
  // Texto principal do rodapé
  pdf.setTextColor(156, 163, 175);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(mainText, 25, pageHeight - 15);
  
  // Subtítulo se existir
  if (subtitle) {
    pdf.text(subtitle, 25, pageHeight - 10);
  }
  
  // Nome da empresa no canto direito
  const companyText = 'Gerado por IA.TEX';
  const companyWidth = pdf.getTextWidth(companyText);
  pdf.text(companyText, pageWidth - companyWidth - 25, pageHeight - 15);
  
  // Data de geração
  const dateText = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const dateWidth = pdf.getTextWidth(dateText);
  pdf.text(dateText, pageWidth - dateWidth - 25, pageHeight - 10);
}

/**
 * Adiciona uma imagem de forma inteligente
 */
export async function addImageToPDF(
  pdf: jsPDF,
  imageUrl: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Calcular dimensões proporcionais
        const aspectRatio = img.width / img.height;
        let width = maxWidth;
        let height = maxWidth / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
        
        // Centralizar a imagem
        const centeredX = x + (maxWidth - width) / 2;
        const centeredY = y + (maxHeight - height) / 2;
        
        // Adicionar borda sutil
        pdf.setDrawColor(156, 163, 175);
        pdf.setLineWidth(0.5);
        pdf.rect(centeredX - 2, centeredY - 2, width + 4, height + 4);
        
        // Adicionar a imagem
        pdf.addImage(img, 'JPEG', centeredX, centeredY, width, height);
        
        resolve(y + maxHeight + 10);
      } catch (error) {
        console.error('Erro ao adicionar imagem:', error);
        resolve(y + 10);
      }
    };
    
    img.onerror = () => {
      console.error('Erro ao carregar imagem:', imageUrl);
      resolve(y + 10);
    };
    
    img.src = imageUrl;
  });
}