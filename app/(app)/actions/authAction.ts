'use server';


import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/serverFetch';
import { LoginParams, LoginResponse } from '@/types/auth';

export async function loginAction(credentials: LoginParams) {
    try {
        const payload = {
            username: credentials.username,
            password: credentials.password
        };

        const data = await serverFetch<LoginResponse>('authorization', {
            method: 'POST',
            body: JSON.stringify(payload)
        });


        // Lấy token chuẩn từ cấu trúc LoginResponse mới
        const token = data?.elements?.token;

        if (token) {
            const cookieStore = await cookies();
            cookieStore.set("accessToken", token, {
                httpOnly: true,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7 // 1 tuần
            });

            const username = data?.elements?.account?.username || credentials.username;
            cookieStore.set("username", username, {
                httpOnly: false,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7
            });

            // Lưu code tài khoản để xác định role (ADM... = admin)
            const accountCode = data?.elements?.account?.code || "";
            cookieStore.set("accountCode", accountCode, {
                httpOnly: false,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7
            });

            // Lưu accountId để lấy thông tin cá nhân chính xác
            const accountId = data?.elements?.account?.id || "";
            cookieStore.set("accountId", accountId, {
                httpOnly: false,
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7
            });

            return { success: true, data };
        }

        return { success: false, error: 'Đăng nhập thất bại. Không nhận được token.' };
    } catch (error: any) {
        console.error("Login action error:", error);

        // Trích xuất message lỗi từ backend (nếu có)
        const errorMessage = error?.data?.message || error?.statusText || 'Kết nối server thất bại :((. Vui lòng thử lại sau).';

        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("username");
    cookieStore.delete("accountCode");
    cookieStore.delete("accountId");

    redirect("/login");
}


// lưu id của warehouse vào cookie
export async function setWarehouseIdAction(warehouseId: string) {
    const cookieStore = await cookies();
    cookieStore.set("selectedWarehouseId", warehouseId, {
        httpOnly: false,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7
    });
}
