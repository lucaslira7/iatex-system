import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart, Package, Receipt, FileText, Eye, Edit, Trash2, Search } from "lucide-react";
import { generatePurchaseOrder, generateReceipt, type DocumentData } from '@/lib/documentGenerator';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@shared/schema';

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch orders - Mock data for now
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Mock data for demonstration
  const mockOrders = [
    {
      id: 1,
      orderNumber: 'PED-001',
      clientName: 'Cliente Exemplo 1',
      modelName: 'Camisa Social',
      reference: 'CS-001',
      quantity: 50,
      unitPrice: 45.00,
      totalAmount: 2250.00,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      orderNumber: 'PED-002',
      clientName: 'Cliente Exemplo 2',
      modelName: 'Vestido Casual',
      reference: 'VC-002',
      quantity: 30,
      unitPrice: 65.00,
      totalAmount: 1950.00,
      status: 'in_production',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const displayOrders = orders.length > 0 ? orders : mockOrders;

  const filteredOrders = displayOrders.filter((order: any) =>
    (order as any).modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order as any).clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order as any).reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      in_production: { label: 'Em Produção', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const generateOrderPDF = async (order: any) => {
    try {
      const documentData: DocumentData = {
        companyName: 'IA.TEX',
        companyCNPJ: '00.000.000/0001-00',
        companyAddress: 'Endereço da Empresa',
        companyPhone: '(11) 99999-9999',
        companyEmail: 'contato@iatex.com.br',
        clientName: order.clientName,
        documentNumber: order.orderNumber,
        documentDate: new Date(),
        items: [{
          code: order.reference,
          description: order.modelName,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          total: order.totalAmount
        }],
        subtotal: order.totalAmount,
        total: order.totalAmount,
        paymentTerms: 'Conforme acordado',
        deliveryTerms: `Entrega prevista: ${new Date(order.deliveryDate).toLocaleDateString('pt-BR')}`
      };

      const pdf = generatePurchaseOrder(documentData);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Pedido_${order.reference}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
      link.click();

      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast({
        title: "Pedido gerado!",
        description: "PDF criado e sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar pedido",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const generateReceiptPDF = async (order: any) => {
    try {
      const documentData: DocumentData = {
        companyName: 'IA.TEX',
        companyCNPJ: '00.000.000/0001-00',
        companyAddress: 'Endereço da Empresa',
        companyPhone: '(11) 99999-9999',
        companyEmail: 'contato@iatex.com.br',
        clientName: order.clientName,
        documentNumber: `REC-${order.id.toString().padStart(4, '0')}`,
        documentDate: new Date(),
        items: [{
          code: order.reference,
          description: order.modelName,
          quantity: order.quantity,
          unitPrice: order.unitPrice,
          total: order.totalAmount
        }],
        subtotal: order.totalAmount,
        total: order.totalAmount
      };

      const pdf = generateReceipt(documentData);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_${order.reference}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
      link.click();

      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast({
        title: "Recibo gerado!",
        description: "PDF criado e sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar recibo",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h2>
          <p className="text-gray-600">Gerencie pedidos e gere documentos comerciais</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, modelo ou referência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{displayOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayOrders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Produção</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayOrders.filter(o => o.status === 'in_production').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {displayOrders.reduce((sum: number, o: any) => sum + ((o as any).totalAmount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {displayOrders.length === 0 ? 'Nenhum pedido encontrado' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {displayOrders.length === 0
                ? 'Crie seu primeiro pedido clicando no botão "Novo Pedido".'
                : 'Tente ajustar os filtros de busca para encontrar o que procura.'
              }
            </p>
            {displayOrders.length === 0 && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{(order as any).modelName || 'Modelo não especificado'}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {order.orderNumber} - Ref: {(order as any).reference || 'N/A'}
                    </p>
                  </div>
                  {getStatusBadge(order.status || 'pending')}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    Cliente: {(order as any).clientName || 'Cliente não especificado'}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Quantidade: {(order as any).quantity || 0} unidades
                  </div>

                  <div className="text-lg font-semibold text-green-600">
                    R$ {(order as any).totalAmount?.toFixed(2) || '0,00'}
                  </div>

                  <div className="space-y-2 pt-3">
                    {/* Primeira linha - Ações principais */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Segunda linha - Documentos comerciais */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateOrderPDF(order)}
                        className="flex-1 text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Pedido
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateReceiptPDF(order)}
                        className="flex-1 text-green-600 hover:text-green-700"
                      >
                        <Receipt className="h-4 w-4 mr-1" />
                        Recibo
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
