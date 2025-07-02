import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Plus, Search, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Calendar as CalendarIcon, CreditCard, PiggyBank, Receipt, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Account {
  id: number;
  name: string;
  type: 'bank' | 'cash' | 'credit_card';
  balance: number;
  isActive: boolean;
}

interface Transaction {
  id: number;
  accountId: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  orderId?: number;
}

interface Budget {
  id: number;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  month: number;
  year: number;
}

const mockAccounts: Account[] = [
  { id: 1, name: "Conta Corrente Principal", type: "bank", balance: 25420.80, isActive: true },
  { id: 2, name: "Caixa", type: "cash", balance: 1250.00, isActive: true },
  { id: 3, name: "Cartão Empresarial", type: "credit_card", balance: -3200.50, isActive: true },
];

const mockTransactions: Transaction[] = [
  {
    id: 1,
    accountId: 1,
    type: "income",
    category: "Vendas",
    description: "Pagamento Pedido #001",
    amount: 2500.00,
    dueDate: new Date("2025-07-02"),
    paidDate: new Date("2025-07-02"),
    status: "paid",
    orderId: 1
  },
  {
    id: 2,
    accountId: 1,
    type: "expense",
    category: "Materiais",
    description: "Compra tecidos fornecedor XYZ",
    amount: 1800.00,
    dueDate: new Date("2025-07-03"),
    status: "pending"
  },
  {
    id: 3,
    accountId: 2,
    type: "expense",
    category: "Salários",
    description: "Salário Maria - Junho/2025",
    amount: 2200.00,
    dueDate: new Date("2025-07-01"),
    paidDate: new Date("2025-07-01"),
    status: "paid"
  },
  {
    id: 4,
    accountId: 1,
    type: "expense",
    category: "Impostos",
    description: "DAS - Simples Nacional",
    amount: 650.00,
    dueDate: new Date("2025-07-20"),
    status: "pending"
  }
];

const mockBudgets: Budget[] = [
  { id: 1, category: "Materiais", budgetAmount: 5000.00, spentAmount: 3200.00, month: 7, year: 2025 },
  { id: 2, category: "Salários", budgetAmount: 8000.00, spentAmount: 6600.00, month: 7, year: 2025 },
  { id: 3, category: "Marketing", budgetAmount: 1000.00, spentAmount: 450.00, month: 7, year: 2025 },
  { id: 4, category: "Impostos", budgetAmount: 2000.00, spentAmount: 650.00, month: 7, year: 2025 },
];

