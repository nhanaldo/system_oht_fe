import { log } from "console";
import { getRole } from "../roleAction";
import { Role } from "@/types/role";
import RoleTable from "./RoleTable";

export default async function RoleContent() {
    const response: any = await getRole({
        page: 1,
        limit: 20,
    });


    // Nếu action trả về object chứa lỗi { success: false, error: ... }
    if (response && response.success === false) {
        return (
            <div className="flex flex-col bg-white rounded-[20px] min-h-full">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Quản lý vai trò</h2>
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                        {response.error || "Đã xảy ra lỗi khi tải dữ liệu"}
                    </div>
                </div>
            </div>
        );
    }

    // Lấy data từ elements do API trả về
    const roles: Role[] = Array.isArray(response) ? response : (response?.elements || response?.rows || response?.data || []);

    return (
        <div className="flex flex-col bg-white rounded-[20px] min-h-full p-2">
            <RoleTable raw={roles} />
        </div>
    );
}