import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Settings, 
  Download, 
  Upload,
  Database,
  Activity,
  UserPlus,
  Key,
  Monitor,
  HardDrive,
  Trash2,
  Edit,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'factory' | 'client';
  status: 'active' | 'inactive';
  lastLogin?: string;
  permissions: string[];
  createdAt: string;
}

interface SystemSettings {
  theme: 'light' | 'dark' | 'auto';
  backupEnabled: boolean;
  autoBackupInterval: number;
  maxFileSize: number;
  allowGuestAccess: boolean;
  sessionTimeout: number;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'employee' as const,
    permissions: [] as string[]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data - in production this would come from API
  const users: User[] = [
    {
      id: '1',
      name: 'Admin Sistema',
      email: 'admin@iatex.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-01-02T10:30:00Z',
      permissions: ['all'],
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Gerente Produção',
      email: 'gerente@iatex.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2025-01-02T09:15:00Z',
      permissions: ['production', 'orders', 'employees'],
      createdAt: '2025-01-01T00:00:00Z'
    }
  ];

  const systemSettings: SystemSettings = {
    theme: 'light',
    backupEnabled: true,
    autoBackupInterval: 24,
    maxFileSize: 10,
    allowGuestAccess: false,
    sessionTimeout: 60
  };

  const modulePermissions = [
    { id: 'dashboard', name: 'Dashboard', description: 'Visualizar métricas e KPIs' },
    { id: 'fabrics', name: 'Tecidos', description: 'Gestão de tecidos e fornecedores' },
    { id: 'models', name: 'Modelos', description: 'Modelos e precificação' },
    { id: 'orders', name: 'Pedidos', description: 'Gestão de pedidos' },
    { id: 'production', name: 'Produção', description: 'Acompanhamento de produção' },
    { id: 'financial', name: 'Financeiro', description: 'Controle financeiro' },
    { id: 'inventory', name: 'Estoque', description: 'Gestão de estoque' },
    { id: 'employees', name: 'Funcionários', description: 'Gestão de equipe' },
    { id: 'clients', name: 'Clientes', description: 'Gestão de clientes' },
    { id: 'reports', name: 'Relatórios', description: 'Relatórios e analytics' }
  ];

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/backup/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `iatex-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Backup realizado com sucesso!",
        description: "Os dados foram exportados para download."
      });
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: "Não foi possível realizar o backup dos dados.",
        variant: "destructive"
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'factory': return 'bg-purple-100 text-purple-800';
      case 'client': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    const roleNames = {
      admin: 'Administrador',
      manager: 'Gerente',
      employee: 'Funcionário',
      factory: 'Facção',
      client: 'Cliente'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
          <p className="text-gray-600">Gerencie usuários, permissões e configurações do sistema</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleBackup} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button onClick={() => setShowAddUserModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-gray-600">Usuários Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-sm text-gray-600">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">17</p>
                <p className="text-sm text-gray-600">Módulos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="logs">Logs & Atividade</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Último acesso: {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleName(user.role)}
                      </Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissões por Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modulePermissions.map((module) => (
                  <div key={module.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{module.name}</h3>
                      <Badge variant="outline">{module.id}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded"></div>
                        Admin: Total
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded"></div>
                        Manager: Limitado
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded"></div>
                        Employee: Leitura
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-300 rounded"></div>
                        Client: Negado
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tema do Sistema</Label>
                    <p className="text-sm text-gray-600">Aparência da interface</p>
                  </div>
                  <Select value={systemSettings.theme}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Timeout de Sessão</Label>
                    <p className="text-sm text-gray-600">Tempo em minutos</p>
                  </div>
                  <Input 
                    type="number" 
                    value={systemSettings.sessionTimeout} 
                    className="w-20"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Acesso de Convidados</Label>
                    <p className="text-sm text-gray-600">Permitir visualização limitada</p>
                  </div>
                  <Switch checked={systemSettings.allowGuestAccess} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-gray-600">Backup diário dos dados</p>
                  </div>
                  <Switch checked={systemSettings.backupEnabled} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Intervalo de Backup</Label>
                    <p className="text-sm text-gray-600">Horas entre backups</p>
                  </div>
                  <Input 
                    type="number" 
                    value={systemSettings.autoBackupInterval} 
                    className="w-20"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tamanho Máximo de Arquivo</Label>
                    <p className="text-sm text-gray-600">Limite em MB</p>
                  </div>
                  <Input 
                    type="number" 
                    value={systemSettings.maxFileSize} 
                    className="w-20"
                  />
                </div>

                <Separator />

                <Button onClick={handleBackup} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Backup Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Usuário logado no sistema</p>
                    <span className="text-xs text-gray-500">2 min atrás</span>
                  </div>
                  <p className="text-xs text-gray-600">admin@iatex.com</p>
                </div>
                
                <div className="p-3 border-l-4 border-green-500 bg-green-50">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Backup realizado com sucesso</p>
                    <span className="text-xs text-gray-500">1 hora atrás</span>
                  </div>
                  <p className="text-xs text-gray-600">Sistema automatico</p>
                </div>
                
                <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">Novo cliente cadastrado</p>
                    <span className="text-xs text-gray-500">3 horas atrás</span>
                  </div>
                  <p className="text-xs text-gray-600">gerente@iatex.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">Nome Completo</Label>
              <Input
                id="userName"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="userEmail">E-mail</Label>
              <Input
                id="userEmail"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="userRole">Função</Label>
              <Select value={newUserData.role} onValueChange={(value: any) => setNewUserData({...newUserData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  <SelectItem value="factory">Facção</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button>Criar Usuário</Button>
              <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}