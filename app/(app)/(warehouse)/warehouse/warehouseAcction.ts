'use server'

import { api } from '@/app/(app)/actions/api';
import { revalidateTag } from 'next/cache';

// isRedirectError check removed in favor of digest check to resolve lint issues
export interface WareHouseProps {
    name: string;
    code: string;
    row: number;
    column: number;
    number_tower: number;
    number_floor: number;
    total_position: number;
    config: any
}
export interface TowerProps {
    name: string;
    code: string;
    warehouse_id: string;
    tower_type: string;
    tower_order: number,
    id: string,
    status?: string,
    is_active?: boolean,
    isNew?: boolean,
    isModified?: boolean,
}
export interface TowerFloorUpdateProps {
    warehouse_floor_id: string;
    tower_floors: {
        id: string;
        name: string;
        // code: string;
        tower_id: string;
        nodes: {
            code: string;
            name: string;
            x: string;
            y: string;
            z: string
        }[],
        devices?: {
            id: string;
            purpose: string
        }[]

    }[]
}
export interface TowerFloorCreateProps {
    warehouse_floor_id: string;
    tower_floors: {
        name: string;
        // code: string;
        tower_id: string;
        nodes: {
            code: string;
            name: string;
            x: string;
            y: string;
            z: string
        }[],
        devices?: {
            id: string;
            purpose: string
        }[]

    }[]
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
            ? `/warehouse?${query.toString()}`
            : '/warehouse';

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
            `/warehouse`,
            {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        revalidateTag('warehouse', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to create warehouse';
    }
}
export async function updateWarehouse(id: string, body: WareHouseProps) {
    try {


        const data = await api(
            `/warehouse/${id}`,
            {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        revalidateTag('warehouse', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to update warehouse';
    }
}
// ==========================================
// 3. QUẢN LÝ MODULE KHO (TOWER)
// ==========================================

export async function getTower(id: string) {
    try {
        const data = await api(
            `/warehouse/${id}/tower`,
            {
                method: 'GET',
                next: {
                    tags: ['tower'],
                    revalidate: 0,
                }
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to get warehouse';
    }
}
// ==========================================
// 4. QUẢN LÝ TẦNG KHO (TOWER FLOOR / WAREHOUSE FLOOR)
// ==========================================

export async function getTowerFloor(id: string, tower_id: string, warehouse_floor_id: string) {
    try {
        const params = new URLSearchParams();

        if (tower_id) {
            params.append('tower_id', tower_id);
        }
        if (warehouse_floor_id) {
            params.append('warehouse_floor_id', warehouse_floor_id);
        }
        const data = await api(
            `/warehouse/${id}/tower-floor?${params.toString()}`,
            {
                method: 'GET',
                next: {
                    tags: ['tower'],
                    revalidate: 0,
                }
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to get warehouse';
    }
}
export async function getWarehouseFloor(id: string) {
    try {
        const data = await api(
            `/warehouse/${id}/floor`,
            {
                method: 'GET',
                next: {
                    tags: ['warehouseFloor'],
                    revalidate: 0,
                }
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return error?.message || 'Failed to get warehouse';
    }
}
// ==========================================
// 5. QUẢN LÝ KHU VỰC (ZONE)
// ==========================================

export async function getZone(id: string, warehouse_floor_id: string) {
    try {
        const query = new URLSearchParams();
        query.append('warehouse_floor_id', warehouse_floor_id);
        const url = query.toString() ? `/warehouse/${id}/zone?${query.toString()}` : `/warehouse/${id}/zone`;
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

        return error?.message || 'Failed to get warehouse';
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
export async function getZoneType() {
    try {
        const data = await api(
            `/zone-type`,
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

export async function updateTower(id: string, towers: TowerProps[]) {
    try {

        const data = await api(
            `/warehouse/${id}/tower/bulk`,
            {
                method: 'PUT',
                body: JSON.stringify({ towers }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        revalidateTag('tower', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: error?.message || 'Failed to update tower' }
    }
}
export async function createTower(id: string, towers: TowerProps[]) {
    try {
        const data = await api(
            `/warehouse/${id}/tower/bulk`,
            {
                method: 'POST',
                body: JSON.stringify({ towers }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        revalidateTag('tower', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: error?.message || 'Failed to create tower' }
    }
}
export async function createTowerFloor(id: string, body: TowerFloorCreateProps) {
    try {

        const data = await api(
            `/warehouse/${id}/tower-floor/bulk-create`,
            {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        revalidateTag('tower', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.log("err", error);

        return { error: `Failed to create tower-floor: ${error?.message || 'Unknown error'}` }
    }
}
export async function updateTowerFloor(id: string, body: TowerFloorUpdateProps) {
    try {
        const data = await api(
            `/warehouse/${id}/tower-floor/bulk-update`,
            {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        revalidateTag('tower', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

        return { error: `Failed to update tower-floor: ${error?.message || 'Unknown error'}` }
    }
}
export async function createZone(id: string, zones: ZoneCreateProps[]): Promise<any> {
    try {
        // cơ chế phân rã để ko bị treo 10s tách ra từng zone 1
        // if (zones.length > 1) {
        //     let lastResult: any = null;
        //     for (const zone of zones) {
        //         const res = await createZone(id, [zone]);
        //         if (res?.error) return res;
        //         lastResult = res;
        //     }
        //     return lastResult;
        // }

        const data = await api(
            `/warehouse/${id}/zone/bulk`,
            {
                method: 'POST',
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

        return { error: error?.message || 'Failed to create zone' }
    }
}
export async function updateZone(id: string, zones: ZoneUpdateProps[]): Promise<any> {
    try {
        // if (zones.length > 1) {
        //     let lastResult: any = null;
        //     for (const zone of zones) {
        //         const res = await updateZone(id, [zone]);
        //         if (res?.error) return res;
        //         lastResult = res;
        //     }
        //     return lastResult;
        // }

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
export async function updateNodeBulk(id: string, nodes: NodeBulkProps) {
    try {

        const data = await api(
            `/warehouse/${id}/nodes/bulk-qrcode-direction`,
            {
                method: 'PUT',
                body: JSON.stringify(nodes),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.log("error ", error);

        return { error: error?.message || 'Failed to update node' }
    }
}
export async function updateNode(id: string, node_id: string, nodes: NodeProps) {
    try {
        const data = await api(
            `/warehouse/${id}/nodes/${node_id}`,
            {
                method: 'PUT',
                body: JSON.stringify(nodes),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        console.log("error ", error);

        return { error: error?.message || 'Failed to update node' }
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

export async function bulkDeleteZones(warehouseId: string, ids: string[]) {
    try {
        const data = await api(
            `/warehouse/${warehouseId}/zone/bulk`,
            {
                method: 'DELETE',
                body: JSON.stringify({ ids }),
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

export async function deleteTowerFloor(warehouseId: string, towerFloorId: string) {
    try {
        const data = await api(
            `/warehouse/${warehouseId}/tower-floor/${towerFloorId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        revalidateTag('tower', 'max');
        return data;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
        // Nếu trả về 404 thì coi như đã xóa thành công (không tồn tại)
        if (error?.status === 404) {
            return { success: true };
        }
        return { error: `Failed to delete tower floor: ${error?.message || 'Unknown error'}` }
    }
}


export async function deleteWarehouse(id: string) {
    try {
        const data = await api(
            `/warehouse/${id}`,
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

export async function findAllDevices(params?: { search?: string, page?: number, limit?: number }) {
    try {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());

        const url = query.toString() ? `/device?${query.toString()}` : '/device';

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
