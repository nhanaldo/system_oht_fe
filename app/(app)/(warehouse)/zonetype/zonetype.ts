'use server';

import { revalidateTag } from 'next/cache';
import { api } from '@/app/(app)/actions/api';

export async function getZoneTypes(params?: { search?: string; page?: number; limit?: number }) {
    try {
        const query = new URLSearchParams();

        if (params?.search) query.set('search', params.search);
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.page != null) query.set('page', String(params.page));

        const url = query.toString()
            ? `/zone-type?${query.toString()}`
            : '/zone-type';

        return await api(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                tags: ['zone-types'],
                revalidate: 0,
            }
        });


    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get zone types' };
    }
}

export async function addZoneType(body: any) {
    try {
        const data = await api(
            `/zone-type`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        revalidateTag('zone-types', 'max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to add zone type' };
    }
}

export async function updateZoneType(id: string, body: any) {
    try {
        const data = await api(
            `/zone-type/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        revalidateTag('zone-types', 'max');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update zone type' };
    }
}

export async function deleteZoneType(ids: string | string[]) {
    try {
        const idList = Array.isArray(ids) ? ids : [ids];

        const results = await Promise.all(
            idList.map(id =>
                api(`/zone-type/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        );

        revalidateTag('zone-types', 'max');
        return { success: true, data: results };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to delete zone type' };
    }
}
