
import { serverFetch } from "@/lib/serverFetch";

export async function getCachedMenuSideBar(token: string, isAdmin: boolean = false) {

    //     const data = await serverFetch<any>(
    //         "authorization/me",
    //         {
    //             method: "GET",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: `Bearer ${token}`,
    //             },
    //             cache: "no-store",
    //         }
    //     );
    //     return data?.menus || [];
    // } catch (error) {
    //     console.error("Error fetching menu in getCachedMenuSideBar:", error);
    //     return [];
    // }

}