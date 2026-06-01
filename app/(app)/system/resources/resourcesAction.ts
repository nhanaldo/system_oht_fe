'use server';

import { api } from '@/app/(app)/actions/api';

export async function getResources(params?: { page?: number; limit?: number; search?: string }) {
    try {
        const query = new URLSearchParams();
        query.set('page', String(params?.page ?? 1));
        query.set('limit', String(params?.limit ?? 100));
        if (params?.search) query.set('search', params.search);
        return await api<any>(`resource?${query.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 0 },
        });
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        throw error;
    }
}

export async function deleteResource(id: string) {
    try {
        const data = await api(`resource/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to delete resource' };
    }
} export async function addResource(body: any) {
    try {
        const data = await api(`resource`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to add resource' };
    }
}

export async function updateResource(id: string, body: any) {
    try {
        const data = await api(`resource/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update resource' };
    }
}
