import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus, Users, Package, Scale, Calculator } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';
import type { Fabric } from '@shared/schema';

const STANDARD_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'];

// Pesos sugeridos por tamanho (em gramas) baseados no tecido selecionado
const WEIGHT_SUGGESTIONS = {
  'PP': { base: 120, factor: 0.8 },
  'P': { base: 130, factor: 0.9 },
  'M': { base: 150, factor: 1.0 },
  'G': { base: 170, factor: 1.1 },
  'GG': { base: 190, factor: 1.2 },
  'XG': { base: 210, factor: 1.3 },
  'XXG': { base: 230, factor: 1.4 },
};

export default function Step2Sizes() {
  const { formData, updateFormData } = usePricing();
  const [customSize, setCustomSize] = useState('');

  // Fetch fabrics para calcular peso baseado na gramatura
  const { data: fabrics = [] } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });

  const selectedFabric = fabrics.find(f => f.id === formData.fabricId);

  const calculateSuggestedWeight = (size: string) => {
    if (!selectedFabric || !formData.fabricConsumption) return 150;
    
    const suggestion = WEIGHT_SUGGESTIONS[size as keyof typeof WEIGHT_SUGGESTIONS];
    if (!suggestion) return 150; // Peso padrão para tamanhos personalizados
    
    // Calcula baseado na gramatura do tecido e consumo
    const fabricGramWeight = selectedFabric.gramWeight || 150;
    const consumption = formData.fabricConsumption * (1 + (formData.wastePercentage || 10) / 100);
    const usableWidth = (selectedFabric.usableWidth || 150) / 100; // converte cm para metros
    
    // Peso aproximado = gramatura * área de tecido usado
    const approximateWeight = Math.round(fabricGramWeight * consumption * usableWidth * suggestion.factor);
    
    return approximateWeight;
  };

  const updateSizeData = (size: string, quantity: number, weight?: number) => {
    const updatedSizes = [...formData.sizes];
    const existingIndex = updatedSizes.findIndex(s => s.size === size);
    
    if (existingIndex >= 0) {
      if (quantity <= 0) {
        updatedSizes.splice(existingIndex, 1);
      } else {
        updatedSizes[existingIndex] = {
          ...updatedSizes[existingIndex],
          quantity,
          weight: weight !== undefined ? weight : updatedSizes[existingIndex].weight
        };
      }
    } else if (quantity > 0) {
      updatedSizes.push({ 
        size, 
        quantity, 
        weight: weight !== undefined ? weight : calculateSuggestedWeight(size)
      });
    }
    
    updateFormData('sizes', updatedSizes);
    
    // Calcular consumo automaticamente após atualizar tamanhos
    calculateAndUpdateConsumption(updatedSizes);
  };

  const calculateAndUpdateConsumption = (sizes: typeof formData.sizes) => {
    if (!selectedFabric || !selectedFabric.gramWeight || sizes.length === 0) {
      updateFormData('fabricConsumption', 0);
      return;
    }

    // Calcular peso médio ponderado
    const totalQuantity = sizes.reduce((sum, size) => sum + size.quantity, 0);
    const totalWeight = sizes.reduce((sum, size) => sum + (size.quantity * size.weight), 0);
    
    if (totalQuantity === 0) {
      updateFormData('fabricConsumption', 0);
      return;
    }

    const averageWeight = totalWeight / totalQuantity; // peso médio em gramas
    const fabricGramWeight = selectedFabric.gramWeight; // g/m²
    const usableWidth = (selectedFabric.usableWidth || 150) / 100; // converter cm para metros

    // Cálculo: peso da peça (g) ÷ (gramatura do tecido (g/m²) × largura útil (m))
    // Resultado em metros lineares necessários por peça
    const consumptionPerPiece = averageWeight / (fabricGramWeight * usableWidth);
    
    updateFormData('fabricConsumption', Math.max(0, consumptionPerPiece));
  };

  const getSizeData = (size: string) => {
    const sizeData = formData.sizes.find(s => s.size === size);
    return sizeData || { quantity: 0, weight: calculateSuggestedWeight(size) };
  };

  const addCustomSize = () => {
    if (customSize.trim() && !formData.sizes.find(s => s.size === customSize.trim())) {
      updateSizeData(customSize.trim(), 1, 150);
      setCustomSize('');
    }
  };

  const getTotalQuantity = () => {
    return formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  };

  const getTotalWeight = () => {
    return formData.sizes.reduce((sum, size) => sum + (size.quantity * size.weight), 0);
  };

  const getAverageWeight = () => {
    const totalQty = getTotalQuantity();
    return totalQty > 0 ? getTotalWeight() / totalQty : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tamanhos, Quantidades e Pesos *</h3>
        <p className="text-sm text-gray-500">
          Defina os tamanhos, quantidades e peso estimado de cada tamanho. 
          {selectedFabric && formData.fabricConsumption && (
            <span className="text-blue-600 ml-1">
              Os pesos são calculados automaticamente baseados no tecido selecionado.
            </span>
          )}
        </p>
      </div>

      {/* Standard Sizes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STANDARD_SIZES.map((size) => {
          const sizeData = getSizeData(size);
          return (
            <div key={size} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-gray-900 text-lg">{size}</div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateSizeData(size, Math.max(0, sizeData.quantity - 1))}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={sizeData.quantity}
                    onChange={(e) => updateSizeData(size, parseInt(e.target.value) || 0)}
                    className="w-16 text-center h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateSizeData(size, sizeData.quantity + 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {sizeData.quantity > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm flex items-center">
                    <Scale className="h-3 w-3 mr-1" />
                    Peso por peça (gramas)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0"
                      value={sizeData.weight}
                      onChange={(e) => updateSizeData(size, sizeData.quantity, parseInt(e.target.value) || 0)}
                      className="flex-1 h-8"
                      placeholder="150"
                    />
                    <span className="text-xs text-gray-500">g</span>
                    {selectedFabric && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateSizeData(size, sizeData.quantity, calculateSuggestedWeight(size))}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Auto
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total: {(sizeData.quantity * sizeData.weight / 1000).toFixed(2)}kg
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Size */}
      <div className="space-y-3">
        <Label className="font-medium">Adicionar Tamanho Personalizado</Label>
        <div className="flex space-x-2">
          <Input
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            placeholder="Ex: 3XG, Baby, Infantil..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addCustomSize}
            disabled={!customSize.trim()}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Custom Sizes List */}
      {formData.sizes.filter(s => !STANDARD_SIZES.includes(s.size)).length > 0 && (
        <div className="space-y-2">
          <Label className="font-medium">Tamanhos Personalizados</Label>
          <div className="space-y-2">
            {formData.sizes
              .filter(s => !STANDARD_SIZES.includes(s.size))
              .map((sizeData) => (
                <div key={sizeData.size} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{sizeData.size}</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateSizeData(sizeData.size, Math.max(0, sizeData.quantity - 1))}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min="0"
                        value={sizeData.quantity}
                        onChange={(e) => updateSizeData(sizeData.size, parseInt(e.target.value) || 0)}
                        className="w-16 text-center h-8"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateSizeData(sizeData.size, sizeData.quantity + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm w-16">Peso (g):</Label>
                    <Input
                      type="number"
                      min="0"
                      value={sizeData.weight}
                      onChange={(e) => updateSizeData(sizeData.size, sizeData.quantity, parseInt(e.target.value) || 0)}
                      className="flex-1 h-8"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {getTotalQuantity() > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">Total de Peças</span>
                </div>
                <div className="text-xl font-bold text-green-900">{getTotalQuantity()}</div>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                  <Scale className="h-4 w-4" />
                  <span className="text-sm font-medium">Peso Total</span>
                </div>
                <div className="text-xl font-bold text-green-900">{(getTotalWeight() / 1000).toFixed(2)}kg</div>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Peso Médio</span>
                </div>
                <div className="text-xl font-bold text-green-900">{getAverageWeight().toFixed(0)}g</div>
              </div>
              <div>
                <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">Tamanhos</span>
                </div>
                <div className="text-sm font-semibold text-green-900">
                  {formData.sizes.filter(s => s.quantity > 0).length} tipos
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="text-sm text-green-700">
                <strong>Distribuição:</strong> {formData.sizes.filter(s => s.quantity > 0).map(s => `${s.size}(${s.quantity}x${s.weight}g)`).join(', ')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cálculo Automático de Consumo */}
      {selectedFabric && formData.sizes.length > 0 && getTotalQuantity() > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Consumo de Tecido Calculado Automaticamente
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <span className="text-blue-600 block">Peso Médio</span>
                <div className="font-semibold text-lg text-blue-900">
                  {getAverageWeight().toFixed(0)}g
                </div>
              </div>
              <div>
                <span className="text-blue-600 block">Gramatura</span>
                <div className="font-semibold text-lg text-blue-900">
                  {selectedFabric.gramWeight}g/m²
                </div>
              </div>
              <div>
                <span className="text-blue-600 block">Largura Útil</span>
                <div className="font-semibold text-lg text-blue-900">
                  {selectedFabric.usableWidth}cm
                </div>
              </div>
              <div>
                <span className="text-blue-600 block">Consumo Base</span>
                <div className="font-bold text-xl text-green-700">
                  {formData.fabricConsumption.toFixed(3)}m
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-xs text-blue-700">
                <strong>Fórmula:</strong> Peso médio ({getAverageWeight().toFixed(0)}g) ÷ (Gramatura × Largura útil) = {formData.fabricConsumption.toFixed(3)}m por peça
              </div>
              <div className="text-xs text-blue-700 mt-1">
                <strong>Próxima etapa:</strong> Este consumo será usado para calcular o custo total do tecido com desperdício de {formData.wastePercentage}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}