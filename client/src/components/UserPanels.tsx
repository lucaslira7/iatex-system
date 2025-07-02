import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Users, 
  Factory, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  MessageSquare,
  Package,
  Truck,
  FileText,
  Plus,
  Edit,
  Trash2,
  Bell,
  Calendar,
  Target,
  TrendingUp,
  User
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  assignedBy: string;
  dueDate: Date;
  category: 'production' | 'supply' | 'delivery' | 'maintenance' | 'other';
  attachments: TaskAttachment[];
  progress: number;
  location?: string;
  notes: string[];
  createdAt: Date;
}

interface TaskAttachment {
  id: string;
  filename: string;
  url: string;
  type: 'photo' | 'document' | 'proof';
  uploadedAt: Date;
  uploadedBy: string;
}

interface ProductionBatch {
  id: string;
  modelName: string;
  factoryName: string;
  quantity: number;
  status: 'not-started' | 'in-progress' | 'quality-check' | 'ready-pickup' | 'completed';
  startDate: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  progress: number;
  notes: string[];
  attachments: TaskAttachment[];
  qualityScore?: number;
  lossPercentage?: number;
}

interface SupplyRequest {
  id: string;
  items: string[];
  requestedBy: string;
  factoryName: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'in-transit' | 'delivered';
  requestDate: Date;
  expectedDelivery?: Date;
  notes: string;
}

