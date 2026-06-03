'use server';

import { revalidateTag } from 'next/cache';
import { api } from '@/app/(app)/actions/api';

export async function getDeviceTypes(params?: { search?: string; page?: number; limit?: number }) {
    try {
        const query = new URLSearchParams();

        if (params?.search) query.set('search', params.search);
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.page != null) query.set('page', String(params.page));

        const url = query.toString()
            ? `/device-types?${query.toString()}`
            : '/device-types';

        return await api(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                tags: ['device-types'],
                revalidate: 0,
            }
        });
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get device groups' };
    }
}

export async function addDeviceType(body: any) {
    try {
        const data = await api(
            `/device-types`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        revalidateTag('device-types', 'max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to add device group' };
    }
}

export async function updateDeviceType(id: string, body: any) {
    try {
        const data = await api(
            `/device-types/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        revalidateTag('device-types', 'max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update device group' };
    }
}

export async function deleteDeviceType(ids: string | string[]) {
    try {
        const idList = Array.isArray(ids) ? ids : [ids];

        const results = await Promise.all(
            idList.map(id =>
                api(`/device-types/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        );

        revalidateTag('device-types', 'max');
        return { success: true, data: results };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to delete device group' };
    }
}