export default function FinancialManagement() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  const getTotalBalance = () => {
    return accounts.filter(acc => acc.isActive).reduce((sum, acc) => sum + acc.balance, 0);
  };

  const getPendingIncome = () => {
    return transactions
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getPendingExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getOverdueTransactions = () => {
    const today = new Date();
    return transactions.filter(t => 
      t.status === 'pending' && 
      new Date(t.dueDate) < today
    ).length;
  };

  const getMonthlyIncome = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => 
        t.type === 'income' && 
        t.status === 'paid' &&
        t.paidDate &&
        new Date(t.paidDate).getMonth() === currentMonth &&
        new Date(t.paidDate).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.status === 'paid' &&
        t.paidDate &&
        new Date(t.paidDate).getMonth() === currentMonth &&
        new Date(t.paidDate).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'bank': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <PiggyBank className="h-4 w-4" />;
      case 'credit_card': return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'bank': return 'Conta Bancária';
      case 'cash': return 'Dinheiro';
      case 'credit_card': return 'Cartão de Crédito';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Vencido';
      default: return status;
    }
  };

  const handleAddAccount = () => {
    toast({
      title: "Conta Adicionada",
      description: "Nova conta foi criada com sucesso.",
    });
    setIsAddAccountOpen(false);
  };

  const handleAddTransaction = () => {
    toast({
      title: "Transação Criada",
      description: "Nova transação foi registrada com sucesso.",
    });
    setIsAddTransactionOpen(false);
  };

  const handleAddBudget = () => {
    toast({
      title: "Orçamento Criado",
      description: "Novo orçamento foi definido com sucesso.",
    });
    setIsAddBudgetOpen(false);
  };

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const monthlyProfit = monthlyIncome - monthlyExpenses;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
            <p className="text-gray-600">Controle completo do fluxo de caixa e finanças</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Orçamento</DialogTitle>
                <DialogDescription>
                  Defina um novo orçamento para controle de gastos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materiais">Materiais</SelectItem>
                      <SelectItem value="salarios">Salários</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="impostos">Impostos</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mês</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Mês..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Janeiro</SelectItem>
                        <SelectItem value="2">Fevereiro</SelectItem>
                        <SelectItem value="3">Março</SelectItem>
                        <SelectItem value="4">Abril</SelectItem>
                        <SelectItem value="5">Maio</SelectItem>
                        <SelectItem value="6">Junho</SelectItem>
                        <SelectItem value="7">Julho</SelectItem>
                        <SelectItem value="8">Agosto</SelectItem>
                        <SelectItem value="9">Setembro</SelectItem>
                        <SelectItem value="10">Outubro</SelectItem>
                        <SelectItem value="11">Novembro</SelectItem>
                        <SelectItem value="12">Dezembro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Input type="number" placeholder="2025" defaultValue="2025" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Valor do Orçamento (R$)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddBudgetOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddBudget}>
                  Criar Orçamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Transação</DialogTitle>
                <DialogDescription>
                  Adicione uma nova receita ou despesa
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Conta..." />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.filter(acc => acc.isActive).map(account => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="materiais">Materiais</SelectItem>
                      <SelectItem value="salarios">Salários</SelectItem>
                      <SelectItem value="impostos">Impostos</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="aluguel">Aluguel</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input placeholder="Ex: Pagamento do pedido #001" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddTransaction}>
                  Criar Transação
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Conta</DialogTitle>
                <DialogDescription>
                  Adicione uma nova conta financeira
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Conta</Label>
                  <Input placeholder="Ex: Conta Corrente Banco do Brasil" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Conta</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Conta Bancária</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Saldo Inicial (R$)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddAccountOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddAccount}>
                  Criar Conta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">R$ {getTotalBalance().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-gray-600">Saldo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">R$ {getPendingIncome().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-gray-600">A Receber</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">R$ {getPendingExpenses().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-gray-600">A Pagar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{getOverdueTransactions()}</p>
                <p className="text-sm text-gray-600">Contas Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Mês - {format(new Date(), 'MMMM yyyy', { locale: ptBR })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Receitas</span>
                <span className="font-semibold text-green-600">R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <Progress value={monthlyIncome > 0 ? 100 : 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Despesas</span>
                <span className="font-semibold text-red-600">R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <Progress value={monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Lucro</span>
                <span className={`font-semibold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Progress value={monthlyProfit >= 0 ? 100 : 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => {
                    const account = accounts.find(a => a.id === transaction.accountId);
                    return (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{account?.name} • {transaction.category}</p>
                          <p className="text-xs text-gray-500">{format(new Date(transaction.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge className={`${getStatusColor(transaction.status)} text-xs`}>
                            {getStatusText(transaction.status)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Budget Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso dos Orçamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
                    const isOverBudget = percentage > 100;
                    return (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-semibold">{budget.category}</span>
                          <span className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                            R$ {budget.spentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {budget.budgetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{percentage.toFixed(1)}% utilizado</span>
                          <span>Restam R$ {Math.max(0, budget.budgetAmount - budget.spentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className={`${!account.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getAccountTypeIcon(account.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.name}</h3>
                        <p className="text-sm text-gray-600">{getAccountTypeName(account.type)}</p>
                      </div>
                    </div>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saldo</span>
                      <span className={`font-bold text-lg ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="grid gap-4">
            {transactions.map((transaction) => {
              const account = accounts.find(a => a.id === transaction.accountId);
              const isOverdue = transaction.status === 'pending' && new Date(transaction.dueDate) < new Date();
              return (
                <Card key={transaction.id} className={isOverdue ? 'border-red-200' : ''}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                          <Badge className={getStatusColor(isOverdue ? 'overdue' : transaction.status)}>
                            {getStatusText(isOverdue ? 'overdue' : transaction.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Conta:</span> {account?.name}
                          </div>
                          <div>
                            <span className="font-medium">Categoria:</span> {transaction.category}
                          </div>
                          <div>
                            <span className="font-medium">Vencimento:</span> {format(new Date(transaction.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          {transaction.paidDate && (
                            <div>
                              <span className="font-medium">Pago em:</span> {format(new Date(transaction.paidDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {transaction.status === 'pending' && (
                          <Button size="sm" className="mt-2">
                            Marcar como Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
              const isOverBudget = percentage > 100;
              const remaining = budget.budgetAmount - budget.spentAmount;
              
              return (
                <Card key={budget.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                      <Badge variant={isOverBudget ? "destructive" : percentage > 80 ? "secondary" : "default"}>
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Gasto</span>
                          <span>Orçado</span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-3 ${isOverBudget ? 'bg-red-100' : ''}`}
                        />
                        <div className="flex justify-between text-sm mt-1">
                          <span className="font-semibold">R$ {budget.spentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span>R$ {budget.budgetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Restante:</span>
                        <span className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {Math.abs(remaining).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          {remaining < 0 && ' (excedido)'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {format(new Date(budget.year, budget.month - 1), 'MMMM yyyy', { locale: ptBR })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}