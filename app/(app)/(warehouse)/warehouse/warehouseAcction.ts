'use server'

import { api } from '@/app/(app)/actions/api';
import { revalidateTag } from 'next/cache';

// isRedirectError check removed in favor of digest check to resolve lint issues
export interface WareHouseProps {
    name: string;
    code: string;
    row: number;
    column: number;
    status?: string;
    total_positions?: number;
    config?: any;
}
export interface ZoneCreateProps {
    name: string;
    code: string;
    zone_type_id: string;
    tower_floor_id: string,
    description?: string,
    inbound_direction_x?: string,
    inbound_direction_y?: string,
    node_ids: [],
    product_id?: string,
}
export interface ZoneUpdateProps {
    id: string,
    name: string;
    code: string;
    zone_type_id: string;
    tower_floor_id: string,
    description?: string,
    inbound_direction_x?: string,
    inbound_direction_y?: string,
    node_ids: [],
    product_id?: string,
}
export interface NodeBulkProps {
    items: {
        node_id: string,
        qrcode?: string,
    }[],
    directions: [],
    updated_by?: string,
}
export interface NodeProps {
    code: string;
    name: string;
    qrcode?: string,
    directions: [],
}

export interface NodeEdgePayload {
    config: any[];
    direction: number;
    distance: number;
    edge_type: string;
    from_node_id: string;
    max_speed: number;
    to_node_id: string;
}

// ==========================================
// 1. QUẢN LÝ KHO (WAREHOUSE)
// ==========================================

export async function getWarehouse(params?: any) {
    try {
        const query = new URLSearchParams();

        if (params?.search) query.set('search', params.search);
        if (params?.limit != null) query.set('limit', String(params.limit));
        if (params?.page != null) query.set('page', String(params.page));

        const url = query.toString()
            ? `/warehouses?${query.toString()}`
            : '/warehouses';

        const data = await api(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: {
                tags: ['warehouse'],
                revalidate: 0,
            }
        });

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { success: false, error: error?.message || 'Failed to get warehouse' };
    }
}
// ==========================================
// 2. DANH MỤC & SẢN PHẨM & THIẾT BỊ
// ==========================================

