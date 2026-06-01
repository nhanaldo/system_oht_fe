import { getCurrentAccountProfile } from "@/app/(app)/system/accounts/accountAction";
import { getBoxTypes } from "../boxTypesAction";
import { BoxType } from "@/types/box-type";
import BoxTypeTable from "@/app/(app)/product/box-types/components/BoxTypeTable";
import { cookies } from "next/headers";

export default async function BoxTypeContent() {
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

    // 4. Lấy danh sách loại thùng theo activeWarehouseId
    const boxTypesRes: any = await getBoxTypes(activeWarehouseId);

    if (boxTypesRes && boxTypesRes.success === false) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {boxTypesRes.error || "Không thể tải danh sách loại thùng"}
            </div>
        );
    }

    const boxTypes: BoxType[] = Array.isArray(boxTypesRes.data)
        ? boxTypesRes.data
        : (boxTypesRes.data?.elements || boxTypesRes.data?.rows || []);

    return (
        <div className="h-full flex flex-col">
            <BoxTypeTable raw={boxTypes} warehouseId={activeWarehouseId} />
        </div>
    );
}