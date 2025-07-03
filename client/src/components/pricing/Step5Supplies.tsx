import { Package } from 'lucide-react';
import DynamicCostStep from './DynamicCostStep';

// Sugestões para múltiplas peças (VALORES TOTAIS DE COMPRA)
const SUPPLIES_SUGGESTIONS = [
  {
    description: 'Linha de costura (valor total compra)',
    unitValue: 8.50,
    quantity: 2,
    wastePercentage: 10,
    helper: 'Ex: Comprei 2 linhas a R$ 8,50 cada = R$ 17,00 total'
  },
  {
    description: 'Linha overloque (valor total compra)',
    unitValue: 12.00,
    quantity: 1,
    wastePercentage: 10,
    helper: 'Ex: Comprei 1 linha a R$ 12,00 = R$ 12,00 total'
  },
  {
    description: 'Etiqueta composição (valor total compra)',
    unitValue: 0.15,
    quantity: 600,
    wastePercentage: 5,
    helper: 'Ex: Comprei 600 etiquetas a R$ 0,15 cada = R$ 90,00 total'
  },
  {
    description: 'Etiqueta marca (valor total compra)',
    unitValue: 0.25,
    quantity: 600,
    wastePercentage: 5,
    helper: 'Ex: Comprei 600 etiquetas a R$ 0,25 cada = R$ 150,00 total'
  },
  {
    description: 'Etiqueta tamanho (valor total compra)',
    unitValue: 0.08,
    quantity: 600,
    wastePercentage: 5,
    helper: 'Ex: Comprei 600 etiquetas a R$ 0,08 cada = R$ 48,00 total'
  },
  {
    description: 'Elástico metros (valor total compra)',
    unitValue: 2.50,
    quantity: 150,
    wastePercentage: 15,
    helper: 'Ex: Comprei 150 metros a R$ 2,50 cada = R$ 375,00 total'
  },
  {
    description: 'Botão comum (valor total compra)',
    unitValue: 0.30,
    quantity: 1200,
    wastePercentage: 5,
    helper: 'Ex: Comprei 1200 botões a R$ 0,30 cada = R$ 360,00 total'
  },
  {
    description: 'Zíper comum (15cm)',
    unitValue: 3.50,
    quantity: 1,
    wastePercentage: 5,
  },
];

// Sugestões para peça única (valores de rateio)
const SUPPLIES_SINGLE_SUGGESTIONS = [
  {
    description: 'Linha de costura (rateio)',
    unitValue: 0.45,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Etiqueta composição',
    unitValue: 0.15,
    quantity: 1,
    wastePercentage: 5,
  },
  {
    description: 'Etiqueta marca',
    unitValue: 0.25,
    quantity: 1,
    wastePercentage: 5,
  },
  {
    description: 'Etiqueta tamanho',
    unitValue: 0.08,
    quantity: 1,
    wastePercentage: 5,
  },
  {
    description: 'Botão comum',
    unitValue: 0.30,
    quantity: 1,
    wastePercentage: 5,
  },
  {
    description: 'Zíper comum (15cm)',
    unitValue: 3.50,
    quantity: 1,
    wastePercentage: 5,
  },
];

export default function Step5Supplies() {
  return (
    <DynamicCostStep
      title="Insumos e Aviamentos"
      description="Materiais necessários para a confecção (linhas, botões, etiquetas, elásticos, etc.)"
      fieldName="supplies"
      suggestions={SUPPLIES_SUGGESTIONS}
      singleSuggestions={SUPPLIES_SINGLE_SUGGESTIONS}
      icon={<Package className="h-5 w-5 text-green-600" />}
    />
  );
}