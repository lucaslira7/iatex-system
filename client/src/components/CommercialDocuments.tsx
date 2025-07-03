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
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Calculator, 
  Receipt,
  ClipboardList,
  Package,
  Printer,
  Send,
  Eye
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
import type { Client, Order, Model, Fabric } from '@shared/schema';

interface DocumentItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  observations?: string;
}

export default function CommercialDocuments() {
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentItems, setDocumentItems] = useState<DocumentItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Dados do formulário
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

  // Dados da ficha de produção
  const [productionData, setProductionData] = useState({
    modelName: '',
    reference: '',
    fabricName: '',
    fabricConsumption: 0,
    totalPieces: 0,
    instructions: '',
    qualitySpecs: '',
    dueDate: '',
    factoryAssigned: '',
    observations: '',
    sizes: [{ size: 'P', quantity: 0, color: '' }]
  });

  // Buscar dados do sistema
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ['/api/models'],
  });

  const { data: fabrics = [] } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const documentTypes = [
    { id: 'quotation', name: 'Orçamento Comercial', icon: <Calculator className="h-4 w-4" />, color: 'bg-blue-500' },
    { id: 'proposal', name: 'Proposta Comercial', icon: <FileText className="h-4 w-4" />, color: 'bg-green-500' },
    { id: 'order', name: 'Pedido de Compra', icon: <Package className="h-4 w-4" />, color: 'bg-purple-500' },
    { id: 'receipt', name: 'Recibo', icon: <Receipt className="h-4 w-4" />, color: 'bg-orange-500' },
    { id: 'production', name: 'Ficha de Produção', icon: <ClipboardList className="h-4 w-4" />, color: 'bg-red-500' },
    { id: 'report', name: 'Relatório Personalizado', icon: <Printer className="h-4 w-4" />, color: 'bg-gray-500' }
  ];

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

  const addSizeRow = () => {
    setProductionData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', quantity: 0, color: '' }]
    }));
  };

  const updateSizeRow = (index: number, field: string, value: any) => {
    setProductionData(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => 
        i === index ? { ...size, [field]: value } : size
      )
    }));
  };

  const removeSizeRow = (index: number) => {
    setProductionData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  const generateDocument = async () => {
    try {
      setIsGenerating(true);
      
      if (selectedDocType === 'production') {
        // Gerar ficha de produção
        const productionSheetData: ProductionSheetData = {
          orderNumber: `ORD-${Date.now()}`,
          modelName: productionData.modelName,
          reference: productionData.reference,
          fabricName: productionData.fabricName,
          fabricConsumption: productionData.fabricConsumption,
          totalPieces: productionData.totalPieces,
          sizes: productionData.sizes.filter(s => s.size && s.quantity > 0),
          instructions: productionData.instructions,
          qualitySpecs: productionData.qualitySpecs,
          dueDate: new Date(productionData.dueDate || Date.now()),
          factoryAssigned: productionData.factoryAssigned,
          observations: productionData.observations
        };

        const pdf = generateProductionSheet(productionSheetData);
        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ficha_Producao_${productionData.reference}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
        link.click();
        
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
      } else {
        // Gerar documento comercial
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
      }

      toast({
        title: "Documento gerado com sucesso!",
        description: "O PDF foi criado e está sendo baixado.",
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

  const loadFromModel = (modelId: string) => {
    const model = models.find(m => m.id === parseInt(modelId));
    if (model) {
      setProductionData(prev => ({
        ...prev,
        modelName: model.name,
        reference: model.reference || '',
        fabricName: '', // Buscar do tecido relacionado
        fabricConsumption: 0, // Calcular baseado no modelo
        totalPieces: 0 // Definir manualmente
      }));
    }
  };

  const loadFromClient = (clientId: string) => {
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
  };

  const { subtotal, total } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documentos Comerciais</h2>
          <p className="text-gray-600">Gere orçamentos, propostas, pedidos e fichas de produção</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerar Novo Documento</DialogTitle>
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

              {selectedDocType && selectedDocType !== 'production' && (
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
                          <Select onValueChange={loadFromClient}>
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
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="client-cnpj">CNPJ</Label>
                          <Input
                            id="client-cnpj"
                            value={formData.clientCNPJ}
                            onChange={(e) => setFormData(prev => ({ ...prev, clientCNPJ: e.target.value }))}
                            placeholder="00.000.000/0001-00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="client-phone">Telefone</Label>
                          <Input
                            id="client-phone"
                            value={formData.clientPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="client-address">Endereço</Label>
                          <Input
                            id="client-address"
                            value={formData.clientAddress}
                            onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                            placeholder="Endereço completo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="client-email">E-mail</Label>
                          <Input
                            id="client-email"
                            value={formData.clientEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                            placeholder="email@exemplo.com"
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
                        {documentItems.map((item, index) => (
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
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="discount">Desconto</Label>
                            <Input
                              id="discount"
                              type="number"
                              step="0.01"
                              value={formData.discount}
                              onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="taxes">Impostos</Label>
                            <Input
                              id="taxes"
                              type="number"
                              step="0.01"
                              value={formData.taxes}
                              onChange={(e) => setFormData(prev => ({ ...prev, taxes: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span>R$ {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Condições comerciais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Condições Comerciais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="valid-until">Válido até</Label>
                          <Input
                            id="valid-until"
                            type="date"
                            value={formData.validUntil}
                            onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="payment-terms">Condições de Pagamento</Label>
                          <Input
                            id="payment-terms"
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                            placeholder="Ex: 30 dias, À vista"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="delivery-terms">Condições de Entrega</Label>
                        <Input
                          id="delivery-terms"
                          value={formData.deliveryTerms}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                          placeholder="Ex: 15 dias úteis, FOB"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="observations">Observações</Label>
                        <Textarea
                          id="observations"
                          value={formData.observations}
                          onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                          placeholder="Informações adicionais..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Ficha de Produção */}
              {selectedDocType === 'production' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Especificações do Produto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="model-select">Carregar do Modelo</Label>
                        <Select onValueChange={loadFromModel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar modelo existente" />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map(model => (
                              <SelectItem key={model.id} value={model.id.toString()}>
                                {model.name} - {model.reference}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="model-name">Nome do Modelo</Label>
                          <Input
                            id="model-name"
                            value={productionData.modelName}
                            onChange={(e) => setProductionData(prev => ({ ...prev, modelName: e.target.value }))}
                            placeholder="Nome do modelo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="reference">Referência</Label>
                          <Input
                            id="reference"
                            value={productionData.reference}
                            onChange={(e) => setProductionData(prev => ({ ...prev, reference: e.target.value }))}
                            placeholder="REF-001"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fabric-name">Nome do Tecido</Label>
                          <Input
                            id="fabric-name"
                            value={productionData.fabricName}
                            onChange={(e) => setProductionData(prev => ({ ...prev, fabricName: e.target.value }))}
                            placeholder="Nome do tecido"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fabric-consumption">Consumo por Peça (m)</Label>
                          <Input
                            id="fabric-consumption"
                            type="number"
                            step="0.001"
                            value={productionData.fabricConsumption}
                            onChange={(e) => setProductionData(prev => ({ ...prev, fabricConsumption: parseFloat(e.target.value) || 0 }))}
                            placeholder="1.500"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="total-pieces">Total de Peças</Label>
                          <Input
                            id="total-pieces"
                            type="number"
                            value={productionData.totalPieces}
                            onChange={(e) => setProductionData(prev => ({ ...prev, totalPieces: parseInt(e.target.value) || 0 }))}
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="due-date">Data de Entrega</Label>
                          <Input
                            id="due-date"
                            type="date"
                            value={productionData.dueDate}
                            onChange={(e) => setProductionData(prev => ({ ...prev, dueDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="factory-assigned">Facção Responsável</Label>
                        <Input
                          id="factory-assigned"
                          value={productionData.factoryAssigned}
                          onChange={(e) => setProductionData(prev => ({ ...prev, factoryAssigned: e.target.value }))}
                          placeholder="Nome da facção"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Distribuição de Tamanhos */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Distribuição de Tamanhos</CardTitle>
                        <Button onClick={addSizeRow} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Tamanho
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {productionData.sizes.map((size, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2 items-center">
                            <Input
                              placeholder="Tamanho"
                              value={size.size}
                              onChange={(e) => updateSizeRow(index, 'size', e.target.value)}
                            />
                            <Input
                              type="number"
                              placeholder="Quantidade"
                              value={size.quantity}
                              onChange={(e) => updateSizeRow(index, 'quantity', parseInt(e.target.value) || 0)}
                            />
                            <Input
                              placeholder="Cor"
                              value={size.color}
                              onChange={(e) => updateSizeRow(index, 'color', e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSizeRow(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Instruções */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Instruções e Especificações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="instructions">Instruções de Produção</Label>
                        <Textarea
                          id="instructions"
                          value={productionData.instructions}
                          onChange={(e) => setProductionData(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Instruções detalhadas para produção..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="quality-specs">Especificações de Qualidade</Label>
                        <Textarea
                          id="quality-specs"
                          value={productionData.qualitySpecs}
                          onChange={(e) => setProductionData(prev => ({ ...prev, qualitySpecs: e.target.value }))}
                          placeholder="Requisitos de qualidade e controle..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="prod-observations">Observações</Label>
                        <Textarea
                          id="prod-observations"
                          value={productionData.observations}
                          onChange={(e) => setProductionData(prev => ({ ...prev, observations: e.target.value }))}
                          placeholder="Observações adicionais..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={generateDocument}
                  disabled={!selectedDocType || isGenerating}
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de tipos de documentos */}
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

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Orçamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Propostas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Pedidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">15</div>
              <div className="text-sm text-gray-600">Fichas de Produção</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}