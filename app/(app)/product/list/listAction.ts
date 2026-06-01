'use server';

import { api } from '@/app/(app)/actions/api';
import { revalidateTag } from 'next/cache';

/**
 * Lấy danh sách sản phẩm theo ID kho
 * @param warehouseId ID của kho
 * @param params Tham số tìm kiếm, phân trang
 */
export async function getProducts(
    warehouseId: string,
    params?: { search?: string; page?: number; limit?: number; category_id?: string }
) {
    try {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.page != null) query.set('page', String(params.page));
        if (params?.category_id) query.set('category_id', params.category_id);

        const url = query.toString()
            ? `/warehouse/${warehouseId}/product?${query.toString()}`
            : `/warehouse/${warehouseId}/product`;

        const data = await api<any>(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                tags: ['products'],
                revalidate: 0,
            }
        });

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error?.message || 'Không thể tải danh sách sản phẩm' };
    }
}

/**
 * Cập nhật trạng thái sử dụng của sản phẩm
 * @param warehouseId ID của kho
 * @param id ID của sản phẩm
 * @param isActive Trạng thái hoạt động
 */
export async function updateProductStatus(warehouseId: string, id: string, isActive: boolean) {
    try {
        const url = `/warehouse/${warehouseId}/product/${id}`;

        const data = await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_active: isActive }),
        });

        revalidateTag('products', 'max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể cập nhật trạng thái sản phẩm' };
    }
}

/**
 * Xóa sản phẩm
 * @param warehouseId ID của kho
 * @param id ID của sản phẩm
 */
export async function deleteProduct(warehouseId: string, id: string) {
    try {
        const url = `/warehouse/${warehouseId}/product/${id}`;

        await api(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        revalidateTag('products', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể xóa sản phẩm' };
    }
}

/**
 * Tạo mới sản phẩm
 * @param warehouseId ID của kho
 * @param data Dữ liệu sản phẩm mới
 */
export async function createProduct(warehouseId: string, data: any) {
    try {
        const url = `/warehouse/${warehouseId}/product`;

        const res = await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        console.log("res", res);
        revalidateTag('products', 'max');
        return { success: true, data: res };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tạo mới sản phẩm' };
    }
}

/**
 * Cập nhật thông tin chi tiết sản phẩm
 * @param warehouseId ID của kho
 * @param id ID của sản phẩm
 * @param data Dữ liệu cập nhật
 */
export async function updateProduct(warehouseId: string, id: string, data: any) {
    try {
        const url = `/warehouse/${warehouseId}/product/${id}`;

        const res = await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        revalidateTag('products', 'max');
        return { success: true, data: res };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể cập nhật sản phẩm' };
    }
}

/**
 * Lấy danh sách phương pháp quản lý / quy cách (Method)
 */
export async function getMethods() {
    try {
        const data = await api('/method?page=1&limit=100', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['methods']
            }
        });

        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tải danh sách phương pháp' };
    }
}
