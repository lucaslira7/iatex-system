import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, Search, Award, Calendar as CalendarIcon, Clock, Target, TrendingUp, AlertCircle, CheckCircle2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  startDate: Date;
  hourlyRate: number;
  weeklyHours: number;
  avatar?: string;
  status: 'active' | 'inactive' | 'vacation';
  performance: number;
  totalTasks: number;
  completedTasks: number;
}

interface Task {
  id: number;
  employeeId: number;
  title: string;
  description: string;
  type: 'cutting' | 'sewing' | 'finishing' | 'quality' | 'packing';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  estimatedHours: number;
  actualHours?: number;
  dueDate: Date;
  assignedDate: Date;
  completedDate?: Date;
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "Maria Silva",
    role: "Costureira Senior",
    department: "Produção",
    email: "maria@iatex.com",
    phone: "(11) 99999-0001",
    startDate: new Date("2022-03-15"),
    hourlyRate: 25.00,
    weeklyHours: 40,
    status: "active",
    performance: 92,
    totalTasks: 156,
    completedTasks: 143
  },
  {
    id: 2,
    name: "João Santos",
    role: "Cortador",
    department: "Produção",
    email: "joao@iatex.com",
    phone: "(11) 99999-0002",
    startDate: new Date("2021-08-10"),
    hourlyRate: 22.00,
    weeklyHours: 40,
    status: "active",
    performance: 88,
    totalTasks: 124,
    completedTasks: 109
  },
  {
    id: 3,
    name: "Ana Costa",
    role: "Supervisora de Qualidade",
    department: "Qualidade",
    email: "ana@iatex.com",
    phone: "(11) 99999-0003",
    startDate: new Date("2020-01-20"),
    hourlyRate: 30.00,
    weeklyHours: 40,
    status: "vacation",
    performance: 95,
    totalTasks: 89,
    completedTasks: 85
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    role: "Auxiliar de Produção",
    department: "Produção",
    email: "carlos@iatex.com",
    phone: "(11) 99999-0004",
    startDate: new Date("2023-06-01"),
    hourlyRate: 18.00,
    weeklyHours: 40,
    status: "active",
    performance: 76,
    totalTasks: 67,
    completedTasks: 51
  }
];

