// Funções globais de formatação para o padrão brasileiro

export const formatCurrencyBR = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatDateBR = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR'); // exibe como DD/MM/AAAA
};

export const formatNumberBR = (value: number): string => {
  return value.toLocaleString('pt-BR');
};

export const formatPercentageBR = (value: number): string => {
  return `${value.toFixed(1).replace('.', ',')}%`;
};

export const formatCurrencyCompact = (value: number): string => {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  } else if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}K`;
  } else {
    return formatCurrencyBR(value);
  }
};

export const formatNumberCompact = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace('.', ',')}K`;
  } else {
    return value.toString();
  }
};