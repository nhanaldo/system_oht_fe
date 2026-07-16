import AppLayoutComponents from "./components/AppLayoutComponents";
import { cookies } from "next/headers";
// import { getCachedMenuSideBar } from "@/lib/data/cached-layout";
import { redirect } from "next/navigation";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // const cookieStore = await cookies();
    // const token = cookieStore.get("accessToken")?.value || "";
    // const username = cookieStore.get("username")?.value || "Admin";
    // const accountCode = cookieStore.get("accountCode")?.value || "";
    // const isAdmin = accountCode.toUpperCase().startsWith("ADM");
    // // 1. Nếu không có token -> đá về trang login
    // if (!token) {
    //     redirect("/login");
    // }

    // let menuData = [];
    // try {
    //     menuData = await getCachedMenuSideBar(token, isAdmin);
    // } catch (error: any) {
    //     console.error("Error fetching sidebar menu:", error);
    //     // Token hết hạn hoặc không hợp lệ → đá về login
    //     if (error?.status === 401 || error?.status === 403) {
    //         redirect("/login");
    //     }
    // }

    return (
        <AppLayoutComponents>
            {children}
        </AppLayoutComponents>
    );
}