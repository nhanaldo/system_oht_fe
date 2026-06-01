import { getUnitOfMeasures } from "../unit-typesAction";
import UnitTypesTable from "./UnitTypesTable";
import { UnitType } from "@/types/unit-type";

export default async function UnitTypesContent() {
    // 1. Gọi API lấy danh sách đơn vị tính
    const uomRes: any = await getUnitOfMeasures();

    if (uomRes && uomRes.success === false) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {uomRes.error || "Không thể tải danh sách đơn vị tính"}
            </div>
        );
    }

    const unitTypes: UnitType[] = Array.isArray(uomRes.data)
        ? uomRes.data
        : (uomRes.data?.elements || uomRes.data?.rows || []);

    return (
        <div className="h-full flex flex-col">
            <UnitTypesTable raw={unitTypes} />
        </div>
    );
}