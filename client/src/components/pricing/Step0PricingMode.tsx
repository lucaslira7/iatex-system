import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Package } from 'lucide-react';
import { usePricing } from '@/context/PricingContext';

export default function Step0PricingMode() {
  const { formData, updateFormData } = usePricing();

  const handleModeSelect = (mode: 'single' | 'multiple') => {
    updateFormData('pricingMode', mode);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Modalidade de Precificação
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Escolha como deseja realizar a precificação do seu produto.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all ${
            formData.pricingMode === 'single' 
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
              : 'hover:shadow-lg'
          }`}
          onClick={() => handleModeSelect('single')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Calculator className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl">Peça Única</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Calcule o custo de uma única peça baseado no peso e materiais utilizados.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500 space-y-1">
              <div>• Ideal para protótipos</div>
              <div>• Cálculo por peso da peça</div>
              <div>• Preço unitário preciso</div>
            </div>
            {formData.pricingMode === 'single' && (
              <Button className="w-full mt-4" variant="default">
                Selecionado
              </Button>
            )}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            formData.pricingMode === 'multiple' 
              ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' 
              : 'hover:shadow-lg'
          }`}
          onClick={() => handleModeSelect('multiple')}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">Múltiplas Peças</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Calcule o custo total para produzir múltiplas peças com diferentes tamanhos.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500 space-y-1">
              <div>• Ideal para produção</div>
              <div>• Quantidades por tamanho</div>
              <div>• Custo total da produção</div>
            </div>
            {formData.pricingMode === 'multiple' && (
              <Button className="w-full mt-4" variant="default">
                Selecionado
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
          <Calculator className="w-4 h-4 mr-2" />
          Dica
        </h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          {formData.pricingMode === 'single' 
            ? 'Na modalidade "Peça Única", você cadastra apenas o peso de cada tamanho para calcular o custo unitário preciso.'
            : 'Na modalidade "Múltiplas Peças", você define quantidades específicas para cada tamanho e calcula o custo total da produção.'
          }
        </p>
      </div>
    </div>
  );
}