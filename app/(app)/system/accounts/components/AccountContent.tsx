import { Account } from "@/types/account";
import AccountTable from "./AccountTable";
import { getAccount, getWarehouses } from "../accountAction";
import { getRole } from "../../roles/roleAction";

export default async function AccountContent() {
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

    return (
        <div className="h-full flex flex-col">
            <AccountTable roleOptions={roleOptions} warehouseOptions={warehouseOptions} />
        </div>
    );
}
