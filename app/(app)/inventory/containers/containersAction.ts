'use server';

import { api } from '@/app/(app)/actions/api';
import { Container, ContainerResponse, ContainerInputData } from '@/types/container';
import { revalidateTag } from 'next/cache';

/**
 * Lấy danh sách thùng (Container) theo ID kho
 * @param warehouseId ID của kho
 */
export async function getContainers(warehouseId: string, params?: { limit?: number; page?: number; search?: string }) {
    try {
        const query = new URLSearchParams();
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.page != null) query.set('page', String(params.page));
        if (params?.search) query.set('search', params.search);

        const url = query.toString() ? `/warehouse/${warehouseId}/containers?${query.toString()}` : `/warehouse/${warehouseId}/containers`;

        const data = await api<ContainerResponse>(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['containers']
            }
        });
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tải danh sách loại thùng' };
    }
}

/**
 * Tạo mới loại thùng (Container)
 * @param warehouseId ID của kho
 * @param data Dữ liệu loại thùng
 */
export async function createContainer(
    warehouseId: string,
    data: ContainerInputData
) {
    try {
        const url = `/warehouse/${warehouseId}/containers`;

        await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        revalidateTag('containers', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tạo mới loại thùng' };
    }
}

/**
 * Cập nhật thông tin loại thùng (Container)
 * @param warehouseId ID của kho
 * @param id ID của thùng
 * @param data Dữ liệu cập nhật
 */
export async function updateContainer(
    warehouseId: string,
    id: string,
    data: ContainerInputData
) {
    try {
        const url = `/warehouse/${warehouseId}/containers/${id}`;

        await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        revalidateTag('containers', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể cập nhật loại thùng' };
    }
}

/**
 * Xóa loại thùng (Container)
 * @param warehouseId ID của kho
 * @param id ID của thùng
 */
export async function deleteContainer(warehouseId: string, id: string) {
    try {
        const url = `/warehouse/${warehouseId}/containers/${id}`;

        await api(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        revalidateTag('containers', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể xóa loại thùng' };
    }
}
