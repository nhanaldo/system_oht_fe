"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input, Space, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { deleteResource } from "../resourcesAction";
import ModalAddResources from "./ModalAddResources";

interface ResourceItem {
    id: string;
    code: string;
    name: string;
    description: string;
    [key: string]: any;
}

interface ResourcesTableProps {
    data: ResourceItem[];
    onRefresh?: () => void;
}

export default function ResourcesTable({ data, onRefresh }: ResourcesTableProps) {
    const [searchText, setSearchText] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [messageApi, messageContext] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    // States for ModalConfirmDelete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Format serial numbers (STT)
    const formattedData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.map((item, index) => ({
            ...item,
            stt: index + 1,
            key: item.id
        }));
    }, [data]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    // Search filter
    const filteredData = useMemo(() => {
        if (!searchText.trim()) return formattedData;
        const q = searchText.toLowerCase().trim();
        return formattedData.filter(item =>
            (item.code || "").toLowerCase().includes(q) ||
            (item.name || "").toLowerCase().includes(q) ||
            (item.description || "").toLowerCase().includes(q)
        );
    }, [formattedData, searchText]);

    const handleEdit = (record: any) => {
        setEditData(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const res = await deleteResource(deleteId);
            if (res.success) {
                messageApi.success("Xóa resource thành công");
                if (onRefresh) onRefresh();
            } else {
                messageApi.error(res.error || "Không thể xóa resource");
            }
        } catch (err: any) {
            messageApi.error(err.message || "Đã có lỗi khi thực thi lệnh xóa");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <ModalThemeProvider>
            <div className="w-full h-full flex flex-col">
                {messageContext}

                {/* Header section */}
                <div className="flex justify-between items-start mb-2 shrink-0">
                    <div className="min-w-0 flex-1 mr-2">
                        <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">
                            Quản lý Resource
                        </h2>
                        <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">
                            Đã chọn: {selectedRowKeys.length} mục
                        </p>
                    </div>

                    <Space size="middle">
                        <Input
                            placeholder="Nhập vào tìm kiếm"
                            prefix={<SearchOutlined style={{ color: '#545454', fontSize: '18.34px', opacity: 0.6 }} />}
                            className="rounded-[8px] placeholder:text-[#545454] placeholder:text-[16px]"
                            style={{ width: '300px', fontSize: '16px', height: '40px' }}
                            value={searchText}
                            onChange={onSearchChange}
                        />
                        <Image
                            src="/icon.svg/create.svg"
                            alt="Thêm"
                            width={40}
                            height={40}
                            onClick={() => {
                                setEditData(null);
                                setIsModalOpen(true);
                            }}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Space>
                </div>

                <div className="w-full h-[1px] bg-gray-100 mb-3 shrink-0"></div>

                {/* Table Container */}
                <div className="flex-1 min-h-0">
                    <CustomTable
                        dataTable={filteredData}
                        columns={getColumns(handleEdit, handleDelete)}
                        keyIndex="id"
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (keys) => setSelectedRowKeys(keys),
                            columnWidth: 46,
                        }}
                    />
                </div>

                <ModalConfirmDelete
                    open={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Thông báo"
                    content="Bạn có chắc chắn muốn xóa resource này không?"
                    loading={isDeleting}
                />

                <ModalAddResources
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditData(null);
                    }}
                    onSuccess={() => {
                        if (onRefresh) onRefresh();
                    }}
                    onRefresh={onRefresh}
                    initialData={editData}
                />
            </div>
        </ModalThemeProvider>
    );
}
