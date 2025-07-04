import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Download, 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Save,
  Eye,
  Package,
  Scissors,
  Users,
  Clock,
  Target,
  Camera,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import html2canvas from 'html2canvas';

interface Step10FinalReviewProps {
  formData: any;
  onNext: () => void;
  onBack: () => void;
}

interface SizeMargin {
  size: string;
  cost: number;
  marginPercent: number;
  profitValue: number;
  finalPrice: number;
}

function Step10FinalReview({ formData, onNext, onBack }: Step10FinalReviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sizeMargins, setSizeMargins] = useState<SizeMargin[]>([]);
  const [averages, setAverages] = useState({
    averageCost: 0,
    averageProfit: 0,
    averagePrice: 0,
    averageMargin: 0
  });

  // Calcular custos por tamanho
  useEffect(() => {
    if (!formData.sizes || formData.sizes.length === 0) return;
    
    const totalPieces = formData.sizes.reduce((sum: number, size: any) => sum + size.quantity, 0);
    
    const newSizeMargins: SizeMargin[] = formData.sizes.map((size: any) => {
      const fabricCostPerGram = formData.selectedFabric ? 
        Number(formData.selectedFabric.pricePerMeter || 0) / Number(formData.selectedFabric.gramWeight || 1) : 0;
      const fabricCostWithWaste = (size.weight * fabricCostPerGram) * (1 + (formData.wastePercentage || 0) / 100);
      
      // Calcular custo base
      const creationCost = (formData.creationCosts || 0) / totalPieces;
      const supplyCost = (formData.suppliesCosts || 0) / totalPieces;
      const laborCost = (formData.laborCosts || 0) / totalPieces;
      const fixedCost = (formData.fixedCosts || 0) / totalPieces;
      
      const sizeUnitCost = fabricCostWithWaste + creationCost + supplyCost + laborCost + fixedCost;
      
      return {
        size: size.size,
        cost: sizeUnitCost,
        marginPercent: 20, // Margem padrão de 20%
        profitValue: sizeUnitCost * 0.20,
        finalPrice: sizeUnitCost * 1.20
      };
    });
    
    setSizeMargins(newSizeMargins);
  }, [formData]);

  // Calcular médias
  useEffect(() => {
    if (sizeMargins.length > 0) {
      const totalCost = sizeMargins.reduce((sum, item) => sum + item.cost, 0);
      const totalProfit = sizeMargins.reduce((sum, item) => sum + item.profitValue, 0);
      const totalPrice = sizeMargins.reduce((sum, item) => sum + item.finalPrice, 0);
      const totalMargin = sizeMargins.reduce((sum, item) => sum + item.marginPercent, 0);
      
      setAverages({
        averageCost: totalCost / sizeMargins.length,
        averageProfit: totalProfit / sizeMargins.length,
        averagePrice: totalPrice / sizeMargins.length,
        averageMargin: totalMargin / sizeMargins.length
      });
    }
  }, [sizeMargins]);

  const handleMarginChange = (index: number, field: 'marginPercent' | 'finalPrice', value: number) => {
    if (value < 0) {
      toast({
        title: "Margem Inválida",
        description: "A margem não pode ser negativa!",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const newSizeMargins = [...sizeMargins];
    const item = newSizeMargins[index];
    
    if (field === 'marginPercent') {
      item.marginPercent = value;
      item.profitValue = item.cost * (value / 100);
      item.finalPrice = item.cost + item.profitValue;
    } else {
      item.finalPrice = value;
      item.profitValue = value - item.cost;
      item.marginPercent = item.cost > 0 ? (item.profitValue / item.cost) * 100 : 0;
    }
    
    setSizeMargins(newSizeMargins);
  };

  const handleDownloadImage = async (elementId: string, filename: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Imagem baixada!",
        description: `${filename} foi salvo com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao baixar imagem",
        description: "Não foi possível gerar a imagem.",
        variant: "destructive",
      });
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await fetch('/api/pricing-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });
      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template salvo!",
        description: "O template foi salvo com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-templates'] });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o template.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    const templateData = {
      ...formData,
      sizeMargins,
      averages,
      createdAt: new Date().toISOString()
    };
    
    saveMutation.mutate(templateData);
  };

  return (
    <div className="space-y-6">
      {/* Custos Detalhados por Tamanho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Custos Detalhados por Tamanho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sizeMargins.map((item, index) => (
              <div key={item.size} className="p-4 bg-orange-50 rounded-lg border">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-bold text-lg">
                      {item.size}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      ({formData.sizes.find((s: any) => s.size === item.size)?.quantity || 0} peças)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">
                      R$ {item.cost.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Custo por peça</div>
                  </div>
                </div>
                
                {/* Breakdown de custos */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm mb-4">
                  <div>Tecido: <span className="font-medium text-green-600">R$ {(item.cost * 0.4).toFixed(2)}</span></div>
                  <div>Criação: <span className="font-medium text-blue-600">R$ {(formData.creationCosts / formData.sizes.length).toFixed(2)}</span></div>
                  <div>Insumos: <span className="font-medium text-purple-600">R$ {(formData.suppliesCosts / formData.sizes.length).toFixed(2)}</span></div>
                  <div>Mão de obra: <span className="font-medium text-indigo-600">R$ {(formData.laborCosts / formData.sizes.length).toFixed(2)}</span></div>
                  <div>Fixos: <span className="font-medium text-gray-600">R$ {(formData.fixedCosts / formData.sizes.length).toFixed(2)}</span></div>
                </div>

                {/* Campos de margem editáveis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white rounded border">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Margem de Lucro (%)
                    </label>
                    <Input
                      type="number"
                      value={item.marginPercent}
                      onChange={(e) => handleMarginChange(index, 'marginPercent', Number(e.target.value))}
                      min="0"
                      step="0.1"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Lucro (R$)
                    </label>
                    <div className="p-2 bg-gray-50 rounded border text-center font-medium">
                      R$ {item.profitValue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Preço Final (R$)
                    </label>
                    <Input
                      type="number"
                      value={item.finalPrice}
                      onChange={(e) => handleMarginChange(index, 'finalPrice', Number(e.target.value))}
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Média Total */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Média Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                R$ {averages.averageCost.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Custo Médio</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                R$ {averages.averageProfit.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Lucro Médio</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {averages.averageMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Margem Média</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                R$ {averages.averagePrice.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Preço Médio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Visualização */}
      <div className="flex flex-wrap gap-4 justify-center">
        {/* Ver Resumo */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Ver Resumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Resumo da Precificação</DialogTitle>
            </DialogHeader>
            <div id="resumo-preview" className="p-6 bg-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{formData.modelName}</h2>
                <p className="text-gray-600">Resumo Executivo</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-xl font-bold text-blue-600">R$ {averages.averageCost.toFixed(2)}</div>
                  <div className="text-sm">Custo Médio</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-xl font-bold text-green-600">R$ {averages.averageProfit.toFixed(2)}</div>
                  <div className="text-sm">Lucro Médio</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-xl font-bold text-purple-600">{averages.averageMargin.toFixed(1)}%</div>
                  <div className="text-sm">Margem Média</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded">
                  <div className="text-xl font-bold text-orange-600">R$ {averages.averagePrice.toFixed(2)}</div>
                  <div className="text-sm">Preço Médio</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-lg">Breakdown por Tamanho:</h3>
                {sizeMargins.map(item => (
                  <div key={item.size} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="font-medium">{item.size}</div>
                    <div className="text-right">
                      <div className="font-bold">R$ {item.finalPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{item.marginPercent.toFixed(1)}% margem</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center p-4">
              <Button 
                onClick={() => handleDownloadImage('resumo-preview', `Resumo_${formData.reference}_${new Date().toISOString().split('T')[0]}.png`)}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Baixar Imagem
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Ver Ficha Técnica */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Ver Ficha Técnica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ficha Técnica</DialogTitle>
            </DialogHeader>
            <div id="ficha-preview" className="p-6 bg-white">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{formData.modelName}</h2>
                <p className="text-gray-600">Referência: {formData.reference}</p>
              </div>
              
              {formData.modelImage && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={formData.modelImage} 
                    alt={formData.modelName}
                    className="max-w-64 max-h-64 object-contain rounded-lg border"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold mb-2">Informações Gerais</h3>
                    <p><strong>Modelo:</strong> {formData.modelName}</p>
                    <p><strong>Referência:</strong> {formData.reference}</p>
                    <p><strong>Tipo:</strong> {formData.garmentType}</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Tecido</h3>
                    <p><strong>Nome:</strong> {formData.selectedFabric?.name}</p>
                    <p><strong>Tipo:</strong> {formData.selectedFabric?.type}</p>
                    <p><strong>Composição:</strong> {formData.selectedFabric?.composition}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold mb-2">Tamanhos Disponíveis</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.sizes.map((size: any) => (
                      <div key={size.size} className="p-2 bg-gray-50 rounded text-center">
                        <div className="font-medium">{size.size}</div>
                        <div className="text-sm text-gray-600">{size.weight}g</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center p-4">
              <Button 
                onClick={() => handleDownloadImage('ficha-preview', `Ficha_${formData.reference}_${new Date().toISOString().split('T')[0]}.png`)}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Baixar Imagem
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Botão Salvar */}
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}

export default Step10FinalReview;