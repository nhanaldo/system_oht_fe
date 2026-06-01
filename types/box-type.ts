export interface BoxType {
    id: string;
    name: string;
    dimensions: string;
    tare_weight: number;
    material: string;
    unit_of_measure_id: string;
    warehouse_id: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
    updated_by?: string;
}

export interface BoxTypeResponse {
    success: boolean;
    elements?: BoxType[];
    rows?: BoxType[];
    data?: BoxType[];
}

export interface BoxTypeTableProps {
    raw: BoxType[];
    warehouseId: string;
}

export interface ModalAddBoxTypeProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingRecord?: BoxType | null;
    warehouseId: string;
    existingBoxTypes?: BoxType[];
}

export interface BoxTypeFormData {
    name: string;
    dimensions: any;
    tare_weight: any;
    material: string;
    unit_of_measure_id: string;
}

export interface BoxTypeInputData {
    name: string;
    dimensions: string;
    tare_weight: number;
    material: string;
    unit_of_measure_id?: string;
}
