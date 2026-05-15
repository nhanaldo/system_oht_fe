"use client";

import { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { getMenuTree } from "../permissionsAction";
import PermissionsTable from "./PermissionsTable";

interface MenuTreeItem {
    id: string;
    name: string;
    code?: string;
    icon?: string;
    parent_id?: string | null;
    path?: string;
    level?: number;
    order_number?: number;
    children?: MenuTreeItem[];
}

export default function PermissionsContent() {
    const [rawTree, setRawTree] = useState<MenuTreeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, messageContext] = message.useMessage();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getMenuTree();
            if (res.success && res.data) {
                const dataArray = Array.isArray(res.data)
                    ? res.data
                    : (res.data.elements || res.data.rows || res.data.data || []);
                setRawTree(dataArray);
            } else {
                messageApi.error(res.error || "Không thể tải danh sách chức năng");
            }
        } catch (err: any) {
            messageApi.error(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="h-full flex flex-col">
            {messageContext}
            {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                    <Spin size="large" />
                </div>
            ) : (
                <PermissionsTable raw={rawTree} onRefresh={fetchData} />
            )}
        </div>
    );
}