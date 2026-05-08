export interface Account {
    id?: string;
    code?: string;
    username?: string;
    email?: string;
    name?: string;
    avatar?: string;
    role?: string;
    warehouse?: string;
    role_names?: string[];
    warehouse_ids?: string[];
    warehouse_names?: string[];
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
}

export interface AccountFilterParams {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
}

export interface AccountResponse {
    elements?: Account[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface AccountAddParams {
    code?: string;
    username: string;
    email: string;
    name: string;
    password?: string;
    avatar?: string;
}
