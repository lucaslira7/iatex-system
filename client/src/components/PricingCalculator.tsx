import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PricingModal from "./modals/PricingModal";

export default function PricingCalculator() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Precificação</h1>
            <p className="text-sm text-gray-500 mt-1">Calculadora de custos e preços</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nova Precificação
          </Button>
        </div>

        <Card className="p-12 text-center">
          <div className="mx-auto max-w-sm">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma precificação encontrada</h3>
            <p className="text-gray-500 mb-6">Comece criando sua primeira precificação de produto.</p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Precificação
            </Button>
          </div>
        </Card>
      </main>

      <PricingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
