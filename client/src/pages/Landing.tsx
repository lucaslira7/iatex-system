import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Scissors, Calculator, ShoppingCart, Factory, Users, TrendingUp, Zap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded bg-primary flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">IA.TEX</span>
          </div>
          <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90">
            Fazer Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Sistema de Gestão Completo para
            <span className="text-primary"> Confecção</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Gerencie tecidos, precificação, produção, pedidos e muito mais com a tecnologia mais avançada 
            do mercado. Tudo que você precisa para otimizar sua confecção em uma única plataforma.
          </p>
          <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90">
            Começar Agora
            <Zap className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Módulos Completos e Integrados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Scissors className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Gestão de Tecidos</CardTitle>
              <CardDescription>
                Controle completo de estoque, fornecedores, composição e rendimento de todos os seus tecidos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Precificação Inteligente</CardTitle>
              <CardDescription>
                Calculadora avançada de custos com simulação de margens e comparação de tecidos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Pedidos & Orçamentos</CardTitle>
              <CardDescription>
                Geração automática de orçamentos e controle completo de pedidos com status em tempo real.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Factory className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Controle de Produção</CardTitle>
              <CardDescription>
                Acompanhe a produção por etapas, facções e lotes com rastreamento detalhado.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Gestão de Equipe</CardTitle>
              <CardDescription>
                Gerenciamento de funcionários, produtividade e permissões por usuário.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Relatórios & Analytics</CardTitle>
              <CardDescription>
                Dashboards inteligentes com métricas de desempenho e análises financeiras.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para Revolucionar sua Confecção?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de confecções que já otimizaram seus processos com o IA.TEX. 
            Comece hoje mesmo e veja a diferença na sua produtividade.
          </p>
          <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90">
            Acessar Sistema
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">IA.TEX</span>
          </div>
          <p className="text-gray-400">
            Sistema de Gestão Completo para Confecção - Desenvolvido com Inteligência Artificial
          </p>
        </div>
      </footer>
    </div>
  );
}
