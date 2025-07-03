import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Shirt, Calculator } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';
import type { Fabric } from '@shared/schema';

export default function Step3BasicInfo() {
  const { formData } = usePricing();

  // Buscar dados do tecido selecionado
  const { data: fabrics } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const selectedFabric = fabrics?.find(f => f.id === formData.fabricId);

  // Cálculos básicos
  const totalPieces = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  const totalWeight = formData.sizes.reduce((sum, size) => sum + (size.weight * size.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Resumo Básico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Resumo das Informações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium">{formData.modelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Referência:</span>
                <span className="font-medium">{formData.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{formData.garmentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Peças:</span>
                <span className="font-medium">{totalPieces}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Peso Total:</span>
                <span className="font-medium">{(totalWeight / 1000).toFixed(2)}kg</span>
              </div>
              {selectedFabric && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tecido:</span>
                  <span className="font-medium">{selectedFabric.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Desperdício:</span>
                <span className="font-medium">{formData.wastePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modo:</span>
                <span className="font-medium">
                  {formData.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tamanhos - Visualização Simplificada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Tamanhos Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {formData.sizes.map((size) => (
              <div key={size.size} className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600">{size.size}</div>
                <div className="text-sm text-gray-600">{size.quantity} peças</div>
                <div className="text-sm text-gray-600">{size.weight}g</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximas Etapas */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Calculator className="h-5 w-5" />
            Próximas Etapas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Definir custos de criação (modelagem, piloto, etc.)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Configurar insumos e aviamentos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Definir custos de mão de obra</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Configurar custos fixos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Calcular margem e preço final</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}