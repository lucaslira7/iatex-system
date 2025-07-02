import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Send, Lightbulb, TrendingUp, MessageSquare, Sparkles, User } from "lucide-react";
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

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI insights and suggestions
  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery<any[]>({
    queryKey: ['/api/ai/suggestions'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: chatHistory = [] } = useQuery<any[]>({
    queryKey: ['/api/ai/chat-history']
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', { message, context: 'general' });
      return await response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        type: 'chat'
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ['/api/ai/chat-history'] });
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Erro na Comunicação",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Get fabric suggestions mutation
  const getFabricSuggestionsMutation = useMutation({
    mutationFn: async (modelData: any) => {
      const response = await apiRequest('POST', '/api/ai/fabric-suggestions', modelData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/suggestions'] });
      toast({
        title: "Sugestões Atualizadas",
        description: "Novas sugestões de tecidos foram geradas baseadas nos seus dados.",
      });
    }
  });

  // Optimize margins mutation
  const optimizeMarginsMutation = useMutation({
    mutationFn: async (pricingData: any) => {
      const response = await apiRequest('POST', '/api/ai/optimize-margins', pricingData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/suggestions'] });
      toast({
        title: "Margens Otimizadas",
        description: "Sugestões de otimização de margem foram calculadas.",
      });
    }
  });

  useEffect(() => {
    // Load chat history on component mount
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      setMessages(chatHistory as Message[]);
    }
  }, [chatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'chat'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    sendMessageMutation.mutate(inputMessage);
  };

  const handleQuickAction = (action: string) => {
    const quickMessages = {
      'fabric-help': 'Quais tecidos você recomenda para uma camisa social masculina?',
      'margin-help': 'Como posso otimizar as margens dos meus produtos?',
      'production-help': 'Dicas para melhorar a eficiência da produção?',
      'cost-help': 'Como reduzir custos sem perder qualidade?'
    };

    const message = quickMessages[action as keyof typeof quickMessages];
    if (message) {
      setInputMessage(message);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'fabric': return <Sparkles className="h-4 w-4" />;
      case 'margin': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Assistente IA</h1>
          <p className="text-gray-600">Sugestões inteligentes e otimizações para sua confecção</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Inteligente
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Sugestões
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Otimizações
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Chat Interface */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversa com IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 mb-4 p-4 border rounded-lg">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Olá! Sou seu assistente IA para confecção.</p>
                      <p>Como posso ajudar você hoje?</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                          )}
                          {message.role === 'user' && (
                            <User className="h-4 w-4 mt-1 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm">{message.content}</p>
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Digite sua pergunta..."
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    type="submit" 
                    disabled={sendMessageMutation.isPending || !inputMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('fabric-help')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Sugestões de Tecidos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('margin-help')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Otimizar Margens
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('production-help')}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Dicas de Produção
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('cost-help')}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Reduzir Custos
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingSuggestions ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : suggestions.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Nenhuma sugestão disponível no momento.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    As sugestões aparecerão baseadas na sua atividade no sistema.
                  </p>
                </CardContent>
              </Card>
            ) : (
              suggestions.map((suggestion: AISuggestion) => (
                <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSuggestionIcon(suggestion.type)}
                        <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(suggestion.confidence)} text-white`}
                      >
                        {suggestion.confidence}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(suggestion.createdAt).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Otimização de Tecidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Analyze seus modelos e receba sugestões de tecidos baseadas em:
                </p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Histórico de vendas</li>
                  <li>• Margem de lucro</li>
                  <li>• Disponibilidade em estoque</li>
                  <li>• Tendências do mercado</li>
                </ul>
                <Button 
                  onClick={() => getFabricSuggestionsMutation.mutate({})}
                  disabled={getFabricSuggestionsMutation.isPending}
                  className="w-full"
                >
                  {getFabricSuggestionsMutation.isPending ? "Analisando..." : "Gerar Sugestões"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Otimização de Margens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Optimize suas margens de lucro considerando:
                </p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Custos atuais de produção</li>
                  <li>• Preços da concorrência</li>
                  <li>• Volume de vendas</li>
                  <li>• Elasticidade de preço</li>
                </ul>
                <Button 
                  onClick={() => optimizeMarginsMutation.mutate({})}
                  disabled={optimizeMarginsMutation.isPending}
                  className="w-full"
                >
                  {optimizeMarginsMutation.isPending ? "Calculando..." : "Otimizar Margens"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <style>{`
        .typing-indicator {
          display: flex;
          gap: 2px;
        }
        .typing-indicator span {
          height: 4px;
          width: 4px;
          background-color: #6b7280;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}