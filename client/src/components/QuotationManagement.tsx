import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Edit, 
  Trash2,
  Plus,
  Calendar,
  User,
  Package,
  Receipt,
  Send
} from 'lucide-react';
import { generateQuotation, generateCommercialProposal, type DocumentData } from '@/lib/documentGenerator';
import { useToast } from '@/hooks/use-toast';

interface Quotation {
  id: number;
  modelName: string;
  reference: string;
  garmentType: string;
  pricingMode: 'single' | 'multiple';
  finalPrice: number;
  status: 'draft' | 'approved' | 'sent';
  createdAt: string;
  validUntil: string;
  clientName?: string;
}

export default function QuotationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Fetch quotations
  const { data: quotations = [], isLoading } = useQuery<Quotation[]>({
    queryKey: ['/api/quotations'],
  });

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Rascunho' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Enviado' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleView = (quotation: Quotation) => {
    // Implementar visualização da precificação
    console.log('Visualizar precificação:', quotation);
  };

  const handleEdit = (quotation: Quotation) => {
    // Implementar edição da precificação
    console.log('Editar precificação:', quotation);
  };

  const handleDelete = (quotation: Quotation) => {
    // Implementar exclusão da precificação
    if (confirm('Tem certeza que deseja excluir esta precificação?')) {
      console.log('Excluir precificação:', quotation);
    }
  };

  const generateQuotationPDF = async (quotation: Quotation) => {
    try {
      const documentData: DocumentData = {
        companyName: 'IA.TEX',
        companyCNPJ: '00.000.000/0001-00',
        companyAddress: 'Endereço da Empresa',
        companyPhone: '(11) 99999-9999',
        companyEmail: 'contato@iatex.com.br',
        clientName: quotation.clientName || 'Cliente',
        documentNumber: `ORC-${quotation.id.toString().padStart(4, '0')}`,
        documentDate: new Date(),
        validUntil: new Date(quotation.validUntil),
        items: [{
          code: quotation.reference,
          description: quotation.modelName,
          quantity: 1,
          unitPrice: quotation.finalPrice,
          total: quotation.finalPrice
        }],
        subtotal: quotation.finalPrice,
        total: quotation.finalPrice,
        paymentTerms: 'A combinar',
        deliveryTerms: 'Conforme negociação'
      };

      const pdf = generateQuotation(documentData);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orcamento_${quotation.reference}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
      link.click();
      
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast({
        title: "Orçamento gerado!",
        description: "PDF criado e sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar orçamento",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const generateProposalPDF = async (quotation: Quotation) => {
    try {
      const documentData: DocumentData = {
        companyName: 'IA.TEX',
        companyCNPJ: '00.000.000/0001-00',
        companyAddress: 'Endereço da Empresa',
        companyPhone: '(11) 99999-9999',
        companyEmail: 'contato@iatex.com.br',
        clientName: quotation.clientName || 'Cliente',
        documentNumber: `PROP-${quotation.id.toString().padStart(4, '0')}`,
        documentDate: new Date(),
        validUntil: new Date(quotation.validUntil),
        items: [{
          code: quotation.reference,
          description: quotation.modelName,
          quantity: 1,
          unitPrice: quotation.finalPrice,
          total: quotation.finalPrice
        }],
        subtotal: quotation.finalPrice,
        total: quotation.finalPrice,
        paymentTerms: 'Condições especiais conforme negociação',
        deliveryTerms: 'Prazo de entrega: 15 dias úteis',
        observations: 'Proposta válida conforme especificações técnicas anexas.'
      };

      const pdf = generateCommercialProposal(documentData);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proposta_${quotation.reference}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '')}.pdf`;
      link.click();
      
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast({
        title: "Proposta comercial gerada!",
        description: "PDF criado e sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar proposta",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Precificações</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Precificações</h2>
          <p className="text-gray-600">Gerencie seus orçamentos e precificações</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Precificação
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome do modelo ou referência..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="draft">Rascunho</option>
                <option value="approved">Aprovado</option>
                <option value="sent">Enviado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{quotations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotations.filter(q => q.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotations.filter(q => q.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enviados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quotations.filter(q => q.status === 'sent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotations List */}
      {filteredQuotations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {quotations.length === 0 ? 'Nenhuma precificação encontrada' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {quotations.length === 0 
                ? 'Crie sua primeira precificação clicando no botão "Nova Precificação".'
                : 'Tente ajustar os filtros de busca para encontrar o que procura.'
              }
            </p>
            {quotations.length === 0 && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Precificação
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuotations.map((quotation) => (
            <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{quotation.modelName}</CardTitle>
                    <p className="text-sm text-gray-600">Ref: {quotation.reference}</p>
                  </div>
                  {getStatusBadge(quotation.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    {quotation.garmentType} - {quotation.pricingMode === 'single' ? 'Peça Única' : 'Múltiplas Peças'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Criado em {new Date(quotation.createdAt).toLocaleDateString('pt-BR')}
                  </div>

                  {quotation.clientName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {quotation.clientName}
                    </div>
                  )}

                  <div className="text-lg font-semibold text-green-600">
                    R$ {quotation.finalPrice?.toFixed(2) || '0,00'}
                  </div>

                  <div className="space-y-2 pt-3">
                    {/* Primeira linha - Ações principais */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(quotation)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(quotation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(quotation)}
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
                        onClick={() => generateQuotationPDF(quotation)}
                        className="flex-1 text-blue-600 hover:text-blue-700"
                      >
                        <Receipt className="h-4 w-4 mr-1" />
                        Orçamento
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateProposalPDF(quotation)}
                        className="flex-1 text-green-600 hover:text-green-700"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Proposta
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