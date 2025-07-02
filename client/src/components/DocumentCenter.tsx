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
import { Separator } from "@/components/ui/separator";
import { FileText, Upload, Download, Eye, Trash2, Plus, Search, Image, Video, File, Copy, ExternalLink, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Document {
  id: number;
  name: string;
  description: string;
  type: 'pattern' | 'video' | 'image' | 'pdf' | 'spreadsheet';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  modelId?: number;
  orderId?: number;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
}

interface Model {
  id: number;
  name: string;
  reference: string;
  garmentType: string;
}

interface DocumentCategory {
  type: string;
  name: string;
  icon: any;
  color: string;
  count: number;
}

const mockModels: Model[] = [
  { id: 1, name: "Camisa Social Masculina", reference: "C-001", garmentType: "Camisa" },
  { id: 2, name: "Vestido Midi Floral", reference: "V-002", garmentType: "Vestido" },
  { id: 3, name: "Blusa Feminina Básica", reference: "BL-003", garmentType: "Blusa" },
  { id: 4, name: "Calça Jeans Skinny", reference: "CL-004", garmentType: "Calça" },
];

const mockDocuments: Document[] = [
  {
    id: 1,
    name: "Molde Camisa Social M",
    description: "Molde base para camisa social masculina tamanho M",
    type: "pattern",
    fileUrl: "/moldes/camisa-social-m.pdf",
    fileSize: 2048000,
    mimeType: "application/pdf",
    modelId: 1,
    userId: "user123",
    isPublic: false,
    createdAt: new Date("2025-07-01")
  },
  {
    id: 2,
    name: "Video Tutorial Costura Gola",
    description: "Tutorial passo a passo para costura da gola da camisa social",
    type: "video",
    fileUrl: "/videos/tutorial-gola.mp4",
    fileSize: 15728640,
    mimeType: "video/mp4",
    modelId: 1,
    userId: "user123",
    isPublic: true,
    createdAt: new Date("2025-07-01")
  },
  {
    id: 3,
    name: "Foto Final Vestido Midi",
    description: "Foto do produto final do vestido midi floral",
    type: "image",
    fileUrl: "/fotos/vestido-midi-final.jpg",
    fileSize: 512000,
    mimeType: "image/jpeg",
    modelId: 2,
    userId: "user123",
    isPublic: true,
    createdAt: new Date("2025-06-28")
  },
  {
    id: 4,
    name: "Ficha Técnica Blusa",
    description: "Ficha técnica completa da blusa feminina básica",
    type: "pdf",
    fileUrl: "/fichas/blusa-basica-ficha.pdf",
    fileSize: 1024000,
    mimeType: "application/pdf",
    modelId: 3,
    userId: "user123",
    isPublic: false,
    createdAt: new Date("2025-06-30")
  },
  {
    id: 5,
    name: "Planilha Consumo Tecido",
    description: "Planilha detalhada de consumo de tecido por tamanho",
    type: "spreadsheet",
    fileUrl: "/planilhas/consumo-tecido.xlsx",
    fileSize: 256000,
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    modelId: 1,
    userId: "user123",
    isPublic: false,
    createdAt: new Date("2025-07-02")
  },
  {
    id: 6,
    name: "Variações de Cor - Calça Jeans",
    description: "Imagens das diferentes variações de cor disponíveis",
    type: "image",
    fileUrl: "/fotos/calcas-cores.jpg",
    fileSize: 768000,
    mimeType: "image/jpeg",
    modelId: 4,
    userId: "user123",
    isPublic: true,
    createdAt: new Date("2025-06-25")
  }
];

export default function DocumentCenter() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [models, setModels] = useState<Model[]>(mockModels);
  const [activeTab, setActiveTab] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModel, setFilterModel] = useState("");
  const [filterType, setFilterType] = useState("");
  const { toast } = useToast();

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video': return <Video className="h-5 w-5 text-red-600" />;
      case 'image': return <Image className="h-5 w-5 text-green-600" />;
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
      case 'spreadsheet': return <File className="h-5 w-5 text-green-600" />;
      default: return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'pattern': return 'Molde';
      case 'video': return 'Vídeo';
      case 'image': return 'Imagem';
      case 'pdf': return 'PDF';
      case 'spreadsheet': return 'Planilha';
      default: return 'Arquivo';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'spreadsheet': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getModelName = (modelId?: number) => {
    if (!modelId) return "Geral";
    return models.find(m => m.id === modelId)?.reference || "N/A";
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = !filterModel || doc.modelId?.toString() === filterModel;
    const matchesType = !filterType || doc.type === filterType;
    
    return matchesSearch && matchesModel && matchesType;
  });

  const getDocumentCategories = (): DocumentCategory[] => {
    const categories = [
      { type: 'pattern', name: 'Moldes', icon: FileText, color: 'text-blue-600' },
      { type: 'video', name: 'Vídeos', icon: Video, color: 'text-red-600' },
      { type: 'image', name: 'Imagens', icon: Image, color: 'text-green-600' },
      { type: 'pdf', name: 'PDFs', icon: FileText, color: 'text-red-600' },
      { type: 'spreadsheet', name: 'Planilhas', icon: File, color: 'text-green-600' },
    ];

    return categories.map(cat => ({
      ...cat,
      count: documents.filter(doc => doc.type === cat.type).length
    }));
  };

  const handleUpload = () => {
    toast({
      title: "Arquivo Enviado",
      description: "Documento foi adicionado com sucesso à central.",
    });
    setIsUploadOpen(false);
  };

  const handleDownload = (document: Document) => {
    toast({
      title: "Download Iniciado",
      description: `Baixando ${document.name}...`,
    });
  };

  const handleView = (document: Document) => {
    toast({
      title: "Abrindo Documento",
      description: `Visualizando ${document.name}...`,
    });
  };

  const handleDelete = (document: Document) => {
    setDocuments(documents.filter(d => d.id !== document.id));
    toast({
      title: "Documento Excluído",
      description: `${document.name} foi removido da central.`,
    });
  };

  const handleDuplicate = (document: Document) => {
    const newDoc = {
      ...document,
      id: documents.length + 1,
      name: `Cópia de ${document.name}`,
      createdAt: new Date()
    };
    setDocuments([...documents, newDoc]);
    toast({
      title: "Documento Duplicado",
      description: `Cópia de ${document.name} criada com sucesso.`,
    });
  };

  const getModelDocuments = (modelId: number) => {
    return documents.filter(doc => doc.modelId === modelId);
  };

  const getTotalSize = () => {
    return documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  };

  const getPublicDocuments = () => {
    return documents.filter(doc => doc.isPublic).length;
  };

  const documentCategories = getDocumentCategories();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Folder className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Central de Documentos</h1>
            <p className="text-gray-600">Gerencie moldes, vídeos, imagens e documentos por modelo</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload de Documento</DialogTitle>
                <DialogDescription>
                  Adicione um novo documento à central
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Arquivo</Label>
                  <Input placeholder="Ex: Molde Camisa Social P" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pattern">Molde</SelectItem>
                      <SelectItem value="video">Vídeo Tutorial</SelectItem>
                      <SelectItem value="image">Imagem/Foto</SelectItem>
                      <SelectItem value="pdf">PDF/Ficha Técnica</SelectItem>
                      <SelectItem value="spreadsheet">Planilha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modelo Relacionado</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar modelo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Documento Geral</SelectItem>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.reference} - {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Arquivo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Clique para selecionar ou arraste o arquivo aqui</p>
                    <p className="text-xs text-gray-500 mt-1">Máximo: 50MB</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descrição do documento..." rows={3} />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="public" className="rounded" />
                  <Label htmlFor="public">Documento público (visível para clientes)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpload}>
                  Upload
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
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-gray-600">Total de Documentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getPublicDocuments()}</p>
                <p className="text-sm text-gray-600">Documentos Públicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Folder className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{models.length}</p>
                <p className="text-sm text-gray-600">Modelos com Docs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <File className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{formatFileSize(getTotalSize())}</p>
                <p className="text-sm text-gray-600">Espaço Utilizado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos Documentos</TabsTrigger>
          <TabsTrigger value="by-model">Por Modelo</TabsTrigger>
          <TabsTrigger value="by-type">Por Tipo</TabsTrigger>
          <TabsTrigger value="public">Documentos Públicos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar documentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterModel} onValueChange={setFilterModel}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os modelos</SelectItem>
                    {models.map(model => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.reference}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    <SelectItem value="pattern">Moldes</SelectItem>
                    <SelectItem value="video">Vídeos</SelectItem>
                    <SelectItem value="image">Imagens</SelectItem>
                    <SelectItem value="pdf">PDFs</SelectItem>
                    <SelectItem value="spreadsheet">Planilhas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getDocumentIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{document.name}</h3>
                      </div>
                    </div>
                    <Badge className={`${getDocumentTypeColor(document.type)} text-xs`}>
                      {getDocumentTypeText(document.type)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{document.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Modelo:</span>
                      <span className="font-semibold">{getModelName(document.modelId)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tamanho:</span>
                      <span className="font-semibold">{formatFileSize(document.fileSize)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Criado:</span>
                      <span className="font-semibold">{format(document.createdAt, 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Visibilidade:</span>
                      <Badge variant={document.isPublic ? "default" : "secondary"}>
                        {document.isPublic ? "Público" : "Privado"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(document)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(document)}>
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(document)}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(document)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-model" className="space-y-6">
          <div className="space-y-6">
            {models.map((model) => {
              const modelDocs = getModelDocuments(model.id);
              if (modelDocs.length === 0) return null;
              
              return (
                <Card key={model.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{model.reference} - {model.name}</span>
                      <Badge variant="outline">{modelDocs.length} documentos</Badge>
                    </CardTitle>
                    <CardDescription>{model.garmentType}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modelDocs.map((document) => (
                        <div key={document.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center space-x-2 mb-2">
                            {getDocumentIcon(document.type)}
                            <span className="font-semibold text-sm">{document.name}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{document.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</span>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => handleView(document)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDownload(document)}>
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="by-type" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentCategories.map((category) => {
              const CategoryIcon = category.icon;
              const categoryDocs = documents.filter(doc => doc.type === category.type);
              
              return (
                <Card key={category.type}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CategoryIcon className={`h-8 w-8 ${category.color}`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.count} documentos</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {categoryDocs.slice(0, 3).map((document) => (
                        <div key={document.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{document.name}</p>
                            <p className="text-xs text-gray-600">{getModelName(document.modelId)}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleView(document)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {categoryDocs.length > 3 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{categoryDocs.length - 3} mais
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="public" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.filter(doc => doc.isPublic).map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getDocumentIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{document.name}</h3>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Público
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{document.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Modelo:</span>
                      <span className="font-semibold">{getModelName(document.modelId)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-semibold">{getDocumentTypeText(document.type)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tamanho:</span>
                      <span className="font-semibold">{formatFileSize(document.fileSize)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleView(document)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(document)}>
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
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