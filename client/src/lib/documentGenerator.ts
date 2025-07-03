import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DocumentData {
  // Dados da empresa
  companyName: string;
  companyCNPJ: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo?: string;
  
  // Dados do cliente
  clientName: string;
  clientCNPJ?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  
  // Dados do documento
  documentNumber: string;
  documentDate: Date;
  validUntil?: Date;
  
  // Itens
  items: Array<{
    code: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    observations?: string;
  }>;
  
  // Totais
  subtotal: number;
  discount?: number;
  taxes?: number;
  total: number;
  
  // Observações
  observations?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
}

export interface ProductionSheetData {
  orderNumber: string;
  modelName: string;
  reference: string;
  fabricName: string;
  fabricConsumption: number;
  totalPieces: number;
  sizes: Array<{
    size: string;
    quantity: number;
    color?: string;
  }>;
  instructions: string;
  qualitySpecs: string;
  dueDate: Date;
  factoryAssigned?: string;
  observations?: string;
}

// Função base para criar cabeçalho profissional
function createProfessionalHeader(pdf: jsPDF, title: string, documentNumber: string, date: Date) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Fundo azul do cabeçalho
  pdf.setFillColor(99, 102, 241);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo e nome da empresa
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('IA.TEX', 20, 18);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Sistema de Gestão para Confecção', 20, 26);
  
  // Título do documento
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 20, 36);
  
  // Informações no canto direito
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nº ${documentNumber}`, pageWidth - 70, 18);
  pdf.text(`Data: ${date.toLocaleDateString('pt-BR')}`, pageWidth - 70, 26);
  
  return 55; // Retorna a posição Y atual
}

// Função para criar rodapé profissional
function createProfessionalFooter(pdf: jsPDF, companyData: Partial<DocumentData>) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const footerY = pageHeight - 25;
  
  // Linha divisória
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  // Texto do rodapé
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text('IA.TEX - Sistema de Gestão para Confecção', 20, footerY);
  pdf.text(`${companyData.companyPhone || 'Tel: (11) 99999-9999'} | ${companyData.companyEmail || 'contato@iatex.com.br'}`, 20, footerY + 6);
  
  // Número da página
  pdf.text('Página 1 de 1', pageWidth - 20, footerY, { align: 'right' });
}

// Função para criar tabela de itens
function createItemsTable(pdf: jsPDF, items: DocumentData['items'], startY: number) {
  let currentY = startY;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const tableWidth = pageWidth - 40;
  
  // Cabeçalho da tabela
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, currentY, tableWidth, 10, 'F');
  
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(20, currentY, tableWidth, 10);
  
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  // Colunas
  pdf.text('Código', 25, currentY + 7);
  pdf.text('Descrição', 60, currentY + 7);
  pdf.text('Qtd', 125, currentY + 7);
  pdf.text('Valor Unit.', 145, currentY + 7);
  pdf.text('Total', pageWidth - 25, currentY + 7, { align: 'right' });
  
  currentY += 10;
  
  // Itens
  pdf.setFont('helvetica', 'normal');
  items.forEach((item, index) => {
    const rowHeight = 8;
    
    // Linha alternada
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, currentY, tableWidth, rowHeight, 'F');
    }
    
    // Bordas
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(20, currentY, tableWidth, rowHeight);
    
    // Conteúdo
    pdf.text(item.code, 25, currentY + 5);
    pdf.text(item.description.length > 25 ? item.description.substring(0, 25) + '...' : item.description, 60, currentY + 5);
    pdf.text(item.quantity.toString(), 125, currentY + 5);
    pdf.text(`R$ ${item.unitPrice.toFixed(2)}`, 145, currentY + 5);
    pdf.text(`R$ ${item.total.toFixed(2)}`, pageWidth - 25, currentY + 5, { align: 'right' });
    
    currentY += rowHeight;
  });
  
  return currentY;
}

/**
 * Gera Orçamento Comercial
 */
export function generateQuotation(data: DocumentData): jsPDF {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  
  let currentY = createProfessionalHeader(pdf, 'ORÇAMENTO COMERCIAL', data.documentNumber, data.documentDate);
  currentY += 10;
  
  // Dados do cliente
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DO CLIENTE', 20, currentY);
  currentY += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nome: ${data.clientName}`, 20, currentY);
  currentY += 5;
  
  if (data.clientCNPJ) {
    pdf.text(`CNPJ: ${data.clientCNPJ}`, 20, currentY);
    currentY += 5;
  }
  
  if (data.clientAddress) {
    pdf.text(`Endereço: ${data.clientAddress}`, 20, currentY);
    currentY += 5;
  }
  
  if (data.clientPhone) {
    pdf.text(`Telefone: ${data.clientPhone}`, 20, currentY);
    currentY += 5;
  }
  
  currentY += 10;
  
  // Tabela de itens
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITENS DO ORÇAMENTO', 20, currentY);
  currentY += 8;
  
  currentY = createItemsTable(pdf, data.items, currentY);
  currentY += 10;
  
  // Totais
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  pdf.text(`Subtotal: R$ ${data.subtotal.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
  currentY += 5;
  
  if (data.discount) {
    pdf.text(`Desconto: R$ ${data.discount.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
    currentY += 5;
  }
  
  if (data.taxes) {
    pdf.text(`Impostos: R$ ${data.taxes.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
    currentY += 5;
  }
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`TOTAL: R$ ${data.total.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
  currentY += 10;
  
  // Condições
  if (data.validUntil) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Válido até: ${data.validUntil.toLocaleDateString('pt-BR')}`, 20, currentY);
    currentY += 5;
  }
  
  if (data.paymentTerms) {
    pdf.text(`Condições de pagamento: ${data.paymentTerms}`, 20, currentY);
    currentY += 5;
  }
  
  if (data.deliveryTerms) {
    pdf.text(`Condições de entrega: ${data.deliveryTerms}`, 20, currentY);
    currentY += 5;
  }
  
  createProfessionalFooter(pdf, data);
  
  return pdf;
}

/**
 * Gera Proposta Comercial
 */
export function generateCommercialProposal(data: DocumentData): jsPDF {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  
  let currentY = createProfessionalHeader(pdf, 'PROPOSTA COMERCIAL', data.documentNumber, data.documentDate);
  currentY += 15;
  
  // Introdução
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const introText = `Prezado(a) ${data.clientName},\n\nApresentamos nossa proposta comercial para o desenvolvimento e confecção dos itens relacionados abaixo. Nossa empresa possui vasta experiência no setor têxtil, garantindo qualidade e pontualidade na entrega.`;
  
  const lines = pdf.splitTextToSize(introText, 170);
  lines.forEach((line: string) => {
    pdf.text(line, 20, currentY);
    currentY += 5;
  });
  
  currentY += 10;
  
  // Tabela de itens
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESPECIFICAÇÃO DOS PRODUTOS', 20, currentY);
  currentY += 8;
  
  currentY = createItemsTable(pdf, data.items, currentY);
  currentY += 15;
  
  // Condições comerciais
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CONDIÇÕES COMERCIAIS', 20, currentY);
  currentY += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const conditions = [
    `• Valor total do investimento: R$ ${data.total.toFixed(2)}`,
    `• Prazo de validade da proposta: ${data.validUntil?.toLocaleDateString('pt-BR') || '30 dias'}`,
    `• Condições de pagamento: ${data.paymentTerms || 'A combinar'}`,
    `• Prazo de entrega: ${data.deliveryTerms || 'A combinar'}`,
    '• Garantia de qualidade conforme especificações técnicas',
    '• Acompanhamento completo do processo produtivo'
  ];
  
  conditions.forEach(condition => {
    pdf.text(condition, 20, currentY);
    currentY += 6;
  });
  
  currentY += 10;
  
  // Observações
  if (data.observations) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVAÇÕES', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const obsLines = pdf.splitTextToSize(data.observations, 170);
    obsLines.forEach((line: string) => {
      pdf.text(line, 20, currentY);
      currentY += 5;
    });
  }
  
  createProfessionalFooter(pdf, data);
  
  return pdf;
}

/**
 * Gera Pedido de Compra
 */
export function generatePurchaseOrder(data: DocumentData): jsPDF {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  
  let currentY = createProfessionalHeader(pdf, 'PEDIDO DE COMPRA', data.documentNumber, data.documentDate);
  currentY += 10;
  
  // Dados do fornecedor
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DADOS DO FORNECEDOR', 20, currentY);
  currentY += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Empresa: ${data.clientName}`, 20, currentY);
  currentY += 5;
  
  if (data.clientCNPJ) {
    pdf.text(`CNPJ: ${data.clientCNPJ}`, 20, currentY);
    currentY += 5;
  }
  
  currentY += 10;
  
  // Tabela de itens
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITENS DO PEDIDO', 20, currentY);
  currentY += 8;
  
  currentY = createItemsTable(pdf, data.items, currentY);
  currentY += 10;
  
  // Total
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`VALOR TOTAL: R$ ${data.total.toFixed(2)}`, pageWidth - 20, currentY, { align: 'right' });
  
  createProfessionalFooter(pdf, data);
  
  return pdf;
}

/**
 * Gera Recibo
 */
export function generateReceipt(data: DocumentData): jsPDF {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  
  let currentY = createProfessionalHeader(pdf, 'RECIBO', data.documentNumber, data.documentDate);
  currentY += 15;
  
  // Texto do recibo
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const receiptText = `Recebemos de ${data.clientName} a quantia de R$ ${data.total.toFixed(2)} (${numberToWords(data.total)}) referente aos serviços/produtos relacionados abaixo.`;
  
  const lines = pdf.splitTextToSize(receiptText, 170);
  lines.forEach((line: string) => {
    pdf.text(line, 20, currentY);
    currentY += 6;
  });
  
  currentY += 10;
  
  // Tabela simplificada
  currentY = createItemsTable(pdf, data.items, currentY);
  currentY += 15;
  
  // Assinatura
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('_'.repeat(40), 20, currentY);
  currentY += 5;
  pdf.text('Assinatura do Responsável', 20, currentY);
  
  createProfessionalFooter(pdf, data);
  
  return pdf;
}

/**
 * Gera Ficha de Produção
 */
export function generateProductionSheet(data: ProductionSheetData): jsPDF {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  
  let currentY = createProfessionalHeader(pdf, 'FICHA DE PRODUÇÃO', data.orderNumber, new Date());
  currentY += 15;
  
  // Dados do modelo
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESPECIFICAÇÕES DO PRODUTO', 20, currentY);
  currentY += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const specs = [
    `Modelo: ${data.modelName}`,
    `Referência: ${data.reference}`,
    `Tecido: ${data.fabricName}`,
    `Consumo por peça: ${data.fabricConsumption}m`,
    `Total de peças: ${data.totalPieces}`,
    `Prazo de entrega: ${data.dueDate.toLocaleDateString('pt-BR')}`,
  ];
  
  if (data.factoryAssigned) {
    specs.push(`Facção responsável: ${data.factoryAssigned}`);
  }
  
  specs.forEach(spec => {
    pdf.text(spec, 20, currentY);
    currentY += 6;
  });
  
  currentY += 10;
  
  // Tabela de tamanhos
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DISTRIBUIÇÃO DE TAMANHOS', 20, currentY);
  currentY += 8;
  
  // Cabeçalho da tabela
  pdf.setFillColor(248, 250, 252);
  pdf.rect(20, currentY, 150, 10, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(20, currentY, 150, 10);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tamanho', 30, currentY + 7);
  pdf.text('Quantidade', 80, currentY + 7);
  pdf.text('Cor', 130, currentY + 7);
  
  currentY += 10;
  
  // Itens da tabela
  pdf.setFont('helvetica', 'normal');
  data.sizes.forEach((size, index) => {
    const rowHeight = 8;
    
    if (index % 2 === 0) {
      pdf.setFillColor(249, 250, 251);
      pdf.rect(20, currentY, 150, rowHeight, 'F');
    }
    
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(20, currentY, 150, rowHeight);
    
    pdf.text(size.size, 30, currentY + 5);
    pdf.text(size.quantity.toString(), 80, currentY + 5);
    pdf.text(size.color || 'Padrão', 130, currentY + 5);
    
    currentY += rowHeight;
  });
  
  currentY += 15;
  
  // Instruções
  if (data.instructions) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INSTRUÇÕES DE PRODUÇÃO', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const instrLines = pdf.splitTextToSize(data.instructions, 170);
    instrLines.forEach((line: string) => {
      pdf.text(line, 20, currentY);
      currentY += 5;
    });
    
    currentY += 10;
  }
  
  // Controle de qualidade
  if (data.qualitySpecs) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CONTROLE DE QUALIDADE', 20, currentY);
    currentY += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const qualityLines = pdf.splitTextToSize(data.qualitySpecs, 170);
    qualityLines.forEach((line: string) => {
      pdf.text(line, 20, currentY);
      currentY += 5;
    });
  }
  
  createProfessionalFooter(pdf, {});
  
  return pdf;
}

