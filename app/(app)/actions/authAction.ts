'use server';


import { cookies } from 'next/headers';
import { serverFetch } from '@/lib/serverFetch';
import { LoginParams, LoginResponse } from '@/types/auth';

export async function loginAction(credentials: LoginParams) {
    try {
        // Gửi body (credentials) lên serverFetch để gọi API
        // Tuỳ thuộc vào backend của bạn, endpoint có thể là '/login' hoặc '/auth/login'
        const data = await serverFetch<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        console.log("Login response data:", data);

        // Giả sử API trả về accessToken trong object data  
        if (data && data.accessToken) {
            const cookieStore = await cookies();
            cookieStore.set("accessToken", data.accessToken, {
                httpOnly: true,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7 // 1 tuần
            });

            return { success: true, data };
        }

        return { success: false, error: 'Đăng nhập thất bại. Không nhận được token.' };
    } catch (error: any) {
        console.error("Login action error:", error);

        // Trích xuất message lỗi từ backend (nếu có)
        const errorMessage = error?.data?.message || error?.statusText || 'Tên đăng nhập hoặc mật khẩu không chính xác.';

        return {
            success: false,
            error: errorMessage
        };
    }
}
