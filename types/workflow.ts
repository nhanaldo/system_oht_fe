export interface Workflow {
    id: string;
    name: string;
    code?: string;
    description?: string;
    warehouse_id?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface WorkflowResponse {
    elements?: Workflow[];
    total?: number;
    page?: number;
    limit?: number;
}

export interface WorkflowStep {
    id: string;
    workflow_id: string;
    workflow_name: string;
    device_type_id: string;
    device_type_name: string;
    device_type_description: string;
    step_order: number;
    action_type: string;
    default_params: any[];
    workflow_step_name: string;
}
