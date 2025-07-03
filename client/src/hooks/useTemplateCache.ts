import { useState, useCallback } from 'react';

interface TemplateData {
  template: any;
  sizes: any[];
  costs: any[];
}

const templateCache = new Map<number, TemplateData>();

export function useTemplateCache() {
  const [loading, setLoading] = useState(false);

  const getTemplateData = useCallback(async (templateId: number): Promise<TemplateData> => {
    // Verificar cache primeiro
    if (templateCache.has(templateId)) {
      return templateCache.get(templateId)!;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/pricing-templates/${templateId}/details`);
      if (!response.ok) throw new Error('Failed to fetch template details');
      
      const data = await response.json();
      
      // Salvar no cache
      templateCache.set(templateId, data);
      
      return data;
    } catch (error) {
      console.error('Error loading template data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    templateCache.clear();
  }, []);

  return { getTemplateData, loading, clearCache };
}