import { Space, Tooltip } from "antd";
import Image from "next/image";
import { Category } from "@/types/category";
import type { ColumnsType } from "antd/es/table";

export const getCategoriesColumns = (
    onDelete?: (id: string) => void,
    onEdit?: (category: Category) => void,
): ColumnsType<Category> => [
        {
            title: 'STT',
            key: 'index',
            width: 80,
            render: (_: any, __: any, index: number) => index + 1,
            align: 'center',
        },
        {
            title: 'Phẩm cấp',
            dataIndex: 'code',
            key: 'code',
            width: 190,
            render: (text: string) => (
                <span style={{ fontWeight: 400, color: '#484848' }}>{text || ''}</span>
            ),
        },
        {
            title: 'Giống chuối',
            dataIndex: 'banana_variety',
            key: 'banana_variety',
            width: 180,
            render: (text: string) => text || '',
        },
        {
            title: 'Chủng loại',
            dataIndex: 'name',
            key: 'name',
            width: 320,
            render: (text: string) => text || '',
        },
        {
            title: 'Thị trường',
            dataIndex: 'market',
            key: 'market',
            width: 150,
            render: (text: string) => text || '',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 450,
            render: (text: string) => text || '',
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_: any, record: Category) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Image
                            src="/icon.svg/edit.svg"
                            alt="Chỉnh sửa"
                            width={18}
                            height={18}
                            onClick={() => onEdit && onEdit(record)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Image
                            src="/icon.svg/deteleedit.svg"
                            alt="Xóa"
                            width={20}
                            height={20}
                            onClick={() => onDelete && onDelete(record.id)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                    </Tooltip>
                </Space>
            ),
            align: 'center',
        },
    ];
