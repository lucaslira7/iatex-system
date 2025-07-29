import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
    BarChart3,
    FileText,
    Download,
    Upload,
    Settings,
    Eye,
    Printer,
    Share2,
    Calendar,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Users,
    Factory,
    Clock,
    Filter,
    Search,
    Plus,
    Trash2,
    Edit,
    Save,
    FileSpreadsheet,
    FileImage,
    Mail,
    Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    category: 'financial' | 'operational' | 'commercial' | 'custom';
    format: 'pdf' | 'excel' | 'csv' | 'image';
    sections: string[];
    customFields: CustomField[];
    lastUsed?: string;
    isDefault: boolean;
}

interface CustomField {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    required: boolean;
    defaultValue?: any;
    options?: string[];
}

interface ExportConfig {
    format: 'pdf' | 'excel' | 'csv' | 'image';
    template: string;
    dateRange: {
        start: string;
        end: string;
    };
    sections: string[];
    includeCharts: boolean;
    includeTables: boolean;
    includeSummary: boolean;
    customFields: Record<string, any>;
    deliveryMethod: 'download' | 'email' | 'cloud';
    emailRecipients?: string[];
    fileName: string;
    compression: boolean;
    password?: string;
}

interface ReportData {
    id: string;
    name: string;
    type: string;
    generatedAt: string;
    size: string;
    format: string;
    status: 'completed' | 'processing' | 'failed';
    downloadUrl?: string;
}

