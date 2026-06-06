"use client";

import { useState } from "react";
import Image from "next/image";
import { Role } from "@/types/role";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import { Input, Button, Space, Modal, ConfigProvider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";

const ModalAddRole = dynamic(() => import("./ModalAddRole"), { ssr: false });
const ModalPermissionMatrix = dynamic(() => import("./ModalPermissionMatrix"), { ssr: false });
import ModalConfirmDelete from "@/components/ui/ModalConfirmDelete";
import { deleteRole } from "../roleAction";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface RoleTableProps {
    raw: Role[];
}

export default function RoleTable({ raw }: RoleTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteInfo, setDeleteInfo] = useState<{ isBatch: boolean, id?: string, content: string }>({ isBatch: false, content: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    const roleOptions = raw.map(r => ({
        label: r.name || '',
        value: r.name || '',
    }));

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setIsEditModalOpen(true);
    };

    const handlePermission = (role: Role) => {
        setSelectedRole(role);
        setIsPermissionModalOpen(true);
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleDelete = (id: string) => {
        const roleToDelete = raw.find(item => item.id === id);
        const roleName = roleToDelete?.name || 'vai trò này';
        setDeleteInfo({ isBatch: false, id, content: `Bạn có chắc chắn muốn xóa ${roleName} không?` });
        setIsDeleteModalOpen(true);
    };

    const handleBatchDelete = () => {
        setDeleteInfo({ isBatch: true, content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} vai trò đã chọn không?` });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteInfo.isBatch) {
                const res = await deleteRole(selectedRowKeys as string[]);
                if (typeof res === 'string') {
                    showError(res);
                } else if (res && res.success === false) {
                    showError(res.error || 'Có lỗi xảy ra khi xóa');
                } else {
                    showSuccess(`Đã xóa thành công ${selectedRowKeys.length} vai trò`);
                    setSelectedRowKeys([]);
                    router.refresh();
                }
            } else if (deleteInfo.id) {
                const res = await deleteRole(deleteInfo.id);
                if (typeof res === 'string') {
                    showError(res);
                } else if (res && res.success === false) {
                    showError(res.error || 'Có lỗi xảy ra khi xóa');
                } else {
                    showSuccess('Xóa vai trò thành công');
                    setSelectedRowKeys(prev => prev.filter(key => key !== deleteInfo.id));
                    router.refresh();
                }
            }
            setIsDeleteModalOpen(false);
        } catch (error) {
            showError('Có lỗi xảy ra khi xóa');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredData = raw.filter(item => {
        const searchLower = searchText.toLowerCase();
        const roleName = (item.name || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        return roleName.includes(searchLower) || description.includes(searchLower);
    });

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="min-w-0 flex-1 mr-2">
                    {/* leading-none: chiều cao của dòng bằng kích thước của phông chữ <=> line height = 100% 
                    Letter spacing: 0% <=> tracking-normal khoảng cách giữa các chữ cái ở mức mặc định, không giãn cũng không ép.*/}
                    <h2 className="text-[#373838] font-roboto font-medium leading-none tracking-normal lg:text-[16px] text-[14px] truncate">Quản lý vai trò</h2>
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
                    <Space style={{ gap: "15px" }}>
                        <Input
                            placeholder="Nhập vào tìm kiếm"
                            prefix={<SearchOutlined style={{ color: '#545454', fontSize: '18.34px', opacity: 0.6 }} />}
                            className="rounded-[8px] placeholder:text-[#545454] !lg:w-[300px] !w-[200px]"
                            style={{ height: '40px', fontFamily: 'Roboto', fontSize: '16px' }}
                            value={searchText}
                            onChange={onSearchChange}
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
                    columns={getColumns(handleDelete, handleEdit, handlePermission)}
                    keyIndex="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                        columnWidth: 46,
                    }}
                />
            </div>

            <ModalAddRole
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                roleOptions={roleOptions}
            />

            <ModalAddRole
                open={isEditModalOpen}
                editingRecord={selectedRole}
                roleOptions={roleOptions}
                onClose={() => {
                    setIsEditModalOpen(false);
                    if (!isPermissionModalOpen) setSelectedRole(null);
                }}
            />

            <ModalPermissionMatrix
                open={isPermissionModalOpen}
                roleId={selectedRole?.id as string}
                onClose={() => {
                    setIsPermissionModalOpen(false);
                    if (!isEditModalOpen) setSelectedRole(null);
                }}
            />

            <ModalConfirmDelete
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                content={deleteInfo.content}
                loading={isDeleting}
            />
        </div>
    );
}
