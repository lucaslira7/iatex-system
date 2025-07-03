import React, { lazy, Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load dos componentes de step pesados
const Step0PricingMode = lazy(() => import('./Step0PricingMode'));
const Step1GarmentType = lazy(() => import('./Step1GarmentType'));
const Step1ModelInfoFixed = lazy(() => import('./Step1ModelInfoFixed'));
const Step2Sizes = lazy(() => import('./Step2Sizes'));
const Step3Fabric = lazy(() => import('./Step3Fabric'));
const Step4CreationCosts = lazy(() => import('./Step4CreationCosts'));
const Step5Supplies = lazy(() => import('./Step5Supplies'));
const Step6Labor = lazy(() => import('./Step6Labor'));
const Step7FixedCosts = lazy(() => import('./Step7FixedCosts'));
const Step8SummaryFixed = lazy(() => import('./Step8SummaryFixed'));

// Skeleton personalizado para steps
const StepSkeleton = () => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);

interface PricingOptimizedProps {
  currentStep: number;
}

const PricingOptimized: React.FC<PricingOptimizedProps> = ({ currentStep }) => {
  // Memoizar qual componente deve ser renderizado
  const CurrentStepComponent = useMemo(() => {
    switch (currentStep) {
      case 0: return Step0PricingMode;
      case 1: return Step1GarmentType;
      case 2: return Step1ModelInfoFixed;  // Informações detalhadas do modelo
      case 3: return Step3Fabric;          // Tecido vem antes dos tamanhos
      case 4: return Step2Sizes;           // Tamanhos vem depois do tecido
      case 5: return Step4CreationCosts;
      case 6: return Step5Supplies;
      case 7: return Step6Labor;
      case 8: return Step7FixedCosts;
      case 9: return Step8SummaryFixed;
      default: return Step0PricingMode;
    }
  }, [currentStep]);

  return (
    <Suspense fallback={<StepSkeleton />}>
      <CurrentStepComponent />
    </Suspense>
  );
};

export default React.memo(PricingOptimized);