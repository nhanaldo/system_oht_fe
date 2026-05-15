interface MenuPayload {
    name: string;
    icon: string;
    parent_id: string | string[];
    path?: string;
    resource_id?: string;
}