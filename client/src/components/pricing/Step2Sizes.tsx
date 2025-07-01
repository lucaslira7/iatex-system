import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';

const DEFAULT_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'];

export default function Step2Sizes() {
  const { formData, updateFormData } = usePricing();
  const [customSize, setCustomSize] = useState('');

  const handleSizeQuantityChange = (size: string, quantity: number) => {
    const updatedSizes = [...formData.sizes];
    const existingIndex = updatedSizes.findIndex(s => s.size === size);
    
    if (existingIndex >= 0) {
      if (quantity > 0) {
        updatedSizes[existingIndex] = { size, quantity };
      } else {
        updatedSizes.splice(existingIndex, 1);
      }
    } else if (quantity > 0) {
      updatedSizes.push({ size, quantity });
    }
    
    updateFormData('sizes', updatedSizes);
  };

  const addCustomSize = () => {
    if (customSize.trim() && !formData.sizes.find(s => s.size === customSize.trim())) {
      const newSizes = [...formData.sizes, { size: customSize.trim(), quantity: 1 }];
      updateFormData('sizes', newSizes);
      setCustomSize('');
    }
  };

  const removeSize = (size: string) => {
    const updatedSizes = formData.sizes.filter(s => s.size !== size);
    updateFormData('sizes', updatedSizes);
  };

  const getSizeQuantity = (size: string) => {
    return formData.sizes.find(s => s.size === size)?.quantity || 0;
  };

  const getTotalQuantity = () => {
    return formData.sizes.reduce((total, size) => total + size.quantity, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-4">
          Tamanhos e Quantidades *
        </Label>
        <p className="text-sm text-gray-500 mb-4">
          Defina os tamanhos que serão produzidos e suas respectivas quantidades.
        </p>
      </div>

      {/* Tamanhos padrão */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {DEFAULT_SIZES.map((size) => (
          <div key={size} className="space-y-2">
            <div className="text-center">
              <div className="w-full h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center font-medium text-gray-700 bg-gray-50">
                {size}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSizeQuantityChange(size, Math.max(0, getSizeQuantity(size) - 1))}
                disabled={getSizeQuantity(size) <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={getSizeQuantity(size)}
                onChange={(e) => handleSizeQuantityChange(size, parseInt(e.target.value) || 0)}
                className="text-center h-8"
                min="0"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSizeQuantityChange(size, getSizeQuantity(size) + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Tamanhos customizados */}
      {formData.sizes.filter(s => !DEFAULT_SIZES.includes(s.size)).length > 0 && (
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Tamanhos Personalizados
          </Label>
          <div className="space-y-2">
            {formData.sizes
              .filter(s => !DEFAULT_SIZES.includes(s.size))
              .map((sizeItem) => (
                <div key={sizeItem.size} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{sizeItem.size}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSizeQuantityChange(sizeItem.size, Math.max(0, sizeItem.quantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={sizeItem.quantity}
                      onChange={(e) => handleSizeQuantityChange(sizeItem.size, parseInt(e.target.value) || 0)}
                      className="text-center h-8 w-16"
                      min="0"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSizeQuantityChange(sizeItem.size, sizeItem.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeSize(sizeItem.size)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Adicionar tamanho personalizado */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Adicionar Tamanho Personalizado
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: 3XG, Baby, Infantil..."
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSize()}
          />
          <Button onClick={addCustomSize} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Resumo */}
      {formData.sizes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Resumo da Produção</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total de peças:</span>
              <span className="font-semibold text-blue-900 ml-2">{getTotalQuantity()}</span>
            </div>
            <div>
              <span className="text-blue-700">Tamanhos selecionados:</span>
              <span className="font-semibold text-blue-900 ml-2">{formData.sizes.length}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-blue-600">
              {formData.sizes.map(s => `${s.size}: ${s.quantity}`).join(' • ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}