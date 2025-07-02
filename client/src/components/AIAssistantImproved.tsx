import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  MessageSquare, 
  Sparkles, 
  User,
  X,
  Loader2,
  Star,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
  Users,
  FileText,
  Target,
  Zap,
  Clock,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'suggestion' | 'optimization' | 'chat';
}

interface AISuggestion {
  id: string;
  type: 'fabric' | 'margin' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  data: any;
  createdAt: Date;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: () => void;
}

export default function AIAssistantImproved() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI insights and suggestions
  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery<any[]>({
    queryKey: ['/api/ai/suggestions'],
    refetchInterval: 30000,
    retry: 1
  });

  const { data: chatHistory = [] } = useQuery<any[]>({
    queryKey: ['/api/ai/chat-history'],
    retry: 1
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      try {
        return await apiRequest('/api/ai/chat', 'POST', { message, context: 'general' });
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data: any) => {
      const aiMessage: Message = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: data?.response || 'Sou seu assistente IA para confecção. Como posso ajudar você hoje?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ['/api/ai/chat-history'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      setIsTyping(false);
      toast({
        title: "Erro na conversa",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    sendMessageMutation.mutate(inputMessage);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'fabric-suggestions',
      title: 'Sugestões de Tecidos',
      description: 'Recomendações baseadas no histórico',
      icon: Package,
      color: 'bg-blue-500',
      action: () => {
        setInputMessage("Me sugira tecidos para uma coleção de verão com base no meu histórico de vendas");
        setActiveTab('chat');
      }
    },
    {
      id: 'optimize-margins',
      title: 'Otimizar Margens',
      description: 'Análise de precificação inteligente',
      icon: TrendingUp,
      color: 'bg-green-500',
      action: () => {
        setInputMessage("Analise meus produtos e sugira otimizações de margem de lucro");
        setActiveTab('chat');
      }
    },
    {
      id: 'production-tips',
      title: 'Dicas de Produção',
      description: 'Melhorias no processo produtivo',
      icon: Users,
      color: 'bg-purple-500',
      action: () => {
        setInputMessage("Como posso otimizar minha produção e reduzir desperdícios?");
        setActiveTab('chat');
      }
    },
    {
      id: 'cost-reduction',
      title: 'Reduzir Custos',
      description: 'Identifique oportunidades de economia',
      icon: DollarSign,
      color: 'bg-orange-500',
      action: () => {
        setInputMessage("Analise meus custos e identifique onde posso economizar sem perder qualidade");
        setActiveTab('chat');
      }
    }
  ];

  const mockOptimizations = [
    {
      id: '1',
      title: 'Otimização de Margem - Camisas',
      description: 'Aumente a margem de lucro das camisas básicas em 15% sem impactar vendas',
      impact: 'Aumento de R$ 2.500/mês em lucros',
      category: 'Precificação',
      status: 'pending',
      confidence: 92
    },
    {
      id: '2', 
      title: 'Redução de Desperdício - Tecido Algodão',
      description: 'Otimize o corte para reduzir desperdício de tecido em 8%',
      impact: 'Economia de R$ 800/mês',
      category: 'Produção',
      status: 'pending',
      confidence: 87
    },
    {
      id: '3',
      title: 'Fornecedor Alternativo - Aviamentos',
      description: 'Encontrei um fornecedor com preços 20% menores mantendo qualidade',
      impact: 'Economia de R$ 450/mês',
      category: 'Compras',
      status: 'applied',
      confidence: 95
    }
  ];

  const mockSuggestions = [
    {
      id: '1',
      title: 'Tecido Tendência: Linho Sustentável',
      description: 'Com base nas tendências atuais, tecidos de linho sustentável têm alta procura',
      confidence: 89,
      category: 'Tecidos'
    },
    {
      id: '2',
      title: 'Ajuste Sazonal de Preços',
      description: 'Considere aumentar preços de peças de inverno em 12% devido à demanda',
      confidence: 76,
      category: 'Precificação'
    },
    {
      id: '3',
      title: 'Nova Linha: Moda Fitness',
      description: 'Análise de mercado indica oportunidade em roupas fitness femininas',
      confidence: 83,
      category: 'Produtos'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Tecidos': return 'bg-blue-100 text-blue-800';
      case 'Precificação': return 'bg-green-100 text-green-800';
      case 'Produtos': return 'bg-purple-100 text-purple-800';
      case 'Produção': return 'bg-orange-100 text-orange-800';
      case 'Compras': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assistente IA</h2>
            <p className="text-sm text-gray-600">Sugestões inteligentes e otimizações para sua confecção</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Inteligente
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Sugestões
          </TabsTrigger>
          <TabsTrigger value="optimizations" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Otimizações
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col mx-6 mt-4">
          <div className="flex-1 flex flex-col">
            {/* Quick Actions */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="p-3 h-auto text-left justify-start"
                    onClick={action.action}
                  >
                    <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Messages */}
            <div className="flex-1 min-h-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Conversa com IA</h3>
              <Card className="flex-1 h-96">
                <ScrollArea className="h-full p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Bot className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Olá! Sou seu assistente IA para confecção.</h3>
                      <p className="text-gray-600 mb-4">Como posso ajudar você hoje?</p>
                      <p className="text-sm text-gray-500">Use as ações rápidas acima ou digite sua pergunta abaixo</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="flex items-start gap-2">
                              {message.role === 'assistant' && (
                                <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>

            {/* Input */}
            <div className="flex gap-2 mt-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua pergunta..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                size="icon"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="flex-1 mx-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Sugestões Inteligentes</h3>
              <Badge variant="secondary">{mockSuggestions.length} sugestões</Badge>
            </div>
            
            <div className="space-y-3">
              {mockSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge className={getCategoryColor(suggestion.category)}>
                            {suggestion.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{suggestion.confidence}% confiança</span>
                          </div>
                          <Button size="sm" variant="outline">
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Optimizations Tab */}
        <TabsContent value="optimizations" className="flex-1 mx-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Otimizações Disponíveis</h3>
              <Badge variant="secondary">{mockOptimizations.length} otimizações</Badge>
            </div>
            
            <div className="space-y-3">
              {mockOptimizations.map((optimization) => (
                <Card key={optimization.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{optimization.title}</h4>
                          <Badge className={getCategoryColor(optimization.category)}>
                            {optimization.category}
                          </Badge>
                          {optimization.status === 'applied' ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aplicado
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{optimization.description}</p>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">{optimization.impact}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{optimization.confidence}% confiança</span>
                          </div>
                        </div>
                        {optimization.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aplicar
                            </Button>
                            <Button size="sm" variant="outline">
                              Ver Detalhes
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}