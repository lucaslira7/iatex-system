export interface Fabric {
    id: number;
    name: string;
    type: string;
    composition: string;
    gramWeight: number;
    usableWidth: number;
    pricePerKg: number;
    pricePerMeter: number;
    currentStock: number;
    yieldEstimate: number;
    supplierId: number;
    imageUrl?: string;
    status: 'available' | 'low_stock' | 'out_of_stock';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface FabricFormData {
    name: string;
    type: string;
    composition: string;
    gramWeight: number;
    usableWidth: number;
    pricePerKg: number;
    supplierId?: number;
    imageUrl?: string;
}

export interface FabricFilters {
    type?: string;
    status?: string;
    supplierId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
} 