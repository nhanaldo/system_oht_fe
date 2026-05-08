"use client";

import { useState } from "react";
import Image from "next/image";
import { Role } from "@/types/role";
import CustomTable from "@/components/ui/CustomTable";
import { getColumns } from "./ColumnTable";
import { Input, Button, Space, Modal, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";

const ModalAddRole = dynamic(() => import("./ModalAddRole"), { ssr: false });
const ModalUpdateRole = dynamic(() => import("./ModalUpdateRole"), { ssr: false });
const ModalPermissionMatrix = dynamic(() => import("./ModalPermissionMatrix"), { ssr: false });
import { deleteRole } from "../roleAction";
import { useRouter } from "next/navigation";

interface RoleTableProps {
    raw: Role[];
}

export default function RoleTable({ raw }: RoleTableProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [messageApi, messageContext] = message.useMessage();
    const [modalApi, modalContext] = Modal.useModal();
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

        modalApi.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${roleName} không?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            centered: true,
            onOk: async () => {
                try {
                    const res = await deleteRole(id);
                    if (typeof res === 'string') {
                        messageApi.error(res);
                    } else if (res && res.success === false) {
                        messageApi.error(res.error || 'Có lỗi xảy ra khi xóa');
                    } else {
                        messageApi.success('Xóa vai trò thành công');
                        setSelectedRowKeys(prev => prev.filter(key => key !== id));
                        router.refresh();
                    }
                } catch (error) {
                    messageApi.error('Có lỗi xảy ra khi xóa');
                }
            }
        });
    };

    const handleBatchDelete = () => {
        modalApi.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} vai trò đã chọn không?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            centered: true,
            onOk: async () => {
                try {
                    const res = await deleteRole(selectedRowKeys as string[]);
                    if (typeof res === 'string') {
                        messageApi.error(res);
                    } else if (res && res.success === false) {
                        messageApi.error(res.error || 'Có lỗi xảy ra khi xóa');
                    } else {
                        messageApi.success(`Đã xóa thành công ${selectedRowKeys.length} vai trò`);
                        setSelectedRowKeys([]);
                        router.refresh();
                    }
                } catch (error) {
                    messageApi.error('Có lỗi xảy ra khi xóa');
                }
            }
        });
    };

    const filteredData = raw.filter(item => {
        const searchLower = searchText.toLowerCase();
        const roleName = (item.name || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        return roleName.includes(searchLower) || description.includes(searchLower);
    });

    return (
        <div className="w-full h-full flex flex-col ">
            {messageContext}
            {modalContext}
            <div className="flex justify-between items-start mb-2 shrink-0">
                <div>
                    {/* leading-none: chiều cao của dòng bằng kích thước của phông chữ <=> line height = 100% 
                    Letter spacing: 0% <=> tracking-normal khoảng cách giữa các chữ cái ở mức mặc định, không giãn cũng không ép.*/}
                    <h2 className="text-[16px] text-[#373838] font-roboto font-medium leading-none tracking-normal  ">Quản lý vai trò</h2>
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
                    columns={getColumns(handleDelete, handleEdit, handlePermission)}
                    keyIndex="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                    }}
                />
            </div>

            <ModalAddRole
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                roleOptions={roleOptions}
            />

            <ModalUpdateRole
                open={isEditModalOpen}
                role={selectedRole}
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
        </div>
    );
}
