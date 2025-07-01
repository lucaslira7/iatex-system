import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Scissors, Plus } from "lucide-react";
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

  const { data: fabrics = [], isLoading } = useQuery<Fabric[]>({
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
      return <Badge variant="destructive" className="text-xs">Baixo Estoque</Badge>;
    }
    return <Badge variant="default" className="bg-green-500 text-xs">Disponível</Badge>;
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

  const fabricsArray = fabrics as Fabric[];
  const totalFabrics = fabricsArray.length;
  const lowStockFabrics = fabricsArray.filter((f: Fabric) => parseFloat(f.currentStock.toString()) < 20).length;
  const totalStockValue = fabricsArray.reduce((sum: number, fabric: Fabric) => {
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
          <Button onClick={handleNewFabric} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo Tecido
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-green-700 mb-2">Total de Tecidos</p>
              <p className="text-4xl font-bold text-green-800">{totalFabrics}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-yellow-700 mb-2">Baixo Estoque</p>
              <p className="text-4xl font-bold text-yellow-800">{lowStockFabrics}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-sm font-medium text-red-700 mb-2">Valor Total em Estoque</p>
              <p className="text-2xl font-bold text-red-800">R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Fabric Cards Grid */}
        {fabricsArray.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto max-w-sm">
              <Scissors className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum tecido cadastrado</h3>
              <p className="text-gray-500 mb-6">Comece cadastrando seu primeiro tecido para gerenciar o estoque.</p>
              <Button onClick={handleNewFabric} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Tecido
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fabricsArray.map((fabric: Fabric) => (
              <Card key={fabric.id} className="hover:shadow-lg transition-shadow overflow-hidden bg-white rounded-xl border border-gray-200">
                {/* Fabric Image */}
                <div className="h-40 bg-gradient-to-br from-green-100 to-green-200 relative rounded-t-xl overflow-hidden">
                  {fabric.imageUrl && fabric.imageUrl.length > 0 ? (
                    <img 
                      src={fabric.imageUrl} 
                      alt={fabric.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', fabric.imageUrl);
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully for:', fabric.name);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 relative">
                      <div 
                        className="w-full h-full opacity-50"
                        style={{
                          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.8) 1px, transparent 1px),
                                           radial-gradient(circle at 70% 20%, rgba(34, 197, 94, 0.6) 1px, transparent 1px),
                                           radial-gradient(circle at 30% 80%, rgba(34, 197, 94, 0.7) 1px, transparent 1px),
                                           radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.5) 1px, transparent 1px)`,
                          backgroundSize: '40px 40px, 60px 60px, 50px 50px, 70px 70px'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Fabric Details */}
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 text-xl">{fabric.name}</h3>
                  
                  <p className="text-sm text-gray-600 mb-2">{fabric.type}</p>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {fabric.composition || '91% Poliamida, 9% Elastano'}
                  </p>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {fabric.gramWeight}g/m² • {fabric.usableWidth}cm
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700">
                      Preço por kg: <span className="font-semibold text-blue-600">R$ {parseFloat(fabric.pricePerKg?.toString() || '0').toFixed(2)}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Preço por metro: <span className="font-semibold text-blue-600">R$ {parseFloat(fabric.pricePerMeter?.toString() || '0').toFixed(3)}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Rendimento: <span className="font-semibold">{parseFloat(fabric.yieldEstimate?.toString() || '0').toFixed(2)} m/kg</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      Fornecedor: <span className="font-semibold">RETEC</span>
                    </p>
                  </div>

                  <div className="mb-4">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${parseFloat(fabric.currentStock.toString()) < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {parseFloat(fabric.currentStock.toString()) < 20 ? 'Baixo Estoque' : 'Disponível'}
                    </span>
                    <span className="text-sm text-gray-600 ml-3">
                      Estoque: {parseFloat(fabric.currentStock.toString()).toFixed(0)}kg
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-xs flex-1" onClick={(e) => { e.stopPropagation(); handleEditFabric(fabric); }}>
                      ✏️ Editar
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs flex-1" onClick={(e) => { e.stopPropagation(); /* Handle stock update */ }}>
                      📊 Atualizar Estoque
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteFabric(fabric); }}>
                      🗑️ Excluir
                    </Button>
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