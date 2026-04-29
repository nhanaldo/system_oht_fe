export interface LoginParams {
    account: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    userInfo: {
        id: string;
        name: string;
        avatar: string | null;
        roleId: number;
        deletedAt: string | null;
    };
}