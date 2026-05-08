import { cookies } from 'next/headers';
import { getAccountById, getAccount } from '../system/accounts/accountAction';
import AccountProfile from "./components/AccountProfile";

export default async function InfoUserPage() {
    const cookieStore = await cookies();
    const accountId = cookieStore.get("accountId")?.value || "";
    const username = cookieStore.get("username")?.value || "";

    let actualAccount = null;

    if (accountId) {
        const response: any = await getAccountById(accountId);
        actualAccount = response?.elements || response?.data || response;
    } else if (username) {
        const response: any = await getAccount({
            search: username,
            page: 1,
            limit: 10,
        });
        const accounts = Array.isArray(response)
            ? response
            : (response?.elements || response?.rows || response?.data || []);
        actualAccount = accounts.find((a: any) => a.username === username) || null;
    }

    return (
        <div className="w-full min-h-screen">
            <AccountProfile initialData={actualAccount} />
        </div>
    );
}