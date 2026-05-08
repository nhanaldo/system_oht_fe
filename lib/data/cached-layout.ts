
import { serverFetch } from "@/lib/serverFetch";
import { unstable_cache } from "next/cache";

export function getCachedMenuSideBar(token: string, isAdmin: boolean = false) {
    // Cache key riêng biệt cho admin và user thường
    const roleKey = isAdmin ? "admin" : "user";

    return unstable_cache(
        async () => {
            const data = await serverFetch<any>(
                "authorization/me",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return data?.menus || [];
        },
        ["layout-menu-sidebar", roleKey, token],
        { tags: ["layout-menu", `layout-menu-${roleKey}`] }
    )();
}