import AppLayoutComponents from "./components/AppLayoutComponents";
import { cookies } from "next/headers";
import { getCachedMenuSideBar } from "@/lib/data/cached-layout";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value || "";
    
    let menuData = [];
    try {
        if (token) {
            menuData = await getCachedMenuSideBar(token);
        }
    } catch (error) {
        console.error("Error fetching sidebar menu:", error);
    }

    return (
        <AppLayoutComponents menuData={menuData}>
            {children}
        </AppLayoutComponents>
    );
}