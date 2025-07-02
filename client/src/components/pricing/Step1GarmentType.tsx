import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Shirt, ShirtIcon, Zap, Waves, Square, Move } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 50, y: 50 }); // percentual da posição
  const imageContainerRef = useRef<HTMLDivElement>(null);

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
        // Reset posição para centro quando nova imagem é carregada
        setDragPosition({ x: 50, y: 50 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Limitar entre 0 e 100%
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setDragPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
          
          {!formData.imageUrl ? (
            <label
              htmlFor="imageUpload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">Escolher arquivo</span>
            </label>
          ) : (
            <div className="space-y-4">
              {/* Preview da imagem com posicionamento */}
              <div 
                ref={imageContainerRef}
                className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="absolute w-full h-full object-cover"
                  style={{
                    objectPosition: `${dragPosition.x}% ${dragPosition.y}%`
                  }}
                />
                
                {/* Indicador de posição */}
                <div
                  className={`absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 ${
                    isDragging ? 'scale-125' : 'scale-100'
                  } transition-transform cursor-move`}
                  style={{
                    left: `${dragPosition.x}%`,
                    top: `${dragPosition.y}%`,
                  }}
                  onMouseDown={handleMouseDown}
                />
              </div>
              
              {/* Controles */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  <span>Arraste o ponto azul para posicionar a imagem</span>
                </div>
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Alterar imagem
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}