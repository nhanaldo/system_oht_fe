"use client";

import { useState } from "react";
import Image from "next/image";
import { Account } from "@/types/account";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import { Input, Button, Space, Modal, message, Select, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModalAddAccount from "./ModalAddAccount";
import ModalConfigWarehouse from "./ModalConfigWarehouse";
import { deleteAccount, updateAccountStatus, resetAccountPassword } from "../accountAction";
import { useRouter } from "next/navigation";
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";


interface AccountTableProps {
    raw: Account[];
    roleOptions?: { label: string, value: string }[];
    warehouseOptions?: { label: string, value: string }[];
}

export default function AccountTable({ raw, roleOptions, warehouseOptions }: AccountTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Account | null>(null);
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [warehouseRecord, setWarehouseRecord] = useState<Account | null>(null);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | undefined>(undefined);
    const [messageApi, messageContext] = message.useMessage();

    const router = useRouter();

    const handleEdit = (record: Account) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleConfigWarehouse = (record: Account) => {
        setWarehouseRecord(record);
        setIsWarehouseModalOpen(true);
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
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
        const item = raw.find(a => a.id === id);
        const name = item?.username || item?.name || 'tài khoản này';

        openConfirmModal(
            'Thông báo',
            `Bạn có chắc chắn muốn xóa ${name} không?`,
            async () => {
                try {
                    const res = await deleteAccount(id);
                    if (typeof res === 'string') {
                        messageApi.error(res);
                    } else if (res && res.success === false) {
                        messageApi.error(res.error || 'Có lỗi xảy ra khi xóa');
                    } else {
                        messageApi.success('Xóa tài khoản thành công');
                        setSelectedRowKeys(prev => prev.filter(key => key !== id));
                        router.refresh();
                    }
                } catch {
                    messageApi.error('Có lỗi xảy ra khi xóa');
                } finally {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        );
    };

    const handleResetPassword = (id: string) => {
        const item = raw.find(a => a.id === id);
        const name = item?.username || item?.name || 'tài khoản này';

        openConfirmModal(
            'Thông báo',
            `Bạn có chắc chắn muốn reset mật khẩu cho ${name} về mặc định không?`,
            async () => {
                try {
                    const res = await resetAccountPassword(id);
                    if (res && res.success === false) {
                        messageApi.error(res.error || 'Có lỗi xảy ra khi reset mật khẩu');
                    } else {
                        messageApi.success('Reset mật khẩu thành công');
                    }
                } catch {
                    messageApi.error('Có lỗi xảy ra khi reset mật khẩu');
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
            `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} tài khoản đã chọn không?`,
            async () => {
                try {
                    const res = await deleteAccount(selectedRowKeys as string[]);
                    if (typeof res === 'string') {
                        messageApi.error(res);
                    } else if (res && res.success === false) {
                        messageApi.error(res.error || 'Có lỗi xảy ra khi xóa');
                    } else {
                        messageApi.success(`Đã xóa thành công ${selectedRowKeys.length} tài khoản`);
                        setSelectedRowKeys([]);
                        router.refresh();
                    }
                } catch {
                    messageApi.error('Có lỗi xảy ra khi xóa');
                } finally {
                    setConfirmModal(prev => ({ ...prev, open: false }));
                }
            }
        );
    };

    const handleToggleStatus = (
        record: Account,
        checked: boolean,
        startLoading: () => void,
        stopLoading: () => void
    ): Promise<boolean> => {
        const id = record.id;
        if (!id) return Promise.resolve(false);

        const displayName = `tài khoản : ${record.username || record.name || 'N/A'} và MNV : ${record.code || 'N/A'}`;

        return new Promise<boolean>((resolve) => {
            openConfirmModal(
                'Thông báo',
                !checked
                    ? `Bạn có chắc chắn muốn khóa ${displayName} không?`
                    : `Bạn có chắc chắn muốn khôi phục quyền truy cập cho ${displayName} không?`,
                async () => {
                    startLoading();
                    try {
                        const res = await updateAccountStatus(id, checked);
                        if (res.success) {
                            messageApi.success("Cập nhật trạng thái thành công");
                            router.refresh();
                            resolve(true);
                        } else {
                            messageApi.error(res.error || "Có lỗi xảy ra khi cập nhật trạng thái");
                            resolve(false);
                        }
                    } catch {
                        messageApi.error("Có lỗi xảy ra khi cập nhật trạng thái");
                        resolve(false);
                    } finally {
                        stopLoading();
                        setConfirmModal(prev => ({ ...prev, open: false }));
                    }
                },
                () => {
                    resolve(false);
                }
            );
        });
    };

    const filteredData = raw.filter(item => {
        const q = searchText.toLowerCase();
        const matchesSearch = (
            (item.username || '').toLowerCase().includes(q) ||
            (item.name || '').toLowerCase().includes(q) ||
            (item.email || '').toLowerCase().includes(q)
        );

        if (!selectedRoleFilter || selectedRoleFilter === 'all') return matchesSearch;

        const selectedRoleLabel = roleOptions?.find(r => r.value === selectedRoleFilter)?.label;
        if (!selectedRoleLabel) return matchesSearch;

        const hasRole = item.role_names?.some(rn => rn.toLowerCase() === selectedRoleLabel.toLowerCase());
        return matchesSearch && hasRole;
    });

    return (
        <div className="flex flex-col h-full min-h-0">
            {messageContext}
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    {/* leading-none: chiều cao của dòng bằng kích thước của phông chữ <=> line height = 100% 
                    Letter spacing: 0% <=> tracking-normal khoảng cách giữa các chữ cái ở mức mặc định, không giãn cũng không ép.*/}
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">Quản lý tài khoản</h2>
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
                            },
                            Select: {
                                colorBorder: '#DADBDD',
                                hoverBorderColor: '#DADBDD',
                                activeBorderColor: '#DADBDD',
                            }
                        }
                    }}
                >
                    <Space style={{ gap: 15 }}>
                        <Input
                            placeholder="Nhập vào tìm kiếm"
                            prefix={<SearchOutlined style={{ color: '#545454', fontSize: '18.34px', opacity: 0.6 }} />}
                            className="rounded-[8px] placeholder:text-[#545454] placeholder:text-[16px]"
                            style={{ width: '300px', fontSize: '16px', height: '40px' }}
                            value={searchText}
                            onChange={onSearchChange}
                        />
                        <Select
                            placeholder="Vai trò"
                            allowClear
                            suffixIcon={
                                <svg width="17.33" height="8.6" viewBox="0 0 17.33 8.6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#bfbfbf' }}>
                                    <path d="M1 1L8.665 7L16.33 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            }
                            className="w-[108px] h-[40px] text-[16px] font-roboto font-normal"
                            style={{ height: '40px', width: '108px', fontFamily: 'Roboto', fontSize: '16px' }}
                            value={selectedRoleFilter}
                            onChange={(val) => setSelectedRoleFilter(val)}
                            options={[
                                { label: "Tất cả", value: "all" },
                                ...(roleOptions || [])
                            ]}
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
                    columns={getColumns(handleEdit, handleConfigWarehouse, handleDelete, handleToggleStatus, warehouseOptions, handleResetPassword)}
                    keyIndex="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                        columnWidth: 46, // <-- Ép cứng cột checkbox 46px để tổng các cột = 1561px chuẩn 100%
                    }}
                />
            </div>

            <ModalAddAccount
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingRecord(null);
                }}
                roleOptions={roleOptions}
                editingRecord={editingRecord || undefined}
            />

            <ModalConfigWarehouse
                open={isWarehouseModalOpen}
                onClose={() => {
                    setIsWarehouseModalOpen(false);
                    setWarehouseRecord(null);
                }}
                record={warehouseRecord || undefined}
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
