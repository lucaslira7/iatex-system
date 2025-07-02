import { useState, useEffect } from "react";
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
  User,
  Scissors,
  ShoppingCart,
  PlayCircle,
  QrCode,
  BarChart3,
  Timer,
  CheckSquare,
  Eye,
  Send,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Interfaces para os dados
interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'doing' | 'done';
  type: 'task' | 'goal' | 'production' | 'delivery' | 'supply';
  assignedTo: string;
  assignedBy: string;
  dueDate: Date;
  tags: string[];
  attachments: TaskAttachment[];
  progress: number;
  location?: string;
  notes: string[];
  createdAt: Date;
  estimatedHours?: number;
  actualHours?: number;
  model?: string;
  quantity?: number;
  fabricWeight?: number;
}

interface TaskAttachment {
  id: string;
  filename: string;
  url: string;
  type: 'photo' | 'document' | 'proof';
  uploadedAt: Date;
  uploadedBy: string;
}

interface ProductionOrder {
  id: string;
  modelCode: string;
  modelName: string;
  fabricUsed: string;
  totalWeight: number;
  estimatedPieces: number;
  actualPieces?: number;
  sizes: {
    size: string;
    quantity: number;
    color: string;
  }[];
  factoryAssigned: string;
  status: 'cutting' | 'sent-to-factory' | 'in-production' | 'quality-check' | 'ready-pickup' | 'completed';
  sentDate?: Date;
  expectedReturn: Date;
  actualReturn?: Date;
  qrCode?: string;
}

interface SupplyRequest {
  id: string;
  items: {
    name: string;
    brand?: string;
    reference?: string;
    quantity: number;
    unit: string;
  }[];
  requestedBy: string;
  factoryName: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'purchasing' | 'in-transit' | 'delivered';
  requestDate: Date;
  expectedDelivery?: Date;
  notes: string;
  attachments: TaskAttachment[];
}

interface DailyGoal {
  id: string;
  employeeId: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  type: 'pressing' | 'cutting' | 'packing' | 'delivery' | 'quality-check';
  date: Date;
  completed: boolean;
}

