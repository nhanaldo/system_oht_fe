'use server';

import { api } from '@/app/(app)/actions/api';
import { WorkflowResponse } from '@/types/workflow';
import { revalidateTag } from 'next/cache';

/**
 * Lấy danh sách quy trình theo ID kho
 * @param warehouseId ID của kho
 */
export async function getWorkflows(warehouseId: string) {
    try {
        const url = `/warehouse/${warehouseId}/workflow`;

        const data = await api<WorkflowResponse>(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['workflows']
            }
        });

        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tải danh sách quy trình' };
    }
}

/**
 * Cập nhật trạng thái quy trình
 * @param warehouseId ID của kho
 * @param id ID của quy trình
 * @param isActive Trạng thái mới
 */
export async function updateWorkflowStatus(warehouseId: string, id: string, isActive: boolean) {
    try {
        const url = `/warehouse/${warehouseId}/workflow/${id}`;

        const data = await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_active: isActive }),
        });

        revalidateTag('workflows', 'max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể cập nhật trạng thái quy trình' };
    }
}

/**
 * Xóa quy trình
 * @param warehouseId ID của kho
 * @param id ID của quy trình
 */
export async function deleteWorkflow(warehouseId: string, id: string) {
    try {
        const url = `/warehouse/${warehouseId}/workflow/${id}`;

        await api(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        revalidateTag('workflows', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể xóa quy trình' };
    }
}

/**
 * Tạo mới quy trình
 * @param warehouseId ID của kho
 * @param data Dữ liệu quy trình
 */
export async function createWorkflow(warehouseId: string, data: { name: string, code: string, description?: string }) {
    try {
        const url = `/warehouse/${warehouseId}/workflow`;

        await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        revalidateTag('workflows', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tạo mới quy trình' };
    }
}

/**
 * Cập nhật thông tin quy trình
 * @param warehouseId ID của kho
 * @param id ID của quy trình
 * @param data Dữ liệu cập nhật
 */
export async function updateWorkflow(warehouseId: string, id: string, data: { name: string, code: string, description?: string }) {
    try {
        const url = `/warehouse/${warehouseId}/workflow/${id}`;

        await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        revalidateTag('workflows', 'max');
        return { success: true };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể cập nhật quy trình' };
    }
}

/**
 * Lấy danh sách các bước của một quy trình
 * @param warehouseId ID của kho
 * @param workflowId ID của quy trình
 */
export async function getWorkflowSteps(warehouseId: string, workflowId: string) {
    try {
        const url = `/warehouse/${warehouseId}/workflow-step/workflow/${workflowId}`;

        const data = await api<any>(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['workflow-steps']
            }
        });
        revalidateTag('workflow-steps', 'max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tải danh sách các bước' };
    }
}

/**
 * Lấy danh sách loại thiết bị
 */
export async function getDeviceTypes() {
    try {
        const url = `/device-types`;

        const data = await api<any>(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
                tags: ['device-types']
            }
        });
        revalidateTag('device-types', 'max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tải danh sách loại thiết bị' };
    }
}

/**
 * Tạo mới bước quy trình
 * @param warehouseId ID của kho
 * @param workflowId ID của quy trình
 * @param data Dữ liệu bước
 */
export async function createWorkflowStep(warehouseId: string, workflowId: string, data: { device_type_id: string; workflow_step_name: string; action_type: string; default_params?: any; step_order: number; }) {
    try {
        const url = `/warehouse/${warehouseId}/workflow-step/workflow/${workflowId}`;

        const res = await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        revalidateTag('workflow-steps', 'max');
        return { success: true, data: res };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể tạo mới bước quy trình' };
    }
}

/**
 * Sắp xếp lại thứ tự các bước quy trình
 * @param warehouseId ID của kho
 * @param workflowId ID của quy trình
 * @param steps Payload danh sách các bước có vị trí mới
 */
export async function reorderWorkflowSteps(
    warehouseId: string,
    workflowId: string,
    steps: { step_id: string; step_order: number; }[]
) {
    try {
        const url = `/warehouse/${warehouseId}/workflow-step/workflow/${workflowId}/reorder`;

        const res = await api(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ steps }),
        });

        revalidateTag('workflow-steps', 'max');
        return { success: true, data: res };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Không thể sắp xếp lại thứ tự các bước' };
    }
}
