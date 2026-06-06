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
            width: 600,
            render: (text: string) => {
                if (!text) return '';
                const isAdmin = text.toLowerCase().includes('admin');
                return (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{
                            color: isAdmin ? '#1849D6' : '#148634',
                            backgroundColor: isAdmin ? '#D2DDFF' : '#DBFFE5',
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 400,
                            fontFamily: 'roboto',
                            lineHeight: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '26px'
                        }}>
                            {text}
                        </span>
                    </div>
                );
            },
            align: 'center',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 450,
            className: "text-left",
            render: (text: string) => text || '',
            onHeaderCell: () => ({
                style: {
                    textAlign: 'left',
                },
            }),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 140,
            render: (_: any, record: Role) => (
                <Space >
                    <Tooltip title="Chỉnh sửa">
                        <Image
                            src="/icon.svg/edit.svg"
                            alt="Chỉnh sửa"
                            width={18}
                            height={18}
                            style={{ width: '18px', height: '18px', flexShrink: 0 }}
                            onClick={() => onEdit && onEdit(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Phân quyền">
                        <Image
                            src="/icon.svg/action.svg"
                            alt="Phân quyền"
                            width={16.79}
                            height={19.46}
                            style={{ width: '16.79px', height: '19.46px', flexShrink: 0 }}
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
                            style={{ width: '20px', height: '20px', flexShrink: 0 }}
                            onClick={() => onDelete && onDelete(record.id as string)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                </Space>
            ),
            align: 'center',
        },
    ];
