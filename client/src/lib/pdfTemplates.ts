import jsPDF from 'jspdf';

// Cores do sistema IA.TEX
export const COLORS = {
  primary: [99, 102, 241] as [number, number, number], // Índigo
  secondary: [156, 163, 175] as [number, number, number], // Cinza
  accent: [34, 197, 94] as [number, number, number], // Verde
  warning: [251, 191, 36] as [number, number, number], // Amarelo
  danger: [239, 68, 68] as [number, number, number], // Vermelho
  dark: [17, 24, 39] as [number, number, number], // Cinza escuro
  light: [249, 250, 251] as [number, number, number], // Cinza claro
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number]
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
  pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleWidth = pdf.getTextWidth(data.title);
  pdf.text(data.title, (pageWidth - titleWidth) / 2, yPos);
  yPos += 20;

  // Subtítulo (se fornecido)
  if (data.subtitle) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    const subtitleWidth = pdf.getTextWidth(data.subtitle);
    pdf.text(data.subtitle, (pageWidth - subtitleWidth) / 2, yPos);
    yPos += 15;
  }

  // Referência (se fornecida)
  if (data.reference) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    const refWidth = pdf.getTextWidth(`Ref: ${data.reference}`);
    pdf.text(`Ref: ${data.reference}`, (pageWidth - refWidth) / 2, yPos);
    yPos += 15;
  }

  // Data (se fornecida)
  if (data.date) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    const dateWidth = pdf.getTextWidth(data.date);
    pdf.text(data.date, (pageWidth - dateWidth) / 2, yPos);
    yPos += 20;
  }

  // Linha separadora
  pdf.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  pdf.line(25, yPos, pageWidth - 25, yPos);
  yPos += 20;

  return yPos;
}

/**
 * Cria uma seção com título
 */
export function createSection(
  pdf: jsPDF,
  title: string,
  yPos: number,
  backgroundColor: [number, number, number] = COLORS.light,
  textColor: [number, number, number] = COLORS.dark
): number {
  const pageWidth = pdf.internal.pageSize.width;

  // Fundo da seção
  pdf.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
  pdf.rect(25, yPos, pageWidth - 50, 15, 'F');

  // Título da seção
  pdf.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  pdf.rect(25, yPos, 5, 15, 'F');

  // Texto do título
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 35, yPos + 10);

  return yPos + 25;
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
    headerBackground?: [number, number, number];
    headerText?: [number, number, number];
    alternateRows?: boolean;
    borderColor?: [number, number, number];
  } = {}
): number {
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 25;
  const tableWidth = pageWidth - (margin * 2);
  const colWidth = tableWidth / headers.length;
  const rowHeight = 12;

  const headerBackground = options.headerBackground || COLORS.primary;
  const headerText = options.headerText || COLORS.white;
  const borderColor = options.borderColor || COLORS.primary;

  // Cabeçalho da tabela
  pdf.setFillColor(headerBackground[0], headerBackground[1], headerBackground[2]);
  pdf.rect(margin, yPos, tableWidth, rowHeight, 'F');

  pdf.setTextColor(headerText[0], headerText[1], headerText[2]);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');

  headers.forEach((header, index) => {
    const x = margin + (index * colWidth) + 5;
    pdf.text(header, x, yPos + 8);
  });

  yPos += rowHeight;

  // Linhas da tabela
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  rows.forEach((row, rowIndex) => {
    // Cor de fundo alternada
    if (options.alternateRows && rowIndex % 2 === 1) {
      pdf.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
      pdf.rect(margin, yPos, tableWidth, rowHeight, 'F');
    }

    pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);

    row.forEach((cell, colIndex) => {
      const x = margin + (colIndex * colWidth) + 5;
      pdf.text(cell, x, yPos + 8);
    });

    yPos += rowHeight;
  });

  // Bordas da tabela
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.rect(margin, yPos - (rows.length * rowHeight), tableWidth, (rows.length + 1) * rowHeight);

  return yPos + 10;
}

/**
 * Cria um card de informações
 */
export function createInfoCard(
  pdf: jsPDF,
  title: string,
  items: { label: string; value: string; highlight?: boolean }[],
  yPos: number,
  backgroundColor: [number, number, number] = COLORS.light,
  borderColor: [number, number, number] = COLORS.primary
): number {
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 25;
  const cardWidth = pageWidth - (margin * 2);
  const itemHeight = 15;
  const padding = 10;

  // Fundo do card
  pdf.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
  pdf.rect(margin, yPos, cardWidth, (items.length + 1) * itemHeight + padding * 2, 'F');

  // Borda do card
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.rect(margin, yPos, cardWidth, (items.length + 1) * itemHeight + padding * 2);

  // Título do card
  pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin + padding, yPos + padding + 8);

  yPos += itemHeight + padding;

  // Itens do card
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  items.forEach(item => {
    if (item.highlight) {
      pdf.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    } else {
      pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    }

    pdf.text(`${item.label}: ${item.value}`, margin + padding, yPos + 8);
    yPos += itemHeight;
  });

  return yPos + padding;
}

/**
 * Cria um resumo financeiro
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
  const margin = 25;
  const cardWidth = pageWidth - (margin * 2);

  // Título da seção
  pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumo Financeiro', margin, yPos);
  yPos += 20;

  // Card do resumo
  const items = [
    { label: 'Custo Total', value: `R$ ${data.totalCost.toFixed(2)}`, highlight: false },
    { label: 'Preço Final', value: `R$ ${data.finalPrice.toFixed(2)}`, highlight: true },
    { label: 'Lucro', value: `R$ ${data.profit.toFixed(2)}`, highlight: true },
    { label: 'Margem', value: `${data.marginPercent.toFixed(1)}%`, highlight: true }
  ];

  if (data.pricePerUnit) {
    items.push({ label: 'Preço por Unidade', value: `R$ ${data.pricePerUnit.toFixed(2)}`, highlight: false });
  }

  return createInfoCard(pdf, 'Dados Financeiros', items, yPos);
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

  // Linha separadora
  pdf.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  pdf.line(25, pageHeight - 60, pageWidth - 25, pageHeight - 60);

  // Texto principal
  pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(text, 25, pageHeight - 45);

  // Subtítulo (se fornecido)
  if (subtitle) {
    pdf.setFontSize(9);
    pdf.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
    pdf.text(subtitle, 25, pageHeight - 35);
  }

  // Informações da empresa
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
  const companyInfo = `${company.name} - ${company.slogan}`;
  const companyWidth = pdf.getTextWidth(companyInfo);
  pdf.text(companyInfo, pageWidth - 25 - companyWidth, pageHeight - 45);

  // Data de geração
  const date = new Date().toLocaleDateString('pt-BR');
  const dateWidth = pdf.getTextWidth(`Gerado em: ${date}`);
  pdf.text(`Gerado em: ${date}`, pageWidth - 25 - dateWidth, pageHeight - 35);
}

/**
 * Adiciona uma imagem ao PDF
 */
export async function addImageToPDF(
  pdf: jsPDF,
  imageUrl: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
): Promise<number> {
  try {
    // Carregar imagem
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Adicionar imagem ao PDF
    const imageData = pdf.addImage(uint8Array, 'JPEG', x, y, maxWidth, maxHeight);

    return y + maxHeight;
  } catch (error) {
    console.error('Erro ao adicionar imagem:', error);
    return y;
  }
}