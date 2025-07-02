import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, DollarSign, BarChart3, Target, ArrowUpDown, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SimulationResult {
  scenario: string;
  fabricCost: number;
  totalCost: number;
  finalPrice: number;
  profitMargin: number;
  difference: number;
  status: 'positive' | 'negative' | 'neutral';
}

interface FabricComparison {
  fabricId: number;
  fabricName: string;
  pricePerMeter: number;
  consumption: number;
  totalFabricCost: number;
  finalPrice: number;
  profitMargin: number;
}

export default function AdvancedSimulations() {
  const [activeTab, setActiveTab] = useState("fabric-comparison");
  const [selectedModel, setSelectedModel] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [priceIncrease, setPriceIncrease] = useState("");
  const [selectedFabrics, setSelectedFabrics] = useState<number[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [fabricComparisons, setFabricComparisons] = useState<FabricComparison[]>([]);
  const { toast } = useToast();

  // Fetch available models
  const { data: models = [] } = useQuery({
    queryKey: ['/api/pricing-templates'],
  });

  // Fetch available fabrics
  const { data: fabrics = [] } = useQuery({
    queryKey: ['/api/fabrics'],
  });

  const handleFabricComparison = () => {
    if (!selectedModel || selectedFabrics.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um modelo e pelo menos um tecido.",
        variant: "destructive",
      });
      return;
    }

    const model = models?.find((m: any) => m.id.toString() === selectedModel);
    if (!model) return;

    const comparisons: FabricComparison[] = selectedFabrics.map(fabricId => {
      const fabric = fabrics?.find((f: any) => f.id === fabricId);
      if (!fabric) return null;

      const consumption = parseFloat(model.fabricConsumption) || 1;
      const wastePercentage = parseFloat(model.wastePercentage) || 10;
      const finalConsumption = consumption * (1 + wastePercentage / 100);
      const totalFabricCost = finalConsumption * parseFloat(fabric.pricePerMeter);
      
      // Calculate other costs (from original model)
      const otherCosts = parseFloat(model.totalCost) - (parseFloat(model.fabricConsumption) * parseFloat(model.wastePercentage || "0"));
      const newTotalCost = totalFabricCost + otherCosts;
      const profitMargin = parseFloat(model.profitMargin) || 30;
      const finalPrice = newTotalCost * (1 + profitMargin / 100);

      return {
        fabricId,
        fabricName: fabric.name,
        pricePerMeter: parseFloat(fabric.pricePerMeter),
        consumption: finalConsumption,
        totalFabricCost,
        finalPrice,
        profitMargin
      };
    }).filter(Boolean) as FabricComparison[];

    setFabricComparisons(comparisons);
    toast({
      title: "Simulação Concluída",
      description: `Comparação realizada com ${comparisons.length} tecidos.`,
    });
  };

  const handleReverseMarkup = () => {
    if (!selectedModel || !targetPrice) {
      toast({
        title: "Erro",
        description: "Selecione um modelo e defina o preço alvo.",
        variant: "destructive",
      });
      return;
    }

    const model = models?.find((m: any) => m.id.toString() === selectedModel);
    if (!model) return;

    const target = parseFloat(targetPrice);
    const currentCost = parseFloat(model.totalCost);
    const currentPrice = parseFloat(model.finalPrice);
    const currentMargin = parseFloat(model.profitMargin);

    // Calculate maximum cost to achieve target price with current margin
    const maxCostWithCurrentMargin = target / (1 + currentMargin / 100);
    const costDifference = maxCostWithCurrentMargin - currentCost;
    
    // Calculate required margin to achieve target price with current cost
    const requiredMargin = ((target - currentCost) / currentCost) * 100;

    const results: SimulationResult[] = [
      {
        scenario: "Preço Atual",
        fabricCost: currentCost * 0.6, // Assuming fabric is 60% of cost
        totalCost: currentCost,
        finalPrice: currentPrice,
        profitMargin: currentMargin,
        difference: 0,
        status: 'neutral'
      },
      {
        scenario: "Preço Alvo (Margem Atual)",
        fabricCost: maxCostWithCurrentMargin * 0.6,
        totalCost: maxCostWithCurrentMargin,
        finalPrice: target,
        profitMargin: currentMargin,
        difference: costDifference,
        status: costDifference >= 0 ? 'positive' : 'negative'
      },
      {
        scenario: "Preço Alvo (Custo Atual)",
        fabricCost: currentCost * 0.6,
        totalCost: currentCost,
        finalPrice: target,
        profitMargin: requiredMargin,
        difference: target - currentPrice,
        status: requiredMargin >= currentMargin ? 'positive' : 'negative'
      }
    ];

    setSimulationResults(results);
    toast({
      title: "Simulação de Markup Reverso",
      description: "Análise de viabilidade concluída.",
    });
  };

  const handlePriceProjection = () => {
    if (!selectedModel || !priceIncrease) {
      toast({
        title: "Erro",
        description: "Selecione um modelo e defina o percentual de aumento.",
        variant: "destructive",
      });
      return;
    }

    const model = models?.find((m: any) => m.id.toString() === selectedModel);
    if (!model) return;

    const increase = parseFloat(priceIncrease);
    const currentCost = parseFloat(model.totalCost);
    const currentPrice = parseFloat(model.finalPrice);
    const currentMargin = parseFloat(model.profitMargin);

    const scenarios = [
      { name: "Aumento no Custo", multiplier: 1 + increase / 100, appliedTo: 'cost' },
      { name: "Aumento no Preço Final", multiplier: 1 + increase / 100, appliedTo: 'price' },
      { name: "Aumento na Margem", multiplier: 1 + increase / 100, appliedTo: 'margin' }
    ];

    const results: SimulationResult[] = scenarios.map(scenario => {
      let newCost = currentCost;
      let newPrice = currentPrice;
      let newMargin = currentMargin;

      if (scenario.appliedTo === 'cost') {
        newCost = currentCost * scenario.multiplier;
        newPrice = newCost * (1 + currentMargin / 100);
        newMargin = currentMargin;
      } else if (scenario.appliedTo === 'price') {
        newPrice = currentPrice * scenario.multiplier;
        newMargin = ((newPrice - currentCost) / currentCost) * 100;
        newCost = currentCost;
      } else if (scenario.appliedTo === 'margin') {
        newMargin = currentMargin * scenario.multiplier;
        newPrice = currentCost * (1 + newMargin / 100);
        newCost = currentCost;
      }

      return {
        scenario: scenario.name,
        fabricCost: newCost * 0.6,
        totalCost: newCost,
        finalPrice: newPrice,
        profitMargin: newMargin,
        difference: newPrice - currentPrice,
        status: newMargin >= currentMargin ? 'positive' : 'negative'
      };
    });

    setSimulationResults(results);
    toast({
      title: "Projeção de Preços",
      description: `Simulação com aumento de ${increase}% concluída.`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Calculator className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulações Avançadas</h1>
          <p className="text-gray-600">Compare cenários, projete preços e otimize margens</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fabric-comparison">Comparar Tecidos</TabsTrigger>
          <TabsTrigger value="reverse-markup">Markup Reverso</TabsTrigger>
          <TabsTrigger value="price-projection">Projeção de Preços</TabsTrigger>
          <TabsTrigger value="historical-analysis">Análise Histórica</TabsTrigger>
        </TabsList>

        <TabsContent value="fabric-comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5" />
                <span>Comparação de Tecidos</span>
              </CardTitle>
              <CardDescription>
                Compare como diferentes tecidos afetam o custo e preço final de um modelo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model-select">Selecionar Modelo</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {models?.map((model: any) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.reference} - {model.modelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tecidos para Comparar</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {fabrics?.map((fabric: any) => (
                      <div key={fabric.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`fabric-${fabric.id}`}
                          checked={selectedFabrics.includes(fabric.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFabrics([...selectedFabrics, fabric.id]);
                            } else {
                              setSelectedFabrics(selectedFabrics.filter(id => id !== fabric.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`fabric-${fabric.id}`} className="text-sm">
                          {fabric.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleFabricComparison} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Executar Comparação
              </Button>

              {fabricComparisons.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Resultados da Comparação</h3>
                  <div className="grid gap-4">
                    {fabricComparisons.map((comparison, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-900">{comparison.fabricName}</h4>
                            <Badge variant="outline">
                              R$ {comparison.pricePerMeter.toFixed(2)}/m
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Consumo</p>
                              <p className="font-semibold">{comparison.consumption.toFixed(2)}m</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Custo Tecido</p>
                              <p className="font-semibold">R$ {comparison.totalFabricCost.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Preço Final</p>
                              <p className="font-semibold">R$ {comparison.finalPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Margem</p>
                              <p className="font-semibold">{comparison.profitMargin.toFixed(1)}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reverse-markup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Simulador de Markup Reverso</span>
              </CardTitle>
              <CardDescription>
                Defina o preço final desejado e descubra o custo máximo ou margem necessária
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model-select-reverse">Selecionar Modelo</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {models?.map((model: any) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.reference} - {model.modelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-price">Preço Alvo (R$)</Label>
                  <Input
                    id="target-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleReverseMarkup} className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Calcular Markup Reverso
              </Button>

              {simulationResults.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Análise de Viabilidade</h3>
                  <div className="grid gap-4">
                    {simulationResults.map((result, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                              {getStatusIcon(result.status)}
                              <span>{result.scenario}</span>
                            </h4>
                            <Badge variant={result.status === 'positive' ? 'default' : result.status === 'negative' ? 'destructive' : 'secondary'}>
                              {result.difference >= 0 ? '+' : ''}R$ {result.difference.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Custo Total</p>
                              <p className="font-semibold">R$ {result.totalCost.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Preço Final</p>
                              <p className="font-semibold">R$ {result.finalPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Margem</p>
                              <p className="font-semibold">{result.profitMargin.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Diferença</p>
                              <p className={`font-semibold ${result.status === 'positive' ? 'text-green-600' : result.status === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                                {result.difference >= 0 ? '+' : ''}R$ {Math.abs(result.difference).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price-projection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Projeção de Preços</span>
              </CardTitle>
              <CardDescription>
                Simule diferentes cenários de aumento de preços e analise o impacto nas margens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model-select-projection">Selecionar Modelo</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {models?.map((model: any) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.reference} - {model.modelName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price-increase">Percentual de Aumento (%)</Label>
                  <Input
                    id="price-increase"
                    type="number"
                    step="0.1"
                    placeholder="10.0"
                    value={priceIncrease}
                    onChange={(e) => setPriceIncrease(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handlePriceProjection} className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Executar Projeção
              </Button>

              {simulationResults.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Cenários de Projeção</h3>
                  <div className="grid gap-4">
                    {simulationResults.map((result, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                              {getStatusIcon(result.status)}
                              <span>{result.scenario}</span>
                            </h4>
                            <Badge variant={result.status === 'positive' ? 'default' : result.status === 'negative' ? 'destructive' : 'secondary'}>
                              {result.difference >= 0 ? '+' : ''}R$ {result.difference.toFixed(2)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Custo Total</p>
                              <p className="font-semibold">R$ {result.totalCost.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Preço Final</p>
                              <p className="font-semibold">R$ {result.finalPrice.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Margem</p>
                              <p className="font-semibold">{result.profitMargin.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Diferença</p>
                              <p className={`font-semibold ${result.status === 'positive' ? 'text-green-600' : result.status === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                                {result.difference >= 0 ? '+' : ''}R$ {Math.abs(result.difference).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Análise Histórica</span>
              </CardTitle>
              <CardDescription>
                Analise tendências de preços e margens baseadas em dados históricos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">Análise Histórica</p>
                <p>Esta funcionalidade será implementada quando tivermos dados históricos suficientes.</p>
                <p className="text-sm mt-2">Continue usando o sistema para gerar dados históricos.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}