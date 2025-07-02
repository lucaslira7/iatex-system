import jsPDF from 'jspdf';

// Cores do sistema IA.TEX
export const COLORS = {
  primary: [99, 102, 241], // Índigo
  secondary: [156, 163, 175], // Cinza
  accent: [34, 197, 94], // Verde
  warning: [251, 191, 36], // Amarelo
  danger: [239, 68, 68], // Vermelho
  dark: [17, 24, 39], // Cinza escuro
  light: [249, 250, 251], // Cinza claro
  white: [255, 255, 255],
  black: [0, 0, 0]
};

// Interface para dados do cabeçalho
export interface HeaderData {
  title: string;
  subtitle?: string;
  reference?: string;
  date?: string;
  logo?: string;
}

// Interface para informações da empresa
export interface CompanyInfo {
  name: string;
  slogan: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

// Configurações padrão da empresa
export const DEFAULT_COMPANY: CompanyInfo = {
  name: 'IA.TEX',
  slogan: 'Sistema de Gestão para Confecção',
  address: 'Rua da Confecção, 123 - Centro',
  phone: '(11) 9999-9999',
  email: 'contato@iatex.com.br',
  website: 'www.iatex.com.br'
};

/**
 * Cria um cabeçalho profissional padronizado
 */
export function createProfessionalHeader(
  pdf: jsPDF, 
  data: HeaderData, 
  company: CompanyInfo = DEFAULT_COMPANY
): number {
  const pageWidth = pdf.internal.pageSize.width;
  let yPos = 0;

  // Fundo do cabeçalho com gradiente simulado
  pdf.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  pdf.rect(0, 0, pageWidth, 60, 'F');
  
  // Linha decorativa superior
  pdf.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  pdf.rect(0, 0, pageWidth, 3, 'F');
  
  // Logo/Nome da empresa
  pdf.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text(company.name, 25, 35);
  
  // Slogan
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(company.slogan, 25, 47);
  
  // Informações de contato (lado direito)
  if (company.phone || company.email) {
    pdf.setFontSize(9);
    let contactY = 20;
    
    if (company.phone) {
      pdf.text(`Tel: ${company.phone}`, pageWidth - 70, contactY);
      contactY += 8;
    }
    
    if (company.email) {
      pdf.text(`Email: ${company.email}`, pageWidth - 70, contactY);
      contactY += 8;
    }
    
    if (company.website) {
      pdf.text(company.website, pageWidth - 70, contactY);
    }
  }
  
  yPos = 80;
  
  // Título do documento
  pdf.setTextColor(...COLORS.dark);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleWidth = pdf.getTextWidth(data.title);
  pdf.text(data.title, (pageWidth - titleWidth) / 2, yPos);
  
  yPos += 15;
  
  // Subtítulo se existir
  if (data.subtitle) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...COLORS.secondary);
    const subtitleWidth = pdf.getTextWidth(data.subtitle);
    pdf.text(data.subtitle, (pageWidth - subtitleWidth) / 2, yPos);
    yPos += 10;
  }
  
  // Informações do documento (referência e data)
  if (data.reference || data.date) {
    pdf.setFontSize(11);
    pdf.setTextColor(...COLORS.dark);
    
    if (data.reference) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Referência: `, 25, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.reference, 60, yPos);
    }
    
    if (data.date) {
      const dateText = `Data: ${data.date}`;
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, pageWidth - dateWidth - 25, yPos);
    }
    
    yPos += 15;
  }
  
  // Linha divisória
  pdf.setDrawColor(...COLORS.secondary);
  pdf.setLineWidth(0.5);
  pdf.line(25, yPos, pageWidth - 25, yPos);
  
  return yPos + 15;
}

/**
 * Cria uma seção com título e fundo
 */
export function createSection(
  pdf: jsPDF, 
  title: string, 
  yPos: number, 
  backgroundColor: number[] = COLORS.light,
  textColor: number[] = COLORS.dark
): number {
  const pageWidth = pdf.internal.pageSize.width;
  
  // Fundo da seção
  pdf.setFillColor(...backgroundColor);
  pdf.rect(25, yPos - 5, pageWidth - 50, 25, 'F');
  
  // Borda esquerda colorida
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(25, yPos - 5, 4, 25, 'F');
  
  // Título da seção
  pdf.setTextColor(...textColor);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 35, yPos + 8);
  
  return yPos + 30;
}

/**
 * Cria uma tabela profissional
 */
export function createTable(
  pdf: jsPDF,
  headers: string[],
  rows: string[][],
  yPos: number,
  options: {
    headerBackground?: number[];
    headerText?: number[];
    alternateRows?: boolean;
    borderColor?: number[];
  } = {}
): number {
  const pageWidth = pdf.internal.pageSize.width;
  const tableWidth = pageWidth - 50;
  const colWidth = tableWidth / headers.length;
  
  const {
    headerBackground = COLORS.primary,
    headerText = COLORS.white,
    alternateRows = true,
    borderColor = COLORS.secondary
  } = options;
  
  let currentY = yPos;
  
  // Cabeçalho da tabela
  pdf.setFillColor(...headerBackground);
  pdf.rect(25, currentY, tableWidth, 12, 'F');
  
  pdf.setTextColor(...headerText);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  
  headers.forEach((header, index) => {
    const x = 25 + (index * colWidth) + 5;
    pdf.text(header, x, currentY + 8);
  });
  
  currentY += 12;
  
  // Linhas da tabela
  pdf.setTextColor(...COLORS.dark);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  rows.forEach((row, rowIndex) => {
    // Fundo alternado
    if (alternateRows && rowIndex % 2 === 1) {
      pdf.setFillColor(...COLORS.light);
      pdf.rect(25, currentY, tableWidth, 10, 'F');
    }
    
    row.forEach((cell, colIndex) => {
      const x = 25 + (colIndex * colWidth) + 5;
      pdf.text(cell, x, currentY + 7);
    });
    
    currentY += 10;
  });
  
  // Bordas da tabela
  pdf.setDrawColor(...borderColor);
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
 * Cria um card de informações destacado
 */
export function createInfoCard(
  pdf: jsPDF,
  title: string,
  items: { label: string; value: string; highlight?: boolean }[],
  yPos: number,
  backgroundColor: number[] = COLORS.light,
  borderColor: number[] = COLORS.primary
): number {
  const pageWidth = pdf.internal.pageSize.width;
  const cardWidth = pageWidth - 50;
  const cardHeight = (items.length * 8) + 20;
  
  // Fundo do card
  pdf.setFillColor(...backgroundColor);
  pdf.rect(25, yPos, cardWidth, cardHeight, 'F');
  
  // Borda do card
  pdf.setDrawColor(...borderColor);
  pdf.setLineWidth(1);
  pdf.rect(25, yPos, cardWidth, cardHeight);
  
  // Título do card
  pdf.setTextColor(...COLORS.dark);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 35, yPos + 15);
  
  let itemY = yPos + 25;
  
  // Items do card
  pdf.setFontSize(11);
  items.forEach(item => {
    // Label
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...COLORS.dark);
    pdf.text(`${item.label}: `, 35, itemY);
    
    // Value
    pdf.setFont('helvetica', 'normal');
    if (item.highlight) {
      pdf.setTextColor(...COLORS.primary);
    } else {
      pdf.setTextColor(...COLORS.dark);
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
  pdf.setDrawColor(...COLORS.accent);
  pdf.setLineWidth(2);
  pdf.rect(25, yPos, pageWidth - 50, 50);
  
  // Título
  pdf.setTextColor(...COLORS.dark);
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
  pdf.setTextColor(...COLORS.accent);
  pdf.text(`R$ ${data.profit.toFixed(2)}`, col1X + 50, valueY + 8);
  
  // Segunda coluna
  pdf.setTextColor(...COLORS.dark);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Preço Final:', col2X, valueY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`R$ ${data.finalPrice.toFixed(2)}`, col2X + 50, valueY);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Margem:', col2X, valueY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...COLORS.primary);
  pdf.text(`${data.marginPercent.toFixed(1)}%`, col2X + 50, valueY + 8);
  
  // Preço por unidade se disponível
  if (data.pricePerUnit) {
    pdf.setTextColor(...COLORS.dark);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Preço/Unidade:', col1X, valueY + 16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`R$ ${data.pricePerUnit.toFixed(2)}`, col1X + 65, valueY + 16);
  }
  
  return yPos + 65;
}

/**
 * Cria um rodapé profissional
 */
export function createFooter(
  pdf: jsPDF, 
  text: string, 
  subtitle?: string,
  company: CompanyInfo = DEFAULT_COMPANY
): void {
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Linha divisória
  pdf.setDrawColor(...COLORS.secondary);
  pdf.setLineWidth(0.5);
  pdf.line(25, pageHeight - 25, pageWidth - 25, pageHeight - 25);
  
  // Texto principal do rodapé
  pdf.setTextColor(...COLORS.secondary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(text, 25, pageHeight - 15);
  
  // Subtítulo se existir
  if (subtitle) {
    pdf.text(subtitle, 25, pageHeight - 10);
  }
  
  // Nome da empresa no canto direito
  const companyText = `Gerado por ${company.name}`;
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
 * Adiciona uma imagem com posicionamento inteligente
 */
export async function addImageToPDF(
  pdf: jsPDF,
  imageUrl: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
): Promise<number> {
  return new Promise((resolve, reject) => {
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
        pdf.setDrawColor(...COLORS.secondary);
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