import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Palette, 
  FileText, 
  Camera,
  Save,
  Upload,
  Eye,
  Monitor,
  Printer,
  Mail,
  Phone,
  MapPin,
  Globe,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandConfig {
  // Informações da Empresa
  companyName: string;
  tradeName: string;
  document: string; // CNPJ/CPF
  email: string;
  phone: string;
  website: string;
  
  // Endereço
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Visual da Marca
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Configurações de PDF
  pdfHeaderStyle: 'minimal' | 'standard' | 'detailed';
  pdfWatermark: boolean;
  pdfFooterText: string;
  includeLogo: boolean;
  
  // Layout do Sistema
  sidebarStyle: 'compact' | 'expanded';
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  
  // Configurações de Negócio
  defaultCurrency: string;
  taxRate: number;
  defaultProfitMargin: number;
  
  // Configurações de Acesso
  allowGuestView: boolean;
  requireApproval: boolean;
  sessionTimeout: number;
}

export default function BrandSettings() {
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    // Informações da Empresa
    companyName: 'IA.TEX Solutions',
    tradeName: 'IA.TEX',
    document: '12.345.678/0001-90',
    email: 'contato@iatex.com',
    phone: '(11) 99999-9999',
    website: 'www.iatex.com',
    
    // Endereço
    address: 'Rua das Confecções, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    country: 'Brasil',
    
    // Visual da Marca
    logoUrl: '',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#16a34a',
    
    // Configurações de PDF
    pdfHeaderStyle: 'standard',
    pdfWatermark: false,
    pdfFooterText: 'Este documento foi gerado automaticamente pelo sistema IA.TEX',
    includeLogo: true,
    
    // Layout do Sistema
    sidebarStyle: 'expanded',
    theme: 'light',
    fontSize: 'medium',
    
    // Configurações de Negócio
    defaultCurrency: 'BRL',
    taxRate: 12.0,
    defaultProfitMargin: 40.0,
    
    // Configurações de Acesso
    allowGuestView: false,
    requireApproval: true,
    sessionTimeout: 60
  });

  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Aqui faria a chamada para a API para salvar as configurações
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular API call
      
      toast({
        title: "Configurações salvas com sucesso!",
        description: "As alterações foram aplicadas ao sistema."
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        setBrandConfig(prev => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const previewPDF = () => {
    toast({
      title: "Preview do PDF",
      description: "Uma nova aba será aberta com o preview do layout dos PDFs com as configurações atuais."
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações da Marca</h1>
          <p className="text-gray-600">Personalize o sistema com a identidade visual da sua empresa</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={previewPDF}>
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="pdf">PDFs</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="access">Acesso</TabsTrigger>
        </TabsList>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Razão Social</Label>
                  <Input
                    id="companyName"
                    value={brandConfig.companyName}
                    onChange={(e) => setBrandConfig(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="tradeName">Nome Fantasia</Label>
                  <Input
                    id="tradeName"
                    value={brandConfig.tradeName}
                    onChange={(e) => setBrandConfig(prev => ({ ...prev, tradeName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="document">CNPJ/CPF</Label>
                  <Input
                    id="document"
                    value={brandConfig.document}
                    onChange={(e) => setBrandConfig(prev => ({ ...prev, document: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={brandConfig.email}
                    onChange={(e) => setBrandConfig(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={brandConfig.phone}
                    onChange={(e) => setBrandConfig(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={brandConfig.website}
                    onChange={(e) => setBrandConfig(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={brandConfig.address}
                    onChange={(e) => setBrandConfig(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={brandConfig.city}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={brandConfig.state}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={brandConfig.zipCode}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={brandConfig.country}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Configurações de Negócio</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Moeda Padrão</span>
                      <Select value={brandConfig.defaultCurrency} onValueChange={(value) => setBrandConfig(prev => ({ ...prev, defaultCurrency: value }))}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">BRL</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Taxa de Impostos (%)</span>
                      <Input
                        type="number"
                        value={brandConfig.taxRate}
                        onChange={(e) => setBrandConfig(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        className="w-24"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Margem Padrão (%)</span>
                      <Input
                        type="number"
                        value={brandConfig.defaultProfitMargin}
                        onChange={(e) => setBrandConfig(prev => ({ ...prev, defaultProfitMargin: parseFloat(e.target.value) || 0 }))}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visual Tab */}
        <TabsContent value="visual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Logo da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded" />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="logo">Upload da Logo</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG ou SVG até 2MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Cores da Marca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={brandConfig.primaryColor}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={brandConfig.primaryColor}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor">Cor Secundária</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={brandConfig.secondaryColor}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={brandConfig.secondaryColor}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accentColor">Cor de Destaque</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="accentColor"
                      type="color"
                      value={brandConfig.accentColor}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={brandConfig.accentColor}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PDF Tab */}
        <TabsContent value="pdf" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configurações de PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Estilo do Cabeçalho</Label>
                    <Select value={brandConfig.pdfHeaderStyle} onValueChange={(value: any) => setBrandConfig(prev => ({ ...prev, pdfHeaderStyle: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimalista</SelectItem>
                        <SelectItem value="standard">Padrão</SelectItem>
                        <SelectItem value="detailed">Detalhado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Incluir Logo nos PDFs</Label>
                    <Switch
                      checked={brandConfig.includeLogo}
                      onCheckedChange={(checked) => setBrandConfig(prev => ({ ...prev, includeLogo: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Marca d'água</Label>
                    <Switch
                      checked={brandConfig.pdfWatermark}
                      onCheckedChange={(checked) => setBrandConfig(prev => ({ ...prev, pdfWatermark: checked }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pdfFooterText">Texto do Rodapé</Label>
                    <Textarea
                      id="pdfFooterText"
                      value={brandConfig.pdfFooterText}
                      onChange={(e) => setBrandConfig(prev => ({ ...prev, pdfFooterText: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Preview do Layout</h3>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="bg-white p-6 rounded shadow-sm max-w-md">
                    {brandConfig.includeLogo && logoPreview && (
                      <div className="mb-4">
                        <img src={logoPreview} alt="Logo" className="h-12 object-contain" />
                      </div>
                    )}
                    <div style={{ color: brandConfig.primaryColor }} className="text-xl font-bold mb-2">
                      {brandConfig.tradeName}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {brandConfig.email} | {brandConfig.phone}
                    </div>
                    <div className="text-xs text-gray-500 border-t pt-2">
                      {brandConfig.pdfFooterText}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Layout do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <Label>Estilo da Sidebar</Label>
                  <Select value={brandConfig.sidebarStyle} onValueChange={(value: any) => setBrandConfig(prev => ({ ...prev, sidebarStyle: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compacta</SelectItem>
                      <SelectItem value="expanded">Expandida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tema</Label>
                  <Select value={brandConfig.theme} onValueChange={(value: any) => setBrandConfig(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tamanho da Fonte</Label>
                  <Select value={brandConfig.fontSize} onValueChange={(value: any) => setBrandConfig(prev => ({ ...prev, fontSize: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequena</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Tab */}
        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Controle de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permitir Acesso de Convidados</Label>
                    <p className="text-sm text-gray-600">Usuários não autenticados podem visualizar dados básicos</p>
                  </div>
                  <Switch
                    checked={brandConfig.allowGuestView}
                    onCheckedChange={(checked) => setBrandConfig(prev => ({ ...prev, allowGuestView: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exigir Aprovação para Novos Usuários</Label>
                    <p className="text-sm text-gray-600">Novos cadastros precisam de aprovação do administrador</p>
                  </div>
                  <Switch
                    checked={brandConfig.requireApproval}
                    onCheckedChange={(checked) => setBrandConfig(prev => ({ ...prev, requireApproval: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Timeout de Sessão (minutos)</Label>
                    <p className="text-sm text-gray-600">Tempo limite para inatividade do usuário</p>
                  </div>
                  <Input
                    type="number"
                    value={brandConfig.sessionTimeout}
                    onChange={(e) => setBrandConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 60 }))}
                    className="w-24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}