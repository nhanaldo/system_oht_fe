"use server";

import { redirect } from "next/navigation";
import { serverFetch } from "@/lib/serverFetch";
import { cookies } from "next/headers";

const AUTH_EXCLUDE = ["", "/auth/logout"];
// const isAuth = (url: string) => AUTH_EXCLUDE.some((p) => url.includes(p));
//sẽ trả về mã lỗi 401 Session expired or revoked
const isAuth = (url: string) => AUTH_EXCLUDE.some((p) => p !== "" && url.includes(p));
export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  try {
    const response = await serverFetch<T>(url, {
      ...options,
      headers: {
        ...(options?.headers || {}),
        ...(token || refreshToken
          ? { Authorization: `Bearer ${token || refreshToken}` }
          : {}),
      },
    });
    return response;
  } catch (e: any) {
    if ((e?.status === 401) && !isAuth(url)) {
      try {
        const cookieStore = await cookies();
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
        redirect("/login?reason=session_expired");
      } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
        //hệ thống lập tức bắt được mã lỗi 401 này và đá User ra trang login
        redirect("/login");
      }
    }
    throw e;
  }
}