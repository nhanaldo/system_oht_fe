
import { serverFetch } from "@/lib/serverFetch";
import { unstable_cache } from "next/cache";

export function getCachedMenuSideBar(token: string) {
    return unstable_cache(
        async () => {
            const data = await serverFetch<any[]>(
                "/menu/side-bar",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            return data || [];
        },
        ["layout-menu-sidebar", token],
        { tags: ["layout-menu"] }
    )();
}