import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Shield, Download, Upload, Settings, Users, Database, FileText, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'operator' | 'factory';
    status: 'active' | 'inactive';
    lastLogin: Date;
    permissions: string[];
}

interface Backup {
    id: number;
    name: string;
    type: 'full' | 'partial';
    size: string;
    createdAt: Date;
    status: 'completed' | 'in_progress' | 'failed';
    description: string;
}

export default function AdminBackup() {
    const [activeTab, setActiveTab] = useState("administration");
    const [users, setUsers] = useState<User[]>([]);
    const [backups, setBackups] = useState<Backup[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [isCreateBackupOpen, setIsCreateBackupOpen] = useState(false);
    const { toast } = useToast();

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="h-5 w-5 text-red-600" />;
            case 'manager': return <Users className="h-5 w-5 text-blue-600" />;
            case 'operator': return <Settings className="h-5 w-5 text-green-600" />;
            case 'factory': return <Database className="h-5 w-5 text-purple-600" />;
            default: return <Users className="h-5 w-5 text-gray-600" />;
        }
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'manager': return 'Gerente';
            case 'operator': return 'Operador';
            case 'factory': return 'Faccionista';
            default: return role;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'inactive': return <XCircle className="h-4 w-4 text-red-600" />;
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'in_progress': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
            default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'completed': return 'text-green-600 bg-green-100';
            case 'inactive':
            case 'failed': return 'text-red-600 bg-red-100';
            case 'in_progress': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleCreateUser = () => {
        toast({
            title: "Usuário criado",
            description: "Novo usuário adicionado com sucesso!",
        });
        setIsCreateUserOpen(false);
    };

    const handleCreateBackup = () => {
        const newBackup: Backup = {
            id: backups.length + 1,
            name: `Backup_${new Date().toISOString().split('T')[0]}`,
            type: 'full',
            size: '45.2MB',
            createdAt: new Date(),
            status: 'completed',
            description: 'Backup completo do sistema'
        };
        setBackups([...backups, newBackup]);
        setIsCreateBackupOpen(false);
        toast({
            title: "Backup criado",
            description: "Backup realizado com sucesso!",
        });
    };

    const handleDeleteUser = (user: User) => {
        setUsers(users.filter(u => u.id !== user.id));
        toast({
            title: "Usuário removido",
            description: `${user.name} foi excluído do sistema.`,
        });
    };

    const handleDeleteBackup = (backup: Backup) => {
        setBackups(backups.filter(b => b.id !== backup.id));
        toast({
            title: "Backup removido",
            description: `${backup.name} foi excluído permanentemente.`,
        });
    };

    const handleDownloadBackup = (backup: Backup) => {
        toast({
            title: "Download iniciado",
            description: `Baixando ${backup.name}...`,
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Administração & Backup</h1>
                        <p className="text-gray-600">Gestão de usuários e backup do sistema</p>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="administration">Administração</TabsTrigger>
                    <TabsTrigger value="backup">Backup & Exportação</TabsTrigger>
                </TabsList>

                <TabsContent value="administration" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
                            <p className="text-gray-600">Controle de acesso e permissões do sistema</p>
                        </div>
                        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Novo Usuário
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                                    <DialogDescription>
                                        Adicione um novo usuário ao sistema
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="user-name">Nome</Label>
                                        <Input id="user-name" placeholder="Nome completo" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="user-email">Email</Label>
                                        <Input id="user-email" type="email" placeholder="email@exemplo.com" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="user-role">Função</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a função" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Administrador</SelectItem>
                                                <SelectItem value="manager">Gerente</SelectItem>
                                                <SelectItem value="operator">Operador</SelectItem>
                                                <SelectItem value="factory">Faccionista</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleCreateUser}>
                                        Criar Usuário
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <Card key={user.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {getRoleIcon(user.role)}
                                            <CardTitle className="text-lg">{user.name}</CardTitle>
                                        </div>
                                        <Badge className={getStatusColor(user.status)}>
                                            {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-sm">
                                        {user.email}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Função:</span>
                                            <span>{getRoleName(user.role)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Último login:</span>
                                            <span>{user.lastLogin.toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Permissões:</span>
                                            <span>{user.permissions.length}</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {users.length === 0 && (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário cadastrado</h3>
                                <p className="text-gray-600 mb-4">
                                    Adicione o primeiro usuário ao sistema para começar
                                </p>
                                <Button onClick={() => setIsCreateUserOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Primeiro Usuário
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* System Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações do Sistema</CardTitle>
                            <CardDescription>Configurações gerais da aplicação</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Backup Automático</Label>
                                            <p className="text-sm text-gray-600">Realizar backup diário automaticamente</p>
                                        </div>
                                        <Switch />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Notificações por Email</Label>
                                            <p className="text-sm text-gray-600">Enviar notificações por email</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Modo Manutenção</Label>
                                            <p className="text-sm text-gray-600">Ativar modo de manutenção</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Timeout de Sessão (minutos)</Label>
                                        <Input type="number" defaultValue={30} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Limite de Upload (MB)</Label>
                                        <Input type="number" defaultValue={50} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label>Fuso Horário</Label>
                                        <Select defaultValue="america-sao_paulo">
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="america-sao_paulo">America/Sao_Paulo</SelectItem>
                                                <SelectItem value="utc">UTC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="backup" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Backup & Exportação</h2>
                            <p className="text-gray-600">Gestão de backups e exportação de dados</p>
                        </div>
                        <Dialog open={isCreateBackupOpen} onOpenChange={setIsCreateBackupOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Download className="h-4 w-4 mr-2" />
                                    Novo Backup
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Criar Novo Backup</DialogTitle>
                                    <DialogDescription>
                                        Configure e execute um novo backup do sistema
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="backup-type">Tipo de Backup</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full">Backup Completo</SelectItem>
                                                <SelectItem value="partial">Backup Parcial</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="backup-description">Descrição</Label>
                                        <Textarea id="backup-description" placeholder="Descrição do backup..." />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsCreateBackupOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleCreateBackup}>
                                        Criar Backup
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Backups Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {backups.map((backup) => (
                            <Card key={backup.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Database className="h-5 w-5 text-blue-600" />
                                            <CardTitle className="text-lg">{backup.name}</CardTitle>
                                        </div>
                                        <Badge className={getStatusColor(backup.status)}>
                                            {backup.status === 'completed' ? 'Concluído' :
                                                backup.status === 'in_progress' ? 'Em Progresso' : 'Falhou'}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-sm">
                                        {backup.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Tipo:</span>
                                            <span>{backup.type === 'full' ? 'Completo' : 'Parcial'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Tamanho:</span>
                                            <span>{backup.size}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Criado:</span>
                                            <span>{backup.createdAt.toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => handleDownloadBackup(backup)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleDeleteBackup(backup)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {backups.length === 0 && (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum backup encontrado</h3>
                                <p className="text-gray-600 mb-4">
                                    Crie seu primeiro backup para proteger os dados do sistema
                                </p>
                                <Button onClick={() => setIsCreateBackupOpen(true)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Criar Primeiro Backup
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Backup Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Backups</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{backups.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Backups realizados
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {backups.length > 0 ? backups[backups.length - 1].createdAt.toLocaleDateString() : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Data do último backup
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Espaço Utilizado</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {backups.reduce((total, b) => {
                                        const size = parseInt(b.size.replace('MB', ''));
                                        return total + size;
                                    }, 0)}MB
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total de espaço em disco
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* User Detail Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedUser?.name}</DialogTitle>
                        <DialogDescription>Detalhes do usuário</DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email</Label>
                                    <p className="text-sm">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <Label>Função</Label>
                                    <p className="text-sm">{getRoleName(selectedUser.role)}</p>
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Badge className={getStatusColor(selectedUser.status)}>
                                        {selectedUser.status === 'active' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </div>
                                <div>
                                    <Label>Último Login</Label>
                                    <p className="text-sm">{selectedUser.lastLogin.toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div>
                                <Label>Permissões</Label>
                                <div className="mt-2 space-y-1">
                                    {selectedUser.permissions.map((permission, index) => (
                                        <Badge key={index} variant="outline" className="mr-1">
                                            {permission}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 