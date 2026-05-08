export interface Role {
    id?: string;
    name?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface RoleFilterParams {
    page?: number;
    limit?: number;
    sort?: string;
    name?: string;
    search?: string;
}

export interface RoleResponse {
    elements?: Role[];
    total?: number;
    page?: number;
    limit?: number;
}
export interface RoleAddParams {
    name: string;
    description?: string;
}