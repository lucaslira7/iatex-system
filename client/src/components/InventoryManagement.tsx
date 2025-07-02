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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Search, AlertTriangle, TrendingUp, TrendingDown, Archive, ShoppingCart, BarChart3, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuppliesCategory {
  id: number;
  name: string;
  description: string;
}

interface Supply {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  supplierId: number;
  sku: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
}

interface StockMovement {
  id: number;
  supplyId: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  unitPrice?: number;
  totalValue?: number;
  reason: string;
  orderId?: number;
  userId: string;
  createdAt: Date;
}

interface Supplier {
  id: number;
  name: string;
  contact: string;
}

const mockCategories: SuppliesCategory[] = [
  { id: 1, name: "Aviamentos", description: "Botões, zíperes, etiquetas, etc." },
  { id: 2, name: "Embalagens", description: "Sacos, caixas, tags" },
  { id: 3, name: "Linhas e Elásticos", description: "Linhas de costura, elásticos" },
  { id: 4, name: "Ferramentas", description: "Agulhas, tesouras, réguas" },
  { id: 5, name: "Produtos Químicos", description: "Amaciantes, alvejantes" },
];

const mockSuppliers: Supplier[] = [
  { id: 1, name: "Aviamentos São Paulo", contact: "(11) 3456-7890" },
  { id: 2, name: "Embalagens Premium", contact: "(11) 2345-6789" },
  { id: 3, name: "Linhas & Cia", contact: "(11) 4567-8901" },
];

const mockSupplies: Supply[] = [
  {
    id: 1,
    name: "Botão Plástico 15mm Branco",
    description: "Botão plástico redondo branco de 15mm com 4 furos",
    categoryId: 1,
    supplierId: 1,
    sku: "BTN-PL-15-BR",
    unitPrice: 0.12,
    currentStock: 2500,
    minimumStock: 500,
    unit: "unidade",
    isActive: true
  },
  {
    id: 2,
    name: "Zíper Invisível 20cm Preto",
    description: "Zíper invisível preto de 20cm",
    categoryId: 1,
    supplierId: 1,
    sku: "ZIP-INV-20-PT",
    unitPrice: 2.50,
    currentStock: 150,
    minimumStock: 50,
    unit: "unidade",
    isActive: true
  },
  {
    id: 3,
    name: "Etiqueta Composição 100% Algodão",
    description: "Etiqueta tecida com composição 100% algodão",
    categoryId: 1,
    supplierId: 1,
    sku: "ETQ-100ALG",
    unitPrice: 0.25,
    currentStock: 800,
    minimumStock: 200,
    unit: "unidade",
    isActive: true
  },
  {
    id: 4,
    name: "Saco Plástico 20x30cm",
    description: "Saco plástico transparente 20x30cm",
    categoryId: 2,
    supplierId: 2,
    sku: "SAC-PL-20x30",
    unitPrice: 0.08,
    currentStock: 45,
    minimumStock: 100,
    unit: "unidade",
    isActive: true
  },
  {
    id: 5,
    name: "Linha Polyester 120 Branca",
    description: "Linha polyester 120 branca - cone 5000m",
    categoryId: 3,
    supplierId: 3,
    sku: "LIN-POL-120-BR",
    unitPrice: 15.80,
    currentStock: 25,
    minimumStock: 10,
    unit: "cone",
    isActive: true
  },
  {
    id: 6,
    name: "Elástico 10mm Branco",
    description: "Elástico branco de 10mm",
    categoryId: 3,
    supplierId: 3,
    sku: "ELA-10-BR",
    unitPrice: 2.20,
    currentStock: 8,
    minimumStock: 15,
    unit: "metro",
    isActive: true
  }
];

const mockMovements: StockMovement[] = [
  {
    id: 1,
    supplyId: 1,
    type: "in",
    quantity: 1000,
    unitPrice: 0.12,
    totalValue: 120.00,
    reason: "Compra - NF 12345",
    userId: "user123",
    createdAt: new Date("2025-07-01")
  },
  {
    id: 2,
    supplyId: 4,
    type: "out",
    quantity: 50,
    reason: "Produção Pedido #001",
    orderId: 1,
    userId: "user123",
    createdAt: new Date("2025-07-02")
  },
  {
    id: 3,
    supplyId: 6,
    type: "adjustment",
    quantity: -2,
    reason: "Ajuste de inventário",
    userId: "user123",
    createdAt: new Date("2025-07-02")
  }
];

