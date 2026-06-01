import React from 'react';
import { cookies } from "next/headers";
import { getCurrentAccountProfile } from "@/app/(app)/system/accounts/accountAction";
import { getCategory } from "@/app/(app)/(warehouse)/warehouse/warehouseAcction";
import { getUnitOfMeasures } from "@/app/(app)/product/box-types/boxTypesAction";
import { getMethods, getProducts } from "../listAction";
import ProductTable from './ProductTable';

export default async function ListContent() {
    // 1. Lấy thông tin profile để có danh sách warehouseId được phân quyền
    const profileRes: any = await getCurrentAccountProfile();
    const profile = profileRes?.elements || profileRes?.data || profileRes;
    const warehouseIds = profile?.warehouse_ids || [];

    if (warehouseIds.length === 0) {
        return (
            <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
                Tài khoản chưa được gán kho nào.
            </div>
        );
    }

    // 2. Xác định activeWarehouseId từ cookie "selectedWarehouseId"
    const cookieStore = await cookies();
    const savedWarehouseId = cookieStore.get("selectedWarehouseId")?.value;
    const activeWarehouseId = (savedWarehouseId && warehouseIds.includes(savedWarehouseId))
        ? savedWarehouseId
        : warehouseIds[0];

    // 3. Tải danh mục sản phẩm (Phẩm cấp) cho bộ lọc
    const categoriesRes = await getCategory(activeWarehouseId);
    const categories = categoriesRes?.elements || categoriesRes?.data || categoriesRes?.rows || (Array.isArray(categoriesRes) ? categoriesRes : []);

    const categoryOptions = categories.map((c: any) => ({
        label: c.name || c.code,
        value: c.id
    }));

    // 4. Tải danh sách đơn vị tính (UOM)
    const uomsRes: any = await getUnitOfMeasures();
    const uoms = uomsRes.success ? (uomsRes.data?.elements || uomsRes.data?.rows || uomsRes.data || []) : [];
    const uomOptions = uoms.map((u: any) => ({
        label: u.name,
        value: u.id
    }));

    // 5. Tải danh sách phương pháp quản lý (Quy cách)
    const methodsRes: any = await getMethods();
    const methods = methodsRes.success ? (methodsRes.data?.elements || methodsRes.data?.rows || methodsRes.data || []) : [];
    const methodOptions = methods.map((m: any) => ({
        label: m.name || m.code,
        value: m.id,
        code: m.code
    }));

    // 6. Tải danh sách sản phẩm (raw data)
    const productsRes: any = await getProducts(activeWarehouseId, { page: 1, limit: 1000 }); // limit lớn để lấy hết như account
    const products = productsRes?.elements || productsRes?.data || productsRes?.rows || (Array.isArray(productsRes) ? productsRes : []);

    return (
        <ProductTable
            warehouseId={activeWarehouseId}
            categoryOptions={categoryOptions}
            uomOptions={uomOptions}
            methodOptions={methodOptions}
            raw={products}
        />
    );
}