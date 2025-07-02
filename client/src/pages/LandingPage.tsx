import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Scissors, 
  Calculator, 
  BarChart3, 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp,
  Zap,
  Shield,
  Clock,
  Target,
  Play,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Aqui integraria com sistema de email marketing
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">IA.TEX</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#funcionalidades" className="text-gray-600 hover:text-gray-900">Funcionalidades</a>
              <a href="#precos" className="text-gray-600 hover:text-gray-900">Preços</a>
              <a href="#depoimentos" className="text-gray-600 hover:text-gray-900">Depoimentos</a>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/teste-gratis'}>
                Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-800">
                🚀 Lançamento Oficial
              </Badge>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                O Sistema Completo para sua <span className="text-blue-600">Confecção</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Gerencie tecidos, precifique produtos, controle produção e aumente seus lucros com o primeiro sistema brasileiro feito especialmente para confecções.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4" onClick={() => window.location.href = '/teste-gratis'}>
                  <Play className="w-5 h-5 mr-2" />
                  Começar Teste Grátis
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4" onClick={() => window.location.href = '/demo'}>
                  Ver Demonstração
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  14 dias grátis
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Suporte incluído
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Dashboard Principal</h3>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Scissors className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Tecidos</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">127</p>
                        <p className="text-xs text-green-600">↗ +12% mês</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calculator className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Lucro</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">R$ 89K</p>
                        <p className="text-xs text-green-600">↗ +23% mês</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">💡 IA Sugestão</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Tecido algodão premium teve aumento de 15% na demanda. Considere aumentar estoque.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problemas que Resolvemos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pare de Perder Dinheiro com Gestão Manual
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A maioria das confecções perde até 30% do lucro por falta de controle. O IA.TEX resolve isso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Precificação Errada</h3>
                <p className="text-gray-600">
                  Sem sistema, você não sabe o custo real. Resultado: preços baixos demais e prejuízo.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tempo Perdido</h3>
                <p className="text-gray-600">
                  Horas perdidas fazendo contas na calculadora e planilhas desorganizadas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sem Controle</h3>
                <p className="text-gray-600">
                  Não saber quanto tem em estoque, quais pedidos estão atrasados, quanto está lucrando.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="text-3xl font-bold text-blue-600 mb-2">↓</div>
            <p className="text-2xl font-bold text-gray-900">O IA.TEX Resolve Tudo Isso</p>
          </div>
        </div>
      </section>

      {/* Funcionalidades Principais */}
      <section id="funcionalidades" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              22 Módulos Integrados em um Sistema
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que sua confecção precisa em uma única plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calculator,
                title: "Precificação Inteligente",
                description: "Calcule o preço certo com IA. 8 etapas automáticas, templates salvos e PDFs profissionais.",
                color: "blue"
              },
              {
                icon: Scissors,
                title: "Gestão de Tecidos",
                description: "Controle total do estoque. Upload de fotos, alertas de reposição e cálculos automáticos.",
                color: "green"
              },
              {
                icon: BarChart3,
                title: "Dashboard Executivo",
                description: "Veja seus números em tempo real. KPIs, gráficos e métricas que importam.",
                color: "purple"
              },
              {
                icon: Brain,
                title: "Assistente com IA",
                description: "OpenAI integrada. Sugestões de tecidos, otimizações e insights automáticos.",
                color: "orange"
              },
              {
                icon: TrendingUp,
                title: "Relatórios Avançados",
                description: "Descubra onde está perdendo dinheiro. Análises detalhadas e exportação em PDF.",
                color: "red"
              },
              {
                icon: Users,
                title: "Gestão Completa",
                description: "Clientes, pedidos, funcionários, produção. Tudo conectado e organizado.",
                color: "indigo"
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    feature.color === 'blue' ? 'bg-blue-100' :
                    feature.color === 'green' ? 'bg-green-100' :
                    feature.color === 'purple' ? 'bg-purple-100' :
                    feature.color === 'orange' ? 'bg-orange-100' :
                    feature.color === 'red' ? 'bg-red-100' :
                    'bg-indigo-100'
                  }`}>
                    <feature.icon className={`w-6 h-6 ${
                      feature.color === 'blue' ? 'text-blue-600' :
                      feature.color === 'green' ? 'text-green-600' :
                      feature.color === 'purple' ? 'text-purple-600' :
                      feature.color === 'orange' ? 'text-orange-600' :
                      feature.color === 'red' ? 'text-red-600' :
                      'text-indigo-600'
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Ver Todos os 22 Módulos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Retorno Garantido em 30 Dias
            </h2>
            <p className="text-xl text-blue-200">
              Nossos clientes economizam em média 40% do tempo e aumentam 25% o lucro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">40%</div>
              <p className="text-blue-200">Economia de Tempo</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">25%</div>
              <p className="text-blue-200">Aumento no Lucro</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">60%</div>
              <p className="text-blue-200">Redução de Erros</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">R$ 50K</div>
              <p className="text-blue-200">Economia Média/Ano</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos que Cabem no seu Bolso
            </h2>
            <p className="text-xl text-gray-600">
              Menos do que você gasta com café por mês
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Básico */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Básico</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$ 97</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Gestão de Tecidos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Precificação Simples</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Dashboard Básico</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Até 3 usuários</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Começar Teste
                </Button>
              </CardContent>
            </Card>

            {/* Plano Profissional - Destaque */}
            <Card className="border-blue-500 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">
                  MAIS POPULAR
                </Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Profissional</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">R$ 197</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Todos os 22 Módulos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Assistente com IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Relatórios Avançados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Usuários Ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Suporte Prioritário</span>
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Começar Teste Grátis
                </Button>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$ 397</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Tudo do Profissional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Integrações Personalizadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Treinamento Incluso</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Gerente de Sucesso</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ✅ 14 dias grátis • ✅ Sem fidelidade • ✅ Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que Nossos Clientes Dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                company: "Confecções Bella",
                text: "Aumentei meu lucro em 30% só corrigindo a precificação. O IA.TEX me mostrou que eu estava vendendo no prejuízo!",
                rating: 5
              },
              {
                name: "João Santos",
                company: "Moda & Estilo",
                text: "Economizo 4 horas por dia que gastava fazendo planilhas. Agora posso focar no que realmente importa: crescer o negócio.",
                rating: 5
              },
              {
                name: "Ana Costa",
                company: "Fashion Plus",
                text: "A IA sugere quais tecidos comprar baseado nas vendas. Nunca mais tive produto parado no estoque!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">"{testimonial.text}"</p>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Revolucionar sua Confecção?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a centenas de confecções que já aumentaram seus lucros com o IA.TEX
          </p>
          
          <div className="max-w-md mx-auto">
            {!isSubmitted ? (
              <form onSubmit={handleEmailSubmit} className="flex gap-4">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white text-gray-900"
                  required
                />
                <Button type="submit" size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold" onClick={() => window.location.href = '/teste-gratis'}>
                  Começar Agora
                </Button>
              </form>
            ) : (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg">
                ✅ Email recebido! Entraremos em contato em até 24h.
              </div>
            )}
          </div>

          <p className="text-sm text-blue-200 mt-4">
            Teste grátis por 14 dias • Sem cartão de crédito • Cancelamento imediato
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">IA.TEX</span>
              </div>
              <p className="text-gray-400">
                O sistema completo para gestão de confecções brasileiras.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Demonstração</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Tutoriais</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>contato@iatex.com.br</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 IA.TEX. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}