import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shirt } from "lucide-react";

export default function ModelManagement() {
  return (
    <main className="flex-1 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modelos</h1>
          <p className="text-sm text-gray-500 mt-1">Catálogo de modelos de peças</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      <Card className="p-12 text-center">
        <div className="mx-auto max-w-sm">
          <Shirt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum modelo encontrado</h3>
          <p className="text-gray-500 mb-6">Os modelos criados na precificação aparecerão aqui.</p>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeiro Modelo
          </Button>
        </div>
      </Card>
    </main>
  );
}
