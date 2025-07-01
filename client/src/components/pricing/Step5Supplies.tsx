import { Package } from 'lucide-react';
import DynamicCostStep from './DynamicCostStep';

const SUPPLIES_SUGGESTIONS = [
  {
    description: 'Linha de costura',
    unitValue: 8.50,
    quantity: 2,
    wastePercentage: 10,
  },
  {
    description: 'Linha overloque',
    unitValue: 12.00,
    quantity: 1,
    wastePercentage: 10,
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
    description: 'Elástico (metro)',
    unitValue: 2.50,
    quantity: 0.5,
    wastePercentage: 15,
  },
  {
    description: 'Botão comum',
    unitValue: 0.30,
    quantity: 4,
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
      icon={<Package className="h-5 w-5 text-green-600" />}
    />
  );
}