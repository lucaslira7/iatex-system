import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';

interface CostItem {
  id: string;
  description: string;
  unitValue: number;
  quantity: number;
  wastePercentage: number;
  total: number;
}

interface DynamicCostStepProps {
  title: string;
  description: string;
  fieldName: 'creationCosts' | 'supplies' | 'labor' | 'fixedCosts';
  suggestions: Array<{
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    helper?: string;
  }>;
  singleSuggestions?: Array<{
    description: string;
    unitValue: number;
    quantity: number;
    wastePercentage: number;
    helper?: string;
  }>;
  icon: React.ReactNode;
}

export default function DynamicCostStep({
  title,
  description,
  fieldName,
  suggestions,
  singleSuggestions,
  icon
}: DynamicCostStepProps) {
  const { formData, updateFormData } = usePricing();
  const [newItem, setNewItem] = useState({
    description: '',
    unitValue: 0,
    quantity: 1,
    wastePercentage: 0,
  });

  const items = formData[fieldName] as CostItem[];

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const calculateItemTotal = (unitValue: number, quantity: number, wastePercentage: number) => {
    const subtotal = unitValue * quantity;
    const waste = subtotal * (wastePercentage / 100);
    return subtotal + waste;
  };

  const addItem = (item: typeof newItem) => {
    if (!item.description.trim()) return;

    const newCostItem: CostItem = {
      id: generateId(),
      description: item.description.trim(),
      unitValue: item.unitValue,
      quantity: item.quantity,
      wastePercentage: item.wastePercentage,
      total: calculateItemTotal(item.unitValue, item.quantity, item.wastePercentage),
    };

    const updatedItems = [...items, newCostItem];
    updateFormData(fieldName, updatedItems);
    
    setNewItem({
      description: '',
      unitValue: 0,
      quantity: 1,
      wastePercentage: 0,
    });
  };

  const updateItem = (id: string, field: string, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.total = calculateItemTotal(updated.unitValue, updated.quantity, updated.wastePercentage);
        return updated;
      }
      return item;
    });
    updateFormData(fieldName, updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    updateFormData(fieldName, updatedItems);
  };

  const addSuggestion = (suggestion: typeof suggestions[0]) => {
    addItem(suggestion);
  };

  // Escolher quais sugestões usar baseado no modo de precificação
  const currentSuggestions = formData.pricingMode === 'single' && singleSuggestions 
    ? singleSuggestions 
    : suggestions;

  const getTotalCost = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          {icon}
          <Label className="text-sm font-medium text-gray-700">
            {title}
          </Label>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Sugestões */}
      {suggestions.length > 0 && (
        <div>
          <Label className="block text-sm font-medium text-gray-600 mb-2">
            Sugestões Rápidas
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentSuggestions.map((suggestion, index) => {
              const displayTotal = suggestion.unitValue * suggestion.quantity * (1 + suggestion.wastePercentage / 100);
              
              return (
                <button
                  key={index}
                  onClick={() => addSuggestion(suggestion)}
                  className="text-left px-3 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                  title={suggestion.helper || ''}
                >
                  <div className="font-medium text-sm">{suggestion.description}</div>
                  <div className="text-xs text-gray-500">
                    R$ {suggestion.unitValue.toFixed(2)} × {suggestion.quantity}
                    {suggestion.wastePercentage > 0 && ` (+${suggestion.wastePercentage}% desperdício)`}
                    <div className="font-medium text-green-600">
                      Total: R$ {displayTotal.toFixed(2)}
                    </div>
                    {suggestion.helper && (
                      <div className="text-xs text-blue-600 mt-1 italic">
                        💡 {suggestion.helper}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulário para adicionar item */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Ex: Modelagem, Linha, Botão..."
              />
            </div>
            <div>
              <Label htmlFor="unitValue">Valor Unitário (R$)</Label>
              <Input
                id="unitValue"
                type="number"
                step="0.01"
                min="0"
                value={newItem.unitValue === 0 ? '' : (newItem.unitValue || '')}
                onChange={(e) => setNewItem({ ...newItem, unitValue: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItem.quantity === 0 ? '' : (newItem.quantity || '')}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value === '' ? 1 : parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="waste">Desperdício (%)</Label>
              <Input
                id="waste"
                type="number"
                min="0"
                max="100"
                value={newItem.wastePercentage === 0 ? '' : (newItem.wastePercentage || '')}
                onChange={(e) => setNewItem({ ...newItem, wastePercentage: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => addItem(newItem)}
                className="w-full"
                disabled={!newItem.description.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de itens adicionados */}
      {items.length > 0 && (
        <div className="space-y-3">
          <Label className="block text-sm font-medium text-gray-700">
            Itens Adicionados ({items.length})
          </Label>
          {items.map((item) => (
            <Card key={item.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div className="md:col-span-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="font-medium"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Valor Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitValue}
                      onChange={(e) => updateItem(item.id, 'unitValue', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Qtd.</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Desperdício %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.wastePercentage}
                      onChange={(e) => updateItem(item.id, 'wastePercentage', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-gray-600">
                    R$ {item.unitValue.toFixed(2)} × {item.quantity}
                    {item.wastePercentage > 0 && ` (+${item.wastePercentage}%)`} = 
                    <span className="font-semibold text-gray-900 ml-1">R$ {item.total.toFixed(2)}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Total */}
      {items.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-blue-900">Total de {title}:</span>
            <span className="text-xl font-bold text-blue-900">R$ {getTotalCost().toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}