import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Factory, Plus, Calendar as CalendarIcon, AlertTriangle, TrendingUp, TrendingDown, Clock, Target, Award, BarChart3, CheckCircle2, XCircle, Pause, FileText, Download, Package, Users, QrCode, Printer, Share2, Smartphone, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateProductionSheet, type ProductionSheetData } from '@/lib/documentGenerator';

interface ProductionStage {
  id: number;
  name: string;
  description: string;
  estimatedHours: number;
  order: number;
}

interface FactoryProduction {
  id: number;
  factoryId: number;
  orderId: number;
  stageId: number;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  wasteQuantity: number;
  startDate?: Date;
  endDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  notes: string;
}

interface Factory {
  id: number;
  name: string;
  contact: string;
  specialties: string[];
  efficiency: number;
  averageDelay: number;
  qualityScore: number;
}

interface ProductionWeek {
  week: string;
  factoryId: number;
  plannedPieces: number;
  producedPieces: number;
  rejectedPieces: number;
  efficiency: number;
  wastePercentage: number;
}

interface QRCodeData {
  id: number;
  type: 'tech_sheet' | 'model_info' | 'order_status' | 'fabric_info' | 'production_track';
  title: string;
  description: string;
  url: string;
  modelId?: number;
  orderId?: number;
  fabricId?: number;
  qrCodeUrl: string;
  labelFormat: 'small' | 'medium' | 'large';
  printCount: number;
  createdAt: Date;
  lastUsed?: Date;
}

const mockStages: ProductionStage[] = [
  { id: 1, name: "Corte", description: "Corte dos tecidos conforme molde", estimatedHours: 2, order: 1 },
  { id: 2, name: "Costura", description: "Costura das peças principais", estimatedHours: 6, order: 2 },
  { id: 3, name: "Acabamento", description: "Acabamentos e detalhes", estimatedHours: 2, order: 3 },
  { id: 4, name: "Qualidade", description: "Controle de qualidade", estimatedHours: 1, order: 4 },
  { id: 5, name: "Embalagem", description: "Embalagem final", estimatedHours: 0.5, order: 5 },
];

const mockFactories: Factory[] = [
  {
    id: 1,
    name: "Confecção São Paulo",
    contact: "(11) 3456-7890",
    specialties: ["Camisas", "Blusas"],
    efficiency: 92,
    averageDelay: 2,
    qualityScore: 95
  },
  {
    id: 2,
    name: "Facção ABC",
    contact: "(11) 2345-6789",
    specialties: ["Calças", "Vestidos"],
    efficiency: 88,
    averageDelay: 3,
    qualityScore: 90
  },
  {
    id: 3,
    name: "Costura Premium",
    contact: "(11) 4567-8901",
    specialties: ["Acabamentos", "Peças Premium"],
    efficiency: 85,
    averageDelay: 1,
    qualityScore: 98
  }
];

const mockProductions: FactoryProduction[] = [
  {
    id: 1,
    factoryId: 1,
    orderId: 1,
    stageId: 2,
    plannedQuantity: 100,
    producedQuantity: 85,
    rejectedQuantity: 5,
    wasteQuantity: 3,
    startDate: new Date("2025-07-01"),
    endDate: new Date("2025-07-05"),
    status: "in_progress",
    notes: "Produção dentro do prazo"
  },
  {
    id: 2,
    factoryId: 2,
    orderId: 2,
    stageId: 1,
    plannedQuantity: 50,
    producedQuantity: 50,
    rejectedQuantity: 2,
    wasteQuantity: 1,
    startDate: new Date("2025-06-28"),
    endDate: new Date("2025-07-02"),
    status: "completed",
    notes: "Concluído com qualidade"
  },
  {
    id: 3,
    factoryId: 3,
    orderId: 3,
    stageId: 3,
    plannedQuantity: 75,
    producedQuantity: 60,
    rejectedQuantity: 8,
    wasteQuantity: 4,
    startDate: new Date("2025-07-02"),
    status: "paused",
    notes: "Pausado por problemas de qualidade"
  }
];

