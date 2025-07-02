import { Users } from 'lucide-react';
import DynamicCostStep from './DynamicCostStep';

const LABOR_SUGGESTIONS = [
  {
    description: 'Costura principal',
    unitValue: 3.20,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Overloque',
    unitValue: 2.50,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Acabamento/Revisão',
    unitValue: 1.50,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Aplicação de etiquetas',
    unitValue: 0.80,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Corte',
    unitValue: 1.20,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Passadoria',
    unitValue: 1.00,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Embalagem',
    unitValue: 0.50,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Controle de Qualidade',
    unitValue: 0.75,
    quantity: 1,
    wastePercentage: 0,
  },
];

export default function Step6Labor() {
  return (
    <DynamicCostStep
      title="Mão de Obra"
      description="Custos de mão de obra para confecção (costura, corte, acabamento, etc.)"
      fieldName="labor"
      suggestions={LABOR_SUGGESTIONS}
      icon={<Users className="h-5 w-5 text-blue-600" />}
    />
  );
}