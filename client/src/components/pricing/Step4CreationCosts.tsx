import { PenTool } from 'lucide-react';
import DynamicCostStep from './DynamicCostStep';

const CREATION_SUGGESTIONS = [
  {
    description: 'Modelagem',
    unitValue: 150.00,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Piloto (Prova)',
    unitValue: 80.00,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Graduação de Tamanhos',
    unitValue: 100.00,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Ficha Técnica',
    unitValue: 50.00,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Design/Arte',
    unitValue: 120.00,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Consultoria Técnica',
    unitValue: 200.00,
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
      icon={<PenTool className="h-5 w-5 text-purple-600" />}
    />
  );
}