const mockWeeks: ProductionWeek[] = [
  {
    week: "2025-W26",
    factoryId: 1,
    plannedPieces: 200,
    producedPieces: 185,
    rejectedPieces: 8,
    efficiency: 92.5,
    wastePercentage: 4.3
  },
  {
    week: "2025-W27",
    factoryId: 1,
    plannedPieces: 180,
    producedPieces: 170,
    rejectedPieces: 5,
    efficiency: 94.4,
    wastePercentage: 2.9
  },
  {
    week: "2025-W26",
    factoryId: 2,
    plannedPieces: 150,
    producedPieces: 135,
    rejectedPieces: 12,
    efficiency: 90.0,
    wastePercentage: 8.0
  }
];

export default function AdvancedProduction() {
  const [productions, setProductions] = useState<FactoryProduction[]>(mockProductions);
  const [factories, setFactories] = useState<Factory[]>(mockFactories);
  const [stages, setStages] = useState<ProductionStage[]>(mockStages);
  const [weeks, setWeeks] = useState<ProductionWeek[]>(mockWeeks);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddProductionOpen, setIsAddProductionOpen] = useState(false);
  const [isAddFactoryOpen, setIsAddFactoryOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filterFactory, setFilterFactory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [isCreateQROpen, setIsCreateQROpen] = useState(false);
  const [selectedQRType, setSelectedQRType] = useState("");
  const [selectedQRFormat, setSelectedQRFormat] = useState("medium");
  const [customQRUrl, setCustomQRUrl] = useState("");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Produção';
      case 'paused': return 'Pausado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getFactoryName = (factoryId: number) => {
    return factories.find(f => f.id === factoryId)?.name || "N/A";
  };

  const getStageName = (stageId: number) => {
    return stages.find(s => s.id === stageId)?.name || "N/A";
  };

  const calculateEfficiency = (production: FactoryProduction) => {
    const totalProduced = production.producedQuantity + production.rejectedQuantity;
    return totalProduced > 0 ? (production.producedQuantity / production.plannedQuantity) * 100 : 0;
  };

  const calculateWastePercentage = (production: FactoryProduction) => {
    const totalProduced = production.producedQuantity + production.rejectedQuantity;
    return totalProduced > 0 ? (production.wasteQuantity / totalProduced) * 100 : 0;
  };

  const getFactoryScore = (factory: Factory) => {
    return Math.round((factory.efficiency + factory.qualityScore) / 2);
  };

  const filteredProductions = productions.filter(prod => {
    const matchesFactory = !filterFactory || prod.factoryId.toString() === filterFactory;
    const matchesStatus = !filterStatus || prod.status === filterStatus;
    return matchesFactory && matchesStatus;
  });

  const handleAddProduction = () => {
    toast({
      title: "Produção Criada",
      description: "Nova ordem de produção foi criada com sucesso.",
    });
    setIsAddProductionOpen(false);
  };

  const handleAddFactory = () => {
    toast({
      title: "Facção Cadastrada",
      description: "Nova facção foi adicionada ao sistema.",
    });
    setIsAddFactoryOpen(false);
  };

  const getTotalActiveProductions = () => {
    return productions.filter(p => p.status === 'in_progress').length;
  };

  const getTotalPendingPieces = () => {
    return productions
      .filter(p => p.status !== 'completed')
      .reduce((sum, p) => sum + (p.plannedQuantity - p.producedQuantity), 0);
  };

  const getAverageEfficiency = () => {
    const efficiencies = productions.map(p => calculateEfficiency(p));
    return efficiencies.length > 0 ? efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length : 0;
  };

  const getTotalWasteThisWeek = () => {
    return productions.reduce((sum, p) => sum + p.wasteQuantity, 0);
  };

  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'tech_sheet': return <QrCode className="h-5 w-5 text-blue-600" />;
      case 'model_info': return <Tag className="h-5 w-5 text-green-600" />;
      case 'order_status': return <Smartphone className="h-5 w-5 text-purple-600" />;
      case 'fabric_info': return <QrCode className="h-5 w-5 text-orange-600" />;
      case 'production_track': return <QrCode className="h-5 w-5 text-red-600" />;
      default: return <QrCode className="h-5 w-5 text-gray-600" />;
    }
  };

  const getQRTypeName = (type: string) => {
    switch (type) {
      case 'tech_sheet': return 'Ficha Técnica';
      case 'model_info': return 'Info do Modelo';
      case 'order_status': return 'Status do Pedido';
      case 'fabric_info': return 'Info do Tecido';
      case 'production_track': return 'Rastreamento';
      default: return type;
    }
  };

  const handleCreateQR = () => {
    if (!selectedQRType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de QR Code.",
        variant: "destructive",
      });
      return;
    }

    const newQR: QRCodeData = {
      id: qrCodes.length + 1,
      type: selectedQRType as any,
      title: `${getQRTypeName(selectedQRType)} - ${Date.now()}`,
      description: `QR Code gerado para ${getQRTypeName(selectedQRType)}`,
      url: customQRUrl || `https://iatex.app/${selectedQRType}/${Date.now()}`,
      qrCodeUrl: `/qrcodes/qr-${selectedQRType}-${Date.now()}.png`,
      labelFormat: selectedQRFormat as any,
      printCount: 0,
      createdAt: new Date()
    };

    setQRCodes([...qrCodes, newQR]);
    setIsCreateQROpen(false);
    setSelectedQRType("");
    setCustomQRUrl("");

    toast({
      title: "QR Code Criado",
      description: "QR Code gerado com sucesso!",
    });
  };

  const handlePrintQR = (qr: QRCodeData) => {
    toast({
      title: "Enviando para Impressão",
      description: `Imprimindo QR Code em formato ${qr.labelFormat}...`,
    });
  };

  const handleDownloadQR = (qr: QRCodeData) => {
    toast({
      title: "Download Iniciado",
      description: `Baixando QR Code: ${qr.title}`,
    });
  };

  const handleShareQR = (qr: QRCodeData) => {
    navigator.clipboard.writeText(qr.url);
    toast({
      title: "Link Copiado",
      description: "URL do QR Code copiada para a área de transferência.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Factory className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produção & QR Codes</h1>
            <p className="text-gray-600">Controle de produção por facção e geração de QR Codes</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddFactoryOpen} onOpenChange={setIsAddFactoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Factory className="h-4 w-4 mr-2" />
                Nova Facção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Facção</DialogTitle>
                <DialogDescription>
                  Adicione uma nova facção ao sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Facção</Label>
                  <Input placeholder="Ex: Confecção Premium Ltda" />
                </div>
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <Label>Especialidades</Label>
                  <Input placeholder="Ex: Camisas, Blusas, Vestidos" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Eficiência Inicial (%)</Label>
                    <Input type="number" placeholder="90" />
                  </div>
                  <div className="space-y-2">
                    <Label>Score de Qualidade (%)</Label>
                    <Input type="number" placeholder="95" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Informações adicionais sobre a facção..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddFactoryOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddFactory}>
                  Cadastrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddProductionOpen} onOpenChange={setIsAddProductionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Produção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Ordem de Produção</DialogTitle>
                <DialogDescription>
                  Atribua uma nova produção para uma facção
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pedido</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pedido..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Pedido #001 - 100 Camisas</SelectItem>
                        <SelectItem value="2">Pedido #002 - 50 Vestidos</SelectItem>
                        <SelectItem value="3">Pedido #003 - 75 Blusas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Facção</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Facção..." />
                      </SelectTrigger>
                      <SelectContent>
                        {factories.map(factory => (
                          <SelectItem key={factory.id} value={factory.id.toString()}>
                            {factory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Etapa de Produção</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Etapa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map(stage => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          {stage.name} - {stage.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade Planejada</Label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta de Perda Máxima (%)</Label>
                    <Input type="number" placeholder="5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Data início"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo (dias)</Label>
                    <Input type="number" placeholder="7" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea placeholder="Instruções especiais para a facção..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddProductionOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddProduction}>
                  Criar Produção
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateQROpen} onOpenChange={setIsCreateQROpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo QR Code</DialogTitle>
                <DialogDescription>
                  Configure o tipo e formato do QR Code para impressão
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="qr-type">Tipo de QR Code</Label>
                  <Select value={selectedQRType} onValueChange={setSelectedQRType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech_sheet">Ficha Técnica</SelectItem>
                      <SelectItem value="model_info">Info do Modelo</SelectItem>
                      <SelectItem value="order_status">Status do Pedido</SelectItem>
                      <SelectItem value="fabric_info">Info do Tecido</SelectItem>
                      <SelectItem value="production_track">Rastreamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qr-format">Formato da Etiqueta</Label>
                  <Select value={selectedQRFormat} onValueChange={setSelectedQRFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno (40x30mm)</SelectItem>
                      <SelectItem value="medium">Médio (60x40mm)</SelectItem>
                      <SelectItem value="large">Grande (80x60mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="qr-url">URL Personalizada (opcional)</Label>
                  <Input
                    id="qr-url"
                    placeholder="https://iatex.app/..."
                    value={customQRUrl}
                    onChange={(e) => setCustomQRUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateQROpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateQR}>
                  Criar QR Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalActiveProductions()}</p>
                <p className="text-sm text-gray-600">Produções Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalPendingPieces()}</p>
                <p className="text-sm text-gray-600">Peças Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(getAverageEfficiency())}%</p>
                <p className="text-sm text-gray-600">Eficiência Média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalWasteThisWeek()}</p>
                <p className="text-sm text-gray-600">Perdas da Semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="productions">Produções</TabsTrigger>
          <TabsTrigger value="factories">Facções</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="qrcodes">QR Codes & Etiquetas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline de Produção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stages.map((stage, index) => {
                    const stageProductions = productions.filter(p => p.stageId === stage.id);
                    const totalPieces = stageProductions.reduce((sum, p) => sum + p.plannedQuantity, 0);
                    const completedPieces = stageProductions.reduce((sum, p) => sum + p.producedQuantity, 0);
                    const progress = totalPieces > 0 ? (completedPieces / totalPieces) * 100 : 0;

                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${progress === 100 ? 'bg-green-500 text-white' :
                                progress > 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                              }`}>
                              {index + 1}
                            </div>
                            <span className="font-semibold">{stage.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">{completedPieces}/{totalPieces} peças</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeks.map((week, index) => {
                    const factory = factories.find(f => f.id === week.factoryId);
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{factory?.name}</h4>
                            <p className="text-sm text-gray-600">{week.week}</p>
                          </div>
                          <Badge variant={week.efficiency >= 90 ? "default" : week.efficiency >= 80 ? "secondary" : "destructive"}>
                            {week.efficiency.toFixed(1)}% eficiência
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Produzido:</span>
                            <p className="font-semibold">{week.producedPieces}/{week.plannedPieces}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Rejeitado:</span>
                            <p className="font-semibold">{week.rejectedPieces}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Perda:</span>
                            <p className="font-semibold">{week.wastePercentage.toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Meta:</span>
                            <p className={`font-semibold ${week.wastePercentage <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                              {week.wastePercentage <= 5 ? 'Atingida' : 'Não atingida'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="productions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={filterFactory} onValueChange={setFilterFactory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por facção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as facções</SelectItem>
                    {factories.map(factory => (
                      <SelectItem key={factory.id} value={factory.id.toString()}>
                        {factory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Produção</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Productions List */}
          <div className="grid gap-4">
            {filteredProductions.map((production) => {
              const efficiency = calculateEfficiency(production);
              const wastePercentage = calculateWastePercentage(production);
              const factory = factories.find(f => f.id === production.factoryId);

              return (
                <Card key={production.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {getFactoryName(production.factoryId)} - {getStageName(production.stageId)}
                          </h3>
                          <Badge className={`${getStatusColor(production.status)} flex items-center space-x-1`}>
                            {getStatusIcon(production.status)}
                            <span>{getStatusText(production.status)}</span>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">Pedido #{production.orderId} • {production.notes}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-gray-600 text-sm">Planejado</span>
                            <p className="font-semibold">{production.plannedQuantity} peças</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Produzido</span>
                            <p className="font-semibold text-green-600">{production.producedQuantity} peças</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Rejeitado</span>
                            <p className="font-semibold text-red-600">{production.rejectedQuantity} peças</p>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Desperdício</span>
                            <p className="font-semibold text-orange-600">{production.wasteQuantity} peças</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-600">Eficiência</span>
                            <p className={`text-lg font-bold ${efficiency >= 90 ? 'text-green-600' : efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {efficiency.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Perda</span>
                            <p className={`font-semibold ${wastePercentage <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                              {wastePercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {production.status === 'in_progress' && (
                          <Button size="sm" className="mt-3">
                            Atualizar Status
                          </Button>
                        )}
                      </div>
                    </div>

                    {production.startDate && (
                      <div className="flex justify-between text-sm text-gray-500 pt-3 border-t">
                        <span>Início: {format(production.startDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                        {production.endDate && (
                          <span>Fim: {format(production.endDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="factories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {factories.map((factory) => {
              const factoryProductions = productions.filter(p => p.factoryId === factory.id);
              const totalProduced = factoryProductions.reduce((sum, p) => sum + p.producedQuantity, 0);
              const totalPlanned = factoryProductions.reduce((sum, p) => sum + p.plannedQuantity, 0);
              const activeProductions = factoryProductions.filter(p => p.status === 'in_progress').length;

              return (
                <Card key={factory.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{factory.name}</h3>
                        <p className="text-sm text-gray-600">{factory.contact}</p>
                      </div>
                      <Badge variant={getFactoryScore(factory) >= 90 ? "default" : "secondary"}>
                        Score: {getFactoryScore(factory)}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Especialidades</span>
                        <span className="font-semibold text-sm">{factory.specialties.join(", ")}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Eficiência</span>
                        <span className="font-semibold">{factory.efficiency}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Qualidade</span>
                        <span className="font-semibold">{factory.qualityScore}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Atraso Médio</span>
                        <span className={`font-semibold ${factory.averageDelay <= 2 ? 'text-green-600' : 'text-red-600'}`}>
                          {factory.averageDelay} dias
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between">
                        <span className="text-gray-600">Produções Ativas</span>
                        <span className="font-semibold">{activeProductions}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Produzido</span>
                        <span className="font-semibold">{totalProduced} peças</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Factory Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação de Facções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {factories.map((factory) => {
                    const score = getFactoryScore(factory);
                    return (
                      <div key={factory.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">{factory.name}</span>
                          <span className="text-sm font-semibold">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <span>Efic: {factory.efficiency}%</span>
                          <span>Qual: {factory.qualityScore}%</span>
                          <span>Atraso: {factory.averageDelay}d</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Waste Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Perdas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeks.map((week, index) => {
                    const factory = factories.find(f => f.id === week.factoryId);
                    const wasteGoal = 5; // Meta de 5% de perda
                    const isGoodWaste = week.wastePercentage <= wasteGoal;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">{factory?.name}</span>
                          <span className={`text-sm font-semibold ${isGoodWaste ? 'text-green-600' : 'text-red-600'}`}>
                            {week.wastePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min((week.wastePercentage / 10) * 100, 100)}
                          className={`h-2 ${!isGoodWaste ? 'bg-red-100' : ''}`}
                        />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Rejeitadas: {week.rejectedPieces}</span>
                          <span>Meta: ≤{wasteGoal}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qrcodes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">QR Codes & Etiquetas</h2>
              <p className="text-gray-600">Gere QR codes para fichas técnicas, rastreamento e status</p>
            </div>
            <Dialog open={isCreateQROpen} onOpenChange={setIsCreateQROpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo QR Code</DialogTitle>
                  <DialogDescription>
                    Configure o tipo e formato do QR Code para impressão
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="qr-type">Tipo de QR Code</Label>
                    <Select value={selectedQRType} onValueChange={setSelectedQRType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech_sheet">Ficha Técnica</SelectItem>
                        <SelectItem value="model_info">Info do Modelo</SelectItem>
                        <SelectItem value="order_status">Status do Pedido</SelectItem>
                        <SelectItem value="fabric_info">Info do Tecido</SelectItem>
                        <SelectItem value="production_track">Rastreamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="qr-format">Formato da Etiqueta</Label>
                    <Select value={selectedQRFormat} onValueChange={setSelectedQRFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeno (40x30mm)</SelectItem>
                        <SelectItem value="medium">Médio (60x40mm)</SelectItem>
                        <SelectItem value="large">Grande (80x60mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="qr-url">URL Personalizada (opcional)</Label>
                    <Input
                      id="qr-url"
                      placeholder="https://iatex.app/..."
                      value={customQRUrl}
                      onChange={(e) => setCustomQRUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateQROpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateQR}>
                    Criar QR Code
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qr) => (
              <Card key={qr.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getQRTypeIcon(qr.type)}
                      <CardTitle className="text-lg">{qr.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {qr.labelFormat}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {qr.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Criado:</span>
                      <span>{qr.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Impressões:</span>
                      <span>{qr.printCount}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handlePrintQR(qr)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownloadQR(qr)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShareQR(qr)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {qrCodes.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum QR Code criado</h3>
                <p className="text-gray-600 mb-4">
                  Crie seu primeiro QR Code para fichas técnicas, rastreamento ou status de pedidos
                </p>
                <Button onClick={() => setIsCreateQROpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro QR Code
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}