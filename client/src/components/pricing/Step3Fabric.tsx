import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Shirt, Calculator } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';
import type { Fabric } from '@shared/schema';

export default function Step3Fabric() {
  const { formData, updateFormData } = usePricing();
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);

  // Fetch fabrics
  const { data: fabrics = [] } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });

  const handleFabricSelect = (fabricId: string) => {
    const fabric = fabrics.find(f => f.id.toString() === fabricId);
    if (fabric) {
      setSelectedFabric(fabric);
      updateFormData('fabricId', fabric.id);
    }
  };

  const handleConsumptionChange = (consumption: number) => {
    updateFormData('fabricConsumption', consumption);
  };

  const calculateTotalFabricCost = () => {
    if (!selectedFabric || !formData.fabricConsumption) return 0;
    
    const totalQuantity = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
    const totalConsumption = formData.fabricConsumption * totalQuantity;
    const pricePerMeter = parseFloat(selectedFabric.pricePerMeter?.toString() || '0');
    
    return totalConsumption * pricePerMeter;
  };

  const getTotalQuantity = () => {
    return formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-4">
          Escolha do Tecido *
        </Label>
        <p className="text-sm text-gray-500 mb-4">
          Selecione o tecido principal que será usado na confecção das peças.
        </p>
      </div>

      {/* Seleção de Tecido */}
      <div>
        <Label htmlFor="fabric">Tecido Principal *</Label>
        <Select value={formData.fabricId?.toString() || ''} onValueChange={handleFabricSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um tecido" />
          </SelectTrigger>
          <SelectContent>
            {fabrics.map((fabric) => (
              <SelectItem key={fabric.id} value={fabric.id.toString()}>
                <div className="flex items-center space-x-2">
                  <Shirt className="h-4 w-4 text-gray-500" />
                  <span>{fabric.name} - {fabric.type}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Detalhes do Tecido Selecionado */}
      {selectedFabric && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {selectedFabric.imageUrl && (
                <img
                  src={selectedFabric.imageUrl}
                  alt={selectedFabric.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{selectedFabric.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedFabric.type}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Composição:</span>
                    <p className="font-medium">{selectedFabric.composition || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Gramatura:</span>
                    <p className="font-medium">{selectedFabric.gramWeight}g/m²</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Largura útil:</span>
                    <p className="font-medium">{selectedFabric.usableWidth}cm</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Preço por metro:</span>
                    <p className="font-medium text-blue-600">
                      R$ {parseFloat(selectedFabric.pricePerMeter?.toString() || '0').toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração de Desperdício */}
      <div>
        <Label htmlFor="wastePercentage">Desperdício do Corte (%) *</Label>
        <div className="mt-1 relative">
          <Input
            id="wastePercentage"
            type="number"
            step="1"
            min="0"
            max="50"
            value={formData.wastePercentage || 10}
            onChange={(e) => updateFormData('wastePercentage', e.target.value === '' ? 0 : parseFloat(e.target.value) || 10)}
            placeholder="10"
            className="pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Perda normal no processo de corte que será aplicada sobre o consumo calculado
        </p>
      </div>

      {/* Aviso sobre cálculo automático */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Calculator className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Cálculo Automático de Consumo</h4>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                O consumo de tecido será calculado automaticamente na próxima etapa baseado nos pesos 
                de cada tamanho e na gramatura do tecido selecionado ({selectedFabric?.gramWeight || 0}g/m²).
              </p>
              <p className="mt-1 font-medium">
                Próxima etapa: Cadastrar tamanhos e pesos para calcular o consumo total.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sugestões de Consumo */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <Calculator className="h-4 w-4 mr-2" />
          Sugestões de Consumo
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <button
            onClick={() => handleConsumptionChange(0.6)}
            className="text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium">Camiseta Baby Look</div>
            <div className="text-gray-500">0.6m</div>
          </button>
          <button
            onClick={() => handleConsumptionChange(0.8)}
            className="text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium">Camiseta Básica</div>
            <div className="text-gray-500">0.8m</div>
          </button>
          <button
            onClick={() => handleConsumptionChange(1.2)}
            className="text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium">Camiseta Oversized</div>
            <div className="text-gray-500">1.2m</div>
          </button>
          <button
            onClick={() => handleConsumptionChange(1.8)}
            className="text-left px-3 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium">Calça Legging</div>
            <div className="text-gray-500">1.8m</div>
          </button>
        </div>
      </div>

      {/* Cálculo Total */}
      {selectedFabric && formData.fabricConsumption && getTotalQuantity() > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Cálculo do Tecido</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700">Consumo por peça:</span>
              <span className="font-semibold text-green-900 ml-2">{formData.fabricConsumption.toFixed(2)}m</span>
            </div>
            <div>
              <span className="text-green-700">Total de peças:</span>
              <span className="font-semibold text-green-900 ml-2">{getTotalQuantity()}</span>
            </div>
            <div>
              <span className="text-green-700">Total de tecido:</span>
              <span className="font-semibold text-green-900 ml-2">
                {(formData.fabricConsumption * getTotalQuantity()).toFixed(2)}m
              </span>
            </div>
            <div>
              <span className="text-green-700">Custo total:</span>
              <span className="font-semibold text-green-900 ml-2">
                R$ {calculateTotalFabricCost().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}