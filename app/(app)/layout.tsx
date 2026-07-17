import AppLayoutComponents from "./components/AppLayoutComponents";
import { cookies } from "next/headers";
// import { getCachedMenuSideBar } from "@/lib/data/cached-layout";
import { redirect } from "next/navigation";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppLayoutComponents>
            {children}
        </AppLayoutComponents>
    );
}