"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import ModalThemeProvider from "@/components/ui/ModalThemeProvider";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { deleteResource } from "../resourcesAction";
import ModalAddResources from "./ModalAddResources";
import { useToast } from "@/components/ui/Toast";

import { useTableQuery } from "@/hook/useTableQuery";
import { getResources } from "../resourcesAction";

interface ResourceItem {
    id: string;
    code: string;
    name: string;
    description: string;
    [key: string]: any;
}

export default function ResourcesTable() {
    const [searchText, setSearchText] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const { showSuccess, showError } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const { data: rawData, total, isLoading, refetch, onPageChange, onSearchChange, params } = useTableQuery<ResourceItem>({
        queryKey: 'resources', //queryKey: 'resources': Đặt tên (ID) cho dữ liệu của bảng này là resources. Nhờ cái tên này, lát nữa nếu bạn thêm mới hoặc xóa một "resource", 
        // bạn chỉ cần gọi invalidateQueries({ queryKey: 'resources' }) là bảng này sẽ tự động tải lại dữ liệu mới nhất.
        fetchFn: getResources, //  Dữ liệu gửi về 1 dict như này 
        initialParams: { page: 1, limit: 20 }
    });

    // States for ModalConfirmDelete
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | string[] | null>(null);

    // Format serial numbers (STT)
    const formattedData = useMemo(() => {
        if (!Array.isArray(rawData)) return [];
        return rawData.map((item, index) => ({
            ...item,
            stt: (params.page - 1) * params.limit + index + 1,
            key: item.id
        }));
    }, [rawData, params.page, params.limit]);



    // Search filter
    const filteredData = useMemo(() => {
        const q = (params.search || "").toLowerCase().trim();
        if (!q) return formattedData;
        return formattedData.filter(item =>
            (item.code || "").toLowerCase().includes(q) ||
            (item.name || "").toLowerCase().includes(q) ||
            (item.description || "").toLowerCase().includes(q)
        );
    }, [formattedData, params.search]);

    const handleEdit = (record: any) => {
        setEditData(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedRowKeys.length === 0) return;
        setDeleteId(selectedRowKeys.map(key => String(key)));
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            if (Array.isArray(deleteId)) {
                //  delete nhiều mục 
                const deletePromises = deleteId.map(id => deleteResource(id));
                const results = await Promise.all(deletePromises);// lời hứa promise

                const failedCount = results.filter(r => !r.success).length;
                if (failedCount === 0) {
                    showSuccess(`Xóa ${deleteId.length} resource thành công`);
                    setSelectedRowKeys([]);
                } else {
                    showError(`Có ${failedCount}/${deleteId.length} resource không thể xóa`);
                }
            } else {
                // Single delete
                const res = await deleteResource(deleteId);
                if (res.success) {
                    showSuccess("Xóa resource thành công");
                } else {
                    showError(res.error || "Không thể xóa resource");
                }
            }

            if (typeof refetch === 'function') refetch();
        } catch (err: any) {
            showError(err.message || "Đã có lỗi khi thực thi lệnh xóa");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    return (
        <ModalThemeProvider>
            <div className="w-full h-full flex flex-col">
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
                            className="rounded-[8px] placeholder:text-[#545454] placeholder:text-[16px] !w-[200px] lg:!w-[300px]"
                            style={{ width: '300px', fontSize: '16px', height: '40px' }}
                            value={params.search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <Image
                            src="/icon.svg/delete.svg"
                            alt="Xóa"
                            width={40}
                            height={40}
                            onClick={selectedRowKeys.length > 0 ? handleBulkDelete : undefined}
                            className={`transition-all ${selectedRowKeys.length > 0 ? "cursor-pointer hover:opacity-80" : "opacity-30 cursor-not-allowed"}`}
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
                        loading={isLoading}
                        pagination={{
                            current: params.page,
                            pageSize: params.limit,
                            total,
                            onChange: onPageChange,
                        }}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (keys) => setSelectedRowKeys(keys),
                            columnWidth: 46,
                        }}
                    />
                </div>

                <ModalConfirmDelete
                    open={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setDeleteId(null);
                    }}
                    onConfirm={confirmDelete}
                    title="Thông báo"
                    content={Array.isArray(deleteId) ? `Bạn có chắc chắn muốn xóa ${deleteId.length} resource đã chọn không?` : "Bạn có chắc chắn muốn xóa resource này không?"}
                    loading={isDeleting}
                />

                <ModalAddResources
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditData(null);
                    }}
                    onSuccess={() => {
                        if (typeof refetch === 'function') refetch();
                    }}
                    initialData={editData}
                />
            </div>
        </ModalThemeProvider>
    );
}
