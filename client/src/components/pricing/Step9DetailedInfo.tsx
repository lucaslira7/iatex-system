import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calculator, Info, TrendingUp, Weight } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';
import type { Fabric } from '@shared/schema';

export default function Step9DetailedInfo() {
  const { formData } = usePricing();

  // Buscar dados do tecido selecionado
  const { data: fabrics } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const selectedFabric = fabrics?.find(f => f.id === formData.fabricId);

  // Cálculos detalhados
  const totalPieces = formData.sizes.reduce((sum, size) => sum + size.quantity, 0);
  const totalWeight = formData.sizes.reduce((sum, size) => sum + (size.weight * size.quantity), 0);
  const averageWeight = totalWeight / totalPieces;

  // Cálculo do custo do tecido baseado em peso
  const fabricCostPerGram = selectedFabric ? Number(selectedFabric.pricePerMeter || 0) / Number(selectedFabric.gramWeight || 1) : 0;
  
  return (
    <div className="space-y-6">
      {/* Informações Gerais do Modelo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações do Modelo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Nome:</strong> {formData.modelName}
            </div>
            <div>
              <strong>Referência:</strong> {formData.reference}
            </div>
            <div>
              <strong>Tipo:</strong> {formData.garmentType}
            </div>
            <div>
              <strong>Total de Peças:</strong> {totalPieces}
            </div>
            <div>
              <strong>Peso Total:</strong> {(totalWeight / 1000).toFixed(2)}kg
            </div>
            <div>
              <strong>Peso Médio:</strong> {averageWeight.toFixed(0)}g
            </div>
            {selectedFabric && (
              <>
                <div>
                  <strong>Tecido:</strong> {selectedFabric.name}
                </div>
                <div>
                  <strong>Preço do Tecido:</strong> R$ {Number(selectedFabric.pricePerMeter || 0).toFixed(2)}/m
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento por Tamanho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            Detalhamento por Tamanho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {formData.sizes.map((size) => {
              const fabricCostWithWaste = (size.weight * fabricCostPerGram) * (1 + formData.wastePercentage / 100);
              
              return (
                <div key={size.size} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Tamanho:</span>
                      <div className="text-lg font-bold text-blue-600">{size.size}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Quantidade:</span>
                      <div className="text-lg font-semibold">{size.quantity} peças</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Peso Unitário:</span>
                      <div className="text-lg font-semibold">{size.weight}g</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Custo Tecido:</span>
                      <div className="text-lg font-bold text-green-600">
                        R$ {fabricCostWithWaste.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Inclui {formData.wastePercentage}% de desperdício
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cálculos Médios */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Calculator className="h-5 w-5" />
            Cálculos Médios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {averageWeight.toFixed(0)}g
              </div>
              <div className="text-sm text-gray-600">Peso Médio por Peça</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {((averageWeight * fabricCostPerGram) * (1 + formData.wastePercentage / 100)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Custo Médio Tecido</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formData.wastePercentage}%
              </div>
              <div className="text-sm text-gray-600">Desperdício</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Explicativo */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <Info className="h-5 w-5" />
            Como Funciona o Cálculo do Tecido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-700">
            <p className="mb-2">
              <strong>Fórmula:</strong> Peso da peça (em gramas) × Preço por grama × (1 + % desperdício)
            </p>
            <div className="p-3 bg-white rounded border-l-4 border-amber-400">
              <p className="text-sm">
                <strong>Exemplo:</strong> Se uma peça pesa 100g e o tecido custa R$ 20,00/m com 300g/m, 
                o custo é: 100g × (R$ 20,00 ÷ 300g) × 1,10 = R$ 7,33 (com 10% desperdício)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}