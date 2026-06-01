import WorkflowTable from "./WorkflowTable";
import { getWarehouse } from "../warehouseAcction";

export default async function WorkflowContent() {
    try {
        const response: any = await getWarehouse({
            search: "",
            page: 1,
            limit: 1000
        });

        if (response && response.success === false) {
            return (
                <div className="flex flex-col bg-white rounded-[20px] p-6">
                    <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
                    <p className="text-sm text-red-700 mb-4">{response.error || "Đã xảy ra lỗi khi tải dữ liệu"}</p>
                </div>
            );
        }

        const warehouses = Array.isArray(response)
            ? response
            : (response?.elements || response?.rows || response?.data || []);

        return (
            <div className="h-full flex flex-col">
                <WorkflowTable raw={warehouses} />
            </div>
        );
    } catch (err: any) {
        if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
        console.error("Failed to load resources:", err);
        const message = err?.message || "Không thể tải dữ liệu tài nguyên";
        return (
            <div className="flex flex-col bg-white rounded-[20px] p-6">
                <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
                <p className="text-sm text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">Vui lòng thử làm mới trang hoặc liên hệ quản trị viên.</p>
            </div>
        );
    }
}
