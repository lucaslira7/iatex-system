import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Wand2 } from "lucide-react";
import type { PricingTemplate } from "@shared/schema";

interface CopyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: PricingTemplate | null;
  onConfirm: (newName: string, newReference: string) => void;
  isLoading?: boolean;
}

export function CopyTemplateModal({ isOpen, onClose, template, onConfirm, isLoading = false }: CopyTemplateModalProps) {
  const [newName, setNewName] = useState('');
  const [newReference, setNewReference] = useState('');

  const generateReference = (name: string) => {
    if (!name) return '';
    
    const cleanName = name.toLowerCase().trim();
    let prefix = '';
    
    // Detectar tipo de peça pelo nome
    if (cleanName.includes('calça') || cleanName.includes('calca')) {
      prefix = 'CL';
    } else if (cleanName.includes('camisa') || cleanName.includes('blusa')) {
      prefix = 'C';
    } else if (cleanName.includes('top') || cleanName.includes('cropped')) {
      prefix = 'T';
    } else if (cleanName.includes('conjunto')) {
      prefix = 'CJ';
    } else if (cleanName.includes('vestido')) {
      prefix = 'V';
    } else if (cleanName.includes('short') || cleanName.includes('bermuda')) {
      prefix = 'S';
    } else if (cleanName.includes('saia')) {
      prefix = 'SK';
    } else {
      prefix = 'M'; // Modelo genérico
    }
    
    // Gerar número sequencial baseado no timestamp
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${timestamp}`;
  };

  const handleNameChange = (value: string) => {
    setNewName(value);
    if (value && !newReference) {
      setNewReference(generateReference(value));
    }
  };

  const handleGenerateReference = () => {
    if (newName) {
      setNewReference(generateReference(newName));
    }
  };

  const handleConfirm = () => {
    if (newName.trim() && newReference.trim()) {
      onConfirm(newName.trim(), newReference.trim());
      setNewName('');
      setNewReference('');
      onClose();
    }
  };

  const handleClose = () => {
    setNewName('');
    setNewReference('');
    onClose();
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-blue-600" />
            Copiar Modelo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Modelo original:</p>
            <p className="font-semibold">{template.modelName}</p>
            <p className="text-sm text-gray-500">REF: {template.reference}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Nome do novo modelo</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Digite o nome do novo modelo"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newReference" className="flex items-center gap-2">
                Nova referência
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleGenerateReference}
                  className="h-6 px-2 text-xs"
                  title="Gerar referência automaticamente"
                >
                  <Wand2 className="h-3 w-3" />
                </Button>
              </Label>
              <Input
                id="newReference"
                value={newReference}
                onChange={(e) => setNewReference(e.target.value)}
                placeholder="REF do novo modelo (ex: C-1234)"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Será gerada automaticamente baseada no nome, ou você pode personalizar
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              📋 Todos os dados do modelo original serão copiados, incluindo custos, tamanhos e configurações. 
              Você poderá editar tudo após a cópia.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!newName.trim() || !newReference.trim() || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              {isLoading ? "Carregando..." : "Criar Cópia"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}