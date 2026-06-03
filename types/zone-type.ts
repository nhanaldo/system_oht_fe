export interface ZoneType {
    id: string;
    code: string;
    name: string;
    description?: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
    updated_by?: string;
}

export interface ZoneTypeResponse {
    success: boolean;
    elements?: ZoneType[];
    rows?: ZoneType[];
    data?: ZoneType[];
    total?: number;
    error?: string;
}

export interface ZoneTypeFormData {
    code: string;
    name: string;
    description?: string;
}
