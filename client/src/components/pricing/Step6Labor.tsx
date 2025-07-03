import { Users } from 'lucide-react';
import DynamicCostStep from './DynamicCostStep';

const LABOR_SUGGESTIONS = [
  {
    description: 'Costura principal (valor por peça)',
    unitValue: 3.20,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor pago por peça costurada'
  },
  {
    description: 'Overloque (valor por peça)',
    unitValue: 2.50,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor pago por peça overlocada'
  },
  {
    description: 'Acabamento/Revisão (valor por peça)',
    unitValue: 1.50,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor pago por peça acabada'
  },
  {
    description: 'Aplicação de etiquetas (valor por peça)',
    unitValue: 0.80,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor pago por peça etiquetada'
  },
  {
    description: 'Corte (valor por peça)',
    unitValue: 1.20,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor pago por peça cortada'
  },
  {
    description: 'Passadoria (valor por peça)',
    unitValue: 1.00,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor pago por peça passada'
  },
  {
    description: 'Embalagem (valor por peça)',
    unitValue: 0.50,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor pago por peça embalada'
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