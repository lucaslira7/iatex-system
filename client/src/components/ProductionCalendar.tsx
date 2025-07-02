import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, Factory, Package, DollarSign, ChevronLeft, ChevronRight, Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarEvent {
  id: number;
  type: 'production' | 'delivery' | 'payment' | 'meeting' | 'reminder';
  title: string;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  relatedId?: number;
  factory?: string;
  pieces?: number;
  value?: number;
}

const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    type: 'production',
    title: 'Início Produção - Vestidos',
    description: 'Início da produção de 50 vestidos midi na Facção ABC',
    date: new Date('2025-07-02'),
    startTime: '08:00',
    priority: 'high',
    status: 'in_progress',
    factory: 'Facção ABC',
    pieces: 50
  },
  {
    id: 2,
    type: 'delivery',
    title: 'Entrega Pedido #001',
    description: 'Entrega de 100 camisas para Cliente Premium',
    date: new Date('2025-07-03'),
    startTime: '14:00',
    priority: 'high',
    status: 'pending',
    pieces: 100
  },
  {
    id: 3,
    type: 'payment',
    title: 'Vencimento DAS',
    description: 'Pagamento do DAS - Simples Nacional',
    date: new Date('2025-07-04'),
    priority: 'medium',
    status: 'pending',
    value: 650
  },
  {
    id: 4,
    type: 'production',
    title: 'Corte de Tecidos',
    description: 'Corte de tecidos para 30 blusas na Facção Premium',
    date: new Date('2025-07-05'),
    startTime: '09:00',
    endTime: '17:00',
    priority: 'medium',
    status: 'pending',
    factory: 'Facção Premium',
    pieces: 30
  },
  {
    id: 5,
    type: 'meeting',
    title: 'Reunião com Fornecedor',
    description: 'Negociação de preços de tecidos para próximo mês',
    date: new Date('2025-07-06'),
    startTime: '10:00',
    endTime: '11:30',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 6,
    type: 'production',
    title: 'Finalização Costura',
    description: 'Finalização da costura de 25 calças jeans',
    date: new Date('2025-07-07'),
    startTime: '16:00',
    priority: 'low',
    status: 'pending',
    factory: 'Costura Premium',
    pieces: 25
  },
  {
    id: 7,
    type: 'reminder',
    title: 'Controle de Qualidade',
    description: 'Verificar qualidade do lote 156 - camisas',
    date: new Date('2025-07-08'),
    startTime: '08:30',
    priority: 'high',
    status: 'pending',
    pieces: 80
  }
];

