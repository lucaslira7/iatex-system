import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Scale, Calculator, Info } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';
import type { Fabric } from '@shared/schema';

const STANDARD_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'];

export default function Step2Sizes() {
  const { formData, updateFormData } = usePricing();
  const [customSize, setCustomSize] = useState('');

  // Fetch fabrics para mostrar dados do tecido
  const { data: fabrics = [] } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });

  const selectedFabric = fabrics.find(f => f.id === formData.fabricId);

  const calculateFabricCost = (weight: number) => {
    if (!selectedFabric || !weight) return 'R$ 0,00';
    
    const pricePerKg = parseFloat(selectedFabric.pricePerKg?.toString() || '0');
    const wasteMultiplier = 1 + (formData.wastePercentage / 100);
    const costPerPiece = (weight / 1000) * pricePerKg * wasteMultiplier;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(costPerPiece);
  };

  const updateSizeWeight = (size: string, weight: number) => {
    const updatedSizes = [...formData.sizes];
    const existingIndex = updatedSizes.findIndex(s => s.size === size);
    
    if (existingIndex >= 0) {
      if (weight <= 0) {
        updatedSizes.splice(existingIndex, 1);
      } else {
        updatedSizes[existingIndex] = {
          ...updatedSizes[existingIndex],
          weight,
          quantity: formData.pricingMode === 'multiple' ? updatedSizes[existingIndex].quantity || 1 : 1
        };
      }
    } else if (weight > 0) {
      updatedSizes.push({ 
        size, 
        quantity: 1, // Padrão (não será usado)
        weight
      });
    }
    
    updateFormData('sizes', updatedSizes);
  };

  const getSizeWeight = (size: string) => {
    const sizeData = formData.sizes.find(s => s.size === size);
    return sizeData?.weight === 0 ? '' : (sizeData?.weight || '');
  };

  const getSizeWeightNumber = (size: string): number => {
    const sizeData = formData.sizes.find(s => s.size === size);
    return typeof sizeData?.weight === 'number' ? sizeData.weight : 0;
  };

  const removeSize = (size: string) => {
    const updatedSizes = formData.sizes.filter(s => s.size !== size);
    updateFormData('sizes', updatedSizes);
  };

  const addCustomSize = () => {
    if (customSize.trim() && !formData.sizes.find(s => s.size === customSize.trim())) {
      updateSizeWeight(customSize.trim(), 0);
      setCustomSize('');
    }
  };

  const updateSizeQuantity = (size: string, quantity: number) => {
    const updatedSizes = [...formData.sizes];
    const existingIndex = updatedSizes.findIndex(s => s.size === size);
    
    if (existingIndex >= 0) {
      updatedSizes[existingIndex] = {
        ...updatedSizes[existingIndex],
        quantity: Math.max(0, quantity)
      };
      updateFormData('sizes', updatedSizes);
    }
  };

  const getSizeQuantity = (size: string) => {
    const sizeData = formData.sizes.find(s => s.size === size);
    return sizeData?.quantity === 0 ? '' : (sizeData?.quantity || '');
  };

  const getSizeQuantityNumber = (size: string): number => {
    const sizeData = formData.sizes.find(s => s.size === size);
    return typeof sizeData?.quantity === 'number' ? sizeData.quantity : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configuração de Tamanhos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure o peso de cada tamanho para calcular o consumo de tecido.
        </p>
      </div>

      {/* Informações do Tecido Selecionado */}
      {selectedFabric && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-blue-900 dark:text-blue-100">
              <Scale className="w-5 h-5 mr-2" />
              Tecido Utilizado: {selectedFabric.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Tipo:</span>
                <div className="text-blue-900 dark:text-blue-100">{selectedFabric.type}</div>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Gramatura:</span>
                <div className="text-blue-900 dark:text-blue-100">
                  {selectedFabric.gramWeight} g/m²
                </div>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Largura:</span>
                <div className="text-blue-900 dark:text-blue-100">
                  {selectedFabric.usableWidth} cm
                </div>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300 font-medium">Preço/kg:</span>
                <div className="text-blue-900 dark:text-blue-100">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(parseFloat(selectedFabric.pricePerKg?.toString() || '0'))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tamanhos Padrão */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tamanhos Padrão
        </h3>
        <div className="grid gap-4">
          {STANDARD_SIZES.map((size) => (
            <Card key={size} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Badge variant="outline" className="text-lg px-4 py-2 min-w-[50px] justify-center">
                    {size}
                  </Badge>
                  
                  <div className={`grid gap-4 flex-1 ${formData.pricingMode === 'multiple' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                    <div>
                      <Label htmlFor={`weight-${size}`}>Peso (g)</Label>
                      <Input
                        id={`weight-${size}`}
                        type="number"
                        placeholder="Ex: 250"
                        value={getSizeWeight(size) || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          updateSizeWeight(size, value);
                        }}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Peso da peça pronta em gramas
                      </p>
                    </div>
                    
                    {formData.pricingMode === 'multiple' && (
                      <div>
                        <Label htmlFor={`quantity-${size}`}>Quantidade</Label>
                        <Input
                          id={`quantity-${size}`}
                          type="number"
                          placeholder="Ex: 10"
                          value={getSizeQuantity(size) || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            updateSizeQuantity(size, value);
                          }}
                          className="mt-1"
                          min="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Quantas peças deste tamanho
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <Label>Custo do Tecido</Label>
                      <div className="mt-1 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                        <span className="text-green-700 dark:text-green-300 font-medium text-lg">
                          {calculateFabricCost(getSizeWeightNumber(size))}
                        </span>
                        {formData.pricingMode === 'multiple' && getSizeQuantityNumber(size) > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Total: {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(parseFloat(calculateFabricCost(getSizeWeightNumber(size)).replace(/[^\d,]/g, '').replace(',', '.')) * getSizeQuantityNumber(size))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {getSizeWeightNumber(size) > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSize(size)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tamanhos Personalizados */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tamanhos Personalizados
        </h3>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nome do tamanho personalizado"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSize()}
          />
          <Button onClick={addCustomSize} disabled={!customSize.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {formData.sizes
          .filter(s => !STANDARD_SIZES.includes(s.size))
          .map((sizeData) => (
            <Card key={sizeData.size} className="p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Badge variant="secondary" className="text-lg px-4 py-2 min-w-[50px] justify-center">
                    {sizeData.size}
                  </Badge>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <div>
                      <Label htmlFor={`weight-${sizeData.size}`}>Peso (g)</Label>
                      <Input
                        id={`weight-${sizeData.size}`}
                        type="number"
                        placeholder="Ex: 250"
                        value={sizeData.weight || ''}
                        onChange={(e) => updateSizeWeight(sizeData.size, e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Custo do Tecido</Label>
                      <div className="mt-1 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                        <span className="text-green-700 dark:text-green-300 font-medium text-lg">
                          {calculateFabricCost(sizeData.weight)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSize(sizeData.size)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
      </div>

      {/* Dicas */}
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            💡 Dicas:
          </h3>
          <div className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
            <div>• <strong>Peso:</strong> Peso da peça pronta em gramas (ex: 250g para uma camisa)</div>
            <div>• <strong>Desperdício:</strong> {formData.wastePercentage}% de desperdício é considerado automaticamente</div>
            <div>• <strong>Custo do tecido:</strong> Calculado baseado no peso e preço por kg</div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Tamanhos Configurados */}
      {formData.sizes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Resumo dos Tamanhos Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.sizes.map((size) => (
                <div key={size.size} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-lg">{size.size}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{size.weight}g</div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {calculateFabricCost(size.weight)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}