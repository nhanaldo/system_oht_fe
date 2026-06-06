"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoneType } from "@/types/zone-type";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import { Input, Space, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModalAddZoneType from "./ModalAddZoneType";
import { getZoneTypes, deleteZoneType } from "../zonetype";
import { useRouter } from "next/navigation";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { useToast } from "@/components/ui/Toast";
import { useTableQuery } from "@/hook/useTableQuery";

export default function ZoneTypeTable() {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ZoneType | null>(null);
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const { data: rawData, total, refetch, onPageChange, onSearchChange, params } = useTableQuery<ZoneType>({
        queryKey: 'zone-types',
        fetchFn: getZoneTypes,
        initialParams: { limit: 20 }
    });

    const handleEdit = (record: ZoneType) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        content: string;
        onConfirm: () => Promise<void> | void;
        onCancel?: () => void;
        loading: boolean;
    }>({
        open: false,
        title: 'Thông báo',
        content: '',
        onConfirm: () => { },
        loading: false
    });

    const openConfirmModal = (title: string, content: string, onConfirm: () => Promise<void> | void, onCancel?: () => void) => {
        setConfirmModal({
            open: true,
            title,
            content,
            onConfirm,
            onCancel,
            loading: false
        });
    };

    const closeConfirmModal = () => {
        if (confirmModal.onCancel) {
            confirmModal.onCancel();
        }
        setConfirmModal(prev => ({ ...prev, open: false }));
    };

    const handleConfirm = async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }));
        await confirmModal.onConfirm();
        setConfirmModal(prev => ({ ...prev, loading: false }));
    };

    const handleDelete = (id: string) => {
        const item = rawData.find(a => a.id === id);
        const name = item?.name || item?.code || 'loại khu vực này';

        openConfirmModal(
            'Thông báo',
            `Bạn có chắc chắn muốn xóa ${name} không?`,
            async () => {
                try {
                    const res = await deleteZoneType(id);
                    if (res && res.success === false) {
                        showError(res.error || 'Có lỗi xảy ra khi xóa');
                    } else {
                        showSuccess('Xóa loại khu vực thành công');
                        setSelectedRowKeys(prev => prev.filter(key => key !== id));
                        refetch();
                    }
                } catch {
                    showError('Có lỗi xảy ra khi xóa');
                } finally {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        );
    };

    const handleBatchDelete = () => {
        if (selectedRowKeys.length === 0) return;

        openConfirmModal(
            'Thông báo',
            `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} loại khu vực đã chọn không?`,
            async () => {
                try {
                    const res = await deleteZoneType(selectedRowKeys as string[]);
                    if (res && res.success === false) {
                        showError(res.error || 'Có lỗi xảy ra khi xóa');
                    } else {
                        showSuccess(`Đã xóa thành công ${selectedRowKeys.length} loại khu vực`);
                        setSelectedRowKeys([]);
                        refetch();
                    }
                } catch {
                    showError('Có lỗi xảy ra khi xóa');
                } finally {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        );
    };

    const filteredData = rawData.filter(item => {
        const q = (params.search || '').toLowerCase();
        return (
            (item.code || '').toLowerCase().includes(q) ||
            (item.name || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">Quản lý loại khu vực</h2>
                    <p className="text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1 lg:text-[14px] text-[12px] truncate">Đã chọn: {selectedRowKeys.length} mục</p>
                </div>
                <ConfigProvider
                    theme={{
                        components: {
                            Input: {
                                colorBorder: '#DADBDD',
                                hoverBorderColor: '#DADBDD',
                                activeBorderColor: '#DADBDD',
                                activeShadow: 'none',
                            }
                        }
                    }}
                >
                    <Space style={{ gap: 15 }}>
                        <Input
                            placeholder="Nhập vào tìm kiếm"
                            prefix={<SearchOutlined style={{ color: '#545454', fontSize: '18.34px', opacity: 0.6 }} />}
                            className="rounded-[8px] placeholder:text-[#545454] placeholder:text-[16px] !w-[200px] lg:!w-[300px]"
                            style={{ fontSize: '16px', height: '40px' }}
                            value={params.search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <Image
                            src="/icon.svg/delete.svg"
                            alt="Xóa"
                            width={40}
                            height={40}
                            onClick={handleBatchDelete}
                            className={`cursor-pointer hover:opacity-80 transition-opacity ${selectedRowKeys.length === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                        />
                        <Image
                            src="/icon.svg/create.svg"
                            alt="Thêm"
                            width={40}
                            height={40}
                            onClick={() => setIsModalOpen(true)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Space>
                </ConfigProvider>
            </div>

            <div className="w-full h-[1px] bg-gray-200 mb-3 shrink-0"></div>
            <div className="flex-1 min-h-0">
                <CustomTable
                    dataTable={filteredData}
                    columns={getColumns(handleEdit, handleDelete)}
                    keyIndex="id"
                    pagination={{
                        current: params.page,
                        pageSize: params.limit,
                        total,
                        onChange: onPageChange,
                    }}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                        columnWidth: 46,
                    }}
                />
            </div>

            <ModalAddZoneType
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingRecord(null);
                }}
                editingRecord={editingRecord || undefined}
                onSuccess={refetch}
            />

            <ModalConfirmDelete
                open={confirmModal.open}
                onClose={closeConfirmModal}
                onConfirm={handleConfirm}
                title={confirmModal.title}
                content={confirmModal.content}
                loading={confirmModal.loading}
            />
        </div>
    );
}