export async function getCategory(id: string) {
    try {
        const data = await api(
            `/warehouse/${id}/category`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to get category';
    }
}
export async function getProduct(id: string, category_id: string) {
    try {
        const data = await api(
            `/warehouse/${id}/product?category_id=${category_id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to get product';
    }
}

export async function getWarehouseById(id: string) {
    try {
        const data = await api(
            `/warehouse/${id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                next: {
                    tags: ['warehouse'],
                    revalidate: 0,
                }
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to get warehouse by id';
    }
}

export async function createWarehouse(body: WareHouseProps) {
    try {


        const data = await api(
            `/warehouses`,
            {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        revalidateTag('warehouses', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to create warehouse';
    }
}
export async function updateWarehouse(id: string, body: WareHouseProps) {
    try {


        const data = await api(
            `/warehouses/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        revalidateTag('warehouses', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to update warehouse';
    }
}
// ==========================================
// 5. QUẢN LÝ KHU VỰC (ZONE)
// ==========================================

export async function getZone(id: string) {
    try {
        const url = `/warehouses/${id}/zones`;
        const data = await api(
            url,
            {
                method: 'GET',
                next: {
                    tags: ['zone'],
                    revalidate: 0,
                }
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to get warehouse zones';
    }
}
// ==========================================
// 6. QUẢN LÝ VỊ TRÍ (NODES / CELLS)
// ==========================================

export async function getNode(id: string) {
    try {
        const query = new URLSearchParams();
        query.set('page', "1");
        query.set('pagesize', "2000");
        const url = query.toString() ? `/warehouse/${id}/nodes?${query.toString()}` : `/warehouse/${id}/nodes`;

        const data = await api(
            url,
            {
                method: 'GET',
                next: {
                    tags: ['node'],
                    revalidate: 0,
                }
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: error?.message || 'Failed to get warehouse' }
    }
}

export async function getNodeById(warehouseId: string, id: string) {
    try {
        const url = `/warehouses/${warehouseId}/nodes/${id}`;
        const data = await api(
            url,
            {
                method: 'GET',
                next: {
                    tags: ['node'],
                    revalidate: 0,
                }
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: error?.message || 'Failed to get node by id' };
    }
}
export async function getZoneType() {
    try {
        const data = await api(
            `/zones`,
            {
                method: 'GET',
            }
        );
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: error?.message || 'Failed to get zoneType' }
    }
}

export async function createZone(id: string, body: any): Promise<any> {
    try {
        const data = await api(
            `/warehouses/${id}/zones`,
            {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("Data", data);

        revalidateTag('zone', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: error?.message || 'Failed to create zone' }
    }
}

export async function updateZoneById(warehouseId: string, zoneId: string, body: any): Promise<any> {
    try {
        const data = await api(
            `/warehouses/${warehouseId}/zones/${zoneId}`,
            {
                method: 'PUT',
                body: JSON.stringify([body]),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("updateZoneById response", data);

        revalidateTag('zone', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: error?.message || 'Failed to update zone' }
    }
}

export async function updateZone(id: string, zones: ZoneUpdateProps[]): Promise<any> {
    try {
        const data = await api(
            `/warehouse/${id}/zone/bulk`,
            {
                method: 'PUT',
                body: JSON.stringify({ zones }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log("Data", data);

        revalidateTag('zone', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.log(error);

        return { error: error?.message || 'Failed to update zone' }
    }
}

export async function updateNodeDetails(warehouseId: string, nodeId: string, payload: any): Promise<any> {
    try {
        const data = await api(
            `/warehouses/${warehouseId}/nodes/${nodeId}`,
            {
                method: 'PUT',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.log("error ", error);
        return { error: error?.message || 'Failed to update node details' };
    }
}

export async function createNodeEdge(warehouseId: string, payload: any): Promise<any> {
    try {
        const data = await api(
            `/warehouses/${warehouseId}/node_edges`,
            {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.log("error ", error);
        return { error: error?.message || 'Failed to create node edge' };
    }
}

export async function getNodeEdges(warehouseId: string): Promise<any> {
    try {
        const data = await api(
            `/warehouses/${warehouseId}/node_edges`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.log("error ", error);
        return { error: error?.message || 'Failed to get node edges' };
    }
}


// ==========================================
// 7. THIẾT BỊ VÀ CÁC THAO TÁC XÓA (DELETE)
// ==========================================

export async function getDevices(warehouseId: string, params?: { page?: number, limit?: number, search?: string }) {
    try {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());
        if (params?.search) query.set('search', params.search);

        const url = query.toString() ? `/warehouse/${warehouseId}/devices?${query.toString()}` : `/warehouse/${warehouseId}/devices`;

        const data = await api(
            url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: error?.message || 'Failed to get devices' };
    }
}

export async function bulkDeleteZones(warehouseId: string, ids: string[]): Promise<any> {
    try {
        const data = await api(
            `/warehouses/${warehouseId}/zones`,
            {
                method: 'DELETE',
                body: JSON.stringify(ids),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        revalidateTag('zone', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { error: error?.message || 'Failed to bulk delete zones' };
    }
}


export async function deleteWarehouse(id: string) {
    try {
        const data = await api(
            `/warehouses/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        revalidateTag('warehouse', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { error: error?.message || 'Failed to delete warehouse' };
    }
}

//     try {
//         const query = new URLSearchParams();
//         if (params?.search) query.set('search', params.search);
//         if (params?.page) query.set('page', params.page.toString());
//         if (params?.limit) query.set('limit', params.limit.toString());

//         const url = query.toString() ? `/device?${query.toString()}` : '/device';

//         const data = await api(
//             url,
//             {
//                 method: 'GET',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );
//         return data;
//     } catch (error: any) {
//         if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
//         return { error: error?.message || 'Failed to get devices' };
//     }
// }

export async function getLocations(warehouseId: string, params?: { page?: number, limit?: number }) {
    try {
        const query = new URLSearchParams();
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());

        const url = query.toString() ? `/warehouse/${warehouseId}/locations?${query.toString()}` : `/warehouse/${warehouseId}/locations`;

        const data = await api(
            url,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        return { error: error?.message || 'Failed to get locations' };
    }
}
