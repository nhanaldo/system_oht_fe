export interface Category {
    id: string;
    code: string;
    name: string;
    warehouse_id: string;
    description?: string;
    banana_variety?: string;
    market?: string;
    created_at?: string;
    updated_at?: string;
    is_deleted?: boolean;
    created_by?: string;
    updated_by?: string;
}

export interface CategoryResponse {
    elements?: Category[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface CategoriesTableProps {
    raw: Category[];
    warehouseId: string;
}

export interface ModalAddCategoriesProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingRecord?: Category | null;
    warehouseId: string;
    existingCategories?: Category[];
}

export interface CategoryInputData {
    name: string;
    code: string;
    description?: string;
    banana_variety?: string;
    market?: string;
}
