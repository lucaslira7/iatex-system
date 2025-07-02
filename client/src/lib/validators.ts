// Sistema de validação para IA.TEX
export const validators = {
  // Validação de preços
  validatePrice: (price: string | number): boolean => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numPrice) && numPrice >= 0;
  },

  // Validação de referências
  validateReference: (reference: string): boolean => {
    return reference.length >= 2 && reference.length <= 50 && /^[A-Z0-9-]+$/i.test(reference);
  },

  // Validação de consumo de tecido
  validateFabricConsumption: (consumption: string | number): boolean => {
    const numConsumption = typeof consumption === 'string' ? parseFloat(consumption) : consumption;
    return !isNaN(numConsumption) && numConsumption > 0 && numConsumption <= 100;
  },

  // Validação de margem de lucro
  validateProfitMargin: (margin: string | number): boolean => {
    const numMargin = typeof margin === 'string' ? parseFloat(margin) : margin;
    return !isNaN(numMargin) && numMargin >= 0 && numMargin <= 1000;
  },

  // Validação de email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validação de telefone brasileiro
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^\(?[1-9]{2}\)?\s?9?[6-9][0-9]{3}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validação de CEP
  validateCEP: (cep: string): boolean => {
    const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
    return cepRegex.test(cep);
  }
};

// Sistema de formatação
export const formatters = {
  // Formatação de moeda brasileira
  currency: (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  },

  // Formatação de porcentagem
  percentage: (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return `${(numValue || 0).toFixed(2)}%`;
  },

  // Formatação de telefone
  phone: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return value;
  },

  // Formatação de CEP
  cep: (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 8) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    }
    return value;
  }
};

// Sistema de sanitização
export const sanitizers = {
  // Remove caracteres especiais para referências
  reference: (value: string): string => {
    return value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
  },

  // Remove caracteres não numéricos
  numbersOnly: (value: string): string => {
    return value.replace(/\D/g, '');
  },

  // Limita tamanho de string
  limitString: (value: string, maxLength: number): string => {
    return value.slice(0, maxLength);
  }
};