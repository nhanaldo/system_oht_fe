import { getCurrentAccountProfile } from "@/app/(app)/system/accounts/accountAction";
import { getWorkflows } from "../workflowsAction";
import { Workflow } from "@/types/workflow";
import WorkflowsTable from "./WorkflowsTable";
import { cookies } from "next/headers";

export default async function WorkflowContent() {
    // 1. Lấy thông tin profile để có warehouseId
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

    // 2. sử dụng hàm cookies() của Next.js để truy cập vào bộ nhớ cookie của trình duyệt.
    // Nó tìm kiếm giá trị có tên là "selectedWarehouseId" (đây là ID của kho mà người dùng đã chọn từ Header trước đó và được lưu lại).
    const cookieStore = await cookies();
    const savedWarehouseId = cookieStore.get("selectedWarehouseId")?.value;

    // iểm tra xem savedWarehouseId có tồn tại không VÀ nó có nằm trong danh sách các kho mà tài khoản này được phép truy cập hay không
    const activeWarehouseId = (savedWarehouseId && warehouseIds.includes(savedWarehouseId))
        ? savedWarehouseId
        : warehouseIds[0];

    // 3. Lấy danh sách quy trình theo activeWarehouseId
    const workflowsRes: any = await getWorkflows(activeWarehouseId);

    if (workflowsRes && workflowsRes.success === false) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {workflowsRes.error || "Không thể tải danh sách quy trình"}
            </div>
        );
    }

    const workflows: Workflow[] = Array.isArray(workflowsRes.data)
        ? workflowsRes.data
        : (workflowsRes.data?.elements || workflowsRes.data?.rows || []);

    return (
        <div className="h-full flex flex-col">
            <WorkflowsTable raw={workflows} warehouseId={activeWarehouseId} />
        </div>
    );
}