/**
 * Gera Relatório Personalizado
 */
export function generateCustomReport(title: string, data: any[], columns: string[]): jsPDF {
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  
  let currentY = createProfessionalHeader(pdf, title.toUpperCase(), `REL-${Date.now()}`, new Date());
  currentY += 15;
  
  // Resumo
  pdf.setTextColor(30, 41, 59);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUMO', 20, currentY);
  currentY += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total de registros: ${data.length}`, 20, currentY);
  pdf.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 20, currentY + 5);
  
  currentY += 20;
  
  // Tabela de dados
  if (data.length > 0) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const tableWidth = pageWidth - 40;
    const columnWidth = tableWidth / columns.length;
    
    // Cabeçalho
    pdf.setFillColor(248, 250, 252);
    pdf.rect(20, currentY, tableWidth, 10, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(20, currentY, tableWidth, 10);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    columns.forEach((column, index) => {
      pdf.text(column, 22 + (index * columnWidth), currentY + 7);
    });
    
    currentY += 10;
    
    // Dados
    pdf.setFont('helvetica', 'normal');
    data.forEach((row, rowIndex) => {
      const rowHeight = 8;
      
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(20, currentY, tableWidth, rowHeight, 'F');
      }
      
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(20, currentY, tableWidth, rowHeight);
      
      columns.forEach((column, colIndex) => {
        const value = row[column] || '';
        const displayValue = value.toString().length > 15 ? value.toString().substring(0, 15) + '...' : value.toString();
        pdf.text(displayValue, 22 + (colIndex * columnWidth), currentY + 5);
      });
      
      currentY += rowHeight;
      
      // Nova página se necessário
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }
    });
  }
  
  createProfessionalFooter(pdf, {});
  
  return pdf;
}

// Função auxiliar para converter número em palavras (simplificada)
function numberToWords(num: number): string {
  const ones = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  
  if (num === 0) return 'zero reais';
  
  let integer = Math.floor(num);
  const decimal = Math.round((num - integer) * 100);
  
  let result = '';
  
  if (integer >= 1000) {
    result += ones[Math.floor(integer / 1000)] + ' mil ';
    integer = integer % 1000;
  }
  
  if (integer >= 100) {
    result += ones[Math.floor(integer / 100)] + 'centos ';
    integer = integer % 100;
  }
  
  if (integer >= 20) {
    result += tens[Math.floor(integer / 10)];
    if (integer % 10 !== 0) {
      result += ' e ' + ones[integer % 10];
    }
  } else if (integer >= 10) {
    result += teens[integer - 10];
  } else if (integer > 0) {
    result += ones[integer];
  }
  
  result += ' reais';
  
  if (decimal > 0) {
    result += ' e ' + decimal + ' centavos';
  }
  
  return result;
}