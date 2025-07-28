import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/utils';
import type { Fabric, FabricFormData, FabricFilters } from '@/types/fabric';

export const useFabricManagement = () => {
    const [filters, setFilters] = useState<FabricFilters>({});
    const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch fabrics with filters
    const { data: fabrics = [], isLoading, error } = useQuery<Fabric[]>({
        queryKey: ['/api/fabrics', filters],
        staleTime: 2 * 60 * 1000, // 2 minutos
        refetchInterval: 5 * 60 * 1000, // 5 minutos
    });

    // Create fabric mutation
    const createFabricMutation = useMutation({
        mutationFn: async (fabricData: FabricFormData) => {
            const response = await apiRequest('POST', '/api/fabrics', fabricData);
            return await response.json();
        },
        onSuccess: (newFabric: Fabric) => {
            queryClient.invalidateQueries({ queryKey: ['/api/fabrics'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
            setIsModalOpen(false);
            setSelectedFabric(null);
            toast({
                title: "Tecido Criado",
                description: `${newFabric.name} foi adicionado com sucesso.`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao Criar Tecido",
                description: error.message || "Não foi possível criar o tecido.",
                variant: "destructive",
            });
        },
    });

    // Update fabric mutation
    const updateFabricMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<FabricFormData> }) => {
            const response = await apiRequest('PUT', `/api/fabrics/${id}`, data);
            return await response.json();
        },
        onSuccess: (updatedFabric: Fabric) => {
            queryClient.invalidateQueries({ queryKey: ['/api/fabrics'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
            setIsModalOpen(false);
            setSelectedFabric(null);
            toast({
                title: "Tecido Atualizado",
                description: `${updatedFabric.name} foi atualizado com sucesso.`,
            });
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao Atualizar Tecido",
                description: error.message || "Não foi possível atualizar o tecido.",
                variant: "destructive",
            });
        },
    });

    // Delete fabric mutation
    const deleteFabricMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest('DELETE', `/api/fabrics/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/fabrics'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
            toast({
                title: "Tecido Removido",
                description: "Tecido removido com sucesso.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Erro ao Remover Tecido",
                description: error.message || "Não foi possível remover o tecido.",
                variant: "destructive",
            });
        },
    });

    // Filter fabrics
    const filteredFabrics = useCallback(() => {
        return fabrics.filter(fabric => {
            if (filters.search && !fabric.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            if (filters.type && fabric.type !== filters.type) {
                return false;
            }
            if (filters.status && fabric.status !== filters.status) {
                return false;
            }
            if (filters.minPrice && fabric.pricePerKg < filters.minPrice) {
                return false;
            }
            if (filters.maxPrice && fabric.pricePerKg > filters.maxPrice) {
                return false;
            }
            return true;
        });
    }, [fabrics, filters]);

    // Calculate fabric statistics
    const fabricStats = useCallback(() => {
        const total = fabrics.length;
        const lowStock = fabrics.filter(f => f.status === 'low_stock').length;
        const outOfStock = fabrics.filter(f => f.status === 'out_of_stock').length;
        const totalValue = fabrics.reduce((sum, f) => sum + (f.currentStock * f.pricePerKg), 0);
        const averagePrice = total > 0 ? fabrics.reduce((sum, f) => sum + f.pricePerKg, 0) / total : 0;

        return {
            total,
            lowStock,
            outOfStock,
            totalValue,
            averagePrice,
            available: total - lowStock - outOfStock,
        };
    }, [fabrics]);

    // Handle fabric selection
    const handleSelectFabric = useCallback((fabric: Fabric) => {
        setSelectedFabric(fabric);
        setIsModalOpen(true);
    }, []);

    // Handle fabric creation
    const handleCreateFabric = useCallback((data: FabricFormData) => {
        createFabricMutation.mutate(data);
    }, [createFabricMutation]);

    // Handle fabric update
    const handleUpdateFabric = useCallback((id: number, data: Partial<FabricFormData>) => {
        updateFabricMutation.mutate({ id, data });
    }, [updateFabricMutation]);

    // Handle fabric deletion
    const handleDeleteFabric = useCallback((id: number) => {
        if (confirm('Tem certeza que deseja remover este tecido?')) {
            deleteFabricMutation.mutate(id);
        }
    }, [deleteFabricMutation]);

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<FabricFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);

    // Close modal
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedFabric(null);
    }, []);

    return {
        // Data
        fabrics: filteredFabrics(),
        stats: fabricStats(),
        selectedFabric,
        filters,
        isModalOpen,

        // Loading states
        isLoading,
        isCreating: createFabricMutation.isPending,
        isUpdating: updateFabricMutation.isPending,
        isDeleting: deleteFabricMutation.isPending,

        // Error
        error,

        // Actions
        handleSelectFabric,
        handleCreateFabric,
        handleUpdateFabric,
        handleDeleteFabric,
        updateFilters,
        clearFilters,
        closeModal,
        openModal: () => setIsModalOpen(true),
    };
}; 