export default function UserPanels() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data and determine role
  const { data: user = {} } = useQuery<any>({
    queryKey: ['/api/auth/user']
  });

  // Fetch tasks based on user role
  const { data: tasks = [], isLoading: loadingTasks } = useQuery<any[]>({
    queryKey: ['/api/user-panels/tasks'],
    refetchInterval: 30000
  });

  // Fetch production batches for factories
  const { data: productionBatches = [], isLoading: loadingBatches } = useQuery<any[]>({
    queryKey: ['/api/user-panels/production'],
    refetchInterval: 30000
  });

  // Fetch supply requests
  const { data: supplyRequests = [], isLoading: loadingSupplies } = useQuery<any[]>({
    queryKey: ['/api/user-panels/supplies'],
    refetchInterval: 30000
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const response = await apiRequest('POST', '/api/user-panels/tasks', taskData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-panels/tasks'] });
      setNewTaskOpen(false);
      toast({
        title: "Tarefa Criada",
        description: "Nova tarefa foi criada com sucesso.",
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const response = await apiRequest('PATCH', `/api/user-panels/tasks/${taskId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-panels/tasks'] });
      toast({
        title: "Tarefa Atualizada",
        description: "Status da tarefa foi atualizado.",
      });
    }
  });

  const updateProductionMutation = useMutation({
    mutationFn: async ({ batchId, updates }: { batchId: string; updates: Partial<ProductionBatch> }) => {
      const response = await apiRequest('PATCH', `/api/user-panels/production/${batchId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-panels/production'] });
      toast({
        title: "Produção Atualizada",
        description: "Status da produção foi atualizado.",
      });
    }
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async ({ file, taskId, type }: { file: File; taskId: string; type: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);
      formData.append('type', type);
      
      const response = await apiRequest('POST', '/api/user-panels/upload', formData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-panels/tasks'] });
      toast({
        title: "Arquivo Enviado",
        description: "Anexo foi adicionado com sucesso.",
      });
    }
  });

  const handleFileUpload = (taskId: string, type: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files[0]) {
          setUploadingFile(true);
          uploadAttachmentMutation.mutate(
            { file: files[0], taskId, type },
            {
              onSettled: () => setUploadingFile(false)
            }
          );
        }
      };
      fileInputRef.current.click();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-500';
      case 'ready-pickup': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const isFactory = user?.role === 'factory' || user?.role === 'faccao';
  const isEmployee = user?.role === 'employee' || user?.role === 'funcionario';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
          {isFactory ? <Factory className="h-6 w-6 text-white" /> : <Users className="h-6 w-6 text-white" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {isFactory ? 'Painel da Facção' : 'Painel do Funcionário'}
          </h1>
          <p className="text-gray-600">
            {isFactory ? 'Gerencie sua produção e entregas' : 'Suas tarefas e atividades'}
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="text-sm">
            Logado como: {user?.name || 'Usuário'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue={isFactory ? "production" : "tasks"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tarefas
          </TabsTrigger>
          {isFactory && (
            <TabsTrigger value="production" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Produção
            </TabsTrigger>
          )}
          <TabsTrigger value="supplies" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Insumos
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks List */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Minhas Tarefas</h2>
                <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Criar Nova Tarefa</DialogTitle>
                      <DialogDescription>
                        Delegue uma nova tarefa para um funcionário ou facção.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="task-title">Título</Label>
                        <Input id="task-title" placeholder="Título da tarefa" />
                      </div>
                      <div>
                        <Label htmlFor="task-description">Descrição</Label>
                        <Textarea id="task-description" placeholder="Detalhe o que precisa ser feito" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="task-priority">Prioridade</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="task-category">Categoria</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="production">Produção</SelectItem>
                              <SelectItem value="supply">Suprimentos</SelectItem>
                              <SelectItem value="delivery">Entrega</SelectItem>
                              <SelectItem value="maintenance">Manutenção</SelectItem>
                              <SelectItem value="other">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setNewTaskOpen(false)} variant="outline">
                        Cancelar
                      </Button>
                      <Button onClick={() => createTaskMutation.mutate({})}>
                        Criar Tarefa
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {loadingTasks ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : tasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Nenhuma tarefa disponível</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Suas tarefas aparecerão aqui quando forem atribuídas.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  tasks.map((task: Task) => (
                    <Card 
                      key={task.id} 
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedTask?.id === task.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`text-xs text-white ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          </div>
                          <Badge 
                            className={`text-xs text-white ${getStatusColor(task.status)}`}
                          >
                            {task.status}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progresso: {task.progress}%</span>
                            <span>Prazo: {task.dueDate.toLocaleDateString()}</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span>Por: {task.assignedBy}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {task.attachments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FileText className="h-3 w-3" />
                                <span>{task.attachments.length}</span>
                              </div>
                            )}
                            {task.location && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3" />
                                <span>{task.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Task Details Sidebar */}
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalhes da Tarefa
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTask ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{selectedTask.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{selectedTask.description}</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select 
                        value={selectedTask.status}
                        onValueChange={(value: any) => 
                          updateTaskMutation.mutate({
                            taskId: selectedTask.id,
                            updates: { status: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in-progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Progresso (%)</Label>
                      <Input 
                        type="number" 
                        value={selectedTask.progress} 
                        onChange={(e) => 
                          updateTaskMutation.mutate({
                            taskId: selectedTask.id,
                            updates: { progress: parseInt(e.target.value) }
                          })
                        }
                        min="0" 
                        max="100" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Anexos</Label>
                      <div className="space-y-2">
                        {selectedTask.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm flex-1">{attachment.filename}</span>
                            <Button size="sm" variant="outline">
                              Ver
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleFileUpload(selectedTask.id, 'photo')}
                            disabled={uploadingFile}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Foto
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleFileUpload(selectedTask.id, 'document')}
                            disabled={uploadingFile}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Arquivo
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notas</Label>
                      <Textarea 
                        placeholder="Adicione observações sobre o progresso..."
                        className="min-h-[100px]"
                      />
                      <Button size="sm" className="w-full">
                        Adicionar Nota
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Selecione uma tarefa para ver os detalhes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Production Tab (Factory Only) */}
        {isFactory && (
          <TabsContent value="production">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold">Lotes em Produção</h2>
                
                {loadingBatches ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : productionBatches.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Nenhum lote em produção</p>
                    </CardContent>
                  </Card>
                ) : (
                  productionBatches.map((batch: ProductionBatch) => (
                    <Card 
                      key={batch.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedBatch?.id === batch.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedBatch(batch)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{batch.modelName}</h3>
                            <p className="text-sm text-gray-600">Quantidade: {batch.quantity} peças</p>
                          </div>
                          <Badge className={`text-white ${getStatusColor(batch.status)}`}>
                            {batch.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progresso: {batch.progress}%</span>
                            <span>Entrega: {batch.estimatedDelivery.toLocaleDateString()}</span>
                          </div>
                          <Progress value={batch.progress} className="h-2" />
                        </div>
                        
                        {batch.qualityScore && (
                          <div className="mt-2 flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3 text-green-500" />
                              <span>Qualidade: {batch.qualityScore}%</span>
                            </div>
                            {batch.lossPercentage !== undefined && (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                                <span>Perda: {batch.lossPercentage}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Production Details Sidebar */}
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5" />
                    Detalhes da Produção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedBatch ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">{selectedBatch.modelName}</h3>
                        <div className="text-sm space-y-1">
                          <p><strong>Quantidade:</strong> {selectedBatch.quantity} peças</p>
                          <p><strong>Início:</strong> {selectedBatch.startDate.toLocaleDateString()}</p>
                          <p><strong>Previsão:</strong> {selectedBatch.estimatedDelivery.toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Status da Produção</Label>
                        <Select 
                          value={selectedBatch.status}
                          onValueChange={(value: any) => 
                            updateProductionMutation.mutate({
                              batchId: selectedBatch.id,
                              updates: { status: value }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-started">Não Iniciado</SelectItem>
                            <SelectItem value="in-progress">Em Produção</SelectItem>
                            <SelectItem value="quality-check">Controle Qualidade</SelectItem>
                            <SelectItem value="ready-pickup">Pronto para Buscar</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Progresso (%)</Label>
                          <Input 
                            type="number" 
                            value={selectedBatch.progress}
                            min="0" 
                            max="100" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Perda (%)</Label>
                          <Input 
                            type="number" 
                            value={selectedBatch.lossPercentage || 0}
                            min="0" 
                            max="100" 
                          />
                        </div>
                      </div>

                      <Button className="w-full">
                        <Truck className="h-4 w-4 mr-2" />
                        Solicitar Retirada
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Selecione um lote para ver os detalhes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Supplies Tab */}
        <TabsContent value="supplies">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Solicitações de Insumos</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Solicitação
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplyRequests.map((request: SupplyRequest) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={`${
                        request.urgency === 'high' ? 'bg-red-500' :
                        request.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      } text-white`}>
                        {request.urgency}
                      </Badge>
                      <Badge variant="outline">
                        {request.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-semibold">{request.factoryName}</p>
                      <div className="text-sm">
                        <p><strong>Itens:</strong></p>
                        <ul className="list-disc list-inside ml-2">
                          {request.items.slice(0, 3).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                          {request.items.length > 3 && (
                            <li className="text-gray-500">+{request.items.length - 3} mais...</li>
                          )}
                        </ul>
                      </div>
                      <p className="text-xs text-gray-500">
                        Solicitado em: {request.requestDate.toLocaleDateString()}
                      </p>
                      {request.notes && (
                        <p className="text-xs text-gray-600 italic">"{request.notes}"</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Central de Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-800">Entrega Urgente</p>
                    <p className="text-sm text-orange-700">Buscar 50 camisas na Facção Maria até 17h</p>
                    <p className="text-xs text-orange-600 mt-1">Há 30 minutos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">Produção Concluída</p>
                    <p className="text-sm text-green-700">Lote de vestidos está pronto para retirada</p>
                    <p className="text-xs text-green-600 mt-1">Há 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800">Insumos Solicitados</p>
                    <p className="text-sm text-blue-700">Facção João solicitou linha preta e botões</p>
                    <p className="text-xs text-blue-600 mt-1">Há 4 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />
    </div>
  );
}