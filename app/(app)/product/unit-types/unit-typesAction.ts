'use server';

import { api } from '@/app/(app)/actions/api';
import { UnitTypeInputData } from '@/types/unit-type';
import { revalidateTag } from 'next/cache';

/**
 * Lấy danh sách đơn vị tính (Unit of Measure)
 */
export async function getUnitOfMeasures() {
    try {
        const data = await api<any>('/unit-of-measure?page=1&limit=100', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['unit-of-measures']
            }
        });

        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tải danh sách đơn vị tính' };
    }
}

/**
 * Tạo mới đơn vị tính
 */
export async function createUnitOfMeasure(data: UnitTypeInputData) {
    try {
        const url = '/unit-of-measure';

        await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        revalidateTag('unit-of-measures', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tạo mới đơn vị tính' };
    }
}

/**
 * Cập nhật đơn vị tính
 */
export async function updateUnitOfMeasure(id: string, data: UnitTypeInputData) {
    try {
        const url = `/unit-of-measure/${id}`;

        await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        revalidateTag('unit-of-measures', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể cập nhật đơn vị tính' };
    }
}

/**
 * Xóa đơn vị tính
 */
export async function deleteUnitOfMeasure(id: string) {
    try {
        const url = `/unit-of-measure/${id}`;

        await api(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        revalidateTag('unit-of-measures', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể xóa đơn vị tính' };
    }
}
