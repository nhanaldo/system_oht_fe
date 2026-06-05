'use server';

import { revalidateTag } from 'next/cache';

import { api } from '@/app/(app)/actions/api';

export async function getJobs(params?: any) {
    try {
        const warehouseId = params?.warehouse_id;
        if (!warehouseId) {
            return { success: true, elements: [], total: 0 };
        }
        const queryParams = new URLSearchParams();
        if (params?.limit != null) queryParams.set('limit', String(params.limit));
        if (params?.page != null) queryParams.set('page', String(params.page));
        if (params?.job_type != null) queryParams.set('job_type', String(params.job_type));
        if (params?.status != null && params?.status !== '') queryParams.set('status', String(params.status));
        if (params?.search != null && params?.search !== '') queryParams.set('search', String(params.search));

        const url = queryParams.toString()
            ? `/warehouse/${warehouseId}/job?${queryParams.toString()}`
            : `/warehouse/${warehouseId}/job`;
        const data = await api(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                tags: ['job'],
                revalidate: 0,
            }
        });
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error?.message || 'Failed to get jobs' };
    }
}

export async function createInboundJob(warehouseId: string, payload: any) {
    try {
        const url = `/warehouse/${warehouseId}/job/inbound`;
        const data = await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        revalidateTag('job','max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error?.message || 'Failed to create inbound job' };
    }
}

export async function createOutboundJob(warehouseId: string, payload: any) {
    try {
        const url = `/warehouse/${warehouseId}/job/outbound`;
        const data = await api(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        revalidateTag('job','max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error?.message || 'Failed to create outbound job' };
    }
}
