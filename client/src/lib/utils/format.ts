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