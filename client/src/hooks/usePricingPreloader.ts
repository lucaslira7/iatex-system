import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Pré-carregamento de dados essenciais para precificação
export const usePricingPreloader = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Pré-carrega dados essenciais em paralelo
    const preloadEssentialData = async () => {
      try {
        // Pré-carrega tecidos (mais usado)
        queryClient.prefetchQuery({
          queryKey: ['/api/fabrics'],
          staleTime: 2 * 60 * 1000, // 2 minutos
        });

        // Pré-carrega tipos de peça
        queryClient.prefetchQuery({
          queryKey: ['/api/garment-types'],
          staleTime: 5 * 60 * 1000, // 5 minutos
        });

        // Pré-carrega categorias de custo
        queryClient.prefetchQuery({
          queryKey: ['/api/cost-categories'],
          staleTime: 5 * 60 * 1000, // 5 minutos
        });

        // Pré-carrega fornecedores
        queryClient.prefetchQuery({
          queryKey: ['/api/suppliers'],
          staleTime: 10 * 60 * 1000, // 10 minutos
        });

      } catch (error) {
        console.warn('Erro no pré-carregamento:', error);
      }
    };

    // Executa pré-carregamento com delay para não impactar carregamento inicial
    const timer = setTimeout(preloadEssentialData, 500);

    return () => clearTimeout(timer);
  }, [queryClient]);

  // Função para pré-carregar dados específicos do step
  const preloadStepData = (stepNumber: number) => {
    switch (stepNumber) {
      case 2: // Step de tecidos
        queryClient.prefetchQuery({
          queryKey: ['/api/fabrics'],
          staleTime: 2 * 60 * 1000,
        });
        break;
      case 4: // Step de custos de criação
        queryClient.prefetchQuery({
          queryKey: ['/api/cost-categories'],
          staleTime: 5 * 60 * 1000,
        });
        break;
      case 5: // Step de insumos
        queryClient.prefetchQuery({
          queryKey: ['/api/suppliers'],
          staleTime: 10 * 60 * 1000,
        });
        break;
    }
  };

  return { preloadStepData };
};