export default function ReportsAnalytics() {
    const [activeTab, setActiveTab] = useState('reports');
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
    const [reports, setReports] = useState<ReportData[]>([]);
    const [templates, setTemplates] = useState<ReportTemplate[]>([
        {
            id: '1',
            name: 'Relatório Financeiro Completo',
            description: 'DRE, fluxo de caixa e análise de receitas',
            category: 'financial',
            format: 'pdf',
            sections: ['dre', 'fluxo_caixa', 'receitas', 'despesas'],
            customFields: [
                { id: '1', name: 'Incluir Projeções', type: 'checkbox', required: false, defaultValue: true },
                { id: '2', name: 'Período de Análise', type: 'select', required: true, options: ['Mensal', 'Trimestral', 'Anual'] }
            ],
            isDefault: true
        },
        {
            id: '2',
            name: 'Dashboard Operacional',
            description: 'Métricas de produção e eficiência',
            category: 'operational',
            format: 'excel',
            sections: ['producao', 'eficiencia', 'qualidade', 'metas'],
            customFields: [
                { id: '3', name: 'Facção', type: 'select', required: false, options: ['Todas', 'Facção A', 'Facção B'] },
                { id: '4', name: 'Incluir Gráficos', type: 'checkbox', required: false, defaultValue: true }
            ],
            isDefault: false
        },
        {
            id: '3',
            name: 'Análise Comercial',
            description: 'Vendas, clientes e produtos mais vendidos',
            category: 'commercial',
            format: 'pdf',
            sections: ['vendas', 'clientes', 'produtos', 'tendencias'],
            customFields: [
                { id: '5', name: 'Top Clientes', type: 'number', required: false, defaultValue: 10 },
                { id: '6', name: 'Incluir Comparativo', type: 'checkbox', required: false, defaultValue: true }
            ],
            isDefault: false
        }
    ]);

    const [exportConfig, setExportConfig] = useState<ExportConfig>({
        format: 'pdf',
        template: '1',
        dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        },
        sections: ['dre', 'fluxo_caixa'],
        includeCharts: true,
        includeTables: true,
        includeSummary: true,
        customFields: {},
        deliveryMethod: 'download',
        fileName: 'relatorio_iatex',
        compression: true
    });

    const { toast } = useToast();

    // Simular dados de relatórios gerados
    useEffect(() => {
        setReports([
            {
                id: '1',
                name: 'Relatório Financeiro - Janeiro 2025',
                type: 'financial',
                generatedAt: '2025-01-15T10:30:00Z',
                size: '2.3 MB',
                format: 'PDF',
                status: 'completed',
                downloadUrl: '/reports/financial_jan_2025.pdf'
            },
            {
                id: '2',
                name: 'Dashboard Operacional - Semana 3',
                type: 'operational',
                generatedAt: '2025-01-14T16:45:00Z',
                size: '1.8 MB',
                format: 'Excel',
                status: 'completed',
                downloadUrl: '/reports/operational_week3.xlsx'
            },
            {
                id: '3',
                name: 'Análise Comercial - Dezembro 2024',
                type: 'commercial',
                generatedAt: '2025-01-10T09:15:00Z',
                size: '3.1 MB',
                format: 'PDF',
                status: 'completed',
                downloadUrl: '/reports/commercial_dec_2024.pdf'
            }
        ]);
    }, []);

    const handleExport = async () => {
        const selectedTemplateData = templates.find(t => t.id === exportConfig.template);
        if (!selectedTemplateData) return;

        toast({
            title: "Gerando relatório...",
            description: `Preparando ${exportConfig.format.toUpperCase()} com template "${selectedTemplateData.name}"`,
        });

        // Simular geração do relatório
        setTimeout(() => {
            const newReport: ReportData = {
                id: Date.now().toString(),
                name: `${selectedTemplateData.name} - ${new Date().toLocaleDateString()}`,
                type: selectedTemplateData.category,
                generatedAt: new Date().toISOString(),
                size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
                format: exportConfig.format.toUpperCase(),
                status: 'completed',
                downloadUrl: `/reports/${exportConfig.fileName}_${Date.now()}.${exportConfig.format}`
            };

            setReports(prev => [newReport, ...prev]);
            setShowExportDialog(false);

            toast({
                title: "Relatório gerado com sucesso!",
                description: `Arquivo ${exportConfig.format.toUpperCase()} pronto para download.`,
            });
        }, 2000);
    };

    const handleDownload = (report: ReportData) => {
        toast({
            title: "Download iniciado",
            description: `Baixando ${report.name}`,
        });
    };

    const handleShare = (report: ReportData) => {
        toast({
            title: "Compartilhando relatório",
            description: "Link de compartilhamento copiado para a área de transferência.",
        });
    };

    const handleDelete = (reportId: string) => {
        setReports(prev => prev.filter(r => r.id !== reportId));
        toast({
            title: "Relatório removido",
            description: "O relatório foi excluído permanentemente.",
        });
    };

    const createTemplate = () => {
        const newTemplate: ReportTemplate = {
            id: Date.now().toString(),
            name: 'Novo Template',
            description: 'Descrição do novo template',
            category: 'custom',
            format: 'pdf',
            sections: [],
            customFields: [],
            isDefault: false
        };
        setTemplates(prev => [...prev, newTemplate]);
        setSelectedTemplate(newTemplate);
        setShowTemplateDialog(true);
    };

    const saveTemplate = (template: ReportTemplate) => {
        setTemplates(prev =>
            prev.map(t => t.id === template.id ? template : t)
        );
        setShowTemplateDialog(false);
        toast({
            title: "Template salvo",
            description: "As alterações foram salvas com sucesso.",
        });
    };

    const getFormatIcon = (format: string) => {
        switch (format.toLowerCase()) {
            case 'pdf': return FileText;
            case 'excel': return FileSpreadsheet;
            case 'csv': return FileText;
            case 'image': return FileImage;
            default: return FileText;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'financial': return DollarSign;
            case 'operational': return Factory;
            case 'commercial': return TrendingUp;
            default: return FileText;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'processing': return 'text-yellow-600 bg-yellow-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <BarChart3 className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Relatórios & Analytics</h1>
                        <p className="text-gray-600">Geração avançada de relatórios e análises</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Relatório
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Gerar Novo Relatório</DialogTitle>
                                <DialogDescription>
                                    Configure o formato, template e opções de exportação
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Seleção de Template */}
                                <div>
                                    <Label className="text-base font-medium">Template do Relatório</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        {templates.map(template => (
                                            <Card
                                                key={template.id}
                                                className={`cursor-pointer transition-all ${exportConfig.template === template.id
                                                    ? 'ring-2 ring-blue-500 bg-blue-50'
                                                    : 'hover:shadow-md'
                                                    }`}
                                                onClick={() => setExportConfig(prev => ({ ...prev, template: template.id }))}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">{template.name}</h4>
                                                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <Badge variant="outline">{template.category}</Badge>
                                                                <Badge variant="outline">{template.format.toUpperCase()}</Badge>
                                                            </div>
                                                        </div>
                                                        {template.isDefault && (
                                                            <Badge className="text-xs">Padrão</Badge>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Configurações de Exportação */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Formato de Saída</Label>
                                            <Select
                                                value={exportConfig.format}
                                                onValueChange={(value: any) => setExportConfig(prev => ({ ...prev, format: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pdf">PDF (Recomendado)</SelectItem>
                                                    <SelectItem value="excel">Excel (Planilha)</SelectItem>
                                                    <SelectItem value="csv">CSV (Dados)</SelectItem>
                                                    <SelectItem value="image">Imagem (PNG/JPG)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>Período de Análise</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Input
                                                    type="date"
                                                    value={exportConfig.dateRange.start}
                                                    onChange={(e) => setExportConfig(prev => ({
                                                        ...prev,
                                                        dateRange: { ...prev.dateRange, start: e.target.value }
                                                    }))}
                                                />
                                                <Input
                                                    type="date"
                                                    value={exportConfig.dateRange.end}
                                                    onChange={(e) => setExportConfig(prev => ({
                                                        ...prev,
                                                        dateRange: { ...prev.dateRange, end: e.target.value }
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Método de Entrega</Label>
                                            <Select
                                                value={exportConfig.deliveryMethod}
                                                onValueChange={(value: any) => setExportConfig(prev => ({ ...prev, deliveryMethod: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="download">Download Direto</SelectItem>
                                                    <SelectItem value="email">Enviar por Email</SelectItem>
                                                    <SelectItem value="cloud">Salvar na Nuvem</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Opções de Conteúdo</Label>
                                            <div className="space-y-2 mt-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={exportConfig.includeCharts}
                                                        onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeCharts: !!checked }))}
                                                    />
                                                    <Label>Incluir Gráficos</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={exportConfig.includeTables}
                                                        onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeTables: !!checked }))}
                                                    />
                                                    <Label>Incluir Tabelas</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={exportConfig.includeSummary}
                                                        onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, includeSummary: !!checked }))}
                                                    />
                                                    <Label>Incluir Resumo Executivo</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        checked={exportConfig.compression}
                                                        onCheckedChange={(checked) => setExportConfig(prev => ({ ...prev, compression: !!checked }))}
                                                    />
                                                    <Label>Comprimir Arquivo</Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Nome do Arquivo</Label>
                                            <Input
                                                value={exportConfig.fileName}
                                                onChange={(e) => setExportConfig(prev => ({ ...prev, fileName: e.target.value }))}
                                                placeholder="relatorio_iatex"
                                            />
                                        </div>

                                        {exportConfig.deliveryMethod === 'email' && (
                                            <div>
                                                <Label>Emails Destinatários</Label>
                                                <Textarea
                                                    placeholder="email1@exemplo.com, email2@exemplo.com"
                                                    value={exportConfig.emailRecipients?.join(', ') || ''}
                                                    onChange={(e) => setExportConfig(prev => ({
                                                        ...prev,
                                                        emailRecipients: e.target.value.split(',').map(email => email.trim())
                                                    }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Campos Personalizados do Template */}
                                {(() => {
                                    const selectedTemplateData = templates.find(t => t.id === exportConfig.template);
                                    if (!selectedTemplateData?.customFields.length) return null;

                                    return (
                                        <div>
                                            <Label className="text-base font-medium">Campos Personalizados</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                {selectedTemplateData.customFields.map(field => (
                                                    <div key={field.id}>
                                                        <Label>{field.name}</Label>
                                                        {field.type === 'text' && (
                                                            <Input
                                                                type="text"
                                                                defaultValue={field.defaultValue}
                                                                onChange={(e) => setExportConfig(prev => ({
                                                                    ...prev,
                                                                    customFields: { ...prev.customFields, [field.id]: e.target.value }
                                                                }))}
                                                            />
                                                        )}
                                                        {field.type === 'number' && (
                                                            <Input
                                                                type="number"
                                                                defaultValue={field.defaultValue}
                                                                onChange={(e) => setExportConfig(prev => ({
                                                                    ...prev,
                                                                    customFields: { ...prev.customFields, [field.id]: parseInt(e.target.value) }
                                                                }))}
                                                            />
                                                        )}
                                                        {field.type === 'date' && (
                                                            <Input
                                                                type="date"
                                                                defaultValue={field.defaultValue}
                                                                onChange={(e) => setExportConfig(prev => ({
                                                                    ...prev,
                                                                    customFields: { ...prev.customFields, [field.id]: e.target.value }
                                                                }))}
                                                            />
                                                        )}
                                                        {field.type === 'select' && (
                                                            <Select
                                                                defaultValue={field.defaultValue}
                                                                onValueChange={(value) => setExportConfig(prev => ({
                                                                    ...prev,
                                                                    customFields: { ...prev.customFields, [field.id]: value }
                                                                }))}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {field.options?.map(option => (
                                                                        <SelectItem key={option} value={option}>{option}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                        {field.type === 'checkbox' && (
                                                            <div className="flex items-center space-x-2 mt-2">
                                                                <Checkbox
                                                                    defaultChecked={field.defaultValue}
                                                                    onCheckedChange={(checked) => setExportConfig(prev => ({
                                                                        ...prev,
                                                                        customFields: { ...prev.customFields, [field.id]: checked }
                                                                    }))}
                                                                />
                                                                <Label>Habilitado</Label>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleExport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Gerar Relatório
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                Gerenciar Templates
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Gerenciar Templates</DialogTitle>
                                <DialogDescription>
                                    Crie e edite templates personalizados para relatórios
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">Templates Disponíveis</h3>
                                    <Button size="sm" onClick={createTemplate}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Novo Template
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {templates.map(template => (
                                        <Card key={template.id} className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{template.name}</h4>
                                                    <p className="text-sm text-gray-600">{template.description}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Badge variant="outline">{template.category}</Badge>
                                                        <Badge variant="outline">{template.format.toUpperCase()}</Badge>
                                                        {template.isDefault && <Badge>Padrão</Badge>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedTemplate(template);
                                                            setShowTemplateDialog(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setTemplates(prev => prev.filter(t => t.id !== template.id));
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="reports" className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>Relatórios</span>
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center space-x-1">
                        <Settings className="h-4 w-4" />
                        <span>Templates</span>
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>Analytics</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input placeholder="Buscar relatórios..." className="pl-10 w-64" />
                            </div>
                            <Select defaultValue="all">
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="financial">Financeiro</SelectItem>
                                    <SelectItem value="operational">Operacional</SelectItem>
                                    <SelectItem value="commercial">Comercial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {reports.map((report) => {
                            const FormatIcon = getFormatIcon(report.format);
                            const CategoryIcon = getCategoryIcon(report.type);

                            return (
                                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <FormatIcon className="h-6 w-6 text-gray-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <h4 className="font-medium">{report.name}</h4>
                                                        <Badge className={getStatusColor(report.status)}>
                                                            {report.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                        <span className="flex items-center space-x-1">
                                                            <CategoryIcon className="h-3 w-3" />
                                                            <span>{report.type}</span>
                                                        </span>
                                                        <span className="flex items-center space-x-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                                                        </span>
                                                        <span>{report.size}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(report)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleShare(report)}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(report.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => {
                            const CategoryIcon = getCategoryIcon(template.category);

                            return (
                                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <CategoryIcon className="h-5 w-5 text-gray-600" />
                                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                            </div>
                                            {template.isDefault && (
                                                <Badge>Padrão</Badge>
                                            )}
                                        </div>
                                        <CardDescription>{template.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Categoria:</span>
                                                <Badge variant="outline">{template.category}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Formato:</span>
                                                <Badge variant="outline">{template.format.toUpperCase()}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Seções:</span>
                                                <span className="text-sm font-medium">{template.sections.length}</span>
                                            </div>
                                            {template.lastUsed && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Último uso:</span>
                                                    <span className="text-sm">{new Date(template.lastUsed).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2 mt-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedTemplate(template);
                                                    setShowTemplateDialog(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    setExportConfig(prev => ({ ...prev, template: template.id }));
                                                    setShowExportDialog(true);
                                                }}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Usar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Relatórios Gerados</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{reports.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    +12% em relação ao mês anterior
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Templates Ativos</CardTitle>
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{templates.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    {templates.filter(t => t.isDefault).length} padrão
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                                <Download className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">156</div>
                                <p className="text-xs text-muted-foreground">
                                    +8% em relação à semana anterior
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2.3s</div>
                                <p className="text-xs text-muted-foreground">
                                    Tempo de geração
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 