"use client";

import { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { getResources } from "../resourcesAction";
import ResourcesTable from "./ResourcesTable";

export default function ResourcesContent() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageApi, messageContext] = message.useMessage();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getResources({ page: 1, limit: 100 });
            if (res.success && res.data) {
                const dataArray = res.data.elements || res.data.rows || res.data.data || res.data || [];
                setData(dataArray);
            } else {
                messageApi.error(res.error || "Không thể tải danh sách resource");
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
                <ResourcesTable data={data} onRefresh={fetchData} />
            )}
        </div>
    );
}