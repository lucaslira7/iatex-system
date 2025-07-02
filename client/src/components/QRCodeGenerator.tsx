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
import { Separator } from "@/components/ui/separator";
import { QrCode, Download, Printer, Eye, Plus, Search, Share2, Smartphone, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface Model {
  id: number;
  name: string;
  reference: string;
  garmentType: string;
}

const mockModels: Model[] = [
  { id: 1, name: "Camisa Social Masculina", reference: "C-001", garmentType: "Camisa" },
  { id: 2, name: "Vestido Midi Floral", reference: "V-002", garmentType: "Vestido" },
  { id: 3, name: "Blusa Feminina Básica", reference: "BL-003", garmentType: "Blusa" },
  { id: 4, name: "Calça Jeans Skinny", reference: "CL-004", garmentType: "Calça" },
];

const mockQRCodes: QRCodeData[] = [
  {
    id: 1,
    type: 'tech_sheet',
    title: 'Ficha Técnica - C-001',
    description: 'QR Code para acessar ficha técnica da camisa social masculina',
    url: 'https://iatex.app/ficha/C-001',
    modelId: 1,
    qrCodeUrl: '/qrcodes/qr-ficha-c001.png',
    labelFormat: 'medium',
    printCount: 25,
    createdAt: new Date('2025-07-01'),
    lastUsed: new Date('2025-07-02')
  },
  {
    id: 2,
    type: 'model_info',
    title: 'Info Modelo - V-002',
    description: 'QR Code com informações completas do vestido midi',
    url: 'https://iatex.app/modelo/V-002',
    modelId: 2,
    qrCodeUrl: '/qrcodes/qr-modelo-v002.png',
    labelFormat: 'large',
    printCount: 15,
    createdAt: new Date('2025-06-28')
  },
  {
    id: 3,
    type: 'order_status',
    title: 'Status Pedido #001',
    description: 'QR Code para acompanhar status do pedido em tempo real',
    url: 'https://iatex.app/pedido/001',
    orderId: 1,
    qrCodeUrl: '/qrcodes/qr-pedido-001.png',
    labelFormat: 'small',
    printCount: 5,
    createdAt: new Date('2025-07-01'),
    lastUsed: new Date('2025-07-02')
  },
  {
    id: 4,
    type: 'production_track',
    title: 'Rastreamento Produção',
    description: 'QR Code para acompanhar etapas de produção do lote',
    url: 'https://iatex.app/producao/lote-156',
    qrCodeUrl: '/qrcodes/qr-producao-156.png',
    labelFormat: 'medium',
    printCount: 10,
    createdAt: new Date('2025-06-30')
  }
];

export default function QRCodeGenerator() {
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>(mockQRCodes);
  const [models, setModels] = useState<Model[]>(mockModels);
  const [activeTab, setActiveTab] = useState("generator");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("medium");
  const [customUrl, setCustomUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewQR, setPreviewQR] = useState<QRCodeData | null>(null);
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tech_sheet': return <QrCode className="h-5 w-5 text-blue-600" />;
      case 'model_info': return <Tag className="h-5 w-5 text-green-600" />;
      case 'order_status': return <Smartphone className="h-5 w-5 text-purple-600" />;
      case 'fabric_info': return <QrCode className="h-5 w-5 text-orange-600" />;
      case 'production_track': return <QrCode className="h-5 w-5 text-red-600" />;
      default: return <QrCode className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'tech_sheet': return 'Ficha Técnica';
      case 'model_info': return 'Info do Modelo';
      case 'order_status': return 'Status do Pedido';
      case 'fabric_info': return 'Info do Tecido';
      case 'production_track': return 'Rastreamento';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tech_sheet': return 'bg-blue-100 text-blue-800';
      case 'model_info': return 'bg-green-100 text-green-800';
      case 'order_status': return 'bg-purple-100 text-purple-800';
      case 'fabric_info': return 'bg-orange-100 text-orange-800';
      case 'production_track': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatSize = (format: string) => {
    switch (format) {
      case 'small': return { width: '2cm x 2cm', description: 'Para etiquetas pequenas' };
      case 'medium': return { width: '4cm x 4cm', description: 'Padrão para fichas' };
      case 'large': return { width: '6cm x 6cm', description: 'Para cartazes e displays' };
      default: return { width: '4cm x 4cm', description: 'Padrão' };
    }
  };

  const filteredQRCodes = qrCodes.filter(qr => 
    qr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateQR = () => {
    if (!selectedType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de QR Code.",
        variant: "destructive",
      });
      return;
    }

    const newQR: QRCodeData = {
      id: qrCodes.length + 1,
      type: selectedType as any,
      title: `${getTypeName(selectedType)} - ${selectedModel ? models.find(m => m.id.toString() === selectedModel)?.reference : 'Geral'}`,
      description: `QR Code gerado para ${getTypeName(selectedType)}`,
      url: customUrl || `https://iatex.app/${selectedType}/${selectedModel || 'geral'}`,
      modelId: selectedModel ? parseInt(selectedModel) : undefined,
      qrCodeUrl: `/qrcodes/qr-${selectedType}-${Date.now()}.png`,
      labelFormat: selectedFormat as any,
      printCount: 0,
      createdAt: new Date()
    };

    setQRCodes([...qrCodes, newQR]);
    setIsCreateOpen(false);
    setSelectedType("");
    setSelectedModel("");
    setCustomUrl("");
    
    toast({
      title: "QR Code Criado",
      description: "QR Code gerado com sucesso!",
    });
  };

  const handlePrint = (qr: QRCodeData) => {
    toast({
      title: "Enviando para Impressão",
      description: `Imprimindo QR Code em formato ${qr.labelFormat}...`,
    });
  };

  const handleDownload = (qr: QRCodeData) => {
    toast({
      title: "Download Iniciado",
      description: `Baixando QR Code: ${qr.title}`,
    });
  };

  const handleShare = (qr: QRCodeData) => {
    navigator.clipboard.writeText(qr.url);
    toast({
      title: "Link Copiado",
      description: "URL do QR Code copiada para a área de transferência.",
    });
  };

  const handlePreview = (qr: QRCodeData) => {
    setPreviewQR(qr);
  };

  const generateBulkQRCodes = () => {
    const bulkQRs = models.map(model => ({
      id: qrCodes.length + model.id,
      type: 'tech_sheet' as const,
      title: `Ficha Técnica - ${model.reference}`,
      description: `QR Code para ficha técnica do modelo ${model.name}`,
      url: `https://iatex.app/ficha/${model.reference}`,
      modelId: model.id,
      qrCodeUrl: `/qrcodes/qr-ficha-${model.reference.toLowerCase()}.png`,
      labelFormat: 'medium' as const,
      printCount: 0,
      createdAt: new Date()
    }));

    setQRCodes([...qrCodes, ...bulkQRs]);
    
    toast({
      title: "QR Codes em Lote Criados",
      description: `${bulkQRs.length} QR Codes gerados para todos os modelos.`,
    });
  };

  const getTotalPrints = () => {
    return qrCodes.reduce((sum, qr) => sum + qr.printCount, 0);
  };

  const getMostUsedType = () => {
    const typeCount = qrCodes.reduce((acc, qr) => {
      acc[qr.type] = (acc[qr.type] || 0) + qr.printCount;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsed = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
    return mostUsed ? getTypeName(mostUsed[0]) : 'N/A';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <QrCode className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Code & Etiquetas</h1>
            <p className="text-gray-600">Geração de QR codes para fichas técnicas e rastreamento</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateBulkQRCodes}>
            <Plus className="h-4 w-4 mr-2" />
            Gerar em Lote
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gerar QR Code</DialogTitle>
                <DialogDescription>
                  Crie um novo QR Code para ficha técnica ou rastreamento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de QR Code</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tech_sheet">Ficha Técnica</SelectItem>
                      <SelectItem value="model_info">Informações do Modelo</SelectItem>
                      <SelectItem value="order_status">Status do Pedido</SelectItem>
                      <SelectItem value="fabric_info">Informações do Tecido</SelectItem>
                      <SelectItem value="production_track">Rastreamento de Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(selectedType === 'tech_sheet' || selectedType === 'model_info') && (
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar modelo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(model => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.reference} - {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Formato da Etiqueta</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Formato..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno (2cm x 2cm)</SelectItem>
                      <SelectItem value="medium">Médio (4cm x 4cm)</SelectItem>
                      <SelectItem value="large">Grande (6cm x 6cm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>URL Personalizada (opcional)</Label>
                  <Input
                    placeholder="https://iatex.app/..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> O QR Code será gerado automaticamente com base nas configurações selecionadas.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateQR}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar QR Code
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{qrCodes.length}</p>
                <p className="text-sm text-gray-600">QR Codes Criados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Printer className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalPrints()}</p>
                <p className="text-sm text-gray-600">Total Impresso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Tag className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{qrCodes.filter(qr => qr.lastUsed).length}</p>
                <p className="text-sm text-gray-600">QRs Utilizados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-lg font-bold">{getMostUsedType()}</p>
                <p className="text-sm text-gray-600">Tipo Mais Usado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Meus QR Codes</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar QR codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* QR Codes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQRCodes.map((qr) => (
              <Card key={qr.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(qr.type)}
                      <h3 className="font-semibold text-gray-900">{qr.title}</h3>
                    </div>
                    <Badge className={`${getTypeColor(qr.type)} text-xs`}>
                      {getTypeName(qr.type)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{qr.description}</p>
                  
                  {/* QR Code Preview */}
                  <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Formato:</span>
                      <span className="font-semibold">{getFormatSize(qr.labelFormat).width}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impressões:</span>
                      <span className="font-semibold">{qr.printCount}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Criado:</span>
                      <span className="font-semibold">{qr.createdAt.toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    {qr.lastUsed && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Último uso:</span>
                        <span className="font-semibold">{qr.lastUsed.toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => handlePreview(qr)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(qr)}>
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrint(qr)}>
                      <Printer className="h-3 w-3 mr-1" />
                      Imprimir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare(qr)}>
                      <Share2 className="h-3 w-3 mr-1" />
                      Compartilhar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Template Ficha Técnica */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <QrCode className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Template Ficha Técnica</h3>
                    <p className="text-sm text-gray-600">QR para acesso direto à ficha técnica</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>URL padrão:</strong> https://iatex.app/ficha/{`{REFERENCIA}`}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Permite que clientes e facções acessem a ficha técnica completa do modelo
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Formato recomendado:</span>
                    <strong>Médio (4cm x 4cm)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Uso ideal:</span>
                    <strong>Etiquetas de modelos</strong>
                  </div>
                </div>
                
                <Button className="w-full mt-4" onClick={() => {
                  setSelectedType("tech_sheet");
                  setIsCreateOpen(true);
                }}>
                  Usar Template
                </Button>
              </CardContent>
            </Card>

            {/* Template Rastreamento */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Smartphone className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Template Rastreamento</h3>
                    <p className="text-sm text-gray-600">QR para acompanhar produção</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-green-800">
                    <strong>URL padrão:</strong> https://iatex.app/rastreamento/{`{LOTE}`}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Permite acompanhar o status de produção em tempo real
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Formato recomendado:</span>
                    <strong>Pequeno (2cm x 2cm)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Uso ideal:</span>
                    <strong>Etiquetas de lote</strong>
                  </div>
                </div>
                
                <Button className="w-full mt-4" onClick={() => {
                  setSelectedType("production_track");
                  setIsCreateOpen(true);
                }}>
                  Usar Template
                </Button>
              </CardContent>
            </Card>

            {/* Template Status Pedido */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Tag className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Template Status Pedido</h3>
                    <p className="text-sm text-gray-600">QR para acompanhar pedidos</p>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-purple-800">
                    <strong>URL padrão:</strong> https://iatex.app/pedido/{`{NUMERO}`}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Clientes podem acompanhar o status do pedido em tempo real
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Formato recomendado:</span>
                    <strong>Médio (4cm x 4cm)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Uso ideal:</span>
                    <strong>Etiquetas de envio</strong>
                  </div>
                </div>
                
                <Button className="w-full mt-4" onClick={() => {
                  setSelectedType("order_status");
                  setIsCreateOpen(true);
                }}>
                  Usar Template
                </Button>
              </CardContent>
            </Card>

            {/* Template Info Modelo */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <QrCode className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Template Info Modelo</h3>
                    <p className="text-sm text-gray-600">QR com informações completas</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-orange-800">
                    <strong>URL padrão:</strong> https://iatex.app/modelo/{`{REFERENCIA}`}
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Acesso completo a preços, medidas e disponibilidade
                  </p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Formato recomendado:</span>
                    <strong>Grande (6cm x 6cm)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Uso ideal:</span>
                    <strong>Showroom e catálogos</strong>
                  </div>
                </div>
                
                <Button className="w-full mt-4" onClick={() => {
                  setSelectedType("model_info");
                  setIsCreateOpen(true);
                }}>
                  Usar Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usage by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Uso por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    qrCodes.reduce((acc, qr) => {
                      acc[qr.type] = (acc[qr.type] || 0) + qr.printCount;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(type)}
                        <span>{getTypeName(type)}</span>
                      </div>
                      <Badge variant="outline">{count} impressões</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Format Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Formato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    qrCodes.reduce((acc, qr) => {
                      acc[qr.labelFormat] = (acc[qr.labelFormat] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([format, count]) => (
                    <div key={format} className="flex justify-between items-center">
                      <span className="capitalize">{format} ({getFormatSize(format).width})</span>
                      <Badge variant="outline">{count} QR codes</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qrCodes
                  .filter(qr => qr.lastUsed)
                  .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
                  .slice(0, 5)
                  .map((qr) => (
                    <div key={qr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(qr.type)}
                        <div>
                          <p className="font-semibold text-sm">{qr.title}</p>
                          <p className="text-xs text-gray-600">
                            Último acesso: {qr.lastUsed?.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Badge className={getTypeColor(qr.type)}>
                        {getTypeName(qr.type)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      {previewQR && (
        <Dialog open={!!previewQR} onOpenChange={() => setPreviewQR(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getTypeIcon(previewQR.type)}
                <span>{previewQR.title}</span>
              </DialogTitle>
              <DialogDescription>
                {getTypeName(previewQR.type)} • Formato {previewQR.labelFormat}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">URL:</span>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded">{previewQR.url}</p>
                </div>
                <div>
                  <span className="text-gray-600">Descrição:</span>
                  <p>{previewQR.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Formato:</span>
                    <p className="font-semibold">{getFormatSize(previewQR.labelFormat).width}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Impressões:</span>
                    <p className="font-semibold">{previewQR.printCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button size="sm" onClick={() => handleDownload(previewQR)}>
                  <Download className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePrint(previewQR)}>
                  <Printer className="h-3 w-3 mr-1" />
                  Imprimir
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleShare(previewQR)}>
                  <Share2 className="h-3 w-3 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}