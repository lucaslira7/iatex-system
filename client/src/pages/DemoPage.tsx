import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  ArrowLeft,
  Calculator,
  Scissors,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  Play,
  Pause
} from "lucide-react";

export default function DemoPage() {
  const [currentDemo, setCurrentDemo] = useState("dashboard");
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = {
    dashboard: [
      "Visualize KPIs em tempo real",
      "Acesse favoritos rapidamente", 
      "Monitore alertas importantes",
      "Navegue entre módulos"
    ],
    pricing: [
      "Selecione tipo de peça",
      "Configure tamanhos e quantidades",
      "Escolha tecido principal",
      "Calcule custos automaticamente",
      "Gere PDF profissional"
    ],
    fabrics: [
      "Cadastre novo tecido",
      "Faça upload de imagem",
      "Configure preços e estoque",
      "Receba alertas automáticos"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">IA.TEX</span>
              <Badge className="bg-green-100 text-green-800">DEMONSTRAÇÃO</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Começar Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demonstração Interativa do IA.TEX
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore as principais funcionalidades do sistema e veja como ele pode transformar sua confecção
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="mb-8">
          <Tabs value={currentDemo} onValueChange={setCurrentDemo}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Precificação
              </TabsTrigger>
              <TabsTrigger value="fabrics" className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Tecidos
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Demo */}
            <TabsContent value="dashboard" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Dashboard Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-blue-50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Scissors className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">Tecidos</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">127</p>
                            <p className="text-xs text-green-600">↗ +12%</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-green-50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">Lucro</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">R$ 89K</p>
                            <p className="text-xs text-green-600">↗ +23%</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-600">Pedidos</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">45</p>
                            <p className="text-xs text-green-600">↗ +8%</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-orange-50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Calculator className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-gray-600">Templates</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">23</p>
                            <p className="text-xs text-green-600">↗ +15%</p>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800">Sugestão da IA</span>
                        </div>
                        <p className="text-blue-700">
                          Tecido algodão premium teve aumento de 15% na demanda. Considere aumentar estoque em 20kg.
                        </p>
                        <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                          Aplicar Sugestão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Passo a Passo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {demoSteps.dashboard.map((step, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <Button 
                          className="w-full"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {isPlaying ? "Pausar" : "Iniciar"} Demonstração
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Pricing Demo */}
            <TabsContent value="pricing" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Sistema de Precificação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Etapa 1: Tipo de Peça</h3>
                            <Badge>1/8</Badge>
                          </div>
                          <Progress value={12.5} className="mb-4" />
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {["Camiseta", "Calça", "Vestido", "Conjunto", "Shorts", "Blusa"].map((type) => (
                              <Card key={type} className="cursor-pointer hover:bg-blue-50 border-2 border-blue-500">
                                <CardContent className="p-4 text-center">
                                  <p className="font-medium">{type}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">Cálculo Automático</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-green-700">Custo Total: <span className="font-bold">R$ 45,80</span></p>
                              <p className="text-green-700">Margem: <span className="font-bold">40%</span></p>
                            </div>
                            <div>
                              <p className="text-green-700">Preço Sugerido: <span className="font-bold">R$ 64,12</span></p>
                              <p className="text-green-700">Lucro: <span className="font-bold">R$ 18,32</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Etapas de Precificação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {demoSteps.pricing.map((step, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {index + 1}
                            </div>
                            <span className={index === 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}>{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Fabrics Demo */}
            <TabsContent value="fabrics" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scissors className="w-5 h-5" />
                        Gestão de Tecidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-2">
                          <CardContent className="p-4">
                            <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4"></div>
                            <h3 className="font-bold text-lg mb-2">Algodão Premium</h3>
                            <p className="text-sm text-gray-600 mb-3">100% Algodão • 180g/m²</p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Preço/kg:</span>
                                <span className="font-semibold text-blue-600">R$ 28,50</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Estoque:</span>
                                <span className="font-semibold">45kg</span>
                              </div>
                              <Badge className="bg-green-100 text-green-700">Disponível</Badge>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-white border-2 border-red-200">
                          <CardContent className="p-4">
                            <div className="h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-lg mb-4"></div>
                            <h3 className="font-bold text-lg mb-2">Poliéster Soft</h3>
                            <p className="text-sm text-gray-600 mb-3">92% Poliéster • 160g/m²</p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm">Preço/kg:</span>
                                <span className="font-semibold text-blue-600">R$ 22,00</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Estoque:</span>
                                <span className="font-semibold text-red-600">8kg</span>
                              </div>
                              <Badge className="bg-red-100 text-red-700">Baixo Estoque</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="mt-6 bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-orange-800">Alerta Automático</span>
                        </div>
                        <p className="text-orange-700">
                          Poliéster Soft está com estoque baixo (8kg). Sugerimos comprar 25kg baseado no consumo médio.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Gestão de Tecidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {demoSteps.fabrics.map((step, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Testar o Sistema Completo?
          </h2>
          <p className="text-xl mb-6 text-blue-100">
            Esta demonstração mostrou apenas 3 dos 22 módulos disponíveis
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Começar Teste Grátis por 14 Dias
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}