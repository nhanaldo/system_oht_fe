export interface ProductItem {
    id: string;
    code: string;
    name: string;
    warehouse_id: string;
    qr_code: string;
    description: string;
    weight: number;
    status: number;
    unit_of_measure_id: string;
    category_id: string;
    is_active: boolean;
    method_id?: string;
}

export interface ProductTableProps {
    warehouseId: string;
    categoryOptions: { label: string; value: string }[];
    uomOptions: { label: string; value: string }[];
    methodOptions: { label: string; value: string; code?: string }[];
    raw?: ProductItem[];
}

export interface ModalAddProductProps {
    open: boolean;
    onClose: () => void;
    warehouseId: string;
    categoryOptions: { label: string; value: string }[];
    uomOptions: { label: string; value: string }[];
    methodOptions: { label: string; value: string; code?: string }[];
    editingRecord?: any;
    onSuccess: () => void;
    existingProducts?: any[];
}
