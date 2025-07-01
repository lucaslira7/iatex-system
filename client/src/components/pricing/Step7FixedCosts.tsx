import { Building } from 'lucide-react';
import DynamicCostStep from './DynamicCostStep';

const FIXED_COSTS_SUGGESTIONS = [
  {
    description: 'Energia elétrica (rateio)',
    unitValue: 0.25,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Aluguel (rateio)',
    unitValue: 0.50,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Manutenção equipamentos',
    unitValue: 0.15,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Despesas administrativas',
    unitValue: 0.30,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Tributos e impostos',
    unitValue: 0.40,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Depreciação equipamentos',
    unitValue: 0.20,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Seguro produção',
    unitValue: 0.10,
    quantity: 1,
    wastePercentage: 0,
  },
  {
    description: 'Materiais de limpeza',
    unitValue: 0.05,
    quantity: 1,
    wastePercentage: 0,
  },
];

export default function Step7FixedCosts() {
  return (
    <DynamicCostStep
      title="Custos Fixos"
      description="Custos fixos rateados por peça (energia, aluguel, equipamentos, impostos, etc.)"
      fieldName="fixedCosts"
      suggestions={FIXED_COSTS_SUGGESTIONS}
      icon={<Building className="h-5 w-5 text-orange-600" />}
    />
  );
}