'use server';

import { updateTag } from 'next/cache';
import { api } from '@/app/(app)/actions/api';
import { RoleFilterParams, RoleResponse, Role, RoleAddParams } from '@/types/role';

export async function getRole(params?: RoleFilterParams) {
    try {
        const query = new URLSearchParams();

        if (params?.search) query.set('search', params.search);
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.page != null) query.set('page', String(params.page));
        const url = query.toString()
            ? `/roles?${query.toString()}`
            : '/roles';
        return await api(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                tags: ['roles'],
                revalidate: 60,
            }
        });
    } catch (error: any) {
        // Re-throw Next.js redirect errors so they bubble up correctly
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get roles' };
    }
}

export async function addRole(body: RoleAddParams) {
    try {
        const data = await api(
            `/roles`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );
        updateTag('roles');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to add role' };
    }
}

export async function deleteRole(ids: string | string[]) {
    try {
        const idList = Array.isArray(ids) ? ids : [ids];

        // API: DELETE /roles/{id} — gọi từng ID
        const results = await Promise.all(
            idList.map(id =>
                api(`/roles/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        );

        updateTag('roles');
        return { success: true, data: results };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to delete role' };
    }
}

export async function updateRole(id: string, body: { name: string; description?: string }) {
    try {
        const data = await api(`/roles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        updateTag('roles');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update role' };
    }
}

export async function getRolePermissionMatrix(id: string) {
    try {
        const data = await api(`/roles/${id}/permission-matrix`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Khong cache vi phan quyen co the thay doi lien tuc
            next: { revalidate: 0 }
        });
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get permission matrix' };
    }
}

export async function syncRolePermissions(id: string, permissionIds: string[]) {
    try {
        const data = await api(`/roles/${id}/permissions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ permission_ids: permissionIds }),
        });
        updateTag('roles');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to sync permissions' };
    }
}