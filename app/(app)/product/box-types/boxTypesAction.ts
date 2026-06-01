'use server';

import { api } from '@/app/(app)/actions/api';
import { BoxType, BoxTypeResponse, BoxTypeInputData } from '@/types/box-type';
import { revalidateTag } from 'next/cache';

/**
 * Lấy danh sách loại thùng (BoxType) theo ID kho
 * @param warehouseId ID của kho
 */
export async function getBoxTypes(warehouseId: string) {
    try {
        const url = `/warehouse/${warehouseId}/box-type`;

        const data = await api<BoxTypeResponse>(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['box-types']
            }
        });

        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tải danh sách loại thùng' };
    }
}

/**
 * Tạo mới loại thùng (BoxType)
 * @param warehouseId ID của kho
 * @param data Dữ liệu loại thùng
 */
export async function createBoxType(
    warehouseId: string,
    data: BoxTypeInputData
) {
    try {
        const url = `/warehouse/${warehouseId}/box-type`;

        await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        revalidateTag('box-types', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tạo mới loại thùng' };
    }
}

/**
 * Cập nhật thông tin loại thùng (BoxType)
 * @param warehouseId ID của kho
 * @param id ID của loại thùng
 * @param data Dữ liệu cập nhật
 */
export async function updateBoxType(
    warehouseId: string,
    id: string,
    data: BoxTypeInputData
) {
    try {
        const url = `/warehouse/${warehouseId}/box-type/${id}`;

        await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        revalidateTag('box-types', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể cập nhật loại thùng' };
    }
}

/**
 * Xóa loại thùng (BoxType)
 * @param warehouseId ID của kho
 * @param id ID của loại thùng
 */
export async function deleteBoxType(warehouseId: string, id: string) {
    try {
        const url = `/warehouse/${warehouseId}/box-type/${id}`;

        await api(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        revalidateTag('box-types', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể xóa loại thùng' };
    }
}

/**
 * Lấy danh sách đơn vị tính (Unit of Measure)
 */
export async function getUnitOfMeasures() {// ?page=1&limit=100 vì BE đã cài tham số 

    try {
        const data = await api('/unit-of-measure?page=1&limit=100', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['unit-of-measures']
            }
        })

        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get unit of measures' };
    }
}