export default function OperationalPanelFixed() {
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    type: 'task' as const,
    assignedTo: '',
    dueDate: new Date().toISOString().split('T')[0],
    tags: [] as string[],
    estimatedHours: 0
  });
  const [kanbanColumns, setKanbanColumns] = useState({
    todo: [] as KanbanTask[],
    doing: [] as KanbanTask[],
    done: [] as KanbanTask[]
  });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [viewMode, setViewMode] = useState<'employee' | 'manager' | 'factory'>('employee');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data and determine role
  const { data: user = {} } = useQuery<any>({
    queryKey: ['/api/auth/user']
  });

  // Fetch kanban tasks
  const { data: tasks = [], isLoading: loadingTasks } = useQuery<any[]>({
    queryKey: ['/api/operational/tasks'],
    refetchInterval: 30000
  });

  // Fetch production orders
  const { data: productionOrders = [], isLoading: loadingProduction } = useQuery<any[]>({
    queryKey: ['/api/operational/production'],
    refetchInterval: 30000
  });

  // Fetch supply requests
  const { data: supplyRequests = [], isLoading: loadingSupplies } = useQuery<any[]>({
    queryKey: ['/api/operational/supplies'],
    refetchInterval: 30000
  });

  // Fetch daily goals
  const { data: dailyGoals = [], isLoading: loadingGoals } = useQuery<any[]>({
    queryKey: ['/api/operational/goals'],
    refetchInterval: 30000
  });

  useEffect(() => {
    if (tasks.length > 0) {
      const newColumns = {
        todo: tasks.filter((task: KanbanTask) => task.status === 'todo'),
        doing: tasks.filter((task: KanbanTask) => task.status === 'doing'),
        done: tasks.filter((task: KanbanTask) => task.status === 'done')
      };
      setKanbanColumns(newColumns);
    }
  }, [tasks]);

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest('POST', '/api/operational/tasks', taskData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operational/tasks'] });
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        type: 'task',
        assignedTo: '',
        dueDate: new Date().toISOString().split('T')[0],
        tags: [],
        estimatedHours: 0
      });
      toast({
        title: "Tarefa Criada",
        description: "Nova tarefa adicionada ao painel operacional.",
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const response = await apiRequest('PATCH', `/api/operational/tasks/${taskId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operational/tasks'] });
      toast({
        title: "Tarefa Atualizada",
        description: "Status da tarefa atualizado com sucesso.",
      });
    }
  });

  // Move task between columns (sem drag & drop)
  const moveTask = (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    updateTaskMutation.mutate({
      taskId,
      updates: { status: newStatus }
    });
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

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'production': return <Factory className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      case 'supply': return <Package className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      default: return <CheckSquare className="h-4 w-4" />;
    }
  };

  const isManager = user?.role === 'manager' || user?.role === 'admin';
  const isFactory = user?.role === 'factory' || user?.role === 'faccao';

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Operacional</h1>
            <p className="text-gray-600">Gestão visual de tarefas e produção</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Funcionário</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="factory">Facção</SelectItem>
            </SelectContent>
          </Select>
          
          {isManager && (
            <Button onClick={() => setShowTaskModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="kanban" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kanban">Quadro Kanban</TabsTrigger>
          <TabsTrigger value="production">Produção</TabsTrigger>
          <TabsTrigger value="goals">Metas Diárias</TabsTrigger>
          <TabsTrigger value="supplies">Insumos</TabsTrigger>
        </TabsList>

        {/* Kanban Board - SEM DRAG & DROP */}
        <TabsContent value="kanban" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* A Fazer */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-600">A Fazer</h3>
                <Badge variant="secondary" className="ml-auto">
                  {kanbanColumns.todo.length}
                </Badge>
              </div>
              
              <div className="space-y-3 min-h-[400px] p-2 bg-gray-50 rounded-lg">
                {kanbanColumns.todo.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTaskTypeIcon(task.type)}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(task.priority)} text-white`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveTask(task.id, 'doing');
                          }}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <h4 className="font-medium mb-1 text-sm">
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        {task.attachments?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{task.attachments.length}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Em Andamento */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-blue-600">Em Andamento</h3>
                <Badge variant="secondary" className="ml-auto">
                  {kanbanColumns.doing.length}
                </Badge>
              </div>
              
              <div className="space-y-3 min-h-[400px] p-2 bg-blue-50 rounded-lg">
                {kanbanColumns.doing.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <Badge variant="outline" className="text-xs">
                            Em progresso
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveTask(task.id, 'todo');
                            }}
                          >
                            ←
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveTask(task.id, 'done');
                            }}
                          >
                            →
                          </Button>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-1 text-sm">
                        {task.title}
                      </h4>
                      
                      {task.progress > 0 && (
                        <div className="mb-2">
                          <Progress value={task.progress} className="h-2" />
                          <span className="text-xs text-gray-500">{task.progress}%</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Concluído */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 className="font-semibold text-green-600">Concluído</h3>
                <Badge variant="secondary" className="ml-auto">
                  {kanbanColumns.done.length}
                </Badge>
              </div>
              
              <div className="space-y-3 min-h-[400px] p-2 bg-green-50 rounded-lg">
                {kanbanColumns.done.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500 opacity-75"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Badge variant="outline" className="text-xs">
                            Concluída
                          </Badge>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-1 text-sm line-through">
                        {task.title}
                      </h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Outras abas permanecem iguais */}
        <TabsContent value="production">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ordens de Produção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productionOrders?.slice(0, 5).map((order: ProductionOrder) => (
                    <div key={order.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{order.modelCode}</span>
                        <Badge variant="outline" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{order.modelName}</p>
                      <div className="text-xs text-gray-500">
                        <span>Peças: {order.estimatedPieces}</span>
                        <span className="mx-2">•</span>
                        <span>Tecido: {order.totalWeight}kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dailyGoals?.slice(0, 8).map((goal: DailyGoal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <Badge variant={goal.completed ? "default" : "secondary"} className="text-xs">
                      {goal.completed ? "Concluída" : "Em progresso"}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-2">{goal.title}</h4>
                  <div className="space-y-2">
                    <Progress value={(goal.current / goal.target) * 100} />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{goal.current} / {goal.target} {goal.unit}</span>
                      <span>{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supplies">
          <div className="space-y-6">
            {supplyRequests?.map((request: SupplyRequest) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium mb-1">Solicitação - {request.factoryName}</h4>
                      <p className="text-sm text-gray-600">Solicitado por: {request.requestedBy}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {request.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Itens solicitados:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {request.items?.slice(0, 3).map((item, i) => (
                          <li key={i}>• {item.quantity} {item.unit} - {item.name}</li>
                        ))}
                        {request.items?.length > 3 && (
                          <li className="text-blue-500">+{request.items.length - 3} mais itens</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">Urgência: 
                        <Badge variant="outline" className="ml-2 text-xs">
                          {request.urgency}
                        </Badge>
                      </p>
                      <p className="text-xs text-gray-600">
                        Data: {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Resumo de Métricas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {dailyGoals?.filter((g: DailyGoal) => g.completed).length || 0}
            </div>
            <p className="text-sm text-gray-600">Metas Concluídas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {productionOrders?.filter((p: ProductionOrder) => 
                p.status === 'in-production' || p.status === 'quality-check'
              ).length || 0}
            </div>
            <p className="text-sm text-gray-600">Em Produção</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {supplyRequests?.filter((r: SupplyRequest) => r.status === 'pending').length || 0}
            </div>
            <p className="text-sm text-gray-600">Insumos Pendentes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {kanbanColumns.doing.length}
            </div>
            <p className="text-sm text-gray-600">Tarefas Ativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Nova Tarefa */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              Criar uma nova tarefa no painel operacional
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título da Tarefa</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Cortar tecido modelo A1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalhes da tarefa..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="type">Tipo</Label>
                <Select value={newTask.type} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Tarefa</SelectItem>
                    <SelectItem value="production">Produção</SelectItem>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="supply">Insumo</SelectItem>
                    <SelectItem value="goal">Meta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => createTaskMutation.mutate(newTask)}
              disabled={!newTask.title.trim() || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Criando...' : 'Criar Tarefa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Tarefa */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTask && getTaskTypeIcon(selectedTask.type)}
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription>
              Detalhes e status da tarefa
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className={`${getPriorityColor(selectedTask.priority)} text-white`}>
                  {selectedTask.priority}
                </Badge>
                <Badge variant="outline">
                  {selectedTask.status}
                </Badge>
                <Badge variant="outline">
                  {selectedTask.type}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600">
                {selectedTask.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Responsável:</strong> {selectedTask.assignedTo}
                </div>
                <div>
                  <strong>Vencimento:</strong> {new Date(selectedTask.dueDate).toLocaleDateString()}
                </div>
                {selectedTask.estimatedHours && (
                  <div>
                    <strong>Horas estimadas:</strong> {selectedTask.estimatedHours}h
                  </div>
                )}
                {selectedTask.location && (
                  <div>
                    <strong>Local:</strong> {selectedTask.location}
                  </div>
                )}
              </div>
              
              {selectedTask.progress > 0 && (
                <div>
                  <Label>Progresso: {selectedTask.progress}%</Label>
                  <Progress value={selectedTask.progress} className="mt-2" />
                </div>
              )}
              
              {selectedTask.tags.length > 0 && (
                <div>
                  <Label>Tags:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedTask.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Fechar
            </Button>
            {selectedTask && isManager && (
              <div className="flex gap-2">
                {selectedTask.status !== 'done' && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      moveTask(selectedTask.id, 'done');
                      setSelectedTask(null);
                    }}
                  >
                    Marcar como Concluída
                  </Button>
                )}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}