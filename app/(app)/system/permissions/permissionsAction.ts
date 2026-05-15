'use server';

import { api } from '@/app/(app)/actions/api';

import { updateTag } from 'next/cache';
import fs from 'fs';
import path from 'path';

export async function getMenuTree() {
    try {
        const data = await api<any>('menu/tree', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                tags: ['menu-tree'],
                revalidate: 0,
            }
        });
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to fetch menu tree' };
    }
}

export async function addPermission(body: any) {
    try {
        const data = await api(
            `menu`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        updateTag('menu-tree');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to add permission' };
    }
}

export async function updatePermission(id: string, body: any) {
    try {
        const data = await api(
            `menu/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        updateTag('menu-tree');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update permission' };
    }
}

export async function getPublicIcons() {
    try {
        const iconsDir = path.join(process.cwd(), 'public', 'icon.svg');
        if (!fs.existsSync(iconsDir)) {
            return { success: true, data: [] };
        }
        const files = await fs.promises.readdir(iconsDir);
        const svgFiles = files.filter(file => file.endsWith('.svg'));
        return { success: true, data: svgFiles };
    } catch (error: any) {
        console.error("Error scanning icons:", error);
        return { success: false, data: [], error: error.message };
    }
}

export async function deletePermission(id: string) {
    try {
        const data = await api(
            `menu/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        updateTag('menu-tree');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to delete permission' };
    }
}

export async function getResources(params?: { page?: number; limit?: number }) {
    try {
        const query = new URLSearchParams();
        query.set('page', String(params?.page ?? 1));
        query.set('limit', String(params?.limit ?? 100));
        const data = await api<any>(`resource?${query.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 0 },
        });
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to fetch resources' };
    }
}

export async function reorderMenu(body: { menu_id: string; new_order_number: number }) {
    try {
        const data = await api(
            `menu/reorder`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        updateTag('menu-tree');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to reorder menu' };
    }
}
