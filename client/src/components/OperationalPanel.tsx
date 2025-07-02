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
  User,
  Scissors,
  ShoppingCart,
  PlayCircle,
  QrCode,
  BarChart3,
  Timer,
  CheckSquare,
  Eye,
  Send
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function OperationalPanel() {
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newProductionOpen, setNewProductionOpen] = useState(false);
  const [kanbanColumns, setKanbanColumns] = useState({
    todo: [] as KanbanTask[],
    doing: [] as KanbanTask[],
    done: [] as KanbanTask[]
  });
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
    mutationFn: async (taskData: Partial<KanbanTask>) => {
      const response = await apiRequest('POST', '/api/operational/tasks', taskData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operational/tasks'] });
      setNewTaskOpen(false);
      toast({
        title: "Tarefa Criada",
        description: "Nova tarefa foi criada com sucesso.",
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<KanbanTask> }) => {
      const response = await apiRequest('PATCH', `/api/operational/tasks/${taskId}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operational/tasks'] });
      toast({
        title: "Tarefa Atualizada",
        description: "Status da tarefa foi atualizado.",
      });
    }
  });

  const createProductionMutation = useMutation({
    mutationFn: async (productionData: Partial<ProductionOrder>) => {
      const response = await apiRequest('POST', '/api/operational/production', productionData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operational/production'] });
      setNewProductionOpen(false);
      toast({
        title: "Produção Criada",
        description: "Nova ordem de produção foi criada e enviada para a facção.",
      });
    }
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as 'todo' | 'doing' | 'done';
    const task = tasks.find((t: KanbanTask) => t.id === draggableId);
    
    if (task) {
      updateTaskMutation.mutate({
        taskId: task.id,
        updates: { status: newStatus }
      });
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
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Painel Operacional</h1>
            <p className="text-gray-600">Gestão visual de tarefas, metas e produção</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Visão Funcionário</SelectItem>
              {isManager && <SelectItem value="manager">Visão Gerencial</SelectItem>}
              {isFactory && <SelectItem value="factory">Visão Facção</SelectItem>}
            </SelectContent>
          </Select>
          
          <Badge variant="outline" className="text-sm">
            {user?.name || 'Usuário'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Quadro Kanban
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Factory className="h-4 w-4" />
            {isFactory ? 'Minha Produção' : 'Ordens de Produção'}
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas Diárias
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Requisições
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Kanban Board */}
        <TabsContent value="kanban">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quadro de Tarefas</h2>
            <div className="flex gap-2">
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
                      Adicione uma nova tarefa ao quadro Kanban.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-title">Título</Label>
                      <Input id="task-title" placeholder="Ex: Prensar 200 camisas" />
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
                        <Label htmlFor="task-type">Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="task">Tarefa</SelectItem>
                            <SelectItem value="goal">Meta</SelectItem>
                            <SelectItem value="production">Produção</SelectItem>
                            <SelectItem value="delivery">Entrega</SelectItem>
                            <SelectItem value="supply">Suprimento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="task-tags">Tags (separadas por vírgula)</Label>
                      <Input id="task-tags" placeholder="produção, urgente, corte" />
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
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-6">
              {/* To Do Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <h3 className="font-semibold text-gray-600">A Fazer</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {kanbanColumns.todo.length}
                  </Badge>
                </div>
                
                <Droppable droppableId="todo">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3 min-h-[400px] p-2 bg-gray-50 rounded-lg"
                    >
                      {kanbanColumns.todo.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => setSelectedTask(task)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {getTaskTypeIcon(task.type)}
                                    <Badge 
                                      className={`text-xs text-white ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {task.type}
                                  </Badge>
                                </div>
                                
                                <h4 className="font-medium mb-1 text-sm">{task.title}</h4>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                                
                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {task.tags.slice(0, 2).map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{task.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{task.dueDate.toLocaleDateString()}</span>
                                  </div>
                                  {task.attachments.length > 0 && (
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      <span>{task.attachments.length}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Doing Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-blue-600">Em Andamento</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {kanbanColumns.doing.length}
                  </Badge>
                </div>
                
                <Droppable droppableId="doing">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3 min-h-[400px] p-2 bg-blue-50 rounded-lg"
                    >
                      {kanbanColumns.doing.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                              onClick={() => setSelectedTask(task)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {getTaskTypeIcon(task.type)}
                                    <Badge 
                                      className={`text-xs text-white ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {task.type}
                                  </Badge>
                                </div>
                                
                                <h4 className="font-medium mb-1 text-sm">{task.title}</h4>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                                
                                <div className="space-y-2 mb-3">
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Progresso: {task.progress}%</span>
                                    {task.estimatedHours && (
                                      <span>{task.actualHours || 0}h/{task.estimatedHours}h</span>
                                    )}
                                  </div>
                                  <Progress value={task.progress} className="h-2" />
                                </div>
                                
                                {task.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {task.tags.slice(0, 2).map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{task.dueDate.toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Timer className="h-3 w-3" />
                                    <span>Ativa</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Done Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-green-600">Concluído</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {kanbanColumns.done.length}
                  </Badge>
                </div>
                
                <Droppable droppableId="done">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3 min-h-[400px] p-2 bg-green-50 rounded-lg"
                    >
                      {kanbanColumns.done.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
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
                                  <Badge variant="outline" className="text-xs">
                                    {task.type}
                                  </Badge>
                                </div>
                                
                                <h4 className="font-medium mb-1 text-sm line-through">
                                  {task.title}
                                </h4>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                  {task.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>100%</span>
                                  </div>
                                  {task.actualHours && (
                                    <div className="flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      <span>{task.actualHours}h</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        </TabsContent>

        {/* Production Orders Tab */}
        <TabsContent value="production">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {isFactory ? 'Minha Produção' : 'Ordens de Produção'}
              </h2>
              {!isFactory && (
                <Dialog open={newProductionOpen} onOpenChange={setNewProductionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Produção
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Criar Ordem de Produção</DialogTitle>
                      <DialogDescription>
                        Gere uma nova ordem baseada no tecido cortado.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Modelo</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="C001">C001 - Camisa Social</SelectItem>
                              <SelectItem value="V001">V001 - Vestido Casual</SelectItem>
                              <SelectItem value="CJ001">CJ001 - Conjunto Verão</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Facção</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maria">Facção Maria</SelectItem>
                              <SelectItem value="joao">Facção João</SelectItem>
                              <SelectItem value="silva">Facção Silva</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Peso do Tecido (kg)</Label>
                          <Input type="number" placeholder="36" />
                        </div>
                        <div>
                          <Label>Peças Estimadas</Label>
                          <Input type="number" placeholder="132" readOnly />
                        </div>
                      </div>

                      <div>
                        <Label>Grade de Tamanhos</Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <Label className="text-xs">P</Label>
                            <Input type="number" placeholder="30" />
                          </div>
                          <div>
                            <Label className="text-xs">M</Label>
                            <Input type="number" placeholder="50" />
                          </div>
                          <div>
                            <Label className="text-xs">G</Label>
                            <Input type="number" placeholder="52" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Observações</Label>
                        <Textarea placeholder="Instruções especiais para a facção..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setNewProductionOpen(false)} variant="outline">
                        Cancelar
                      </Button>
                      <Button onClick={() => createProductionMutation.mutate({})}>
                        Criar e Enviar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingProduction ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : productionOrders.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Factory className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Nenhuma ordem de produção encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                productionOrders.map((order: ProductionOrder) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-sm">{order.modelCode}</h3>
                          <p className="text-xs text-gray-600">{order.modelName}</p>
                        </div>
                        <Badge 
                          className={`text-xs ${
                            order.status === 'completed' ? 'bg-green-500' :
                            order.status === 'in-production' ? 'bg-blue-500' :
                            order.status === 'ready-pickup' ? 'bg-purple-500' :
                            'bg-gray-500'
                          } text-white`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Facção:</span>
                          <span className="font-medium">{order.factoryAssigned}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Estimativa:</span>
                          <span className="font-medium">{order.estimatedPieces} peças</span>
                        </div>
                        {order.actualPieces && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Produzido:</span>
                            <span className="font-medium text-green-600">{order.actualPieces} peças</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Entrega:</span>
                          <span className="font-medium">{order.expectedReturn.toLocaleDateString()}</span>
                        </div>
                      </div>

                      {order.sizes.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-2">Grade de Tamanhos:</p>
                          <div className="flex flex-wrap gap-1">
                            {order.sizes.slice(0, 3).map((size, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {size.size}: {size.quantity}
                              </Badge>
                            ))}
                            {order.sizes.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{order.sizes.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {isFactory && order.status === 'in-production' && (
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Camera className="h-3 w-3 mr-1" />
                            Foto
                          </Button>
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Finalizar
                          </Button>
                        </div>
                      )}

                      {!isFactory && order.status === 'ready-pickup' && (
                        <div className="mt-4">
                          <Button size="sm" className="w-full">
                            <Truck className="h-3 w-3 mr-1" />
                            Agendar Coleta
                          </Button>
                        </div>
                      )}

                      {order.qrCode && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">QR Code: {order.qrCode}</span>
                          <Button size="sm" variant="ghost" className="ml-auto p-1">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Daily Goals Tab */}
        <TabsContent value="goals">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Metas Diárias</h2>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingGoals ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : dailyGoals.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Nenhuma meta definida para hoje</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Definir Metas
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                dailyGoals.map((goal: DailyGoal) => (
                  <Card key={goal.id} className={`${goal.completed ? 'border-green-500 bg-green-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className={`h-4 w-4 ${goal.completed ? 'text-green-500' : 'text-gray-400'}`} />
                          <h3 className="font-medium text-sm">{goal.title}</h3>
                        </div>
                        {goal.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {goal.current}
                            <span className="text-sm text-gray-500">/{goal.target}</span>
                          </div>
                          <div className="text-xs text-gray-500">{goal.unit}</div>
                        </div>
                        
                        <Progress 
                          value={(goal.current / goal.target) * 100} 
                          className="h-3"
                        />
                        
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{Math.round((goal.current / goal.target) * 100)}% concluído</span>
                          <Badge variant="outline" className="text-xs">
                            {goal.type}
                          </Badge>
                        </div>
                      </div>
                      
                      {!goal.completed && (
                        <div className="mt-4 flex gap-2">
                          <Input 
                            type="number" 
                            placeholder="Atualizar..." 
                            className="text-sm"
                          />
                          <Button size="sm">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Supply Requests Tab */}
        <TabsContent value="supplies">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Requisições de Insumos</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Requisição
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplyRequests.map((request: SupplyRequest) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-sm">{request.factoryName}</h3>
                        <p className="text-xs text-gray-500">{request.requestDate.toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={`text-xs ${
                          request.urgency === 'high' ? 'bg-red-500' :
                          request.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        } text-white`}>
                          {request.urgency}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Itens solicitados:</p>
                      <ul className="text-xs space-y-1">
                        {request.items.slice(0, 3).map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>{item.name}</span>
                            <span className="text-gray-500">{item.quantity} {item.unit}</span>
                          </li>
                        ))}
                        {request.items.length > 3 && (
                          <li className="text-gray-500">+{request.items.length - 3} itens...</li>
                        )}
                      </ul>
                    </div>

                    {request.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600 italic">"{request.notes}"</p>
                      </div>
                    )}

                    {request.status === 'pending' && !isFactory && (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Negar
                        </Button>
                        <Button size="sm" className="flex-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    )}

                    {request.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FileText className="h-3 w-3" />
                          <span>{request.attachments.length} anexo(s)</span>
                          <Button size="sm" variant="ghost" className="ml-auto p-1">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Analytics Operacional</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Tarefas Ativas</p>
                      <p className="text-2xl font-bold">{kanbanColumns.doing.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">Metas Concluídas</p>
                      <p className="text-2xl font-bold">
                        {dailyGoals.filter((g: DailyGoal) => g.completed).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Factory className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600">Produções Ativas</p>
                      <p className="text-2xl font-bold">
                        {productionOrders.filter((p: ProductionOrder) => 
                          p.status === 'in-production' || p.status === 'sent-to-factory'
                        ).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">Requisições Pendentes</p>
                      <p className="text-2xl font-bold">
                        {supplyRequests.filter((r: SupplyRequest) => r.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Produtividade Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Gráfico de produtividade será implementado aqui</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Details Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTaskTypeIcon(selectedTask.type)}
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription>
                {selectedTask.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Prioridade</Label>
                  <Badge className={`${getPriorityColor(selectedTask.priority)} text-white`}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge variant="outline">{selectedTask.status}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Prazo</Label>
                  <p>{selectedTask.dueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Progresso</Label>
                  <p>{selectedTask.progress}%</p>
                </div>
              </div>

              {selectedTask.tags.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTask.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.attachments.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500">Anexos</Label>
                  <div className="space-y-2 mt-1">
                    {selectedTask.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                        <FileText className="h-4 w-4" />
                        <span className="flex-1">{attachment.filename}</span>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.notes.length > 0 && (
                <div>
                  <Label className="text-xs text-gray-500">Notas</Label>
                  <ScrollArea className="h-24 border rounded p-2 mt-1">
                    {selectedTask.notes.map((note, i) => (
                      <p key={i} className="text-sm mb-2 last:mb-0">{note}</p>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setSelectedTask(null)} variant="outline">
                Fechar
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}