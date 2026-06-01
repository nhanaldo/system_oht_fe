export interface Container {
    id: string;
    code: string;
    container_type: string;
    current_node_id?: string;
    current_location_id?: string;
    status: string;
    is_occupied: boolean;
    is_active: boolean;
    metadata?: any;
    qr_code?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ContainerResponse {
    success: boolean;
    elements?: Container[];
    data?: Container[];
    error?: string;
}

export interface ContainersTableProps {
    raw: Container[];
    warehouseId: string;
}

export interface ModalAddContainersProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingRecord?: Container | null;
    warehouseId: string;
    existingContainers?: Container[];
}

export interface ContainerInputData {
    code: string;
    container_type: string;
    qr_code?: string;
    status?: string;
    is_occupied?: boolean;
    is_active?: boolean;
    metadata?: string;
}
