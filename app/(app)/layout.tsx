import AppLayoutComponents from "./components/AppLayoutComponents";

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