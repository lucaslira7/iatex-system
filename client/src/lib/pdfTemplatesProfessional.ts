// Este arquivo foi substituído por pdfProfessional.ts - versão simplificada e funcional

// Cores profissionais do sistema
export const COLORS = {
  primary: [99, 102, 241] as [number, number, number], // Índigo
  secondary: [156, 163, 175] as [number, number, number], // Cinza médio
  accent: [34, 197, 94] as [number, number, number], // Verde
  background: [248, 250, 252] as [number, number, number], // Azul muito claro
  border: [226, 232, 240] as [number, number, number], // Cinza claro
  text: [30, 41, 59] as [number, number, number], // Cinza escuro
  textLight: [100, 116, 139] as [number, number, number], // Cinza médio
  white: [255, 255, 255] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [251, 191, 36] as [number, number, number],
  error: [239, 68, 68] as [number, number, number]
};

export interface ProfessionalPDFData {
  // Dados básicos
  modelName: string;
  reference: string;
  description?: string;
  garmentType: string;
  imageUrl?: string;
  
  // Dados de precificação
  fabricName?: string;
  fabricConsumption: number;
  wastePercentage: number;
  profitMargin: number;
  totalCost: number;
  finalPrice: number;
  
  // Breakdown de custos
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
  
  // Tamanhos
  sizes: Array<{
    size: string;
    quantity: number;
    weight: number;
  }>;
}

/**
 * Classe para geração de PDFs profissionais
 */
