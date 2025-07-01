import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Scissors, AlertTriangle, DollarSign, Plus } from "lucide-react";
import FabricModal from "./modals/FabricModal";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Fabric } from "@shared/schema";

export default function FabricManagement() {
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fabrics = [], isLoading } = useQuery({
    queryKey: ["/api/fabrics"],
  });

  const deleteFabricMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/fabrics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fabrics"] });
      toast({
        title: "Sucesso",
        description: "Tecido excluído com sucesso",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você será redirecionado para fazer login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro",
        description: "Falha ao excluir tecido",
        variant: "destructive",
      });
    },
  });

  const handleNewFabric = () => {
    setSelectedFabric(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const handleEditFabric = (fabric: Fabric) => {
    setSelectedFabric(fabric);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  const handleDeleteFabric = (fabric: Fabric) => {
    if (confirm(`Tem certeza que deseja excluir o tecido "${fabric.name}"?`)) {
      deleteFabricMutation.mutate(fabric.id);
    }
  };

  const getStatusBadge = (fabric: Fabric) => {
    const stock = parseFloat(fabric.currentStock.toString());
    if (stock < 20) {
      return <Badge variant="destructive" className="fabric-status-badge fabric-status-low-stock">Baixo Estoque</Badge>;
    }
    return <Badge variant="default" className="fabric-status-badge fabric-status-available bg-green-500">Disponível</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalFabrics = fabrics.length;
  const lowStockFabrics = fabrics.filter((f: Fabric) => parseFloat(f.currentStock.toString()) < 20).length;
  const totalStockValue = fabrics.reduce((sum: number, fabric: Fabric) => {
    const stock = parseFloat(fabric.currentStock.toString());
    const pricePerKg = parseFloat(fabric.pricePerKg?.toString() || '0');
    return sum + (stock * pricePerKg);
  }, 0);

  return (
    <>
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tecidos</h1>
            <p className="text-sm text-gray-500 mt-1">Gerenciamento de estoque de tecidos</p>
          </div>
          <Button onClick={handleNewFabric} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Novo Tecido
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="kpi-icon bg-blue-100 mr-4">
                  <Scissors className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Tecidos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFabrics}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="kpi-icon bg-red-100 mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Baixo Estoque</p>
                  <p className="text-2xl font-bold text-red-600">{lowStockFabrics}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="kpi-icon bg-green-100 mr-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor em Estoque</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {(totalStockValue / 1000).toFixed(1)}K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fabric Cards Grid */}
        {fabrics.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto max-w-sm">
              <Scissors className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum tecido cadastrado</h3>
              <p className="text-gray-500 mb-6">Comece cadastrando seu primeiro tecido para gerenciar o estoque.</p>
              <Button onClick={handleNewFabric} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Tecido
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fabrics.map((fabric: Fabric) => (
              <Card key={fabric.id} className="fabric-card" onClick={() => handleEditFabric(fabric)}>
                <div className="fabric-card-image">
                  {fabric.imageUrl ? (
                    <img 
                      src={fabric.imageUrl} 
                      alt={fabric.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Scissors className="h-12 w-12 text-blue-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(fabric)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{fabric.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {fabric.type} • {fabric.gramWeight}g/m²
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      R$ {parseFloat(fabric.pricePerKg?.toString() || '0').toFixed(2)}/kg
                    </span>
                    <span className={`text-sm ${parseFloat(fabric.currentStock.toString()) < 20 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {parseFloat(fabric.currentStock.toString()).toFixed(1)}kg em estoque
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Preço/metro: R$ {parseFloat(fabric.pricePerMeter?.toString() || '0').toFixed(3)}</p>
                    <p>Rendimento: {parseFloat(fabric.yieldEstimate?.toString() || '0').toFixed(2)} m/kg</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <FabricModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fabric={selectedFabric}
        isCreating={isCreating}
        onDelete={handleDeleteFabric}
      />
    </>
  );
}
