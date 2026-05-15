'use server';

import { updateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { api } from '@/app/(app)/actions/api';
import { AccountFilterParams, AccountAddParams } from '@/types/account';

export async function getAccount(params?: AccountFilterParams) {
    try {
        const query = new URLSearchParams();

        if (params?.search) query.set('search', params.search);
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.page != null) query.set('page', String(params.page));

        const url = query.toString()
            ? `/accounts?${query.toString()}`
            : '/accounts';

        return await api(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                tags: ['accounts'],
                revalidate: 0,
            }
        });
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get accounts' };
    }
}

export async function getAccountById(id: string) {
    try {
        return await api(`/accounts/${id}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
            }
        });

    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get account by ID' };
    }
}

export async function getCurrentAccountProfile() {
    try {
        const cookieStore = await cookies();
        const accountId = cookieStore.get("accountId")?.value;
        if (!accountId) {
             return { success: false, error: 'No account ID found' };
        }
        return await api(`/accounts/${accountId}/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                revalidate: 0,
            }
        });
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get current account profile' };
    }
}


export async function updateAccountProfile(id: string, body: { name?: string, avatar?: string, username?: string }) {
    try {
        const data = await api(
            `/accounts/${id}/profile`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        updateTag('accounts');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update profile' };
    }
}

export async function updateAccountPassword(id: string, body: { old_password?: string, new_password?: string, confirm_new_password?: string }) {
    try {
        const data = await api(
            `/accounts/update_password/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update password' };
    }
}

export async function resetAccountPassword(id: string) {
    try {
        const data = await api(
            `/accounts/admin/reset_password/${id}`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(data);

        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to reset password' };
    }
}

export async function addAccount(body: AccountAddParams) {
    try {
        const data = await api(
            `/accounts`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        updateTag('accounts');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to add account' };
    }
}

export async function deleteAccount(ids: string | string[]) {
    try {
        const idList = Array.isArray(ids) ? ids : [ids];

        // API: DELETE /accounts/{id} — gọi từng ID
        const results = await Promise.all(
            idList.map(id =>
                api(`/accounts/${id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                })
            )
        );

        updateTag('accounts');
        return { success: true, data: results };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to delete account' };
    }
}

export async function updateAccountStatus(id: string, isActive: boolean) {
    try {
        const data = await api(
            `/accounts/${id}/toggle-active`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_active: isActive }),
            }
        );

        updateTag('accounts');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update account status' };
    }
}

export async function updateAccount(id: string, body: any) {
    try {
        const data = await api(
            `/accounts/admin/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        updateTag('accounts');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update account' };
    }
}

export async function getWarehouses() {
    try {
        return await api('/warehouse', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to get warehouses' };
    }
}

export async function updateAccountWarehouses(id: string, warehouseIds: string[]) {
    try {
        const data = await api(
            `/accounts/${id}/warehouses`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ warehouse_ids: warehouseIds }),
            }
        );

        updateTag('accounts');
        return { success: true, data };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to update account warehouses' };
    }
}
export async function uploadFile(formData: FormData) {
    try {
        const response = await api<any>('/upload-file', {
            method: 'POST',
            body: formData,
        });

        return { success: true, data: response };
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { success: false, error: error.message || 'Failed to upload file' };
    }
}
