import { getCurrentAccountProfile } from "@/app/(app)/system/accounts/accountAction";
import { getContainers } from "../containersAction";
import { Container } from "@/types/container";
import ContainersTable from "./ContainersTable";
import { cookies } from "next/headers";

export default async function ContainersContent() {
    // 1. Lấy thông tin profile tài khoản hiện tại để có danh sách ID kho được phép truy cập
    const profileRes: any = await getCurrentAccountProfile();


    if (profileRes && profileRes.success === false) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {profileRes.error || "Không thể tải thông tin tài khoản"}
            </div>
        );
    }

    const profile = profileRes?.elements || profileRes?.data || profileRes;
    const warehouseIds = profile?.warehouse_ids || [];

    if (warehouseIds.length === 0) {
        return (
            <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
                Tài khoản chưa được gán kho nào.
            </div>
        );
    }

    // 2. Lấy selectedWarehouseId từ cookies của trình duyệt
    const cookieStore = await cookies();
    const savedWarehouseId = cookieStore.get("selectedWarehouseId")?.value;

    // 3. Xác định activeWarehouseId hợp lệ
    const activeWarehouseId = (savedWarehouseId && warehouseIds.includes(savedWarehouseId))
        ? savedWarehouseId
        : warehouseIds[0];

    // 4. Lấy danh sách thùng (containers) theo activeWarehouseId
    const containersRes: any = await getContainers(activeWarehouseId);
    if (containersRes && containersRes.success === false) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {containersRes.error || "Không thể tải danh sách loại thùng"}
            </div>
        );
    }

    const containers: Container[] = Array.isArray(containersRes.data)
        ? containersRes.data
        : (containersRes.data?.elements || containersRes.data?.rows || []);

    return (
        <div className="h-full flex flex-col">
            <ContainersTable raw={containers} warehouseId={activeWarehouseId} />
        </div>
    );
}