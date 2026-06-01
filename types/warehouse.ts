export interface Warehouse {
    id: string;
    code: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'NEW' | string;
    number_floor?: number;
    row?: number;
    column?: number;
    total_position?: number;
    config?: Record<string, any>;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
    number_tower?: number;
}

export interface WarehouseResponse {
    success: boolean;
    data: Warehouse[];
    error?: string;
}

export interface Tower {
    id: string;
    warehouse_id: string;
    code: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | string;
    row_index?: number;
    col_index?: number;
    floor_index?: number;
    created_at?: string;
    updated_at?: string;
    tower_type?: string;
    tower_order?: number;
    is_active?: boolean;
    is_deleted?: boolean;
    created_by?: string;
    updated_by?: string;
}

export interface WarehouseFloor {
    id: string;
    warehouse_id: string;
    code: string;
    name: string;
    floor_number: number;
    status?: string;
    is_active?: boolean;
    is_deleted?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface TowerFloor {
    id: string;
    warehouse_id: string;
    tower_id: string;
    warehouse_floor_id: string;
    name: string;
    status?: string;
    is_active?: boolean;
    is_deleted?: boolean;
    config?: {
        positions?: string[];
        devices?: Array<{
            id: string;
            name: string;
            type: string;
            roles: ('INBOUND' | 'OUTBOUND' | 'ALL' | string)[];
        }>;
    };
    created_at?: string;
    updated_at?: string;
}