export class ProfessionalPDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.pdf = new jsPDF('portrait', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  /**
   * Adiciona cabeçalho profissional
   */
  private addHeader(title: string, reference: string) {
    // Fundo do cabeçalho
    this.pdf.setFillColor(99, 102, 241);
    this.pdf.rect(0, 0, this.pageWidth, 40, 'F');

    // Logo/Nome da empresa
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('IA.TEX', this.margin, 15);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Sistema de Gestão para Confecção', this.margin, 22);

    // Título do documento
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin, 32);

    // Referência e data
    const date = new Date().toLocaleDateString('pt-BR');
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Referência: ${reference}`, this.pageWidth - 80, 25);
    this.pdf.text(`Data: ${date}`, this.pageWidth - 80, 32);

    this.currentY = 50;
  }

  /**
   * Adiciona seção com título e fundo
   */
  private addSection(title: string, height: number = 8) {
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), height, 'F');
    
    this.pdf.setDrawColor(226, 232, 240);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), height);
    
    this.pdf.setTextColor(30, 41, 59);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin + 5, this.currentY + 5.5);
    
    this.currentY += height + 5;
  }

  /**
   * Adiciona tabela de custos profissional
   */
  private addCostTable(costs: any[], title: string) {
    if (costs.length === 0) return;

    this.addSection(title);

    // Cabeçalho da tabela
    const headers = ['Descrição', 'Valor Unit.', 'Qtd.', 'Desperdício', 'Total'];
    const colWidths = [60, 25, 20, 25, 25];
    const startX = this.margin;
    
    // Fundo do cabeçalho
    this.pdf.setFillColor(156, 163, 175);
    this.pdf.rect(startX, this.currentY, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
    
    // Bordas do cabeçalho
    this.pdf.setDrawColor(226, 232, 240);
    let x = startX;
    for (let i = 0; i < headers.length; i++) {
      this.pdf.rect(x, this.currentY, colWidths[i], 8);
      x += colWidths[i];
    }

    // Texto do cabeçalho
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    x = startX;
    for (let i = 0; i < headers.length; i++) {
      this.pdf.text(headers[i], x + 2, this.currentY + 5.5);
      x += colWidths[i];
    }

    this.currentY += 8;

    // Linhas de dados
    this.pdf.setTextColor(30, 41, 59);
    this.pdf.setFont('helvetica', 'normal');
    
    costs.forEach((cost, index) => {
      // Cor alternada para as linhas
      if (index % 2 === 0) {
        this.pdf.setFillColor(250, 250, 250);
        this.pdf.rect(startX, this.currentY, colWidths.reduce((a, b) => a + b, 0), 6, 'F');
      }

      // Bordas da linha
      x = startX;
      for (let i = 0; i < colWidths.length; i++) {
        this.pdf.rect(x, this.currentY, colWidths[i], 6);
        x += colWidths[i];
      }

      // Dados da linha
      const values = [
        cost.description,
        `R$ ${cost.unitValue.toFixed(2)}`,
        cost.quantity.toString(),
        `${cost.wastePercentage}%`,
        `R$ ${cost.total.toFixed(2)}`
      ];

      x = startX;
      for (let i = 0; i < values.length; i++) {
        const align = i === 0 ? 'left' : 'right';
        const textX = align === 'left' ? x + 2 : x + colWidths[i] - 2;
        this.pdf.text(values[i], textX, this.currentY + 4, { align });
        x += colWidths[i];
      }

      this.currentY += 6;
    });

    this.currentY += 5;
  }

  /**
   * Adiciona informações básicas do modelo
   */
  private addModelInfo(data: ProfessionalPDFData) {
    this.addSection('INFORMAÇÕES DO MODELO');

    const info = [
      ['Nome do Modelo:', data.modelName],
      ['Referência:', data.reference],
      ['Tipo de Peça:', data.garmentType],
      ['Descrição:', data.description || 'Não informado'],
      ['Tecido:', data.fabricName || 'Não informado'],
      ['Consumo de Tecido:', `${data.fabricConsumption} metros`],
      ['Desperdício:', `${data.wastePercentage}%`]
    ];

    this.pdf.setTextColor(...COLORS.text);
    this.pdf.setFontSize(10);

    info.forEach(([label, value]) => {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(label, this.margin + 5, this.currentY);
      
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(value, this.margin + 60, this.currentY);
      
      this.currentY += 5;
    });

    this.currentY += 5;
  }

  /**
   * Adiciona tabela de tamanhos
   */
  private addSizesTable(sizes: any[]) {
    if (sizes.length === 0) return;

    this.addSection('GRADE DE TAMANHOS');

    const headers = ['Tamanho', 'Quantidade', 'Peso (g)'];
    const colWidths = [40, 40, 40];
    const startX = this.margin;
    
    // Cabeçalho
    this.pdf.setFillColor(...COLORS.secondary);
    this.pdf.rect(startX, this.currentY, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
    
    this.pdf.setTextColor(...COLORS.white);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    
    let x = startX;
    headers.forEach((header, i) => {
      this.pdf.rect(x, this.currentY, colWidths[i], 8);
      this.pdf.text(header, x + 2, this.currentY + 5.5);
      x += colWidths[i];
    });

    this.currentY += 8;

    // Dados
    this.pdf.setTextColor(...COLORS.text);
    this.pdf.setFont('helvetica', 'normal');
    
    sizes.forEach((size, index) => {
      if (index % 2 === 0) {
        this.pdf.setFillColor(250, 250, 250);
        this.pdf.rect(startX, this.currentY, colWidths.reduce((a, b) => a + b, 0), 6, 'F');
      }

      x = startX;
      const values = [size.size, size.quantity.toString(), `${size.weight}g`];
      
      values.forEach((value, i) => {
        this.pdf.rect(x, this.currentY, colWidths[i], 6);
        this.pdf.text(value, x + 2, this.currentY + 4);
        x += colWidths[i];
      });

      this.currentY += 6;
    });

    this.currentY += 10;
  }

  /**
   * Adiciona resumo financeiro
   */
  private addFinancialSummary(data: ProfessionalPDFData) {
    this.addSection('RESUMO FINANCEIRO');

    // Cálculos
    const totalCreation = data.creationCosts.reduce((sum, cost) => sum + cost.total, 0);
    const totalSupplies = data.supplies.reduce((sum, cost) => sum + cost.total, 0);
    const totalLabor = data.labor.reduce((sum, cost) => sum + cost.total, 0);
    const totalFixed = data.fixedCosts.reduce((sum, cost) => sum + cost.total, 0);

    const summaryData = [
      ['Custos de Criação:', `R$ ${totalCreation.toFixed(2)}`],
      ['Insumos:', `R$ ${totalSupplies.toFixed(2)}`],
      ['Mão de Obra:', `R$ ${totalLabor.toFixed(2)}`],
      ['Custos Fixos:', `R$ ${totalFixed.toFixed(2)}`],
      ['', ''], // Linha em branco
      ['CUSTO TOTAL:', `R$ ${data.totalCost.toFixed(2)}`],
      ['Margem de Lucro:', `${data.profitMargin}%`],
      ['PREÇO FINAL:', `R$ ${data.finalPrice.toFixed(2)}`]
    ];

    summaryData.forEach(([label, value], index) => {
      if (label === '') {
        this.currentY += 3;
        return;
      }

      const isTotal = label.includes('TOTAL') || label.includes('FINAL');
      
      if (isTotal) {
        // Fundo destacado para totais
        this.pdf.setFillColor(...COLORS.success);
        this.pdf.rect(this.margin, this.currentY - 2, this.pageWidth - (this.margin * 2), 8, 'F');
        this.pdf.setTextColor(...COLORS.white);
        this.pdf.setFont('helvetica', 'bold');
      } else {
        this.pdf.setTextColor(...COLORS.text);
        this.pdf.setFont('helvetica', 'normal');
      }

      this.pdf.setFontSize(10);
      this.pdf.text(label, this.margin + 5, this.currentY + 2);
      this.pdf.text(value, this.pageWidth - this.margin - 5, this.currentY + 2, { align: 'right' });
      
      this.currentY += 6;
    });

    this.currentY += 10;
  }

  /**
   * Adiciona rodapé profissional
   */
  private addFooter() {
    const footerY = this.pageHeight - 20;
    
    // Linha divisória
    this.pdf.setDrawColor(...COLORS.border);
    this.pdf.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    // Texto do rodapé
    this.pdf.setTextColor(...COLORS.textLight);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    this.pdf.text('IA.TEX - Sistema de Gestão para Confecção', this.margin, footerY);
    this.pdf.text('www.iatex.com.br | contato@iatex.com.br', this.margin, footerY + 5);
    
    // Número da página
    this.pdf.text(`Página 1 de 1`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  /**
   * Gera ficha técnica profissional
   */
  generateTechnicalSheet(data: ProfessionalPDFData): jsPDF {
    this.addHeader('FICHA TÉCNICA', data.reference);
    this.addModelInfo(data);
    this.addSizesTable(data.sizes);
    this.addCostTable(data.creationCosts, 'CUSTOS DE CRIAÇÃO');
    this.addCostTable(data.supplies, 'INSUMOS');
    this.addCostTable(data.labor, 'MÃO DE OBRA');
    this.addCostTable(data.fixedCosts, 'CUSTOS FIXOS');
    this.addFinancialSummary(data);
    this.addFooter();
    
    return this.pdf;
  }

  /**
   * Gera resumo de precificação profissional
   */
  generatePricingSummary(data: ProfessionalPDFData): jsPDF {
    this.addHeader('RESUMO DE PRECIFICAÇÃO', data.reference);
    this.addModelInfo(data);
    this.addFinancialSummary(data);
    this.addFooter();
    
    return this.pdf;
  }
}

/**
 * Função utilitária para gerar ficha técnica
 */
export function generateProfessionalTechnicalSheet(data: ProfessionalPDFData): jsPDF {
  const generator = new ProfessionalPDFGenerator();
  return generator.generateTechnicalSheet(data);
}

/**
 * Função utilitária para gerar resumo de precificação
 */
export function generateProfessionalPricingSummary(data: ProfessionalPDFData): jsPDF {
  const generator = new ProfessionalPDFGenerator();
  return generator.generatePricingSummary(data);
}