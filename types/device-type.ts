export interface DeviceType {
    id: string;
    code: string;
    name: string;
    description?: string;
    default_spec?: string; // Serialized JSON string e.g. '{"max_load":500,"max_speed":1.5}'
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
    updated_by?: string;
}

export interface DeviceTypeResponse {
    success: boolean;
    elements?: DeviceType[];
    rows?: DeviceType[];
    data?: DeviceType[];
    total?: number;
    error?: string;
}

export interface DeviceTypeFormData {
    code: string;
    name: string;
    description?: string;
    max_load?: number;
    max_speed?: number;
}
