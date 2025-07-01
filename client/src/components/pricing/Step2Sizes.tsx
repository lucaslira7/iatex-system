import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Scale, Calculator } from 'lucide-react';
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
          quantity: 1 // Manter 1 como padrão (não será usado para cálculo)
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
    return sizeData?.weight || 0;
  };

  const addCustomSize = () => {
    if (customSize.trim() && !formData.sizes.find(s => s.size === customSize.trim())) {
      updateSizeWeight(customSize.trim(), 250); // Peso padrão
      setCustomSize('');
    }
  };

  const removeSize = (size: string) => {
    const updatedSizes = formData.sizes.filter(s => s.size !== size);
    updateFormData('sizes', updatedSizes);
  };

  const getConfiguredSizes = () => {
    return formData.sizes.filter(s => s.weight > 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tamanhos e Configurações</h3>
        <p className="text-sm text-gray-500">
          Configure o peso de cada tamanho que será produzido. As quantidades serão definidas em cada pedido específico.
        </p>
      </div>

      {/* Tecido Selecionado - Info */}
      {selectedFabric && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Scale className="h-4 w-4 mr-2" />
              Tecido Utilizado: {selectedFabric.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-blue-600">Tipo:</span>
                <div className="font-medium">{selectedFabric.type}</div>
              </div>
              <div>
                <span className="text-blue-600">Gramatura:</span>
                <div className="font-medium">{selectedFabric.gramWeight} g/m²</div>
              </div>
              <div>
                <span className="text-blue-600">Largura:</span>
                <div className="font-medium">{selectedFabric.usableWidth} cm</div>
              </div>
              <div>
                <span className="text-blue-600">Desperdício:</span>
                <div className="font-medium">{formData.wastePercentage}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração de Tamanhos */}
      <div className="space-y-4">
        {/* Standard Sizes */}
        {STANDARD_SIZES.map((size) => {
          const weight = getSizeWeight(size);
          const isConfigured = weight > 0;
          
          return (
            <div key={size} className={`border rounded-lg p-4 ${isConfigured ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-center">
                    <span className="font-medium text-lg">{size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Peso (g)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="2000"
                      value={weight || ''}
                      onChange={(e) => updateSizeWeight(size, parseInt(e.target.value) || 0)}
                      placeholder="Ex: 250"
                      className="w-24 h-8"
                    />
                    <span className="text-sm text-gray-500">g</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Margem (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={0}
                      className="w-20 h-8"
                    />
                  </div>
                </div>
                {isConfigured && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSize(size)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Peso da peça pronta em gramas • Margem de lucro específica para este tamanho
              </div>
            </div>
          );
        })}

        {/* Custom Sizes já configurados */}
        {formData.sizes
          .filter(s => !STANDARD_SIZES.includes(s.size))
          .map((sizeData) => (
            <div key={sizeData.size} className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-center">
                    <span className="font-medium text-lg">{sizeData.size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Peso (g)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="2000"
                      value={sizeData.weight}
                      onChange={(e) => updateSizeWeight(sizeData.size, parseInt(e.target.value) || 0)}
                      className="w-24 h-8"
                    />
                    <span className="text-sm text-gray-500">g</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Margem (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={0}
                      className="w-20 h-8"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSize(sizeData.size)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Peso da peça pronta em gramas • Margem de lucro específica para este tamanho
              </div>
            </div>
          ))}

        {/* Adicionar novo tamanho */}
        <div className="border border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder="Novo tamanho"
              className="w-32 h-8"
            />
            <Button
              type="button"
              onClick={addCustomSize}
              disabled={!customSize.trim()}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      {/* Dicas */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-amber-900 mb-2">💡 Dicas:</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• <strong>Peso:</strong> Peso da peça pronta em gramas (ex: 250g para uma camisa)</li>
            <li>• <strong>Margem:</strong> Margem de lucro específica para cada tamanho</li>
            <li>• <strong>Desperdício:</strong> {formData.wastePercentage}% de desperdício é considerado automaticamente</li>
            <li>• <strong>Custo do tecido:</strong> Calculado baseado no peso e preço por kg</li>
          </ul>
        </CardContent>
      </Card>

      {/* Resumo dos tamanhos configurados */}
      {getConfiguredSizes().length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-3 flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Tamanhos Configurados: {getConfiguredSizes().length}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {getConfiguredSizes().map((size) => (
                <div key={size.size} className="text-center">
                  <div className="font-medium text-green-900">{size.size}</div>
                  <div className="text-green-700">{size.weight}g</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}