export default function ProductionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [activeTab, setActiveTab] = useState("calendar");
  const { toast } = useToast();

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'production': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivery': return 'bg-green-100 text-green-800 border-green-200';
      case 'payment': return 'bg-red-100 text-red-800 border-red-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'reminder': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'production': return <Factory className="h-4 w-4" />;
      case 'delivery': return <Package className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'meeting': return <CalendarIcon className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'production': return 'Produção';
      case 'delivery': return 'Entrega';
      case 'payment': return 'Pagamento';
      case 'meeting': return 'Reunião';
      case 'reminder': return 'Lembrete';
      default: return type;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">Alta</Badge>;
      case 'medium': return <Badge variant="secondary">Média</Badge>;
      case 'low': return <Badge variant="outline">Baixa</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSyncGoogleCalendar = () => {
    toast({
      title: "Sincronização Iniciada",
      description: "Conectando com Google Calendar...",
    });
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return events
      .filter(event => event.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  };

  const getTodayEvents = () => {
    const today = new Date();
    return events.filter(event => isSameDay(event.date, today));
  };

  const getProductionSummary = () => {
    const productionEvents = events.filter(e => e.type === 'production');
    const totalPieces = productionEvents.reduce((sum, e) => sum + (e.pieces || 0), 0);
    const activeProductions = productionEvents.filter(e => e.status === 'in_progress').length;
    
    return {
      totalPieces,
      activeProductions,
      totalEvents: productionEvents.length
    };
  };

  const weekDays = getWeekDays();
  const upcomingEvents = getUpcomingEvents();
  const todayEvents = getTodayEvents();
  const productionSummary = getProductionSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendário de Produção</h1>
            <p className="text-gray-600">Visualização integrada de produção, entregas e eventos</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSyncGoogleCalendar}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Sync Google Calendar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{todayEvents.length}</p>
                <p className="text-sm text-gray-600">Eventos Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Factory className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{productionSummary.activeProductions}</p>
                <p className="text-sm text-gray-600">Produções Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{productionSummary.totalPieces}</p>
                <p className="text-sm text-gray-600">Peças em Produção</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-sm text-gray-600">Próximos Eventos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          {/* Calendar Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {format(weekDays[0], 'dd/MM', { locale: ptBR })} - {format(weekDays[6], 'dd/MM/yyyy', { locale: ptBR })}
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Hoje
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Calendar */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => (
                  <div key={day} className="p-4 text-center font-semibold text-gray-700 border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 min-h-96">
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`p-2 border-r last:border-r-0 border-b min-h-32 cursor-pointer hover:bg-gray-50 ${
                        isCurrentDay ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className={`text-sm font-semibold mb-2 ${isCurrentDay ? 'text-blue-600' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getEventTypeColor(event.type)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            <div className="flex items-center space-x-1">
                              {getEventTypeIcon(event.type)}
                              <span className="truncate">{event.title}</span>
                            </div>
                            {event.startTime && (
                              <div className="text-xs opacity-75">{event.startTime}</div>
                            )}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <div className="space-y-4">
            {events
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((event, index) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600">{event.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{getEventTypeName(event.type)}</Badge>
                            {getPriorityBadge(event.priority)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Data:</span>
                            <p className="font-semibold">{format(event.date, 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                          {event.startTime && (
                            <div>
                              <span className="text-gray-600">Horário:</span>
                              <p className="font-semibold">
                                {event.startTime}{event.endTime && ` - ${event.endTime}`}
                              </p>
                            </div>
                          )}
                          {event.factory && (
                            <div>
                              <span className="text-gray-600">Facção:</span>
                              <p className="font-semibold">{event.factory}</p>
                            </div>
                          )}
                          {event.pieces && (
                            <div>
                              <span className="text-gray-600">Peças:</span>
                              <p className="font-semibold">{event.pieces}</p>
                            </div>
                          )}
                          {event.value && (
                            <div>
                              <span className="text-gray-600">Valor:</span>
                              <p className="font-semibold">R$ {event.value.toFixed(2)}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <p className={`font-semibold ${getStatusColor(event.status)}`}>
                              {event.status === 'pending' ? 'Pendente' :
                               event.status === 'in_progress' ? 'Em Andamento' :
                               event.status === 'completed' ? 'Concluído' : 'Cancelado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Events */}
            <Card>
              <CardHeader>
                <CardTitle>Eventos de Hoje</CardTitle>
                <CardDescription>{format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</CardDescription>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum evento para hoje</p>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{event.title}</p>
                          <p className="text-xs text-gray-600">{event.startTime}</p>
                        </div>
                        {getPriorityBadge(event.priority)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>Próximos 5 eventos agendados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{event.title}</p>
                        <p className="text-xs text-gray-600">
                          {format(event.date, 'dd/MM', { locale: ptBR })} {event.startTime && `• ${event.startTime}`}
                        </p>
                      </div>
                      {getPriorityBadge(event.priority)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Production Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Produção</CardTitle>
              <CardDescription>Eventos de produção da próxima semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter(e => e.type === 'production')
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 4)
                  .map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Factory className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.factory} • {event.pieces} peças</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{format(event.date, 'dd/MM', { locale: ptBR })}</p>
                        <p className="text-sm text-gray-600">{event.startTime}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getEventTypeIcon(selectedEvent.type)}
                <span>{selectedEvent.title}</span>
              </DialogTitle>
              <DialogDescription>
                {getEventTypeName(selectedEvent.type)} • {format(selectedEvent.date, 'dd/MM/yyyy', { locale: ptBR })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700">{selectedEvent.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedEvent.startTime && (
                  <div>
                    <span className="text-gray-600">Horário:</span>
                    <p className="font-semibold">
                      {selectedEvent.startTime}{selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Prioridade:</span>
                  <div className="mt-1">{getPriorityBadge(selectedEvent.priority)}</div>
                </div>
                {selectedEvent.factory && (
                  <div>
                    <span className="text-gray-600">Facção:</span>
                    <p className="font-semibold">{selectedEvent.factory}</p>
                  </div>
                )}
                {selectedEvent.pieces && (
                  <div>
                    <span className="text-gray-600">Peças:</span>
                    <p className="font-semibold">{selectedEvent.pieces}</p>
                  </div>
                )}
                {selectedEvent.value && (
                  <div>
                    <span className="text-gray-600">Valor:</span>
                    <p className="font-semibold">R$ {selectedEvent.value.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className={`font-semibold ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status === 'pending' ? 'Pendente' :
                     selectedEvent.status === 'in_progress' ? 'Em Andamento' :
                     selectedEvent.status === 'completed' ? 'Concluído' : 'Cancelado'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button size="sm" variant="outline">Editar</Button>
                <Button size="sm" variant="outline">Marcar como Concluído</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}