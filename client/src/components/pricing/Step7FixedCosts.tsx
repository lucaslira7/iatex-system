import { Building } from 'lucide-react';
import DynamicCostStep from './DynamicCostStep';

const FIXED_COSTS_SUGGESTIONS = [
  {
    description: 'Energia elétrica (rateio por peça)',
    unitValue: 0.25,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor do gasto mensal/peças produzidas'
  },
  {
    description: 'Aluguel (rateio por peça)',
    unitValue: 0.50,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor do aluguel mensal/peças produzidas'
  },
  {
    description: 'Manutenção equipamentos (rateio)',
    unitValue: 0.15,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Valor gasto mensal com manutenção/peças produzidas'
  },
  {
    description: 'Despesas administrativas (rateio)',
    unitValue: 0.30,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Despesas mensais administrativas/peças produzidas'
  },
  {
    description: 'Tributos e impostos (rateio)',
    unitValue: 0.40,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Impostos mensais/peças produzidas'
  },
  {
    description: 'Depreciação equipamentos (rateio)',
    unitValue: 0.20,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Depreciação mensal/peças produzidas'
  },
  {
    description: 'Seguro produção (rateio)',
    unitValue: 0.10,
    quantity: 1,
    wastePercentage: 0,
    helper: 'Seguro mensal/peças produzidas'
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