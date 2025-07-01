import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Shirt, ShirtIcon, Zap, Waves, Square } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';

const GARMENT_TYPES = [
  { id: 'camiseta', name: 'Camiseta', icon: Shirt },
  { id: 'top', name: 'Top', icon: ShirtIcon },
  { id: 'calca', name: 'Calça', icon: Square },
  { id: 'shorts', name: 'Shorts', icon: Waves },
  { id: 'regata', name: 'Regata', icon: Zap },
  { id: 'vestido', name: 'Vestido', icon: Shirt },
  { id: 'saia', name: 'Saia', icon: Square },
  { id: 'jaqueta', name: 'Jaqueta', icon: Shirt },
];

export default function Step1GarmentType() {
  const { formData, updateFormData } = usePricing();
  const [newGarmentType, setNewGarmentType] = useState('');

  const handleGarmentTypeSelect = (type: string) => {
    updateFormData('garmentType', type);
  };

  const handleAddNewType = () => {
    if (newGarmentType.trim()) {
      handleGarmentTypeSelect(newGarmentType.trim());
      setNewGarmentType('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateFormData('imageUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tipo da Peça */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-4">
          Tipo da Peça *
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GARMENT_TYPES.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleGarmentTypeSelect(type.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  formData.garmentType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="mx-auto h-8 w-8 mb-2" />
                <div className="text-sm font-medium">{type.name}</div>
              </button>
            );
          })}
        </div>
        
        {/* Adicionar novo tipo */}
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Adicionar novo tipo de peça..."
            value={newGarmentType}
            onChange={(e) => setNewGarmentType(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNewType()}
          />
          <button
            onClick={handleAddNewType}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Dados básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="modelName">Nome do Modelo *</Label>
          <Input
            id="modelName"
            value={formData.modelName}
            onChange={(e) => updateFormData('modelName', e.target.value)}
            placeholder="Ex: Camiseta Fitness Pro"
          />
        </div>
        <div>
          <Label htmlFor="reference">Referência *</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => updateFormData('reference', e.target.value)}
            placeholder="Ex: CF-001"
          />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Informações adicionais sobre o modelo..."
        />
      </div>

      {/* Upload de Imagem */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-2">
          Imagem do Modelo
        </Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="imageUpload"
          />
          <label
            htmlFor="imageUpload"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {formData.imageUrl ? 'Clique para alterar a imagem' : 'Escolher arquivo'}
            </span>
          </label>
          {formData.imageUrl && (
            <div className="mt-2">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}