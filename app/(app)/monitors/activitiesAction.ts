'use server';

import { api } from '@/app/(app)/actions/api';

export async function getJobs(params?: any) {
    try {
        const warehouseId = params?.warehouse_id;
        if (!warehouseId) {
            return { success: true, elements: [] };
        }

        const queryParams = new URLSearchParams();
        if (params?.limit != null) queryParams.set('limit', String(params.limit));
        if (params?.page != null) queryParams.set('page', String(params.page));

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
