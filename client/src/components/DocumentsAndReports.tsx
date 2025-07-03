import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Plus, 
  Upload,
  Folder,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Calculator,
  Receipt,
  Send,
  Package,
  BarChart3,
  Image,
  Video,
  File
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateQuotation,
  generateCommercialProposal,
  generatePurchaseOrder,
  generateReceipt,
  generateProductionSheet,
  generateCustomReport,
  type DocumentData,
  type ProductionSheetData
} from '@/lib/documentGenerator';
import type { Model, Client, Order } from '@shared/schema';

interface Document {
  id: number;
  name: string;
  type: 'pattern' | 'video' | 'image' | 'pdf' | 'spreadsheet';
  fileUrl: string;
  modelId?: number;
  isPublic: boolean;
  createdAt: string;
  fileSize: number;
}

interface DocumentItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  observations?: string;
}

export default function DocumentsAndReports() {
  const [activeTab, setActiveTab] = useState('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Dados do formulário para documentos comerciais
  const [formData, setFormData] = useState({
    clientName: '',
    clientCNPJ: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    validUntil: '',
    paymentTerms: '',
    deliveryTerms: '',
    observations: '',
    discount: 0,
    taxes: 0
  });

  // Buscar dados do sistema
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Mock data para demonstração
  const mockDocuments: Document[] = [
    {
      id: 1,
      name: 'Molde Camisa Social M',
      type: 'pattern',
      fileUrl: '/documents/molde-camisa-m.pdf',
      modelId: 1,
      isPublic: false,
      createdAt: new Date().toISOString(),
      fileSize: 2048576
    },
    {
      id: 2,
      name: 'Vídeo Tutorial Costura',
      type: 'video',
      fileUrl: '/documents/tutorial-costura.mp4',
      modelId: 1,
      isPublic: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      fileSize: 15728640
    },
    {
      id: 3,
      name: 'Foto Referência Acabamento',
      type: 'image',
      fileUrl: '/documents/acabamento-ref.jpg',
      modelId: 2,
      isPublic: false,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      fileSize: 1024000
    }
  ];

  const documentTypes = [
    { id: 'quotation', name: 'Orçamento Comercial', icon: <Calculator className="h-4 w-4" />, color: 'bg-blue-500' },
    { id: 'proposal', name: 'Proposta Comercial', icon: <FileText className="h-4 w-4" />, color: 'bg-green-500' },
    { id: 'order', name: 'Pedido de Compra', icon: <Package className="h-4 w-4" />, color: 'bg-purple-500' },
    { id: 'receipt', name: 'Recibo', icon: <Receipt className="h-4 w-4" />, color: 'bg-orange-500' },
    { id: 'production', name: 'Ficha de Produção', icon: <FileText className="h-4 w-4" />, color: 'bg-red-500' },
    { id: 'report', name: 'Relatório Personalizado', icon: <BarChart3 className="h-4 w-4" />, color: 'bg-gray-500' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pattern':
      case 'pdf':
        return <File className="h-8 w-8 text-red-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-blue-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      pattern: 'Molde',
      video: 'Vídeo',
      image: 'Imagem',
      pdf: 'PDF',
      spreadsheet: 'Planilha'
    };
    return typeMap[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const addItem = () => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      code: `ITEM-${documentItems.length + 1}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setDocumentItems([...documentItems, newItem]);
  };

  const updateItem = (id: string, field: keyof DocumentItem, value: any) => {
    setDocumentItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setDocumentItems(items => items.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = documentItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal - (formData.discount || 0) + (formData.taxes || 0);
    return { subtotal, total };
  };

  const generateDocument = async () => {
    try {
      setIsGenerating(true);
      
      const totals = calculateTotals();
      
      const documentData: DocumentData = {
        companyName: 'IA.TEX',
        companyCNPJ: '00.000.000/0001-00',
        companyAddress: 'Endereço da Empresa',
        companyPhone: '(11) 99999-9999',
        companyEmail: 'contato@iatex.com.br',
        clientName: formData.clientName,
        clientCNPJ: formData.clientCNPJ,
        clientAddress: formData.clientAddress,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        documentNumber: `${selectedDocType.toUpperCase()}-${Date.now()}`,
        documentDate: new Date(),
        validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
        items: documentItems,
        subtotal: totals.subtotal,
        discount: formData.discount,
        taxes: formData.taxes,
        total: totals.total,
        observations: formData.observations,
        paymentTerms: formData.paymentTerms,
        deliveryTerms: formData.deliveryTerms
      };

      let pdf;
      let filename;
      
      switch (selectedDocType) {
        case 'quotation':
          pdf = generateQuotation(documentData);
          filename = `Orcamento_${documentData.documentNumber}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
          break;
        case 'proposal':
          pdf = generateCommercialProposal(documentData);
          filename = `Proposta_${documentData.documentNumber}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
          break;
        case 'order':
          pdf = generatePurchaseOrder(documentData);
          filename = `Pedido_${documentData.documentNumber}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
          break;
        case 'receipt':
          pdf = generateReceipt(documentData);
          filename = `Recibo_${documentData.documentNumber}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
          break;
        default:
          throw new Error('Tipo de documento não reconhecido');
      }

      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast({
        title: "Documento gerado com sucesso!",
        description: "PDF criado e está sendo baixado.",
      });
      
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      toast({
        title: "Erro ao gerar documento",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const { subtotal, total } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documentos & Relatórios</h2>
          <p className="text-gray-600">Central de documentos e geração de relatórios comerciais</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerar Documento Comercial</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Seleção do tipo de documento */}
                <div>
                  <Label className="text-sm font-medium">Tipo de Documento</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {documentTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedDocType(type.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedDocType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${type.color} text-white`}>
                            {type.icon}
                          </div>
                          <span className="text-sm font-medium">{type.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedDocType && (
                  <div className="space-y-4">
                    {/* Dados do cliente */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Dados do Cliente</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="client-select">Selecionar Cliente</Label>
                            <Select onValueChange={(clientId) => {
                              const client = clients.find(c => c.id === parseInt(clientId));
                              if (client) {
                                setFormData(prev => ({
                                  ...prev,
                                  clientName: client.name,
                                  clientCNPJ: client.document || '',
                                  clientAddress: client.address || '',
                                  clientPhone: client.phone || '',
                                  clientEmail: client.email || ''
                                }));
                              }
                            }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolher cliente existente" />
                              </SelectTrigger>
                              <SelectContent>
                                {clients.map(client => (
                                  <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="client-name">Nome/Razão Social</Label>
                            <Input
                              id="client-name"
                              value={formData.clientName}
                              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                              placeholder="Nome do cliente"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Itens do documento */}
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Itens do Documento</CardTitle>
                          <Button onClick={addItem} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Item
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {documentItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-6 gap-2 items-center p-3 bg-gray-50 rounded">
                              <Input
                                placeholder="Código"
                                value={item.code}
                                onChange={(e) => updateItem(item.id, 'code', e.target.value)}
                              />
                              <Input
                                placeholder="Descrição"
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              />
                              <Input
                                type="number"
                                placeholder="Qtd"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Preço Unit."
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              />
                              <div className="text-right font-medium">
                                R$ {item.total.toFixed(2)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        {/* Totais */}
                        <div className="mt-4 space-y-2 text-right">
                          <div>Subtotal: R$ {subtotal.toFixed(2)}</div>
                          <div className="text-lg font-bold">Total: R$ {total.toFixed(2)}</div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Botões de ação */}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={generateDocument}
                        disabled={!selectedDocType || isGenerating || documentItems.length === 0}
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Gerar Documento
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Central de Documentos</TabsTrigger>
          <TabsTrigger value="commercial">Documentos Comerciais</TabsTrigger>
        </TabsList>

        {/* Aba Central de Documentos */}
        <TabsContent value="documents" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="pattern">Moldes</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                    <SelectItem value="image">Imagens</SelectItem>
                    <SelectItem value="pdf">PDFs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Documentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {getFileIcon(doc.type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{doc.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(doc.type)}
                        </Badge>
                        {doc.isPublic && (
                          <Badge variant="secondary" className="text-xs">
                            Público
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aba Documentos Comerciais */}
        <TabsContent value="commercial" className="space-y-4">
          {/* Manual do Sistema */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">📋 Manual Completo do Sistema IA.TEX</h3>
                  <p className="text-blue-700 mb-4">
                    Guia completo com todas as integrações e fluxos de trabalho desde o cadastro de tecidos até a entrega das peças.
                    Inclui passo a passo detalhado de todos os 15 módulos e suas integrações.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-blue-600">
                    <span>✓ Fluxo completo de trabalho</span>
                    <span>✓ Integrações entre módulos</span>
                    <span>✓ Documentos gerados</span>
                    <span>✓ Passo a passo operacional</span>
                  </div>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // Download do manual
                    const link = document.createElement('a');
                    link.href = '/MANUAL_COMPLETO_IATEX.md';
                    link.download = 'Manual_Completo_IA.TEX.md';
                    link.click();
                    
                    toast({
                      title: "Manual baixado!",
                      description: "O manual completo foi baixado com sucesso.",
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Manual Completo
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTypes.map(type => (
              <Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${type.color} text-white`}>
                      {type.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{type.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {type.id === 'quotation' && 'Gere orçamentos profissionais com detalhamento completo de custos'}
                    {type.id === 'proposal' && 'Crie propostas comerciais personalizadas com condições específicas'}
                    {type.id === 'order' && 'Emita pedidos de compra para fornecedores e terceiros'}
                    {type.id === 'receipt' && 'Gere recibos para pagamentos e serviços prestados'}
                    {type.id === 'production' && 'Crie fichas técnicas para controle de produção'}
                    {type.id === 'report' && 'Gere relatórios personalizados do sistema'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedDocType(type.id);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Gerar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}