import { PenTool } from 'lucide-react';
import DynamicCostStep from './DynamicCostStep';

// Sugestões para múltiplas peças (VALORES TOTAIS que serão divididos entre as peças)
const CREATION_SUGGESTIONS = [
  {
    description: 'Modelagem (valor total)',
    unitValue: 150.00,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Custo total único que será dividido entre todas as peças'
  },
  {
    description: 'Piloto/Prova (valor total)',
    unitValue: 80.00,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Custo total único que será dividido entre todas as peças'
  },
  {
    description: 'Graduação de Tamanhos (valor total)',
    unitValue: 100.00,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Custo total único que será dividido entre todas as peças'
  },
  {
    description: 'Consultoria Técnica (valor total)',
    unitValue: 200.00,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Custo total único que será dividido entre todas as peças'
  },
  {
    description: 'Design/Arte (valor total)',
    unitValue: 120.00,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Custo total único que será dividido entre todas as peças'
  },
  {
    description: 'Ficha Técnica (valor total)',
    unitValue: 50.00,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Custo total único que será dividido entre todas as peças'
  },
];

// Sugestões para peça única (valores de rateio)
const CREATION_SINGLE_SUGGESTIONS = [
  {
    description: 'Modelagem (rateio)',
    unitValue: 0.50,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Piloto (rateio)',
    unitValue: 0.26,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Graduação (rateio)',
    unitValue: 0.15,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Consultoria Técnica (rateio)',
    unitValue: 0.20,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Corte (rateio)',
    unitValue: 0.40,
    quantity: 1,
    wastePercentage: 0,
  },
];

export default function Step4CreationCosts() {
  return (
    <DynamicCostStep
      title="Custos de Criação"
      description="Custos únicos relacionados ao desenvolvimento do modelo (modelagem, piloto, graduação, etc.)"
      fieldName="creationCosts"
      suggestions={CREATION_SUGGESTIONS}
      singleSuggestions={CREATION_SINGLE_SUGGESTIONS}
      icon={<PenTool className="h-5 w-5 text-purple-600" />}
    />
  );
}