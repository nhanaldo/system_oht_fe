"use client";

import { useState } from "react";
import Image from "next/image";
import { Account } from "@/types/account";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import { Input, Button, Space, Modal, message, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModalAddAccount from "./ModalAddAccount";
import ModalConfigWarehouse from "./ModalConfigWarehouse";
import { deleteAccount, updateAccountStatus, resetAccountPassword } from "../accountAction";
import { useRouter } from "next/navigation";

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
    const [modalApi, modalContext] = Modal.useModal();
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

    const handleDelete = (id: string) => {
        const item = raw.find(a => a.id === id);
        const name = item?.username || item?.name || 'tài khoản này';

        modalApi.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${name} không?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            centered: true,
            onOk: async () => {
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
                }
            }
        });
    };

    const handleResetPassword = (id: string) => {
        const item = raw.find(a => a.id === id);
        const name = item?.username || item?.name || 'tài khoản này';

        modalApi.confirm({
            title: 'Xác nhận reset mật khẩu',
            content: `Bạn có chắc chắn muốn reset mật khẩu cho ${name} về mặc định không?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            centered: true,
            onOk: async () => {
                try {
                    const res = await resetAccountPassword(id);
                    if (res && res.success === false) {
                        messageApi.error(res.error || 'Có lỗi xảy ra khi reset mật khẩu');
                    } else {
                        messageApi.success('Reset mật khẩu thành công');
                    }
                } catch {
                    messageApi.error('Có lỗi xảy ra khi reset mật khẩu');
                }
            }
        });
    };

    const handleBatchDelete = () => {
        modalApi.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} tài khoản đã chọn không?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            centered: true,
            onOk: async () => {
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
                }
            }
        });
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
            modalApi.confirm({
                title: 'Thông báo',
                content: !checked
                    ? `Bạn có chắc chắn muốn khóa ${displayName} không?`
                    : `Bạn có chắc chắn muốn khôi phục quyền truy cập cho ${displayName} không?`,
                okText: 'Xác nhận',
                cancelText: 'Hủy',
                centered: true,
                onOk: async () => {
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
                    }
                },
                onCancel: () => {
                    resolve(false);
                }
            });
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
        <div className="w-full h-full flex flex-col ">
            {messageContext}
            {modalContext}
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div>
                    {/* leading-none: chiều cao của dòng bằng kích thước của phông chữ <=> line height = 100% 
                    Letter spacing: 0% <=> tracking-normal khoảng cách giữa các chữ cái ở mức mặc định, không giãn cũng không ép.*/}
                    <h2 className="text-[16px] text-[#373838] font-roboto font-medium leading-none tracking-normal  ">Quản lý tài khoản</h2>
                    <p className="text-[14px] text-[#5F5D5D] font-roboto font-regular leading-normal tracking-normal mt-1">Đã chọn: {selectedRowKeys.length} mục</p>
                </div>
                <Space size="middle">
                    <Input
                        placeholder="Nhập vào tìm kiếm"
                        prefix={<SearchOutlined className="text-gray-400" style={{ color: '#545454' }} />}
                        className="w-[300px] rounded-md h-[40px] "
                        value={searchText}
                        onChange={onSearchChange}
                    />
                    <Select
                        placeholder="Vai trò"
                        allowClear
                        className="w-[108px] h-[40px] rounded-md"
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
            </div>

            <div className="w-full h-[1px] bg-gray-200 mb-3 shrink-0"></div>

            <div className="flex-1 overflow-auto min-h-0 ">
                <CustomTable
                    dataTable={filteredData}
                    columns={getColumns(handleEdit, handleConfigWarehouse, handleDelete, handleToggleStatus, warehouseOptions, handleResetPassword)}
                    keyIndex="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
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
        </div>
    );
}
