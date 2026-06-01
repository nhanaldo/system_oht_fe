'use server';

import { api } from '@/app/(app)/actions/api';
import { Category, CategoryResponse, CategoryInputData } from '@/types/category';
import { revalidateTag } from 'next/cache';

/**
 * Lấy danh sách phân cấp (Category) theo ID kho
 * @param warehouseId ID của kho
 */
export async function getCategories(warehouseId: string) {
    try {
        const url = `/warehouse/${warehouseId}/category`;

        const data = await api<CategoryResponse>(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['categories']
            }
        });

        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tải danh sách phân cấp' };
    }
}

/**
 * Tạo mới phân cấp (Category)
 * @param warehouseId ID của kho
 * @param data Dữ liệu phân cấp
 */
export async function createCategory(
    warehouseId: string,
    data: CategoryInputData
) {
    try {
        const url = `/warehouse/${warehouseId}/category`;

        await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        revalidateTag('categories', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tạo mới phân cấp' };
    }
}

/**
 * Cập nhật thông tin phân cấp (Category)
 * @param warehouseId ID của kho
 * @param id ID của phân cấp
 * @param data Dữ liệu cập nhật
 */
export async function updateCategory(
    warehouseId: string,
    id: string,
    data: CategoryInputData
) {
    try {
        const url = `/warehouse/${warehouseId}/category/${id}`;

        await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        revalidateTag('categories', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể cập nhật phân cấp' };
    }
}

/**
 * Xóa phân cấp (Category)
 * @param warehouseId ID của kho
 * @param id ID của phân cấp
 */
export async function deleteCategory(warehouseId: string, id: string) {
    try {
        const url = `/warehouse/${warehouseId}/category/${id}`;

        await api(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        revalidateTag('categories', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể xóa phân cấp' };
    }
}