const mockTasks: Task[] = [
  {
    id: 1,
    employeeId: 1,
    title: "Costura de 50 blusas M",
    description: "Costurar 50 unidades da blusa ref. BL-001 tamanho M",
    type: "sewing",
    priority: "high",
    status: "in-progress",
    estimatedHours: 8,
    actualHours: 6.5,
    dueDate: new Date("2025-07-03"),
    assignedDate: new Date("2025-07-02")
  },
  {
    id: 2,
    employeeId: 2,
    title: "Corte de tecido para vestidos",
    description: "Cortar tecido para 30 vestidos ref. V-002",
    type: "cutting",
    priority: "medium",
    status: "pending",
    estimatedHours: 4,
    dueDate: new Date("2025-07-04"),
    assignedDate: new Date("2025-07-02")
  },
  {
    id: 3,
    employeeId: 3,
    title: "Inspeção de qualidade - Lote 156",
    description: "Verificar qualidade do lote 156 de camisas",
    type: "quality",
    priority: "high",
    status: "completed",
    estimatedHours: 3,
    actualHours: 2.5,
    dueDate: new Date("2025-07-02"),
    assignedDate: new Date("2025-07-01"),
    completedDate: new Date("2025-07-02")
  }
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeTab, setActiveTab] = useState("employees");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const { toast } = useToast();

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
    const matchesStatus = !filterStatus || emp.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'vacation': return 'Férias';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeText = (type: string) => {
    switch (type) {
      case 'cutting': return 'Corte';
      case 'sewing': return 'Costura';
      case 'finishing': return 'Acabamento';
      case 'quality': return 'Qualidade';
      case 'packing': return 'Embalagem';
      default: return type;
    }
  };

  const handleAddEmployee = () => {
    toast({
      title: "Funcionário Adicionado",
      description: "Novo funcionário foi cadastrado com sucesso.",
    });
    setIsAddEmployeeOpen(false);
  };

  const handleAddTask = () => {
    toast({
      title: "Tarefa Criada",
      description: "Nova tarefa foi atribuída com sucesso.",
    });
    setIsAddTaskOpen(false);
  };

  const getEmployeeTasks = (employeeId: number) => {
    return tasks.filter(task => task.employeeId === employeeId);
  };

  const calculateDepartmentStats = () => {
    const departments = employees.reduce((acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = { total: 0, active: 0, avgPerformance: 0 };
      }
      acc[emp.department].total++;
      if (emp.status === 'active') acc[emp.department].active++;
      acc[emp.department].avgPerformance += emp.performance;
      return acc;
    }, {} as Record<string, { total: number; active: number; avgPerformance: number }>);

    Object.keys(departments).forEach(dept => {
      departments[dept].avgPerformance = Math.round(departments[dept].avgPerformance / departments[dept].total);
    });

    return departments;
  };

  const departmentStats = calculateDepartmentStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Funcionários</h1>
            <p className="text-gray-600">Controle produtividade, tarefas e desempenho da equipe</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Atribuir Nova Tarefa</DialogTitle>
                <DialogDescription>
                  Crie e atribua uma nova tarefa para um funcionário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Funcionário</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar funcionário..." />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.filter(emp => emp.status === 'active').map(emp => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name} - {emp.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Título da Tarefa</Label>
                  <Input placeholder="Ex: Costura de 20 camisas..." />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Tarefa</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cutting">Corte</SelectItem>
                      <SelectItem value="sewing">Costura</SelectItem>
                      <SelectItem value="finishing">Acabamento</SelectItem>
                      <SelectItem value="quality">Qualidade</SelectItem>
                      <SelectItem value="packing">Embalagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridade..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Horas Estimadas</Label>
                    <Input type="number" placeholder="8" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Detalhes da tarefa..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddTask}>
                  Criar Tarefa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Funcionário</DialogTitle>
                <DialogDescription>
                  Adicione um novo membro à equipe
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input placeholder="Ex: Maria Silva Santos" />
                </div>
                <div className="space-y-2">
                  <Label>Função</Label>
                  <Input placeholder="Ex: Costureira Senior" />
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar departamento..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Produção">Produção</SelectItem>
                      <SelectItem value="Qualidade">Qualidade</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@iatex.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor/Hora (R$)</Label>
                    <Input type="number" step="0.01" placeholder="25.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Horas Semanais</Label>
                    <Input type="number" placeholder="40" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddEmployee}>
                  Cadastrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-gray-600">Total de Funcionários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{employees.filter(e => e.status === 'active').length}</p>
                <p className="text-sm text-gray-600">Funcionários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status !== 'completed').length}</p>
                <p className="text-sm text-gray-600">Tarefas Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{Math.round(employees.reduce((acc, emp) => acc + emp.performance, 0) / employees.length)}%</p>
                <p className="text-sm text-gray-600">Performance Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar funcionários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os departamentos</SelectItem>
                    <SelectItem value="Produção">Produção</SelectItem>
                    <SelectItem value="Qualidade">Qualidade</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="vacation">Férias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Employee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={employee.avatar} />
                      <AvatarFallback>
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.role}</p>
                        </div>
                        <Badge className={`${getStatusColor(employee.status)} text-xs`}>
                          {getStatusText(employee.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Performance</span>
                          <span className="font-semibold">{employee.performance}%</span>
                        </div>
                        <Progress value={employee.performance} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tarefas concluídas</span>
                          <span className="font-semibold">{employee.completedTasks}/{employee.totalTasks}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Departamento</span>
                          <span className="font-semibold">{employee.department}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Valor/hora</span>
                          <span className="font-semibold">R$ {employee.hourlyRate.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid gap-4">
            {tasks.map((task) => {
              const employee = employees.find(e => e.id === task.employeeId);
              return (
                <Card key={task.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status === 'completed' ? 'Concluída' : 
                             task.status === 'in-progress' ? 'Em Andamento' : 'Pendente'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>👤 {employee?.name}</span>
                          <span>🏷️ {getTaskTypeText(task.type)}</span>
                          <span>⏱️ {task.estimatedHours}h estimadas</span>
                          {task.actualHours && <span>✅ {task.actualHours}h reais</span>}
                          <span>📅 {format(task.dueDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6">
            {employees.map((employee) => {
              const employeeTasks = getEmployeeTasks(employee.id);
              const completedTasks = employeeTasks.filter(t => t.status === 'completed');
              const avgEfficiency = completedTasks.length > 0 
                ? completedTasks.reduce((acc, task) => {
                    const efficiency = task.actualHours && task.estimatedHours 
                      ? (task.estimatedHours / task.actualHours) * 100 
                      : 100;
                    return acc + efficiency;
                  }, 0) / completedTasks.length
                : 0;

              return (
                <Card key={employee.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{employee.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{employee.role} - {employee.department}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Performance Geral</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={employee.performance} className="flex-1 h-2" />
                              <span className="text-sm font-semibold">{employee.performance}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                            <div className="flex items-center space-x-2">
                              {employee.totalTasks > 0 && (
                                <>
                                  <Progress value={(employee.completedTasks / employee.totalTasks) * 100} className="flex-1 h-2" />
                                  <span className="text-sm font-semibold">
                                    {Math.round((employee.completedTasks / employee.totalTasks) * 100)}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Eficiência Temporal</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={Math.min(avgEfficiency, 100)} className="flex-1 h-2" />
                              <span className="text-sm font-semibold">{Math.round(avgEfficiency)}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Tarefas Ativas</p>
                            <p className="text-lg font-semibold">
                              {employeeTasks.filter(t => t.status !== 'completed').length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(departmentStats).map(([department, stats]) => (
              <Card key={department}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{department}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de Funcionários</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Funcionários Ativos</span>
                      <span className="font-semibold">{stats.active}</span>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Performance Média</span>
                        <span className="font-semibold">{stats.avgPerformance}%</span>
                      </div>
                      <Progress value={stats.avgPerformance} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}