export default function InventoryManagement() {
  const [supplies, setSupplies] = useState<Supply[]>(mockSupplies);
  const [categories, setCategories] = useState<SuppliesCategory[]>(mockCategories);
  const [movements, setMovements] = useState<StockMovement[]>(mockMovements);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [activeTab, setActiveTab] = useState("supplies");
  const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);
  const [isAddMovementOpen, setIsAddMovementOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const { toast } = useToast();

  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || supply.categoryId.toString() === filterCategory;
    const isLowStock = supply.currentStock <= supply.minimumStock;
    const matchesStatus = !filterStatus || 
                         (filterStatus === "low_stock" && isLowStock) ||
                         (filterStatus === "normal" && !isLowStock) ||
                         (filterStatus === "inactive" && !supply.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus && supply.isActive;
  });

  const getLowStockCount = () => {
    return supplies.filter(s => s.isActive && s.currentStock <= s.minimumStock).length;
  };

  const getTotalStockValue = () => {
    return supplies
      .filter(s => s.isActive)
      .reduce((sum, supply) => sum + (supply.currentStock * supply.unitPrice), 0);
  };

  const getTotalItems = () => {
    return supplies.filter(s => s.isActive).length;
  };

  const getStockLevel = (supply: Supply) => {
    const percentage = (supply.currentStock / (supply.minimumStock * 2)) * 100;
    return Math.min(percentage, 100);
  };

  const getStockStatus = (supply: Supply) => {
    if (supply.currentStock === 0) return { color: "bg-red-100 text-red-800", text: "Sem Estoque" };
    if (supply.currentStock <= supply.minimumStock) return { color: "bg-yellow-100 text-yellow-800", text: "Estoque Baixo" };
    return { color: "bg-green-100 text-green-800", text: "Normal" };
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || "N/A";
  };

  const getSupplierName = (supplierId: number) => {
    return suppliers.find(s => s.id === supplierId)?.name || "N/A";
  };

  const getSupplyName = (supplyId: number) => {
    return supplies.find(s => s.id === supplyId)?.name || "N/A";
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'in': return 'bg-green-100 text-green-800';
      case 'out': return 'bg-red-100 text-red-800';
      case 'adjustment': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'in': return 'Entrada';
      case 'out': return 'Saída';
      case 'adjustment': return 'Ajuste';
      default: return type;
    }
  };

  const handleAddSupply = () => {
    toast({
      title: "Insumo Adicionado",
      description: "Novo insumo foi cadastrado com sucesso.",
    });
    setIsAddSupplyOpen(false);
  };

  const handleAddMovement = () => {
    toast({
      title: "Movimentação Registrada",
      description: "Nova movimentação de estoque foi registrada.",
    });
    setIsAddMovementOpen(false);
  };

  const handleAddCategory = () => {
    toast({
      title: "Categoria Criada",
      description: "Nova categoria foi criada com sucesso.",
    });
    setIsAddCategoryOpen(false);
  };

  const generatePurchasePrediction = () => {
    const predictions = supplies
      .filter(s => s.isActive && s.currentStock <= s.minimumStock * 1.5)
      .map(supply => {
        const dailyUsage = 5; // Simulação - deveria ser calculado com base no histórico
        const daysToStockOut = Math.max(0, Math.floor(supply.currentStock / dailyUsage));
        const suggestedQuantity = supply.minimumStock * 2;
        
        return {
          supply,
          daysToStockOut,
          suggestedQuantity,
          estimatedCost: suggestedQuantity * supply.unitPrice
        };
      })
      .sort((a, b) => a.daysToStockOut - b.daysToStockOut);

    return predictions;
  };

  const purchasePredictions = generatePurchasePrediction();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estoque de Insumos</h1>
            <p className="text-gray-600">Controle completo de aviamentos, embalagens e materiais</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Categoria</DialogTitle>
                <DialogDescription>
                  Adicione uma nova categoria de insumos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Categoria</Label>
                  <Input placeholder="Ex: Aviamentos" />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descrição da categoria..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCategory}>
                  Criar Categoria
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddMovementOpen} onOpenChange={setIsAddMovementOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Movimentação</DialogTitle>
                <DialogDescription>
                  Registre entrada, saída ou ajuste de estoque
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
                        <SelectItem value="in">Entrada</SelectItem>
                        <SelectItem value="out">Saída</SelectItem>
                        <SelectItem value="adjustment">Ajuste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Insumo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Insumo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {supplies.filter(s => s.isActive).map(supply => (
                          <SelectItem key={supply.id} value={supply.id.toString()}>
                            {supply.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Unitário (R$)</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Input placeholder="Ex: Compra NF 12345, Produção Pedido #001" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMovementOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddMovement}>
                  Registrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSupplyOpen} onOpenChange={setIsAddSupplyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Insumo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Cadastrar Insumo</DialogTitle>
                <DialogDescription>
                  Adicione um novo insumo ao estoque
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Insumo</Label>
                  <Input placeholder="Ex: Botão Plástico 15mm Branco" />
                </div>
                <div className="space-y-2">
                  <Label>SKU/Código</Label>
                  <Input placeholder="Ex: BTN-PL-15-BR" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Fornecedor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Preço Unitário (R$)</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque Mínimo</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Unidade..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unidade">Unidade</SelectItem>
                        <SelectItem value="metro">Metro</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="cone">Cone</SelectItem>
                        <SelectItem value="rolo">Rolo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descrição detalhada do insumo..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddSupplyOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddSupply}>
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
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalItems()}</p>
                <p className="text-sm text-gray-600">Total de Insumos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{getLowStockCount()}</p>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">R$ {getTotalStockValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-gray-600">Valor do Estoque</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{purchasePredictions.length}</p>
                <p className="text-sm text-gray-600">Compras Sugeridas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="supplies">Insumos</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="predictions">Previsão de Compras</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="supplies" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar insumos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low_stock">Estoque Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Supplies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSupplies.map((supply) => {
              const status = getStockStatus(supply);
              return (
                <Card key={supply.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{supply.name}</h3>
                        <p className="text-sm text-gray-600">{supply.sku}</p>
                      </div>
                      <Badge className={`${status.color} text-xs ml-2`}>
                        {status.text}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Estoque Atual</span>
                        <span className="font-semibold">{supply.currentStock} {supply.unit}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Nível do Estoque</span>
                          <span>{Math.round(getStockLevel(supply))}%</span>
                        </div>
                        <Progress value={getStockLevel(supply)} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mínimo</span>
                        <span className="font-semibold">{supply.minimumStock} {supply.unit}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Preço Unit.</span>
                        <span className="font-semibold">R$ {supply.unitPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Categoria</span>
                        <span className="font-semibold">{getCategoryName(supply.categoryId)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Valor Total</span>
                        <span className="font-semibold">R$ {(supply.currentStock * supply.unitPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <div className="grid gap-4">
            {movements.map((movement) => {
              const supply = supplies.find(s => s.id === movement.supplyId);
              return (
                <Card key={movement.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{supply?.name}</h3>
                          <Badge className={getMovementTypeColor(movement.type)}>
                            {getMovementTypeText(movement.type)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{movement.reason}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">SKU:</span> {supply?.sku}
                          </div>
                          <div>
                            <span className="font-medium">Quantidade:</span> {movement.quantity > 0 ? '+' : ''}{movement.quantity} {supply?.unit}
                          </div>
                          {movement.unitPrice && (
                            <div>
                              <span className="font-medium">Preço Unit.:</span> R$ {movement.unitPrice.toFixed(2)}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Data:</span> {movement.createdAt.toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      {movement.totalValue && (
                        <div className="text-right">
                          <p className="text-lg font-bold">R$ {movement.totalValue.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Previsão Inteligente de Compras</CardTitle>
              <CardDescription>
                Baseado no consumo e estoque atual, aqui estão as sugestões de compra prioritárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchasePredictions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold mb-2">Nenhuma compra necessária</p>
                  <p>Todos os insumos estão com estoque adequado.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchasePredictions.map((prediction, index) => (
                    <Card key={prediction.supply.id} className={`${prediction.daysToStockOut <= 3 ? 'border-red-200 bg-red-50' : prediction.daysToStockOut <= 7 ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{prediction.supply.name}</h3>
                              <Badge variant={prediction.daysToStockOut <= 3 ? "destructive" : prediction.daysToStockOut <= 7 ? "secondary" : "default"}>
                                {prediction.daysToStockOut === 0 ? "Urgente" : `${prediction.daysToStockOut} dias`}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Estoque atual:</span>
                                <p className="font-semibold">{prediction.supply.currentStock} {prediction.supply.unit}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Sugerido comprar:</span>
                                <p className="font-semibold">{prediction.suggestedQuantity} {prediction.supply.unit}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Custo estimado:</span>
                                <p className="font-semibold">R$ {prediction.estimatedCost.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Fornecedor:</span>
                                <p className="font-semibold">{getSupplierName(prediction.supply.supplierId)}</p>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" className="ml-4">
                            Gerar Pedido
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-blue-900">Resumo da Compra Sugerida</h3>
                        <p className="text-sm text-blue-700">
                          {purchasePredictions.length} itens necessários
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">
                          Total: R$ {purchasePredictions.reduce((sum, p) => sum + p.estimatedCost, 0).toFixed(2)}
                        </p>
                        <Button className="mt-2">
                          Criar Pedido de Compra
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categorySupplies = supplies.filter(s => s.categoryId === category.id && s.isActive);
              const totalValue = categorySupplies.reduce((sum, s) => sum + (s.currentStock * s.unitPrice), 0);
              const lowStockItems = categorySupplies.filter(s => s.currentStock <= s.minimumStock).length;
              
              return (
                <Card key={category.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Itens</span>
                        <span className="font-semibold">{categorySupplies.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Total</span>
                        <span className="font-semibold">R$ {totalValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estoque Baixo</span>
                        <span className={`font-semibold ${lowStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {lowStockItems}
                        </span>
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