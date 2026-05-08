export interface LoginParams {
    username: string;
    password: string;
}

export interface LoginResponse {
    status: string;
    message: string;
    elements: {
        account: {
            id: string;
            code: string;
            username: string;
            email: string;
            name: string;
            avatar: string | null;
            is_active: boolean;
            created_at: string;
        };
        token: string;
    };
}