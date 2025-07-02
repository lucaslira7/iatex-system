import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, CheckCircle, ArrowLeft } from "lucide-react";

export default function LeadCapture() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    employees: "",
    monthlyProduction: "",
    currentSystem: "",
    mainChallenge: "",
    comments: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envio
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Obrigado pelo seu interesse!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Recebemos suas informações e nossa equipe entrará em contato em até 24 horas para agendar uma demonstração personalizada.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-blue-900 mb-3">Próximos Passos:</h3>
              <ul className="text-left text-blue-800 space-y-2">
                <li>✅ Nossa equipe analisará suas necessidades</li>
                <li>✅ Agendaremos uma demonstração personalizada</li>
                <li>✅ Configuraremos um teste gratuito de 14 dias</li>
                <li>✅ Suporte completo durante a implementação</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => window.location.href = '/landing'}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Home
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/demo'}>
                Explorar Demonstração
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900">IA.TEX</span>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/landing'}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Comece seu Teste Gratuito
          </h1>
          <p className="text-xl text-gray-600">
            Preencha as informações abaixo e nossa equipe entrará em contato para configurar seu acesso
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da sua Confecção</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Empresarial *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Nome da Empresa *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Nome da sua confecção"
                    required
                  />
                </div>
              </div>

              {/* Dados da Empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="employees">Número de Funcionários</Label>
                  <Select onValueChange={(value) => handleChange('employees', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 funcionários</SelectItem>
                      <SelectItem value="6-15">6-15 funcionários</SelectItem>
                      <SelectItem value="16-50">16-50 funcionários</SelectItem>
                      <SelectItem value="51-100">51-100 funcionários</SelectItem>
                      <SelectItem value="100+">Mais de 100 funcionários</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monthlyProduction">Produção Mensal (peças)</Label>
                  <Select onValueChange={(value) => handleChange('monthlyProduction', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100-500">100-500 peças</SelectItem>
                      <SelectItem value="501-1000">501-1.000 peças</SelectItem>
                      <SelectItem value="1001-5000">1.001-5.000 peças</SelectItem>
                      <SelectItem value="5001-10000">5.001-10.000 peças</SelectItem>
                      <SelectItem value="10000+">Mais de 10.000 peças</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="currentSystem">Sistema Atual de Gestão</Label>
                <Select onValueChange={(value) => handleChange('currentSystem', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Como você controla sua produção hoje?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planilhas">Planilhas Excel</SelectItem>
                    <SelectItem value="papel">Papel e caneta</SelectItem>
                    <SelectItem value="sistema-simples">Sistema simples</SelectItem>
                    <SelectItem value="erp">ERP complexo</SelectItem>
                    <SelectItem value="nenhum">Nenhum controle formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mainChallenge">Principal Desafio</Label>
                <Select onValueChange={(value) => handleChange('mainChallenge', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qual seu maior problema hoje?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="precificacao">Precificação incorreta</SelectItem>
                    <SelectItem value="controle-estoque">Controle de estoque</SelectItem>
                    <SelectItem value="gestao-pedidos">Gestão de pedidos</SelectItem>
                    <SelectItem value="producao">Controle de produção</SelectItem>
                    <SelectItem value="financeiro">Controle financeiro</SelectItem>
                    <SelectItem value="tempo">Perda de tempo com controles manuais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="comments">Comentários Adicionais</Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => handleChange('comments', e.target.value)}
                  placeholder="Conte-nos mais sobre suas necessidades específicas..."
                  rows={4}
                />
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">O que você vai receber:</h3>
                <ul className="text-blue-800 space-y-2">
                  <li>✅ Demonstração personalizada do sistema</li>
                  <li>✅ Análise gratuita dos seus processos atuais</li>
                  <li>✅ Teste gratuito de 14 dias sem compromisso</li>
                  <li>✅ Suporte completo para implementação</li>
                  <li>✅ Treinamento da equipe incluído</li>
                </ul>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Começar Teste Gratuito"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Ao enviar, você concorda com nossos termos de uso e política de privacidade.
                Não enviamos spam e você pode cancelar a qualquer momento.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}