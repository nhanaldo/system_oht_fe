export interface UnitType {
    code: string;
    id: string;
    name: string;
    description?: string;
    discripsion?: string; // Hỗ trợ cả 2 cách viết đề phòng BE trả về discripsion
    created_at?: string;
    updated_at?: string;
}

export interface UnitTypeResponse {
    elements?: UnitType[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface UnitTypesTableProps {
    raw: UnitType[];
}

export interface ModalAddUnitTypeProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingRecord?: UnitType | null;
    existingUnitTypes?: UnitType[];
}

export interface UnitTypeInputData {
    name: string;
    description?: string;
    code: string;
}
