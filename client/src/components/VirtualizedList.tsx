import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useOptimizedSearch } from '@/hooks/useDebounce';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  searchFields?: (keyof T)[];
  itemsPerPage?: number;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export default function VirtualizedList<T>({
  data,
  renderItem,
  searchFields = [],
  itemsPerPage = 12,
  placeholder = "Buscar...",
  emptyMessage = "Nenhum item encontrado",
  className = ""
}: VirtualizedListProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { debouncedSearch, isSearching } = useOptimizedSearch(searchTerm, 300);

  // Filtrar dados com base na busca
  const filteredData = useMemo(() => {
    if (!debouncedSearch || searchFields.length === 0) {
      return data;
    }

    return data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedSearch.toLowerCase());
        }
        return String(value).toLowerCase().includes(debouncedSearch.toLowerCase());
      })
    );
  }, [data, debouncedSearch, searchFields]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageJump = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de busca */}
      {searchFields.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}

      {/* Informações da lista */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length} itens
        </span>
        {filteredData.length > itemsPerPage && (
          <span>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      {/* Lista de itens */}
      <div className="space-y-2">
        {currentData.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-gray-500">{emptyMessage}</p>
            </CardContent>
          </Card>
        ) : (
          currentData.map((item, index) => (
            <div key={startIndex + index}>
              {renderItem(item)}
            </div>
          ))
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Páginas */}
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageJump(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}