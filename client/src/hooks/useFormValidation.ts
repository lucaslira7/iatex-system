import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';

interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => string | null;
  realTime?: boolean;
}

interface UseFormValidationOptions<T> {
  schema?: z.ZodSchema<T>;
  rules?: ValidationRule<T>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  options: UseFormValidationOptions<T> = {}
) {
  const { schema, rules = [], validateOnChange = true, validateOnBlur = true } = options;
  
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Validar campo específico
  const validateField = useCallback((field: keyof T, value: any): string | null => {
    // Validação com Zod schema
    if (schema) {
      try {
        // Validar o objeto inteiro e extrair erro do campo específico
        const result = schema.safeParse({ ...data, [field]: value });
        if (!result.success) {
          const fieldError = result.error.errors.find(e => e.path.includes(field as string));
          if (fieldError) {
            return fieldError.message;
          }
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors[0]?.message || 'Valor inválido';
        }
      }
    }

    // Validação com regras customizadas
    const rule = rules.find(r => r.field === field);
    if (rule) {
      return rule.validator(value);
    }

    return null;
  }, [schema, rules]);

  // Validar todos os campos
  const validateAll = useCallback((): boolean => {
    setIsValidating(true);
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(data).forEach(key => {
      const field = key as keyof T;
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsValidating(false);
    return isValid;
  }, [data, validateField]);

  // Atualizar campo
  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  }, [validateField, validateOnChange]);

  // Marcar campo como tocado
  const touchField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (validateOnBlur && !touched[field]) {
      const error = validateField(field, data[field]);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  }, [validateField, validateOnBlur, data, touched]);

  // Reset do formulário
  const reset = useCallback((newData?: T) => {
    setData(newData || initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  // Verificar se há erros
  const hasErrors = Object.values(errors).some(error => !!error);
  const hasFieldError = (field: keyof T) => !!errors[field] && touched[field];

  return {
    data,
    errors,
    touched,
    isValidating,
    hasErrors,
    updateField,
    touchField,
    validateAll,
    validateField,
    hasFieldError,
    reset,
  };
}

// Validadores comuns
export const commonValidators = {
  required: (value: any) => 
    !value || (typeof value === 'string' && value.trim() === '') 
      ? 'Este campo é obrigatório' 
      : null,
      
  email: (value: string) => 
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? 'Email inválido'
      : null,
      
  minLength: (min: number) => (value: string) =>
    value && value.length < min
      ? `Mínimo de ${min} caracteres`
      : null,
      
  maxLength: (max: number) => (value: string) =>
    value && value.length > max
      ? `Máximo de ${max} caracteres`
      : null,
      
  numeric: (value: string) =>
    value && !/^\d+$/.test(value)
      ? 'Apenas números são permitidos'
      : null,
      
  decimal: (value: string) =>
    value && !/^\d+(\.\d+)?$/.test(value)
      ? 'Formato de número inválido'
      : null,
      
  positive: (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num <= 0 ? 'Valor deve ser positivo' : null;
  },
      
  currency: (value: string) =>
    value && !/^\d+([.,]\d{2})?$/.test(value.replace('R$ ', ''))
      ? 'Formato de moeda inválido'
      : null,
};

// Hook específico para precificação
export function usePricingValidation(initialData: any) {
  return useFormValidation(initialData, {
    rules: [
      { field: 'modelName', validator: commonValidators.required },
      { field: 'garmentType', validator: commonValidators.required },
      { field: 'reference', validator: commonValidators.required },
      { field: 'fabricId', validator: commonValidators.required },
      { 
        field: 'sizes', 
        validator: (sizes: any[]) => 
          !sizes || sizes.length === 0 || !sizes.some(s => s.weight > 0)
            ? 'Pelo menos um tamanho deve ter peso definido'
            : null
      },
    ],
    validateOnChange: true,
    validateOnBlur: true,
  });
}