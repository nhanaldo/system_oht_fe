import { Account } from "@/types/account";
import AccountTable from "./AccountTable";
import { getAccount, getWarehouses } from "../accountAction";
import { getRole } from "../../roles/roleAction";

export default async function AccountContent() {
    const response: any = await getAccount({
        page: 1,
        limit: 20,
    });

    const rolesRes: any = await getRole({
        page: 1,
        limit: 100,
    });

    const warehousesRes: any = await getWarehouses();

    const roles = Array.isArray(rolesRes)
        ? rolesRes
        : (rolesRes?.elements || rolesRes?.rows || rolesRes?.data || []);

    const roleOptions = roles.map((r: any) => ({
        label: r.name,
        value: r.id,
    }));

    const warehouses = Array.isArray(warehousesRes)
        ? warehousesRes
        : (warehousesRes?.elements || warehousesRes?.rows || warehousesRes?.data || []);

    const warehouseOptions = warehouses.map((w: any) => ({
        label: w.name,
        value: w.id,
    }));

    if (response && response.success === false) {
        return (
            <div className="flex flex-col h-full min-h-0 bg-white rounded-[20px] min-h-full">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Quản lý tài khoản</h2>
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                        {response.error || "Đã xảy ra lỗi khi tải dữ liệu"}
                    </div>
                </div>
            </div>
        );
    }

    const accounts: Account[] = Array.isArray(response)
        ? response
        : (response?.elements || response?.rows || response?.data || []);

    return (
        <div className="h-full flex flex-col">
            <AccountTable raw={accounts} roleOptions={roleOptions} warehouseOptions={warehouseOptions} />
        </div>
    );
}
