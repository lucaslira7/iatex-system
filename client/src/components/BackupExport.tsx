import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  Database, 
  FileText,
  Package,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportModule {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  size: string;
  lastExport?: string;
}

export default function BackupExport() {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState<'json' | 'excel' | 'pdf'>('json');

  const { toast } = useToast();

  const exportModules: ExportModule[] = [
    {
      id: 'fabrics',
      name: 'Tecidos',
      description: 'Catálogo completo de tecidos e fornecedores',
      icon: Package,
      enabled: true,
      size: '2.3 MB',
      lastExport: '2025-01-01T10:30:00Z'
    },
    {
      id: 'models',
      name: 'Modelos & Precificação',
      description: 'Templates de precificação e modelos',
      icon: FileText,
      enabled: true,
      size: '1.8 MB',
      lastExport: '2025-01-01T10:30:00Z'
    },
    {
      id: 'orders',
      name: 'Pedidos',
      description: 'Histórico completo de pedidos',
      icon: Package,
      enabled: true,
      size: '850 KB',
      lastExport: '2025-01-01T10:30:00Z'
    },
    {
      id: 'clients',
      name: 'Clientes',
      description: 'Base de dados de clientes',
      icon: Database,
      enabled: true,
      size: '420 KB',
      lastExport: '2025-01-01T10:30:00Z'
    },
    {
      id: 'financial',
      name: 'Financeiro',
      description: 'Dados financeiros e fluxo de caixa',
      icon: Database,
      enabled: true,
      size: '1.2 MB',
      lastExport: '2025-01-01T10:30:00Z'
    },
    {
      id: 'inventory',
      name: 'Estoque',
      description: 'Controle de estoque e insumos',
      icon: Package,
      enabled: true,
      size: '680 KB',
      lastExport: '2025-01-01T10:30:00Z'
    },
    {
      id: 'employees',
      name: 'Funcionários',
      description: 'Dados de funcionários e tarefas',
      icon: Database,
      enabled: true,
      size: '320 KB',
      lastExport: '2025-01-01T10:30:00Z'
    },
    {
      id: 'production',
      name: 'Produção',
      description: 'Dados de produção e facções',
      icon: Settings,
      enabled: true,
      size: '950 KB',
      lastExport: '2025-01-01T10:30:00Z'
    }
  ];

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModules.length === exportModules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(exportModules.map(m => m.id));
    }
  };

  const handleExport = async () => {
    if (selectedModules.length === 0) {
      toast({
        title: "Selecione módulos para exportar",
        description: "Você deve selecionar pelo menos um módulo.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Call the backup API
      const response = await fetch('/api/backup/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Falha na exportação');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = exportFormat === 'json' 
        ? `iatex-backup-${timestamp}.json`
        : exportFormat === 'excel'
        ? `iatex-data-${timestamp}.xlsx`
        : `iatex-report-${timestamp}.pdf`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      clearInterval(progressInterval);
      setExportProgress(100);

      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        toast({
          title: "Exportação concluída!",
          description: `Dados exportados com sucesso em formato ${exportFormat.toUpperCase()}.`
        });
      }, 500);

    } catch (error) {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getTotalSize = () => {
    return selectedModules.reduce((total, moduleId) => {
      const module = exportModules.find(m => m.id === moduleId);
      if (module) {
        const sizeNum = parseFloat(module.size.split(' ')[0]);
        const unit = module.size.split(' ')[1];
        return total + (unit === 'MB' ? sizeNum * 1024 : sizeNum);
      }
      return total;
    }, 0);
  };

  const formatSize = (sizeKB: number) => {
    if (sizeKB >= 1024) {
      return `${(sizeKB / 1024).toFixed(1)} MB`;
    }
    return `${sizeKB.toFixed(0)} KB`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup & Exportações</h1>
          <p className="text-gray-600">Faça backup dos seus dados e exporte relatórios em diferentes formatos</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Upload className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || selectedModules.length === 0}
            className="min-w-32"
          >
            {isExporting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{exportModules.filter(m => m.enabled).length}</p>
                <p className="text-sm text-gray-600">Módulos Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{selectedModules.length}</p>
                <p className="text-sm text-gray-600">Módulos Selecionados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatSize(getTotalSize())}</p>
                <p className="text-sm text-gray-600">Tamanho Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Download className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">JSON</p>
                <p className="text-sm text-gray-600">Formato Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Progress */}
      {isExporting && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Exportando Dados...</h3>
                <span className="text-sm text-gray-600">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
              <p className="text-sm text-gray-600">
                Processando {selectedModules.length} módulos selecionados
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Formato de Exportação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                exportFormat === 'json' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setExportFormat('json')}
            >
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">JSON</h3>
                  <p className="text-sm text-gray-600">Backup completo estruturado</p>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                exportFormat === 'excel' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setExportFormat('excel')}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-medium">Excel</h3>
                  <p className="text-sm text-gray-600">Planilhas organizadas</p>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                exportFormat === 'pdf' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setExportFormat('pdf')}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-medium">PDF</h3>
                  <p className="text-sm text-gray-600">Relatórios formatados</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Selecionar Módulos para Exportação</CardTitle>
            <Button variant="outline" onClick={handleSelectAll}>
              {selectedModules.length === exportModules.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportModules.map((module) => {
              const Icon = module.icon;
              const isSelected = selectedModules.includes(module.id);
              
              return (
                <div 
                  key={module.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleModuleToggle(module.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onChange={() => handleModuleToggle(module.id)}
                    />
                    <Icon className={`h-6 w-6 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{module.name}</h3>
                        <Badge variant={module.enabled ? 'default' : 'secondary'}>
                          {module.size}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                      <div className="text-xs text-gray-500">
                        Última exportação: {new Date(module.lastExport || '').toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => {
                setSelectedModules(exportModules.map(m => m.id));
                setExportFormat('json');
              }}
            >
              <Database className="h-6 w-6" />
              <span>Backup Completo</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => {
                setSelectedModules(['models', 'orders', 'clients']);
                setExportFormat('excel');
              }}
            >
              <FileText className="h-6 w-6" />
              <span>Relatório Comercial</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => {
                setSelectedModules(['financial', 'orders']);
                setExportFormat('pdf');
              }}
            >
              <Download className="h-6 w-6" />
              <span>Relatório Financeiro</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}