import { Space, Button, Tooltip } from "antd";
import Image from "next/image";
import { Role } from "@/types/role";
import type { ColumnsType } from "antd/es/table";

export const getColumns = (
    onDelete?: (id: string) => void,
    onEdit?: (role: Role) => void,
    onPermission?: (role: Role) => void
): ColumnsType<Role> => [
        {
            title: 'STT',
            key: 'index',
            width: 80,
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Vai trò',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => {
                if (!text) return '';
                const isAdmin = text.toLowerCase().includes('admin');
                const color = isAdmin ? '#1677ff' : '#52c41a';
                const bgColor = isAdmin ? '#e6f4ff' : '#f6ffed';
                return (
                    <span style={{
                        color: isAdmin ? '#1849D6' : '#148634',
                        backgroundColor: isAdmin ? '#D2DDFF' : '#DBFFE5',
                        padding: '2px 14px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 400,
                        fontFamily: 'roboto',
                        lineHeight: '100%',
                        border: `1px solid ${isAdmin ? '#91caff' : '#b7eb8f'}`,
                    }}>
                        {text}
                    </span>
                );
            },
            align: 'center',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => (
                <div style={{ paddingLeft: '35%' }}>
                    {text || ''}
                </div>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_: any, record: Role) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Image
                            src="/icon.svg/edit.svg"
                            alt="Chỉnh sửa"
                            width={20}
                            height={20}
                            onClick={() => onEdit && onEdit(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Phân quyền">
                        <Image
                            src="/icon.svg/action.svg"
                            alt="Phân quyền"
                            width={20}
                            height={20}
                            onClick={() => onPermission && onPermission(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={20}
                            height={20}
                            onClick={() => onDelete && onDelete(record.id as string)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                </Space>
            ),
            align: 'center',
        },
    ];
